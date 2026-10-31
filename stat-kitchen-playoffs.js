/* 2026 playoff leaders: separate from the regular-season leaderboard and Finals-only series totals. */
(function () {
  const host = document.getElementById('playoffLeaderRows');
  const tabList = document.getElementById('playoffLeaderCategories');
  const status = document.getElementById('playoffLeaderStatus');
  const modeSelect = document.getElementById('playoffLeaderMode');
  const searchInput = document.getElementById('playoffLeaderSearch');
  const expandButton = document.getElementById('playoffLeaderExpand');
  const countText = document.getElementById('playoffLeaderCount');
  if (!host || !tabList || !status || !modeSelect || !searchInput || !expandButton || !countText) return;

  const categories = [
    {key:'pts', label:'Points', per:'PPG', total:'PTS'},
    {key:'trb', label:'Rebounds', per:'RPG', total:'REB'},
    {key:'ast', label:'Assists', per:'APG', total:'AST'},
    {key:'stl', label:'Steals', per:'SPG', total:'STL'},
    {key:'blk', label:'Blocks', per:'BPG', total:'BLK'},
    {key:'tov', label:'Turnovers', per:'TOPG', total:'TO'},
    {key:'fg3m', label:'3-pointers made', per:'3PG', total:'3PM'}
  ];
  const teamNames = {
    ATL:'Atlanta Dream', CHI:'Chicago Sky', CON:'Connecticut Sun',
    DAL:'Dallas Wings', GSV:'Golden State Valkyries', IND:'Indiana Fever',
    LVA:'Las Vegas Aces', LAS:'Los Angeles Sparks', MIN:'Minnesota Lynx',
    NYL:'New York Liberty', PHO:'Phoenix Mercury', PHX:'Phoenix Mercury',
    SEA:'Seattle Storm', WAS:'Washington Mystics',
    TOR:'Toronto Tempo', POR:'Portland Fire'
  };
  const teamSlugs = {
    ATL:'atlanta-dream', CHI:'chicago-sky', CON:'connecticut-sun',
    DAL:'dallas-wings', GSV:'golden-state-valkyries', IND:'indiana-fever',
    LVA:'las-vegas-aces', LAS:'los-angeles-sparks', MIN:'minnesota-lynx',
    NYL:'new-york-liberty', PHO:'phoenix-mercury', PHX:'phoenix-mercury',
    SEA:'seattle-storm', WAS:'washington-mystics',
    TOR:'toronto-tempo', POR:'portland-fire'
  };
  const escapeText = value => String(value == null ? '' : value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char])
  );
  const params = new URLSearchParams(location.search);
  let mode = params.get('playoffMode') === 'totals' ? 'totals' : 'pergame';
  let stat = categories.some(item => item.key === params.get('playoffStat')) ? params.get('playoffStat') : 'pts';
  let players = [];
  let expanded = false;
  let requestNumber = 0;
  modeSelect.value = mode;

  function category() {
    return categories.find(item => item.key === stat) || categories[0];
  }

  function rankedPlayers() {
    return players
      .filter(player => Number(player.games) > 0 && player[stat] != null && Number.isFinite(Number(player[stat])))
      .sort((a, b) => Number(b[stat]) - Number(a[stat]) || String(a.name).localeCompare(String(b.name)));
  }

  function writeParams() {
    try {
      const url = new URL(location.href);
      url.searchParams.set('playoffStat', stat);
      url.searchParams.set('playoffMode', mode);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    } catch (_) {}
  }

  function renderTabs() {
    tabList.innerHTML = categories.map(item =>
      '<button type="button" role="tab" id="playoff-tab-' + item.key +
      '" aria-controls="playoffLeaderRows" aria-selected="' + (item.key === stat) +
      '" tabindex="' + (item.key === stat ? '0' : '-1') +
      '" data-playoff-stat="' + item.key +
      '" class="' + (item.key === stat ? 'active' : '') + '">' +
      escapeText(item.label) + '</button>'
    ).join('');
    host.setAttribute('aria-labelledby', 'playoff-tab-' + stat);
  }

  function render() {
    renderTabs();
    const selection = rankedPlayers();
    const search = searchInput.value.trim().toLowerCase();
    const filtered = search
      ? selection.filter(player =>
          String(player.name).toLowerCase().includes(search) ||
          String(player.team).toLowerCase().includes(search) ||
          (teamNames[player.team] || '').toLowerCase().includes(search))
      : selection;
    const visible = expanded || search ? filtered : filtered.slice(0, 5);
    const unit = mode === 'totals' ? category().total : category().per;

    if (!players.length) {
      host.innerHTML = '<p class="leader-loading">Loading the league playoff leaderboard…</p>';
      countText.textContent = '';
      expandButton.hidden = true;
      return;
    }

    const headers = '<div class="playoff-leader-head">' +
      '<span>Rank</span><span>Player</span><span class="playoff-team-col">Team</span>' +
      '<span class="playoff-value-label">' + escapeText(unit) + '</span></div>';
    const rowsHtml = visible.map(player => {
      const rank = selection.indexOf(player) + 1;
      const leading = rank === 1;
      const team = String(player.team || 'WNBA');
      const teamLink = teamSlugs[team]
        ? '/team.html?team=' + encodeURIComponent(teamSlugs[team])
        : '';
      const value = Number(player[stat]).toFixed(mode === 'totals' ? 0 : 1);
      const playerLink = '/playerpedia.html?search=' + encodeURIComponent(player.name) +
        '&from=stat-kitchen&spotlight=playoff-' + encodeURIComponent(stat) + '#playerpedia-directory';
      const teamMarkup = teamLink
        ? '<a class="playoff-team-link" href="' + teamLink + '">' + escapeText(team) + '</a>'
        : '<span class="playoff-team-link">' + escapeText(team) + '</span>';
      return '<article class="playoff-leader-row' + (leading ? ' playoff-number-one' : '') + '">' +
        '<span class="playoff-rank">' + rank + '</span>' +
        '<div class="playoff-player-cell">' +
        '<div class="playoff-player-line"><a href="' + playerLink + '">' +
        escapeText(player.name) + '</a>' +
        (leading ? '<span class="playoff-head-chef">HEAD CHEF</span>' : '') + '</div>' +
        '<small>' + escapeText(teamNames[team] || team) + ' · ' +
        Number(player.games) + ' GP</small></div>' +
        teamMarkup +
        '<strong class="playoff-stat-value">' + value +
        '<small>' + escapeText(unit) + '</small></strong></article>';
    }).join('');
    host.innerHTML = headers + (rowsHtml || '<p class="playoff-no-results">No matching playoff players in this category.</p>');
    const message = search
      ? 'Showing ' + filtered.length + ' of ' + selection.length + ' playoff players matching your search.'
      : 'Showing ' + visible.length + ' of ' + selection.length +
        ' playoff players · ' + escapeText(category().label) +
        (mode === 'totals' ? ' totals.' : ' per game.');
    countText.textContent = message;
    expandButton.hidden = Boolean(search) || selection.length <= 5;
    expandButton.textContent = expanded ? 'Show top five' : 'Show all ' + selection.length + ' players';
    expandButton.setAttribute('aria-expanded', String(expanded));
  }

  async function load() {
    const attempt = ++requestNumber;
    if (!players.length) status.textContent = 'Checking official playoff statistics…';
    let payload = null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch('/api/playoff-leaders?mode=' + mode, {
          headers: {Accept:'application/json'}, cache: 'no-store', signal: controller.signal
        });
      } finally { clearTimeout(timeout); }
      if (!response.ok) throw Error('Official playoff feed unavailable');
      payload = await response.json();
      if (!Array.isArray(payload.players) || !payload.players.length) throw Error('Incomplete playoff feed');
    } catch (_) {
      try {
        const response = await fetch('/data/playoff-leaders-2026.json', {cache:'no-store'});
        if (!response.ok) throw Error('Saved postseason data unavailable');
        const saved = await response.json();
        payload = Object.assign({}, saved[mode], {stale: true});
        if (!Array.isArray(payload.players) || !payload.players.length) throw Error('Saved postseason data empty');
      } catch (_) {
        if (attempt !== requestNumber) return;
        status.textContent = 'Playoff feed temporarily unavailable';
        if (!players.length) {
          host.innerHTML = '<p class="playoff-no-results">The playoff data is temporarily unavailable. ' +
            '<a href="https://stats.wnba.com/players/traditional/?Season=2026&SeasonType=Playoffs">' +
            'See official WNBA playoff statistics</a>.</p>';
        }
        return;
      }
    }
    if (attempt !== requestNumber) return;
    players = payload.players;
    render();
    if (payload.stale) {
      const date = payload.through || 'latest saved date';
      status.textContent = 'Saved postseason stats · through ' + date + ' · live feed retrying';
    } else {
      const updated = new Date(payload.updatedAt);
      status.textContent = 'Official playoffs · updated ' +
        (Number.isFinite(updated.getTime())
          ? updated.toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})
          : 'recently');
    }
  }

  tabList.addEventListener('click', event => {
    const tab = event.target.closest('[data-playoff-stat]');
    if (!tab) return;
    stat = tab.dataset.playoffStat;
    render();
    writeParams();
  });
  tabList.addEventListener('keydown', event => {
    const current = categories.findIndex(item => item.key === stat);
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % categories.length;
    else if (event.key === 'ArrowLeft') next = (current + categories.length - 1) % categories.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = categories.length - 1;
    else return;
    event.preventDefault();
    stat = categories[next].key;
    render();
    writeParams();
    const active = document.getElementById('playoff-tab-' + stat);
    if (active) active.focus();
  });
  modeSelect.addEventListener('change', () => {
    mode = modeSelect.value === 'totals' ? 'totals' : 'pergame';
    players = [];
    status.textContent = 'Loading ' + (mode === 'totals' ? 'playoff totals' : 'per-game playoff averages') + '…';
    render();
    writeParams();
    load();
  });
  searchInput.addEventListener('input', render);
  expandButton.addEventListener('click', () => {
    expanded = !expanded;
    render();
  });
  renderTabs();
  load();
  setInterval(() => { if (!document.hidden) load(); }, 300000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
})();

// Separate Finals series totals from all-round postseason leaders.
// Both views use official final box scores; the saved file is the offline fallback.
(function () {
  const mount = document.getElementById('finalsLeaderSummary');
  if (!mount) return;
  const categories = [
    ['pts', 'Points', 'PTS'],
    ['trb', 'Rebounds', 'REB'],
    ['ast', 'Assists', 'AST'],
    ['blk', 'Blocks', 'BLK'],
    ['stl', 'Steals', 'STL'],
    ['fg3m', '3-pointers made', '3PM']
  ];
  const escapeText = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => (
    {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]
  ));
  const teamNames = { ATL: 'Atlanta Dream', GSV: 'Golden State Valkyries' };
  const finiteNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;

  function leadersFromGames(games) {
    const players = new Map();
    games.forEach(game => {
      ['ATL', 'GSV'].forEach(team => {
        (game[team]?.players || []).forEach(player => {
          const key = team + '|' + player.name;
          const row = players.get(key) || {
            name: player.name, team: team, pts: 0, trb: 0,
            ast: 0, blk: 0, stl: 0, fg3m: 0, games: 0
          };
          row.pts += finiteNumber(player.points);
          row.trb += finiteNumber(player.reboundsTotal);
          row.ast += finiteNumber(player.assists);
          row.blk += finiteNumber(player.blocks);
          row.stl += finiteNumber(player.steals);
          row.fg3m += finiteNumber(String(player.three || '0-0').split('-')[0]);
          row.games += 1;
          players.set(key, row);
        });
      });
    });
    return [...players.values()];
  }

  function render(games, source) {
    const finalGames = games.filter(game => Number.isInteger(game.number) && game.ATL && game.GSV)
      .sort((a, b) => a.number - b.number);
    if (!finalGames.length) throw Error('No completed Finals games');
    const players = leadersFromGames(finalGames);
    const latest = finalGames[finalGames.length - 1];
    mount.innerHTML = '<div class="fls-heading">' +
      '<div><p class="kicker">2026 WNBA FINALS · SERIES TOTALS ONLY</p>' +
      '<h3>Finals Stat Leaders</h3>' +
      '<p>Through Game ' + latest.number + ' · ' + escapeText(latest.date) +
      ' · Atlanta Dream vs. Golden State Valkyries</p></div>' +
      '<a href="#finals-game-dashboard">View game box scores</a></div>' +
      '<div class="fls-grid">' + categories.map(([key, label, short]) => {
        const leader = players.slice().sort((a, b) =>
          b[key] - a[key] || a.name.localeCompare(b.name))[0];
        if (!leader) return '';
        return '<article class="fls-card"><span class="fls-category">' + label +
          '</span><strong class="fls-total">' + leader[key] + ' <small>' + short + '</small></strong>' +
          '<a class="fls-player" href="/playerpedia.html?search=' +
          encodeURIComponent(leader.name) + '">' + escapeText(leader.name) + '</a>' +
          '<span class="fls-team">' + escapeText(teamNames[leader.team]) +
          ' · ' + leader.games + ' GP</span></article>';
      }).join('') + '</div>' +
      '<p class="fls-source">Cumulative Finals numbers, separate from the full playoff leader rankings below. ' +
      (source === 'snapshot' ? 'Showing saved final box scores while the live feed reconnects.' :
        'Updated from official WNBA final box scores.') + '</p>';
  }

  async function load() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        response = await fetch('/api/finals-game-stats', {
          cache: 'no-store', signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) throw Error('Finals stats API unavailable');
      const result = await response.json();
      if (!Array.isArray(result.games) || !result.games.length) throw Error('Empty Finals results');
      render(result.games, result.stale ? 'snapshot' : 'live');
    } catch (error) {
      try {
        const response = await fetch('/finals-game-dashboard.json', {cache:'no-store'});
        if (!response.ok) throw Error('Saved Finals results unavailable');
        const result = await response.json();
        render(result.games, 'snapshot');
      } catch {
        mount.textContent = 'Finals stat leaders are temporarily unavailable. See the official box scores below.';
      }
    }
  }
  load();
  setInterval(() => { if (!document.hidden) load(); }, 300000);
})();
