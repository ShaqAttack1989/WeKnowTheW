(()=>{
  const grid=document.getElementById('playerGrid'), search=document.getElementById('playerSearch');
  const teamFilter=document.getElementById('playerTeamFilter'), count=document.getElementById('playerCount');
  const statusEl=document.getElementById('playerStatus'), tabs=document.getElementById('playerResearchTabs');
  const modalEl=document.getElementById('playerModal'), modalBodyEl=document.getElementById('playerModalBody');
  const catalog=window.WPlayerpediaLegacy;
  if(!grid||!search||!teamFilter||!count||!tabs||!catalog)return;
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const num=value=>value===null||value===undefined||String(value).trim()===''?null:Number.isFinite(Number(value))?Number(value):null;
  const one=value=>num(value)===null?'—':num(value).toFixed(1);
  const pct=value=>num(value)===null?'—':`${(Math.abs(num(value))<=1?num(value)*100:num(value)).toFixed(1)}%`;
  const gradeClass=letter=>!letter||letter==='NR'?'grade-nr':`grade-${letter.charAt(0).toLowerCase()}`;
  const archived=catalog.players;
  const archiveTeams=[...new Set(archived.flatMap(player=>player.teams.map(([team])=>team)))].sort();
  const originalRender=typeof render==='function'?render:null;
  const snapshotCache=new Map();
  const views=['all','current','recent','retired'];
  const params=new URLSearchParams(location.search);
  let mode=views.includes(params.get('view'))?params.get('view'):'all';
  let rosterReady=false;
  const source=()=>Array.isArray(allPlayers)?allPlayers:[];
  const isCurrent=player=>player.currentRoster!==false&&!catalog.find(player.name);
  const isRecent=player=>player.currentRoster===false&&Number(player.lastWnbaSeason)>=2024&&Number(player.lastWnbaSeason)<=2026&&!catalog.find(player.name);
  const stagePlayers=()=>source().filter(player=>mode==='current'?isCurrent(player):mode==='recent'?isRecent(player):isCurrent(player)||isRecent(player));

  function updateTabCounts(){
    const current=source().filter(isCurrent).length,recent=source().filter(isRecent).length;
    const totals={all:current+recent+archived.length,current,recent,retired:archived.length};
    tabs.querySelectorAll('[data-research-view]').forEach(button=>{
      const view=button.dataset.researchView,badge=button.querySelector('b');
      if(badge)badge.textContent=totals[view];
      button.classList.toggle('active',view===mode);button.setAttribute('aria-pressed',String(view===mode));
    });
  }
  function fillModeTeams(){
    const previous=teamFilter.value,currentTeams=Array.isArray(teams)?teams:[];
    const options=mode==='retired'?archiveTeams.map(name=>({id:name,name})):[...currentTeams];
    if(mode==='all')archiveTeams.filter(name=>!currentTeams.some(team=>team.name===name)).forEach(name=>options.push({id:name,name}));
    teamFilter.innerHTML='<option value="">All teams</option>'+options.map(team=>`<option value="${safe(team.id)}">${safe(team.name)}</option>`).join('');
    if(options.some(team=>String(team.id)===previous))teamFilter.value=previous;
  }
  function archiveMatches(){
    const selected=teamFilter.value;
    const teamName=(Array.isArray(teams)?teams:[]).find(team=>String(team.id)===selected)?.name||selected;
    return archived.filter(player=>(!letter||player.name.trim().split(/\s+/).pop().toUpperCase().startsWith(letter))&&catalog.matches(player,search.value)&&(!teamName||player.teams.some(([team])=>team===teamName)));
  }
  function avatar(player,large=false){
    return `<span class="player-avatar photo-avatar${large?' large':''}"${large?'':' aria-hidden="true"'}><span class="player-avatar-fallback">${safe(player.name.split(/\s+/).map(p=>p[0]).join('').slice(0,2))}</span>${player.photo?`<img class="player-avatar-image${player.photoSource?' research-portrait':' player-cutout'}" src="${safe(player.photo)}" alt="${large?safe(player.name):''}" loading="${large?'eager':'lazy'}" decoding="async" onerror="this.style.display='none'">`:''}</span>`;
  }
  function archiveCard(player){
    return `<button class="player-card player-card-retired-research" type="button" data-retired-name="${safe(player.name)}">${avatar(player)}<span class="player-card-copy"><span class="player-card-topline">LEGENDS LOUNGE · ${safe(catalog.statusLabel(player))}</span><strong class="player-card-name">${safe(player.name)}</strong><span>${safe(player.years)}</span>${player.clipboard?`<small class="research-clipboard-note">COURT TO CLIPBOARD · ${safe(player.clipboard)}</small>`:''}<small class="research-card-note">${safe(player.fact)}</small></span><span class="player-card-arrow">→</span></button>`;
  }
  function renderResearch(){
    let visible=0;
    if(mode==='retired')grid.innerHTML='';
    else if(originalRender){
      originalRender();
      const allowed=new Set(stagePlayers().map(player=>String(player.id)));
      grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{
        if(!allowed.has(String(card.dataset.playerId)))card.remove();else visible++;
      });
      grid.querySelectorAll('.player-empty,.error-box').forEach(node=>node.remove());
    }
    const legacy=mode==='all'||mode==='retired'?archiveMatches():[];
    if(legacy.length)grid.insertAdjacentHTML('beforeend',legacy.map(archiveCard).join(''));
    visible+=legacy.length;
    if(!visible)grid.innerHTML='<div class="player-empty"><strong>No players match those filters.</strong><span>Try All players or another name, letter or team.</span></div>';
    count.textContent=`${visible} ${visible===1?'player':'players'} shown`;
    if(statusEl)statusEl.textContent=mode==='retired'?'Legends Lounge: career records, last WNBA season stats and grades, and franchise paths.':mode==='recent'?'Recently active players and free agents retain their last WNBA season.':mode==='current'?'Current WNBA roster players with team context, grades and season statistics.':`Search current, recent and archived careers together.${!rosterReady?' Career archive is ready; current rosters are loading.':!source().length?' Current roster feed is unavailable; the career archive remains searchable.':''}`;
    updateTabCounts();
  }
  function setMode(next){
    if(!views.includes(next))return;
    mode=next;teamFilter.value='';fillModeTeams();renderResearch();
    const url=new URL(location.href);url.searchParams.set('view',mode);history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`);
  }
  async function snapshotFor(player){
    if(player.lastSeasonSnapshot)return player.lastSeasonSnapshot;
    const season=player.lastWnbaSeason;if(!season)return null;
    if(!snapshotCache.has(season))snapshotCache.set(season,(async()=>{
      // Historical seasons are assembled on demand and can need a little extra time on a cold request.
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
      try{
        const response=await fetch(`/api/player-season-snapshot?season=${season}&playerpedia=archive-v3`,{headers:{Accept:'application/json'},signal:controller.signal});
        const payload=await response.json();
        if(!response.ok||!Array.isArray(payload.players))throw new Error('Historical season unavailable');
        return new Map(payload.players.map(item=>[catalog.key(item.name),{...item,minGames:payload.minGames,minimumMinutes:8,sourceUrls:payload.sourceUrls}]));
      }catch{snapshotCache.delete(season);return new Map();}finally{clearTimeout(timer);}
    })());
    return (await snapshotCache.get(season)).get(catalog.key(player.name))||null;
  }
  function statGrid(stats){
    return `<div class="research-retired-stats">${[['PPG','ppg'],['RPG','rpg'],['APG','apg'],['SPG','spg'],['BPG','bpg'],['G','games']].map(([label,key])=>`<div><span>${label}</span><strong>${key==='games'?stats?.games??'—':one(stats?.[key])}</strong></div>`).join('')}</div>`;
  }
  function careerMarkup(player){
    if(!player.careerStats)return '';
    const stats=player.careerStats;
    return `<section class="research-career-stats"><span class="research-retired-kicker">${safe(player.years)} · WNBA CAREER</span><h3>Career regular-season averages</h3>${statGrid(stats)}<div class="research-retired-eff"><span><b>FG%</b> ${pct(stats.fgPct)}</span><span><b>3P%</b> ${pct(stats.fg3Pct)}</span><span><b>FT%</b> ${pct(stats.ftPct)}</span><span><b>PER</b> ${one(stats.per)}</span><span><b>TS%</b> ${pct(stats.tsPct)}</span></div><p class="research-source"><a href="${safe(player.statsSource)}" target="_blank" rel="noopener">Basketball-Reference · career and season records ↗</a></p></section>`;
  }
  function seasonMarkup(snapshot,season){
    const grade=snapshot?.letter||'NR',score=num(snapshot?.score);
    const provisional=snapshot?.provisional?`<p class="research-provisional"><strong>Provisional</strong> · ${snapshot.games??'—'} games, ${one(snapshot.minutes)} minutes per game. The comparison pool requires ${snapshot.minGames??'the season minimum of'} games and ${snapshot.minimumMinutes||8} minutes per game.</p>`:'';
    return `<section class="research-retired-season"><div class="research-retired-season-head"><div><span class="research-retired-kicker">${safe(season)} · LAST WNBA SEASON</span><strong>Regular-season W composite</strong></div><div class="research-retired-grade"><span class="player-history-grade-badge ${gradeClass(grade)}">${safe(grade)}</span><span><b>${score===null?'—':Math.round(score)+'/100'}</b><small>league-relative grade</small></span></div></div>${statGrid(snapshot)}<div class="research-retired-eff"><span><b>PER</b> ${one(snapshot?.per)}</span><span><b>TS%</b> ${pct(snapshot?.tsPct)}</span></div>${provisional}<p class="research-source">${snapshot?'The W composite compares this regular season with qualified players from the same year. It measures that season, not the player’s entire career or all-time standing.':'A verified grade is not available right now. Career records and source links remain available.'}</p>${snapshot?.sourceUrls?.length?`<p class="research-source">${snapshot.sourceUrls.filter(url=>url.includes('basketball-reference.com')).map((url,i)=>`<a href="${safe(url)}" target="_blank" rel="noopener">${i?'Advanced statistics':'Season statistics'} ↗</a>`).join(' · ')}</p>`:''}</section>`;
  }
  function photoCredit(player){
    if(!player.photoSource)return '';
    return `<p class="research-source">Photo: <a href="${safe(player.photoSource)}" target="_blank" rel="noopener">${safe(player.photoCredit)}</a> · <a href="${safe(player.photoLicenseUrl)}" target="_blank" rel="noopener">${safe(player.photoLicense)}</a> · cropped to fit.</p>`;
  }
  async function showArchiveProfile(name){
    const player=catalog.find(name);if(!player||!modalEl||!modalBodyEl)return;
    const path=player.teams.map(([team,years])=>`<a class="research-retired-stop" href="${safe(catalog.teamHref(team))}"><strong>${safe(team)}</strong><span>${safe(years)}</span></a>`).join('');
    modalBodyEl.innerHTML=`<div class="research-retired-profile" data-retired-profile="${safe(player.name)}"><div class="research-retired-hero">${avatar(player,true)}<div><span class="research-retired-kicker">LEGENDS LOUNGE · ${safe(catalog.statusLabel(player))}</span><h2 id="playerModalTitle">${safe(player.name)}</h2><p>${safe(player.fact)}</p></div></div>${photoCredit(player)}${player.college?`<p class="research-profile-facts">${safe(player.position)} · ${safe(player.college)}<br>${safe(player.draft)}</p>`:''}${player.statusSource?`<p class="research-source">Last WNBA appearance: ${player.lastWnbaSeason}. <a href="${safe(player.statusSource)}" target="_blank" rel="noopener">McCoughtry said in April 2026 that she had not retired. ↗</a></p>`:''}${careerMarkup(player)}${player.lastSeasonSnapshot?seasonMarkup(player.lastSeasonSnapshot,player.lastWnbaSeason):`<div class="research-retired-season-loading">Loading ${safe(player.lastWnbaSeason)} season rating and stats…</div>`}<section><span class="research-retired-kicker">WNBA CAREER PATH</span><div class="research-retired-path">${path}</div></section>${player.clipboard?`<section class="research-clipboard-crosslink"><span class="research-retired-kicker">COURT TO CLIPBOARD</span><strong>${safe(player.clipboard)}</strong><a href="/coaches.html#court-to-clipboard">Explore player-to-coach careers →</a></section>`:''}<div class="research-retired-actions"><a href="${safe(player.source)}" target="_blank" rel="noopener">${safe(player.sourceLabel)} ↗</a><a href="/retired-players.html?search=${encodeURIComponent(player.name)}#legend-directory">Full Legends Lounge archive →</a></div></div>`;
    if(!modalEl.open)modalEl.showModal();
    if(player.lastSeasonSnapshot)return;
    const snapshot=await snapshotFor(player);
    const profile=modalBodyEl.querySelector('[data-retired-profile]');
    if(profile?.dataset.retiredProfile===player.name){const loading=profile.querySelector('.research-retired-season-loading');if(loading)loading.outerHTML=seasonMarkup(snapshot,player.lastWnbaSeason);}
  }

  if(originalRender)render=renderResearch;
  if(typeof fillTeams==='function')fillTeams=fillModeTeams;
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-research-view]');if(button)setMode(button.dataset.researchView);});
  grid.addEventListener('click',event=>{const card=event.target.closest('[data-retired-name]');if(card)showArchiveProfile(card.dataset.retiredName);});
  search.addEventListener('input',()=>{if(mode!=='all'&&search.value.trim()){setMode('all');}else renderResearch();});
  teamFilter.addEventListener('change',renderResearch);
  document.addEventListener('w:playerpedia-roster-ready',()=>{rosterReady=true;fillModeTeams();renderResearch();});
  if(params.get('search'))search.value=params.get('search');
  const direct=catalog.find(search.value);
  if(direct&&mode!=='retired')mode='all';
  fillModeTeams();renderResearch();
  if(direct)showArchiveProfile(direct.name);
})();
