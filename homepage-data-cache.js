(()=>{
  const cache=new Map();
  const CACHE_PREFIX='w-home-data-v1:';
  const DEFAULT_MAX_STALE=6*60*60*1000;
  const normalize=url=>{
    const parsed=new URL(url,location.origin);
    parsed.searchParams.delete('cb');
    return parsed.pathname+(parsed.search||'');
  };
  const readStored=key=>{
    try{
      const record=JSON.parse(localStorage.getItem(CACHE_PREFIX+key)||'null');
      return record&&record.payload!==undefined&&Number.isFinite(record.savedAt)?record:null;
    }catch{return null;}
  };
  const store=(key,payload)=>{
    try{localStorage.setItem(CACHE_PREFIX+key,JSON.stringify({savedAt:Date.now(),payload}));}catch{}
  };
  async function request(key,url){
    const parsed=new URL(url,location.origin),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
    parsed.searchParams.set('cb',String(Date.now()));
    try{
      const response=await fetch(parsed.pathname+parsed.search,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store',signal:controller.signal});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||`${parsed.pathname} returned ${response.status}`);
      store(key,payload);
      window.dispatchEvent(new CustomEvent('whome:data-updated',{detail:{url:key,payload}}));
      return payload;
    }finally{clearTimeout(timer);}
  }
  async function get(url,{ttl=15000,force=false,maxStale=DEFAULT_MAX_STALE}={}){
    const key=normalize(url),now=Date.now(),existing=cache.get(key);
    if(!force&&existing&&now-existing.checkedAt<ttl)return existing.promise;
    const stored=readStored(key),age=stored?now-stored.savedAt:Infinity;
    if(!force&&stored&&age<=maxStale){
      const stale=Promise.resolve(stored.payload);
      cache.set(key,{checkedAt:now,promise:stale});
      request(key,url).then(payload=>{
        cache.set(key,{checkedAt:Date.now(),promise:Promise.resolve(payload)});
      }).catch(()=>{});
      return stale;
    }
    const promise=request(key,url).catch(error=>{
      if(stored&&age<=maxStale)return stored.payload;
      throw error;
    });
    cache.set(key,{checkedAt:now,promise});
    return promise;
  }
  window.WHomeData={get,clear:()=>{cache.clear();try{Object.keys(localStorage).filter(key=>key.startsWith(CACHE_PREFIX)).forEach(key=>localStorage.removeItem(key));}catch{} }};
})();
