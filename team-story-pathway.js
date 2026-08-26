(()=>{
  const host=document.getElementById('dreamTeamUpdates');
  const roster=document.getElementById('teamRoster');
  if(!host||!roster)return;

  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  const teamData=typeof teamBySlug==='function'?teamBySlug(slug):null;
  if(!teamData||slug==='cleveland-sirens')return;

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase().replace(/[^a-z0-9']+/g,' ').replace(/\s+/g,' ').trim();
  const fmtDate=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  const short=(value='',limit=190)=>{const text=String(value||'').replace(/\s+/g,' ').trim();if(text.length<=limit)return text;const cut=text.slice(0,limit);return `${cut.slice(0,Math.max(cut.lastIndexOf(' '),limit-24)).trim()}…`;};
  const idle=(fn,timeout=1600)=>window.requestIdleCallback?requestIdleCallback(fn,{timeout}):setTimeout(fn,Math.min(timeout,700));

  let stories=[];
  let ready=false;
  let appendTimer=null;

  function rosterPeople(){
    const map=new Map();
    roster.querySelectorAll('.team-roster-card').forEach(card=>{
      const name=card.querySelector('strong')?.textContent?.trim();
      if(!name)return;
      map.set(name,{name,photo:card.querySelector('img')?.getAttribute('src')||''});
    });
    return map;
  }

  function rosterNames(){return [...rosterPeople().keys()];}

  function collectStrings(value,out=[]){
    if(value===null||value===undefined)return out;
    if(typeof value==='string'){out.push(value);return out;}
    if(Array.isArray(value)){value.forEach(item=>collectStrings(item,out));return out;}
    if(typeof value==='object')Object.entries(value).forEach(([key,item])=>{if(key!=='sources'&&key!=='url')collectStrings(item,out);});
    return out;
  }

  function mentions(post,names=[]){
    const hay=` ${norm(collectStrings(post).join(' '))} `;
    return names.filter(name=>{
      const needle=norm(name);
      return needle.length>3&&hay.includes(` ${needle} `);
    });
  }

  function playerChip(name,people){
    const person=people.get(name)||{name,photo:''};
    return `<a href="/playerpedia.html?search=${encodeURIComponent(name)}">${person.photo?`<img src="${safe(person.photo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:'<span class="team-editorial-dot" aria-hidden="true">●</span>'}<span>${safe(name)}</span></a>`;
  }

  function postCard(post,players=[],people=new Map()){
    const label=post.seriesLabel||(/byte/i.test(post.type||'')?'SNACK SHAK BYTE':'SEASONED NOTES');
    const href=`/snack-shak.html?post=${encodeURIComponent(post.slug)}#latest`;
    return `<article class="team-editorial-update" data-team-editorial-story="${safe(post.slug)}"><div class="team-editorial-top"><span>WE KNOW THE W · ${safe(label)}</span><time>${safe(fmtDate(post.published))}</time></div><strong><a href="${safe(href)}">${safe(post.title||'Read the story')}</a></strong><p>${safe(short(post.dek||'',205))}</p><div class="team-editorial-players">${players.map(name=>playerChip(name,people)).join('')}</div><a class="team-editorial-read" href="${safe(href)}">Read the full story →</a></article>`;
  }

  function updateEmptyState(){
    const clear=host.querySelector('.dream-wire-clear');
    if(!clear||!host.querySelector('[data-team-editorial-story]'))return;
    const strong=clear.querySelector('strong');
    const copy=clear.querySelector('p');
    if(strong)strong.textContent=`No active ${teamData.name} roster or availability alerts.`;
    if(copy)copy.textContent='Player mentions from We Know the W are shown above. Roster and availability alerts will appear here when posted.';
  }

  function appendStories(){
    if(!ready||!stories.length||!host.isConnected)return;
    const people=rosterPeople();
    const existing=new Set([...host.querySelectorAll('[data-team-editorial-story]')].map(node=>node.dataset.teamEditorialStory));
    const markup=stories.filter(item=>!existing.has(item.post.slug)).map(item=>postCard(item.post,item.players,people)).join('');
    if(markup)host.insertAdjacentHTML('afterbegin',markup);
    host.classList.toggle('has-editorial-stories',Boolean(host.querySelector('[data-team-editorial-story]')));
    updateEmptyState();
  }

  function scheduleAppend(){clearTimeout(appendTimer);appendTimer=setTimeout(appendStories,90);}

  async function loadStories(){
    const names=rosterNames();
    if(!names.length)return;
    try{
      const stamp=Date.now();
      const [weeklyResult,specialResult]=await Promise.allSettled([
        fetch(`/snack-shaq-posts.json?teamMentions=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch(`/snack-shak-specials.json?teamMentions=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{})
      ]);
      const weekly=weeklyResult.status==='fulfilled'&&Array.isArray(weeklyResult.value.posts)?weeklyResult.value.posts:[];
      const specials=specialResult.status==='fulfilled'&&Array.isArray(specialResult.value.posts)?specialResult.value.posts:[];
      const combined=[...specials,...weekly].filter(post=>post&&post.slug&&post.published);
      stories=combined.map(post=>({post,players:mentions(post,names)})).filter(item=>item.players.length).sort((a,b)=>String(b.post.published).localeCompare(String(a.post.published))||Number(b.post.priority||0)-Number(a.post.priority||0)).slice(0,4);
      ready=true;
      appendStories();
    }catch{ready=true;}
  }

  const rosterObserver=new MutationObserver(()=>{
    if(rosterNames().length){rosterObserver.disconnect();idle(loadStories,1200);}
  });
  rosterObserver.observe(roster,{childList:true,subtree:true});
  if(rosterNames().length){rosterObserver.disconnect();idle(loadStories,1200);}

  const hostObserver=new MutationObserver(()=>{if(ready&&stories.length&&!host.querySelector('[data-team-editorial-story]'))scheduleAppend();else if(ready&&stories.length)updateEmptyState();});
  hostObserver.observe(host,{childList:true});
})();
