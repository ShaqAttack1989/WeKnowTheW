function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function logoBlock(team,asset){
  const src=asset?.badge||asset?.logo||'';
  const fallbackHidden=src?' hidden':'';
  const image=src?`<img class="team-logo-card-image" src="${safe(src)}" alt="${safe(team.name)} logo" loading="lazy" decoding="async" onerror="this.hidden=true;this.previousElementSibling.hidden=false">`:'';
  return `<div class="team-logo-card-logo" aria-label="${safe(team.name)} logo"><span class="team-logo-card-fallback"${fallbackHidden}>${safe(team.tag)}</span>${image}</div>`;
}

function logoCard(team,record,asset){
  const recordText=record?`${record.wins}-${record.losses}`:'2026';
  const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
  return `<a class="team-directory-card team-logo-card" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
    <div class="team-logo-card-main">
      ${logoBlock(team,asset)}
      <div class="team-logo-card-copy"><span>${safe(team.city)}</span><strong>${safe(team.name)}</strong></div>
    </div>
    <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
  </a>`;
}

function clevelandPreviewCard(){
  return `<div class="directory-expansion-label"><span>EXPANSION PREVIEW</span><strong>Next stop: Cleveland · 2028</strong></div>
  <a class="team-directory-card team-logo-card expansion-preview-card" href="/cleveland-sirens.html" style="--team-primary:#0D4FA3;--team-secondary:#06152C;--team-accent:#66BCEB;--team-text:#FFFFFF" aria-label="Open Cleveland Sirens expansion page">
    <div class="team-logo-card-main">
      <div class="team-logo-card-logo"><span class="team-logo-card-fallback">CLE</span></div>
      <div class="team-logo-card-copy"><span>Cleveland</span><strong>Cleveland Sirens</strong></div>
    </div>
    <div class="team-poster-footer"><span>2028</span><span>Expansion team · Hear the Call</span><b>→</b></div>
  </a>`;
}

function renderDirectory(records=[],assets=[]){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  const assetMap=new Map(assets.map(item=>[norm(item.name),item]));
  const currentCards=TEAM_DATA.map(team=>{
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    return logoCard(team,record,assetMap.get(norm(team.name))||null);
  }).join('');
  grid.innerHTML=currentCards+clevelandPreviewCard();
}

async function loadAround(){
  const table=document.getElementById('aroundStandings');
  const status=document.getElementById('aroundStatus');
  renderDirectory();

  const [statsResult,teamsResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Live data unavailable');return payload;}),
    fetch('/api/teams',{headers:{Accept:'application/json'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Team logos unavailable');return payload;})
  ]);

  const standings=statsResult.status==='fulfilled'&&Array.isArray(statsResult.value.standings)?statsResult.value.standings:[];
  const assets=teamsResult.status==='fulfilled'&&Array.isArray(teamsResult.value.teams)?teamsResult.value.teams:[];

  table.innerHTML=standings.length?standingsMarkup(standings):'<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
  renderDirectory(standings,assets);

  if(statsResult.status==='fulfilled'&&teamsResult.status==='fulfilled')status.textContent='Live standings · logo-only team cards';
  else if(teamsResult.status==='fulfilled')status.textContent='Team logos connected · live standings retrying';
  else status.textContent='Team directory available · logo feed retrying';
}

loadAround();