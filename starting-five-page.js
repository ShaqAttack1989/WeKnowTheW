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
  week:'2026-08-24',
  picks:[
    {name:'Paige Bueckers',label:'1 · PG',role:'Point Guard',copy:'The lead creator in Shak’s five, combining scoring craft, pace control and playmaking from the point.'},
    {name:'Kelsey Mitchell',label:'2 · SG',role:'Shooting Guard',copy:'A relentless scoring threat at the two, stretching defenses with speed, movement and elite shot making.'},
    {name:'Napheesa Collier',label:'3 · SF',role:'Small Forward',copy:'The two way connector on the wing, bringing efficient scoring, defensive versatility and lineup balance.'},
    {name:'Angel Reese',label:'4 · PF',role:'Power Forward',copy:'Relentless rebounding, physicality and second chance pressure give the frontcourt its motor at the four.'},
    {name:"A'ja Wilson",label:'5 · C',role:'Center',copy:'The anchor at the five, pairing dominant interior scoring with rim protection, rebounding and championship presence.'}
  ]
};

function sItemPhoto(item={},player={}){
  const direct=String(item.photo||'').trim();
  if(/^https?:\/\//i.test(direct))return direct;
  return sPhoto(player);
}
function sPlayerMedia(item,player){
  const photo=sItemPhoto(item,player);
  const cutout=Boolean(item.photo||player.officialHeadshot||player.photoCutout);
  if(photo)return `<img class="${cutout?'player-cutout':''}" src="${sSafe(photo)}" alt="${sSafe(item.name)}" loading="lazy" decoding="async" onerror="this.remove()">`;
  return `<span>${sSafe(item.name.split(' ').map(part=>part[0]).join('').slice(0,2))}</span>`;
}
function sLink(item={}){
  if(/^https?:\/\//i.test(String(item.profileUrl||'')))return {href:item.profileUrl,target:' target="_blank" rel="noopener noreferrer"'};
  return {href:`/playerpedia.html?search=${encodeURIComponent(item.name||'')}`,target:''};
}
function sCurrentCard(item,byName){
  const player=byName.get(sKey(item.name))||{name:item.name};
  const link=sLink(item);
  const meta=[item.country,String(player.team||'').trim()].filter(Boolean)[0]||'';
  return `<a class="portal-card featured-player-card" href="${sSafe(link.href)}"${link.target}>
    <span class="featured-player-photo">${sPlayerMedia(item,player)}</span>
    <span>
      <span class="portal-label">${sSafe(item.label)} · ${sSafe(item.role)}</span>
      <strong>${sSafe(item.name)}</strong>
      ${meta?`<p><b>${sSafe(meta)}</b></p>`:''}
      ${item.statLine?`<p><b>${sSafe(item.statLine)}</b></p>`:''}
      <p>${sSafe(item.copy)}</p>
    </span>
  </a>`;
}
function sHonorableCard(item,byName){
  const player=byName.get(sKey(item.name))||{name:item.name};
  const link=sLink(item);
  return `<a class="portal-card featured-player-card" href="${sSafe(link.href)}"${link.target}>
    <span class="featured-player-photo">${sPlayerMedia(item,player)}</span>
    <span>
      <span class="portal-label">HONORABLE MENTION · ${sSafe(item.role||'Player')}</span>
      <strong>${sSafe(item.name)}</strong>
      ${item.country?`<p><b>${sSafe(item.country)}</b></p>`:''}
      ${item.statLine?`<p><b>${sSafe(item.statLine)}</b></p>`:''}
      <p>${sSafe(item.copy||'')}</p>
    </span>
  </a>`;
}

function sArchiveWeek(rotation,byName){
  const picks=Array.isArray(rotation.picks)?rotation.picks:[];
  const rows=picks.map(item=>{
    const player=byName.get(sKey(item.name))||{};
    const meta=[item.label,item.role,item.country,player.team].filter(Boolean).join(' · ');
    const link=sLink(item);
    return `<a class="rotation-archive-player" href="${sSafe(link.href)}"${link.target}><span>${sSafe(item.name)}</span><small>${sSafe(meta)}</small></a>`;
  }).join('');
  return `<details class="rotation-archive-week"><summary><span>Week of ${sSafe(sWeekLabel(rotation.week))}</span><b>${picks.length} players</b></summary><div class="rotation-archive-players">${rows}</div></details>`;
}

function sRenderHonorable(historyPayload,byName){
  const archive=document.getElementById('rotation-archive');
  if(!archive)return;
  const editions=Array.isArray(historyPayload.honorableMention)?[...historyPayload.honorableMention]:[];
  editions.sort((a,b)=>String(b.week||'').localeCompare(String(a.week||'')));
  const current=editions[0];
  if(!current||!Array.isArray(current.picks)||!current.picks.length)return;
  let section=document.getElementById('honorable-mention');
  if(!section){
    section=document.createElement('section');
    section.className='rotation-archive';
    section.id='honorable-mention';
    archive.parentNode.insertBefore(section,archive);
  }
  section.innerHTML=`<div class="page-heading compact-heading"><p class="kicker">${sSafe(current.edition||'HONORABLE MENTION')}</p><h2>All FIBA Honorable Mention</h2><p>Five more World Cup performances that made the cut brutally difficult.</p></div><div class="portal-grid featured-player-grid">${current.picks.map(item=>sHonorableCard(item,byName)).join('')}</div>`;
}

async function renderStartingFive(){
  const grid=document.getElementById('startingFiveGrid');
  const summary=document.getElementById('startingFiveSummary');
  const archive=document.getElementById('startingFiveArchive');
  if(!grid)return;
  let roster=[];
  let rotations=[fallbackRotation];
  let historyPayload={};
  try{
    const [playersResponse,historyResponse]=await Promise.all([
      fetch('/api/players?headshots=transparent-v1',{headers:{Accept:'application/json'}}),
      fetch(`/rotation-history.json?rev=20260914-all-fiba-v1&ts=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json','Cache-Control':'no-cache'}})
    ]);
    const playersPayload=await playersResponse.json().catch(()=>({}));
    historyPayload=await historyResponse.json().catch(()=>({}));
    roster=Array.isArray(playersPayload.players)?playersPayload.players:[];
    if(Array.isArray(historyPayload.startingFive)&&historyPayload.startingFive.length)rotations=historyPayload.startingFive;
  }catch{}
  rotations=[...rotations].sort((a,b)=>String(b.week).localeCompare(String(a.week)));
  const current=rotations[0]||fallbackRotation;
  const picks=Array.isArray(current.picks)?current.picks:fallbackRotation.picks;
  const byName=new Map(roster.map(player=>[sKey(player.name),player]));
  const edition=current.edition?` · ${current.edition}`:'';
  if(summary)summary.textContent=`Week of ${sWeekLabel(current.week)}${edition} · Five roles, one playable lineup.`;
  grid.innerHTML=picks.map(item=>sCurrentCard(item,byName)).join('')+`<article class="portal-card lime"><span class="portal-label">ALL FIBA EDITION</span><strong>Built for fit, not just fame.</strong><p>This five balances creation, defense, size, rebounding and tournament production. Current FIBA cards use official FIBA player imagery only. No AI images are used.</p></article>`;
  sRenderHonorable(historyPayload,byName);
  if(archive){
    const past=rotations.slice(1);
    archive.innerHTML=past.length?past.map(rotation=>sArchiveWeek(rotation,byName)).join(''):`<div class="rotation-empty"><strong>The archive starts here.</strong><p>This five will move into Past Starting Fives when the next Monday rotation is published.</p></div>`;
  }
}

renderStartingFive();
