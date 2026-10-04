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
  const PLAYOFF_TEAM_LOGOS={
    'Atlanta Dream':'https://cdn.wnba.com/logos/wnba/1611661330/primary/L/logo.svg',
    'Dallas Wings':'https://cdn.wnba.com/logos/wnba/1611661321/primary/L/logo.svg',
    'Golden State Valkyries':'https://cdn.wnba.com/logos/wnba/1611661331/primary/L/logo.svg',
    'Indiana Fever':'https://cdn.wnba.com/logos/wnba/1611661325/primary/L/logo.svg',
    'Las Vegas Aces':'https://cdn.wnba.com/logos/wnba/1611661319/primary/L/logo.svg',
    'Minnesota Lynx':'https://cdn.wnba.com/logos/wnba/1611661324/primary/L/logo.svg',
    'New York Liberty':'https://cdn.wnba.com/logos/wnba/1611661313/primary/L/logo.svg',
    'Washington Mystics':'https://cdn.wnba.com/logos/wnba/1611661322/primary/L/logo.svg'
  };
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
  function imageRecovery(fallback=''){
    return fallback?` data-fallback="${safe(fallback)}" onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback;this.style.objectFit='contain';this.style.objectPosition='center';this.style.background='#140a2f'}else{this.hidden=true}"`:' onerror="this.hidden=true"';
  }
  function card(post){const fit=post.imageFit==='contain'?' is-contain':post.imageFit==='top-cover'?' is-top-cover':'';const media=post.image?`<div class="snack-collection-card-media${fit}"><img src="${safe(post.image)}" alt="${safe(post.imageAlt||post.title||'')}" loading="lazy" decoding="async"${imageRecovery(post.imageFallback||'')}></div>`:'';return `<a class="snack-collection-card ${mode} ${media?'has-media':''}" data-story-slug="${safe(post.slug||'')}" href="${safe(href(post))}">${media}<span>${safe(label(post))}</span><time datetime="${safe(post.published||'')}">${safe(format(post.published))}</time><strong>${safe(post.title)}</strong><p>${safe(post.dek||'Open this Snack Shak story.')}</p><b>${mode==='feature'?'Read the long article →':'Read the Byte →'}</b></a>`;}

  function storyImageMarkup(post={}){const source=post.storyImage||post.image;if(!source)return'';const sourceLink=post.storyImageSourceUrl?` <a href="${safe(post.storyImageSourceUrl)}" target="_blank" rel="noopener noreferrer">Official WNBA source ↗</a>`:'';return `<figure class="snack-story-graphic"><img src="${safe(source)}" alt="${safe(post.imageAlt||post.title||'')}" decoding="async"${imageRecovery(post.storyImageFallback||post.imageFallback||'')}>${post.storyImageCaption||sourceLink?`<figcaption>${safe(post.storyImageCaption||'')}${sourceLink}</figcaption>`:''}</figure>`;}
  function playoffGameOneMarkup(report={}){
    const receipts=Array.isArray(report.receipts)?report.receipts:[],highlights=Array.isArray(report.highlights)?report.highlights:[];
    if(!receipts.length&&!highlights.length)return'';
    return `<section class="snack-section playoff-game-one" aria-label="${safe(report.ariaLabel||'Playoff records and highlights')}"><header><div><span>${safe(report.eyebrow||'PLAYOFF RECEIPTS')}</span><h3>${safe(report.title||'What moved the bracket')}</h3><p>${safe(report.dek||'')}</p></div><small>${safe(report.asOf||'')}</small></header>${receipts.length?`<div class="playoff-record-grid">${receipts.map(item=>`<article><strong>${safe(item.value)}</strong><span>${safe(item.label)}</span><p>${safe(item.note||'')}</p></article>`).join('')}</div>`:''}${highlights.length?`<div class="playoff-highlight-grid">${highlights.map(item=>`<article><figure><img src="${safe(item.photo||'')}" alt="${safe(item.photoAlt||`Official WNBA photo of ${item.player||''}`)}" loading="lazy" decoding="async"${imageRecovery(item.photoFallback||'')}><figcaption>${safe(item.photoCredit||'Official WNBA media')}</figcaption></figure><div><span>${safe(item.score||'PLAYOFFS')}</span><h4>${safe(item.title||item.player||'Game highlight')}</h4><strong>${safe(item.stat||'')}</strong><p>${safe(item.note||'')}</p></div></article>`).join('')}</div>`:''}</section>`;
  }
  function playoffGalleryMarkup(gallery={}){
    const items=Array.isArray(gallery.items)?gallery.items:[];if(!items.length)return'';
    return `<section class="snack-section playoff-game-gallery"><header><span>${safe(gallery.eyebrow||'FROM THE GAME TAPE')}</span><h3>${safe(gallery.title||'The moments that moved the bracket')}</h3><p>${safe(gallery.dek||'')}</p></header><div>${items.map(item=>`<a href="${safe(item.sourceUrl||'#')}" target="_blank" rel="noopener noreferrer"><figure><img src="${safe(item.image||'')}" alt="${safe(item.alt||item.title||'WNBA playoff game action')}" loading="lazy" decoding="async"${imageRecovery(item.imageFallback||'')}><figcaption><span>${safe(item.kicker||'PLAYOFF MOMENT')}</span><strong>${safe(item.title||'')}</strong><p>${safe(item.caption||'')}</p><small>${safe(item.credit||'Official WNBA game media')} ↗</small></figcaption></figure></a>`).join('')}</div></section>`;
  }
  function playoffAwardFalloutMarkup(board={}){
    const people=Array.isArray(board.people)?board.people:[],implications=Array.isArray(board.implications)?board.implications:[];
    if(!people.length&&!implications.length)return'';
    return `<section class="snack-section playoff-award-fallout"><header><div><span>${safe(board.eyebrow||'AWARDS VS. THE BRACKET')}</span><h3>${safe(board.title||'Regular-season truth met playoff truth')}</h3><p>${safe(board.dek||'')}</p></div><strong>${safe(board.stamp||'ANALYSIS')}</strong></header>${people.length?`<div class="playoff-award-people">${people.map(person=>`<article style="--award-accent:${safe(person.accent||'#d8ff4f')}"><figure class="${person.photoFit==='contain'?'is-contain':''}"><img src="${safe(person.photo||'')}" alt="${safe(person.photoAlt||person.name||'')}" loading="lazy" decoding="async" onerror="this.hidden=true"></figure><div><span>${safe(person.award||'')}</span><h4>${safe(person.name||'')}</h4><p class="playoff-award-team">${safe(person.team||'')}</p><strong>${safe(person.receipt||'')}</strong><p>${safe(person.playoff||'')}</p></div></article>`).join('')}</div>`:''}${implications.length?`<div class="playoff-implication-grid">${implications.map((item,index)=>`<article><span>0${index+1}</span><h4>${safe(item.title||'')}</h4><p>${safe(item.text||'')}</p></article>`).join('')}</div>`:''}${board.verdict?`<blockquote>${safe(board.verdict)}</blockquote>`:''}${board.note?`<p class="playoff-award-note">${safe(board.note)}</p>`:''}</section>`;
  }
  function playoffBoardMarkup(post){return post.slug==='the-playoff-watch-party-2026'?'<div data-wktw-playoff-bracket data-variant="story" aria-label="Live 2026 WNBA playoff bracket"></div>':'';}
  async function updatePlayoffBoard(){const board=document.getElementById('snackPlayoffBoard');if(!board)return;try{const response=await fetch(`/api/competition?season=2026&cb=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw Error('unavailable');const data=await response.json();const games=(data.playoffs?.games||[]).filter(game=>game.date>='2026-09-27'&&game.date<='2026-09-28'&&[['Minnesota Lynx','New York Liberty'],['Golden State Valkyries','Dallas Wings'],['Las Vegas Aces','Indiana Fever'],['Atlanta Dream','Washington Mystics']].some(pair=>pair.includes(game.homeTeam)&&pair.includes(game.awayTeam)));board.innerHTML=games.map(game=>{const date=game.startTimeUtc?new Date(game.startTimeUtc):null;const time=date&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(date)+' ET':'Time TBD';const score=game.completed||game.state==='in'?` · ${safe(game.awayScore??'–')}–${safe(game.homeScore??'–')} · ${safe(game.status||'')}`:'';return `<a href="${game.officialFallback?`https://www.wnba.com/game/${encodeURIComponent(game.id)}`:`/games.html`}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px;margin:8px 0;border-radius:12px;background:#f4eefb;color:#29134a;text-decoration:none"><strong>${safe(game.awayTeam)} at ${safe(game.homeTeam)}</strong><br><small>${safe(time)}${score} · Official game ↗</small></a>`;}).join('')||'<p>Fixtures are temporarily unavailable. See the official WNBA bracket.</p>';}catch{board.innerHTML='<p>Live scores are temporarily unavailable. <a href="https://www.wnba.com/playoffs/2026">See the official bracket ↗</a></p>';}}
  function playoffWatchMarkup(board={}){
    const matchups=Array.isArray(board.matchups)?board.matchups:[];if(!matchups.length)return'';
    const palette={
      'min-nyl':['#0c2340','#6eceb2','#78be20'],
      'gsv-dal':['#5f259f','#0c2340','#c4d600'],
      'lva-ind':['#c8102e','#002d62','#fdbb30'],
      'atl-was':['#c8102e','#002b5c','#69b3e7'],
      'atl-nyl':['#c8102e','#111','#6eceb2']
    };
    const cards=matchups.map(m=>{
      const colors=palette[m.id]||['#2a1248','#6f25e8','#d8ff4f'];
      const stars=(m.stars||[]).map((name,i)=>`<figure><img src="${safe((m.starPhotos||[])[i]||'')}" alt="Official WNBA headshot of ${safe(name)}" loading="lazy" decoding="async" onerror="this.hidden=true"><figcaption><span>STAR WATCH</span><strong>${safe(name)}</strong></figcaption></figure>`).join('');
      const highLogo=PLAYOFF_TEAM_LOGOS[m.highTeam]||'',lowLogo=PLAYOFF_TEAM_LOGOS[m.lowTeam]||'';
      return `<article class="playoff-matchup-row" data-playoff-matchup="${safe(m.id)}" data-team-a="${safe(m.highTeam)}" data-team-b="${safe(m.lowTeam)}" data-playoff-round="${safe(m.roundKey||'First Round')}" style="--match-a:${safe(colors[0])};--match-b:${safe(colors[1])};--match-pop:${safe(colors[2])}">
        <header class="playoff-matchup-band">
          <div class="playoff-team-side is-a">${highLogo?`<img class="playoff-team-logo" src="${safe(highLogo)}" alt="${safe(m.highTeam)} logo" loading="lazy" decoding="async" onerror="this.hidden=true">`:''}<span>SEED ${safe(m.highSeed)}</span><strong>${safe(m.highTeam)}</strong><small>${safe(m.highRecord)}</small></div>
          <div class="playoff-vs-mark"><b>VS</b><small>${safe(m.roundLabel||m.roundKey||'FIRST ROUND')}</small></div>
          <div class="playoff-team-side is-b">${lowLogo?`<img class="playoff-team-logo" src="${safe(lowLogo)}" alt="${safe(m.lowTeam)} logo" loading="lazy" decoding="async" onerror="this.hidden=true">`:''}<span>SEED ${safe(m.lowSeed)}</span><strong>${safe(m.lowTeam)}</strong><small>${safe(m.lowRecord)}</small></div>
        </header>
        <div class="playoff-matchup-scoreline">
          <div><span>REGULAR SEASON</span><strong>${safe(m.regularSeries)}</strong><small>head-to-head only</small></div>
          <div class="is-series"><span>PLAYOFF SERIES</span><strong data-playoff-series>${safe(m.series||'0-0')}</strong><small data-playoff-game>${safe(m.seriesNote||'Schedule loading')}</small></div>
          <div class="is-next"><span data-playoff-next-label>NEXT GAME</span><strong data-playoff-tip>${safe(m.nextGame||m.game1||'Schedule loading')}</strong><small>all times Eastern</small></div>
        </div>
        <div class="playoff-matchup-main">
          <div class="playoff-star-watch">${stars}</div>
          <div class="playoff-read-grid">
            <div><span>HOW DO THEY BEAT YOU?</span><p>${safe(m.beat)}</p></div>
            <div><span>WHAT CAN BREAK THEM?</span><p>${safe(m.break)}</p></div>
            <div><span>WHO HAS TO SHOW UP?</span><p>${safe(m.must)}</p></div>
          </div>
        </div>
        <div class="playoff-context-strip">
          <div><span>WHO'S HOT</span><p>${safe(m.hot)}</p></div>
          <div><span>BENCH CHECK</span><p>${safe(m.bench)}</p></div>
          <a href="/availability-report.html"><span>AVAILABILITY</span><p>${safe(m.availability)}</p><b>LIVE REPORT →</b></a>
          <div class="is-w-score"><span>WE KNOW THE W SCORE</span><div class="playoff-w-score-pair"><b>${safe(m.highCode||'HIGH')} <strong>${safe(m.highWScore??'—')}</strong></b><b>${safe(m.lowCode||'LOW')} <strong>${safe(m.lowWScore??'—')}</strong></b></div><small>final regular-season composite</small></div>
        </div>
      </article>`;
    }).join('');
    const summary=Array.isArray(board.summary)&&board.summary.length?board.summary:[{value:'6',label:'teams left'},{value:'2',label:'Game 3s left'},{value:'BO5',label:'semifinals'}];
    return `<section class="snack-section playoff-watch-dashboard fiba-inspired" data-playoff-watch><div class="playoff-watch-head"><div><span>PLAYOFF WATCH GUIDE · LIVE BOARD</span><h3>${safe(board.title||'The Playoff Watch Party')}</h3><p>${safe(board.subtitle||'')}</p></div><small>${safe(board.asOf||'')}</small></div><div class="playoff-watch-summary">${summary.map(item=>`<div${item.key?` data-playoff-summary-key="${safe(item.key)}"`:''}><strong>${safe(item.value)}</strong><span>${safe(item.label)}</span></div>`).join('')}</div><div class="playoff-matchup-stack">${cards}</div><p class="playoff-watch-note">Regular-season head-to-head is context. Playoff series wins are tracked separately and refresh from the postseason feed. ${safe(board.scoreMethod||'')}</p></section>`;
  }
  function wirePlayoffWatch(story){
    const root=story?.querySelector('[data-playoff-watch]');if(!root||root.dataset.ready==='1')return;root.dataset.ready='1';
    const refresh=async()=>{try{
      const response=await fetch('/api/competition?season=2026&cb='+Date.now(),{cache:'no-store'});if(!response.ok)return;
      const payload=await response.json(),series=payload.playoffs?.series||[],games=payload.playoffs?.games||[];
      const day=value=>{if(!value)return'';const d=new Date(value+'T12:00:00-04:00');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric'}).format(d);};
      const tip=value=>{if(!value)return'';const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(d)+' ET';};
      const firstRound=series.filter(item=>(item.round||'First Round')==='First Round'),closed=firstRound.filter(item=>item.complete).length;
      const summaryValue=(key,value)=>{const host=root.querySelector(`[data-playoff-summary-key="${key}"] strong`);if(host)host.textContent=String(value);};
      summaryValue('teams',Math.max(4,8-closed));
      summaryValue('game3s',games.filter(game=>(game.round||'First Round')==='First Round'&&Number(game.gameNumber)===3&&!game.completed&&String(game.state||'').toLowerCase()!=='post').length);
      root.querySelectorAll('[data-playoff-matchup]').forEach(card=>{
        const config={a:card.dataset.teamA,b:card.dataset.teamB,round:card.dataset.playoffRound||'First Round'};if(!config.a||!config.b)return;
        const row=series.find(item=>(item.round||'First Round')===config.round&&[item.teamA,item.teamB].includes(config.a)&&[item.teamA,item.teamB].includes(config.b));
        const score=card.querySelector('[data-playoff-series]'),gameState=card.querySelector('[data-playoff-game]');
        if(row){
          const aWins=row.teamA===config.a?row.winsA:row.winsB,bWins=row.teamB===config.b?row.winsB:row.winsA;
          if(score)score.textContent=aWins+'-'+bWins;
          if(gameState){const played=Number(row.winsA||0)+Number(row.winsB||0);gameState.textContent=row.complete?`${row.winner||'Winner'} advances`:played?('Game '+(played+1)+' next'):'Game 1 next';}
        }
        const pairGames=games.filter(game=>(game.round||config.round)===config.round&&[game.homeTeam,game.awayTeam].includes(config.a)&&[game.homeTeam,game.awayTeam].includes(config.b)).sort((a,b)=>Date.parse(a.startTimeUtc||a.date)-Date.parse(b.startTimeUtc||b.date));
        const next=pairGames.find(game=>!game.completed&&String(game.state||'').toLowerCase()!=='post'),latest=[...pairGames].reverse().find(game=>game.completed||String(game.state||'').toLowerCase()==='post');
        const display=next||latest,tipHost=card.querySelector('[data-playoff-tip]'),nextLabel=card.querySelector('[data-playoff-next-label]');
        if(display&&tipHost){
          const gameNumber=Number(display.gameNumber)||Math.max(1,(row?.games||[]).length+(next?1:0));
          if(next){
            const live=String(next.state||'').toLowerCase()==='in',when=day(next.date),time=next.startTimeUtc?tip(next.startTimeUtc):'',network=(next.broadcasts||[])[0]||'';
            if(nextLabel)nextLabel.textContent=live?`LIVE · GAME ${gameNumber}`:`GAME ${gameNumber}`;
            tipHost.textContent=live?`${next.awayScore??'–'}–${next.homeScore??'–'} · ${next.status||'Live'}`:[when,time||'Time TBD',network].filter(Boolean).join(' · ');
          }else{
            if(nextLabel)nextLabel.textContent=`GAME ${gameNumber} FINAL`;
            tipHost.textContent=`${latest.awayScore??'–'}–${latest.homeScore??'–'} · ${latest.status||'Final'}`;
          }
        }
      });
    }catch{}};
    refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);
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
  function apPhoto(person={}){
    if(person.photo)return person.photo;
    return person.id?`https://cdn.wnba.com/headshots/wnba/latest/260x190/${encodeURIComponent(person.id)}.png`:'';
  }
  function apPhotoMarkup(person={},className=''){
    const photo=apPhoto(person);
    if(!photo)return'';
    const fallback=person.id?`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${encodeURIComponent(person.id)}.png`:'';
    const recovery=fallback?` data-fallback="${safe(fallback)}" onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback}else{this.hidden=true}"`:' onerror="this.hidden=true"';
    return `<img class="${safe(className)}" src="${safe(photo)}" alt="${safe(person.photoAlt||`Official WNBA photo of ${person.name}`)}" loading="lazy" decoding="async"${recovery}>`;
  }
  function apWinnerCard(winner={}){
    return `<article class="ap-winner-card" data-ap-winner-group="${safe(winner.group||'headline')}"><div class="ap-winner-photo">${apPhotoMarkup(winner,'')}</div><div class="ap-winner-copy"><span>${safe(winner.award)}</span><h4>${safe(winner.name)}</h4><p class="ap-winner-team">${safe(winner.team)}</p><div class="ap-winner-receipt"><strong>${safe(winner.stat)}</strong><small>${safe(winner.statLabel)}</small></div><p>${safe(winner.case)}</p>${winner.history?`<b>${safe(winner.history)}</b>`:''}</div></article>`;
  }
  function apHistoryPanel(category={},index=0){
    const counts=new Map();
    (category.seasons||[]).forEach(season=>(season.winners||[]).forEach(name=>counts.set(name,(counts.get(name)||0)+1)));
    const high=Math.max(...counts.values(),0);
    const leaders=[...counts.entries()].filter(([,count])=>count===high).map(([name])=>name);
    const leaderCopy=high===1?`${counts.size} different winners`:`${leaders.join(' + ')} · ${high} wins`;
    const timeline=(category.seasons||[]).map(season=>`<div class="ap-history-year${Number(season.year)===2026?' current':''}"><span>${safe(season.year)}</span><strong>${safe((season.winners||[]).join(' + '))}</strong></div>`).join('');
    return `<section class="ap-history-panel" data-ap-history-panel="${safe(category.key)}"${index?' hidden':''}><div class="ap-history-leader"><span>MOST AP WINS</span><strong>${safe(leaderCopy)}</strong><p>${safe(category.note||'')}</p></div><div class="ap-history-timeline">${timeline}</div></section>`;
  }
  function apBallotPanel(group={},index=0){
    const cards=(group.players||[]).map(player=>`<article class="ap-ballot-player"><div>${apPhotoMarkup(player,'')}</div><strong>${safe(player.name)}</strong><span>${safe(player.team)}</span></article>`).join('');
    return `<section class="ap-ballot-panel" data-ap-ballot-panel="${safe(group.key)}"${index?' hidden':''}><p>${safe(group.note||'')}</p><div class="ap-ballot-grid">${cards}</div></section>`;
  }
  function apAwardsDashboardMarkup(board={}){
    const winners=Array.isArray(board.winners)?board.winners:[];
    const history=Array.isArray(board.history)?board.history:[];
    const ballots=Array.isArray(board.ballots)?board.ballots:[];
    if(!winners.length||!history.length)return'';
    const winnerFilters=[['all','All seven'],['headline','Headliners'],['role','Role awards'],['coach','Coach']];
    return `<section class="snack-section ap-awards-dashboard" data-ap-awards-dashboard><header class="ap-awards-head"><div><span>THE 2026 AP AWARD BOARD</span><h3>${safe(board.title||'The ballot and the history behind it')}</h3><p>${safe(board.intro||'')}</p></div><aside><strong>${safe(board.asOf||'SEPT. 27, 2026')}</strong><span>${safe(board.panel||'17-member AP media panel')}</span></aside></header><div class="ap-awards-summary"><div><strong>7</strong><span>individual awards</span></div><div><strong>11</strong><span>AP award seasons</span></div><div><strong>4×</strong><span>Wilson, most Player awards</span></div></div><div class="ap-dashboard-label"><strong>Meet the 2026 winners</strong><span data-ap-winner-status aria-live="polite">Showing all seven individual winners.</span></div><div class="ap-award-controls" role="group" aria-label="Filter 2026 AP award winners">${winnerFilters.map(([key,label],index)=>`<button type="button" data-ap-winner-filter="${key}" aria-pressed="${index===0?'true':'false'}">${label}</button>`).join('')}</div><div class="ap-winner-grid">${winners.map(apWinnerCard).join('')}</div><section class="ap-history-lab"><div class="ap-dashboard-label"><div><span>THE HISTORY LAB</span><strong>Who won before, and who owns the category?</strong></div><small>Tap an award to redraw the 2016–2026 timeline.</small></div><div class="ap-history-controls" role="tablist" aria-label="AP award history">${history.map((category,index)=>`<button type="button" role="tab" data-ap-history-tab="${safe(category.key)}" aria-selected="${index===0?'true':'false'}">${safe(category.shortLabel||category.label)}</button>`).join('')}</div>${history.map(apHistoryPanel).join('')}</section>${ballots.length?`<section class="ap-ballot-lab"><div class="ap-dashboard-label"><div><span>THE AP TEAMS</span><strong>First team, second team and the rookie class</strong></div><small>Official WNBA headshots only.</small></div><div class="ap-ballot-controls" role="tablist" aria-label="2026 AP team selections">${ballots.map((group,index)=>`<button type="button" role="tab" data-ap-ballot-tab="${safe(group.key)}" aria-selected="${index===0?'true':'false'}">${safe(group.label)}</button>`).join('')}</div>${ballots.map(apBallotPanel).join('')}</section>`:''}<aside class="ap-awards-method"><strong>Read the label</strong><p>${safe(board.methodology||'These are Associated Press media awards. They are separate from the WNBA postseason awards announced by the league.')}</p></aside></section>`;
  }
  function wireApAwardsDashboard(story){
    const board=story?.querySelector('[data-ap-awards-dashboard]');
    if(!board||board.dataset.ready==='1')return;
    board.dataset.ready='1';
    const winnerButtons=[...board.querySelectorAll('[data-ap-winner-filter]')],winnerCards=[...board.querySelectorAll('[data-ap-winner-group]')],winnerStatus=board.querySelector('[data-ap-winner-status]');
    winnerButtons.forEach(button=>button.addEventListener('click',()=>{
      const filter=button.dataset.apWinnerFilter;
      winnerButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      let visible=0;
      winnerCards.forEach(card=>{const show=filter==='all'||card.dataset.apWinnerGroup===filter;card.hidden=!show;if(show)visible+=1;});
      if(winnerStatus)winnerStatus.textContent=filter==='all'?'Showing all seven individual winners.':`Showing ${visible} ${button.textContent.toLowerCase()} winner${visible===1?'':'s'}.`;
    }));
    const historyTabs=[...board.querySelectorAll('[data-ap-history-tab]')],historyPanels=[...board.querySelectorAll('[data-ap-history-panel]')];
    historyTabs.forEach(tab=>tab.addEventListener('click',()=>{
      const key=tab.dataset.apHistoryTab;
      historyTabs.forEach(item=>item.setAttribute('aria-selected',String(item===tab)));
      historyPanels.forEach(panel=>{panel.hidden=panel.dataset.apHistoryPanel!==key;});
    }));
    const ballotTabs=[...board.querySelectorAll('[data-ap-ballot-tab]')],ballotPanels=[...board.querySelectorAll('[data-ap-ballot-panel]')];
    ballotTabs.forEach(tab=>tab.addEventListener('click',()=>{
      const key=tab.dataset.apBallotTab;
      ballotTabs.forEach(item=>item.setAttribute('aria-selected',String(item===tab)));
      ballotPanels.forEach(panel=>{panel.hidden=panel.dataset.apBallotPanel!==key;});
    }));
  }
  function sectionsMarkup(sections=[]){return sections.map(section=>`<section class="snack-section"><h3>${safe(section.title)}</h3>${(section.paragraphs||[]).map(paragraph=>`<p>${safe(paragraph)}</p>`).join('')}</section>`).join('');}
  function debatesMarkup(items=[]){return items.length?`<section class="snack-debate-board"><h3>Spicy debate board</h3><ul>${items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul></section>`:'';}
  function foodMarkup(food={}){return food.title||food.script?`<section class="food-segment"><span class="segment-label">FROM THE KITCHEN</span><h3>${safe(food.title||'This week’s segment')}</h3>${food.script?`<blockquote>${safe(food.script)}</blockquote>`:''}</section>`:'';}
  function sourcesMarkup(sources=[]){return sources.length?`<section class="source-list"><strong>Receipts</strong><p>${sources.map(source=>`<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.label||'Source')}</a>`).join(' · ')}</p></section>`:'';}
  function storyMarkup(post){return `<a class="snack-story-back" href="${pagePath}">← Back to all ${mode==='feature'?'Food for Thought articles':'Snack Shak Bytes'}</a><article class="snack-post"><header class="snack-post-header ${mode==='feature'?'feature-header':''}"><span class="snack-series-label">${safe(label(post))}</span><div class="meta"><span>${safe(format(post.published))}</span>${post.week?`<span>•</span><span>${safe(post.week)}</span>`:''}</div><h2>${safe(post.title)}</h2><p class="dek">${safe(post.dek||'')}</p></header>${storyImageMarkup(post)}${playoffGameOneMarkup(post.playoffGameOne)}${playoffGalleryMarkup(post.gameGallery)}${playoffBoardMarkup(post)}${playoffWatchMarkup(post.playoffWatch)}${playoffAwardFalloutMarkup(post.awardFallout)}${rankingsMarkup(post.rankings)}${tableMarkup(post.storyTable)}${trioDashboardMarkup(post.trioDashboard)}${apAwardsDashboardMarkup(post.apAwardsDashboard)}${sectionsMarkup(post.sections)}${debatesMarkup(post.debates)}${foodMarkup(post.foodSegment)}${sourcesMarkup(post.sources)}</article>`;}

  function setCollectionArchiveMode(activeSlug=''){
    const list=document.getElementById('snackCollectionGrid');
    list?.querySelectorAll('[data-story-slug]').forEach(card=>{card.hidden=Boolean(activeSlug)&&card.dataset.storySlug===activeSlug;});
    const section=document.querySelector('.snack-collection-section'),heading=section?.querySelector('.section-heading h2'),copy=section?.querySelector('.section-heading p:last-child'),kicker=section?.querySelector('.section-heading .kicker');
    if(!heading)return;
    if(activeSlug){
      if(kicker)kicker.textContent='ARCHIVE · NEWEST FIRST';
      heading.textContent=mode==='feature'?'More Food for Thought':'More Snack Shak Bytes';
      if(copy)copy.textContent='The story you opened stays on top. Newer archive entries follow first, with older reads below.';
    }else{
      if(kicker)kicker.textContent=mode==='feature'?'LONG READS':'QUICK READS';
      heading.textContent=mode==='feature'?'Deeper stories, one clean collection.':'Every Byte, one clean collection.';
      if(copy)copy.textContent=mode==='feature'?'Every long article is organized here, newest first.':'New stories appear here automatically, newest first.';
    }
  }
  function showStory(post,story,{scroll=true,updateUrl=false}={}){
    if(!post||!story)return false;
    story.hidden=false;
    story.innerHTML=storyMarkup(post);
    window.WKTWPlayoffBracket?.init(story);
    setCollectionArchiveMode(post.slug||'');
    if(post.slug==='the-playoff-watch-party-2026')updatePlayoffBoard();
    wirePlayoffWatch(story);
    wireTrioDashboard(story);
    wireApAwardsDashboard(story);
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
      else if(story){story.hidden=true;story.innerHTML='';setCollectionArchiveMode('');}
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
