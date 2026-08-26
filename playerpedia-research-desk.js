(()=>{
  const grid=document.getElementById('playerGrid');
  const search=document.getElementById('playerSearch');
  const teamFilter=document.getElementById('playerTeamFilter');
  const count=document.getElementById('playerCount');
  const statusEl=document.getElementById('playerStatus');
  const modalEl=document.getElementById('playerModal');
  const modalBodyEl=document.getElementById('playerModalBody');
  const tabs=document.getElementById('playerResearchTabs');
  if(!grid||!search||!teamFilter||!count||!tabs)return;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const key=value=>norm(value).replace(/\s+/g,'');
  const num=value=>{const n=Number(value);return Number.isFinite(n)?n:null;};
  const one=value=>{const n=num(value);return n===null?'—':n.toFixed(1);};
  const pct=value=>{const n=num(value);return n===null?'—':`${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const gradeClass=letter=>{const value=String(letter||'NR').toUpperCase();return value==='NR'?'grade-nr':`grade-${value.charAt(0).toLowerCase()}`;};
  const media={
    'Sue Bird':['100720','2002–2022'],'Diana Taurasi':['100940','2004–2024'],'Candace Parker':['201496','2008–2023'],'Tamika Catchings':['100646','2002–2016'],'Maya Moore':['202632','2011–2018'],'Sylvia Fowles':['201480','2008–2022'],'Seimone Augustus':['200671','2006–2020'],'Lindsay Whalen':['100915','2004–2018'],'Becky Hammon':['100342','1999–2014'],'Lisa Leslie':['100003','1997–2009'],'Sheryl Swoopes':['100072','1997–2011'],'Cynthia Cooper':['100073','1997–2003'],'Tina Thompson':['100076','1997–2013'],'Ticha Penicheiro':['100234','1998–2012'],'Yolanda Griffith':['100419','1999–2009'],'Katie Smith':['100404','1999–2013'],'Elena Delle Donne':['203399','2013–2023'],'Tina Charles':['202250','2010–2025'],'Lauren Jackson':['100682','2001–2012'],'Cappie Pondexter':['200665','2006–2018'],'Natalie Achonwa':['203831','2015–2023'],'Courtney Paris':['201907','2009–2019'],'Sugar Rodgers':['203411','2013–2020']
  };
  const retired=[
    {name:'Sue Bird',retired:'2022',fact:'Four-time WNBA champion, record-setting floor general and one-franchise Seattle icon.',teams:[['Seattle Storm','2002–2022']]},
    {name:'Diana Taurasi',retired:'2025',fact:'Three-time champion and the WNBA’s all-time leading scorer, with her entire WNBA career in Phoenix.',teams:[['Phoenix Mercury','2004–2024']]},
    {name:'Candace Parker',retired:'2024',fact:'Two-time MVP and three-time champion who won titles with three different franchises.',teams:[['Los Angeles Sparks','2008–2020'],['Chicago Sky','2021–2022'],['Las Vegas Aces','2023']]},
    {name:'Tamika Catchings',retired:'2016',fact:'MVP, champion and the defining two-way star of the Indiana Fever’s first era.',teams:[['Indiana Fever','2002–2016']]},
    {name:'Maya Moore',retired:'2023',fact:'Four-time champion and 2014 MVP whose Minnesota run helped define a dynasty.',teams:[['Minnesota Lynx','2011–2018']]},
    {name:'Sylvia Fowles',retired:'2022',fact:'Two-time champion, Finals MVP and one of the most dominant rebounders and rim protectors in league history.',teams:[['Chicago Sky','2008–2014'],['Minnesota Lynx','2015–2022']],clipboard:'Portland Fire · Assistant coach'},
    {name:'Seimone Augustus',retired:'2021',fact:'Four-time champion and smooth-scoring cornerstone of Minnesota’s championship era.',teams:[['Minnesota Lynx','2006–2019'],['Los Angeles Sparks','2020']]},
    {name:'Lindsay Whalen',retired:'2018',fact:'Elite point guard who reached the Finals in Connecticut before winning four championships back home in Minnesota.',teams:[['Connecticut Sun','2004–2009'],['Minnesota Lynx','2010–2018']]},
    {name:'Becky Hammon',retired:'2014',fact:'Six-time All-Star guard whose No. 25 was retired by San Antonio and later by Las Vegas.',teams:[['New York Liberty','1999–2006'],['San Antonio Stars','2007–2014']],clipboard:'Las Vegas Aces · Head coach'},
    {name:'Stephanie White',retired:'2004',fact:'Five-season WNBA guard who became an Indiana Fever leader on the sideline after beginning her playing career with Charlotte.',teams:[['Charlotte Sting','1999'],['Indiana Fever','2000–2004']],clipboard:'Indiana Fever · Head coach'},
    {name:'Sandy Brondello',retired:'2003',fact:'WNBA All-Star guard whose playing career became the foundation for a championship coaching career.',teams:[['Detroit Shock','1998–1999'],['Miami Sol','2001–2002'],['Seattle Storm','2003']],clipboard:'Toronto Tempo · Head coach'},
    {name:'Natalie Achonwa',retired:'2023',fact:'Nine-season WNBA forward, community leader and Canadian Olympian who moved into coaching and player development.',teams:[['Indiana Fever','2015–2020'],['Minnesota Lynx','2021–2023']],clipboard:'Seattle Storm · Assistant coach'},
    {name:'Courtney Paris',retired:'2019',fact:'WNBA champion and two-time league rebounding leader whose professional career stretched across multiple franchises.',teams:[['Sacramento Monarchs','2009'],['Atlanta Dream','2011'],['Tulsa Shock','2012–2015'],['Dallas Wings','2016–2017'],['Seattle Storm','2018–2019']],clipboard:'New York Liberty · Assistant coach'},
    {name:'Ebony Hoffman',retired:'2014',fact:'Eleven-season WNBA forward and 2008 Most Improved Player who later moved into professional coaching.',teams:[['Indiana Fever','2004–2010'],['Los Angeles Sparks','2011–2013'],['Connecticut Sun','2014']],clipboard:'Los Angeles Sparks · Assistant coach'},
    {name:'Sugar Rodgers',retired:'2020',fact:'WNBA champion, All-Star and Sixth Player award winner who moved from the backcourt to the coaching bench.',teams:[['Minnesota Lynx','2013'],['New York Liberty','2014–2018'],['Las Vegas Aces','2019–2020']],clipboard:'Golden State Valkyries · Assistant coach'},
    {name:'Lisa Leslie',retired:'2009',fact:'Three-time MVP, two-time champion and the first player to dunk in a WNBA game.',teams:[['Los Angeles Sparks','1997–2009']]},
    {name:'Sheryl Swoopes',retired:'2011',fact:'Three-time MVP and four-time champion who helped establish Houston as the league’s first dynasty.',teams:[['Houston Comets','1997–2007'],['Seattle Storm','2008'],['Tulsa Shock','2011']]},
    {name:'Cynthia Cooper',retired:'2003',fact:'The engine of Houston’s four straight championships and the first great Finals closer of the WNBA era.',teams:[['Houston Comets','1997–2000, 2003']]},
    {name:'Tina Thompson',retired:'2013',fact:'Original No. 1 draft pick, four-time champion and one of the league’s foundational scoring forwards.',teams:[['Houston Comets','1997–2008'],['Los Angeles Sparks','2009–2011'],['Seattle Storm','2012–2013']]},
    {name:'Ticha Penicheiro',retired:'2012',fact:'Championship point guard, gifted passer and longtime Sacramento floor general.',teams:[['Sacramento Monarchs','1998–2009'],['Los Angeles Sparks','2010–2011'],['Chicago Sky','2012']]},
    {name:'Yolanda Griffith',retired:'2009',fact:'MVP, Finals MVP and interior anchor of Sacramento’s 2005 championship team.',teams:[['Sacramento Monarchs','1999–2007'],['Seattle Storm','2008'],['Indiana Fever','2009']]},
    {name:'Katie Smith',retired:'2013',fact:'A relentless scorer and champion whose long career crossed five WNBA franchises.',teams:[['Minnesota Lynx','1999–2005'],['Detroit Shock','2006–2009'],['Washington Mystics','2010'],['Seattle Storm','2011–2012'],['New York Liberty','2013']]},
    {name:'Elena Delle Donne',retired:'2025',fact:'Two-time MVP and 2019 champion whose shooting touch reshaped expectations for frontcourt scorers.',teams:[['Chicago Sky','2013–2016'],['Washington Mystics','2017–2023']]},
    {name:'Tina Charles',retired:'2026',fact:'MVP, Rookie of the Year, all-time rebounding leader and one of the most productive interior scorers in league history.',teams:[['Connecticut Sun','2010–2013'],['New York Liberty','2014–2019'],['Washington Mystics','2021'],['Phoenix Mercury','2022'],['Seattle Storm','2022'],['Atlanta Dream','2024'],['Connecticut Sun','2025']]},
    {name:'Lauren Jackson',retired:'2012',fact:'Three-time MVP, two-time champion and a defining inside-out superstar of the Seattle Storm.',teams:[['Seattle Storm','2001–2012']]},
    {name:'Cappie Pondexter',retired:'2018',fact:'Two-time champion and Finals MVP who brought elite shot creation to five franchises.',teams:[['Phoenix Mercury','2006–2009'],['New York Liberty','2010–2014'],['Chicago Sky','2015–2017'],['Los Angeles Sparks','2018'],['Indiana Fever','2018']]}
  ].map(player=>({...player,photo:media[player.name]?`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${media[player.name][0]}.png`:'',years:media[player.name]?.[1]||player.teams.flatMap(stop=>String(stop[1]).match(/\b(?:19|20)\d{2}\b/g)||[]).join('–')}));
  const retiredNames=new Set(retired.map(player=>norm(player.name)));
  const retiredTeams=[...new Set(retired.flatMap(player=>player.teams.map(([team])=>team)))].sort();
  const originalRender=typeof render==='function'?render:null;
  const originalFillTeams=typeof fillTeams==='function'?fillTeams:null;
  const snapshotCache=new Map();
  let mode='current';

  function season(player={}){const n=Number(player.lastWnbaSeason);return Number.isInteger(n)?n:null;}
  function finalRetiredSeason(player={}){const years=(player.teams||[]).flatMap(([,value])=>String(value).match(/\b(?:19|20)\d{2}\b/g)||[]).map(Number).filter(Number.isFinite);return years.length?Math.max(...years):Number(player.retired)||null;}
  function isCurrent(player={}){return player.currentRoster!==false;}
  function isRecent(player={}){const y=season(player);return player.currentRoster===false&&y>=2024&&y<=2026&&!retiredNames.has(norm(player.name));}
  function activePlayersForMode(){const source=Array.isArray(allPlayers)?allPlayers:[];return mode==='recent'?source.filter(isRecent):source.filter(isCurrent);}
  function applyModeToActiveGrid(){
    if(!originalRender)return;
    originalRender();
    const allowed=new Set(activePlayersForMode().map(player=>String(player.id)));
    let visible=0;
    grid.querySelectorAll('.player-card[data-player-id]').forEach(card=>{const show=allowed.has(String(card.dataset.playerId));card.hidden=!show;if(show)visible+=1;});
    count.textContent=`${visible} ${mode==='recent'?'recent':'current'} ${visible===1?'player':'players'} shown`;
    if(statusEl)statusEl.textContent=mode==='recent'?'Recently active players and free agents with a 2024–2026 WNBA season remain searchable with their last active production.':'On the Floor: current WNBA roster players with live team context, grades, stats and offseason affiliations.';
  }
  function retiredMatches(){
    const q=norm(search.value),selectedTeam=teamFilter.value;
    return retired.filter(player=>{
      const last=player.name.trim().split(/\s+/).pop()||'';
      const hay=norm(`${player.name} ${player.fact} ${player.clipboard||''} ${player.teams.flat().join(' ')}`);
      return (!letter||last.toUpperCase().startsWith(letter))&&(!q||hay.includes(q))&&(!selectedTeam||player.teams.some(([team])=>team===selectedTeam));
    });
  }
  function retiredCard(player){
    const season=finalRetiredSeason(player);
    return `<button class="player-card player-card-retired-research" type="button" data-retired-name="${safe(player.name)}"><span class="player-avatar photo-avatar" aria-hidden="true"><span class="player-avatar-fallback">${safe(player.name.split(/\s+/).map(p=>p[0]).join('').slice(0,2))}</span>${player.photo?`<img class="player-avatar-image player-cutout" src="${safe(player.photo)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'">`:''}</span><span class="player-card-copy"><span class="player-card-topline">LEGENDS LOUNGE · RETIRED ${safe(player.retired)}</span><strong class="player-card-name">${safe(player.name)}</strong><span>${safe(player.years||`${season||''}`)}</span>${player.clipboard?`<small class="research-clipboard-note">COURT TO CLIPBOARD · ${safe(player.clipboard)}</small>`:''}<small class="research-card-note">${safe(player.fact)}</small></span><span class="player-card-arrow">→</span></button>`;
  }
  function renderRetired(){
    const list=retiredMatches();
    grid.innerHTML=list.length?list.map(retiredCard).join(''):'<div class="player-empty"><strong>No retired players match those filters.</strong><span>Try another letter, team or search.</span></div>';
    count.textContent=`${list.length} retired ${list.length===1?'player':'players'} shown`;
    if(statusEl)statusEl.textContent='Legends Lounge: retired players with career paths, final active-season stats and league-relative grades, plus Court to Clipboard connections when applicable.';
  }
  function renderResearch(){mode==='retired'?renderRetired():applyModeToActiveGrid();updateTabCounts();}
  function fillModeTeams(){
    if(mode==='retired')teamFilter.innerHTML=['<option value="">All career teams</option>',...retiredTeams.map(team=>`<option value="${safe(team)}">${safe(team)}</option>`)].join('');
    else if(originalFillTeams)originalFillTeams();
  }
  function updateTabCounts(){
    const source=Array.isArray(allPlayers)?allPlayers:[];
    const totals={current:source.filter(isCurrent).length,recent:source.filter(isRecent).length,retired:retired.length};
    tabs.querySelectorAll('[data-research-view]').forEach(button=>{const value=button.dataset.researchView;const badge=button.querySelector('b');if(badge)badge.textContent=totals[value]??'';button.classList.toggle('active',value===mode);button.setAttribute('aria-pressed',String(value===mode));});
  }
  function setMode(next,{preserveTeam=false}={}){
    if(!['current','recent','retired'].includes(next))return;
    mode=next;
    if(!preserveTeam)teamFilter.value='';
    fillModeTeams();updateTabCounts();renderResearch();
    const url=new URL(location.href);url.searchParams.set('view',mode);history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`);
  }
  async function snapshotFor(player){
    const finalSeason=finalRetiredSeason(player);if(!finalSeason)return null;
    if(snapshotCache.has(finalSeason))return snapshotCache.get(finalSeason).get(key(player.name))||null;
    try{
      const response=await fetch(`/api/player-season-snapshot?season=${encodeURIComponent(finalSeason)}&playerpedia=retired-v2`,{headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      const map=response.ok&&Array.isArray(payload.players)?new Map(payload.players.map(item=>[key(item.name),item])):new Map();
      snapshotCache.set(finalSeason,map);return map.get(key(player.name))||null;
    }catch{snapshotCache.set(finalSeason,new Map());return null;}
  }
  function retiredMetrics(snapshot,season){
    const letter=snapshot?.letter||'NR',score=num(snapshot?.score);
    return `<section class="research-retired-season"><div class="research-retired-season-head"><div><span class="research-retired-kicker">${safe(season)} · FINAL ACTIVE SEASON</span><strong>Last-season WNBA snapshot</strong></div><div class="research-retired-grade"><span class="player-history-grade-badge ${gradeClass(letter)}">${safe(letter)}</span><span><b>${score===null?'—':`${Math.round(score)}%`}</b><small>league-relative grade</small></span></div></div><div class="research-retired-stats"><div><span>PTS</span><strong>${one(snapshot?.ppg)}</strong></div><div><span>REB</span><strong>${one(snapshot?.rpg)}</strong></div><div><span>AST</span><strong>${one(snapshot?.apg)}</strong></div><div><span>STL</span><strong>${one(snapshot?.spg)}</strong></div><div><span>BLK</span><strong>${one(snapshot?.bpg)}</strong></div><div><span>G</span><strong>${snapshot?.games??'—'}</strong></div></div><div class="research-retired-eff"><span><b>PER</b> ${one(snapshot?.per)}</span><span><b>TS%</b> ${pct(snapshot?.tsPct)}</span>${snapshot?'<span>Grade is weighted against players from that WNBA season.</span>':'<span>Historical snapshot is reconnecting.</span>'}</div></section>`;
  }
  async function showRetiredProfile(name){
    const player=retired.find(item=>item.name===name);if(!player||!modalEl||!modalBodyEl)return;
    const finalSeason=finalRetiredSeason(player),path=player.teams.map(([team,years])=>`<div class="research-retired-stop"><strong>${safe(team)}</strong><span>${safe(years)}</span></div>`).join('');
    modalBodyEl.innerHTML=`<div class="research-retired-profile" data-retired-profile="${safe(player.name)}"><div class="research-retired-hero"><span class="player-avatar photo-avatar large"><span class="player-avatar-fallback">${safe(player.name.split(/\s+/).map(p=>p[0]).join('').slice(0,2))}</span>${player.photo?`<img class="player-avatar-image player-cutout" src="${safe(player.photo)}" alt="${safe(player.name)}" loading="eager" decoding="async" onerror="this.style.display='none'">`:''}</span><div><span class="research-retired-kicker">LEGENDS LOUNGE · RETIRED ${safe(player.retired)}</span><h2 id="playerModalTitle">${safe(player.name)}</h2><p>${safe(player.fact)}</p></div></div><div class="research-retired-season-loading">Loading ${safe(finalSeason||'final')} season rating and stats…</div><section><span class="research-retired-kicker">WNBA CAREER PATH</span><div class="research-retired-path">${path}</div></section>${player.clipboard?`<section class="research-clipboard-crosslink"><span class="research-retired-kicker">COURT TO CLIPBOARD</span><strong>${safe(player.clipboard)}</strong><p>Her playing career and coaching career are cross-referenced across We Know the W.</p><a href="/coaches.html#court-to-clipboard">Open Court to Clipboard →</a></section>`:''}<div class="research-retired-actions"><a href="/retired-players.html?search=${encodeURIComponent(player.name)}#legend-directory">Open full Legends Lounge archive →</a></div></div>`;
    modalEl.showModal();
    const snapshot=await snapshotFor(player),profile=modalBodyEl.querySelector(`[data-retired-profile="${CSS.escape(player.name)}"]`),loading=profile?.querySelector('.research-retired-season-loading');
    if(profile&&loading)loading.outerHTML=retiredMetrics(snapshot,finalSeason);
  }

  if(originalRender)render=renderResearch;
  tabs.addEventListener('click',event=>{const button=event.target.closest('[data-research-view]');if(button)setMode(button.dataset.researchView);});
  grid.addEventListener('click',event=>{const card=event.target.closest('[data-retired-name]');if(card)showRetiredProfile(card.dataset.retiredName);});
  search.addEventListener('input',()=>{if(mode==='retired')renderRetired();else queueMicrotask(renderResearch);});
  teamFilter.addEventListener('change',()=>{if(mode==='retired')renderRetired();else queueMicrotask(renderResearch);});

  const requested=new URLSearchParams(location.search).get('view');
  if(['current','recent','retired'].includes(requested))mode=requested;
  fillModeTeams();updateTabCounts();
  const waitForRoster=setInterval(()=>{if(Array.isArray(allPlayers)&&allPlayers.length){clearInterval(waitForRoster);fillModeTeams();renderResearch();const wanted=new URLSearchParams(location.search).get('search');if(mode==='retired'&&wanted){const match=retired.find(player=>norm(player.name)===norm(wanted));if(match)showRetiredProfile(match.name);}}},120);
  setTimeout(()=>clearInterval(waitForRoster),7000);
})();
