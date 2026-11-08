const ROOT='https://site.api.espn.com/apis';
const WEB='https://site.web.api.espn.com/apis/common/v3';
const BASE='/sports/basketball/womens-college-basketball';
const LEADER_SPECS=[
 {key:'pointsPerGame',section:'offensive',stat:'avgPoints',label:'Points per game',short:'PPG',sort:'desc'},
 {key:'totalPoints',section:'offensive',stat:'points',label:'Total points',short:'PTS',sort:'desc'},
 {key:'reboundsPerGame',section:'general',stat:'avgRebounds',label:'Rebounds per game',short:'RPG',sort:'desc'},
 {key:'assistsPerGame',section:'offensive',stat:'avgAssists',label:'Assists per game',short:'APG',sort:'desc'},
 {key:'stealsPerGame',section:'defensive',stat:'avgSteals',label:'Steals per game',short:'SPG',sort:'desc'},
 {key:'blocksPerGame',section:'defensive',stat:'avgBlocks',label:'Blocks per game',short:'BPG',sort:'desc'}
];
const withTimeout=(url)=>fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)}).then(async response=>{if(!response.ok)throw new Error('Upstream '+response.status);return response.json()});
function dayStamp(date){return date.toISOString().slice(0,10).replace(/-/g,'')}
function collectDivisionOneTeams(node,ids=new Set()){
 if(!node||typeof node!=='object')return ids;
 if(Array.isArray(node)){node.forEach(item=>collectDivisionOneTeams(item,ids));return ids}
 if(node.team?.id)ids.add(String(node.team.id));
 for(const [key,value]of Object.entries(node))if(key!=='team'&&value&&typeof value==='object')collectDivisionOneTeams(value,ids);
 return ids;
}
function metricValue(entry,section,stat){
 const group=(entry.categories||[]).find(category=>category.name===section);
 const index=group?.names?.indexOf(stat)??-1;
 const value=index>=0?Number(group.values?.[index]):NaN;
 return Number.isFinite(value)?value:null;
}
function displayMetric(value,spec){return spec.key==='totalPoints'?Math.round(value).toLocaleString():Number(value).toFixed(1)}
function profileUrl(athlete){
 const link=(athlete.links||[]).find(item=>item.rel?.includes('playercard')&&item.href?.startsWith('https://www.espn.com/'));
 return link?.href||'';
}
function cleanLeader(entry,spec,rank){
 const athlete=entry.athlete||{};
 const team=athlete.teams?.[0]||{};
 const value=metricValue(entry,spec.section,spec.stat);
 return{
  rank,
  name:athlete.displayName||athlete.fullName||'Player',
  team:team.displayName||team.shortDisplayName||athlete.teamName||'',
  teamId:String(team.id||athlete.teamId||''),
  teamLogo:team.logos?.[0]?.href||athlete.teamLogos?.[0]?.href||'',
  photo:athlete.headshot?.href||'',
  profileUrl:profileUrl(athlete),
  value,
  displayValue:value===null?'—':displayMetric(value,spec),
  gamesPlayed:metricValue(entry,'general','gamesPlayed')
 };
}
async function getLeaders(season,teamIds){
 const pairs=await Promise.all(LEADER_SPECS.map(async spec=>{
  try{
   const params=new URLSearchParams({region:'us',lang:'en',contentorigin:'espn',isqualified:'true',limit:'500',page:'1',season:String(season),category:spec.section,sort:`${spec.section}.${spec.stat}:${spec.sort}`});
   const feed=await withTimeout(`${WEB}${BASE}/statistics/byathlete?${params}`);
   const rows=(feed.athletes||[]).filter(row=>teamIds.has(String(row.athlete?.teamId||row.athlete?.teams?.[0]?.id||'')));
   return[spec.key,rows.slice(0,10).map((row,index)=>cleanLeader(row,spec,index+1))];
  }catch(error){return[spec.key,[]]}
 }));
 return Object.fromEntries(pairs);
}
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'})}
 const now=new Date();
 const currentSeason=now.getUTCMonth()>=6?now.getUTCFullYear()+1:now.getUTCFullYear();
 const requested=Number.parseInt(req.query.season,10);
 const season=Number.isInteger(requested)&&requested>=2020&&requested<=2035?requested:currentSeason;
 const from=new Date(now);from.setUTCDate(from.getUTCDate()-2);
 const to=new Date(now);to.setUTCDate(to.getUTCDate()+1);
 const urls={
  standings:ROOT+'/v2'+BASE+'/standings?season='+encodeURIComponent(String(season)),
  rankings:ROOT+'/site/v2'+BASE+'/rankings?season='+encodeURIComponent(String(season))
 };
 const pairs=await Promise.all(Object.entries(urls).map(async([key,url])=>{try{return[key,await withTimeout(url)]}catch(error){return[key,{_feedError:String(error.message||error)}]}}));
 const feeds=Object.fromEntries(pairs);
 const scoreDates=[from,new Date(now),to].map(dayStamp);
 const scoreResults=await Promise.all(scoreDates.map(async date=>{try{return await withTimeout(ROOT+'/site/v2'+BASE+'/scoreboard?dates='+date+'&limit=500')}catch(error){return{_feedError:String(error.message||error),events:[]}}}));
 feeds.scores={events:[...new Map(scoreResults.flatMap(feed=>feed.events||[]).map(event=>[event.id,event])).values()]};
 const teamIds=collectDivisionOneTeams(feeds.standings);
 const leaders=teamIds.size?await getLeaders(season,teamIds):Object.fromEntries(LEADER_SPECS.map(spec=>[spec.key,[]]));
 const failures=[...Object.values(feeds),...scoreResults].filter(feed=>feed._feedError).length;
 res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
 return res.status(200).json({season,seasonLabel:`${season-1}–${String(season).slice(-2)}`,updatedAt:new Date().toISOString(),source:'ESPN statistics and scoreboard feeds · Division I teams filtered from the standings feed',standings:feeds.standings,rankings:feeds.rankings,scores:feeds.scores,leaders,leaderKeys:LEADER_SPECS,partial:failures>0||Object.values(leaders).some(rows=>!rows.length)});
};
