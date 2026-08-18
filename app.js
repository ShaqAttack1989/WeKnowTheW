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
    return `<div class="notice-box"><strong>No standings returned for ${season}.</strong><span>The season may not have started yet, or WNBA data access may not be enabled.</span></div>`;
  }

  return `
    <div class="standing-row head"><span>#</span><span>Team</span><span>W</span><span>L</span><span>PCT</span></div>
    ${items.map((item, index) => `
      <div class="standing-row">
        <span class="rank">${item.playoff_seed || index + 1}</span>
        <span>
          <span class="team-name">${item.team?.full_name || 'Unknown team'}</span><br>
          <span class="muted">${item.conference || item.team?.conference || ''}</span>
        </span>
        <strong>${item.wins ?? '—'}</strong>
        <strong>${item.losses ?? '—'}</strong>
        <span>${Number.isFinite(Number(item.win_percentage)) ? Number(item.win_percentage).toFixed(3) : '—'}</span>
      </div>
    `).join('')}
  `;
}

function leadersMarkup(items) {
  const categories = [
    ['Points', 'pts'],
    ['Rebounds', 'reb'],
    ['Assists', 'ast'],
    ['Steals', 'stl'],
    ['Blocks', 'blk']
  ];

  return categories.map(([label, key]) => {
    const top = [...(items || [])]
      .filter(item => Number.isFinite(Number(item[key])))
      .sort((a, b) => Number(b[key]) - Number(a[key]))[0];

    const name = top?.player ? `${top.player.first_name} ${top.player.last_name}` : 'Not available';
    const value = top ? Number(top[key]).toFixed(1) : '—';

    return `
      <article class="leader-card">
        <span class="category">${label}</span>
        <span class="value">${value}</span>
        <div>
          <span class="name">${name}</span>
          <div class="muted">per game</div>
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

    if (!payload.configured) {
      standingsEl.innerHTML = `<div class="notice-box"><strong>Live stats are ready to connect.</strong><span>Add the BALLDONTLIE API key in Vercel as <code>BDL_WNBA_API_KEY</code>.</span></div>`;
      leadersEl.innerHTML = leadersMarkup([]);
      statusText.textContent = 'API key not connected yet';
      leaderNote.textContent = 'Live leader cards will populate after the data key is connected.';
      return;
    }

    if (payload.keyValid === false) {
      const message = payload.providerErrors?.authentication || 'BALLDONTLIE could not validate this API key.';
      standingsEl.innerHTML = `<div class="error-box"><strong>API key needs attention.</strong><span>${message}</span></div>`;
      leadersEl.innerHTML = leadersMarkup([]);
      statusText.textContent = 'API key needs attention';
      leaderNote.textContent = 'Once the key is validated, live WNBA data will populate here.';
      return;
    }

    if (payload.wnbaAccess === false) {
      const message = payload.providerErrors?.wnbaAccess || 'Your BALLDONTLIE account does not currently show WNBA access.';
      standingsEl.innerHTML = `<div class="notice-box"><strong>WNBA access is not enabled yet.</strong><span>${message}</span></div>`;
      leadersEl.innerHTML = leadersMarkup([]);
      statusDot.classList.add('partial');
      statusText.textContent = 'API key valid • WNBA access needed';
      leaderNote.textContent = 'Enable WNBA access on the BALLDONTLIE account tied to this API key.';
      return;
    }

    standingsEl.innerHTML = standingsMarkup(payload.standings);
    leadersEl.innerHTML = leadersMarkup(payload.playerSeasonStats);

    const hasStandings = payload.standings?.length > 0;
    const hasLeaders = payload.playerSeasonStats?.length > 0;

    if (hasStandings && hasLeaders) {
      statusDot.classList.add('live');
      statusText.textContent = `Live • updated ${new Date(payload.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (hasStandings) {
      statusDot.classList.add('partial');
      statusText.textContent = payload.standingsSource === 'games-derived'
        ? 'Live standings • calculated from game results'
        : 'Live standings connected';
    } else {
      statusDot.classList.add('partial');
      statusText.textContent = 'API connected • WNBA data unavailable';
    }

    if (payload.access?.playerSeasonStats === false) {
      leaderNote.textContent = 'Player season leaders require BALLDONTLIE WNBA GOAT access. Standings can still update automatically from game results.';
    }
  } catch (error) {
    standingsEl.innerHTML = `<div class="error-box"><strong>Live stats could not load.</strong><span>${error.message}</span></div>`;
    leadersEl.innerHTML = leadersMarkup([]);
    statusText.textContent = 'Live data unavailable';
  }
}

loadLiveData();
