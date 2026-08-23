(()=>{
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const matrix=document.getElementById('rivalryMatrix');
  const focus=document.getElementById('rivalryFocus');
  const select=document.getElementById('rivalryTeam');
  const status=document.getElementById('rivalryStatus');
  const TEAMS=[
    ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
  ].map(([slug,name,abbr])=>({slug,name,abbr}));
  const norm=(v='')=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const teamByName=new Map(TEAMS.map(team=>[norm(team.name),team]));
  let payload=null;

  function edge(record){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}
  function seriesClass(record={wins:0,losses:0}){const w=Number(record.wins||0),l=Number(record.losses||0);if(w+l===0)return 'no-meeting';if(w>l)return 'series-win';if(l>w)return 'series-loss';return 'series-even';}
  function record(a,b){return payload?.matrix?.[a]?.[b]||{wins:0,losses:0};}
  function isCupFinal(game={}){const date=String(game.date||game.startTimeUtc||'').slice(0,10);if(date!=='2026-06-30')return false;const pair=[norm(game.homeTeam),norm(game.awayTeam)].sort().join('|');return pair===[norm('Las Vegas Aces'),norm('New York Liberty')].sort().join('|');}

  function payloadFromStats(stats={}){
    const matrix={};
    const rows={};
    for(const team of TEAMS)matrix[team.slug]={};
    const games=(Array.isArray(stats.pastGames)?stats.pastGames:Array.isArray(stats.recentResults)?stats.recentResults:[]).filter(game=>!isCupFinal(game));
    for(const game of games){
      const home=teamByName.get(norm(game.homeTeam));
      const away=teamByName.get(norm(game.awayTeam));
      const hs=Number(game.homeScore),as=Number(game.awayScore);
      if(!home||!away||!Number.isFinite(hs)||!Number.isFinite(as)||hs===as)continue;
      const homeRecord=matrix[home.slug][away.slug]||{wins:0,losses:0};
      const awayRecord=matrix[away.slug][home.slug]||{wins:0,losses:0};
      if(hs>as){homeRecord.wins++;awayRecord.losses++;}else{homeRecord.losses++;awayRecord.wins++;}
      matrix[home.slug][away.slug]=homeRecord;
      matrix[away.slug][home.slug]=awayRecord;
    }
    for(const team of TEAMS){
      rows[team.slug]=TEAMS.filter(opponent=>opponent.slug!==team.slug).map(opponent=>{
        const r=matrix[team.slug][opponent.slug]||{wins:0,losses:0};
        return {opponent,season:{...r,edge:edge(r)}};
      });
    }
    const seasonGameCount=Math.round(TEAMS.reduce((sum,team)=>sum+Object.values(matrix[team.slug]).reduce((s,r)=>s+r.wins+r.losses,0),0)/2);
    return {season:2026,teams:TEAMS,matrix,rows,updatedAt:stats.updatedAt||new Date().toISOString(),coverage:{seasonGameCount},source:'Live Stats completed-game fallback',fallback:true};
  }

  function focusTable(slug){
    if(slug==='all'){focus.innerHTML='';return;}
    const team=payload.teams.find(t=>t.slug===slug),rows=payload.rows?.[slug]||[];
    focus.innerHTML=`<section class="rivalry-focus"><div class="page-heading"><p class="kicker">${esc(team?.abbr||'TEAM')} SERIES</p><h2>${esc(team?.name||'Team')} vs. everybody</h2></div><div class="rivalry-focus-table"><div class="rivalry-row head"><span>Opponent</span><span>2026</span><span>Edge</span></div>${rows.map(r=>{const cls=seriesClass(r.season);return `<a class="rivalry-row" href="/team.html?team=${encodeURIComponent(r.opponent.slug)}"><strong>${esc(r.opponent.name)}</strong><span class="${cls}">${r.season.wins}-${r.season.losses}</span><span class="${cls}">${esc(r.season.edge)}</span></a>`;}).join('')}</div></section>`;
  }

  function render(){
    const teams=payload.teams||[];
    matrix.innerHTML=`<div class="rivalry-matrix"><div class="rivalry-matrix-row head"><span>TEAM</span>${teams.map(t=>`<span title="${esc(t.name)}">${esc(t.abbr)}</span>`).join('')}</div>${teams.map(team=>`<div class="rivalry-matrix-row"><a href="/team.html?team=${encodeURIComponent(team.slug)}"><strong>${esc(team.abbr)}</strong><small>${esc(team.name)}</small></a>${teams.map(opp=>{if(team.slug===opp.slug)return '<span class="self">—</span>';const r=record(team.slug,opp.slug);return `<span class="${seriesClass(r)}" title="${esc(team.name)} vs ${esc(opp.name)}">${r.wins}-${r.losses}</span>`;}).join('')}</div>`).join('')}</div>`;
    focusTable(select.value||'all');
  }

  async function load(){
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
      if(!response.ok||stats.error)throw new Error(stats.error||primaryError?.message||'Rivalry feed unavailable');
      payload=payloadFromStats(stats);
      if(!Number(payload.coverage?.seasonGameCount))throw new Error(primaryError?.message||'No completed games were available for the rivalry board.');
    }

    select.innerHTML='<option value="all">Full league matrix</option>'+payload.teams.map(t=>`<option value="${esc(t.slug)}">${esc(t.name)}</option>`).join('');
    select.addEventListener('change',()=>focusTable(select.value));
    render();
    const checked=new Date(payload.updatedAt||Date.now()).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    const games=Number(payload.coverage?.seasonGameCount||0);
    status.textContent=`2026 regular season · ${games} completed games connected · checked ${checked}${payload.fallback?' · Live Stats fallback active':''}`;
  }

  load().catch(error=>{
    matrix.innerHTML=`<div class="page-note"><strong>Rivalry board temporarily unavailable.</strong><p>${esc(error.message||'Try again shortly.')}</p></div>`;
    status.textContent='The rivalry board could not connect to a verified completed-game feed.';
  });
})();
