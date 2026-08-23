const UI_FIXES_HREF='/ui-fixes.css?v=20260822-mobile-nav-v1';
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
      <a href="/around-the-w.html"><strong>Franchise Hubs</strong></a>
      <a class="nav-nested" href="/around-the-w.html#team-pages">All Current Teams</a>
      <a class="nav-nested" href="/team.html?team=cleveland-sirens">Cleveland Sirens · 2028</a>
      <a href="/snack-shak.html"><strong>Seasoned Notes · Snack Shak</strong></a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/playerpedia.html">Playerpedia <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/playerpedia.html"><strong>Players A–Z</strong></a>
      <a href="/herstory.html"><strong>Herstory</strong></a>
      <a class="nav-nested" href="/herstory-education.html">Education</a>
      <a class="nav-nested" href="/herstory-entrepreneurship.html">Entrepreneurship</a>
      <a class="nav-nested" href="/herstory-community.html">Community</a>
      <a class="nav-nested" href="/herstory-life-chapters.html">Life Chapters</a>
      <a class="nav-nested" href="/herstory.html#profile-connection">Profile Connection</a>
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
      <a class="nav-nested" href="/trophy-case.html#championships">Championship Journey</a>
      <a class="nav-nested" href="/trophy-case.html#finals-mvp">Finals MVPs</a>
      <a class="nav-nested" href="/trophy-case.html#dynasties">Dynasties + Title Counts</a>
      <a href="/trophy-case.html#awards"><strong>And the W Goes To…</strong></a>
      <a class="nav-nested" href="/award-mvp.html">MVP</a>
      <a class="nav-nested" href="/award-dpoy.html">DPOY</a>
      <a class="nav-nested" href="/trophy-case.html#awards">All Award Pages</a>
      <a href="/locker-room.html"><strong>The Locker Room</strong></a>
      <a class="nav-nested" href="/old-uniforms.html">Old Uniforms</a>
      <a class="nav-nested" href="/final-buzzer.html">The Final Buzzer</a>
      <a class="nav-nested" href="/colors-symbols.html">Colors & Symbols</a>
      <a class="nav-nested" href="/franchise-changes.html">Franchise Changes</a>
      <a class="nav-nested" href="/franchise-family-tree.html">Franchise Family Tree</a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/courtside-culture.html">Courtside Culture <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/courtside-culture.html"><strong>Open Courtside Culture</strong></a>
      <a href="/mascots.html">Mascots</a>
      <a href="/coaches.html">Coaches</a>
      <a class="nav-nested" href="/coaches.html#court-to-clipboard">Court to Clipboard</a>
      <a href="/owners.html">Owners</a>
      <a href="/celebrity-fans.html">Celebrity Fans</a>
      <a href="/gameday-vibes.html">Gameday Vibes</a>
      <a href="/wnba-fits.html">The Fits</a>
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
function setMobileMenuState(open){
  navLinks?.classList.toggle('open',Boolean(open));
  menuButton?.setAttribute('aria-expanded',String(Boolean(open)));
  document.body.classList.toggle('mobile-nav-open',Boolean(open));
  if(!open)document.querySelectorAll('.nav-group.submenu-open').forEach(group=>group.classList.remove('submenu-open'));
}

menuButton?.addEventListener('click', event => {
  event.stopPropagation();
  setMobileMenuState(!navLinks?.classList.contains('open'));
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
  setMobileMenuState(false);
});

navLinks?.addEventListener('click',event=>{
  if(!isMobileNav()||event.target.closest('.nav-parent'))return;
  if(event.target.closest('a')||event.target.closest('button'))setMobileMenuState(false);
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&navLinks?.classList.contains('open')){
    setMobileMenuState(false);
    menuButton?.focus();
  }
});

mobileNav.addEventListener?.('change',event=>{if(!event.matches)setMobileMenuState(false);});

const hierarchyMap = {
  '/live-stats.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Live Stats' },
  '/games.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Games' },
  '/player-movement.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Player Movement' },
  '/availability-report.html': { parent: 'Live Stats', parentHref: '/live-stats.html', current: 'Availability Report' },
  '/around-the-w.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Team Pages' },
  '/snack-shak.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Seasoned Notes' },
  '/snack-shaq.html': { parent: 'Around the W', parentHref: '/around-the-w.html', current: 'Seasoned Notes' },
  '/herstory.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Herstory' },
  '/herstory-education.html': { parent: 'Herstory', parentHref: '/herstory.html', current: 'Education' },
  '/herstory-entrepreneurship.html': { parent: 'Herstory', parentHref: '/herstory.html', current: 'Entrepreneurship' },
  '/herstory-community.html': { parent: 'Herstory', parentHref: '/herstory.html', current: 'Community' },
  '/herstory-life-chapters.html': { parent: 'Herstory', parentHref: '/herstory.html', current: 'Life Chapters' },
  '/starting-five.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Shak’s Starting Five' },
  '/bench-mob.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Shak’s Bench Mob' },
  '/film-room.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Film Room' },
  '/basketball-dictionary.html': { parent: 'The Film Room', parentHref: '/film-room.html', current: 'Basketball Dictionary' },
  '/trophy-case.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Trophy Room' },
  '/award-mvp.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'MVP' },
  '/award-dpoy.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'DPOY' },
  '/award-mip.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'MIP' },
  '/award-sixth-player.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'Sixth Player' },
  '/award-roy.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'ROY' },
  '/award-coy.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'COY' },
  '/commissioners-cup.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'Commissioner’s Cup' },
  '/all-wnba.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'All WNBA' },
  '/all-defensive.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'All Defensive' },
  '/all-rookie.html': { parent: 'The Trophy Room', parentHref: '/trophy-case.html', current: 'All Rookie' },
  '/locker-room.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Locker Room' },
  '/old-uniforms.html': { parent: 'The Locker Room', parentHref: '/locker-room.html', current: 'Old Uniforms' },
  '/final-buzzer.html': { parent: 'The Locker Room', parentHref: '/locker-room.html', current: 'The Final Buzzer' },
  '/colors-symbols.html': { parent: 'The Locker Room', parentHref: '/locker-room.html', current: 'Colors & Symbols' },
  '/franchise-changes.html': { parent: 'The Locker Room', parentHref: '/locker-room.html', current: 'Franchise Changes' },
  '/franchise-family-tree.html': { parent: 'The Locker Room', parentHref: '/locker-room.html', current: 'Franchise Family Tree' },
  '/mascots.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'Mascots' },
  '/coaches.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'Coaches' },
  '/owners.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'Owners' },
  '/celebrity-fans.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'Celebrity Fans' },
  '/gameday-vibes.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'Gameday Vibes' },
  '/wnba-fits.html': { parent: 'Courtside Culture', parentHref: '/courtside-culture.html', current: 'The Fits' },
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
  {title:'Games',type:'Live Stats',href:'/games.html',keywords:'live current in progress scores clock quarter past upcoming schedule tip time broadcast venue'},
  {title:'Player Movement',type:'Live Stats',href:'/player-movement.html',keywords:'trades signings waives contracts transactions roster wire'},
  {title:'Availability Report',type:'Live Stats',href:'/availability-report.html',keywords:'injuries out day to day season ending return'},
  {title:'Team Pages',type:'Around the W',href:'/around-the-w.html',keywords:'franchises teams roster history'},
  {title:'Seasoned Notes · Snack Shak',type:'Around the W',href:'/snack-shak.html',keywords:'weekly blog power rankings monday spicy'},
  {title:'Playerpedia',type:'Section',href:'/playerpedia.html',keywords:'players roster bios stats photos'},
  {title:'Herstory · Education',type:'Playerpedia',href:'/herstory-education.html',keywords:'degrees college graduate academic learning'},
  {title:'Herstory · Entrepreneurship',type:'Playerpedia',href:'/herstory-entrepreneurship.html',keywords:'business brands investments ownership companies'},
  {title:'Herstory · Community',type:'Playerpedia',href:'/herstory-community.html',keywords:'foundation philanthropy advocacy giving back'},
  {title:'Herstory · Life Chapters',type:'Playerpedia',href:'/herstory-life-chapters.html',keywords:'family milestones personal life chapters'},
  {title:'Herstory · Profile Connection',type:'Playerpedia',href:'/herstory.html#profile-connection',keywords:'player profiles on court off court connected story'},
  {title:'Shak’s Starting Five',type:'Playerpedia',href:'/starting-five.html',keywords:'shak shakeema featured players weekly monday rotation'},
  {title:'Starting Five Rotation Archive',type:'Playerpedia',href:'/starting-five.html#rotation-archive',keywords:'past previous weekly lineups history archive'},
  {title:'Shak’s Bench Mob',type:'Playerpedia',href:'/bench-mob.html',keywords:'shak shakeema sixth woman microwave scorer 3 and d glue player backup floor general energy big weekly rotation'},
  {title:'Bench Mob Rotation Archive',type:'Playerpedia',href:'/bench-mob.html#rotation-archive',keywords:'past previous sixth woman weekly picks history archive'},
  {title:'The W Vault',type:'Section',href:'/w-vault.html',keywords:'history basketball strategy awards uniforms'},
  {title:'The Film Room · Positions',type:'W Vault',href:'/film-room.html#positions',keywords:'point guard shooting guard wing forward center roles'},
  {title:'The Film Room · Offense',type:'W Vault',href:'/film-room.html#offense',keywords:'pick and roll spacing motion offense transition'},
  {title:'The Film Room · Defense',type:'W Vault',href:'/film-room.html#defense',keywords:'drop switch zone help defense blitz'},
  {title:'The Film Room · Strategy',type:'W Vault',href:'/film-room.html#strategy',keywords:'tempo matchups scouting nickname team styles'},
  {title:'Watch Like a Coach',type:'W Vault',href:'/film-room.html#watch-like-a-coach',keywords:'screens substitutions possessions coverages coaching'},
  {title:'Basketball Dictionary',type:'W Vault',href:'/basketball-dictionary.html',keywords:'glossary ice hedge drop nail short roll spain ghost screen horns'},
  {title:'The Trophy Room · Championships',type:'W Vault',href:'/trophy-case.html#championships',keywords:'titles finals dynasties finals mvp champions'},
  {title:'And the W Goes To…',type:'W Vault',href:'/trophy-case.html#awards',keywords:'mvp dpoy mip sixth player rookie coach all wnba all defensive all rookie commissioners cup'},
  {title:'Most Valuable Player · MVP',type:'The Trophy Room',href:'/award-mvp.html',keywords:'mvp most valuable player aja wilson award history'},
  {title:'Defensive Player of the Year · DPOY',type:'The Trophy Room',href:'/award-dpoy.html',keywords:'dpoy defense defensive player award history'},
  {title:'Most Improved Player · MIP',type:'The Trophy Room',href:'/award-mip.html',keywords:'mip improved player veronica burton award history'},
  {title:'Sixth Player of the Year',type:'The Trophy Room',href:'/award-sixth-player.html',keywords:'sixth player reserve bench naz hillmon award history'},
  {title:'Rookie of the Year · ROY',type:'The Trophy Room',href:'/award-roy.html',keywords:'roy rookie paige bueckers award history'},
  {title:'Coach of the Year · COY',type:'The Trophy Room',href:'/award-coy.html',keywords:'coy coach natalie nakase award history'},
  {title:'Commissioner’s Cup',type:'The Trophy Room',href:'/commissioners-cup.html',keywords:'commissioners cup champion mvp breanna stewart new york liberty'},
  {title:'All WNBA Teams',type:'The Trophy Room',href:'/all-wnba.html',keywords:'all wnba first team second team selections'},
  {title:'All Defensive Teams',type:'The Trophy Room',href:'/all-defensive.html',keywords:'all defensive first team second team selections'},
  {title:'All Rookie Team',type:'The Trophy Room',href:'/all-rookie.html',keywords:'all rookie team selections first year players'},
  {title:'The Locker Room',type:'W Vault',href:'/locker-room.html',keywords:'uniforms retired numbers colors symbols rebrands relocations franchise family tree'},
  {title:'Old Uniforms',type:'The Locker Room',href:'/old-uniforms.html',keywords:'classic vintage jerseys uniform eras colors history'},
  {title:'The Final Buzzer',type:'The Locker Room',href:'/final-buzzer.html',keywords:'retired players final season retired numbers rafters legends'},
  {title:'Colors & Symbols',type:'The Locker Room',href:'/colors-symbols.html',keywords:'team colors logos marks icons visual identity palettes'},
  {title:'Franchise Changes',type:'The Locker Room',href:'/franchise-changes.html',keywords:'relocation rebrand expansion folded teams changes timeline'},
  {title:'Franchise Family Tree',type:'The Locker Room',href:'/franchise-family-tree.html',keywords:'lineage branches franchise history detroit tulsa dallas utah san antonio las vegas orlando connecticut'},
  {title:'Courtside Culture · Mascots',type:'Courtside Culture',href:'/mascots.html',keywords:'mascot bios personalities ellie violet freddy blaze skye'},
  {title:'Courtside Culture · Coaches',type:'Courtside Culture',href:'/coaches.html',keywords:'head coach assistant coaches bench'},
  {title:'Court to Clipboard',type:'Courtside Culture',href:'/coaches.html#court-to-clipboard',keywords:'former players coaches moved to bench'},
  {title:'Courtside Culture · Owners',type:'Courtside Culture',href:'/owners.html',keywords:'owners investors leadership groups'},
  {title:'Celebrity Fans',type:'Courtside Culture',href:'/celebrity-fans.html',keywords:'courtside famous fans queen latifah wanda sykes'},
  {title:'Gameday Vibes',type:'Courtside Culture',href:'/gameday-vibes.html',keywords:'traditions rituals arena energy music chants'},
  {title:'The Fits',type:'Courtside Culture',href:'/wnba-fits.html',keywords:'fashion tunnel style signature shoes sneakers gallery'},
  {title:'Class Is in Session',type:'Who Got Next?',href:'/class-is-in-session.html',keywords:'ncaaw college draft radar freshmen highlights'},
  {title:'The Call Up',type:'Who Got Next?',href:'/the-call-up.html',keywords:'upshot league development call ups'},
  {title:'Expansion Watch',type:'Who Got Next?',href:'/expansion-watch.html',keywords:'cleveland detroit philadelphia expansion draft future teams'},
  {title:'Atlanta Dream',type:'Team',href:'/team.html?team=atlanta-dream',keywords:'atlanta dream history roster players awards championships finals uniforms jerseys retired numbers coaches owners gateway center'},
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
  {title:'Cleveland Sirens',type:'Expansion Team',href:'/team.html?team=cleveland-sirens',keywords:'cleveland sirens 2028 franchise history roster uniforms leadership rocket arena expansion'},
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
