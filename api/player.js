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

function firstObject(body, keys) {
  for (const key of keys) {
    const value = body?.[key];
    if (Array.isArray(value) && value[0]) return value[0];
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  }
  return null;
}

function cleanUrl(value = '') {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

function creativeCommonsApproved(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ['yes', 'true', '1', 'y'].includes(normalized)
    || normalized.includes('creative commons')
    || normalized.includes('creativecommons.org');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = String(req.query.id || '').trim();
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'A valid player id is required.' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  if (!apiKey) {
    return res.status(503).json({ error: 'TheSportsDB production key is not configured.' });
  }

  try {
    const [playerResult, honoursResult, teamsResult, milestonesResult] = await Promise.allSettled([
      fetchV2(`/lookup/player/${id}`, apiKey),
      fetchV2(`/lookup/player_honours/${id}`, apiKey),
      fetchV2(`/lookup/player_teams/${id}`, apiKey),
      fetchV2(`/lookup/player_milestones/${id}`, apiKey)
    ]);

    if (playerResult.status !== 'fulfilled') throw playerResult.reason;

    const player = firstObject(playerResult.value, ['player', 'players', 'lookup', 'data']);
    if (!player) {
      return res.status(404).json({ error: 'Player profile not found.' });
    }

    const honours = honoursResult.status === 'fulfilled'
      ? firstArray(honoursResult.value, ['honours', 'honors', 'player_honours', 'list', 'data'])
      : [];

    const formerTeams = teamsResult.status === 'fulfilled'
      ? firstArray(teamsResult.value, ['teams', 'formerTeams', 'player_teams', 'list', 'data'])
      : [];

    const milestones = milestonesResult.status === 'fulfilled'
      ? firstArray(milestonesResult.value, ['milestones', 'player_milestones', 'list', 'data'])
      : [];

    const thumb = cleanUrl(player.strThumb || player.strPlayerThumb || player.strImage || '');
    const cutout = cleanUrl(player.strCutout || player.strPlayerCutout || '');
    const creativeCommons = String(player.strCreativeCommons || player.strCreativeCommonsLicense || '').trim();
    const approvedArtwork = creativeCommonsApproved(creativeCommons);
    const photo = approvedArtwork ? (thumb || cutout) : '';

    return res.status(200).json({
      source: 'TheSportsDB',
      updatedAt: new Date().toISOString(),
      player: {
        id: String(player.idPlayer || id),
        name: player.strPlayer || player.strName || '',
        team: player.strTeam || '',
        teamId: String(player.idTeam || ''),
        position: player.strPosition || player.strRole || '',
        number: player.strNumber || player.strJersey || '',
        nationality: player.strNationality || player.strCountry || '',
        birthDate: player.dateBorn || player.strBirthDate || '',
        birthPlace: player.strBirthLocation || player.strBirthPlace || player.strBirthTown || '',
        height: player.strHeight || '',
        weight: player.strWeight || '',
        college: player.strCollege || '',
        description: player.strDescriptionEN || player.strDescription || '',
        photo,
        photoThumb: photo,
        photoCutout: approvedArtwork ? cutout : '',
        photoCreativeCommons: approvedArtwork ? (creativeCommons || 'Yes') : '',
        photoSource: photo ? 'TheSportsDB' : '',
        photoSourceUrl: photo ? `https://www.thesportsdb.com/player/${player.idPlayer || id}` : ''
      },
      honours,
      formerTeams,
      milestones
    });
  } catch (error) {
    return res.status(502).json({
      error: error.message,
      status: error.status || null,
      source: 'TheSportsDB'
    });
  }
};