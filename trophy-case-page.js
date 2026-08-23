(() => {
  const data = window.TROPHY_DATA;
  if (!data) return;

  const safeAttr = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const initials = value => String(value || '').split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 3).toUpperCase();
  const teamLogoMap = new Map();
  const teamKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  function hydrateTeamLogos(root = document) {
    root.querySelectorAll('[data-team-logo]').forEach(slot => {
      const source = teamLogoMap.get(teamKey(slot.dataset.teamLogo));
      if (!source || slot.querySelector('img')) return;
      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => image.remove());
      slot.appendChild(image);
    });
  }
  async function loadTeamLogos() {
    try {
      const response = await fetch('/api/teams?trophyRoom=20260823-v1', {headers:{Accept:'application/json'}});
      const payload = await response.json();
      (payload.teams || []).forEach(team => teamLogoMap.set(teamKey(team.name), team.badge || team.logo));
      hydrateTeamLogos();
    } catch { /* Team initials remain as the accessible fallback. */ }
  }

  const championTimeline = document.getElementById('championTimeline');
  const seasonRow = (season, index) => `
    <article class="champion-season${index === 0 ? ' is-featured' : ''}">
      <div class="champion-year">${season.year}</div>
      <div class="winner-insets">
        <span class="winner-inset player-inset">${data.finalsMvpPhotos[season.finalsMvp] ? `<img src="${data.finalsMvpPhotos[season.finalsMvp]}" alt="${safeAttr(season.finalsMvp)}" loading="lazy">` : `<b>${initials(season.finalsMvp)}</b>`}</span>
        <span class="winner-inset team-inset" data-team-logo="${safeAttr(season.champion)}"><b>${initials(season.champion)}</b></span>
      </div>
      <div class="champion-name"><strong>${season.champion}</strong><span>Champion · defeated ${season.runnerUp}</span></div>
      <div class="champion-mvp"><strong>${season.finalsMvp}</strong><span>Finals MVP</span></div>
      <div class="champion-result">${season.result}</div>
    </article>`;

  if (championTimeline) {
    const initialCount = 10;
    championTimeline.innerHTML = data.champions.slice(0, initialCount).map(seasonRow).join('') +
      `<button class="champion-more" type="button" aria-expanded="false">Show every champion, 1997 to 2025</button>`;
    championTimeline.querySelector('.champion-more')?.addEventListener('click', event => {
      championTimeline.innerHTML = data.champions.map(seasonRow).join('');
      hydrateTeamLogos(championTimeline);
      event.currentTarget?.setAttribute('aria-expanded', 'true');
    });
  }

  const finalsByPlayer = new Map();
  data.champions.forEach(season => {
    const existing = finalsByPlayer.get(season.finalsMvp) || {name:season.finalsMvp,years:[],teams:[]};
    existing.years.push(season.year);
    if (!existing.teams.includes(season.champion)) existing.teams.push(season.champion);
    finalsByPlayer.set(season.finalsMvp, existing);
  });
  const finalsLegends = [...finalsByPlayer.values()];
  const finalsMvpGrid = document.getElementById('finalsMvpGrid');
  if (finalsMvpGrid) finalsMvpGrid.innerHTML = finalsLegends.map(player => `
    <article class="finals-mvp-card">
      <img src="${data.finalsMvpPhotos[player.name]}" alt="${player.name}" loading="lazy">
      <div class="finals-mvp-copy"><span>${player.years.join(' + ')} FINALS MVP</span><strong>${player.name}</strong><small>${player.teams.join(' · ')}</small></div>
    </article>`).join('');

  const dynastyGrid = document.getElementById('dynastyGrid');
  if (dynastyGrid) dynastyGrid.innerHTML = data.dynasties.map((item, index) => `
    <article class="dynasty-card" style="--dynasty-tone:${item.tone}" data-count="${index + 1}">
      <span>${item.years.toUpperCase()}</span><h3>${item.team}</h3><b>${item.titles}</b><p>${item.note}</p>
    </article>`).join('');

  const countGrid = document.getElementById('franchiseCountGrid');
  if (countGrid) countGrid.innerHTML = data.franchiseCounts.map(item => `
    <article class="franchise-count-card">
      <div class="count">${item.count}</div>
      <div><strong>${item.name}</strong><span>${item.years}</span><small>${item.status}</small></div>
    </article>`).join('');

  const mediaMarkup = current => {
    const images = current.photos || [current.photo || current.image];
    return `<div class="award-placard-media${images.length > 1 ? ' multi' : ''}">${images.slice(0, 2).map((src, index) => `<img src="${src}" alt="${index ? '' : current.name}" loading="lazy">`).join('')}</div>`;
  };

  const directory = document.getElementById('awardDirectory');
  if (directory) directory.innerHTML = data.awardOrder.map(key => {
    const award = data.awardPages[key];
    return `<a class="award-placard" href="/${award.slug}">
      ${mediaMarkup(award.current)}
      <div><span class="portal-label">${award.eyebrow}</span><strong>${award.title}</strong><p>${award.description}</p></div>
      <span class="award-placard-arrow" aria-hidden="true">→</span>
    </a>`;
  }).join('');

  loadTeamLogos();
})();
