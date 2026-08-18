const currentTeamDirectory = [
  { name: 'Atlanta Dream', city: 'Atlanta', tag: 'ATL' },
  { name: 'Chicago Sky', city: 'Chicago', tag: 'CHI' },
  { name: 'Connecticut Sun', city: 'Connecticut', tag: 'CON' },
  { name: 'Dallas Wings', city: 'Dallas', tag: 'DAL' },
  { name: 'Golden State Valkyries', city: 'Golden State', tag: 'GSV', note: 'Joined in 2025' },
  { name: 'Indiana Fever', city: 'Indiana', tag: 'IND' },
  { name: 'Las Vegas Aces', city: 'Las Vegas', tag: 'LVA' },
  { name: 'Los Angeles Sparks', city: 'Los Angeles', tag: 'LAS' },
  { name: 'Minnesota Lynx', city: 'Minnesota', tag: 'MIN' },
  { name: 'New York Liberty', city: 'New York', tag: 'NYL' },
  { name: 'Phoenix Mercury', city: 'Phoenix', tag: 'PHX' },
  { name: 'Portland Fire', city: 'Portland', tag: 'POR', note: 'Debut season: 2026' },
  { name: 'Seattle Storm', city: 'Seattle', tag: 'SEA' },
  { name: 'Toronto Tempo', city: 'Toronto', tag: 'TOR', note: 'Debut season: 2026' },
  { name: 'Washington Mystics', city: 'Washington', tag: 'WAS' }
];

function sectionSafe(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeTeamName(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const teamGrid = document.getElementById('aroundWGrid');
const teamModal = document.getElementById('teamModal');
const teamModalBody = document.getElementById('teamModalBody');
const teamModalClose = document.getElementById('teamModalClose');
let currentStandings = [];

function recordForTeam(name) {
  const target = normalizeTeamName(name);
  return currentStandings.find(item => normalizeTeamName(item.team?.full_name || '') === target) || null;
}

function teamCardMarkup(team) {
  const record = recordForTeam(team.name);
  const recordText = record ? `${record.wins}-${record.losses}` : '2026';
  const pct = record && Number.isFinite(Number(record.win_percentage))
    ? Number(record.win_percentage).toFixed(3)
    : 'Season';

  return `
    <button class="team-page-card" type="button" data-team-name="${sectionSafe(team.name)}">
      <span class="team-page-tag">${sectionSafe(team.tag)}</span>
      <span class="team-page-copy">
        <strong>${sectionSafe(team.name)}</strong>
        <span>${sectionSafe(team.note || 'Current franchise')}</span>
      </span>
      <span class="team-page-record">
        <strong>${recordText}</strong>
        <span>${pct}</span>
      </span>
    </button>
  `;
}

function renderTeamDirectory() {
  if (!teamGrid) return;
  teamGrid.innerHTML = currentTeamDirectory.map(teamCardMarkup).join('');
}

async function loadAroundTheW() {
  renderTeamDirectory();
  try {
    const response = await fetch('/api/stats?season=2026', { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(payload.standings)) {
      currentStandings = payload.standings;
      renderTeamDirectory();
    }
  } catch {
    // The directory remains useful even if live records are temporarily unavailable.
  }
}

teamGrid?.addEventListener('click', event => {
  const card = event.target.closest('[data-team-name]');
  if (!card) return;
  const team = currentTeamDirectory.find(item => item.name === card.dataset.teamName);
  if (!team) return;
  const record = recordForTeam(team.name);
  const recordLine = record
    ? `${record.wins} wins · ${record.losses} losses · ${Number(record.win_percentage).toFixed(3)} win percentage`
    : 'Live record is temporarily unavailable.';

  teamModalBody.innerHTML = `
    <div class="team-profile-hero">
      <span class="team-profile-mark">${sectionSafe(team.tag)}</span>
      <div>
        <p class="kicker">AROUND THE W</p>
        <h3 id="teamModalTitle">${sectionSafe(team.name)}</h3>
        <p>${sectionSafe(team.note || 'Current W team')}</p>
      </div>
    </div>
    <div class="team-profile-stat"><span>2026 record</span><strong>${sectionSafe(recordLine)}</strong></div>
    <div class="team-profile-links">
      <a href="#players" data-team-player-link="${sectionSafe(team.name)}">See current players in Playerpedia</a>
      <a href="#vault">Franchise history belongs in The W Vault</a>
      <a href="#locker-room">Uniforms + retired numbers in The Locker Room</a>
      <a href="#courtside-characters">Mascot bio in Courtside Characters</a>
    </div>
    <div class="team-profile-coming">
      <strong>Team page blueprint</strong>
      <p>City story, franchise family tree, current coach, current roster, titles, retired numbers, mascot, signature stars, 2026 record and season notes.</p>
    </div>
  `;
  teamModal.showModal();
});

teamModalClose?.addEventListener('click', () => teamModal.close());
teamModal?.addEventListener('click', event => {
  if (event.target === teamModal) teamModal.close();
});

teamModalBody?.addEventListener('click', event => {
  const link = event.target.closest('[data-team-player-link]');
  if (!link) return;
  const teamName = link.dataset.teamPlayerLink;
  const teamSelect = document.getElementById('playerTeamFilter');
  if (teamSelect) {
    const option = [...teamSelect.options].find(item => item.textContent.trim() === teamName);
    if (option) {
      teamSelect.value = option.value;
      teamSelect.dispatchEvent(new Event('change'));
    }
  }
  teamModal.close();
});

// Featured-player cards jump directly into Playerpedia search.
document.querySelectorAll('[data-feature-player]').forEach(card => {
  card.addEventListener('click', () => {
    const search = document.getElementById('playerSearch');
    if (search) {
      search.value = card.dataset.featurePlayer || '';
      search.dispatchEvent(new Event('input'));
    }
    document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' });
  });
});

function collegeGameMarkup(game, upcoming = false) {
  const score = game.awayScore === null || game.homeScore === null
    ? 'vs.'
    : `${game.awayScore}–${game.homeScore}`;
  return `
    <article class="college-game-card">
      <span>${sectionSafe(game.date || (upcoming ? 'Upcoming' : 'Final'))}</span>
      <strong>${sectionSafe(game.awayTeam || 'TBD')} ${score} ${sectionSafe(game.homeTeam || 'TBD')}</strong>
      <small>${upcoming ? 'College watch game' : 'Recent result'}</small>
    </article>
  `;
}

async function loadWhoGotNext() {
  const live = document.getElementById('collegeLiveGrid');
  const status = document.getElementById('collegeStatus');
  if (!live || !status) return;

  try {
    const response = await fetch('/api/next', { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    const upcoming = Array.isArray(payload.upcoming) ? payload.upcoming : [];
    const recent = Array.isArray(payload.recent) ? payload.recent : [];
    const games = [...upcoming.slice(0, 4).map(game => ({ game, upcoming: true })), ...recent.slice(0, 4).map(game => ({ game, upcoming: false }))];

    if (!games.length) {
      live.innerHTML = `<div class="college-feed-empty"><strong>College season tracker ready.</strong><span>${sectionSafe(payload.providerMessage || 'The 2026–27 schedule has not populated yet.')}</span></div>`;
      status.textContent = 'Independent college feed ready';
      return;
    }

    live.innerHTML = games.map(item => collegeGameMarkup(item.game, item.upcoming)).join('');
    status.textContent = `${payload.season} college games • independent feed`;
  } catch (error) {
    live.innerHTML = `<div class="college-feed-empty"><strong>College live feed is temporarily unavailable.</strong><span>Draft-radar and editorial watchlist content still works.</span></div>`;
    status.textContent = 'College editorial board available';
  }
}

loadAroundTheW();
loadWhoGotNext();
