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
  css.href='/rivalry.css?v=20260823-v6';
  document.head.appendChild(css);

  function edge(record={wins:0,losses:0}){
    if(record.wins>record.losses)return 'Leading';
    if(record.losses>record.wins)return 'Trailing';
    return record.wins+record.losses?'Even':'No meetings';
  }
  function lossPct(record={wins:0,losses:0}){
    const total=Number(record.wins||0)+Number(record.losses||0);
    return total?Math.round(Number(record.losses||0)/total*100):0;
  }
  function label(p){
    if(p<=35)return 'You own this stop';
    if(p<=50)return 'Light traffic';
    if(p<=60)return 'Rush hour';
    if(p<=70)return 'Uphill transfer';
    return 'Service disruption';
  }
  function isCupFinal(game={}){
    const date=String(game.date||game.startTimeUtc||'').slice(0,10);
    if(date!=='2026-06-30')return false;
    const pair=[norm(game.homeTeam),norm(game.awayTeam)].sort().join('|');
    return pair===[norm('Las Vegas Aces'),norm('New York Liberty')].sort().join('|');
  }

  function ensureSection(){
    let section=document.getElementById('head-to-head');
    if(section)return section;
    const live=document.getElementById('whats-happening');
    if(!live)return null;
    section=document.createElement('section');
    section.className='team-content team-rivalry-section';
    section.id='head-to-head';
    section.innerHTML='<div class="team-section-heading"><p class="kicker">NO LOVE LOST · HEAD TO HEAD</p><h2>Who has the upper hand?</h2><p>Verified 2026 regular-season series from the same completed-game feed powering the league rivalry board. Historical all-time lines will return only when that archive is verified.</p></div><div id="teamRivalryBody" class="team-rivalry-table"><div class="page-note"><strong>Loading head-to-head records…</strong><p>Connecting this team to the current 2026 rivalry board.</p></div></div><div class="dream-source-row"><a href="/no-love-lost.html">Open the league rivalry board →</a><a href="/games.html">Open Games →</a></div>';
    live.insertAdjacentElement('afterend',section);
    const nav=document.querySelector('.team-local-nav-inner');
    if(nav&&!nav.querySelector('a[href="#head-to-head"]')){
      const a=document.createElement('a');a.href='#head-to-head';a.textContent='Head to head';
      nav.querySelector('a[href="#whats-happening"]')?.insertAdjacentElement('afterend',a);
    }
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

  function render(rows=[],coverage={},fallback=false){
    const body=document.getElementById('teamRivalryBody');
    if(!body)return;
    if(!rows.length){body.innerHTML='<div class="page-note"><strong>No rivalry rows were returned.</strong><p>This team did not match the current rivalry feed.</p></div>';return;}
    body.innerHTML=`<div class="team-rivalry-row head"><span>Opponent</span><span>2026</span><span>2026 edge</span><span>All time</span><span>All-time edge</span><span>Struggle meter</span></div>${rows.map(r=>{const pct=lossPct(r.season);return `<div class="team-rivalry-row"><a class="team-rivalry-opponent" href="/team.html?team=${encodeURIComponent(r.opponent.slug)}"><strong>${esc(r.opponent.name)}</strong><span>→</span></a><strong>${r.season.wins}-${r.season.losses}</strong><span>${esc(r.season.edge||edge(r.season))}</span><strong>—</strong><span>Archive rebuild</span><div class="struggle-meter"><div class="struggle-track" title="${pct}% of 2026 meetings are losses"><div class="struggle-fill" style="width:${Math.max(0,Math.min(100,pct))}%"></div></div><small>${pct}% · ${esc(label(pct))} · 2026 only</small></div></div>`;}).join('')}`;
    const games=Number(coverage.seasonGameCount||0);
    body.insertAdjacentHTML('beforeend',`<div class="page-note"><strong>${games} completed 2026 regular-season games connected.</strong><p>${fallback?'Live Stats fallback is active. ':''}The all-time archive is intentionally withheld here until its historical source is reliable, rather than showing false 0-0 records.</p></div>`);
  }

  const section=ensureSection();
  if(!section)return;

  (async()=>{
    let payload=null;
    let primaryError=null;
    try{
      const response=await fetch(`/api/rivalry-current?season=2026&v=20260823-1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!Number(data?.coverage?.seasonGameCount))throw new Error(data.error||'Current rivalry feed returned no completed games.');
      payload=data;
    }catch(error){
      primaryError=error;
      const response=await fetch(`/api/stats?season=2026&headToHead=1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      const stats=await response.json().catch(()=>({}));
      if(!response.ok||stats.error)throw new Error(stats.error||primaryError.message||'Rivalry feed unavailable');
      payload=payloadFromStats(stats);
      if(!Number(payload.coverage?.seasonGameCount))throw new Error(primaryError.message||'No completed games were available for this team.');
    }
    render(payload.rows?.[teamSlug]||[],payload.coverage||{},Boolean(payload.fallback));
  })().catch(error=>{
    const body=document.getElementById('teamRivalryBody');
    if(body)body.innerHTML=`<div class="page-note"><strong>Rivalry records are temporarily unavailable.</strong><p>${esc(error.message||'Try again shortly.')}</p><a href="/no-love-lost.html">Open the league rivalry board →</a></div>`;
  });
})();