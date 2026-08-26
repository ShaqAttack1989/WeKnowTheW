const ESPN_SCOREBOARD='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';
const WNBA_SCHEDULE='https://cdn.wnba.com/static/json/staticData/scheduleLeagueV2.json';
const WNBA_BOXSCORE_ROOT='https://cdn.wnba.com/static/json/liveData/boxscore';
const TIME_ZONE='America/New_York';

function num(value){if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)?n:null;}
function norm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function fullName(team={}){return [team.teamCity,team.teamName].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();}
function easternDate(value=new Date()){
  const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return '';
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),get=t=>parts.find(p=>p.type===t)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function espnDateParam(){return easternDate().replaceAll('-','');}
async function fetchJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',Referer:'https://www.wnba.com/','Cache-Control':'no-cache'},cache:'no-store'});
  if(!response.ok)throw new Error(`${new URL(url).hostname} returned ${response.status}`);
  return response.json();
}
function broadcastLabels(value){
  const out=[],seenObjects=new WeakSet();
  const walk=node=>{if(!node)return;if(Array.isArray(node)){node.forEach(walk);return;}if(typeof node!=='object'||seenObjects.has(node))return;seenObjects.add(node);const media=`${node.broadcasterMedia||node.media||''} ${node.type||''}`.toLowerCase();if(!/radio|audio/.test(media)){const label=node.broadcasterDisplay||node.broadcasterAbbreviation||node.broadcasterDescription||node.displayName||node.name;if(label)out.push(String(label).trim());}Object.values(node).forEach(child=>{if(child&&typeof child==='object')walk(child);});};
  walk(value);const seen=new Set();return out.filter(label=>{const k=label.toLowerCase();if(!label||seen.has(k))return false;seen.add(k);return true;});
}
function statusText(game={}){
  if(game.gameStatusText)return String(game.gameStatusText);
  const period=num(game.period),clock=String(game.gameClock||'').replace(/^PT|S$/g,'');
  if(period&&clock)return `${period>4?`OT${period-4}`:`Q${period}`} ${clock}`;
  return 'Live';
}
function normalizeOfficial(game={},schedule={}){
  const home=game.homeTeam||{},away=game.awayTeam||{},start=game.gameTimeUTC||game.gameDateTimeUTC||game.gameEt||schedule.startTimeUtc||'';
  return {id:String(game.gameId||schedule.gameId||''),startTimeUtc:start,date:easternDate(start)||schedule.date||'',homeTeam:fullName(home)||schedule.homeTeam||'',awayTeam:fullName(away)||schedule.awayTeam||'',homeScore:num(home.score),awayScore:num(away.score),venue:game.arena?.arenaName||game.arenaName||schedule.venue||'',status:statusText(game),state:Number(game.gameStatus)===3?'post':Number(game.gameStatus)===2?'in':'pre',period:num(game.period),clock:String(game.gameClock||''),broadcasts:schedule.broadcasts||[],completed:Number(game.gameStatus)===3,source:'Official WNBA live boxscore'};
}
function normalizeSchedule(game={},groupDate=''){
  const home=game.homeTeam||{},away=game.awayTeam||{},start=game.gameDateTimeUTC||game.gameTimeUTC||game.gameDateTimeEst||'',arena=game.arena||{};
  return {gameId:String(game.gameId||''),startTimeUtc:start,date:easternDate(start)||String(groupDate||game.gameDate||'').slice(0,10),homeTeam:fullName(home),awayTeam:fullName(away),homeScore:num(home.score),awayScore:num(away.score),venue:arena.arenaName||game.arenaName||'',status:String(game.gameStatusText||'Live'),state:Number(game.gameStatus)===2?'in':Number(game.gameStatus)===3?'post':'pre',period:num(game.period),clock:String(game.gameClock||''),broadcasts:broadcastLabels(game.broadcasters),completed:Number(game.gameStatus)===3,source:'Official WNBA schedule'};
}
function normalizeEspn(event={}){
  const competition=event.competitions?.[0]||{},competitors=Array.isArray(competition.competitors)?competition.competitors:[],home=competitors.find(x=>x.homeAway==='home')||{},away=competitors.find(x=>x.homeAway==='away')||{},type=event.status?.type||competition.status?.type||{},status=event.status||competition.status||{},start=event.date||competition.date||'';
  return {id:String(event.id||competition.id||''),startTimeUtc:start,date:easternDate(start),homeTeam:home.team?.displayName||'',awayTeam:away.team?.displayName||'',homeScore:num(home.score),awayScore:num(away.score),venue:competition.venue?.fullName||'',status:type.shortDetail||type.detail||type.description||'Live',state:type.state||'',period:num(status.period),clock:String(status.displayClock||''),broadcasts:[...new Set((competition.broadcasts||[]).flatMap(x=>x.names||[]).filter(Boolean))],completed:Boolean(type.completed),source:'ESPN live scoreboard'};
}
function gameKey(game={}){return `${game.date||''}|${norm(game.awayTeam)}|${norm(game.homeTeam)}`;}
function freshness(game={}){const period=Number(game.period)||0,score=(Number(game.homeScore)||0)+(Number(game.awayScore)||0),official=String(game.source||'').startsWith('Official WNBA')?1000000:0;return official+period*10000+score;}
function mergeGames(...lists){const map=new Map();lists.flat().forEach(game=>{if(!game||game.state!=='in'||!game.homeTeam||!game.awayTeam)return;const k=gameKey(game),current=map.get(k);if(!current||freshness(game)>=freshness(current))map.set(k,game);});return [...map.values()].sort((a,b)=>Date.parse(a.startTimeUtc||0)-Date.parse(b.startTimeUtc||0));}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const errors=[];let espnLive=[],scheduleLive=[],officialLive=[];
  const stamp=Date.now();
  const [espnResult,scheduleResult]=await Promise.allSettled([
    fetchJson(`${ESPN_SCOREBOARD}?dates=${espnDateParam()}&limit=100&_=${stamp}`),
    fetchJson(`${WNBA_SCHEDULE}?_=${stamp}`)
  ]);
  if(espnResult.status==='fulfilled')espnLive=(Array.isArray(espnResult.value.events)?espnResult.value.events:[]).map(normalizeEspn).filter(g=>g.state==='in');else errors.push({source:'ESPN',message:espnResult.reason.message});
  if(scheduleResult.status==='fulfilled'){
    const groups=Array.isArray(scheduleResult.value?.leagueSchedule?.gameDates)?scheduleResult.value.leagueSchedule.gameDates:[];
    scheduleLive=groups.flatMap(group=>(Array.isArray(group.games)?group.games:[]).map(game=>normalizeSchedule(game,group.gameDate))).filter(g=>g.state==='in');
    if(scheduleLive.length){
      const boxResults=await Promise.allSettled(scheduleLive.map(game=>fetchJson(`${WNBA_BOXSCORE_ROOT}/boxscore_${encodeURIComponent(game.gameId)}.json?_=${stamp}`)));
      officialLive=boxResults.map((result,index)=>result.status==='fulfilled'&&result.value?.game?normalizeOfficial(result.value.game,scheduleLive[index]):null).filter(Boolean).filter(g=>g.state==='in');
      boxResults.forEach((result,index)=>{if(result.status==='rejected')errors.push({source:`WNBA boxscore ${scheduleLive[index]?.gameId||''}`,message:result.reason.message});});
    }
  }else errors.push({source:'Official WNBA schedule',message:scheduleResult.reason.message});
  const games=mergeGames(espnLive,scheduleLive,officialLive);
  res.setHeader('Cache-Control','no-store, max-age=0');
  return res.status(200).json({source:'Official WNBA live boxscores + ESPN live scoreboard backup',updatedAt:new Date().toISOString(),games,errors});
};
