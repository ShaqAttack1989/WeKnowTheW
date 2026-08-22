function tSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function rosterPhoto(player={}){
  const cutout=[player.officialHeadshot,player.photoCutout].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(cutout)return String(cutout).trim();
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return String(direct).trim();
}
function tNorm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}

const params=new URLSearchParams(location.search);
const slug=params.get('team')||'';
const team=teamBySlug(slug);

function applyHeaderBackdrop(){
  const backdrop=document.getElementById('teamHeaderBackdrop');
  if(!backdrop||!team?.poster)return;
  backdrop.style.backgroundImage=`url("${team.poster}")`;
}

function applyOfficialTeamArtwork(asset){
  const badge=document.getElementById('teamHeroBadge');
  const badgeFallback=document.getElementById('teamHeroBadgeFallback');
  if(asset?.badge){
    badge.src=asset.badge;
    badge.alt=`${team.name} official logo`;
    badge.hidden=false;
    badgeFallback.hidden=true;
    badge.onerror=()=>{badge.hidden=true;badgeFallback.hidden=false;};
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
  applyHeaderBackdrop();
  document.title=`${team.name} | Around the W`;
  document.getElementById('teamName').textContent=team.name;
  document.getElementById('teamIntro').textContent=`${team.city} · current season, roster, history and culture in one franchise home.`;
  document.getElementById('teamCrumb').textContent=team.name;
  document.getElementById('teamTag').textContent=team.tag;
  document.getElementById('teamHeroBadgeFallback').textContent=team.tag;
  document.getElementById('rosterHeading').textContent=`${team.name} roster`;
  document.getElementById('teamPlayerpediaLink').href=`/playerpedia.html?team=${encodeURIComponent(team.name)}`;
  if(team.note)document.getElementById('teamSeasonNote').textContent=`${team.note}. Live record and roster information refresh automatically from the independent data feed.`;
  loadTeamPage();
}

async function loadTeamPage(){
  const recordEl=document.getElementById('teamRecord');
  const pctEl=document.getElementById('teamPct');
  const roster=document.getElementById('teamRoster');
  const rosterStatus=document.getElementById('rosterStatus');

  const [statsResult,playersResult,teamsResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Stats unavailable');return payload;}),
    fetch('/api/players?artwork=transparent-v1',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Roster unavailable');return payload;}),
    fetch('/api/teams',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Team artwork unavailable');return payload;})
  ]);

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
    roster.innerHTML=teamPlayers.length?teamPlayers.map(player=>{
      const photo=rosterPhoto(player);
      const cutout=Boolean(player.officialHeadshot||player.photoCutout);
      return `<a class="team-roster-card" href="/playerpedia.html?search=${encodeURIComponent(player.name)}"><span class="team-roster-media"><span class="team-roster-number">${tSafe(player.number?`#${player.number}`:'W')}</span>${photo?`<img class="team-roster-photo${cutout?' player-cutout':''}" src="${tSafe(photo)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`:''}</span><span><strong>${tSafe(player.name)}</strong><span>${tSafe(player.position||'Player')}</span></span></a>`;
    }).join(''):'<div class="team-error">Current roster details are temporarily unavailable. Playerpedia remains accessible.</div>';
  }else{
    rosterStatus.textContent='Current roster temporarily unavailable.';
    roster.innerHTML='<div class="team-error">The roster feed could not load right now. Try Playerpedia or return later.</div>';
  }
}
