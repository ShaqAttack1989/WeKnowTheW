(function(){
  const page=document.body.dataset.culturePage;
  const $=selector=>document.querySelector(selector);
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeHttps=value=>{const raw=String(value??'').trim();if(!raw)return'';try{const parsed=new URL(raw,location.origin);return parsed.protocol==='https:'||parsed.origin===location.origin?parsed.toString():''}catch{return''}};
  const teamFor=name=>COURTSIDE_TEAMS.find(team=>team.name===name)||{slug:'wnba',name,primary:'#5b2bbf',secondary:'#d7ff42',href:'/around-the-w.html'};
  const initials=name=>String(name).split(/\s+|&/).filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  const clipboardNames=new Set((window.COURT_TO_CLIPBOARD||COURT_TO_CLIPBOARD||[]).map(item=>item.name));
  const playerpediaHref=name=>`/playerpedia.html?view=retired&search=${encodeURIComponent(name)}#playerpedia-directory`;
  const posterBySlug={
    'atlanta-dream':'17989.png','chicago-sky':'17990.png','connecticut-sun':'17991.png','dallas-wings':'17992.png','golden-state-valkyries':'17993.png','indiana-fever':'17994.png','las-vegas-aces':'17995.png','los-angeles-sparks':'17998.png','minnesota-lynx':'17997.png','new-york-liberty':'17996.png','phoenix-mercury':'17999.png','portland-fire':'18000.png','seattle-storm':'18001.png','toronto-tempo':'18174.jpg','washington-mystics':'18172.jpg'
  };
  const officialCoachPhotos={};
  function photo(name,type,team,source){
    const colors=`--team:${team.primary};--team2:${team.secondary}`;
    return `<div class="culture-photo" style="${colors}" data-media-name="${escape(name)}" data-media-type="${type}" data-media-source="${escape(source||'')}" data-fallback="${escape(posterBySlug[team.slug]?`/assets/images/${posterBySlug[team.slug]}`:'')}"><div class="culture-initials">${initials(name)}</div></div>`;
  }
  function card({name,team:teamName,summary,source,label,role,path},type){
    const team=teamFor(teamName);
    const kicker=role||teamName||label||'Courtside Culture';
    const linkedPlayer=type==='coach'&&clipboardNames.has(name);
    const stats=type==='coach'&&typeof COURTSIDE_COACH_STATS!=='undefined'?COURTSIDE_COACH_STATS.find(item=>item.name===name&&item.team===teamName):null;
    const links=[source?'<a href="'+escape(source)+'" target="_blank" rel="noopener">Coaching source ↗</a>':'<a href="'+team.href+'">Team page →</a>'];
    if(linkedPlayer)links.push('<a class="culture-playerpedia-link" href="'+escape(playerpediaHref(name))+'">Playerpedia playing career →</a>');
    const mini=stats?'<div class="coach-mini-dashboard"><span><b>2026</b> '+stats.season2026.wins+'–'+stats.season2026.losses+'</span><span><b>🏆 '+stats.titles.length+'</b> titles · <b>'+stats.coyYears.length+'</b> COY</span><button type="button" data-coach-focus="'+escape(stats.name)+'">Open dashboard →</button></div>':'';
    return '<article class="culture-card" style="--team:'+team.primary+';--team2:'+team.secondary+'">'+photo(name,type,team,source)+'<div class="culture-card-body"><span class="culture-kicker">'+escape(kicker)+'</span><h3>'+escape(name)+'</h3><p>'+escape(summary||path||'')+'</p>'+mini+'<div class="culture-card-links">'+links.join('')+'</div></div></article>';
  }
  async function loadOne(el){
    const name=el.dataset.mediaName,type=el.dataset.mediaType,source=el.dataset.mediaSource;
    let payload=null,image='',credit='',creditUrl=source;
    if(type==='coach'&&officialCoachPhotos[name]){const official=officialCoachPhotos[name];image=official.image;credit=official.credit;creditUrl=official.sourceUrl;}
    if(!image&&source&&(type==='mascot'||type==='celebrity')){try{const response=await fetch(`/api/culture-image?url=${encodeURIComponent(source)}`);const preview=await response.json();if(preview?.found){image=preview.image;credit=type==='mascot'?'Official team image':'Courtside photo source';creditUrl=preview.sourceUrl;}}catch{}}
    if(!image){try{const response=await fetch(`/api/media?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`);payload=await response.json();}catch{}if(payload?.found){image=payload.item?.image||'';credit=payload.item?.creator||'';creditUrl=payload.item?.sourceUrl||source;}}
    if(!image&&source){try{const response=await fetch(`/api/culture-image?url=${encodeURIComponent(source)}`);const preview=await response.json();if(preview?.found){image=preview.image;credit='Official/source image';creditUrl=preview.sourceUrl;}}catch{}}
    if(!image&&el.dataset.fallback){image=el.dataset.fallback;credit='Team artwork';creditUrl=teamFor(el.closest('.culture-card')?.querySelector('.culture-kicker')?.textContent||'').href;}
    if(!image)return;
    const img=document.createElement('img');img.src=image;img.alt=`${name} — ${type}`;img.loading='lazy';img.decoding='async';if(!payload?.found&&!(type==='coach'&&officialCoachPhotos[name]))img.className='is-fallback';
    img.addEventListener('error',()=>img.remove(),{once:true});el.querySelector('.culture-initials')?.remove();el.prepend(img);
    if(creditUrl){const a=document.createElement('a');a.className='culture-photo-credit';a.href=creditUrl;a.target='_blank';a.rel='noopener';a.textContent=credit||'Photo source';el.appendChild(a);}
  }
  function hydrateMedia(){document.querySelectorAll('[data-media-name]').forEach(loadOne);}
  function renderCards(target,items,type){const node=$(target);if(!node)return;node.innerHTML=items.map(item=>card(item,type)).join('');hydrateMedia();}

  function renderCoachDashboard(){
    const dashboard=$('#coach-dashboard');
    if(!dashboard||typeof COURTSIDE_COACH_STATS==='undefined')return;
    const data=COURTSIDE_COACH_STATS.slice();
    const table=$('#coachDashboardTable');
    const search=$('#coachDashboardSearch');
    const sort=$('#coachDashboardSort');
    const select=$('#coachDashboardSelect');
    const spotlight=$('#coachDashboardSpotlight');
    const count=$('#coachDashboardCount');
    const kpis=$('#coachDashboardKpis');
    const formatRecord=record=>record.wins+'–'+record.losses;
    const percent=record=>{
      const games=record.wins+record.losses;
      return games?((record.wins/games)*100).toFixed(1)+'%':'—';
    };
    const titleTotal=data.reduce((sum,item)=>sum+item.titles.length,0);
    const awardTotal=data.reduce((sum,item)=>sum+item.coyYears.length,0);
    const playoffCoaches=data.filter(item=>item.seasonPlayoffs2026.wins+item.seasonPlayoffs2026.losses>0).length;
    kpis.innerHTML=
      '<div class="coach-kpi"><strong>'+data.length+'</strong><span>2026 season coaches tracked</span></div>'+
      '<div class="coach-kpi"><strong>'+titleTotal+'</strong><span>WNBA titles as head coach</span></div>'+
      '<div class="coach-kpi"><strong>'+awardTotal+'</strong><span>Coach of the Year awards</span></div>'+
      '<div class="coach-kpi"><strong>'+playoffCoaches+'</strong><span>2026 playoff coaches</span></div>';
    select.innerHTML=data.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(item=>'<option value="'+escape(item.name)+'">'+escape(item.name+' · '+item.team+(item.isCurrent?'':' · vacancy'))+'</option>').join('');
    function updateSpotlight(name){
      const item=data.find(coach=>coach.name===name)||data[0];
      const team=teamFor(item.team);
      const roster=COURTSIDE_COACHES.find(coach=>coach.name===item.name);
      const summary=roster?roster.summary:(item.isCurrent?'Current WNBA head coach.':'Los Angeles announced a head-coach vacancy on Sept. 25, 2026; this row preserves Roberts’ completed 2026 season.');
      const profile=safeHttps(item.profileSource||(roster&&roster.source));
      const titles=item.titles.length?item.titles.map(year=>'<span class="coach-year-chip">'+year+'</span>').join(''):'<span class="coach-no-awards">No WNBA title as a head coach yet</span>';
      const coty=item.coyYears.length?item.coyYears.map(year=>'<span class="coach-year-chip">'+year+'</span>').join(''):'<span class="coach-no-awards">No WNBA Coach of the Year award yet</span>';
      const recognition=(item.distinctions||[]).length?'<div class="coach-recognition"><strong>Other recognition</strong><span>'+item.distinctions.map(escape).join(' · ')+'</span></div>':'';
      const badge=item.isCurrent?'CURRENT HEAD COACH':'2026 SEASON COACH · ROLE VACANT';
      spotlight.innerHTML=
        '<article class="coach-spotlight-card" style="--team:'+team.primary+';--team2:'+team.secondary+'">'+
          '<div class="coach-spotlight-heading"><div><span class="coach-spotlight-kicker">'+escape(item.team)+' · '+badge+'</span><h3>'+escape(item.name)+'</h3><p>'+escape(summary)+'</p></div>'+
          '<div class="coach-spotlight-trophy"><span>WNBA championships</span><strong>'+item.titles.length+'</strong><small>as a head coach</small></div></div>'+
          '<div class="coach-spotlight-metrics">'+
            '<div><span>2026 regular season</span><strong>'+formatRecord(item.season2026)+'</strong><small>'+percent(item.season2026)+' wins</small></div>'+
            '<div><span>Career regular season</span><strong>'+formatRecord(item.careerRegular)+'</strong><small>'+percent(item.careerRegular)+' wins · through 2026</small></div>'+
            '<div><span>2026 playoffs</span><strong>'+formatRecord(item.seasonPlayoffs2026)+'</strong><small>'+(item.seasonPlayoffs2026.wins+item.seasonPlayoffs2026.losses?'through Oct. 9':'did not qualify')+'</small></div>'+
            '<div><span>Career playoffs</span><strong>'+formatRecord(item.careerPlayoffs)+'</strong><small>'+percent(item.careerPlayoffs)+' win rate · through Oct. 9</small></div>'+
            '<div><span>WNBA titles</span><strong>'+item.titles.length+'</strong><small>as a head coach</small></div>'+
            '<div><span>Coach of the Year</span><strong>'+item.coyYears.length+'</strong><small>honors as head coach</small></div>'+
          '</div>'+
          '<div class="coach-trophy-shelf"><div><strong>Championship seasons</strong><div class="coach-year-list">'+titles+'</div></div><div><strong>Coach of the Year</strong><div class="coach-year-list">'+coty+'</div></div></div>'+
          recognition+
          '<div class="coach-spotlight-links"><a href="'+team.href+'">Team hub →</a>'+
            '<a href="https://www.basketball-reference.com/wnba/years/2026_coaches.html" target="_blank" rel="noopener">Record table ↗</a>'+
            '<a href="https://www.wnba.com/history-coach-of-the-year" target="_blank" rel="noopener">WNBA awards ↗</a>'+
            (profile?'<a href="'+escape(profile)+'" target="_blank" rel="noopener">Coach bio / team source ↗</a>':'')+
          '</div></article>';
    }
    function renderRows(){
      const term=search.value.trim().toLowerCase();
      const key=sort.value;
      const value=item=>{
        if(key==='seasonWins')return item.season2026.wins;
        if(key==='playoffWins')return item.careerPlayoffs.wins;
        if(key==='titles')return item.titles.length;
        if(key==='coty')return item.coyYears.length;
        return item.careerRegular.wins;
      };
      const rows=data.filter(item=>(item.name+' '+item.team).toLowerCase().includes(term))
        .sort((a,b)=>value(b)-value(a)||a.name.localeCompare(b.name));
      table.innerHTML=rows.length?rows.map(item=>{
        const currentPlayoffGames=item.seasonPlayoffs2026.wins+item.seasonPlayoffs2026.losses;
        const titles=item.titles.length?item.titles.join(', '):'—';
        const coty=item.coyYears.length?item.coyYears.join(', '):'—';
        const status=item.isCurrent?'Head coach':'2026 coach · role vacant';
        return '<tr class="'+(select.value===item.name?'is-selected':'')+'">'+
          '<th scope="row"><button class="coach-table-name" type="button" data-coach-spotlight="'+escape(item.name)+'">'+escape(item.name)+'</button><span>'+escape(item.team)+'</span><small>'+status+'</small></th>'+
          '<td><strong>'+formatRecord(item.season2026)+'</strong><small>'+percent(item.season2026)+'</small></td>'+
          '<td><strong>'+formatRecord(item.seasonPlayoffs2026)+'</strong><small>'+(currentPlayoffGames?'through Oct. 9':'—')+'</small></td>'+
          '<td><strong>'+formatRecord(item.careerRegular)+'</strong><small>'+percent(item.careerRegular)+'</small></td>'+
          '<td><strong>'+formatRecord(item.careerPlayoffs)+'</strong><small>'+percent(item.careerPlayoffs)+'</small></td>'+
          '<td><strong class="coach-honor-number">'+item.titles.length+'</strong><small>'+titles+'</small></td>'+
          '<td><strong class="coach-honor-number">'+item.coyYears.length+'</strong><small>'+coty+'</small></td></tr>';
      }).join(''):'<tr><td class="coach-empty-row" colspan="7">No coach matches that search.</td></tr>';
      count.textContent='Showing '+rows.length+' of '+data.length+' coach records';
    }
    function chooseCoach(name){
      if(!data.some(item=>item.name===name))return;
      select.value=name;
      updateSpotlight(name);
      renderRows();
    }
    select.addEventListener('change',()=>chooseCoach(select.value));
    search.addEventListener('input',renderRows);
    sort.addEventListener('change',renderRows);
    table.addEventListener('click',event=>{
      const button=event.target.closest('[data-coach-spotlight]');
      if(button)chooseCoach(button.dataset.coachSpotlight);
    });
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-coach-focus]');
      if(!button)return;
      chooseCoach(button.dataset.coachFocus);
      dashboard.scrollIntoView({behavior:'smooth',block:'start'});
    });
    select.value='Cheryl Reeve';
    updateSpotlight(select.value);
    renderRows();
  }

  if(page==='mascots')renderCards('#cultureGrid',COURTSIDE_MASCOTS,'mascot');
  if(page==='coaches'){
    renderCoachDashboard();
    renderCards('#cultureGrid',COURTSIDE_COACHES,'coach');
    const clipboard=$('#clipboardGrid');if(clipboard){clipboard.innerHTML=COURT_TO_CLIPBOARD.map(item=>card({...item,team:item.role.split(' · ')[0],summary:item.path},'coach')).join('');hydrateMedia();}
  }
  if(page==='owners'){
    const node=$('#cultureGrid');node.innerHTML=COURTSIDE_OWNERS.map(item=>{const team=teamFor(item.team);return `<article class="culture-card text-only" style="--team:${team.primary};--team2:${team.secondary}"><div class="culture-card-body"><span class="culture-kicker">${escape(item.team)}</span><h3>${escape(item.name)}</h3><p>${escape(item.summary)}</p><a href="${team.href}">Franchise hub →</a></div></article>`}).join('');
    const executiveGrid=$('#executiveGrid');
    if(executiveGrid)executiveGrid.innerHTML=COURTSIDE_EXECUTIVES.map(item=>{const team=teamFor(item.team);const source=safeHttps(item.source);return `<article class="culture-card executive-card" style="--team:${team.primary};--team2:${team.secondary}"><div class="culture-card-body"><span class="culture-kicker">${escape(item.team)}</span><h3>${escape(item.name)}</h3><strong class="executive-role">${escape(item.role)}</strong><p>${escape(item.summary)}</p><div class="culture-card-links"><a href="${team.href}">Franchise hub →</a>${source?`<a href="${escape(source)}" target="_blank" rel="noopener">Official team source ↗</a>`:''}</div></div></article>`}).join('');
  }
  if(page==='fans')renderCards('#cultureGrid',COURTSIDE_FANS,'celebrity');
  if(page==='vibes'){
    const node=$('#cultureGrid');node.innerHTML=GAMEDAY_VIBES.map(item=>{const team=teamFor(item.team);return `<article class="vibe-card" style="--team:${team.primary}"><span>${escape(item.team)}</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><a href="${team.href}">Enter the team hub →</a></article>`}).join('');
  }

  function sourceCard(item){
    const team=teamFor(item.team||'');
    const href=safeHttps(item.href);
    const fallback=posterBySlug[team.slug]?'/assets/images/'+posterBySlug[team.slug]:'/assets/images/17996.png';
    const sourceImage=safeHttps(item.image);
    const image=sourceImage||fallback;
    const fallbackAlt=(team.name||'WNBA')+' team artwork';
    const imageAlt=escape(item.imageAlt||(sourceImage?item.title:fallbackAlt));
    const photoCreditHref=item.imageCreditHref?safeHttps(item.imageCreditHref):'';
    const photoCredit=photoCreditHref?'<a class="culture-photo-credit" href="'+escape(photoCreditHref)+'" target="_blank" rel="noopener">Photo: '+escape(item.imageCredit||'Source credit')+'</a>':'';
    const source=String(item.sourceType||'SOURCE').toUpperCase();
    const date=item.date?new Date(item.date):null;
    const dateText=date&&!Number.isNaN(date.getTime())?date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
    return '<article class="culture-card source-card" data-source-type="'+escape(source)+'" style="--team:'+team.primary+';--team2:'+team.secondary+'"><div class="culture-photo"><img src="'+escape(image)+'" alt="'+imageAlt+'" data-fallback="'+escape(fallback)+'" data-fallback-alt="'+escape(fallbackAlt)+'" loading="lazy" decoding="async"><span class="culture-source-badge">'+escape(source)+'</span>'+photoCredit+'</div><div class="culture-card-body"><span class="culture-kicker">'+escape(item.category||item.team||'Courtside Culture')+'</span><h3>'+escape(item.title)+'</h3><div class="source-meta">'+(item.team?'<span>'+escape(item.team)+'</span>':'')+(dateText?'<time>'+escape(dateText)+'</time>':'')+'</div><p>'+escape(item.summary||'')+'</p><a href="'+escape(href)+'" target="_blank" rel="noopener">Open original source ↗</a></div></article>';
  }
  function buildSourceFilters(filterTarget,grid,items){
    const filterNode=$(filterTarget);if(!filterNode)return;const sources=['ALL',...new Set(items.map(item=>String(item.sourceType||'SOURCE').toUpperCase()))];filterNode.innerHTML=sources.map((source,index)=>`<button type="button" class="culture-filter${index===0?' active':''}" data-source-filter="${escape(source)}">${escape(source)}</button>`).join('');filterNode.addEventListener('click',event=>{const button=event.target.closest('[data-source-filter]');if(!button)return;filterNode.querySelectorAll('.culture-filter').forEach(node=>node.classList.toggle('active',node===button));const wanted=button.dataset.sourceFilter;grid.querySelectorAll('.source-card').forEach(card=>{card.hidden=wanted!=='ALL'&&card.dataset.sourceType!==wanted;});});
  }
  async function renderPeopleFeed(kind,target,filterTarget,updatedTarget){
    const node=$(target);if(!node)return;try{const response=await fetch(`/api/culture-people-feed?type=${encodeURIComponent(kind)}&v=20261011-full-card-audit-v7`,{headers:{Accept:'application/json'}});const payload=await response.json();if(!response.ok||!payload.items?.length)throw new Error(payload.error||'No source items returned');node.innerHTML=payload.items.map(sourceCard).join('');node.querySelectorAll('.source-card .culture-photo img').forEach(image=>image.addEventListener('error',()=>{const fallback=image.dataset.fallback||'';if(fallback&&image.getAttribute('src')!==fallback){image.src=fallback;image.alt=image.dataset.fallbackAlt||'Team artwork';image.closest('.culture-photo')?.querySelector('.culture-photo-credit')?.remove();image.dataset.fallback='';}else image.remove();},{once:true}));buildSourceFilters(filterTarget,node,payload.items);const updated=$(updatedTarget);if(updated)updated.textContent=`Source desk refreshed ${new Date(payload.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;}catch(error){node.innerHTML=`<div class="culture-loading">The ${kind==='fan'?'fan culture':'celebrity culture'} source desk is refreshing. The core cards above remain available.</div>`;}}
  if(page==='fans')renderPeopleFeed('celebrity','#celebrityFeed','#celebrityFilters','#celebrityUpdated');
  if(page==='vibes')renderPeopleFeed('fan','#fanCultureFeed','#fanFilters','#fanUpdated');

  async function renderFits(){
    const node=$('#cultureGrid');if(!node)return;try{const response=await fetch('/api/culture-feed');const payload=await response.json();if(!payload.items?.length)throw new Error();node.innerHTML=payload.items.map(item=>{const href=safeHttps(item.href);const image=safeHttps(item.image)||'/assets/images/17996.png';return `<article class="culture-card fit-card"><div class="culture-photo"><img src="${escape(image)}" alt="${escape(item.title)}" loading="lazy"></div><div class="culture-card-body"><span class="culture-kicker">WNBA FASHION</span><h3>${escape(item.title)}</h3>${item.date?`<time>${escape(new Date(item.date).toString()==='Invalid Date'?item.date:new Date(item.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))}</time>`:''}<a href="${escape(href)}" target="_blank" rel="noopener">View source ↗</a></div></article>`}).join('');$('#fitsUpdated').textContent=`Feed refreshed ${new Date(payload.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;}catch{node.innerHTML='<div class="culture-loading">The WNBA fashion feed is refreshing. Use the official source link below in the meantime.</div>';}}
  if(page==='fits')renderFits();
})();
