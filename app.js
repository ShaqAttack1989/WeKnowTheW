const params = new URLSearchParams(location.search);
const requestedSeason = Number(params.get('season'));
const season = Number.isInteger(requestedSeason) && requestedSeason >= 1997 && requestedSeason <= 2100
  ? requestedSeason
  : new Date().getFullYear();

document.getElementById('seasonLabel').textContent = season;
document.getElementById('editionYear').textContent = season;

const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');
menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('') || 'W';
}

const curatedRecords = [
  { label: 'Championships', value: 'Title leaders', note: 'Team and player championship history' },
  { label: 'MVP', value: 'Most MVPs', note: 'Regular-season MVP winners and totals' },
  { label: 'DPOY', value: 'Defense royalty', note: 'Defensive Player of the Year history' },
  { label: 'MIP', value: 'Biggest jumps', note: 'Most Improved Player winners' },
  { label: 'Sixth Player', value: 'Bench brilliance', note: 'Sixth Player of the Year history' },
  { label: 'All-Time Stats', value: 'Points + more', note: 'Career leaders and milestones' }
];

document.getElementById('recordsGrid').innerHTML = curatedRecords.map(item => `
  <article class="record-card">
    <p class="kicker">${item.label}</p>
    <strong>${item.value}</strong>
    <span>${item.note}</span>
  </article>
`).join('');

function standingsMarkup(items) {
  if (!items?.length) {
    return `<div class="notice-box"><strong>Live standings are not available yet.</strong><span>The connected statistics feeds did not return a complete standings set.</span></div>`;
  }

  return `
    <div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>
    ${items.map((item, index) => `
      <div class="standing-row">
        <span class="rank">${item.playoff_seed || index + 1}</span>
        <span><span class="team-name">${escapeHtml(item.team?.full_name || 'Unknown team')}</span></span>
        <strong>${item.wins ?? '—'}</strong>
        <strong>${item.losses ?? '—'}</strong>
        <span>${Number.isFinite(Number(item.win_percentage)) ? Number(item.win_percentage).toFixed(3) : '—'}</span>
      </div>
    `).join('')}
  `;
}

function resultsMarkup(items) {
  if (!items?.length) {
    return `<article class="leader-card"><span class="category">Recent results</span><span class="value">—</span><div><span class="name">No completed games returned</span><div class="muted">The encyclopedia remains available.</div></div></article>`;
  }

  return items.map(game => {
    const awayWon = Number(game.awayScore) > Number(game.homeScore);
    const homeWon = Number(game.homeScore) > Number(game.awayScore);
    const winner = awayWon ? game.awayTeam : homeWon ? game.homeTeam : 'Final';
    return `
      <article class="leader-card">
        <span class="category">${escapeHtml(game.date || 'Final')}</span>
        <span class="value">${game.awayScore}–${game.homeScore}</span>
        <div>
          <span class="name">${escapeHtml(game.awayTeam)} @ ${escapeHtml(game.homeTeam)}</span>
          <div class="muted">${escapeHtml(winner)}${winner === 'Final' ? '' : ' won'}</div>
        </div>
      </article>
    `;
  }).join('');
}

async function loadLiveData() {
  const standingsEl = document.getElementById('standings');
  const leadersEl = document.getElementById('leaders');
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  const leaderNote = document.getElementById('leaderNote');

  try {
    const response = await fetch(`/api/stats?season=${season}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(payload.error || `Live data returned ${response.status}`);

    standingsEl.innerHTML = standingsMarkup(payload.standings);
    leadersEl.innerHTML = resultsMarkup(payload.recentResults);

    if (payload.fullSeasonAccess && payload.standings?.length) {
      statusDot.classList.add('live');
      statusText.textContent = `Live via TheSportsDB • updated ${new Date(payload.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      leaderNote.textContent = 'Recent completed games refresh from the same independent feed.';
    } else {
      statusDot.classList.add('partial');
      statusText.textContent = 'Independent data feed connected';
      leaderNote.textContent = payload.providerMessage || 'The complete season feed is temporarily unavailable.';
    }
  } catch (error) {
    standingsEl.innerHTML = `<div class="error-box"><strong>Live stats could not load.</strong><span>${escapeHtml(error.message)}</span></div>`;
    leadersEl.innerHTML = resultsMarkup([]);
    statusText.textContent = 'Live data unavailable';
    leaderNote.textContent = 'Editorial encyclopedia content is unaffected.';
  }
}

// PLAYERPEDIA
const azGrid = document.getElementById('azGrid');
const playerGrid = document.getElementById('playerGrid');
const playerSearch = document.getElementById('playerSearch');
const playerTeamFilter = document.getElementById('playerTeamFilter');
const resetPlayerFilters = document.getElementById('resetPlayerFilters');
const playerCount = document.getElementById('playerCount');
const playerStatus = document.getElementById('playerStatus');
const playerModal = document.getElementById('playerModal');
const playerModalClose = document.getElementById('playerModalClose');
const playerModalBody = document.getElementById('playerModalBody');

let allPlayers = [];
let playerTeams = [];
let selectedLetter = '';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
azGrid.innerHTML = [
  `<button type="button" class="active" data-letter="" aria-pressed="true">All</button>`,
  ...letters.map(letter => `<button type="button" data-letter="${letter}" aria-label="Browse players whose last name begins with ${letter}" aria-pressed="false">${letter}</button>`)
].join('');

function filteredPlayers() {
  const query = playerSearch.value.trim().toLowerCase();
  const teamId = playerTeamFilter.value;

  return allPlayers.filter(player => {
    const matchesLetter = !selectedLetter || String(player.lastName || '').toUpperCase().startsWith(selectedLetter);
    const matchesTeam = !teamId || String(player.teamId) === teamId;
    const haystack = `${player.name} ${player.team} ${player.position}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesLetter && matchesTeam && matchesQuery;
  });
}

function playerCardMarkup(player) {
  const number = player.number ? `#${escapeHtml(player.number)}` : '';
  const position = player.position || 'Player';
  return `
    <button class="player-card" type="button" data-player-id="${escapeHtml(player.id)}" aria-label="Open ${escapeHtml(player.name)} profile">
      <span class="player-avatar" aria-hidden="true">${escapeHtml(initials(player.name))}</span>
      <span class="player-card-copy">
        <span class="player-card-topline">${escapeHtml(position)}${number ? ` · ${number}` : ''}</span>
        <strong>${escapeHtml(player.name)}</strong>
        <span>${escapeHtml(player.team || 'Current roster')}</span>
      </span>
      <span class="player-card-arrow" aria-hidden="true">→</span>
    </button>
  `;
}

function renderPlayers() {
  const players = filteredPlayers();
  const label = players.length === 1 ? 'player' : 'players';
  playerCount.textContent = `${players.length} ${label} shown`;

  if (!players.length) {
    playerGrid.innerHTML = `<div class="player-empty"><strong>No players match those filters.</strong><span>Try another letter, team or search.</span></div>`;
    return;
  }

  playerGrid.innerHTML = players.map(playerCardMarkup).join('');
}

function fillTeamFilter() {
  playerTeamFilter.innerHTML = [
    '<option value="">All current teams</option>',
    ...playerTeams.map(team => `<option value="${escapeHtml(team.id)}">${escapeHtml(team.name)}</option>`)
  ].join('');
}

async function loadPlayerpedia() {
  try {
    const response = await fetch('/api/players', { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Playerpedia returned ${response.status}`);

    allPlayers = Array.isArray(payload.players) ? payload.players : [];
    playerTeams = Array.isArray(payload.teams) ? payload.teams : [];
    fillTeamFilter();
    renderPlayers();

    playerStatus.textContent = payload.partial
      ? `${allPlayers.length} current players loaded • ${payload.failedRosters} roster feed${payload.failedRosters === 1 ? '' : 's'} retrying later`
      : `${allPlayers.length} current players • auto-refreshed`;
  } catch (error) {
    playerGrid.innerHTML = `<div class="error-box playerpedia-error"><strong>Playerpedia roster feed could not load.</strong><span>${escapeHtml(error.message)}</span></div>`;
    playerCount.textContent = 'Current rosters unavailable';
    playerStatus.textContent = 'Roster feed unavailable';
  }
}

azGrid.addEventListener('click', event => {
  const button = event.target.closest('button[data-letter]');
  if (!button) return;
  selectedLetter = button.dataset.letter || '';
  azGrid.querySelectorAll('button').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderPlayers();
});

playerSearch.addEventListener('input', renderPlayers);
playerTeamFilter.addEventListener('change', renderPlayers);
resetPlayerFilters.addEventListener('click', () => {
  selectedLetter = '';
  playerSearch.value = '';
  playerTeamFilter.value = '';
  azGrid.querySelectorAll('button').forEach((item, index) => {
    item.classList.toggle('active', index === 0);
    item.setAttribute('aria-pressed', String(index === 0));
  });
  renderPlayers();
});

function valueOrDash(value) {
  return value ? escapeHtml(value) : '—';
}

function factMarkup(label, value) {
  if (!value) return '';
  return `<div class="profile-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function arrayText(item, keys) {
  for (const key of keys) {
    if (item?.[key]) return String(item[key]);
  }
  return '';
}

function profileListMarkup(title, items, keys) {
  const values = (items || [])
    .map(item => arrayText(item, keys))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 12);

  if (!values.length) return '';
  return `
    <section class="profile-subsection">
      <h4>${escapeHtml(title)}</h4>
      <div class="profile-tags">${values.map(value => `<span>${escapeHtml(value)}</span>`).join('')}</div>
    </section>
  `;
}

async function openPlayerProfile(playerId) {
  const rosterPlayer = allPlayers.find(player => String(player.id) === String(playerId));
  playerModalBody.innerHTML = `
    <div class="profile-loading">
      <span class="player-avatar large">${escapeHtml(initials(rosterPlayer?.name || 'W'))}</span>
      <div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${escapeHtml(rosterPlayer?.name || 'Loading profile…')}</h3><p>Loading profile details…</p></div>
    </div>
  `;
  playerModal.showModal();

  try {
    const response = await fetch(`/api/player?id=${encodeURIComponent(playerId)}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Player profile returned ${response.status}`);

    const player = payload.player || {};
    const name = player.name || rosterPlayer?.name || 'Player';
    const team = player.team || rosterPlayer?.team || '';
    const position = player.position || rosterPlayer?.position || '';
    const description = player.description ? String(player.description).trim() : '';

    const honourBlock = profileListMarkup('Honors & awards', payload.honours, ['strHonour', 'strHonor', 'strAward', 'strAchievement', 'strName']);
    const formerTeamsBlock = profileListMarkup('Former teams', payload.formerTeams, ['strFormerTeam', 'strTeam', 'strName']);
    const milestoneBlock = profileListMarkup('Milestones', payload.milestones, ['strMilestone', 'strAchievement', 'strName']);

    playerModalBody.innerHTML = `
      <div class="profile-hero">
        <span class="player-avatar large" aria-hidden="true">${escapeHtml(initials(name))}</span>
        <div>
          <p class="kicker">PLAYERPEDIA</p>
          <h3 id="playerModalTitle">${escapeHtml(name)}</h3>
          <p class="profile-teamline">${escapeHtml([team, position].filter(Boolean).join(' · ') || 'Player profile')}</p>
        </div>
      </div>

      <div class="profile-facts">
        ${factMarkup('Jersey', player.number ? `#${player.number}` : '')}
        ${factMarkup('Born', player.birthDate)}
        ${factMarkup('From', player.birthPlace)}
        ${factMarkup('Nationality', player.nationality)}
        ${factMarkup('Height', player.height)}
        ${factMarkup('College', player.college)}
      </div>

      ${description ? `<section class="profile-subsection"><h4>Quick bio</h4><p class="profile-description">${escapeHtml(description)}</p></section>` : ''}
      ${honourBlock}
      ${formerTeamsBlock}
      ${milestoneBlock}

      <section class="why-we-know-her">
        <span>WHY WE KNOW HER</span>
        <strong>${escapeHtml(name)} belongs in Playerpedia.</strong>
        <p>This is the editorial layer we’ll build player by player: signature moments, awards, impact, fun facts and the story that explains why she matters to the W.</p>
      </section>
    `;
  } catch (error) {
    playerModalBody.innerHTML = `
      <div class="profile-hero">
        <span class="player-avatar large">${escapeHtml(initials(rosterPlayer?.name || 'W'))}</span>
        <div><p class="kicker">PLAYERPEDIA</p><h3 id="playerModalTitle">${escapeHtml(rosterPlayer?.name || 'Player')}</h3></div>
      </div>
      <div class="error-box"><strong>Full profile details could not load.</strong><span>${escapeHtml(error.message)}</span></div>
      <p class="profile-teamline">${escapeHtml([rosterPlayer?.team, rosterPlayer?.position].filter(Boolean).join(' · '))}</p>
    `;
  }
}

playerGrid.addEventListener('click', event => {
  const card = event.target.closest('[data-player-id]');
  if (!card) return;
  openPlayerProfile(card.dataset.playerId);
});

playerModalClose.addEventListener('click', () => playerModal.close());
playerModal.addEventListener('click', event => {
  if (event.target === playerModal) playerModal.close();
});

loadLiveData();
loadPlayerpedia();
