(()=>{
  if(window.WKTWPlayoffBracket)return;

  const EASTERN='America/New_York';
  const FIRST_ROUND=[
    {id:'min-nyl',a:{name:'Minnesota Lynx',seed:1},b:{name:'New York Liberty',seed:8},route:'semi-a'},
    {id:'atl-was',a:{name:'Atlanta Dream',seed:4},b:{name:'Washington Mystics',seed:5},route:'semi-a'},
    {id:'gsv-dal',a:{name:'Golden State Valkyries',seed:2},b:{name:'Dallas Wings',seed:7},route:'semi-b'},
    {id:'lva-ind',a:{name:'Las Vegas Aces',seed:3},b:{name:'Indiana Fever',seed:6},route:'semi-b'}
  ];
  const TEAM_META={
    'Atlanta Dream':{code:'ATL',color:'#c8102e',slug:'atlanta-dream',logo:'https://cdn.wnba.com/logos/wnba/1611661330/primary/L/logo.svg'},
    'Dallas Wings':{code:'DAL',color:'#0c2340',slug:'dallas-wings',logo:'https://cdn.wnba.com/logos/wnba/1611661321/primary/L/logo.svg'},
    'Golden State Valkyries':{code:'GSV',color:'#6d35a8',slug:'golden-state-valkyries',logo:'https://cdn.wnba.com/logos/wnba/1611661331/primary/L/logo.svg'},
    'Indiana Fever':{code:'IND',color:'#002d62',slug:'indiana-fever',logo:'https://cdn.wnba.com/logos/wnba/1611661325/primary/L/logo.svg'},
    'Las Vegas Aces':{code:'LVA',color:'#c8102e',slug:'las-vegas-aces',logo:'https://cdn.wnba.com/logos/wnba/1611661319/primary/L/logo.svg'},
    'Minnesota Lynx':{code:'MIN',color:'#0c2340',slug:'minnesota-lynx',logo:'https://cdn.wnba.com/logos/wnba/1611661324/primary/L/logo.svg'},
    'New York Liberty':{code:'NYL',color:'#000',slug:'new-york-liberty',logo:'https://cdn.wnba.com/logos/wnba/1611661313/primary/L/logo.svg'},
    'Washington Mystics':{code:'WAS',color:'#002b5c',slug:'washington-mystics',logo:'https://cdn.wnba.com/logos/wnba/1611661322/primary/L/logo.svg'}
  };
  const FALLBACK_GAMES=[
    {id:'1042600101',date:'2026-09-27',startTimeUtc:'2026-09-27T14:00:00-04:00',homeTeam:'Minnesota Lynx',awayTeam:'New York Liberty',homeScore:75,awayScore:91,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:1},
    {id:'1042600121',date:'2026-09-27',startTimeUtc:'2026-09-27T16:00:00-04:00',homeTeam:'Las Vegas Aces',awayTeam:'Indiana Fever',homeScore:102,awayScore:85,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:1},
    {id:'1042600131',date:'2026-09-27',startTimeUtc:'2026-09-27T19:00:00-04:00',homeTeam:'Atlanta Dream',awayTeam:'Washington Mystics',homeScore:92,awayScore:77,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:1},
    {id:'1042600111',date:'2026-09-27',startTimeUtc:'2026-09-27T21:00:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',homeScore:104,awayScore:80,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:1},
    {id:'2026-ind-lva-g2',date:'2026-09-29',startTimeUtc:'2026-09-29T18:30:00-04:00',homeTeam:'Indiana Fever',awayTeam:'Las Vegas Aces',homeScore:99,awayScore:89,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:2},
    {id:'2026-nyl-min-g2',date:'2026-09-29',startTimeUtc:'2026-09-29T20:30:00-04:00',homeTeam:'New York Liberty',awayTeam:'Minnesota Lynx',homeScore:87,awayScore:71,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:2},
    {id:'2026-was-atl-g2',date:'2026-09-30',startTimeUtc:'2026-09-30T19:00:00-04:00',homeTeam:'Washington Mystics',awayTeam:'Atlanta Dream',homeScore:75,awayScore:93,status:'Final',state:'post',completed:true,round:'First Round',gameNumber:2},
    {id:'2026-dal-gsv-g2',date:'2026-09-30',startTimeUtc:'2026-09-30T21:00:00-04:00',homeTeam:'Dallas Wings',awayTeam:'Golden State Valkyries',homeScore:108,awayScore:100,status:'Final/OT',state:'post',completed:true,round:'First Round',gameNumber:2},
    {id:'2026-lva-ind-g3',date:'2026-10-01',startTimeUtc:'2026-10-01T21:00:00-04:00',homeTeam:'Las Vegas Aces',awayTeam:'Indiana Fever',homeScore:94,awayScore:83,broadcasts:['USA','CNBC'],status:'Final',state:'post',completed:true,round:'First Round',gameNumber:3},
    {id:'2026-gsv-dal-g3',date:'2026-10-02',startTimeUtc:'2026-10-02T21:00:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',homeScore:77,awayScore:73,broadcasts:['ESPN2'],status:'Final',state:'post',completed:true,round:'First Round',gameNumber:3},
    {id:'1042600201',date:'2026-10-04',startTimeUtc:'2026-10-04T14:00:00-04:00',homeTeam:'Atlanta Dream',awayTeam:'New York Liberty',homeScore:92,awayScore:82,broadcasts:['ABC'],status:'Final',state:'post',completed:true,round:'Semifinals',gameNumber:1},
    {id:'1042600211',date:'2026-10-04',startTimeUtc:'2026-10-04T16:00:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Las Vegas Aces',homeScore:71,awayScore:60,broadcasts:['Peacock','NBC'],status:'Final',state:'post',completed:true,round:'Semifinals',gameNumber:1},
    {id:'1042600202',date:'2026-10-07',startTimeUtc:'2026-10-07T19:30:00-04:00',homeTeam:'Atlanta Dream',awayTeam:'New York Liberty',homeScore:101,awayScore:98,broadcasts:['ESPN'],status:'Final/OT',state:'post',completed:true,round:'Semifinals',gameNumber:2},
    {id:'2026-gsv-lva-sf-g2',date:'2026-10-07',startTimeUtc:'2026-10-07T21:30:00-04:00',homeTeam:'Golden State Valkyries',awayTeam:'Las Vegas Aces',homeScore:null,awayScore:null,broadcasts:['Peacock','NBC Sports Network'],status:'Semifinals Game 2',state:'pre',completed:false,round:'Semifinals',gameNumber:2},
    {id:'2026-nyl-atl-sf-g3',date:'2026-10-09',startTimeUtc:'2026-10-09T19:30:00-04:00',homeTeam:'New York Liberty',awayTeam:'Atlanta Dream',homeScore:null,awayScore:null,broadcasts:['ESPN2'],status:'Semifinals Game 3',state:'pre',completed:false,round:'Semifinals',gameNumber:3},
    {id:'2026-lva-gsv-sf-g3',date:'2026-10-09',startTimeUtc:'2026-10-09T21:30:00-04:00',homeTeam:'Las Vegas Aces',awayTeam:'Golden State Valkyries',homeScore:null,awayScore:null,broadcasts:['Peacock','NBC Sports Network'],status:'Semifinals Game 3',state:'pre',completed:false,round:'Semifinals',gameNumber:3}
  ];
  const mounts=new Set();
  const logos=new Map();
  const seriesSnapshots=new Map();
  let games=[...FALLBACK_GAMES];
  let started=false;
  let baseLoading=false;
  let liveLoading=false;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const isPlaceholder=name=>/winner/i.test(String(name||''));
  const pairKey=(a,b)=>[norm(a),norm(b)].sort().join('|');
  const gameKey=game=>`${String(game.date||'').slice(0,10)}|${pairKey(game.homeTeam,game.awayTeam)}`;
  const seriesKey=(round,a,b)=>`${round}|${pairKey(a,b)}`;
  const hasScore=value=>value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isFinite(Number(value));
  const isLive=game=>!game?.completed&&String(game?.state||'').toLowerCase()==='in';
  const isFinal=game=>Boolean(game?.completed)||String(game?.state||'').toLowerCase()==='post'||/\bfinal\b/i.test(String(game?.status||''));
  const stateRank=game=>isFinal(game)?3:isLive(game)?2:1;
  const instant=game=>{const raw=game?.startTimeUtc||game?.timestamp||'';const date=raw?new Date(raw):game?.date?new Date(`${game.date}T12:00:00-04:00`):null;return date&&!Number.isNaN(date.getTime())?date:null;};
  const roundForGame=game=>{
    const date=String(game?.date||'').slice(0,10);
    if(date>='2026-10-17')return'Finals';
    if(date>='2026-10-04')return'Semifinals';
    const raw=String(game?.round||game?.competitionLabel||'').toLowerCase();
    if(raw.includes('final')&&!raw.includes('semi'))return'Finals';
    if(raw.includes('semi'))return'Semifinals';
    return'First Round';
  };
  const fieldTeam=name=>FIRST_ROUND.some(match=>match.a.name===name||match.b.name===name);
  const isPlayoffGame=game=>String(game?.date||'').slice(0,10)>='2026-09-27'&&fieldTeam(game.homeTeam)&&fieldTeam(game.awayTeam);

  function mergeGame(base={},fresh={}){
    const winner=stateRank(fresh)>=stateRank(base)?fresh:base;
    const other=winner===fresh?base:fresh;
    return {...other,...winner,startTimeUtc:winner.startTimeUtc||other.startTimeUtc||'',date:winner.date||other.date||'',round:roundForGame(winner),broadcasts:Array.isArray(winner.broadcasts)&&winner.broadcasts.length?winner.broadcasts:(other.broadcasts||[])};
  }
  function mergeGames(...lists){
    const map=new Map();
    lists.flat().filter(isPlayoffGame).forEach(game=>{const key=gameKey(game),current=map.get(key);map.set(key,current?mergeGame(current,game):{...game,round:roundForGame(game)});});
    const counts=new Map();
    return [...map.values()].sort((a,b)=>(instant(a)?.getTime()||0)-(instant(b)?.getTime()||0)).map(game=>{
      const key=`${roundForGame(game)}|${pairKey(game.homeTeam,game.awayTeam)}`,number=(counts.get(key)||0)+1;
      counts.set(key,number);
      return {...game,round:roundForGame(game),gameNumber:Number(game.gameNumber)||number};
    });
  }
  function teamMeta(name=''){
    if(!name||isPlaceholder(name))return{code:'TBD',color:'#6e6677'};
    return TEAM_META[name]||{code:String(name).split(/\s+/).map(word=>word[0]).join('').slice(0,3).toUpperCase(),color:'#32135e'};
  }
  function teamLogo(name=''){
    const meta=teamMeta(name);
    const src=logos.get(norm(name))||meta.logo||'';
    return `<span class="wktw-bracket-mark" style="--team-color:${safe(meta.color)}"><b>${safe(meta.code)}</b>${src?`<img src="${safe(src)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}</span>`;
  }
  function teamSeed(name=''){
    for(const match of FIRST_ROUND){if(match.a.name===name)return match.a.seed;if(match.b.name===name)return match.b.seed;}
    return null;
  }
  function winnerName(game={}){
    if(!isFinal(game)||!hasScore(game.homeScore)||!hasScore(game.awayScore)||Number(game.homeScore)===Number(game.awayScore))return'';
    return Number(game.homeScore)>Number(game.awayScore)?game.homeTeam:game.awayTeam;
  }
  function seriesState(a,b,round='First Round',target=2){
    if(!a||!b||isPlaceholder(a)||isPlaceholder(b))return{aWins:0,bWins:0,winner:'',games:[],latest:null,next:null,target};
    const list=games.filter(game=>roundForGame(game)===round&&pairKey(game.homeTeam,game.awayTeam)===pairKey(a,b)).sort((x,y)=>(instant(x)?.getTime()||0)-(instant(y)?.getTime()||0));
    let aWins=0,bWins=0;
    list.forEach(game=>{const winner=winnerName(game);if(winner===a)aWins++;if(winner===b)bWins++;});
    const snapshot=seriesSnapshots.get(seriesKey(round,a,b));
    if(snapshot){
      if(norm(snapshot.teamA)===norm(a)){aWins=Number(snapshot.winsA)||0;bWins=Number(snapshot.winsB)||0;}
      else{aWins=Number(snapshot.winsB)||0;bWins=Number(snapshot.winsA)||0;}
    }
    const completed=list.filter(isFinal),live=list.find(isLive),next=list.find(game=>!isFinal(game)&&!isLive(game));
    const winner=snapshot?.winner||(aWins>=target?a:bWins>=target?b:'');
    return{aWins,bWins,winner,games:list,latest:live||completed.at(-1)||null,next:live||next||null,target,complete:Boolean(snapshot?.complete||winner)};
  }
  function timeLabel(game){
    const date=instant(game);if(!date)return'Time TBD';
    const day=new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,weekday:'short',month:'short',day:'numeric'}).format(date);
    const time=new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,hour:'numeric',minute:'2-digit'}).format(date);
    return `${day} · ${time} ET`;
  }
  function latestScore(game){
    if(!game||!hasScore(game.awayScore)||!hasScore(game.homeScore))return'';
    return `${teamMeta(game.awayTeam).code} ${game.awayScore}–${game.homeScore} ${teamMeta(game.homeTeam).code}`;
  }
  function seriesLabel(a,b,state){
    if(state.winner){
      const winnerWins=state.winner===a?state.aWins:state.bWins;
      const loserWins=state.winner===a?state.bWins:state.aWins;
      return`${teamMeta(state.winner).code} advances ${winnerWins}-${loserWins}`;
    }
    if(state.aWins===state.bWins)return`Tied ${state.aWins}-${state.bWins}`;
    const leader=state.aWins>state.bWins?a:b;
    return`${teamMeta(leader).code} leads ${Math.max(state.aWins,state.bWins)}-${Math.min(state.aWins,state.bWins)}`;
  }
  function teamRow(team,wins,isWinner=false,isEliminated=false){
    const placeholder=isPlaceholder(team.name),seed=team.seed??teamSeed(team.name);
    const meta=teamMeta(team.name),tag=isWinner?'ADVANCED':isEliminated?'ELIMINATED':placeholder?'PENDING':'IN PLAY',classes=`wktw-bracket-team ${placeholder?'is-placeholder':''} ${isWinner?'is-series-winner':''} ${isEliminated?'is-eliminated':''}`;
    const content=`${teamLogo(team.name)}<span><small>${seed?`NO. ${safe(seed)}`:'ADVANCING TEAM'}</small><strong>${safe(team.name)}</strong></span><em>${safe(tag)}</em><b aria-label="${safe(wins)} series wins">${safe(wins)}</b>`;
    return placeholder?`<div class="${classes}">${content}</div>`:`<a class="${classes}" href="/team.html?team=${encodeURIComponent(meta.slug||'')}">${content}</a>`;
  }
  function matchupCard(match,round,target){
    const state=seriesState(match.a.name,match.b.name,round,target),placeholder=isPlaceholder(match.a.name)||isPlaceholder(match.b.name);
    const active=state.next,latest=state.latest;
    let detail='Series matchup pending';
    if(active){detail=isLive(active)?`LIVE · ${latestScore(active)} · ${active.status||'In progress'}`:`Next · Game ${active.gameNumber||state.games.filter(isFinal).length+1} · ${timeLabel(active)}`;}
    else if(latest){detail=`Game ${latest.gameNumber||state.games.filter(isFinal).length} final · ${latestScore(latest)}`;}
    else if(!placeholder){detail='Schedule loading from the WNBA feed';}
    const label=placeholder?'Matchup pending':seriesLabel(match.a.name,match.b.name,state);
    return `<article class="wktw-bracket-card ${state.winner?'is-complete':''}" data-bracket-matchup="${safe(match.id||pairKey(match.a.name,match.b.name))}"><div class="wktw-bracket-card-top"><span>${safe(label)}</span><b>${safe(round==='First Round'?'BEST OF 3':round==='Semifinals'?'BEST OF 5':'BEST OF 7')}</b></div>${teamRow(match.a,state.aWins,state.winner===match.a.name,Boolean(state.winner&&state.winner!==match.a.name))}${teamRow(match.b,state.bWins,state.winner===match.b.name,Boolean(state.winner&&state.winner!==match.b.name))}<p class="wktw-bracket-game ${active&&isLive(active)?'is-live':''}">${safe(detail)}</p></article>`;
  }
  function firstRoundState(match){return seriesState(match.a.name,match.b.name,'First Round',2);}
  function semifinalSlots(){
    const winner=index=>firstRoundState(FIRST_ROUND[index]).winner;
    return[
      {id:'semi-a',a:{name:winner(0)||'Winner 1 / 8',seed:teamSeed(winner(0))},b:{name:winner(1)||'Winner 4 / 5',seed:teamSeed(winner(1))}},
      {id:'semi-b',a:{name:winner(2)||'Winner 2 / 7',seed:teamSeed(winner(2))},b:{name:winner(3)||'Winner 3 / 6',seed:teamSeed(winner(3))}}
    ];
  }
  function finalsSlot(){
    const semis=semifinalSlots(),winner=index=>seriesState(semis[index].a.name,semis[index].b.name,'Semifinals',3).winner;
    return{id:'finals',a:{name:winner(0)||'Semifinal A winner',seed:teamSeed(winner(0))},b:{name:winner(1)||'Semifinal B winner',seed:teamSeed(winner(1))}};
  }
  function roundMarkup(label,subhead,matches,target){return `<section class="wktw-bracket-round"><header><span>${safe(label)}</span><small>${safe(subhead)}</small></header><div>${matches.map(match=>matchupCard(match,label,target)).join('')}</div></section>`;}
  function easternToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:EASTERN,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),get=type=>parts.find(part=>part.type===type)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;}
  function renderMount(mount){
    if(!mount?.isConnected){mounts.delete(mount);return;}
    const variant=mount.dataset.variant||'home';
    mount.classList.add('wktw-bracket',`is-${variant}`);
    const firstStates=FIRST_ROUND.map(firstRoundState),complete=firstStates.filter(state=>state.winner).length,teamsLeft=8-complete,today=easternToday(),todayGames=games.filter(game=>String(game.date||'').slice(0,10)===today),liveCount=todayGames.filter(isLive).length,next=todayGames.find(game=>!isFinal(game)&&!isLive(game))||games.filter(game=>!isFinal(game)&&!isLive(game)&&String(game.date||'')>=today).sort((a,b)=>(instant(a)?.getTime()||0)-(instant(b)?.getTime()||0))[0];
    mount.innerHTML=`<header class="wktw-bracket-head"><div><span>WE KNOW THE W · LIVE PLAYOFF TRACKER</span><h2>The playoff road, live.</h2><p>Series scores, eliminations, today’s slate and the next matchup refresh automatically from the official postseason page.</p></div><aside><i aria-hidden="true"></i><strong>LIVE BRACKET</strong><small data-bracket-updated>Refreshing</small></aside></header><div class="wktw-bracket-dashboard" aria-label="Playoff dashboard summary"><div><span>TEAMS LEFT</span><strong>${teamsLeft}</strong><small>of 8</small></div><div><span>SERIES CLOSED</span><strong>${complete}</strong><small>first round</small></div><div><span>TODAY</span><strong>${todayGames.length}</strong><small>${liveCount?`${liveCount} live`:'games'}</small></div><div><span>NEXT TIP</span><strong>${next?safe(teamMeta(next.awayTeam).code+' @ '+teamMeta(next.homeTeam).code):'TBD'}</strong><small>${next?safe(timeLabel(next)):'Schedule loading'}</small></div></div><div class="wktw-bracket-grid">${roundMarkup('First Round','Best of 3 · 1-1-1',FIRST_ROUND,2)}${roundMarkup('Semifinals','Best of 5 · begins Oct. 4',semifinalSlots(),3)}${roundMarkup('Finals','Best of 7 · begins Oct. 17',[finalsSlot()],4)}</div><footer><span><b>Status key:</b> green advanced · red eliminated · tap any team for its dashboard.</span><a href="/games.html">Full scores + schedule →</a></footer>`;
    const stamp=mount.querySelector('[data-bracket-updated]');
    if(stamp){const now=new Date();stamp.textContent=`Updated ${new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,hour:'numeric',minute:'2-digit'}).format(now)} ET`;}
  }
  function renderAll(){mounts.forEach(renderMount);}
  function installSeries(items=[]){items.filter(item=>item?.teamA&&item?.teamB).forEach(item=>seriesSnapshots.set(seriesKey(item.round||'First Round',item.teamA,item.teamB),item));}
  function fetchJson(url){return fetch(`${url}${url.includes('?')?'&':'?'}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{const payload=await response.json().catch(()=>({}));if(!response.ok)throw Error(payload.error||'Feed unavailable');return payload;});}
  async function refreshBase(){
    if(baseLoading)return;baseLoading=true;
    try{
      const [competitionResult,teamsResult]=await Promise.allSettled([fetchJson('/api/competition?season=2026'),fetchJson('/api/teams?currentLogos=20260928')]);
      if(competitionResult.status==='fulfilled'){games=mergeGames(FALLBACK_GAMES,competitionResult.value.playoffs?.games||[]);installSeries(competitionResult.value.playoffs?.series||[]);}
      if(teamsResult.status==='fulfilled'){
        (teamsResult.value.teams||[]).forEach(team=>{const src=String(team?.badge||team?.logo||'').trim();if(team?.name&&/^(?:\/|https?:\/\/)/i.test(src))logos.set(norm(team.name),src);});
      }
      renderAll();
    }finally{baseLoading=false;}
  }
  async function refreshLive(){
    if(liveLoading)return;liveLoading=true;
    try{const payload=await fetchJson('/api/live-games');games=mergeGames(FALLBACK_GAMES,games,payload.todayGames||[],payload.games||[],payload.upcomingGames||[],payload.recentGames||[]);installSeries(payload.playoffSeries||[]);renderAll();}catch{}finally{liveLoading=false;}
  }
  function start(){
    if(started||!mounts.size)return;started=true;
    renderAll();refreshBase();refreshLive();
    setInterval(()=>{if(!document.hidden)refreshLive();},10000);
    setInterval(()=>{if(!document.hidden)refreshBase();},60000);
    window.addEventListener('focus',refreshLive);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshLive();refreshBase();}});
  }
  function init(root=document){
    const found=[];
    if(root?.matches?.('[data-wktw-playoff-bracket]'))found.push(root);
    root?.querySelectorAll?.('[data-wktw-playoff-bracket]').forEach(node=>found.push(node));
    found.forEach(node=>{if(!mounts.has(node)){mounts.add(node);renderMount(node);}});
    if(found.length)start();
    return found.length;
  }

  window.WKTWPlayoffBracket={init,refresh:refreshBase,refreshLive};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();
