function safe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function norm(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]/g,'');}
let teamAssets=[];

const POSTER_ORDER=[
  'atlanta-dream','chicago-sky','connecticut-sun','dallas-wings',
  'golden-state-valkyries','indiana-fever','las-vegas-aces','los-angeles-sparks',
  'minnesota-lynx','new-york-liberty','phoenix-mercury','portland-fire',
  'seattle-storm','washington-mystics'
];

function posterStyle(slug){
  const index=POSTER_ORDER.indexOf(slug);
  if(index<0)return '';
  const col=index%2;
  const row=Math.floor(index/2);
  const x=col===0?0:100;
  const y=(row/6)*100;
  return `--poster-x:${x}%;--poster-y:${y.toFixed(4)}%`;
}

function standingsMarkup(items=[]){
  if(!items.length)return '<div style="padding:24px"><strong>Standings are temporarily unavailable.</strong></div>';
  return `<div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>${items.map((item,i)=>`<div class="standing-row"><span class="rank">${item.playoff_seed||i+1}</span><span class="team-name">${safe(item.team?.full_name||'Unknown')}</span><strong>${item.wins??'—'}</strong><strong>${item.losses??'—'}</strong><span>${Number.isFinite(Number(item.win_percentage))?Number(item.win_percentage).toFixed(3):'—'}</span></div>`).join('')}`;
}

function officialAsset(team){return teamAssets.find(asset=>norm(asset.name)===norm(team.name))||null;}

function officialLockup(team,asset){
  const badge=asset?.badge?`<span class="team-official-badge"><img src="${safe(asset.badge)}" alt="${safe(team.name)} official logo" loading="lazy"></span>`:`<span class="team-official-badge team-official-badge-fallback">${safe(team.tag)}</span>`;
  const wordmark=asset?.logo?`<img class="team-official-wordmark" src="${safe(asset.logo)}" alt="${safe(team.name)} official wordmark" loading="lazy">`:`<span class="team-official-name"><small>${safe(team.city)}</small><strong>${safe(team.name)}</strong></span>`;
  return `<div class="team-official-lockup">${badge}<span class="team-wordmark-zone">${wordmark}</span></div>`;
}

function renderDirectory(records=[]){
  const grid=document.getElementById('teamDirectory');
  if(!grid)return;
  grid.innerHTML=TEAM_DATA.map(team=>{
    const asset=officialAsset(team);
    const record=records.find(r=>norm(r.team?.full_name)===norm(team.name));
    const recordText=record?`${record.wins}-${record.losses}`:'2026';
    const pct=record&&Number.isFinite(Number(record.win_percentage))?Number(record.win_percentage).toFixed(3):'Season';
    const generatedPoster=POSTER_ORDER.includes(team.slug);
    if(generatedPoster){
      return `<a class="team-directory-card team-poster-card poster-ready" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
        <span class="team-poster-art" style="${posterStyle(team.slug)}" aria-hidden="true"></span>
        <span class="team-poster-a11y">${safe(team.name)} city graphic</span>
        <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
      </a>`;
    }
    return `<a class="team-directory-card team-poster-card" href="/team.html?team=${encodeURIComponent(team.slug)}" style="--team-primary:${team.primary};--team-secondary:${team.secondary};--team-accent:${team.accent};--team-text:${team.text}" aria-label="Open ${safe(team.name)} team page">
      <span class="team-motion-stripe stripe-one" aria-hidden="true"></span><span class="team-motion-stripe stripe-two" aria-hidden="true"></span><span class="team-motion-stripe stripe-three" aria-hidden="true"></span>
      <span class="team-skyline-wash" aria-hidden="true">${skylineSvg(team.skyline)}</span>
      ${officialLockup(team,asset)}
      <div class="team-poster-footer"><span>${recordText}</span><span>${safe(team.note||`${pct} win percentage`)}</span><b>→</b></div>
    </a>`;
  }).join('');
}

async function loadAround(){
  const table=document.getElementById('aroundStandings');
  const status=document.getElementById('aroundStatus');
  renderDirectory();
  const [statsResult,teamsResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Live data unavailable');return payload;}),
    fetch('/api/teams',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Team artwork unavailable');return payload;})
  ]);

  if(teamsResult.status==='fulfilled')teamAssets=Array.isArray(teamsResult.value.teams)?teamsResult.value.teams:[];

  if(statsResult.status==='fulfilled'){
    const payload=statsResult.value;
    const standings=Array.isArray(payload.standings)?payload.standings:[];
    table.innerHTML=standingsMarkup(standings);
    renderDirectory(standings);
    status.textContent=payload.fullSeasonAccess?'Live standings • independent feed':'Independent data feed connected';
  }else{
    table.innerHTML='<div style="padding:24px"><strong>Live standings are temporarily unavailable.</strong><p>The team directory still works.</p></div>';
    renderDirectory();
    status.textContent='Team directory available';
  }
}

loadAround();