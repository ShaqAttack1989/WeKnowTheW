// Regular-season rows come from public tables; playoff rows use official WNBA game feeds.
const FIELDS = ['g','mp','pts','trb','ast','stl','blk','fg','fga','fg3','fg3a','ft','fta'];
const TEAM_CODES = new Set(['ATL','CHI','CON','DAL','GSV','IND','LVA','LAS','MIN','NYL','PHO','PHX','POR','SEA','TOR','WAS']);
function clean(value = '') {
  return String(value).replace(/<[^>]*>?/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
    .replace(/&#39;|&#x27;/gi,"'").replace(/&quot;/g,'"')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/\s+/g,' ').trim();
}
function numeric(value) {
  const text=clean(value).replace(/,/g,'');
  if(!text || !/^\d+(?:\.\d+)?$/.test(text))return null;
  const number=Number(text);return Number.isFinite(number)?number:null;
}
function cell(row, field) {
  return row.match(new RegExp(`<(?:td|th)\\b[^>]*data-stat=["']${field}["'][^>]*>([\\s\\S]*?)<\\/(?:td|th)>`,'i'))?.[1] || '';
}
function parseTotals(html) {
  const byPlayerTeam=new Map();
  for(const match of String(html).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const raw=match[1],name=clean(cell(raw,'player'));
    const team=clean(cell(raw,'team')||cell(raw,'team_name_abbr')||cell(raw,'team_id')).toUpperCase();
    if(!name || !TEAM_CODES.has(team))continue; // Combined multi-team rows are never team statistics.
    const row={name,team:team==='PHX'?'PHO':team};
    for(const field of FIELDS)row[field]=numeric(cell(raw,field));
    if(!row.g || row.pts===null)continue;
    const key=`${name}|${row.team}`,old=byPlayerTeam.get(key);
    if(!old || row.g>old.g || (row.g===old.g && (row.mp||0)>(old.mp||0)))byPlayerTeam.set(key,row);
  }
  return [...byPlayerTeam.values()];
}
function complete(rows) {
  const teams=new Set(rows.map(row=>row.team));
  return rows.length>=120 && teams.size===15;
}
async function fetchTotals(fetchImpl=fetch, timeoutMs=6500) {
  const url='https://www.basketball-reference.com/wnba/years/2026_totals.html';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetchImpl(url,{headers:{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'},signal:controller.signal});
    if(!response.ok)throw new Error(`Statistics source returned ${response.status}`);
    const players=parseTotals(await response.text());
    if(!complete(players))throw new Error('Statistics source did not return all 15 active teams');
    return {season:2026,source:'Basketball-Reference',sourceUrl:url,checkedAt:new Date().toISOString(),players};
  } finally {clearTimeout(timer);}
}
const WNBA_SCHEDULE_URL='https://cdn.wnba.com/static/json/staticData/scheduleLeagueV2_10.json';
const WNBA_BOXSCORE_ROOT='https://cdn.wnba.com/static/json/liveData/boxscore';
const WNBA_STATS_URL='https://www.wnba.com/stats/players/traditional';

function playoffGame(game={}) {
  return /^(first round|semifinals|wnba finals)$/i.test(String(game.gameLabel||'').trim());
}

function minutesPlayed(value) {
  const text=String(value||'').trim();
  const match=text.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if(!match)return null;
  return (Number(match[1]||0)*60)+Number(match[2]||0)+(Number(match[3]||0)/60);
}

function statNumber(value) {
  if(value===null||value===undefined||value==='')return 0;
  const number=Number(value);
  return Number.isFinite(number)?number:0;
}

function officialTeamCode(value) {
  const team=String(value||'').trim().toUpperCase();
  return team==='PHX'?'PHO':team;
}

function addBoxscorePlayers(totals,game) {
  for(const side of ['homeTeam','awayTeam']) {
    const team=game?.[side]||{},code=officialTeamCode(team.teamTricode);
    if(!TEAM_CODES.has(code))continue;
    for(const player of Array.isArray(team.players)?team.players:[]) {
      const stats=player.statistics||{},mp=minutesPlayed(stats.minutes)??minutesPlayed(stats.minutesCalculated)??0;
      if(String(player.played)!=='1'&&mp<=0)continue;
      const name=clean(player.name||[player.firstName,player.familyName].filter(Boolean).join(' '));
      if(!name)continue;
      const id=String(player.personId||`${name.toLowerCase()}|${code}`),key=`${id}|${code}`;
      const row=totals.get(key)||{name,team:code,g:0,mp:0,pts:0,trb:0,ast:0,stl:0,blk:0,tov:0,fg:0,fga:0,fg3:0,fg3a:0,ft:0,fta:0,plusMinus:0};
      row.g+=1;
      row.mp+=mp;
      row.pts+=statNumber(stats.points);
      row.trb+=statNumber(stats.reboundsTotal);
      row.ast+=statNumber(stats.assists);
      row.stl+=statNumber(stats.steals);
      row.blk+=statNumber(stats.blocks);
      row.tov+=statNumber(stats.turnovers);
      row.fg+=statNumber(stats.fieldGoalsMade);
      row.fga+=statNumber(stats.fieldGoalsAttempted);
      row.fg3+=statNumber(stats.threePointersMade);
      row.fg3a+=statNumber(stats.threePointersAttempted);
      row.ft+=statNumber(stats.freeThrowsMade);
      row.fta+=statNumber(stats.freeThrowsAttempted);
      row.plusMinus+=statNumber(stats.plusMinusPoints);
      totals.set(key,row);
    }
  }
}

async function fetchPlayoffTotals(fetchImpl=fetch, timeoutMs=15000, season=2026) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  const headers={Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'};
  const fetchJson=async url=>{
    const response=await fetchImpl(url,{headers,signal:controller.signal});
    if(!response.ok)throw new Error('Official WNBA statistics returned '+response.status);
    return response.json();
  };
  try {
    const schedule=await fetchJson(WNBA_SCHEDULE_URL),league=schedule?.leagueSchedule||{};
    if(Number(league.seasonYear)!==Number(season))throw new Error('Official WNBA schedule does not include the requested season.');
    const games=(Array.isArray(league.gameDates)?league.gameDates:[])
      .flatMap(day=>Array.isArray(day.games)?day.games:[])
      .filter(game=>playoffGame(game)&&Number(game.gameStatus)===3&&game.gameId);
    const results=await Promise.allSettled(games.map(game=>fetchJson(`${WNBA_BOXSCORE_ROOT}/boxscore_${encodeURIComponent(game.gameId)}.json`)));
    const failed=results.find(result=>result.status==='rejected');
    if(failed)throw new Error('One or more official WNBA playoff boxscores are temporarily unavailable.');
    const totals=new Map();
    results.forEach(result=>addBoxscorePlayers(totals,result.value?.game||{}));
    return {season,seasonType:'Playoffs',source:'Official WNBA boxscores',sourceUrl:WNBA_STATS_URL,checkedAt:new Date().toISOString(),gamesIncluded:games.length,players:[...totals.values()]};
  } finally {clearTimeout(timer);}
}
module.exports={parseTotals,complete,fetchTotals,fetchPlayoffTotals};
