function bSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function bKey(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function bPhoto(player={}){
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
}
function easternDateParts(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=t=>Number(parts.find(p=>p.type===t)?.value||0);
  return {year:get('year'),month:get('month'),day:get('day')};
}
function mondayKey(){
  const p=easternDateParts();
  const d=new Date(Date.UTC(p.year,p.month-1,p.day,12));
  const shift=(d.getUTCDay()+6)%7;
  d.setUTCDate(d.getUTCDate()-shift);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function weekLabel(key){
  const d=new Date(`${key}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(d);
}

async function loadBenchMob(){
  const grid=document.getElementById('benchMobGrid');
  const status=document.getElementById('benchMobStatus');
  const methodology=document.getElementById('benchMobMethod');
  if(!grid)return;
  const week=mondayKey();
  if(status)status.textContent=`Week of ${weekLabel(week)} · Season-to-date board`;
  try{
    const [boardRes,playersRes]=await Promise.all([
      fetch(`/api/bench-mob?season=2026&week=${encodeURIComponent(week)}`,{headers:{Accept:'application/json'}}),
      fetch('/api/players',{headers:{Accept:'application/json'}})
    ]);
    const board=await boardRes.json().catch(()=>({}));
    const rosterPayload=await playersRes.json().catch(()=>({}));
    if(!boardRes.ok||!Array.isArray(board.picks))throw new Error(board.error||'Bench Mob data unavailable');
    const roster=Array.isArray(rosterPayload.players)?rosterPayload.players:[];
    const byName=new Map(roster.map(player=>[bKey(player.name),player]));
    grid.innerHTML=board.picks.map((pick,index)=>{
      const player=byName.get(bKey(pick.name))||{name:pick.name};
      const photo=bPhoto(player);
      const initials=pick.name.split(/\s+/).map(part=>part[0]).join('').slice(0,2);
      const media=photo?`<img src="${bSafe(photo)}" alt="${bSafe(pick.name)}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${bSafe(initials)}'}))">`:`<span>${bSafe(initials)}</span>`;
      return `<a class="portal-card featured-player-card${index===5?' lime':''}" href="/playerpedia.html?search=${encodeURIComponent(pick.name)}">
        <span class="featured-player-photo">${media}</span>
        <span>
          <span class="portal-label">${bSafe(pick.role)}</span>
          <strong>${bSafe(pick.name)}</strong>
          <p><b>${bSafe(pick.team||'WNBA')}</b>${pick.position?` · ${bSafe(pick.position)}`:''}</p>
          <p>${bSafe(pick.statLine||'')}</p>
          <p>${bSafe(pick.why||pick.subtitle||'')}</p>
        </span>
      </a>`;
    }).join('');
    if(methodology)methodology.textContent=`${board.methodology} Minimum sample this week: ${board.minGames} games. Data: Basketball-Reference.`;
  }catch(error){
    grid.innerHTML=`<article class="portal-card"><span class="portal-label">BENCH MOB</span><strong>Stats are warming up.</strong><p>${bSafe(error.message||'The weekly board is temporarily unavailable.')}</p></article>`;
    if(methodology)methodology.textContent='The board will retry automatically the next time this page loads.';
  }
}

loadBenchMob();
