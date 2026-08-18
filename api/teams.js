const LEAGUE_ID = 4516;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';

async function fetchV2(path, apiKey) {
  const response = await fetch(`${V2_ROOT}${path}`, {
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

function firstArray(body, keys) {
  for (const key of keys) if (Array.isArray(body?.[key])) return body[key];
  return [];
}

function cleanUrl(value = '') {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  if (!apiKey) return res.status(503).json({ error: 'TheSportsDB production key is not configured.' });

  try {
    const body = await fetchV2(`/list/teams/${LEAGUE_ID}`, apiKey);
    const teams = firstArray(body, ['teams', 'list', 'data'])
      .filter(team => team && (team.idTeam || team.id) && (team.strTeam || team.name))
      .map(team => ({
        id: String(team.idTeam || team.id || ''),
        name: team.strTeam || team.name || '',
        badge: cleanUrl(team.strBadge || team.strTeamBadge || ''),
        logo: cleanUrl(team.strLogo || team.strTeamLogo || ''),
        banner: cleanUrl(team.strBanner || team.strTeamBanner || ''),
        fanart: cleanUrl(team.strFanart1 || team.strFanart || ''),
        source: 'TheSportsDB'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({
      source: 'TheSportsDB',
      leagueId: LEAGUE_ID,
      updatedAt: new Date().toISOString(),
      teams
    });
  } catch (error) {
    return res.status(502).json({ error: error.message, status: error.status || null, source: 'TheSportsDB' });
  }
};
