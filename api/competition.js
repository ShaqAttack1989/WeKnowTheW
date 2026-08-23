const SCOREBOARD='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';
const EAST=new Set(['Atlanta Dream','Chicago Sky','Connecticut Sun','Indiana Fever','New York Liberty','Toronto Tempo','Washington Mystics']);
const WEST=new Set(['Dallas Wings','Golden State Valkyries','Las Vegas Aces','Los Angeles Sparks','Minnesota Lynx','Phoenix Mercury','Portland Fire','Seattle Storm']);

function scoreValue(value){
  if(value===null||value===undefined||value==='')return null;
  const raw=typeof value==='object'?(value.value??value.displayValue??value.score):value;
  const number=Number(raw);
  return Number.isFinite(number)?number:null;
}

async function fetchScoreboard(url){
  const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',Referer:'https://www.espn.com/'}});
  if(!r.ok)throw new Error(`ESPN returned ${r.status}`);
  const b=await r.json();
  return (b.events||[]).map(event=>{
    const c=event.competitions?.[0]||{},xs=c.competitors||[],h=xs.find(x=>x.homeAway==='home')||xs[0]||{},a=xs.find(x=>x.homeAway==='away')||xs[1]||{},s=event.status?.type||c.status?.type||{};
    return {
      id:String(event.id||c.id||''),
      date:String(event.date||c.date||'').slice(0,10),
      startTimeUtc:event.date||c.date||'',
      homeTeam:h.team?.displayName||h.team?.shortDisplayName||'',
      awayTeam:a.team?.displayName||a.team?.shortDisplayName||'',
      homeScore:scoreValue(h.score),
      awayScore:scoreValue(a.score),
      venue:c.venue?.fullName||'',
      status:s.shortDetail||s.detail||s.description||'',
      state:s.state||'',
      completed:Boolean(s.completed)||String(s.state||'').toLowerCase()==='post'||String(s.name||s.description||'').toLowerCase().includes('final')
    };
  });
}

async function fetchType(season,type){
  const range=`${season}0401-${season}1031`;
  const rangeGames=await fetchScoreboard(`${SCOREBOARD}?limit=1000&dates=${range}&seasontype=${type}`);
  if(rangeGames.length)return rangeGames;
  return fetchScoreboard(`${SCOREBOARD}?limit=1000&dates=${season}&seasontype=${type}`);
}

function sameConference(a,b){return (EAST.has(a)&&EAST.has(b))||(WEST.has(a)&&WEST.has(b));}
function cupPool(g){return g.date>='2026-06-01'&&g.date<='2026-06-17'&&sameConference(g.homeTeam,g.awayTeam);}
function gameKey(g={}){return `${g.date}|${[g.homeTeam,g.awayTeam].sort().join('|')}`;}
function mergeGames(primary=[],authoritative=[]){
  const map=new Map(primary.map(game=>[gameKey(game),game]));
  for(const game of authoritative){
    const existing=map.get(gameKey(game));
    if(!existing||!existing.completed||scoreValue(existing.homeScore)===null||scoreValue(existing.awayScore)===null)map.set(gameKey(game),game);
  }
  return [...map.values()].sort((a,b)=>String(a.startTimeUtc||a.date).localeCompare(String(b.startTimeUtc||b.date)));
}

const CUP_2026_LATE_RESULTS=[
  {id:'2026-cup-ind-tor-0616',date:'2026-06-16',startTimeUtc:'2026-06-16T19:00:00-04:00',homeTeam:'Indiana Fever',awayTeam:'Toronto Tempo',homeScore:113,awayScore:91,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-was-con-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T19:00:00-04:00',homeTeam:'Washington Mystics',awayTeam:'Connecticut Sun',homeScore:88,awayScore:81,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-gsv-dal-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T19:30:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',homeScore:91,awayScore:80,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-lva-phx-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Las Vegas Aces',awayTeam:'Phoenix Mercury',homeScore:86,awayScore:76,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-por-sea-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Portland Fire',awayTeam:'Seattle Storm',homeScore:94,awayScore:89,status:'Final',state:'post',completed:true,officialFallback:true},
  {id:'2026-cup-min-las-0617',date:'2026-06-17',startTimeUtc:'2026-06-17T22:00:00-04:00',homeTeam:'Minnesota Lynx',awayTeam:'Los Angeles Sparks',homeScore:99,awayScore:83,status:'Final',state:'post',completed:true,officialFallback:true}
];

const CUP_2026_FINAL={id:'2026-commissioners-cup-final',date:'2026-06-30',startTimeUtc:'2026-06-30T20:00:00-04:00',homeTeam:'New York Liberty',awayTeam:'Las Vegas Aces',homeScore:93,awayScore:85,status:'Final',state:'post',completed:true,officialFallback:true,competitionLabel:"Commissioner's Cup Championship"};

function standings(games){
  const map=new Map(),ensure=n=>{if(!map.has(n))map.set(n,{team:n,wins:0,losses:0,conference:EAST.has(n)?'Eastern':'Western'});return map.get(n);};
  [...EAST,...WEST].forEach(ensure);
  for(const g of games.filter(x=>x.completed&&scoreValue(x.homeScore)!==null&&scoreValue(x.awayScore)!==null&&Number(x.homeScore)!==Number(x.awayScore))){
    const h=ensure(g.homeTeam),a=ensure(g.awayTeam);
    if(Number(g.homeScore)>Number(g.awayScore)){h.wins++;a.losses++;}else{a.wins++;h.losses++;}
  }
  return [...map.values()].map(x=>({...x,pct:(x.wins+x.losses)?x.wins/(x.wins+x.losses):0})).sort((a,b)=>a.conference.localeCompare(b.conference)||b.pct-a.pct||b.wins-a.wins||a.team.localeCompare(b.team));
}

function series(games){
  const map=new Map();
  for(const g of games.filter(x=>x.completed&&scoreValue(x.homeScore)!==null&&scoreValue(x.awayScore)!==null)){
    const names=[g.homeTeam,g.awayTeam].sort(),key=names.join('|'),row=map.get(key)||{teamA:names[0],teamB:names[1],winsA:0,winsB:0,games:[]},winner=Number(g.homeScore)>Number(g.awayScore)?g.homeTeam:g.awayTeam;
    if(winner===row.teamA)row.winsA++;else row.winsB++;
    row.games.push(g);map.set(key,row);
  }
  return [...map.values()];
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number(req.query.season)||2026;
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    const [regular,postseason]=await Promise.all([fetchType(season,2),fetchType(season,3)]);
    let pool=regular.filter(cupPool);
    if(season===2026)pool=mergeGames(pool,CUP_2026_LATE_RESULTS);
    let finals=regular.filter(g=>g.date==='2026-06-30'&&((g.homeTeam==='New York Liberty'&&g.awayTeam==='Las Vegas Aces')||(g.awayTeam==='New York Liberty'&&g.homeTeam==='Las Vegas Aces')));
    if(season===2026)finals=mergeGames(finals,[CUP_2026_FINAL]);
    return res.status(200).json({
      updatedAt:new Date().toISOString(),season,
      cup:{poolGames:pool,championshipGames:finals,standings:standings(pool),champion:season===2026?'New York Liberty':null,complete:season===2026},
      playoffs:{games:postseason,series:series(postseason),starts:'2026-09-27',started:postseason.length>0||Date.now()>=Date.parse('2026-09-27T00:00:00-04:00')},
      sources:{cup:'https://www.wnba.com/commissioners-cup/2026/about-the-cup',cupResults:'https://www.wnba.com/news/category/2026-commissioners-cup',cupFinal:'https://www.wnba.com/commissioners-cup/2026/leaderboard',playoffs:'https://www.wnba.com/news/2026-schedule-release'},
      sourceVersion:'20260823-competition-v2'
    });
  }catch(error){return res.status(502).json({error:error.message||'Competition feed unavailable'});}
};
