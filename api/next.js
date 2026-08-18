const LEAGUE_ID = 5789;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const offseasonSnapshot = require('../college-snapshot-2025-26.json');

function seasonLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function previousSeasonLabel(season) {
  const match = String(season).match(/^(\d{4})-(\d{4})$/);
  if (!match) return season;
  const start = Number(match[1]) - 1;
  const end = Number(match[2]) - 1;
  return `${start}-${end}`;
}

async function fetchJson(url, apiKey) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-API-KEY': apiKey
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

async function fetchSchedule(season, apiKey) {
  const body = await fetchJson(`${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`, apiKey);
  return Array.isArray(body.schedule) ? body.schedule : [];
}

function eventTime(event) {
  const date = event.dateEvent || '';
  const time = event.strTime || '12:00:00';
  const value = Date.parse(`${date}T${time.replace('Z', '')}Z`);
  return Number.isFinite(value) ? value : Date.parse(`${date}T12:00:00Z`);
}

function seasonHasStarted(schedule, now = Date.now()) {
  if (!schedule.length) return false;
  const validTimes = schedule.map(eventTime).filter(Number.isFinite);
  if (!validTimes.length) return false;
  return Math.min(...validTimes) <= now;
}

function normalize(event) {
  return {
    id: event.idEvent,
    date: event.dateEvent,
    time: event.strTime || '',
    status: event.strStatus || '',
    homeTeam: event.strHomeTeam || '',
    awayTeam: event.strAwayTeam || '',
    homeScore: event.intHomeScore === null || event.intHomeScore === '' ? null : Number(event.intHomeScore),
    awayScore: event.intAwayScore === null || event.intAwayScore === '' ? null : Number(event.intAwayScore)
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  const requestedSeason = req.query.season ? String(req.query.season).trim() : '';
  const upcomingSeason = requestedSeason || seasonLabel();
  const priorSeason = previousSeasonLabel(upcomingSeason);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const baseSnapshot = {
    snapshot: offseasonSnapshot,
    snapshotSource: 'NCAA.com'
  };

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season: offseasonSnapshot.season,
      upcomingSeason,
      showingPriorSeason: true,
      upcoming: [],
      recent: offseasonSnapshot.tournamentFinish || [],
      providerMessage: `Showing the ${offseasonSnapshot.season} NCAA season snapshot while the independent schedule feed is unavailable.`,
      ...baseSnapshot
    });
  }

  try {
    const now = Date.now();
    let season = upcomingSeason;
    let schedule = await fetchSchedule(upcomingSeason, apiKey);
    let showingPriorSeason = false;

    if (!requestedSeason && !seasonHasStarted(schedule, now)) {
      const priorSchedule = await fetchSchedule(priorSeason, apiKey);
      if (priorSchedule.length) {
        season = priorSeason;
        schedule = priorSchedule;
        showingPriorSeason = true;
      } else {
        season = offseasonSnapshot.season;
        showingPriorSeason = true;
      }
    }

    const upcoming = schedule
      .filter(event => eventTime(event) >= now)
      .sort((a, b) => eventTime(a) - eventTime(b))
      .slice(0, 8)
      .map(normalize);

    let recent = schedule
      .filter(event => eventTime(event) < now && event.intHomeScore !== null && event.intAwayScore !== null)
      .sort((a, b) => eventTime(b) - eventTime(a))
      .slice(0, 8)
      .map(normalize);

    if (!recent.length && showingPriorSeason) {
      recent = offseasonSnapshot.tournamentFinish || [];
    }

    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season,
      upcomingSeason,
      showingPriorSeason,
      updatedAt: new Date().toISOString(),
      eventCount: schedule.length,
      upcoming,
      recent,
      providerMessage: showingPriorSeason
        ? `Showing the ${offseasonSnapshot.season} NCAA season snapshot until ${upcomingSeason} begins.`
        : schedule.length
          ? null
          : 'The provider has not published a complete college schedule for this season yet.',
      ...baseSnapshot
    });
  } catch (error) {
    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season: offseasonSnapshot.season,
      upcomingSeason,
      showingPriorSeason: true,
      upcoming: [],
      recent: offseasonSnapshot.tournamentFinish || [],
      providerMessage: `Showing the ${offseasonSnapshot.season} NCAA season snapshot while the independent schedule feed is temporarily unavailable.`,
      providerStatus: error.status || null,
      ...baseSnapshot
    });
  }
};
