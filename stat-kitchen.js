function skSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}

const weeklyAwards=Array.isArray(window.STAT_KITCHEN_WEEKLY_AWARDS)?window.STAT_KITCHEN_WEEKLY_AWARDS:[];

const normalizeName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const kitchenParams=new URLSearchParams(location.search);
const requestedPlayer=normalizeName(kitchenParams.get('player')||'');
const requestedCategory=kitchenParams.get('category')||'';
const playerPhotos=new Map();
const teamSlugs={
  ATL:'atlanta-dream','Atlanta Dream':'atlanta-dream',CHI:'chicago-sky','Chicago Sky':'chicago-sky',CON:'connecticut-sun','Connecticut Sun':'connecticut-sun',DAL:'dallas-wings','Dallas Wings':'dallas-wings',GSV:'golden-state-valkyries','Golden State Valkyries':'golden-state-valkyries',IND:'indiana-fever','Indiana Fever':'indiana-fever',LVA:'las-vegas-aces','Las Vegas Aces':'las-vegas-aces',LAS:'los-angeles-sparks','Los Angeles Sparks':'los-angeles-sparks',MIN:'minnesota-lynx','Minnesota Lynx':'minnesota-lynx',NYL:'new-york-liberty','New York Liberty':'new-york-liberty',PHO:'phoenix-mercury','Phoenix Mercury':'phoenix-mercury',POR:'portland-fire','Portland Fire':'portland-fire',SEA:'seattle-storm','Seattle Storm':'seattle-storm',TOR:'toronto-tempo','Toronto Tempo':'toronto-tempo',WAS:'washington-mystics','Washington Mystics':'washington-mystics'
};
function playerHref(name,spotlight='leader'){return `/playerpedia.html?search=${encodeURIComponent(name)}&from=stat-kitchen&spotlight=${encodeURIComponent(spotlight)}#playerpedia-directory`;}
function teamSlug(team,name=''){if(teamSlugs[team])return teamSlugs[team];const current=playerPhotos.get(normalizeName(name))?.team||'';return teamSlugs[current]||'';}
function teamHref(team,name=''){const slug=teamSlug(team,name);return slug?`/team.html?team=${slug}`:'';}
function winNumber(name,week){return weeklyAwards.filter(item=>item.week<=week&&[item.east.name,item.west.name].some(candidate=>normalizeName(candidate)===normalizeName(name))).length;}
function ordinal(number){const mod100=number%100;if(mod100>=11&&mod100<=13)return `${number}TH`;return `${number}${number%10===1?'ST':number%10===2?'ND':number%10===3?'RD':'TH'}`;}
function photoMarkup(name){const player=playerPhotos.get(normalizeName(name));const photo=player?.photo||player?.photoThumb||player?.headshot||'';const initials=String(name).split(/\s+/).map(part=>part[0]).join('').slice(0,2);return `<a class="award-photo" href="${skSafe(playerHref(name,'weekly'))}" aria-label="Open ${skSafe(name)} in Playerpedia"><span>${skSafe(initials)}</span>${photo?`<img src="${skSafe(photo)}" alt="${skSafe(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</a>`;}

function awardCard(conference,award,week,latest=false){
  const conferenceName=conference==='East'?'EASTERN':'WESTERN';
  const count=winNumber(award.name,week);
  const repeat=count>1;
  const teamUrl=teamHref(award.team,award.name);
  const connected=requestedPlayer&&requestedPlayer===normalizeName(award.name);
  return `<article class="award-card ${conference.toLowerCase()} ${latest?'latest':''} ${repeat?'repeat-winner':'first-winner'} ${connected?'kitchen-connected':''}" data-player-key="${skSafe(normalizeName(award.name))}"><span class="award-conference">${conferenceName} CONFERENCE</span>${photoMarkup(award.name)}<div class="award-copy"><small>${latest?'CURRENT WINNER':'WINNER'}</small><h3><a class="award-player-link" href="${skSafe(playerHref(award.name,'weekly'))}">${skSafe(award.name)}</a></h3>${teamUrl?`<a class="award-team-link" href="${skSafe(teamUrl)}">${skSafe(award.team)}</a>`:`<strong>${skSafe(award.team)}</strong>`}<div class="award-badges"><span class="win-badge ${repeat?'repeat':''}">${repeat?'♨ REPEAT HEAT':'● FIRST SERVING'}</span><span>${ordinal(count)} WIN</span></div><p>${skSafe(award.line)}</p><a class="award-source-link" href="${skSafe(award.source)}" target="_blank" rel="noopener noreferrer">Official receipt <span aria-hidden="true">→</span></a></div></article>`;
}

function weekBlock(item,latest=false){return `<section class="award-season-week ${latest?'current-week':''}"><div class="award-week-label"><span>WEEK ${item.week}</span><strong>${skSafe(item.dates)}, 2026</strong>${latest?'<b>LATEST</b>':''}</div><div class="award-week-grid">${awardCard('East',item.east,item.week,latest)}${awardCard('West',item.west,item.week,latest)}</div></section>`;}
function renderAwards(){document.getElementById('awardLegend').innerHTML='<strong>HEAT KEY</strong><span><i class="legend-dot first"></i> First Serving, first weekly win of 2026</span><span><i class="legend-dot repeat"></i> Repeat Heat, won in an earlier week</span><span><i class="legend-dot current"></i> Latest winners</span>';document.getElementById('weeklyAwards').innerHTML=weeklyAwards.map((item,index)=>weekBlock(item,index===0)).join('');}
async function loadPlayerPhotos(){try{const response=await fetch('/api/players',{headers:{Accept:'application/json'}});const payload=await response.json();const players=Array.isArray(payload)?payload:(payload.players||[]);players.forEach(player=>playerPhotos.set(normalizeName(player.name),player));renderAwards();if(leaderPayload)renderLeaders();}catch{}}

const categoryOrder=['pts','trb','ast','stl','blk','tov','3p'];
let leaderPayload=null;
let activeCategory=categoryOrder.includes(requestedCategory)?requestedCategory:'pts';
function valueLabel(value,unit){return `${Number(value).toFixed(1)} ${unit}`;}
function compositeGrade(rank,pool){const place=Number(rank),total=Number(pool);if(!Number.isFinite(place)||!Number.isFinite(total)||total<1)return '—';const share=place/total;if(share<=.067)return 'A+';if(share<=.134)return 'A';if(share<=.20)return 'B+';if(share<=.267)return 'B';if(share<=.334)return 'B−';if(share<=.467)return 'C+';if(share<=.60)return 'C';if(share<=.734)return 'C−';if(share<=.80)return 'D+';if(share<=.867)return 'D';if(share<=.934)return 'D−';return 'F';}
function renderTabs(){const box=document.getElementById('statCategoryTabs');box.innerHTML=categoryOrder.map(key=>{const category=leaderPayload?.categories?.[key];if(!category)return '';const active=key===activeCategory;return `<button type="button" role="tab" data-stat-category="${key}" aria-selected="${active}" class="${active?'active':''}">${skSafe(category.label)}</button>`;}).join('');}
function renderLeaders(){const category=leaderPayload?.categories?.[activeCategory];if(!category)return;renderTabs();const leaders=category.leaders||[];document.getElementById('leaderboard').innerHTML=`<div class="leaderboard-head"><span>Rank</span><span>Player</span><span>Team</span><span>${skSafe(category.unit)}</span></div>${leaders.map(player=>{const teamUrl=teamHref(player.team,player.name),connected=requestedPlayer&&requestedPlayer===normalizeName(player.name);return `<article class="leader-row ${player.rank===1?'number-one':''} ${connected?'kitchen-connected':''}" data-player-key="${skSafe(normalizeName(player.name))}"${connected?' aria-label="Selected Playerpedia connection"':''}><span class="leader-rank">${player.rank}</span><div><a class="leader-player-link" href="${skSafe(playerHref(player.name,activeCategory))}">${skSafe(player.name)}</a>${player.rank===1?'<small>HEAD CHEF</small>':''}</div>${teamUrl?`<a class="leader-team-link" href="${skSafe(teamUrl)}">${skSafe(player.team||'WNBA')}</a>`:`<span>${skSafe(player.team||'WNBA')}</span>`}<b>${skSafe(valueLabel(player.value,category.unit))}</b></article>`;}).join('')}`;document.querySelectorAll('[data-stat-category]').forEach(button=>button.addEventListener('click',()=>{activeCategory=button.dataset.statCategory;renderLeaders();}));}
async function loadLeaders(){const status=document.getElementById('leaderStatus');try{const response=await fetch('/api/leaderboard?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});const payload=await response.json().catch(()=>({}));if(!response.ok||payload.error)throw new Error(payload.error||'Leaderboards unavailable');leaderPayload=payload;renderLeaders();const updated=new Date(payload.updatedAt||Date.now());status.textContent=`Updated ${updated.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;}catch(error){document.getElementById('leaderboard').innerHTML=`<div class="leader-error"><strong>The Stat Kitchen is between servings.</strong><p>${skSafe(error.message)} Try again shortly.</p></div>`;status.textContent='Feed temporarily unavailable';}}

function compositeNumber(value,signed=false){const number=Number(value);if(!Number.isFinite(number))return '—';return `${signed&&number>0?'+':''}${number.toFixed(1)}`;}
function addCompositeFieldRanks(teams,field,direction='desc'){
  const valid=teams.filter(team=>Number.isFinite(Number(team[field]))).sort((a,b)=>direction==='asc'?Number(a[field])-Number(b[field]):Number(b[field])-Number(a[field]));
  valid.forEach((team,index)=>{team[`_${field}Rank`]=index+1;team[`_${field}Pool`]=valid.length;});
}
function compositePercentile(team,field){
  const rank=Number(team[`_${field}Rank`]),pool=Number(team[`_${field}Pool`]);
  if(!Number.isFinite(rank)||!Number.isFinite(pool)||pool<2)return 50;
  return 100*(pool-rank)/(pool-1);
}
function recalculateCompositeRatings(teams=[]){
  const updated=teams.map(team=>({...team}));
  [['netRtg','desc'],['offRtg','desc'],['defRtg','asc'],['srs','desc'],['winPct','desc']].forEach(([field,direction])=>addCompositeFieldRanks(updated,field,direction));
  updated.forEach(team=>{
    team.overallRating=Math.round(.35*compositePercentile(team,'netRtg')+.20*compositePercentile(team,'offRtg')+.20*compositePercentile(team,'defRtg')+.15*compositePercentile(team,'srs')+.10*compositePercentile(team,'winPct'));
  });
  updated.sort((a,b)=>Number(b.overallRating||0)-Number(a.overallRating||0)||Number(b.netRtg||-999)-Number(a.netRtg||-999)||String(a.name).localeCompare(String(b.name)));
  updated.forEach((team,index)=>{team.overallRank=index+1;});
  return updated;
}
function syncCompositeWithLive(teamDnaPayload={},livePayload={}){
  const liveByName=new Map((livePayload.standings||[]).map(record=>[normalizeName(record.team?.full_name),record]));
  const merged=(teamDnaPayload.teams||[]).filter(team=>normalizeName(team.name)!=='leagueaverage').map(team=>{
    const live=liveByName.get(normalizeName(team.name));
    if(!live)return {...team};
    const wins=Number(live.wins),losses=Number(live.losses),games=Number(live.games_played);
    const played=Number.isFinite(games)&&games>0?games:(Number.isFinite(wins)&&Number.isFinite(losses)?wins+losses:0);
    return {...team,wins:Number.isFinite(wins)?wins:team.wins,losses:Number.isFinite(losses)?losses:team.losses,games:played||team.games,winPct:Number.isFinite(Number(live.win_percentage))?Number(live.win_percentage):(played?wins/played:team.winPct),liveOverallRank:live.overall_rank,streak:live.streak,lastTen:live.last_ten};
  });
  return recalculateCompositeRatings(merged);
}
function renderComposite(payload){const teams=(payload.teams||[]).filter(team=>normalizeName(team.name)!=='leagueaverage').sort((a,b)=>(Number(a.overallRank)||999)-(Number(b.overallRank)||999));const scored=teams.filter(team=>Number.isFinite(Number(team.overallRating)));const leagueAverage=scored.length?scored.reduce((sum,team)=>sum+Number(team.overallRating),0)/scored.length:0;const pool=teams.length;let averageLineAdded=false;const rows=teams.map((team,index)=>{const slug=teamSlugs[team.name]||'';const rating=Math.round(Number(team.overallRating)||0);const rank=index+1,grade=compositeGrade(rank,pool);const addAverageLine=!averageLineAdded&&Number(team.overallRating)<leagueAverage;averageLineAdded=averageLineAdded||addAverageLine;const record=`${team.wins??'—'}${team.wins!==null&&team.wins!==undefined?'–':''}${team.losses??'—'}`;const href=slug?`/team.html?team=${encodeURIComponent(slug)}`:'/around-the-w.html';return `${addAverageLine?`<div class="league-average-line" role="separator"><span>LEAGUE AVERAGE</span><b>${leagueAverage.toFixed(1)} / 100</b></div>`:''}<a class="composite-row ${rank===1?'composite-first':''}" href="${href}" aria-label="Open ${skSafe(team.name)} team dashboard"><span class="composite-rank">${rank}</span><strong>${skSafe(team.name)}</strong><span>${skSafe(record)}</span><b>${rating} / 100</b><span class="grade-chip grade-${grade.charAt(0).toLowerCase()}">${skSafe(grade)}</span><span>${compositeNumber(team.offRtg)}</span><span>${compositeNumber(team.defRtg)}</span><span>${compositeNumber(team.netRtg,true)}</span></a>`;}).join('');document.getElementById('compositeTable').innerHTML=`<div class="composite-head"><span>Rank</span><span>Team</span><span>Record</span><span>W Rating</span><span>Weighted grade</span><span>Offense</span><span>Defense</span><span>Net</span></div>${rows}`;}
async function loadComposite(){const status=document.getElementById('compositeStatus');try{const stamp=Date.now();const [dnaResponse,liveResponse]=await Promise.all([fetch(`/api/team-dna?season=2026&direct=1&v=20260830-live-sync-v1&cb=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}),fetch(`/api/stats?season=2026&v=20260830-live-sync-v1&cb=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'})]);const [dnaPayload,livePayload]=await Promise.all([dnaResponse.json().catch(()=>({})),liveResponse.json().catch(()=>({}))]);if(!dnaResponse.ok||dnaPayload.error||!Array.isArray(dnaPayload.teams))throw new Error(dnaPayload.error||'W Rating table unavailable');if(!liveResponse.ok||livePayload.error||!Array.isArray(livePayload.standings))throw new Error(livePayload.error||'Live standings unavailable');const teams=syncCompositeWithLive(dnaPayload,livePayload);renderComposite({...dnaPayload,teams});const updated=new Date(livePayload.updatedAt||dnaPayload.updatedAt||Date.now());status.textContent=`Updated ${updated.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;}catch(error){document.getElementById('compositeTable').innerHTML=`<div class="leader-error"><strong>The Seasoning Scale is still in the kitchen.</strong><p>${skSafe(error.message)} Try again shortly.</p></div>`;status.textContent='Feed temporarily unavailable';}}

renderAwards();
loadPlayerPhotos();
loadLeaders();
loadComposite();
