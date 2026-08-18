function liveSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}

function formatPct(value){
  return Number.isFinite(Number(value)) ? Number(value).toFixed(3) : '—';
}

function formatGb(value){
  const number=Number(value);
  if(!Number.isFinite(number)||number===0)return '—';
  return Number.isInteger(number)?String(number):number.toFixed(1);
}

function standingsTable(items=[],rankKey='overall_rank'){
  if(!items.length)return '<div class="card-pad"><strong>Standings are temporarily unavailable.</strong><p>The encyclopedia is still open.</p></div>';
  return `<div class="live-standings-table">
    <div class="live-standings-row head"><span>TEAM</span><span>W</span><span>L</span><span>PCT</span><span>GB</span><span>CONF</span><span>HOME</span><span>ROAD</span><span>STREAK</span><span>L-10</span></div>
    ${items.map((item,index)=>`<div class="live-standings-row">
      <span class="live-team-cell"><b class="live-rank">${item[rankKey]||index+1}</b><strong>${liveSafe(item.team?.full_name||'Unknown team')}</strong></span>
      <strong>${item.wins??'—'}</strong>
      <strong>${item.losses??'—'}</strong>
      <span>${formatPct(item.win_percentage)}</span>
      <span>${formatGb(item.games_back)}</span>
      <span>${liveSafe(item.conference_record||'—')}</span>
      <span>${liveSafe(item.home_record||'—')}</span>
      <span>${liveSafe(item.road_record||'—')}</span>
      <span class="streak-cell">${liveSafe(item.streak||'—')}</span>
      <span class="last-ten-cell">${liveSafe(item.last_ten||'—')}</span>
    </div>`).join('')}
  </div>`;
}

function conferenceMarkup(conferences={}){
  const east=Array.isArray(conferences.eastern)?conferences.eastern:[];
  const west=Array.isArray(conferences.western)?conferences.western:[];
  if(!east.length&&!west.length)return standingsTable([]);
  return `<div class="conference-stack">
    <section class="conference-block"><h3>Eastern Conference</h3>${standingsTable(east,'conference_rank')}</section>
    <section class="conference-block"><h3>Western Conference</h3>${standingsTable(west,'conference_rank')}</section>
  </div>`;
}

function resultsMarkup(items=[]){
  if(!items.length)return '<div class="home-result"><strong>No past games returned.</strong><span>Check back after the next completed games.</span></div>';
  return items.slice(0,5).map(game=>`<article class="home-result"><span>${liveSafe(game.date||'Completed game')}</span><strong>${liveSafe(game.awayTeam||'TBD')} ${game.awayScore??'—'}–${game.homeScore??'—'} ${liveSafe(game.homeTeam||'TBD')}</strong><span>Completed</span></article>`).join('');
}

let livePayload=null;
let liveMode='overall';

function renderLiveStandings(){
  const table=document.getElementById('homeStandings');
  const title=document.getElementById('standingsTitle');
  const overallButton=document.getElementById('overallToggle');
  const conferenceButton=document.getElementById('conferenceToggle');
  if(!table||!livePayload)return;

  if(liveMode==='conference'){
    title.textContent='Conference Standings';
    table.innerHTML=conferenceMarkup(livePayload.conferenceStandings);
    overallButton?.classList.remove('active');
    conferenceButton?.classList.add('active');
    overallButton?.setAttribute('aria-pressed','false');
    conferenceButton?.setAttribute('aria-pressed','true');
  }else{
    title.textContent='Overall Standings';
    table.innerHTML=standingsTable(livePayload.standings,'overall_rank');
    overallButton?.classList.add('active');
    conferenceButton?.classList.remove('active');
    overallButton?.setAttribute('aria-pressed','true');
    conferenceButton?.setAttribute('aria-pressed','false');
  }
}

document.getElementById('overallToggle')?.addEventListener('click',()=>{liveMode='overall';renderLiveStandings();});
document.getElementById('conferenceToggle')?.addEventListener('click',()=>{liveMode='conference';renderLiveStandings();});

async function loadHomeLive(){
  const table=document.getElementById('homeStandings');
  const results=document.getElementById('homeResults');
  const status=document.getElementById('homeLiveStatus');
  if(!table||!results)return;
  try{
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Live data unavailable');
    livePayload=payload;
    renderLiveStandings();
    results.innerHTML=resultsMarkup(payload.pastGames||payload.recentResults);
    status.textContent=payload.fullSeasonAccess?`Live via independent feed • updated ${new Date(payload.updatedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`:'Independent feed connected';
  }catch(error){
    table.innerHTML='<div class="card-pad"><strong>Live standings could not load.</strong><p>Try again shortly.</p></div>';
    results.innerHTML='<div class="home-result"><strong>Past games unavailable.</strong></div>';
    status.textContent='Live data temporarily unavailable';
  }
}

loadHomeLive();