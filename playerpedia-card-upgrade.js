(()=>{
  const grid=document.getElementById('playerGrid');
  const modal=document.getElementById('playerModalBody');
  const status=document.getElementById('playerStatus');
  if(!grid||!modal)return;

  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};
  const idle=(fn,timeout=900)=>window.requestIdleCallback?requestIdleCallback(fn,{timeout}):setTimeout(fn,Math.min(timeout,500));

  let gradesByName=new Map();
  let yearsPromise=null;
  let draftPromise=null;
  let careerPromise=null;
  const factPromises=new Map();
  const detailCache=new Map();
  let cardTimer=null;
  let modalTimer=null;

  function gradeMarkup(grade={}){
    const letter=grade?.letter||'NR';
    const score=Number.isFinite(Number(grade?.score))?`${Math.round(Number(grade.score))}%`:'—';
    const provisional=grade?.provisional&&letter!=='NR'?'<span class="player-grade-provisional">PROV</span>':'';
    return `<span class="player-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span class="player-grade-score">${safe(score)} weighted league grade</span>${provisional}`;
  }

  function decorateCards(){
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
      const copy=card.querySelector('.player-card-copy');
      const name=copy?.querySelector('.player-card-name')?.textContent?.trim()||copy?.querySelector('strong')?.textContent?.trim();
      if(!copy||!name)return;
      const grade=gradesByName.get(key(name));
      if(!grade)return;
      const sig=`${grade.letter||'NR'}:${Math.round(Number(grade.score)||0)}:${grade.provisional?'p':'f'}`;
      let host=copy.querySelector('.player-card-grade');
      if(host?.dataset.gradeSignature===sig)return;
      if(!host){host=document.createElement('span');host.className='player-card-grade';copy.appendChild(host);}
      host.dataset.gradeSignature=sig;
      host.innerHTML=gradeMarkup(grade);
    });
  }
  function scheduleCards(){clearTimeout(cardTimer);cardTimer=setTimeout(decorateCards,60);}

  async function loadGrades(){
    try{
      const response=await fetch('/api/player-grades?season=2026',{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      const players=response.ok&&Array.isArray(payload.players)?payload.players:[];
      gradesByName=new Map(players.map(item=>[key(item.name),item]));
      decorateCards();
      if(status&&players.length&&!/weighted league grade/i.test(status.textContent))status.textContent=`${status.textContent} · weighted league grade connected`;
    }catch{}
  }

  function yearsData(){
    if(!yearsPromise)yearsPromise=fetch('/api/player-years?season=2026',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    return yearsPromise;
  }
  function draftData(){
    if(!draftPromise)draftPromise=fetch('/data/wnba-draft-history.json',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    return draftPromise;
  }
  function careerData(){
    if(!careerPromise)careerPromise=fetch('/data/playerpedia-career-status.json',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    return careerPromise;
  }
  function factFileFor(name=''){
    const last=String(name).trim().split(/\s+/).pop()||'';
    const first=(last[0]||'A').toUpperCase();
    if(first<='B')return '/data/playerpedia-facts-ab.json';
    if(first<='F')return '/data/playerpedia-facts-cf.json';
    if(first<='J')return '/data/playerpedia-facts-gj.json';
    if(first<='N')return '/data/playerpedia-facts-kn.json';
    if(first<='S')return '/data/playerpedia-facts-os.json';
    return '/data/playerpedia-facts-tz.json';
  }
  function factData(name){
    const url=factFileFor(name);
    if(!factPromises.has(url))factPromises.set(url,fetch(url,{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}).catch(()=>({})));
    return factPromises.get(url);
  }
  function detailData(name,team=''){
    const cacheKey=`${key(name)}|${key(team)}`;
    if(!detailCache.has(cacheKey))detailCache.set(cacheKey,fetch(`/api/player?name=${encodeURIComponent(name)}&team=${encodeURIComponent(team)}`,{headers:{Accept:'application/json'}}).then(async r=>{const p=await r.json().catch(()=>({}));return r.ok?(p.player||{}):{};}).catch(()=>({})));
    return detailCache.get(cacheKey);
  }

  function draftRecord(name,draftPayload={}){
    const picks=Array.isArray(draftPayload.picks)?draftPayload.picks:[];
    const aliases=draftPayload.aliases||{};
    const aliasTarget=Object.entries(aliases).find(([alias])=>key(alias)===key(name))?.[1];
    return picks.find(item=>key(item.player)===key(aliasTarget||name))||null;
  }

  function appendFact(host,label,value,cls=''){
    if(!host||!value)return;
    const marker=key(label);
    if(host.querySelector(`[data-extra-fact="${marker}"]`))return;
    const div=document.createElement('div');
    div.className=`profile-fact ${cls}`.trim();
    div.dataset.extraFact=marker;
    div.innerHTML=`<span>${safe(label)}</span><strong>${safe(value)}</strong>`;
    host.appendChild(div);
  }

  async function upgradeModal(){
    if(modal.querySelector('.profile-loading'))return;
    const title=modal.querySelector('#playerModalTitle');
    if(!title)return;
    const name=title.textContent.trim();
    if(!name)return;
    const existingGrade=modal.querySelector('.profile-grade-line[data-playerpedia-upgraded="1"]');
    const factsHost=modal.querySelector('.profile-facts');
    if(existingGrade&&existingGrade.dataset.playerKey===key(name)&&factsHost?.dataset.playerpediaExtraFor===key(name))return;

    const team=(modal.querySelector('.profile-teamline,.profile-team-name')?.textContent||'').split(' · ')[0].trim();
    const [detail,yearsPayload,draftPayload,careerPayload,factsPayload]=await Promise.all([
      detailData(name,team),yearsData(),draftData(),careerData(),factData(name)
    ]);
    if(key(modal.querySelector('#playerModalTitle')?.textContent)!==key(name))return;

    const grade=gradesByName.get(key(name))||{};
    let gradeLine=modal.querySelector('.profile-grade-line');
    if(!gradeLine){gradeLine=document.createElement('div');gradeLine.className='profile-grade-line';title.insertAdjacentElement('afterend',gradeLine);}
    gradeLine.dataset.playerpediaUpgraded='1';
    gradeLine.dataset.playerKey=key(name);
    gradeLine.innerHTML=gradeMarkup(grade);

    const years=Array.isArray(yearsPayload?.players)?yearsPayload.players:[];
    const yearInfo=years.find(item=>key(item.name)===key(name))||{};
    const draft=draftRecord(name,draftPayload)||{};
    if(factsHost){
      appendFact(factsHost,'College',detail.college||yearInfo.college||'');
      if(draft.year||draft.draftYear||yearInfo.draftYear)appendFact(factsHost,'Year drafted',draft.year||draft.draftYear||yearInfo.draftYear);
      if(draft.pick||draft.draftPick||yearInfo.draftPick)appendFact(factsHost,'Overall pick',`No. ${draft.pick||draft.draftPick||yearInfo.draftPick} overall`,'draft-top10');
      if(draft.team)appendFact(factsHost,'Drafted by',draft.team);
      factsHost.dataset.playerpediaExtraFor=key(name);
    }

    const careerEntry=Object.entries(careerPayload||{}).find(([playerName])=>key(playerName)===key(name))?.[1];
    if(careerEntry?.status==='returned'&&!modal.querySelector('.player-return-badge')){
      const badge=document.createElement('span');badge.className='player-return-badge';badge.textContent=`↩ ${careerEntry.label||'RETIRED + RETURNED'}`;gradeLine.insertAdjacentElement('afterend',badge);
    }

    const workbookFact=Object.entries(factsPayload||{}).find(([playerName])=>key(playerName)===key(name))?.[1];
    if(workbookFact){
      const amazing=modal.querySelector('.amazing-fact p');
      if(amazing)amazing.textContent=String(workbookFact);
    }
  }
  function scheduleModal(){clearTimeout(modalTimer);modalTimer=setTimeout(upgradeModal,100);}

  new MutationObserver(scheduleCards).observe(grid,{childList:true});
  new MutationObserver(scheduleModal).observe(modal,{childList:true});
  idle(loadGrades,700);
})();