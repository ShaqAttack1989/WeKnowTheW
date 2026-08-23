const LEAGUE_ID = 4516;
const V1_ROOT = 'https://www.thesportsdb.com/api/v1/json';
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const FREE_KEY = '123';
const {
  getWnbaScoreboard,
  getWnbaStandings,
  scoreboardToSportsDbShape
} = require('../lib/wehoop-espn');

const REGULAR_SEASON_WINDOWS = {
  2026: { start: '2026-05-08', end: '2026-09-24' }
};
const REGULAR_SEASON_GAME_COUNTS = { 2026: 44 };
const PLAYOFF_BERTHS = 8;

const CONFERENCES_2026 = {
  eastern: [
    'Atlanta Dream', 'Chicago Sky', 'Connecticut Sun', 'Indiana Fever',
    'New York Liberty', 'Toronto Tempo', 'Washington Mystics'
  ],
  western: [
    'Dallas Wings', 'Golden State Valkyries', 'Las Vegas Aces',
    'Los Angeles Sparks', 'Minnesota Lynx', 'Phoenix Mercury',
    'Portland Fire', 'Seattle Storm'
  ]
};

function normalizedName(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const CONFERENCE_LOOKUP = new Map([
  ...CONFERENCES_2026.eastern.map(name => [normalizedName(name), 'Eastern']),
  ...CONFERENCES_2026.western.map(name => [normalizedName(name), 'Western'])
]);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options.headers || {}) }
  });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) {
    const message = body?.message || body?.Message || body?.error || `TheSportsDB returned ${response.status}`;
    const error = new Error(String(message));
    error.status = response.status;
    throw error;
  }
  return body;
}

async function getSeasonSchedule(season, productionKey) {
  if (productionKey) {
    const body = await fetchJson(
      `${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`,
      { headers: { 'X-API-KEY': productionKey } }
    );
    return { events: Array.isArray(body.schedule) ? body.schedule : [], apiVersion: 'v2' };
  }
  const body = await fetchJson(`${V1_ROOT}/${FREE_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${encodeURIComponent(season)}`);
  return { events: Array.isArray(body.events) ? body.events : [], apiVersion: 'v1-free' };
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function eventTimestamp(event) {
  const timestamp = event.strTimestamp || '';
  if (timestamp) {
    const parsed = Date.parse(timestamp);
    if (Number.isFinite(parsed)) return parsed;
  }
  const date = event.dateEvent || event.dateEventLocal || '';
  const time = event.strTime || event.strTimeLocal || '12:00:00';
  const parsed = Date.parse(`${date}T${String(time).replace('Z','')}Z`);
  return Number.isFinite(parsed) ? parsed : Date.parse(`${date}T12:00:00Z`);
}

function inRegularSeason(event, season) {
  const window = REGULAR_SEASON_WINDOWS[season];
  if (!window) return true;
  const eventDate = asDate(event.dateEvent);
  const start = asDate(window.start);
  const end = asDate(window.end);
  return Boolean(eventDate && start && end && eventDate >= start && eventDate <= end);
}

function scoreValue(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function hasFinalScore(event) {
  const home = scoreValue(event.intHomeScore);
  const away = scoreValue(event.intAwayScore);
  return home !== null && away !== null && home !== away;
}

function isLive(event) {
  if (event.boolCompleted === true) return false;
  if (String(event.strState || '').toLowerCase() === 'in') return true;
  const status = String(event.strStatus || '').trim().toUpperCase();
  if (!status) return false;
  return /(^|\s)(Q[1-4]|[1-4](ST|ND|RD|TH)|OT|HALF(TIME)?)(\s|$)|END\s+(Q[1-4]|[1-4](ST|ND|RD|TH))|IN\s*PROGRESS/.test(status);
}

function isFinished(event) {
  if (!hasFinalScore(event)) return false;
  if (isLive(event)) return false;
  if (event.boolCompleted === true) return true;
  const status = String(event.strStatus || '').toUpperCase();
  if (['FT', 'AET', 'FINAL', 'MATCH FINISHED'].some(value => status.includes(value))) return true;
  const timestamp = eventTimestamp(event);
  return Number.isFinite(timestamp) && timestamp < Date.now();
}

function gameShape(event, fallbackStatus) {
  return {
    id: event.idEvent,
    startTimeUtc: event.strTimestamp || '',
    date: event.dateEvent,
    time: event.strTime || '',
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeScore: scoreValue(event.intHomeScore),
    awayScore: scoreValue(event.intAwayScore),
    venue: event.strVenue || '',
    status: event.strStatus || fallbackStatus,
    state: event.strState || '',
    period: scoreValue(event.intPeriod),
    clock: event.strClock || '',
    broadcasts: Array.isArray(event.strBroadcasts) ? event.strBroadcasts : [],
    completed: event.boolCompleted === true
  };
}

function teamFromEvent(event, side) {
  const home = side === 'home';
  return { id: home ? event.idHomeTeam : event.idAwayTeam, full_name: home ? event.strHomeTeam : event.strAwayTeam };
}

function conferenceForTeam(name) {
  return CONFERENCE_LOOKUP.get(normalizedName(name)) || 'Unknown';
}

function recordLabel(wins, losses) { return `${wins}-${losses}`; }
function gamesBack(leader, record) {
  if (!leader || leader === record) return 0;
  return ((leader.wins - record.wins) + (record.losses - leader.losses)) / 2;
}

function enrichRankings(records, rankKey = 'rank') {
  const sorted = [...records].sort((a, b) =>
    Number(b.win_percentage) - Number(a.win_percentage) ||
    b.wins - a.wins || a.losses - b.losses ||
    a.team.full_name.localeCompare(b.team.full_name)
  );
  const leader = sorted[0] || null;
  return sorted.map((record, index) => ({ ...record, [rankKey]: index + 1, games_back: Number.isFinite(Number(record.games_back)) ? Number(record.games_back) : gamesBack(leader, record) }));
}

function deriveStandings(events) {
  const records = new Map();
  function ensure(team) {
    if (!team?.id || !team?.full_name) return null;
    if (!records.has(team.id)) {
      records.set(team.id, {
        team, conference: conferenceForTeam(team.full_name), wins: 0, losses: 0,
        homeWins: 0, homeLosses: 0, roadWins: 0, roadLosses: 0,
        confWins: 0, confLosses: 0, games: []
      });
    }
    return records.get(team.id);
  }

  for (const event of events) {
    if (!isFinished(event)) continue;
    const home = ensure(teamFromEvent(event, 'home'));
    const away = ensure(teamFromEvent(event, 'away'));
    if (!home || !away) continue;
    const homeScore = scoreValue(event.intHomeScore);
    const awayScore = scoreValue(event.intAwayScore);
    if (homeScore === null || awayScore === null || homeScore === awayScore) continue;
    const homeWon = homeScore > awayScore;
    const sameConference = home.conference !== 'Unknown' && home.conference === away.conference;
    const sortKey = `${event.strTimestamp || event.dateEvent || ''}-${event.strTime || ''}-${event.idEvent || ''}`;

    if (homeWon) {
      home.wins++; home.homeWins++; away.losses++; away.roadLosses++;
      if (sameConference) { home.confWins++; away.confLosses++; }
    } else {
      home.losses++; home.homeLosses++; away.wins++; away.roadWins++;
      if (sameConference) { home.confLosses++; away.confWins++; }
    }
    home.games.push({ sortKey, won: homeWon });
    away.games.push({ sortKey, won: !homeWon });
  }

  const baseRecords = [...records.values()].map(record => {
    const played = record.wins + record.losses;
    const recentGames = [...record.games].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    const latest = recentGames[0];
    let streakCount = 0;
    if (latest) {
      for (const game of recentGames) {
        if (game.won !== latest.won) break;
        streakCount++;
      }
    }
    const lastTen = recentGames.slice(0, 10);
    const lastTenWins = lastTen.filter(game => game.won).length;
    return {
      team: record.team,
      conference: record.conference,
      wins: record.wins,
      losses: record.losses,
      win_percentage: played ? record.wins / played : 0,
      conference_record: recordLabel(record.confWins, record.confLosses),
      conference_wins: record.confWins,
      conference_losses: record.confLosses,
      home_record: recordLabel(record.homeWins, record.homeLosses),
      road_record: recordLabel(record.roadWins, record.roadLosses),
      streak: latest ? `${latest.won ? 'W' : 'L'}${streakCount}` : '—',
      last_ten: recordLabel(lastTenWins, lastTen.length - lastTenWins),
      games_played: played
    };
  });

  return standingsFromRecords(baseRecords);
}

function standingsFromRecords(records) {
  const withConference = records.map(record => ({
    ...record,
    conference: record.conference || conferenceForTeam(record.team?.full_name)
  }));
  const overall = enrichRankings(withConference, 'overall_rank').map(record => ({ ...record, playoff_seed: record.overall_rank }));
  const eastern = enrichRankings(withConference.filter(record => record.conference === 'Eastern'), 'conference_rank');
  const western = enrichRankings(withConference.filter(record => record.conference === 'Western'), 'conference_rank');
  return { overall, conferences: { eastern, western } };
}

function guaranteedPlayoffStatuses(records, season) {
  const seasonGames = REGULAR_SEASON_GAME_COUNTS[season];
  if (!seasonGames || records.length < PLAYOFF_BERTHS) return new Map();
  const cutoffWins = Number(records[PLAYOFF_BERTHS - 1]?.wins);
  if (!Number.isFinite(cutoffWins)) return new Map();
  const maximumWins = record => Number(record.wins) + Math.max(0, seasonGames - Number(record.games_played || 0));
  return new Map(records.map(record => {
    const key = normalizedName(record.team?.full_name);
    const maxWins = maximumWins(record);
    if (maxWins < cutoffWins) return [key, 'eliminated'];
    const possibleTeamsAtOrAbove = records.filter(other =>
      normalizedName(other.team?.full_name) !== key && maximumWins(other) >= Number(record.wins)
    ).length;
    if (possibleTeamsAtOrAbove < PLAYOFF_BERTHS) return [key, 'clinched'];
    return [key, null];
  }).filter(([, status]) => status));
}

function pastGames(events, limit = 64) {
  return events.filter(event => isFinished(event) && hasFinalScore(event))
    .sort((a, b) => eventTimestamp(b) - eventTimestamp(a))
    .slice(0, limit)
    .map(event => gameShape(event, 'Final'));
}

function liveGames(events, limit = 16) {
  return events
    .filter(event => isLive(event))
    .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))
    .slice(0, limit)
    .map(event => gameShape(event, 'Live'));
}

function upcomingGames(events, limit = 64) {
  const now = Date.now();
  return events
    .filter(event => !isFinished(event) && !isLive(event) && Number.isFinite(eventTimestamp(event)) && eventTimestamp(event) >= now)
    .sort((a, b) => eventTimestamp(a) - eventTimestamp(b))
    .slice(0, limit)
    .map(event => gameShape(event, 'Scheduled'));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestedSeason = Number(req.query.season);
  const season = Number.isInteger(requestedSeason) && requestedSeason >= 1997 && requestedSeason <= 2100 ? requestedSeason : new Date().getFullYear();
  const productionKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  const providerErrors = [];
  let sportsDbEvents = [];
  let apiVersion = productionKey ? 'v2' : 'v1-free';
  let espnEvents = [];
  let espnStandings = [];

  try {
    const result = await getSeasonSchedule(season, productionKey);
    sportsDbEvents = result.events;
    apiVersion = result.apiVersion;
  } catch (error) {
    providerErrors.push({ source: 'TheSportsDB', message: error.message, status: error.status || null });
  }

  const [scoreboardResult, standingsResult] = await Promise.allSettled([
    getWnbaScoreboard(season),
    getWnbaStandings(season)
  ]);
  if (scoreboardResult.status === 'fulfilled') espnEvents = scoreboardResult.value;
  else providerErrors.push({ source: 'SportsDataverse/WeHoop ESPN scoreboard', message: scoreboardResult.reason.message, status: scoreboardResult.reason.status || null });
  if (standingsResult.status === 'fulfilled') espnStandings = standingsResult.value;
  else providerErrors.push({ source: 'SportsDataverse/WeHoop ESPN standings', message: standingsResult.reason.message, status: standingsResult.reason.status || null });

  const sportsDbRegular = sportsDbEvents.filter(event => inRegularSeason(event, season));
  const espnRegular = espnEvents.map(scoreboardToSportsDbShape).filter(event => inRegularSeason(event, season));
  const sportsDbComplete = sportsDbRegular.length >= 100;
  const espnComplete = espnRegular.length >= 100;
  const primaryEvents = sportsDbComplete ? sportsDbRegular : espnRegular.length ? espnRegular : sportsDbRegular;
  const eventSource = sportsDbComplete ? 'TheSportsDB' : espnRegular.length ? 'SportsDataverse/WeHoop ESPN bridge' : 'TheSportsDB';

  let standingsData;
  let standingsSource;
  if (sportsDbComplete) {
    standingsData = deriveStandings(sportsDbRegular);
    standingsSource = 'TheSportsDB';
  } else if (espnStandings.length) {
    standingsData = standingsFromRecords(espnStandings);
    standingsSource = 'SportsDataverse/WeHoop ESPN bridge';
  } else {
    standingsData = deriveStandings(primaryEvents);
    standingsSource = eventSource;
  }

  // ESPN publishes the official x/e playoff markers. Preserve them even when
  // the more complete event feed supplies the displayed standings records.
  const playoffStatusByTeam = new Map(espnStandings
    .filter(record => record.playoff_status)
    .map(record => [normalizedName(record.team?.full_name), record.playoff_status]));
  const withPlayoffStatus = record => ({
    ...record,
    playoff_status: playoffStatusByTeam.get(normalizedName(record.team?.full_name)) || record.playoff_status || null
  });
  standingsData = {
    overall: standingsData.overall.map(withPlayoffStatus),
    conferences: {
      eastern: standingsData.conferences.eastern.map(withPlayoffStatus),
      western: standingsData.conferences.western.map(withPlayoffStatus)
    }
  };
  const guaranteedStatusByTeam = guaranteedPlayoffStatuses(standingsData.overall, season);
  const withGuaranteedStatus = record => ({
    ...record,
    playoff_status: record.playoff_status || guaranteedStatusByTeam.get(normalizedName(record.team?.full_name)) || null
  });
  standingsData = {
    overall: standingsData.overall.map(withGuaranteedStatus),
    conferences: {
      eastern: standingsData.conferences.eastern.map(withGuaranteedStatus),
      western: standingsData.conferences.western.map(withGuaranteedStatus)
    }
  };

  const completedGames = pastGames(primaryEvents);
  const currentGames = liveGames(espnRegular.length ? espnRegular : primaryEvents);
  const scheduledGames = upcomingGames(primaryEvents);
  const fullSeasonAccess = sportsDbComplete || espnComplete || standingsData.overall.length >= 10;

  if (!primaryEvents.length && !standingsData.overall.length) {
    return res.status(502).json({
      error: 'No live WNBA data provider returned usable data.',
      configured: Boolean(productionKey),
      season,
      providerErrors
    });
  }

  res.setHeader('Cache-Control', currentGames.length ? 's-maxage=15, stale-while-revalidate=30' : 's-maxage=300, stale-while-revalidate=900');
  return res.status(200).json({
    configured: Boolean(productionKey),
    source: sportsDbComplete ? 'TheSportsDB + SportsDataverse/WeHoop ESPN backup' : 'SportsDataverse/WeHoop ESPN bridge + TheSportsDB backup',
    sources: ['TheSportsDB', 'SportsDataverse/WeHoop ESPN bridge'],
    eventSource,
    standingsSource,
    wehoopFallbackActive: !sportsDbComplete && (espnRegular.length > 0 || espnStandings.length > 0),
    apiVersion,
    season,
    updatedAt: new Date().toISOString(),
    eventCount: primaryEvents.length,
    regularSeasonEventCount: primaryEvents.length,
    fullSeasonAccess,
    standings: standingsData.overall,
    conferenceStandings: standingsData.conferences,
    pastGames: completedGames,
    recentResults: completedGames,
    liveGames: currentGames,
    upcomingGames: scheduledGames,
    providerErrors,
    providerMessage: fullSeasonAccess
      ? (!sportsDbComplete && eventSource.includes('WeHoop') ? 'Primary feed gaps are being filled by the SportsDataverse/WeHoop ESPN bridge.' : null)
      : 'Live providers returned partial season coverage; We Know the W is showing only verified returned data.'
  });
};
