const LEAGUE_ID = 4516;
const V1_ROOT = 'https://www.thesportsdb.com/api/v1/json';
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const FREE_KEY = '123';

const REGULAR_SEASON_WINDOWS = {
  2026: { start: '2026-05-08', end: '2026-09-24' }
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    }
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
    // Premium V2: key belongs in the X-API-KEY header and the full league
    // season endpoint returns its events in the `schedule` array.
    const body = await fetchJson(
      `${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`,
      { headers: { 'X-API-KEY': productionKey } }
    );
    return {
      events: Array.isArray(body.schedule) ? body.schedule : [],
      apiVersion: 'v2'
    };
  }

  // Development fallback only. The public key returns a limited sample.
  const body = await fetchJson(
    `${V1_ROOT}/${FREE_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${encodeURIComponent(season)}`
  );
  return {
    events: Array.isArray(body.events) ? body.events : [],
    apiVersion: 'v1-free'
  };
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inRegularSeason(event, season) {
  const window = REGULAR_SEASON_WINDOWS[season];
  if (!window) return true;
  const eventDate = asDate(event.dateEvent);
  const start = asDate(window.start);
  const end = asDate(window.end);
  return Boolean(eventDate && start && end && eventDate >= start && eventDate <= end);
}

function isFinished(event) {
  const home = Number(event.intHomeScore);
  const away = Number(event.intAwayScore);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return false;

  const status = String(event.strStatus || '').toUpperCase();
  if (['FT', 'AET', 'FINAL', 'MATCH FINISHED'].some(value => status.includes(value))) return true;

  const eventDate = asDate(event.dateEvent);
  return Boolean(eventDate && eventDate < new Date());
}

function teamFromEvent(event, side) {
  const home = side === 'home';
  return {
    id: home ? event.idHomeTeam : event.idAwayTeam,
    full_name: home ? event.strHomeTeam : event.strAwayTeam
  };
}

function deriveStandings(events) {
  const records = new Map();

  function ensure(team) {
    if (!team?.id || !team?.full_name) return null;
    if (!records.has(team.id)) {
      records.set(team.id, { team, wins: 0, losses: 0 });
    }
    return records.get(team.id);
  }

  for (const event of events) {
    if (!isFinished(event)) continue;

    const home = ensure(teamFromEvent(event, 'home'));
    const away = ensure(teamFromEvent(event, 'away'));
    if (!home || !away) continue;

    const homeScore = Number(event.intHomeScore);
    const awayScore = Number(event.intAwayScore);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore === awayScore) continue;

    if (homeScore > awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  return [...records.values()]
    .map(record => {
      const played = record.wins + record.losses;
      return { ...record, win_percentage: played ? record.wins / played : 0 };
    })
    .sort((a, b) =>
      Number(b.win_percentage) - Number(a.win_percentage) ||
      b.wins - a.wins ||
      a.losses - b.losses ||
      a.team.full_name.localeCompare(b.team.full_name)
    )
    .map((record, index) => ({ ...record, playoff_seed: index + 1 }));
}

function recentResults(events, limit = 5) {
  return events
    .filter(isFinished)
    .sort((a, b) => String(b.dateEvent || '').localeCompare(String(a.dateEvent || '')))
    .slice(0, limit)
    .map(event => ({
      id: event.idEvent,
      date: event.dateEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore: Number(event.intHomeScore),
      awayScore: Number(event.intAwayScore)
    }));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestedSeason = Number(req.query.season);
  const season = Number.isInteger(requestedSeason) && requestedSeason >= 1997 && requestedSeason <= 2100
    ? requestedSeason
    : new Date().getFullYear();

  const productionKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  try {
    const { events: allEvents, apiVersion } = await getSeasonSchedule(season, productionKey);
    const regularSeasonEvents = allEvents.filter(event => inRegularSeason(event, season));

    // The 2026 regular season has hundreds of games. Requiring at least 100 schedule
    // rows prevents the site from calculating standings from the 15-event free sample.
    const fullSeasonAccess = Boolean(productionKey) && allEvents.length >= 100;

    return res.status(200).json({
      configured: Boolean(productionKey),
      source: 'TheSportsDB',
      apiVersion,
      season,
      updatedAt: new Date().toISOString(),
      eventCount: allEvents.length,
      regularSeasonEventCount: regularSeasonEvents.length,
      fullSeasonAccess,
      standings: fullSeasonAccess ? deriveStandings(regularSeasonEvents) : [],
      recentResults: fullSeasonAccess ? recentResults(regularSeasonEvents) : [],
      providerMessage: fullSeasonAccess
        ? null
        : productionKey
          ? `TheSportsDB key was detected, but only ${allEvents.length} season events were returned. We Know the W will not calculate standings from an incomplete schedule.`
          : 'THESPORTSDB_API_KEY is not configured in Vercel. The free development feed is intentionally limited.'
    });
  } catch (error) {
    return res.status(502).json({
      error: error.message,
      status: error.status || null,
      configured: Boolean(productionKey),
      source: 'TheSportsDB',
      apiVersion: productionKey ? 'v2' : 'v1-free',
      season
    });
  }
};
