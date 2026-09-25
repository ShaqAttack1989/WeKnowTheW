(()=>{
  const mode=document.body.dataset.snackCollection==='feature'?'feature':'byte';
  const pagePath=mode==='feature'?'/food-for-thought.html':'/snack-shak-bytes.html';
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const format=value=>{const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?String(value||''):date.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'});};
  const sources=['/snack-shak-love-and-basketball.json','/snack-shak-all-time.json','/snack-shak-final.json','/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];

  const FIBA_COMPETITION_ID='208875';
  const FIBA_PLAYER_IDS={
    'Jackie Young':'283322','Gabby Williams':'216915','Leonie Fiebich':'218988','Breanna Stewart':'176575','Marine Johannes':'191610','Emma Meesseman':'167505','Trinity San Antonio':'323904','Sevgi Uzun':'196252','Angel Reese':'255458','Xu Han':'224131','Sika Kone':'224434','Ramu Tokashiki':'166703','Iyana Martin':'295079','Steph Talbot':'176788','Nyara Sabally':'217770','Janelle Salaun':'237521','Dorka Juhasz':'219323'
  };
  const WNBA_PLAYER_IDS={'Pauline Astier':'1631136','Raquel Carrera':'1630384','Han Xu':'1629566','Elizabeth Balogun':'1641663'};
  const COUNTRY_CODES={'USA':'us','United States':'us','France':'fr','Germany':'de','Belgium':'be','Puerto Rico':'pr','Türkiye':'tr','Turkiye':'tr','China':'cn','Nigeria':'ng','Mali':'ml','Japan':'jp','Spain':'es','Australia':'au','Hungary':'hu'};
  const fibaPhoto=player=>FIBA_PLAYER_IDS[player]?`https://assets.fiba.basketball/image/upload/w_160,h_160,c_fill,g_face/f_png/q_auto/.headshot--person_${FIBA_PLAYER_IDS[player]}--competition_${FIBA_COMPETITION_ID}`:'';
  const wnbaPhoto=player=>WNBA_PLAYER_IDS[player]?`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${WNBA_PLAYER_IDS[player]}.png`:'';
  const playerPhoto=player=>fibaPhoto(player)||wnbaPhoto(player);
  const flagPhoto=country=>COUNTRY_CODES[country]?`https://flagcdn.com/w40/${COUNTRY_CODES[country]}.png`:'';

  function ensureStoryTableMediaStyles(){
    if(document.getElementById('storyTableMediaStyles'))return;
    const style=document.createElement('style');
    style.id='storyTableMediaStyles';
    style.textContent=`
      .story-table.has-people{min-width:860px}
      .story-table.has-people .story-table-row{grid-template-columns:minmax(120px,.85fr) minmax(190px,1.2fr) minmax(155px,.95fr) minmax(280px,1.8fr)}
      .story-player-cell,.story-country-cell{display:flex;align-items:center;gap:10px;min-width:0}
      .story-player-cell strong,.story-country-cell span{min-width:0}
      .story-player-photo{width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:center top;flex:0 0 44px;border:2px solid #e7dff0;background:#f6f2fa;box-shadow:0 3px 10px rgba(32,16,60,.09)}
      .story-country-flag{width:27px;height:19px;object-fit:cover;flex:0 0 27px;border-radius:3px;box-shadow:0 0 0 1px rgba(20,10,47,.12)}
      @media(max-width:680px){.story-player-photo{width:38px;height:38px;flex-basis:38px}.story-player-cell,.story-country-cell{gap:8px}.story-table.has-people{min-width:780px}.story-table.has-people .story-table-row{grid-template-columns:112px 180px 145px minmax(250px,1.7fr)}}
    `;
    document.head.appendChild(style);
  }

  async function fetchPosts(url){const response=await fetch(`${url}?cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});if(!response.ok)return[];const payload=await response.json().catch(()=>({}));return Array.isArray(payload.posts)?payload.posts:[];}
  function isMatch(post){return post.type!=='intro'&&(mode==='feature'?post.type==='feature':post.type!=='feature');}
  function href(post){return post.dashboardUrl||`${pagePath}?post=${encodeURIComponent(post.slug)}#story`;}
  function label(post){return mode==='feature'?'FOOD FOR THOUGHT':(post.seriesLabel||'SNACK SHAK BYTE');}
  function card(post){const fit=post.imageFit==='contain'?' is-contain':post.imageFit==='top-cover'?' is-top-cover':'';const media=post.image?`<div class="snack-collection-card-media${fit}"><img src="${safe(post.image)}" alt="${safe(post.imageAlt||post.title||'')}" loading="lazy" decoding="async"></div>`:'';return `<a class="snack-collection-card ${mode} ${media?'has-media':''}" data-story-slug="${safe(post.slug||'')}" href="${safe(href(post))}">${media}<span>${safe(label(post))}</span><time datetime="${safe(post.published||'')}">${safe(format(post.published))}</time><strong>${safe(post.title)}</strong><p>${safe(post.dek||'Open this Snack Shak story.')}</p><b>${mode==='feature'?'Read the long article →':'Read the Byte →'}</b></a>`;}

  function storyImageMarkup(post={}){const source=post.storyImage||post.image;if(!source)return'';const sourceLink=post.storyImageSourceUrl?` <a href="${safe(post.storyImageSourceUrl)}" target="_blank" rel="noopener noreferrer">Official WNBA source ↗</a>`:'';return `<figure class="snack-story-graphic"><img src="${safe(source)}" alt="${safe(post.imageAlt||post.title||'')}" decoding="async">${post.storyImageCaption||sourceLink?`<figcaption>${safe(post.storyImageCaption||'')}${sourceLink}</figcaption>`:''}</figure>`;}
  function playoffBoardMarkup(post){return post.slug==='the-playoff-watch-party-2026'?'<section class="snack-section" aria-label="Live playoff bracket"><h3>Opening-round game board</h3><p>Matchups and results refresh from the playoff feed. All times Eastern.</p><div id="snackPlayoffBoard" aria-live="polite">Checking the bracket…</div><p><a href="/games.html">Open all playoff games and scores →</a></p></section>':'';}
  async function updatePlayoffBoard(){const board=document.getElementById('snackPlayoffBoard');if(!board)return;try{const response=await fetch(`/api/competition?season=2026&cb=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw Error('unavailable');const data=await response.json();const games=(data.playoffs?.games||[]).filter(game=>game.date>='2026-09-27'&&game.date<='2026-09-28'&&[['Minnesota Lynx','New York Liberty'],['Golden State Valkyries','Dallas Wings'],['Las Vegas Aces','Indiana Fever'],['Atlanta Dream','Washington Mystics']].some(pair=>pair.includes(game.homeTeam)&&pair.includes(game.awayTeam)));board.innerHTML=games.map(game=>{const date=game.startTimeUtc?new Date(game.startTimeUtc):null;const time=date&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(date)+' ET':'Time TBD';const score=game.completed||game.state==='in'?` · ${safe(game.awayScore??'–')}–${safe(game.homeScore??'–')} · ${safe(game.status||'')}`:'';return `<a href="${game.officialFallback?`https://www.wnba.com/game/${encodeURIComponent(game.id)}`:`/games.html`}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px;margin:8px 0;border-radius:12px;background:#f4eefb;color:#29134a;text-decoration:none"><strong>${safe(game.awayTeam)} at ${safe(game.homeTeam)}</strong><br><small>${safe(time)}${score} · Official game ↗</small></a>`;}).join('')||'<p>Fixtures are temporarily unavailable. See the official WNBA bracket.</p>';}catch{board.innerHTML='<p>Live scores are temporarily unavailable. <a href="https://www.wnba.com/playoffs/2026">See the official bracket ↗</a></p>';}}
  function playoffWatchMarkup(board={}){
    const matchups=Array.isArray(board.matchups)?board.matchups:[];if(!matchups.length)return'';
    const cards=matchups.map(m=>`<article class="playoff-watch-card" data-playoff-matchup="${safe(m.id)}"><header><div><span>SEED ${safe(m.highSeed)}</span><strong>${safe(m.highTeam)}</strong><small>${safe(m.highRecord)}</small></div><b>VS</b><div><span>SEED ${safe(m.lowSeed)}</span><strong>${safe(m.lowTeam)}</strong><small>${safe(m.lowRecord)}</small></div></header><div class="playoff-score-split"><div><span>REGULAR SEASON</span><strong>${safe(m.regularSeries)}</strong><small>head-to-head only</small></div><div><span>PLAYOFF SERIES</span><strong data-playoff-series>0-0</strong><small data-playoff-game>Game 1 next</small></div></div><div class="playoff-next"><span>GAME 1</span><strong>${safe(m.game1)}</strong></div><div class="playoff-stars">${(m.stars||[]).map((name,i)=>`<figure><img src="${safe((m.starPhotos||[])[i]||'')}" alt="Official WNBA headshot of ${safe(name)}" loading="lazy" onerror="this.hidden=true"><figcaption>${safe(name)}</figcaption></figure>`).join('')}</div><div class="playoff-watch-tabs" role="tablist"><button type="button" data-watch-tab="read" aria-pressed="true">Matchup read</button><button type="button" data-watch-tab="form">Who's hot</button><button type="button" data-watch-tab="bench">Bench</button><button type="button" data-watch-tab="availability">Availability</button><button type="button" data-watch-tab="score">W Score</button></div><div class="playoff-watch-panel" data-watch-panel="read"><p><b>How do they beat you?</b> ${safe(m.beat)}</p><p><b>What can break them?</b> ${safe(m.break)}</p><p><b>Who has to show up?</b> ${safe(m.must)}</p></div><div class="playoff-watch-panel" data-watch-panel="form" hidden><p>${safe(m.hot)}</p></div><div class="playoff-watch-panel" data-watch-panel="bench" hidden><p>${safe(m.bench)}</p></div><div class="playoff-watch-panel" data-watch-panel="availability" hidden><p>${safe(m.availability)}</p><a href="/availability-report.html">Open live availability →</a></div><div class="playoff-watch-panel" data-watch-panel="score" hidden><p><b>We Know the W Score:</b> <span data-w-score>${safe(m.wScore||'Live')}</span></p><small>Context board, not a prediction. Offense, defense, depth, recent form and availability are kept separate from the playoff series score.</small></div></article>`).join('');
    return `<section class="snack-section playoff-watch-dashboard" data-playoff-watch><div class="playoff-watch-head"><span>PLAYOFF WATCH GUIDE · LIVE BOARD</span><h3>${safe(board.title||'The Playoff Watch Party')}</h3><p>${safe(board.subtitle||'')}</p><small>${safe(board.asOf||'')}</small></div><div class="playoff-watch-summary"><div><strong>8</strong><span>teams</span></div><div><strong>4</strong><span>first-round series</span></div><div><strong>0-0</strong><span>playoffs start clean</span></div></div><div class="playoff-watch-grid">${cards}</div><p class="playoff-watch-note">Regular-season head-to-head is context. Playoff series wins are tracked separately and update from the postseason feed.</p></section>`;
  }
  function wirePlayoffWatch(story){
    const root=story?.querySelector('[data-playoff-watch]');if(!root||root.dataset.ready==='1')return;root.dataset.ready='1';
    root.querySelectorAll('.playoff-watch-card').forEach(card=>card.querySelectorAll('[data-watch-tab]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.watchTab;card.querySelectorAll('[data-watch-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));card.querySelectorAll('[data-watch-panel]').forEach(p=>p.hidden=p.dataset.watchPanel!==mode);})));
    const refresh=async()=>{try{const response=await fetch('/api/competition?season=2026&cb='+Date.now(),{cache:'no-store'});if(!response.ok)return;const payload=await response.json();const series=payload.playoffs?.series||[];root.querySelectorAll('[data-playoff-matchup]').forEach(card=>{const id=card.dataset.playoffMatchup,config=(window.__playoffWatchMatchups||{})[id];if(!config)return;const row=series.find(s=>[s.teamA,s.teamB].includes(config.a)&&[s.teamA,s.teamB].includes(config.b));if(!row)return;const winsA=row.teamA===config.a?row.winsA:row.winsB,winsB=row.teamB===config.b?row.winsB:row.winsA;const score=card.querySelector('[data-playoff-series]'),game=card.querySelector('[data-playoff-game]');if(score)score.textContent=winsA+'-'+winsB;if(game){const played=(row.games||[]).length;game.textContent=played?('Game '+(played+1)+' next'): 'Game 1 next';}});}catch{}};
    window.__playoffWatchMatchups={};
    [
      {id:'min-nyl',a:'Minnesota Lynx',b:'New York Liberty'},
      {id:'gsv-dal',a:'Golden State Valkyries',b:'Dallas Wings'},
      {id:'lva-ind',a:'Las Vegas Aces',b:'Indiana Fever'},
      {id:'atl-was',a:'Atlanta Dream',b:'Washington Mystics'}
    ].forEach(m=>window.__playoffWatchMatchups[m.id]=m);refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);
  }
  function rankingsMarkup(rankings=[]){if(!rankings.length)return'';return `<section class="snack-section"><h3>Power rankings</h3><div class="rankings-table"><div class="rank-row head"><span>#</span><span>Team</span><span>Move</span><span>What Shak is seeing</span></div>${rankings.map(item=>`<div class="rank-row"><span class="rank">${safe(item.rank)}</span><strong>${safe(item.team)}</strong><span class="move">${safe(item.movement||'')}</span><span>${safe(item.note||'')}</span></div>`).join('')}</div></section>`;}
  function storyCellMarkup(column,cell,index){
    const name=String(column||'').trim().toLowerCase();
    const value=String(cell??'');
    if(name==='player'&&playerPhoto(value)){const photo=playerPhoto(value);return `<div class="story-player-cell"><img class="story-player-photo" src="${safe(photo)}" alt="Official player photo of ${safe(value)}" loading="lazy" decoding="async" onerror="this.style.display='none'"><strong>${safe(value)}</strong></div>`;}
    if(name==='country'&&COUNTRY_CODES[value]){const flag=flagPhoto(value);return `<div class="story-country-cell"><img class="story-country-flag" src="${safe(flag)}" alt="${safe(value)} flag" loading="lazy" decoding="async" onerror="this.style.display='none'"><span>${safe(value)}</span></div>`;}
    return index===1?`<strong>${safe(value)}</strong>`:`<span>${safe(value)}</span>`;
  }
  function tableMarkup(table={}){const columns=Array.isArray(table.columns)?table.columns:[],rows=Array.isArray(table.rows)?table.rows:[];if(!columns.length||!rows.length)return'';const hasPeople=columns.some(column=>String(column).toLowerCase()==='player')&&columns.some(column=>String(column).toLowerCase()==='country');if(hasPeople)ensureStoryTableMediaStyles();return `<section class="snack-section story-table-section"><div class="story-table-scroll"><div class="story-table${hasPeople?' has-people':''}" style="--story-cols:${columns.length}"><div class="story-table-row head">${columns.map(column=>`<span>${safe(column)}</span>`).join('')}</div>${rows.map(row=>`<div class="story-table-row">${row.map((cell,index)=>storyCellMarkup(columns[index],cell,index)).join('')}</div>`).join('')}</div></div></section>`;}
  function trioPlayerMarkup(player={}){
    const id=player.id?encodeURIComponent(player.id):'';
    const photo=player.photo||(id?`https://cdn.wnba.com/headshots/wnba/latest/260x190/${id}.png`:playerPhoto(player.name));
    const fallback=id?`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${id}.png?retry=1`:'';
    const recovery=fallback?` data-fallback="${safe(fallback)}" onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.hidden=true}"`:' onerror="this.hidden=true"';
    const games=Number.isFinite(Number(player.games))?` · ${safe(player.games)} G`:'';
    return `<figure class="trio-player"><div class="trio-player-photo">${photo?`<img src="${safe(photo)}" alt="Official WNBA headshot of ${safe(player.name)}" loading="lazy" decoding="async"${recovery}>`:''}</div><figcaption><strong>${safe(player.name)}</strong><span>${safe(player.ppg)} PPG · ${safe(player.apg)} APG${games}</span></figcaption></figure>`;
  }
  function trioSeedComparison(rank,seed){
    const place=Number(rank),line=Number(seed);
    if(!Number.isFinite(place)||!Number.isFinite(line))return'';
    if(place===line)return'Matches final seed';
    const gap=Math.abs(place-line);
    return `${gap} ${gap===1?'spot':'spots'} ${place<line?'above':'below'} final seed`;
  }
  function trioModePanel(mode,team,maxima){
    if(mode==='defense'){
      const meter=Math.max(12,Math.round(((maxima.maxDefense-team.defRtg+1)/(maxima.maxDefense-maxima.minDefense+1))*100));
      return `<div class="trio-mode-panel" data-trio-panel="defense" hidden><div class="trio-metric-grid"><div><span>TEAM DEF RTG</span><strong>${safe(team.defRtg)}</strong><small>points allowed per 100</small></div><div><span>TRIO STOCKS</span><strong>${safe(team.stocks)}</strong><small>steals + blocks per game</small></div><div><span>DEFENSE RANK</span><strong>#${safe(team.defenseRank)}</strong><small>among playoff teams</small></div></div><div class="trio-meter" aria-label="Defensive strength"><span style="--trio-meter:${meter}%"></span></div><p>${safe(team.defenseNote)}</p></div>`;
    }
    if(mode==='fiba'){
      const meter=Math.max(4,Math.round((Math.max(0,team.postMargin)/maxima.maxMargin)*100));
      return `<div class="trio-mode-panel" data-trio-panel="fiba" hidden><div class="trio-metric-grid"><div><span>POST-BREAK</span><strong>${safe(team.postRecord)}</strong><small>${safe(team.preRecord)} before the break</small></div><div><span>TEAM MARGIN</span><strong>${team.postMargin>0?'+':''}${safe(team.postMargin)}</strong><small>per game since return</small></div><div><span>OPPONENT PPG</span><strong>${safe(team.postOppPpg)}</strong><small>Sept. 17 to 24</small></div></div><div class="trio-meter" aria-label="Post-FIBA scoring margin"><span style="--trio-meter:${meter}%"></span></div><p>${safe(team.breakNote)}</p></div>`;
    }
    const meter=Math.max(8,Math.round((team.ppg/maxima.maxPpg)*100));
    return `<div class="trio-mode-panel" data-trio-panel="offense"><div class="trio-metric-grid"><div><span>TRIO PPG</span><strong>${safe(team.ppg)}</strong><small>combined season average</small></div><div><span>TRIO APG</span><strong>${safe(team.apg)}</strong><small>combined season average</small></div><div><span>TEAM OFF RTG</span><strong>${safe(team.offRtg)}</strong><small>points per 100</small></div></div><div class="trio-meter" aria-label="Trio scoring production"><span style="--trio-meter:${meter}%"></span></div><p>${safe(team.offenseNote)}</p></div>`;
  }
  function trioDashboardMarkup(board={}){
    const teams=Array.isArray(board.teams)?board.teams:[];
    if(!teams.length)return'';
    const maxima={maxPpg:Math.max(...teams.map(team=>Number(team.ppg)||0),1),maxMargin:Math.max(...teams.map(team=>Number(team.postMargin)||0),1),minDefense:Math.min(...teams.map(team=>Number(team.defRtg)||999)),maxDefense:Math.max(...teams.map(team=>Number(team.defRtg)||0))};
    const cards=teams.map(team=>`<article class="trio-team-card" style="--trio-color:${safe(team.color||'#6c2ad9')}" data-seed="${safe(team.seed)}" data-offense-rank="${safe(team.offenseRank)}" data-defense-rank="${safe(team.defenseRank)}" data-fiba-rank="${safe(team.fibaRank)}"><header><span class="trio-rank" data-trio-rank>${String(team.offenseRank).padStart(2,'0')}</span><div><span>FINAL SEED ${safe(team.seed)} · ${safe(team.record)}</span><h4>${safe(team.team)}</h4><p>${safe(team.identity)}</p><b class="trio-seed-compare" data-trio-compare>${safe(trioSeedComparison(team.offenseRank,team.seed))}</b></div></header><div class="trio-player-row">${(team.players||[]).map(trioPlayerMarkup).join('')}</div>${trioModePanel('offense',team,maxima)}${trioModePanel('defense',team,maxima)}${trioModePanel('fiba',team,maxima)}</article>`).join('');
    return `<section class="snack-section trio-dashboard" data-trio-dashboard data-default-mode="offense"><div class="trio-dashboard-head"><div><span class="trio-dashboard-kicker">THE PLAYOFF TRIO BOARD</span><h3>${safe(board.title||'Three players. Two sides of the ball.')}</h3><p>${safe(board.intro||'')}</p></div><div class="trio-dashboard-stamp"><strong>${safe(board.asOf||'')}</strong><span>${safe(board.window||'')}</span></div></div><div class="trio-dashboard-summary"><div><strong>8</strong><span>playoff teams</span></div><div><strong>24</strong><span>players in focus</span></div><div><strong>${safe(board.postGames||4)}</strong><span>games each after FIBA</span></div></div><div class="trio-dashboard-controls" role="group" aria-label="Rank playoff trios by"><button type="button" data-trio-mode="offense" aria-pressed="true">Production</button><button type="button" data-trio-mode="defense" aria-pressed="false">Limiting scoring</button><button type="button" data-trio-mode="fiba" aria-pressed="false">Post-FIBA pulse</button></div><p class="trio-dashboard-status" data-trio-status aria-live="polite">Ranked by combined final regular-season scoring. Assists and official team offensive rating add context.</p><div class="trio-team-grid" data-trio-grid>${cards}</div><aside class="trio-method"><strong>How the board works</strong><p>${safe(board.methodology||'')}</p></aside></section>`;
  }
  function wireTrioDashboard(story){
    const board=story?.querySelector('[data-trio-dashboard]');
    if(!board||board.dataset.ready==='1')return;
    board.dataset.ready='1';
    const buttons=[...board.querySelectorAll('[data-trio-mode]')],grid=board.querySelector('[data-trio-grid]'),status=board.querySelector('[data-trio-status]');
    const copy={offense:'Ranked by combined final regular-season scoring. Assists and official team offensive rating add context.',defense:'Ranked by final official team defensive rating. Trio steals and blocks show activity, but no three players defend alone.',fiba:'Ranked by team scoring margin from Sept. 17 through Sept. 24. Four games show the full return window.'};
    function setMode(mode){
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.trioMode===mode)));
      const cards=[...grid.querySelectorAll('.trio-team-card')].sort((a,b)=>Number(a.dataset[`${mode}Rank`])-Number(b.dataset[`${mode}Rank`]));
      cards.forEach(card=>{const rank=Number(card.dataset[`${mode}Rank`]),seed=Number(card.dataset.seed);card.querySelector('[data-trio-rank]').textContent=String(rank).padStart(2,'0');const comparison=card.querySelector('[data-trio-compare]');if(comparison)comparison.textContent=trioSeedComparison(rank,seed);card.querySelectorAll('[data-trio-panel]').forEach(panel=>{panel.hidden=panel.dataset.trioPanel!==mode;});grid.appendChild(card);});
      board.dataset.mode=mode;if(status)status.textContent=copy[mode]||copy.offense;
    }
    buttons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.trioMode)));
    setMode(board.dataset.defaultMode||'offense');
  }
  function sectionsMarkup(sections=[]){return sections.map(section=>`<section class="snack-section"><h3>${safe(section.title)}</h3>${(section.paragraphs||[]).map(paragraph=>`<p>${safe(paragraph)}</p>`).join('')}</section>`).join('');}
  function debatesMarkup(items=[]){return items.length?`<section class="snack-debate-board"><h3>Spicy debate board</h3><ul>${items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul></section>`:'';}
  function foodMarkup(food={}){return food.title||food.script?`<section class="food-segment"><span class="segment-label">FROM THE KITCHEN</span><h3>${safe(food.title||'This week’s segment')}</h3>${food.script?`<blockquote>${safe(food.script)}</blockquote>`:''}</section>`:'';}
  function sourcesMarkup(sources=[]){return sources.length?`<section class="source-list"><strong>Receipts</strong><p>${sources.map(source=>`<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.label||'Source')}</a>`).join(' · ')}</p></section>`:'';}
  function storyMarkup(post){return `<a class="snack-story-back" href="${pagePath}">← Back to all ${mode==='feature'?'Food for Thought articles':'Snack Shak Bytes'}</a><article class="snack-post"><header class="snack-post-header ${mode==='feature'?'feature-header':''}"><span class="snack-series-label">${safe(label(post))}</span><div class="meta"><span>${safe(format(post.published))}</span>${post.week?`<span>•</span><span>${safe(post.week)}</span>`:''}</div><h2>${safe(post.title)}</h2><p class="dek">${safe(post.dek||'')}</p></header>${storyImageMarkup(post)}${playoffWatchMarkup(post.playoffWatch)}${playoffBoardMarkup(post)}${rankingsMarkup(post.rankings)}${tableMarkup(post.storyTable)}${trioDashboardMarkup(post.trioDashboard)}${sectionsMarkup(post.sections)}${debatesMarkup(post.debates)}${foodMarkup(post.foodSegment)}${sourcesMarkup(post.sources)}</article>`;}

  function showStory(post,story,{scroll=true,updateUrl=false}={}){
    if(!post||!story)return false;
    story.hidden=false;
    story.innerHTML=storyMarkup(post);
    if(post.slug==='the-playoff-watch-party-2026')updatePlayoffBoard();
    wirePlayoffWatch(story);
    wireTrioDashboard(story);
    document.title=`${post.title} | ${mode==='feature'?'Food for Thought':'Snack Shak Bytes'}`;
    if(updateUrl){const destination=href(post);history.pushState({story:post.slug},'',destination);}
    if(scroll)requestAnimationFrame(()=>story.scrollIntoView({block:'start',behavior:'smooth'}));
    return true;
  }

  function wireCardNavigation(list,story,posts){
    if(!list||list.dataset.storyNavigationReady==='1')return;
    list.dataset.storyNavigationReady='1';
    list.addEventListener('click',event=>{
      const cardLink=event.target.closest('a.snack-collection-card[data-story-slug]');
      if(!cardLink||!list.contains(cardLink))return;
      const slug=cardLink.dataset.storySlug;
      const post=posts.find(item=>item.slug===slug);
      if(!post||post.dashboardUrl)return;
      event.preventDefault();
      showStory(post,story,{scroll:true,updateUrl:true});
    });
    window.addEventListener('popstate',()=>{
      const requested=new URLSearchParams(location.search).get('post')?.replaceAll('snack-shaq','snack-shak');
      const post=posts.find(item=>item.slug===requested);
      if(post)showStory(post,story,{scroll:false,updateUrl:false});
      else if(story){story.hidden=true;story.innerHTML='';}
    });
  }

  async function load(){
    const list=document.getElementById('snackCollectionGrid'),story=document.getElementById('snackCollectionStory');
    if(!list)return;
    try{
      const results=await Promise.allSettled(sources.map(fetchPosts));
      const bySlug=new Map();
      results.forEach(result=>{if(result.status==='fulfilled')result.value.forEach(post=>{if(post?.slug)isMatch(post)&&bySlug.set(post.slug,post);});});
      const posts=[...bySlug.values()].sort((a,b)=>String(b.published||'').localeCompare(String(a.published||''))||Number(b.priority||0)-Number(a.priority||0));
      list.innerHTML=posts.map(card).join('')||'<p>No stories are published in this collection yet.</p>';
      wireCardNavigation(list,story,posts);
      const requested=new URLSearchParams(location.search).get('post')?.replaceAll('snack-shaq','snack-shak');
      const active=posts.find(post=>post.slug===requested);
      if(active&&story)showStory(active,story,{scroll:location.hash==='#story',updateUrl:false});
      else if(requested&&story){story.hidden=false;story.innerHTML='<article class="snack-post"><h2>That story is reconnecting.</h2><p>The archive loaded, but this story was not found in the current feed. Try opening the tile again from the collection.</p></article>';}
    }catch{
      list.innerHTML='<p>This collection is reconnecting to the story archive.</p>';
    }
  }
  load();
  setInterval(()=>{if(!document.hidden&&document.getElementById('snackPlayoffBoard'))updatePlayoffBoard();},60000);
})();
