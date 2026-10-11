const fs = require('node:fs');
const path = require('node:path');
const draftHistory = require('../data/wnba-draft-history.json');

const SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';
const SUMMARY = 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/summary';
const SNAPSHOT_PATH = path.join(__dirname, '..', 'data', 'stat-kitchen-rookie-week.json');

function clean(value=''){
  return String(value||'').replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/\s+/g,' ').trim();
}
function key(value=''){
  return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}
function number(value){
  if(value===null||value===undefined||value==='')return 0;
  const parsed=Number(String(value).replace(/[^0-9.-]/g,''));
  return Number.isFinite(parsed)?parsed:0;
}
function dateValue(value=''){
  const text=String(value||'').slice(0,10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text)?text:'';
}
function espnDate(value=''){return dateValue(value).replaceAll('-','');}
function round1(value){return Math.round((Number(value)||0)*10)/10;}
function labelsIndex(labels=[]){
  const map=new Map();
  labels.forEach((label,index)=>map.set(String(label||'').toUpperCase().replace(/[^A-Z0-9+/-]/g,''),index));
  const pick=(...names)=>names.map(name=>map.get(name)).find(index=>Number.isInteger(index)) ?? -1;
  return {pts:pick('PTS'),reb:pick('REB','TRB'),ast:pick('AST'),stl:pick('STL'),blk:pick('BLK')};
}
function statAt(stats=[],index){return index>=0?number(stats[index]):0;}
function rookieKeys(){
  const picks=Array.isArray(draftHistory?.picks)?draftHistory.picks:[];
  const rookies=new Set(picks.filter(item=>Number(item.year)===2026).map(item=>key(item.player)).filter(Boolean));
  for(const [alias,target] of Object.entries(draftHistory?.aliases||{})){
    if(rookies.has(key(target)))rookies.add(key(alias));
  }
  return rookies;
}
function readSnapshot(){
  try{
    if(!fs.existsSync(SNAPSHOT_PATH))return null;
    const payload=JSON.parse(fs.readFileSync(SNAPSHOT_PATH,'utf8'));
    return Array.isArray(payload?.leaders)&&payload.leaders.length?payload:null;
  }catch{return null;}
}
function fallbackPayload(snapshot,liveError,requested){
  return {
    ...snapshot,
    officialAward:false,
    stale:true,
    fallback:true,
    sourceStatus:'verified snapshot fallback',
    updatedAt:snapshot.generatedAt||snapshot.updatedAt||null,
    requestedPeriod:requested,
    note:`Showing the last verified Rookie of the Week snapshot while the live ESPN refresh recovers.${snapshot.week!==requested.week?' The requested period is newer than this verified snapshot.':''}`,
    diagnostics:{liveError:String(liveError?.message||liveError||'Live provider unavailable')}
  };
}
async function fetchJson(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),9000);
  try{
    const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)','Accept-Language':'en-US,en;q=0.9',Referer:'https://www.espn.com/'}});
    if(!response.ok)throw new Error(`ESPN returned ${response.status}`);
    return await response.json();
  }finally{clearTimeout(timer);}
}
function isCompleted(event={}){
  const type=event.status?.type||event.competitions?.[0]?.status?.type||{};
  return Boolean(type.completed)||String(type.state||'').toLowerCase()==='post'||String(type.name||type.description||'').toLowerCase().includes('final');
}
function datesBetween(start,end){
  const out=[];
  const cursor=new Date(`${start}T12:00:00Z`);
  const finish=new Date(`${end}T12:00:00Z`);
  while(cursor<=finish){out.push(cursor.toISOString().slice(0,10));cursor.setUTCDate(cursor.getUTCDate()+1);}
  return out;
}
async function completedEvents(start,end,errors){
  const days=datesBetween(start,end);
  const results=await Promise.allSettled(days.map(day=>fetchJson(`${SCOREBOARD}?limit=100&dates=${espnDate(day)}&seasontype=2`)));
  const byId=new Map();
  let successfulDays=0;
  results.forEach((result,index)=>{
    if(result.status==='fulfilled'){
      successfulDays+=1;
      for(const event of Array.isArray(result.value?.events)?result.value.events:[]){
        if(event?.id&&isCompleted(event))byId.set(String(event.id),event);
      }
    }else{
      errors.push(`${days[index]} scoreboard: ${result.reason?.message||'unavailable'}`);
    }
  });
  if(!successfulDays)throw new Error('ESPN daily scoreboard feed is unavailable for this period.');
  return [...byId.values()];
}
function athleteIsRookie(athlete={},rookies=new Set()){
  const name=athlete.displayName||athlete.fullName||[athlete.firstName,athlete.lastName].filter(Boolean).join(' ');
  if(rookies.has(key(name)))return true;
  const years=athlete.experience?.years;
  if(Number.isFinite(Number(years))&&Number(years)===0)return true;
  const label=String(athlete.experience?.displayValue||athlete.experience?.abbreviation||'').toLowerCase();
  return label.includes('rookie');
}
function aggregateSummary(body={},rookies,newTotals){
  const teams=Array.isArray(body?.boxscore?.players)?body.boxscore.players:[];
  for(const teamBlock of teams){
    const teamName=clean(teamBlock.team?.displayName||teamBlock.team?.shortDisplayName||teamBlock.team?.name||'');
    for(const section of Array.isArray(teamBlock.statistics)?teamBlock.statistics:[]){
      const labels=Array.isArray(section.labels)?section.labels:[];
      const ix=labelsIndex(labels);
      if(ix.pts<0)continue;
      for(const item of Array.isArray(section.athletes)?section.athletes:[]){
        const athlete=item.athlete||{};
        const name=clean(athlete.displayName||athlete.fullName||[athlete.firstName,athlete.lastName].filter(Boolean).join(' '));
        if(!name||!athleteIsRookie(athlete,rookies))continue;
        const stats=Array.isArray(item.stats)?item.stats:[];
        const id=key(name);
        const current=newTotals.get(id)||{name,team:teamName,games:0,pts:0,reb:0,ast:0,stl:0,blk:0};
        current.name=name;
        current.team=teamName||current.team;
        current.games+=1;
        current.pts+=statAt(stats,ix.pts);
        current.reb+=statAt(stats,ix.reb);
        current.ast+=statAt(stats,ix.ast);
        current.stl+=statAt(stats,ix.stl);
        current.blk+=statAt(stats,ix.blk);
        newTotals.set(id,current);
      }
    }
  }
}
function leadersFromTotals(totals){
  return [...totals.values()].filter(item=>item.games>0).map(item=>{
    const ppg=item.pts/item.games,rpg=item.reb/item.games,apg=item.ast/item.games,spg=item.stl/item.games,bpg=item.blk/item.games;
    const score=ppg+1.2*rpg+1.5*apg+3*spg+3*bpg;
    return {...item,ppg:round1(ppg),rpg:round1(rpg),apg:round1(apg),spg:round1(spg),bpg:round1(bpg),score:round1(score)};
  }).sort((a,b)=>b.score-a.score||b.ppg-a.ppg||b.apg-a.apg||a.name.localeCompare(b.name)).slice(0,5).map((item,index)=>({
    rank:index+1,name:item.name,team:item.team,games:item.games,ppg:item.ppg,rpg:item.rpg,apg:item.apg,spg:item.spg,bpg:item.bpg,score:item.score,
    line:`${item.ppg.toFixed(1)} PPG · ${item.rpg.toFixed(1)} RPG · ${item.apg.toFixed(1)} APG`
  }));
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'Method not allowed'});
  }
  const start=dateValue(req.query.start||'');
  const end=dateValue(req.query.end||'');
  const week=Number.parseInt(String(req.query.week||''),10)||null;
  const fresh=String(req.query.fresh||'')==='1';
  if(!start||!end||start>end||!start.startsWith('2026-')||!end.startsWith('2026-'))return res.status(400).json({error:'A valid 2026 start and end date are required.'});
  res.setHeader('Cache-Control',fresh?'no-store':'s-maxage=900, stale-while-revalidate=86400');
  const rookies=rookieKeys();
  const errors=[];
  const snapshot=fresh?null:readSnapshot();
  const requested={season:2026,week,start,end};
  try{
    const events=await completedEvents(start,end,errors);
    const summaries=await Promise.allSettled(events.map(event=>fetchJson(`${SUMMARY}?event=${encodeURIComponent(event.id)}`)));
    const totals=new Map();
    let successfulSummaries=0;
    summaries.forEach((result,index)=>{
      if(result.status==='fulfilled'){
        successfulSummaries+=1;
        aggregateSummary(result.value,rookies,totals);
      }else errors.push(`${events[index]?.id||'game'} summary: ${result.reason?.message||'boxscore unavailable'}`);
    });
    const leaders=leadersFromTotals(totals);
    if(!leaders.length){
      const reason=new Error(events.length&&!successfulSummaries?'ESPN game summaries are unavailable for this period.':'No qualifying rookie boxscores were returned for this completed period.');
      if(snapshot)return res.status(200).json(fallbackPayload(snapshot,reason,requested));
      return res.status(502).json({error:'Weekly rookie dashboard is temporarily unavailable.',detail:reason.message,season:2026,week,start,end,diagnostics:{errors}});
    }
    return res.status(200).json({
      season:2026,week,start,end,officialAward:false,stale:false,fallback:false,
      source:'ESPN WNBA boxscores and verified 2026 WNBA draft class',
      sourceUrl:'https://www.espn.com/wnba/',
      methodology:'We Know the W weekly rookie score = PPG + 1.2×RPG + 1.5×APG + 3×SPG + 3×BPG.',
      updatedAt:new Date().toISOString(),gamesReviewed:events.length,leaders,
      note:'Latest completed weekly rookie ranking.',
      diagnostics:{successfulDays:datesBetween(start,end).length-errors.filter(item=>item.includes('scoreboard:')).length,successfulSummaries,errors}
    });
  }catch(error){
    if(snapshot)return res.status(200).json(fallbackPayload(snapshot,error,requested));
    return res.status(502).json({error:'Weekly rookie dashboard is temporarily unavailable.',detail:error.message,season:2026,week,start,end,diagnostics:{errors}});
  }
};
