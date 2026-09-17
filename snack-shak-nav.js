(()=>{
  const snackLinks=`<a class="nav-direct-link" href="/snack-shak.html"><strong>Open Snack Shak</strong></a><a class="nav-direct-link" href="/snack-shak-bytes.html">Snack Shak Bytes</a><a class="nav-direct-link" href="/food-for-thought.html">Food for Thought</a>`;
  const playoffFieldSrc='/assets/images/snack-shak/welcome-back-playoff-field-2026.jpg?v=20260917-hires-v1';
  const playoffFieldAlt='2026 WNBA playoff field showing the eight seeded teams, records, featured players and championship history through September 16';
  let spotlightObserver=null;

  function ensureWelcomeBackStyles(){
    if(document.getElementById('welcomeBackPlayoffCardStyles'))return;
    const style=document.createElement('style');
    style.id='welcomeBackPlayoffCardStyles';
    style.textContent=`
      .home-season-spotlight .season-story-media.welcome-back-playoff-card{background:#160b33;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:420px}
      .home-season-spotlight .season-story-media.welcome-back-playoff-card img{display:block;width:100%!important;height:100%!important;max-height:560px;object-fit:contain!important;object-position:center!important;background:#160b33}
      @media(max-width:980px){.home-season-spotlight .season-story-media.welcome-back-playoff-card{aspect-ratio:16/9!important;min-height:0}.home-season-spotlight .season-story-media.welcome-back-playoff-card img{max-height:none;object-fit:cover!important;object-position:center 9%!important}}
    `;
    document.head.appendChild(style);
  }

  async function normalizeWelcomeBackCard(){
    const card=document.querySelector('.home-season-spotlight a.season-story-lead[href="/welcome-back-to-the-w-2026.html"]');
    const figure=card?.querySelector('.season-story-media');
    const image=figure?.querySelector('img');
    if(!image||image.dataset.playoffField==='true')return;
    try{
      image.src=playoffFieldSrc;
      image.alt=playoffFieldAlt;
      image.loading='eager';
      image.decoding='async';
      image.dataset.playoffField='true';
      figure.classList.add('welcome-back-playoff-card');
      ensureWelcomeBackStyles();
    }catch(error){console.warn('Welcome Back playoff image could not load',error);}
  }

  function observeWelcomeBackCard(){
    const root=document.querySelector('.home-season-spotlight');
    if(!root||spotlightObserver)return;
    spotlightObserver=new MutationObserver(()=>normalizeWelcomeBackCard());
    spotlightObserver.observe(root,{childList:true,subtree:true});
  }

  function normalizeNav(){
    const nav=document.getElementById('navLinks');
    if(!nav)return;
    const groups=[...nav.querySelectorAll('.nav-group')];
    const snackGroups=groups.filter(group=>group.querySelector('.nav-parent')?.getAttribute('href')==='/snack-shak.html');
    snackGroups.slice(1).forEach(group=>group.remove());
    let group=snackGroups[0];
    // site.js now owns the clean global menu. Keep its grouped structure intact.
    if(group?.querySelector('.nav-menu-section'))return;
    if(!group){
      group=document.createElement('div');
      group.className='nav-group';
      const playerpedia=groups.find(item=>item.querySelector('.nav-parent')?.getAttribute('href')==='/playerpedia.html');
      if(playerpedia)nav.insertBefore(group,playerpedia);else nav.appendChild(group);
    }
    group.innerHTML=`<a class="nav-parent" href="/snack-shak.html">Snack Shak <span aria-hidden="true">▾</span></a><div class="nav-submenu snack-shak-menu">${snackLinks}</div>`;
    const parent=group.querySelector('.nav-parent');
    parent?.addEventListener('click',event=>{
      if(!window.matchMedia('(max-width:1100px)').matches)return;
      event.preventDefault();
      event.stopPropagation();
      const open=group.classList.contains('submenu-open');
      nav.querySelectorAll('.nav-group.submenu-open').forEach(other=>{if(other!==group)other.classList.remove('submenu-open');});
      group.classList.toggle('submenu-open',!open);
    });
  }

  function normalizeHomeCard(){
    const familyGrid=document.querySelector('.family-grid');
    if(!familyGrid)return;
    const heading=familyGrid.closest('section')?.querySelector('.page-heading h2');
    if(heading)heading.textContent='Seven doors. Everything has a home.';
    const around=[...familyGrid.querySelectorAll('.family-card')].find(card=>card.querySelector('h3')?.textContent.trim()==='Around the W');
    around?.querySelectorAll('.family-links a[href="/snack-shak.html"]').forEach(link=>link.remove());
    let card=[...familyGrid.querySelectorAll('.family-card')].find(item=>item.querySelector('h3')?.textContent.trim()==='Snack Shak');
    if(!card){card=document.createElement('article');card.className='family-card';if(around?.nextSibling)familyGrid.insertBefore(card,around.nextSibling);else familyGrid.appendChild(card);}
    card.innerHTML=`<p class="kicker">COMMENTARY + ANALYSIS</p><h3>Snack Shak</h3><p>One editorial home, organized by reading length. Grab a quick Byte or settle in with Food for Thought.</p><div class="family-links"><a href="/snack-shak.html"><span>Open Snack Shak</span><span>→</span></a><a href="/snack-shak-bytes.html"><span>Snack Shak Bytes</span><span>→</span></a><a href="/food-for-thought.html"><span>Food for Thought</span><span>→</span></a></div>`;
  }

  const run=()=>{normalizeNav();normalizeHomeCard();normalizeWelcomeBackCard();observeWelcomeBackCard();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  setTimeout(run,150);
  setTimeout(run,900);
})();