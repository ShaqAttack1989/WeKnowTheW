function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}
function aroundPct(v){return Number.isFinite(Number(v))?Number(v).toFixed(3):'—';}
function aroundGb(v){const n=Number(v);if(!Number.isFinite(n)||n===0)return '—';return Number.isInteger(n)?String(n):n.toFixed(1);}
function aroundStreakClass(value=''){return /^W/i.test(String(value))?'is-positive':/^L/i.test(String(value))?'is-negative':'';}
function aroundLastTenClass(value=''){const match=String(value).match(/(\d+)\s*-\s*(\d+)/);if(!match)return '';const wins=Number(match[1]),losses=Number(match[2]);return wins>losses?'is-positive':losses>wins?'is-negative':'is-even';}
function aroundPlayoffIcon(status){if(status==='clinched')return '<span class="playoff-marker clinched" title="Clinched Playoffs Berth" aria-label="Clinched Playoffs Berth"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m6.3 10.1 2.4 2.4 5-5"/></svg></span>';if(status==='eliminated')return '<span class="playoff-marker eliminated" title="Eliminated from Playoffs contention" aria-label="Eliminated from Playoffs contention"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m7 7 6 6m0-6-6 6"/></svg></span>';return '';}

function moveEditorialDeskToSnackShak(){
  document.querySelectorAll('.around-feature-wrap,.around-editorial-strip').forEach(node=>node.remove());
}

function standingsDetails(){return `<div class="standings-info-grid around-standings-info"><aside class="standings-info-card" aria-labelledby="aroundLegendTitle"><h3 id="aroundLegendTitle">Legend</h3><div class="playoff-legend-item"><span class="playoff-marker clinched"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m6.3 10.1 2.4 2.4 5-5"/></svg></span><span>Clinched Playoffs Berth</span></div><div class="playoff-legend-item"><span class="playoff-marker eliminated"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="m7 7 6 6m0-6-6 6"/></svg></span><span>Eliminated from Playoffs contention</span></div></aside><section class="standings-info-card tiebreak-card" aria-labelledby="aroundTiebreakTitle"><h3 id="aroundTiebreakTitle">Tiebreak Procedure</h3><p>The following tiebreak procedure shall be used to break ties for playoffs eligibility and home court advantage.</p><ol><li>Better record in head-to-head games</li><li>Better winning percentage against all teams with a .500 or better record at the end of the season</li><li>Better point differential in head-to-head games</li><li>Better point differential against all opponents</li></ol><p>If more than two teams are tied, as many teams as possible will be eliminated at each step. Once a team is eliminated, the process begins again at step one.</p></section></div>`;}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  const table=`<div class="live-table-scroll"><div class="live-standings-table"><div class="live-standings-row head"><span>TEAM</span><span>W</span><span>L</span><span>PCT</span><span>GB</span><span>CONF</span><span>HOME</span><span>ROAD</span><span>STREAK</span><span>L-10</span></div>${items.map((item,i)=>`<div class="live-standings-row"><span class="live-team-cell"><b class="live-rank">${item.overall_rank||item.playoff_seed||i+1}</b><strong>${safe(item.team?.full_name||'Unknown')}</strong>${aroundPlayoffIcon(item.playoff_status)}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${aroundPct(item.win_percentage)}</span><span>${aroundGb(item.games_back)}</span><span>${safe(item.conference_record||'—')}</span><span>${safe(item.home_record||'—')}</span><span>${safe(item.road_record||'—')}</span><span class="streak-cell ${aroundStreakClass(item.streak)}">${safe(item.streak||'—')}</span><span class="last-ten-cell ${aroundLastTenClass(item.last_ten)}">${safe(item.last_ten||'—')}</span></div>`).join('')}</div></div>`;
  return table+standingsDetails();
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
  moveEditorialDeskToSnackShak();
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
