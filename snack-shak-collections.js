(()=>{
  const mode=document.body.dataset.snackCollection==='feature'?'feature':'byte';
  const pagePath=mode==='feature'?'/food-for-thought.html':'/snack-shak-bytes.html';
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const format=value=>{const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?String(value||''):date.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'});};
  const sources=['/snack-shak-love-and-basketball.json','/snack-shak-all-time.json','/snack-shak-final.json','/snack-shak-latest.json','/snack-shak-breaking.json','/snack-shak-specials.json','/snack-shaq-posts.json'];

  const FIBA_COMPETITION_ID='208875';
  const FIBA_PLAYER_IDS={
    'Jackie Young':'283322','Gabby Williams':'216915','Leonie Fiebich':'218988','Breanna Stewart':'176575','Emma Meesseman':'167505','Trinity San Antonio':'323904','Sevgi Uzun':'196252','Angel Reese':'255458','Xu Han':'224131','Sika Kone':'224434','Ramu Tokashiki':'166703','Iyana Martin':'295079','Steph Talbot':'176788','Nyara Sabally':'217770','Janelle Salaun':'237521','Dorka Juhasz':'219323'
  };
  const COUNTRY_CODES={'USA':'us','United States':'us','France':'fr','Germany':'de','Belgium':'be','Puerto Rico':'pr','Türkiye':'tr','Turkiye':'tr','China':'cn','Mali':'ml','Japan':'jp','Spain':'es','Australia':'au','Hungary':'hu'};
  const fibaPhoto=player=>FIBA_PLAYER_IDS[player]?`https://assets.fiba.basketball/image/upload/w_160,h_160,c_fill,g_face/f_png/q_auto/.headshot--person_${FIBA_PLAYER_IDS[player]}--competition_${FIBA_COMPETITION_ID}`:'';
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

  function storyImageMarkup(post={}){const source=post.storyImage||post.image;if(!source)return'';return `<figure class="snack-story-graphic"><img src="${safe(source)}" alt="${safe(post.imageAlt||post.title||'')}" decoding="async">${post.storyImageCaption?`<figcaption>${safe(post.storyImageCaption)}</figcaption>`:''}</figure>`;}
  function rankingsMarkup(rankings=[]){if(!rankings.length)return'';return `<section class="snack-section"><h3>Power rankings</h3><div class="rankings-table"><div class="rank-row head"><span>#</span><span>Team</span><span>Move</span><span>What Shak is seeing</span></div>${rankings.map(item=>`<div class="rank-row"><span class="rank">${safe(item.rank)}</span><strong>${safe(item.team)}</strong><span class="move">${safe(item.movement||'')}</span><span>${safe(item.note||'')}</span></div>`).join('')}</div></section>`;}
  function storyCellMarkup(column,cell,index){
    const name=String(column||'').trim().toLowerCase();
    const value=String(cell??'');
    if(name==='player'&&FIBA_PLAYER_IDS[value]){const photo=fibaPhoto(value);return `<div class="story-player-cell"><img class="story-player-photo" src="${safe(photo)}" alt="Official FIBA photo of ${safe(value)}" loading="lazy" decoding="async" onerror="this.style.display='none'"><strong>${safe(value)}</strong></div>`;}
    if(name==='country'&&COUNTRY_CODES[value]){const flag=flagPhoto(value);return `<div class="story-country-cell"><img class="story-country-flag" src="${safe(flag)}" alt="${safe(value)} flag" loading="lazy" decoding="async" onerror="this.style.display='none'"><span>${safe(value)}</span></div>`;}
    return index===1?`<strong>${safe(value)}</strong>`:`<span>${safe(value)}</span>`;
  }
  function tableMarkup(table={}){const columns=Array.isArray(table.columns)?table.columns:[],rows=Array.isArray(table.rows)?table.rows:[];if(!columns.length||!rows.length)return'';const hasPeople=columns.some(column=>String(column).toLowerCase()==='player')&&columns.some(column=>String(column).toLowerCase()==='country');if(hasPeople)ensureStoryTableMediaStyles();return `<section class="snack-section story-table-section"><div class="story-table-scroll"><div class="story-table${hasPeople?' has-people':''}" style="--story-cols:${columns.length}"><div class="story-table-row head">${columns.map(column=>`<span>${safe(column)}</span>`).join('')}</div>${rows.map(row=>`<div class="story-table-row">${row.map((cell,index)=>storyCellMarkup(columns[index],cell,index)).join('')}</div>`).join('')}</div></div></section>`;}
  function sectionsMarkup(sections=[]){return sections.map(section=>`<section class="snack-section"><h3>${safe(section.title)}</h3>${(section.paragraphs||[]).map(paragraph=>`<p>${safe(paragraph)}</p>`).join('')}</section>`).join('');}
  function debatesMarkup(items=[]){return items.length?`<section class="snack-debate-board"><h3>Spicy debate board</h3><ul>${items.map(item=>`<li>${safe(item)}</li>`).join('')}</ul></section>`:'';}
  function foodMarkup(food={}){return food.title||food.script?`<section class="food-segment"><span class="segment-label">FROM THE KITCHEN</span><h3>${safe(food.title||'This week’s segment')}</h3>${food.script?`<blockquote>${safe(food.script)}</blockquote>`:''}</section>`:'';}
  function sourcesMarkup(sources=[]){return sources.length?`<section class="source-list"><strong>Receipts</strong><p>${sources.map(source=>`<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.label||'Source')}</a>`).join(' · ')}</p></section>`:'';}
  function storyMarkup(post){return `<a class="snack-story-back" href="${pagePath}">← Back to all ${mode==='feature'?'Food for Thought articles':'Snack Shak Bytes'}</a><article class="snack-post"><header class="snack-post-header ${mode==='feature'?'feature-header':''}"><span class="snack-series-label">${safe(label(post))}</span><div class="meta"><span>${safe(format(post.published))}</span>${post.week?`<span>•</span><span>${safe(post.week)}</span>`:''}</div><h2>${safe(post.title)}</h2><p class="dek">${safe(post.dek||'')}</p></header>${storyImageMarkup(post)}${rankingsMarkup(post.rankings)}${tableMarkup(post.storyTable)}${sectionsMarkup(post.sections)}${debatesMarkup(post.debates)}${foodMarkup(post.foodSegment)}${sourcesMarkup(post.sources)}</article>`;}

  function showStory(post,story,{scroll=true,updateUrl=false}={}){
    if(!post||!story)return false;
    story.hidden=false;
    story.innerHTML=storyMarkup(post);
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
})();