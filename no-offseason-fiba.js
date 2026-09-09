(()=>{
  const root=document.getElementById('fibaWorldCupHub');
  if(!root)return;

  const $=id=>document.getElementById(id);
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const num=(value,digits=1)=>Number.isFinite(Number(value))?Number(value).toFixed(digits):'—';
  const pct=value=>Number.isFinite(Number(value))?`${Number(value).toFixed(1)}%`:'—';
  const phaseLabel=game=>game.group?`Group ${game.group}`:(game.phase||'Knockout');
  const TOURNAMENT_START=Date.parse('2026-09-04T00:00:00+02:00');
  const TOURNAMENT_END=Date.parse('2026-09-14T02:00:00+02:00');
  const LIVE_REFRESH_MS=60*1000;
  const IDLE_REFRESH_MS=15*60*1000;

  let gameFilter='all';
  let standingsMode='overall';
  let latestData=null;
  let refreshTimer=null;
  let refreshing=false;

  function localTime(iso){
    if(!iso)return 'TBD';
    const date=new Date(iso);
    if(Number.isNaN(date.getTime()))return 'TBD';
    return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(date);
  }

  function longDate(dateValue){
    const date=new Date(`${dateValue}T12:00:00Z`);
    return new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(date);
  }

  function tournamentIsActive(){
    const now=Date.now();
    return now>=TOURNAMENT_START&&now<=TOURNAMENT_END;
  }

  function refreshInterval(){
    return tournamentIsActive()?LIVE_REFRESH_MS:IDLE_REFRESH_MS;
  }

  function statusCopy(data){
    const status=data.dataStatus||{};
    if(status.livePlayerStats)return ['LIVE FIBA STATS','Official World Cup player statistics are connected and auto-refreshing.'];
    if(String(status.standingsSource||'').startsWith('derived-'))return ['OFFICIAL RESULTS CONNECTED','Group W/L, points and order are calculated from FIBA’s completed-game feed.'];
    if(status.liveResults)return ['RESULTS CONNECTED','Official FIBA results and standings are auto-refreshing.'];
    if(status.liveStandings)return ['FIBA CONNECTED','Official standings are auto-refreshing. World Cup player stats will appear after USA tips off.'];
    return ['TOURNAMENT READY','Verified schedule and groups are loaded. Live box-score stats will populate when World Cup play begins.'];
  }

  function renderHeader(data){
    const [label,copy]=statusCopy(data);
    const refreshLabel=tournamentIsActive()?'Auto-refresh: every 60 seconds':'Auto-refresh: every 15 minutes until tipoff';
    $('fibaDataStatus').innerHTML=`<span>${safe(label)}</span><small>${safe(copy)}</small><small class="fiba-updated" id="fibaUpdated">Dashboard refresh: ${safe(new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'}).format(new Date(data.updatedAt)))} · ${safe(refreshLabel)}</small>`;
    const usa=data.usa||{};
    $('fibaUsaRecord').textContent=`${usa.wins||0}-${usa.losses||0}`;
    $('fibaUsaGroup').textContent=`Group ${usa.group||'D'}`;
    $('fibaUsaRank').textContent=`#${usa.worldRank||1}`;
    $('fibaUsaTitles').textContent=`${usa.worldTitles||11}`;
  }

  function renderUsaSchedule(data){
    const games=(data.games||[]).filter(game=>game.home?.code==='USA'||game.away?.code==='USA');
    const wrap=$('fibaUsaSchedule');
    if(!games.length){wrap.innerHTML='<p class="fiba-empty">USA fixtures are loading from FIBA.</p>';return;}
    wrap.innerHTML=games.map(game=>{
      const opponent=game.home.code==='USA'?game.away:game.home;
      const home=game.home.code==='USA';
      const final=game.status==='final';
      const live=game.status==='live';
      const result=final||live?(home?`${game.homeScore}-${game.awayScore}`:`${game.awayScore}-${game.homeScore}`):'vs';
      const pog=game.playerOfGame||null;
      const pogHtml=final?`<div class="fiba-usa-potg ${pog?'is-ready':'is-pending'}"><span>${safe(pog?.flag||'🏀')}</span><div><small>FIBA PLAYER OF THE GAME</small><strong>${safe(pog?.player||'Official selection pending')}</strong>${pog?.line?`<em>${safe(pog.line)}</em>`:''}</div></div>`:'';
      return `<article class="fiba-usa-game ${final?'is-final':live?'is-live':''}">
        <div class="fiba-game-date"><b>${safe(longDate(game.date||'2026-09-04'))}</b><span>${safe(game.timeBerlin||'TBD')} Berlin · ${safe(localTime(game.startTimeUtc))}</span></div>
        <div class="fiba-game-match"><span class="fiba-flag">🇺🇸</span><strong>USA</strong><em>${safe(result)}</em><span class="fiba-flag">${safe(opponent.flag||'')}</span><strong>${safe(opponent.code)}</strong></div>
        <small>${home?'USA listed first':'USA listed second'} · ${safe(phaseLabel(game))}</small>
        ${pogHtml}
      </article>`;
    }).join('');
  }

  function standingsPct(value){
    const n=Number(value);
    if(!Number.isFinite(n))return '—';
    return n.toFixed(3).replace(/^0/,'');
  }

  function standingsDiff(value){
    const n=Number(value);
    if(!Number.isFinite(n))return '—';
    return `${n>0?'+':''}${n.toFixed(1)}`;
  }

  function scoreClass(value){
    const n=Number(value);
    if(!Number.isFinite(n))return 'is-empty';
    if(n>=80)return 'is-elite';
    if(n>=65)return 'is-strong';
    if(n>=50)return 'is-mid';
    return 'is-low';
  }

  function compositeRow(team,{groupMode=false}={}){
    const wins=groupMode?team.groupWins:team.wins;
    const losses=groupMode?team.groupLosses:team.losses;
    const winPct=groupMode?team.groupWinPercentage:team.winPercentage;
    const pointsFor=groupMode?team.groupPointsFor:team.pointsFor;
    const pointsAgainst=groupMode?team.groupPointsAgainst:team.pointsAgainst;
    const diff=groupMode?team.groupDiffPerGame:team.diffPerGame;
    const streak=groupMode?team.groupStreak:team.streak;
    const form=groupMode?team.groupForm:team.form;
    const rank=groupMode?team.groupPosition:team.overallRank;
    const score=Number.isFinite(Number(team.wScore))?Number(team.wScore).toFixed(1):'—';
    const eliminated=Boolean(team.eliminated);
    const eliminationBadge=eliminated?`<b class="fiba-eliminated-badge" title="${safe(team.eliminationLabel||'Eliminated from the World Cup')}" aria-label="${safe(team.eliminationLabel||'Eliminated from the World Cup')}">E</b>`:'';
    return `<div class="fiba-live-standings-row ${team.code==='USA'?'team-usa':''} ${eliminated?'is-eliminated':''}">
      <span class="fiba-live-rank">${safe(rank||'—')}</span>
      <span class="fiba-live-team"><i>${safe(team.flag||'')}</i><strong>${safe(team.code)}</strong><small><span class="fiba-live-team-name">${safe(team.name)}</span>${eliminationBadge}</small></span>
      <span class="fiba-w-score ${scoreClass(team.wScore)}"><b>${safe(score)}</b><small>W · #${safe(team.overallRank||'—')}</small></span>
      <strong>${safe(wins??'—')}</strong>
      <strong>${safe(losses??'—')}</strong>
      <span>${safe(standingsPct(winPct))}</span>
      <span>G${safe(team.group||'—')}</span>
      <span>${safe(team.groupPoints??'—')}</span>
      <span>${safe(pointsFor??'—')}</span>
      <span>${safe(pointsAgainst??'—')}</span>
      <span class="${Number(diff)>0?'is-positive':Number(diff)<0?'is-negative':''}">${safe(standingsDiff(diff))}</span>
      <span class="fiba-form-streak ${String(streak).startsWith('W')?'is-positive':String(streak).startsWith('L')?'is-negative':''}">${safe(streak||'—')}</span>
      <span class="fiba-form-cell">${safe(form||'—')}</span>
    </div>`;
  }

  function compositeTable(rows,{groupMode=false}={}){
    if(!rows.length)return '<p class="fiba-empty">Tournament standings are loading from FIBA.</p>';
    return `<div class="fiba-live-standings-table">
      <div class="fiba-live-standings-row head"><span>#</span><span>TEAM</span><span>W SCORE</span><span>W</span><span>L</span><span>PCT</span><span>GRP</span><span>PTS</span><span>PF</span><span>PA</span><span>+/-</span><span>STREAK</span><span>FORM</span></div>
      ${rows.map(team=>compositeRow(team,{groupMode})).join('')}
    </div>`;
  }

  function renderStandings(data){
    const wrap=$('fibaCompositeStandings');
    if(!wrap)return;
    const rows=Array.isArray(data.tournamentTable)?data.tournamentTable:[];
    const overallButton=document.querySelector('[data-fiba-standings-mode="overall"]');
    const groupsButton=document.querySelector('[data-fiba-standings-mode="groups"]');
    const groupMode=standingsMode==='groups';

    overallButton?.classList.toggle('active',!groupMode);
    overallButton?.setAttribute('aria-pressed',String(!groupMode));
    groupsButton?.classList.toggle('active',groupMode);
    groupsButton?.setAttribute('aria-pressed',String(groupMode));

    if(groupMode){
      wrap.innerHTML=['A','B','C','D'].map(group=>{
        const groupRows=rows.filter(team=>team.group===group).sort((a,b)=>(a.groupPosition||99)-(b.groupPosition||99));
        return `<section class="fiba-live-group"><header><span>GROUP ${group}</span><small>Official group position · W score stays field-wide</small></header>${compositeTable(groupRows,{groupMode:true})}</section>`;
      }).join('');
    }else{
      wrap.innerHTML=compositeTable(rows);
    }

    const completed=(data.games||[]).filter(game=>game.status==='final').length;
    const eliminated=rows.filter(team=>team.eliminated).length;
    const status=$('fibaCompositeStatus');
    if(status)status.textContent=`${rows.length||16} countries · ${completed} completed games · ${eliminated} eliminated · W score refreshes automatically from completed World Cup results`;
  }

  function renderLeaders(data){
    const wrap=$('fibaAllPlayerLeaders');
    if(!wrap)return;
    const categories=Array.isArray(data.statLeaders)?data.statLeaders:[];
    if(!categories.length){
      wrap.innerHTML='<p class="fiba-empty">Official FIBA tournament leaders are loading.</p>';
      return;
    }
    wrap.innerHTML=categories.map(category=>`<article class="fiba-leader-card">
      <header><div><span>${safe(category.key||'STAT').toUpperCase()}</span><strong>${safe(category.label||category.marker||'Leader')}</strong></div><b>${safe(category.unit||'')}</b></header>
      <div class="fiba-leader-list">${(category.leaders||[]).length?(category.leaders||[]).map((leader,index)=>`<div class="fiba-leader-row ${index===0?'is-first':''}">
        <span class="fiba-leader-rank">${index+1}</span>
        <span class="fiba-leader-player"><i>${safe(leader.flag||'')}</i><strong>${safe(leader.player||'')}</strong><small>${safe(leader.countryCode||leader.country||'')}</small></span>
        <span class="fiba-leader-value"><b>${safe(num(leader.value))}</b><small>${safe(category.unit||'')}</small></span>
      </div>`).join(''):'<p class="fiba-leader-empty">FIBA is refreshing this category.</p>'}</div>
    </article>`).join('');
    const status=$('fibaLeadersStatus');
    if(status){
      const live=Boolean(data.dataStatus?.liveLeagueLeaders);
      status.textContent=live?'Official FIBA field-wide leaders connected · refreshes with the World Cup':'FIBA leader feed partially connected · available categories shown';
    }
  }

  function makeFilterButtons(data){
    const filters=[['all','All Games'],['usa','Team USA'],['A','Group A'],['B','Group B'],['C','Group C'],['D','Group D'],['knockout','Knockout']];
    $('fibaGameFilters').innerHTML=filters.map(([value,label])=>`<button type="button" data-fiba-filter="${safe(value)}" class="${gameFilter===value?'active':''}">${safe(label)}</button>`).join('');
    $('fibaGameFilters').querySelectorAll('[data-fiba-filter]').forEach(button=>button.addEventListener('click',()=>{
      gameFilter=button.dataset.fibaFilter;
      makeFilterButtons(data);
      renderGames(data);
    }));
  }

  function gameVisible(game){
    if(gameFilter==='all')return true;
    if(gameFilter==='usa')return game.home?.code==='USA'||game.away?.code==='USA';
    if(gameFilter==='knockout')return !game.group;
    return game.group===gameFilter;
  }

  function renderGames(data){
    const wrap=$('fibaGamesGrid');
    const games=(data.games||[]).filter(gameVisible);
    const cards=games.map(game=>{
      const final=game.status==='final';
      const live=game.status==='live';
      const scored=final||live;
      const pog=game.playerOfGame||null;
      const pogHtml=final?`<div class="fiba-game-potg ${pog?'is-ready':'is-pending'}">
        <span class="fiba-potg-flag">${safe(pog?.flag||'🏀')}</span>
        <div><small>FIBA PLAYER OF THE GAME</small><strong>${safe(pog?.player||'Official selection pending')}</strong>${pog?.line?`<em>${safe(pog.line)}</em>`:''}</div>
      </div>`:'';
      const resultUrl=pog?.sourceUrl||game.sourceUrl||'';
      const homeLabel=game.home?.code==='TBD'?(game.home?.name||'TBD'):(game.home?.code||'TBD');
      const awayLabel=game.away?.code==='TBD'?(game.away?.name||'TBD'):(game.away?.code||'TBD');
      return `<article class="fiba-game-card ${final?'is-final':live?'is-live':''} ${game.home?.code==='USA'||game.away?.code==='USA'?'has-usa':''}" data-game-id="${safe(game.id||'')}" data-game-date="${safe(game.date||'')}">
        <div class="fiba-game-card-top"><span>${safe(phaseLabel(game))}</span><b>${final?'FINAL':live?'LIVE':safe(game.date?longDate(game.date):'TBD')}</b></div>
        <div class="fiba-match-line"><span>${safe(game.home?.flag||'')} <strong>${safe(homeLabel)}</strong></span><em>${scored?safe(game.homeScore):''}</em></div>
        <div class="fiba-match-line"><span>${safe(game.away?.flag||'')} <strong>${safe(awayLabel)}</strong></span><em>${scored?safe(game.awayScore):''}</em></div>
        ${pogHtml}
        <footer>${final?(resultUrl?`<a href="${safe(resultUrl)}" target="_blank" rel="noopener">Official FIBA result${pog?' + POG':''} ↗</a>`:'Official FIBA result'):live?`Live · ${safe(game.livePeriod||'in progress')} ${safe(game.liveClock||'')}`:`${safe(game.timeBerlin||'TBD')} Berlin${game.startTimeUtc?` · ${safe(localTime(game.startTimeUtc))}`:''}`}</footer>
      </article>`;
    });

    if(gameFilter==='all'||gameFilter==='knockout'){
      (data.knockoutRounds||[]).forEach(round=>{
        const officialCount=(data.games||[]).filter(game=>!game.group&&game.date===round.date&&(game.phase===round.phase||(round.phase==='Medal Games'&&['3PG','F'].includes(game.roundCode)))).length;
        const remaining=Math.max(0,Number(round.games||0)-officialCount);
        if(remaining)cards.push(`<article class="fiba-game-card knockout-placeholder"><div class="fiba-game-card-top"><span>KNOCKOUT</span><b>${safe(longDate(round.date))}</b></div><strong>${safe(round.phase)}</strong><p>${safe(remaining)} matchup${remaining===1?'':'s'} will populate as the bracket is set.</p></article>`);
      });
    }
    wrap.innerHTML=cards.length?cards.join(''):'<p class="fiba-empty">No games match this filter.</p>';
  }

  function renderStats(data){
    const rows=data.playerStats||[];
    const maxPpg=Math.max(0,...rows.map(row=>Number(row.ppg)||0));
    const body=$('fibaPlayerStatsBody');
    body.innerHTML=rows.map(row=>`<tr class="${Number(row.ppg)>0&&Number(row.ppg)===maxPpg?'stat-leader':''}">
      <th scope="row"><span>${safe(row.player)}</span><small>🇺🇸 USA</small></th>
      <td>${safe(row.gp||0)}</td><td>${row.mpg==null?'—':num(row.mpg)}</td><td>${row.ppg==null?'—':num(row.ppg)}</td><td>${safe(row.pts||0)}</td>
      <td>${safe(row.fg||'—')}</td><td>${pct(row.fgPct)}</td><td>${safe(row.three||'—')}</td><td>${pct(row.threePct)}</td><td>${pct(row.ftPct)}</td>
    </tr>`).join('');
    const live=Boolean(data.dataStatus?.livePlayerStats);
    $('fibaStatsMode').innerHTML=live?'<b>WORLD CUP LIVE</b><span>Tournament stats · auto-refreshing</span>':'<b>PRE-TOURNAMENT</b><span>GP stays 0 and rates stay — until USA plays</span>';
    $('fibaQualifierForm').innerHTML=(data.qualifyingForm||[]).map(item=>`<span><b>${safe(item.player)}</b><small>${safe(item.label)}</small></span>`).join('');
  }

  function renderRoster(data){
    $('fibaUsaRoster').innerHTML=(data.usa?.roster||[]).map(player=>`<span>🇺🇸 ${safe(player)}</span>`).join('');
    $('fibaRosterNote').textContent=data.rosterStatus||'';
  }

  function renderWarnings(data){
    const warnings=data.dataStatus?.warnings||[];
    $('fibaFeedNotes').innerHTML=warnings.length?warnings.map(w=>`<span>${safe(w)}</span>`).join(''):'<span>Official FIBA sources connected. Dashboard refreshes automatically.</span>';
  }

  function render(data){
    latestData=data;
    renderHeader(data);
    renderUsaSchedule(data);
    renderStandings(data);
    renderLeaders(data);
    makeFilterButtons(data);
    renderGames(data);
    renderStats(data);
    renderRoster(data);
    renderWarnings(data);
    root.classList.add('fiba-loaded');
    root.classList.remove('fiba-error');
  }

  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>loadDashboard({silent:true}),refreshInterval());
  }

  async function loadDashboard({silent=false}={}){
    if(refreshing){scheduleRefresh();return;}
    if(document.hidden){scheduleRefresh();return;}
    refreshing=true;
    try{
      const response=await fetch(`/api/fiba-world-cup?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      if(!response.ok)throw new Error(`FIBA dashboard returned ${response.status}`);
      const data=await response.json();
      render(data);
    }catch(error){
      if(!silent||!latestData){
        $('fibaDataStatus').innerHTML='<span>FIBA SOURCE LINK READY</span><small>The dashboard feed could not refresh. Use the official FIBA schedule below.</small>';
        $('fibaFeedNotes').innerHTML=`<span>${safe(error.message)}</span>`;
        root.classList.add('fiba-error');
      }
    }finally{
      refreshing=false;
      scheduleRefresh();
    }
  }

  document.querySelectorAll('[data-fiba-standings-mode]').forEach(button=>button.addEventListener('click',()=>{
    standingsMode=button.dataset.fibaStandingsMode||'overall';
    if(latestData)renderStandings(latestData);
  }));

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)loadDashboard({silent:true});
  });
  window.addEventListener('focus',()=>loadDashboard({silent:true}));

  loadDashboard();
})();
