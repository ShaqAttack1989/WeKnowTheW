(()=>{
  if(!document.querySelector('script[data-snack-shak-nav]')){
    const s=document.createElement('script');
    s.src='/snack-shak-nav.js?v=20260917-home-poster-v3';
    s.dataset.snackShakNav='true';
    s.defer=true;
    document.head.appendChild(s);
  }

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const short=(value='',limit=180)=>{const text=String(value||'').replace(/\s+/g,' ').trim();return text.length<=limit?text:`${text.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const fmtDate=value=>{const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?String(value||''):date.toLocaleDateString([],{month:'short',day:'numeric'});};
  const dateKey=post=>String(post?.updated||post?.published||'');
  const dateLabel=post=>`${post?.updated&&String(post.updated)>String(post.published||'')?'UPDATED ':' '}${fmtDate(dateKey(post))}`.trim();
  const BYTE_FALLBACK='/assets/images/snack-shak/power-rankings-vs-standings-aug30.webp';
  const FOOD_FALLBACK='/assets/images/17995.png';

  let posts=[];
  let loadedAt=0;
  let loadPromise=null;
  let observer=null;

  function sortPosts(items=[]){return [...items].sort((a,b)=>dateKey(b).localeCompare(dateKey(a))||Number(b.priority||0)-Number(a.priority||0));}
  async function fetchPosts(url){const response=await fetch(`${url}?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});if(!response.ok)return [];const payload=await response.json().catch(()=>({}));return Array.isArray(payload.posts)?payload.posts:[];}
  async function loadSpecials(force=false){
    if(!force&&posts.length&&Date.now()-loadedAt<300000)return posts;
    if(loadPromise&&!force)return loadPromise;
    const feeds=['/snack-shak-love-and-basketball.json','/snack-shak-all-time.json','/snack-shaq-posts.json','/snack-shak-specials.json','/snack-shak-breaking.json','/snack-shak-latest.json','/snack-shak-final.json'];
    loadPromise=Promise.allSettled(feeds.map(fetchPosts)).then(results=>{
      const bySlug=new Map();
      results.forEach(result=>{if(result.status==='fulfilled')result.value.forEach(post=>{if(post?.slug)bySlug.set(post.slug,post);});});
      posts=sortPosts([...bySlug.values()]);
      loadedAt=Date.now();
      return posts;
    }).catch(()=>posts).finally(()=>{loadPromise=null;});
    return loadPromise;
  }

  function featureHref(post){
    if(post?.dashboardUrl)return post.dashboardUrl;
    const slug=encodeURIComponent(post?.slug||'');
    return post?.type==='feature'?`/food-for-thought.html?post=${slug}#story`:`/snack-shak-bytes.html?post=${slug}#story`;
  }

  function isByte(post={}){return post.type==='byte'||norm(post.seriesLabel).includes('snack shak byte')||norm(post.seriesLabel).includes('byte');}
  function isFood(post={}){const label=norm(`${post.type||''} ${post.seriesLabel||''}`);return post.type==='feature'&&(label.includes('food for thought')||!label.includes('milestone'));}
  function isFibaPost(post={}){
    if(post.homepageSeason==='wnba-return')return false;
    const hay=norm(`${post.slug||''} ${post.title||''} ${post.seriesLabel||''} ${post.dek||''} ${(post.teams||[]).join(' ')}`);
    return hay.includes('fiba')||hay.includes('world cup')||hay.includes('berlin 2026')||hay.includes('usa france');
  }

  function sunsetFibaSpotlight(){
    const spotlight=document.querySelector('.home-season-spotlight');
    if(spotlight){
      spotlight.dataset.season='wnba-return';
      spotlight.setAttribute('aria-label','WNBA return night and final week spotlight');
    }
    const heroButton=document.querySelector('.hub-hero .hero-actions .button.ghost[href="#now-playing"]');
    if(heroButton)heroButton.textContent='Return Night +131';
  }

  function spotlightUsed(){
    const used=new Set();
    document.querySelectorAll('.home-season-spotlight a[href]').forEach(link=>{const href=link.getAttribute('href');if(href)used.add(href);});
    return used;
  }

  function chooseUniqueEditorials(){
    const used=spotlightUsed();
    const food=posts.find(post=>isFood(post))||null;
    if(food)used.add(featureHref(food));
    const byte=posts.find(post=>isByte(post)&&!used.has(featureHref(post)))||posts.find(post=>isByte(post))||null;
    return {food,byte};
  }

  function imageFor(post,kind){
    return post?.image||post?.storyImage||post?.imageUrl||post?.photo||post?.thumbnail||(kind==='food'?FOOD_FALLBACK:BYTE_FALLBACK);
  }

  function editorialMarkup(post,kind){
    const food=kind==='food';
    const image=imageFor(post,kind);
    return `<figure class="week-editorial-media"><img src="${safe(image)}" alt="${safe(post?.imageAlt||post?.title||'Story image')}" loading="eager" decoding="async"><span class="week-media-tag">${food?'FEATURED READ':'QUICK HIT'}</span></figure><div class="week-editorial-body"><div class="week-editorial-top"><span class="week-card-kicker">${food?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'}</span><span class="week-card-date">${safe(dateLabel(post))}</span></div><span class="week-story-series">${safe(post?.seriesLabel||(food?'FOOD FOR THOUGHT':'SNACK SHAK BYTE'))}</span><h3>${safe(post?.title||'Latest story')}</h3><p>${safe(short(post?.dek||'',205))}</p><a href="${safe(featureHref(post))}">${food?'Read the full thought':'Grab the Byte'} →</a></div>`;
  }

  function enforceUniqueEditorials(){
    if(!posts.length)return;
    const {food,byte}=chooseUniqueEditorials();
    const foodHost=document.getElementById('weekHubFood');
    const byteHost=document.getElementById('weekHubByte');
    if(foodHost&&food){
      foodHost.className='week-editorial-card food';
      const href=featureHref(food);
      foodHost.dataset.href=href;
      foodHost.setAttribute('role','link');
      foodHost.tabIndex=0;
      if(!foodHost.querySelector(`a[href="${href}"]`))foodHost.innerHTML=editorialMarkup(food,'food');
    }
    if(byteHost&&byte){
      byteHost.className='week-editorial-card byte';
      const href=featureHref(byte);
      byteHost.dataset.href=href;
      byteHost.setAttribute('role','link');
      byteHost.tabIndex=0;
      if(!byteHost.querySelector(`a[href="${href}"]`))byteHost.innerHTML=editorialMarkup(byte,'byte');
    }
  }

  function watchEditorial(){
    if(observer)return;
    const grid=document.querySelector('.week-editorial-grid');
    if(!grid)return;
    observer=new MutationObserver(()=>requestAnimationFrame(enforceUniqueEditorials));
    observer.observe(grid,{childList:true,subtree:true});
  }

  function wireEditorialTileNavigation(){
    const grid=document.querySelector('.week-editorial-grid');
    if(!grid||grid.dataset.specialTileNav==='1')return;
    grid.dataset.specialTileNav='1';
    const openTile=event=>{
      if(event.target.closest('a,button,input,select,textarea,label,summary'))return;
      const tile=event.target.closest('.week-editorial-card[data-href]');
      if(!tile||!grid.contains(tile))return;
      if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;
      if(event.type==='keydown')event.preventDefault();
      const destination=tile.dataset.href;
      if(destination)window.location.assign(destination);
    };
    grid.addEventListener('click',openTile);
    grid.addEventListener('keydown',openTile);
  }

  function latestStoryMarkup(items=[]){
    return `<div class="week-story-list">${items.map((post,index)=>`<div class="week-story-item ${index===0?'lead':''}"><span class="week-feature-meta">${safe(post.seriesLabel||'SNACK SHAK')} · ${safe(dateLabel(post))}</span><strong class="week-story-title">${safe(post.title)}</strong>${index===0&&post.dek?`<p>${safe(short(post.dek,155))}</p>`:''}<a href="${safe(featureHref(post))}">${index===0?'Read the newest story':'Read story'} →</a></div>`).join('')}</div><a class="week-story-all" href="/snack-shak.html">See all Snack Shak stories →</a>`;
  }

  function renderLegacyWeeklySpecials(){
    const snackHost=document.getElementById('homeWeekSnackLive');
    const milestoneHost=document.getElementById('homeWeekMilestoneLive');
    if(!snackHost&&!milestoneHost)return;
    const milestone=posts.find(post=>norm(post.seriesLabel).includes('milestone')&&!isFibaPost(post));
    const used=spotlightUsed();
    const latestStories=posts.filter(post=>post.slug!==milestone?.slug&&!norm(post.seriesLabel).includes('milestone')&&!isFibaPost(post)&&!used.has(featureHref(post))).slice(0,3);
    if(snackHost&&latestStories.length)snackHost.innerHTML=latestStoryMarkup(latestStories);
    if(milestoneHost&&milestone)milestoneHost.innerHTML=`<span class="week-feature-meta">${safe(milestone.seriesLabel||'MILESTONE MOMENT')} · ${safe(dateLabel(milestone))}</span><strong class="week-feature-title">${safe(milestone.title)}</strong><p>${safe(short(milestone.dek,205))}</p><a href="${safe(featureHref(milestone))}">Check the receipt →</a>`;
  }

  function searchableText(post={}){const sections=(post.sections||[]).flatMap(section=>[section.title,...(section.paragraphs||[])]).join(' ');return norm(`${post.title||''} ${post.seriesLabel||''} ${post.dek||''} ${post.week||''} ${(post.players||[]).join(' ')} ${(post.teams||[]).join(' ')} ${sections}`);}
  function appendSearchMatches(query){
    const host=document.getElementById('homeSearchResults');
    const q=norm(query),terms=q.split(/\s+/).filter(Boolean);
    if(!host||q.length<2)return;
    const existing=new Set([...host.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
    const articleMatches=posts.filter(post=>{const hay=searchableText(post);return terms.every(term=>hay.includes(term));}).slice(0,6);
    if(!articleMatches.length)return;
    host.classList.add('open');
    articleMatches.reverse().forEach(post=>{
      const href=featureHref(post);
      if(existing.has(href))return;
      const link=document.createElement('a');
      link.className='home-search-result home-search-special';
      link.href=href;
      link.innerHTML=`<span>${safe(post.seriesLabel||'Article')}</span><div><strong>${safe(post.title)}</strong><small>${safe(short(post.dek||'Open article',130))}</small></div><b>→</b>`;
      host.prepend(link);
      existing.add(href);
    });
  }

  function wireSearch(){
    const input=document.getElementById('homeSiteSearch');
    if(!input)return;
    let timer=null;
    const sync=()=>{clearTimeout(timer);timer=setTimeout(()=>loadSpecials().then(()=>appendSearchMatches(input.value)),120);};
    input.addEventListener('input',sync);
    input.addEventListener('focus',sync);
    document.querySelectorAll('[data-home-search-chip]').forEach(button=>button.addEventListener('click',()=>setTimeout(sync,30)));
  }

  async function refresh(force=false){
    sunsetFibaSpotlight();
    await loadSpecials(force);
    // homepage-week-live.js owns the editorial cards and their navigation.
    renderLegacyWeeklySpecials();
    const input=document.getElementById('homeSiteSearch');
    if(input?.value)appendSearchMatches(input.value);
  }

  sunsetFibaSpotlight();
  wireSearch();
  refresh();
  setInterval(()=>{if(!document.hidden)refresh(true);},60000);
  window.addEventListener('focus',()=>refresh(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
})();
