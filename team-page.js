function tSafe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function tNorm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function tRgb(value='#000000'){
  const hex=String(value).trim().replace('#','');
  const normalized=hex.length===3?hex.split('').map(character=>character+character).join(''):hex;
  if(!/^[0-9a-f]{6}$/i.test(normalized))return [0,0,0];
  return [0,2,4].map(index=>parseInt(normalized.slice(index,index+2),16));
}
function tHex(rgb=[]){return `#${rgb.map(value=>Math.max(0,Math.min(255,Math.round(value))).toString(16).padStart(2,'0')).join('')}`;}
function tMix(color,target,amount){
  const source=tRgb(color);const destination=tRgb(target);
  return tHex(source.map((value,index)=>value+(destination[index]-value)*amount));
}
function tLuminance(color){
  const channels=tRgb(color).map(value=>{const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;});
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
}
function tContrast(first,second){const brighter=Math.max(tLuminance(first),tLuminance(second));const darker=Math.min(tLuminance(first),tLuminance(second));return (brighter+.05)/(darker+.05);}
function tOnColor(background){return tContrast(background,'#17131f')>=tContrast(background,'#ffffff')?'#17131f':'#ffffff';}
function tAccessibleTone(color,background,toward){
  if(tContrast(color,background)>=4.5)return color;
  for(let amount=.08;amount<=1;amount+=.08){const candidate=tMix(color,toward,amount);if(tContrast(candidate,background)>=4.5)return candidate;}
  return toward;
}
function applyTeamAccessibility(teamData={}){
  const root=document.documentElement;
  root.style.setProperty('--team-on-primary',tOnColor(teamData.primary));
  root.style.setProperty('--team-on-secondary',tOnColor(teamData.secondary));
  root.style.setProperty('--team-on-accent',tOnColor(teamData.accent));
  root.style.setProperty('--team-primary-text',tAccessibleTone(teamData.primary,'#ffffff','#17131f'));
  root.style.setProperty('--team-secondary-on-dark',tAccessibleTone(teamData.secondary,'#111217','#ffffff'));
}
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

const params=new URLSearchParams(location.search);
const slug=params.get('team')||'';
const team=teamBySlug(slug);
const guide=typeof teamGuideBySlug==='function'?teamGuideBySlug(slug):null;
const hasFranchiseHub=Boolean(team&&guide);

function applyHeaderBackdrop(){
  const backdrop=document.getElementById('teamHeaderBackdrop');
  if(backdrop&&team?.poster)backdrop.style.backgroundImage=`url("${team.poster}")`;
  const skyline=document.getElementById('teamSkyline');
  if(skyline&&team)skyline.innerHTML=skylineSvg(team.skyline);
}

function applyOfficialTeamArtwork(asset){
  const badge=document.getElementById('teamHeroBadge');
  const fallback=document.getElementById('teamHeroBadgeFallback');
  if(asset?.badge){
    badge.src=asset.badge;badge.alt=`${team.name} official logo`;badge.hidden=false;fallback.hidden=true;
    badge.onerror=()=>{badge.hidden=true;fallback.hidden=false;};
  }
  const wordmark=document.getElementById('teamHeroWordmark');
  if(asset?.wordmark){wordmark.src=asset.wordmark;wordmark.alt=`${team.name} wordmark`;wordmark.hidden=false;wordmark.onerror=()=>{wordmark.hidden=true;};}
}

function ordinal(value){
  const number=Number(value);
  if(!Number.isFinite(number)||number<1)return '—';
  const remainder=number%100;
  if(remainder>=11&&remainder<=13)return `${number}th`;
  return `${number}${number%10===1?'st':number%10===2?'nd':number%10===3?'rd':'th'}`;
}
function gamesForTeam(items=[]){return items.filter(game=>tNorm(game.homeTeam)===tNorm(team.name)||tNorm(game.awayTeam)===tNorm(team.name));}
function setOfficialLink(id,label='Official team page ↗'){
  const link=document.getElementById(id);
  if(link){link.href=guide.official;link.textContent=label;}
}

function renderFranchiseGuide(){
  document.getElementById('teamHistoryHeading').textContent=`${team.name}: the franchise timeline.`;
  document.getElementById('teamHistoryIntro').textContent=`From ${guide.established} to the present, the defining chapters of ${team.city}’s WNBA story.`;
  document.getElementById('teamHistoryTimeline').innerHTML=guide.history.map(([year,title,text])=>`<article><time>${tSafe(year)}</time><div><h3>${tSafe(title)}</h3><p>${tSafe(text)}</p></div></article>`).join('');
  document.getElementById('teamHonorsIntro').textContent=guide.expansion?'The first entries in Cleveland’s new record book begin in 2028.':`Championships, awards and landmark achievements connected to the ${team.name}.`;
  document.getElementById('teamHonorsGrid').innerHTML=guide.honors.map(([value,title,text],index)=>`<article${index===0?' class="dream-honor-feature"':''}><span>${tSafe(value)}</span><strong>${tSafe(title)}</strong><p>${tSafe(text)}</p></article>`).join('');
  document.getElementById('teamUniformIntro').textContent=`The visual eras that connect ${team.name} basketball to ${team.city}.`;
  document.getElementById('teamUniformStory').innerHTML=guide.uniforms.map(([kind,title,text])=>`<article><span class="uniform-chip ${tSafe(kind)}" data-team-tag="${tSafe(team.tag)}"></span><div><h3>${tSafe(title)}</h3><p>${tSafe(text)}</p></div></article>`).join('');
  document.getElementById('teamRetiredValue').textContent=guide.retired.value;
  document.getElementById('teamRetiredTitle').textContent=guide.retired.title;
  document.getElementById('teamRetiredText').textContent=guide.retired.text;
  document.getElementById('teamPeopleHeading').textContent=`The people around the ${team.name}.`;
  document.getElementById('teamPeopleGrid').innerHTML=guide.people.map(([label,name,text])=>{const key=String(label).toLowerCase();const cultureHref=key.includes('owner')?'/owners.html':(key.includes('coach')||key.includes('basketball leadership'))?'/coaches.html':'/courtside-culture.html';return `<article><span>${tSafe(label)}</span><h3>${tSafe(name)}</h3><p>${tSafe(text)}</p><a href="${cultureHref}">Explore Courtside Culture →</a></article>`}).join('');
  document.getElementById('teamConnectionsHeading').textContent=`${team.name} connects across We Know the W.`;
  document.getElementById('teamVaultConnectionTitle').textContent=`Put ${team.name} in league history`;
  const playerLink=document.getElementById('teamPlayerConnection');
  const playerTitle=document.getElementById('teamPlayerConnectionTitle');
  if(guide.expansion){
    playerLink.href='/expansion-watch.html';playerLink.querySelector('span').textContent='EXPANSION WATCH';playerTitle.textContent='Follow the road to Cleveland’s first roster';
  }else{
    playerLink.href=`/playerpedia.html?team=${encodeURIComponent(team.name)}`;playerTitle.textContent=`Meet every current ${team.name} player`;
  }
  ['teamHistorySource','teamHonorsSource','teamUniformSource'].forEach(id=>setOfficialLink(id,'Official franchise source ↗'));
  setOfficialLink('teamOfficialLink',`Official ${team.name} page ↗`);
  setOfficialLink('teamOfficialNewsLink',`Official ${team.name} news ↗`);
}

function buildTeamSwitcher(){
  const switcher=document.getElementById('teamSwitcher');
  const teams=[...TEAM_DATA,CLEVELAND_SIRENS].filter(item=>typeof teamGuideBySlug==='function'&&teamGuideBySlug(item.slug));
  switcher.innerHTML=teams.map(item=>`<option value="${tSafe(item.slug)}"${item.slug===slug?' selected':''}>${tSafe(item.name)}${item.slug==='cleveland-sirens'?' · 2028':''}</option>`).join('');
  switcher.addEventListener('change',()=>{location.href=`/team.html?team=${encodeURIComponent(switcher.value)}`;});
  const index=teams.findIndex(item=>item.slug===slug);
  const previous=teams[(index-1+teams.length)%teams.length];
  const next=teams[(index+1)%teams.length];
  const previousLink=document.getElementById('previousTeamLink');
  const nextLink=document.getElementById('nextTeamLink');
  previousLink.href=`/team.html?team=${previous.slug}`;previousLink.textContent=`← ${previous.tag}`;previousLink.setAttribute('aria-label',`Previous franchise: ${previous.name}`);
  nextLink.href=`/team.html?team=${next.slug}`;nextLink.textContent=`${next.tag} →`;nextLink.setAttribute('aria-label',`Next franchise: ${next.name}`);
}

function activateFranchiseHub(){
  document.body.classList.add('franchise-hub-page');
  document.title=`${team.name} | History, Roster, Awards & Live Updates`;
  const description=document.querySelector('meta[name="description"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'description'}));
  description.content=`Explore ${team.name} franchise history, titles, awards, uniforms, leadership, current players and ${guide.expansion?'the road to 2028':'automatically updated 2026 games and standings'}.`;
  document.getElementById('teamLocalNav').hidden=false;
  document.getElementById('teamArchive').hidden=false;
  document.getElementById('teamLiveHub').hidden=false;
  document.getElementById('teamIntro').textContent=guide.intro;
  document.getElementById('teamNowHeading').textContent=guide.expansion?'The Sirens, on the road to 2028.':`${team.name}, right now.`;
  document.getElementById('teamNowCopy').textContent=guide.expansion?'Leadership, roster-building and opening-night milestones will update as the expansion franchise takes shape.':'Live standings, the next tipoffs and the latest final scores update automatically with the 2026 season feed.';
  document.getElementById('teamLocalNav').setAttribute('aria-label',`${team.name} page sections`);
  renderFranchiseGuide();
  buildTeamSwitcher();
}

function renderTeamSeason(payload={}){
  if(!hasFranchiseHub||guide.expansion)return;
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
  renderGames();window.WGameCards?.loadArtwork().then(renderGames);
  const updated=payload.updatedAt?new Date(payload.updatedAt):null;
  const time=updated&&!Number.isNaN(updated.getTime())?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(updated):'just now';
  document.getElementById('dreamFeedStatus').innerHTML=`<span aria-hidden="true"></span> Live feed updated ${tSafe(time)} ET`;
}

function renderTeamSeasonError(){
  if(!hasFranchiseHub||guide.expansion)return;
  document.getElementById('dreamFeedStatus').textContent='Live season feed temporarily unavailable';
  document.getElementById('dreamUpcomingGames').innerHTML='<div class="schedule-empty"><strong>Upcoming games could not load.</strong><p>Use the full Games page or try again shortly.</p></div>';
  document.getElementById('dreamRecentGames').innerHTML='<div class="schedule-empty"><strong>Recent results could not load.</strong><p>Use Live Stats or try again shortly.</p></div>';
}

function renderExpansionNow(){
  document.getElementById('dreamStatGrid').innerHTML=[['Launch','2028','Opening season'],['Home',guide.arena,'Cleveland, Ohio'],['Roster','TBA','Expansion build'],['Status','Building','Front office + operations']].map(([label,value,note])=>`<article><span>${tSafe(label)}</span><strong>${tSafe(value)}</strong><small>${tSafe(note)}</small></article>`).join('');
  document.getElementById('dreamUpcomingGames').innerHTML='<div class="schedule-empty"><strong>Opening schedule coming later.</strong><p>The 2028 schedule will appear here after the league releases it.</p></div>';
  document.getElementById('dreamRecentGames').innerHTML='<div class="schedule-empty"><strong>A new record book.</strong><p>Cleveland’s first final score will begin this franchise chapter in 2028.</p></div>';
  document.getElementById('dreamFeedStatus').innerHTML='<span aria-hidden="true"></span> Expansion watch active';
  document.getElementById('dreamTeamUpdates').innerHTML='<div class="dream-wire-clear"><span aria-hidden="true">CLE</span><div><strong>The roster build is ahead.</strong><p>Official leadership, draft and player announcements will connect here as Cleveland moves toward opening night.</p></div></div>';
}

function shortUpdateDate(value=''){
  const date=new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(date.getTime())?String(value||'Current'):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date);
}
function renderTeamRosterUpdates(payload={}){
  if(!hasFranchiseHub||guide.expansion)return;
  const transactions=(Array.isArray(payload.transactions)?payload.transactions:[]).filter(item=>tNorm(item.team)===tNorm(team.name)).map(item=>({kind:item.type||'Movement',player:item.player||'Team update',detail:item.detail||'Roster update',date:item.date||''}));
  const injuries=(Array.isArray(payload.injuries)?payload.injuries:[]).filter(item=>tNorm(item.team)===tNorm(team.name)&&!['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status||'').toUpperCase())).map(item=>({kind:item.status||'Availability',player:item.player||'Player update',detail:item.reason||'Availability update',date:item.updated||''}));
  const updates=[...transactions,...injuries].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,4);
  document.getElementById('dreamTeamUpdates').innerHTML=updates.length?updates.map(item=>`<article><div><span>${tSafe(item.kind)}</span><time>${tSafe(shortUpdateDate(item.date))}</time></div><strong>${tSafe(item.player)}</strong><p>${tSafe(item.detail)}</p></article>`).join(''):`<div class="dream-wire-clear"><span aria-hidden="true">✓</span><div><strong>No active ${tSafe(team.name)} updates in the feed.</strong><p>The roster and availability report will refresh here when a new item is posted.</p></div></div>`;
}

async function loadTeamPage(){
  const recordEl=document.getElementById('teamRecord');
  const pctEl=document.getElementById('teamPct');
  const roster=document.getElementById('teamRoster');
  const rosterStatus=document.getElementById('rosterStatus');
  if(guide.expansion){
    recordEl.textContent='2028';pctEl.textContent='Expansion debut season';
    rosterStatus.textContent='Cleveland’s first roster will appear here as players are officially announced.';
    roster.innerHTML='<div class="team-expansion-roster"><strong>The first Sirens roster is still ahead.</strong><p>Follow Expansion Watch for the road to the expansion draft and opening night.</p><a href="/expansion-watch.html">Open Expansion Watch →</a></div>';
    const playerButton=document.getElementById('rosterPlayerpediaLink');playerButton.href='/expansion-watch.html';playerButton.textContent='Follow the road to 2028 →';
    renderExpansionNow();return;
  }
  const [statsResult,playersResult,teamsResult]=await Promise.allSettled([
    fetch('/api/stats?season=2026',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Stats unavailable');return payload;}),
    fetch('/api/players?artwork=transparent-v1&roster=20260822-v3',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Roster unavailable');return payload;}),
    fetch('/api/teams',{headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Team artwork unavailable');return payload;})
  ]);
  if(teamsResult.status==='fulfilled'){
    const assets=Array.isArray(teamsResult.value.teams)?teamsResult.value.teams:[];
    const asset=assets.find(item=>tNorm(item.name)===tNorm(team.name));if(asset)applyOfficialTeamArtwork(asset);
  }
  if(statsResult.status==='fulfilled'){
    const standings=Array.isArray(statsResult.value.standings)?statsResult.value.standings:[];
    const record=standings.find(item=>tNorm(item.team?.full_name)===tNorm(team.name));
    if(record){recordEl.textContent=`${record.wins}-${record.losses}`;pctEl.textContent=`${Number(record.win_percentage).toFixed(3)} win percentage`;}
    else{recordEl.textContent='2026';pctEl.textContent='Live record not returned yet';}
    renderTeamSeason(statsResult.value);
  }else{recordEl.textContent='2026';pctEl.textContent='Live record temporarily unavailable';renderTeamSeasonError();}
  if(playersResult.status==='fulfilled'){
    const allPlayers=Array.isArray(playersResult.value.players)?playersResult.value.players:[];
    const teamPlayers=allPlayers.filter(player=>tNorm(player.team)===tNorm(team.name));
    rosterStatus.textContent=teamPlayers.length?`${teamPlayers.length} current players loaded automatically.`:'The current roster feed did not return players for this team yet.';
    roster.innerHTML=teamPlayers.length?teamPlayers.map(player=>{
      const photo=rosterPhoto(player);const cutout=Boolean(player.officialHeadshot||player.photoCutout);
      return `<a class="team-roster-card" href="/playerpedia.html?search=${encodeURIComponent(player.name)}"><span class="team-roster-media"><span class="team-roster-number">${tSafe(player.number?`#${player.number}`:'W')}</span>${photo?`<img class="team-roster-photo${cutout?' player-cutout':''}" src="${tSafe(photo)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`:''}</span><span><strong>${tSafe(player.name)}</strong><span>${tSafe(player.position||'Player')}</span></span></a>`;
    }).join(''):'<div class="team-error">Current roster details are temporarily unavailable. Playerpedia remains accessible.</div>';
    renderTeamRosterUpdates(playersResult.value);
  }else{
    rosterStatus.textContent='Current roster temporarily unavailable.';
    roster.innerHTML='<div class="team-error">The roster feed could not load right now. Try Playerpedia or return later.</div>';
    document.getElementById('dreamTeamUpdates').innerHTML='<div class="team-error">The roster and availability feed is temporarily unavailable.</div>';
  }
}

if(!team){
  document.getElementById('genericTeamOverview').hidden=false;document.getElementById('current-roster').hidden=true;
  document.getElementById('teamName').textContent='Team not found';document.getElementById('teamIntro').textContent='Choose a franchise from Around the W.';
  document.getElementById('teamRecord').textContent='—';document.getElementById('teamPct').textContent='No team selected';
}else{
  document.documentElement.style.setProperty('--team-primary',team.primary);document.documentElement.style.setProperty('--team-secondary',team.secondary);document.documentElement.style.setProperty('--team-accent',team.accent);document.documentElement.style.setProperty('--team-text',team.text);
  applyTeamAccessibility(team);
  const hero=document.getElementById('teamHero');['primary','secondary','accent','text'].forEach(key=>hero.style.setProperty(`--team-${key}`,team[key]));
  applyHeaderBackdrop();document.title=`${team.name} | Around the W`;
  document.getElementById('teamName').textContent=team.name;document.getElementById('teamIntro').textContent=`${team.city} · current season, roster, history and culture in one franchise home.`;
  document.getElementById('teamCrumb').textContent=team.name;document.getElementById('teamTag').textContent=team.tag;document.getElementById('teamHeroBadgeFallback').textContent=team.tag;
  document.getElementById('rosterHeading').textContent=`${team.name} roster`;
  const playerpediaHref=`/playerpedia.html?team=${encodeURIComponent(team.name)}`;
  document.getElementById('teamPlayerpediaLink').href=playerpediaHref;document.getElementById('rosterPlayerpediaLink').href=playerpediaHref;document.getElementById('rosterPlayerpediaLink').textContent=`Open ${team.name} in Playerpedia →`;
  if(hasFranchiseHub){activateFranchiseHub();loadTeamPage();}
  else{document.getElementById('genericTeamOverview').hidden=false;loadTeamPage();}
}
