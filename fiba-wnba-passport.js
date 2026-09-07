(()=>{
  'use strict';
  const root=document.getElementById('fibaWnbaPassport')||document.getElementById('wnba-passport');
  if(!root)return;

  if(!document.querySelector('link[data-fiba-passport-polish]')){
    const styleLink=document.createElement('link');
    styleLink.rel='stylesheet';
    styleLink.dataset.fibaPassportPolish='true';
    styleLink.href='/fiba-passport-polish.css?v=20260907-v2';
    document.head.appendChild(styleLink);
  }

  const safe=value=>String(value??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[ch]));
  let mode='current';
  let group='all';
  let data=null;
  const FLAG_FALLBACK={Australia:'🇦🇺',Belgium:'🇧🇪',China:'🇨🇳',Czechia:'🇨🇿',France:'🇫🇷',Germany:'🇩🇪',Hungary:'🇭🇺',Italy:'🇮🇹',Japan:'🇯🇵',Korea:'🇰🇷',Mali:'🇲🇱',Nigeria:'🇳🇬','Puerto Rico':'🇵🇷',Spain:'🇪🇸','Türkiye':'🇹🇷','United States':'🇺🇸'};
  const FLAG_CODES={Australia:'au',Belgium:'be',China:'cn',Czechia:'cz',France:'fr',Germany:'de',Hungary:'hu',Italy:'it',Japan:'jp',Korea:'kr',Mali:'ml',Nigeria:'ng','Puerto Rico':'pr',Spain:'es','Türkiye':'tr','United States':'us'};

  const playerLink=name=>'/playerpedia.html?search='+encodeURIComponent(name)+'#playerpedia-directory';
  const isCurrent=status=>/^Current/.test(status||'');

  function countFor(country){
    const rows=data.players.filter(p=>p.country===country);
    return {
      current:rows.filter(p=>isCurrent(p.status)).length,
      former:rows.filter(p=>p.status==='Former').length,
      allStar:rows.filter(p=>p.allStar).length,
      total:rows.length
    };
  }

  function countryGroup(country){
    for(const [key,countries] of Object.entries(data.groups||{})){
      if(countries.includes(country))return key;
    }
    return '';
  }

  function visiblePlayers(country){
    const rows=data.players.filter(p=>p.country===country);
    if(mode==='current')return rows.filter(p=>isCurrent(p.status));
    if(mode==='allstar')return rows.filter(p=>p.allStar);
    return rows;
  }

  function playerRow(player){
    const statusClass=player.status==='Former'?'former':(player.status.includes('Dev.')?'dev':'current');
    return '<a class="fiba-passport-player '+statusClass+'" href="'+playerLink(player.name)+'">'+
      '<span class="fiba-passport-player-name">'+(player.allStar?'<b class="fiba-allstar-star" title="WNBA All-Star">★</b>':'')+'<strong>'+safe(player.name)+'</strong></span>'+
      '<span class="fiba-passport-player-meta">'+(player.team?safe(player.team):'WNBA alum')+'<small>'+safe(player.status)+'</small></span>'+
    '</a>';
  }

  function countryCard(country){
    const counts=countFor(country);
    const players=visiblePlayers(country);
    const flag=data.flags?.[country]||FLAG_FALLBACK[country]||'🏀';
    const flagCode=FLAG_CODES[country]||'';
    const flagMarkup=flagCode
      ? '<img class="fiba-passport-flag-image" src="https://flagcdn.io/w80/'+flagCode+'.png" alt="" loading="lazy" decoding="async"><span class="fiba-passport-flag-fallback" aria-hidden="true">'+safe(flag)+'</span>'
      : '<span class="fiba-passport-flag" aria-hidden="true">'+safe(flag)+'</span>';
    const groupName=countryGroup(country);
    const noCurrent=mode==='current'&&players.length===0;
    const countryClass=(country==='United States'?'usa ':'')+(noCurrent?'empty-current ':'')+'group-'+String(groupName||'x').toLowerCase();
    const formerCounts=counts.former?'<b>'+counts.former+'</b><small>former</small>':'';
    let emptyCopy='';
    if(mode==='allstar')emptyCopy='No WNBA All-Star on this roster.';
    else if(counts.former)emptyCopy='No current WNBA player. '+counts.former+' WNBA alum'+(counts.former>1?'s':'')+' on the roster.';
    else emptyCopy='No current WNBA player.';
    return '<article class="fiba-passport-country '+countryClass+'" data-country="'+safe(country)+'">'+
      '<header>'+
        '<div class="fiba-passport-country-title"><span class="fiba-passport-flag-shell">'+flagMarkup+'</span><div><span class="fiba-passport-group-label">GROUP '+safe(groupName)+'</span><h4>'+safe(country)+'</h4></div></div>'+
        '<div class="fiba-passport-counts"><b>'+counts.current+'</b><small>current</small>'+formerCounts+'</div>'+
      '</header>'+
      '<div class="fiba-passport-player-list">'+(players.length?players.map(playerRow).join(''):'<div class="fiba-passport-none">'+emptyCopy+'</div>')+'</div>'+
    '</article>';
  }

  function countriesInOrder(){
    const order=[];
    ['A','B','C','D'].forEach(key=>(data.groups?.[key]||[]).forEach(country=>order.push(country)));
    if(group!=='all')return order.filter(country=>countryGroup(country)===group);
    return order;
  }

  function bindFlagFallbacks(){
    root.querySelectorAll('.fiba-passport-flag-image').forEach(image=>{
      image.addEventListener('error',()=>image.classList.add('is-broken'),{once:true});
    });
  }

  function render(){
    if(!data)return;
    root.querySelectorAll('[data-passport-mode]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.passportMode===mode));
    });
    root.querySelectorAll('[data-passport-group]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.passportGroup===group));
    });
    const grid=document.getElementById('fibaWnbaPassportGrid');
    grid.innerHTML=countriesInOrder().map(countryCard).join('');
    bindFlagFallbacks();
    const summary=document.getElementById('fibaWnbaPassportSummary');
    summary.innerHTML='<strong>'+data.summary.current+' current WNBA players</strong>'+
      '<span>'+data.summary.former+' former WNBA players</span>'+
      '<span>'+data.summary.countriesWithCurrent+' of 16 countries have a current WNBA player</span>'+
      '<span>★ WNBA All-Star</span>';
  }

  root.addEventListener('click',event=>{
    const modeButton=event.target.closest('[data-passport-mode]');
    if(modeButton){mode=modeButton.dataset.passportMode;render();return;}
    const groupButton=event.target.closest('[data-passport-group]');
    if(groupButton){group=groupButton.dataset.passportGroup;render();}
  });

  fetch('/data/fiba-wnba-passport-2026.json?v=20260907',{cache:'no-store',headers:{Accept:'application/json'}})
    .then(response=>{if(!response.ok)throw new Error('passport '+response.status);return response.json();})
    .then(payload=>{
      data=payload;
      const source=document.getElementById('fibaWnbaPassportSource');
      if(source)source.href=payload.sourceUrl||'#';
      render();
      root.setAttribute('aria-busy','false');
    })
    .catch(()=>{
      const grid=document.getElementById('fibaWnbaPassportGrid');
      if(grid)grid.innerHTML='<p class="fiba-empty">WNBA country dashboard is reconnecting.</p>';
      root.setAttribute('aria-busy','false');
    });
})();