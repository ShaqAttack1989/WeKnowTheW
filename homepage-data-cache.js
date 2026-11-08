(()=>{
  const memory=new Map();
  const storagePrefix='wktw-home-data-v2:';
  const normalize=url=>{
    const parsed=new URL(url,location.origin);
    parsed.searchParams.delete('cb');
    return parsed.pathname+(parsed.search||'');
  };
  const readStored=key=>{
    try{
      const value=sessionStorage.getItem(storagePrefix+key);
      return value?JSON.parse(value):null;
    }catch{return null;}
  };
  const writeStored=(key,entry)=>{
    try{sessionStorage.setItem(storagePrefix+key,JSON.stringify({time:entry.time,data:entry.data}));}catch{}
  };
  function refresh(url,key,existing){
    const current=memory.get(key);
    if(current?.pending)return current.pending;
    const request=fetch(url,{headers:{Accept:'application/json'},cache:'default'})
      .then(async response=>{
        const payload=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(payload.error||`${new URL(url,location.origin).pathname} returned ${response.status}`);
        const entry={time:Date.now(),data:payload,pending:null};
        memory.set(key,entry);
        writeStored(key,entry);
        if(typeof window.CustomEvent==='function')window.dispatchEvent(new CustomEvent('wktw:data-updated',{detail:{url:key}}));
        return payload;
      })
      .catch(error=>{
        if(existing?.data)return existing.data;
        if(memory.get(key)?.pending===request)memory.delete(key);
        throw error;
      });
    memory.set(key,{...(existing||{}),pending:request});
    request.finally(()=>{const value=memory.get(key);if(value?.pending===request)value.pending=null;}).catch(()=>{});
    return request;
  }
  async function get(url,{ttl=300000,force=false}={}){
    const key=normalize(url),now=Date.now();
    const existing=memory.get(key)||readStored(key);
    if(!force&&existing?.data&&now-existing.time<ttl){
      if(!memory.has(key))memory.set(key,{...existing,pending:null});
      return existing.data;
    }
    if(existing?.data&&!force){
      refresh(url,key,existing).catch(()=>{});
      return existing.data;
    }
    return refresh(url,key,existing).then(data=>data);
  }
  window.WHomeData={get,clear:()=>{memory.clear();try{Object.keys(sessionStorage).filter(key=>key.startsWith(storagePrefix)).forEach(key=>sessionStorage.removeItem(key));}catch{}}};
})();