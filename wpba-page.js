(()=>{
  const DATA_URL='/data/wpba-2026.json';
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
  const formatDate=value=>{
    const date=new Date(value);
    return Number.isNaN(date.valueOf())?'Date pending':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
  };
  const teamMap=new Map();
  const teamColor=name=>teamMap.get(name)?.color||'#6f2cff';
  const teamStyle=name=>`--team-color:${esc(teamColor(name))}`;
  const slug=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const teamLogo=name=>teamMap.get(name)?.logo||`/api/league-team-image?league=wpba&key=${encodeURIComponent(slug(name))}`;
  const initials=name=>String(name||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'W';
  const playerPhoto=item=>item?.photo||`/api/league-team-image?league=wpba&kind=player&key=${encodeURIComponent(slug(item?.player||''))}`;

  function renderPulse(data){
    const leader=data.standings?.[0];
    const games=data.games||[];
    const completed=games.filter(game=>game.status!=='Scheduled').length;
    $('#wpbaPulse').innerHTML=[
      ['Eight teams',String(data.league.teams),'Competing across the San Francisco Bay Area.','featured'],
      ['First place',leader?.team||'Pending',leader?`${leader.w}-${leader.l} through ${leader.gp} games.`:'Official table loading.',''],
      ['Roster size',String(data.league.rosterSize),'Professional opportunities for up to 96 players.',''],
      ['Season window',data.league.seasonWindow,`${completed} recent results held in this snapshot.`,'']
    ].map(([label,value,note,kind])=>`<article class="wpba-pulse-card ${kind}"><span>${esc(label)}</span><strong>${esc(value)}</strong><p>${esc(note)}</p></article>`).join('');
  }

  function renderStandings(rows){
    const body=rows.map(row=>{
      const diff=Number(row.pf)-Number(row.pa),perGame=row.gp?diff/row.gp:0;
      return `<tr><td><span class="wpba-rank">${esc(row.rank)}</span></td><td><span class="wpba-team-name" style="${teamStyle(row.team)}"><span class="league-team-logo"><img src="${teamLogo(row.team)}" alt="" loading="lazy" decoding="async"></span><strong>${esc(row.team)}</strong></span></td><td>${esc(row.gp)}</td><td>${esc(row.w)}</td><td>${esc(row.l)}</td><td>${esc(row.pct)}</td><td>${esc(row.pf)}</td><td>${esc(row.pa)}</td><td class="${diff>=0?'wpba-positive':'wpba-negative'}">${diff>0?'+':''}${diff}</td><td class="${perGame>=0?'wpba-positive':'wpba-negative'}">${perGame>0?'+':''}${perGame.toFixed(1)}</td><td>${esc(row.gb)}</td><td>${esc(row.l10)}</td><td class="${String(row.streak).startsWith('W')?'wpba-positive':'wpba-negative'}">${esc(row.streak)}</td></tr>`;
    }).join('');
    $('#wpbaStandings').innerHTML=`<table class="wpba-table"><thead><tr><th>RK</th><th>Team</th><th>GP</th><th>W</th><th>L</th><th>W%</th><th>PF</th><th>PA</th><th>DIFF</th><th>DIFF/G</th><th>GB</th><th>L10</th><th>Streak</th></tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderLeaders(leaders){
    const groups=['All',...new Set(leaders.map(item=>item.group))];
    const tabs=$('#wpbaLeaderTabs');
    tabs.innerHTML=groups.map((group,index)=>`<button class="wpba-leader-tab" type="button" role="tab" aria-selected="${index===0}" data-group="${esc(group)}">${esc(group)}</button>`).join('');
    const draw=group=>{
      const shown=group==='All'?leaders:leaders.filter(item=>item.group===group);
      $('#wpbaLeaders').innerHTML=shown.map(item=>`<article class="wpba-leader-card" style="${teamStyle(item.team)}"><div class="wpba-leader-media"><span class="wpba-leader-headshot"><i>${esc(initials(item.player))}</i><img src="${esc(playerPhoto(item))}" alt="${esc(item.player)}" loading="lazy" decoding="async" onerror="this.remove()"></span><span class="league-team-logo wpba-leader-team-logo"><img src="${teamLogo(item.team)}" alt="${esc(item.team)} logo" loading="lazy" decoding="async"></span></div><span>${esc(item.metric)}</span><strong>${esc(item.player)}</strong><b>${esc(item.value)}</b><small>${esc(item.team)}</small>${item.profileUrl?`<a class="wpba-player-profile-link" href="${esc(item.profileUrl)}" target="_blank" rel="noopener">Official player profile ↗</a>`:''}</article>`).join('');
    };
    tabs.addEventListener('click',event=>{
      const button=event.target.closest('button[data-group]');
      if(!button)return;
      tabs.querySelectorAll('button').forEach(tab=>tab.setAttribute('aria-selected',String(tab===button)));
      draw(button.dataset.group);
    });
    draw('All');
  }

  function gameCard(game){
    const scheduled=game.awayScore==null||game.homeScore==null;
    const awayWinner=!scheduled&&Number(game.awayScore)>Number(game.homeScore),homeWinner=!scheduled&&Number(game.homeScore)>Number(game.awayScore);
    const displayStatus=scheduled&&new Date(`${game.date}T23:59:59Z`)<new Date()?'Official result pending':game.status;
    return `<article class="wpba-game"><time datetime="${esc(game.date)}">${esc(formatDate(game.date))}${game.time?` · ${esc(game.time)}`:''}</time><div class="wpba-game-team ${awayWinner?'winner':''}"><span class="league-team-logo"><img src="${teamLogo(game.away)}" alt="" loading="lazy" decoding="async"></span><strong>${esc(game.away)}</strong><b>${scheduled?'':esc(game.awayScore)}</b></div><div class="wpba-game-team ${homeWinner?'winner':''}"><span class="league-team-logo"><img src="${teamLogo(game.home)}" alt="" loading="lazy" decoding="async"></span><strong>${esc(game.home)}</strong><b>${scheduled?'':esc(game.homeScore)}</b></div><footer><span class="wpba-game-status">${esc(displayStatus)}</span><span>${esc(game.venue||'Venue pending')}</span></footer></article>`;
  }

  function renderGames(games){
    const completed=games.filter(game=>game.awayScore!=null&&game.homeScore!=null).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,8);
    const scheduled=games.filter(game=>game.awayScore==null||game.homeScore==null).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,8);
    $('#wpbaResults').innerHTML=completed.length?completed.map(gameCard).join(''):'<div class="wpba-empty">No completed games are available in the official feed yet.</div>';
    $('#wpbaSchedule').innerHTML=scheduled.length?scheduled.map(gameCard).join(''):'<div class="wpba-empty">The next WPBA schedule has not been posted. This panel will fill automatically when the official feed adds games.</div>';
  }

  function renderTeams(teams,standings,leaders){
    const tabs=$('#wpbaTeamTabs'),panel=$('#wpbaTeamPanel');
    if(!tabs||!panel)return;
    const records=new Map(standings.map(row=>[row.team,row]));
    const teamUrl=team=>'https://www.womenspba.com/stats#/2693/team/'+encodeURIComponent(team.teamId||'');
    tabs.innerHTML=teams.map((team,index)=>'<button type="button" class="wpba-team-tab" role="tab" id="wpbaTeamTab'+index+'" aria-controls="wpbaTeamPanel" aria-selected="'+(index===0?'true':'false')+'" data-wpba-team="'+index+'" style="'+teamStyle(team.name)+'"><span class="league-team-logo"><img src="'+teamLogo(team.name)+'" alt="" loading="lazy" decoding="async"></span><span>'+esc(team.name)+'</span></button>').join('');
    const show=index=>{const team=teams[index]||teams[0],record=records.get(team.name)||{},featured=(leaders||[]).filter(item=>item.team===team.name).slice(0,3);tabs.querySelectorAll('.wpba-team-tab').forEach((button,i)=>button.setAttribute('aria-selected',String(i===index?'true':'false')));const players=featured.length?'<section class="wpba-team-featured"><div class="wpba-team-panel-subhead"><span>2026 STAT LEADERS</span><strong>Players on the board</strong></div><div class="wpba-team-player-grid">'+featured.map(item=>'<figure class="wpba-team-player"><div class="wpba-team-player-photo"><img src="'+esc(playerPhoto(item))+'" alt="'+esc(item.player)+' player portrait" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add(\'is-missing\')"><span aria-hidden="true">'+esc(initials(item.player))+'</span></div><figcaption><strong>'+esc(item.player)+'</strong><span>'+esc(item.metric)+' · '+esc(item.value)+'</span></figcaption></figure>').join('')+'</div></section>':'<p class="wpba-team-no-leaders">No individual league-leading category is listed for this club in the 2026 snapshot.</p>';panel.setAttribute('aria-labelledby','wpbaTeamTab'+index);panel.innerHTML='<article class="wpba-team-room" style="'+teamStyle(team.name)+'"><header class="wpba-team-room-head"><span class="league-team-logo lg"><img src="'+teamLogo(team.name)+'" alt="'+esc(team.name)+' logo" loading="lazy" decoding="async"></span><div><span>2026 FINAL · '+esc(record.w||'—')+'-'+esc(record.l||'—')+'</span><h3>'+esc(team.name)+'</h3><p>'+'WPBA · San Francisco Bay Area'+'</p></div><a class="wpba-source-link" href="'+teamUrl(team)+'" target="_blank" rel="noopener noreferrer">Official team page ↗</a></header><div class="wpba-team-quick-stats"><div><span>W-L</span><strong>'+esc(record.w||'—')+'-'+esc(record.l||'—')+'</strong></div><div><span>Win rate</span><strong>'+esc(record.pct||'—')+'</strong></div><div><span>Point differential</span><strong>'+(Number.isFinite(Number(record.pf))&&Number.isFinite(Number(record.pa))?((Number(record.pf)-Number(record.pa)>=0?'+':'')+(Number(record.pf)-Number(record.pa))):'—')+'</strong></div></div>'+players+'</article>';};
    tabs.onclick=event=>{const button=event.target.closest('[data-wpba-team]');if(button)show(Number(button.dataset.wpbaTeam));};
    show(0);
  }

  function renderChampionship(item={}){
    const target=$('#wpbaChampionship');if(!target)return;
    target.innerHTML=`<div><span>${esc(item.status||'2026 status pending')}</span><strong>${esc(item.label||'Tournament of Champions')}</strong><p>${esc(item.note||'')}</p></div><aside><span>LATEST VERIFIED CHAMPION</span><strong>${esc(item.latestVerifiedChampion||'—')}</strong><b>${esc(item.latestVerifiedYear||'')}</b><a href="${esc(item.sourceUrl||'https://www.womenspba.com/')}" target="_blank" rel="noopener">Official record ↗</a></aside>`;
  }

  function renderHonors(items=[]){
    const target=$('#wpbaHonors');if(!target)return;
    target.innerHTML=items.map(item=>`<a class="league-honor-card" href="${esc(item.sourceUrl||'#')}" target="_blank" rel="noopener"><span>${esc(item.label)}</span><strong>${esc(item.player)}</strong><p>${esc(item.team)} · ${esc(item.detail)}</p></a>`).join('');
  }

  function renderPhotos(items=[]){
    const target=$('#wpbaPhotos');if(!target)return;
    target.innerHTML=items.map(item=>`<article class="league-photo-card"><img src="/api/league-team-image?league=wpba&kind=photo&key=${encodeURIComponent(item.key)}" alt="${esc(item.title)}" loading="lazy"><div><span>${esc(item.label)}</span><strong>${esc(item.title)}</strong></div></article>`).join('');
  }

  function renderHow(items=[]){
    const target=$('#wpbaHowItWorks');if(!target)return;
    target.innerHTML=items.map(item=>`<article class="league-standard-card"><span>${esc(item.label)}</span><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></article>`).join('');
  }

  function renderHistory(items=[]){
    const target=$('#wpbaHistory');if(!target)return;
    target.innerHTML=items.map(item=>`<article><b>${esc(item.year)}</b><div><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></div></article>`).join('');
  }

  const KITCHEN={
    pct:{label:'Win %',value:r=>Number(String(r.pct).replace('%','')),display:r=>r.pct,sort:'desc'},
    pf:{label:'Offense',value:r=>Number(r.pf)/(Number(r.gp)||1),display:r=>(Number(r.pf)/(Number(r.gp)||1)).toFixed(1)+' PPG',sort:'desc'},
    pa:{label:'Defense',value:r=>Number(r.pa)/(Number(r.gp)||1),display:r=>(Number(r.pa)/(Number(r.gp)||1)).toFixed(1)+' OPPG',sort:'asc'},
    diff:{label:'Point Diff',value:r=>(Number(r.pf)-Number(r.pa))/(Number(r.gp)||1),display:r=>{const v=(Number(r.pf)-Number(r.pa))/(Number(r.gp)||1);return (v>=0?'+':'')+v.toFixed(1)+' / game'},sort:'desc'}
  };
  function renderKitchen(rows=[],key='pct'){
    const metric=KITCHEN[key]||KITCHEN.pct,target=$('#wpbaKitchenBoard');if(!target)return;
    const sorted=[...rows].sort((a,b)=>metric.sort==='asc'?metric.value(a)-metric.value(b):metric.value(b)-metric.value(a));
    target.innerHTML=sorted.map((row,index)=>`<div class="wpba-kitchen-row"><span>${index+1}</span><div class="league-team-lockup"><span class="league-team-logo"><img src="${teamLogo(row.team)}" alt="" loading="lazy"></span><div><strong>${esc(row.team)}</strong><small>${esc(row.w)}-${esc(row.l)}</small></div></div><b>${esc(metric.display(row))}</b></div>`).join('');
  }
  function setupKitchen(rows=[]){
    const tabs=$('#wpbaKitchenTabs');if(!tabs)return;
    tabs.innerHTML=Object.entries(KITCHEN).map(([key,item],i)=>`<button class="wpba-leader-tab" type="button" data-kitchen="${key}" aria-selected="${i===0}">${esc(item.label)}</button>`).join('');
    tabs.addEventListener('click',event=>{const btn=event.target.closest('[data-kitchen]');if(!btn)return;tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',String(x===btn)));renderKitchen(rows,btn.dataset.kitchen);});
    renderKitchen(rows,'pct');
  }

  async function init(){
    try{
      const response=await fetch(DATA_URL,{cache:'no-store',headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error(`WPBA data returned ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data.standings)||data.standings.length!==8)throw new Error('WPBA standings snapshot is incomplete');
      (data.teams||[]).forEach(team=>teamMap.set(team.name,team));
      renderPulse(data);renderChampionship(data.championship||{});renderStandings(data.standings);renderLeaders(data.leaders||[]);renderGames(data.games||[]);renderTeams(data.teams||[],data.standings,data.leaders||[]);setupKitchen(data.standings);renderHonors(data.honors||[]);renderPhotos(data.photos||[]);renderHow(data.howItWorks||[]);renderHistory(data.history||[]);
      const status=$('#wpbaStatus'),checked=formatDate(data.checkedAt||data.updatedAt),synced=formatDate(data.updatedAt);
      status.textContent=data.checkedAt&&data.checkedAt!==data.updatedAt?`Official feed checked ${checked} · last data change ${synced}`:`Official feed synced ${synced}`;status.classList.add('is-current');
    }catch(error){
      console.error(error);
      const status=$('#wpbaStatus');status.textContent='Official feed temporarily unavailable';status.classList.add('is-stale');
      ['#wpbaPulse','#wpbaStandings','#wpbaLeaders','#wpbaResults','#wpbaSchedule','#wpbaTeamTabs','#wpbaTeamPanel'].forEach(selector=>{const node=$(selector);if(node)node.innerHTML='<div class="wpba-empty">This dashboard could not load. Use the official WPBA link while We Know the W reconnects.</div>';});
    }
  }
  init();
})();
