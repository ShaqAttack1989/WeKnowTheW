const navLinks = document.getElementById('navLinks');
const menuButton = document.getElementById('menuButton');

const structuredNav = `
  <a class="nav-direct" href="/#live">Live Stats</a>
  <div class="nav-group">
    <a class="nav-parent" href="/playerpedia.html">Playerpedia <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/herstory.html">Herstory</a>
      <a href="/starting-five.html">The Starting Five</a>
      <a href="/bench-mob.html">The Bench Mob</a>
    </div>
  </div>
  <div class="nav-group">
    <a class="nav-parent" href="/w-vault.html">The W Vault <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/film-room.html">The Film Room</a>
      <a href="/around-the-w.html">Around the W</a>
      <a href="/trophy-case.html">The Trophy Case</a>
      <a href="/locker-room.html">The Locker Room</a>
    </div>
  </div>
  <a class="nav-direct" href="/courtside-culture.html">Courtside Culture</a>
  <div class="nav-group">
    <a class="nav-parent" href="/who-got-next.html">Who Got Next? <span aria-hidden="true">▾</span></a>
    <div class="nav-submenu">
      <a href="/who-got-next.html#class-is-in-session">Class Is in Session</a>
      <a href="/expansion-watch.html">Expansion Watch</a>
    </div>
  </div>
  <a class="nav-direct" href="/snack-shaq.html">Snack Shaq</a>
`;

if (navLinks) navLinks.innerHTML = structuredNav;

menuButton?.addEventListener('click', () => {
  const open = navLinks?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(open)));
});

document.querySelectorAll('.nav-group').forEach(group => {
  const parent = group.querySelector('.nav-parent');
  parent?.addEventListener('click', event => {
    if (window.matchMedia('(max-width: 900px)').matches && !group.classList.contains('submenu-open')) {
      event.preventDefault();
      document.querySelectorAll('.nav-group.submenu-open').forEach(other => {
        if (other !== group) other.classList.remove('submenu-open');
      });
      group.classList.add('submenu-open');
    }
  });
});

const hierarchyMap = {
  '/herstory.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'Herstory' },
  '/starting-five.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'The Starting Five' },
  '/bench-mob.html': { parent: 'Playerpedia', parentHref: '/playerpedia.html', current: 'The Bench Mob' },
  '/film-room.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Film Room' },
  '/around-the-w.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'Around the W' },
  '/trophy-case.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Trophy Case' },
  '/locker-room.html': { parent: 'The W Vault', parentHref: '/w-vault.html', current: 'The Locker Room' },
  '/expansion-watch.html': { parent: 'Who Got Next?', parentHref: '/who-got-next.html', current: 'Expansion Watch' }
};

const pageHierarchy = hierarchyMap[location.pathname];
const crumbs = document.querySelector('.page-crumbs');
if (crumbs && pageHierarchy) {
  crumbs.innerHTML = `<a href="/">Home</a><span>›</span><a href="${pageHierarchy.parentHref}">${pageHierarchy.parent}</a><span>›</span><b>${pageHierarchy.current}</b>`;
}

document.querySelectorAll('[data-current-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});
