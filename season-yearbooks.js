(()=>{
  const CURRENT_SEASON=new Date().getFullYear();
  const FIRST_SEASON=1997;
  const EDITORIAL_START=2026;
  const trophy=window.TROPHY_DATA||{};
  const selections=window.TROPHY_SELECTION_HISTORY||{};
  const feeds=['/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];
  const teamNames={
    ATL:'Atlanta Dream',CHA:'Charlotte Sting',CHI:'Chicago Sky',CLE:'Cleveland Rockers',CON:'Connecticut Sun',DAL:'Dallas Wings',DET:'Detroit Shock',GSV:'Golden State Valkyries',HOU:'Houston Comets',IND:'Indiana Fever',LAS:'Los Angeles Sparks',LVA:'Las Vegas Aces',MIA:'Miami Sol',MIN:'Minnesota Lynx',NYL:'New York Liberty',ORL:'Orlando Miracle',PHO:'Phoenix Mercury',POR:'Portland Fire',SAC:'Sacramento Monarchs',SAS:'San Antonio',SEA:'Seattle Storm',TUL:'Tulsa Shock',UTA:'Utah Starzz',WAS:'Washington Mystics',TOR:'Toronto Tempo'
  };
  const mvp={1997:'Cynthia Cooper',1998:'Cynthia Cooper',1999:'Yolanda Griffith',2000:'Sheryl Swoopes',2001:'Lisa Leslie',2002:'Sheryl Swoopes',2003:'Lauren Jackson',2004:'Lisa Leslie',2005:'Sheryl Swoopes',2006:'Lisa Leslie',2007:'Lauren Jackson',2008:'Candace Parker',2009:'Diana Taurasi',2010:'Lauren Jackson',2011:'Tamika Catchings',2012:'Tina Charles',2013:'Candace Parker',2014:'Maya Moore',2015:'Elena Delle Donne',2016:'Nneka Ogwumike',2017:'Sylvia Fowles',2018:'Breanna Stewart',2019:'Elena Delle Donne',2020:"A'ja Wilson",2021:'Jonquel Jones',2022:"A'ja Wilson",2023:'Breanna Stewart',2024:"A'ja Wilson",2025:"A'ja Wilson"};
  const roy={1998:'Tracy Reid',1999:'Chamique Holdsclaw',2000:'Betty Lennox',2001:'Jackie Stiles',2002:'Tamika Catchings',2003:'Cheryl Ford',2004:'Diana Taurasi',2005:'Temeka Johnson',2006:'Seimone Augustus',2007:'Armintie Price',2008:'Candace Parker',2009:'Angel McCoughtry',2010:'Tina Charles',2011:'Maya Moore',2012:'Nneka Ogwumike',2013:'Elena Delle Donne',2014:'Chiney Ogwumike',2015:'Jewell Loyd',2016:'Breanna Stewart',2017:'Allisha Gray',2018:"A'ja Wilson",2019:'Napheesa Collier',2020:'Crystal Dangerfield',2021:'Michaela Onyenwere',2022:'Rhyne Howard',2023:'Aliyah Boston',2024:'Caitlin Clark',2025:'Paige Bueckers'};

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const number=value=>Number.isFinite(Number(value))?Number(value):null;
  const pct=value=>number(value)===null?'—':Number(value).toFixed(3);
  const selected=()=>{const q=Number.parseInt(new URLSearchParams(location.search).get('season')||'',10);return Number.isInteger(q)&&q>=FIRST_SEASON&&q<=CURRENT_SEASON?q:CURRENT_SEASON;};
  const isCurrent=year=>year===CURRENT_SEASON;
  const seasonOpen=year=>isCurrent(year)&&new Date()<new Date(`${year}-11-15T00:00:00`);
  const playerHref=name=>`/playerpedia.html?search=${encodeURIComponent(name)}#playerpedia-directory`;
  const teamName=value=>teamNames[String(value||'').toUpperCase()]||String(value||'Unknown team');
  const formatDate=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};

  function seasonUrl(year){return `/season-yearbooks.html?season=${year}`;}
  function shelf(year){
    const box=document.getElementById('yearbookShelf');if(!box)return;
    const years=[];for(let y=CURRENT_SEASON;y>=FIRST_SEASON;y--)years.push(y);
    box.innerHTML=years.map(y=>`<a class="yearbook-spine ${isCurrent(y)?'live':''} ${y===year?'active':''}" href="${seasonUrl(y)}" ${y===year?'aria-current="page"':''}><span>${isCurrent(y)?'LIVE BOOK':'ARCHIVED'}</span><strong>${y}</strong><span>${isCurrent(y)?'STILL WRITING':'SHELVED'}</span></a>`).join('');
  }
  async function getJson(url){
    const response=await fetch(`${url}${url.includes('?')?'&':'?'}cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  }
  async function frozenSnapshot(year){
    if(isCurrent(year))return null;
    try{return await getJson(`/data/season-yearbooks/${year}.json`);}catch{return null;}
  }
  function championFor(year,snapshot=null){
    if(snapshot?.champion)return snapshot.champion;
    return (trophy.champions||[]).find(item=>Number(item.year)===Number(year))||null;
  }
  function inferFinalsChampion(competition={}){
    const games=Array.isArray(competition?.playoffs?.games)?competition.playoffs.games.filter(g=>g.completed):[];
    if(!games.length)return null;
    const latest=[...games].sort((a,b)=>String(b.date||b.startTimeUtc).localeCompare(String(a.date||a.startTimeUtc)))[0];
    if(!latest)return null;
    const pair=[latest.homeTeam,latest.awayTeam].sort();
    const finalsGames=games.filter(g=>[g.homeTeam,g.awayTeam].sort().join('|')===pair.join('|'));
    const wins=new Map(pair.map(t=>[t,0]));
    finalsGames.forEach(g=>{const hs=number(g.homeScore),as=number(g.awayScore);if(hs===null||as===null||hs===as)return;const winner=hs>as?g.homeTeam:g.awayTeam;wins.set(winner,(wins.get(winner)||0)+1);});
    const sorted=[...wins.entries()].sort((a,b)=>b[1]-a[1]);
    if((sorted[0]?.[1]||0)<3)return null;
    return {year:String(CURRENT_SEASON),champion:sorted[0][0],runnerUp:sorted[1][0],result:`${sorted[0][1]} to ${sorted[1][1]}`,finalsMvp:null};
  }
  function standingsPanel(stats={}){
    const rows=Array.isArray(stats.standings)?stats.standings:[];
    if(!rows.length)return emptyPanel('standings','FINAL STANDINGS','Standings','Verified standings are not available from the historical feed for this season yet.');
    return `<section class="yearbook-panel wide" id="standings"><div class="yearbook-panel-head"><div><span>${seasonOpen(stats.season)?'LIVE TABLE':'FINAL TABLE'}</span><h3>Standings</h3></div><a href="/live-stats.html">Live Stats →</a></div><div class="yearbook-table-scroll"><div class="yearbook-table"><div class="yearbook-row head"><span>TEAM</span><span>W</span><span>L</span><span>PCT</span><span>GB</span></div>${rows.map((r,i)=>`<div class="yearbook-row"><strong><i class="yearbook-rank">${r.overall_rank||i+1}</i>${safe(r.team?.full_name||r.team||'Team')}</strong><span>${safe(r.wins??'—')}</span><span>${safe(r.losses??'—')}</span><span>${pct(r.win_percentage)}</span><span>${number(r.games_back)===0?'—':safe(r.games_back??'—')}</span></div>`).join('')}</div></div></section>`;
  }
  function qualifiedPlayers(payload={}){
    const all=Array.isArray(payload.players)?payload.players:[];
    const qualified=all.filter(p=>!p.provisional&&number(p.games)!==null);
    return qualified.length>=10?qualified:all;
  }
  function leaderFor(players,field){return [...players].filter(p=>number(p[field])!==null).sort((a,b)=>number(b[field])-number(a[field]))[0]||null;}
  function leadersPanel(payload={}){
    const players=qualifiedPlayers(payload),cats=[['PPG','ppg'],['RPG','rpg'],['APG','apg'],['SPG','spg'],['BPG','bpg']];
    if(!players.length)return emptyPanel('leaders','STAT LEADERS','League leaders','Historical player statistics are temporarily unavailable.');
    return `<section class="yearbook-panel wide" id="leaders"><div class="yearbook-panel-head"><div><span>LEAGUE LEADERS</span><h3>Who owned the columns</h3></div><a href="/stat-kitchen.html">Stat Kitchen →</a></div><div class="leader-columns">${cats.map(([label,field])=>{const p=leaderFor(players,field);return p?`<article class="leader-card"><span>${label}</span><strong><a href="${playerHref(p.name)}">${safe(p.name)}</a></strong><p>${safe(teamName(p.team))}</p><b>${number(p[field]).toFixed(1)}</b></article>`:'';}).join('')}</div></section>`;
  }
  function rostersPanel(payload={}){
    const players=Array.isArray(payload.players)?payload.players:[];
    if(!players.length)return emptyPanel('rosters','ROSTERS','Season rosters','Historical roster data is temporarily unavailable.');
    const groups=new Map();
    players.forEach(p=>{const team=teamName(p.team);if(!team||/\d+TM/i.test(team))return;if(!groups.has(team))groups.set(team,[]);groups.get(team).push(p);});
    const entries=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    return `<section class="yearbook-panel wide" id="rosters"><div class="yearbook-panel-head"><div><span>ROSTER BOOK</span><h3>Who suited up</h3></div><a href="/playerpedia.html">Playerpedia →</a></div><div class="roster-grid">${entries.map(([team,list])=>`<article class="roster-team"><h4>${safe(team)}</h4><ul>${list.sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<li><a href="${playerHref(p.name)}">${safe(p.name)}</a>${p.position?` · ${safe(p.position)}`:''}</li>`).join('')}</ul></article>`).join('')}</div></section>`;
  }
  function allWnba(year){return (selections.allWnba||[]).find(item=>Number(item.year)===Number(year))||null;}
  function awardsPanel(year,champion,live){
    const first=allWnba(year)?.first||[];
    const cards=[];
    if(champion){cards.push(['WNBA CHAMPION',champion.champion,`${champion.result||''}${champion.runnerUp?` over ${champion.runnerUp}`:''}`]);if(champion.finalsMvp)cards.push(['FINALS MVP',champion.finalsMvp,champion.champion]);}
    else cards.push(['WNBA CHAMPION',live?'Still to be decided':'Not available','The championship chapter is still open.']);
    cards.push(['LEAGUE MVP',mvp[year]||(live?'Award still open':'Not available'),'Regular season']);
    cards.push(['ROOKIE OF THE YEAR',roy[year]||(year===1997?'Award began in 1998':live?'Award still open':'Not available'),'Rookie honor']);
    return `<section class="yearbook-panel" id="awards"><div class="yearbook-panel-head"><div><span>HARDWARE</span><h3>Awards + champion</h3></div><a href="/trophy-case.html">Trophy Room →</a></div><div class="award-grid">${cards.map(([label,name,note])=>`<article class="yearbook-award"><span>${safe(label)}</span><strong>${safe(name)}</strong><p>${safe(note)}</p></article>`).join('')}</div>${first.length?`<div class="yearbook-note"><strong>All-WNBA First Team:</strong> ${first.map(safe).join(' · ')}</div>`:''}</section>`;
  }
  function transactionPanel(items=[],year){
    if(!items.length)return emptyPanel('transactions','MAJOR MOVEMENT','Transactions','A reliable transaction highlight list is not available for this season. Nothing is being invented to fill the space.');
    return `<section class="yearbook-panel" id="transactions"><div class="yearbook-panel-head"><div><span>MAJOR MOVEMENT</span><h3>Transactions</h3></div>${isCurrent(year)?'<a href="/player-movement.html">Player Movement →</a>':''}</div><div class="transaction-list">${items.slice(0,12).map(item=>`<article class="transaction-row"><time>${safe(formatDate(item.date))}</time><div><strong>${safe(item.player||item.type||'Transaction')}</strong><p>${safe(item.detail||item.description||'Roster move')}</p></div></article>`).join('')}</div></section>`;
  }
  function rankingPanel(post,year){
    if(year<EDITORIAL_START)return editorialEmpty('snack-shak','SNACK SHAK RANKINGS','Snack Shak final rankings',year);
    const rankings=Array.isArray(post?.rankings)?post.rankings:[];
    if(!rankings.length)return emptyPanel('snack-shak','SNACK SHAK RANKINGS','Snack Shak rankings','No published Snack Shak ranking board was found for this season.');
    return `<section class="yearbook-panel" id="snack-shak"><div class="yearbook-panel-head"><div><span>${seasonOpen(year)?'LATEST BOARD':'FINAL PUBLISHED BOARD'}</span><h3>Snack Shak rankings</h3></div><a href="/snack-shak.html">Snack Shak →</a></div><div class="ranking-list">${rankings.slice(0,10).map(item=>`<div class="ranking-row"><b>${safe(item.rank)}</b><strong>${safe(item.team)}</strong><span>${safe(item.movement||'')}</span></div>`).join('')}</div><p class="yearbook-note"><strong>${safe(post.title||'Published ranking')}</strong><br>${safe(formatDate(post.published))}</p></section>`;
  }
  function rotationPanel(history={},year){
    if(year<EDITORIAL_START)return editorialEmpty('shak-rotation','SHAK’S ROTATION','Starting Five + Bench Mob',year);
    const start=(history.startingFive||[]).filter(x=>String(x.week||'').startsWith(String(year))).sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0];
    const bench=(history.benchMob||[]).filter(x=>String(x.week||'').startsWith(String(year))).sort((a,b)=>String(b.week).localeCompare(String(a.week)))[0];
    if(!start&&!bench)return emptyPanel('shak-rotation','SHAK’S ROTATION','Starting Five + Bench Mob','No published Shak rotation was found for this season.');
    return `<section class="yearbook-panel" id="shak-rotation"><div class="yearbook-panel-head"><div><span>${seasonOpen(year)?'CURRENT ROTATION':'FINAL PUBLISHED ROTATION'}</span><h3>Starting Five + Bench Mob</h3></div><a href="/starting-five.html">Rotations →</a></div><div class="rotation-columns"><article class="rotation-column"><h4>Shak’s Starting Five</h4>${start?`<ol>${start.picks.map(p=>`<li><a href="${playerHref(p.name)}">${safe(p.name)}</a> · ${safe(p.role||p.label||'')}</li>`).join('')}</ol>`:'<p>No Starting Five was published.</p>'}</article><article class="rotation-column"><h4>Shak’s Bench Mob</h4>${bench?`<ol>${bench.picks.map(p=>`<li><a href="${playerHref(p.name)}">${safe(p.name)}</a> · ${safe(p.role||'')}</li>`).join('')}</ol>`:'<p>No Bench Mob was published.</p>'}</article></div><p class="yearbook-note"><strong>Last rotation in this book:</strong> ${safe(formatDate(start?.week||bench?.week||''))}</p></section>`;
  }
  function emptyPanel(id,kicker,title,text){return `<section class="yearbook-panel" id="${id}"><div class="yearbook-panel-head"><div><span>${kicker}</span><h3>${title}</h3></div></div><div class="yearbook-empty">${safe(text)}</div></section>`;}
  function editorialEmpty(id,kicker,title,year){return `<section class="yearbook-panel" id="${id}"><div class="yearbook-panel-head"><div><span>${kicker}</span><h3>${title}</h3></div></div><div class="yearbook-empty">We Know the W’s editorial archive begins in ${EDITORIAL_START}. No retrospective Shak ranking or rotation is being backfilled into ${year} as though it existed at the time.</div></section>`;}
  async function snackRanking(year){
    if(year<EDITORIAL_START)return null;
    const results=await Promise.allSettled(feeds.map(getJson)),bySlug=new Map();
    results.forEach(result=>{if(result.status==='fulfilled'&&Array.isArray(result.value.posts))result.value.posts.forEach(post=>{if(post?.slug)bySlug.set(post.slug,post);});});
    return [...bySlug.values()].filter(post=>String(post.published||'').startsWith(String(year))&&Array.isArray(post.rankings)&&post.rankings.length).sort((a,b)=>String(b.published).localeCompare(String(a.published))||Number(b.priority||0)-Number(a.priority||0))[0]||null;
  }
  function snapshotTransactions(snapshot){return Array.isArray(snapshot?.transactions)?snapshot.transactions:[];}
  function snapshotStats(snapshot){return snapshot?.stats||null;}
  function snapshotPlayers(snapshot){return snapshot?.players||null;}
  function renderStatus(year,snapshot,stats){
    const box=document.getElementById('yearbookStatus');if(!box)return;
    const live=seasonOpen(year);const frozen=Boolean(snapshot?.frozen);
    const updated=snapshot?.frozenAt||stats?.updatedAt||new Date().toISOString();
    box.innerHTML=`<span class="yearbook-status ${live?'live':''}"><i></i>${live?'LIVE YEARBOOK':frozen?'FROZEN ARCHIVE':'ARCHIVED SEASON'}</span><span class="yearbook-updated">${frozen?'Frozen':'Checked'} ${safe(new Date(updated).toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}))}</span>`;
  }
  function renderCover(year,champion,stats,live){
    const box=document.getElementById('yearbookCover');if(!box)return;
    const leader=stats?.standings?.[0];
    box.innerHTML=`<article class="yearbook-cover-main"><span>${live?'THE SEASON IS STILL WRITING':'THE BOOK IS CLOSED'}</span><h2>${year}</h2><p>${live?'This yearbook refreshes with the current standings, roster and stat feeds. The editorial boards update with We Know the W. When the season closes, the record is preserved as history.':'A season record designed to stay put: final standings, the players who were there, the leaders, the hardware and the moves that shaped the year.'}</p></article><aside class="yearbook-cover-side"><span>${champion?'CHAMPIONSHIP COVER':'SEASON SNAPSHOT'}</span><strong>${safe(champion?.champion||leader?.team?.full_name||'Season in progress')}</strong><p>${champion?`${safe(champion.result||'Finals winner')}${champion.runnerUp?` over ${safe(champion.runnerUp)}`:''}`:leader?`${safe(leader.wins)}-${safe(leader.losses)} · current No. 1`:'The season record is loading.'}</p></aside>`;
  }

  async function load(){
    const year=selected();shelf(year);document.title=`${year} · The W Rewind | We Know the W`;
    const snapshot=await frozenSnapshot(year);
    const live=seasonOpen(year);
    const requests=[];
    requests.push(snapshotStats(snapshot)?Promise.resolve(snapshotStats(snapshot)):getJson(`/api/stats?season=${year}`));
    requests.push(snapshotPlayers(snapshot)?Promise.resolve(snapshotPlayers(snapshot)):getJson(`/api/player-season-snapshot?season=${year}`));
    requests.push(snapshot?Promise.resolve({transactions:snapshotTransactions(snapshot)}):isCurrent(year)?getJson('/api/player-movement'):getJson(`/api/yearbook-transactions?season=${year}`));
    requests.push(snapshot?.rotationHistory?Promise.resolve(snapshot.rotationHistory):getJson('/rotation-history.json'));
    requests.push(snapshot?.snackRanking?Promise.resolve(snapshot.snackRanking):snackRanking(year));
    requests.push(snapshot?.competition?Promise.resolve(snapshot.competition):isCurrent(year)?getJson(`/api/competition?season=${year}`):Promise.resolve(null));
    const [statsR,playersR,txR,rotationR,snackR,competitionR]=await Promise.allSettled(requests);
    const stats=statsR.status==='fulfilled'?statsR.value:{season:year,standings:[]};
    const players=playersR.status==='fulfilled'?playersR.value:{season:year,players:[]};
    const tx=txR.status==='fulfilled'?txR.value:{transactions:[]};
    const rotation=rotationR.status==='fulfilled'?rotationR.value:{};
    const snack=snackR.status==='fulfilled'?snackR.value:null;
    const competition=competitionR.status==='fulfilled'?competitionR.value:null;
    const champion=championFor(year,snapshot)||inferFinalsChampion(competition);
    renderStatus(year,snapshot,stats);renderCover(year,champion,stats,live);
    const panels=document.getElementById('yearbookPanels');
    panels.innerHTML=[standingsPanel({...stats,season:year}),rostersPanel(players),leadersPanel(players),awardsPanel(year,champion,live),transactionPanel(tx.transactions||[],year),rankingPanel(snack,year),rotationPanel(rotation,year)].join('');
    const sourceSet=new Set([stats.source,players.source,tx.source].filter(Boolean));
    document.getElementById('yearbookSources').textContent=`Season ${year} sources: ${[...sourceSet].join(' · ')||'We Know the W verified historical feeds'}. ${snapshot?.frozen?'This season is served from a frozen yearbook snapshot.':live?'Current-season information refreshes from connected feeds.':'Completed-season records are displayed as archival history and are eligible for frozen snapshots.'}`;
  }
  load().catch(error=>{const panels=document.getElementById('yearbookPanels');if(panels)panels.innerHTML=`<div class="yearbook-panel wide"><div class="yearbook-empty">The season book could not open: ${safe(error.message)}. Try again shortly.</div></div>`;});
})();
