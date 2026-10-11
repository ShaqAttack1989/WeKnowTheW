function hSafe(value=''){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function hKey(value=''){
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]/g,'');
}

function hNames(entry){
  const heading=entry.querySelector('h4')?.textContent?.trim()||'';
  return heading
    .replace(/\s+Foundation$/i,'')
    .split(/\s+\+\s+/)
    .map(name=>name.trim())
    .map(name=>/^Angel C\. Reese$/i.test(name)?'Angel Reese':name)
    .filter(Boolean);
}

function hInitials(name=''){
  return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||'').join('')||'W';
}

const H_PHOTO_OVERRIDES=new Map([
  ['angelreese','https://cdn.wnba.com/headshots/wnba/latest/1040x760/1642291.png']
]);

function hPhoto(player={}){
  const cutout=H_PHOTO_OVERRIDES.get(hKey(player.name))||[player.officialHeadshot,player.photoCutout].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(cutout)return String(cutout).trim();
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
}

function hMedia(names,byName=new Map()){
  const count=Math.min(Math.max(names.length,1),2);
  const people=names.slice(0,count);
  return `<div class="herstory-entry-media" style="--photo-count:${count}" aria-label="${hSafe(people.join(' and '))}">${people.map(name=>{
    const player=byName.get(hKey(name))||{name};
    const photo=hPhoto(player);
    const cutout=H_PHOTO_OVERRIDES.has(hKey(name))||Boolean(player.officialHeadshot||player.photoCutout);
    return `<div class="herstory-entry-photo"><span>${hSafe(hInitials(name))}</span>${photo?`<img class="${cutout?'player-cutout':''}" src="${hSafe(photo)}" alt="${hSafe(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</div>`;
  }).join('')}</div>`;
}

function addKelseyMitchellHerstorySpotlight(){
  const educationCard=document.querySelector('#education.herstory-story-card');
  if(!educationCard||educationCard.querySelector('[data-herstory-kelsey-mitchell]'))return;
  const grid=educationCard.querySelector('.herstory-entry-grid');
  if(!grid)return;

  grid.insertAdjacentHTML('afterbegin',`
    <section class="herstory-entry" data-herstory-kelsey-mitchell>
      <span class="herstory-entry-tag">PH.D. IN PROGRESS</span>
      <h4>Kelsey Mitchell</h4>
      <p>Mitchell is pursuing a Ph.D. in educational leadership at Liberty University while producing one of the most prolific scoring stretches in WNBA history. In August 2026, she broke the league record for consecutive 20-point games and continued extending it.</p>
      <div class="herstory-entry-links">
        <a href="/playerpedia.html?search=Kelsey%20Mitchell#playerpedia-directory">Player profile</a>
        <a href="https://www.cbssports.com/wnba/news/fever-guard-kelsey-mitchell-best-scoring-season-wnba-history/" target="_blank" rel="noopener noreferrer">Doctoral study source ↗</a>
        <a href="https://fever.wnba.com/watch/video/mitchell-breaks-record" target="_blank" rel="noopener noreferrer">WNBA record source ↗</a>
      </div>
    </section>`);

  const sourceNote=document.querySelector('.herstory-stories .herstory-source-note');
  if(sourceNote)sourceNote.innerHTML='<strong>Herstory standard:</strong> This page includes only milestones players or credible public sources have shared. Sources are linked with each entry. Last editorial review: August 30, 2026.';
}

async function loadHerstoryPhotos(){
  const entries=[...document.querySelectorAll('.herstory-entry')];
  if(!entries.length)return;

  entries.forEach(entry=>entry.insertAdjacentHTML('afterbegin',hMedia(hNames(entry))));

  try{
    const response=await fetch('/api/players?herstoryPhotos=20260830-kelsey-mitchell-v1',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok||!Array.isArray(payload.players))throw new Error(payload.error||'Player photos unavailable');
    const byName=new Map(payload.players.map(player=>[hKey(player.name),player]));
    entries.forEach(entry=>{
      entry.querySelector('.herstory-entry-media')?.remove();
      entry.insertAdjacentHTML('afterbegin',hMedia(hNames(entry),byName));
    });
  }catch{
    /* Initials remain visible when the verified roster-photo service is unavailable. */
  }
}

addKelseyMitchellHerstorySpotlight();
loadHerstoryPhotos();
