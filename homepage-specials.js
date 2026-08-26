(()=>{
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const short=(value='',limit=180)=>{const text=String(value||'').replace(/\s+/g,' ').trim();return text.length<=limit?text:`${text.slice(0,limit).replace(/\s+\S*$/,'').trim()}…`;};
  const fmtDate=value=>{const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?String(value||''):date.toLocaleDateString([],{month:'short',day:'numeric'});};
  let posts=[];
  let loadedAt=0;
  let loadPromise=null;

  function sortPosts(items=[]){return [...items].sort((a,b)=>String(b.published||'').localeCompare(String(a.published||''))||Number(b.priority||0)-Number(a.priority||0));}
  async function loadSpecials(force=false){
    if(!force&&posts.length&&Date.now()-loadedAt<300000)return posts;
    if(loadPromise&&!force)return loadPromise;
    loadPromise=fetch(`/snack-shak-specials.json?cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'})
      .then(async response=>{if(!response.ok)throw new Error('Special features unavailable');const payload=await response.json();posts=sortPosts(Array.isArray(payload.posts)?payload.posts:[]);loadedAt=Date.now();return posts;})
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
    if(snackHost&&latest){
      snackHost.innerHTML=`<span class="week-snack-date">${safe(latest.seriesLabel||'SPECIAL FEATURE')} · ${safe(fmtDate(latest.published))}</span><strong class="week-snack-title">${safe(latest.title)}</strong><p>${safe(short(latest.dek,185))}</p><a href="${safe(featureHref(latest))}">Read the full feature →</a>`;
    }
    if(milestoneHost&&milestone){
      milestoneHost.innerHTML=`<h3>Milestone watch</h3><strong class="week-snack-title">${safe(milestone.title)}</strong><p>${safe(short(milestone.dek,210))}</p><a href="${safe(featureHref(milestone))}">Check the receipt →</a>`;
    }
  }
  function searchableText(post={}){
    const sections=(post.sections||[]).flatMap(section=>[section.title,...(section.paragraphs||[])]).join(' ');
    return norm(`${post.title||''} ${post.seriesLabel||''} ${post.dek||''} ${post.week||''} ${sections}`);
  }
  function appendSearchMatches(query){
    const host=document.getElementById('homeSearchResults');
    const q=norm(query),terms=q.split(/\s+/).filter(Boolean);
    if(!host||q.length<2||!posts.length)return;
    const matches=posts.filter(post=>{const hay=searchableText(post);return terms.every(term=>hay.includes(term));}).slice(0,4);
    if(!matches.length)return;
    host.classList.add('open');
    const existing=new Set([...host.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
    matches.reverse().forEach(post=>{
      const href=featureHref(post);if(existing.has(href))return;
      const link=document.createElement('a');
      link.className='home-search-result home-search-special';
      link.href=href;
      link.innerHTML=`<span>${safe(post.seriesLabel||'Article')}</span><div><strong>${safe(post.title)}</strong><small>${safe(short(post.dek,130))}</small></div><b>→</b>`;
      host.prepend(link);existing.add(href);
    });
  }
  function wireSearch(){
    const input=document.getElementById('homeSiteSearch');if(!input)return;
    let timer=null;
    const sync=()=>{clearTimeout(timer);timer=setTimeout(()=>loadSpecials().then(()=>appendSearchMatches(input.value)),120);};
    input.addEventListener('input',sync);
    input.addEventListener('focus',sync);
    document.querySelectorAll('[data-home-search-chip]').forEach(button=>button.addEventListener('click',()=>setTimeout(sync,30)));
  }
  async function refresh(force=false){await loadSpecials(force);renderWeeklySpecials();const input=document.getElementById('homeSiteSearch');if(input?.value)appendSearchMatches(input.value);}

  wireSearch();
  refresh();
  setInterval(()=>{if(!document.hidden)refresh(true);},60000);
  window.addEventListener('focus',()=>refresh(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
})();
