const API_ROOT = 'https://api.balldontlie.io/wnba/v1';

async function request(path, apiKey) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json'
    }
  });

  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!response.ok) {
    const error = new Error(body?.message || body?.error || `BALLDONTLIE returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return body;
}

async function getAllPlayerSeasonStats(season, apiKey) {
  const all = [];
  let cursor = null;
  let pageCount = 0;

  do {
    const query = new URLSearchParams({
      season: String(season),
      season_type: '2',
      per_page: '100'
    });
    if (cursor) query.set('cursor', cursor);

    const body = await request(`/player_season_stats?${query}`, apiKey);
    all.push(...(body.data || []));
    cursor = body.meta?.next_cursor ? String(body.meta.next_cursor) : null;
    pageCount += 1;
  } while (cursor && pageCount < 10);

  return all;
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

  const apiKey = process.env.BDL_WNBA_API_KEY;
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      season,
      updatedAt: new Date().toISOString(),
      standings: [],
      playerSeasonStats: [],
      access: { standings: false, playerSeasonStats: false }
    });
  }

  const [standingsResult, playerStatsResult] = await Promise.allSettled([
    request(`/standings?season=${encodeURIComponent(season)}`, apiKey),
    getAllPlayerSeasonStats(season, apiKey)
  ]);

  const standings = standingsResult.status === 'fulfilled'
    ? (standingsResult.value.data || [])
        .filter(item => Number(item.season) === season)
        .sort((a, b) => Number(b.win_percentage) - Number(a.win_percentage))
    : [];

  const playerSeasonStats = playerStatsResult.status === 'fulfilled'
    ? playerStatsResult.value
    : [];

  return res.status(200).json({
    configured: true,
    season,
    updatedAt: new Date().toISOString(),
    standings,
    playerSeasonStats,
    access: {
      standings: standingsResult.status === 'fulfilled',
      playerSeasonStats: playerStatsResult.status === 'fulfilled'
    },
    providerErrors: {
      standings: standingsResult.status === 'rejected' ? standingsResult.reason.message : null,
      playerSeasonStats: playerStatsResult.status === 'rejected' ? playerStatsResult.reason.message : null
    }
  });
};
