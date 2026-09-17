function liveSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}

const EASTERN_TIME_ZONE='America/New_York';
const HOME_TEAM_SLUGS={'Atlanta Dream':'atlanta-dream','Chicago Sky':'chicago-sky','Connecticut Sun':'connecticut-sun','Dallas Wings':'dallas-wings','Golden State Valkyries':'golden-state-valkyries','Indiana Fever':'indiana-fever','Las Vegas Aces':'las-vegas-aces','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','New York Liberty':'new-york-liberty','Phoenix Mercury':'phoenix-mercury','Portland Fire':'portland-fire','Seattle Storm':'seattle-storm','Toronto Tempo':'toronto-tempo','Washington Mystics':'washington-mystics'};
function homeTeamHref(name=''){const slug=HOME_TEAM_SLUGS[String(name).trim()]||'';return slug?`/team.html?team=${encodeURIComponent(slug)}`:'';}
function homeTeamLink(name=''){const href=homeTeamHref(name);return href?`<a class="live-team-link" href="${href}" aria-label="Open ${liveSafe(name)} team dashboard">${liveSafe(name)}</a>`:liveSafe(name);}
function formatPct(value){return Number.isFinite(Number(value)) ? Number(value).toFixed(3) : '—';}
function formatGb(value){const number=Number(value);if(!Number.isFinite(number)||number===0)return '—';return Number.isInteger(number)?String(number):number.toFixed(1);}
function streakClass(value=''){return /^W/i.test(String(value))?'is-positive':/^L/i.test(String(value))?'is-negative':'';}
function lastTenClass(value=''){
  const match=String(value).match(/(\d+)\s*-\s*(\d+)/);
  if(!match)return '';
  const wins=Number(match[1]),losses=Number(match[2]);
  return wins>losses?'is-positive':losses>wins?'is-negative':'is-even';
}
function playoffIcon(status){
  if(status==='clinched')return '<span class="playoff-marker clinched" title="Clinched Playoffs Berth" aria-label="Clinched Playoffs Berth">✓</span>';
  if(status==='eliminated')return '<span class="playoff-marker eliminated" title="Eliminated from Playoffs contention" aria-label="Eliminated from Playoffs contention">×</span>';
  return '';
}
function gameDateTime(game={}){
  const direct=String(game.startTimeUtc||game.timestamp||'').trim();
  if(direct){
    const directIso=direct.includes('T')?direct:direct.replace(' ','T');
    const hasZone=/Z$|[+-]\d{2}:?\d{2}$/i.test(directIso);
    const parsed=new Date(hasZone?directIso:`${directIso}Z`);
    if(!Number.isNaN(parsed.getTime()))return parsed;
  }
  const date=String(game.date||'').trim();
  const rawTime=String(game.time||'').trim();
  if(date&&rawTime){
    const hasZone=/Z$|[+-]\d{2}:?\d{2}$/i.test(rawTime);
    const parsed=new Date(`${date}T${rawTime}${hasZone?'':'Z'}`);
    if(!Number.isNaN(parsed.getTime()))return parsed;
  }
  if(date){const parsed=new Date(`${date}T12:00:00Z`);if(!Number.isNaN(parsed.getTime()))return parsed;}
  return null;
}
function formatGameDate(game={}){const date=gameDateTime(game);if(!date)return game.date||'';return new Intl.DateTimeFormat('en-US',{timeZone:EASTERN_TIME_ZONE,month:'short',day:'numeric'}).format(date);}
function formatGameTime(game={}){const date=gameDateTime(game);if(!date||(!game.time&&!game.startTimeUtc&&!game.timestamp))return '';const time=new Intl.DateTimeFormat('en-US',{timeZone:EASTERN_TIME_ZONE,hour:'numeric',minute:'2-digit'}).format(date);return `${time} ET`;}
function formatEasternUpdatedAt(value){const date=new Date(value);if(Number.isNaN(date.getTime()))return '';return new Intl.DateTimeFormat('en-US',{timeZone:EASTERN_TIME_ZONE,hour:'numeric',minute:'2-digit'}).format(date);}
function validFinalGame(game){const home=Number(game?.homeScore),away=Number(game?.awayScore);return Number.isFinite(home)&&Number.isFinite(away)&&home!==away;}
function standingsTable(items=[],rankKey='overall_rank'){
  if(!items.length)return '<div class="card-pad"><strong>Standings are temporarily unavailable.</strong><p>The encyclopedia is still open.</p></div>';
  return `<div class="live-standings-table"><div class="live-standings-row head"><span>TEAM</span><span>W</span><span>L</span><span>PCT</span><span>GB</span><span>CONF</span><span>HOME</span><span>ROAD</span><span>STREAK</span><span>L-10</span></div>${items.map((item,index)=>{const name=item.team?.full_name||'Unknown team';return `<div class="live-standings-row"><span class="live-team-cell"><b class="live-rank">${item[rankKey]||index+1}</b><strong>${homeTeamLink(name)}</strong>${playoffIcon(item.playoff_status)}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${formatPct(item.win_percentage)}</span><span>${formatGb(item.games_back)}</span><span>${liveSafe(item.conference_record||'—')}</span><span>${liveSafe(item.home_record||'—')}</span><span>${liveSafe(item.road_record||'—')}</span><span class="streak-cell ${streakClass(item.streak)}">${liveSafe(item.streak||'—')}</span><span class="last-ten-cell ${lastTenClass(item.last_ten)}">${liveSafe(item.last_ten||'—')}</span></div>`;}).join('')}</div>`;
}
function conferenceMarkup(conferences={}){
  const east=Array.isArray(conferences.eastern)?conferences.eastern:[];
  const west=Array.isArray(conferences.western)?conferences.western:[];
  if(!east.length&&!west.length)return standingsTable([]);
  return `<div class="conference-stack"><section class="conference-block"><h3>Eastern Conference</h3>${standingsTable(east,'conference_rank')}</section><section class="conference-block"><h3>Western Conference</h3>${standingsTable(west,'conference_rank')}</section></div>`;
}
function pastGamesMarkup(items=[]){const finals=items.filter(validFinalGame);return window.WGameCards?WGameCards.render(finals,'past',{limit:8,standings:livePayload?.standings||[]}):'';}
function upcomingGamesMarkup(items=[]){return window.WGameCards?WGameCards.render(items,'upcoming',{limit:8,standings:livePayload?.standings||[]}):'';}
function liveGamesMarkup(items=[]){return window.WGameCards?WGameCards.render(items,'live',{limit:8,standings:livePayload?.standings||[]}):'';}

let livePayload=null;
let liveMode='overall';
let gameMode='live';
let gameTeam='all';
let homeLiveRefreshActive=false;
let homeLiveGamesRefreshActive=false;
let homeLiveUpdatedAt='';

function renderLiveStandings(){
  const table=document.getElementById('homeStandings');
  const title=document.getElementById('standingsTitle');
  const overallButton=document.getElementById('overallToggle');
  const conferenceButton=document.getElementById('conferenceToggle');
  if(!table||!livePayload)return;
  if(liveMode==='conference'){
    title.textContent='Conference Standings';
    table.innerHTML=conferenceMarkup(livePayload.conferenceStandings);
    overallButton?.classList.remove('active');conferenceButton?.classList.add('active');
    overallButton?.setAttribute('aria-pressed','false');conferenceButton?.setAttribute('aria-pressed','true');
  }else{
    title.textContent='Overall Standings';
    table.innerHTML=standingsTable(livePayload.standings,'overall_rank');
    overallButton?.classList.add('active');conferenceButton?.classList.remove('active');
    overallButton?.setAttribute('aria-pressed','true');conferenceButton?.setAttribute('aria-pressed','false');
  }
}
function renderGamePanel(){
  const results=document.getElementById('homeResults');
  const title=document.getElementById('gamesPanelTitle');
  const pastButton=document.getElementById('pastGamesToggle');
  const upcomingButton=document.getElementById('upcomingGamesToggle');
  const liveButton=document.getElementById('liveGamesToggle');
  if(!results||!livePayload)return;
  const liveItems=window.WGameCards?WGameCards.filter(livePayload.liveGames||[],gameTeam):(livePayload.liveGames||[]);
  const upcomingItems=window.WGameCards?WGameCards.filter(livePayload.upcomingGames||[],gameTeam):(livePayload.upcomingGames||[]);
  const pastItems=window.WGameCards?WGameCards.filter(livePayload.pastGames||livePayload.recentResults||[],gameTeam):(livePayload.pastGames||livePayload.recentResults||[]);
  [liveButton,upcomingButton,pastButton].forEach(button=>{button?.classList.remove('active');button?.setAttribute('aria-pressed','false');});
  liveButton?.classList.toggle('has-live',Boolean((livePayload.liveGames||[]).length));
  if(liveButton)liveButton.innerHTML=`<span class="live-tab-dot" aria-hidden="true"></span>Live Games${(livePayload.liveGames||[]).length?` <b>${livePayload.liveGames.length}</b>`:''}`;
  if(gameMode==='live'){
    title.textContent='Happening now';results.innerHTML=liveGamesMarkup(liveItems);liveButton?.classList.add('active');liveButton?.setAttribute('aria-pressed','true');
  }else if(gameMode==='upcoming'){
    title.textContent="What's next?";results.innerHTML=upcomingGamesMarkup(upcomingItems);upcomingButton?.classList.add('active');upcomingButton?.setAttribute('aria-pressed','true');
  }else{
    title.textContent='What just happened?';results.innerHTML=pastGamesMarkup(pastItems);pastButton?.classList.add('active');pastButton?.setAttribute('aria-pressed','true');
  }
}
function updateHomeLiveStatus(source=''){
  const status=document.getElementById('homeLiveStatus');if(!status||!livePayload)return;
  const updated=formatEasternUpdatedAt(homeLiveUpdatedAt||livePayload.updatedAt),count=(livePayload.liveGames||[]).length;
  status.textContent=`Official WNBA live game states + independent standings${count?` • ${count} ${count===1?'game':'games'} live`:' • no games in progress'}${updated?` • checked ${updated} ET`:''}${source?` • ${source}`:''}`;
}
async function fetchFreshHomeLive(){
  const response=await fetch(`/api/live-games?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}),payload=await response.json().catch(()=>({}));
  if(!response.ok||!Array.isArray(payload.games))throw new Error(payload.error||'Fresh live games unavailable');
  return payload;
}
function mergeVerifiedHomeLive(current=[],fresh={}){
  const games=Array.isArray(fresh.games)?fresh.games:[];
  return games.length||fresh.liveStatusVerified===true?games:(Array.isArray(current)?current:[]);
}
async function refreshHomeLiveGames(){
  if(homeLiveGamesRefreshActive||!livePayload)return;
  homeLiveGamesRefreshActive=true;
  try{
    const fresh=await fetchFreshHomeLive();
    const liveGames=mergeVerifiedHomeLive(livePayload.liveGames,fresh);
    livePayload.liveGames=window.WGameBroadcasts?.enrichGames?WGameBroadcasts.enrichGames(liveGames):liveGames;
    homeLiveUpdatedAt=fresh.updatedAt||new Date().toISOString();
    if(gameMode==='live')renderGamePanel();else document.getElementById('liveGamesToggle')?.classList.toggle('has-live',Boolean(fresh.games.length));
    updateHomeLiveStatus('refreshes every 10 seconds');
  }catch{
    try{const browserLive=await window.WGameCards?.fetchLiveGames?.();if(Array.isArray(browserLive)){livePayload.liveGames=browserLive;homeLiveUpdatedAt=new Date().toISOString();if(gameMode==='live')renderGamePanel();updateHomeLiveStatus('live backup connected');}}catch{}
  }finally{homeLiveGamesRefreshActive=false;}
}

document.getElementById('overallToggle')?.addEventListener('click',()=>{liveMode='overall';renderLiveStandings();});
document.getElementById('conferenceToggle')?.addEventListener('click',()=>{liveMode='conference';renderLiveStandings();});
document.getElementById('liveGamesToggle')?.addEventListener('click',()=>{gameMode='live';renderGamePanel();refreshHomeLiveGames();});
document.getElementById('pastGamesToggle')?.addEventListener('click',()=>{gameMode='past';renderGamePanel();});
document.getElementById('upcomingGamesToggle')?.addEventListener('click',()=>{gameMode='upcoming';renderGamePanel();});
document.getElementById('homeGamesTeamFilter')?.addEventListener('change',event=>{gameTeam=event.target.value||'all';renderGamePanel();});

async function loadHomeLive(initial=false){
  if(homeLiveRefreshActive)return;
  homeLiveRefreshActive=true;
  const table=document.getElementById('homeStandings');
  const results=document.getElementById('homeResults');
  const status=document.getElementById('homeLiveStatus');
  if(!table||!results)return;
  try{
    const [statsResult,liveResult]=await Promise.allSettled([
      fetch(`/api/stats?season=2026&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async r=>{const p=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p.error||'Live data unavailable');return p;}),
      fetchFreshHomeLive()
    ]);
    if(statsResult.status!=='fulfilled')throw statsResult.reason;
    const payload=statsResult.value;
    if(liveResult.status==='fulfilled'){payload.liveGames=mergeVerifiedHomeLive(payload.liveGames,liveResult.value);homeLiveUpdatedAt=liveResult.value.updatedAt||payload.updatedAt;}
    else {const browserLive=await window.WGameCards?.fetchLiveGames?.();if(Array.isArray(browserLive))payload.liveGames=browserLive;homeLiveUpdatedAt=payload.updatedAt;}
    if(window.WGameBroadcasts?.enrichGames)payload.liveGames=WGameBroadcasts.enrichGames(payload.liveGames||[]);
    livePayload=payload;
    if(initial&&gameMode==='live'&&!payload.liveGames.length)gameMode='upcoming';
    window.WGameCards?.populateFilter(document.getElementById('homeGamesTeamFilter'),payload);
    renderLiveStandings();renderGamePanel();updateHomeLiveStatus('live scores checked every 10 seconds');
    if(initial)window.WGameCards?.loadArtwork().then(renderGamePanel);
  }catch(error){
    if(!livePayload){table.innerHTML='<div class="card-pad"><strong>Live standings could not load.</strong><p>Try again shortly.</p></div>';results.innerHTML='<div class="home-result"><strong>Game schedule unavailable.</strong></div>';status.textContent='Live data temporarily unavailable';}
  }finally{homeLiveRefreshActive=false;}
}

loadHomeLive(true);
setInterval(()=>{if(!document.hidden)refreshHomeLiveGames();},10000);
setInterval(()=>{if(!document.hidden)loadHomeLive(false);},60000);
window.addEventListener('focus',refreshHomeLiveGames);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshHomeLiveGames();});