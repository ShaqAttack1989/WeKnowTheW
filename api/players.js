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
  for (const key of keys) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  return [];
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : parts[0] || ''
  };
}

function cleanUrl(value = '') {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

function normalizePlayer(player, team) {
  const name = player.strPlayer || player.strName || player.name || '';
  const { firstName, lastName } = splitName(name);
  const thumb = cleanUrl(player.strThumb || player.strPlayerThumb || player.strImage || '');
  const cutout = cleanUrl(player.strCutout || player.strPlayerCutout || '');
  const creativeCommons = String(player.strCreativeCommons || player.strCreativeCommonsLicense || '').trim();
  return {
    id: String(player.idPlayer || player.id || ''),
    name,
    firstName,
    lastName,
    teamId: String(team.idTeam || team.id || player.idTeam || ''),
    team: team.strTeam || team.name || player.strTeam || '',
    position: player.strPosition || player.strRole || player.position || '',
    number: player.strNumber || player.strJersey || player.number || '',
    nationality: player.strNationality || player.strCountry || '',
    birthDate: player.dateBorn || player.strBirthDate || '',
    height: player.strHeight || '',
    weight: player.strWeight || '',
    photo: cutout || thumb,
    photoThumb: thumb || cutout,
    photoCutout: cutout,
    photoCreativeCommons: creativeCommons,
    photoSource: thumb || cutout ? 'TheSportsDB' : ''
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');

  if (!apiKey) {
    return res.status(503).json({
      error: 'TheSportsDB production key is not configured.',
      source: 'TheSportsDB'
    });
  }

  try {
    const teamBody = await fetchV2(`/list/teams/${LEAGUE_ID}`, apiKey);
    const teams = firstArray(teamBody, ['teams', 'list', 'data'])
      .filter(team => team && (team.idTeam || team.id) && (team.strTeam || team.name));

    if (!teams.length) {
      return res.status(502).json({
        error: 'TheSportsDB returned no WNBA teams for Playerpedia.',
        source: 'TheSportsDB'
      });
    }

    const rosterResults = await Promise.allSettled(
      teams.map(async team => {
        const teamId = team.idTeam || team.id;
        const body = await fetchV2(`/list/players/${encodeURIComponent(teamId)}`, apiKey);
        const roster = firstArray(body, ['players', 'player', 'list', 'data']);
        return roster.map(player => normalizePlayer(player, team));
      })
    );

    const players = rosterResults
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .filter(player => player.id && player.name);

    const uniquePlayers = [...new Map(players.map(player => [player.id, player])).values()]
      .sort((a, b) =>
        a.lastName.localeCompare(b.lastName) ||
        a.firstName.localeCompare(b.firstName)
      );

    const normalizedTeams = teams
      .map(team => ({
        id: String(team.idTeam || team.id),
        name: team.strTeam || team.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const failedRosters = rosterResults.filter(result => result.status === 'rejected').length;

    return res.status(200).json({
      source: 'TheSportsDB',
      leagueId: LEAGUE_ID,
      updatedAt: new Date().toISOString(),
      teams: normalizedTeams,
      players: uniquePlayers,
      playerCount: uniquePlayers.length,
      partial: failedRosters > 0,
      failedRosters
    });
  } catch (error) {
    return res.status(502).json({
      error: error.message,
      status: error.status || null,
      source: 'TheSportsDB'
    });
  }
};