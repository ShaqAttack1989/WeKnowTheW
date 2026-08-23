const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const V1_ROOT = 'https://www.thesportsdb.com/api/v1/json';
const FREE_KEY = '123';

async function fetchV2(path, apiKey) {
  const response = await fetch(`${V2_ROOT}${path}`, {
    headers: { Accept: 'application/json', 'X-API-KEY': apiKey }
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

async function fetchV1(path, apiKey = FREE_KEY) {
  const response = await fetch(`${V1_ROOT}/${encodeURIComponent(apiKey)}${path}`, {
    headers: { Accept: 'application/json' }
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
function key(value = '') {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}
function candidatesFrom(body = {}) {
  const arrays = ['player', 'players', 'search', 'data', 'lookup'];
  for (const name of arrays) if (Array.isArray(body?.[name])) return body[name];
  const single = firstObject(body, arrays);
  return single ? [single] : [];
}
function candidateScore(player = {}, requestedName = '', requestedTeam = '') {
  const wanted = key(requestedName);
  const playerName = key(player.strPlayer || player.strName || '');
  const alternates = [player.strPlayerAlternate, player.strAlternate, player.strAlternateName]
    .flatMap(value => String(value || '').split(/[;,/]/)).map(key).filter(Boolean);
  let score = 0;
  if (wanted && playerName === wanted) score += 100;
  else if (wanted && (playerName.includes(wanted) || wanted.includes(playerName))) score += 65;
  if (wanted && alternates.includes(wanted)) score += 80;
  const sport = key(player.strSport || '');
  const league = key(player.strLeague || player.strLeague2 || '');
  if (!sport || sport === 'basketball') score += 20;
  if (league.includes('wnba') || league.includes('womensnationalbasketballassociation')) score += 35;
  const wantedTeam = key(requestedTeam);
  const team = key(player.strTeam || '');
  if (wantedTeam && team === wantedTeam) score += 40;
  else if (wantedTeam && team && (team.includes(wantedTeam) || wantedTeam.includes(team))) score += 20;
  return score;
}
function choosePlayer(body, name, team) {
  return candidatesFrom(body)
    .filter(Boolean)
    .sort((a, b) => candidateScore(b, name, team) - candidateScore(a, name, team))[0] || null;
}

async function searchPlayer(name, team, apiKey) {
  const query = encodeURIComponent(String(name || '').trim().replace(/\s+/g, '_'));
  if (!query) return null;
  if (apiKey) {
    try {
      const body = await fetchV2(`/search/player/${query}`, apiKey);
      const player = choosePlayer(body, name, team);
      if (player) return { player, api: 'v2' };
    } catch { /* fall through to free v1 search */ }
  }
  const body = await fetchV1(`/searchplayers.php?p=${query}`);
  const player = choosePlayer(body, name, team);
  return player ? { player, api: 'v1' } : null;
}

async function lookupPlayer(id, apiKey) {
  if (apiKey) {
    try {
      const body = await fetchV2(`/lookup/player/${encodeURIComponent(id)}`, apiKey);
      const player = firstObject(body, ['player', 'players', 'lookup', 'data']);
      if (player) return { player, api: 'v2' };
    } catch { /* use v1 fallback */ }
  }
  const body = await fetchV1(`/lookupplayer.php?id=${encodeURIComponent(id)}`);
  const player = firstObject(body, ['players', 'player', 'lookup', 'data']);
  return player ? { player, api: 'v1' } : null;
}

async function relatedData(id, apiKey) {
  if (!id) return { honours: [], formerTeams: [], milestones: [] };
  if (apiKey) {
    const results = await Promise.allSettled([
      fetchV2(`/lookup/player_honours/${id}`, apiKey),
      fetchV2(`/lookup/player_teams/${id}`, apiKey),
      fetchV2(`/lookup/player_milestones/${id}`, apiKey)
    ]);
    return {
      honours: results[0].status === 'fulfilled' ? firstArray(results[0].value, ['honours','honors','player_honours','list','data']) : [],
      formerTeams: results[1].status === 'fulfilled' ? firstArray(results[1].value, ['teams','formerTeams','player_teams','list','data']) : [],
      milestones: results[2].status === 'fulfilled' ? firstArray(results[2].value, ['milestones','player_milestones','list','data']) : []
    };
  }
  const results = await Promise.allSettled([
    fetchV1(`/lookuphonours.php?id=${id}`),
    fetchV1(`/lookupformerteams.php?id=${id}`),
    fetchV1(`/lookupmilestones.php?id=${id}`)
  ]);
  return {
    honours: results[0].status === 'fulfilled' ? firstArray(results[0].value, ['honours','honors']) : [],
    formerTeams: results[1].status === 'fulfilled' ? firstArray(results[1].value, ['formerteams','formerTeams','teams']) : [],
    milestones: results[2].status === 'fulfilled' ? firstArray(results[2].value, ['milestones']) : []
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawId = String(req.query.id || '').trim();
  const numericId = /^\d+$/.test(rawId) ? rawId : '';
  const name = String(req.query.name || '').trim();
  const team = String(req.query.team || '').trim();
  if (!numericId && !name) return res.status(400).json({ error: 'A player name or valid TheSportsDB player id is required.' });

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  try {
    let resolved = numericId ? await lookupPlayer(numericId, apiKey) : null;
    if (!resolved && name) resolved = await searchPlayer(name, team, apiKey);
    if (!resolved?.player) return res.status(404).json({ error: 'Player profile not found.' });

    let player = resolved.player;
    const sportsDbId = String(player.idPlayer || numericId || '').trim();
    if (sportsDbId && !numericId) {
      const richer = await lookupPlayer(sportsDbId, apiKey).catch(() => null);
      if (richer?.player) player = { ...player, ...richer.player };
    }

    const related = await relatedData(sportsDbId, apiKey);
    const thumb = cleanUrl(player.strThumb || player.strPlayerThumb || player.strImage || '');
    const cutout = cleanUrl(player.strCutout || player.strPlayerCutout || '');
    const creativeCommons = String(player.strCreativeCommons || player.strCreativeCommonsLicense || '').trim();
    const approvedArtwork = creativeCommonsApproved(creativeCommons);
    const photo = approvedArtwork ? (thumb || cutout) : '';

    return res.status(200).json({
      source: `TheSportsDB ${resolved.api || 'search'}`,
      updatedAt: new Date().toISOString(),
      player: {
        id: sportsDbId || rawId,
        name: player.strPlayer || player.strName || name,
        team: player.strTeam || team,
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
        photoSourceUrl: photo && sportsDbId ? `https://www.thesportsdb.com/player/${sportsDbId}` : ''
      },
      honours: related.honours,
      formerTeams: related.formerTeams,
      milestones: related.milestones
    });
  } catch (error) {
    return res.status(502).json({ error: error.message, status: error.status || null, source: 'TheSportsDB' });
  }
};