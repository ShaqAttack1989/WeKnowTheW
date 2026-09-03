(()=>{
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const short=(value='',limit=175)=>{const clean=text(value);return clean.length<=limit?clean:`${clean.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const norm=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const dateValue=item=>item?.published||item?.date||item?.updatedAt||item?.updated||item?.week||'';
  const timeValue=value=>{const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0;};
  const fmtDate=value=>{const parsed=new Date(String(value||''));return Number.isNaN(parsed.getTime())?text(value):parsed.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  const fmtShortDate=value=>{const parsed=new Date(String(value||''));return Number.isNaN(parsed.getTime())?text(value):parsed.toLocaleDateString([],{month:'short',day:'numeric'});};
  const fetchJson=async url=>{
    const joiner=url.includes('?')?'&':'?';
    const response=await fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };
  const fetchHtml=async url=>{
    const joiner=url.includes('?')?'&':'?';
    const response=await fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'text/html','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.text();
  };

  function buildShell(){
    const section=document.getElementById('this-week');
    const pageShell=section?.querySelector('.page-shell');
    if(!section||!pageShell||pageShell.dataset.weekHubReady==='1')return Boolean(pageShell);
    pageShell.dataset.weekHubReady='1';
    pageShell.innerHTML=`
      <div class="week-hub-shell">
        <header class="week-hub-head">
          <div>
            <p class="kicker">THIS WEEK IN THE W</p>
            <h2>The W, right now.</h2>
            <p>The freshest stories, numbers, roster news and basketball beyond the league, distilled from across We Know the W. Get the headline here, then go deeper.</p>
          </div>
          <span class="week-hub-stamp" id="weekHubStamp"><i aria-hidden="true"></i> Refreshing</span>
        </header>
        <section class="week-hub-search" aria-label="Search We Know the W">
          <div class="week-hub-search-copy"><span>PLAYERPEDIA + SITEWIDE SEARCH</span><strong>Who or what are you looking for?</strong></div>
          <div id="weekHubSearchSlot"></div>
        </section>
        <div class="week-editorial-grid">
          <article class="week-editorial-card food" id="weekHubFood"><div class="week-hub-loading">Finding the newest Food for Thought…</div></article>
          <article class="week-editorial-card byte" id="weekHubByte"><div class="week-hub-loading">Heating up the newest Snack Shak Byte…</div></article>
        </div>
        <div class="week-hub-divider"><span>FROM AROUND THE SITE</span><b></b></div>
        <div class="week-snapshot-grid">
          <article class="week-snapshot-card" id="weekHubStat"><div class="week-hub-loading">Checking the Stat Kitchen…</div></article>
          <article class="week-snapshot-card" id="weekHubRotations"><div class="week-hub-loading">Setting Shak’s rotations…</div></article>
          <article class="week-snapshot-card" id="weekHubLive"><div class="week-hub-loading">Checking live stats…</div></article>
          <article class="week-snapshot-card" id="weekHubGames"><div class="week-hub-loading">Checking the schedule…</div></article>
          <article class="week-snapshot-card" id="weekHubRoster"><div class="week-hub-loading">Checking movement and availability…</div></article>
          <article class="week-snapshot-card" id="weekHubUnrivaled"><div class="week-hub-loading">Checking Unrivaled…</div></article>
          <article class="week-snapshot-card" id="weekHubUpshot"><div class="week-hub-loading">Checking the UPSHOT pipeline…</div></article>
          <article class="week-snapshot-card" id="weekHubFiba"><div class="week-hub-loading">Checking FIBA basketball…</div></article>
          <article class="week-snapshot-card" id="weekHubCollege"><div class="week-hub-loading">Checking college hoops…</div></article>
        </div>
        <footer class="week-hub-foot"><span>One front door. The full encyclopedia is still underneath it.</span><a href="#sections">Explore every section →</a></footer>
      </div>`;

    const searchSection=document.getElementById('sitewide-search');
    const searchBox=searchSection?.querySelector('.home-search-box');
    const slot=document.getElementById('weekHubSearchSlot');
    if(searchBox&&slot)slot.appendChild(searchBox);
    if(searchSection)searchSection.hidden=true;
    return true;
  }

  function collectStories(value,source,output=[],seen=new Set()){
    if(Array.isArray(value)){value.forEach(item=>collectStories(item,source,output,seen));return output;}
    if(!value||typeof value!=='object')return output;
    if(value.title&&typeof value.title==='string'){
      const signature=`${text(value.slug||value.title)}|${text(dateValue(value))}`;
      if(!seen.has(signature)){
        seen.add(signature);
        output.push({...value,_source:source});
      }
    }
    Object.values(value).forEach(item=>{if(item&&typeof item==='object')collectStories(item,source,output,seen);});
    return output;
  }
  function storyText(story={}){
    if(story.dek||story.summary||story.excerpt||story.copy)return short(story.dek||story.summary||story.excerpt||story.copy,205);
    const first=(story.sections||[]).flatMap(section=>section?.paragraphs||[]).find(Boolean);
    return short(first||'Open the full piece for Shak’s complete read.',205);
  }
  function storyHref(story={},kind='byte'){
    const direct=story.dashboardUrl||story.href||story.path||story.internalUrl;
    if(direct&&String(direct).startsWith('/'))return direct;
    if(story.slug)return `/snack-shak.html?post=${encodeURIComponent(story.slug)}#latest`;
    return kind==='food'?'/food-for-thought.html':'/snack-shak-bytes.html';
  }
  function storyLabel(story={}){return text(story.seriesLabel||story.series||story.category||story.type||'Snack Shak');}
  function classificationText(story={}){return norm([story.type,story.kind,story.category,story.seriesLabel,story.series,story.slug,story.title,story._source].filter(Boolean).join(' '));}
  function isByte(story={}){return /\bbyte\b|snack\s*shak\s*byte/.test(classificationText(story));}
  function isFood(story={}){return /food\s*for\s*thought|food.*thought|long\s*form|longform|deep\s*dive|analysis/.test(classificationText(story));}
  function freshest(stories=[],predicate=()=>true){return stories.filter(predicate).sort((a,b)=>timeValue(dateValue(b))-timeValue(dateValue(a))||Number(b.priority||0)-Number(a.priority||0))[0]||null;}

  function renderEditorial(host,story,kind){
    if(!host)return;
    if(!story){
      host.innerHTML=`<span class="week-card-kicker">${kind==='food'?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'}</span><h3>Fresh plate incoming.</h3><p>The newest ${kind==='food'?'long-form read':'quick bite'} is reconnecting to the homepage.</p><a href="${kind==='food'?'/food-for-thought.html':'/snack-shak-bytes.html'}">Open the archive →</a>`;
      return;
    }
    host.innerHTML=`
      <div class="week-editorial-top"><span class="week-card-kicker">${kind==='food'?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'}</span><span class="week-card-date">${safe(fmtDate(dateValue(story)))}</span></div>
      <span class="week-story-series">${safe(storyLabel(story))}</span>
      <h3>${safe(story.title)}</h3>
      <p>${safe(storyText(story))}</p>
      <a href="${safe(storyHref(story,kind))}">${kind==='food'?'Read the full thought':'Grab the Byte'} →</a>`;
  }

  function snapshot(host,{kicker,title,copy,meta='',href,label='Explore',secondaryHref='',secondaryLabel=''}){
    if(!host)return;
    host.innerHTML=`
      <div class="week-snapshot-top"><span class="week-card-kicker">${safe(kicker)}</span>${meta?`<span class="week-card-meta">${safe(meta)}</span>`:''}</div>
      <h3>${safe(title)}</h3>
      <p>${safe(copy)}</p>
      <div class="week-card-actions"><a href="${safe(href)}">${safe(label)} →</a>${secondaryHref?`<a class="secondary" href="${safe(secondaryHref)}">${safe(secondaryLabel||'More')} →</a>`:''}</div>`;
  }
  function snapshotError(host,kicker,title,href){snapshot(host,{kicker,title,copy:'This section is reconnecting. The full page is still available.',href,label:'Open section'});}

  async function loadEditorial(){
    const feeds=['/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];
    const results=await Promise.allSettled(feeds.map(fetchJson));
    const stories=[];
    results.forEach((result,index)=>{if(result.status==='fulfilled')collectStories(result.value,feeds[index],stories);});
    const latestFood=freshest(stories,isFood)||freshest(stories,story=>!isByte(story));
    const latestByte=freshest(stories,isByte);
    renderEditorial(document.getElementById('weekHubFood'),latestFood,'food');
    renderEditorial(document.getElementById('weekHubByte'),latestByte,'byte');
    return Math.max(timeValue(dateValue(latestFood)),timeValue(dateValue(latestByte)));
  }

  function usefulPageCopy(html=''){
    const doc=new DOMParser().parseFromString(html,'text/html');
    doc.querySelectorAll('script,style,nav,footer').forEach(node=>node.remove());
    const candidates=[...doc.querySelectorAll('main .page-heading p,main .hero-copy,main article p,main .page-note,main section p,main p')]
      .map(node=>text(node.textContent))
      .filter(value=>value.length>=45&&value.length<=420)
      .filter(value=>!/(independent, fan-built|back to top|all rights reserved|privacy|cookie)/i.test(value));
    return short(candidates[0]||'',185);
  }

  async function loadStaticSnapshots(){
    const stat=document.getElementById('weekHubStat');
    const unrivaled=document.getElementById('weekHubUnrivaled');
    const upshot=document.getElementById('weekHubUpshot');
    const results=await Promise.allSettled([fetchHtml('/stat-kitchen.html'),fetchHtml('/unrivaled.html'),fetchHtml('/the-call-up.html')]);
    const statCopy=results[0].status==='fulfilled'?usefulPageCopy(results[0].value):'';
    snapshot(stat,{kicker:'STAT KITCHEN',title:'The latest numbers on the stove',copy:statCopy||'The Stat Kitchen is tracking the newest leaderboards, milestones and number-driven context from around the W.',meta:'LATEST SNAPSHOT',href:'/stat-kitchen.html',label:'Open Stat Kitchen'});
    const unrivaledCopy=results[1].status==='fulfilled'?usefulPageCopy(results[1].value):'';
    snapshot(unrivaled,{kicker:'NO OFFSEASON · UNRIVALED',title:'The 3-on-3 shelf',copy:unrivaledCopy||'Clubs, affiliations, standings and the W players who keep hooping when the league season ends.',href:'/unrivaled.html',label:'Open Unrivaled'});
    const upshotCopy=results[2].status==='fulfilled'?usefulPageCopy(results[2].value):'';
    snapshot(upshot,{kicker:'UPSHOT · THE CALL UP',title:'Who is pushing toward the W?',copy:upshotCopy||'The expansion pipeline, call-ups and next-wave players are tracked here without crowding the front page.',href:'/the-call-up.html',label:'Open The Call Up'});
  }

  function latestRotation(payload={},keyName){return [...(payload[keyName]||[])].sort((a,b)=>String(b.week||'').localeCompare(String(a.week||'')))[0]||{};}
  async function loadRotations(){
    const host=document.getElementById('weekHubRotations');
    try{
      const data=await fetchJson('/rotation-history.json');
      const sf=latestRotation(data,'startingFive'),bm=latestRotation(data,'benchMob');
      const names=(sf.picks||[]).map(item=>item.name).filter(Boolean);
      const week=sf.week||bm.week;
      snapshot(host,{kicker:'SHAK’S MOCK ROTATIONS',title:names.length?`The five: ${names.slice(0,3).join(', ')}${names.length>3?' +2':''}`:'This week’s five is setting',copy:names.length?`Shak’s latest Starting Five is ${names.join(', ')}. The Bench Mob is refreshed on the same weekly board.`:'The newest Starting Five and Bench Mob are reconnecting.',meta:week?`WEEK OF ${fmtShortDate(week)}`:'THIS WEEK',href:'/starting-five.html',label:'See Starting Five',secondaryHref:'/bench-mob.html',secondaryLabel:'Bench Mob'});
      return timeValue(week||data.updatedAt);
    }catch{snapshotError(host,'SHAK’S MOCK ROTATIONS','This week’s rotation','/starting-five.html');return 0;}
  }

  function standingsRows(stats={}){return Array.isArray(stats.standings)?stats.standings:(Array.isArray(stats?.standings?.overall)?stats.standings.overall:[]);}
  function gameTime(game={}){
    const raw=game.startTimeUtc||game.strTimestamp||game.timestamp||'';
    const parsed=raw?new Date(raw):game.date?new Date(`${game.date}T${game.time||'12:00:00'}`):null;
    if(!parsed||Number.isNaN(parsed.getTime()))return game.date||'TBD';
    return parsed.toLocaleString([],{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }
  function gameTitle(game={}){return `${game.awayTeam||game.away?.name||'TBD'} @ ${game.homeTeam||game.home?.name||'TBD'}`;}
  async function loadLeagueData(){
    const liveHost=document.getElementById('weekHubLive'),gamesHost=document.getElementById('weekHubGames');
    try{
      const stats=await fetchJson('/api/stats?season=2026');
      const rows=standingsRows(stats).sort((a,b)=>Number(a.overall_rank||a.playoff_seed||999)-Number(b.overall_rank||b.playoff_seed||999));
      const leader=rows[0];
      const live=Array.isArray(stats.liveGames)?stats.liveGames:[];
      const upcoming=Array.isArray(stats.upcomingGames)?stats.upcomingGames:[];
      const team=leader?.team?.full_name||leader?.team||'Standings leader';
      const record=Number.isFinite(Number(leader?.wins))?`${leader.wins}-${leader.losses}`:'';
      snapshot(liveHost,{kicker:'LIVE STATS',title:leader?`${team}${record?` · ${record}`:''}`:'Standings are refreshing',copy:live.length?`${live.length} WNBA game${live.length===1?' is':'s are'} live right now. The full standings and current game state are one click away.`:'No WNBA game is live at this moment. Current standings and season numbers are still refreshed on the live board.',meta:live.length?'LIVE NOW':'CURRENT SEASON',href:'/live-stats.html',label:'Open Live Stats'});
      const game=live[0]||upcoming[0];
      snapshot(gamesHost,{kicker:'GAMES',title:game?gameTitle(game):'Next tip is loading',copy:game?`${live.length?'Happening now':'Next on the schedule'} · ${gameTime(game)}${game.status?` · ${game.status}`:''}`:'The schedule is between loaded windows. Open Games for the full slate, results and broadcast information.',meta:live.length?'LIVE':'UP NEXT',href:'/games.html',label:'Open Games'});
      return timeValue(stats.checkedAt||stats.updatedAt);
    }catch{
      snapshotError(liveHost,'LIVE STATS','Current standings','/live-stats.html');
      snapshotError(gamesHost,'GAMES','Current schedule','/games.html');
      return 0;
    }
  }

  async function loadRoster(){
    const host=document.getElementById('weekHubRoster');
    const [moveR,availR]=await Promise.allSettled([fetchJson('/api/player-movement'),fetchJson('/api/availability')]);
    const movement=moveR.status==='fulfilled'?moveR.value:{};
    const availability=availR.status==='fulfilled'?availR.value:{};
    const move=(movement.transactions||[])[0];
    const injuryCount=Number(availability.injuryCount)||((availability.injuries||[]).length||0);
    if(move){
      const action=text(move.type||'ROSTER MOVE').replace(/_/g,' ');
      const detail=short(move.detail||`${move.player} · ${move.team}`,135);
      snapshot(host,{kicker:'PLAYER WIRE',title:`${move.player} · ${action}`,copy:`${detail}${injuryCount?` Availability board: ${injuryCount} tracked status${injuryCount===1?'':'es'}.`:''}`,meta:move.date?fmtShortDate(move.date):'LATEST MOVE',href:'/player-movement.html',label:'Player Movement',secondaryHref:'/availability-report.html',secondaryLabel:'Availability'});
    }else{
      snapshot(host,{kicker:'PLAYER WIRE',title:'Movement + availability',copy:injuryCount?`${injuryCount} current availability status${injuryCount===1?' is':'es are'} being tracked. The movement feed is reconnecting.`:'Current movement and availability are refreshing.',href:'/player-movement.html',label:'Player Movement',secondaryHref:'/availability-report.html',secondaryLabel:'Availability'});
    }
    return Math.max(timeValue(movement.checkedAt||movement.latestTransactionDate),timeValue(availability.checkedAt||availability.latestReportDate));
  }

  function collectObjects(value,output=[]){
    if(Array.isArray(value)){value.forEach(item=>collectObjects(item,output));return output;}
    if(!value||typeof value!=='object')return output;
    output.push(value);
    Object.values(value).forEach(item=>{if(item&&typeof item==='object')collectObjects(item,output);});
    return output;
  }
  function fibaTeamName(side={}){return side.name||side.full_name||side.code||'';}
  async function loadFiba(){
    const host=document.getElementById('weekHubFiba');
    try{
      const data=await fetchJson('/api/fiba-world-cup');
      const objects=collectObjects(data,[]);
      const games=objects.filter(item=>item&&item!==data&&(item.home||item.homeTeam)&&(item.away||item.awayTeam));
      const usaGames=games.filter(game=>/united states|\busa\b/i.test(`${fibaTeamName(game.home||{})} ${fibaTeamName(game.away||{})} ${game.homeTeam||''} ${game.awayTeam||''}`));
      const future=usaGames.filter(game=>{
        const value=game.startTimeUtc||game.date||'';
        const when=timeValue(value);
        return !when||when>=Date.now()-3*60*60*1000;
      }).sort((a,b)=>timeValue(a.startTimeUtc||a.date)-timeValue(b.startTimeUtc||b.date));
      const game=future[0]||usaGames[0];
      let title='World Cup watch · Berlin 2026',copy='Team USA, group play, standings and player stats are tracked in the FIBA World Cup dashboard.';
      if(game){
        const home=game.homeTeam||fibaTeamName(game.home||{}),away=game.awayTeam||fibaTeamName(game.away||{});
        title='USA World Cup watch';
        copy=`${away||'TBD'} vs. ${home||'TBD'} · ${gameTime({...game,awayTeam:away,homeTeam:home})}. Follow the full tournament and Team USA from the dedicated dashboard.`;
      }
      snapshot(host,{kicker:'FIBA BASKETBALL',title,copy,meta:'WORLD CUP 2026',href:'/fiba-world-cup.html',label:'Open FIBA World Cup'});
      return timeValue(data.checkedAt||data.updatedAt);
    }catch{snapshotError(host,'FIBA BASKETBALL','World Cup watch','/fiba-world-cup.html');return 0;}
  }

  async function loadCollege(){
    const host=document.getElementById('weekHubCollege');
    try{
      const data=await fetchJson('/college-snapshot-2025-26.json');
      const champ=data.championship||{};
      snapshot(host,{kicker:'COLLEGE HOOPS',title:champ.champion?`${champ.champion} · reigning champion`:'The college pipeline',copy:champ.champion?`${champ.champion} closed ${data.season||'the season'} at ${champ.record||'the top'} with a ${champ.score||''} title-game win over ${champ.runnerUp||'the runner-up'}. The offseason snapshot stays up while 2026-27 comes into view.`:'Prospects, leaders and the college-to-W pipeline live in Class Is in Session.',meta:data.season||'NCAAW',href:'/class-is-in-session.html',label:'Open College Hoops'});
      return timeValue(champ.date);
    }catch{snapshotError(host,'COLLEGE HOOPS','The college pipeline','/class-is-in-session.html');return 0;}
  }

  function setStamp(values=[]){
    const stamp=document.getElementById('weekHubStamp');
    if(!stamp)return;
    const newest=Math.max(...values.filter(Number.isFinite),0);
    const now=new Date();
    stamp.innerHTML=`<i aria-hidden="true"></i> Updated ${safe(now.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))}`;
    stamp.title=newest?`Newest source date: ${new Date(newest).toLocaleString()}`:'Homepage sources refreshed just now';
  }

  let loading=false;
  async function loadHub(){
    if(loading)return;
    loading=true;
    try{
      const results=await Promise.allSettled([loadEditorial(),loadStaticSnapshots(),loadRotations(),loadLeagueData(),loadRoster(),loadFiba(),loadCollege()]);
      const stamps=results.map(result=>result.status==='fulfilled'&&Number.isFinite(Number(result.value))?Number(result.value):0);
      setStamp(stamps);
    }finally{loading=false;}
  }

  function init(){
    if(!buildShell())return;
    loadHub();
    setInterval(()=>{if(!document.hidden)loadHub();},300000);
    window.addEventListener('focus',loadHub);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadHub();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
