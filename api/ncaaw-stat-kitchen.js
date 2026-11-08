const ROOT='https://site.api.espn.com/apis';
const BASE='/sports/basketball/womens-college-basketball';
const withTimeout=(url)=>fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)}).then(async response=>{if(!response.ok)throw new Error('Upstream '+response.status);return response.json()});
function dayStamp(date){return date.toISOString().slice(0,10).replace(/-/g,'')}
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'})}
 const season=String(req.query.season||'2027');
 const now=new Date();const from=new Date(now);from.setUTCDate(from.getUTCDate()-2);const to=new Date(now);to.setUTCDate(to.getUTCDate()+1);
 const urls={
  standings:ROOT+'/v2'+BASE+'/standings?season='+encodeURIComponent(season),
  rankings:ROOT+'/site/v2'+BASE+'/rankings?season='+encodeURIComponent(season)
 };
 const pairs=await Promise.all(Object.entries(urls).map(async([key,url])=>{try{return[key,await withTimeout(url)]}catch(error){return[key,{_feedError:String(error.message||error)}]}}));
 const feeds=Object.fromEntries(pairs);
 const scoreDates=[from,new Date(now),to].map(dayStamp);
 const scoreResults=await Promise.all(scoreDates.map(async date=>{try{return await withTimeout(ROOT+'/site/v2'+BASE+'/scoreboard?dates='+date+'&limit=500')}catch(error){return{_feedError:String(error.message||error),events:[]}}}));
 const scores={events:[...new Map(scoreResults.flatMap(feed=>feed.events||[]).map(event=>[event.id,event])).values()]};
 feeds.scores=scores;
 const failures=[...Object.values(feeds),...scoreResults].filter(feed=>feed._feedError).length;
 res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
 return res.status(200).json({season:'2026-27',updatedAt:new Date().toISOString(),source:'ESPN scoreboard data feed',standings:feeds.standings,rankings:feeds.rankings,scores:feeds.scores,partial:failures>0});
};
