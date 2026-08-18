function pSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function initials(name=''){return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'W';}
function prettyDate(value=''){if(!value)return '';const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?value:date.toLocaleDateString([],{month:'short',day:'numeric'});}
const azGrid=document.getElementById('azGrid'),playerGrid=document.getElementById('playerGrid'),playerSearch=document.getElementById('playerSearch'),playerTeamFilter=document.getElementById('playerTeamFilter'),reset=document.getElementById('resetPlayerFilters'),playerCount=document.getElementById('playerCount'),status=document.getElementById('playerStatus'),modal=document.getElementById('playerModal'),modalBody=document.getElementById('playerModalBody'),modalClose=document.getElementById('playerModalClose');
const liveRosterCount=document.getElementById('liveRosterCount'),liveRosterUpdated=document.getElementById('liveRosterUpdated'),transactionFeed=document.getElementById('transactionFeed'),injuryFeed=document.getElementById('injuryFeed'),movementUpdated=document.getElementById('movementUpdated'),injuryUpdated=document.getElementById('injuryUpdated');
let allPlayers=[],teams=[],letter='';
let photoObserver=null;
const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
azGrid.innerHTML=['<button type="button" class="active" data-letter="">All</button>',...letters.map(l=>`<button type="button" data-letter="${l}">${l}</button>`)].join('');

function filtered(){const q=playerSearch.value.trim().toLowerCase(),team=playerTeamFilter.value;return allPlayers.filter(p=>(!letter||String(p.lastName||'').toUpperCase().startsWith(letter))&&(!team||String(p.teamId)===team)&&(!q||`${p.name} ${p.team} ${p.position}`.toLowerCase().includes(q)));}

function apiMedia(player,name){
  const image=player?.photoThumb||player?.photoCutout||player?.photo||'';
  if(!image)return null;
  const cc=String(player.photoCreativeCommons||'').trim();
  return {
    type:'player',subject:name,image,alt:`${name} basketball player`,caption:`${name} · current roster artwork`,creator:'TheSportsDB',source:'TheSportsDB',sourceUrl:player.id&&!String(player.id).startsWith('curated-')?`https://www.thesportsdb.com/player/${encodeURIComponent(player.id)}`:'https://www.thesportsdb.com/',license:cc||'API artwork',licenseUrl:'https://www.thesportsdb.com/docs_terms_of_use.php',resolvedBy:'current-roster-api'
  };
}

async function detailedApiMedia(player,name){
  if(!player?.id||String(player.id).startsWith('curated-'))return null;
  try{
    const response=await fetch(`/api/player?id=${encodeURIComponent(player.id)}&artwork=2`,{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)return null;
    return apiMedia(payload.player||{},name);
  }catch{return null;}
}

async function hydrateAvatar(avatar){
  if(!avatar||avatar.dataset.photoLoaded==='true')return;
  avatar.dataset.photoLoaded='true';
  const id=avatar.dataset.playerId;
  const name=avatar.dataset.playerName;
  const player=allPlayers.find(p=>String(p.id)===String(id))||allPlayers.find(p=>p.name===name);
  let media=apiMedia(player,name);

  if(!media&&player?.photoNeedsDetail){
    avatar.classList.add('photo-loading');
    media=await detailedApiMedia(player,name);
    avatar.classList.remove('photo-loading');
  }

  if(!media&&window.mediaFor){
    avatar.classList.add('photo-loading');
    media=await window.mediaFor('player',name);
    avatar.classList.remove('photo-loading');
  }

  if(!media?.image)return;
  avatar.classList.add('has-photo');
  avatar.title=media.resolvedBy==='current-roster-api'?'Current verified player artwork via TheSportsDB':'Reusable photo via Wikimedia Commons';
  avatar.innerHTML=`<img src="${pSafe(media.image)}" alt="${pSafe(media.alt||name)}" loading="lazy" referrerpolicy="no-referrer">`;
}

function observePlayerPhotos(){
  photoObserver?.disconnect();
  const avatars=[...playerGrid.querySelectorAll('.player-avatar[data-player-name]')];
  if(!('IntersectionObserver' in window)){avatars.slice(0,30).forEach(hydrateAvatar);return;}
  photoObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;photoObserver.unobserve(entry.target);hydrateAvatar(entry.target);});},{rootMargin:'350px 0px'});
  avatars.forEach(avatar=>photoObserver.observe(avatar));
}

function render(){
  const list=filtered();
  playerCount.textContent=`${list.length} ${list.length===1?'player':'players'} shown`;
  playerGrid.innerHTML=list.length?list.map(p=>`<button class="player-card" type="button" data-player-id="${pSafe(p.id)}"><span class="player-avatar" data-player-id="${pSafe(p.id)}" data-player-name="${pSafe(p.name)}">${pSafe(initials(p.name))}</span><span class="player-card-copy"><span class="player-card-topline">${pSafe(p.position||'Player')}${p.number?` · #${pSafe(p.number)}`:''}</span><strong>${pSafe(p.name)}</strong><span>${pSafe(p.team||'Current roster')}</span></span><span class="player-card-arrow">→</span></button>`).join(''):'<div class="player-empty"><strong>No players match those filters.</strong><span>Try another letter, team or search.</span></div>';
  observePlayerPhotos();
}

function fillTeams(){playerTeamFilter.innerHTML=['<option value="">All current teams</option>',...teams.map(t=>`<option value="${pSafe(t.id)}">${pSafe(t.name)}</option>`)].join('');}

function renderPlayerWire(payload={}){
  const transactions=Array.isArray(payload.transactions)?payload.transactions:[];
  const injuries=Array.isArray(payload.injuries)?payload.injuries:[];
  const updateDate=payload.liveUpdatesUpdatedAt?new Date(payload.liveUpdatesUpdatedAt):null;
  if(liveRosterCount)liveRosterCount.textContent=`${allPlayers.length} current players · ${teams.length} teams`;
  if(liveRosterUpdated)liveRosterUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Correction layer checked ${updateDate.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}.`:'Live roster correction layer connected.';
  if(movementUpdated)movementUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Updated ${updateDate.toLocaleDateString([],{month:'short',day:'numeric'})}`:'';
  if(injuryUpdated)injuryUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Updated ${updateDate.toLocaleDateString([],{month:'short',day:'numeric'})}`:'';

  if(transactionFeed)transactionFeed.innerHTML=transactions.length?transactions.slice(0,8).map(item=>`<article class="wire-row"><span class="wire-date">${pSafe(prettyDate(item.date))}</span><div><span class="wire-chip">${pSafe(item.type||'UPDATE')}</span><strong>${pSafe(item.player||'Player')} · ${pSafe(item.team||'WNBA')}</strong><p>${pSafe(item.detail||'Roster update')}</p></div></article>`).join(''):'<div class="wire-row"><strong>No recent movement loaded.</strong></div>';

  const weight=status=>status==='OUT FOR SEASON'?0:status==='OUT'?1:status==='DAY TO DAY'?2:3;
  const sorted=[...injuries].sort((a,b)=>weight(a.status)-weight(b.status)||String(b.updated).localeCompare(String(a.updated)));
  if(injuryFeed)injuryFeed.innerHTML=sorted.length?sorted.slice(0,10).map(item=>`<article class="wire-row"><span class="wire-status ${pSafe(String(item.status||'').toLowerCase().replaceAll(' ','-'))}">${pSafe(item.status||'STATUS')}</span><div><strong>${pSafe(item.player)} · ${pSafe(item.team)}</strong><p>${pSafe(item.reason||'Availability update')} <span class="wire-asof">as of ${pSafe(prettyDate(item.updated))}</span></p></div></article>`).join(''):'<div class="wire-row"><strong>No availability updates loaded.</strong></div>';
}

async function load(){
  try{
    const r=await fetch('/api/players?artwork=2',{headers:{Accept:'application/json'}}),payload=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(payload.error||'Playerpedia unavailable');
    allPlayers=Array.isArray(payload.players)?payload.players:[];
    teams=Array.isArray(payload.teams)?payload.teams:[];
    fillTeams();
    renderPlayerWire(payload);
    const query=new URLSearchParams(location.search),wanted=query.get('search'),wantedTeam=query.get('team');
    if(wanted)playerSearch.value=wanted;
    if(wantedTeam){const option=[...playerTeamFilter.options].find(item=>item.textContent.trim().toLowerCase()===wantedTeam.trim().toLowerCase());if(option)playerTeamFilter.value=option.value;}
    render();
    const withApiArt=allPlayers.filter(player=>player.photo).length;
    status.textContent=payload.partial?`${allPlayers.length} current players loaded • ${withApiArt} API photos • some roster feeds retrying later`:`${allPlayers.length} current players • verified corrections applied • ${withApiArt} reusable API photos`;
  }catch(e){
    playerGrid.innerHTML=`<div class="error-box"><strong>Playerpedia roster feed could not load.</strong><span>${pSafe(e.message)}</span></div>`;
    if(transactionFeed)transactionFeed.innerHTML='<div class="wire-row"><strong>Player movement feed unavailable.</strong></div>';
    if(injuryFeed)injuryFeed.innerHTML='<div class="wire-row"><strong>Availability feed unavailable.</strong></div>';
    status.textContent='Roster feed unavailable';
  }
}

azGrid.addEventListener('click',e=>{const b=e.target.closest('[data-letter]');if(!b)return;letter=b.dataset.letter||'';azGrid.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render();});
playerSearch.addEventListener('input',render);
playerTeamFilter.addEventListener('change',render);
reset.addEventListener('click',()=>{letter='';playerSearch.value='';playerTeamFilter.value='';azGrid.querySelectorAll('button').forEach((x,i)=>x.classList.toggle('active',i===0));render();});

function facts(player){return [['Jersey',player.number?`#${player.number}`:''],['Born',player.birthDate],['From',player.birthPlace],['Nationality',player.nationality],['Height',player.height],['College',player.college]].filter(x=>x[1]).map(([l,v])=>`<div class="profile-fact"><span>${pSafe(l)}</span><strong>${pSafe(v)}</strong></div>`).join('');}

async function openProfile(id){
  const roster=allPlayers.find(p=>String(p.id)===String(id));
  const initialName=roster?.name||'W';
  modalBody.innerHTML=`<div class="profile-loading"><span class="player-avatar large">${pSafe(initials(initialName))}</span><div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${pSafe(roster?.name||'Loading…')}</h3><p>Loading profile details and current player artwork…</p></div></div>`;
  modal.showModal();
  try{
    let payload={player:roster||{},honours:[]};
    if(roster&&!roster.curated&&!String(id).startsWith('curated-')){
      payload=await fetch(`/api/player?id=${encodeURIComponent(id)}&artwork=2`,{headers:{Accept:'application/json'}}).then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Profile unavailable');return data;});
    }
    const p={...(roster||{}),...(payload.player||{})};
    if(roster?.team)p.team=roster.team;
    if(roster?.position)p.position=roster.position;
    const name=p.name||roster?.name||'Player';
    let media=apiMedia(p,name)||apiMedia(roster,name);
    if(!media&&roster?.photoNeedsDetail)media=await detailedApiMedia(roster,name);
    if(!media&&window.mediaFor)media=await window.mediaFor('player',name);
    const honors=(payload.honours||[]).map(x=>x.strHonour||x.strHonor||x.strAward||x.strAchievement||x.strName).filter(Boolean).slice(0,12);
    const photo=media&&window.attributedFigure?window.attributedFigure(media,'profile-photo'):'';
    const sourceNote=media?.resolvedBy==='current-roster-api'?'<p class="media-license-note">Current player artwork is supplied through TheSportsDB and shown only when the provider marks it reusable.</p>':media?.image?'<p class="media-license-note">Fallback photo is a reusable Wikimedia Commons image with credit and license details directly beneath it.</p>':'';
    const liveNote=roster?.liveNote?`<section class="profile-subsection live-profile-note"><h4>Current roster note</h4><p>${pSafe(roster.liveNote)}</p></section>`:'';
    modalBody.innerHTML=`<div class="profile-hero"><span class="player-avatar large${media?.image?' has-photo':''}">${media?.image?`<img src="${pSafe(media.image)}" alt="${pSafe(media.alt||name)}" referrerpolicy="no-referrer">`:pSafe(initials(name))}</span><div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${pSafe(name)}</h3><p class="profile-teamline">${pSafe([p.team||roster?.team,p.position||roster?.position].filter(Boolean).join(' · '))}</p></div></div>${photo}<div class="profile-facts">${facts(p)}</div>${liveNote}${p.description?`<section class="profile-subsection"><h4>Quick bio</h4><p>${pSafe(p.description)}</p></section>`:''}${honors.length?`<section class="profile-subsection"><h4>Honors & awards</h4><div class="profile-tags">${honors.map(h=>`<span>${pSafe(h)}</span>`).join('')}</div></section>`:''}<section class="why-we-know-her"><span>WHY WE KNOW HER</span><strong>${pSafe(name)} belongs in Playerpedia.</strong><p>The deeper editorial story connects here: signature moments, cultural impact, fun facts, Herstory and Trophy Case links.</p></section>${sourceNote}`;
  }catch(e){modalBody.innerHTML=`<div class="error-box"><strong>Full profile details could not load.</strong><span>${pSafe(e.message)}</span></div>`;}
}

playerGrid.addEventListener('click',e=>{const card=e.target.closest('[data-player-id]');if(card)openProfile(card.dataset.playerId);});
modalClose.addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
load();