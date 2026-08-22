function pSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function initials(name=''){return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||'').join('')||'W';}
function playerPhoto(player={}){
  const id=String(player.espnId||'').replace(/[^0-9]/g,'');
  if(id)return `/api/photo?id=${id}`;
  const direct=[player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
  if(!direct)return '';
  const espn=String(direct).match(/headshots\/(wnba|womens-college-basketball)\/players\/full\/(\d+)\.(?:png|jpg)/i);
  if(espn)return `/api/photo?id=${espn[2]}${espn[1]==='wnba'?'':'&league=ncaaw'}`;
  return `/api/photo?src=${encodeURIComponent(String(direct).trim())}`;
}
function avatarMarkup(player={},large=false){const photo=playerPhoto(player),name=player.name||'Player',classes=`player-avatar photo-avatar${large?' large':''}`;return `<span class="${classes}" aria-hidden="true"><span class="player-avatar-fallback">${pSafe(initials(name))}</span>${photo?`<img class="player-avatar-image" src="${pSafe(photo)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'">`:''}</span>`;}
function prettyDate(value=''){if(!value)return '';const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?value:date.toLocaleDateString([],{month:'short',day:'numeric'});}
function playerKey(value=''){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function hasMetric(value){return value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isFinite(Number(value));}
function formatTs(value=''){if(!hasMetric(value))return '—';const n=Number(value);return `${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;}
function compactText(value='',limit=210){const clean=String(value||'').replace(/\s+/g,' ').trim();if(!clean)return '';if(clean.length<=limit)return clean;const cut=clean.slice(0,limit);return `${cut.slice(0,Math.max(cut.lastIndexOf(' '),limit-25)).trim()}…`;}
function itemText(item={}){return item.strMilestone||item.strAchievement||item.strHonour||item.strHonor||item.strAward||item.strName||item.strDescription||item.description||'';}
function normalizeText(value=''){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
function contentWords(value=''){const stop=new Set(['the','and','for','with','from','that','this','was','were','has','have','had','her','she','his','their','into','wnba','player','basketball']);return new Set(normalizeText(value).split(' ').filter(word=>word.length>3&&!stop.has(word)));}
function overlapsBio(candidate,bio){
  const c=normalizeText(candidate),b=normalizeText(bio);
  if(!c||!b)return false;
  if(b.includes(c))return true;
  const cw=contentWords(candidate);
  if(!cw.size)return false;
  return String(bio).split(/(?<=[.!?])\s+/).some(sentence=>{
    const sw=contentWords(sentence);
    if(!sw.size)return false;
    let shared=0;cw.forEach(word=>{if(sw.has(word))shared+=1;});
    return shared/Math.min(cw.size,sw.size)>=0.72;
  });
}

const azGrid=document.getElementById('azGrid'),playerGrid=document.getElementById('playerGrid'),playerSearch=document.getElementById('playerSearch'),playerTeamFilter=document.getElementById('playerTeamFilter'),reset=document.getElementById('resetPlayerFilters'),playerCount=document.getElementById('playerCount'),status=document.getElementById('playerStatus'),modal=document.getElementById('playerModal'),modalBody=document.getElementById('playerModalBody'),modalClose=document.getElementById('playerModalClose');
const liveRosterCount=document.getElementById('liveRosterCount'),liveRosterUpdated=document.getElementById('liveRosterUpdated'),transactionFeed=document.getElementById('transactionFeed'),injuryFeed=document.getElementById('injuryFeed'),movementUpdated=document.getElementById('movementUpdated'),injuryUpdated=document.getElementById('injuryUpdated');
let allPlayers=[],teams=[],letter='';
let advancedByName=new Map();
let advancedFeedReady=false;
let advancedUpdatedAt='';
const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
azGrid.innerHTML=['<button type="button" class="active" data-letter="">All</button>',...letters.map(l=>`<button type="button" data-letter="${l}">${l}</button>`)].join('');

function filtered(){const q=playerSearch.value.trim().toLowerCase(),team=playerTeamFilter.value;return allPlayers.filter(p=>(!letter||String(p.lastName||'').toUpperCase().startsWith(letter))&&(!team||String(p.teamId)===team)&&(!q||`${p.name} ${p.team} ${p.position}`.toLowerCase().includes(q)));}

function render(){
  const list=filtered();
  playerCount.textContent=`${list.length} ${list.length===1?'player':'players'} shown`;
  playerGrid.innerHTML=list.length?list.map(p=>`<button class="player-card" type="button" data-player-id="${pSafe(p.id)}">${avatarMarkup(p)}<span class="player-card-copy"><span class="player-card-topline">${pSafe(p.position||'Player')}${p.number?` · #${pSafe(p.number)}`:''}</span><strong>${pSafe(p.name)}</strong><span>${pSafe(p.team||'Current roster')}</span></span><span class="player-card-arrow">→</span></button>`).join(''):'<div class="player-empty"><strong>No players match those filters.</strong><span>Try another letter, team or search.</span></div>';
}

function fillTeams(){playerTeamFilter.innerHTML=['<option value="">All current teams</option>',...teams.map(t=>`<option value="${pSafe(t.id)}">${pSafe(t.name)}</option>`)].join('');}

function renderPlayerWire(payload={}){
  const transactions=Array.isArray(payload.transactions)?payload.transactions:[];
  const injuries=Array.isArray(payload.injuries)?payload.injuries:[];
  const updateDate=payload.liveUpdatesUpdatedAt?new Date(payload.liveUpdatesUpdatedAt):null;
  if(liveRosterCount)liveRosterCount.textContent=`${allPlayers.length} current players · ${teams.length} teams`;
  if(liveRosterUpdated)liveRosterUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Roster information checked ${updateDate.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}.`:'Current roster information connected.';
  if(movementUpdated)movementUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Updated ${updateDate.toLocaleDateString([],{month:'short',day:'numeric'})}`:'';
  if(injuryUpdated)injuryUpdated.textContent=updateDate&&!Number.isNaN(updateDate.getTime())?`Updated ${updateDate.toLocaleDateString([],{month:'short',day:'numeric'})}`:'';

  if(transactionFeed)transactionFeed.innerHTML=transactions.length?transactions.slice(0,8).map(item=>`<article class="wire-row"><span class="wire-date">${pSafe(prettyDate(item.date))}</span><div><span class="wire-chip">${pSafe(item.type||'UPDATE')}</span><strong>${pSafe(item.player||'Player')} · ${pSafe(item.team||'WNBA')}</strong><p>${pSafe(item.detail||'Roster update')}</p></div></article>`).join(''):'<div class="wire-row"><strong>No recent movement loaded.</strong></div>';

  const weight=value=>value==='OUT FOR SEASON'?0:value==='OUT'?1:value==='DAY TO DAY'?2:3;
  const sorted=[...injuries].sort((a,b)=>weight(a.status)-weight(b.status)||String(b.updated).localeCompare(String(a.updated)));
  if(injuryFeed)injuryFeed.innerHTML=sorted.length?sorted.slice(0,10).map(item=>`<article class="wire-row"><span class="wire-status ${pSafe(String(item.status||'').toLowerCase().replaceAll(' ','-'))}">${pSafe(item.status||'STATUS')}</span><div><strong>${pSafe(item.player)} · ${pSafe(item.team)}</strong><p>${pSafe(item.reason||'Availability update')} <span class="wire-asof">as of ${pSafe(prettyDate(item.updated))}</span></p></div></article>`).join(''):'<div class="wire-row"><strong>No availability updates loaded.</strong></div>';
}

async function load(){
  try{
    const [rosterResult,advancedResult]=await Promise.allSettled([
      fetch('/api/players?publicCopy=20260822-v4',{headers:{Accept:'application/json'}}).then(async r=>{const payload=await r.json().catch(()=>({}));if(!r.ok)throw new Error(payload.error||'Playerpedia unavailable');return payload;}),
      fetch('/api/advanced-stats?season=2026',{headers:{Accept:'application/json'}}).then(async r=>{const payload=await r.json().catch(()=>({}));if(!r.ok)throw new Error(payload.error||'Advanced stats unavailable');return payload;})
    ]);
    if(rosterResult.status!=='fulfilled')throw rosterResult.reason;
    const payload=rosterResult.value;
    allPlayers=Array.isArray(payload.players)?payload.players:[];
    teams=Array.isArray(payload.teams)?payload.teams:[];
    if(advancedResult.status==='fulfilled'){
      const metrics=Array.isArray(advancedResult.value.players)?advancedResult.value.players:[];
      advancedByName=new Map(metrics.map(item=>[playerKey(item.name),item]));
      advancedFeedReady=metrics.length>0;
      advancedUpdatedAt=advancedResult.value.updatedAt||'';
    }else{
      advancedByName=new Map();
      advancedFeedReady=false;
      advancedUpdatedAt='';
    }
    fillTeams();
    renderPlayerWire(payload);
    const query=new URLSearchParams(location.search),wanted=query.get('search'),wantedTeam=query.get('team');
    if(wanted)playerSearch.value=wanted;
    if(wantedTeam){const option=[...playerTeamFilter.options].find(item=>item.textContent.trim().toLowerCase()===wantedTeam.trim().toLowerCase());if(option)playerTeamFilter.value=option.value;}
    render();
    if(wanted){
      const directMatch=allPlayers.find(player=>normalizeText(player.name)===normalizeText(wanted));
      if(directMatch)openProfile(directMatch.id);
    }
    const partialText=payload.partial?' · some roster feeds retrying later':'';
    const photoCount=allPlayers.filter(player=>playerPhoto(player)).length;
    status.textContent=`${allPlayers.length} current players · ${photoCount} player photos connected · ${advancedFeedReady?'live PER + TS% connected':'advanced metrics retrying'}${partialText}`;
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

function uniqueFactCandidate(candidates=[],bio=''){
  for(const candidate of candidates.map(compactText).filter(Boolean)){
    if(!overlapsBio(candidate,bio))return candidate;
  }
  return '';
}

function statsFact(name){
  const row=advancedByName.get(playerKey(name));
  if(!row)return '';
  const per=hasMetric(row.per)?Number(row.per):null;
  const ts=hasMetric(row.tsPct)?formatTs(row.tsPct):'';
  if(row.tsRank&&row.tsPool&&Number(row.tsRank)<=10&&ts)return `${name}'s 2026 true shooting is ${ts}, ranking No. ${row.tsRank} among ${row.tsPool} players in the current advanced table.`;
  if(row.perRank&&row.perPool&&Number(row.perRank)<=10&&per!==null)return `${name}'s 2026 PER is ${per.toFixed(1)}, ranking No. ${row.perRank} among ${row.perPool} players in the current advanced table.`;
  if(per!==null&&ts)return `${name}'s current 2026 advanced line is ${per.toFixed(1)} PER with ${ts} true shooting.`;
  if(per!==null)return `${name}'s current 2026 Player Efficiency Rating is ${per.toFixed(1)}.`;
  if(ts)return `${name}'s current 2026 true-shooting percentage is ${ts}.`;
  return '';
}

function amazingFact(payload,player,name,honors=[]){
  const bio=String(player.description||'').replace(/\s+/g,' ').trim();
  const milestones=(Array.isArray(payload.milestones)?payload.milestones:[]).map(itemText).filter(Boolean);
  const editorial=uniqueFactCandidate([...milestones,...honors],bio);
  if(editorial)return editorial;

  const advanced=statsFact(name);
  if(advanced&&!overlapsBio(advanced,bio))return advanced;

  const structured=[];
  if(player.number)structured.push(`${name} wears #${player.number} for ${player.team||'her current WNBA team'}.`);
  if(player.height)structured.push(`${name} is listed at ${player.height}, giving her Playerpedia profile a measurable size marker beyond the bio.`);
  if(player.college&&player.team)structured.push(`${name}'s current Playerpedia path links ${player.college} to ${player.team}.`);
  const fallback=uniqueFactCandidate(structured,bio);
  if(fallback)return fallback;

  return advancedFeedReady?`${name}'s 2026 advanced profile is tracked live and will keep updating as new games are added.`:`${name}'s Playerpedia profile is being tracked separately from the Quick Bio so new facts can be added without repeating it.`;
}

function metricsMarkup(name){
  const row=advancedByName.get(playerKey(name))||{};
  const per=hasMetric(row.per)?Number(row.per).toFixed(1):'—';
  const ts=formatTs(row.tsPct);
  return `<div class="why-metrics"><div class="why-metric"><span>PLAYER EFFICIENCY RATING</span><strong>${pSafe(per)}</strong><small>PER · per-minute all-around production</small></div><div class="why-metric"><span>TRUE SHOOTING</span><strong>${pSafe(ts)}</strong><small>TS% · scoring efficiency across 2s, 3s + free throws</small></div></div>`;
}

async function openProfile(id){
  const roster=allPlayers.find(p=>String(p.id)===String(id));
  const initialName=roster?.name||'W';
  modalBody.innerHTML=`<div class="profile-loading">${avatarMarkup(roster||{name:initialName},true)}<div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${pSafe(roster?.name||'Loading…')}</h3><p>Loading profile details and advanced metrics…</p></div></div>`;
  modal.showModal();

  let payload={player:roster||{},honours:[],milestones:[]};
  let detailUnavailable=false;
  if(roster&&!roster.curated&&!String(id).startsWith('curated-')){
    try{
      const response=await fetch(`/api/player?id=${encodeURIComponent(id)}`,{headers:{Accept:'application/json'}});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'Profile unavailable');
      payload=data;
    }catch{detailUnavailable=true;}
  }

  const p={...(roster||{}),...(payload.player||{})};
  if(roster?.team)p.team=roster.team;
  if(roster?.position)p.position=roster.position;
  if(roster?.espnId&&!p.espnId)p.espnId=roster.espnId;
  if(roster?.photo&&!p.photo)p.photo=roster.photo;
  if(roster?.photoThumb&&!p.photoThumb)p.photoThumb=roster.photoThumb;
  const name=p.name||roster?.name||'Player';
  const honors=(payload.honours||[]).map(itemText).filter(Boolean).slice(0,12);
  const liveNote=roster?.liveNote?`<section class="profile-subsection live-profile-note"><h4>Current roster note</h4><p>${pSafe(roster.liveNote)}</p></section>`:'';
  const fact=amazingFact(payload,p,name,honors);
  const detailsNote=detailUnavailable?'<p class="profile-data-note">Detailed bio service is temporarily unavailable; roster and advanced-stat information remain active.</p>':'';
  const refreshed=advancedUpdatedAt?new Date(advancedUpdatedAt):null;
  const refreshedText=refreshed&&!Number.isNaN(refreshed.getTime())?` Last refreshed ${refreshed.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}.`:'';
  const statNote=advancedFeedReady?`<p class="why-source">2026 PER and TS% refresh automatically through the We Know the W advanced-stats API backed by Basketball-Reference.${pSafe(refreshedText)}</p>`:'<p class="why-source">Advanced metrics are temporarily unavailable and will repopulate automatically when the stats API reconnects.</p>';

  modalBody.innerHTML=`<div class="profile-hero">${avatarMarkup({...p,name},true)}<div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${pSafe(name)}</h3><p class="profile-teamline">${pSafe([p.team||roster?.team,p.position||roster?.position].filter(Boolean).join(' · '))}</p></div></div><div class="profile-facts">${facts(p)}</div>${liveNote}${p.description?`<section class="profile-subsection"><h4>Quick bio</h4><p>${pSafe(p.description)}</p></section>`:''}${honors.length?`<section class="profile-subsection"><h4>Honors & awards</h4><div class="profile-tags">${honors.map(h=>`<span>${pSafe(h)}</span>`).join('')}</div></section>`:''}<section class="why-we-know-her"><span>WHY WE KNOW HER</span><strong>${pSafe(name)} · the numbers + the story.</strong>${metricsMarkup(name)}<div class="amazing-fact"><span>AMAZING FACT</span><p>${pSafe(fact)}</p></div>${statNote}</section>${detailsNote}`;
}

playerGrid.addEventListener('click',e=>{const card=e.target.closest('[data-player-id]');if(card)openProfile(card.dataset.playerId);});
modalClose.addEventListener('click',()=>modal.close());
modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
load();
