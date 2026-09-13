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

function keyNorm(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function firstNum(object, aliases = [], patterns = []) {
  if (!object || typeof object !== 'object') return null;
  for (const alias of aliases) {
    const value = num(object[alias]);
    if (value !== null) return value;
  }
  const normalized = new Map(Object.entries(object).map(([key, value]) => [keyNorm(key), value]));
  for (const alias of aliases) {
    const value = num(normalized.get(keyNorm(alias)));
    if (value !== null) return value;
  }
  for (const [key, value] of normalized.entries()) {
    if (patterns.some(pattern => pattern.test(key))) {
      const parsed = num(value);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function teamCode(team = {}) {
  return String(team.code || team.shortName || team.nationality || '').toUpperCase();
}

function teamId(team = {}) {
  return firstNum(team, ['gdapTeamId', 'teamId', 'id', 'teamID']);
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
  if (typeof value === 'object' && value) return num(value.score ?? value.total ?? value.points ?? value.value);
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
  if (Array.isArray(payload?.playerInCompetitionTeamStatistics)) return payload.playerInCompetitionTeamStatistics;
  for (const value of Object.values(payload || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.playerInCompetitionTeamStatistics)) return value.playerInCompetitionTeamStatistics;
  }
  return [];
}

const SPECS = {
  fgm: { total: ['totalFieldGoalsMade','fieldGoalsMade'], pg: ['fieldGoalsMadePerGame','fieldGoalsMadePG'], totalPatterns: [/^totalfieldgoalsmade$/, /^fieldgoalsmade$/], pgPatterns: [/fieldgoalsmadepergame$/, /fieldgoalsmadepg$/] },
  fga: { total: ['totalFieldGoalsAttempted','fieldGoalsAttempted','fieldGoalAttempts'], pg: ['fieldGoalsAttemptedPerGame','fieldGoalAttemptsPerGame','fieldGoalsAttemptedPG'], totalPatterns: [/^totalfieldgoalsattempted$/, /^fieldgoalsattempted$/, /^fieldgoalattempts$/], pgPatterns: [/fieldgoalsattemptedpergame$/, /fieldgoalattemptspergame$/] },
  threeM: { total: ['totalThreePointsMade','totalThreePointFieldGoalsMade','threePointsMade','threePointFieldGoalsMade'], pg: ['threePointsMadePerGame','threePointFieldGoalsMadePerGame','threePointsMadePG'], totalPatterns: [/three.*point.*made$/], pgPatterns: [/three.*point.*madepergame$/, /three.*point.*madepg$/] },
  threeA: { total: ['totalThreePointsAttempted','totalThreePointFieldGoalsAttempted','threePointsAttempted','threePointFieldGoalsAttempted','threePointAttempts'], pg: ['threePointsAttemptedPerGame','threePointFieldGoalsAttemptedPerGame','threePointAttemptsPerGame'], totalPatterns: [/three.*point.*attempt/], pgPatterns: [/three.*point.*attempt.*pergame$/] },
  twoM: { total: ['totalTwoPointsMade','totalTwoPointFieldGoalsMade','twoPointsMade','twoPointFieldGoalsMade'], pg: ['twoPointsMadePerGame','twoPointFieldGoalsMadePerGame'], totalPatterns: [/two.*point.*made$/], pgPatterns: [/two.*point.*madepergame$/] },
  twoA: { total: ['totalTwoPointsAttempted','totalTwoPointFieldGoalsAttempted','twoPointsAttempted','twoPointFieldGoalsAttempted','twoPointAttempts'], pg: ['twoPointsAttemptedPerGame','twoPointFieldGoalsAttemptedPerGame','twoPointAttemptsPerGame'], totalPatterns: [/two.*point.*attempt/], pgPatterns: [/two.*point.*attempt.*pergame$/] },
  ftm: { total: ['totalFreeThrowsMade','totalFreeThrowMade','freeThrowsMade','freeThrowMade'], pg: ['freeThrowsMadePerGame','freeThrowMadePerGame'], totalPatterns: [/free.*throw.*made$/], pgPatterns: [/free.*throw.*madepergame$/] },
  fta: { total: ['totalFreeThrowsAttempted','totalFreeThrowAttempted','freeThrowsAttempted','freeThrowAttempted','freeThrowAttempts'], pg: ['freeThrowsAttemptedPerGame','freeThrowAttemptedPerGame','freeThrowAttemptsPerGame'], totalPatterns: [/free.*throw.*attempt/], pgPatterns: [/free.*throw.*attempt.*pergame$/] },
  orb: { total: ['totalOffensiveRebounds','offensiveRebounds','offensiveRebound','offensiveBoards','offensiveReboundsTotal'], pg: ['offensiveReboundsPerGame','offensiveReboundPerGame','offensiveReboundsPG','offensiveRebounds_PG','orpg'], totalPatterns: [/^totaloffensiverebounds?$/, /^offensiverebounds?$/, /^offensiveboards$/], pgPatterns: [/offensiverebounds?pergame$/, /offensivereboundspg$/, /^orpg$/] },
  drb: { total: ['totalDefensiveRebounds','defensiveRebounds','defensiveRebound','defensiveBoards','defensiveReboundsTotal'], pg: ['defensiveReboundsPerGame','defensiveReboundPerGame','defensiveReboundsPG','defensiveRebounds_PG','drpg'], totalPatterns: [/^totaldefensiverebounds?$/, /^defensiverebounds?$/, /^defensiveboards$/], pgPatterns: [/defensiverebounds?pergame$/, /defensivereboundspg$/, /^drpg$/] },
  rebounds: { total: ['totalRebounds','rebounds','reboundsTotal'], pg: ['reboundsPerGame','totalReboundsPerGame','reboundsPG','rpg'], totalPatterns: [/^totalrebounds$/, /^rebounds$/], pgPatterns: [/totalreboundspergame$/, /^reboundspergame$/, /^rpg$/] },
  assists: { total: ['totalAssists','assists'], pg: ['assistsPerGame','assistsPG','apg'], totalPatterns: [/^totalassists$/, /^assists$/], pgPatterns: [/assist.*pergame$/, /^apg$/] },
  turnovers: { total: ['totalTurnovers','turnovers'], pg: ['turnoversPerGame','turnoversPG','topg'], totalPatterns: [/^totalturnovers$/, /^turnovers$/], pgPatterns: [/turnoverspergame$/, /^topg$/] },
  steals: { total: ['totalSteals','steals'], pg: ['stealsPerGame','stealsPG','spg'], totalPatterns: [/^totalsteals$/, /^steals$/], pgPatterns: [/stealspergame$/, /^spg$/] },
  blocks: { total: ['totalBlocks','blocks','blockedShots','totalBlockedShots'], pg: ['blocksPerGame','blockedShotsPerGame','blocksPG','bpg'], totalPatterns: [/^totalblocks$/, /^blocks$/, /^blockedshots$/], pgPatterns: [/blockspergame$/, /blockedshotspergame$/, /^bpg$/] },
  fouls: { total: ['totalFouls','totalPersonalFouls','fouls','personalFouls'], pg: ['foulsPerGame','personalFoulsPerGame','foulsPG'], totalPatterns: [/^totalpersonalfouls$/, /^totalfouls$/, /^personalfouls$/, /^fouls$/], pgPatterns: [/personalfoulspergame$/, /foulspergame$/] }
};

function gamesPlayed(player = {}) {
  return firstNum(player, ['totalGamesPlayed','gamesPlayed','games','gp'], [/totalgamesplayed$/, /^gamesplayed$/, /^gp$/]);
}

function sumStat(players, spec) {
  let total = 0;
  let found = false;
  for (const player of players) {
    let value = firstNum(player, spec.total, spec.totalPatterns);
    if (value === null) {
      const pg = firstNum(player, spec.pg, spec.pgPatterns);
      const gp = gamesPlayed(player);
      if (pg !== null && gp !== null) value = pg * gp;
    }
    if (value !== null) { total += value; found = true; }
  }
  return found ? total : null;
}

function safeDivide(a, b, factor = 1) {
  return a !== null && b !== null && b !== 0 ? (a / b) * factor : null;
}

function aggregateTeam(players, result = {}) {
  const games = result.games || Math.max(0, ...players.map(player => gamesPlayed(player) || 0));
  const totalPoints = result.pointsFor || players.reduce((sum, player) => {
    const total = firstNum(player, ['totalPoints','points'], [/^totalpoints$/, /^points$/]);
    if (total !== null) return sum + total;
    const pg = firstNum(player, ['pointsPerGame','ppg'], [/pointspergame$/, /^ppg$/]);
    const gp = gamesPlayed(player);
    return sum + (pg !== null && gp !== null ? pg * gp : 0);
  }, 0);
  const fgm = sumStat(players, SPECS.fgm);
  const fga = sumStat(players, SPECS.fga);
  const threeM = sumStat(players, SPECS.threeM);
  const threeA = sumStat(players, SPECS.threeA);
  const twoMDirect = sumStat(players, SPECS.twoM);
  const twoADirect = sumStat(players, SPECS.twoA);
  const twoM = twoMDirect ?? (fgm !== null && threeM !== null ? fgm - threeM : null);
  const twoA = twoADirect ?? (fga !== null && threeA !== null ? fga - threeA : null);
  const ftm = sumStat(players, SPECS.ftm);
  const fta = sumStat(players, SPECS.fta);
  const orb = sumStat(players, SPECS.orb);
  const drb = sumStat(players, SPECS.drb);
  const reboundsDirect = sumStat(players, SPECS.rebounds);
  const rebounds = reboundsDirect ?? (orb !== null && drb !== null ? orb + drb : null);
  const assists = sumStat(players, SPECS.assists);
  const turnovers = sumStat(players, SPECS.turnovers);
  const steals = sumStat(players, SPECS.steals);
  const blocks = sumStat(players, SPECS.blocks);
  const fouls = sumStat(players, SPECS.fouls);
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
    ppg: pg(totalPoints), totalPoints,
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
  ['wins','Wins','record','higher','Record'], ['losses','Losses','record','lower','Record'], ['winPct','Win percentage','pct','higher','Record'],
  ['ppg','Points per game','number','higher','Scoring'], ['totalPoints','Total points','integer','higher','Scoring'],
  ['fgmPg','Field goals made per game','number','higher','Shooting'], ['fgaPg','Field goals attempted per game','number','higher','Shooting'], ['fgPct','Field goal percentage','pct100','higher','Shooting'],
  ['twoMpg','2 point field goals made per game','number','higher','Shooting'], ['twoApg','2 point field goals attempted per game','number','higher','Shooting'], ['twoPct','2 point field goal percentage','pct100','higher','Shooting'],
  ['threeMpg','3 point field goals made per game','number','higher','Shooting'], ['threeApg','3 point field goals attempted per game','number','higher','Shooting'], ['threePct','3 point field goal percentage','pct100','higher','Shooting'],
  ['ftmPg','Free throws made per game','number','higher','Shooting'], ['ftaPg','Free throws attempted per game','number','higher','Shooting'], ['ftPct','Free throw percentage','pct100','higher','Shooting'],
  ['orbPg','Offensive rebounds per game','number','higher','Rebounding'], ['drbPg','Defensive rebounds per game','number','higher','Rebounding'], ['rebPg','Total rebounds per game','number','higher','Rebounding'],
  ['astPg','Assists per game','number','higher','Possessions'], ['toPg','Turnovers per game','number','lower','Possessions'], ['astTo','Assist to turnover ratio','number','higher','Possessions'],
  ['stlPg','Steals per game','number','higher','Defense'], ['blkPg','Blocks per game','number','higher','Defense'], ['foulPg','Fouls per game','number','lower','Defense'],
  ['effPg','Team efficiency per game','number','higher','Team impact'], ['oppPpg','Points allowed per game','number','lower','Team impact'], ['margin','Average scoring margin','signed','higher','Team impact'],
  ['orbTotal','Offensive rebounds, total','integer','higher','Totals'], ['drbTotal','Defensive rebounds, total','integer','higher','Totals'], ['rebTotal','Total rebounds, total','integer','higher','Totals'],
  ['astTotal','Assists, total','integer','higher','Totals'], ['toTotal','Turnovers, total','integer','lower','Totals'], ['stlTotal','Steals, total','integer','higher','Totals'],
  ['blkTotal','Blocks, total','integer','higher','Totals'], ['foulTotal','Fouls, total','integer','lower','Totals'], ['fgaTotal','Field goal attempts, total','integer','higher','Totals'],
  ['threeATotal','3 point attempts, total','integer','higher','Totals']
].map(([key,label,format,direction,group]) => ({key,label,format,direction,group}));

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
  if (!category) return null;
  const u = usa.metrics[category.key], f = fra.metrics[category.key];
  if (num(u) === null || num(f) === null) return null;
  const usaBetter = category.direction === 'lower' ? u < f : u > f;
  const tied = Math.abs(u - f) < 1e-9;
  return { category: category.label, edge: tied ? 'Even' : (usaBetter ? 'USA' : 'France'), usa: formatValue(u, category.format), france: formatValue(f, category.format) };
}

function buildRecommendations(usa, fra) {
  const byKey = new Map(CATEGORIES.map(category => [category.key, category]));
  const groups = [
    { title: 'Shot quality', keys: ['fgPct','twoPct','threePct','ppg'], note: 'France has the cleaner scoring profile. USA needs to contest the arc without giving up direct drives and paint touches.' },
    { title: 'Possession battle', keys: ['toPg','astTo','stlPg','astPg'], note: 'Ball security and creation matter more than raw pace. The team that wins the turnover exchange can control where the final is played.' },
    { title: 'Extra possessions', keys: ['orbPg','drbPg','rebPg','oppPpg'], note: 'USA can offset France’s shooting edge by ending possessions cleanly and creating second chances on the offensive glass.' }
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
        group: category.group,
        label: category.label,
        direction: category.direction,
        usa: { value: formatValue(usa.metrics[category.key], category.format), rank: ranks.get('USA') || null },
        france: { value: formatValue(fra.metrics[category.key], category.format), rank: ranks.get('FRA') || null }
      };
    });
    const missing = categories.filter(row => row.usa.value === '—' || row.france.value === '—').map(row => row.label);
    const recommendations = buildRecommendations(usa, fra);
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=360');
    return res.status(200).json({
      competition: 'FIBA Women’s Basketball World Cup 2026',
      through: 'semifinals',
      teamCountRanked: allTeams.length,
      categoryCount: categories.length,
      completeCategoryCount: categories.length - missing.length,
      missingCategories: missing,
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