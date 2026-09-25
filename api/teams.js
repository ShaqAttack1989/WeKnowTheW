const LEAGUE_ID = 4516;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
// Current WNBA franchises only. Historical team marks belong to the archive pages.
const CURRENT_TEAM_LOGO_CODES = new Map([
  ['Atlanta Dream','atl'], ['Chicago Sky','chi'], ['Connecticut Sun','con'],
  ['Dallas Wings','dal'], ['Golden State Valkyries','gs'], ['Indiana Fever','ind'],
  ['Las Vegas Aces','lv'], ['Los Angeles Sparks','la'], ['Minnesota Lynx','min'],
  ['New York Liberty','ny'], ['Phoenix Mercury','phx'], ['Portland Fire','por'],
  ['Seattle Storm','sea'], ['Toronto Tempo','tor'], ['Washington Mystics','wsh']
]);
const currentLogo = name => {
  const code = CURRENT_TEAM_LOGO_CODES.get(name);
  return code ? `https://a.espncdn.com/i/teamlogos/wnba/500/${code}.png` : '';
};
const currentTeams = () => [...CURRENT_TEAM_LOGO_CODES.keys()].map(name => ({
  name, badge: currentLogo(name), logo: currentLogo(name), source: 'Current franchise artwork'
}));

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
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (!apiKey) return res.status(200).json({ source: 'Current franchise artwork', teams: currentTeams() });

  try {
    const body = await fetchV2(`/list/teams/${LEAGUE_ID}`, apiKey);
    const externalTeams = firstArray(body, ['teams', 'list', 'data'])
      .filter(team => team && (team.idTeam || team.id) && CURRENT_TEAM_LOGO_CODES.has(team.strTeam || team.name))
      .map(team => ({
        id: String(team.idTeam || team.id || ''),
        name: team.strTeam || team.name || '',
        badge: currentLogo(team.strTeam || team.name || ''),
        logo: currentLogo(team.strTeam || team.name || ''),
        banner: cleanUrl(team.strBanner || team.strTeamBanner || ''),
        fanart: cleanUrl(team.strFanart1 || team.strFanart || ''),
        source: 'Current franchise artwork; TheSportsDB supplementary media'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const byName = new Map(externalTeams.map(team => [team.name, team]));
    const teams = currentTeams().map(team => ({ ...team, ...byName.get(team.name) }));

    return res.status(200).json({
      source: 'TheSportsDB',
      leagueId: LEAGUE_ID,
      updatedAt: new Date().toISOString(),
      teams
    });
  } catch (error) {
    return res.status(200).json({ source: 'Current franchise artwork', warning: error.message, teams: currentTeams() });
  }
};
