(()=>{
  const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const norm=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const sitePhoto=value=>/^(?:\/|https?:\/\/)/i.test(String(value||'').trim())?String(value).trim():'';
  const timeValue=value=>{const t=Date.parse(String(value||''));return Number.isFinite(t)?t:0;};
  const storyDate=item=>item?.published||item?.date||item?.updatedAt||item?.updated||'';
  const fmtShort=value=>{const raw=String(value||'').trim();const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw)?`${raw}T12:00:00`:raw);return Number.isNaN(d.getTime())?'':d.toLocaleDateString([],{month:'short',day:'numeric'});};
  const teamCode=name=>text(name).split(/\s+/).filter(Boolean).map(part=>part[0]).join('').slice(0,3).toUpperCase()||'W';
  const EASTERN='America/New_York';

  function fetchJson(url){
    if(window.WHomeData?.get)return window.WHomeData.get(url,{ttl:15000});
    const joiner=url.includes('?')?'&':'?';
    return fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(response=>{
      if(!response.ok)throw new Error(`${url} returned ${response.status}`);
      return response.json();
    });
  }

  function installStickyHeader(){
    document.body.classList.add('home-page');
    const header=document.querySelector('.hub-hero');
    const nav=header?.querySelector('.nav');
    if(!header||!nav||document.querySelector('.w-home-nav-sticky'))return;

    const scorebar=document.createElement('section');
    scorebar.className='w-home-scorebar';
    scorebar.setAttribute('aria-label','WNBA game scoreboard');
    scorebar.innerHTML=`<div class="w-home-scorebar-inner">
      <a class="w-scorebar-label" href="/games.html"><span>AROUND THE W</span><strong>SCOREBOARD</strong></a>
      <div class="w-scorebar-games" id="wHomeScoreGames"><a class="w-score-game" href="/games.html"><div class="w-score-game-top"><span>WNBA</span><b>LOADING</b></div><div class="w-score-game-team"><i class="w-score-team-fallback">W</i><span>Checking the slate…</span><strong></strong></div></a></div>
      <a class="w-scorebar-full" href="/games.html">FULL<br>GAMES →</a>
    </div>`;

    const navWrap=document.createElement('div');
    navWrap.className='w-home-nav-sticky';
    navWrap.setAttribute('aria-label','Sticky site navigation');
    header.before(scorebar);
    scorebar.after(navWrap);
    navWrap.appendChild(nav);

    const setHeight=()=>{
      const h=Math.ceil(scorebar.getBoundingClientRect().height||78);
      document.documentElement.style.setProperty('--w-home-scorebar-height',`${h}px`);
    };
    setHeight();
    if('ResizeObserver' in window)new ResizeObserver(setHeight).observe(scorebar);
    else window.addEventListener('resize',setHeight,{passive:true});
  }

  function gameInstant(game={}){
    const direct=String(game.startTimeUtc||game.timestamp||game.strTimestamp||'').trim();
    if(direct){
      const iso=direct.includes('T')?direct:direct.replace(' ','T');
      const zoned=/Z$|[+-]\d{2}:?\d{2}$/i.test(iso);
      const parsed=new Date(zoned?iso:`${iso}Z`);
      if(!Number.isNaN(parsed.getTime()))return parsed;
    }
    if(game.date){
      const parsed=new Date(`${game.date}T${game.time||'12:00:00Z'}`);
      if(!Number.isNaN(parsed.getTime()))return parsed;
    }
    return null;
  }
  function gameTime(game={}){
    const d=gameInstant(game);
    if(!d)return 'TBD';
    return new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,hour:'numeric',minute:'2-digit'}).format(d);
  }
  function gameDay(game={}){
    const d=gameInstant(game);
    if(!d)return 'WNBA';
    return new Intl.DateTimeFormat('en-US',{timeZone:EASTERN,month:'short',day:'numeric'}).format(d);
  }
  function gameStatus(game={},bucket='upcoming'){
    const raw=text(game.status||game.statusText||'');
    if(bucket==='live')return raw||'LIVE';
    if(bucket==='past')return raw||'FINAL';
    const tip=gameTime(game);
    return tip==='TBD'?'TBD':`${tip} EST`;
  }
  function teamName(game,side){return text(game?.[`${side}Team`]||game?.[side]?.name||game?.[side]?.full_name||'TBD');}
  function teamScore(game,side,bucket){
    if(bucket==='upcoming')return '';
    const value=game?.[`${side}Score`]??game?.[side]?.score;
    return Number.isFinite(Number(value))?String(value):'';
  }
  function badgeMarkup(name,badges){
    const src=badges.get(norm(name));
    return src?`<img src="${safe(src)}" alt="" loading="eager" decoding="async">`:`<i class="w-score-team-fallback" aria-hidden="true">${safe(teamCode(name))}</i>`;
  }
  function gameCard({game,bucket},badges){
    const away=teamName(game,'away'),home=teamName(game,'home');
    const awayScore=teamScore(game,'away',bucket),homeScore=teamScore(game,'home',bucket);
    return `<a class="w-score-game" href="/games.html" aria-label="${safe(away)} at ${safe(home)}">
      <div class="w-score-game-top"><span>${safe(gameDay(game))}</span><b>${safe(gameStatus(game,bucket))}</b></div>
      <div class="w-score-game-team">${badgeMarkup(away,badges)}<span>${safe(away)}</span><strong>${safe(awayScore)}</strong></div>
      <div class="w-score-game-team">${badgeMarkup(home,badges)}<span>${safe(home)}</span><strong>${safe(homeScore)}</strong></div>
    </a>`;
  }

  async function loadScoreboard(){
    const host=document.getElementById('wHomeScoreGames');
    if(!host)return;
    try{
      const [statsResult,teamsResult,competitionResult]=await Promise.allSettled([
        fetchJson('/api/stats?season=2026'),
        fetchJson('/api/teams?currentLogos=20260925'),
        fetchJson('/api/competition?season=2026')
      ]);
      const stats=statsResult.status==='fulfilled'?statsResult.value:{};
      const teams=teamsResult.status==='fulfilled'?teamsResult.value:{};
      const competition=competitionResult.status==='fulfilled'?competitionResult.value:{};
      const badges=new Map();
      (Array.isArray(teams.teams)?teams.teams:[]).forEach(team=>{
        const src=sitePhoto(team?.badge||team?.logo||'');
        if(team?.name&&src)badges.set(norm(team.name),src);
      });

      const live=(stats.liveGames||[]).map(game=>({game,bucket:'live'}));
      const upcoming=(stats.upcomingGames||[]).map(game=>({game,bucket:'upcoming'})).sort((a,b)=>(gameInstant(a.game)?.getTime()||Infinity)-(gameInstant(b.game)?.getTime()||Infinity));
      const past=(stats.pastGames||stats.recentGames||[]).map(game=>({game,bucket:'past'})).sort((a,b)=>(gameInstant(b.game)?.getTime()||0)-(gameInstant(a.game)?.getTime()||0));
      const playoffGames=(competition.playoffs?.games||[]).filter(game=>!game.completed&&String(game.state||'').toLowerCase()!=='post').map(game=>({game:{...game,status:game.competitionLabel||game.status||'Playoffs'},bucket:String(game.state||'').toLowerCase()==='in'?'live':'upcoming'}));
      const chosen=(playoffGames.length?[...playoffGames,...live,...past]:[...live,...upcoming,...past]).slice(0,5);
      host.innerHTML=chosen.length?chosen.map(item=>gameCard(item,badges)).join(''):`<a class="w-score-game" href="/games.html"><div class="w-score-game-top"><span>WNBA</span><b>SCHEDULE</b></div><div class="w-score-game-team"><i class="w-score-team-fallback">W</i><span>Open the full games board</span><strong>→</strong></div></a>`;
    }catch{
      host.innerHTML=`<a class="w-score-game" href="/games.html"><div class="w-score-game-top"><span>WNBA</span><b>GAMES</b></div><div class="w-score-game-team"><i class="w-score-team-fallback">W</i><span>Scoreboard reconnecting</span><strong>→</strong></div></a>`;
    }
  }

  function quickLinksMarkup(){
    const links=[
      ['LS','Live Stats','/live-stats.html'],
      ['GM','Full Games','/games.html'],
      ['PP','Playerpedia','/playerpedia.html'],
      ['SK','Stat Kitchen','/stat-kitchen.html'],
      ['PM','Player Movement','/player-movement.html'],
      ['AV','Availability','/availability-report.html'],
      ['SF','Shak’s Starting Five','/starting-five.html'],
      ['SS','Snack Shak','/snack-shak.html'],
      ['WV','The W Vault','/w-vault.html'],
      ['WG','Who Got Next?','/who-got-next.html']
    ];
    return links.map(([icon,label,href])=>`<a class="w-desk-link" href="${href}"><i>${icon}</i><span>${label}</span><b>›</b></a>`).join('');
  }

  function upgradeDeskLayout(){
    const section=document.getElementById('this-week');
    const shell=section?.querySelector('.week-hub-shell');
    if(!section||!shell||shell.dataset.newsDeskReady==='1')return false;
    const editorial=shell.querySelector('.week-editorial-grid');
    const divider=shell.querySelector('.week-hub-divider');
    const snapshots=shell.querySelector('.week-snapshot-grid');
    const foot=shell.querySelector('.week-hub-foot');
    if(!editorial||!divider||!snapshots||!foot)return false;

    shell.dataset.newsDeskReady='1';
    const layout=document.createElement('div');
    layout.className='w-desk-layout';
    layout.innerHTML=`
      <aside class="w-desk-rail w-desk-quick" aria-label="We Know the W quick links">
        <div class="w-desk-rail-head"><span>QUICK LINKS</span><strong>Get where you’re going.</strong></div>
        <div class="w-desk-link-list">${quickLinksMarkup()}</div>
      </aside>
      <section class="w-desk-main" aria-label="Featured stories and live desk"></section>
      <aside class="w-desk-rail w-desk-headlines" aria-label="Top headlines">
        <div class="w-desk-rail-head"><span>TOP HEADLINES</span><strong>What’s moving in the W.</strong></div>
        <div class="w-headline-list" id="wDeskHeadlines"><div class="week-hub-loading">Loading the latest headlines…</div></div>
        <a class="w-headline-more" href="/snack-shak.html">All stories →</a>
      </aside>`;

    const main=layout.querySelector('.w-desk-main');
    divider.querySelector('span').textContent='LIVE DESK';
    main.append(editorial,divider,snapshots);
    shell.insertBefore(layout,foot);

    const spotlight=document.getElementById('now-playing');
    const pageMain=document.querySelector('main');
    if(spotlight&&pageMain&&section.nextElementSibling!==spotlight)pageMain.insertBefore(section,spotlight);
    return true;
  }

  function collectStories(value,source,output=[],seen=new Set()){
    if(Array.isArray(value)){value.forEach(item=>collectStories(item,source,output,seen));return output;}
    if(!value||typeof value!=='object')return output;
    if(value.title&&typeof value.title==='string'){
      const signature=`${text(value.slug||value.title)}|${text(storyDate(value))}`;
      if(!seen.has(signature)){seen.add(signature);output.push({...value,_source:source});}
    }
    Object.values(value).forEach(item=>{if(item&&typeof item==='object')collectStories(item,source,output,seen);});
    return output;
  }
  function storyKind(story={}){
    const value=norm([story.type,story.kind,story.category,story.seriesLabel,story.series,story.slug,story._source].filter(Boolean).join(' '));
    if(/byte/.test(value))return 'BYTE';
    if(/food|feature|analysis|long/.test(value))return 'FOOD FOR THOUGHT';
    return 'AROUND THE W';
  }
  function storyHref(story={}){
    const direct=story.dashboardUrl||story.href||story.path||story.internalUrl;
    if(direct&&String(direct).startsWith('/'))return direct;
    const kind=storyKind(story);
    if(story.slug)return kind==='BYTE'?`/snack-shak-bytes.html?post=${encodeURIComponent(story.slug)}#story`:`/food-for-thought.html?post=${encodeURIComponent(story.slug)}#story`;
    return kind==='BYTE'?'/snack-shak-bytes.html':'/food-for-thought.html';
  }

  async function loadHeadlines(){
    const host=document.getElementById('wDeskHeadlines');
    if(!host)return;
    const feeds=['/snack-shak-love-and-basketball.json','/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];
    try{
      const results=await Promise.allSettled(feeds.map(fetchJson));
      const stories=[];
      results.forEach((result,index)=>{if(result.status==='fulfilled')collectStories(result.value,feeds[index],stories);});
      const fresh=stories
        .filter(story=>text(story.title))
        .sort((a,b)=>timeValue(storyDate(b))-timeValue(storyDate(a))||Number(b.priority||0)-Number(a.priority||0));
      const seen=new Set(),unique=[];
      fresh.forEach(story=>{const key=norm(story.title);if(!seen.has(key)){seen.add(key);unique.push(story);}});
      host.innerHTML=unique.slice(0,7).map(story=>`<a class="w-headline" href="${safe(storyHref(story))}"><span>${safe(storyKind(story))}${storyDate(story)?` · ${safe(fmtShort(storyDate(story)))}`:''}</span><strong>${safe(story.title)}</strong></a>`).join('')||'<a class="w-headline" href="/snack-shak.html"><span>SNACK SHAK</span><strong>Open the latest stories from around the W.</strong></a>';
    }catch{
      host.innerHTML='<a class="w-headline" href="/snack-shak.html"><span>SNACK SHAK</span><strong>Headlines are reconnecting. The full story desk is still open.</strong></a>';
    }
  }

  function start(){
    installStickyHeader();
    loadScoreboard();
    const ready=upgradeDeskLayout();
    if(!ready){
      let tries=0;
      const timer=setInterval(()=>{
        tries+=1;
        if(upgradeDeskLayout()||tries>20){clearInterval(timer);if(document.getElementById('wDeskHeadlines'))loadHeadlines();}
      },80);
    }else loadHeadlines();
    setInterval(()=>{if(!document.hidden)loadScoreboard();},60000);
    window.addEventListener('focus',loadScoreboard);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();