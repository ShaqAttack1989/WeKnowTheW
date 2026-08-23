const SCOREBOARD='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';
const CURRENT_TEAMS=[
  ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
].map(([slug,name,abbr])=>({slug,name,abbr}));
function norm(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
const ALIASES=new Map([
  ['atlantadream','atlanta-dream'],['chicagosky','chicago-sky'],['connecticutsun','connecticut-sun'],['orlandomiracle','connecticut-sun'],
  ['dallaswings','dallas-wings'],['tulsashock','dallas-wings'],['detroitshock','dallas-wings'],['goldenstatevalkyries','golden-state-valkyries'],
  ['indianafever','indiana-fever'],['lasvegasaces','las-vegas-aces'],['sanantoniostars','las-vegas-aces'],['sanantoniosilverstars','las-vegas-aces'],['utahstarzz','las-vegas-aces'],
  ['losangelessparks','los-angeles-sparks'],['minnesotalynx','minnesota-lynx'],['newyorkliberty','new-york-liberty'],['phoenixmercury','phoenix-mercury'],
  ['portlandfire','portland-fire'],['seattlestorm','seattle-storm'],['torontotempo','toronto-tempo'],['washingtonmystics','washington-mystics']
]);
function canonical(name,year){
  const slug=ALIASES.get(norm(name))||null;
  if(slug==='portland-fire'&&year<2026)return null;
  if(slug==='toronto-tempo'&&year<2026)return null;
  if(slug==='golden-state-valkyries'&&year<2025)return null;
  return slug;
}
function scoreValue(value){
  if(value===null||value===undefined||value==='')return null;
  const raw=typeof value==='object'?(value.value??value.displayValue??value.score):value;
  const number=Number(raw);
  return Number.isFinite(number)?number:null;
}
function isCompleted(event={},competition={}){
  const type=event.status?.type||competition.status?.type||{};
  const state=String(type.state||'').toLowerCase();
  const detail=String(type.name||type.description||type.detail||type.shortDetail||'').toLowerCase();
  return Boolean(type.completed)||state==='post'||detail.includes('final');
}
function normalizeEvents(body,year){
  return (Array.isArray(body?.events)?body.events:[]).map(event=>{
    const comp=event.competitions?.[0]||{};
    const competitors=Array.isArray(comp.competitors)?comp.competitors:[];
    const home=competitors.find(x=>x.homeAway==='home')||competitors[0]||{};
    const away=competitors.find(x=>x.homeAway==='away')||competitors[1]||{};
    const homeScore=scoreValue(home.score);
    const awayScore=scoreValue(away.score);
    const seasonType=Number(event.season?.type??comp.season?.type??2);
    return {
      year,
      date:String(event.date||comp.date||'').slice(0,10),
      home:canonical(home.team?.displayName||home.team?.shortDisplayName||home.team?.name||'',year),
      away:canonical(away.team?.displayName||away.team?.shortDisplayName||away.team?.name||'',year),
      homeScore,
      awayScore,
      completed:isCompleted(event,comp),
      regularSeason:!Number.isFinite(seasonType)||seasonType===2
    };
  }).filter(g=>g.regularSeason&&g.completed&&g.home&&g.away&&g.homeScore!==null&&g.awayScore!==null&&g.homeScore!==g.awayScore);
}
async function requestScoreboard(url){
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',Referer:'https://www.espn.com/'}});
  if(!response.ok)throw new Error(`ESPN returned ${response.status}`);
  return response.json();
}
async function fetchYear(year){
  const range=`${year}0401-${year}1031`;
  const rangeUrl=`${SCOREBOARD}?limit=1000&dates=${range}&seasontype=2`;
  const rangeBody=await requestScoreboard(rangeUrl);
  let games=normalizeEvents(rangeBody,year);
  if(games.length)return games;

  // ESPN has returned season-wide results for this format in some regions and
  // date-range results in others. Keep both paths so the rivalry board does not
  // silently turn every matchup into 0-0 when one response shape changes.
  const seasonBody=await requestScoreboard(`${SCOREBOARD}?limit=1000&dates=${year}`);
  games=normalizeEvents(seasonBody,year);
  if(games.length)return games;
  throw new Error(`No regular-season games returned for ${year}`);
}
function blank(){return {wins:0,losses:0};}
function add(records,team,opp,won){const key=`${team}|${opp}`;const rec=records.get(key)||blank();won?rec.wins++:rec.losses++;records.set(key,rec);}
function build(games){const records=new Map();for(const g of games){add(records,g.home,g.away,g.homeScore>g.awayScore);add(records,g.away,g.home,g.awayScore>g.homeScore);}return records;}
function rec(records,a,b){return records.get(`${a}|${b}`)||blank();}
function struggle(record){const total=record.wins+record.losses;return total?Math.round(record.losses/total*100):0;}
function edge(record){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number(req.query.season)||2026;
  const focus=String(req.query.team||'').trim();
  res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=21600');
  const years=Array.from({length:season-1997+1},(_,i)=>1997+i);
  const results=await Promise.allSettled(years.map(fetchYear));
  const missingYears=years.filter((_,i)=>results[i].status!=='fulfilled');
  const allGames=results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const seasonGames=allGames.filter(g=>g.year===season);
  const allRecords=build(allGames),seasonRecords=build(seasonGames);
  const teamRows={};
  for(const team of CURRENT_TEAMS){
    teamRows[team.slug]=CURRENT_TEAMS.filter(o=>o.slug!==team.slug).map(opponent=>{
      const current=rec(seasonRecords,team.slug,opponent.slug),allTime=rec(allRecords,team.slug,opponent.slug);
      return {opponent,season:{...current,edge:edge(current)},allTime:{...allTime,edge:edge(allTime)},strugglePct:struggle(allTime)};
    });
  }
  const matrix={};
  for(const team of CURRENT_TEAMS){
    matrix[team.slug]={};
    for(const opp of CURRENT_TEAMS){if(team.slug!==opp.slug)matrix[team.slug][opp.slug]=rec(seasonRecords,team.slug,opp.slug);}
  }
  return res.status(200).json({updatedAt:new Date().toISOString(),season,teams:CURRENT_TEAMS,matrix,rows:focus?teamRows[focus]||[]:teamRows,focusTeam:focus||null,coverage:{start:1997,end:season,missingYears},partial:missingYears.length>0,allTimeDefinition:'Regular-season franchise series, with relocations connected to the current franchise line.',source:'ESPN public WNBA scoreboard via WeHoop-compatible feed',sourceVersion:'20260823-rivalries-v3'});
};
