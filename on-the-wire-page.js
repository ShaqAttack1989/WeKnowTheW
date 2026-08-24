(function(){
  const scope=document.body.dataset.wireScope==='archive'?'archive':'current';
  const dataUrl=scope==='archive'?'/on-the-wire-archive.json':'/on-the-wire-current.json';
  const grid=document.getElementById('wireGrid');
  const filters=document.getElementById('wireFilters');
  const updated=document.getElementById('wireUpdated');
  const count=document.getElementById('wireCount');
  const retention=document.getElementById('wireRetention');
  const loadMore=document.getElementById('wireLoadMore');
  let all=[];
  let filtered=[];
  let visible=scope==='archive'?30:24;
  let active='All';
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeUrl=value=>{try{const u=new URL(String(value||''),location.origin);return u.protocol==='https:'||u.origin===location.origin?u.toString():''}catch{return''}};
  const formatDate=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};
  const monthKey=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'Undated':d.toLocaleDateString('en-US',{month:'long',year:'numeric'});};
  function card(item){
    const href=safeUrl(item.url);
    return `<article class="wire-card" data-category="${escape(item.category||'League news')}"><div class="wire-card-top"><span class="wire-badge">${escape(item.category||'League news')}</span><time datetime="${escape(item.publishedAt||'')}">${escape(formatDate(item.publishedAt))}</time></div><h3>${escape(item.title)}</h3><div class="wire-card-meta"><span class="wire-source">${escape(item.source||'Source')}</span>${href?`<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">Read source ↗</a>`:''}</div></article>`;
  }
  function render(){
    const list=filtered.slice(0,visible);
    if(!list.length){grid.innerHTML='<div class="wire-empty">No stories match this filter yet.</div>';if(loadMore)loadMore.hidden=true;return;}
    if(scope==='archive'){
      let lastMonth='';
      grid.innerHTML=list.map(item=>{const month=monthKey(item.publishedAt);const heading=month!==lastMonth?`<h2 class="wire-month">${escape(month)}</h2>`:'';lastMonth=month;return heading+card(item);}).join('');
    }else grid.innerHTML=list.map(card).join('');
    if(loadMore){loadMore.hidden=visible>=filtered.length;loadMore.textContent=`Show more stories (${Math.max(0,filtered.length-visible)} left)`;}
  }
  function setFilter(category,button){
    active=category;visible=scope==='archive'?30:24;
    filters?.querySelectorAll('.wire-filter').forEach(node=>node.classList.toggle('active',node===button));
    filtered=active==='All'?all:all.filter(item=>(item.category||'League news')===active);
    if(count)count.textContent=`${filtered.length} ${filtered.length===1?'story':'stories'}`;
    render();
  }
  function buildFilters(){
    if(!filters)return;
    const categories=['All',...new Set(all.map(item=>item.category||'League news'))];
    filters.innerHTML=categories.map((cat,index)=>`<button type="button" class="wire-filter${index===0?' active':''}" data-wire-filter="${escape(cat)}">${escape(cat)}</button>`).join('');
    filters.addEventListener('click',event=>{const button=event.target.closest('[data-wire-filter]');if(!button)return;setFilter(button.dataset.wireFilter,button);});
  }
  loadMore?.addEventListener('click',()=>{visible+=scope==='archive'?30:24;render();});
  async function load(){
    try{
      const response=await fetch(`${dataUrl}?v=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});
      const payload=await response.json();if(!response.ok||!Array.isArray(payload.items))throw new Error('Feed unavailable');
      all=payload.items.slice().sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));filtered=all;
      buildFilters();render();
      if(updated)updated.textContent=`Daily source desk refreshed ${new Date(payload.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}`;
      if(count)count.textContent=`${all.length} ${all.length===1?'story':'stories'}`;
      if(retention)retention.textContent=`Stories stay on the current desk for ${payload.retentionDays||14} days, then move here automatically.`;
    }catch(error){
      grid.innerHTML='<div class="wire-empty">The story desk is refreshing. Try again shortly.</div>';
      if(updated)updated.textContent='Daily source desk is refreshing';
      if(loadMore)loadMore.hidden=true;
    }
  }
  load();
})();
