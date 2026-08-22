let gamesPayload=null;
let gamesMode='upcoming';
let gamesTeam='all';

function renderGames(){
  const list=document.getElementById('gamesList');
  const title=document.getElementById('gamesTitle');
  const past=document.getElementById('gamesPastToggle');
  const upcoming=document.getElementById('gamesUpcomingToggle');
  if(!list||!gamesPayload||!window.WGameCards)return;

  const source=gamesMode==='upcoming'
    ? gamesPayload.upcomingGames||[]
    : (gamesPayload.pastGames||gamesPayload.recentResults||[]).filter(WGameCards.finalGame);
  const items=WGameCards.filter(source,gamesTeam);
  title.textContent=gamesMode==='upcoming'?'Upcoming Games':'Past Games';
  past?.classList.toggle('active',gamesMode==='past');
  upcoming?.classList.toggle('active',gamesMode==='upcoming');
  past?.setAttribute('aria-pressed',String(gamesMode==='past'));
  upcoming?.setAttribute('aria-pressed',String(gamesMode==='upcoming'));
  list.innerHTML=WGameCards.render(items,gamesMode,{limit:24,standings:gamesPayload.standings||[]});
}

document.getElementById('gamesUpcomingToggle')?.addEventListener('click',()=>{gamesMode='upcoming';renderGames();});
document.getElementById('gamesPastToggle')?.addEventListener('click',()=>{gamesMode='past';renderGames();});
document.getElementById('gamesTeamFilter')?.addEventListener('change',event=>{gamesTeam=event.target.value||'all';renderGames();});

(async()=>{
  const status=document.getElementById('gamesStatus');
  try{
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Schedule unavailable');
    gamesPayload=payload;
    WGameCards.populateFilter(document.getElementById('gamesTeamFilter'),payload);
    renderGames();
    status.textContent='Live schedule connected · Eastern Time';
    WGameCards.loadArtwork().then(renderGames);
  }catch(error){
    document.getElementById('gamesList').innerHTML='<div class="schedule-empty"><span>!</span><strong>Game schedule unavailable.</strong><p>Try again shortly.</p></div>';
    status.textContent='Schedule feed temporarily unavailable';
  }
})();
