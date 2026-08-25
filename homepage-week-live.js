(()=>{
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const short=(v='',limit=190)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return t.length<=limit?t:`${t.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const fmtDate=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric'});};
  const fmtWeek=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  let playerCache=new Map();
  let playerCacheAt=0;
  let refreshActive=false;

  function instant(game={}){
    const direct=String(game.startTimeUtc||game.timestamp||'').trim();
    if(direct){const iso=direct.includes('T')?direct:direct.replace(' ','T'),zoned=/Z$|[+-]\d{2}:?\d{2}$/i.test(iso),d=new Date(zoned?iso:`${iso}Z`);if(!Number.isNaN(d.getTime()))return d;}
    if(game.date){const d=new Date(`${game.date}T${game.time||'12:00:00Z'}`);if(!Number.isNaN(d.getTime()))return d;}
    return null;
  }
  function when(game={}){const d=instant(game);if(!d)return game.date||'TBD';return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'2-digit'}).format(d).replace(',','');}
  function ranks(standings=[]){return new Map((standings||[]).map(row=>[key(row.team?.full_name),Number(row.overall_rank)||99]));}
  function bestGames(payload={}){
    const rows=[...(payload.liveGames||[]),...(payload.upcomingGames||[])],rankMap=ranks(payload.standings);
    return rows.map(game=>({game,quality:(rankMap.get(key(game.homeTeam))||99)+(rankMap.get(key(game.awayTeam))||99),time:instant(game)?.getTime()||Number.MAX_SAFE_INTEGER})).sort((a,b)=>a.quality-b.quality||a.time-b.time).slice(0,3).map(x=>x.game);
  }
  function networkInfo(value=''){
    const raw=String(value||'').trim(),low=raw.toLowerCase();
    if(low.includes('abc'))return ['ABC','abc'];
    if(low.includes('espn2'))return ['ESPN2','espn2'];
    if(low.includes('espn'))return ['ESPN','espn'];
    if(low.includes('ion'))return ['ION','ion'];
    if(low.includes('nba tv')||low.includes('nbatv'))return ['NBA TV','nba-tv'];
    if(low.includes('cbs sports'))return ['CBS Sports','cbs-sports'];
    if(low.includes('cbs'))return ['CBS','cbs'];
    if(low.includes('prime'))return ['Prime','prime'];
    if(low.includes('peacock'))return ['Peacock','peacock'];
    return [raw,raw.toLowerCase().replace(/[^a-z0-9]+/g,'-')];
  }
  function gameNetworks(game={}){
    const values=[...(Array.isArray(game.broadcasts)?game.broadcasts:[]),game.broadcast,game.network,game.tv].flat().filter(Boolean),seen=new Set();
    return values.map(networkInfo).filter(([label])=>label&&!seen.has(label.toLowerCase())&&seen.add(label.toLowerCase())).slice(0,2);
  }
  function networkBadges(game={}){
    const items=gameNetworks(game);
    return items.length?items.map(([label,cls])=>`<span class="network-icon network-${safe(cls)}">${safe(label)}</span>`).join(''):'<span class="network-icon network-tbd">TV TBD</span>';
  }
  function milestone(post={}){
    const paras=(post.sections||[]).flatMap(section=>section.paragraphs||[]);
    const candidates=paras.filter(p=>/consecutive|record|milestone|career high|first .* player/i.test(p));
    candidates.sort((a,b)=>(/consecutive/i.test(a)?0:1)-(/consecutive/i.test(b)?0:1));
    return candidates[0]||'';
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
    return `<a class="week-player" href="/playerpedia.html?search=${encodeURIComponent(name)}" title="${safe(name)}"><span class="week-player-photo"><b>${safe(initials(name))}</b>${photo?`<img src="${safe(photo)}" alt="${safe(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</span><span>${safe(name)}</span></a>`;
  }
  function rotationGroup(title,rotation,href,cls=''){
    const picks=Array.isArray(rotation?.picks)?rotation.picks:[];
    return `<section class="week-rotation-group ${safe(cls)}"><div class="week-rotation-head"><div><strong>${safe(title)}</strong><div class="week-rotation-date">${rotation?.week?`Week of ${safe(fmtWeek(rotation.week))}`:'Next rotation pending'}</div></div><a href="${safe(href)}">Open →</a></div><div class="week-player-strip">${picks.length?picks.map(playerTile).join(''):'<span>Next rotation pending.</span>'}</div></section>`;
  }

  async function refreshWeek(){
    if(refreshActive)return;
    refreshActive=true;
    const gamesHost=document.getElementById('homeWeekGamesLive'),milestoneHost=document.getElementById('homeWeekMilestoneLive'),snackHost=document.getElementById('homeWeekSnackLive'),rotationHost=document.getElementById('homeWeekRotationsLive'),stamp=document.getElementById('homeWeekStampLive');
    try{
      const cb=Date.now();
      const [statsR,rotR,snackR]=await Promise.allSettled([
        fetch(`/api/stats?season=2026&cb=${cb}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch(`/rotation-history.json?cb=${cb}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch(`/snack-shaq-posts.json?cb=${cb}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{})
      ]);
      const stats=statsR.status==='fulfilled'?statsR.value:{},rotations=rotR.status==='fulfilled'?rotR.value:{},snack=snackR.status==='fulfilled'?snackR.value:{};
      const posts=(Array.isArray(snack.posts)?snack.posts:[]).filter(p=>p.type!=='intro').sort((a,b)=>String(b.published||'').localeCompare(String(a.published||''))),latest=posts[0]||{};
      const games=bestGames(stats);
      if(gamesHost)gamesHost.innerHTML=games.length?`<div class="week-game-list">${games.map(game=>`<div class="week-game-row"><span>${safe(when(game))}</span><div class="week-game-copy"><strong>${safe(game.awayTeam||'TBD')} @ ${safe(game.homeTeam||'TBD')}</strong><div class="week-game-watch"><span class="week-arena">${safe(game.venue||'Arena TBD')}</span>${networkBadges(game)}</div></div></div>`).join('')}</div><a href="/games.html">Open Games + where to watch →</a><p class="week-game-refresh-note">Auto-refreshing from the live schedule feed.</p>`:'<p>No upcoming games are currently loaded.</p><a href="/games.html">Open Games →</a>';
      const note=milestone(latest);
      if(milestoneHost)milestoneHost.innerHTML=note?`<h3>Milestone watch</h3><p>${safe(short(note,220))}</p><a href="/stat-kitchen.html">Track the numbers →</a>`:'<h3>Milestone watch</h3><p>Record chases and threshold moments will appear here with the weekly update.</p><a href="/milestone-moments.html">Open Milestone Moments →</a>';
      if(snackHost)snackHost.innerHTML=latest.title?`<span class="week-snack-date">Released ${safe(fmtDate(latest.published))}</span><strong class="week-snack-title">${safe(latest.title)}</strong><p>${safe(short(latest.dek,180))}</p><a href="/snack-shak.html?post=${encodeURIComponent(latest.slug)}#latest">Read this week’s plate →</a>`:'<p>The next Snack Shak plate is still in the kitchen.</p><a href="/snack-shak.html">Open Snack Shak →</a>';
      const sf=[...(rotations.startingFive||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0]||{},bm=[...(rotations.benchMob||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0]||{};
      await ensurePlayers();
      if(rotationHost)rotationHost.innerHTML=`<div class="week-rotation-shell">${rotationGroup('Starting Five',sf,'/starting-five.html','starting')}${rotationGroup('Bench Mob',bm,'/bench-mob.html','bench')}</div>`;
      const latestWeek=sf.week||bm.week||latest.published;
      if(stamp){stamp.classList.add('live-refresh');stamp.textContent=latestWeek?`Week of ${fmtWeek(latestWeek)}`:'This week';stamp.title=`Auto refreshed ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;}
    }catch{
      [gamesHost,milestoneHost,snackHost,rotationHost].forEach(host=>{if(host)host.innerHTML='<p>Weekly panel is reconnecting to the site feeds.</p>';});
    }finally{refreshActive=false;}
  }

  refreshWeek();
  setInterval(()=>{if(!document.hidden)refreshWeek();},120000);
  window.addEventListener('focus',refreshWeek);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshWeek();});
})();
