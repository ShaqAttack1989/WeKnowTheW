(()=>{
  const host=document.getElementById('dreamTeamUpdates');
  const roster=document.getElementById('teamRoster');
  if(!host||!roster)return;

  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  const teamData=typeof teamBySlug==='function'?teamBySlug(slug):null;
  if(!teamData||slug==='cleveland-sirens')return;

  const wireLabel=document.querySelector('.dream-roster-wire .dream-panel-heading span');
  if(wireLabel)wireLabel.textContent='ROSTER · AVAILABILITY · STORIES';

  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase().replace(/[^a-z0-9']+/g,' ').replace(/\s+/g,' ').trim();
  const fmtDate=value=>{const d=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});};
  const short=(value='',limit=190)=>{const text=String(value||'').replace(/\s+/g,' ').trim();if(text.length<=limit)return text;const cut=text.slice(0,limit);return `${cut.slice(0,Math.max(cut.lastIndexOf(' '),limit-24)).trim()}…`;};
  const idle=(fn,timeout=1600)=>window.requestIdleCallback?requestIdleCallback(fn,{timeout}):setTimeout(fn,Math.min(timeout,700));

  let stories=[];
  let movements=[];
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

  function movementSignature(item={}){return `${String(item.date||'').slice(0,10)}|${norm(item.player)}|${norm(String(item.type||'TRANSACTION').toUpperCase())}`;}

  function movementCard(item){
    const type=String(item.type||'TRANSACTION').toUpperCase();
    return `<article class="team-fresh-movement" data-team-fresh-movement="${safe(movementSignature(item))}"><div><span>${safe(type)}</span><time>${safe(fmtDate(item.date))}</time></div><strong>${safe(item.player||'Player update')}</strong><p>${safe(item.detail||'Roster update')}</p><a href="/player-movement.html">Open Player Movement →</a></article>`;
  }

  function updateEmptyState(){
    const clear=host.querySelector('.dream-wire-clear');
    if(!clear||(!host.querySelector('[data-team-editorial-story]')&&!host.querySelector('[data-team-fresh-movement]')))return;
    const strong=clear.querySelector('strong');
    const copy=clear.querySelector('p');
    if(strong)strong.textContent=`No other active ${teamData.name} roster or availability alerts.`;
    if(copy)copy.textContent='Recent movement and We Know the W player mentions are shown above. New roster and availability alerts will appear here when posted.';
  }

  function appendStories(){
    if(!ready||!stories.length||!host.isConnected)return;
    const people=rosterPeople();
    const existing=new Set([...host.querySelectorAll('[data-team-editorial-story]')].map(node=>node.dataset.teamEditorialStory));
    const markup=stories.filter(item=>!existing.has(item.post.slug)).map(item=>postCard(item.post,item.players,people)).join('');
    if(markup)host.insertAdjacentHTML('afterbegin',markup);
    host.classList.toggle('has-editorial-stories',Boolean(host.querySelector('[data-team-editorial-story]')));
  }

  function appendMovements(){
    if(!ready||!movements.length||!host.isConnected)return;
    const existing=new Set([...host.querySelectorAll('[data-team-fresh-movement]')].map(node=>node.dataset.teamFreshMovement));
    const visibleText=norm(host.textContent);
    const markup=movements.filter(item=>{
      const sig=movementSignature(item);
      if(existing.has(sig))return false;
      const player=norm(item.player),type=norm(item.type);
      return !(player&&visibleText.includes(player)&&(!type||visibleText.includes(type)));
    }).map(movementCard).join('');
    if(markup)host.insertAdjacentHTML('afterbegin',markup);
    host.classList.toggle('has-fresh-movements',Boolean(host.querySelector('[data-team-fresh-movement]')));
  }

  function appendExtras(){appendStories();appendMovements();updateEmptyState();}
  function scheduleAppend(){clearTimeout(appendTimer);appendTimer=setTimeout(appendExtras,90);}

  async function loadExtras(){
    const names=rosterNames();
    if(!names.length)return;
    try{
      const stamp=Date.now();
      const [weeklyResult,specialResult,movementResult]=await Promise.allSettled([
        fetch(`/snack-shaq-posts.json?teamMentions=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch(`/snack-shak-specials.json?teamMentions=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{}),
        fetch(`/api/player-movement?teamHub=${stamp}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(r=>r.ok?r.json():{})
      ]);
      const weekly=weeklyResult.status==='fulfilled'&&Array.isArray(weeklyResult.value.posts)?weeklyResult.value.posts:[];
      const specials=specialResult.status==='fulfilled'&&Array.isArray(specialResult.value.posts)?specialResult.value.posts:[];
      const combined=[...specials,...weekly].filter(post=>post&&post.slug&&post.published);
      stories=combined.map(post=>({post,players:mentions(post,names)})).filter(item=>item.players.length).sort((a,b)=>String(b.post.published).localeCompare(String(a.post.published))||Number(b.post.priority||0)-Number(a.post.priority||0)).slice(0,4);
      const transactionList=movementResult.status==='fulfilled'&&Array.isArray(movementResult.value.transactions)?movementResult.value.transactions:[];
      movements=transactionList.filter(item=>norm(item.team)===norm(teamData.name)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,4);
      ready=true;
      appendExtras();
    }catch{ready=true;}
  }

  const rosterObserver=new MutationObserver(()=>{
    if(rosterNames().length){rosterObserver.disconnect();idle(loadExtras,900);}
  });
  rosterObserver.observe(roster,{childList:true,subtree:true});
  if(rosterNames().length){rosterObserver.disconnect();idle(loadExtras,900);}

  const hostObserver=new MutationObserver(()=>{if(ready&&(stories.length||movements.length))scheduleAppend();});
  hostObserver.observe(host,{childList:true});
})();
