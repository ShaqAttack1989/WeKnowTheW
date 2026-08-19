function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function artworkMap(payload={}){
  const map=new Map();
  (Array.isArray(payload.teams)?payload.teams:[]).forEach(item=>{
    if(!item?.name)return;
    const src=item.badge||item.logo||'';
    if(src)map.set(norm(item.name),src);
  });
  return map;
}

function vectorTeamCard(team,record,art=new Map()){
  const recordText=record?`${record.wins}-${record.losses}`:'2026';
  const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
  const badge=art.get(norm(team.name))||'';
  const logoMarkup=badge
    ? `<img class="vector-team-logo" src="${safe(badge)}" alt="${safe(team.name)} logo" loading="lazy" decoding="async" onload="this.nextElementSibling.hidden=true" onerror="this.remove()"><span class="vector-logo-fallback">${safe(team.tag)}</span>`
    : `<span class="vector-logo-fallback">${safe(team.tag)}</span>`;
  return `<a class="team-directory-card vector-team-card" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
    <span class="vector-brush vector-brush-one" aria-hidden="true"></span>
    <span class="vector-brush vector-brush-two" aria-hidden="true"></span>
    <span class="vector-city" aria-hidden="true">${skylineSvg(team.skyline,'team-card-skyline')}</span>
    <span class="vector-logo-panel">${logoMarkup}</span>
    <span class="vector-wordmark"><small>${safe(team.city)}</small><strong>${safe(team.name)}</strong></span>
    <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
  </a>`;
}

function clevelandPreviewCard(){
  return `<div class="directory-expansion-label"><span>EXPANSION PREVIEW</span><strong>Next stop: Cleveland · 2028</strong></div>
  <a class="team-directory-card cleveland-vector-card expansion-preview-card" href="/cleveland-sirens.html" style="--team-primary:#0D4FA3;--team-secondary:#06152C;--team-accent:#66BCEB;--team-text:#FFFFFF" aria-label="Open Cleveland Sirens expansion page">
    <img class="cleveland-vector-art" src="/assets/team-posters/cleveland-sirens.svg?v=20260819-vector-v1" alt="Cleveland Sirens custom team card" loading="lazy" decoding="async">
    <div class="team-poster-footer"><span>2028</span><span>Expansion team · Hear the Call</span><b>→</b></div>
  </a>`;
}

function renderDirectory(records=[],art=new Map()){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  const currentCards=TEAM_DATA.map(team=>{
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    return vectorTeamCard(team,record,art);
  }).join('');
  grid.innerHTML=currentCards+clevelandPreviewCard();
}

async function loadAround(){
  const table=document.getElementById('aroundStandings');
  const status=document.getElementById('aroundStatus');
  renderDirectory();

  const [statsResult,artResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}}).then(async response=>{
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||'Live data unavailable');
      return payload;
    }),
    fetch('/api/teams',{headers:{Accept:'application/json'}}).then(async response=>{
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||'Team artwork unavailable');
      return payload;
    })
  ]);

  const art=artResult.status==='fulfilled'?artworkMap(artResult.value):new Map();
  if(statsResult.status==='fulfilled'){
    const payload=statsResult.value;
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    table.innerHTML=standingsMarkup(standings);
    renderDirectory(standings,art);
    status.textContent=payload.fullSeasonAccess?'Live standings • scalable custom cards':'Independent data feed connected';
  }else{
    table.innerHTML='<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    renderDirectory([],art);
    status.textContent='Team directory available';
  }
}

loadAround();