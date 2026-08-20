function sSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function sKey(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function sPhoto(player={}){
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
}

const featuredPlayers=[
  {name:"A'ja Wilson",label:'01 · FEATURED',copy:'Power, production, leadership and championship-level presence.'},
  {name:'Napheesa Collier',label:'02 · FEATURED',copy:'Two-way precision and the kind of game that makes hard things look simple.'},
  {name:'Breanna Stewart',label:'03 · FEATURED',copy:'Length, skill, versatility and a résumé built across every level.'},
  {name:'Caitlin Clark',label:'04 · FEATURED',copy:'Range, passing vision and an ability to bend defenses before the possession even settles.'},
  {name:'Paige Bueckers',label:'05 · FEATURED',copy:'Craft, pace, shot-making and next-wave star power.'}
];

async function renderStartingFive(){
  const grid=document.getElementById('startingFiveGrid');
  if(!grid)return;
  let roster=[];
  try{
    const response=await fetch('/api/players',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    roster=Array.isArray(payload.players)?payload.players:[];
  }catch{}
  const byName=new Map(roster.map(player=>[sKey(player.name),player]));
  const cards=featuredPlayers.map(item=>{
    const player=byName.get(sKey(item.name))||{name:item.name};
    const photo=sPhoto(player);
    const media=photo?`<img src="${sSafe(photo)}" alt="${sSafe(item.name)}" loading="lazy" decoding="async" onerror="this.remove()">`:`<span>${sSafe(item.name.split(' ').map(part=>part[0]).join('').slice(0,2))}</span>`;
    return `<a class="portal-card featured-player-card" href="/playerpedia.html?search=${encodeURIComponent(item.name)}"><span class="featured-player-photo">${media}</span><span><span class="portal-label">${sSafe(item.label)}</span><strong>${sSafe(item.name)}</strong><p>${sSafe(item.copy)}</p></span></a>`;
  }).join('');
  grid.innerHTML=cards+`<article class="portal-card lime"><span class="portal-label">HOW IT WORKS</span><strong>The rotation changes.</strong><p>Hot stretches, milestones, comeback stories, breakout players and big moments can all earn a spot here.</p></article>`;
}

renderStartingFive();
