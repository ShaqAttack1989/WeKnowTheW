(()=>{
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const fmtWeek=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  let playerCache=new Map();
  let playerCacheAt=0;
  let refreshActive=false;

  function normalizeWeeklyBoard(){
    document.querySelector('.home-week-card.games')?.remove();
    const heading=document.querySelector('.home-week-heading h2');
    const deck=document.querySelector('.home-week-heading h2 + p');
    if(heading)heading.textContent='Three things to know this week.';
    if(deck)deck.textContent='Milestone watch, the newest Snack Shak feature, and Shak’s mock weekly Starting Five and Bench Mob, all in one easy-to-scan board.';
    const rotationCard=document.querySelector('.home-week-card.rotations .home-week-label');
    if(rotationCard)rotationCard.textContent='🏀 SHAK’S MOCK WEEKLY ROTATIONS';
  }
  function playerPhoto(player={}){
    const direct=[player.officialHeadshot,player.photoCutout,player.photo,player.photoThumb,player.headshot].find(value=>/^https?:\/\//i.test(String(value||'').trim()));
    if(direct)return String(direct).trim();
    const id=String(player.espnId||'').replace(/[^0-9]/g,'');
    return id?`/api/photo?id=${id}`:'';
  }
  function initials(name=''){return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()||'').join('')||'W';}
  async function ensurePlayers(){
    if(playerCache.size&&Date.now()-playerCacheAt<1800000)return playerCache;
    try{
      const response=await fetch('/api/players?homeWeekPhotos=1',{headers:{Accept:'application/json'}}),payload=await response.json().catch(()=>({}));
      const list=response.ok&&Array.isArray(payload.players)?payload.players:[];
      playerCache=new Map(list.map(player=>[key(player.name),player]));
      playerCacheAt=Date.now();
    }catch{}
    return playerCache;
  }
  function playerTile(item={}){
    const player=playerCache.get(key(item.name))||{},photo=playerPhoto(player),name=item.name||'Player';
    return `<a class="week-player" href="/playerpedia.html?search=${encodeURIComponent(name)}" title="Open ${safe(name)} in Playerpedia"><span class="week-player-photo"><b>${safe(initials(name))}</b>${photo?`<img src="${safe(photo)}" alt="${safe(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</span><span class="week-player-name">${safe(name)}</span></a>`;
  }
  function rotationGroup(title,subtitle,rotation,href,cls=''){
    const picks=Array.isArray(rotation?.picks)?rotation.picks:[];
    return `<section class="week-rotation-group ${safe(cls)}"><div class="week-rotation-head"><div><span class="week-rotation-kicker">${safe(subtitle)}</span><strong>${safe(title)}</strong><div class="week-rotation-date">${rotation?.week?`Week of ${safe(fmtWeek(rotation.week))}`:'Next mock rotation pending'}</div></div><a href="${safe(href)}">See full board →</a></div><div class="week-player-strip">${picks.length?picks.map(playerTile).join(''):'<span class="week-rotation-empty">Next mock rotation pending.</span>'}</div></section>`;
  }
  async function refreshRotations(){
    if(refreshActive)return;
    refreshActive=true;
    const rotationHost=document.getElementById('homeWeekRotationsLive'),stamp=document.getElementById('homeWeekStampLive');
    if(!rotationHost){refreshActive=false;return;}
    try{
      const cb=Date.now();
      const response=await fetch(`/rotation-history.json?cb=${cb}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}),rotations=response.ok?await response.json():{};
      const sf=[...(rotations.startingFive||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0]||{};
      const bm=[...(rotations.benchMob||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0]||{};
      await ensurePlayers();
      rotationHost.innerHTML=`<div class="week-rotation-intro"><div><strong>Shak’s mock weekly rotation</strong><p>My five starters and six-player bench for the week, based on current form, fit and what I’m seeing around the league.</p></div><span>EDITORIAL PICKS</span></div><div class="week-rotation-shell">${rotationGroup('Shak’s Starting Five','MOCK STARTING FIVE',sf,'/starting-five.html','starting')}${rotationGroup('Shak’s Bench Mob','MOCK BENCH MOB',bm,'/bench-mob.html','bench')}</div>`;
      const latestWeek=sf.week||bm.week;
      if(stamp){stamp.classList.add('live-refresh');stamp.textContent=latestWeek?`Week of ${fmtWeek(latestWeek)}`:'This week';stamp.title=`Rotations refreshed ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;}
    }catch{
      rotationHost.innerHTML='<p class="week-rotation-empty">Shak’s weekly mock rotation is reconnecting.</p>';
    }finally{refreshActive=false;}
  }

  normalizeWeeklyBoard();
  refreshRotations();
  setInterval(()=>{if(!document.hidden)refreshRotations();},120000);
  window.addEventListener('focus',refreshRotations);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshRotations();});
})();
