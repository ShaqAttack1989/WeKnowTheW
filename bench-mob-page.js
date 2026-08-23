function bSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function bCleanName(v=''){
  return String(v)
    .replace(/<\/?(?:strong|b|span|a)\b[^>]*>?/gi,' ')
    .replace(/[<>]/g,' ')
    .replace(/\*\*/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function bKey(v=''){return bCleanName(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
const BENCH_TEAM_OVERRIDES=new Map([
  ['sydneytaylor','Chicago Sky']
]);
const BENCH_PHOTO_OVERRIDES=new Map([
  ['sydneytaylor','https://cdn.wnba.com/headshots/wnba/latest/1040x760/1642321.png'],
  ['madinaokot','https://cdn.wnba.com/headshots/wnba/latest/1040x760/1643431.png'],
  ['kikirice','https://cdn.wnba.com/headshots/wnba/latest/1040x760/1643445.png'],
  ['janellesalaun','https://cdn.wnba.com/headshots/wnba/latest/1040x760/1642767.png']
]);
function bPhoto(player={}){
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
function weekLabel(key){
  const d=new Date(`${key}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(d);
}

function bPlayerInfo(name,byName){
  const cleanName=bCleanName(name);
  const player=byName.get(bKey(cleanName))||{name:cleanName};
  const displayName=bCleanName(player.name||cleanName);
  const playerKey=bKey(displayName);
  const photo=BENCH_PHOTO_OVERRIDES.get(playerKey)||bPhoto(player);
  const cutout=BENCH_PHOTO_OVERRIDES.has(playerKey)||Boolean(player.officialHeadshot||player.photoCutout);
  const initials=displayName.split(/\s+/).filter(Boolean).map(part=>part[0]).join('').slice(0,2).toUpperCase();
  const media=photo?`<img class="${cutout?'player-cutout':''}" src="${bSafe(photo)}" alt="${bSafe(displayName)}" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${bSafe(initials)}'}))">`:`<span>${bSafe(initials)}</span>`;
  const forcedTeam=BENCH_TEAM_OVERRIDES.get(playerKey)||'';
  const rosterTeam=String(player.team||'').trim();
  const team=forcedTeam||(rosterTeam&&!/^WNBA$/i.test(rosterTeam)?rosterTeam:'');
  const position=String(player.position||'').trim();
  return {displayName,media,team,position};
}

function bCurrentCards(picks,byName){
  return picks.map((pick,index)=>{
    const info=bPlayerInfo(pick.name,byName);
    const meta=[info.team,info.position||pick.position].filter(Boolean).map(bSafe).join(' · ');
    return `<a class="portal-card featured-player-card${index===5?' lime':''}" href="/playerpedia.html?search=${encodeURIComponent(info.displayName)}">
      <span class="featured-player-photo">${info.media}</span>
      <span>
        <span class="portal-label">${bSafe(pick.role)}</span>
        <strong>${bSafe(info.displayName)}</strong>
        ${meta?`<p><b>${meta}</b></p>`:''}
        <p>${bSafe(pick.statLine||'')}</p>
        <p>${bSafe(pick.why||pick.subtitle||'')}</p>
      </span>
    </a>`;
  }).join('');
}

function bArchiveWeek(rotation,byName){
  const picks=Array.isArray(rotation.picks)?rotation.picks:[];
  const rows=picks.map(pick=>{
    const info=bPlayerInfo(pick.name,byName);
    const meta=[pick.role,info.team,info.position].filter(Boolean).join(' · ');
    return `<a class="rotation-archive-player" href="/playerpedia.html?search=${encodeURIComponent(info.displayName)}"><span>${bSafe(info.displayName)}</span><small>${bSafe(meta)}</small></a>`;
  }).join('');
  const note=rotation.note?`<p class="rotation-archive-note">${bSafe(rotation.note)}</p>`:'';
  const count=rotation.partial?'Recorded selection':`${picks.length} players`;
  return `<details class="rotation-archive-week"><summary><span>Week of ${bSafe(weekLabel(rotation.week))}</span><b>${bSafe(count)}</b></summary>${note}<div class="rotation-archive-players">${rows}</div></details>`;
}

async function loadBenchMob(){
  const grid=document.getElementById('benchMobGrid');
  const status=document.getElementById('benchMobStatus');
  const methodology=document.getElementById('benchMobMethod');
  const archive=document.getElementById('benchMobArchive');
  if(!grid)return;
  const revision='20260822-rotation-copy-v2';
  try{
    const [historyRes,playersRes]=await Promise.all([
      fetch(`/rotation-history.json?rev=${revision}`,{headers:{Accept:'application/json'}}),
      fetch(`/api/players?rev=${revision}`,{headers:{Accept:'application/json'}})
    ]);
    const history=await historyRes.json().catch(()=>({}));
    const rosterPayload=await playersRes.json().catch(()=>({}));
    const roster=Array.isArray(rosterPayload.players)?rosterPayload.players:[];
    const byName=new Map(roster.map(player=>[bKey(player.name),player]));
    let rotations=Array.isArray(history.benchMob)?[...history.benchMob]:[];
    rotations.sort((a,b)=>String(b.week).localeCompare(String(a.week)));
    let current=rotations[0];
    if(!current||!Array.isArray(current.picks)||!current.picks.length){
      const boardRes=await fetch(`/api/bench-mob?season=2026&rev=${revision}`,{headers:{Accept:'application/json'}});
      const board=await boardRes.json().catch(()=>({}));
      if(!boardRes.ok||!Array.isArray(board.picks))throw new Error(board.error||'Bench Mob data unavailable');
      current={week:new Date().toISOString().slice(0,10),picks:board.picks};
      rotations=[current];
    }
    if(status)status.textContent=`Week of ${weekLabel(current.week)} · Weekly role-player board`;
    grid.innerHTML=bCurrentCards(current.picks,byName);
    if(methodology)methodology.textContent='A weekly snapshot of scoring, efficiency, defense, playmaking and role fit. Each edition remains unchanged until the next rotation.';
    if(archive){
      const past=rotations.slice(1);
      archive.innerHTML=past.length?past.map(rotation=>bArchiveWeek(rotation,byName)).join(''):`<div class="rotation-empty"><strong>The archive starts here.</strong><p>This board will move into Past Bench Mobs after the next Monday rotation.</p></div>`;
    }
  }catch(error){
    grid.innerHTML=`<article class="portal-card"><span class="portal-label">BENCH MOB</span><strong>The rotation is warming up.</strong><p>${bSafe(error.message||'The weekly board is temporarily unavailable.')}</p></article>`;
    if(status)status.textContent='The weekly rotation could not be loaded.';
    if(methodology)methodology.textContent='The page will retry automatically the next time it loads.';
  }
}

loadBenchMob();
