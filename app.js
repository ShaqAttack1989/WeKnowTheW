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

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
document.getElementById('azGrid').innerHTML = letters
  .map(letter => `<button type="button" aria-label="Browse players whose last name begins with ${letter}" title="${letter}">${letter}</button>`)
  .join('');

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
    return `<div class="notice-box"><strong>Live standings are not available yet.</strong><span>The site is connected to an independent data provider, but the complete production season feed still needs to be enabled.</span></div>`;
  }

  return `
    <div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>
    ${items.map((item, index) => `
      <div class="standing-row">
        <span class="rank">${item.playoff_seed || index + 1}</span>
        <span><span class="team-name">${item.team?.full_name || 'Unknown team'}</span></span>
        <strong>${item.wins ?? '—'}</strong>
        <strong>${item.losses ?? '—'}</strong>
        <span>${Number.isFinite(Number(item.win_percentage)) ? Number(item.win_percentage).toFixed(3) : '—'}</span>
      </div>
    `).join('')}
  `;
}

function resultsMarkup(items) {
  if (!items?.length) {
    return `<article class="leader-card"><span class="category">Recent results</span><span class="value">—</span><div><span class="name">Waiting for the complete season feed</span><div class="muted">No incomplete scores are shown.</div></div></article>`;
  }

  return items.map(game => {
    const awayWon = Number(game.awayScore) > Number(game.homeScore);
    const homeWon = Number(game.homeScore) > Number(game.awayScore);
    const winner = awayWon ? game.awayTeam : homeWon ? game.homeTeam : 'Final';
    return `
      <article class="leader-card">
        <span class="category">${game.date || 'Final'}</span>
        <span class="value">${game.awayScore}–${game.homeScore}</span>
        <div>
          <span class="name">${game.awayTeam} @ ${game.homeTeam}</span>
          <div class="muted">${winner}${winner === 'Final' ? '' : ' won'}</div>
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

    if (!response.ok) {
      throw new Error(payload.error || `Live data returned ${response.status}`);
    }

    standingsEl.innerHTML = standingsMarkup(payload.standings);
    leadersEl.innerHTML = resultsMarkup(payload.recentResults);

    if (payload.fullSeasonAccess && payload.standings?.length) {
      statusDot.classList.add('live');
      statusText.textContent = `Live via TheSportsDB • updated ${new Date(payload.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      leaderNote.textContent = 'Recent completed games refresh from the same independent feed.';
    } else {
      statusDot.classList.add('partial');
      statusText.textContent = 'Independent data feed connected • production access needed';
      leaderNote.textContent = payload.providerMessage || 'The complete season feed must be enabled before live results are published.';
    }
  } catch (error) {
    standingsEl.innerHTML = `<div class="error-box"><strong>Live stats could not load.</strong><span>${error.message}</span></div>`;
    leadersEl.innerHTML = resultsMarkup([]);
    statusText.textContent = 'Live data unavailable';
    leaderNote.textContent = 'Editorial encyclopedia content is unaffected.';
  }
}

loadLiveData();
