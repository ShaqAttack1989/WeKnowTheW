const LEAGUE_ID = 4516;
const API_ROOT = 'https://www.thesportsdb.com/api/v1/json';
const FREE_KEY = '123';

// Exact regular-season windows keep preseason and playoffs out of the standings.
// Add the next season here when its official dates are announced.
const REGULAR_SEASON_WINDOWS = {
  2026: { start: '2026-05-08', end: '2026-09-24' }
};

async function tsdb(path, apiKey) {
  const response = await fetch(`${API_ROOT}/${encodeURIComponent(apiKey)}/${path}`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`TheSportsDB returned ${response.status}`);
  }

  return response.json();
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
  return eventDate && start && end && eventDate >= start && eventDate <= end;
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
    if (homeScore === awayScore) continue;

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
      return {
        ...record,
        win_percentage: played ? record.wins / played : 0
      };
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
  const apiKey = productionKey || FREE_KEY;

  // Fifteen minutes is current enough for standings while staying friendly to the provider.
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  try {
    const body = await tsdb(`eventsseason.php?id=${LEAGUE_ID}&s=${encodeURIComponent(season)}`, apiKey);
    const allEvents = Array.isArray(body.events) ? body.events : [];
    const regularSeasonEvents = allEvents.filter(event => inRegularSeason(event, season));

    // The free public key intentionally returns a limited season result set. A public production
    // site should use a dedicated TheSportsDB key so standings are never calculated from a partial schedule.
    const fullSeasonAccess = Boolean(productionKey) && allEvents.length >= 100;

    return res.status(200).json({
      configured: Boolean(productionKey),
      source: 'TheSportsDB',
      sourceUrl: 'https://www.thesportsdb.com',
      season,
      updatedAt: new Date().toISOString(),
      fullSeasonAccess,
      standings: fullSeasonAccess ? deriveStandings(regularSeasonEvents) : [],
      recentResults: fullSeasonAccess ? recentResults(regularSeasonEvents) : [],
      providerMessage: fullSeasonAccess
        ? null
        : 'A dedicated TheSportsDB production key is required for the complete season feed. The free development key returns only a limited sample, so We Know the W will not calculate standings from incomplete data.'
    });
  } catch (error) {
    return res.status(502).json({
      error: error.message,
      source: 'TheSportsDB',
      season
    });
  }
};
