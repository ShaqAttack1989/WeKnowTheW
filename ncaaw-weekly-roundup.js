(()=>{
  'use strict';
  const games=[
    {date:'2026-11-18',day:'Wed, Nov. 18',away:'Ole Miss',awayScore:57,home:'Ohio State',homeScore:60,tag:'Ranked matchup',note:'Jaloni Cambridge: 27 points, 12 rebounds. Ole Miss had a last-second three-point try to force overtime.',url:'https://ohiostatebuckeyes.com/news/2026/11/19/womens-basketball-buckeyes-hold-off-rebels-for-ranked-win',source:'Ohio State recap'},
    {date:'2026-11-19',day:'Thu, Nov. 19',away:'Texas Tech',awayScore:47,home:'North Carolina',homeScore:61,tag:'WBCA Showcase',note:'Kate Harpring: 28 points and five steals, tying the Showcase record.',url:'https://wbca.org/news/north-carolina-defeats-texas-tech-at-2026-wbca-showcase/',source:'WBCA official recap'},
    {date:'2026-11-20',day:'Fri, Nov. 20',away:'Seton Hall',awayScore:43,home:'UConn',homeScore:83,tag:'BIG EAST opener',note:'Jovana Popovic: 20 points on 8-for-11 shooting. UConn’s regular-season BIG EAST streak reached 59.',url:'https://uconnhuskies.com/news/2026/11/20/womens-basketball-no-7-huskies-beat-seton-hall-in-big-east-opener',source:'UConn official recap'},
    {date:'2026-11-22',day:'Sun, Nov. 22',away:'Seattle',awayScore:78,home:'Louisville',homeScore:97,tag:'Tournament final',note:'Louisville won the Great Alaska Shootout; Carys Baker scored a season-high 24.',url:'https://gocards.com/news/2026/11/22/womens-basketball-cards-defeat-seattle-to-win-great-alaska-shootout-97-78',source:'Louisville official recap'},
    {date:'2026-11-22',day:'Sun, Nov. 22',away:'Ohio State',awayScore:61,home:'Texas',homeScore:75,tag:'Ranked matchup',note:'Breya Cunningham: 24 points, 13 rebounds and her 1,000th career point. Jaloni Cambridge scored 27 for Ohio State.',url:'https://texaslonghorns.com/news/2026/11/22/womens-basketball-no-6-womens-basketball-defeats-no-19-ohio-state-75-61-in-lonestar-series',source:'Texas official recap'},
    {date:'2026-11-22',day:'Sun, Nov. 22',away:'Tennessee',awayScore:80,home:'UCLA',homeScore:90,tag:'Top-10 result',note:'KK Bransford scored 25 and Elina Aarnisalo added 22; Kaylene Smikle had 27 points and 10 rebounds.',url:'https://uclabruins.com/news/2026/11/22/no-10-bruins-hold-off-lady-vols-in-knoxville-90-80',source:'UCLA official recap'}
  ];
  const rankings=[
    {rank:1,team:'South Carolina',record:'6–0',previous:1},
    {rank:2,team:'Michigan',record:'5–0',previous:2},
    {rank:3,team:'Louisville',record:'9–0',previous:7},
    {rank:4,team:'USC',record:'4–1',previous:3},
    {rank:5,team:'Duke',record:'6–0',previous:5},
    {rank:6,team:'Texas',record:'6–0',previous:6},
    {rank:7,team:'UConn',record:'4–2',previous:4},
    {rank:8,team:'Iowa',record:'5–1',previous:10},
    {rank:9,team:'LSU',record:'6–0',previous:9},
    {rank:10,team:'UCLA',record:'6–0',previous:10}
  ];
  const metricNames={pointsPerGame:'Points per game',totalPoints:'Total points',reboundsPerGame:'Rebounds per game',assistsPerGame:'Assists per game',stealsPerGame:'Steals per game',blocksPerGame:'Blocks per game'};
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function renderScores(){
    const day=$('weeklyScoreDate')?.value||'all', query=norm($('weeklyScoreTeam')?.value||'');
    const rows=games.filter(game=>(day==='all'||game.date===day)&&(!query||norm(game.away+' '+game.home+' '+game.note).includes(query)));
    const root=$('weeklyScoreCards');
    root.innerHTML=rows.map(game=>{
      const awayWin=game.awayScore>game.homeScore;
      return '<article class="roundup-score-card"><div class="roundup-score-meta"><time datetime="'+esc(game.date)+'">'+esc(game.day)+'</time><span class="roundup-score-tag">'+esc(game.tag)+'</span></div><div class="roundup-score-line"><span class="roundup-score-team '+(awayWin?'winner':'')+'">'+esc(game.away)+(awayWin?' <span aria-label="winner">✓</span>':'')+'</span><span class="roundup-score-value">'+game.awayScore+'</span><span class="roundup-score-team '+(!awayWin?'winner':'')+'">'+esc(game.home)+(!awayWin?' <span aria-label="winner">✓</span>':'')+'</span><span class="roundup-score-value">'+game.homeScore+'</span></div><p class="roundup-score-note">'+esc(game.note)+'</p><a href="'+esc(game.url)+'" target="_blank" rel="noopener noreferrer">'+esc(game.source)+' ↗</a></article>';
    }).join('')||'<p class="roundup-empty">No featured results match those filters.</p>';
    $('weeklyScoreCount').textContent='Showing '+rows.length+' of '+games.length+' featured results';
  }
  function renderRanks(){
    const movement=$('rankMovement')?.value||'all', query=norm($('rankTeam')?.value||'');
    const rows=rankings.filter(item=>{
      const delta=item.previous-item.rank;
      const trend=delta>0?'up':delta<0?'down':'same';
      return (movement==='all'||movement===trend)&&(!query||norm(item.team).includes(query));
    });
    $('rankRows').innerHTML=rows.map(item=>{
      const delta=item.previous-item.rank;
      let movementText='— No change', movementClass='rank-same';
      if(delta>0){movementText='↑ '+delta+' '+(delta===1?'place':'places');movementClass='rank-up'}
      if(delta<0){movementText='↓ '+Math.abs(delta)+' '+(Math.abs(delta)===1?'place':'places');movementClass='rank-down'}
      return '<tr><td>No. '+item.rank+'</td><td>'+esc(item.team)+'</td><td>'+esc(item.record)+'</td><td class="roundup-rank-move '+movementClass+'">'+movementText+'</td></tr>';
    }).join('')||'<tr><td colspan="4">No teams match those filters.</td></tr>';
    $('rankCount').textContent='Showing '+rows.length+' of '+rankings.length+' teams';
  }
  function statsMap(entry){const map={};for(const stat of entry?.stats||[])map[stat.name]=stat.displayValue??stat.value;return map}
  function findGroups(node,out=[],parentName=''){
    if(!node||typeof node!=='object')return out;
    if(Array.isArray(node)){node.forEach(item=>findGroups(item,out,parentName));return out}
    if(Array.isArray(node.entries)&&node.entries.some(entry=>entry.team)){
      const own=node.name||node.abbreviation||'';
      out.push({name:/^overall$/i.test(own)?(parentName||'Division I'):own||parentName||'Division I',entries:node.entries});
      return out;
    }
    const next=node.name&&!/^overall$/i.test(node.name)?node.name:(node.abbreviation||parentName);
    for(const [key,value] of Object.entries(node))if(key!=='entries'&&value&&typeof value==='object')findGroups(value,out,next);
    return out;
  }
  function renderConference(data){
    const select=$('conferenceSelect'), root=$('conferenceTable');
    const source=data?.standings;
    const groups=findGroups(source?.children||source?.standings||source);
    if(!groups.length){select.innerHTML='<option value="">No conference feed</option>';root.innerHTML='<p class="ncaaw-empty">Conference standings are not available from the live feed right now.</p>';return}
    groups.sort((a,b)=>a.name.localeCompare(b.name));
    const previous=select.value;
    select.innerHTML=groups.map(group=>'<option value="'+esc(group.name)+'">'+esc(group.name)+'</option>').join('');
    const preferred=groups.find(group=>/^(SEC|Southeastern)( Conference)?$/i.test(group.name));
    select.value=groups.some(group=>group.name===previous)?previous:(preferred?.name||groups[0].name);
    const group=groups.find(item=>item.name===select.value)||groups[0];
    const teams=group.entries.map(entry=>({team:entry.team||{},stats:statsMap(entry)})).sort((a,b)=>Number(b.stats.winPercent||b.stats.winningPercentage||0)-Number(a.stats.winPercent||a.stats.winningPercentage||0)||Number(b.stats.wins||0)-Number(a.stats.wins||0)||String(a.team.displayName||a.team.name||'').localeCompare(String(b.team.displayName||b.team.name||'')));
    root.innerHTML='<table class="roundup-live-table"><caption class="roundup-sr-only">'+esc(group.name)+' standings</caption><thead><tr><th scope="col">Team</th><th scope="col">Conf.</th><th scope="col">Overall</th></tr></thead><tbody>'+teams.map(row=>'<tr><td>'+esc(row.team.displayName||row.team.name||'Team')+'</td><td>'+esc(row.stats.wins??'—')+'–'+esc(row.stats.losses??'—')+'</td><td>'+esc(row.stats.overall??row.stats.overallRecord??row.stats.record??'—')+'</td></tr>').join('')+'</tbody></table>';
  }
  function renderLeaders(data){
    const leaders=data?.leaders||{};
    const metric=window.roundupLeaderMetric||'pointsPerGame';
    const rows=leaders[metric]||[];
    $('leaderMetricLabel').textContent=metricNames[metric]||'Player leaders';
    $('leaderRows').innerHTML=rows.length?rows.map((player,index)=>{
      const playerName=esc(player.name||'Player');
      const profile=String(player.profileUrl||'');
      const safeProfile=/^https:\/\/www\.espn\.com\//.test(profile)?'<a href="'+esc(profile)+'" target="_blank" rel="noopener noreferrer">'+playerName+'</a>':playerName;
      return '<article class="roundup-leader-row"><span class="roundup-leader-rank">'+esc(player.rank||index+1)+'</span><span class="roundup-leader-player"><strong>'+safeProfile+'</strong><small>'+esc(player.team||'Division I')+(player.gamesPlayed?' · '+esc(player.gamesPlayed)+' GP':'')+'</small></span><span class="roundup-leader-value">'+esc(player.displayValue||'—')+'</span></article>';
    }).join(''):'<p class="ncaaw-empty">This leaderboard is unavailable from the live feed. Use the NCAA stats link or refresh shortly.</p>';
  }
  let busy=false,latestData=null;
  async function refreshLive(){
    if(busy)return;
    busy=true;
    const button=$('roundupRefresh');
    button.disabled=true;
    $('roundupLiveStatus').textContent='Refreshing Division I standings and player leaders…';
    try{
      const response=await fetch('/api/ncaaw-stat-kitchen?cb='+Date.now(),{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('Live feed unavailable');
      latestData=await response.json();
      renderConference(latestData);
      renderLeaders(latestData);
      const updated=new Date(latestData.updatedAt);
      const stamp=Number.isNaN(updated.getTime())?'just now':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(updated)+' ET';
      $('roundupLiveStatus').textContent='Dynamic · refreshed '+stamp+' · '+(latestData.source||'ESPN Division I data');
    }catch(error){
      $('roundupLiveStatus').textContent='Live feed is temporarily unavailable; the weekly scoreboard and poll panels remain dated snapshots.';
      $('conferenceTable').innerHTML='<p class="ncaaw-error">Standings could not be loaded. Try Refresh now or open the NCAA standings link.</p>';
      $('leaderRows').innerHTML='<p class="ncaaw-error">Player leaders could not be loaded. Try Refresh now or open the NCAA statistics link.</p>';
    }finally{
      busy=false;
      button.disabled=false;
    }
  }
  $('weeklyScoreDate').addEventListener('change',renderScores);
  $('weeklyScoreTeam').addEventListener('input',renderScores);
  $('rankMovement').addEventListener('change',renderRanks);
  $('rankTeam').addEventListener('input',renderRanks);
  $('conferenceSelect').addEventListener('change',()=>latestData&&renderConference(latestData));
  document.querySelectorAll('[data-leader-key]').forEach(button=>button.addEventListener('click',()=>{
    window.roundupLeaderMetric=button.dataset.leaderKey;
    document.querySelectorAll('[data-leader-key]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    if(latestData)renderLeaders(latestData);
  }));
  $('roundupRefresh').addEventListener('click',refreshLive);
  renderScores();
  renderRanks();
  refreshLive();
  window.setInterval(refreshLive,10*60*1000);
})();