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
const isAtlanta=slug==='atlanta-dream';

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
  document.getElementById('rosterPlayerpediaLink').href=`/playerpedia.html?team=${encodeURIComponent(team.name)}`;
  if(team.note)document.getElementById('teamSeasonNote').textContent=`${team.note}. Live record and roster information refresh automatically from the independent data feed.`;
  if(isAtlanta)activateAtlantaHub();
  loadTeamPage();
}

function activateAtlantaHub(){
  document.body.classList.add('atlanta-dream-page');
  document.title='Atlanta Dream | History, Roster, Awards & Live Updates';
  const description=document.querySelector('meta[name="description"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'description'}));
  description.content='Explore Atlanta Dream franchise history, WNBA Finals appearances, awards, uniforms, people, current players and automatically updated 2026 games and standings.';
  document.getElementById('genericTeamOverview').hidden=true;
  document.getElementById('atlantaLocalNav').hidden=false;
  document.getElementById('atlantaTeamHub').hidden=false;
  document.getElementById('atlantaTeamArchive').hidden=false;
  document.getElementById('teamIntro').textContent='Atlanta · franchise history, honors, culture, current players and the live 2026 season.';
}

function ordinal(value){
  const number=Number(value);
  if(!Number.isFinite(number)||number<1)return '—';
  const remainder=number%100;
  if(remainder>=11&&remainder<=13)return `${number}th`;
  return `${number}${number%10===1?'st':number%10===2?'nd':number%10===3?'rd':'th'}`;
}

function gamesForTeam(items=[]){
  return items.filter(game=>tNorm(game.homeTeam)===tNorm(team.name)||tNorm(game.awayTeam)===tNorm(team.name));
}

function renderAtlantaSeason(payload={}){
  if(!isAtlanta)return;
  const standings=Array.isArray(payload.standings)?payload.standings:[];
  const record=standings.find(item=>tNorm(item.team?.full_name)===tNorm(team.name));
  const stats=[
    {label:'Record',value:record?`${record.wins}-${record.losses}`:'—',note:'Live standings'},
    {label:'Overall',value:record?ordinal(record.overall_rank):'—',note:'League position'},
    {label:'Streak',value:record?.streak||'—',note:'Current run',tone:String(record?.streak||'').startsWith('W')?'positive':String(record?.streak||'').startsWith('L')?'negative':''},
    {label:'Last 10',value:record?.last_ten||'—',note:'Recent form',tone:(()=>{const [wins,losses]=String(record?.last_ten||'').split('-').map(Number);return wins>losses?'positive':losses>wins?'negative':'';})()}
  ];
  document.getElementById('dreamStatGrid').innerHTML=stats.map(item=>`<article${item.tone?` class="${item.tone}"`:''}><span>${tSafe(item.label)}</span><strong>${tSafe(item.value)}</strong><small>${tSafe(item.note)}</small></article>`).join('');

  const upcoming=gamesForTeam(Array.isArray(payload.upcomingGames)?payload.upcomingGames:[]).slice(0,3);
  const past=gamesForTeam(Array.isArray(payload.pastGames)?payload.pastGames:Array.isArray(payload.recentResults)?payload.recentResults:[]).slice(0,3);
  const renderGames=()=>{
    if(!window.WGameCards)return;
    document.getElementById('dreamUpcomingGames').innerHTML=WGameCards.render(upcoming,'upcoming',{limit:3,standings});
    document.getElementById('dreamRecentGames').innerHTML=WGameCards.render(past,'past',{limit:3,standings});
  };
  renderGames();
  window.WGameCards?.loadArtwork().then(renderGames);

  const updated=payload.updatedAt?new Date(payload.updatedAt):null;
  const time=updated&&!Number.isNaN(updated.getTime())?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(updated):'just now';
  document.getElementById('dreamFeedStatus').innerHTML=`<span aria-hidden="true"></span> Live feed updated ${tSafe(time)} ET`;
}

function renderAtlantaSeasonError(){
  if(!isAtlanta)return;
  document.getElementById('dreamFeedStatus').textContent='Live season feed temporarily unavailable';
  document.getElementById('dreamUpcomingGames').innerHTML='<div class="schedule-empty"><strong>Upcoming games could not load.</strong><p>Use the full Games page or try again shortly.</p></div>';
  document.getElementById('dreamRecentGames').innerHTML='<div class="schedule-empty"><strong>Recent results could not load.</strong><p>Use Live Stats or try again shortly.</p></div>';
}

function shortUpdateDate(value=''){
  const date=new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(date.getTime())?String(value||'Current'):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date);
}

function renderAtlantaRosterUpdates(payload={}){
  if(!isAtlanta)return;
  const transactions=(Array.isArray(payload.transactions)?payload.transactions:[]).filter(item=>tNorm(item.team)===tNorm(team.name)).map(item=>({kind:item.type||'Movement',player:item.player||'Team update',detail:item.detail||'Roster update',date:item.date||''}));
  const injuries=(Array.isArray(payload.injuries)?payload.injuries:[]).filter(item=>tNorm(item.team)===tNorm(team.name)&&!['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status||'').toUpperCase())).map(item=>({kind:item.status||'Availability',player:item.player||'Player update',detail:item.reason||'Availability update',date:item.updated||''}));
  const updates=[...transactions,...injuries].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,4);
  document.getElementById('dreamTeamUpdates').innerHTML=updates.length?updates.map(item=>`<article><div><span>${tSafe(item.kind)}</span><time>${tSafe(shortUpdateDate(item.date))}</time></div><strong>${tSafe(item.player)}</strong><p>${tSafe(item.detail)}</p></article>`).join(''):'<div class="dream-wire-clear"><span aria-hidden="true">✓</span><div><strong>No active Atlanta updates in the feed.</strong><p>The roster and availability report will refresh here when a new item is posted.</p></div></div>';
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
    renderAtlantaSeason(statsResult.value);
  }else{
    recordEl.textContent='2026';
    pctEl.textContent='Live record temporarily unavailable';
    renderAtlantaSeasonError();
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
    renderAtlantaRosterUpdates(playersResult.value);
  }else{
    rosterStatus.textContent='Current roster temporarily unavailable.';
    roster.innerHTML='<div class="team-error">The roster feed could not load right now. Try Playerpedia or return later.</div>';
    if(isAtlanta)document.getElementById('dreamTeamUpdates').innerHTML='<div class="team-error">The roster and availability feed is temporarily unavailable.</div>';
  }
}
