(function(){
  const TIME_ZONE='America/New_York';
  const FALLBACK_TEAMS=[
    ['Atlanta Dream','ATL','#C8102E','#69B3E7'],['Chicago Sky','CHI','#69B3E7','#F9E547'],
    ['Connecticut Sun','CON','#F05023','#003DA5'],['Dallas Wings','DAL','#0C2340','#C4D600'],
    ['Golden State Valkyries','GSV','#6D35A8','#B79BE6'],['Indiana Fever','IND','#002D62','#E03A3E'],
    ['Las Vegas Aces','LVA','#C8102E','#000000'],['Los Angeles Sparks','LAS','#552583','#FDB927'],
    ['Minnesota Lynx','MIN','#0C2340','#78BE20'],['New York Liberty','NYL','#6ECEB2','#000000'],
    ['Phoenix Mercury','PHX','#CB6015','#201747'],['Portland Fire','POR','#D52B1E','#6B3F2A'],
    ['Seattle Storm','SEA','#2C5234','#FEE11A'],['Toronto Tempo','TOR','#2477C5','#6E1F3A'],
    ['Washington Mystics','WAS','#002B5C','#E31837']
  ].map(([name,tag,primary,secondary])=>({name,tag,primary,secondary}));

  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const teams=typeof TEAM_DATA!=='undefined'&&Array.isArray(TEAM_DATA)?TEAM_DATA:FALLBACK_TEAMS;
  const metaByName=new Map(teams.map(team=>[key(team.name),team]));
  const artworkByName=new Map();

  function meta(name=''){
    const found=metaByName.get(key(name));
    if(found)return found;
    const words=String(name).trim().split(/\s+/).filter(Boolean);
    return {name,tag:words.map(word=>word[0]).join('').slice(0,3).toUpperCase()||'W',primary:'#6b2bd9',secondary:'#d8ff4f'};
  }

  function instant(game={}){
    const direct=String(game.startTimeUtc||game.timestamp||'').trim();
    if(direct){const iso=direct.includes('T')?direct:direct.replace(' ','T'),zoned=/Z$|[+-]\d{2}:?\d{2}$/i.test(iso),date=new Date(zoned?iso:`${iso}Z`);if(!Number.isNaN(date.getTime()))return date;}
    const date=String(game.date||'').trim(),time=String(game.time||'').trim();
    if(date&&time){const zoned=/Z$|[+-]\d{2}:?\d{2}$/i.test(time),parsed=new Date(`${date}T${time}${zoned?'':'Z'}`);if(!Number.isNaN(parsed.getTime()))return parsed;}
    if(date){const parsed=new Date(`${date}T12:00:00Z`);if(!Number.isNaN(parsed.getTime()))return parsed;}
    return null;
  }

  function dateKey(game={}){const date=instant(game);return date?new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(date):String(game.date||'Unscheduled');}
  function dateLabel(game={}){const date=instant(game);return date?new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(date):String(game.date||'Date TBD');}
  function shortDate(game={}){const date=instant(game);return date?new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,weekday:'short',month:'short',day:'numeric'}).format(date):String(game.date||'Date TBD');}
  function timeLabel(game={}){const date=instant(game);if(!date||(!game.time&&!game.startTimeUtc&&!game.timestamp))return 'Time TBD';return `${new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,hour:'numeric',minute:'2-digit'}).format(date)} ET`;}
  function hasScore(value){return value!==null&&value!==undefined&&String(value).trim()!==''&&Number.isFinite(Number(value));}
  function finalGame(game={}){return hasScore(game.homeScore)&&hasScore(game.awayScore);}
  function record(name='',standings=[]){const item=(standings||[]).find(row=>key(row.team?.full_name)===key(name));return item?`(${item.wins}-${item.losses})`:'';}
  function logo(name=''){return artworkByName.get(key(name))||'';}

  function teamMark(name=''){
    const team=meta(name),src=logo(name);
    return `<span class="schedule-team-logo"><span>${safe(team.tag)}</span>${src?`<img src="${safe(src)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}</span>`;
  }

  function gameCard(game={},mode='upcoming',standings=[]){
    const away=meta(game.awayTeam),home=meta(game.homeTeam),isFinal=mode==='past'||finalGame(game);
    const awayScore=Number(game.awayScore),homeScore=Number(game.homeScore),awayWon=isFinal&&awayScore>homeScore,homeWon=isFinal&&homeScore>awayScore;
    const status=isFinal?'Final':safe(game.status||'Scheduled');
    const venue=game.venue||(isFinal?'Completed game':'Venue to be announced');
    return `<article class="schedule-game-card ${isFinal?'is-final':'is-upcoming'}" style="--away-color:${safe(away.primary)};--away-accent:${safe(away.secondary)};--home-color:${safe(home.primary)};--home-accent:${safe(home.secondary)}">
      <div class="schedule-game-top"><span>${isFinal?'FINAL':'UPCOMING'}</span><time datetime="${safe(dateKey(game))}">${safe(shortDate(game))}</time><strong>${isFinal?'Final':safe(timeLabel(game))}</strong></div>
      <div class="schedule-matchup">
        <div class="schedule-team away">${teamMark(game.awayTeam)}<div><strong>${safe(away.tag)}</strong><span>${safe(game.awayTeam||'TBD')}</span><small>${safe(record(game.awayTeam,standings))}</small></div>${isFinal?`<b class="schedule-score ${awayWon?'winner':''}">${safe(game.awayScore)}</b>`:''}</div>
        <div class="schedule-versus" aria-label="at">@</div>
        <div class="schedule-team home">${teamMark(game.homeTeam)}<div><strong>${safe(home.tag)}</strong><span>${safe(game.homeTeam||'TBD')}</span><small>${safe(record(game.homeTeam,standings))}</small></div>${isFinal?`<b class="schedule-score ${homeWon?'winner':''}">${safe(game.homeScore)}</b>`:''}</div>
      </div>
      <div class="schedule-game-bottom"><span class="schedule-status-dot" aria-hidden="true"></span><strong>${status}</strong><span>${safe(venue)}</span></div>
    </article>`;
  }

  function render(items=[],mode='upcoming',options={}){
    const limit=Number(options.limit)||20,standings=options.standings||[],shown=items.slice(0,limit);
    if(!shown.length)return `<div class="schedule-empty"><span>W</span><strong>No ${mode==='upcoming'?'upcoming':'completed'} games match this view.</strong><p>Try another team or check again when the schedule refreshes.</p></div>`;
    const groups=[];
    shown.forEach(game=>{const groupKey=dateKey(game),last=groups.at(-1);if(last?.key===groupKey)last.games.push(game);else groups.push({key:groupKey,label:dateLabel(game),games:[game]});});
    return groups.map(group=>`<section class="schedule-date-group"><div class="schedule-date-heading"><h4>${safe(group.label)}</h4><span>${group.games.length} ${group.games.length===1?'game':'games'}</span></div><div class="schedule-card-grid">${group.games.map(game=>gameCard(game,mode,standings)).join('')}</div></section>`).join('');
  }

  function allTeams(payload={}){
    const names=new Set(teams.map(team=>team.name).filter(Boolean));
    [...(payload.upcomingGames||[]),...(payload.pastGames||payload.recentResults||[])].forEach(game=>{if(game.awayTeam)names.add(game.awayTeam);if(game.homeTeam)names.add(game.homeTeam);});
    return [...names].sort((a,b)=>a.localeCompare(b));
  }

  function populateFilter(select,payload={}){
    if(!select)return;
    const current=select.value||'all';
    select.innerHTML='<option value="all">All teams</option>'+allTeams(payload).map(name=>`<option value="${safe(key(name))}">${safe(name)}</option>`).join('');
    select.value=[...select.options].some(option=>option.value===current)?current:'all';
  }

  function filter(items=[],team='all'){
    if(!team||team==='all')return items;
    return items.filter(game=>key(game.homeTeam)===team||key(game.awayTeam)===team);
  }

  async function loadArtwork(){
    try{
      const response=await fetch('/api/teams?gameCards=20260822-v1',{headers:{Accept:'application/json'}}),payload=await response.json().catch(()=>({}));
      if(!response.ok||!Array.isArray(payload.teams))return;
      payload.teams.forEach(team=>{const src=team.badge||team.logo;if(team.name&&src)artworkByName.set(key(team.name),src);});
    }catch{/* Team abbreviations remain visible when artwork is unavailable. */}
  }

  window.WGameCards={render,populateFilter,filter,loadArtwork,finalGame};
})();
