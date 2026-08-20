const UI_FIXES_HREF='/ui-fixes.css?v=20260820-mobile-nav-v3';
if (!document.querySelector('link[data-ui-fixes]')) {
  const uiFixes = document.createElement('link');
  uiFixes.rel = 'stylesheet';
  uiFixes.href = UI_FIXES_HREF;
  uiFixes.dataset.uiFixes = 'true';
  document.head.appendChild(uiFixes);
}

const navLinks = document.getElementById('navLinks');
const menuButton = document.getElementById('menuButton');

const structuredNav = `
  <div class="nav-group">
    <a class="nav-parent" href="/around-the-w.html">Around the W <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/live-stats.html"><strong>Live Stats</strong></a>
      <a class="nav-nested" href="/games.html">Games</a>
      <a class="nav-nested" href="/player-movement.html">Player Movement</a>
      <a class="nav-nested" href="/availability-report.html">Availability Report</a>
      <a href="/around-the-w.html"><strong>Team Pages</strong></a>
      <a href="/snack-shaq.html"><strong>Seasoned Notes · Snack Shaq</strong></a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/playerpedia.html">Playerpedia <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/playerpedia.html"><strong>Players A–Z</strong></a>
      <a href="/herstory.html"><strong>Herstory</strong></a>
      <a class="nav-nested" href="/herstory.html#education">Education</a>
      <a class="nav-nested" href="/herstory.html#entrepreneurship">Entrepreneurship</a>
      <a class="nav-nested" href="/herstory.html#community">Community</a>
      <a class="nav-nested" href="/herstory.html#life-chapters">Life Chapters</a>
      <a href="/starting-five.html"><strong>Shak’s Starting Five</strong></a>
      <a href="/bench-mob.html"><strong>Shak’s Bench Mob</strong></a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/w-vault.html">The W Vault <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/film-room.html"><strong>The Film Room</strong></a>
      <a class="nav-nested" href="/film-room.html#positions">Positions</a>
      <a class="nav-nested" href="/film-room.html#offense">Offense</a>
      <a class="nav-nested" href="/film-room.html#defense">Defense</a>
      <a class="nav-nested" href="/film-room.html#strategy">Strategy</a>
      <a class="nav-nested" href="/film-room.html#watch-like-a-coach">Watch Like a Coach</a>
      <a class="nav-nested" href="/basketball-dictionary.html">Basketball Dictionary</a>
      <a href="/trophy-case.html"><strong>The Trophy Room</strong></a>
      <a class="nav-nested" href="/trophy-case.html#championships">Championships</a>
      <a class="nav-nested" href="/trophy-case.html#awards">And the W Goes To…</a>
      <a class="nav-nested" href="/locker-room.html">The Locker Room</a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/courtside-culture.html">Courtside Culture <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/courtside-culture.html"><strong>Open Courtside Culture</strong></a>
      <a href="/courtside-culture.html#mascots">Mascots</a>
      <a href="/courtside-culture.html#coaches">Coaches</a>
      <a class="nav-nested" href="/courtside-culture.html#court-to-clipboard">Court to Clipboard</a>
      <a href="/courtside-culture.html#owners">Owners</a>
      <a href="/courtside-culture.html#celebrity-fans">Celebrity Fans</a>
      <a href="/courtside-culture.html#gameday-vibes">Gameday Vibes</a>
      <a href="/courtside-culture.html#the-fits">The Fits</a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/who-got-next.html">Who Got Next? <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu who-got-next-menu">
      <a href="/who-got-next.html"><strong>Who Got Next?</strong></a>
      <a href="/class-is-in-session.html">Class Is in Session · NCAAW</a>
      <a href="/the-call-up.html">The Call Up · UPSHOT</a>
      <a href="/expansion-watch.html">Expansion Watch</a>
    </div>
  </div>
  <button class="nav-search-button" id="globalSearchButton" type="button" aria-haspopup="dialog">⌕ Search</button>
`;

if (navLinks) navLinks.innerHTML = structuredNav;

const mobileNav = window.matchMedia('(max-width: 1100px)');
function isMobileNav(){return mobileNav.matches;}

menuButton?.addEventListener('click', event => {
  event.stopPropagation();
  const open = navLinks?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(open)));
  if (!open) document.querySelectorAll('.nav-group.submenu-open').forEach(group => group.classList.remove('submenu-open'));
});

document.querySelectorAll('.nav-group').forEach(group => {
  const parent = group.querySelector('.nav-parent');
  parent?.addEventListener('click', event => {
    if (!isMobileNav()) return;
    event.preventDefault();
    event.stopPropagation();
    const alreadyOpen = group.classList.contains('submenu-open');
    document.querySelectorAll('.nav-group.submenu-open').forEach(other => {
      if (other !== group) other.classList.remove('submenu-open');
    });
    group.classList.toggle('submenu-open', !alreadyOpen);
  });
});

document.addEventListener('click', event => {
  if (!isMobileNav() || !navLinks?.classList.contains('open')) return;
  if (event.target.closest('#navLinks') || event.target.closest('#menuButton')) return;
  navLinks.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

const hierarchyMap = {
  '/live-stats.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Live Stats' },
  '/games.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Games' },
  '/player-movement.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Player Movement' },
  '/availability-report.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Availability Report' },
  '/around-the-w.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Team Pages' },
  '/snack-shaq.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Seasoned Notes' },
  '/herstory.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Herstory' },
  '/starting-five.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Shak’s Starting Five' },
  '/bench-mob.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Shak’s Bench Mob' },
  '/film-room.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Film Room' },
  '/basketball-dictionary.html': { parent: 'The Film Room', parentHref: '/film-room.html', current: 'Basketball Dictionary' },
  '/trophy-case.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Trophy Room' },
  '/locker-room.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'The Locker Room' },
  '/class-is-in-session.html': { parent: 'Who Got Next?', parentHref: '/who-got-next.html', current: 'Class Is in Session' },
  '/the-call-up.html': { parent: 'Who Got Next?', parentHref: '/who-got-next.html', current: 'The Call Up' },
  '/expansion-watch.html': { parent: 'Who Got Next?', parentHref: '/who-got-next.html', current: 'Expansion Watch' },
  '/cleveland-sirens.html': { parent: 'Expansion Watch', parentHref: '/expansion-watch.html', current: 'Cleveland Sirens' },
  '/detroit-expansion.html': { parent: 'Expansion Watch', parentHref: '/expansion-watch.html', current: 'Detroit 2029' },
  '/philadelphia-expansion.html': { parent: 'Expansion Watch', parentHref: '/expansion-watch.html', current: 'Philadelphia 2030' },
  '/expansion-draft-101.html': { parent: 'Expansion Watch', parentHref: '/expansion-watch.html', current: 'Expansion Draft 101' },
  '/past-expansion-waves.html': { parent: 'Expansion Watch', parentHref: '/expansion-watch.html', current: 'Past Expansion Waves' }
};

const pageHierarchy = hierarchyMap[location.pathname];
const crumbs = document.querySelector('.page-crumbs');
if (crumbs && pageHierarchy && location.pathname !== '/around-the-w.html') {
  crumbs.innerHTML = `<a href="/">Home</a><span>›</span><a href="${pageHierarchy.parentHref}">${pageHierarchy.parent}</a><span>›</span><b>${pageHierarchy.current}</b>`;
}

document.querySelectorAll('[data-current-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

const searchStaticIndex = [
  {title:'Around the W',type:'Section',href:'/around-the-w.html',keywords:'teams current season standings roster'},
  {title:'Live Stats',type:'Around the W',href:'/live-stats.html',keywords:'overall conference standings daily'},
  {title:'Games',type:'Live Stats',href:'/games.html',keywords:'past upcoming scores schedule tip time venue'},
  {title:'Player Movement',type:'Live Stats',href:'/player-movement.html',keywords:'trades signings waives contracts transactions roster wire'},
  {title:'Availability Report',type:'Live Stats',href:'/availability-report.html',keywords:'injuries out day to day season ending return'},
  {title:'Team Pages',type:'Around the W',href:'/around-the-w.html',keywords:'franchises teams roster history'},
  {title:'Seasoned Notes · Snack Shaq',type:'Around the W',href:'/snack-shaq.html',keywords:'weekly blog power rankings monday spicy'},
  {title:'Playerpedia',type:'Section',href:'/playerpedia.html',keywords:'players roster bios stats photos'},
  {title:'Herstory · Education',type:'Playerpedia',href:'/herstory.html#education',keywords:'degrees college graduate academic learning'},
  {title:'Herstory · Entrepreneurship',type:'Playerpedia',href:'/herstory.html#entrepreneurship',keywords:'business brands investments ownership companies'},
  {title:'Herstory · Community',type:'Playerpedia',href:'/herstory.html#community',keywords:'foundation philanthropy advocacy giving back'},
  {title:'Herstory · Life Chapters',type:'Playerpedia',href:'/herstory.html#life-chapters',keywords:'family milestones personal life chapters'},
  {title:'Shak’s Starting Five',type:'Playerpedia',href:'/starting-five.html',keywords:'shak shakeema featured players weekly monday'},
  {title:'Shak’s Bench Mob',type:'Playerpedia',href:'/bench-mob.html',keywords:'shak shakeema sixth woman microwave scorer 3 and d glue player backup floor general energy big'},
  {title:'The W Vault',type:'Section',href:'/w-vault.html',keywords:'history basketball strategy awards uniforms'},
  {title:'The Film Room · Positions',type:'W Vault',href:'/film-room.html#positions',keywords:'point guard shooting guard wing forward center roles'},
  {title:'The Film Room · Offense',type:'W Vault',href:'/film-room.html#offense',keywords:'pick and roll spacing motion offense transition'},
  {title:'The Film Room · Defense',type:'W Vault',href:'/film-room.html#defense',keywords:'drop switch zone help defense blitz'},
  {title:'The Film Room · Strategy',type:'W Vault',href:'/film-room.html#strategy',keywords:'tempo matchups scouting nickname team styles'},
  {title:'Watch Like a Coach',type:'W Vault',href:'/film-room.html#watch-like-a-coach',keywords:'screens substitutions possessions coverages coaching'},
  {title:'Basketball Dictionary',type:'W Vault',href:'/basketball-dictionary.html',keywords:'glossary ice hedge drop nail short roll spain ghost screen horns'},
  {title:'The Trophy Room · Championships',type:'W Vault',href:'/trophy-case.html#championships',keywords:'titles finals dynasties finals mvp champions'},
  {title:'And the W Goes To…',type:'W Vault',href:'/trophy-case.html#awards',keywords:'mvp dpoy mip sixth player rookie coach all wnba all defensive all rookie commissioners cup'},
  {title:'The Locker Room',type:'W Vault',href:'/locker-room.html',keywords:'uniforms retired numbers colors symbols rebrands relocations franchise family tree'},
  {title:'Courtside Culture · Mascots',type:'Courtside Culture',href:'/courtside-culture.html#mascots',keywords:'mascot bios personalities'},
  {title:'Courtside Culture · Coaches',type:'Courtside Culture',href:'/courtside-culture.html#coaches',keywords:'head coach assistant coaches bench'},
  {title:'Court to Clipboard',type:'Courtside Culture',href:'/courtside-culture.html#court-to-clipboard',keywords:'former players coaches moved to bench'},
  {title:'Courtside Culture · Owners',type:'Courtside Culture',href:'/courtside-culture.html#owners',keywords:'owners investors leadership groups'},
  {title:'Celebrity Fans',type:'Courtside Culture',href:'/courtside-culture.html#celebrity-fans',keywords:'courtside famous fans'},
  {title:'Gameday Vibes',type:'Courtside Culture',href:'/courtside-culture.html#gameday-vibes',keywords:'traditions rituals arena energy music chants'},
  {title:'The Fits',type:'Courtside Culture',href:'/courtside-culture.html#the-fits',keywords:'fashion tunnel style signature shoes sneakers'},
  {title:'Class Is in Session',type:'Who Got Next?',href:'/class-is-in-session.html',keywords:'ncaaw college draft radar freshmen highlights'},
  {title:'The Call Up',type:'Who Got Next?',href:'/the-call-up.html',keywords:'upshot league development call ups'},
  {title:'Expansion Watch',type:'Who Got Next?',href:'/expansion-watch.html',keywords:'cleveland detroit philadelphia expansion draft future teams'},
  {title:'Atlanta Dream',type:'Team',href:'/team.html?team=atlanta-dream',keywords:'atlanta dream'},
  {title:'Chicago Sky',type:'Team',href:'/team.html?team=chicago-sky',keywords:'chicago sky'},
  {title:'Connecticut Sun',type:'Team',href:'/team.html?team=connecticut-sun',keywords:'connecticut sun uncasville'},
  {title:'Dallas Wings',type:'Team',href:'/team.html?team=dallas-wings',keywords:'dallas wings'},
  {title:'Golden State Valkyries',type:'Team',href:'/team.html?team=golden-state-valkyries',keywords:'golden state valkyries'},
  {title:'Indiana Fever',type:'Team',href:'/team.html?team=indiana-fever',keywords:'indiana fever'},
  {title:'Las Vegas Aces',type:'Team',href:'/team.html?team=las-vegas-aces',keywords:'las vegas aces'},
  {title:'Los Angeles Sparks',type:'Team',href:'/team.html?team=los-angeles-sparks',keywords:'los angeles sparks'},
  {title:'Minnesota Lynx',type:'Team',href:'/team.html?team=minnesota-lynx',keywords:'minnesota lynx'},
  {title:'New York Liberty',type:'Team',href:'/team.html?team=new-york-liberty',keywords:'new york liberty'},
  {title:'Phoenix Mercury',type:'Team',href:'/team.html?team=phoenix-mercury',keywords:'phoenix mercury'},
  {title:'Portland Fire',type:'Team',href:'/team.html?team=portland-fire',keywords:'portland fire'},
  {title:'Seattle Storm',type:'Team',href:'/team.html?team=seattle-storm',keywords:'seattle storm'},
  {title:'Toronto Tempo',type:'Team',href:'/team.html?team=toronto-tempo',keywords:'toronto tempo'},
  {title:'Washington Mystics',type:'Team',href:'/team.html?team=washington-mystics',keywords:'washington mystics'},
  {title:'Cleveland Sirens',type:'Expansion Team',href:'/cleveland-sirens.html',keywords:'cleveland sirens 2028'},
  {title:'Detroit Expansion',type:'Expansion Team',href:'/detroit-expansion.html',keywords:'detroit 2029 expansion'},
  {title:'Philadelphia Expansion',type:'Expansion Team',href:'/philadelphia-expansion.html',keywords:'philadelphia 2030 expansion'}
];

let globalSearchPlayers = null;
let globalSearchLoading = false;
function normalizeSearch(value=''){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function buildSearchDialog(){
  if(document.getElementById('globalSearchDialog'))return;
  const dialog=document.createElement('dialog');
  dialog.id='globalSearchDialog';
  dialog.className='global-search-dialog';
  dialog.innerHTML=`<div class="global-search-shell"><div class="global-search-head"><div><span>WE KNOW THE W</span><strong>Search the encyclopedia</strong></div><button type="button" id="globalSearchClose" aria-label="Close search">×</button></div><label class="global-search-field"><span>Search</span><input id="globalSearchInput" type="search" autocomplete="off" placeholder="Players, teams, awards, coaches, mascots…"></label><div id="globalSearchResults" class="global-search-results"><div class="global-search-empty">Type at least 2 letters to search the W.</div></div></div>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.querySelector('#globalSearchClose')?.addEventListener('click',()=>dialog.close());
  dialog.querySelector('#globalSearchInput')?.addEventListener('input',renderGlobalSearch);
}
async function loadSearchPlayers(){
  if(globalSearchPlayers||globalSearchLoading)return;
  globalSearchLoading=true;
  try{
    const response=await fetch('/api/players',{headers:{Accept:'application/json'}});
    const payload=await response.json().catch(()=>({}));
    if(response.ok&&Array.isArray(payload.players))globalSearchPlayers=payload.players.map(player=>({title:player.name,type:`Player · ${player.team||'WNBA'}`,href:`/playerpedia.html?search=${encodeURIComponent(player.name)}`,keywords:`${player.name} ${player.team||''} ${player.position||''}`}));
    else globalSearchPlayers=[];
  }catch{globalSearchPlayers=[];}
  globalSearchLoading=false;
  renderGlobalSearch();
}
function renderGlobalSearch(){
  const input=document.getElementById('globalSearchInput'),results=document.getElementById('globalSearchResults');
  if(!input||!results)return;
  const q=normalizeSearch(input.value);
  if(q.length<2){results.innerHTML='<div class="global-search-empty">Type at least 2 letters to search the W.</div>';return;}
  const terms=q.split(/\s+/).filter(Boolean);
  const all=[...searchStaticIndex,...(globalSearchPlayers||[])];
  const matches=all.filter(item=>{const hay=normalizeSearch(`${item.title} ${item.type} ${item.keywords||''}`);return terms.every(term=>hay.includes(term));}).slice(0,14);
  if(!matches.length){results.innerHTML=`<div class="global-search-empty">No match yet for “${input.value.replaceAll('<','&lt;').replaceAll('>','&gt;')}”.</div>`;return;}
  results.innerHTML=matches.map(item=>`<a class="global-search-result" href="${item.href}"><span>${item.type}</span><strong>${item.title}</strong><b>→</b></a>`).join('');
}
function openGlobalSearch(){
  buildSearchDialog();
  const dialog=document.getElementById('globalSearchDialog');
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  const input=document.getElementById('globalSearchInput');
  setTimeout(()=>input?.focus(),30);
  loadSearchPlayers();
}
document.getElementById('globalSearchButton')?.addEventListener('click',openGlobalSearch);
document.addEventListener('keydown',event=>{
  if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName||'')){event.preventDefault();openGlobalSearch();}
});