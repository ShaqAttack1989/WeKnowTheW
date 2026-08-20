function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function posterCard(team,record,href){
  const recordText=team.recordLabel||(record?`${record.wins}-${record.losses}`:'2026');
  const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
  const link=href||`/team.html?team=${encodeURIComponent(team.slug)}`;
  const poster=team.poster||'';
  const footNote=team.note||(record?`${pct} win percentage`:'Franchise home');
  return `<a class="team-directory-card approved-local-poster" href="${safe(link)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)}">
    <span class="poster-local-fallback"><b>${safe(team.tag)}</b><strong>${safe(team.name)}</strong></span>
    ${poster?`<img class="team-poster-img" src="${safe(poster)}" alt="${safe(team.name)}" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('poster-load-error')">`:''}
    <div class="team-poster-footer"><span>${safe(recordText)}</span><span>${safe(footNote)}</span><b>→</b></div>
  </a>`;
}

function clevelandPreviewCard(){
  return `<div class="directory-expansion-label"><span>EXPANSION PREVIEW</span><strong>Next stop: Cleveland · 2028</strong></div>
  ${posterCard({...CLEVELAND_SIRENS, note:'Expansion team · Hear the Call', recordLabel:'2028'},null,CLEVELAND_SIRENS.href).replace('team-directory-card approved-local-poster','team-directory-card approved-local-poster expansion-preview-card')}`;
}

function renderDirectory(records=[]){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  const currentCards=TEAM_DATA.map(team=>{
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    return posterCard(team,record);
  }).join('');
  grid.innerHTML=currentCards+clevelandPreviewCard();
}

async function loadAround(){
  const table=document.getElementById('aroundStandings');
  const status=document.getElementById('aroundStatus');
  renderDirectory();

  try{
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Live data unavailable');
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    table.innerHTML=standings.length?standingsMarkup(standings):'<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    renderDirectory(standings);
    status.textContent='Live standings · custom franchise cards';
  }catch{
    table.innerHTML='<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    status.textContent='Team directory available · live standings retrying';
  }
}

loadAround();
