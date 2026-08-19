if(!document.querySelector('link[data-team-posters]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/team-posters.css?v=20260818g';l.dataset.teamPosters='true';document.head.appendChild(l);}
function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}
function posterPath(slug){return window.TEAM_POSTER_DATA?.[slug]||'';}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function renderDirectory(records=[]){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  grid.innerHTML=TEAM_DATA.map(team=>{
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    const recordText=record?`${record.wins}-${record.losses}`:'2026';
    const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
    return `<a class="team-directory-card team-poster-card" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
      <img class="team-poster-image" src="${posterPath(team.slug)}" alt="${safe(team.name)} city graphic" loading="lazy" decoding="async">
      <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
    </a>`;
  }).join('');
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
    status.textContent='Team directory available';
  }
}
loadAround();
