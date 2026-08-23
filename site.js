const UI_FIXES_HREF='/ui-fixes.css?v=20260822-mobile-nav-v1';
if(!document.querySelector('link[data-ui-fixes]')){
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href=UI_FIXES_HREF;
  l.dataset.uiFixes='true';
  document.head.appendChild(l);
}

const accordionCss=`
.nav-submenu .nav-accordion-item{display:block;border-radius:12px;overflow:hidden}
.nav-submenu .nav-accordion-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:transparent;color:#352a42;padding:11px 12px;text-align:left;font:inherit;font-weight:900;cursor:pointer}
.nav-submenu .nav-accordion-trigger:hover,.nav-submenu .nav-accordion-trigger:focus-visible{background:#f3ecfb;color:#5c1fc1;outline:none}
.nav-submenu .nav-accordion-trigger .nav-accordion-caret{font-size:.8rem;transition:transform .18s ease;opacity:.75}
.nav-submenu .nav-accordion-item.open>.nav-accordion-trigger .nav-accordion-caret{transform:rotate(180deg)}
.nav-submenu .nav-accordion-panel{display:none;padding:2px 0 8px 12px;margin:0 7px 4px;border-left:2px solid #d7c7ea}
.nav-submenu .nav-accordion-item.open>.nav-accordion-panel{display:grid}
.nav-submenu .nav-accordion-panel a{display:block;padding:8px 10px!important;font-size:.84rem!important;font-weight:750!important;color:#62566f!important;text-decoration:none;border-radius:9px}
.nav-submenu .nav-accordion-panel a:hover,.nav-submenu .nav-accordion-panel a:focus{background:#f3ecfb!important;color:#5c1fc1!important}
.nav-submenu .nav-accordion-panel a.nav-open-parent{font-weight:900!important;color:#3c2a4c!important}
.nav-submenu>.nav-direct-link{display:block;padding:11px 12px;font-weight:900;text-decoration:none;border-radius:12px}
.nav-submenu>.nav-direct-link:hover,.nav-submenu>.nav-direct-link:focus{background:#f3ecfb}
.nav-paren{font-weight:500!important;opacity:.82}
@media(max-width:1100px){
  .nav-links.open .nav-accordion-trigger{min-height:44px;color:#352a42!important;font-size:.94rem!important;padding:10px 12px!important}
  .nav-links.open .nav-accordion-panel{margin:0 4px 4px 10px;padding-left:8px}
  .nav-links.open .nav-direct-link{color:#41384d!important;padding:10px 12px!important;font-size:.92rem!important}
}
`;
if(!document.querySelector('style[data-nav-accordion]')){
  const style=document.createElement('style');
  style.dataset.navAccordion='true';
  style.textContent=accordionCss;
  document.head.appendChild(style);
}

const navLinks=document.getElementById('navLinks');
const menuButton=document.getElementById('menuButton');

const accordion=(label,href,links)=>`<div class="nav-accordion-item"><button class="nav-accordion-trigger" type="button" aria-expanded="false"><span>${label}</span><span class="nav-accordion-caret" aria-hidden="true">▾</span></button><div class="nav-accordion-panel"><a class="nav-open-parent" href="${href}">Open ${label.replace(/<[^>]+>/g,'')} →</a>${links.map(([text,url])=>`<a href="${url}">${text}</a>`).join('')}</div></div>`;

const structuredNav=`
<div class="nav-group">
  <a class="nav-parent" href="/around-the-w.html">Around the W <span aria-hidden="true">▾</span></a>
  <div class="nav-submenu">
    ${accordion('Live Stats','/live-stats.html',[
      ['Games','/games.html'],['No Love Lost · Rivalry Board','/no-love-lost.html'],['Player Movement','/player-movement.html'],['Availability Report','/availability-report.html']
    ])}
    ${accordion('Franchise Hubs','/around-the-w.html',[
      ['All Current Teams','/around-the-w.html#team-pages'],['Cleveland Sirens · 2028','/team.html?team=cleveland-sirens']
    ])}
    <a class="nav-direct-link" href="/snack-shak.html">Seasoned Notes · Snack Shak</a>
  </div>
</div>
<div class="nav-group">
  <a class="nav-parent" href="/playerpedia.html">Playerpedia <span aria-hidden="true">▾</span></a>
  <div class="nav-submenu">
    <a class="nav-direct-link" href="/playerpedia.html#playerpedia-directory"><strong>On the Floor</strong> <span class="nav-paren">(Current Players)</span></a>
    <a class="nav-direct-link" href="/retired-players.html"><strong>Legends Lounge</strong> <span class="nav-paren">(Retired Players)</span></a>
    ${accordion('Herstory','/herstory.html',[
      ['Education','/herstory-education.html'],['Entrepreneurship','/herstory-entrepreneurship.html'],['Community','/herstory-community.html'],['Life Chapters','/herstory-life-chapters.html'],['Profile Connection','/herstory.html#profile-connection']
    ])}
    <a class="nav-direct-link" href="/starting-five.html">Shak’s Starting Five</a>
    <a class="nav-direct-link" href="/bench-mob.html">Shak’s Bench Mob</a>
  </div>
</div>
<div class="nav-group">
  <a class="nav-parent" href="/w-vault.html">The W Vault <span aria-hidden="true">▾</span></a>
  <div class="nav-submenu">
    ${accordion('The Film Room','/film-room.html',[
      ['Positions','/film-room.html#positions'],['Offense','/film-room.html#offense'],['Defense','/film-room.html#defense'],['Strategy','/film-room.html#strategy'],['Watch Like a Coach','/film-room.html#watch-like-a-coach'],['Basketball Dictionary','/basketball-dictionary.html']
    ])}
    ${accordion('The Trophy Room','/trophy-case.html',[
      ['Championship Journey','/trophy-case.html#championships'],['Finals MVPs','/trophy-case.html#finals-mvp'],['Dynasties + Title Counts','/trophy-case.html#dynasties']
    ])}
    ${accordion('And the W Goes To…','/trophy-case.html#awards',[
      ['MVP','/award-mvp.html'],['DPOY','/award-dpoy.html'],['All Award Pages','/trophy-case.html#awards']
    ])}
    ${accordion('The Locker Room','/locker-room.html',[
      ['Legends Locker · Retired Players','/retired-players.html'],['Old Uniforms','/old-uniforms.html'],['All Star Uniforms','/all-star-uniforms.html'],['The Final Buzzer','/final-buzzer.html'],['Colors & Symbols','/colors-symbols.html'],['Franchise Changes','/franchise-changes.html'],['Franchise Family Tree','/franchise-family-tree.html']
    ])}
  </div>
</div>
<div class="nav-group">
  <a class="nav-parent" href="/courtside-culture.html">Courtside Culture <span aria-hidden="true">▾</span></a>
  <div class="nav-submenu">
    <a class="nav-direct-link" href="/courtside-culture.html">Open Courtside Culture</a>
    ${accordion('Mascots','/mascots.html',[
      ['Retired Mascots','/mascots.html#retired-mascots']
    ])}
    ${accordion('Coaches','/coaches.html',[
      ['Court to Clipboard','/coaches.html#court-to-clipboard']
    ])}
    <a class="nav-direct-link" href="/owners.html">Owners</a>
    <a class="nav-direct-link" href="/celebrity-fans.html">Celebrity Fans</a>
    <a class="nav-direct-link" href="/gameday-vibes.html">Gameday Vibes</a>
    <a class="nav-direct-link" href="/wnba-fits.html">The Fits</a>
  </div>
</div>
<div class="nav-group">
  <a class="nav-parent" href="/who-got-next.html">Who Got Next? <span aria-hidden="true">▾</span></a>
  <div class="nav-submenu who-got-next-menu">
    <a class="nav-direct-link" href="/who-got-next.html">Who Got Next?</a>
    <a class="nav-direct-link" href="/class-is-in-session.html">Class Is in Session · NCAAW</a>
    <a class="nav-direct-link" href="/the-call-up.html">The Call Up · UPSHOT</a>
    <a class="nav-direct-link" href="/expansion-watch.html">Expansion Watch</a>
  </div>
</div>
<button class="nav-search-button" id="globalSearchButton" type="button" aria-haspopup="dialog">⌕ Search</button>`;

if(navLinks) navLinks.innerHTML=structuredNav;

function closeAccordionSiblings(item){
  const submenu=item.closest('.nav-submenu');
  submenu?.querySelectorAll('.nav-accordion-item.open').forEach(other=>{
    if(other===item) return;
    other.classList.remove('open');
    other.querySelector('.nav-accordion-trigger')?.setAttribute('aria-expanded','false');
  });
}

document.querySelectorAll('.nav-accordion-trigger').forEach(button=>{
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    const item=button.closest('.nav-accordion-item');
    if(!item) return;
    const willOpen=!item.classList.contains('open');
    closeAccordionSiblings(item);
    item.classList.toggle('open',willOpen);
    button.setAttribute('aria-expanded',String(willOpen));
  });
});

const mobileNav=window.matchMedia('(max-width:1100px)');
function isMobileNav(){return mobileNav.matches;}
function closeNestedAccordions(scope=document){
  scope.querySelectorAll?.('.nav-accordion-item.open').forEach(item=>{
    item.classList.remove('open');
    item.querySelector('.nav-accordion-trigger')?.setAttribute('aria-expanded','false');
  });
}
function setMobileMenuState(open){
  navLinks?.classList.toggle('open',Boolean(open));
  menuButton?.setAttribute('aria-expanded',String(Boolean(open)));
  document.body.classList.toggle('mobile-nav-open',Boolean(open));
  if(!open){
    document.querySelectorAll('.nav-group.submenu-open').forEach(group=>group.classList.remove('submenu-open'));
    closeNestedAccordions(navLinks||document);
  }
}
menuButton?.addEventListener('click',event=>{
  event.stopPropagation();
  setMobileMenuState(!navLinks?.classList.contains('open'));
});

document.querySelectorAll('.nav-group').forEach(group=>{
  group.querySelector('.nav-parent')?.addEventListener('click',event=>{
    if(!isMobileNav()) return;
    event.preventDefault();
    event.stopPropagation();
    const open=group.classList.contains('submenu-open');
    document.querySelectorAll('.nav-group.submenu-open').forEach(other=>{
      if(other!==group){
        other.classList.remove('submenu-open');
        closeNestedAccordions(other);
      }
    });
    group.classList.toggle('submenu-open',!open);
    if(open) closeNestedAccordions(group);
  });
});

document.addEventListener('click',event=>{
  if(isMobileNav()&&navLinks?.classList.contains('open')&&!event.target.closest('#navLinks')&&!event.target.closest('#menuButton')) setMobileMenuState(false);
});
navLinks?.addEventListener('click',event=>{
  if(isMobileNav()&&!event.target.closest('.nav-parent')&&!event.target.closest('.nav-accordion-trigger')&&(event.target.closest('a')||event.target.closest('button'))) setMobileMenuState(false);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&navLinks?.classList.contains('open')){
    setMobileMenuState(false);
    menuButton?.focus();
  }
});
mobileNav.addEventListener?.('change',event=>{if(!event.matches)setMobileMenuState(false);});

const hierarchyMap={
  '/live-stats.html':['Around the W','/around-the-w.html','Live Stats'],
  '/games.html':['Live Stats','/live-stats.html','Games'],
  '/no-love-lost.html':['Live Stats','/live-stats.html','No Love Lost'],
  '/player-movement.html':['Live Stats','/live-stats.html','Player Movement'],
  '/availability-report.html':['Live Stats','/live-stats.html','Availability Report'],
  '/around-the-w.html':['Around the W','/around-the-w.html','Team Pages'],
  '/snack-shak.html':['Around the W','/around-the-w.html','Seasoned Notes'],
  '/snack-shaq.html':['Around the W','/around-the-w.html','Seasoned Notes'],
  '/playerpedia.html':['Playerpedia','/playerpedia.html','On the Floor'],
  '/retired-players.html':['Playerpedia','/playerpedia.html','Legends Lounge'],
  '/herstory.html':['Playerpedia','/playerpedia.html','Herstory'],
  '/herstory-education.html':['Herstory','/herstory.html','Education'],
  '/herstory-entrepreneurship.html':['Herstory','/herstory.html','Entrepreneurship'],
  '/herstory-community.html':['Herstory','/herstory.html','Community'],
  '/herstory-life-chapters.html':['Herstory','/herstory.html','Life Chapters'],
  '/starting-five.html':['Playerpedia','/playerpedia.html','Shak’s Starting Five'],
  '/bench-mob.html':['Playerpedia','/playerpedia.html','Shak’s Bench Mob'],
  '/film-room.html':['The W Vault','/w-vault.html','The Film Room'],
  '/basketball-dictionary.html':['The Film Room','/film-room.html','Basketball Dictionary'],
  '/trophy-case.html':['The W Vault','/w-vault.html','The Trophy Room'],
  '/award-mvp.html':['The Trophy Room','/trophy-case.html','MVP'],
  '/award-dpoy.html':['The Trophy Room','/trophy-case.html','DPOY'],
  '/award-mip.html':['The Trophy Room','/trophy-case.html','MIP'],
  '/award-sixth-player.html':['The Trophy Room','/trophy-case.html','Sixth Player'],
  '/award-roy.html':['The Trophy Room','/trophy-case.html','ROY'],
  '/award-coy.html':['The Trophy Room','/trophy-case.html','COY'],
  '/commissioners-cup.html':['The Trophy Room','/trophy-case.html','Commissioner’s Cup'],
  '/all-wnba.html':['The Trophy Room','/trophy-case.html','All WNBA'],
  '/all-defensive.html':['The Trophy Room','/trophy-case.html','All Defensive'],
  '/all-rookie.html':['The Trophy Room','/trophy-case.html','All Rookie'],
  '/locker-room.html':['The W Vault','/w-vault.html','The Locker Room'],
  '/old-uniforms.html':['The Locker Room','/locker-room.html','Old Uniforms'],
  '/all-star-uniforms.html':['The Locker Room','/locker-room.html','All Star Uniforms'],
  '/final-buzzer.html':['The Locker Room','/locker-room.html','The Final Buzzer'],
  '/colors-symbols.html':['The Locker Room','/locker-room.html','Colors & Symbols'],
  '/franchise-changes.html':['The Locker Room','/locker-room.html','Franchise Changes'],
  '/franchise-family-tree.html':['The Locker Room','/locker-room.html','Franchise Family Tree'],
  '/mascots.html':['Courtside Culture','/courtside-culture.html','Mascots'],
  '/coaches.html':['Courtside Culture','/courtside-culture.html','Coaches'],
  '/owners.html':['Courtside Culture','/courtside-culture.html','Owners'],
  '/celebrity-fans.html':['Courtside Culture','/courtside-culture.html','Celebrity Fans'],
  '/gameday-vibes.html':['Courtside Culture','/courtside-culture.html','Gameday Vibes'],
  '/wnba-fits.html':['Courtside Culture','/courtside-culture.html','The Fits'],
  '/class-is-in-session.html':['Who Got Next?','/who-got-next.html','Class Is in Session'],
  '/the-call-up.html':['Who Got Next?','/who-got-next.html','The Call Up'],
  '/expansion-watch.html':['Who Got Next?','/who-got-next.html','Expansion Watch'],
  '/cleveland-sirens.html':['Expansion Watch','/expansion-watch.html','Cleveland Sirens'],
  '/detroit-expansion.html':['Expansion Watch','/expansion-watch.html','Detroit 2029'],
  '/philadelphia-expansion.html':['Expansion Watch','/expansion-watch.html','Philadelphia 2030'],
  '/expansion-draft-101.html':['Expansion Watch','/expansion-watch.html','Expansion Draft 101'],
  '/past-expansion-waves.html':['Expansion Watch','/expansion-watch.html','Past Expansion Waves']
};
const h=hierarchyMap[location.pathname];
const crumbs=document.querySelector('.page-crumbs');
if(crumbs&&h&&location.pathname!=='/around-the-w.html'&&location.pathname!=='/playerpedia.html'){
  crumbs.innerHTML=`<a href="/">Home</a><span>›</span><a href="${h[1]}">${h[0]}</a><span>›</span><b>${h[2]}</b>`;
}
document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=new Date().getFullYear());

const coreSearch=[
  ['Around the W','Section','/around-the-w.html','teams season standings'],
  ['Live Stats','Around the W','/live-stats.html','overall conference commissioner cup playoffs standings'],
  ['Games','Live Stats','/games.html','scores schedule playoffs commissioners cup'],
  ['No Love Lost','Live Stats','/no-love-lost.html','rivalry head to head wins losses struggle meter'],
  ['Player Movement','Live Stats','/player-movement.html','trades signings waives transactions'],
  ['Availability Report','Live Stats','/availability-report.html','injury availability out questionable'],
  ['On the Floor (Current Players)','Playerpedia','/playerpedia.html#playerpedia-directory','players roster bios stats'],
  ['Legends Lounge (Retired Players)','Playerpedia','/retired-players.html','retired legends pioneers years career'],
  ['Herstory','Playerpedia','/herstory.html','education business advocacy family'],
  ['Shak’s Starting Five','Playerpedia','/starting-five.html','featured players rotation'],
  ['Shak’s Bench Mob','Playerpedia','/bench-mob.html','role players sixth woman'],
  ['The Film Room','W Vault','/film-room.html','positions offense defense strategy'],
  ['Basketball Dictionary','W Vault','/basketball-dictionary.html','glossary basketball terms'],
  ['The Trophy Room','W Vault','/trophy-case.html','championships awards mvp dpoy'],
  ['MVP','Trophy Room','/award-mvp.html','most valuable player'],
  ['DPOY','Trophy Room','/award-dpoy.html','defensive player'],
  ['Commissioner’s Cup','Trophy Room','/commissioners-cup.html','cup champion mvp'],
  ['The Locker Room','W Vault','/locker-room.html','uniforms retired players mascots colors franchise'],
  ['Old Uniforms','Locker Room','/old-uniforms.html','jerseys uniforms'],
  ['The Final Buzzer','Locker Room','/final-buzzer.html','retirement retired numbers'],
  ['Franchise Family Tree','Locker Room','/franchise-family-tree.html','relocation franchise lineage'],
  ['Mascots','Courtside Culture','/mascots.html','ellie blaze skye prowl retired mascots'],
  ['Coaches','Courtside Culture','/coaches.html','coaches court clipboard'],
  ['Owners','Courtside Culture','/owners.html','owners investors'],
  ['The Fits','Courtside Culture','/wnba-fits.html','fashion tunnel style'],
  ['Class Is in Session','Who Got Next?','/class-is-in-session.html','ncaaw college'],
  ['The Call Up','Who Got Next?','/the-call-up.html','upshot development'],
  ['Expansion Watch','Who Got Next?','/expansion-watch.html','cleveland detroit philadelphia']
];
const teamSearch=[
  ['Atlanta Dream','atlanta-dream'],['Chicago Sky','chicago-sky'],['Connecticut Sun','connecticut-sun'],['Dallas Wings','dallas-wings'],['Golden State Valkyries','golden-state-valkyries'],['Indiana Fever','indiana-fever'],['Las Vegas Aces','las-vegas-aces'],['Los Angeles Sparks','los-angeles-sparks'],['Minnesota Lynx','minnesota-lynx'],['New York Liberty','new-york-liberty'],['Phoenix Mercury','phoenix-mercury'],['Portland Fire','portland-fire'],['Seattle Storm','seattle-storm'],['Toronto Tempo','toronto-tempo'],['Washington Mystics','washington-mystics'],['Cleveland Sirens','cleveland-sirens']
];
const searchStaticIndex=[
  ...coreSearch.map(([title,type,href,keywords])=>({title,type,href,keywords})),
  ...teamSearch.map(([title,slug])=>({title,type:'Team',href:`/team.html?team=${slug}`,keywords:`${title} roster history rivalry mascot fanbase`}))
];
let globalSearchPlayers=null;
let globalSearchLoading=false;
function normalizeSearch(v=''){
  return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function buildSearchDialog(){
  if(document.getElementById('globalSearchDialog')) return;
  const d=document.createElement('dialog');
  d.id='globalSearchDialog';
  d.className='global-search-dialog';
  d.innerHTML='<div class="global-search-shell"><div class="global-search-head"><div><span>WE KNOW THE W</span><strong>Search the encyclopedia</strong></div><button type="button" id="globalSearchClose" aria-label="Close search">×</button></div><label class="global-search-field"><span>Search</span><input id="globalSearchInput" type="search" autocomplete="off" placeholder="Players, teams, awards, coaches, mascots…"></label><div id="globalSearchResults" class="global-search-results"><div class="global-search-empty">Type at least 2 letters to search the W.</div></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click',event=>{if(event.target===d)d.close();});
  d.querySelector('#globalSearchClose')?.addEventListener('click',()=>d.close());
  d.querySelector('#globalSearchInput')?.addEventListener('input',renderGlobalSearch);
}
async function loadSearchPlayers(){
  if(globalSearchPlayers||globalSearchLoading) return;
  globalSearchLoading=true;
  try{
    const r=await fetch('/api/players',{headers:{Accept:'application/json'}});
    const p=await r.json();
    globalSearchPlayers=r.ok&&Array.isArray(p.players)?p.players.map(x=>({
      title:x.name,
      type:`Player · ${x.team||'WNBA'}`,
      href:`/playerpedia.html?search=${encodeURIComponent(x.name)}`,
      keywords:`${x.name} ${x.team||''} ${x.position||''}`
    })):[];
  }catch{
    globalSearchPlayers=[];
  }
  globalSearchLoading=false;
  renderGlobalSearch();
}
function renderGlobalSearch(){
  const input=document.getElementById('globalSearchInput');
  const results=document.getElementById('globalSearchResults');
  if(!input||!results) return;
  const q=normalizeSearch(input.value);
  if(q.length<2){
    results.innerHTML='<div class="global-search-empty">Type at least 2 letters to search the W.</div>';
    return;
  }
  const terms=q.split(/\s+/).filter(Boolean);
  const all=[...searchStaticIndex,...(globalSearchPlayers||[])];
  const matches=all.filter(item=>{
    const hay=normalizeSearch(`${item.title} ${item.type} ${item.keywords||''}`);
    return terms.every(term=>hay.includes(term));
  }).slice(0,14);
  const safeValue=input.value.replaceAll('<','&lt;').replaceAll('>','&gt;');
  results.innerHTML=matches.length?matches.map(item=>`<a class="global-search-result" href="${item.href}"><span>${item.type}</span><strong>${item.title}</strong><b>→</b></a>`).join(''):`<div class="global-search-empty">No match yet for “${safeValue}”.</div>`;
}
function openGlobalSearch(){
  buildSearchDialog();
  const d=document.getElementById('globalSearchDialog');
  if(typeof d.showModal==='function') d.showModal(); else d.setAttribute('open','');
  setTimeout(()=>document.getElementById('globalSearchInput')?.focus(),30);
  loadSearchPlayers();
}
document.getElementById('globalSearchButton')?.addEventListener('click',openGlobalSearch);
document.addEventListener('keydown',event=>{
  if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName||'')){
    event.preventDefault();
    openGlobalSearch();
  }
});

function addTransferLinks(){
  if(location.pathname!=='/'&&location.pathname!=='/index.html') return;
  const cards=[...document.querySelectorAll('.family-card')];
  const around=cards.find(card=>card.querySelector('h3')?.textContent.trim()==='Around the W');
  const players=cards.find(card=>card.querySelector('h3')?.textContent.trim()==='Playerpedia');
  const courtside=cards.find(card=>card.querySelector('h3')?.textContent.trim()==='Courtside Culture');
  const add=(card,href,label,icon='→')=>{
    const box=card?.querySelector('.family-links');
    if(box&&!box.querySelector(`a[href="${href}"]`)){
      const a=document.createElement('a');
      a.href=href;
      a.innerHTML=`<span>${label}</span><span>${icon}</span>`;
      box.appendChild(a);
    }
  };
  add(around,'/no-love-lost.html','No Love Lost');
  add(players,'/retired-players.html','Legends Lounge');
  add(courtside,'/mascots.html','Mascots');
  add(courtside,'/coaches.html','Coaches');
  add(courtside,'/owners.html','Owners');
  add(courtside,'/wnba-fits.html','The Fits');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addTransferLinks); else addTransferLinks();