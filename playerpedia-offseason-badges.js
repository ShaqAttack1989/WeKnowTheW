(()=>{
  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases=new Map([
    ['skylardigginssmith','skylardiggins'],['temifagbenle','temifagbenle'],['flaujaejohnson','flaujaejohnson'],['li yueru','liyueru']
  ]);
  const key=v=>aliases.get(normalize(v))||normalize(v);
  let data=null,unrivaled=new Map(),future=new Map(),au=new Map();
  function buildMaps(payload){
    data=payload||{};
    unrivaled=new Map((payload?.unrivaled?.players||[]).map(([name,team])=>[key(name),team]));
    future=new Map((payload?.unrivaled?.season3Signed||[]).map(([name,team])=>[key(name),team]));
    au=new Map((payload?.athletesUnlimited?.players||[]).map(([name,team])=>[key(name),team]));
  }
  function badgeMarkup(name){
    if(!data)return '';
    const k=key(name),items=[];
    if(unrivaled.has(k))items.push(`<span class="pro-affiliation unrivaled"><img src="${data.logos.unrivaled}" alt="Unrivaled"><span class="pro-affiliation-copy"><b>${unrivaled.get(k)}</b><small>2026 club</small></span></span>`);
    else if(future.has(k))items.push(`<span class="pro-affiliation unrivaled"><img src="${data.logos.unrivaled}" alt="Unrivaled"><span class="pro-affiliation-copy"><b>${future.get(k)}</b><small>signed for 2027</small></span></span>`);
    if(au.has(k))items.push(`<span class="pro-affiliation au"><img src="${data.logos.au}" alt="Athletes Unlimited"><span class="pro-affiliation-copy"><b>${au.get(k)}</b><small>2026 Week 4</small></span></span>`);
    return items.length?`<span class="pro-affiliations" aria-label="Other professional league affiliations">${items.join('')}</span>`:'';
  }
  function decorateCard(card){
    if(card.dataset.proAffiliations==='done')return;
    const name=card.querySelector('.player-card-copy strong')?.textContent?.trim();
    if(!name)return;
    const markup=badgeMarkup(name);
    if(markup){const copy=card.querySelector('.player-card-copy');copy?.insertAdjacentHTML('beforeend',markup)}
    card.dataset.proAffiliations='done';
  }
  function decorateModal(){
    const body=document.getElementById('playerModalBody');
    const title=body?.querySelector('#playerModalTitle, h2, h3');
    if(!body||!title)return;
    const name=title.textContent.trim();
    const existing=body.querySelector('.pro-affiliations[data-modal-affiliation="true"]');
    if(existing)existing.remove();
    const markup=badgeMarkup(name);
    if(markup){const wrap=document.createElement('div');wrap.innerHTML=markup;const node=wrap.firstElementChild;if(node){node.dataset.modalAffiliation='true';title.insertAdjacentElement('afterend',node)}}
  }
  function decorateAll(){document.querySelectorAll('#playerGrid .player-card').forEach(decorateCard);decorateModal()}
  fetch('/pro-offseason-affiliations.json',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.json()).then(payload=>{buildMaps(payload);decorateAll();const grid=document.getElementById('playerGrid'),modal=document.getElementById('playerModalBody');if(grid)new MutationObserver(()=>decorateAll()).observe(grid,{childList:true,subtree:true});if(modal)new MutationObserver(()=>decorateModal()).observe(modal,{childList:true,subtree:true})}).catch(()=>{});
})();