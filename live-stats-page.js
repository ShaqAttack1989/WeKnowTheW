function lsSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function lsPct(value){return Number.isFinite(Number(value))?Number(value).toFixed(3):'—';}
function lsGb(value){const number=Number(value);if(!Number.isFinite(number)||number===0)return '—';return Number.isInteger(number)?String(number):number.toFixed(1);}
function lsStreakClass(value=''){return /^W/i.test(String(value))?'is-positive':/^L/i.test(String(value))?'is-negative':'';}
function lsLastTenClass(value=''){const match=String(value).match(/(\d+)\s*-\s*(\d+)/);if(!match)return '';return Number(match[1])>Number(match[2])?'is-positive':Number(match[2])>Number(match[1])?'is-negative':'is-even';}
function lsPlayoffIcon(status){if(status==='clinched')return '<span class="playoff-marker clinched" title="Clinched Playoffs Berth">✓</span>';if(status==='eliminated')return '<span class="playoff-marker eliminated" title="Eliminated">×</span>';return '';}

const LS_TEAM_SLUGS={'Atlanta Dream':'atlanta-dream','Chicago Sky':'chicago-sky','Connecticut Sun':'connecticut-sun','Dallas Wings':'dallas-wings','Golden State Valkyries':'golden-state-valkyries','Indiana Fever':'indiana-fever','Las Vegas Aces':'las-vegas-aces','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','New York Liberty':'new-york-liberty','Phoenix Mercury':'phoenix-mercury','Portland Fire':'portland-fire','Seattle Storm':'seattle-storm','Toronto Tempo':'toronto-tempo','Washington Mystics':'washington-mystics'};
const LS_EASTERN='America/New_York';
let lsPayload=null,lsCompetition=null,lsMode='overall',lsCompMode='playoffs',lsCompPinned=false,lsLiveLoading=false,lsAllLoading=false;

function lsTeamHref(name=''){const slug=LS_TEAM_SLUGS[String(name).trim()]||'';return slug?`/team.html?team=${encodeURIComponent(slug)}`:'';}
function lsTeamLink(name='',className=''){const href=lsTeamHref(name);return href?`<a class="${className||'live-team-link'}" href="${href}" aria-label="Open ${lsSafe(name)} team dashboard">${lsSafe(name)}</a>`:`<span>${lsSafe(name)}</span>`;}
function lsTeamName(item={}){return item.team?.full_name||item.team||'';}
function lsTeamNorm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function lsGamePair(game={}){return [game.homeTeam||'',game.awayTeam||''].map(lsTeamNorm).sort().join('|');}
function lsGameDate(game={}){return String(game.date||game.startTimeUtc||'').slice(0,10);}
function lsGameKey(game={}){return `${lsGameDate(game)}|${lsGamePair(game)}`;}
function lsGameStateRank(game={}){const state=String(game.state||'').toLowerCase();return game.completed||state==='post'||/final/i.test(String(game.status||''))?3:state==='in'?2:1;}
function lsGameTime(game={}){const date=new Date(game.startTimeUtc||'');return Number.isNaN(date.getTime())?'TBD':new Intl.DateTimeFormat('en-US',{timeZone:LS_EASTERN,hour:'numeric',minute:'2-digit'}).format(date);}
function lsGameInstant(game={}){const time=Date.parse(game.startTimeUtc||`${game.date||''}T23:59:59-04:00`);return Number.isFinite(time)?time:0;}
function lsFetchJson(url){const joiner=url.includes('?')?'&':'?';return fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok||payload.error)throw new Error(payload.error||`${url} unavailable`);return payload;});}

function lsTable(items=[],rankKey='overall_rank'){
  if(!items.length)return '<div class="card-pad"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="live-standings-table"><div class="live-standings-row head"><span>TEAM</span><span>W</span><span>L</span><span>PCT</span><span>GB</span><span>CONF</span><span>HOME</span><span>ROAD</span><span>STREAK</span><span>L-10</span></div>${items.map((item,index)=>{const name=item.team?.full_name||'Unknown team';return `<div class="live-standings-row"><span class="live-team-cell"><b class="live-rank">${item[rankKey]||index+1}</b><strong>${lsTeamLink(name)}</strong>${lsPlayoffIcon(item.playoff_status)}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${lsPct(item.win_percentage)}</span><span>${lsGb(item.games_back)}</span><span>${lsSafe(item.conference_record||'—')}</span><span>${lsSafe(item.home_record||'—')}</span><span>${lsSafe(item.road_record||'—')}</span><span class="streak-cell ${lsStreakClass(item.streak)}">${lsSafe(item.streak||'—')}</span><span class="last-ten-cell ${lsLastTenClass(item.last_ten)}">${lsSafe(item.last_ten||'—')}</span></div>`;}).join('')}</div>`;
}
function lsConference(groups={}){return `<div class="conference-stack"><section class="conference-block"><h3>Eastern Conference</h3>${lsTable(groups.eastern||[],'conference_rank')}</section><section class="conference-block"><h3>Western Conference</h3>${lsTable(groups.western||[],'conference_rank')}</section></div>`;}
function cupTable(rows=[]){const group=name=>rows.filter(item=>item.conference===name);const one=(name,items)=>`<section class="cup-block"><h3>${name} Conference</h3><div class="cup-table"><div class="cup-row head"><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map(item=>`<div class="cup-row"><strong>${lsTeamLink(item.team,'live-team-link')}</strong><span>${item.wins}</span><span>${item.losses}</span><span>${lsPct(item.pct)}</span></div>`).join('')}</div></section>`;return `<div class="cup-standings">${one('Eastern',group('Eastern'))}${one('Western',group('Western'))}</div>`;}

function mergePlayoffGames(base=[],fresh=[]){
  const updates=new Map(fresh.filter(game=>game?.homeTeam&&game?.awayTeam).map(game=>[lsGameKey(game),game]));
  return base.map(game=>{
    const update=updates.get(lsGameKey(game));
    if(!update)return game;
    const advances=lsGameStateRank(update)>=lsGameStateRank(game),merged=advances?{...game,...update}:{...update,...game};
    return {...merged,playoff:true,round:game.round,gameNumber:game.gameNumber,homeSeed:game.homeSeed,awaySeed:game.awaySeed,regularSeasonSeries:game.regularSeasonSeries,competitionLabel:game.competitionLabel,broadcasts:Array.isArray(update.broadcasts)&&update.broadcasts.length?update.broadcasts:(game.broadcasts||[])};
  }).sort((a,b)=>lsGameInstant(a)-lsGameInstant(b));
}
function playoffSeries(games=[]){
  const map=new Map();
  games.forEach(game=>{
    const teams=[game.homeTeam,game.awayTeam].filter(Boolean).sort(),round=String(game.round||'First Round'),key=`${round}|${teams.map(lsTeamNorm).join('|')}`;
    if(teams.length!==2)return;
    const target=/finals/i.test(round)&&!/semi/i.test(round)?4:/semi/i.test(round)?3:2;
    const row=map.get(key)||{teamA:teams[0],teamB:teams[1],round,target,winsA:0,winsB:0,games:[]};
    row.games.push(game);
    if(lsGameStateRank(game)===3&&game.homeScore!==null&&game.homeScore!==undefined&&game.awayScore!==null&&game.awayScore!==undefined&&Number.isFinite(Number(game.homeScore))&&Number.isFinite(Number(game.awayScore))&&Number(game.homeScore)!==Number(game.awayScore)){
      const winner=Number(game.homeScore)>Number(game.awayScore)?game.homeTeam:game.awayTeam;
      if(winner===row.teamA)row.winsA+=1;else row.winsB+=1;
    }
    map.set(key,row);
  });
  return [...map.values()].map(row=>({...row,winner:row.winsA>=row.target?row.teamA:row.winsB>=row.target?row.teamB:'',complete:row.winsA>=row.target||row.winsB>=row.target}));
}
function playoffGameForSeries(series={}){
  const games=series.games||[],live=games.find(game=>lsGameStateRank(game)===2);
  if(live)return live;
  const upcoming=games.filter(game=>lsGameStateRank(game)===1&&lsGameInstant(game)>=Date.now()).sort((a,b)=>lsGameInstant(a)-lsGameInstant(b));
  if(upcoming.length)return upcoming[0];
  return games.filter(game=>lsGameStateRank(game)===3).sort((a,b)=>lsGameInstant(b)-lsGameInstant(a))[0]||games[0]||null;
}
function playoffStatus(game={}){
  const rank=lsGameStateRank(game),raw=String(game.status||'').trim();
  if(rank===3)return {label:'FINAL',className:'is-final'};
  if(rank===2)return {label:raw||'LIVE',className:'is-live'};
  const tip=lsGameTime(game);return {label:tip==='TBD'?'TBD':`${tip} ET`,className:'is-next'};
}
function playoffRows(){
  const standings=(lsPayload?.standings||[]).slice().sort((a,b)=>(a.overall_rank||99)-(b.overall_rank||99)).slice(0,8),games=lsCompetition?.playoffs?.games||[],series=playoffSeries(games);
  return standings.map((standing,index)=>{
    const name=lsTeamName(standing),matchup=series.find(item=>item.round==='First Round'&&(item.teamA===name||item.teamB===name)),opponent=matchup?(matchup.teamA===name?matchup.teamB:matchup.teamA):'',wins=matchup?(matchup.teamA===name?matchup.winsA:matchup.winsB):0,losses=matchup?(matchup.teamA===name?matchup.winsB:matchup.winsA):0,game=playoffGameForSeries(matchup||{}),baseStatus=playoffStatus(game||{});
    const advanced=Boolean(matchup?.complete&&matchup.winner===name),eliminated=Boolean(matchup?.complete&&matchup.winner&&matchup.winner!==name);
    const status=advanced?{label:'ADVANCED',className:'is-advanced'}:eliminated?{label:'ELIMINATED',className:'is-eliminated'}:baseStatus;
    let score='—';
    if(game&&lsGameStateRank(game)>1&&game.homeScore!==null&&game.homeScore!==undefined&&game.awayScore!==null&&game.awayScore!==undefined&&Number.isFinite(Number(game.homeScore))&&Number.isFinite(Number(game.awayScore))){const teamScore=game.homeTeam===name?game.homeScore:game.awayScore,opponentScore=game.homeTeam===name?game.awayScore:game.homeScore;score=`${teamScore}–${opponentScore}`;}
    return {name,seed:standing.overall_rank||index+1,wins,losses,pct:wins+losses?wins/(wins+losses):0,opponent,game,status,score,advanced,eliminated,seriesComplete:Boolean(matchup?.complete)};
  });
}
function playoffView(){
  const rows=playoffRows(),liveCount=(lsCompetition?.playoffs?.games||[]).filter(game=>lsGameStateRank(game)===2).length,eliminated=rows.filter(row=>row.eliminated).length;
  return `<div class="page-note playoff-board-intro"><strong>${liveCount?`${liveCount} playoff ${liveCount===1?'game':'games'} live now`:'First-round series board'}</strong><p>Seeds, series records, scores and advancement status update from the same playoff feed as Games. ${eliminated?`${eliminated} team${eliminated===1?' has':'s have'} been eliminated.`:''}</p></div><div class="live-standings-table playoff-standings-table"><div class="live-standings-row playoff-standings-row head"><span>TEAM</span><span>SEED</span><span>SERIES</span><span>W</span><span>L</span><span>PCT</span><span>OPPONENT</span><span>GAME</span><span>SCORE</span><span>STATUS</span></div>${rows.map(row=>`<div class="live-standings-row playoff-standings-row ${row.eliminated?'is-eliminated':row.advanced?'is-advanced':''}"><span class="live-team-cell"><b class="live-rank">${row.seed}</b><strong>${lsTeamLink(row.name)}</strong>${row.eliminated?'<span class="playoff-marker eliminated" title="Eliminated">×</span>':row.advanced?'<span class="playoff-marker clinched" title="Advanced">✓</span>':''}</span><strong>${row.seed}</strong><strong>${row.wins}–${row.losses}</strong><strong>${row.wins}</strong><strong>${row.losses}</strong><span>${lsPct(row.pct)}</span><span>${row.opponent?lsTeamLink(row.opponent,'live-team-link'):'—'}</span><span>${row.seriesComplete?'DONE':row.game?`G${row.game.gameNumber||1}`:'—'}</span><strong>${row.score}</strong><span class="playoff-status-cell ${row.status.className}">${lsSafe(row.status.label)}</span></div>`).join('')}</div>`;
}

function preferredCompetition(){
  const requested=new URLSearchParams(location.search).get('competition');
  if(['season','cup','playoffs'].includes(requested)){lsCompPinned=true;return requested;}
  const playoffs=lsCompetition?.playoffs||{},start=Date.parse(`${playoffs.starts||'2026-09-27'}T00:00:00-04:00`);
  return playoffs.started||Date.now()>=start?'playoffs':'season';
}
function activateCompetitionButtons(){
  document.querySelectorAll('[data-live-competition]').forEach(button=>{const on=button.dataset.liveCompetition===lsCompMode;button.classList.toggle('active',on);button.setAttribute('aria-pressed',String(on));if(button.dataset.liveCompetition==='playoffs')button.textContent=(lsCompetition?.playoffs?.games||[]).some(game=>lsGameStateRank(game)===2)?'Playoffs · LIVE':'Playoffs';});
}
function renderLiveStats(){
  const box=document.getElementById('liveStatsTable'),title=document.getElementById('liveStatsTitle'),kicker=document.getElementById('liveStatsKicker'),foot=document.getElementById('liveStatsFootnote'),regular=document.getElementById('regularStandingsToggle');
  if(!box||!lsPayload)return;
  activateCompetitionButtons();
  if(regular)regular.style.display=lsCompMode==='season'?'flex':'none';
  if(lsCompMode==='cup'){kicker.textContent='2026 COMMISSIONER’S CUP';title.textContent='Cup Standings';box.innerHTML=cupTable(lsCompetition?.cup?.standings||[]);foot.textContent='Cup pool play ran June 1–17. The June 30 championship is tracked on Games but does not alter pool standings.';return;}
  if(lsCompMode==='playoffs'){kicker.textContent='2026 PLAYOFFS';title.textContent='Playoff Standings';box.innerHTML=playoffView();foot.textContent='The playoff table refreshes live scores and series records every 10 seconds. Select a team to open its connected dashboard.';return;}
  kicker.textContent='2026 REGULAR SEASON';foot.textContent='Overall and conference standings refresh from the official WNBA statistics feed. Select a team to open its connected dashboard.';
  if(lsMode==='conference'){title.textContent='Conference Standings';box.innerHTML=lsConference(lsPayload.conferenceStandings);document.getElementById('liveOverallToggle')?.classList.remove('active');document.getElementById('liveConferenceToggle')?.classList.add('active');}
  else{title.textContent='Overall Standings';box.innerHTML=lsTable(lsPayload.standings);document.getElementById('liveOverallToggle')?.classList.add('active');document.getElementById('liveConferenceToggle')?.classList.remove('active');}
}
function setLiveStatus(updatedAt=Date.now()){
  const status=document.getElementById('liveStatsStatus'),date=new Date(updatedAt||Date.now());
  if(status)status.textContent=`Live scores checked ${date.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
}

document.getElementById('liveOverallToggle')?.addEventListener('click',()=>{lsMode='overall';renderLiveStats();});
document.getElementById('liveConferenceToggle')?.addEventListener('click',()=>{lsMode='conference';renderLiveStats();});
document.querySelectorAll('[data-live-competition]').forEach(button=>button.addEventListener('click',()=>{lsCompPinned=true;lsCompMode=button.dataset.liveCompetition;renderLiveStats();}));

async function refreshLiveStats(initial=false){
  if(lsAllLoading)return;lsAllLoading=true;
  const status=document.getElementById('liveStatsStatus'),box=document.getElementById('liveStatsTable');
  try{
    const [statsResult,competitionResult,liveResult]=await Promise.allSettled([lsFetchJson('/api/stats?season=2026&v=20260927-playoff-board-v1'),lsFetchJson('/api/competition?season=2026&v=20260927-playoff-board-v1'),lsFetchJson('/api/live-games?v=20260927-full-slate-v1')]);
    if(statsResult.status!=='fulfilled')throw statsResult.reason;
    lsPayload=statsResult.value;
    if(competitionResult.status==='fulfilled')lsCompetition=competitionResult.value;
    if(!lsCompetition)lsCompetition={cup:{standings:[]},playoffs:{games:[],started:false,starts:'2026-09-27'}};
    if(liveResult.status==='fulfilled')lsCompetition.playoffs.games=mergePlayoffGames(lsCompetition.playoffs.games||[],liveResult.value.todayGames||liveResult.value.games||[]);
    if(initial||!lsCompPinned)lsCompMode=preferredCompetition();
    renderLiveStats();
    setLiveStatus(liveResult.status==='fulfilled'?liveResult.value.updatedAt:lsPayload.updatedAt);
  }catch(error){if(!lsPayload&&box)box.innerHTML='<div class="card-pad"><strong>Live standings could not load.</strong><p>Try again shortly.</p></div>';if(status)status.textContent='Live feed temporarily unavailable';}
  finally{lsAllLoading=false;}
}
async function refreshPlayoffScores(){
  if(lsLiveLoading||!lsCompetition)return;lsLiveLoading=true;
  try{const payload=await lsFetchJson('/api/live-games?v=20260927-full-slate-v1');lsCompetition.playoffs.games=mergePlayoffGames(lsCompetition.playoffs.games||[],payload.todayGames||payload.games||[]);if(!lsCompPinned)lsCompMode=preferredCompetition();if(lsCompMode==='playoffs')renderLiveStats();setLiveStatus(payload.updatedAt);}catch{}finally{lsLiveLoading=false;}
}

activateCompetitionButtons();
document.getElementById('regularStandingsToggle')?.style.setProperty('display','none');
if(document.getElementById('liveStatsKicker'))document.getElementById('liveStatsKicker').textContent='2026 PLAYOFFS';
if(document.getElementById('liveStatsTitle'))document.getElementById('liveStatsTitle').textContent='Playoff Standings';
refreshLiveStats(true);
setInterval(()=>{if(!document.hidden)refreshPlayoffScores();},10000);
setInterval(()=>{if(!document.hidden)refreshLiveStats(false);},60000);
window.addEventListener('focus',refreshPlayoffScores);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshPlayoffScores();});
