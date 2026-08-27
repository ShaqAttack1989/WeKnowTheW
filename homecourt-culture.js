(function(){
  const data=window.TEAM_CULTURE_IDENTITIES||{};
  const esc=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function arenaMarkup(item){
    const alias=item.arenaAlias?`<p class="arena-alias"><span>AKA</span><strong>${esc(item.arenaAlias)}</strong></p>`:'';
    const note=item.arenaNote?`<p class="arena-note">${esc(item.arenaNote)}</p>`:'';
    return `<article class="team-culture-placecard arena" style="--team:${esc(item.primary)};--team2:${esc(item.secondary)}"><span class="panel-label">HOME COURT</span><h3>${esc(item.arena)}</h3>${alias}${note}<div class="identity-meta"><span>${esc(item.team)}</span><span>Arena identity</span></div><a href="/courtside-culture.html#home-court-roll-call">Courtside Culture →</a></article>`;
  }

  function renderTeamArena(){
    if(location.pathname!=='/team.html')return;
    const slug=new URLSearchParams(location.search).get('team')||'';
    const item=data[slug];
    if(!item)return;
    const inject=()=>{
      const host=document.getElementById('teamCulturePlacecards');
      if(!host||host.querySelector('.team-culture-placecard.arena'))return false;
      host.insertAdjacentHTML('beforeend',arenaMarkup(item));
      return true;
    };
    if(!inject()){
      const observer=new MutationObserver(()=>{if(inject())observer.disconnect();});
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  function loadTeamAvailability(){
    if(location.pathname!=='/team.html'||!document.getElementById('dreamTeamUpdates'))return;
    if(document.querySelector('script[src*="team-availability.js"]'))return;
    const script=document.createElement('script');
    script.src='/team-availability.js?v=20260826-live-v2';
    script.dataset.teamAvailability='true';
    document.body.appendChild(script);
  }

  function rollCallCard(slug,item){
    const alias=item.arenaAlias?`<div class="homecourt-fact"><span>AKA</span><strong>${esc(item.arenaAlias)}</strong></div>`:'';
    const note=item.arenaNote?`<div class="homecourt-note">${esc(item.arenaNote)}</div>`:'';
    return `<article class="homecourt-card" style="--team:${esc(item.primary)};--team2:${esc(item.secondary)}"><div class="homecourt-card-media"><img src="${esc(item.poster)}" alt="${esc(item.team)} franchise artwork" loading="lazy" decoding="async"></div><div class="homecourt-card-body"><span class="homecourt-team-label">${esc(item.team)}</span><h3>${esc(item.fanbase)}</h3><div class="homecourt-fact"><span>Fan base</span><strong>${esc(item.fanbase)}</strong></div><div class="homecourt-fact"><span>Arena</span><strong>${esc(item.arena)}</strong></div>${alias}${note}<a href="/team.html?team=${encodeURIComponent(slug)}">Open team hub →</a></div></article>`;
  }

  function renderHub(){
    const grid=document.getElementById('homeCourtGrid');
    if(!grid)return;
    grid.innerHTML=Object.entries(data).map(([slug,item])=>rollCallCard(slug,item)).join('');
  }

  renderTeamArena();
  loadTeamAvailability();
  renderHub();
})();
