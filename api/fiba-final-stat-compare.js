const EVENT_BASE = 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026';
const STATS_URL = `${EVENT_BASE}/stats`;
const COMPETITION_ID = 208875;
const TEAM_NAMES = { USA: 'United States', FRA: 'France' };

async function fetchText(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA returned ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function publicFibaApiConfig(html = '') {
  const apiUrl = String(html).match(/NEXT_CLIENT_APIM_URL\\":\\"([^\\"]+)/)?.[1];
  const subscriptionKey = String(html).match(/NEXT_CLIENT_APIM_SUBSCRIPTION_KEY\\":\\"([^\\"]+)/)?.[1];
  return apiUrl && subscriptionKey ? { apiUrl, subscriptionKey } : null;
}

async function fetchFibaJson(config, endpoint, query = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
    });
    const suffix = params.size ? `?${params.toString()}` : '';
    const response = await fetch(`${config.apiUrl.replace(/\/$/, '')}/${endpoint}${suffix}`, {
      headers: { Accept: 'application/json', 'Ocp-Apim-Subscription-Key': config.subscriptionKey },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA ${endpoint} returned ${response.status}`);
    const payload = await response.json();
    return payload?.data || payload;
  } finally {
    clearTimeout(timeout);
  }
}

function num(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNum(object, keys) {
  for (const key of keys) {
    const value = num(object?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function teamCode(team = {}) {
  return String(team.code || team.shortName || team.nationality || '').toUpperCase();
}

function teamId(team = {}) {
  for (const key of ['gdapTeamId', 'teamId', 'id', 'teamID']) {
    const value = num(team?.[key]);
    if (value !== null) return value;
  }
  return null;
}

function extractTeamIds(games = []) {
  const ids = new Map();
  for (const game of Array.isArray(games) ? games : []) {
    for (const side of ['teamA', 'teamB']) {
      const team = game?.[side] || {};
      const code = teamCode(team);
      const id = teamId(team);
      if (code && id !== null) ids.set(code, id);
    }
  }
  if (!ids.has('USA')) ids.set('USA', 284651);
  return ids;
}

function isFinalGame(game = {}) {
  return game.statusCode === 'VALID' || game.gameResultStatusCode === 'VALID';
}

function score(value) {
  if (typeof value === 'object' && value) {
    return num(value.score ?? value.total ?? value.points ?? value.value);
  }
  return num(value);
}

function buildResultTable(games = []) {
  const table = new Map();
  const ensure = code => {
    if (!table.has(code)) table.set(code, { games: 0, wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    return table.get(code);
  };
  for (const game of Array.isArray(games) ? games : []) {
    if (!isFinalGame(game)) continue;
    const a = teamCode(game.teamA), b = teamCode(game.teamB);
    const aScore = score(game.teamAScore), bScore = score(game.teamBScore);
    if (!a || !b || aScore === null || bScore === null) continue;
    const A = ensure(a), B = ensure(b);
    A.games += 1; B.games += 1;
    A.pointsFor += aScore; A.pointsAgainst += bScore;
    B.pointsFor += bScore; B.pointsAgainst += aScore;
    if (aScore > bScore) { A.wins += 1; B.losses += 1; }
    else if (bScore > aScore) { B.wins += 1; A.losses += 1; }
  }
  return table;
}

function playersFromPayload(payload = {}) {
  if (Array.isArray(payload.playerInCompetitionTeamStatistics)) return payload.playerInCompetitionTeamStatistics;
  for (const value of Object.values(payload || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.playerInCompetitionTeamStatistics)) {
      return value.playerInCompetitionTeamStatistics;
    }
  }
  return [];
}

function sumTotal(players, totalKeys, perGameKeys = []) {
  let sum = 0;
  let found = false;
  for (const player of players) {
    let value = firstNum(player, totalKeys);
    if (value === null && perGameKeys.length) {
      const perGame = firstNum(player, perGameKeys);
      const gp = firstNum(player, ['totalGamesPlayed', 'gamesPlayed']);
      if (perGame !== null && gp !== null) value = perGame * gp;
    }
    if (value !== null) { sum += value; found = true; }
  }
  return found ? sum : null;
}

function safeDivide(a, b, factor = 1) {
  return a !== null && b !== null && b !== 0 ? (a / b) * factor : null;
}

function aggregateTeam(players, result = {}) {
  const games = result.games || Math.max(0, ...players.map(player => firstNum(player, ['totalGamesPlayed', 'gamesPlayed']) || 0));
  const totalPoints = result.pointsFor || sumTotal(players, ['totalPoints'], ['pointsPerGame']);
  const fgm = sumTotal(players, ['totalFieldGoalsMade'], ['fieldGoalsMadePerGame']);
  const fga = sumTotal(players, ['totalFieldGoalsAttempted'], ['fieldGoalsAttemptedPerGame']);
  const threeM = sumTotal(players, ['totalThreePointsMade', 'totalThreePointFieldGoalsMade'], ['threePointsMadePerGame', 'threePointFieldGoalsMadePerGame']);
  const threeA = sumTotal(players, ['totalThreePointsAttempted', 'totalThreePointFieldGoalsAttempted'], ['threePointsAttemptedPerGame', 'threePointFieldGoalsAttemptedPerGame']);
  const twoMDirect = sumTotal(players, ['totalTwoPointsMade', 'totalTwoPointFieldGoalsMade'], ['twoPointsMadePerGame', 'twoPointFieldGoalsMadePerGame']);
  const twoADirect = sumTotal(players, ['totalTwoPointsAttempted', 'totalTwoPointFieldGoalsAttempted'], ['twoPointsAttemptedPerGame', 'twoPointFieldGoalsAttemptedPerGame']);
  const twoM = twoMDirect ?? (fgm !== null && threeM !== null ? fgm - threeM : null);
  const twoA = twoADirect ?? (fga !== null && threeA !== null ? fga - threeA : null);
  const ftm = sumTotal(players, ['totalFreeThrowsMade'], ['freeThrowsMadePerGame']);
  const fta = sumTotal(players, ['totalFreeThrowsAttempted'], ['freeThrowsAttemptedPerGame']);
  const orb = sumTotal(players, ['totalOffensiveRebounds'], ['offensiveReboundsPerGame']);
  const drb = sumTotal(players, ['totalDefensiveRebounds'], ['defensiveReboundsPerGame']);
  const reboundsDirect = sumTotal(players, ['totalRebounds'], ['reboundsPerGame']);
  const rebounds = reboundsDirect ?? (orb !== null && drb !== null ? orb + drb : null);
  const assists = sumTotal(players, ['totalAssists'], ['assistsPerGame']);
  const turnovers = sumTotal(players, ['totalTurnovers'], ['turnoversPerGame']);
  const steals = sumTotal(players, ['totalSteals'], ['stealsPerGame']);
  const blocks = sumTotal(players, ['totalBlocks'], ['blocksPerGame']);
  const fouls = sumTotal(players, ['totalFouls', 'totalPersonalFouls'], ['foulsPerGame', 'personalFoulsPerGame']);
  const misses = fga !== null && fgm !== null ? fga - fgm : null;
  const ftMisses = fta !== null && ftm !== null ? fta - ftm : null;
  const efficiencyTotal = [totalPoints, rebounds, assists, steals, blocks].every(v => v !== null) && misses !== null && ftMisses !== null && turnovers !== null
    ? totalPoints + rebounds + assists + steals + blocks - misses - ftMisses - turnovers
    : null;
  const pg = value => games && value !== null ? value / games : null;
  return {
    games,
    wins: result.wins || 0,
    losses: result.losses || 0,
    winPct: games ? (result.wins || 0) / games : null,
    ppg: pg(totalPoints),
    totalPoints,
    fgmPg: pg(fgm), fgaPg: pg(fga), fgPct: safeDivide(fgm, fga, 100),
    twoMpg: pg(twoM), twoApg: pg(twoA), twoPct: safeDivide(twoM, twoA, 100),
    threeMpg: pg(threeM), threeApg: pg(threeA), threePct: safeDivide(threeM, threeA, 100),
    ftmPg: pg(ftm), ftaPg: pg(fta), ftPct: safeDivide(ftm, fta, 100),
    orbPg: pg(orb), drbPg: pg(drb), rebPg: pg(rebounds),
    astPg: pg(assists), toPg: pg(turnovers), astTo: safeDivide(assists, turnovers),
    stlPg: pg(steals), blkPg: pg(blocks), foulPg: pg(fouls), effPg: pg(efficiencyTotal),
    oppPpg: games ? (result.pointsAgainst || 0) / games : null,
    margin: games ? ((result.pointsFor || 0) - (result.pointsAgainst || 0)) / games : null,
    orbTotal: orb, drbTotal: drb, rebTotal: rebounds, astTotal: assists, toTotal: turnovers,
    stlTotal: steals, blkTotal: blocks, foulTotal: fouls, fgaTotal: fga, threeATotal: threeA
  };
}

const CATEGORIES = [
  ['wins','Wins','record','higher'], ['losses','Losses','record','lower'], ['winPct','Win percentage','pct','higher'],
  ['ppg','Points per game','number','higher'], ['totalPoints','Total points','integer','higher'],
  ['fgmPg','Field goals made per game','number','higher'], ['fgaPg','Field goals attempted per game','number','higher'], ['fgPct','Field goal percentage','pct100','higher'],
  ['twoMpg','2 point field goals made per game','number','higher'], ['twoApg','2 point field goals attempted per game','number','higher'], ['twoPct','2 point field goal percentage','pct100','higher'],
  ['threeMpg','3 point field goals made per game','number','higher'], ['threeApg','3 point field goals attempted per game','number','higher'], ['threePct','3 point field goal percentage','pct100','higher'],
  ['ftmPg','Free throws made per game','number','higher'], ['ftaPg','Free throws attempted per game','number','higher'], ['ftPct','Free throw percentage','pct100','higher'],
  ['orbPg','Offensive rebounds per game','number','higher'], ['drbPg','Defensive rebounds per game','number','higher'], ['rebPg','Total rebounds per game','number','higher'],
  ['astPg','Assists per game','number','higher'], ['toPg','Turnovers per game','number','lower'], ['astTo','Assist to turnover ratio','number','higher'],
  ['stlPg','Steals per game','number','higher'], ['blkPg','Blocks per game','number','higher'], ['foulPg','Fouls per game','number','lower'],
  ['effPg','Team efficiency per game','number','higher'], ['oppPpg','Points allowed per game','number','lower'], ['margin','Average scoring margin','signed','higher'],
  ['orbTotal','Offensive rebounds, total','integer','higher'], ['drbTotal','Defensive rebounds, total','integer','higher'], ['rebTotal','Total rebounds, total','integer','higher'],
  ['astTotal','Assists, total','integer','higher'], ['toTotal','Turnovers, total','integer','lower'], ['stlTotal','Steals, total','integer','higher'],
  ['blkTotal','Blocks, total','integer','higher'], ['foulTotal','Fouls, total','integer','lower'], ['fgaTotal','Field goal attempts, total','integer','higher'],
  ['threeATotal','3 point attempts, total','integer','higher']
].map(([key,label,format,direction]) => ({key,label,format,direction}));

function rankTeams(allTeams, key, direction) {
  const available = allTeams.filter(team => num(team.metrics[key]) !== null);
  available.sort((a,b) => direction === 'lower' ? a.metrics[key] - b.metrics[key] : b.metrics[key] - a.metrics[key]);
  let last = null, rank = 0;
  const ranks = new Map();
  available.forEach((team,index) => {
    const value = team.metrics[key];
    if (last === null || Math.abs(value - last) > 1e-9) rank = index + 1;
    ranks.set(team.code, rank);
    last = value;
  });
  return ranks;
}

function formatValue(value, format) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
  const n = Number(value);
  if (format === 'integer' || format === 'record') return String(Math.round(n));
  if (format === 'pct') return `${(n * 100).toFixed(1)}%`;
  if (format === 'pct100') return `${n.toFixed(1)}%`;
  if (format === 'signed') return `${n >= 0 ? '+' : ''}${n.toFixed(1)}`;
  return n.toFixed(1);
}

function recommendation(category, usa, fra) {
  const u = usa.metrics[category.key], f = fra.metrics[category.key];
  if (num(u) === null || num(f) === null) return null;
  const usaBetter = category.direction === 'lower' ? u < f : u > f;
  const tied = Math.abs(u - f) < 1e-9;
  return { category: category.label, edge: tied ? 'Even' : (usaBetter ? 'USA' : 'France'), usa: formatValue(u, category.format), france: formatValue(f, category.format) };
}

function buildRecommendations(rows, usa, fra) {
  const byKey = new Map(CATEGORIES.map(category => [category.key, category]));
  const groups = [
    { title: 'Shot quality', keys: ['fgPct','twoPct','threePct','ppg'], note: 'The cleaner shooting profile has the best chance to dictate the half court.' },
    { title: 'Possession battle', keys: ['toPg','astTo','stlPg','astPg'], note: 'The team that protects the ball while creating disruption can keep the final out of scramble mode.' },
    { title: 'Extra possessions', keys: ['orbPg','rebPg','margin','oppPpg'], note: 'Rebounding and defensive control determine whether one empty possession becomes two.' }
  ];
  return groups.map(group => {
    let usaEdges = 0, franceEdges = 0;
    const details = group.keys.map(key => recommendation(byKey.get(key), usa, fra)).filter(Boolean);
    details.forEach(item => { if (item.edge === 'USA') usaEdges += 1; if (item.edge === 'France') franceEdges += 1; });
    const lean = usaEdges === franceEdges ? 'Even' : (usaEdges > franceEdges ? 'USA' : 'France');
    return { ...group, lean, details };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const html = await fetchText(STATS_URL);
    const config = publicFibaApiConfig(html);
    if (!config) throw new Error('FIBA public statistics configuration unavailable');
    const games = await fetchFibaJson(config, 'getgdapgamesbycompetitionid', { gdapCompetitionId: COMPETITION_ID });
    const ids = extractTeamIds(games);
    const resultTable = buildResultTable(games);
    const teamEntries = [...ids.entries()];
    const statsResults = await Promise.allSettled(teamEntries.map(async ([code,id]) => {
      const payload = await fetchFibaJson(config, 'getgdapcompetitionteamstatisticsbyteamid', { gdapTeamId: id });
      return { code, players: playersFromPayload(payload) };
    }));
    const allTeams = [];
    statsResults.forEach((result,index) => {
      if (result.status !== 'fulfilled') return;
      const code = teamEntries[index][0];
      const players = result.value.players;
      if (!players.length) return;
      allTeams.push({ code, metrics: aggregateTeam(players, resultTable.get(code) || {}) });
    });
    const usa = allTeams.find(team => team.code === 'USA');
    const fra = allTeams.find(team => team.code === 'FRA');
    if (!usa || !fra) throw new Error('Finalist team statistics unavailable');
    const categories = CATEGORIES.map(category => {
      const ranks = rankTeams(allTeams, category.key, category.direction);
      return {
        key: category.key,
        label: category.label,
        direction: category.direction,
        usa: { value: formatValue(usa.metrics[category.key], category.format), rank: ranks.get('USA') || null },
        france: { value: formatValue(fra.metrics[category.key], category.format), rank: ranks.get('FRA') || null }
      };
    });
    const recommendations = buildRecommendations(categories, usa, fra);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      competition: 'FIBA Women’s Basketball World Cup 2026',
      through: 'semifinals',
      teamCountRanked: allTeams.length,
      categoryCount: categories.length,
      updatedAt: new Date().toISOString(),
      methodology: 'Values are aggregated from official FIBA competition team/player statistics and completed game results. Rankings compare available teams in the 2026 World Cup field.',
      teams: { USA: TEAM_NAMES.USA, FRA: TEAM_NAMES.FRA },
      categories,
      recommendations
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: error.message || 'FIBA comparison unavailable' });
  }
};