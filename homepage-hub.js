(()=>{
  const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const escReg=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const short=(v='',limit=165)=>{const t=String(v||'').replace(/\s+/g,' ').trim();return t.length<=limit?t:`${t.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const fmtDate=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric'});};
  const fmtWeek=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};

  const teams=[
    ['Atlanta Dream','atlanta-dream'],['Chicago Sky','chicago-sky'],['Connecticut Sun','connecticut-sun'],['Dallas Wings','dallas-wings'],['Golden State Valkyries','golden-state-valkyries'],['Indiana Fever','indiana-fever'],['Las Vegas Aces','las-vegas-aces'],['Los Angeles Sparks','los-angeles-sparks'],['Minnesota Lynx','minnesota-lynx'],['New York Liberty','new-york-liberty'],['Phoenix Mercury','phoenix-mercury'],['Portland Fire','portland-fire'],['Seattle Storm','seattle-storm'],['Toronto Tempo','toronto-tempo'],['Washington Mystics','washington-mystics']
  ];
  const coaches=[
    ['Karl Smesko','Atlanta Dream'],['Tyler Marsh','Chicago Sky'],['Rachid Meziane','Connecticut Sun'],['José Fernández','Dallas Wings'],['Natalie Nakase','Golden State Valkyries'],['Stephanie White','Indiana Fever'],['Becky Hammon','Las Vegas Aces'],['Lynne Roberts','Los Angeles Sparks'],['Cheryl Reeve','Minnesota Lynx'],['Chris DeMarco','New York Liberty'],['Nate Tibbetts','Phoenix Mercury'],['Alex Sarama','Portland Fire'],['Sonia Raman','Seattle Storm'],['Sandy Brondello','Toronto Tempo'],['Sydney Johnson','Washington Mystics']
  ];
  const staticIndex=[
    ['Around the W','Section','/around-the-w.html','current season standings teams games'],['Live Stats','Stats','/live-stats.html','standings conference playoff leaders'],['Games','Schedule','/games.html','scores schedule broadcast tv'],['Player Movement','Roster','/player-movement.html','trades waived signed transactions'],['Availability Report','Roster','/availability-report.html','injury questionable out availability'],
    ['Playerpedia','Players','/playerpedia.html','players bios grades stats'],['Herstory','Players','/herstory.html','education entrepreneurship community life chapters'],['Shak’s Starting Five','Players','/starting-five.html','monday rotation featured five'],['Shak’s Bench Mob','Players','/bench-mob.html','monday rotation sixth woman roles'],
    ['The W Vault','History','/w-vault.html','history archive film trophy locker'],['The Film Room','Basketball','/film-room.html','offense defense strategy positions'],['Basketball Dictionary','Basketball','/basketball-dictionary.html','terms glossary coach speak'],['The Trophy Room','Awards','/trophy-case.html','championships awards mvp dpoy roy'],['The Locker Room','History','/locker-room.html','uniforms franchise changes retired'],
    ['Courtside Culture','Culture','/courtside-culture.html','coaches mascots owners fans fits'],['Coaches','Coaches','/coaches.html','head coaches court clipboard'],['Owners','Culture','/owners.html','owners governors investors'],['Mascots','Culture','/mascots.html','mascots game day'],
    ['Who Got Next?','Pipeline','/who-got-next.html','college upshot expansion pipeline'],['Class Is in Session','College','/class-is-in-session.html','ncaaw prospects draft radar'],['The Call Up','UPSHOT','/the-call-up.html','upshot standings teams callups'],['Expansion Watch','Expansion','/expansion-watch.html','wnba upshot unrivaled athletes unlimited growth'],
    ['No Offseason','Pro Leagues','/no-offseason.html','unrivaled athletes unlimited winter'],['Unrivaled','Pro Leagues','/unrivaled.html','3 on 3 clubs standings season'],['Athletes Unlimited','Pro Leagues','/athletes-unlimited.html','au leaderboard redraft teams'],['Snack Shak','Articles','/snack-shak.html','weekly rankings analysis commentary'],
    ['League Origins','Franchise','/league-origins.html','original eight inaugural history'],['Franchise Footprints','Franchise','/franchise-footprints.html','cities relocated folded history'],['Franchise Changes','Franchise','/franchise-changes.html','relocations names changes'],['Franchise Family Tree','Franchise','/franchise-family-tree.html','lineage teams history'],['Past Expansion Waves','Franchise','/past-expansion-waves.html','expansion history'],
    ['MVP','Award','/award-mvp.html','most valuable player'],['Defensive Player of the Year','Award','/award-dpoy.html','dpoy defense'],['Most Improved Player','Award','/award-mip.html','mip improvement'],['Sixth Player of the Year','Award','/award-sixth-player.html','bench sixth'],['Rookie of the Year','Award','/award-roy.html','roy rookie'],['Coach of the Year','Award','/award-coy.html','coy coach'],['Commissioner’s Cup','Award','/commissioners-cup.html','commissioners cup'],['All WNBA','Award','/all-wnba.html','all league teams'],['All Defensive','Award','/all-defensive.html','defense teams'],['All Rookie','Award','/all-rookie.html','rookie teams']
  ].map(([title,type,href,keywords])=>({title,type,href,keywords}));
  teams.forEach(([name,slug])=>staticIndex.push({title:name,type:'Team',href:`/team.html?team=${slug}`,keywords:`${name} franchise roster history`}));
  coaches.forEach(([name,team])=>staticIndex.push({title:name,type:'Coach',href:'/coaches.html',keywords:`${name} ${team} head coach`}));

  let players=[];
  let articles=[];
  let dictionary=[];
  let extrasPromise=null;
  async function loadExtras(){
    if(extrasPromise)return extrasPromise;
    extrasPromise=Promise.allSettled([
      fetch('/api/players',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}),
      fetch('/snack-shaq-posts.json',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{}),
      fetch('/basketball-dictionary-page.js',{headers:{Accept:'text/plain'}}).then(r=>r.ok?r.text():'')
    ]).then(results=>{
      const p=results[0].status==='fulfilled'?results[0].value:{};
      players=(Array.isArray(p.players)?p.players:[]).map(x=>({title:x.name,type:'Player',href:`/playerpedia.html?search=${encodeURIComponent(x.name)}`,keywords:`${x.name} ${x.team||''} ${x.position||''}`}));
      const s=results[1].status==='fulfilled'?results[1].value:{};
      articles=(Array.isArray(s.posts)?s.posts:[]).map(x=>({title:x.title,type:'Article',href:`/snack-shak.html?post=${encodeURIComponent(x.slug)}#latest`,keywords:`${x.dek||''} ${x.week||''} ${(x.rankings||[]).map(r=>r.team).join(' ')}`}));
      const text=results[2].status==='fulfilled'?String(results[2].value||''):'';
      const seen=new Set();
      dictionary=[];
      const re=/\{term:'((?:\\'|[^'])+)'/g;let m;
      while((m=re.exec(text))){const term=m[1].replace(/\\'/g,"'");const k=norm(term);if(!k||seen.has(k))continue;seen.add(k);dictionary.push({title:term,type:'Basketball Term',href:`/basketball-dictionary.html?search=${encodeURIComponent(term)}`,keywords:term});}
      return true;
    });
    return extrasPromise;
  }

  function scoreItem(item,q,terms){
    const title=norm(item.title),hay=norm(`${item.title} ${item.type} ${item.keywords||''}`);
    if(!terms.every(term=>hay.includes(term)))return null;
    if(title===q)return 0;
    if(title.startsWith(q))return 1;
    if(title.includes(q))return 2;
    return 3;
  }
  function resultsFor(query){
    const q=norm(query),terms=q.split(/\s+/).filter(Boolean);
    if(q.length<2)return [];
    return [...staticIndex,...players,...articles,...dictionary]
      .map(item=>({item,score:scoreItem(item,q,terms)})).filter(x=>x.score!==null)
      .sort((a,b)=>a.score-b.score||a.item.title.localeCompare(b.item.title)).slice(0,12).map(x=>x.item);
  }
  function renderSearch(query){
    const host=document.getElementById('homeSearchResults');if(!host)return;
    const q=String(query||'').trim();
    if(q.length<2){host.classList.remove('open');host.innerHTML='';return;}
    const matches=resultsFor(q);
    host.classList.add('open');
    host.innerHTML=matches.length?matches.map(item=>`<a class="home-search-result" href="${safe(item.href)}"><span>${safe(item.type)}</span><div><strong>${safe(item.title)}</strong><small>${safe(item.keywords||'Open result')}</small></div><b>→</b></a>`).join(''):`<div class="home-search-empty"><strong>No exact shelf yet.</strong><div>Try a player surname, team, coach, award, basketball term or article topic.</div></div>`;
  }
  const input=document.getElementById('homeSiteSearch'),clear=document.getElementById('homeSearchClear');
  let searchTimer=null;
  input?.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>renderSearch(input.value),70);if(input.value.trim().length>=2)loadExtras().then(()=>renderSearch(input.value));});
  input?.addEventListener('keydown',event=>{if(event.key==='Enter'){const first=document.querySelector('#homeSearchResults .home-search-result');if(first){event.preventDefault();location.href=first.href;}}});
  clear?.addEventListener('click',()=>{input.value='';renderSearch('');input.focus();});
  document.querySelectorAll('[data-home-search-chip]').forEach(button=>button.addEventListener('click',()=>{input.value=button.dataset.homeSearchChip||'';input.focus();loadExtras().then(()=>renderSearch(input.value));renderSearch(input.value);}));

  function gameInstant(game={}){
    const direct=String(game.startTimeUtc||game.timestamp||'').trim();
    if(direct){const iso=direct.includes('T')?direct:direct.replace(' ','T'),zoned=/Z$|[+-]\d{2}:?\d{2}$/i.test(iso),d=new Date(zoned?iso:`${iso}Z`);if(!Number.isNaN(d.getTime()))return d;}
    if(game.date){const d=new Date(`${game.date}T${game.time||'12:00:00Z'}`);if(!Number.isNaN(d.getTime()))return d;}
    return null;
  }
  function gameWhen(game={}){const d=gameInstant(game);if(!d)return game.date||'TBD';return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'2-digit'}).format(d).replace(',','');}
  function gameRankMap(standings=[]){return new Map((standings||[]).map(row=>[norm(row.team?.full_name),Number(row.overall_rank)||99]));}
  function bestGames(payload={}){
    const rows=[...(payload.liveGames||[]),...(payload.upcomingGames||[])];const ranks=gameRankMap(payload.standings);
    return rows.map(game=>({game,quality:(ranks.get(norm(game.homeTeam))||99)+(ranks.get(norm(game.awayTeam))||99),when:gameInstant(game)?.getTime()||Number.MAX_SAFE_INTEGER})).sort((a,b)=>a.quality-b.quality||a.when-b.when).slice(0,3).map(x=>x.game);
  }
  function broadcasts(game={}){return Array.isArray(game.broadcasts)?game.broadcasts.filter(Boolean):[].concat(game.broadcast||game.network||game.tv||[]).flat().filter(Boolean);}
  function milestoneFromPost(post={}){
    const paras=(post.sections||[]).flatMap(section=>section.paragraphs||[]);
    const candidates=paras.filter(p=>/consecutive|record|milestone|career high|first .* player/i.test(p));
    candidates.sort((a,b)=>(/consecutive/i.test(a)?0:1)-(/consecutive/i.test(b)?0:1));
    return candidates[0]||'';
  }

  async function loadThisWeek(){
    const gamesHost=document.getElementById('homeWeekGames'),milestoneHost=document.getElementById('homeWeekMilestone'),broadcastHost=document.getElementById('homeWeekBroadcasts'),snackHost=document.getElementById('homeWeekSnack'),rotationHost=document.getElementById('homeWeekRotations'),stamp=document.getElementById('homeWeekStamp');
    try{
      const [statsR,rotR,snackR]=await Promise.allSettled([
        fetch('/api/stats?season=2026',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch('/rotation-history.json',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch('/snack-shaq-posts.json',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():{})
      ]);
      const stats=statsR.status==='fulfilled'?statsR.value:{};
      const rotations=rotR.status==='fulfilled'?rotR.value:{};
      const snack=snackR.status==='fulfilled'?snackR.value:{};
      const posts=(Array.isArray(snack.posts)?snack.posts:[]).filter(p=>p.type!=='intro').sort((a,b)=>String(b.published||'').localeCompare(String(a.published||'')));
      const latestPost=posts[0]||{};
      const games=bestGames(stats);
      if(gamesHost)gamesHost.innerHTML=games.length?`<div class="week-game-list">${games.map(game=>`<div class="week-game-row"><span>${safe(gameWhen(game))}</span><strong>${safe(game.awayTeam||'TBD')} @ ${safe(game.homeTeam||'TBD')}</strong><b>${safe((broadcasts(game)[0]||game.status||'UPCOMING'))}</b></div>`).join('')}</div><a href="/games.html">Open full schedule →</a>`:'<p>No upcoming games are currently loaded in the live feed.</p><a href="/games.html">Open Games →</a>';
      const upcoming=[...(stats.liveGames||[]),...(stats.upcomingGames||[])];
      const tv=upcoming.filter(game=>broadcasts(game).length).slice(0,3);
      if(broadcastHost)broadcastHost.innerHTML=tv.length?`<div class="week-broadcast-list">${tv.map(game=>`<div class="week-broadcast-row"><span>${safe(broadcasts(game).slice(0,2).join(' · '))}</span><strong>${safe(game.awayTeam||'TBD')} @ ${safe(game.homeTeam||'TBD')}</strong><b>${safe(gameWhen(game))}</b></div>`).join('')}</div><a href="/games.html">All broadcasts →</a>`:'<p>The independent feed has not tagged a national network for the next games yet. The full schedule remains one click away.</p><a href="/games.html">Check broadcasts →</a>';
      const milestone=milestoneFromPost(latestPost);
      if(milestoneHost)milestoneHost.innerHTML=milestone?`<h3>Milestone watch</h3><p>${safe(short(milestone,210))}</p><a href="/stat-kitchen.html">Track the numbers →</a>`:'<h3>Milestone watch</h3><p>Record chases and threshold moments will appear here with the weekly update.</p><a href="/milestone-moments.html">Open Milestone Moments →</a>';
      if(snackHost)snackHost.innerHTML=latestPost.title?`<span class="week-snack-date">Released ${safe(fmtDate(latestPost.published))}</span><strong class="week-snack-title">${safe(latestPost.title)}</strong><p>${safe(short(latestPost.dek,175))}</p><a href="/snack-shak.html?post=${encodeURIComponent(latestPost.slug)}#latest">Read this week’s plate →</a>`:'<p>The next Snack Shak plate is still in the kitchen.</p><a href="/snack-shak.html">Open Snack Shak →</a>';
      const sf=[...(rotations.startingFive||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0];
      const bm=[...(rotations.benchMob||[])].sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0];
      if(rotationHost){const five=(sf?.picks||[]).map(x=>x.name).join(', '),bench=(bm?.picks||[]).map(x=>x.name).join(', ');rotationHost.innerHTML=`<h3>Monday rotations</h3><div class="week-rotation-names"><strong>Starting Five:</strong> ${safe(five||'Next five pending')}<br><strong>Bench Mob:</strong> ${safe(bench||'Next bench pending')}</div><a href="/starting-five.html">Open Starting Five →</a> <a href="/bench-mob.html" style="margin-left:10px">Bench Mob →</a>`;}
      const latestWeek=sf?.week||bm?.week||latestPost.published;
      if(stamp)stamp.textContent=latestWeek?`Week of ${fmtWeek(latestWeek)}`:'This week';
    }catch{
      [gamesHost,milestoneHost,broadcastHost,snackHost,rotationHost].forEach(host=>{if(host)host.innerHTML='<p>Weekly panel is reconnecting to the site feeds.</p>';});
    }
  }

  loadThisWeek();
  window.requestIdleCallback?requestIdleCallback(()=>loadExtras(),{timeout:1800}):setTimeout(()=>loadExtras(),800);
})();