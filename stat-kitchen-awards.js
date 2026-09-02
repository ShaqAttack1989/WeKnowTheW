(()=>{
  const monthlyAwards=Array.isArray(window.STAT_KITCHEN_MONTHLY_AWARDS)?window.STAT_KITCHEN_MONTHLY_AWARDS:[];
  const rookieMonths=Array.isArray(window.STAT_KITCHEN_ROOKIE_MONTH_AWARDS)?window.STAT_KITCHEN_ROOKIE_MONTH_AWARDS:[];
  const weeklyAwards=Array.isArray(window.STAT_KITCHEN_WEEKLY_AWARDS)?window.STAT_KITCHEN_WEEKLY_AWARDS:[];
  const photos=new Map();
  const teamSlugs={
    'Atlanta Dream':'atlanta-dream','Chicago Sky':'chicago-sky','Connecticut Sun':'connecticut-sun','Dallas Wings':'dallas-wings','Golden State Valkyries':'golden-state-valkyries','Indiana Fever':'indiana-fever','Las Vegas Aces':'las-vegas-aces','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','New York Liberty':'new-york-liberty','Phoenix Mercury':'phoenix-mercury','Portland Fire':'portland-fire','Seattle Storm':'seattle-storm','Toronto Tempo':'toronto-tempo','Washington Mystics':'washington-mystics'
  };
  const monthIndex={jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11};
  let rookieWeekLoading=false;

  function safe(value=''){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function norm(value=''){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
  function initials(name=''){return String(name).trim().split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();}
  function playerHref(name,spotlight){return `/playerpedia.html?search=${encodeURIComponent(name)}&from=stat-kitchen&spotlight=${encodeURIComponent(spotlight)}#playerpedia-directory`;}
  function teamHref(team){const slug=teamSlugs[team];return slug?`/team.html?team=${encodeURIComponent(slug)}`:'';}
  function playerPhoto(name){
    const player=photos.get(norm(name))||{};
    const photo=player.officialHeadshot||player.photoCutout||player.photo||player.photoThumb||player.headshot||'';
    return `<a class="award-photo" href="${safe(playerHref(name,'awards'))}" aria-label="Open ${safe(name)} in Playerpedia"><span>${safe(initials(name))}</span>${photo?`<img src="${safe(photo)}" alt="${safe(name)}" loading="lazy" decoding="async" onerror="this.remove()">`:''}</a>`;
  }
  function monthWinCount(name,index,field){
    const source=field==='rookie'?rookieMonths:monthlyAwards;
    return source.slice(index).reduce((count,item)=>{
      if(field==='rookie')return count+(norm(item.name)===norm(name)?1:0);
      return count+[item.east?.name,item.west?.name].filter(candidate=>norm(candidate)===norm(name)).length;
    },0);
  }
  function ordinal(number){const n=Number(number)||1,mod100=n%100;if(mod100>=11&&mod100<=13)return `${n}TH`;return `${n}${n%10===1?'ST':n%10===2?'ND':n%10===3?'RD':'TH'}`;}
  function monthlyCard(conference,award,index,latest){
    const count=monthWinCount(award.name,index,'monthly');
    const teamUrl=teamHref(award.team);
    return `<article class="award-card ${conference.toLowerCase()} ${latest?'latest':''}"><span class="award-conference">${conference==='East'?'EASTERN':'WESTERN'} CONFERENCE</span>${playerPhoto(award.name)}<div class="award-copy"><small>KIA PLAYER OF THE MONTH</small><h3><a class="award-player-link" href="${safe(playerHref(award.name,'player-of-month'))}">${safe(award.name)}</a></h3>${teamUrl?`<a class="award-team-link" href="${safe(teamUrl)}">${safe(award.team)}</a>`:`<strong>${safe(award.team)}</strong>`}<div class="award-badges"><span class="kia-award-badge">KIA WNBA</span><span>${ordinal(count)} MONTHLY WIN</span></div><p>${safe(award.line||'Official Kia WNBA monthly honor')}</p><a class="award-source-link" href="${safe(award.source)}" target="_blank" rel="noopener noreferrer">Official receipt <span aria-hidden="true">→</span></a></div></article>`;
  }
  function renderMonthly(){
    const target=document.getElementById('monthlyAwards');
    const legend=document.getElementById('monthlyAwardLegend');
    if(legend)legend.innerHTML='<strong>MONTHLY KEY</strong><span><i class="legend-dot kia"></i> Kia WNBA honor</span><span><i class="legend-dot current"></i> Latest month</span><span>Conference labels match Weekly Heat Check</span>';
    if(!target)return;
    target.innerHTML=monthlyAwards.map((item,index)=>`<section class="monthly-award-period ${index===0?'latest-month':''}"><div class="monthly-period-label"><span>${safe(item.month.toUpperCase())} 2026</span><strong>Announced ${safe(item.announced||'')}</strong>${index===0?'<b>LATEST</b>':''}</div><div class="monthly-award-grid">${monthlyCard('East',item.east,index,index===0)}${monthlyCard('West',item.west,index,index===0)}</div></section>`).join('');
  }
  function rookieMonthCard(item,index,latest){
    const count=monthWinCount(item.name,index,'rookie');
    const teamUrl=teamHref(item.team);
    return `<article class="award-card rookie ${latest?'latest':''}"><span class="award-conference">LEAGUEWIDE ROOKIE</span>${playerPhoto(item.name)}<div class="award-copy"><small>KIA ROOKIE OF THE MONTH</small><h3><a class="award-player-link" href="${safe(playerHref(item.name,'rookie-of-month'))}">${safe(item.name)}</a></h3>${teamUrl?`<a class="award-team-link" href="${safe(teamUrl)}">${safe(item.team)}</a>`:`<strong>${safe(item.team)}</strong>`}<div class="award-badges"><span class="kia-award-badge">KIA WNBA</span><span>${ordinal(count)} ROOKIE MONTH</span></div><p>${safe(item.line||'Official Kia WNBA Rookie of the Month')}</p><a class="award-source-link" href="${safe(item.source)}" target="_blank" rel="noopener noreferrer">Official receipt <span aria-hidden="true">→</span></a></div></article>`;
  }
  function renderRookieMonths(){
    const target=document.getElementById('rookieMonthAwards');
    const legend=document.getElementById('rookieMonthLegend');
    if(legend)legend.innerHTML='<strong>ROOKIE MONTH KEY</strong><span><i class="legend-dot rookie"></i> Leaguewide Kia rookie honor</span><span><i class="legend-dot current"></i> Latest month</span><span>Official WNBA award</span>';
    if(!target)return;
    target.innerHTML=rookieMonths.map((item,index)=>`<section class="rookie-month-period ${index===0?'latest-month':''}"><div class="monthly-period-label"><span>${safe(item.month.toUpperCase())} 2026</span><strong>Announced ${safe(item.announced||'')}</strong>${index===0?'<b>LATEST</b>':''}</div><div class="rookie-month-single">${rookieMonthCard(item,index,index===0)}</div></section>`).join('');
  }
  function parseMonth(value=''){
    const token=String(value).toLowerCase().replaceAll('.','');
    return Number.isInteger(monthIndex[token])?monthIndex[token]:null;
  }
  function isoDate(year,month,day){return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
  function weeklyPeriod(label=''){
    const match=String(label).trim().match(/^([A-Za-z.]+)\s+(\d{1,2})\s+through\s+(?:([A-Za-z.]+)\s+)?(\d{1,2})$/i);
    if(!match)return null;
    const startMonth=parseMonth(match[1]),endMonth=parseMonth(match[3]||match[1]);
    if(startMonth===null||endMonth===null)return null;
    const startYear=2026,endYear=endMonth<startMonth?2027:2026;
    return {start:isoDate(startYear,startMonth,Number(match[2])),end:isoDate(endYear,endMonth,Number(match[4]))};
  }
  function latestCompletedWeek(){
    const now=new Date(),day=now.getUTCDay(),daysBack=day===0?7:day;
    const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    end.setUTCDate(end.getUTCDate()-daysBack);
    const start=new Date(end);start.setUTCDate(start.getUTCDate()-6);
    return {start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};
  }
  function rookieFeature(item,week){
    const teamUrl=teamHref(item.team);
    return `<div class="rookie-week-feature"><article class="award-card rookie latest"><span class="award-conference">WE KNOW THE W ROOKIE</span>${playerPhoto(item.name)}<div class="award-copy"><small>ROOKIE OF THE WEEK · WEEK ${safe(week)}</small><h3><a class="award-player-link" href="${safe(playerHref(item.name,'rookie-of-week'))}">${safe(item.name)}</a></h3>${teamUrl?`<a class="award-team-link" href="${safe(teamUrl)}">${safe(item.team)}</a>`:`<strong>${safe(item.team)}</strong>`}<div class="award-badges"><span class="kia-award-badge">#1 WEEKLY ROOKIE SCORE</span><span>${safe(item.games)} GAME${Number(item.games)===1?'':'S'}</span></div><p>${safe(item.line)}</p></div></article></div>`;
  }
  function rookieBoard(items=[]){
    return `<div class="rookie-week-board"><div class="rookie-week-board-head"><span>Rank</span><span>Rookie</span><span>W Score</span></div>${items.map(item=>`<a class="rookie-rank-row" href="${safe(playerHref(item.name,'rookie-of-week'))}"><span class="rookie-rank">${safe(item.rank)}</span><span><strong>${safe(item.name)}</strong><small>${safe(item.team)} · ${safe(item.line)}</small></span><b>${Number(item.score).toFixed(1)}</b></a>`).join('')}</div>`;
  }
  async function fetchRookieSnapshot(){
    const response=await fetch(`/data/stat-kitchen-rookie-week.json?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)throw new Error('Verified rookie snapshot unavailable');
    const payload=await response.json().catch(()=>({}));
    if(!Array.isArray(payload.leaders)||!payload.leaders.length)throw new Error('Verified rookie snapshot is empty');
    return {...payload,stale:true,fallback:true,sourceStatus:'verified snapshot fallback',updatedAt:payload.generatedAt||payload.updatedAt||null};
  }
  function renderRookiePayload(payload,requestedWeek){
    const target=document.getElementById('rookieWeekDashboard');
    const status=document.getElementById('rookieWeekStatus');
    if(!target)return;
    const displayWeek=payload.week||requestedWeek||'CURRENT';
    if(!payload.leaders?.length){
      target.innerHTML='<div class="rookie-week-empty"><strong>No qualifying rookie boxscores were found for this completed period.</strong></div>';
      if(status)status.textContent=`Week ${displayWeek}`;
      return;
    }
    const fallbackNote=payload.stale?'<span class="rookie-fallback-note">Live refresh is recovering, so this board is using the last verified snapshot.</span>':'';
    target.innerHTML=`<div class="rookie-week-shell">${rookieFeature(payload.leaders[0],displayWeek)}${rookieBoard(payload.leaders)}</div><p class="rookie-method-note"><strong>How this works:</strong> Rookie of the Week is a We Know the W weekly ranking, not an official WNBA award. It uses verified ESPN WNBA boxscores for the latest completed Player of the Week period. W Score = PPG + 1.2×RPG + 1.5×APG + 3×SPG + 3×BPG. ${fallbackNote}</p>`;
    if(status){
      const stamp=payload.updatedAt||payload.generatedAt;
      const updated=stamp?new Date(stamp):null;
      const when=updated&&!Number.isNaN(updated.getTime())?updated.toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'verified';
      status.textContent=payload.stale?`Week ${displayWeek} · Verified snapshot · ${when}`:`Week ${displayWeek} · Live · Updated ${when}`;
    }
  }
  async function renderRookieWeek(force=false){
    const target=document.getElementById('rookieWeekDashboard');
    const status=document.getElementById('rookieWeekStatus');
    if(!target||rookieWeekLoading)return;
    rookieWeekLoading=true;
    const latest=weeklyAwards[0]||{};
    const period=weeklyPeriod(latest.dates)||latestCompletedWeek();
    const week=latest.week||'CURRENT';
    if(force&&status)status.textContent='Refreshing rookie board…';
    try{
      let payload;
      try{
        const response=await fetch(`/api/rookie-week?start=${encodeURIComponent(period.start)}&end=${encodeURIComponent(period.end)}&week=${encodeURIComponent(week)}&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
        payload=await response.json().catch(()=>({}));
        if(!response.ok||payload.error||!payload.leaders?.length)throw new Error(payload.detail||payload.error||'Live rookie board unavailable');
      }catch(liveError){
        payload=await fetchRookieSnapshot();
        payload.liveError=liveError.message;
      }
      renderRookiePayload(payload,week);
    }catch(error){
      target.innerHTML=`<div class="rookie-week-empty"><strong>The rookie board is between servings.</strong><p>${safe(error.message)} Try again shortly.</p></div>`;
      if(status)status.textContent='Feed temporarily unavailable';
    }finally{rookieWeekLoading=false;}
  }
  function historyCard(entry){
    const winner=entry.leaders?.[0]||{};
    const label=entry.dates||`${entry.start||''} through ${entry.end||''}`;
    return `<details class="rookie-history-card"><summary><span class="rookie-history-week">WEEK ${safe(entry.week)}</span><span class="rookie-history-winner"><strong>${safe(winner.name||'Verified rookie leader')}</strong><small>${safe(winner.team||'')} · ${safe(label)}</small></span><span class="rookie-history-score">${Number(winner.score||0).toFixed(1)}<small>W SCORE</small></span></summary><div class="rookie-history-detail">${rookieBoard(entry.leaders||[])}</div></details>`;
  }
  async function renderRookieHistory(){
    const target=document.getElementById('rookieWeekHistory');
    if(!target)return;
    try{
      const response=await fetch(`/data/stat-kitchen-rookie-week-history.json?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
      if(!response.ok)throw new Error('Rookie archive unavailable');
      const payload=await response.json().catch(()=>({}));
      const currentWeek=Number(weeklyAwards[0]?.week)||Infinity;
      const weeks=(Array.isArray(payload.weeks)?payload.weeks:[]).filter(item=>Number(item.week)<currentWeek).sort((a,b)=>Number(b.week)-Number(a.week));
      if(!weeks.length)throw new Error('Rookie archive is still filling');
      target.innerHTML=`<div class="rookie-history-heading"><div><span>THE FULL ROOKIE TAPE</span><h3>Weeks 1 through ${safe(weeks[0].week)}</h3><p>Every completed weekly rookie board stays on the shelf. Open any week to see its full top five and W Score.</p></div><b>${safe(weeks.length)} WEEKS ARCHIVED</b></div><div class="rookie-history-grid">${weeks.map(historyCard).join('')}</div>`;
    }catch(error){
      target.innerHTML=`<div class="rookie-week-empty"><strong>Historical rookie boards are being plated.</strong><p>${safe(error.message)}.</p></div>`;
    }
  }
  async function loadPhotos(){
    try{
      const response=await fetch('/api/players',{headers:{Accept:'application/json'},cache:'no-store'});
      const payload=await response.json().catch(()=>({}));
      const players=Array.isArray(payload)?payload:(payload.players||[]);
      players.forEach(player=>photos.set(norm(player.name),player));
      renderMonthly();renderRookieMonths();renderRookieWeek(true);
    }catch{}
  }

  renderMonthly();
  renderRookieMonths();
  renderRookieWeek();
  renderRookieHistory();
  loadPhotos();
  setInterval(()=>{if(!document.hidden)renderRookieWeek(true);},15*60*1000);
  window.addEventListener('focus',()=>renderRookieWeek(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderRookieWeek(true);});
})();