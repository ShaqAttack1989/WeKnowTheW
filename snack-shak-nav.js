(()=>{
  const snackLinks=`<a class="nav-direct-link" href="/snack-shak.html"><strong>Open Snack Shak</strong></a><a class="nav-direct-link" href="/snack-shak-bytes.html">Snack Shak Bytes</a><a class="nav-direct-link" href="/food-for-thought.html">Food for Thought</a>`;

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

  const run=()=>{normalizeNav();normalizeHomeCard();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  setTimeout(run,150);
})();
