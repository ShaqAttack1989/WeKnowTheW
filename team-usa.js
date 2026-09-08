(()=>{
  const hub=document.getElementById('teamUsaHub');
  const kitchenRoots=[...document.querySelectorAll('[data-team-usa-kitchen]')];
  if(!hub&&!kitchenRoots.length)return;

  const byId=id=>document.getElementById(id);
  const safe=value=>String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
  const roundOne=value=>Math.round(Number(value)*10)/10;
  const isNumber=value=>value!==null&&value!==undefined&&Number.isFinite(Number(value));
  const boardOrder=['world-cup','3x3','olympics','americup','qualifying','development'];
  const boardLinks={
    'world-cup':'/fiba-world-cup.html',
    '3x3':'/team-usa-3x3.html',
    olympics:'/team-usa-olympics.html',
    americup:'/team-usa-americup.html',
    qualifying:'/team-usa-qualifying.html',
    development:'/team-usa-development.html'
  };

  let worldCupPromise=null;
  const kitchenPromises=new Map();

  function officialUrl(value){
    try{
      const url=new URL(String(value||''),location.origin);
      const allowed=url.origin===location.origin||url.hostname==='www.usab.com'||url.hostname.endsWith('.fiba.basketball')||url.hostname==='fiba.basketball'||url.hostname==='fiba3x3.basketball'||url.hostname.endsWith('.fiba3x3.basketball');
      return allowed?url.href:'';
    }catch{return '';}
  }

  function localDate(value,withTime=true){
    if(!value)return 'Schedule updating';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return 'Schedule updating';
    const options=withTime
      ?{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}
      :{month:'short',day:'numeric',year:'numeric'};
    return new Intl.DateTimeFormat(undefined,options).format(date);
  }

  function checkedAt(value){
    const date=new Date(value||Date.now());
    if(Number.isNaN(date.getTime()))return 'Checked just now';
    return `Checked ${date.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
  }

  function getWorldCup(force=false){
    if(force)worldCupPromise=null;
    if(!worldCupPromise){
      worldCupPromise=fetch('/api/fiba-world-cup',{headers:{Accept:'application/json'}}).then(async response=>{
        const payload=await response.json().catch(()=>({}));
        if(!response.ok||payload.error)throw new Error(payload.error||'FIBA feed unavailable');
        return payload;
      }).catch(error=>{worldCupPromise=null;throw error;});
    }
    return worldCupPromise;
  }

  function getKitchenPayload(key='',force=false){
    const cacheKey=key||'all';
    if(force)kitchenPromises.delete(cacheKey);
    if(!kitchenPromises.has(cacheKey)){
      const query=key?`?competition=${encodeURIComponent(key)}`:'';
      const promise=fetch(`/api/team-usa-stat-kitchen${query}`,{headers:{Accept:'application/json'}}).then(async response=>{
        const payload=await response.json().catch(()=>({}));
        if(!response.ok||payload.error)throw new Error(payload.error||'Team USA result feed unavailable');
        return payload;
      }).catch(error=>{kitchenPromises.delete(cacheKey);throw error;});
      kitchenPromises.set(cacheKey,promise);
    }
    return kitchenPromises.get(cacheKey);
  }

  function normalizeWorldCupGame(game){
    const homeIsUsa=game?.home?.code==='USA';
    const awayIsUsa=game?.away?.code==='USA';
    if(!homeIsUsa&&!awayIsUsa)return null;
    const rawFor=homeIsUsa?game.homeScore:game.awayScore;
    const rawAgainst=homeIsUsa?game.awayScore:game.homeScore;
    const pointsFor=isNumber(rawFor)?Number(rawFor):null;
    const pointsAgainst=isNumber(rawAgainst)?Number(rawAgainst):null;
    const final=game.status==='final'&&pointsFor!==null&&pointsAgainst!==null;
    return {
      id:String(game.id||`${game.date}-${game.home?.code}-${game.away?.code}`),
      date:game.startTimeUtc||game.date||null,
      opponent:homeIsUsa?(game.away?.name||game.away?.code):(game.home?.name||game.home?.code),
      pointsFor,
      pointsAgainst,
      stage:game.phase||'World Cup',
      tournament:'FIBA Women’s Basketball World Cup',
      status:final?'final':'scheduled',
      result:final?(pointsFor>pointsAgainst?'W':pointsFor<pointsAgainst?'L':'T'):null,
      sourceUrl:game.playerOfGame?.sourceUrl||''
    };
  }

  function worldCupBoard(payload){
    const usaGames=(payload.games||[]).filter(game=>game.home?.code==='USA'||game.away?.code==='USA');
    const latestPogGame=[...usaGames].filter(game=>game.status==='final'&&game.playerOfGame?.player).sort((a,b)=>new Date(b.startTimeUtc||b.date||0)-new Date(a.startTimeUtc||a.date||0))[0]||null;
    const latestPog=latestPogGame?.playerOfGame||null;
    const games=usaGames.map(normalizeWorldCupGame).filter(Boolean).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
    const completed=games.filter(game=>game.status==='final');
    const wins=completed.filter(game=>game.pointsFor>game.pointsAgainst).length;
    const losses=completed.filter(game=>game.pointsFor<game.pointsAgainst).length;
    const pointsFor=completed.reduce((sum,game)=>sum+game.pointsFor,0);
    const pointsAgainst=completed.reduce((sum,game)=>sum+game.pointsAgainst,0);
    const count=completed.length;
    const ppg=count?roundOne(pointsFor/count):null;
    const oppPpg=count?roundOne(pointsAgainst/count):null;
    const margin=count?roundOne((pointsFor-pointsAgainst)/count):null;
    const players=(payload.playerStats||[]).filter(player=>Number(player.gp)>0&&isNumber(player.ppg)).sort((a,b)=>Number(b.ppg)-Number(a.ppg));
    const leader=players[0];
    const nextGame=games.filter(game=>game.status!=='final').sort((a,b)=>new Date(a.date||8640000000000000)-new Date(b.date||8640000000000000))[0]||null;
    const recentGames=[...completed].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,5);
    const source=payload.sources?.stats||payload.sources?.games||payload.sources?.event||'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026';
    return {
      key:'world-cup',
      title:'World Cup Stat Kitchen',
      description:'Live Team USA results, tournament scoring rates and the latest official FIBA Player of the Game from Berlin.',
      href:'/fiba-world-cup.html',
      season:'2026',
      updatedAt:payload.updatedAt,
      refreshMinutes:2,
      sourceStatus:'Official FIBA feed',
      official:Boolean(payload.dataStatus?.liveResults||payload.dataStatus?.livePlayerStats||payload.dataStatus?.liveStandings),
      metrics:[
        {label:'RECORD',value:`${wins}–${losses}`,note:`${count} completed World Cup game${count===1?'':'s'}`},
        {label:'PTS / GAME',value:ppg,note:'USA scoring average'},
        {label:'OPP PTS / GAME',value:oppPpg,note:'USA defensive average'},
        {label:'AVG MARGIN',value:margin,signed:true,note:'Point differential per game'}
      ],
      record:`${wins}–${losses}`,
      gamesPlayed:count,
      pointsForPerGame:ppg,
      pointsAgainstPerGame:oppPpg,
      marginPerGame:margin,
      nextGame,
      recentGames,
      spotlight:latestPog?{
        label:'FIBA PLAYER OF THE GAME',
        value:latestPog.player,
        note:`${latestPog.line||'Official FIBA selection'} · ${latestPogGame?.home?.code==='USA'?'USA vs. '+(latestPogGame?.away?.name||latestPogGame?.away?.code):'USA vs. '+(latestPogGame?.home?.name||latestPogGame?.home?.code)}`
      }:leader?{
        label:'LEADING USA SCORER',
        value:leader.player,
        note:`${Number(leader.ppg).toFixed(1)} points per game through ${leader.gp} game${Number(leader.gp)===1?'':'s'}.`
      }:{
        label:'WORLD TITLES',
        value:String(payload.usa?.worldTitles||11),
        note:'The latest official FIBA Player of the Game fills after USA completes a game.'
      },
      sources:[{label:'Official FIBA World Cup',url:latestPog?.sourceUrl||source,official:true}],
      warnings:payload.dataStatus?.warnings||[]
    };
  }

  async function loadWorldCupPulse(force=false){
    if(!hub)return;
    try{
      const data=await getWorldCup(force);
      const usa=data.usa||{};
      const games=(data.games||[]).filter(game=>game.home?.code==='USA'||game.away?.code==='USA');
      const upcoming=games.filter(game=>game.status!=='final').sort((a,b)=>new Date(a.startTimeUtc||a.date||8640000000000000)-new Date(b.startTimeUtc||b.date||8640000000000000))[0];
      const completed=games.filter(game=>game.status==='final').sort((a,b)=>new Date(b.startTimeUtc||b.date||0)-new Date(a.startTimeUtc||a.date||0))[0];
      const record=byId('usaHubRecord');
      const rank=byId('usaHubRank');
      const pulse=byId('usaHubWorldCupStatus');
      const updated=byId('usaHubUpdated');

      if(record)record.textContent=`${usa.wins||0}-${usa.losses||0}`;
      if(rank)rank.textContent=`#${usa.worldRank||1}`;
      if(pulse){
        if(upcoming){
          const opponent=upcoming.home?.code==='USA'?upcoming.away:upcoming.home;
          pulse.innerHTML=`<small>NEXT USA GAME</small><strong>USA vs ${safe(opponent?.code||'TBD')}</strong><span>${safe(localDate(upcoming.startTimeUtc))}</span>`;
        }else if(completed){
          pulse.innerHTML='<small>WORLD CUP STATUS</small><strong>USA schedule live</strong><span>Open the dashboard for the latest bracket.</span>';
        }
      }
      if(updated)updated.textContent=`FIBA feed ${checkedAt(data.updatedAt).toLowerCase()}`;
    }catch{
      const updated=byId('usaHubUpdated');
      if(updated)updated.textContent='Open the World Cup dashboard for official live updates';
    }
  }

  function metricValue(metric){
    if(!isNumber(metric.value))return safe(metric.value??'—');
    const value=Number(metric.value);
    const display=Number.isInteger(value)?String(value):value.toFixed(1);
    return `${metric.signed&&value>0?'+':''}${display}`;
  }

  function sourceLinks(board){
    const seen=new Set();
    return (board.sources||[]).map(source=>{
      const url=officialUrl(source.url);
      if(!url||seen.has(url))return '';
      seen.add(url);
      return `<a href="${safe(url)}" target="_blank" rel="noopener">${safe(source.label)} ↗</a>`;
    }).join('');
  }

  function gameRow(game,next=false){
    const url=officialUrl(game.sourceUrl);
    const tag=url?'a':'article';
    const attributes=url?` href="${safe(url)}" target="_blank" rel="noopener"`:'';
    const label=next?'NEXT':game.result||'FINAL';
    const score=next
      ?`USA vs. ${safe(game.opponent)}`
      :`USA ${safe(game.pointsFor)}, ${safe(game.opponent)} ${safe(game.pointsAgainst)}`;
    return `<${tag} class="team-usa-kitchen-game ${next?'is-next':''}"${attributes}><div><small>${safe(label)} · ${safe(localDate(game.date,next))}</small><strong>${score}</strong><span>${safe(game.tournament||'Team USA')} · ${safe(game.stage||'Schedule')}</span></div><b>${safe(next?'UP NEXT':game.result||'FINAL')}</b></${tag}>`;
  }

  function spotlightRecords(board){
    if(!(board.sourceRecords||[]).length)return '';
    return `<div class="team-usa-kitchen-records">${board.sourceRecords.map(item=>{
      const url=officialUrl(item.sourceUrl);
      const content=`<span>${safe(item.label)}</span><b>${safe(item.record)}</b><small>${safe(item.season)} · ${safe(item.gamesPlayed)} game${Number(item.gamesPlayed)===1?'':'s'}</small>`;
      return url?`<a href="${safe(url)}" target="_blank" rel="noopener">${content}</a>`:`<div>${content}</div>`;
    }).join('')}</div>`;
  }

  function renderBoard(root,board){
    root.setAttribute('aria-busy','false');
    const games=[board.nextGame?gameRow(board.nextGame,true):'',...(board.recentGames||[]).slice(0,4).map(item=>gameRow(item))].filter(Boolean).join('');
    root.innerHTML=`
      <header class="team-usa-kitchen-head">
        <div><p>THE STAT KITCHEN · ${safe(board.season)} SERVING</p><h2>${safe(board.title)}</h2><span>${safe(board.description)}</span></div>
        <div class="team-usa-kitchen-status ${board.official?'is-live':''}"><i></i><b>${safe(board.sourceStatus)}</b><small>${safe(checkedAt(board.updatedAt))}</small></div>
      </header>
      <div class="team-usa-kitchen-metrics">${(board.metrics||[]).map(metric=>`<article><small>${safe(metric.label)}</small><strong>${metricValue(metric)}</strong><span>${safe(metric.note)}</span></article>`).join('')}</div>
      <div class="team-usa-kitchen-body">
        <section class="team-usa-kitchen-results" aria-label="Recent Team USA results"><div class="team-usa-kitchen-subhead"><div><small>RECENT PLATES</small><h3>Latest official results</h3></div><span>${safe(board.gamesPlayed)} games counted</span></div><div class="team-usa-kitchen-games">${games||'<p class="team-usa-kitchen-empty">The official schedule has not posted its next serving yet.</p>'}</div></section>
        <aside class="team-usa-kitchen-spotlight"><small>HOT PLATE · ${safe(board.spotlight?.label||'LATEST')}</small><strong>${safe(board.spotlight?.value||'Schedule pending')}</strong><p>${safe(board.spotlight?.note||'This card updates with the official result feed.')}</p>${spotlightRecords(board)}</aside>
      </div>
      <footer class="team-usa-kitchen-foot"><p>Final scores are pulled from the official USA Basketball or FIBA feed. The rates recalculate automatically as new results are posted.</p><div>${sourceLinks(board)}</div></footer>`;
  }

  function hubCard(board){
    const href=boardLinks[board.key]||board.href||'/team-usa.html';
    const margin=isNumber(board.marginPerGame)?`${Number(board.marginPerGame)>0?'+':''}${Number(board.marginPerGame).toFixed(1)}`:'—';
    const ppg=isNumber(board.pointsForPerGame)?Number(board.pointsForPerGame).toFixed(1):'—';
    return `<a class="team-usa-kitchen-program-card ${board.key==='world-cup'?'is-live':''}" href="${safe(href)}"><div><small>${safe(board.season)} · ${safe(board.key==='development'?'JUNIOR TEAMS':board.key.replace('-',' ').toUpperCase())}</small><span>${board.official?'OFFICIAL FEED':'AUTO RETRY ON'}</span></div><h3>${safe(board.title)}</h3><strong>${safe(board.record)}</strong><p>${safe(ppg)} PTS / GAME · ${safe(margin)} AVG MARGIN</p><b>OPEN KITCHEN →</b></a>`;
  }

  function renderHub(root,boards,updatedAt){
    root.setAttribute('aria-busy','false');
    const ordered=boards.sort((a,b)=>boardOrder.indexOf(a.key)-boardOrder.indexOf(b.key));
    root.innerHTML=`
      <header class="team-usa-kitchen-head">
        <div><p>THE STAT KITCHEN · EVERY TEAM USA COURT</p><h2>The whole program, one counter.</h2><span>Open any competition for its record, scoring pace, defensive rate, margin and latest official results.</span></div>
        <div class="team-usa-kitchen-status is-live"><i></i><b>USA Basketball + FIBA</b><small>${safe(checkedAt(updatedAt))}</small></div>
      </header>
      <div class="team-usa-kitchen-program-grid">${ordered.map(hubCard).join('')}</div>
      <footer class="team-usa-kitchen-foot"><p>Each kitchen refreshes from its competition’s official result feed and preserves a verified snapshot if that source pauses.</p><div><a href="https://www.usab.com/" target="_blank" rel="noopener">USA Basketball ↗</a><a href="https://www.fiba.basketball/en/events" target="_blank" rel="noopener">FIBA Events ↗</a></div></footer>`;
  }

  function renderError(root,error){
    root.setAttribute('aria-busy','false');
    root.innerHTML=`<div class="team-usa-kitchen-error"><p>THE STAT KITCHEN</p><h2>The burner is reconnecting.</h2><span>${safe(error.message||'The official result feed is temporarily unavailable.')} The verified competition pages remain available.</span></div>`;
  }

  async function loadKitchen(root,force=false){
    const key=root.dataset.teamUsaKitchen;
    root.setAttribute('aria-busy','true');
    try{
      if(key==='world-cup'){
        renderBoard(root,worldCupBoard(await getWorldCup(force)));
        return;
      }
      if(key==='hub'){
        const [teamPayload,worldPayload]=await Promise.all([getKitchenPayload('',force),getWorldCup(force)]);
        const boards=[worldCupBoard(worldPayload),...Object.values(teamPayload.boards||{})];
        renderHub(root,boards,teamPayload.updatedAt||worldPayload.updatedAt);
        return;
      }
      const payload=await getKitchenPayload(key,force);
      const board=payload.boards?.[key];
      if(!board)throw new Error('This competition board is not available yet.');
      renderBoard(root,board);
    }catch(error){renderError(root,error);}
  }

  loadWorldCupPulse();
  kitchenRoots.forEach(root=>{
    loadKitchen(root);
    const key=root.dataset.teamUsaKitchen;
    const refresh=key==='world-cup'?2*60*1000:15*60*1000;
    window.setInterval(()=>{if(!document.hidden)loadKitchen(root,true);},refresh);
  });
  if(hub)window.setInterval(()=>{if(!document.hidden)loadWorldCupPulse(true);},2*60*1000);
})();
