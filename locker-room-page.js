function lockerEsc(value=''){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function lockerTeam(slug){return typeof teamBySlug==='function'?teamBySlug(slug):null;}
function lockerPoster(slug){return slug==='cleveland-sirens'?'/assets/team-posters/cleveland-sirens.svg':`/assets/team-posters/${slug}.webp`;}
function lockerRoute(slug,label='Open team page'){const team=lockerTeam(slug);return `<a class="team-route" href="/team.html?team=${lockerEsc(slug)}">${lockerEsc(label==='Open team page'&&team?`Explore ${team.name}`:label)} →</a>`;}
function swatches(colors=[]){return `<div class="swatches" aria-label="Team color palette">${colors.map(color=>`<i style="background:${lockerEsc(color)}" title="${lockerEsc(color)}"></i>`).join('')}</div>`;}
function sourceRow(){return `<div class="source-row">${LOCKER_SOURCES.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${lockerEsc(label)} ↗</a>`).join('')}</div>`;}

function renderLockerParent(){
  const host=document.getElementById('lockerDoors'); if(!host)return;
  host.innerHTML=LOCKER_SECTIONS.map(item=>`<a class="locker-door" style="--door-accent:${item.accent}" href="${item.href}"><img src="${item.image}" alt="" loading="${item.key==='uniforms'?'eager':'lazy'}" onerror="this.remove()"><div class="locker-door-copy"><span>${item.label}</span><h3>${item.title}</h3><p>${item.copy}</p><b>Enter the exhibit →</b></div></a>`).join('');
}

function renderUniforms(){
  const host=document.getElementById('uniformGrid'); if(!host)return;
  host.innerHTML=OLD_UNIFORM_ERAS.map(item=>{const archive=JERSEY_ARCHIVE_BY_TEAM[item.slug];return `<article class="uniform-card"><div class="uniform-visual"><img class="poster" src="${lockerPoster(item.slug)}" alt="${lockerEsc(item.team)} team artwork" loading="lazy"><span class="jersey-mark" style="--jersey:${item.colors[0]}">${lockerEsc(lockerTeam(item.slug)?.tag||'W')}</span></div><div class="uniform-copy"><small>${lockerEsc(item.years)} · ${lockerEsc(item.team)}</small><h3>${lockerEsc(item.era)}</h3>${swatches(item.colors)}<p>${lockerEsc(item.story)}</p>${archive?`<div class="archive-look-list" aria-label="Documented jersey editions">${archive.looks.map(look=>`<span>${lockerEsc(look)}</span>`).join('')}</div><a class="archive-source-link" href="${archive.url}" target="_blank" rel="noopener">Jersey records and images ↗</a>`:''}${lockerRoute(item.slug)}</div></article>`}).join('');
}

function renderJerseyLanguage(){
  const host=document.getElementById('jerseyLanguage'); if(!host)return;
  host.innerHTML=JERSEY_LANGUAGE.map(item=>`<article class="jersey-language-card"><span>${lockerEsc(item.years)}</span><h3>${lockerEsc(item.title)}</h3><p>${lockerEsc(item.copy)}</p></article>`).join('');
}

function renderArchivePicks(){
  const host=document.getElementById('archivePicks'); if(!host)return;
  host.innerHTML=ARCHIVE_FAN_PICKS.map(item=>`<a class="archive-pick" href="${item.url}" target="_blank" rel="noopener" style="--pick:${item.color}"><span class="archive-rank">${item.rank}</span><span class="mini-jersey" aria-hidden="true">${lockerEsc(lockerTeam(item.slug)?.tag||'W')}</span><span><small>${lockerEsc(item.team)}</small><strong>${lockerEsc(item.name)}</strong></span><b>${lockerEsc(item.rating)}<small>${lockerEsc(item.votes)}</small></b></a>`).join('');
}

function renderAllStarUniforms(){
  const host=document.getElementById('allStarUniformGrid'); if(!host)return;
  host.innerHTML=ALL_STAR_UNIFORM_ERAS.map(item=>`<article class="allstar-uniform-card"><img src="${item.image}" alt="${lockerEsc(item.year)} WNBA All Star uniforms" loading="lazy" referrerpolicy="no-referrer"><div><span>${lockerEsc(item.year)}</span><h3>${lockerEsc(item.title)}</h3><p>${lockerEsc(item.copy)}</p><small>Photo: ${lockerEsc(item.credit)} · Source: ESPN</small></div></article>`).join('');
}

function renderIdentities(){
  const host=document.getElementById('identityGrid'); if(!host)return;
  host.innerHTML=IDENTITY_GUIDE.map(item=>{const team=lockerTeam(item.slug);return `<article class="identity-card"><div class="identity-poster"><img src="${lockerPoster(item.slug)}" alt="${lockerEsc(team?.name||item.slug)} team artwork" loading="lazy">${swatches(item.colors)}</div><div class="identity-copy"><small>${lockerEsc(team?.city||'Franchise identity')}</small><h3>${lockerEsc(team?.name||item.slug)}</h3><p><strong>${lockerEsc(item.symbol)}.</strong> ${lockerEsc(item.meaning)}</p>${lockerRoute(item.slug)}</div></article>`}).join('');
}

function changeRoutes(item){
  const slugs=item.slugs||[item.slug].filter(Boolean); if(!slugs.length)return '';
  return `<div class="change-routes">${slugs.map(slug=>`<a href="/team.html?team=${slug}">${lockerEsc(lockerTeam(slug)?.name||slug)} →</a>`).join('')}</div>`;
}
function renderChanges(){
  const host=document.getElementById('changeTimeline'); if(!host)return;
  host.innerHTML=FRANCHISE_CHANGES.map(item=>`<article class="change-card" style="--change:${item.tone}"><div class="change-year">${lockerEsc(item.year)}</div><div class="change-copy"><small>${lockerEsc(item.kind)}</small><h3>${lockerEsc(item.title)}</h3><p>${lockerEsc(item.copy)}</p></div>${changeRoutes(item)}</article>`).join('');
}

function renderTree(){
  const continuing=document.getElementById('continuingBranches');
  if(continuing)continuing.innerHTML=CONTINUING_BRANCHES.map(branch=>`<article class="tree-card"><h3>${lockerEsc(branch.title)}</h3><p>${lockerEsc(branch.championships)}</p><ol class="branch-line">${branch.stops.map(([years,name])=>`<li><span>${lockerEsc(years)}</span><strong>${lockerEsc(name)}</strong></li>`).join('')}</ol>${lockerRoute(branch.slug,'Follow the current franchise')}</article>`).join('');
  const rooted=document.getElementById('rootedBranches');
  if(rooted)rooted.innerHTML=ROOTED_BRANCHES.map(([label,names,slugs])=>`<article class="rooted-card"><small>${lockerEsc(label)}</small><strong>${lockerEsc(names)}</strong><div class="mini-routes">${slugs.map(slug=>`<a href="/team.html?team=${slug}">${lockerEsc(lockerTeam(slug)?.name||slug)}</a>`).join('')}</div></article>`).join('');
  const closed=document.getElementById('closedBranches');
  if(closed)closed.innerHTML=CLOSED_BRANCHES.map(item=>`<article class="closed-card ${item.photo?'has-photo':''}"><small>${lockerEsc(item.years)}</small><h3>${lockerEsc(item.team)}</h3><p>${lockerEsc(item.note)}</p>${item.route?`<a class="team-route" href="${item.route}">${lockerEsc(item.routeLabel)} →</a>`:''}${item.photo?`<img src="${item.photo}" alt="" loading="lazy" onerror="this.remove()">`:''}</article>`).join('');
}

document.querySelectorAll('[data-locker-updated]').forEach(el=>el.textContent=LOCKER_UPDATED);
renderLockerParent();
renderUniforms();
renderJerseyLanguage();
renderArchivePicks();
renderAllStarUniforms();
renderIdentities();
renderChanges();
renderTree();
document.querySelectorAll('[data-locker-sources]').forEach(el=>el.innerHTML=sourceRow());
if(!document.querySelector('script[data-legacy-team-assets]')){const legacy=document.createElement('script');legacy.src='/legacy-team-assets.js?v=20260823-v1';legacy.dataset.legacyTeamAssets='true';document.body.appendChild(legacy);}
