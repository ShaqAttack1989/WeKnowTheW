(()=>{
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const teamSlug=new URLSearchParams(location.search).get('team')||'';
  if(!teamSlug||teamSlug==='cleveland-sirens')return;

  const TEAMS=[
    ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
  ].map(([slug,name,abbr])=>({slug,name,abbr}));
  const byName=new Map(TEAMS.map(team=>[norm(team.name),team]));

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/rivalry.css?v=20260823-v8';
  document.head.appendChild(css);

  function edge(record={wins:0,losses:0}){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}
  function seriesClass(record={wins:0,losses:0}){const wins=Number(record.wins||0),losses=Number(record.losses||0);if(wins+losses===0)return 'no-meeting';if(wins>losses)return 'series-win';if(losses>wins)return 'series-loss';return 'series-even';}
  function rowClass(record={wins:0,losses:0}){const cls=seriesClass(record);return cls==='series-win'?'row-win':cls==='series-loss'?'row-loss':cls==='series-even'?'row-even':'row-no-meeting';}
  function addRecords(a={wins:0,losses:0},b={wins:0,losses:0}){return {wins:Number(a.wins||0)+Number(b.wins||0),losses:Number(a.losses||0)+Number(b.losses||0)};}
  function lossPct(record={wins:0,losses:0}){const total=Number(record.wins||0)+Number(record.losses||0);return total?Math.round(Number(record.losses||0)/total*100):0;}
  function label(p){if(p<=35)return 'You own this stop';if(p<=50)return 'Light traffic';if(p<=60)return 'Rush hour';if(p<=70)return 'Uphill transfer';return 'Service disruption';}
  function isCupFinal(game={}){const date=String(game.date||game.startTimeUtc||'').slice(0,10);if(date!=='2026-06-30')return false;const pair=[norm(game.homeTeam),norm(game.awayTeam)].sort().join('|');return pair===[norm('Las Vegas Aces'),norm('New York Liberty')].sort().join('|');}

  function ensureSection(){
    let section=document.getElementById('head-to-head');
    if(section)return section;
    const live=document.getElementById('whats-happening');
    if(!live)return null;
    section=document.createElement('section');
    section.className='team-content team-rivalry-section';
    section.id='head-to-head';
    section.innerHTML='<div class="team-section-heading"><p class="kicker">NO LOVE LOST · HEAD TO HEAD</p><h2>Who has the upper hand?</h2><p>See the 2026 season series beside the all-time regular-season franchise line. Relocations stay connected to the current franchise, while expansion teams begin with their current club.</p></div><div id="teamRivalryBody" class="team-rivalry-table"><div class="page-note"><strong>Loading head-to-head records…</strong><p>Connecting the current season and the historical rivalry archive.</p></div></div><div class="dream-source-row"><a href="/no-love-lost.html">Open the league rivalry board →</a><a href="/franchise-family-tree.html">Franchise family tree →</a></div>';
    live.insertAdjacentElement('afterend',section);
    const nav=document.querySelector('.team-local-nav-inner');
    if(nav&&!nav.querySelector('a[href="#head-to-head"]')){const a=document.createElement('a');a.href='#head-to-head';a.textContent='Head to head';nav.querySelector('a[href="#whats-happening"]')?.insertAdjacentElement('afterend',a);}
    return section;
  }

  function payloadFromStats(stats={}){
    const matrix={};TEAMS.forEach(team=>matrix[team.slug]={});
    const games=(Array.isArray(stats.pastGames)?stats.pastGames:Array.isArray(stats.recentResults)?stats.recentResults:[]).filter(game=>!isCupFinal(game));
    for(const game of games){
      const home=byName.get(norm(game.homeTeam)),away=byName.get(norm(game.awayTeam));
      const hs=Number(game.homeScore),as=Number(game.awayScore);
      if(!home||!away||!Number.isFinite(hs)||!Number.isFinite(as)||hs===as)continue;
      const hr=matrix[home.slug][away.slug]||{wins:0,losses:0},ar=matrix[away.slug][home.slug]||{wins:0,losses:0};
      if(hs>as){hr.wins++;ar.losses++;}else{hr.losses++;ar.wins++;}
      matrix[home.slug][away.slug]=hr;matrix[away.slug][home.slug]=ar;
    }
    const rows={};
    for(const team of TEAMS)rows[team.slug]=TEAMS.filter(o=>o.slug!==team.slug).map(opponent=>{const r=matrix[team.slug][opponent.slug]||{wins:0,losses:0};return {opponent,season:{...r,edge:edge(r)}};});
    const count=Math.round(TEAMS.reduce((sum,team)=>sum+Object.values(matrix[team.slug]).reduce((s,r)=>s+r.wins+r.losses,0),0)/2);
    return {rows,coverage:{seasonGameCount:count},updatedAt:stats.updatedAt||new Date().toISOString(),fallback:true};
  }

  async function currentPayload(){
    let primaryError=null;
    try{
      const response=await fetch(`/api/rivalry-current?season=2026&v=20260823-1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!Number(data?.coverage?.seasonGameCount))throw new Error(data.error||'Current rivalry feed returned no completed games.');
      return data;
    }catch(error){
      primaryError=error;
      const response=await fetch(`/api/stats?season=2026&headToHead=1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const stats=await response.json().catch(()=>({}));
      if(!response.ok||stats.error)throw new Error(stats.error||primaryError.message||'Rivalry feed unavailable');
      const data=payloadFromStats(stats);
      if(!Number(data.coverage?.seasonGameCount))throw new Error(primaryError.message||'No completed games were available for this team.');
      return data;
    }
  }

  async function historyPayload(){
    const response=await fetch(`/api/rivalries?season=2026&team=${encodeURIComponent(teamSlug)}&v=20260823-v5`,{headers:{Accept:'application/json'}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!Number(data?.coverage?.allGameCount))throw new Error(data.error||'Historical rivalry archive unavailable');
    return data;
  }

  function mergeRows(current,history){
    const currentRows=current.rows?.[teamSlug]||[];
    const historyRows=Array.isArray(history?.rows)?history.rows:history?.rows?.[teamSlug]||[];
    const historyByOpponent=new Map(historyRows.map(row=>[row.opponent?.slug,row]));
    const includes2026=Array.isArray(history?.coverage?.completedYears)&&history.coverage.completedYears.includes(2026);
    return currentRows.map(row=>{
      const old=historyByOpponent.get(row.opponent.slug);
      let allTime=old?.allTime?{wins:Number(old.allTime.wins||0),losses:Number(old.allTime.losses||0)}:{wins:0,losses:0};
      if(!includes2026)allTime=addRecords(allTime,row.season);
      return {...row,allTime:{...allTime,edge:edge(allTime)},strugglePct:lossPct(allTime)};
    });
  }

  function render(rows=[],currentCoverage={},history=null,fallback=false){
    const body=document.getElementById('teamRivalryBody');
    if(!body)return;
    if(!rows.length){body.innerHTML='<div class="page-note"><strong>No rivalry rows were returned.</strong><p>This team did not match the current rivalry feed.</p></div>';return;}
    body.innerHTML=`<div class="team-rivalry-row head"><span>Opponent</span><span>2026</span><span>2026 edge</span><span>All time</span><span>All-time edge</span><span>Struggle meter</span></div>${rows.map(r=>{
      const seasonCls=seriesClass(r.season),allCls=seriesClass(r.allTime),row=rowClass(r.season),pct=lossPct(r.allTime),allMeetings=Number(r.allTime.wins||0)+Number(r.allTime.losses||0);
      const meterText=allMeetings?`${pct}% · ${esc(label(pct))} · all time`:'No all-time meetings';
      return `<div class="team-rivalry-row ${row}"><a class="team-rivalry-opponent" href="/team.html?team=${encodeURIComponent(r.opponent.slug)}"><strong>${esc(r.opponent.name)}</strong><span>→</span></a><strong><span class="series-pill ${seasonCls}">${r.season.wins}-${r.season.losses}</span></strong><span><span class="series-edge-pill ${seasonCls}">${esc(r.season.edge||edge(r.season))}</span></span><strong><span class="series-pill ${allCls}">${r.allTime.wins}-${r.allTime.losses}</span></strong><span><span class="series-edge-pill ${allCls}">${esc(r.allTime.edge||edge(r.allTime))}</span></span><div class="struggle-meter"><div class="struggle-track" title="${allMeetings?`${pct}% of all-time regular-season meetings are losses`:'No all-time meetings'}"><div class="struggle-fill" style="width:${allMeetings?Math.max(0,Math.min(100,pct)):0}%"></div></div><small>${meterText}</small></div></div>`;
    }).join('')}`;
    const games=Number(currentCoverage.seasonGameCount||0),allGames=Number(history?.coverage?.allGameCount||0),missing=Array.isArray(history?.coverage?.missingYears)?history.coverage.missingYears:[];
    const archiveNote=history?`${allGames} historical regular-season games connected across ${Number(history.coverage?.completedYears?.length||0)} seasons${missing.length?` · partial archive, missing ${missing.join(', ')}`:''}.`:'Historical archive could not be connected on this load.';
    body.insertAdjacentHTML('beforeend',`<div class="page-note"><strong>${games} completed 2026 regular-season games connected.</strong><p>${fallback?'Live Stats fallback is active. ':''}${esc(archiveNote)} Green means the selected team leads that series, red means it trails, yellow means tied, and gray means no meetings.</p></div>`);
  }

  const section=ensureSection();
  if(!section)return;

  (async()=>{
    const current=await currentPayload();
    let history=null;
    try{history=await historyPayload();}catch(error){console.warn('Historical rivalry archive:',error);}
    const rows=history?mergeRows(current,history):(current.rows?.[teamSlug]||[]).map(row=>({...row,allTime:{wins:0,losses:0,edge:'No meetings'}}));
    render(rows,current.coverage||{},history,Boolean(current.fallback));
  })().catch(error=>{
    const body=document.getElementById('teamRivalryBody');
    if(body)body.innerHTML=`<div class="page-note"><strong>Rivalry records are temporarily unavailable.</strong><p>${esc(error.message||'Try again shortly.')}</p><a href="/no-love-lost.html">Open the league rivalry board →</a></div>`;
  });
})();