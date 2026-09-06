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
    if(status.standingsSource==='derived-from-results')return ['RESULTS AHEAD OF TABLE','Official final scores are connected. Group W/L and points are being calculated from those results until FIBA’s standings table catches up.'];
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
      const result=game.status==='final'?`${game.homeScore}-${game.awayScore}`:'vs';
      const pog=game.playerOfGame||null;
      const pogHtml=game.status==='final'?`<div class="fiba-usa-potg ${pog?'is-ready':'is-pending'}"><span>${safe(pog?.flag||'🏀')}</span><div><small>FIBA PLAYER OF THE GAME</small><strong>${safe(pog?.player||'Official selection pending')}</strong>${pog?.line?`<em>${safe(pog.line)}</em>`:''}</div></div>`:'';
      return `<article class="fiba-usa-game ${game.status==='final'?'is-final':''}">
        <div class="fiba-game-date"><b>${safe(longDate(game.date||'2026-09-04'))}</b><span>${safe(game.timeBerlin||'TBD')} Berlin · ${safe(localTime(game.startTimeUtc))}</span></div>
        <div class="fiba-game-match"><span class="fiba-flag">🇺🇸</span><strong>USA</strong><em>${safe(result)}</em><span class="fiba-flag">${safe(opponent.flag||'')}</span><strong>${safe(opponent.code)}</strong></div>
        <small>${home?'USA listed first':'USA listed second'} · ${safe(phaseLabel(game))}</small>
        ${pogHtml}
      </article>`;
    }).join('');
  }

  function renderStandings(data){
    const wrap=$('fibaStandingsGrid');
    wrap.innerHTML=(data.standings||[]).map(group=>`<section class="fiba-group-card ${group.group==='D'?'usa-group':''}">
      <header><span>GROUP ${safe(group.group)}</span>${group.group==='D'?'<b>USA GROUP</b>':''}</header>
      <div class="fiba-group-head"><span>Team</span><span>W</span><span>L</span><span>PTS</span></div>
      ${(group.teams||[]).map(team=>`<div class="fiba-group-row ${team.code==='USA'?'team-usa':''}">
        <span><b>${safe(team.rank)}.</b> <i>${safe(team.flag||'')}</i> <strong>${safe(team.code)}</strong><small>${safe(team.name)}</small></span>
        <span>${safe(team.wins)}</span><span>${safe(team.losses)}</span><span>${safe(team.points)}</span>
      </div>`).join('')}
    </section>`).join('');
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
      const pog=game.playerOfGame||null;
      const pogHtml=final?`<div class="fiba-game-potg ${pog?'is-ready':'is-pending'}">
        <span class="fiba-potg-flag">${safe(pog?.flag||'🏀')}</span>
        <div><small>FIBA PLAYER OF THE GAME</small><strong>${safe(pog?.player||'Official selection pending')}</strong>${pog?.line?`<em>${safe(pog.line)}</em>`:''}</div>
      </div>`:'';
      return `<article class="fiba-game-card ${final?'is-final':''} ${game.home?.code==='USA'||game.away?.code==='USA'?'has-usa':''}" data-game-id="${safe(game.id||'')}" data-game-date="${safe(game.date||'')}">
        <div class="fiba-game-card-top"><span>${safe(phaseLabel(game))}</span><b>${final?'FINAL':safe(game.date?longDate(game.date):'TBD')}</b></div>
        <div class="fiba-match-line"><span>${safe(game.home?.flag||'')} <strong>${safe(game.home?.code||'TBD')}</strong></span><em>${final?safe(game.homeScore):''}</em></div>
        <div class="fiba-match-line"><span>${safe(game.away?.flag||'')} <strong>${safe(game.away?.code||'TBD')}</strong></span><em>${final?safe(game.awayScore):''}</em></div>
        ${pogHtml}
        <footer>${final?(pog?.sourceUrl?`<a href="${safe(pog.sourceUrl)}" target="_blank" rel="noopener">Official FIBA result + POG ↗</a>`:'Official FIBA result'):`${safe(game.timeBerlin||'TBD')} Berlin${game.startTimeUtc?` · ${safe(localTime(game.startTimeUtc))}`:''}`}</footer>
      </article>`;
    });

    if(gameFilter==='all'||gameFilter==='knockout'){
      (data.knockoutRounds||[]).forEach(round=>{
        cards.push(`<article class="fiba-game-card knockout-placeholder"><div class="fiba-game-card-top"><span>KNOCKOUT</span><b>${safe(longDate(round.date))}</b></div><strong>${safe(round.phase)}</strong><p>${safe(round.games)} games · matchups populate as the bracket is set.</p></article>`);
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
      const response=await fetch('/api/fiba-world-cup',{headers:{Accept:'application/json'}});
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

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)loadDashboard({silent:true});
  });
  window.addEventListener('focus',()=>loadDashboard({silent:true}));

  loadDashboard();
})();
