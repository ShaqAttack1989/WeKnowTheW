const SITE_ROOT = 'https://site.api.espn.com/apis/site/v2/sports/basketball';
const WEB_ROOT = 'https://site.web.api.espn.com/apis/v2/sports/basketball';

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',
      Referer: 'https://www.espn.com/'
    }
  });

  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!response.ok) {
    const message = body?.message || body?.error || `ESPN returned ${response.status}`;
    const error = new Error(String(message));
    error.status = response.status;
    throw error;
  }

  return body;
}

function numberValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(typeof value === 'object' ? value.value : value);
  return Number.isFinite(number) ? number : null;
}

function isoParts(value = '') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  const iso = date.toISOString();
  return { date: iso.slice(0, 10), time: `${iso.slice(11, 19)}Z` };
}

function normalizeScoreboardEvent(event = {}) {
  const competition = Array.isArray(event.competitions) ? event.competitions[0] || {} : {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find(item => item.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find(item => item.homeAway === 'away') || competitors[1] || {};
  const startTimeUtc = event.date || competition.date || '';
  const parts = isoParts(startTimeUtc);
  const statusType = event.status?.type || competition.status?.type || {};
  const status = event.status || competition.status || {};
  const broadcasts = [...new Set((Array.isArray(competition.broadcasts) ? competition.broadcasts : [])
    .flatMap(item => Array.isArray(item.names) ? item.names : [])
    .filter(Boolean))];

  return {
    id: String(event.id || competition.id || ''),
    startTimeUtc,
    date: parts.date,
    time: parts.time,
    homeTeamId: String(home.team?.id || home.id || ''),
    homeTeam: home.team?.displayName || home.team?.shortDisplayName || home.team?.name || '',
    awayTeamId: String(away.team?.id || away.id || ''),
    awayTeam: away.team?.displayName || away.team?.shortDisplayName || away.team?.name || '',
    homeScore: numberValue(home.score),
    awayScore: numberValue(away.score),
    venue: competition.venue?.fullName || competition.venue?.address?.city || '',
    status: statusType.shortDetail || statusType.detail || statusType.description || statusType.name || '',
    state: statusType.state || '',
    period: numberValue(status.period),
    clock: status.displayClock || '',
    broadcasts,
    completed: Boolean(statusType.completed),
    neutralSite: Boolean(competition.neutralSite),
    source: 'ESPN via WeHoop-compatible endpoint'
  };
}

function scoreboardToSportsDbShape(event = {}) {
  return {
    idEvent: event.id,
    strTimestamp: event.startTimeUtc,
    dateEvent: event.date,
    strTime: event.time,
    idHomeTeam: event.homeTeamId,
    strHomeTeam: event.homeTeam,
    idAwayTeam: event.awayTeamId,
    strAwayTeam: event.awayTeam,
    intHomeScore: event.homeScore,
    intAwayScore: event.awayScore,
    strVenue: event.venue,
    strStatus: event.completed ? 'Final' : event.status,
    strState: event.state,
    intPeriod: event.period,
    strClock: event.clock,
    strBroadcasts: event.broadcasts,
    boolCompleted: event.completed
  };
}

function statMap(entry = {}) {
  const map = new Map();
  for (const stat of Array.isArray(entry.stats) ? entry.stats : []) {
    const keys = [stat.name, stat.abbreviation, stat.shortDisplayName, stat.displayName]
      .filter(Boolean)
      .map(value => String(value).toLowerCase().replace(/[^a-z0-9]/g, ''));
    for (const key of keys) map.set(key, stat);
  }
  return map;
}

function findStat(map, keys = []) {
  for (const key of keys) {
    const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (map.has(normalized)) return map.get(normalized);
  }
  return null;
}

function displayStat(map, keys, fallback = '—') {
  const stat = findStat(map, keys);
  if (!stat) return fallback;
  return stat.displayValue ?? stat.value ?? fallback;
}

function numericStat(map, keys, fallback = 0) {
  const stat = findStat(map, keys);
  if (!stat) return fallback;
  const value = numberValue(stat.value ?? stat.displayValue);
  return value === null ? fallback : value;
}

function normalizeStandings(body = {}) {
  const entries = body?.standings?.entries;
  if (!Array.isArray(entries)) return [];

  return entries.map((entry, index) => {
    const stats = statMap(entry);
    const wins = numericStat(stats, ['wins', 'w']);
    const losses = numericStat(stats, ['losses', 'l']);
    const games = wins + losses;
    const winPct = numericStat(stats, ['winPercent', 'winPercentage', 'pct'], games ? wins / games : 0);
    const rank = numericStat(stats, ['playoffSeed', 'rank'], index + 1);
    const clincher = String(displayStat(stats, ['clincher'], '')).trim().toLowerCase();

    return {
      team: {
        id: String(entry.team?.id || ''),
        full_name: entry.team?.displayName || entry.team?.shortDisplayName || entry.team?.name || ''
      },
      wins,
      losses,
      win_percentage: winPct,
      games_back: numericStat(stats, ['gamesBehind', 'gb'], 0),
      conference_record: displayStat(stats, ['vsConf', 'vsConference', 'conferenceRecord']),
      home_record: displayStat(stats, ['home', 'homeRecord']),
      road_record: displayStat(stats, ['road', 'away', 'roadRecord', 'awayRecord']),
      streak: displayStat(stats, ['streak']),
      last_ten: displayStat(stats, ['lastTenGames', 'lastTen', 'l10']),
      games_played: games,
      overall_rank: rank,
      playoff_seed: rank,
      playoff_status: clincher === 'x' ? 'clinched' : clincher === 'e' ? 'eliminated' : null,
      source: 'ESPN via WeHoop-compatible endpoint'
    };
  }).filter(record => record.team.id && record.team.full_name);
}

function normalizeTeams(body = {}) {
  const teams = body?.sports?.[0]?.leagues?.[0]?.teams;
  if (!Array.isArray(teams)) return [];
  return teams.map(item => item?.team || item).filter(Boolean).map(team => ({
    id: String(team.id || ''),
    name: team.displayName || team.shortDisplayName || team.name || '',
    abbreviation: team.abbreviation || '',
    color: team.color || '',
    alternateColor: team.alternateColor || ''
  })).filter(team => team.id && team.name);
}

function flattenRosterAthletes(value) {
  if (!Array.isArray(value)) return [];
  const output = [];
  for (const item of value) {
    if (!item) continue;
    if (Array.isArray(item.items)) output.push(...item.items);
    else if (Array.isArray(item.athletes)) output.push(...item.athletes);
    else if (item.id && (item.displayName || item.fullName || item.firstName || item.lastName)) output.push(item);
  }
  return output;
}

function normalizeRoster(body = {}, team = {}) {
  return flattenRosterAthletes(body.athletes).map(athlete => {
    const id = String(athlete.id || '');
    const headshot = String(athlete.headshot?.href || athlete.headshot || '').trim();
    const fallbackHeadshot = id ? `https://a.espncdn.com/i/headshots/wnba/players/full/${encodeURIComponent(id)}.png` : '';
    return {
      id,
      name: athlete.displayName || athlete.fullName || [athlete.firstName, athlete.lastName].filter(Boolean).join(' '),
      firstName: athlete.firstName || '',
      lastName: athlete.lastName || '',
      teamId: String(team.id || athlete.team?.id || ''),
      team: team.name || athlete.team?.displayName || '',
      position: athlete.position?.displayName || athlete.position?.name || athlete.position?.abbreviation || '',
      number: athlete.jersey || '',
      height: athlete.displayHeight || '',
      weight: athlete.displayWeight || '',
      headshot: headshot || fallbackHeadshot,
      active: athlete.status?.type ? athlete.status.type === 'active' : athlete.active !== false,
      source: 'ESPN via WeHoop-compatible endpoint'
    };
  }).filter(player => player.id && player.name);
}

function normalizeInjuries(body = {}) {
  const teams = Array.isArray(body.injuries) ? body.injuries : [];
  return teams.flatMap(team => (Array.isArray(team.injuries) ? team.injuries : []).map(item => ({
    id: String(item.id || ''),
    name: item.athlete?.displayName || [item.athlete?.firstName, item.athlete?.lastName].filter(Boolean).join(' '),
    athleteId: String(item.athlete?.id || ''),
    team: team.displayName || item.athlete?.team?.displayName || '',
    teamId: String(team.id || item.athlete?.team?.id || ''),
    status: item.status || item.type?.description || '',
    injury: item.details?.type || item.type?.description || '',
    side: item.details?.side || '',
    date: item.date || '',
    returnDate: item.details?.returnDate || '',
    shortComment: item.shortComment || '',
    longComment: item.longComment || '',
    source: 'ESPN via WeHoop-compatible endpoint'
  })).filter(item => item.name));
}

function normalizeTransactions(body = {}) {
  const items = Array.isArray(body.transactions) ? body.transactions
    : Array.isArray(body.items) ? body.items
      : [];

  return items.map(item => ({
    id: String(item.id || ''),
    date: item.date || item.effectiveDate || '',
    type: item.type?.description || item.type?.text || item.type || '',
    description: item.description || item.shortDescription || item.text || '',
    name: item.athlete?.displayName || item.player?.displayName || '',
    athleteId: String(item.athlete?.id || item.player?.id || ''),
    team: item.team?.displayName || item.toTeam?.displayName || item.to?.displayName || '',
    fromTeam: item.fromTeam?.displayName || item.from?.displayName || '',
    source: 'ESPN via WeHoop-compatible endpoint'
  })).filter(item => item.description || item.name);
}

async function getWnbaScoreboard(season) {
  const body = await fetchJson(`${SITE_ROOT}/wnba/scoreboard?limit=1000&dates=${encodeURIComponent(season)}`);
  return (Array.isArray(body.events) ? body.events : []).map(normalizeScoreboardEvent).filter(event => event.id);
}

async function getWnbaStandings(season) {
  const url = `${WEB_ROOT}/wnba/standings?region=us&lang=en&contentorigin=espn&type=0&level=1&sort=winpercent%3Adesc%2Cwins%3Adesc%2Cgamesbehind%3Aasc&season=${encodeURIComponent(season)}`;
  return normalizeStandings(await fetchJson(url));
}

async function getWnbaTeams() {
  return normalizeTeams(await fetchJson(`${SITE_ROOT}/wnba/teams?limit=1000`));
}

async function getWnbaTeamRoster(team, season) {
  const body = await fetchJson(`${SITE_ROOT}/wnba/teams/${encodeURIComponent(team.id)}/roster?season=${encodeURIComponent(season)}`);
  return normalizeRoster(body, team);
}

async function getWnbaRosters(season) {
  const teams = await getWnbaTeams();
  const results = await Promise.allSettled(teams.map(team => getWnbaTeamRoster(team, season)));
  return {
    teams,
    players: results.filter(result => result.status === 'fulfilled').flatMap(result => result.value),
    failedRosters: results.filter(result => result.status === 'rejected').length
  };
}

async function getWnbaInjuries() {
  return normalizeInjuries(await fetchJson(`${SITE_ROOT}/wnba/injuries`));
}

async function getWnbaTransactions(season, limit = 250) {
  const body = await fetchJson(`${SITE_ROOT}/wnba/transactions?season=${encodeURIComponent(season)}&limit=${encodeURIComponent(limit)}`);
  return normalizeTransactions(body);
}

module.exports = {
  getWnbaScoreboard,
  getWnbaStandings,
  getWnbaTeams,
  getWnbaTeamRoster,
  getWnbaRosters,
  getWnbaInjuries,
  getWnbaTransactions,
  scoreboardToSportsDbShape
};
