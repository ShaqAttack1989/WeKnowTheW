(()=>{
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const short=(value='',limit=180)=>{const text=String(value||'').replace(/\s+/g,' ').trim();return text.length<=limit?text:`${text.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const fmtDate=value=>{const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?String(value||''):date.toLocaleDateString([],{month:'short',day:'numeric'});};
  const retiredIndex=[
    ['Sue Bird','Seattle Storm'],['Diana Taurasi','Phoenix Mercury'],['Candace Parker','Los Angeles Sparks Chicago Sky Las Vegas Aces'],['Tamika Catchings','Indiana Fever'],['Maya Moore','Minnesota Lynx'],['Sylvia Fowles','Chicago Sky Minnesota Lynx Portland Fire Court to Clipboard'],['Seimone Augustus','Minnesota Lynx Los Angeles Sparks'],['Lindsay Whalen','Connecticut Sun Minnesota Lynx'],['Becky Hammon','New York Liberty San Antonio Stars Las Vegas Aces head coach Court to Clipboard'],['Stephanie White','Charlotte Sting Indiana Fever head coach Court to Clipboard'],['Sandy Brondello','Detroit Shock Miami Sol Seattle Storm Toronto Tempo head coach Court to Clipboard'],['Natalie Achonwa','Indiana Fever Minnesota Lynx Seattle Storm assistant coach Court to Clipboard'],['Courtney Paris','Sacramento Monarchs Atlanta Dream Tulsa Shock Dallas Wings Seattle Storm New York Liberty assistant coach Court to Clipboard'],['Ebony Hoffman','Indiana Fever Los Angeles Sparks Connecticut Sun assistant coach Court to Clipboard'],['Sugar Rodgers','Minnesota Lynx New York Liberty Las Vegas Aces Golden State Valkyries assistant coach Court to Clipboard'],['Lisa Leslie','Los Angeles Sparks'],['Sheryl Swoopes','Houston Comets Seattle Storm Tulsa Shock'],['Cynthia Cooper','Houston Comets'],['Tina Thompson','Houston Comets Los Angeles Sparks Seattle Storm'],['Ticha Penicheiro','Sacramento Monarchs Los Angeles Sparks Chicago Sky'],['Yolanda Griffith','Sacramento Monarchs Seattle Storm Indiana Fever'],['Katie Smith','Minnesota Lynx Detroit Shock Washington Mystics Seattle Storm New York Liberty'],['Elena Delle Donne','Chicago Sky Washington Mystics'],['Tina Charles','Connecticut Sun New York Liberty Washington Mystics Phoenix Mercury Seattle Storm Atlanta Dream'],['Lauren Jackson','Seattle Storm'],['Cappie Pondexter','Phoenix Mercury New York Liberty Chicago Sky Los Angeles Sparks Indiana Fever']
  ].map(([title,keywords])=>({title,keywords,type:'PLAYERPEDIA · LEGENDS LOUNGE',href:`/playerpedia.html?view=retired&search=${encodeURIComponent(title)}#playerpedia-directory`}));
  let posts=[];
  let loadedAt=0;
  let loadPromise=null;

  function sortPosts(items=[]){return [...items].sort((a,b)=>String(b.published||'').localeCompare(String(a.published||''))||Number(b.priority||0)-Number(a.priority||0));}
  async function fetchPosts(url){
    const response=await fetch(`${url}?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)return [];
    const payload=await response.json().catch(()=>({}));
    return Array.isArray(payload.posts)?payload.posts:[];
  }
  async function loadSpecials(force=false){
    if(!force&&posts.length&&Date.now()-loadedAt<300000)return posts;
    if(loadPromise&&!force)return loadPromise;
    loadPromise=Promise.allSettled([fetchPosts('/snack-shak-breaking.json'),fetchPosts('/snack-shak-specials.json')])
      .then(results=>{
        const breaking=results[0].status==='fulfilled'?results[0].value:[];
        const specials=results[1].status==='fulfilled'?results[1].value:[];
        const bySlug=new Map();[...specials,...breaking].forEach(post=>{if(post?.slug)bySlug.set(post.slug,post);});
        posts=sortPosts([...bySlug.values()]);loadedAt=Date.now();return posts;
      })
      .catch(()=>posts)
      .finally(()=>{loadPromise=null;});
    return loadPromise;
  }
  function featureHref(post){return `/snack-shak.html?post=${encodeURIComponent(post.slug)}#latest`;}
  function renderWeeklySpecials(){
    if(!posts.length)return;
    const snackHost=document.getElementById('homeWeekSnackLive');
    const milestoneHost=document.getElementById('homeWeekMilestoneLive');
    const latest=posts[0];
    const milestone=posts.find(post=>norm(post.seriesLabel).includes('milestone'));
    if(snackHost&&latest)snackHost.innerHTML=`<span class="week-feature-meta">${safe(latest.seriesLabel||'SPECIAL FEATURE')} · ${safe(fmtDate(latest.published))}</span><strong class="week-feature-title">${safe(latest.title)}</strong><p>${safe(short(latest.dek,185))}</p><a href="${safe(featureHref(latest))}">Read the full feature →</a>`;
    if(milestoneHost&&milestone)milestoneHost.innerHTML=`<span class="week-feature-meta">${safe(milestone.seriesLabel||'MILESTONE MOMENT')} · ${safe(fmtDate(milestone.published))}</span><strong class="week-feature-title">${safe(milestone.title)}</strong><p>${safe(short(milestone.dek,205))}</p><a href="${safe(featureHref(milestone))}">Check the receipt →</a>`;
  }
  function searchableText(post={}){const sections=(post.sections||[]).flatMap(section=>[section.title,...(section.paragraphs||[])]).join(' ');return norm(`${post.title||''} ${post.seriesLabel||''} ${post.dek||''} ${post.week||''} ${(post.players||[]).join(' ')} ${(post.teams||[]).join(' ')} ${sections}`);}
  function appendSearchMatches(query){
    const host=document.getElementById('homeSearchResults');
    const q=norm(query),terms=q.split(/\s+/).filter(Boolean);
    if(!host||q.length<2)return;
    const existing=new Set([...host.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
    const retiredMatches=retiredIndex.filter(item=>{const hay=norm(`${item.title} ${item.keywords}`);return terms.every(term=>hay.includes(term));}).slice(0,4);
    const articleMatches=posts.filter(post=>{const hay=searchableText(post);return terms.every(term=>hay.includes(term));}).slice(0,4).map(post=>({title:post.title,type:post.seriesLabel||'Article',href:featureHref(post),keywords:short(post.dek,130)}));
    const matches=[...retiredMatches,...articleMatches];if(!matches.length)return;
    host.classList.add('open');
    matches.reverse().forEach(item=>{if(existing.has(item.href))return;const link=document.createElement('a');link.className='home-search-result home-search-special';link.href=item.href;link.innerHTML=`<span>${safe(item.type)}</span><div><strong>${safe(item.title)}</strong><small>${safe(item.keywords||'Open Playerpedia profile')}</small></div><b>→</b>`;host.prepend(link);existing.add(item.href);});
  }
  function wireSearch(){
    const input=document.getElementById('homeSiteSearch');if(!input)return;let timer=null;const sync=()=>{clearTimeout(timer);timer=setTimeout(()=>loadSpecials().then(()=>appendSearchMatches(input.value)),120);};input.addEventListener('input',sync);input.addEventListener('focus',sync);document.querySelectorAll('[data-home-search-chip]').forEach(button=>button.addEventListener('click',()=>setTimeout(sync,30)));
  }
  async function refresh(force=false){await loadSpecials(force);renderWeeklySpecials();const input=document.getElementById('homeSiteSearch');if(input?.value)appendSearchMatches(input.value);}

  wireSearch();refresh();setInterval(()=>{if(!document.hidden)refresh(true);},60000);window.addEventListener('focus',()=>refresh(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
})();
