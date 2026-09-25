(()=>{
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const short=(value='',limit=175)=>{const clean=text(value);return clean.length<=limit?clean:`${clean.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const norm=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const slugify=value=>norm(value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const dateValue=item=>item?.published||item?.date||item?.updatedAt||item?.updated||item?.week||'';
  const timeValue=value=>{const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0;};
  const localDate=value=>{const raw=String(value||'').trim();const parsed=new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw)?`${raw}T12:00:00`:raw);return parsed;};
  const fmtDate=value=>{const parsed=localDate(value);return Number.isNaN(parsed.getTime())?text(value):parsed.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  const fmtShortDate=value=>{const parsed=localDate(value);return Number.isNaN(parsed.getTime())?text(value):parsed.toLocaleDateString([],{month:'short',day:'numeric'});};
  const sitePhoto=value=>/^(?:\/|https?:\/\/)/i.test(String(value||'').trim())?String(value).trim():'';
  const validFocus=value=>/^\d{1,3}%\s+\d{1,3}%$/.test(String(value||'').trim())?String(value).trim():'50% 50%';
  const imageFit=value=>String(value||'').toLowerCase()==='contain'?'contain':'cover';

  const MEDIA={
    stats:'/assets/images/snack-shak/power-rankings-vs-standings-aug30.webp',
    games:'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628931.png',
    mockAwards:'/assets/images/snack-shak/we-know-the-w-mock-awards-2026.svg'
  };
  const PLAYER_FALLBACK_PHOTOS=new Map([
    [norm('Aminata Gueye'),'https://assets.fiba.basketball/image/upload/w_720,h_960,c_pad,g_north/f_png/q_auto/.headshot--person_269523--competition_208875']
  ]);

  const TEAM_BADGES=new Map();
  const teamBadge=name=>TEAM_BADGES.get(norm(name))||'';
  function storeTeamBadges(payload={}){
    const teams=Array.isArray(payload.teams)?payload.teams:[];
    teams.forEach(team=>{
      const src=sitePhoto(team?.badge||team?.logo||'');
      if(team?.name&&src)TEAM_BADGES.set(norm(team.name),src);
    });
  }
  function hydrateHeaderBadges(){
    document.querySelectorAll('[data-team-logo]').forEach(host=>{
      const name=host.getAttribute('data-team-logo')||'';
      const src=teamBadge(name);
      host.innerHTML=src?'<img src="'+safe(src)+'" alt="" loading="lazy" decoding="async">':'<b aria-hidden="true">W</b>';
    });
  }
  const fetchJson=async url=>{
    if(window.WHomeData?.get)return window.WHomeData.get(url,{ttl:15000});
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

  function mediaSpec({src='',alt='',focus='50% 50%',mobileFocus='',fit='cover',className=''}={}){
    return {src:sitePhoto(src),alt:text(alt),focus:validFocus(focus),mobileFocus:validFocus(mobileFocus||focus),fit:imageFit(fit),className:text(className)};
  }

  function mediaMarkup(media,kicker=''){
    const items=(Array.isArray(media)?media:[media]).filter(Boolean).map(item=>mediaSpec(item)).filter(item=>item.src);
    const label=safe(kicker);
    if(!items.length){
      return `<div class="week-snapshot-media week-media-fallback" role="img" aria-label="${safe(kicker||'We Know the W')} visual"><span>${label}</span><b aria-hidden="true">W</b></div>`;
    }
    let classes=items.length>1?'week-snapshot-media week-media-strip':'week-snapshot-media';
    if(items.some(item=>item.className.split(/\s+/).includes('official-team-logo')))classes+=' official-team-logos';
    if(items.some(item=>item.className.split(/\s+/).includes('player-headshot')))classes+=' player-headshots';
    if(items.some(item=>item.className.split(/\s+/).includes('dashboard-preview')))classes+=' dashboard-preview';
    const images=items.map(item=>`<img src="${safe(item.src)}" alt="${safe(item.alt)}" loading="lazy" decoding="async" style="--media-focus:${safe(item.focus)};--media-focus-mobile:${safe(item.mobileFocus)}"${item.className?` class="${safe(item.className)}"`:''}>`).join('');
    return `<div class="${classes}">${images}<span>${label}</span></div>`;
  }

  function wireMediaFallback(host){
    if(!host)return;
    host.querySelectorAll('.week-snapshot-media img,.week-editorial-media img').forEach(img=>{
      img.addEventListener('error',()=>{
        const media=img.closest('.week-snapshot-media,.week-editorial-media');
        img.remove();
        if(media&&!media.querySelector('img'))media.classList.add('week-media-fallback');
      },{once:true});
    });
  }

  function explicitStoryImage(story={}){
    const direct=[story.tileImage,story.featuredImage,story.image,story.storyImage,story.imageUrl,story.thumbnail,story.heroImage,story.media?.image,story.media?.thumbnail]
      .map(sitePhoto).find(Boolean)||'';
    return mediaSpec({
      src:direct,
      alt:story.imageAlt||story.alt||story.title||'Story image',
      focus:story.imageFocus||story.tileFocus||'50% 38%',
      mobileFocus:story.mobileImageFocus||story.mobileTileFocus||story.imageFocus||story.tileFocus||'50% 32%',
      fit:story.imageFit
    });
  }

  function buildShell(){
    const section=document.getElementById('this-week');
    const pageShell=section?.querySelector('.page-shell');
    if(!section||!pageShell||pageShell.dataset.weekHubReady==='1')return Boolean(pageShell);
    pageShell.dataset.weekHubReady='1';
    pageShell.innerHTML=`
      <div class="week-hub-shell">
        <header class="week-hub-head">
          <div class="week-hub-head-copy">
            <p class="kicker">THIS WEEK IN THE W</p>
            <h2>The W, right now.</h2>
            <p>The freshest stories, numbers, roster news and basketball beyond the league, distilled from across We Know the W. Get the headline here, then go deeper.</p>
          </div>
          <div class="week-hub-head-visual" aria-hidden="true">
            <span class="week-head-photo one" data-team-logo="Atlanta Dream"><b aria-hidden="true">W</b></span>
            <span class="week-head-photo two" data-team-logo="Dallas Wings"><b aria-hidden="true">W</b></span>
            <span class="week-head-photo three" data-team-logo="Las Vegas Aces"><b aria-hidden="true">W</b></span>
            <span class="week-head-visual-label">LIVE EDITION</span>
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
          <article class="week-snapshot-card" id="weekHubMovement"><div class="week-hub-loading">Checking player movement…</div></article>
          <article class="week-snapshot-card" id="weekHubAvailability"><div class="week-hub-loading">Checking availability…</div></article>
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
      if(!seen.has(signature)){seen.add(signature);output.push({...value,_source:source});}
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
    if(story.slug)return kind==='food'?`/food-for-thought.html?post=${encodeURIComponent(story.slug)}#story`:`/snack-shak-bytes.html?post=${encodeURIComponent(story.slug)}#story`;
    return kind==='food'?'/food-for-thought.html':'/snack-shak-bytes.html';
  }
  function storyLabel(story={}){return text(story.seriesLabel||story.series||story.category||story.type||'Snack Shak');}
  function classificationText(story={}){return norm([story.type,story.kind,story.category,story.seriesLabel,story.series,story.slug,story.title,story._source].filter(Boolean).join(' '));}
  function isByte(story={}){return /\bbyte\b|snack\s*shak\s*byte/.test(classificationText(story));}
  function isFood(story={}){return /food\s*for\s*thought|food.*thought|long\s*form|longform|deep\s*dive|analysis/.test(classificationText(story));}
  function freshest(stories=[],predicate=()=>true){return stories.filter(predicate).sort((a,b)=>timeValue(dateValue(b))-timeValue(dateValue(a))||Number(b.priority||0)-Number(a.priority||0))[0]||null;}

  function editorialMedia(story,kind){
    const image=explicitStoryImage(story||{});
    const tag=kind==='food'?'FEATURED READ':'QUICK HIT';
    if(!image.src)return `<figure class="week-editorial-media week-media-fallback" role="img" aria-label="${safe(story?.title||tag)}"><b aria-hidden="true">W</b><span class="week-media-tag">${tag}</span></figure>`;
    return `<figure class="week-editorial-media"><img src="${safe(image.src)}" alt="${safe(image.alt)}" loading="${kind==='food'?'eager':'lazy'}" decoding="async" style="--media-fit:${image.fit};--media-focus:${safe(image.focus)};--media-focus-mobile:${safe(image.mobileFocus)}"><span class="week-media-tag">${tag}</span></figure>`;
  }

  function renderEditorial(host,story,kind){
    if(!host)return;
    const archiveHref=kind==='food'?'/food-for-thought.html':'/snack-shak-bytes.html';
    const destination=story?storyHref(story,kind):archiveHref;
    host.dataset.href=destination;
    host.setAttribute('role','link');
    host.tabIndex=0;
    if(!story){
      host.innerHTML=`${editorialMedia(null,kind)}<div class="week-editorial-body"><div class="week-editorial-top"><span class="week-card-kicker">${kind==='food'?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'}</span><span class="week-card-date">RECONNECTING</span></div><h3>Fresh plate incoming.</h3><p>The newest ${kind==='food'?'long-form read':'quick bite'} is reconnecting to the homepage.</p><a href="${archiveHref}">Open the archive →</a></div>`;
      wireMediaFallback(host);
      return;
    }
    host.innerHTML=`${editorialMedia(story,kind)}<div class="week-editorial-body"><div class="week-editorial-top"><span class="week-card-kicker">${kind==='food'?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'}</span><span class="week-card-date">${safe(fmtDate(dateValue(story)))}</span></div><span class="week-story-series">${safe(storyLabel(story))}</span><h3>${safe(story.title)}</h3><p>${safe(storyText(story))}</p><a href="${safe(destination)}">${kind==='food'?'Read the full thought':'Grab the Byte'} →</a></div>`;
    wireMediaFallback(host);
  }

  function snapshot(host,{kicker,title,copy,meta='',href,label='Explore',secondaryHref='',secondaryLabel='',media=[]}){
    if(!host)return;
    host.dataset.href=href;
    host.setAttribute('role','link');
    host.tabIndex=0;
    host.innerHTML=`${mediaMarkup(media,kicker)}<div class="week-snapshot-content"><div class="week-snapshot-top"><span class="week-card-kicker">${safe(kicker)}</span>${meta?`<span class="week-card-meta">${safe(meta)}</span>`:''}</div><h3>${safe(title)}</h3><p>${safe(copy)}</p><div class="week-card-actions"><a href="${safe(href)}">${safe(label)} →</a>${secondaryHref?`<a class="secondary" href="${safe(secondaryHref)}">${safe(secondaryLabel||'More')} →</a>`:''}</div></div>`;
    wireMediaFallback(host);
  }
  function snapshotError(host,kicker,title,href){snapshot(host,{kicker,title,copy:'This section is reconnecting. The full page is still available.',href,label:'Open section'});}

  function wireTileNavigation(){
    const section=document.getElementById('this-week');
    if(!section||section.dataset.tileNavigationReady==='1')return;
    section.dataset.tileNavigationReady='1';
    const open=event=>{
      const tile=event.target.closest('.week-editorial-card[data-href],.week-snapshot-card[data-href]');
      if(!tile||event.target.closest('a,button,input,select,textarea,label,summary'))return;
      if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
      if(event.type==='keydown')event.preventDefault();
      location.href=tile.dataset.href;
    };
    section.addEventListener('click',open);
    section.addEventListener('keydown',open);
  }

  async function loadEditorial(){
    const feeds=['/snack-shak-love-and-basketball.json','/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];
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
      .map(node=>text(node.textContent)).filter(value=>value.length>=45&&value.length<=420)
      .filter(value=>!/(independent, fan-built|back to top|all rights reserved|privacy|cookie)/i.test(value));
    return short(candidates[0]||'',185);
  }

  async function loadStaticSnapshots(){
    const stat=document.getElementById('weekHubStat');
    const results=await Promise.allSettled([fetchHtml('/stat-kitchen.html')]);
    const statCopy=results[0].status==='fulfilled'?usefulPageCopy(results[0].value):'';
    snapshot(stat,{kicker:'STAT KITCHEN',title:'The latest numbers on the stove',copy:statCopy||'The Stat Kitchen is tracking the newest leaderboards, milestones and number-driven context from around the W.',meta:'LATEST SNAPSHOT',href:'/stat-kitchen.html',label:'Open Stat Kitchen',media:[{src:MEDIA.stats,alt:'Current WNBA standings snapshot',focus:'50% 38%',mobileFocus:'50% 38%',className:'dashboard-preview'}]});
  }

  function latestRotation(payload={},keyName){return [...(payload[keyName]||[])].sort((a,b)=>String(b.week||'').localeCompare(String(a.week||'')))[0]||{};}
  async function loadRotations(){
    const host=document.getElementById('weekHubRotations');
    try{
      const data=await fetchJson('/rotation-history.json');
      const sf=latestRotation(data,'startingFive'),bm=latestRotation(data,'benchMob');
      const picks=Array.isArray(sf.picks)?sf.picks:[];
      const names=picks.map(item=>item.name).filter(Boolean);
      const week=sf.week||bm.week;
      const rotationMedia=picks.slice(0,3).map(item=>({src:item.photo||'',alt:item.name||'Shak rotation selection',focus:'50% 20%',mobileFocus:'50% 16%',className:'player-headshot'})).filter(item=>item.src);
      snapshot(host,{kicker:'SHAK’S MOCK ROTATIONS',title:names.length?`The five: ${names.slice(0,3).join(', ')}${names.length>3?' +2':''}`:'This week’s five is setting',copy:names.length?`Shak’s latest Starting Five is ${names.join(', ')}. The Bench Mob is refreshed on the same weekly board.`:'The newest Starting Five and Bench Mob are reconnecting.',meta:week?`WEEK OF ${fmtShortDate(week)}`:'THIS WEEK',href:'/starting-five.html',label:'See Starting Five',secondaryHref:'/bench-mob.html',secondaryLabel:'Bench Mob',media:rotationMedia});
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
  function awayName(game={}){return game.awayTeam||game.away?.name||'TBD';}
  function homeName(game={}){return game.homeTeam||game.home?.name||'TBD';}
  function gameTitle(game={}){return `${awayName(game)} @ ${homeName(game)}`;}
  function gameMedia(game={}){
    const away=awayName(game),home=homeName(game);
    return [
      {src:teamBadge(away),alt:`${away} official team logo`,focus:'50% 50%',className:'official-team-logo'},
      {src:teamBadge(home),alt:`${home} official team logo`,focus:'50% 50%',className:'official-team-logo'}
    ].filter(item=>item.src);
  }

  async function loadLeagueData(){
    const liveHost=document.getElementById('weekHubLive'),gamesHost=document.getElementById('weekHubGames');
    try{
      const [statsResult,teamsResult,competitionResult]=await Promise.allSettled([
        fetchJson('/api/stats?season=2026'),
        fetchJson('/api/teams?currentLogos=20260925'),
        fetchJson('/api/competition?season=2026')
      ]);
      if(statsResult.status!=='fulfilled')throw statsResult.reason;
      const stats=statsResult.value;
      if(teamsResult.status==='fulfilled')storeTeamBadges(teamsResult.value);
      hydrateHeaderBadges();
      const competition=competitionResult.status==='fulfilled'?competitionResult.value:{};
      const rows=standingsRows(stats).sort((a,b)=>Number(a.overall_rank||a.playoff_seed||999)-Number(b.overall_rank||b.playoff_seed||999));
      const leader=rows[0];
      const live=Array.isArray(stats.liveGames)?stats.liveGames:[];
      const upcoming=Array.isArray(stats.upcomingGames)?stats.upcomingGames:[];
      const playoffGames=Array.isArray(competition.playoffs?.games)?competition.playoffs.games:[];
      const playoffLive=playoffGames.filter(game=>String(game.state||'').toLowerCase()==='in');
      const playoffUpcoming=playoffGames.filter(game=>!game.completed&&String(game.state||'').toLowerCase()!=='in').sort((a,b)=>Date.parse(a.startTimeUtc||a.date)-Date.parse(b.startTimeUtc||b.date));
      const team=leader?.team?.full_name||leader?.team||'Standings leader';
      const record=Number.isFinite(Number(leader?.wins))?`${leader.wins}-${leader.losses}`:'';
      snapshot(liveHost,{kicker:'LIVE STATS',title:leader?`${team}${record?` · ${record}`:''}`:'Standings are refreshing',copy:(live.length||playoffLive.length)?`${live.length+playoffLive.length} WNBA game${live.length+playoffLive.length===1?' is':'s are'} live right now. The full standings and current game state are one click away.`:'No WNBA game is live at this moment. Final regular-season standings remain available while the playoff board is ready for Sunday.',meta:(live.length||playoffLive.length)?'LIVE NOW':'PLAYOFF READY',href:'/live-stats.html',label:'Open Live Stats',media:[{src:MEDIA.stats,alt:'WNBA standings snapshot',focus:'50% 38%',className:'dashboard-preview'}]});
      const game=playoffLive[0]||live[0]||playoffUpcoming[0]||upcoming[0];
      const isPlayoff=Boolean(game&&(playoffLive.includes(game)||playoffUpcoming.includes(game)||game.playoff));
      const gameVisual=gameMedia(game);
      snapshot(gamesHost,{kicker:isPlayoff?'PLAYOFF GAMES':'GAMES',title:game?gameTitle(game):'Next tip is loading',copy:game?`${playoffLive.includes(game)||live.includes(game)?'Happening now':isPlayoff?'First round next':'Next on the schedule'} · ${gameTime(game)}${game.status?` · ${game.status}`:''}`:'The playoff slate is loading. Open Games for the full bracket, results and broadcast information.',meta:(playoffLive.length||live.length)?'LIVE':isPlayoff?'PLAYOFFS · GAME 1':'UP NEXT',href:'/games.html',label:'Open Games',media:gameVisual.length?gameVisual:[{src:MEDIA.games,alt:'Official WNBA player media for the 2026 playoff field',focus:'50% 18%',mobileFocus:'50% 15%',fit:'contain',className:'player-headshot'}]});
      return Math.max(timeValue(stats.checkedAt||stats.updatedAt),timeValue(competition.updatedAt));
    }catch{
      snapshotError(liveHost,'LIVE STATS','Current standings','/live-stats.html');
      snapshot(gamesHost,{kicker:'PLAYOFF GAMES',title:'First round starts Sunday',copy:'Open the playoff game board for all four Game 1 matchups, seeds, tip times and broadcast information.',meta:'PLAYOFFS',href:'/games.html',label:'Open Games',media:[{src:MEDIA.games,alt:'Official WNBA player media for the 2026 playoff field',focus:'50% 18%',mobileFocus:'50% 15%',fit:'contain',className:'player-headshot'}]});
      return 0;
    }
  }

  async function loadPlayerWire(){
    const movementHost=document.getElementById('weekHubMovement');
    const availabilityHost=document.getElementById('weekHubAvailability');
    const [moveR,availR,playersR]=await Promise.allSettled([fetchJson('/api/player-movement'),fetchJson('/api/availability'),fetchJson('/api/players')]);
    const movement=moveR.status==='fulfilled'?moveR.value:{};
    const availability=availR.status==='fulfilled'?availR.value:{};
    const playerList=playersR.status==='fulfilled'&&Array.isArray(playersR.value?.players)?playersR.value.players:[];
    const playerPhoto=name=>{
      const player=playerList.find(item=>norm(item?.name)===norm(name));
      return sitePhoto(player?.photo||player?.headshot||player?.officialHeadshot||player?.photoThumb||'')||PLAYER_FALLBACK_PHOTOS.get(norm(name))||'';
    };
    const move=(movement.transactions||[])[0];
    const injuries=Array.isArray(availability.injuries)?availability.injuries:[];
    const latestAvailability=injuries[0];
    const injuryCount=Number(availability.injuryCount)||injuries.length||0;
    if(move){
      const action=text(move.type||'ROSTER MOVE').replace(/_/g,' ');
      const detail=short(move.detail||`${move.player} · ${move.team}`,135);
      const movePhoto=sitePhoto(move.photo||'')||playerPhoto(move.player);
      snapshot(movementHost,{kicker:'PLAYER MOVEMENT',title:`${move.player} · ${action}`,copy:detail,meta:move.date?fmtShortDate(move.date):'LATEST MOVE',href:'/player-movement.html',label:'Open Player Movement',media:movePhoto?[{src:movePhoto,alt:move.player||'Latest WNBA roster move',focus:'50% 18%',mobileFocus:'50% 15%',className:'player-headshot'}]:[]});
    }else{
      snapshot(movementHost,{kicker:'PLAYER MOVEMENT',title:'The roster wire is refreshing',copy:'Signings, waivers, trades and contract changes will return here as soon as the live feed reconnects.',href:'/player-movement.html',label:'Open Player Movement'});
    }
    if(latestAvailability){
      const status=text(latestAvailability.status||'STATUS').replace(/_/g,' ');
      const latestLine=short(latestAvailability.reason||`${latestAvailability.player} · ${latestAvailability.team}`,120);
      const availabilityPhoto=sitePhoto(latestAvailability.photo||'')||playerPhoto(latestAvailability.player);
      snapshot(availabilityHost,{kicker:'AVAILABILITY REPORT',title:`${injuryCount} tracked status${injuryCount===1?'':'es'}`,copy:`Latest: ${latestAvailability.player} · ${status}. ${latestLine}`,meta:availability.latestReportDate?fmtShortDate(availability.latestReportDate):'CURRENT REPORT',href:'/availability-report.html',label:'Open Availability',media:availabilityPhoto?[{src:availabilityPhoto,alt:latestAvailability.player||'Latest WNBA availability update',focus:'50% 18%',mobileFocus:'50% 15%',className:'player-headshot'}]:[]});
    }else{
      snapshot(availabilityHost,{kicker:'AVAILABILITY REPORT',title:'The status board is refreshing',copy:'Current injury designations, game status and return notes will return here as soon as the official report reconnects.',href:'/availability-report.html',label:'Open Availability'});
    }
    return Math.max(timeValue(movement.checkedAt||movement.latestTransactionDate),timeValue(availability.checkedAt||availability.latestReportDate));
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
      const results=await Promise.allSettled([loadEditorial(),loadStaticSnapshots(),loadRotations(),loadLeagueData(),loadPlayerWire()]);
      const stamps=results.map(result=>result.status==='fulfilled'&&Number.isFinite(Number(result.value))?Number(result.value):0);
      setStamp(stamps);
    }finally{loading=false;}
  }

  function init(){
    if(!buildShell())return;
    wireTileNavigation();
    loadHub();
    setInterval(()=>{if(!document.hidden)loadHub();},300000);
    window.addEventListener('focus',loadHub);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadHub();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
