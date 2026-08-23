const { getWnbaScoreboard } = require('../lib/wehoop-espn');

const CURRENT_TEAMS=[
  ['atlanta-dream','Atlanta Dream','ATL'],['chicago-sky','Chicago Sky','CHI'],['connecticut-sun','Connecticut Sun','CON'],['dallas-wings','Dallas Wings','DAL'],['golden-state-valkyries','Golden State Valkyries','GSV'],['indiana-fever','Indiana Fever','IND'],['las-vegas-aces','Las Vegas Aces','LVA'],['los-angeles-sparks','Los Angeles Sparks','LAS'],['minnesota-lynx','Minnesota Lynx','MIN'],['new-york-liberty','New York Liberty','NYL'],['phoenix-mercury','Phoenix Mercury','PHX'],['portland-fire','Portland Fire','PDX'],['seattle-storm','Seattle Storm','SEA'],['toronto-tempo','Toronto Tempo','TOR'],['washington-mystics','Washington Mystics','WAS']
].map(([slug,name,abbr])=>({slug,name,abbr}));

function norm(v=''){
  return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
}

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
  const number=Number(value);
  return Number.isFinite(number)?number:null;
}

async function fetchYear(year){
  const events=await getWnbaScoreboard(year);
  const games=(Array.isArray(events)?events:[]).map(event=>({
    year,
    date:String(event.date||event.startTimeUtc||'').slice(0,10),
    home:canonical(event.homeTeam||'',year),
    away:canonical(event.awayTeam||'',year),
    homeScore:scoreValue(event.homeScore),
    awayScore:scoreValue(event.awayScore),
    completed:Boolean(event.completed)||String(event.state||'').toLowerCase()==='post'||String(event.status||'').toLowerCase().includes('final')
  })).filter(game=>game.completed&&game.home&&game.away&&game.homeScore!==null&&game.awayScore!==null&&game.homeScore!==game.awayScore);
  if(!games.length)throw new Error(`No completed games returned for ${year}`);
  return games;
}

function blank(){return {wins:0,losses:0};}
function add(records,team,opp,won){
  const key=`${team}|${opp}`;
  const rec=records.get(key)||blank();
  if(won)rec.wins++;else rec.losses++;
  records.set(key,rec);
}
function build(games){
  const records=new Map();
  for(const game of games){
    add(records,game.home,game.away,game.homeScore>game.awayScore);
    add(records,game.away,game.home,game.awayScore>game.homeScore);
  }
  return records;
}
function rec(records,a,b){return records.get(`${a}|${b}`)||blank();}
function struggle(record){const total=record.wins+record.losses;return total?Math.round(record.losses/total*100):0;}
function edge(record){if(record.wins>record.losses)return 'Leading';if(record.losses>record.wins)return 'Trailing';return record.wins+record.losses?'Even':'No meetings';}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'Method not allowed'});
  }

  const season=Number(req.query.season)||2026;
  const focus=String(req.query.team||'').trim();
  res.setHeader('Cache-Control','no-store, max-age=0');

  const years=Array.from({length:season-1997+1},(_,index)=>1997+index);
  const results=await Promise.allSettled(years.map(fetchYear));
  const missingYears=years.filter((_,index)=>results[index].status!=='fulfilled');
  const allGames=results.filter(result=>result.status==='fulfilled').flatMap(result=>result.value);
  const seasonGames=allGames.filter(game=>game.year===season);

  if(!seasonGames.length){
    return res.status(503).json({
      error:`The ${season} rivalry feed did not return completed games. False 0-0 records have been suppressed.`,
      season,
      coverage:{start:1997,end:season,missingYears},
      sourceVersion:'20260823-rivalries-v4'
    });
  }

  const allRecords=build(allGames);
  const seasonRecords=build(seasonGames);
  const teamRows={};

  for(const team of CURRENT_TEAMS){
    teamRows[team.slug]=CURRENT_TEAMS.filter(opponent=>opponent.slug!==team.slug).map(opponent=>{
      const current=rec(seasonRecords,team.slug,opponent.slug);
      const allTime=rec(allRecords,team.slug,opponent.slug);
      return {
        opponent,
        season:{...current,edge:edge(current)},
        allTime:{...allTime,edge:edge(allTime)},
        strugglePct:struggle(allTime)
      };
    });
  }

  const matrix={};
  for(const team of CURRENT_TEAMS){
    matrix[team.slug]={};
    for(const opponent of CURRENT_TEAMS){
      if(team.slug!==opponent.slug)matrix[team.slug][opponent.slug]=rec(seasonRecords,team.slug,opponent.slug);
    }
  }

  return res.status(200).json({
    updatedAt:new Date().toISOString(),
    season,
    teams:CURRENT_TEAMS,
    matrix,
    rows:focus?teamRows[focus]||[]:teamRows,
    focusTeam:focus||null,
    coverage:{start:1997,end:season,missingYears,seasonGameCount:seasonGames.length,allGameCount:allGames.length},
    partial:missingYears.length>0,
    allTimeDefinition:'Franchise series with relocations connected to the current franchise line. Expansion teams begin with their current franchise.',
    source:'Shared ESPN public WNBA scoreboard feed used by We Know the W live stats',
    sourceVersion:'20260823-rivalries-v4'
  });
};
