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

const featuredPlayers=[
  {name:'Kelsey Mitchell',label:'1 · PG',role:'POINT GUARD',copy:'The lead guard in Shak’s five — pace, pressure, scoring gravity and the first decision-maker in the offense.'},
  {name:'Paige Bueckers',label:'2 · SG',role:'SHOOTING GUARD',copy:'A secondary creator at the two, bringing craft, shot-making, movement and another elite playmaking option.'},
  {name:'Napheesa Collier',label:'3 · SF',role:'SMALL FORWARD',copy:'The two-way connector on the wing — versatile enough to score, defend across matchups and keep the lineup balanced.'},
  {name:'Breanna Stewart',label:'4 · PF',role:'POWER FORWARD',copy:'Length, skill and versatility at the four, stretching the floor while creating matchup problems inside and out.'},
  {name:"A'ja Wilson",label:'5 · C',role:'CENTER',copy:'The anchor at the five — interior scoring, rim protection, rebounding and championship-level presence in the middle.'}
];

async function renderStartingFive(){
  const grid=document.getElementById('startingFiveGrid');
  if(!grid)return;
  let roster=[];
  try{
    const response=await fetch('/api/players?headshots=transparent-v1',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    roster=Array.isArray(payload.players)?payload.players:[];
  }catch{}
  const byName=new Map(roster.map(player=>[sKey(player.name),player]));
  const cards=featuredPlayers.map(item=>{
    const player=byName.get(sKey(item.name))||{name:item.name};
    const photo=sPhoto(player);
    const cutout=Boolean(player.officialHeadshot||player.photoCutout);
    const media=photo?`<img class="${cutout?'player-cutout':''}" src="${sSafe(photo)}" alt="${sSafe(item.name)}" loading="lazy" decoding="async" onerror="this.remove()">`:`<span>${sSafe(item.name.split(' ').map(part=>part[0]).join('').slice(0,2))}</span>`;
    return `<a class="portal-card featured-player-card" href="/playerpedia.html?search=${encodeURIComponent(item.name)}"><span class="featured-player-photo">${media}</span><span><span class="portal-label">${sSafe(item.label)} · ${sSafe(item.role)}</span><strong>${sSafe(item.name)}</strong><p>${sSafe(item.copy)}</p></span></a>`;
  }).join('');
  grid.innerHTML=cards+`<article class="portal-card lime"><span class="portal-label">HOW IT WORKS</span><strong>Shak builds the five by role.</strong><p>The lineup can change as the season changes, but every edition is built as a playable five — 1 through 5 — rather than simply ranking the five biggest names.</p></article>`;
}

renderStartingFive();
