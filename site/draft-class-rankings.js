(() => {
  'use strict';

  const METRIC_LABELS = {
    overall: 'W Score',
    peak: 'Peak',
    depth: 'Depth',
    winning: 'Rings',
    longevity: 'Longevity'
  };

  const draftClasses = [
    {
      year: 2001,
      era: 'foundation',
      seed: 1,
      metrics: { peak: 100, depth: 100, winning: 98, longevity: 96 },
      headline: 'The complete class',
      players: ['Lauren Jackson · No. 1', 'Tamika Catchings · No. 3', 'Ruth Riley · No. 5', 'Deanna Nolan · No. 6', 'Katie Douglas · No. 10', 'Penny Taylor · No. 11'],
      proof: 'Four different Finals MVP winners came from one first round. Jackson and Catchings supplied the MVP ceiling; Riley, Nolan, Douglas and Taylor made the class deep enough to keep deciding championships.',
      why: 'No other class matches its combination of top-end greatness, positional balance and title-level careers beyond the top three.',
      source: 'https://www.wnba.com/draft/2001'
    },
    {
      year: 2004,
      era: 'foundation',
      seed: 2,
      metrics: { peak: 97, depth: 94, winning: 100, longevity: 100 },
      headline: 'The ring factory',
      players: ['Diana Taurasi · No. 1', 'Alana Beard · No. 2', 'Nicole Powell · No. 3', 'Lindsay Whalen · No. 4', 'Rebekkah Brunson · No. 10'],
      proof: 'Taurasi, Whalen and Brunson combined for 12 championships. Beard added elite defense and Powell added another All-Star career.',
      why: 'This is the winning and longevity champion—and the closest challenger to 2001.',
      source: 'https://www.wnba.com/draft/2004'
    },
    {
      year: 2016,
      era: 'modern',
      seed: 3,
      metrics: { peak: 98, depth: 97, winning: 94, longevity: 91 },
      headline: 'The modern gold standard',
      players: ['Breanna Stewart · No. 1', 'Aerial Powers · No. 5', 'Jonquel Jones · No. 6', 'Kahleah Copper · No. 7', 'Courtney Williams · No. 8', 'Tiffany Mitchell · No. 9'],
      proof: 'Stewart, Jones and Copper all became Finals MVPs. Williams grew into an All-Star-level playoff engine and the class produced real rotation value across the lottery.',
      why: 'It is the best modern class and still has time to catch 2001.',
      source: 'https://www.wnba.com/draft/2016/board'
    },
    {
      year: 2008,
      era: 'growth',
      seed: 4,
      metrics: { peak: 100, depth: 88, winning: 95, longevity: 96 },
      headline: 'Two franchise-changing bigs',
      players: ['Candace Parker · No. 1', 'Sylvia Fowles · No. 2', 'Crystal Langhorne · No. 6', 'Essence Carson · No. 7', 'Tamera Young · No. 8', 'Leilani Mitchell · No. 25'],
      proof: 'Parker and Fowles delivered MVPs, Finals MVPs, Defensive Player of the Year awards and championships. The next layer supplied durable starters.',
      why: 'The best one-two punch of any draft class makes 2008 the peak-score winner.',
      source: 'https://www.wnba.com/draft/2008'
    },
    {
      year: 2002,
      era: 'foundation',
      seed: 5,
      metrics: { peak: 92, depth: 96, winning: 96, longevity: 100 },
      headline: 'UConn’s championship spine',
      players: ['Sue Bird · No. 1', 'Swin Cash · No. 2', 'Stacey Dales · No. 3', 'Asjha Jones · No. 4', 'Nikki Teasley · No. 5', 'Michelle Snow · No. 10'],
      proof: 'Bird, Cash and Jones anchored contenders for years; Teasley won Finals MVP as a rookie; Snow became a multi-time All-Star.',
      why: 'Elite guard play, frontcourt depth and two decades of staying power keep it in the top five.',
      source: 'https://www.wnba.com/draft/2002'
    },
    {
      year: 2014,
      era: 'growth',
      seed: 6,
      metrics: { peak: 89, depth: 100, winning: 91, longevity: 92 },
      headline: 'The deepest lottery',
      players: ['Chiney Ogwumike · No. 1', 'Odyssey Sims · No. 2', 'Kayla McBride · No. 3', 'Alyssa Thomas · No. 4', 'Natasha Howard · No. 5', 'Stefanie Dolson · No. 6', 'Chelsea Gray · No. 11'],
      proof: 'Seven impact careers arrived in the first 11 picks, with Gray, Thomas, Howard and McBride becoming postseason constants.',
      why: 'If the question is “which class could fill the best seven-player rotation?”, 2014 is the answer.',
      source: 'https://www.wnba.com/draft/2014/board'
    },
    {
      year: 2006,
      era: 'growth',
      seed: 7,
      metrics: { peak: 92, depth: 93, winning: 90, longevity: 94 },
      headline: 'Stars from the opening tip',
      players: ['Seimone Augustus · No. 1', 'Cappie Pondexter · No. 2', 'Monique Currie · No. 3', 'Sophia Young-Malcolm · No. 4', 'Candice Dupree · No. 6'],
      proof: 'Augustus and Pondexter became Finals MVPs, while Young-Malcolm and Dupree supplied a decade of All-Star production.',
      why: 'Five of the first six picks became recognizable long-term starters or stars.',
      source: 'https://www.wnba.com/draft/2006'
    },
    {
      year: 2011,
      era: 'growth',
      seed: 8,
      metrics: { peak: 98, depth: 85, winning: 95, longevity: 84 },
      headline: 'Maya at the center',
      players: ['Maya Moore · No. 1', 'Liz Cambage · No. 2', 'Courtney Vandersloot · No. 3', 'Jantel Lavender · No. 5', 'Danielle Robinson · No. 6', 'Danielle Adams · No. 20'],
      proof: 'Moore produced one of the greatest peaks ever. Vandersloot became an all-time playmaker; Robinson, Lavender and Adams added real depth.',
      why: 'The class owns a huge peak and multiple championship guards, even with a shorter collective prime.',
      source: 'https://www.wnba.com/draft/2011'
    },
    {
      year: 2018,
      era: 'modern',
      seed: 9,
      metrics: { peak: 100, depth: 94, winning: 86, longevity: 80 },
      headline: 'A’ja plus a whole rotation',
      players: ['A’ja Wilson · No. 1', 'Kelsey Mitchell · No. 2', 'Gabby Williams · No. 4', 'Jordin Canada · No. 5', 'Azurá Stevens · No. 6', 'Ariel Atkins · No. 7'],
      proof: 'Wilson supplies a historic MVP peak. Mitchell, Williams, Canada, Stevens and Atkins make this much more than a one-player class.',
      why: 'Its score can still rise; the careers are not finished.',
      source: 'https://www.wnba.com/draft/2018/board'
    },
    {
      year: 1998,
      era: 'foundation',
      seed: 10,
      metrics: { peak: 88, depth: 90, winning: 86, longevity: 98 },
      headline: 'The first great point-center class',
      players: ['Margo Dydek · No. 1', 'Ticha Penicheiro · No. 2', 'Murriel Page · No. 3', 'DeLisha Milton-Jones · No. 4', 'Tangela Smith · No. 12'],
      proof: 'Penicheiro became an all-time passer, Dydek an all-time rim protector and Milton-Jones a two-decade winner.',
      why: 'The class helped define what elite WNBA roles looked like in the league’s first decade.',
      source: 'https://www.wnba.com/draft/1998'
    },
    {
      year: 2009,
      era: 'growth',
      seed: 11,
      metrics: { peak: 88, depth: 91, winning: 81, longevity: 91 },
      headline: 'Two-way wings everywhere',
      players: ['Angel McCoughtry · No. 1', 'Marissa Coleman · No. 2', 'Kristi Toliver · No. 3', 'DeWanna Bonner · No. 5', 'Briann January · No. 6'],
      proof: 'McCoughtry, Bonner and Toliver drove deep playoff runs while January became a championship defender and floor general.',
      why: 'The class was built for the modern game before the modern game fully arrived.',
      source: 'https://www.wnba.com/draft/2009'
    },
    {
      year: 2019,
      era: 'modern',
      seed: 12,
      metrics: { peak: 91, depth: 95, winning: 82, longevity: 75 },
      headline: 'Today’s playoff engine room',
      players: ['Jackie Young · No. 1', 'Teaira McCowan · No. 3', 'Arike Ogunbowale · No. 5', 'Napheesa Collier · No. 6', 'Kalani Brown · No. 7', 'Alanna Smith · No. 8', 'Sophie Cunningham · No. 13'],
      proof: 'Young and Collier became two-way stars, Ogunbowale a record-setting scorer and the middle of the round filled playoff rotations.',
      why: 'Its depth score is already elite, and its final legacy is still being written.',
      source: 'https://www.wnba.com/draft/2019/board'
    },
    {
      year: 2013,
      era: 'growth',
      seed: 13,
      metrics: { peak: 96, depth: 68, winning: 85, longevity: 89 },
      headline: 'The “Three to See” class',
      players: ['Brittney Griner · No. 1', 'Elena Delle Donne · No. 2', 'Skylar Diggins-Smith · No. 3', 'Kelsey Bone · No. 5', 'Tianna Hawkins · No. 6'],
      proof: 'The first three picks all became franchise players, with MVPs, championships and a decade of star power between them.',
      why: 'Top-heavy by design—and still one of the greatest top threes any league has drafted.',
      source: 'https://www.wnba.com/draft/2013/board'
    }
  ];

  const playoffTeams = [
    {
      abbr: 'ATL',
      name: 'Atlanta Dream',
      status: 'SEMIFINALS',
      bracketRank: 4,
      color: '#c8102e',
      logo: 'https://cdn.wnba.com/logos/wnba/1611661330/primary/L/logo.svg',
      photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1631009.png',
      featured: 'Rhyne Howard · No. 1',
      impact: 'Seven top-10 picks give Atlanta answers everywhere. Howard bends the defense, Canada organizes it, Reese owns the glass and Gray/Bonner/Jones bring postseason mileage.',
      picks: [
        ['Rhyne Howard', 1, 2022], ['Allisha Gray', 4, 2017], ['Jordin Canada', 5, 2018], ['DeWanna Bonner', 5, 2009],
        ['Shatori Walker-Kimbrough', 6, 2017], ['Angel Reese', 7, 2024], ['Brionna Jones', 8, 2017]
      ]
    },
    {
      abbr: 'LVA',
      name: 'Las Vegas Aces',
      status: 'SEMIFINALS',
      bracketRank: 3,
      color: '#9c8d7c',
      logo: 'https://cdn.wnba.com/logos/wnba/1611661319/primary/L/logo.svg',
      photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628932.png',
      featured: 'A’ja Wilson · No. 1',
      impact: 'The Aces have three No. 1s, but their clincher also exposed the limit of pick counting: No. 11 pick Chelsea Gray scored 23 while Wilson controlled the game with 36 and 10.',
      picks: [
        ['Jackie Young', 1, 2019], ['A’ja Wilson', 1, 2018], ['Jewell Loyd', 1, 2015], ['NaLyssa Smith', 2, 2022],
        ['Cheyenne Parker-Tyus', 5, 2015], ['Kalani Brown', 7, 2019]
      ]
    },
    {
      abbr: 'NYL',
      name: 'New York Liberty',
      status: 'SEMIFINALS',
      bracketRank: 8,
      color: '#50bfa6',
      logo: 'https://cdn.wnba.com/logos/wnba/1611661313/primary/L/logo.svg',
      photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1627668.png',
      featured: 'Breanna Stewart · No. 1',
      impact: 'New York has fewer top-10 picks than Atlanta, but no wasted pedigree: two No. 1s, a No. 2 and a No. 6 form a compact, title-tested core that just swept the No. 1 seed.',
      picks: [
        ['Sabrina Ionescu', 1, 2020], ['Breanna Stewart', 1, 2016], ['Satou Sabally', 2, 2020], ['Jonquel Jones', 6, 2016]
      ]
    },
    {
      abbr: 'GSV',
      name: 'Golden State Valkyries',
      status: 'SEMIFINALS',
      bracketRank: 2,
      color: '#7a3fc4',
      logo: 'https://cdn.wnba.com/logos/wnba/1611661331/primary/L/logo.svg',
      photo: 'https://cdn.wnba.com/headshots/wnba/latest/1040x760/1628931.png',
      featured: 'Gabby Williams · No. 4',
      impact: 'Golden State is the counterexample: zero No. 1 picks and only four top-10 selections. Williams scored 17 of her 19 after halftime and No. 7 pick Veronica Burton posted 16-10-6 as the Valkyries erased 16 to reach the semifinals.',
      picks: [
        ['Gabby Williams', 4, 2018], ['Justė Jocytė', 5, 2025], ['Veronica Burton', 7, 2022], ['Laeticia Amihere', 8, 2023]
      ]
    }
  ];

  const state = { metric: 'overall', era: 'all', query: '', teamSort: 'top10' };

  const overallScore = ({ metrics }) => Math.round(
    (metrics.peak * .35) + (metrics.depth * .25) + (metrics.winning * .25) + (metrics.longevity * .15)
  );

  const metricScore = (item, metric) => metric === 'overall' ? overallScore(item) : item.metrics[metric];

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const filteredClasses = () => draftClasses
    .filter(item => state.era === 'all' || item.era === state.era)
    .filter(item => {
      if (!state.query) return true;
      const haystack = `${item.year} ${item.headline} ${item.players.join(' ')}`.toLowerCase();
      return haystack.includes(state.query);
    })
    .sort((a, b) => metricScore(b, state.metric) - metricScore(a, state.metric) || a.seed - b.seed);

  const renderClassBoard = () => {
    const leaderHost = document.getElementById('classLeader');
    const gridHost = document.getElementById('classGrid');
    if (!leaderHost || !gridHost) return;
    const classes = filteredClasses();

    if (!classes.length) {
      leaderHost.innerHTML = '';
      gridHost.innerHTML = '<div class="class-empty"><strong>No class matched that search.</strong><p>Try a draft year or a player surname.</p></div>';
      return;
    }

    const leader = classes[0];
    const score = metricScore(leader, state.metric);
    leaderHost.innerHTML = `
      <article class="class-leader-card">
        <div class="class-leader-rank"><span>LEADER</span><strong>#1</strong></div>
        <div class="class-leader-copy">
          <p>${escapeHtml(METRIC_LABELS[state.metric]).toUpperCase()} LEADER</p>
          <h3>Class of ${leader.year}</h3>
          <span>${escapeHtml(leader.proof)}</span>
          <small>${escapeHtml(leader.why)}</small>
        </div>
        <div class="class-leader-score"><span>${escapeHtml(METRIC_LABELS[state.metric]).toUpperCase()}</span><strong>${score}</strong><small>OUT OF 100</small></div>
      </article>`;

    gridHost.innerHTML = classes.map((item, index) => {
      const itemScore = metricScore(item, state.metric);
      return `
        <article class="class-card">
          <div class="class-card-top">
            <div class="class-rank">${index + 1}</div>
            <div class="class-year"><span>DRAFT CLASS</span><strong>${item.year}</strong></div>
            <div class="class-score"><strong>${itemScore}</strong><span>${escapeHtml(METRIC_LABELS[state.metric]).toUpperCase()}</span></div>
          </div>
          <h3>${escapeHtml(item.headline)}</h3>
          <p>${escapeHtml(item.proof)}</p>
          <div class="class-player-list">${item.players.map(player => `<span>${escapeHtml(player)}</span>`).join('')}</div>
          <div class="class-metric-bar" style="--metric-width:${itemScore}%"><span>${escapeHtml(METRIC_LABELS[state.metric])}</span><i aria-hidden="true"></i><b>${itemScore}</b></div>
          <a class="class-source" href="${item.source}" target="_blank" rel="noopener">Official draft board ↗</a>
        </article>`;
    }).join('');
  };

  const teamNoOnes = team => team.picks.filter(([, pick]) => pick === 1).length;

  const renderPlayoffTeams = () => {
    const host = document.getElementById('playoffTeamGrid');
    if (!host) return;
    const teams = [...playoffTeams].sort((a, b) => {
      if (state.teamSort === 'ones') return teamNoOnes(b) - teamNoOnes(a) || b.picks.length - a.picks.length;
      if (state.teamSort === 'bracket') return b.bracketRank - a.bracketRank;
      return b.picks.length - a.picks.length || teamNoOnes(b) - teamNoOnes(a);
    });

    host.innerHTML = teams.map(team => `
      <article class="playoff-team-card" style="--team:${team.color}">
        <div class="playoff-team-head">
          <div class="playoff-team-logo"><img src="${team.logo}" alt="${escapeHtml(team.name)} logo" loading="lazy"></div>
          <div class="playoff-team-title"><span>${escapeHtml(team.status)}</span><h3>${escapeHtml(team.name)}</h3></div>
          <div class="playoff-team-count"><strong>${team.picks.length}</strong><span>TOP-10 PICKS</span></div>
        </div>
        <img class="playoff-team-photo" src="${team.photo}" alt="" loading="lazy" aria-hidden="true">
        <div class="playoff-team-body">
          <p>${escapeHtml(team.impact)}</p>
          <div class="playoff-pick-list">${team.picks.map(([name, pick, year]) => `<div class="playoff-pick"><span>${escapeHtml(name)}</span><b>${year} · #${pick}</b></div>`).join('')}</div>
          <div class="playoff-card-foot"><span><b>${teamNoOnes(team)}</b> No. 1 pick${teamNoOnes(team) === 1 ? '' : 's'}</span><span>Headliner: <b>${escapeHtml(team.featured)}</b></span></div>
        </div>
      </article>`).join('');

    const topTen = playoffTeams.reduce((sum, team) => sum + team.picks.length, 0);
    const ones = playoffTeams.reduce((sum, team) => sum + teamNoOnes(team), 0);
    const topTenHost = document.getElementById('topTenTotal');
    const onesHost = document.getElementById('numberOneTotal');
    if (topTenHost) topTenHost.textContent = topTen;
    if (onesHost) onesHost.textContent = ones;
  };

  const bindPressedGroup = (hostId, dataName, onSelect) => {
    const host = document.getElementById(hostId);
    if (!host) return;
    host.addEventListener('click', event => {
      const button = event.target.closest(`button[data-${dataName}]`);
      if (!button) return;
      host.querySelectorAll('button').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      onSelect(button.dataset[dataName]);
    });
  };

  bindPressedGroup('metricControls', 'metric', metric => {
    state.metric = metric;
    renderClassBoard();
  });

  bindPressedGroup('eraControls', 'era', era => {
    state.era = era;
    renderClassBoard();
  });

  const teamSortHost = document.querySelector('.playoff-sort');
  if (teamSortHost) {
    teamSortHost.addEventListener('click', event => {
      const button = event.target.closest('button[data-team-sort]');
      if (!button) return;
      teamSortHost.querySelectorAll('button').forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      state.teamSort = button.dataset.teamSort;
      renderPlayoffTeams();
    });
  }

  const search = document.getElementById('classSearch');
  if (search) {
    search.addEventListener('input', () => {
      state.query = search.value.trim().toLowerCase();
      renderClassBoard();
    });
  }

  const methodButton = document.getElementById('methodButton');
  const methodPanel = document.getElementById('methodPanel');
  if (methodButton && methodPanel) {
    methodButton.addEventListener('click', () => {
      const willOpen = methodPanel.hidden;
      methodPanel.hidden = !willOpen;
      methodButton.setAttribute('aria-expanded', String(willOpen));
      methodButton.textContent = willOpen ? 'Hide the W Score method' : 'How the W Score works';
    });
  }

  renderClassBoard();
  renderPlayoffTeams();
})();
