(()=>{
  function patchNav(){
    const nav=document.getElementById('navLinks');
    if(!nav||nav.dataset.snackShakPatched==='true')return;

    const groups=[...nav.querySelectorAll('.nav-group')];
    const around=groups.find(group=>group.querySelector('.nav-parent')?.getAttribute('href')==='/around-the-w.html');
    if(around){
      around.querySelectorAll('.nav-accordion-item').forEach(item=>{
        const label=item.querySelector('.nav-accordion-trigger span')?.textContent?.trim().toLowerCase()||'';
        if(label.includes('features')||label.includes('analysis'))item.remove();
      });
      around.querySelectorAll('.nav-direct-link').forEach(link=>{
        const text=link.textContent.toLowerCase();
        if(link.getAttribute('href')==='/snack-shak.html'||text.includes('snack shak')||text.includes('seasoned notes'))link.remove();
      });
    }

    if(!nav.querySelector('.nav-parent[href="/snack-shak.html"]')){
      const playerpedia=groups.find(group=>group.querySelector('.nav-parent')?.getAttribute('href')==='/playerpedia.html');
      const group=document.createElement('div');
      group.className='nav-group';
      group.innerHTML=`<a class="nav-parent" href="/snack-shak.html">Snack Shak <span aria-hidden="true">▾</span></a><div class="nav-submenu snack-shak-menu"><a class="nav-direct-link" href="/snack-shak.html"><strong>Open Snack Shak</strong></a><a class="nav-direct-link" href="/snack-shak.html#food-for-thought">Food for Thought + Analysis</a><a class="nav-direct-link" href="/lynx-playoff-blueprint-update.html">So, About That Lynx Blueprint...</a><a class="nav-direct-link" href="/unrivaled-650-million.html">$650 Million. Now What?</a><a class="nav-direct-link" href="/tina-charles-sun-legend.html">No. 31 Rises at Home</a><a class="nav-direct-link" href="/legendary-wnba-duos.html">Legendary WNBA Duos</a><a class="nav-direct-link" href="/dewanna-bonner-buyout.html">One More Run</a></div>`;
      if(playerpedia)nav.insertBefore(group,playerpedia);else nav.appendChild(group);

      const parent=group.querySelector('.nav-parent');
      parent?.addEventListener('click',event=>{
        if(!window.matchMedia('(max-width:1100px)').matches)return;
        event.preventDefault();event.stopPropagation();
        const open=group.classList.contains('submenu-open');
        nav.querySelectorAll('.nav-group.submenu-open').forEach(other=>{if(other!==group)other.classList.remove('submenu-open');});
        group.classList.toggle('submenu-open',!open);
      });
    }
    nav.dataset.snackShakPatched='true';
  }

  function patchHomeCards(){
    const familyGrid=document.querySelector('.family-grid');
    if(!familyGrid||familyGrid.dataset.snackShakPatched==='true')return;
    const heading=familyGrid.closest('section')?.querySelector('.page-heading h2');
    if(heading)heading.textContent='Seven doors. Everything has a home.';

    const around=[...familyGrid.querySelectorAll('.family-card')].find(card=>card.querySelector('h3')?.textContent.trim()==='Around the W');
    if(around){
      around.querySelectorAll('.family-links a').forEach(link=>{
        if(link.getAttribute('href')==='/snack-shak.html')link.remove();
      });
    }

    if(![...familyGrid.querySelectorAll('.family-card h3')].some(h=>h.textContent.trim()==='Snack Shak')){
      const card=document.createElement('article');
      card.className='family-card';
      card.innerHTML=`<p class="kicker">COMMENTARY + ANALYSIS</p><h3>Snack Shak</h3><p>Food for Thought, playoff film, long-form analysis, weekly rankings, debates and the stories that need more room than a scoreboard.</p><div class="family-links"><a href="/snack-shak.html"><span>Open Snack Shak</span><span>→</span></a><a href="/snack-shak.html#food-for-thought"><span>Food for Thought + Analysis</span><span>→</span></a><a href="/lynx-playoff-blueprint-update.html"><span>Latest: Lynx Playoff Blueprint</span><span>🌶️</span></a></div>`;
      if(around?.nextSibling)familyGrid.insertBefore(card,around.nextSibling);else familyGrid.appendChild(card);
    }
    familyGrid.dataset.snackShakPatched='true';
  }

  const run=()=>{patchNav();patchHomeCards();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  setTimeout(run,150);
  setTimeout(run,600);
})();
