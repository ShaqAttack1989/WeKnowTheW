(()=>{
  const grid=document.getElementById('playerGrid');
  const modalBody=document.getElementById('playerModalBody');
  const status=document.getElementById('playerStatus');
  if(!grid||!modalBody)return;

  const factFiles=['/data/playerpedia-facts-ab.json','/data/playerpedia-facts-cf.json','/data/playerpedia-facts-gj.json','/data/playerpedia-facts-kn.json','/data/playerpedia-facts-os.json','/data/playerpedia-facts-tz.json'];
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const has=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
  const fmtTs=value=>{const n=Number(value);if(!Number.isFinite(n))return '—';return `${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const gradeClass=letter=>`grade-${String(letter||'NR').charAt(0).toLowerCase()||'nr'}`;

  let roster=[];
  let rosterByName=new Map();
  let gradesByName=new Map();
  let yearsByName=new Map();
  let facts=new Map();
  let gradesReady=false;
  let cardTimer=null;
  let modalTimer=null;
  let gridObserver=null;
  const draftCache=new Map();
  const detailCache=new Map();

  function playerFor(name){return rosterByName.get(key(name))||null;}
  function gradeFor(name){return gradesByName.get(key(name))||null;}
  function yearsFor(name){return yearsByName.get(key(name))||null;}
  function factFor(name){return facts.get(key(name))||'';}
  function positionLine(player={}){
    const position=String(player.position||'Player').trim()||'Player';
    return `${position}${player.number?` · #${player.number}`:''}`;
  }
  function gradeMarkup(grade={},hero=false){
    const letter=grade?.letter||'NR';
    const score=Number.isFinite(Number(grade?.score))?`${Math.round(Number(grade.score))}%`:'—';
    const provisional=grade?.provisional&&letter!=='NR'?'<span class="player-grade-provisional">PROV</span>':'';
    return `<span class="player-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span class="player-grade-score">${safe(score)} weighted league grade</span>${provisional}`;
  }

  function decorateCards(){
    gridObserver?.disconnect();
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
      const existingName=card.querySelector('.player-card-name')?.textContent?.trim()||card.querySelector('.player-card-copy strong')?.textContent?.trim();
      if(!existingName)return;
      const player=playerFor(existingName)||{name:existingName};
      const copy=card.querySelector('.player-card-copy');
      if(!copy)return;
      const grade=gradeFor(existingName)||{};
      copy.innerHTML=`<span class="player-card-topline">${safe(positionLine(player))}</span><strong class="player-card-name">${safe(player.name||existingName)}</strong><span class="player-card-team">${safe(player.team||'Current roster')}</span><span class="player-card-grade">${gradeMarkup(grade)}</span>`;
      card.querySelectorAll('.player-card-years,.player-card-efficiency').forEach(node=>node.remove());
      card.dataset.gradeReady='true';
    });
    gridObserver?.observe(grid,{childList:true,subtree:true});
  }
  function scheduleCards(){clearTimeout(cardTimer);cardTimer=setTimeout(decorateCards,35);}

  async function fetchDetail(name,team){
    const cacheKey=`${key(name)}|${key(team)}`;
    if(detailCache.has(cacheKey))return detailCache.get(cacheKey);
    const promise=fetch(`/api/player?name=${encodeURIComponent(name)}&team=${encodeURIComponent(team||'')}&playerpedia2k=20260824-v1`,{headers:{Accept:'application/json'}})
      .then(async response=>{const payload=await response.json().catch(()=>({}));return response.ok?(payload.player||{}):{};})
      .catch(()=>({}));
    detailCache.set(cacheKey,promise);
    return promise;
  }
  async function draftClass(year){
    if(!year)return [];
    if(draftCache.has(year))return draftCache.get(year);
    const promise=fetch(`/api/draft-class?year=${encodeURIComponent(year)}`,{headers:{Accept:'application/json'}})
      .then(async response=>{const payload=await response.json().catch(()=>({}));return response.ok&&Array.isArray(payload.picks)?payload.picks:[];})
      .catch(()=>[]);
    draftCache.set(year,promise);
    return promise;
  }
  function draftFromFact(name){
    const fact=factFor(name);if(!fact)return null;
    const match=fact.match(/selected\s+No\.?\s*(\d+)\s+overall[\s\S]*?(\d{4})\s+WNBA Draft/i);
    if(match)return {draftPick:Number(match[1]),draftYear:Number(match[2])};
    const alt=fact.match(/(\d+)(?:st|nd|rd|th)\s+overall[\s\S]*?(?:in|draft)\s+(\d{4})/i);
    if(alt)return {draftPick:Number(alt[1]),draftYear:Number(alt[2])};
    if(/went undrafted|undrafted/i.test(fact))return {undrafted:true};
    return null;
  }
  async function resolveDraft(name,years={}){
    const factDraft=draftFromFact(name);
    if(factDraft?.draftPick)return {...factDraft,round:factDraft.draftPick<=12?1:factDraft.draftPick<=24?2:3};
    if(factDraft?.undrafted)return {undrafted:true,draftYear:years.draftYear||years.startYear||null};
    let draftYear=Number(years.draftYear||years.startYear)||null;
    let draftPick=Number(years.draftPick)||null;
    let round=Number(years.draftRound)||null;
    if(draftYear&&!draftPick){
      const picks=await draftClass(draftYear);
      const match=picks.find(item=>key(item.player)===key(name));
      if(match){draftPick=Number(match.pick)||null;round=Number(match.round)||round;}
      else if(picks.length) return {undrafted:true,draftYear};
    }
    if(draftYear||draftPick)return {draftYear,draftPick,round};
    return {undrafted:true,draftYear:null};
  }

  function findSection(title){
    return [...modalBody.querySelectorAll('.profile-subsection')].find(section=>section.querySelector('h4')?.textContent?.trim().toLowerCase()===title.toLowerCase())||null;
  }
  function ensureQuickBio(player,detail){
    let section=findSection('Quick bio');
    if(!section){section=document.createElement('section');section.className='profile-subsection playerpedia-quick-bio';section.innerHTML='<h4>Quick bio</h4><p></p>';}
    section.classList.add('playerpedia-quick-bio');
    const description=String(detail.description||'').replace(/\s+/g,' ').trim();
    const fallback=`${player.name||'This player'} is a ${String(player.position||'WNBA player').toLowerCase()} for the ${player.team||'current roster'}. Playerpedia tracks her current role, league-relative grade and season efficiency as the year moves.`;
    const p=section.querySelector('p')||section.appendChild(document.createElement('p'));
    p.textContent=description||p.textContent.trim()||fallback;
    return section;
  }
  function factTile(label,value,extraClass='',badge=''){
    if(!has(value))return '';
    return `<div class="profile-fact ${extraClass}"><span>${safe(label)}</span><strong>${safe(value)}</strong>${badge}</div>`;
  }
  function buildFacts(player,detail,draft){
    const draftYear=draft?.undrafted?'Undrafted':draft?.draftYear||'';
    const draftPick=draft?.undrafted?'Undrafted':draft?.draftPick?`No. ${draft.draftPick} overall`:'';
    const top10=Number(draft?.draftPick)>=1&&Number(draft?.draftPick)<=10;
    const badge=top10?'<span class="top10-draft-badge">TOP 10 PICK</span>':'';
    return [
      factTile('From',detail.birthPlace||player.birthPlace||''),
      factTile('Nationality',detail.nationality||player.nationality||''),
      factTile('Born',detail.birthDate||player.birthDate||''),
      factTile('Height',detail.height||player.height||''),
      factTile('Year drafted',draftYear),
      factTile('Draft pick',draftPick,top10?'draft-top10':'',badge)
    ].join('');
  }
  function metricsBlock(name,grade){
    const per=Number.isFinite(Number(grade?.per))?Number(grade.per).toFixed(1):'—';
    const ts=fmtTs(grade?.tsPct);
    const note=grade?.letter&&grade.letter!=='NR'?`Weighted league grade: ${grade.letter} · ${Math.round(Number(grade.score))}%${grade.provisional?' · provisional sample':''}.`:'Weighted league grade is waiting for a qualifying 2026 sample.';
    return `<section class="playerpedia-metrics-block"><h4>2026 efficiency</h4><div class="playerpedia-metrics-grid"><div class="playerpedia-metric"><span>PER</span><strong>${safe(per)}</strong><small>Player Efficiency Rating · all-around per-minute production</small></div><div class="playerpedia-metric"><span>TS%</span><strong>${safe(ts)}</strong><small>True shooting · scoring efficiency across 2s, 3s and free throws</small></div></div><p class="playerpedia-rating-note">${safe(note)}</p></section>`;
  }
  function funFactBlock(name){
    const workbook=factFor(name);
    const existing=modalBody.querySelector('.amazing-fact p')?.textContent?.trim()||'';
    const fact=workbook||existing||`${name}'s Playerpedia fact file is still being expanded.`;
    return `<section class="profile-fun-fact"><h4>Fun fact</h4><p>${safe(fact)}</p></section>`;
  }

  async function upgradeModal(){
    if(modalBody.querySelector('.profile-loading')){delete modalBody.dataset.gradeProfile;return;}
    const hero=modalBody.querySelector('.profile-hero');
    const title=modalBody.querySelector('#playerModalTitle');
    const factsHost=modalBody.querySelector('.profile-facts');
    if(!hero||!title||!factsHost)return;
    const name=title.textContent.trim();if(!name||name==='Loading…')return;
    const stamp=`${key(name)}-${hero.childElementCount}-${factsHost.childElementCount}`;
    if(modalBody.dataset.gradeProfile===stamp)return;
    modalBody.dataset.gradeProfile=stamp;

    const player=playerFor(name)||{name,team:(modalBody.querySelector('.profile-teamline')?.textContent||'').split(' · ')[0]||''};
    const grade=gradeFor(name)||{};
    const years=yearsFor(name)||{};
    const [detail,draft]=await Promise.all([fetchDetail(name,player.team),resolveDraft(name,years)]);
    if(key(modalBody.querySelector('#playerModalTitle')?.textContent)!==key(name))return;

    hero.classList.add('playerpedia-2k-hero');
    const copy=title.parentElement;
    if(copy){
      copy.classList.add('profile-identity-lines');
      copy.querySelector('.kicker')?.remove();
      copy.querySelector('.profile-teamline')?.remove();
      copy.querySelector('.profile-position-line')?.remove();
      copy.querySelector('.profile-team-name')?.remove();
      copy.querySelector('.profile-grade-line')?.remove();
      title.insertAdjacentHTML('beforebegin',`<p class="profile-position-line">${safe(positionLine({...player,...detail,name}))}</p>`);
      title.insertAdjacentHTML('afterend',`<p class="profile-team-name">${safe(player.team||detail.team||'Current roster')}</p><div class="profile-grade-line">${gradeMarkup(grade,true)}</div>`);
    }

    factsHost.classList.add('playerpedia-core-facts');
    factsHost.innerHTML=buildFacts(player,detail,draft);

    const quickBio=ensureQuickBio(player,detail);
    const honors=findSection('Honors & awards');
    const liveNote=findSection('Current roster note');
    const metricsWrap=document.createElement('div');metricsWrap.innerHTML=metricsBlock(name,grade);const metrics=metricsWrap.firstElementChild;
    const funWrap=document.createElement('div');funWrap.innerHTML=funFactBlock(name);const fun=funWrap.firstElementChild;
    modalBody.querySelector('.why-we-know-her')?.remove();
    modalBody.querySelectorAll('.playerpedia-metrics-block,.profile-fun-fact').forEach(node=>node.remove());

    factsHost.insertAdjacentElement('afterend',quickBio);
    quickBio.insertAdjacentElement('afterend',metrics);
    metrics.insertAdjacentElement('afterend',fun);
    if(honors)fun.insertAdjacentElement('afterend',honors);
    if(liveNote&&liveNote.previousElementSibling!==factsHost)factsHost.insertAdjacentElement('beforebegin',liveNote);
  }
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(upgradeModal,80);}

  gridObserver=new MutationObserver(scheduleCards);
  gridObserver.observe(grid,{childList:true,subtree:true});
  new MutationObserver(scheduleModal).observe(modalBody,{childList:true,subtree:true});

  async function loadData(){
    const requests=[
      fetch('/api/players?playerpedia2k=20260824-v1',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.json()),
      fetch(`/api/player-grades?season=2026&cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.json()),
      fetch('/api/player-years?season=2026&playerpedia2k=20260824-v1',{headers:{Accept:'application/json'}}).then(r=>r.json()),
      ...factFiles.map(url=>fetch(url,{headers:{Accept:'application/json'}}).then(r=>r.json()).catch(()=>({})))
    ];
    const results=await Promise.allSettled(requests);
    const rosterPayload=results[0].status==='fulfilled'?results[0].value:{};
    const gradePayload=results[1].status==='fulfilled'?results[1].value:{};
    const yearsPayload=results[2].status==='fulfilled'?results[2].value:{};
    roster=Array.isArray(rosterPayload.players)?rosterPayload.players:[];
    rosterByName=new Map(roster.map(player=>[key(player.name),player]));
    const grades=Array.isArray(gradePayload.players)?gradePayload.players:[];
    gradesByName=new Map(grades.map(item=>[key(item.name),item]));
    gradesReady=grades.length>0;
    const years=Array.isArray(yearsPayload.players)?yearsPayload.players:[];
    yearsByName=new Map(years.map(item=>[key(item.name),item]));
    facts=new Map();
    results.slice(3).forEach(result=>{if(result.status==='fulfilled'&&result.value&&typeof result.value==='object')Object.entries(result.value).forEach(([name,fact])=>facts.set(key(name),String(fact||'')));});
    scheduleCards();scheduleModal();
    if(status){
      const base=status.textContent.replace(/ · 2K-style grade.*$/,'');
      status.textContent=`${base} · 2K-style grade ${gradesReady?'connected':'retrying'}`;
    }
  }
  loadData().catch(()=>{scheduleCards();});
})();
