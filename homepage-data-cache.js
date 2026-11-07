(()=>{
  const cache=new Map();
  const normalize=url=>{
    const parsed=new URL(url,location.origin);
    parsed.searchParams.delete('cb');
    return parsed.pathname+(parsed.search||'');
  };
  async function get(url,{ttl=15000,force=false}={}){
    const key=normalize(url),now=Date.now(),existing=cache.get(key);
    if(!force&&existing&&now-existing.time<ttl)return existing.promise;
    const parsed=new URL(url,location.origin);
    parsed.searchParams.set('cb',String(now));
    const promise=fetch(parsed.pathname+parsed.search,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'})
      .then(async response=>{
        const payload=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(payload.error||`${parsed.pathname} returned ${response.status}`);
        return payload;
      })
      .catch(error=>{if(cache.get(key)?.promise===promise)cache.delete(key);throw error;});
    cache.set(key,{time:now,promise});
    return promise;
  }
  window.WHomeData={get,clear:()=>cache.clear()};
})();
