const CURRENT_TEAMS=[
  ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
].map(([slug,name,abbr])=>({slug,name,abbr}));

const ESPN_ROOT='https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard';

function norm(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
const ALIASES=new Map([
  ['atlantadream','atlanta-dream'],['chicagosky','chicago-sky'],['connecticutsun','connecticut-sun'],['orlandomiracle','connecticut-sun'],
  ['dallaswings','dallas-wings'],['tulsashock','dallas-wings'],['detroitshock','dallas-wings'],['goldenstatevalkyries','golden-state-valkyries'],
  ['indianafever','indiana-fever'],['lasvegasaces','las-vegas-aces'],['sanantoniostars','las-vegas-aces'],['sanantoniosilverstars','las-vegas-aces'],['utahstarzz','las-vegas-aces'],
  ['losangelessparks','los-angeles-sparks'],['minnesotalynx','minnesota-lynx'],['newyorkliberty','new-york-liberty'],['phoenixmercury','phoenix-mercury'],
  ['portlandfire','portland-fire'],['seattlestorm','seattle-storm'],['torontotempo','toronto-tempo'],['washingtonmystics','washington-mystics']
]);
function canonical(name,year){const slug=ALIASES.get(norm(name))||null;if(slug==='portland-fire'&&year<2026)return null;if(slug==='toronto-tempo'&&year<2026)return null;if(slug==='golden-state-valkyries'&&year<2025)return null;return slug;}
function scoreValue(value){if(value===null||value===undefined||value==='')return null;const raw=typeof value==='object'?(value.value??value.displayValue??value.score):value;const n=Number(raw);return Number.isFinite(n)?n:null;}
function isCupChampionship(game){
  const label=norm(game.label||'');
  if(label.includes('commissionerscup')&&(label.includes('championship')||label.includes('final')))return true;
  if(game.year===2026&&game.date==='2026-06-30')return [game.home,game.away].sort().join('|')===['las-vegas-aces','new-york-liberty'].sort().join('|');
  return false;
}

async function fetchRegularSeasonYear(year){
  // ESPN's scoreboard archive expects a full YYYYMMDD date or date range.
  // Passing only the 4-digit season silently returns no historical games.
  const dates=`${year}0101-${year}1231`;
  const url=`${ESPN_ROOT}?limit=1000&dates=${dates}&seasontype=2`;
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',Referer:'https://www.espn.com/'},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`ESPN ${year} returned ${response.status}`);
  const body=await response.json();
  const games=(Array.isArray(body.events)?body.events:[]).map(event=>{
    const competition=Array.isArray(event.competitions)?event.competitions[0]||{}:{};
    const competitors=Array.isArray(competition.competitors)?competition.competitors:[];
    const home=competitors.find(item=>item.homeAway==='home')||competitors[0]||{};
    const away=competitors.find(item=>item.homeAway==='away')||competitors[1]||{};
    const status=event.status?.type||competition.status?.type||{};
    const date=String(event.date||competition.date||'').slice(0,10);
    const notes=(Array.isArray(competition.notes)?competition.notes:[]).map(note=>note?.headline||note?.text||'').join(' ');
    const label=[event.name,event.shortName,competition.name,notes].filter(Boolean).join(' ');
    const seasonType=Number(event.season?.type??competition.type?.id??competition.type?.type??0);
    return {
      year,date,label,seasonType,
      home:canonical(home.team?.displayName||home.team?.shortDisplayName||home.team?.name||'',year),
      away:canonical(away.team?.displayName||away.team?.shortDisplayName||away.team?.name||'',year),
      homeScore:scoreValue(home.score),awayScore:scoreValue(away.score),
      completed:Boolean(status.completed)||String(status.state||'').toLowerCase()==='post'
    };
  }).filter(game=>game.completed&&game.home&&game.away&&game.homeScore!==null&&game.awayScore!==null&&game.homeScore!==game.awayScore&&(!game.seasonType||game.seasonType===2)&&!isCupChampionship(game));
  if(!games.length)throw new Error(`No completed regular-season games returned for ${year}`);
  return games;
}

function blank(){return {wins:0,losses:0};}
function add(records,team,opp,won){const key=`${team}|${opp}`;const r=records.get(key)||blank();won?r.wins++:r.losses++;records.set(key,r);}
function build(games){const records=new Map();for(const game of games){add(records,game.home,game.away,game.homeScore>game.awayScore);add(records,game.away,game.home,game.awayScore>game.homeScore);}return records;}
function rec(records,a,b){return records.get(`${a}|${b}`)||blank();}
function edge(r){if(r.wins>r.losses)return 'Leading';if(r.losses>r.wins)return 'Trailing';return r.wins+r.losses?'Even':'No meetings';}
function struggle(r){const total=r.wins+r.losses;return total?Math.round(r.losses/total*100):0;}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const season=Number(req.query.season)||2026;
  const focus=String(req.query.team||'').trim();
  // Never cache a failed archive response. A successful result is cached below.
  res.setHeader('Cache-Control','no-store, max-age=0');
  const years=Array.from({length:season-1997+1},(_,i)=>1997+i);
  const results=await Promise.allSettled(years.map(fetchRegularSeasonYear));
  const completedYears=years.filter((_,i)=>results[i].status==='fulfilled');
  const missingYears=years.filter((_,i)=>results[i].status!=='fulfilled');
  const allGames=results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  if(!allGames.length)return res.status(503).json({error:'The historical rivalry archive did not return any completed regular-season games.',coverage:{start:1997,end:season,completedYears,missingYears},sourceVersion:'20260823-rivalries-v6'});

  const allRecords=build(allGames);
  const seasonRecords=build(allGames.filter(game=>game.year===season));
  const teamRows={};
  const allTimeMatrix={};
  const matrix={};
  for(const team of CURRENT_TEAMS){
    allTimeMatrix[team.slug]={};matrix[team.slug]={};
    teamRows[team.slug]=CURRENT_TEAMS.filter(opponent=>opponent.slug!==team.slug).map(opponent=>{
      const current=rec(seasonRecords,team.slug,opponent.slug),allTime=rec(allRecords,team.slug,opponent.slug);
      allTimeMatrix[team.slug][opponent.slug]=allTime;matrix[team.slug][opponent.slug]=current;
      return {opponent,season:{...current,edge:edge(current)},allTime:{...allTime,edge:edge(allTime)},strugglePct:struggle(allTime)};
    });
  }

  res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({
    updatedAt:new Date().toISOString(),season,teams:CURRENT_TEAMS,matrix,allTimeMatrix,
    rows:focus?teamRows[focus]||[]:teamRows,focusTeam:focus||null,
    coverage:{start:1997,end:season,completedYears,missingYears,seasonGameCount:allGames.filter(game=>game.year===season).length,allGameCount:allGames.length},
    partial:missingYears.length>0,
    allTimeDefinition:'Regular-season franchise series from 1997 through the current season. Relocations stay connected to the current franchise line: Orlando to Connecticut, Detroit/Tulsa to Dallas, and Utah/San Antonio to Las Vegas. The original Portland Fire remains separate from the 2026 expansion Portland Fire.',
    source:'ESPN public WNBA regular-season scoreboard archive',sourceVersion:'20260823-rivalries-v6'
  });
};
