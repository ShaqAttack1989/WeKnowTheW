let gamesPayload=null;
let gamesMode='live';
let gamesTeam='all';
let gamesRefreshActive=false;

function renderGames(){
  const list=document.getElementById('gamesList');
  const title=document.getElementById('gamesTitle');
  const past=document.getElementById('gamesPastToggle');
  const upcoming=document.getElementById('gamesUpcomingToggle');
  const live=document.getElementById('gamesLiveToggle');
  if(!list||!gamesPayload||!window.WGameCards)return;

  const source=gamesMode==='live'
    ? gamesPayload.liveGames||[]
    : gamesMode==='upcoming'
      ? gamesPayload.upcomingGames||[]
      : (gamesPayload.pastGames||gamesPayload.recentResults||[]).filter(WGameCards.finalGame);
  const items=WGameCards.filter(source,gamesTeam);
  title.textContent=gamesMode==='live'?'Live Games':gamesMode==='upcoming'?'Upcoming Games':'Past Games';
  live?.classList.toggle('active',gamesMode==='live');
  live?.classList.toggle('has-live',Boolean((gamesPayload.liveGames||[]).length));
  past?.classList.toggle('active',gamesMode==='past');
  upcoming?.classList.toggle('active',gamesMode==='upcoming');
  live?.setAttribute('aria-pressed',String(gamesMode==='live'));
  past?.setAttribute('aria-pressed',String(gamesMode==='past'));
  upcoming?.setAttribute('aria-pressed',String(gamesMode==='upcoming'));
  if(live)live.innerHTML=`<span class="live-tab-dot" aria-hidden="true"></span>Live Games${(gamesPayload.liveGames||[]).length?` <b>${gamesPayload.liveGames.length}</b>`:''}`;
  list.innerHTML=WGameCards.render(items,gamesMode,{limit:24,standings:gamesPayload.standings||[]});
}

document.getElementById('gamesLiveToggle')?.addEventListener('click',()=>{gamesMode='live';renderGames();});
document.getElementById('gamesUpcomingToggle')?.addEventListener('click',()=>{gamesMode='upcoming';renderGames();});
document.getElementById('gamesPastToggle')?.addEventListener('click',()=>{gamesMode='past';renderGames();});
document.getElementById('gamesTeamFilter')?.addEventListener('change',event=>{gamesTeam=event.target.value||'all';renderGames();});

async function loadGames(initial=false){
  if(gamesRefreshActive)return;
  gamesRefreshActive=true;
  const status=document.getElementById('gamesStatus');
  try{
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Schedule unavailable');
    if(!Array.isArray(payload.liveGames)||!payload.liveGames.length)payload.liveGames=await WGameCards.fetchLiveGames();
    gamesPayload=payload;
    if(initial&&gamesMode==='live'&&!payload.liveGames.length)gamesMode='upcoming';
    WGameCards.populateFilter(document.getElementById('gamesTeamFilter'),payload);
    renderGames();
    status.textContent=payload.liveGames.length?`${payload.liveGames.length} ${payload.liveGames.length===1?'game':'games'} live now · scores refresh automatically · Eastern Time`:'Live schedule connected · no games in progress · Eastern Time';
    if(initial)WGameCards.loadArtwork().then(renderGames);
  }catch(error){
    if(!gamesPayload){
      document.getElementById('gamesList').innerHTML='<div class="schedule-empty"><span>!</span><strong>Game schedule unavailable.</strong><p>Try again shortly.</p></div>';
      status.textContent='Schedule feed temporarily unavailable';
    }
  }finally{
    gamesRefreshActive=false;
  }
}

loadGames(true);
setInterval(()=>{if(!document.hidden)loadGames(false);},30000);
