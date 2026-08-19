function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}
const POSTER_VERSION='20260819-approved-local-v4';
const posterCache=new Map();
function posterUrl(slug,ext='webp'){return `/assets/team-posters/${encodeURIComponent(slug)}.${ext}?v=${POSTER_VERSION}`;}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

async function resolveSavedPoster(url){
  if(posterCache.has(url))return posterCache.get(url);
  const promise=(async()=>{
    const response=await fetch(url,{cache:'force-cache'});
    if(!response.ok)throw new Error(`Poster unavailable (${response.status})`);
    const blob=await response.blob();
    const text=await blob.text();
    const encoded=text.replace(/\s+/g,'').trim();
    if(/^UklGR[A-Za-z0-9+/=]+$/.test(encoded))return `data:image/webp;base64,${encoded}`;
    if(/^iVBOR[A-Za-z0-9+/=]+$/.test(encoded))return `data:image/png;base64,${encoded}`;
    if(/^\/9j\/[A-Za-z0-9+/=]+$/.test(encoded))return `data:image/jpeg;base64,${encoded}`;
    return URL.createObjectURL(blob);
  })();
  posterCache.set(url,promise);
  return promise;
}

function hydrateSavedPosters(root){
  root.querySelectorAll('img[data-saved-poster]').forEach(async img=>{
    const url=img.dataset.savedPoster;
    if(!url||img.dataset.posterHydrated==='true')return;
    img.dataset.posterHydrated='true';
    try{
      img.src=await resolveSavedPoster(url);
    }catch{
      img.hidden=true;
      img.closest('.team-directory-card')?.classList.add('poster-load-error');
    }
  });
}

function localPosterCard(team,record){
  const recordText=record?`${record.wins}-${record.losses}`:'2026';
  const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
  const localFile=posterUrl(team.slug);
  return `<a class="team-directory-card team-poster-card poster-ready approved-local-poster" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
    <span class="poster-local-fallback" aria-hidden="true"><b>${safe(team.tag)}</b><strong>${safe(team.name)}</strong></span>
    <img class="team-poster-img" data-saved-poster="${safe(localFile)}" alt="${safe(team.name)} custom team card" loading="lazy" decoding="async" onerror="this.hidden=true;this.closest('.team-directory-card')?.classList.add('poster-load-error')">
    <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
  </a>`;
}

function clevelandPreviewCard(){
  return `<div class="directory-expansion-label"><span>EXPANSION PREVIEW</span><strong>Next stop: Cleveland · 2028</strong></div>
  <a class="team-directory-card team-poster-card poster-ready approved-local-poster expansion-preview-card" href="/cleveland-sirens.html" style="--team-primary:#0D4FA3;--team-secondary:#06152C;--team-accent:#66BCEB;--team-text:#FFFFFF" aria-label="Open Cleveland Sirens expansion page">
    <span class="poster-local-fallback" aria-hidden="true"><b>CLE</b><strong>Cleveland Sirens</strong></span>
    <img class="team-poster-img" src="${posterUrl('cleveland-sirens','svg')}" alt="Cleveland Sirens custom team card" loading="lazy" decoding="async" onerror="this.hidden=true;this.closest('.team-directory-card')?.classList.add('poster-load-error')">
    <div class="team-poster-footer"><span>2028</span><span>Expansion team · Hear the Call</span><b>→</b></div>
  </a>`;
}

function renderDirectory(records=[]){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  const currentCards=TEAM_DATA.map(team=>{
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    return localPosterCard(team,record);
  }).join('');
  grid.innerHTML=currentCards+clevelandPreviewCard();
  hydrateSavedPosters(grid);
}

async function loadAround(){
  const table=document.getElementById('aroundStandings');
  const status=document.getElementById('aroundStatus');
  renderDirectory();
  try{
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Live data unavailable');
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    table.innerHTML=standingsMarkup(standings);
    renderDirectory(standings);
    status.textContent=payload.fullSeasonAccess?'Live standings • independent feed':'Independent data feed connected';
  }catch(error){
    table.innerHTML='<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    renderDirectory();
    status.textContent='Team directory available';
  }
}

loadAround();