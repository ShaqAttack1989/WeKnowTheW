(()=>{
  if(window.WGlobalScoreboard)return;

  const EASTERN='America/New_York';
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const norm=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const pair=game=>[game?.homeTeam||'',game?.awayTeam||''].map(norm).sort().join('|');
  const stateRank=game=>game?.completed||String(game?.state||'').toLowerCase()==='post'||/final/i.test(String(game?.status||''))?3:String(game?.state||'').toLowerCase()==='in'?2:1;
  const teamCode=name=>text(name).split(/\s+/).filter(Boolean).map(part=>part[0]).join('').slice(0,3).toUpperCase()||'W';
  let stats={},competition={},livePayload={},badges=new Map(),baseLoading=false,liveLoading=false;

  function fetchJson(url){
    const joiner=url.includes('?')?'&':'?';
    return fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||`${url} returned ${response.status}`);
      return payload;
    });
  }
  function easternDate(value=new Date()){
    const d=value instanceof Date?value:new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:EASTERN,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const get=type=>parts.find(part=>part.type===type)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function gameInstant(game={}){
    const direct=String(game.startTimeUtc||game.timestamp||game.strTimestamp||'').trim();
    if(direct){const parsed=new Date(direct);if(!Number.isNaN(parsed.getTime()))return parsed;}
    if(game.date){const parsed=new Date(`${String(game.date).slice(0,10)}T12:00:00-04:00`);if(!Number.isNaN(parsed.getTime()))return parsed;}
    return null;
  }
  function gameDate(game={}){return String(game.date||easternDate(gameInstant(game))).slice(0,10);}
  function gameTime(game={}){
    const instant=gameInstant(game);
    return instant?new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,hour:'numeric',minute:'2-digit'}).format(instant):'TBD';
  }
  function gameDay(game={}){
    const instant=gameInstant(game)||new Date(`${gameDate(game)}T12:00:00-04:00`);
    return Number.isNaN(instant.getTime())?'WNBA':new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,month:'short',day:'numeric'}).format(instant);
  }
  function bucket(game={}){const rank=stateRank(game);return rank===3?'past':rank===2?'live':'upcoming';}
  function status(game={}){
    const mode=bucket(game),raw=text(game.status||game.statusText||'');
    if(mode==='past')return 'FINAL';
    if(mode==='live')return raw||'LIVE';
    const tip=gameTime(game);
    return tip==='TBD'?'TBD':`${tip} ET`;
  }
  function mergeGame(base={},fresh={}){
    const updateWins=stateRank(fresh)>=stateRank(base),winner=updateWins?fresh:base,other=updateWins?base:fresh;
    return {...other,...winner,startTimeUtc:winner.startTimeUtc||other.startTimeUtc||'',date:winner.date||other.date||'',broadcasts:Array.isArray(winner.broadcasts)&&winner.broadcasts.length?winner.broadcasts:(other.broadcasts||[])};
  }
  function mergeSlate(...lists){
    const map=new Map();
    lists.flat().filter(Boolean).forEach(game=>{
      if(!game.homeTeam||!game.awayTeam)return;
      const key=`${gameDate(game)}|${pair(game)}`,current=map.get(key);
      map.set(key,current?mergeGame(current,game):game);
    });
    return [...map.values()];
  }
  function badgeMarkup(name){
    const src=badges.get(norm(name));
    return src?`<img src="${safe(src)}" alt="" loading="eager" decoding="async">`:`<i class="w-score-team-fallback" aria-hidden="true">${safe(teamCode(name))}</i>`;
  }
  function score(game={},side){
    if(bucket(game)==='upcoming')return '';
    const value=game[`${side}Score`]??game?.[side]?.score;
    return value!==null&&value!==undefined&&Number.isFinite(Number(value))?String(value):'';
  }
  function card(game={}){
    const away=text(game.awayTeam||game.away?.name||'TBD'),home=text(game.homeTeam||game.home?.name||'TBD'),mode=bucket(game);
    return `<a class="w-score-game is-${mode}" href="/games.html" aria-label="${safe(away)} at ${safe(home)}, ${safe(status(game))}">
      <div class="w-score-game-top"><span>${safe(gameDay(game))}</span><b>${safe(status(game))}</b></div>
      <div class="w-score-game-team">${badgeMarkup(away)}<span>${safe(away)}</span><strong>${safe(score(game,'away'))}</strong></div>
      <div class="w-score-game-team">${badgeMarkup(home)}<span>${safe(home)}</span><strong>${safe(score(game,'home'))}</strong></div>
    </a>`;
  }
  function selectedSlate(){
    const playoff=competition?.playoffs?.games||[];
    const current=livePayload.todayGames||livePayload.games||[];
    const regular=[...(stats.liveGames||[]),...(stats.upcomingGames||[]),...(stats.pastGames||stats.recentGames||[])];
    const merged=mergeSlate(playoff,regular,current),today=easternDate();
    const todayGames=merged.filter(game=>gameDate(game)===today);
    if(todayGames.length)return todayGames.sort((a,b)=>(gameInstant(a)?.getTime()||0)-(gameInstant(b)?.getTime()||0));
    const now=Date.now(),future=merged.filter(game=>(gameInstant(game)?.getTime()||0)>=now&&stateRank(game)<3).sort((a,b)=>gameInstant(a)-gameInstant(b));
    if(future.length){const nextDate=gameDate(future[0]);return future.filter(game=>gameDate(game)===nextDate).slice(0,6);}
    return merged.filter(game=>stateRank(game)===3).sort((a,b)=>(gameInstant(b)?.getTime()||0)-(gameInstant(a)?.getTime()||0)).slice(0,5);
  }
  function render(){
    const host=document.getElementById('wGlobalScoreGames');
    if(!host)return;
    const games=selectedSlate();
    host.innerHTML=games.length?games.map(card).join(''):'<a class="w-score-game" href="/games.html"><div class="w-score-game-top"><span>WNBA</span><b>SCHEDULE</b></div><div class="w-score-game-team"><i class="w-score-team-fallback">W</i><span>Open the full games board</span><strong>→</strong></div></a>';
  }
  function install(){
    const nav=document.getElementById('navLinks')?.closest('.nav')||document.querySelector('header .nav');
    const header=nav?.closest('header');
    if(!nav||!header)return false;
    let scorebar=document.querySelector('.w-home-scorebar');
    if(!scorebar){scorebar=document.createElement('section');scorebar.className='w-home-scorebar';header.before(scorebar);}
    scorebar.dataset.globalScoreboard='true';
    scorebar.setAttribute('aria-label','WNBA game scoreboard');
    scorebar.innerHTML=`<div class="w-home-scorebar-inner"><a class="w-scorebar-label" href="/games.html"><span>AROUND THE W</span><strong>SCOREBOARD</strong></a><div class="w-scorebar-games" id="wGlobalScoreGames" aria-live="polite"><a class="w-score-game" href="/games.html"><div class="w-score-game-top"><span>WNBA</span><b>LOADING</b></div><div class="w-score-game-team"><i class="w-score-team-fallback">W</i><span>Checking today’s slate…</span><strong></strong></div></a></div><a class="w-scorebar-full" href="/games.html">FULL<br>GAMES →</a></div>`;
    let navWrap=document.querySelector('.w-home-nav-sticky');
    if(!navWrap){navWrap=document.createElement('div');navWrap.className='w-home-nav-sticky';scorebar.after(navWrap);}
    navWrap.setAttribute('aria-label','Sticky site navigation');
    if(!navWrap.contains(nav))navWrap.appendChild(nav);
    document.body.classList.add('has-global-scoreboard');
    const setHeight=()=>document.documentElement.style.setProperty('--w-home-scorebar-height',`${Math.ceil(scorebar.getBoundingClientRect().height||72)}px`);
    setHeight();
    if(!scorebar.dataset.heightObserver){scorebar.dataset.heightObserver='true';if('ResizeObserver' in window)new ResizeObserver(setHeight).observe(scorebar);else window.addEventListener('resize',setHeight,{passive:true});}
    return true;
  }
  async function refreshBase(){
    if(baseLoading)return;baseLoading=true;
    try{
      const [statsResult,competitionResult,teamsResult]=await Promise.allSettled([fetchJson('/api/stats?season=2026'),fetchJson('/api/competition?season=2026'),fetchJson('/api/teams?currentLogos=20260927')]);
      if(statsResult.status==='fulfilled')stats=statsResult.value;
      if(competitionResult.status==='fulfilled')competition=competitionResult.value;
      if(teamsResult.status==='fulfilled'){
        const next=new Map();
        (teamsResult.value.teams||[]).forEach(team=>{const src=String(team?.badge||team?.logo||'').trim();if(team?.name&&/^(?:\/|https?:\/\/)/i.test(src))next.set(norm(team.name),src);});
        if(next.size)badges=next;
      }
      render();
    }finally{baseLoading=false;}
  }
  async function refreshLive(){
    if(liveLoading)return;liveLoading=true;
    try{livePayload=await fetchJson('/api/live-games');render();}catch{}finally{liveLoading=false;}
  }
  function start(){
    if(!install()){setTimeout(start,80);return;}
    refreshBase();refreshLive();
    setInterval(()=>{if(!document.hidden)refreshLive();},10000);
    setInterval(()=>{if(!document.hidden)refreshBase();},60000);
    window.addEventListener('focus',refreshLive);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLive();});
  }

  window.WGlobalScoreboard={install,refresh:refreshLive,refreshBase};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
