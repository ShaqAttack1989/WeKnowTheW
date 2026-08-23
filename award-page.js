(() => {
  const data = window.TROPHY_DATA;
  const key = document.body.dataset.awardKey;
  const award = data?.awardPages?.[key];
  if (!award) return;

  const headshots = {
    "A'ja Wilson":'1628932','Napheesa Collier':'1629483','Alyssa Thomas':'203826','Allisha Gray':'1628277','Kelsey Mitchell':'1628909',
    'Nneka Ogwumike':'203014','Jackie Young':'1629498','Sabrina Ionescu':'1629477','Aliyah Boston':'1641648','Paige Bueckers':'1642784',
    'Alanna Smith':'1629501','Gabby Williams':'1628931','Veronica Burton':'1631007','Rhyne Howard':'1631009','Ezi Magbegor':'1629496',
    'Breanna Stewart':'1627668','Sonia Citron':'1642785','Kiki Iriafen':'1642792','Janelle Salaün':'1642767','Dominique Malonga':'1642798',
    'Elena Delle Donne':'203399','Sylvia Fowles':'201480','Candace Parker':'201496','Natasha Howard':'203827','Alana Beard':'201499',
    'DiJonai Carrington':'1630096','Satou Sabally':'1630173','Brionna Jones':'1627669','Betnijah Laney':'203202','Leilani Mitchell':'201507',
    'Elizabeth Williams':'203458','Naz Hillmon':'1631044','Tiffany Hayes':'203432','Alysha Clark':'202252','Kelsey Plum':'1628276',
    'Dearica Hamby':'203752','Sugar Rodgers':'203526','Jantel Lavender':'202250','Caitlin Clark':'1642286','Michaela Onyenwere':'1630188',
    'Crystal Dangerfield':'1630176'
  };
  const headshot = name => `https://cdn.wnba.com/headshots/wnba/latest/1040x760/${headshots[name]}.png`;
  const safeAttr = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const initials = value => String(value || '').split(/\s+/).filter(Boolean).map(word => word[0]).join('').slice(0, 3).toUpperCase();
  const teamKey = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const teamLogoMap = new Map();
  const splitPair = value => String(value || '').split(' and ').map(item => item.trim()).filter(Boolean);
  function winnerInsets(person, team) {
    const people = splitPair(person).slice(0, 2);
    const teams = splitPair(team).slice(0, 2);
    return `<div class="award-history-insets" aria-hidden="true">
      <div class="award-person-insets">${people.map(name => headshots[name] ? `<span class="history-inset person"><img src="${headshot(name)}" alt="" loading="lazy" onerror="this.closest('span').classList.add('image-failed');this.remove()"><b>${initials(name)}</b></span>` : `<span class="history-inset person"><b>${initials(name)}</b></span>`).join('')}</div>
      <div class="award-team-insets">${teams.map(name => `<span class="history-inset team" data-team-logo="${safeAttr(name)}"><b>${initials(name)}</b></span>`).join('')}</div>
    </div>`;
  }
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
    } catch { /* Initials remain visible if team artwork is unavailable. */ }
  }
  const currentImages = award.current.photos || [award.current.photo || award.current.image];

  const hero = document.getElementById('awardHero');
  if (hero) hero.innerHTML = `
    <div class="award-hero-copy">
      <p class="eyebrow">AND THE W GOES TO… · ${award.eyebrow}</p>
      <h1>${award.title}</h1>
      <p>${award.description}</p>
      <div class="page-crumbs"><a href="/">Home</a><span>›</span><a href="/trophy-case.html">The Trophy Room</a><span>›</span><b>${award.short}</b></div>
    </div>
    <figure class="award-winner-visual${currentImages.length > 1 ? ' multi' : ''}">
      ${currentImages.map((src,index) => `<img src="${src}" alt="${index ? '' : award.current.name}">`).join('')}
      <figcaption class="award-winner-caption"><span>${award.current.year} · ${award.current.stat.toUpperCase()}</span><strong>${award.current.name}</strong><small>${award.current.team}</small></figcaption>
    </figure>`;

  const currentNote = document.getElementById('awardCurrentNote');
  if (currentNote) currentNote.textContent = award.current.note;

  const recordGrid = document.getElementById('awardRecordGrid');
  if (recordGrid) recordGrid.innerHTML = award.records.map(([value,name,note]) => `
    <article class="award-record-card"><b>${value}</b><strong>${name}</strong><span>${note}</span></article>`).join('');

  const historyTitle = document.getElementById('awardHistoryTitle');
  const historyLead = document.getElementById('awardHistoryLead');
  const history = document.getElementById('awardHistory');
  if (award.history) {
    historyTitle.textContent = 'Recent winners';
    historyLead.textContent = 'The last ten completed seasons show how the honor has moved across players, teams and eras.';
    history.className = 'award-history-list';
    history.innerHTML = award.history.map(([year,name,team]) => `<article class="award-history-row">${winnerInsets(name,team)}<b>${year}</b><strong>${name}</strong><span>${team}</span></article>`).join('');
  } else if (award.cupHistory) {
    historyTitle.textContent = 'Every Cup champion';
    historyLead.textContent = 'The complete Commissioner’s Cup championship history, including the score and Cup MVP.';
    history.className = 'award-history-list';
    history.innerHTML = award.cupHistory.map(([year,winner,opponent,score,mvp]) => `<article class="award-history-row">${winnerInsets(mvp,winner)}<b>${year}</b><strong>${winner}<small> over ${opponent}, ${score}</small></strong><span>${mvp} · Cup MVP</span></article>`).join('');
  } else if (award.teams) {
    historyTitle.textContent = `${award.current.year} selections`;
    historyLead.textContent = 'Meet the full group selected for the most recent completed season.';
    history.className = 'award-team-blocks';
    const groups = [['first','First Team'],['second','Second Team']].filter(([group]) => award.teams[group]);
    history.innerHTML = groups.map(([group,label]) => `<article class="award-team-block"><h3>${label}</h3><div class="award-player-list">${award.teams[group].map(name => `<div class="award-player"><img src="${headshot(name)}" alt="${name}" loading="lazy"><strong>${name}</strong></div>`).join('')}</div></article>`).join('');
  }

  const sources = document.getElementById('awardSources');
  if (sources) sources.innerHTML = `<a href="${award.source}" target="_blank" rel="noopener">Official award history ↗</a><a href="${award.currentSource}" target="_blank" rel="noopener">Latest official record ↗</a>`;

  const siblingNav = document.getElementById('awardSiblingNav');
  if (siblingNav) siblingNav.innerHTML = `<a class="parent" href="/trophy-case.html">← The Trophy Room</a>` + data.awardOrder.map(itemKey => {
    const item = data.awardPages[itemKey];
    return `<a href="/${item.slug}"${itemKey === key ? ' aria-current="page"' : ''}>${item.short}</a>`;
  }).join('');

  loadTeamLogos();
})();
