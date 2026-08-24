(()=>{
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const matrix=document.getElementById('rivalryMatrix');
  const focus=document.getElementById('rivalryFocus');
  const select=document.getElementById('rivalryTeam');
  const status=document.getElementById('rivalryStatus');
  const modeToggle=document.getElementById('rivalryModeToggle');
  const TEAMS=[
    ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
  ].map(([slug,name,abbr])=>({slug,name,abbr}));
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const teamByName=new Map(TEAMS.map(team=>[norm(team.name),team]));
  let current=null,history=null,allTimeMatrix=null,historyPromise=null,historyError='',mode='season';

  function edge(record={wins:0,losses:0}){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}
  function seriesClass(record={wins:0,losses:0}){const w=Number(record.wins||0),l=Number(record.losses||0);if(w+l===0)return 'no-meeting';if(w>l)return 'series-win';if(l>w)return 'series-loss';return 'series-even';}
  function addRecords(a={wins:0,losses:0},b={wins:0,losses:0}){return {wins:Number(a.wins||0)+Number(b.wins||0),losses:Number(a.losses||0)+Number(b.losses||0)};}
  function record(a,b){return mode==='allTime'?(allTimeMatrix?.[a]?.[b]||{wins:0,losses:0}):(current?.matrix?.[a]?.[b]||{wins:0,losses:0});}
  function isCupFinal(game={}){const date=String(game.date||game.startTimeUtc||'').slice(0,10);if(date!=='2026-06-30')return false;const pair=[norm(game.homeTeam),norm(game.awayTeam)].sort().join('|');return pair===[norm('Las Vegas Aces'),norm('New York Liberty')].sort().join('|');}

  function payloadFromStats(stats={}){
    const m={},rows={};for(const team of TEAMS)m[team.slug]={};
    const games=(Array.isArray(stats.pastGames)?stats.pastGames:Array.isArray(stats.recentResults)?stats.recentResults:[]).filter(game=>!isCupFinal(game));
    for(const game of games){const home=teamByName.get(norm(game.homeTeam)),away=teamByName.get(norm(game.awayTeam)),hs=Number(game.homeScore),as=Number(game.awayScore);if(!home||!away||!Number.isFinite(hs)||!Number.isFinite(as)||hs===as)continue;const hr=m[home.slug][away.slug]||{wins:0,losses:0},ar=m[away.slug][home.slug]||{wins:0,losses:0};if(hs>as){hr.wins++;ar.losses++;}else{hr.losses++;ar.wins++;}m[home.slug][away.slug]=hr;m[away.slug][home.slug]=ar;}
    for(const team of TEAMS)rows[team.slug]=TEAMS.filter(o=>o.slug!==team.slug).map(opponent=>{const r=m[team.slug][opponent.slug]||{wins:0,losses:0};return {opponent,season:{...r,edge:edge(r)}};});
    const count=Math.round(TEAMS.reduce((sum,team)=>sum+Object.values(m[team.slug]).reduce((s,r)=>s+r.wins+r.losses,0),0)/2);
    return {season:2026,teams:TEAMS,matrix:m,rows,updatedAt:stats.updatedAt||new Date().toISOString(),coverage:{seasonGameCount:count},fallback:true};
  }

  function buildAllTime(){
    allTimeMatrix={};for(const team of TEAMS)allTimeMatrix[team.slug]={};
    for(const team of TEAMS)for(const opponent of TEAMS){if(team.slug===opponent.slug)continue;allTimeMatrix[team.slug][opponent.slug]={...(history?.allTimeMatrix?.[team.slug]?.[opponent.slug]||{wins:0,losses:0})};}
    const includes2026=Array.isArray(history?.coverage?.completedYears)&&history.coverage.completedYears.includes(2026);
    if(!includes2026&&current?.matrix){for(const team of TEAMS)for(const opponent of TEAMS){if(team.slug===opponent.slug)continue;allTimeMatrix[team.slug][opponent.slug]=addRecords(allTimeMatrix[team.slug][opponent.slug],current.matrix?.[team.slug]?.[opponent.slug]);}}
  }

  function focusTable(slug){
    if(slug==='all'){focus.innerHTML='';return;}
    const team=TEAMS.find(t=>t.slug===slug),labelText=mode==='allTime'?'All time':'2026';
    const rows=TEAMS.filter(o=>o.slug!==slug).map(opponent=>({opponent,record:record(slug,opponent.slug)}));
    focus.innerHTML=`<section class="rivalry-focus"><div class="page-heading"><p class="kicker">${esc(team?.abbr||'TEAM')} SERIES · ${esc(labelText.toUpperCase())}</p><h2>${esc(team?.name||'Team')} vs. everybody</h2></div><div class="rivalry-focus-table"><div class="rivalry-row head"><span>Opponent</span><span>${esc(labelText)}</span><span>Edge</span></div>${rows.map(r=>{const cls=seriesClass(r.record);return `<a class="rivalry-row" href="/team.html?team=${encodeURIComponent(r.opponent.slug)}"><strong>${esc(r.opponent.name)}</strong><span class="${cls}">${r.record.wins}-${r.record.losses}</span><span class="${cls}">${esc(edge(r.record))}</span></a>`;}).join('')}</div></section>`;
  }

  function updateStatus(){
    const checked=new Date((mode==='allTime'?history?.updatedAt:current?.updatedAt)||Date.now()).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    if(mode==='allTime'){
      const allGames=Number(history?.coverage?.allGameCount||0)+(Array.isArray(history?.coverage?.completedYears)&&history.coverage.completedYears.includes(2026)?0:Number(current?.coverage?.seasonGameCount||0));
      const years=Number(history?.coverage?.completedYears?.length||0)+(Array.isArray(history?.coverage?.completedYears)&&history.coverage.completedYears.includes(2026)?0:1);
      const missing=Array.isArray(history?.coverage?.missingYears)?history.coverage.missingYears:[];
      status.textContent=`All-time regular season · ${allGames} games connected across ${years} seasons · checked ${checked}${missing.length?` · partial archive, missing ${missing.join(', ')}`:''}`;
    }else{
      status.textContent=`2026 regular season · ${Number(current?.coverage?.seasonGameCount||0)} completed games connected · checked ${checked}${current?.fallback?' · Live Stats fallback active':''}${historyError?' · all-time archive can be retried with the All time button':''}`;
    }
  }

  function render(){
    const teams=TEAMS,labelText=mode==='allTime'?'All time':'2026';
    matrix.innerHTML=`<div class="rivalry-board-label"><strong>${labelText}</strong><span>${mode==='allTime'?'Regular-season franchise series since 1997':'Current regular-season series'}</span></div><div class="rivalry-matrix"><div class="rivalry-matrix-row head"><span>TEAM</span>${teams.map(t=>`<span title="${esc(t.name)}">${esc(t.abbr)}</span>`).join('')}</div>${teams.map(team=>`<div class="rivalry-matrix-row"><a href="/team.html?team=${encodeURIComponent(team.slug)}"><strong>${esc(team.abbr)}</strong><small>${esc(team.name)}</small></a>${teams.map(opp=>{if(team.slug===opp.slug)return '<span class="self">—</span>';const r=record(team.slug,opp.slug);return `<span class="${seriesClass(r)}" title="${esc(team.name)} vs ${esc(opp.name)} · ${esc(labelText)}">${r.wins}-${r.losses}</span>`;}).join('')}</div>`).join('')}</div>`;
    focusTable(select.value||'all');updateStatus();
    modeToggle?.querySelectorAll('button[data-mode]').forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));
  }

  async function loadCurrent(){
    let primaryError=null;
    try{const response=await fetch(`/api/rivalry-current?season=2026&v=20260823-1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});const data=await response.json().catch(()=>({}));if(!response.ok||!Number(data?.coverage?.seasonGameCount))throw new Error(data.error||'Current rivalry feed returned no completed games.');return data;}
    catch(error){primaryError=error;const response=await fetch(`/api/stats?season=2026&headToHead=1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});const stats=await response.json().catch(()=>({}));if(!response.ok||stats.error)throw new Error(stats.error||primaryError?.message||'Rivalry feed unavailable');const data=payloadFromStats(stats);if(!Number(data.coverage?.seasonGameCount))throw new Error(primaryError?.message||'No completed games were available for the rivalry board.');return data;}
  }

  async function ensureHistory(force=false){
    if(history&&!force)return history;
    if(historyPromise&&!force)return historyPromise;
    historyPromise=(async()=>{
      const response=await fetch(`/api/rivalries?season=2026&v=20260824-v7&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!Number(data?.coverage?.allGameCount))throw new Error(data.error||'Historical rivalry archive unavailable');
      history=data;historyError='';buildAllTime();return data;
    })();
    try{return await historyPromise;}catch(error){historyError=error.message||'Historical rivalry archive unavailable';throw error;}finally{historyPromise=null;}
  }

  async function chooseMode(nextMode){
    if(nextMode!=='allTime'){mode='season';render();return;}
    if(!history){
      status.textContent='Loading all-time regular-season rivalry history…';
      try{await ensureHistory(true);}catch(error){mode='season';render();status.textContent=`2026 board is live. All-time archive could not load yet: ${error.message||'try again shortly'}. Click All time to retry.`;return;}
    }
    mode='allTime';render();
  }

  async function load(){
    current=await loadCurrent();
    select.innerHTML='<option value="all">Full league matrix</option>'+TEAMS.map(t=>`<option value="${esc(t.slug)}">${esc(t.name)}</option>`).join('');
    select.addEventListener('change',()=>focusTable(select.value));
    modeToggle?.addEventListener('click',event=>{const button=event.target.closest('button[data-mode]');if(!button)return;chooseMode(button.dataset.mode==='allTime'?'allTime':'season');});
    render();
    // Historical data loads independently. A history outage can never blank the working 2026 board again.
    ensureHistory().then(()=>{if(mode==='allTime')render();}).catch(()=>{updateStatus();});
  }

  load().catch(error=>{matrix.innerHTML=`<div class="page-note"><strong>2026 rivalry board temporarily unavailable.</strong><p>${esc(error.message||'Try again shortly.')}</p></div>`;status.textContent='The current-season rivalry board could not connect to a completed-game feed.';});
})();
