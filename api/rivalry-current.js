const LEAGUE_ID=4516;
const V1_ROOT='https://www.thesportsdb.com/api/v1/json';
const V2_ROOT='https://www.thesportsdb.com/api/v2/json';
const FREE_KEY='123';
const {getWnbaScoreboard}=require('../lib/wehoop-espn');

const CURRENT_TEAMS=[
  ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
].map(([slug,name,abbr])=>({slug,name,abbr}));

const REGULAR_SEASON_WINDOWS={2026:{start:'2026-05-08',end:'2026-09-24'}};

function norm(value=''){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
const TEAM_BY_NAME=new Map(CURRENT_TEAMS.map(team=>[norm(team.name),team]));
function canonical(name=''){return TEAM_BY_NAME.get(norm(name))?.slug||null;}
function scoreValue(value){if(value===null||value===undefined||value==='')return null;const raw=typeof value==='object'?(value.value??value.displayValue??value.score):value;const number=Number(raw);return Number.isFinite(number)?number:null;}
function asDate(value){if(!value)return null;const date=new Date(`${String(value).slice(0,10)}T12:00:00Z`);return Number.isNaN(date.getTime())?null:date;}
function inRegularSeason(date,season){const window=REGULAR_SEASON_WINDOWS[season];if(!window)return true;const current=asDate(date),start=asDate(window.start),end=asDate(window.end);return Boolean(current&&start&&end&&current>=start&&current<=end);}
function isCupFinal(game,season){if(season!==2026||game.date!=='2026-06-30')return false;const pair=[game.home,game.away].sort().join('|');return pair===['las-vegas-aces','new-york-liberty'].sort().join('|');}
function blank(){return {wins:0,losses:0};}
function add(records,team,opp,won){const key=`${team}|${opp}`;const record=records.get(key)||blank();won?record.wins++:record.losses++;records.set(key,record);}
function build(games){const records=new Map();for(const game of games){add(records,game.home,game.away,game.homeScore>game.awayScore);add(records,game.away,game.home,game.awayScore>game.homeScore);}return records;}
function rec(records,a,b){return records.get(`${a}|${b}`)||blank();}
function edge(record){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}

async function fetchJson(url,options={}){const response=await fetch(url,{...options,headers:{Accept:'application/json',...(options.headers||{})}});const text=await response.text();let body={};try{body=text?JSON.parse(text):{};}catch{body={};}if(!response.ok)throw new Error(body?.message||body?.error||`Provider returned ${response.status}`);return body;}
async function sportsDbSchedule(season){const key=String(process.env.THESPORTSDB_API_KEY||'').trim();if(key){const body=await fetchJson(`${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`,{headers:{'X-API-KEY':key}});return Array.isArray(body.schedule)?body.schedule:[];}const body=await fetchJson(`${V1_ROOT}/${FREE_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${encodeURIComponent(season)}`);return Array.isArray(body.events)?body.events:[];}
function sportsDbFinished(event={}){const home=scoreValue(event.intHomeScore),away=scoreValue(event.intAwayScore);if(home===null||away===null||home===away)return false;if(event.boolCompleted===true)return true;const status=String(event.strStatus||'').toUpperCase();if(/FINAL|\bFT\b|AET|MATCH FINISHED/.test(status))return true;const ts=Date.parse(event.strTimestamp||`${event.dateEvent||''}T${event.strTime||'12:00:00'}Z`);return Number.isFinite(ts)&&ts<Date.now();}
function fromSportsDb(events,season){return events.map(event=>{const date=String(event.dateEvent||event.dateEventLocal||event.strTimestamp||'').slice(0,10);return {date,home:canonical(event.strHomeTeam||''),away:canonical(event.strAwayTeam||''),homeScore:scoreValue(event.intHomeScore),awayScore:scoreValue(event.intAwayScore),completed:sportsDbFinished(event)};}).filter(game=>game.completed&&game.home&&game.away&&inRegularSeason(game.date,season)&&!isCupFinal(game,season));}
function fromEspn(events,season){return (Array.isArray(events)?events:[]).map(event=>({date:String(event.date||event.startTimeUtc||'').slice(0,10),home:canonical(event.homeTeam||''),away:canonical(event.awayTeam||''),homeScore:scoreValue(event.homeScore),awayScore:scoreValue(event.awayScore),completed:Boolean(event.completed)||String(event.state||'').toLowerCase()==='post'||String(event.status||'').toLowerCase().includes('final')})).filter(game=>game.completed&&game.home&&game.away&&game.homeScore!==null&&game.awayScore!==null&&game.homeScore!==game.awayScore&&inRegularSeason(game.date,season)&&!isCupFinal(game,season));}
function mergeGames(primary=[],secondary=[]){const key=game=>`${game.date}|${[game.home,game.away].sort().join('|')}`;const map=new Map(primary.map(game=>[key(game),game]));for(const game of secondary)if(!map.has(key(game)))map.set(key(game),game);return [...map.values()];}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number(req.query.season)||2026;
  res.setHeader('Cache-Control','no-store, max-age=0');
  const errors=[];
  let sportsGames=[],espnGames=[];
  try{sportsGames=fromSportsDb(await sportsDbSchedule(season),season);}catch(error){errors.push(`TheSportsDB: ${error.message}`);}
  try{espnGames=fromEspn(await getWnbaScoreboard(season),season);}catch(error){errors.push(`ESPN: ${error.message}`);}
  const games=mergeGames(sportsGames,espnGames);
  if(!games.length)return res.status(503).json({error:`No completed ${season} regular-season games were returned.`,providerErrors:errors,sourceVersion:'20260823-rivalry-current-v1'});
  const records=build(games),matrix={},rows={};
  for(const team of CURRENT_TEAMS){matrix[team.slug]={};rows[team.slug]=[];for(const opponent of CURRENT_TEAMS){if(team.slug===opponent.slug)continue;const record=rec(records,team.slug,opponent.slug);matrix[team.slug][opponent.slug]=record;rows[team.slug].push({opponent,season:{...record,edge:edge(record)}});}}
  return res.status(200).json({updatedAt:new Date().toISOString(),season,teams:CURRENT_TEAMS,matrix,rows,coverage:{seasonGameCount:games.length,sportsDbGameCount:sportsGames.length,espnGameCount:espnGames.length},providerErrors:errors,source:sportsGames.length?'TheSportsDB schedule with ESPN backup':'ESPN public scoreboard',sourceVersion:'20260823-rivalry-current-v1'});
};
