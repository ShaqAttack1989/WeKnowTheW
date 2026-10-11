const {fetchTotals}=require('../lib/team-player-totals');
const saved=require('../data/team-player-totals-2026.json');
let latest=null,inFlight=null,retryAfter=0;
const REFRESH_MS=30*60*1000;
async function load() {
  const now=Date.now();
  if(latest && !latest.stale && now-Date.parse(latest.checkedAt)<REFRESH_MS)return latest;
  if(now<retryAfter)return latest || {...saved,stale:true};
  if(!inFlight)inFlight=fetchTotals().then(payload=>{
    latest={...payload,stale:false};retryAfter=0;return latest;
  }).catch(()=>{
    latest={...(latest||saved),stale:true};retryAfter=Date.now()+5*60*1000;return latest;
  }).finally(()=>{inFlight=null;});
  return inFlight;
}
module.exports=async function handler(req,res) {
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  if(req.query?.season && String(req.query.season)!=='2026')return res.status(400).json({error:'This feed covers the 2026 regular season.'});
  const payload=await load();
  res.setHeader('Cache-Control',payload.stale?'public, max-age=0, s-maxage=300':'public, max-age=0, s-maxage=1800, stale-while-revalidate=300');
  return res.status(200).json({...payload,refreshSeconds:1800,teamCount:15,scope:'Regular-season totals for each player’s individual team stint; combined rows excluded.'});
};
