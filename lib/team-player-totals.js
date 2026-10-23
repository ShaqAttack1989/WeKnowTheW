// Regular-season rows come from public tables; playoff rows use completed ESPN boxscores.
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
const ESPN_SCOREBOARD_ROOT='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';
const ESPN_SUMMARY_ROOT='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/summary';
const COMPETITION_URL='https://www.weknowthew.com/api/competition';
const ESPN_STATS_URL='https://www.espn.com/wnba/scoreboard';
const TEAM_NAME_CODES={
  atl:'ATL','atlanta dream':'ATL',chi:'CHI','chicago sky':'CHI',con:'CON','connecticut sun':'CON',
  dal:'DAL','dallas wings':'DAL',gs:'GSV',gsv:'GSV','golden state valkyries':'GSV',ind:'IND','indiana fever':'IND',
  lva:'LVA',lv:'LVA','las vegas aces':'LVA',las:'LAS',la:'LAS','los angeles sparks':'LAS',min:'MIN','minnesota lynx':'MIN',
  nyl:'NYL','new york liberty':'NYL',pho:'PHO',phx:'PHO','phoenix mercury':'PHO',por:'POR','portland fire':'POR',
  sea:'SEA','seattle storm':'SEA',tor:'TOR','toronto tempo':'TOR',was:'WAS','washington mystics':'WAS'
};

function playoffGame(event={}) {
  const notes=event.competitions?.[0]?.notes||event.notes||[];
  const label=notes.map(note=>note?.headline||note?.text||'').join(' ');
  return /first round|semifinals|wnba finals/i.test(label);
}

function gameIsFinal(event={}) {
  const status=event.status?.type||event.competitions?.[0]?.status?.type||{};
  return Boolean(status.completed)||String(status.state||'').toLowerCase()==='post'||/\bfinal\b/i.test(String(status.shortDetail||status.detail||status.description||''));
}

function statNumber(value) {
  if(value===null||value===undefined||value==='')return 0;
  const number=Number(value);
  return Number.isFinite(number)?number:0;
}

function officialTeamCode(value) {
  const team=String(value||'').trim().toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ');
  return TEAM_NAME_CODES[team]||'';
}

function minutesPlayed(value) {
  const text=String(value||'').trim();
  if(text.includes(':')){
    const [minutes,seconds]=text.split(':');
    return statNumber(minutes)+(statNumber(seconds)/60);
  }
  return statNumber(text);
}

function madeAttempted(value) {
  const match=String(value||'').match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  return match?{made:Number(match[1]),attempted:Number(match[2])}:{made:0,attempted:0};
}

function addEspnBoxscorePlayers(totals,summary) {
  for(const group of Array.isArray(summary?.boxscore?.players)?summary.boxscore.players:[]) {
    const code=officialTeamCode(group.team?.displayName||group.team?.abbreviation);
    if(!TEAM_CODES.has(code))continue;
    for(const statGroup of Array.isArray(group.statistics)?group.statistics:[]) {
      const keys=Array.isArray(statGroup.keys)?statGroup.keys:[];
      for(const player of Array.isArray(statGroup.athletes)?statGroup.athletes:[]) {
        const values=Array.isArray(player.stats)?player.stats:[];
        const stats=Object.fromEntries(keys.map((key,index)=>[key,values[index]]));
        const mp=minutesPlayed(stats.minutes);
        if(mp<=0)continue;
        const athlete=player.athlete||{},name=clean(athlete.displayName||athlete.fullName||'');
        if(!name)continue;
        const fg=madeAttempted(stats['fieldGoalsMade-fieldGoalsAttempted']);
        const fg3=madeAttempted(stats['threePointFieldGoalsMade-threePointFieldGoalsAttempted']);
        const ft=madeAttempted(stats['freeThrowsMade-freeThrowsAttempted']);
        const id=String(athlete.id||`${name.toLowerCase()}|${code}`),key=`${id}|${code}`;
        const row=totals.get(key)||{name,team:code,g:0,mp:0,pts:0,trb:0,ast:0,stl:0,blk:0,tov:0,fg:0,fga:0,fg3:0,fg3a:0,ft:0,fta:0,plusMinus:0};
        row.g+=1;
        row.mp+=mp;
        row.pts+=statNumber(stats.points);
        row.trb+=statNumber(stats.rebounds);
        row.ast+=statNumber(stats.assists);
        row.stl+=statNumber(stats.steals);
        row.blk+=statNumber(stats.blocks);
        row.tov+=statNumber(stats.turnovers);
        row.fg+=fg.made;row.fga+=fg.attempted;
        row.fg3+=fg3.made;row.fg3a+=fg3.attempted;
        row.ft+=ft.made;row.fta+=ft.attempted;
        row.plusMinus+=statNumber(stats.plusMinus);
        totals.set(key,row);
      }
    }
  }
}

async function fetchPlayoffTotals(fetchImpl=fetch, timeoutMs=15000, season=2026, requestedTeam='') {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  const headers={Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)',Referer:'https://www.wnba.com/','Cache-Control':'no-cache'};
  const teamFilter=officialTeamCode(requestedTeam);
  if(!teamFilter){clearTimeout(timer);throw new Error('Choose a current WNBA team code.');}
  const fetchJson=async url=>{
    const response=await fetchImpl(url,{headers,signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw new Error('ESPN statistics returned '+response.status);
    return response.json();
  };
  try {
    const competition=await fetchJson(`${COMPETITION_URL}?season=${encodeURIComponent(season)}`);
    const scheduleGames=(Array.isArray(competition?.playoffs?.games)?competition.playoffs.games:[]).filter(game=>
      String(game.date||'').slice(0,4)===String(season)&&(game.completed||game.state==='post')&&
      [game.homeTeam,game.awayTeam].some(name=>officialTeamCode(name)===teamFilter)
    );
    const expected=new Map();
    for(const game of scheduleGames){
      const date=String(game.date||'').slice(0,10),teams=[officialTeamCode(game.homeTeam),officialTeamCode(game.awayTeam)].sort();
      if(date&&teams.every(Boolean))expected.set(`${date}|${teams.join('|')}`,{date,teams});
    }
    const dates=[...new Set([...expected.values()].map(game=>game.date.replaceAll('-','')))];
    const dailyResults=await Promise.allSettled(dates.map(date=>fetchJson(`${ESPN_SCOREBOARD_ROOT}?dates=${encodeURIComponent(date)}&limit=100&_=${Date.now()}`)));
    const dailyFailure=dailyResults.find(result=>result.status==='rejected');
    if(dailyFailure)throw new Error(`ESPN playoff schedule is temporarily unavailable (${dailyFailure.reason?.message||'request failed'}).`);
    const matched=new Map();
    dailyResults.forEach((result,index)=>{
      const requestedDate=dates[index].replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3');
      for(const event of Array.isArray(result.value?.events)?result.value.events:[]){
        if(!event.id||!playoffGame(event)||!gameIsFinal(event))continue;
        const teams=(event.competitions?.[0]?.competitors||[]).map(side=>officialTeamCode(side.team?.displayName||side.team?.abbreviation)).sort();
        const key=`${requestedDate}|${teams.join('|')}`;
        if(expected.has(key))matched.set(key,event);
      }
    });
    if(matched.size!==expected.size)throw new Error('ESPN has not returned every completed playoff boxscore yet.');
    const games=[...matched.values()];
    const results=await Promise.allSettled(games.map(game=>fetchJson(`${ESPN_SUMMARY_ROOT}?event=${encodeURIComponent(game.id)}`)));
    if(results.some(result=>result.status==='rejected'))throw new Error('One or more completed playoff boxscores are temporarily unavailable.');
    const totals=new Map();
    results.forEach(result=>addEspnBoxscorePlayers(totals,result.value));
    const players=[...totals.values()].filter(player=>player.team===teamFilter);
    return {season,seasonType:'Playoffs',source:'ESPN boxscores',sourceUrl:ESPN_STATS_URL,checkedAt:new Date().toISOString(),gamesIncluded:games.length,players};
  } finally {clearTimeout(timer);}
}
module.exports={parseTotals,complete,fetchTotals,fetchPlayoffTotals};
