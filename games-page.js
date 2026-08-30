let gamesPayload=null,competitionPayload=null,gamesMode='live',gamesTeam='all',gamesCompetition='season',gamesRefreshActive=false,liveRefreshActive=false;

const CUP_2026_CLIENT_FALLBACK=[
  {id:'2026-commissioners-cup-final',date:'2026-06-30',startTimeUtc:'2026-06-30T20:00:00-04:00',homeTeam:'New York Liberty',awayTeam:'Las Vegas Aces',homeScore:93,awayScore:85,status:'Final',state:'post',completed:true,officialFallback:true,broadcasts:['Prime Video']},
  {id:'2026-cup-was-con-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T19:00:00-04:00',homeTeam:'Washington Mystics',awayTeam:'Connecticut Sun',homeScore:88,awayScore:81,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-gsv-dal-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T19:30:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',homeScore:91,awayScore:80,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-lva-phx-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Las Vegas Aces',awayTeam:'Phoenix Mercury',homeScore:86,awayScore:76,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-por-sea-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Portland Fire',awayTeam:'Seattle Storm',homeScore:94,awayScore:89,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-min-las-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Minnesota Lynx',awayTeam:'Los Angeles Sparks',homeScore:99,awayScore:83,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-ind-tor-0616',date:'2026-06-16',startTimeUtc:'2026-06-16T19:00:00-04:00',homeTeam:'Indiana Fever',awayTeam:'Toronto Tempo',homeScore:113,awayScore:91,status:'Final',state:'post',completed:true,officialFallback:true}
];

function gameKey(g={}){return `${g.date||''}|${[g.homeTeam||'',g.awayTeam||''].sort().join('|')}`;}
function mergeUnique(primary=[],fallback=[]){
  const map=new Map();
  for(const game of [...fallback,...primary]){
    const key=gameKey(game);
    const current=map.get(key);
    const currentHasScores=current&&Number.isFinite(Number(current.homeScore))&&Number.isFinite(Number(current.awayScore));
    const nextHasScores=Number.isFinite(Number(game.homeScore))&&Number.isFinite(Number(game.awayScore));
    if(!current||!currentHasScores||nextHasScores)map.set(key,game);
  }
  return [...map.values()];
}
function compGames(){
  if(gamesCompetition==='cup'){
    const apiGames=[...(competitionPayload?.cup?.poolGames||[]),...(competitionPayload?.cup?.championshipGames||[])];
    return mergeUnique(apiGames,CUP_2026_CLIENT_FALLBACK);
  }
  if(gamesCompetition==='playoffs')return competitionPayload?.playoffs?.games||[];
  return null;
}
function gameTime(g={}){const t=Date.parse(g.startTimeUtc||`${g.date}T12:00:00Z`);return Number.isFinite(t)?t:0;}
function temporal(items=[]){
  const now=Date.now();
  const filtered=items.filter(g=>{
    const t=gameTime(g);
    if(gamesMode==='past')return g.completed===true||String(g.state||'').toLowerCase()==='post'||String(g.status||'').toLowerCase().includes('final');
    if(gamesMode==='live')return String(g.state||'').toLowerCase()==='in';
    return !g.completed&&String(g.state||'').toLowerCase()!=='in'&&t>=now;
  });
  return filtered.sort((a,b)=>gamesMode==='past'?gameTime(b)-gameTime(a):gameTime(a)-gameTime(b));
}
function renderGames(){
  const list=document.getElementById('gamesList'),title=document.getElementById('gamesTitle'),past=document.getElementById('gamesPastToggle'),upcoming=document.getElementById('gamesUpcomingToggle'),live=document.getElementById('gamesLiveToggle');
  if(!list||!gamesPayload||!window.WGameCards)return;
  let source;
  if(gamesCompetition==='season')source=gamesMode==='live'?gamesPayload.liveGames||[]:gamesMode==='upcoming'?gamesPayload.upcomingGames||[]:(gamesPayload.pastGames||gamesPayload.recentResults||[]).filter(WGameCards.finalGame);
  else source=temporal(compGames());
  if(window.WGameBroadcasts?.enrichGames)source=WGameBroadcasts.enrichGames(source||[]);
  const items=WGameCards.filter(source||[],gamesTeam);
  const label=gamesCompetition==='cup'?'Commissioner’s Cup':gamesCompetition==='playoffs'?'Playoffs':'Regular Season';
  title.textContent=`${label} · ${gamesMode==='live'?'Live':gamesMode==='upcoming'?'Upcoming':'Past'} Games`;
  live?.classList.toggle('active',gamesMode==='live');past?.classList.toggle('active',gamesMode==='past');upcoming?.classList.toggle('active',gamesMode==='upcoming');
  live?.setAttribute('aria-pressed',String(gamesMode==='live'));past?.setAttribute('aria-pressed',String(gamesMode==='past'));upcoming?.setAttribute('aria-pressed',String(gamesMode==='upcoming'));
  if(!items.length&&gamesCompetition==='playoffs'&&!competitionPayload?.playoffs?.started){list.innerHTML='<div class="schedule-empty"><strong>Playoffs begin Sept. 27.</strong><p>The postseason schedule and results will populate here as soon as they are published.</p></div>';return;}
  list.innerHTML=WGameCards.render(items,gamesMode,{limit:60,standings:gamesPayload.standings||[]});
}
function setStatus(note=''){
  const status=document.getElementById('gamesStatus');if(!status||!gamesPayload)return;
  const liveCount=(gamesPayload.liveGames||[]).length;
  status.textContent=liveCount?`${liveCount} live now · fresh game states checked every 10 seconds · ${note||'where to watch synced to WNBA.com'} · Eastern Time`:`No regular-season games live right now · ${note||'schedule connected'} · Eastern Time`;
}
async function fetchFreshLive(cacheBust=Date.now()){
  const response=await fetch(`/api/live-games?cb=${cacheBust}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}),payload=await response.json().catch(()=>({}));
  if(!response.ok||!Array.isArray(payload.games))throw new Error(payload.error||'Fresh live feed unavailable');
  return payload;
}
function mergeVerifiedLive(current=[],payload={}){
  const fresh=Array.isArray(payload.games)?payload.games:[];
  return fresh.length||payload.liveStatusVerified===true?fresh:(Array.isArray(current)?current:[]);
}
async function refreshLiveGames(){
  if(liveRefreshActive||!gamesPayload)return;
  liveRefreshActive=true;
  try{
    const payload=await fetchFreshLive();
    const liveGames=mergeVerifiedLive(gamesPayload.liveGames,payload);
    gamesPayload.liveGames=window.WGameBroadcasts?.enrichGames?WGameBroadcasts.enrichGames(liveGames):liveGames;
    if(gamesCompetition==='season'&&gamesMode==='live')renderGames();
    setStatus('official WNBA live boxscores + ESPN backup');
  }catch{
    try{
      const browserLive=await WGameCards.fetchLiveGames();
      if(Array.isArray(browserLive)){gamesPayload.liveGames=window.WGameBroadcasts?.enrichGames?WGameBroadcasts.enrichGames(browserLive):browserLive;if(gamesCompetition==='season'&&gamesMode==='live')renderGames();setStatus('live backup connected');}
    }catch{}
  }finally{liveRefreshActive=false;}
}

document.getElementById('gamesLiveToggle')?.addEventListener('click',()=>{gamesMode='live';renderGames();refreshLiveGames();});
document.getElementById('gamesUpcomingToggle')?.addEventListener('click',()=>{gamesMode='upcoming';renderGames();});
document.getElementById('gamesPastToggle')?.addEventListener('click',()=>{gamesMode='past';renderGames();});
document.getElementById('gamesTeamFilter')?.addEventListener('change',e=>{gamesTeam=e.target.value||'all';renderGames();});
document.querySelectorAll('[data-games-competition]').forEach(button=>button.addEventListener('click',()=>{
  gamesCompetition=button.dataset.gamesCompetition;
  document.querySelectorAll('[data-games-competition]').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  const note=document.getElementById('gamesCompetitionNote');
  if(gamesCompetition==='cup'){gamesMode='past';if(note)note.textContent='2026 Cup complete · New York Liberty champions · pool play June 1–17, championship June 30';}
  else if(gamesCompetition==='playoffs'){gamesMode=competitionPayload?.playoffs?.started?'live':'upcoming';if(note)note.textContent='Playoffs begin Sept. 27';}
  else if(note)note.textContent='Regular-season schedule · where to watch from WNBA.com';
  renderGames();
}));

async function loadGames(initial=false){
  if(gamesRefreshActive)return;
  gamesRefreshActive=true;
  const status=document.getElementById('gamesStatus');
  try{
    const cacheBust=Date.now();
    const [statsResult,compResult,officialScheduleResult,liveResult]=await Promise.allSettled([
      fetch(`/api/stats?season=2026&cb=${cacheBust}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async r=>{const p=await r.json().catch(()=>({}));if(!r.ok||p.error)throw new Error(p.error||'Stats unavailable');return p;}),
      fetch(`/api/competition?season=2026&v=20260823-3&cb=${cacheBust}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async r=>{const p=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p.error||'Competition feed unavailable');return p;}),
      window.WGameBroadcasts?.loadOfficialSchedule?.(initial)||Promise.resolve([]),
      fetchFreshLive(cacheBust)
    ]);
    if(statsResult.status!=='fulfilled')throw statsResult.reason;
    let stats=statsResult.value;
    const officialGames=officialScheduleResult.status==='fulfilled'&&Array.isArray(officialScheduleResult.value)?officialScheduleResult.value:[];
    if(window.WGameBroadcasts?.enrichPayload)stats=WGameBroadcasts.enrichPayload(stats,officialGames);
    if(liveResult.status==='fulfilled')stats.liveGames=mergeVerifiedLive(stats.liveGames,liveResult.value);
    else {
      const browserLive=await WGameCards.fetchLiveGames();
      if(Array.isArray(browserLive))stats.liveGames=browserLive;
    }
    if(window.WGameBroadcasts?.enrichGames)stats.liveGames=WGameBroadcasts.enrichGames(stats.liveGames||[],officialGames);
    gamesPayload=stats;
    competitionPayload=compResult.status==='fulfilled'?compResult.value:{cup:{poolGames:[],championshipGames:[]},playoffs:{games:[],started:false}};
    if(initial&&gamesMode==='live'&&!stats.liveGames.length)gamesMode='upcoming';
    WGameCards.populateFilter(document.getElementById('gamesTeamFilter'),stats);
    renderGames();
    setStatus(officialGames.length?'where to watch synced to official WNBA schedule':'broadcast schedule reconnecting');
    if(initial)WGameCards.loadArtwork().then(renderGames);
  }catch(error){
    if(!gamesPayload){
      gamesPayload={liveGames:[],upcomingGames:[],pastGames:[],standings:[]};
      competitionPayload={cup:{poolGames:[],championshipGames:[]},playoffs:{games:[],started:false}};
      renderGames();
      status.textContent='Regular-season feed temporarily unavailable · Commissioner’s Cup archive remains available';
    }
  }finally{gamesRefreshActive=false;}
}

loadGames(true);
setInterval(()=>{if(!document.hidden)refreshLiveGames();},10000);
setInterval(()=>{if(!document.hidden)loadGames(false);},60000);
window.addEventListener('focus',refreshLiveGames);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLiveGames();});
