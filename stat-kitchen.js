function skSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}

const weeklyAwards=[
  {week:12,dates:'Aug. 10 through 16',east:{name:'Caitlin Clark',team:'Indiana Fever',line:'25.7 PPG · 9.7 APG · 3.3 RPG',source:'https://fever.wnba.com/news/indiana-fever-guard-caitlin-clark-named-eastern-conference-player-of-the-week-3'},west:{name:'Olivia Miles',team:'Minnesota Lynx',line:'18.0 PPG · 7.5 APG · 4.5 RPG',source:'https://lynx.wnba.com/news/minnesota-lynx-guard-olivia-miles-named-western-conference-player-of-the-week'}},
  {week:11,dates:'Aug. 3 through 9',east:{name:'Shakira Austin',team:'Washington Mystics',line:'22.3 PPG · 11.7 RPG · 2.3 BPG',source:'https://mystics.wnba.com/news/shakira-austin-named-wnba-eastern-conference-player-of-the-week'},west:{name:'Kayla McBride',team:'Minnesota Lynx',line:'24.3 PPG · 1.7 RPG · 1.0 SPG',source:'https://www.wnba.com/watch/video/potw-kayla-mcbride-2'}},
  {week:10,dates:'July 27 through Aug. 2',east:{name:'Caitlin Clark',team:'Indiana Fever',line:'25.7 PPG · 9.0 APG · 5.0 RPG',source:'https://www.wnba.com/watch/video/potw-caitlin-clark-week-10'},west:{name:'A’ja Wilson',team:'Las Vegas Aces',line:'32.3 PPG · 12.0 RPG · 4.7 APG',source:'https://www.wnba.com/watch/video/potw-aja-wilson-2'}}
];

function awardCard(conference,award,latest=false){
  const conferenceName=conference==='East'?'EASTERN':'WESTERN';
  return `<article class="award-card ${conference.toLowerCase()} ${latest?'latest':''}"><span class="award-conference">${conferenceName} CONFERENCE</span><div class="award-flame" aria-hidden="true">${conference==='East'?'E':'W'}</div><div><small>${latest?'CURRENT WINNER':'WINNER'}</small><h3>${skSafe(award.name)}</h3><strong>${skSafe(award.team)}</strong><p>${skSafe(award.line)}</p><a href="${skSafe(award.source)}" target="_blank" rel="noopener noreferrer">Official receipt <span aria-hidden="true">→</span></a></div></article>`;
}

function renderAwards(){
  const latest=weeklyAwards[0];
  document.getElementById('weeklyAwards').innerHTML=`<div class="award-week-label"><span>WEEK ${latest.week}</span><strong>${skSafe(latest.dates)}, 2026</strong></div>${awardCard('East',latest.east,true)}${awardCard('West',latest.west,true)}`;
  document.getElementById('awardsArchive').innerHTML=`<h3>Still warm, previous winners</h3>${weeklyAwards.slice(1).map(item=>`<details class="award-history"><summary><span>Week ${item.week}</span><strong>${skSafe(item.dates)}</strong></summary><div class="award-history-grid">${awardCard('East',item.east)}${awardCard('West',item.west)}</div></details>`).join('')}`;
}

let leaderPayload=null;
let activeCategory='pts';
const categoryOrder=['pts','trb','ast','stl','blk','tov','3p'];

function valueLabel(value,unit){return `${Number(value).toFixed(1)} ${unit}`;}
function renderTabs(){
  const box=document.getElementById('statCategoryTabs');
  box.innerHTML=categoryOrder.map(key=>{const category=leaderPayload?.categories?.[key];if(!category)return '';const active=key===activeCategory;return `<button type="button" role="tab" data-stat-category="${key}" aria-selected="${active}" class="${active?'active':''}">${skSafe(category.label)}</button>`;}).join('');
}
function renderLeaders(){
  const category=leaderPayload?.categories?.[activeCategory];
  if(!category)return;
  renderTabs();
  const leaders=category.leaders||[];
  document.getElementById('leaderboard').innerHTML=`<div class="leaderboard-head"><span>Rank</span><span>Player</span><span>Team</span><span>${skSafe(category.unit)}</span></div>${leaders.map(player=>`<article class="leader-row ${player.rank===1?'number-one':''}"><span class="leader-rank">${player.rank}</span><div><strong>${skSafe(player.name)}</strong>${player.rank===1?'<small>HEAD CHEF</small>':''}</div><span>${skSafe(player.team||'WNBA')}</span><b>${skSafe(valueLabel(player.value,category.unit))}</b></article>`).join('')}`;
  document.querySelectorAll('[data-stat-category]').forEach(button=>button.addEventListener('click',()=>{activeCategory=button.dataset.statCategory;renderLeaders();}));
}

async function loadLeaders(){
  const status=document.getElementById('leaderStatus');
  try{
    const response=await fetch('/api/leaderboard?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||payload.error)throw new Error(payload.error||'Leaderboards unavailable');
    leaderPayload=payload;
    renderLeaders();
    const updated=new Date(payload.updatedAt||Date.now());
    status.textContent=`Updated ${updated.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
  }catch(error){
    document.getElementById('leaderboard').innerHTML=`<div class="leader-error"><strong>The Stat Kitchen is between servings.</strong><p>${skSafe(error.message)} Try again shortly.</p></div>`;
    status.textContent='Feed temporarily unavailable';
  }
}

renderAwards();
loadLeaders();
