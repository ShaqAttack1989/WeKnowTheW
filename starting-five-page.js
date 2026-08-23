function sSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function sKey(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function sPhoto(player={}){
  const cutout=[player.officialHeadshot,player.photoCutout].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(cutout)return String(cutout).trim();
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
}
function sWeekLabel(key){
  const date=new Date(`${key}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
}

const fallbackRotation={
  week:'2026-08-17',
  picks:[
    {name:'Kelsey Mitchell',label:'1 · PG',role:'Point Guard',copy:'The lead guard in Shak’s five — pace, pressure, scoring gravity and the first decision-maker in the offense.'},
    {name:'Paige Bueckers',label:'2 · SG',role:'Shooting Guard',copy:'A secondary creator at the two, bringing craft, shot-making, movement and another elite playmaking option.'},
    {name:'Napheesa Collier',label:'3 · SF',role:'Small Forward',copy:'The two-way connector on the wing — versatile enough to score, defend across matchups and keep the lineup balanced.'},
    {name:'Breanna Stewart',label:'4 · PF',role:'Power Forward',copy:'Length, skill and versatility at the four, stretching the floor while creating matchup problems inside and out.'},
    {name:"A'ja Wilson",label:'5 · C',role:'Center',copy:'The anchor at the five — interior scoring, rim protection, rebounding and championship-level presence in the middle.'}
  ]
};

function sPlayerMedia(item,player){
  const photo=sPhoto(player);
  const cutout=Boolean(player.officialHeadshot||player.photoCutout);
  if(photo)return `<img class="${cutout?'player-cutout':''}" src="${sSafe(photo)}" alt="${sSafe(item.name)}" loading="lazy" decoding="async" onerror="this.remove()">`;
  return `<span>${sSafe(item.name.split(' ').map(part=>part[0]).join('').slice(0,2))}</span>`;
}

function sCurrentCard(item,byName){
  const player=byName.get(sKey(item.name))||{name:item.name};
  const team=String(player.team||'').trim();
  return `<a class="portal-card featured-player-card" href="/playerpedia.html?search=${encodeURIComponent(item.name)}">
    <span class="featured-player-photo">${sPlayerMedia(item,player)}</span>
    <span>
      <span class="portal-label">${sSafe(item.label)} · ${sSafe(item.role)}</span>
      <strong>${sSafe(item.name)}</strong>
      ${team?`<p><b>${sSafe(team)}</b></p>`:''}
      <p>${sSafe(item.copy)}</p>
    </span>
  </a>`;
}

function sArchiveWeek(rotation,byName){
  const picks=Array.isArray(rotation.picks)?rotation.picks:[];
  const rows=picks.map(item=>{
    const player=byName.get(sKey(item.name))||{};
    const meta=[item.label,item.role,player.team].filter(Boolean).join(' · ');
    return `<a class="rotation-archive-player" href="/playerpedia.html?search=${encodeURIComponent(item.name)}"><span>${sSafe(item.name)}</span><small>${sSafe(meta)}</small></a>`;
  }).join('');
  return `<details class="rotation-archive-week"><summary><span>Week of ${sSafe(sWeekLabel(rotation.week))}</span><b>${picks.length} players</b></summary><div class="rotation-archive-players">${rows}</div></details>`;
}

async function renderStartingFive(){
  const grid=document.getElementById('startingFiveGrid');
  const summary=document.getElementById('startingFiveSummary');
  const archive=document.getElementById('startingFiveArchive');
  if(!grid)return;
  let roster=[];
  let rotations=[fallbackRotation];
  try{
    const [playersResponse,historyResponse]=await Promise.all([
      fetch('/api/players?headshots=transparent-v1',{headers:{Accept:'application/json'}}),
      fetch('/rotation-history.json?rev=20260822-rotation-copy-v2',{headers:{Accept:'application/json'}})
    ]);
    const playersPayload=await playersResponse.json().catch(()=>({}));
    const historyPayload=await historyResponse.json().catch(()=>({}));
    roster=Array.isArray(playersPayload.players)?playersPayload.players:[];
    if(Array.isArray(historyPayload.startingFive)&&historyPayload.startingFive.length)rotations=historyPayload.startingFive;
  }catch{}
  rotations=[...rotations].sort((a,b)=>String(b.week).localeCompare(String(a.week)));
  const current=rotations[0]||fallbackRotation;
  const picks=Array.isArray(current.picks)?current.picks:fallbackRotation.picks;
  const byName=new Map(roster.map(player=>[sKey(player.name),player]));
  if(summary)summary.textContent=`Week of ${sWeekLabel(current.week)} · Five roles, one playable lineup.`;
  grid.innerHTML=picks.map(item=>sCurrentCard(item,byName)).join('')+`<article class="portal-card lime"><span class="portal-label">HOW IT WORKS</span><strong>Shak builds the five by role.</strong><p>The lineup can change as the season changes, and every edition moves into the archive when a new five takes the floor.</p></article>`;
  if(archive){
    const past=rotations.slice(1);
    archive.innerHTML=past.length?past.map(rotation=>sArchiveWeek(rotation,byName)).join(''):`<div class="rotation-empty"><strong>The archive starts here.</strong><p>This five will move into Past Starting Fives when the next Monday rotation is published.</p></div>`;
  }
}

renderStartingFive();
