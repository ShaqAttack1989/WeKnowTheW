(()=>{
  const FINAL_FOUR=new Set(['FRA','GER','ESP','USA']);
  const teamColors={FRA:'#4aa5ff',GER:'#ef4d59',ESP:'#ffc941',USA:'#6d86ff'};
  const fallbackTeams=[
    {code:'FRA',name:'France',flag:'🇫🇷',overallRank:1,gamesPlayed:4,wins:4,losses:0,ppg:98.75,oppPpg:59.75,diffPerGame:39,wScore:93.3,eliminated:false},
    {code:'USA',name:'United States',flag:'🇺🇸',overallRank:2,gamesPlayed:4,wins:4,losses:0,ppg:90.5,oppPpg:58.25,diffPerGame:32.25,wScore:90.8,eliminated:false},
    {code:'ESP',name:'Spain',flag:'🇪🇸',overallRank:3,gamesPlayed:4,wins:3,losses:1,ppg:81,oppPpg:65,diffPerGame:16,wScore:75,eliminated:false},
    {code:'GER',name:'Germany',flag:'🇩🇪',overallRank:4,gamesPlayed:5,wins:4,losses:1,ppg:79.4,oppPpg:65.8,diffPerGame:13.6,wScore:74.7,eliminated:false}
  ];
  const fallbackLeaders=[
    {label:'Efficiency',unit:'EFF',leaders:[['Emma Meesseman','BEL','🇧🇪',25],['Trinity San Antonio','PUR','🇵🇷',22.5],['Gabby Williams','FRA','🇫🇷',22]]},
    {label:'Points',unit:'PPG',leaders:[['Emma Meesseman','BEL','🇧🇪',21],['Xu Han','CHN','🇨🇳',18.8],['Sevgi Uzun','TUR','🇹🇷',17.7]]},
    {label:'Rebounds',unit:'RPG',leaders:[['Imani McGee-Stafford','PUR','🇵🇷',12],['Xu Han','CHN','🇨🇳',10.8],['Dorka Juhasz','HUN','🇭🇺',10.4]]},
    {label:'Assists',unit:'APG',leaders:[['Sevgi Uzun','TUR','🇹🇷',8.3],['Julie Allemand','BEL','🇧🇪',7.8],['Caitlin Clark','USA','🇺🇸',7]]},
    {label:'Steals',unit:'SPG',leaders:[['Trinity San Antonio','PUR','🇵🇷',5],['Ezinne Kalu','NGR','🇳🇬',2.7],['Gabby Williams','FRA','🇫🇷',2.5]]},
    {label:'Blocks',unit:'BPG',leaders:[['Ramu Tokashiki','JPN','🇯🇵',2.3],['Imani McGee-Stafford','PUR','🇵🇷',1.8],['Kyara Linskens','BEL','🇧🇪',1.5]]}
  ];
  const matchupFacts={
    'FRA-GER':{
      codes:['FRA','GER'],label:'SEMIFINAL 01',question:'Can Germany make France play one possession at a time?',
      facts:['<b>France:</b> 61.4% on twos and 45.7% from three.','<b>Germany:</b> only 9.8 turnovers per game.','<b>Glass:</b> Germany 46.2 rebounds per game; France 39.5.'],
      identity:'France wants multiplication. Germany wants preservation.'
    },
    'ESP-USA':{
      codes:['ESP','USA'],label:'SEMIFINAL 02',question:'Can Spain keep USA from becoming an avalanche?',
      facts:['<b>Transition:</b> USA 17.3 fast-break points; Spain 8.8.','<b>Bench:</b> USA 48.8 points; Spain 29.0.','<b>History:</b> USA brings a 34-game World Cup win streak.'],
      identity:'Spain wants a negotiation. USA wants a landslide.'
    }
  };
  const players=[
    {team:'FRA',country:'France',flag:'🇫🇷',name:'Gabby Williams',id:'216915',role:'THE TWO-WAY HINGE',glow:'rgba(67,157,255,.62)',read:'The tournament’s top remaining two-way force can start France’s avalanche with one deflection.',stats:[['17.5','PPG'],['22.0','EFF'],['2.5','SPG']]},
    {team:'FRA',country:'France',flag:'🇫🇷',name:'Marine Johannes',id:'191610',role:'THE GEOMETRY BREAKER',glow:'rgba(67,157,255,.62)',read:'Her range changes where Germany has to defend before the possession even begins.',stats:[['16.5','PPG'],['4.0','3PM'],['48.5%','3PT']]},
    {team:'GER',country:'Germany',flag:'🇩🇪',name:'Leonie Fiebich',id:'218988',role:'THE 6-FOOT-3 CONNECTOR',glow:'rgba(239,77,89,.58)',read:'Scoring is optional. Rebounding, passing, size and tempo control are not.',stats:[['10.0','PPG'],['9.0','RPG'],['3.8','APG']]},
    {team:'GER',country:'Germany',flag:'🇩🇪',name:'Frieda Buhner',id:'266528',role:'THE EFFICIENCY RELEASE',glow:'rgba(239,77,89,.58)',read:'She turns secondary touches into primary damage and has not missed a free throw.',stats:[['14.8','PPG'],['56.5%','FG'],['100%','FT']]},
    {team:'ESP',country:'Spain',flag:'🇪🇸',name:'Iyana Martin',id:'295079',role:'THE FEARLESS CREATOR',glow:'rgba(255,201,65,.65)',read:'Spain has put the ball and the future in her hands. She has played like both belong there.',stats:[['16.5','PPG'],['3.3','APG'],['43.5%','3PT']]},
    {team:'ESP',country:'Spain',flag:'🇪🇸',name:'Awa Fam',id:'300698',role:'THE FRONTCOURT TEST',glow:'rgba(255,201,65,.65)',read:'Her strength, offensive rebounding and mobility give Spain its best chance to make USA feel contact.',stats:[['11.5','PPG'],['6.8','RPG'],['1.3','BPG']]},
    {team:'USA',country:'United States',flag:'🇺🇸',name:'Breanna Stewart',id:'176575',role:'THE BIG-GAME CONSTANT',glow:'rgba(102,132,255,.63)',read:'Her averages look quiet because USA shares everything. Her leverage does not.',stats:[['9.8','PPG'],['7.0','RPG'],['15.8','EFF']]},
    {team:'USA',country:'United States',flag:'🇺🇸',name:'Caitlin Clark',id:'235603',role:'THE ADVANTAGE CREATOR',glow:'rgba(102,132,255,.63)',read:'The shot has not arrived consistently. The passes still place her on the field-wide leaderboard.',stats:[['8.5','PPG'],['7.0','APG'],['26.3%','3PT']]}
  ];

  let currentMatchup='FRA-GER';
  let latestPayload=null;
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const one=value=>Number.isFinite(Number(value))?Number(value).toFixed(1):'—';
  const teamRows=payload=>{
    const rows=Array.isArray(payload?.tournamentTable)?payload.tournamentTable.filter(team=>FINAL_FOUR.has(team.code)):[];
    return rows.length===4?rows:fallbackTeams;
  };
  const teamByCode=(payload,code)=>teamRows(payload).find(team=>team.code===code)||fallbackTeams.find(team=>team.code===code);
  const semifinalGames=payload=>(Array.isArray(payload?.games)?payload.games:[]).filter(game=>game.roundCode==='SF');
  const gameForCodes=(payload,codes)=>semifinalGames(payload).find(game=>codes.every(code=>[game.home?.code,game.away?.code].includes(code)));
  const completedCount=payload=>(Array.isArray(payload?.games)?payload.games.filter(game=>game.status==='final').length:32);

  function localTime(iso){
    const date=new Date(iso);
    if(Number.isNaN(date.getTime()))return 'Your time unavailable';
    return new Intl.DateTimeFormat(undefined,{weekday:'short',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(date);
  }
  function updateStaticLocalTimes(){
    document.querySelectorAll('[data-ff-local]').forEach(node=>{node.textContent=localTime(node.dataset.ffLocal);});
  }
  function stageFor(team,payload){
    if(team.eliminated)return team.eliminationLabel?`E · ${team.eliminationLabel}`:'E · ELIMINATED';
    const game=gameForCodes(payload,matchupFacts[team.code==='FRA'||team.code==='GER'?'FRA-GER':'ESP-USA'].codes);
    if(game?.status==='final'){
      const winner=Number(game.homeScore)>Number(game.awayScore)?game.home?.code:game.away?.code;
      return winner===team.code?'FINALIST':'FINAL FOUR';
    }
    return 'FINAL FOUR';
  }

  function renderOverall(payload){
    const board=document.getElementById('ffOverallBoard');
    if(!board)return;
    const rows=teamRows(payload).slice().sort((a,b)=>(a.overallRank||99)-(b.overallRank||99));
    board.innerHTML=rows.map(team=>`<article class="ff-team-rank-card" style="--team-color:${teamColors[team.code]||'#d8ff4f'}">
      <div class="ff-team-rank-top"><span>W SCORE RANK #${esc(team.overallRank)}</span><b>${esc(stageFor(team,payload))}</b></div>
      <h3><small>${esc(team.code)}</small>${esc(team.flag)} ${esc(team.name)}</h3>
      <div class="ff-w-score"><span>WE KNOW THE W SCORE</span><strong>${one(team.wScore)}</strong></div>
      <div class="ff-w-bar" aria-label="W Score ${one(team.wScore)} out of 100"><i style="width:${Math.max(0,Math.min(100,Number(team.wScore)||0))}%"></i></div>
      <div class="ff-team-mini"><span><small>RECORD</small><b>${esc(team.wins)}–${esc(team.losses)}</b></span><span><small>PPG</small><b>${one(team.ppg)}</b></span><span><small>MARGIN</small><b>${Number(team.diffPerGame)>=0?'+':''}${one(team.diffPerGame)}</b></span></div>
    </article>`).join('');
    const updated=document.getElementById('ffOverallUpdated');
    if(updated){
      const when=payload?.updatedAt?new Date(payload.updatedAt):null;
      const checked=when&&!Number.isNaN(when.getTime())?new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(when):'current snapshot';
      updated.textContent=`${completedCount(payload)} completed games · checked ${checked}`;
    }
    const stamp=document.getElementById('ffLiveStamp');
    if(stamp)stamp.textContent=`Official FIBA-connected results · ${completedCount(payload)} of ${payload?.totalGames||36} games completed`;
  }

  function normalizeLeaders(payload){
    if(Array.isArray(payload?.statLeaders)&&payload.statLeaders.length){
      return payload.statLeaders.map(category=>({label:category.label,unit:category.unit,leaders:(category.leaders||[]).map(leader=>Array.isArray(leader)?leader:[leader.player,leader.countryCode,leader.flag,leader.value])}));
    }
    return fallbackLeaders;
  }
  function renderLeaders(payload){
    const categories=normalizeLeaders(payload);
    let count=0;
    const board=document.getElementById('ffLeaderBoard');
    if(!board)return;
    board.innerHTML=categories.map(category=>`<article class="ff-leader-category"><h3>${esc(category.label)} <small>${esc(category.unit)}</small></h3><ol>${category.leaders.map((leader,index)=>{
      const [player,code,flag,value]=leader;
      const alive=FINAL_FOUR.has(code);if(alive)count+=1;
      return `<li class="${alive?'is-final-four':''}"><span>${index+1}</span><b>${esc(flag)} ${esc(player)}</b><em>${esc(value)} · ${alive?'FINAL FOUR':'OUT'}</em></li>`;
    }).join('')}</ol></article>`).join('');
    const leaderCount=document.getElementById('ffLeaderCount');
    const survival=document.getElementById('ffSurvivalNumber');
    if(leaderCount)leaderCount.textContent=count;
    if(survival)survival.textContent=`${count} of ${categories.reduce((sum,category)=>sum+category.leaders.length,0)}`;
  }

  function renderHeroGames(payload){
    const gameMap=[{key:'FRA-GER',id:'ffHeroFraGer'},{key:'ESP-USA',id:'ffHeroEspUsa'}];
    let live=false,finals=0;
    gameMap.forEach(({key,id})=>{
      const card=document.getElementById(id);const game=gameForCodes(payload,matchupFacts[key].codes);
      if(!card||!game)return;
      card.classList.toggle('is-live',game.status==='live');card.classList.toggle('is-final',game.status==='final');
      if(game.status==='live')live=true;if(game.status==='final')finals+=1;
      card.href=game.sourceUrl||card.href;
      const time=card.querySelector('.ff-tip-time b');const teams=card.querySelector('.ff-tip-teams');const local=card.querySelector('.ff-tip-local');
      if(game.status==='final'){
        time.textContent='FINAL';
        teams.innerHTML=`<strong>${esc(game.home?.flag)} ${esc(game.home?.name)} ${esc(game.homeScore)}</strong><i>—</i><strong>${esc(game.awayScore)} ${esc(game.away?.name)} ${esc(game.away?.flag)}</strong>`;
        local.textContent='Official result';
      }else if(game.status==='live'){
        time.textContent='LIVE';
        teams.innerHTML=`<strong>${esc(game.home?.flag)} ${esc(game.home?.name)} ${esc(game.homeScore??0)}</strong><i>${esc(game.livePeriod||'IN PLAY')}</i><strong>${esc(game.awayScore??0)} ${esc(game.away?.name)} ${esc(game.away?.flag)}</strong>`;
        local.textContent=game.liveClock?`${game.liveClock} remaining`:'In progress';
      }else{
        time.textContent=game.timeBerlin||time.textContent;
        local.textContent=localTime(game.startTimeUtc);
      }
    });
    const status=document.getElementById('ffHeroStatus');
    if(status)status.textContent=live?'LIVE IN BERLIN':finals===2?'SEMIFINALS FINAL':'SEMIFINALS SET';
  }

  function metricRow(label,a,b,formatter=value=>one(value)){
    const av=Number(a)||0,bv=Number(b)||0,max=Math.max(av,bv,1);
    return `<div class="ff-compare-row"><strong>${formatter(a)}</strong><div class="ff-compare-track" style="--bar-color:${teamColors[matchupFacts[currentMatchup].codes[0]]}"><i style="width:${Math.max(8,av/max*100)}%"></i></div><span>${esc(label)}</span><div class="ff-compare-track away" style="--bar-color:${teamColors[matchupFacts[currentMatchup].codes[1]]}"><i style="width:${Math.max(8,bv/max*100)}%"></i></div><strong>${formatter(b)}</strong></div>`;
  }
  function renderCountryLab(payload){
    const lab=document.getElementById('ffCountryLab');if(!lab)return;
    const match=matchupFacts[currentMatchup];const first=teamByCode(payload,match.codes[0]);const second=teamByCode(payload,match.codes[1]);const game=gameForCodes(payload,match.codes);
    let gameState='UP NEXT';let gameDetail=game?.startTimeUtc?localTime(game.startTimeUtc):'September 12';
    if(game?.status==='live'){gameState='LIVE';gameDetail=`${game.homeScore??0}–${game.awayScore??0}${game.liveClock?` · ${game.liveClock}`:''}`;}
    if(game?.status==='final'){gameState='FINAL';gameDetail=`${game.home?.code} ${game.homeScore} · ${game.awayScore} ${game.away?.code}`;}
    lab.innerHTML=`<div class="ff-lab-score"><div class="ff-lab-team"><span>${esc(first.flag)}</span><div><small>W #${esc(first.overallRank)}</small><strong>${esc(first.name)}</strong></div></div><div class="ff-lab-center"><b>${esc(gameState)}</b><span>${esc(gameDetail)}</span></div><div class="ff-lab-team"><div><small>W #${esc(second.overallRank)}</small><strong>${esc(second.name)}</strong></div><span>${esc(second.flag)}</span></div></div>
      <div class="ff-lab-body"><div class="ff-compare-list">
        ${metricRow('W SCORE',first.wScore,second.wScore)}
        ${metricRow('WIN %',Number(first.wins)/(Number(first.gamesPlayed)||1)*100,Number(second.wins)/(Number(second.gamesPlayed)||1)*100,value=>`${Math.round(Number(value))}%`)}
        ${metricRow('POINTS / GAME',first.ppg,second.ppg)}
        ${metricRow('OPP PTS / GAME',first.oppPpg,second.oppPpg)}
        ${metricRow('AVG MARGIN',first.diffPerGame,second.diffPerGame,value=>`${Number(value)>=0?'+':''}${one(value)}`)}
      </div><aside class="ff-lab-pressure"><span>${esc(match.label)} · THE GAME INSIDE THE GAME</span><h3>${esc(match.question)}</h3><ul>${match.facts.map(fact=>`<li>${fact}</li>`).join('')}</ul><p><b>${esc(match.identity)}</b></p></aside></div>`;
  }

  function renderPlayers(){
    const grid=document.getElementById('ffPlayerGrid');if(!grid)return;
    grid.innerHTML=players.map(player=>{
      const slug=player.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const url=`https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/teams/${player.country.toLowerCase().replace('united states','usa')}/${player.id}-${slug}`;
      const photo=`https://assets.fiba.basketball/image/upload/w_720,h_960,c_pad,g_north/f_png/q_auto/.headshot--person_${player.id}--competition_208875`;
      return `<article class="ff-player-card" data-ff-team="${player.team}" style="--player-glow:${player.glow}"><div class="ff-player-photo"><img src="${photo}" alt="Official FIBA portrait of ${esc(player.name)} in her ${esc(player.country)} uniform" loading="lazy"><span class="ff-player-country">${player.flag} ${player.team}</span><span class="ff-player-role">${esc(player.role)}</span></div><div class="ff-player-copy"><h3>${esc(player.name)}</h3><p>${esc(player.read)}</p><div class="ff-player-stats">${player.stats.map(([value,label])=>`<span><b>${esc(value)}</b><small>${esc(label)}</small></span>`).join('')}</div><a class="ff-player-source" href="${url}" target="_blank" rel="noopener">Official FIBA profile ↗</a></div></article>`;
    }).join('');
  }
  function setPlayerFilter(team){
    document.querySelectorAll('[data-ff-player-filter]').forEach(button=>{const active=button.dataset.ffPlayerFilter===team;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('.ff-player-card').forEach(card=>{card.hidden=team!=='ALL'&&card.dataset.ffTeam!==team;});
  }

  async function refresh(){
    try{
      const response=await fetch('/api/fiba-world-cup',{cache:'no-store'});
      if(!response.ok)throw new Error(`FIBA feed ${response.status}`);
      latestPayload=await response.json();
    }catch(error){
      console.warn('Final Four dashboard is using the quarterfinal snapshot.',error);
      latestPayload={tournamentTable:fallbackTeams,statLeaders:fallbackLeaders,totalGames:36,games:[]};
    }
    renderOverall(latestPayload);renderLeaders(latestPayload);renderHeroGames(latestPayload);renderCountryLab(latestPayload);
  }

  updateStaticLocalTimes();renderPlayers();
  document.querySelectorAll('[data-ff-matchup]').forEach(button=>button.addEventListener('click',()=>{currentMatchup=button.dataset.ffMatchup;document.querySelectorAll('[data-ff-matchup]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));renderCountryLab(latestPayload);}));
  document.querySelectorAll('[data-ff-player-filter]').forEach(button=>button.addEventListener('click',()=>setPlayerFilter(button.dataset.ffPlayerFilter)));
  refresh();
  window.setInterval(refresh,120000);
})();
