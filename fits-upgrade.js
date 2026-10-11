(function(){
  if(document.body.dataset.culturePage!=='fits')return;
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safe=value=>{try{const u=new URL(String(value||''),location.origin);return u.protocol==='https:'||u.origin===location.origin?u.toString():''}catch{return''}};
  const fallbackByTeam={
    'New York Liberty':'/assets/images/17996.png',
    'Golden State Valkyries':'/assets/images/17993.png',
    'Las Vegas Aces':'/assets/images/17995.png',
    'Los Angeles Sparks':'/assets/images/17998.png'
  };
  function sourceCard(item){
    const href=safe(item.href);
    const image=safe(item.image)||fallbackByTeam[item.team]||'';
    const source=String(item.sourceType||'SOURCE').toUpperCase();
    return `<article class="fits-source-card" data-source="${esc(source)}"><div class="fits-source-photo${image?'':' no-image'}">${image?`<img src="${esc(image)}" alt="${esc(item.title)}" loading="lazy" decoding="async">`:''}<span class="fits-source-badge">${esc(source)}</span></div><div class="fits-source-body"><span>${esc(item.category||item.team||'The Fits')}</span><h3>${esc(item.title)}</h3><p>${esc(item.summary||'')}</p><a href="${esc(href)}" target="_blank" rel="noopener">Open original source ↗</a></div></article>`;
  }
  function filters(target,grid,items){
    const node=$(target);if(!node)return;
    const list=['ALL',...new Set(items.map(item=>String(item.sourceType||'SOURCE').toUpperCase()))];
    node.innerHTML=list.map((label,index)=>`<button type="button" class="fits-filter${index===0?' active':''}" data-fit-filter="${esc(label)}">${esc(label)}</button>`).join('');
    node.addEventListener('click',event=>{
      const button=event.target.closest('[data-fit-filter]');if(!button)return;
      node.querySelectorAll('.fits-filter').forEach(el=>el.classList.toggle('active',el===button));
      const wanted=button.dataset.fitFilter;
      grid.querySelectorAll('.fits-source-card').forEach(card=>card.hidden=wanted!=='ALL'&&card.dataset.source!==wanted);
    });
  }
  function renderFeed(items,gridTarget,filterTarget){
    const grid=$(gridTarget);if(!grid)return;
    grid.innerHTML=items.map(sourceCard).join('');
    filters(filterTarget,grid,items);
  }
  function renderChecks(items){
    const grid=$('#fitCheckGrid');if(!grid)return;
    grid.innerHTML=items.map(item=>`<article class="fit-check-card"><span class="player">${esc(item.player)}</span><span class="team">${esc(item.team)}</span><dl><dt>Date</dt><dd>${esc(item.date)}</dd><dt>Event</dt><dd>${esc(item.event)}</dd><dt>Designer</dt><dd>${esc(item.designer)}</dd><dt>Stylist</dt><dd>${esc(item.stylist)}</dd><dt>Shoes</dt><dd>${esc(item.shoes)}</dd></dl><a href="${esc(safe(item.href))}" target="_blank" rel="noopener">Source · ${esc(item.sourceType)} ↗</a></article>`).join('');
  }
  function load(){
    fetch(`/api/fits-feed?v=20260823-v2&t=${Date.now()}`,{headers:{Accept:'application/json'}})
      .then(response=>response.ok?response.json():Promise.reject(new Error('Fits feed unavailable')))
      .then(payload=>{
        renderFeed(payload.tunnel||[],'#fitsTunnelGrid','#fitsTunnelFilters');
        renderFeed(payload.press||[],'#fitsPressGrid','#fitsPressFilters');
        renderChecks(payload.fitCheck||[]);
        const updated=$('#fitsUpdated');if(updated)updated.textContent=`Source desk refreshed ${new Date(payload.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
      })
      .catch(()=>{
        ['#fitsTunnelGrid','#fitsPressGrid','#fitCheckGrid'].forEach(selector=>{const node=$(selector);if(node)node.innerHTML='<div class="culture-loading">The fashion source desk is refreshing. Original-source links will return when the feed reconnects.</div>';});
      });
  }
  load();
  setInterval(load,30*60*1000);
})();
