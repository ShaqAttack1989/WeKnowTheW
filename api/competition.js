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
      startTimeUtc:/tbd/i.test(String(s.shortDetail||s.detail||s.description||''))?'':(event.date||c.date||''),
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
    const existingKey=[...map.keys()].find(key=>{const current=map.get(key);return [current.homeTeam,current.awayTeam].sort().join('|')===[game.homeTeam,game.awayTeam].sort().join('|')&&Math.abs(Date.parse(current.date)-Date.parse(game.date))<=86400000;});
    const existing=existingKey&&map.get(existingKey);
    if(!existing){map.set(gameKey(game),game);continue;}
    const existingLive=existing.completed||String(existing.state||'').toLowerCase()==='in'||scoreValue(existing.homeScore)!==null;
    const fallbackLive=game.completed||String(game.state||'').toLowerCase()==='in'||scoreValue(game.homeScore)!==null;
    // Provider schedule owns real tip times and state. Fallback only fills fields the provider does not have.
    // If the fallback later carries a live/final score while the provider does not, use that state without discarding provider timing.
    const merged={...game,...existing};
    if(fallbackLive&&!existingLive)Object.assign(merged,{homeScore:game.homeScore,awayScore:game.awayScore,status:game.status,state:game.state,completed:game.completed});
    if(!existing.startTimeUtc&&game.startTimeUtc)merged.startTimeUtc=game.startTimeUtc;
    if((!Array.isArray(existing.broadcasts)||!existing.broadcasts.length)&&Array.isArray(game.broadcasts))merged.broadcasts=game.broadcasts;
    if(existingKey)map.delete(existingKey);
    map.set(gameKey(merged),merged);
  }
  return [...map.values()].sort((a,b)=>Date.parse(a.startTimeUtc||`${a.date}T23:59:59-04:00`)-Date.parse(b.startTimeUtc||`${b.date}T23:59:59-04:00`));
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

// WNBA published Game 1 fixtures; live provider scores supersede these by matchup.
const PLAYOFF_2026_OPENERS=[
  {id:'1042600101',date:'2026-09-27',startTimeUtc:'2026-09-27T14:00:00-04:00',homeTeam:'Minnesota Lynx',awayTeam:'New York Liberty',broadcasts:['ABC']},
  {id:'1042600111',date:'2026-09-27',startTimeUtc:'2026-09-27T16:00:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',broadcasts:['ABC']},
  {id:'1042600121',date:'2026-09-27',homeTeam:'Las Vegas Aces',awayTeam:'Indiana Fever',broadcasts:['Prime Video']},
  {id:'1042600131',date:'2026-09-27',startTimeUtc:'2026-09-27T21:00:00-04:00',homeTeam:'Atlanta Dream',awayTeam:'Washington Mystics',broadcasts:['USA']}
].map(game=>({...game,status:'Scheduled',state:'pre',completed:false,competitionLabel:'Playoffs · First Round · Game 1',officialFallback:true}));

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

  const [regularResult,postseasonResult]=await Promise.allSettled([fetchType(season,2),fetchType(season,3)]);
  const regular=regularResult.status==='fulfilled'?regularResult.value:[];
  let postseason=season===2026?mergeGames(postseasonResult.status==='fulfilled'?postseasonResult.value:[],PLAYOFF_2026_OPENERS):postseasonResult.status==='fulfilled'?postseasonResult.value:[];
  if(season===2026){
    const seed={'Minnesota Lynx':1,'Golden State Valkyries':2,'Las Vegas Aces':3,'Atlanta Dream':4,'Washington Mystics':5,'Indiana Fever':6,'Dallas Wings':7,'New York Liberty':8};
    const regularSeries={'Minnesota Lynx|New York Liberty':'NYL 2-1','Dallas Wings|Golden State Valkyries':'GSV 3-0','Indiana Fever|Las Vegas Aces':'IND 2-1','Atlanta Dream|Washington Mystics':'WAS 2-1'};
    const counts=new Map();
    postseason=postseason.sort((a,b)=>Date.parse(a.startTimeUtc||a.date)-Date.parse(b.startTimeUtc||b.date)).map(game=>{const pair=[game.homeTeam,game.awayTeam].sort().join('|'),number=(counts.get(pair)||0)+1;counts.set(pair,number);return {...game,playoff:true,round:'First Round',gameNumber:number,homeSeed:seed[game.homeTeam]||null,awaySeed:seed[game.awayTeam]||null,regularSeasonSeries:regularSeries[pair]||'',competitionLabel:`Playoffs · First Round · Game ${number}`};});
  }
  const providerErrors=[];
  if(regularResult.status==='rejected')providerErrors.push(`regular season: ${regularResult.reason?.message||'unavailable'}`);
  if(postseasonResult.status==='rejected')providerErrors.push(`postseason: ${postseasonResult.reason?.message||'unavailable'}`);

  let pool=regular.filter(cupPool);
  if(season===2026)pool=mergeGames(pool,CUP_2026_LATE_RESULTS);
  let finals=regular.filter(g=>g.date==='2026-06-30'&&((g.homeTeam==='New York Liberty'&&g.awayTeam==='Las Vegas Aces')||(g.awayTeam==='New York Liberty'&&g.homeTeam==='Las Vegas Aces')));
  if(season===2026)finals=mergeGames(finals,[CUP_2026_FINAL]);

  return res.status(200).json({
    updatedAt:new Date().toISOString(),season,
    cup:{poolGames:pool,championshipGames:finals,standings:standings(pool),champion:season===2026?'New York Liberty':null,complete:season===2026},
    playoffs:{games:postseason,series:series(postseason),starts:'2026-09-27',started:Date.now()>=Date.parse('2026-09-27T00:00:00-04:00')},
    sources:{cup:'https://www.wnba.com/commissioners-cup/2026/about-the-cup',cupResults:'https://www.wnba.com/news/category/2026-commissioners-cup',cupFinal:'https://www.wnba.com/commissioners-cup/2026/leaderboard',playoffs:'https://www.wnba.com/playoffs/2026'},
    providerErrors,
    sourceVersion:'20260823-competition-v3'
  });
};
