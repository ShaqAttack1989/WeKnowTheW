(()=>{
  const grid=document.getElementById('playerGrid');
  const modalBody=document.getElementById('playerModalBody');
  const status=document.getElementById('playerStatus');
  if(!grid||!modalBody)return;

  const key=(value='')=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const words=(value='')=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
  const safe=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const hasMetric=value=>value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isFinite(Number(value));
  const formatTs=value=>{if(!hasMetric(value))return 'N/A';const n=Number(value);return `${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const TEAM_ABBR={
    'atlantadream':'ATL','chicagosky':'CHI','connecticutsun':'CON','dallaswings':'DAL','goldenstatevalkyries':'GSV',
    'indianafever':'IND','lasvegasaces':'LVA','losangelessparks':'LAS','minnesotalynx':'MIN','newyorkliberty':'NYL',
    'phoenixmercury':'PHO','portlandfire':'POR','seattlestorm':'SEA','torontotempo':'TOR','washingtonmystics':'WAS'
  };
  const ALIASES={
    'aliciaflorezgetino':['aliciaflorez'],
    'aliciaflorez':['aliciaflorezgetino'],
    'cheyenneparkertyus':['cheyenneparker'],
    'moniqueakoamakani':['moniqueakoamakani']
  };

  let roster=[];
  let advanced=[];
  let rosterByName=new Map();
  let advancedByName=new Map();
  let advancedReady=false;
  let decorateTimer=null;
  let modalTimer=null;
  let lastCoverage='';
  let gridObserver=null;

  function rosterPlayer(name){return rosterByName.get(key(name))||null;}

  function advancedRow(name,team=''){
    const exact=advancedByName.get(key(name));
    if(exact)return exact;
    const aliases=ALIASES[key(name)]||[];
    for(const alias of aliases){const hit=advancedByName.get(alias);if(hit)return hit;}

    const wantedKey=key(name),wantedWords=words(name),wantedFirst=wantedWords[0]||'';
    const teamAbbr=TEAM_ABBR[key(team)]||String(team||'').toUpperCase();
    let candidates=advanced.filter(row=>{
      const rowKey=key(row.name);
      if(!rowKey)return false;
      const rowTeam=String(row.team||'').toUpperCase();
      const teamOk=!teamAbbr||!rowTeam||rowTeam===teamAbbr||/^\d+TM$/.test(rowTeam);
      return teamOk&&(rowKey.includes(wantedKey)||wantedKey.includes(rowKey));
    });
    if(candidates.length===1)return candidates[0];

    candidates=advanced.filter(row=>{
      const rowWords=words(row.name);
      const rowTeam=String(row.team||'').toUpperCase();
      const teamOk=!teamAbbr||!rowTeam||rowTeam===teamAbbr||/^\d+TM$/.test(rowTeam);
      if(!teamOk||!wantedFirst||rowWords[0]!==wantedFirst)return false;
      return rowWords.slice(1).some(word=>wantedWords.slice(1).includes(word));
    });
    if(candidates.length===1)return candidates[0];

    candidates=advanced.filter(row=>{
      const rowWords=words(row.name);
      const rowTeam=String(row.team||'').toUpperCase();
      return wantedFirst&&rowWords[0]===wantedFirst&&teamAbbr&&rowTeam===teamAbbr;
    });
    return candidates.length===1?candidates[0]:null;
  }

  function cardEfficiency(player={}){
    const row=advancedRow(player.name,player.team);
    if(row){
      const per=hasMetric(row.per)?Number(row.per).toFixed(1):'N/A';
      const ts=formatTs(row.tsPct);
      return `<small class="player-card-efficiency has-line"><b>PER ${safe(per)}</b><span>TS ${safe(ts)}</span></small>`;
    }
    if(!advancedReady)return '<small class="player-card-efficiency is-loading"><span>Efficiency stats refreshing…</span></small>';
    return '<small class="player-card-efficiency no-line"><span>No 2026 efficiency line yet</span></small>';
  }

  function decorateCards(){
    gridObserver?.disconnect();
    document.querySelectorAll('#playerGrid .player-card[data-player-id]').forEach(card=>{
      const name=card.querySelector('.player-card-copy strong')?.textContent?.trim();
      if(!name)return;
      const player=rosterPlayer(name)||{name,team:card.querySelector('.player-card-copy > span:not(.player-card-topline)')?.textContent?.trim()||''};
      const current=card.querySelector('.player-card-efficiency');
      const wrap=document.createElement('div');
      wrap.innerHTML=cardEfficiency(player);
      const next=wrap.firstElementChild;
      if(!next)return;
      if(current){
        if(current.className!==next.className||current.innerHTML!==next.innerHTML)current.replaceWith(next);
      }else card.querySelector('.player-card-copy')?.appendChild(next);
    });
    updateCoverage();
    gridObserver?.observe(grid,{childList:true,subtree:true});
  }

  function scheduleCards(){clearTimeout(decorateTimer);decorateTimer=setTimeout(decorateCards,40);}

  function updateCoverage(){
    if(!roster.length||!status)return;
    const matched=roster.filter(player=>advancedRow(player.name,player.team)).length;
    const text=advancedReady?`${matched}/${roster.length} current roster cards have a 2026 advanced line; players without qualifying minutes are labeled N/A`:'advanced metrics are retrying; cards remain filled while the feed reconnects';
    if(text===lastCoverage)return;
    lastCoverage=text;
    const base=status.textContent.replace(/ · efficiency audit:.*$/,'');
    status.textContent=`${base} · efficiency audit: ${text}`;
  }

  function fallbackBio(player={}){
    const name=player.name||'This player';
    const team=player.team||'a current WNBA team';
    const position=player.position||'player';
    const number=player.number?` and wears #${player.number}`:'';
    const college=player.college?` The profile also connects ${name} to ${player.college}.`:'';
    return `${name} is a ${String(position).toLowerCase()} on the ${team} 2026 roster${number}. Playerpedia tracks ${name}'s current roster role and season efficiency as the year moves.${college}`;
  }

  function quickBioSection(){
    return [...modalBody.querySelectorAll('.profile-subsection')].find(section=>section.querySelector('h4')?.textContent?.trim().toLowerCase()==='quick bio')||null;
  }

  function ensureBio(player={}){
    let section=quickBioSection();
    if(section&&section.querySelector('p')?.textContent?.trim())return section;
    if(!section){
      section=document.createElement('section');
      section.className='profile-subsection playerpedia-complete-bio';
      section.innerHTML=`<h4>Quick bio</h4><p>${safe(fallbackBio(player))}</p>`;
      const why=modalBody.querySelector('.why-we-know-her');
      if(why)why.insertAdjacentElement('beforebegin',section);else modalBody.appendChild(section);
    }else{
      const p=section.querySelector('p')||section.appendChild(document.createElement('p'));
      p.textContent=fallbackBio(player);
    }
    section.dataset.fallbackBio='true';
    return section;
  }

  function ensureFacts(player={}){
    const facts=modalBody.querySelector('.profile-facts');
    if(!facts)return;
    const labels=new Set([...facts.querySelectorAll('.profile-fact span')].map(node=>node.textContent.trim().toLowerCase()));
    const additions=[['Jersey',player.number?`#${player.number}`:''],['Height',player.height||''],['College',player.college||'']].filter(([label,value])=>value&&!labels.has(label.toLowerCase()));
    additions.forEach(([label,value])=>facts.insertAdjacentHTML('beforeend',`<div class="profile-fact completeness-fact"><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`));
  }

  function fillMetrics(player={}){
    const row=advancedRow(player.name,player.team);
    const metrics=[...modalBody.querySelectorAll('.why-metric')];
    if(metrics.length<2)return;
    const perNode=metrics[0].querySelector('strong'),tsNode=metrics[1].querySelector('strong');
    const perSmall=metrics[0].querySelector('small'),tsSmall=metrics[1].querySelector('small');
    if(row){
      if(perNode)perNode.textContent=hasMetric(row.per)?Number(row.per).toFixed(1):'N/A';
      if(tsNode)tsNode.textContent=formatTs(row.tsPct);
      metrics.forEach(node=>node.classList.remove('metric-unavailable'));
    }else if(advancedReady){
      if(perNode)perNode.textContent='N/A';
      if(tsNode)tsNode.textContent='N/A';
      if(perSmall)perSmall.textContent='PER · no qualifying 2026 advanced line yet';
      if(tsSmall)tsSmall.textContent='TS% · no qualifying 2026 advanced line yet';
      metrics.forEach(node=>node.classList.add('metric-unavailable'));
    }
  }

  function addDetailFacts(detail={}){
    const facts=modalBody.querySelector('.profile-facts');
    if(!facts)return;
    const labels=new Set([...facts.querySelectorAll('.profile-fact span')].map(node=>node.textContent.trim().toLowerCase()));
    const rows=[['Born',detail.birthDate],['From',detail.birthPlace],['Nationality',detail.nationality],['Height',detail.height],['College',detail.college]];
    rows.filter(([label,value])=>value&&!labels.has(label.toLowerCase())).forEach(([label,value])=>facts.insertAdjacentHTML('beforeend',`<div class="profile-fact completeness-fact"><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`));
  }

  async function enrichModal(){
    const why=modalBody.querySelector('.why-we-know-her');
    const title=modalBody.querySelector('#playerModalTitle');
    if(!why||!title)return;
    const name=title.textContent.trim();
    if(!name||name==='Loading…')return;
    const stamp=key(name);
    if(modalBody.dataset.completenessKey===stamp)return;
    modalBody.dataset.completenessKey=stamp;
    const player=rosterPlayer(name)||{name,team:(modalBody.querySelector('.profile-teamline')?.textContent||'').split(' · ')[0]||''};
    ensureBio(player);
    ensureFacts(player);
    fillMetrics(player);

    try{
      const response=await fetch(`/api/player?name=${encodeURIComponent(name)}&team=${encodeURIComponent(player.team||'')}&profileAudit=20260823-v1`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||key(modalBody.querySelector('#playerModalTitle')?.textContent)!==stamp)return;
      const detail=payload.player||{};
      const section=ensureBio({...player,...detail,name});
      const description=String(detail.description||'').replace(/\s+/g,' ').trim();
      if(description&&section){
        const p=section.querySelector('p')||section.appendChild(document.createElement('p'));
        p.textContent=description;
        section.dataset.fallbackBio='false';
      }
      addDetailFacts(detail);
    }catch{/* Structured roster bio remains in place. */}
  }

  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(enrichModal,60);}

  gridObserver=new MutationObserver(scheduleCards);
  gridObserver.observe(grid,{childList:true,subtree:true});
  new MutationObserver(scheduleModal).observe(modalBody,{childList:true,subtree:true});

  async function loadAuditData(){
    const [rosterResult,advancedResult]=await Promise.allSettled([
      fetch('/api/players?playerpediaAudit=20260823-v1',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Roster unavailable');return data;}),
      fetch(`/api/advanced-stats?season=2026&playerpediaAudit=20260823-v2&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Advanced stats unavailable');return data;})
    ]);
    if(rosterResult.status==='fulfilled'){
      roster=Array.isArray(rosterResult.value.players)?rosterResult.value.players:[];
      rosterByName=new Map(roster.map(player=>[key(player.name),player]));
    }
    if(advancedResult.status==='fulfilled'){
      advanced=Array.isArray(advancedResult.value.players)?advancedResult.value.players:[];
      advancedByName=new Map(advanced.map(row=>[key(row.name),row]));
      advancedReady=advanced.length>0;
    }
    scheduleCards();
    scheduleModal();
  }

  loadAuditData().catch(()=>{scheduleCards();});
})();