function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}

const SPRITE_URL='/assets/team-posters/team-cards-sprite.webp?v=20260819-hq-v1';
const SPRITE_POSITIONS={
  'atlanta-dream':[0,0],
  'chicago-sky':[1,0],
  'connecticut-sun':[2,0],
  'dallas-wings':[3,0],
  'golden-state-valkyries':[0,1],
  'indiana-fever':[1,1],
  'las-vegas-aces':[2,1],
  'los-angeles-sparks':[3,1],
  'minnesota-lynx':[0,2],
  'new-york-liberty':[1,2],
  'phoenix-mercury':[2,2],
  'portland-fire':[3,2],
  'seattle-storm':[0,3],
  'toronto-tempo':[1,3],
  'washington-mystics':[2,3],
  'cleveland-sirens':[3,3]
};

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function spriteArt(slug,name,tag){
  const [col,row]=SPRITE_POSITIONS[slug]||[0,0];
  return `<span class="team-sprite-fallback" aria-hidden="true"><b>${safe(tag)}</b><strong>${safe(name)}</strong></span>
    <span class="team-sprite-window" aria-hidden="true">
      <img class="team-sprite-sheet" src="${SPRITE_URL}" alt="" loading="lazy" decoding="async" style="--sprite-col:${col};--sprite-row:${row}" onerror="this.closest('.team-directory-card')?.classList.add('sprite-load-error')">
    </span>`;
}

function posterCard(team,record){
  const recordText=record?`${record.wins}-${record.losses}`:'2026';
  const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
  return `<a class="team-directory-card team-sprite-card" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
    ${spriteArt(team.slug,team.name,team.tag)}
    <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
  </a>`;
}

function clevelandPreviewCard(){
  return `<div class="directory-expansion-label"><span>EXPANSION PREVIEW</span><strong>Next stop: Cleveland · 2028</strong></div>
  <a class="team-directory-card team-sprite-card expansion-preview-card" href="/cleveland-sirens.html" style="--team-primary:#0D4FA3;--team-secondary:#06152C;--team-accent:#66BCEB;--team-text:#FFFFFF" aria-label="Open Cleveland Sirens expansion page">
    ${spriteArt('cleveland-sirens','Cleveland Sirens','CLE')}
    <div class="team-poster-footer"><span>2028</span><span>Expansion team · Hear the Call</span><b>→</b></div>
  </a>`;
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
    const response=await fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(payload.error||'Live data unavailable');
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    table.innerHTML=standingsMarkup(standings);
    renderDirectory(standings);
    status.textContent=payload.fullSeasonAccess?'Live standings • approved high-resolution team graphics':'Independent data feed connected';
  }catch(error){
    table.innerHTML='<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    renderDirectory();
    status.textContent='Team directory available';
  }
}

loadAround();