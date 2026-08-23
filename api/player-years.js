const SITE_ROOT='https://site.api.espn.com/apis/site/v2/sports/basketball';

async function fetchJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',Referer:'https://www.espn.com/'}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body?.message||body?.error||`ESPN returned ${response.status}`);
  return body;
}
function flattenAthletes(value=[]){
  const out=[];
  for(const item of Array.isArray(value)?value:[]){
    if(Array.isArray(item?.items))out.push(...item.items);
    else if(Array.isArray(item?.athletes))out.push(...item.athletes);
    else if(item?.id)out.push(item);
  }
  return out;
}
function cleanYear(value){const n=Number(value);return Number.isInteger(n)&&n>=1997&&n<=2100?n:null;}
function playerName(athlete={}){return athlete.displayName||athlete.fullName||[athlete.firstName,athlete.lastName].filter(Boolean).join(' ');}
function startYearFor(athlete={},season=2026){
  const direct=cleanYear(athlete.debutYear||athlete.wnbaDebutYear||athlete.draft?.year);
  if(direct)return direct;
  const experience=Number(athlete.experience?.years??athlete.experience);
  if(Number.isFinite(experience)&&experience>=0&&experience<40){
    const inferred=cleanYear(season-experience);
    if(inferred)return inferred;
  }
  return null;
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const requested=Number(req.query.season);const season=Number.isInteger(requested)?requested:2026;
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=172800');
  try{
    const teamsBody=await fetchJson(`${SITE_ROOT}/wnba/teams?limit=100`);
    const teams=(teamsBody?.sports?.[0]?.leagues?.[0]?.teams||[]).map(item=>item?.team||item).filter(team=>team?.id);
    const results=await Promise.allSettled(teams.map(async team=>{
      const roster=await fetchJson(`${SITE_ROOT}/wnba/teams/${encodeURIComponent(team.id)}/roster?season=${encodeURIComponent(season)}`);
      return flattenAthletes(roster.athletes).map(athlete=>({
        id:String(athlete.id||''),name:playerName(athlete),team:team.displayName||team.name||'',startYear:startYearFor(athlete,season)
      })).filter(item=>item.name);
    }));
    const players=results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value).map(item=>({...item,label:item.startYear?`${item.startYear}–`:''}));
    return res.status(200).json({updatedAt:new Date().toISOString(),season,players,partial:results.some(r=>r.status==='rejected'),source:'ESPN public WNBA roster pages via WeHoop-compatible feed'});
  }catch(error){return res.status(502).json({error:error.message||'Player experience feed unavailable'});}
};
