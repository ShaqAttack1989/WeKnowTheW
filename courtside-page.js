(function(){
  const page=document.body.dataset.culturePage;
  const $=selector=>document.querySelector(selector);
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeHttps=value=>{try{const parsed=new URL(String(value||''),location.origin);return parsed.protocol==='https:'||parsed.origin===location.origin?parsed.toString():''}catch{return''}};
  const teamFor=name=>COURTSIDE_TEAMS.find(team=>team.name===name)||{slug:'wnba',name,primary:'#5b2bbf',secondary:'#d7ff42',href:'/around-the-w.html'};
  const initials=name=>String(name).split(/\s+|&/).filter(Boolean).slice(0,2).map(word=>word[0]).join('').toUpperCase();
  const posterBySlug={
    'atlanta-dream':'17989.png','chicago-sky':'17990.png','connecticut-sun':'17991.png','dallas-wings':'17992.png','golden-state-valkyries':'17993.png','indiana-fever':'17994.png','las-vegas-aces':'17995.png','los-angeles-sparks':'17998.png','minnesota-lynx':'17997.png','new-york-liberty':'17996.png','phoenix-mercury':'17999.png','portland-fire':'18000.png','seattle-storm':'18001.png','toronto-tempo':'18174.jpg','washington-mystics':'18172.jpg'
  };
  const officialCoachPhotos={
    'Lynne Roberts':{
      image:'https://cdn.wnba.com/headshots/wnba/latest/260x190/1642749.png',
      sourceUrl:'https://sparks.wnba.com/roster',
      credit:'Official Los Angeles Sparks headshot'
    }
  };
  function photo(name,type,team,source){
    const colors=`--team:${team.primary};--team2:${team.secondary}`;
    return `<div class="culture-photo" style="${colors}" data-media-name="${escape(name)}" data-media-type="${type}" data-media-source="${escape(source||'')}" data-fallback="${escape(posterBySlug[team.slug]?`/assets/images/${posterBySlug[team.slug]}`:'')}"><div class="culture-initials">${initials(name)}</div></div>`;
  }
  function card({name,team:teamName,summary,source,label,role,path},type){
    const team=teamFor(teamName); const kicker=role||teamName||label||'Courtside Culture';
    return `<article class="culture-card" style="--team:${team.primary};--team2:${team.secondary}">${photo(name,type,team,source)}<div class="culture-card-body"><span class="culture-kicker">${escape(kicker)}</span><h3>${escape(name)}</h3><p>${escape(summary||path||'')}</p>${source?`<a href="${escape(source)}" target="_blank" rel="noopener">Source ↗</a>`:`<a href="${team.href}">Team page →</a>`}</div></article>`;
  }
  async function loadOne(el){
    const name=el.dataset.mediaName,type=el.dataset.mediaType,source=el.dataset.mediaSource;
    let payload=null,image='',credit='',creditUrl=source;
    if(type==='coach'&&officialCoachPhotos[name]){
      const official=officialCoachPhotos[name];
      image=official.image;
      credit=official.credit;
      creditUrl=official.sourceUrl;
    }
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
  if(page==='mascots')renderCards('#cultureGrid',COURTSIDE_MASCOTS,'mascot');
  if(page==='coaches'){
    renderCards('#cultureGrid',COURTSIDE_COACHES,'coach');
    const clipboard=$('#clipboardGrid');if(clipboard){clipboard.innerHTML=COURT_TO_CLIPBOARD.map(item=>card({...item,team:item.role.split(' · ')[0],summary:item.path},'coach')).join('');hydrateMedia();}
  }
  if(page==='owners'){
    const node=$('#cultureGrid');node.innerHTML=COURTSIDE_OWNERS.map(item=>{const team=teamFor(item.team);return `<article class="culture-card text-only" style="--team:${team.primary};--team2:${team.secondary}"><div class="culture-card-body"><span class="culture-kicker">${escape(item.team)}</span><h3>${escape(item.name)}</h3><p>${escape(item.summary)}</p><a href="${team.href}">Franchise hub →</a></div></article>`}).join('');
  }
  if(page==='fans')renderCards('#cultureGrid',COURTSIDE_FANS,'celebrity');
  if(page==='vibes'){
    const node=$('#cultureGrid');node.innerHTML=GAMEDAY_VIBES.map(item=>{const team=teamFor(item.team);return `<article class="vibe-card" style="--team:${team.primary}"><span>${escape(item.team)}</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><a href="${team.href}">Enter the team hub →</a></article>`}).join('');
  }
  async function renderFits(){
    const node=$('#cultureGrid');if(!node)return;
    try{const response=await fetch('/api/culture-feed');const payload=await response.json();if(!payload.items?.length)throw new Error();node.innerHTML=payload.items.map(item=>{const href=safeHttps(item.href);const image=safeHttps(item.image)||'/assets/images/17996.png';return `<article class="culture-card fit-card"><div class="culture-photo"><img src="${escape(image)}" alt="${escape(item.title)}" loading="lazy"></div><div class="culture-card-body"><span class="culture-kicker">WNBA FASHION</span><h3>${escape(item.title)}</h3>${item.date?`<time>${escape(new Date(item.date).toString()==='Invalid Date'?item.date:new Date(item.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}))}</time>`:''}<a href="${escape(href)}" target="_blank" rel="noopener">View source ↗</a></div></article>`}).join('');$('#fitsUpdated').textContent=`Feed refreshed ${new Date(payload.updatedAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
    }catch{node.innerHTML='<div class="culture-loading">The WNBA fashion feed is refreshing. Use the official source link below in the meantime.</div>';}
  }
  if(page==='fits')renderFits();
})();
