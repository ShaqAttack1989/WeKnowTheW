const LEAGUE_ID = 5789;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';

function seasonLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
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

function eventTime(event) {
  const date = event.dateEvent || '';
  const time = event.strTime || '12:00:00';
  const value = Date.parse(`${date}T${time.replace('Z', '')}Z`);
  return Number.isFinite(value) ? value : Date.parse(`${date}T12:00:00Z`);
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
  const season = String(req.query.season || seasonLabel()).trim();
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season,
      upcoming: [],
      recent: [],
      providerMessage: 'College live-data key is not configured.'
    });
  }

  try {
    const body = await fetchJson(`${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`, apiKey);
    const schedule = Array.isArray(body.schedule) ? body.schedule : [];
    const now = Date.now();

    const upcoming = schedule
      .filter(event => eventTime(event) >= now)
      .sort((a, b) => eventTime(a) - eventTime(b))
      .slice(0, 8)
      .map(normalize);

    const recent = schedule
      .filter(event => eventTime(event) < now && event.intHomeScore !== null && event.intAwayScore !== null)
      .sort((a, b) => eventTime(b) - eventTime(a))
      .slice(0, 8)
      .map(normalize);

    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season,
      updatedAt: new Date().toISOString(),
      eventCount: schedule.length,
      upcoming,
      recent,
      providerMessage: schedule.length
        ? null
        : 'The provider has not published a complete college schedule for this season yet.'
    });
  } catch (error) {
    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season,
      upcoming: [],
      recent: [],
      providerMessage: 'The college schedule feed is temporarily unavailable.',
      providerStatus: error.status || null
    });
  }
};
