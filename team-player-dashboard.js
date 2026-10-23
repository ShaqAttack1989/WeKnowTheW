(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./team-player-dashboard-model'));
  else {root.WTeamPlayerDashboardPage=factory(root.WTeamPlayerDashboard);root.WTeamPlayerDashboardPage.start();}
})(typeof globalThis==='object'?globalThis:this,function(model){
  'use strict';
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const one=value=>model.number(value)===null?'—':Number(value).toFixed(1);
  const whole=value=>model.number(value)===null?'—':String(Math.round(Number(value)));
  const percent=value=>model.number(value)===null?'—':`${(Number(value)*100).toFixed(1)}%`;
  const link=name=>`/playerpedia.html?view=current&search=${encodeURIComponent(name)}#playerpedia-directory`;
  const SEASON=2026;
  const PERIODS={
    regular:{label:'Regular season',url:`/api/team-player-totals?season=${SEASON}`,source:'Basketball-Reference',sourceUrl:`https://www.basketball-reference.com/wnba/years/${SEASON}_totals.html`},
    playoffs:{label:'Playoffs',url:'/api/team-playoff-player-totals?season='+SEASON,source:'Official WNBA boxscores',sourceUrl:'https://www.wnba.com/stats/players/traditional'}
  };
  function dateLabel(value){
    const date=new Date(value);
    return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(date);
  }
  function request(url,refresh=false){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
    return fetch(url,{headers:{Accept:'application/json'},cache:refresh?'no-store':'default',signal:controller.signal})
      .then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Statistics are temporarily unavailable.');return payload;})
      .finally(()=>clearTimeout(timer));
  }
  function metricFor(player,key,mode){return model.metric(player,key,mode);}
  function summary(players,mode){
    const leaders=[['Top scorer','pts','PTS'],['Top rebounder','trb','REB'],['Top playmaker','ast','AST']];
    return leaders.map(([label,key,unit])=>{
      const player=model.sortPlayers(players,key,mode).find(item=>model.metric(item,key,mode)!==null);
      if(!player)return `<article><span>${label}</span><strong>—</strong><small>No qualifying statistics</small></article>`;
      const value=mode==='totals'?whole(metricFor(player,key,mode)):one(metricFor(player,key,mode));
      return `<article><span>${label}</span><strong><a href="${link(player.name)}">${safe(player.name)}</a></strong><small>${value} ${mode==='totals'?unit:`${unit}/G`}</small></article>`;
    }).join('');
  }
  function statCells(player,mode){
    const stats=[
      ['g',whole(player.g)],['mp',mode==='totals'?one(player.mp):one(player.mpPerGame)],
      ['pts',mode==='totals'?whole(player.pts):one(player.ptsPerGame)],
      ['trb',mode==='totals'?whole(player.trb):one(player.trbPerGame)],
      ['ast',mode==='totals'?whole(player.ast):one(player.astPerGame)],
      ['stl',mode==='totals'?whole(player.stl):one(player.stlPerGame)],
      ['blk',mode==='totals'?whole(player.blk):one(player.blkPerGame)],
      ['fgPct',percent(player.fgPct)],['fg3Pct',percent(player.fg3Pct)],['ftPct',percent(player.ftPct)]
    ];
    return stats.map(([key,value])=>`<td data-stat="${key}">${value}</td>`).join('');
  }
  function tableRows(players,mode){
    if(!players.length)return '<tr><td colspan="11">No player lines match these controls.</td></tr>';
    return players.map(player=>`<tr><th scope="row"><a href="${link(player.name)}">${safe(player.name)}</a></th>${statCells(player,mode)}</tr>`).join('');
  }
  function cards(players,mode){
    if(!players.length)return '';
    return players.map((player,index)=>{
      const stats=[
        ['GP',whole(player.g)],['MIN',mode==='totals'?one(player.mp):one(player.mpPerGame)],
        [mode==='totals'?'PTS':'PTS/G',mode==='totals'?whole(player.pts):one(player.ptsPerGame)],
        [mode==='totals'?'REB':'REB/G',mode==='totals'?whole(player.trb):one(player.trbPerGame)],
        [mode==='totals'?'AST':'AST/G',mode==='totals'?whole(player.ast):one(player.astPerGame)],
        ['FG%',percent(player.fgPct)],['3P%',percent(player.fg3Pct)],['FT%',percent(player.ftPct)]
      ];
      return `<article class="tpd-player-card"><header><a href="${link(player.name)}">${safe(player.name)}</a><span>${index+1} of ${players.length}</span></header><dl>${stats.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></article>`;
    }).join('');
  }
  function start(){
    const section=document.getElementById('team-player-dashboard');
    if(!section)return;
    const params=new URLSearchParams(location.search),slug=params.get('team')||'';
    const club=typeof teamBySlug==='function'?teamBySlug(slug):null;
    if(!club){section.hidden=true;return;}
    const title=document.getElementById('teamPlayerDashboardTitle');
    const intro=document.getElementById('teamPlayerDashboardIntro');
    const status=document.getElementById('tpdStatus');
    const rows=document.getElementById('tpdRows');
    const cardsHost=document.getElementById('tpdPlayerCards');
    const empty=document.getElementById('tpdEmpty');
    const refresh=document.getElementById('tpdRefresh');
    const regular=document.getElementById('tpdRegular');
    const playoffs=document.getElementById('tpdPlayoffs');
    const modeControl=document.getElementById('tpdMode');
    const sortControl=document.getElementById('tpdSort');
    const searchControl=document.getElementById('tpdSearch');
    const cache={regular:null,playoffs:null};
    let period='regular',loading=false,lastAttempt=0;
    title.textContent=`${club.name} player stats`;
    intro.textContent=`Follow each ${club.name} player’s ${SEASON} regular-season and playoff production.`;
    function setSource(payload=cache[period]){
      const fallback=PERIODS[period],sourceName=payload?.source||fallback.source,sourceUrl=payload?.sourceUrl||fallback.sourceUrl;
      document.getElementById('tpdSource').innerHTML='Statistics: <a href="'+safe(sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+safe(sourceName)+'</a>';
    }
    function setHeadings(){
      const mode=modeControl.value;
      document.getElementById('tpdTableCaption').textContent=`Player statistics for the ${SEASON} ${PERIODS[period].label.toLowerCase()}`;
      document.getElementById('tpdMinutesHeading').textContent=mode==='totals'?'MIN':'MIN/G';
      document.getElementById('tpdPtsHeading').textContent=mode==='totals'?'PTS':'PTS/G';
      document.getElementById('tpdRebHeading').textContent=mode==='totals'?'REB':'REB/G';
      document.getElementById('tpdAstHeading').textContent=mode==='totals'?'AST':'AST/G';
      document.getElementById('tpdStlHeading').textContent=mode==='totals'?'STL':'STL/G';
      document.getElementById('tpdBlkHeading').textContent=mode==='totals'?'BLK':'BLK/G';
    }
    function showMessage(heading,detail){
      section.classList.add('is-empty');empty.hidden=false;
      empty.innerHTML=`<strong>${safe(heading)}</strong>${detail?`<p>${safe(detail)}</p>`:''}`;
      rows.innerHTML='<tr><td colspan="11">No player statistics available.</td></tr>';
      cardsHost.innerHTML='';document.getElementById('tpdSummary').innerHTML='';
    }
    function render(payload){
      const built=model.build(club.name,Array.isArray(payload.players)?payload.players:[]);
      const found=model.searchPlayers(built.players,searchControl.value);
      const ordered=model.sortPlayers(found,sortControl.value,modeControl.value);
      const checked=dateLabel(payload.checkedAt||payload.updatedAt);
      const stale=Boolean(payload.stale);
      section.classList.toggle('is-empty',built.players.length===0||ordered.length===0);
      empty.hidden=built.players.length>0&&ordered.length>0;
      setHeadings();
      setSource(payload);
      document.getElementById('tpdUpdated').textContent=stale?'Last confirmed feed shown.':'Refreshes automatically every 30 minutes.';
      if(!built.players.length){
        showMessage(period==='playoffs'?`No ${SEASON} playoff statistics for the ${club.name} yet.`:`No ${SEASON} regular-season statistics for the ${club.name} are available.`,'Players and team totals update from the selected season feed.');
        status.textContent=`${PERIODS[period].label} · no player lines returned${checked?` · checked ${checked}`:''}${stale?' · showing the last saved feed while refresh is unavailable':''}`;
        return;
      }
      if(!ordered.length){
        showMessage('No players match that search.','Clear the search field to see the full team.');
        status.textContent=`No players match the current search · ${PERIODS[period].label}`;
        return;
      }
      rows.innerHTML=tableRows(ordered,modeControl.value);
      cardsHost.innerHTML=cards(ordered,modeControl.value);
      document.getElementById('tpdSummary').innerHTML=summary(ordered,modeControl.value);
      status.textContent=`Showing ${ordered.length} of ${built.players.length} players · ${PERIODS[period].label}${checked?` · checked ${checked}`:''}${stale?' · showing the last saved feed while refresh is unavailable':''}`;
    }
    async function load(force=false){
      if(loading)return;
      const code=model.teamCode(club.name);
      if(!code){section.setAttribute('aria-busy','false');showMessage('Player statistics begin with the first season.','The Cleveland Sirens are building toward their 2028 debut.');status.textContent='No WNBA season stats yet.';refresh.hidden=true;return;}
      const requestedPeriod=period;
      if(cache[requestedPeriod]&&!force){render(cache[requestedPeriod]);return;}
      const hadCurrentCache=Boolean(cache[requestedPeriod]);
      loading=true;lastAttempt=Date.now();refresh.disabled=true;section.setAttribute('aria-busy','true');
      status.textContent=hadCurrentCache?'Refreshing '+PERIODS[requestedPeriod].label.toLowerCase()+' player statistics…':'Loading '+PERIODS[requestedPeriod].label.toLowerCase()+' player statistics…';
      if(!hadCurrentCache){
        section.classList.toggle('is-empty',false);
        empty.hidden=true;
        rows.innerHTML='<tr><td colspan="11">Loading player stats…</td></tr>';
        cardsHost.innerHTML='';
        document.getElementById('tpdSummary').innerHTML='';
      }
      try{
        const feedUrl=requestedPeriod==='playoffs'?`${PERIODS[requestedPeriod].url}&team=${encodeURIComponent(code)}`:PERIODS[requestedPeriod].url;
        const payload=await request(feedUrl,force);
        if(!Array.isArray(payload.players))throw new Error('Incomplete statistics feed.');
        cache[requestedPeriod]=payload;
        if(period===requestedPeriod)render(payload);
      }catch(error){
        if(period===requestedPeriod){
          status.textContent=hadCurrentCache?'Refresh unavailable. The last confirmed player lines remain visible.':'Player statistics are temporarily unavailable.';
          if(hadCurrentCache){cache[requestedPeriod]={...cache[requestedPeriod],stale:true};render(cache[requestedPeriod]);}
          else showMessage('We could not load player statistics.',error.message||'Try Refresh again shortly.');
        }
      }finally{
        loading=false;refresh.disabled=false;section.setAttribute('aria-busy','false');
        if(period!==requestedPeriod)load();
      }
    }
    function setPeriod(next){
      if(next===period)return;
      period=next;regular.setAttribute('aria-pressed',String(period==='regular'));playoffs.setAttribute('aria-pressed',String(period==='playoffs'));
      setHeadings();setSource(cache[period]);
      if(!cache[period]){
        status.textContent='Loading '+PERIODS[period].label.toLowerCase()+' player statistics…';
        section.classList.toggle('is-empty',false);
        empty.hidden=true;
        rows.innerHTML='<tr><td colspan="11">Loading player stats…</td></tr>';
        cardsHost.innerHTML='';
        document.getElementById('tpdSummary').innerHTML='';
      }
      load();
    }
    regular.addEventListener('click',()=>setPeriod('regular'));
    playoffs.addEventListener('click',()=>setPeriod('playoffs'));
    modeControl.addEventListener('change',()=>{if(cache[period])render(cache[period]);});
    sortControl.addEventListener('change',()=>{if(cache[period])render(cache[period]);});
    searchControl.addEventListener('input',()=>{if(cache[period])render(cache[period]);});
    refresh.addEventListener('click',()=>load(true));
    load();
    setInterval(()=>{if(!document.hidden)load(true);},30*60*1000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastAttempt>=30*60*1000)load(true);});
  }
  return {cards,request,start,tableRows};
});
