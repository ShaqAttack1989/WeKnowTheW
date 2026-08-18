function tSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function tNorm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}

const params=new URLSearchParams(location.search);
const slug=params.get('team')||'';
const team=teamBySlug(slug);
let torontoPosterData='';
const POSTER_ORDER=[
  'atlanta-dream','chicago-sky','connecticut-sun','dallas-wings',
  'golden-state-valkyries','indiana-fever','las-vegas-aces','los-angeles-sparks',
  'minnesota-lynx','new-york-liberty','phoenix-mercury','portland-fire',
  'seattle-storm','washington-mystics'
];

function posterStyle(slug){
  if(slug==='toronto-tempo'&&torontoPosterData){
    return `background-image:url("data:image/webp;base64,${torontoPosterData}");background-size:cover;background-position:center;background-repeat:no-repeat;`;
  }
  const index=POSTER_ORDER.indexOf(slug);
  if(index<0)return '';
  const y=(index/(POSTER_ORDER.length-1))*100;
  return `background-size:100% ${POSTER_ORDER.length*100}%;background-position:0% ${y.toFixed(4)}%;background-repeat:no-repeat;`;
}

function hasPoster(){return Boolean(team&&(POSTER_ORDER.includes(team.slug)||(team.slug==='toronto-tempo'&&torontoPosterData)));}

function applyGeneratedPoster(){
  if(!hasPoster())return false;
  const hero=document.getElementById('teamHero');
  const nav=hero?.querySelector('.nav');
  if(!hero||!nav)return false;
  hero.classList.add('has-generated-poster');
  let banner=hero.querySelector('.team-poster-page-banner');
  if(!banner){
    banner=document.createElement('div');
    banner.className='team-poster-page-banner';
    nav.insertAdjacentElement('afterend',banner);
  }
  banner.innerHTML=`<div class="team-poster-art" style="${posterStyle(team.slug)}" role="img" aria-label="${tSafe(team.name)} city graphic"></div>`;
  return true;
}

function applyOfficialTeamArtwork(asset){
  if(document.getElementById('teamHero')?.classList.contains('has-generated-poster'))return;
  const badge=document.getElementById('teamHeroBadge');
  const badgeFallback=document.getElementById('teamHeroBadgeFallback');
  const wordmark=document.getElementById('teamHeroWordmark');
  if(asset?.badge){
    badge.src=asset.badge;
    badge.alt=`${team.name} official logo`;
    badge.hidden=false;
    badgeFallback.hidden=true;
  }
  if(asset?.logo){
    wordmark.src=asset.logo;
    wordmark.alt=`${team.name} official wordmark`;
    wordmark.hidden=false;
  }
}

if(!team){
  document.getElementById('teamName').textContent='Team not found';
  document.getElementById('teamIntro').textContent='Choose a current team from Around the W.';
  document.getElementById('teamRecord').textContent='—';
  document.getElementById('teamPct').textContent='No team selected';
  document.getElementById('teamRoster').innerHTML='<div class="team-error">This team page could not be resolved. <a href="/around-the-w.html">Return to Around the W.</a></div>';
}else{
  document.documentElement.style.setProperty('--team-primary',team.primary);
  document.documentElement.style.setProperty('--team-secondary',team.secondary);
  document.documentElement.style.setProperty('--team-accent',team.accent);
  document.documentElement.style.setProperty('--team-text',team.text);
  const hero=document.getElementById('teamHero');
  hero.style.setProperty('--team-primary',team.primary);
  hero.style.setProperty('--team-secondary',team.secondary);
  hero.style.setProperty('--team-accent',team.accent);
  hero.style.setProperty('--team-text',team.text);
  document.title=`${team.name} | Around the W`;
  document.getElementById('teamName').textContent=team.name;
  document.getElementById('teamIntro').textContent=`${team.city} · current season, roster, history and culture in one franchise home.`;
  document.getElementById('teamCrumb').textContent=team.name;
  document.getElementById('teamTag').textContent=team.tag;
  document.getElementById('teamHeroBadgeFallback').textContent=team.tag;
  document.getElementById('teamSkyline').innerHTML=skylineSvg(team.skyline);
  document.getElementById('rosterHeading').textContent=`${team.name} roster`;
  document.getElementById('teamPlayerpediaLink').href=`/playerpedia.html?team=${encodeURIComponent(team.name)}`;
  if(team.note)document.getElementById('teamSeasonNote').textContent=`${team.note}. Live record and roster information refresh automatically from the independent data feed.`;
  applyGeneratedPoster();
  loadTeamPage();
}

async function loadTeamPage(){
  const recordEl=document.getElementById('teamRecord');
  const pctEl=document.getElementById('teamPct');
  const roster=document.getElementById('teamRoster');
  const rosterStatus=document.getElementById('rosterStatus');

  const [statsResult,playersResult,teamsResult,torontoResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Stats unavailable');return payload;}),
    fetch('/api/players?artwork=2',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Roster unavailable');return payload;}),
    fetch('/api/teams',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Team artwork unavailable');return payload;}),
    team?.slug==='toronto-tempo'?fetch('/assets/team-posters/toronto-tempo-small.b64',{cache:'force-cache'}).then(async response=>response.ok?(await response.text()).trim():''):Promise.resolve('')
  ]);

  if(torontoResult.status==='fulfilled'&&String(torontoResult.value).startsWith('UklG')){
    torontoPosterData=torontoResult.value;
    applyGeneratedPoster();
  }

  if(teamsResult.status==='fulfilled'){
    const assets=Array.isArray(teamsResult.value.teams)?teamsResult.value.teams:[];
    const asset=assets.find(item=>tNorm(item.name)===tNorm(team.name));
    if(asset)applyOfficialTeamArtwork(asset);
  }

  if(statsResult.status==='fulfilled'){
    const standings=Array.isArray(statsResult.value.standings)?statsResult.value.standings:[];
    const record=standings.find(item=>tNorm(item.team?.full_name)===tNorm(team.name));
    if(record){
      recordEl.textContent=`${record.wins}-${record.losses}`;
      pctEl.textContent=`${Number(record.win_percentage).toFixed(3)} win percentage`;
    }else{
      recordEl.textContent='2026';
      pctEl.textContent='Live record not returned yet';
    }
  }else{
    recordEl.textContent='2026';
    pctEl.textContent='Live record temporarily unavailable';
  }

  if(playersResult.status==='fulfilled'){
    const allPlayers=Array.isArray(playersResult.value.players)?playersResult.value.players:[];
    const teamPlayers=allPlayers.filter(player=>tNorm(player.team)===tNorm(team.name));
    rosterStatus.textContent=teamPlayers.length?`${teamPlayers.length} current players loaded automatically.`:'The current roster feed did not return players for this team yet.';
    roster.innerHTML=teamPlayers.length?teamPlayers.map(player=>`<a class="team-roster-card" href="/playerpedia.html?search=${encodeURIComponent(player.name)}"><span class="team-roster-number">${tSafe(player.number?`#${player.number}`:'W')}</span><span><strong>${tSafe(player.name)}</strong><span>${tSafe(player.position||'Player')}</span></span></a>`).join(''):'<div class="team-error">Current roster details are temporarily unavailable. Playerpedia remains accessible.</div>';
  }else{
    rosterStatus.textContent='Current roster temporarily unavailable.';
    roster.innerHTML='<div class="team-error">The roster feed could not load right now. Try Playerpedia or return later.</div>';
  }
}