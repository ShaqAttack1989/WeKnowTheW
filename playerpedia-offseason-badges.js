(()=>{
  const grid=document.getElementById('playerGrid');
  const modal=document.getElementById('playerModalBody');
  if(!grid&&!modal)return;

  const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases=new Map([
    ['skylardigginssmith','skylardiggins'],
    ['temifagbenle','temifagbenle'],
    ['flaujaejohnson','flaujaejohnson'],
    ['liyueru','liyueru']
  ]);
  const key=v=>aliases.get(normalize(v))||normalize(v);
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  let data=null;
  let unrivaled=new Map();
  let future=new Map();
  let au=new Map();
  let cardTimer=null;
  let modalTimer=null;

  function buildMaps(payload={}){
    data=payload;
    unrivaled=new Map((payload?.unrivaled?.players||[]).map(([name,team])=>[key(name),team]));
    future=new Map((payload?.unrivaled?.season3Signed||[]).map(([name,team])=>[key(name),team]));
    au=new Map((payload?.athletesUnlimited?.players||[]).map(([name,team])=>[key(name),team]));
  }

  function affiliationsFor(name){
    if(!data)return [];
    const k=key(name),items=[];
    if(unrivaled.has(k))items.push({league:'unrivaled',team:unrivaled.get(k),label:'2026 club',logo:data?.logos?.unrivaled||''});
    else if(future.has(k))items.push({league:'unrivaled',team:future.get(k),label:'signed for 2027',logo:data?.logos?.unrivaled||''});
    if(au.has(k))items.push({league:'au',team:au.get(k),label:'2026 Week 4',logo:data?.logos?.au||''});
    return items;
  }

  function markup(name,modalMode=false){
    const items=affiliationsFor(name);
    if(!items.length)return '';
    return `<span class="pro-affiliations"${modalMode?' data-modal-affiliation="true"':''} aria-label="Other professional league affiliations">${items.map(item=>`<span class="pro-affiliation ${safe(item.league)}">${item.logo?`<img src="${safe(item.logo)}" alt="" loading="lazy" decoding="async">`:''}<span class="pro-affiliation-copy"><b>${safe(item.team)}</b><small>${safe(item.label)}</small></span></span>`).join('')}</span>`;
  }

  function signature(name){return affiliationsFor(name).map(item=>`${item.league}:${item.team}:${item.label}`).join('|');}

  function cardSlot(copy){
    let slot=copy?.querySelector('.player-card-pro-slot');
    if(!slot&&copy){slot=document.createElement('span');slot.className='player-card-pro-slot';const grade=copy.querySelector('.player-card-grade');if(grade)copy.insertBefore(slot,grade);else copy.appendChild(slot);}
    return slot;
  }

  function decorateCard(card){
    const copy=card.querySelector('.player-card-copy');
    const name=copy?.querySelector('.player-card-name')?.textContent?.trim()||copy?.querySelector('strong')?.textContent?.trim();
    if(!copy||!name)return;
    const slot=cardSlot(copy);if(!slot)return;
    const sig=signature(name);
    if(card.dataset.proAffiliationSignature===sig&&slot.dataset.affiliationSignature===sig)return;
    slot.innerHTML=sig?markup(name):'';
    slot.dataset.affiliationSignature=sig;
    card.dataset.proAffiliationSignature=sig;
  }

  function decorateCards(){
    if(!data||!grid)return;
    grid.querySelectorAll('.player-card[data-player-id]').forEach(decorateCard);
  }

  function decorateModal(){
    if(!data||!modal||modal.querySelector('.profile-loading'))return;
    const title=modal.querySelector('#playerModalTitle');
    if(!title)return;
    const name=title.textContent.trim();
    const sig=signature(name);
    const existing=modal.querySelector('.pro-affiliations[data-modal-affiliation="true"]');
    if(existing?.dataset.affiliationSignature===sig)return;
    existing?.remove();
    if(!sig)return;
    const wrap=document.createElement('div');
    wrap.innerHTML=markup(name,true);
    const node=wrap.firstElementChild;
    if(!node)return;
    node.dataset.affiliationSignature=sig;
    title.insertAdjacentElement('afterend',node);
  }

  function scheduleCards(){clearTimeout(cardTimer);cardTimer=setTimeout(decorateCards,60);}
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(decorateModal,80);}

  fetch('/pro-offseason-affiliations.json',{headers:{Accept:'application/json'}})
    .then(r=>r.ok?r.json():Promise.reject(new Error('Affiliations unavailable')))
    .then(payload=>{
      buildMaps(payload);
      decorateCards();
      decorateModal();
      if(grid)new MutationObserver(scheduleCards).observe(grid,{childList:true});
      if(modal)new MutationObserver(scheduleModal).observe(modal,{childList:true});
    })
    .catch(()=>{});
})();