const LEAGUE_ID = 4516;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const liveUpdates = require('../player-live-updates.json');
const { officialHeadshot } = require('../lib/wnba-headshots');
const { OFFICIAL_ROSTER_SNAPSHOT } = require('../lib/official-roster-snapshot');
const {
  getWnbaRosters,
  getWnbaInjuries,
  getWnbaTransactions
} = require('../lib/wehoop-espn');

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

function creativeCommonsApproved(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ['yes', 'true', '1', 'y'].includes(normalized)
    || normalized.includes('creative commons')
    || normalized.includes('creativecommons.org');
}

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function staffLike(position = '') {
  return /(coach|manager|trainer|staff|president|director|executive|owner|operations|general manager)/i.test(String(position));
}

function attachOfficialHeadshot(player = {}) {
  const official = officialHeadshot(player.name);
  if (!official) return player;
  return {
    ...player,
    wnbaId: official.id,
    officialHeadshot: official.url,
    photoCutout: official.url,
    photoOfficial: true
  };
}

function normalizePlayer(player, team) {
  const name = player.strPlayer || player.strName || player.name || '';
  const { firstName, lastName } = splitName(name);
  const thumb = cleanUrl(player.strThumb || player.strPlayerThumb || player.strImage || '');
  const cutout = cleanUrl(player.strCutout || player.strPlayerCutout || '');
  const creativeCommons = String(player.strCreativeCommons || player.strCreativeCommonsLicense || '').trim();
  const approvedArtwork = creativeCommonsApproved(creativeCommons);
  const photo = thumb || cutout;
  const id = String(player.idPlayer || player.id || '');

  return {
    id,
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
    photo,
    photoThumb: photo,
    photoCutout: approvedArtwork ? cutout : '',
    photoCreativeCommons: approvedArtwork ? (creativeCommons || 'Yes') : '',
    photoSource: photo ? 'TheSportsDB' : '',
    photoSourceUrl: photo ? `https://www.thesportsdb.com/player/${id}` : '',
    dataSources: ['TheSportsDB']
  };
}

function normalizeEspnPlayer(player, teamIdByName) {
  const name = player.name || '';
  const { firstName, lastName } = splitName(name);
  const espnId = String(player.id || '').replace(/[^0-9]/g, '');
  const espnPhoto = cleanUrl(player.headshot) || (espnId ? `https://a.espncdn.com/i/headshots/wnba/players/full/${espnId}.png` : '');
  return {
    id: `espn-${espnId || player.id}`,
    espnId,
    name,
    firstName: player.firstName || firstName,
    lastName: player.lastName || lastName,
    teamId: teamIdByName.get(key(player.team)) || String(player.teamId || ''),
    team: player.team || '',
    position: player.position || '',
    number: player.number || '',
    nationality: '',
    birthDate: '',
    height: player.height || '',
    weight: player.weight || '',
    photo: espnPhoto,
    photoThumb: espnPhoto,
    photoCutout: '',
    headshot: espnPhoto,
    photoCreativeCommons: '',
    photoSource: espnPhoto ? 'ESPN' : '',
    photoSourceUrl: espnId ? `https://www.espn.com/wnba/player/_/id/${espnId}` : '',
    dataSources: ['SportsDataverse/WeHoop ESPN bridge'],
    espnRosterFallback: true
  };
}

function mergePlayerRecord(base, supplement) {
  const merged = { ...base };
  for (const field of ['team', 'teamId', 'position', 'number', 'height', 'weight', 'firstName', 'lastName']) {
    if (!merged[field] && supplement[field]) merged[field] = supplement[field];
  }
  if (!merged.espnId && supplement.espnId) merged.espnId = supplement.espnId;
  if (!merged.photo && (supplement.photo || supplement.headshot)) {
    merged.photo = supplement.photo || supplement.headshot;
    merged.photoThumb = supplement.photoThumb || merged.photo;
    merged.headshot = supplement.headshot || merged.photo;
    merged.photoSource = supplement.photoSource || merged.photoSource;
    merged.photoSourceUrl = supplement.photoSourceUrl || merged.photoSourceUrl;
  } else if (!merged.headshot && supplement.headshot) {
    merged.headshot = supplement.headshot;
  }
  merged.dataSources = [...new Set([...(base.dataSources || []), ...(supplement.dataSources || [])])];
  return merged;
}

function officialRosterPlayer(item, teamIds, existing = null) {
  const { firstName, lastName } = splitName(item.name);
  const base = {
    id: `wnba-${item.wnbaId}`,
    wnbaId: String(item.wnbaId || ''),
    name: item.name,
    firstName,
    lastName,
    teamId: teamIds.get(key(item.team)) || '',
    team: item.team,
    position: item.position || 'Player',
    number: String(item.number || ''),
    nationality: '',
    birthDate: '',
    height: '',
    weight: '',
    photo: '',
    photoThumb: '',
    photoCutout: '',
    photoCreativeCommons: '',
    photoSource: 'Official WNBA team roster page',
    photoSourceUrl: item.sourceUrl || '',
    officialRosterSnapshot: true,
    rosterSourceUrl: item.sourceUrl || '',
    dataSources: ['Official WNBA 2026 team roster page']
  };
  return existing ? mergePlayerRecord(base, existing) : base;
}

function applyCuratedLayer(players, normalizedTeams) {
  const teamIds = new Map(normalizedTeams.map(team => [key(team.name), team.id]));
  const overrideItems = liveUpdates.rosterOverrides || [];
  const overrides = new Map();
  for (const item of overrideItems) {
    for (const name of [item.name, ...(Array.isArray(item.aliases) ? item.aliases : [])]) {
      if (name) overrides.set(key(name), item);
    }
  }
  const photoRules = new Map((liveUpdates.photoRules || []).map(item => [key(item.name), item]));

  let curated = players
    .filter(player => !staffLike(player.position))
    .map(player => {
      const override = overrides.get(key(player.name));
      const photoRule = photoRules.get(key(player.name));
      const next = { ...player };

      if (override) {
        if (override.name && key(override.name) !== key(next.name)) {
          const canonical = splitName(override.name);
          next.name = override.name;
          next.firstName = canonical.firstName;
          next.lastName = canonical.lastName;
        }
        if (override.team) {
          next.team = override.team;
          next.teamId = teamIds.get(key(override.team)) || next.teamId;
        }
        if (override.position) next.position = override.position;
        if (override.number !== undefined && override.number !== null) next.number = String(override.number);
        next.liveStatus = override.status || 'active';
        next.liveEffectiveDate = override.effectiveDate || '';
        next.liveNote = override.reason || '';
      }

      if (photoRule?.blockRosterApiPhoto) {
        next.photo = '';
        next.photoThumb = '';
        next.photoCutout = '';
        next.photoCreativeCommons = '';
        next.photoSource = '';
        next.photoSourceUrl = '';
        next.photoNeedsDetail = Boolean(photoRule.preferDetailApiPhoto);
        next.photoRuleNote = photoRule.reason || '';
      }

      return next;
    })
    .filter(player => {
      const override = overrides.get(key(player.name));
      return !(override && ['waived', 'released', 'inactive'].includes(String(override.status).toLowerCase()) && !override.team);
    });

  for (const override of overrideItems) {
    const status = String(override.status || '').toLowerCase();
    if (!override.team || !['active', 'development'].includes(status)) continue;
    const identities = new Set([override.name, ...(Array.isArray(override.aliases) ? override.aliases : [])].map(key));
    if (curated.some(player => identities.has(key(player.name)))) continue;
    const { firstName, lastName } = splitName(override.name);
    curated.push({
      id: `curated-${key(override.name)}`,
      name: override.name,
      firstName,
      lastName,
      teamId: teamIds.get(key(override.team)) || '',
      team: override.team,
      position: override.position || 'Player',
      number: override.number === undefined || override.number === null ? '' : String(override.number),
      nationality: '',
      birthDate: '',
      height: '',
      weight: '',
      photo: '',
      photoThumb: '',
      photoCutout: '',
      photoCreativeCommons: '',
      photoSource: '',
      photoSourceUrl: '',
      curated: true,
      liveStatus: override.status || 'active',
      liveEffectiveDate: override.effectiveDate || '',
      liveNote: override.reason || '',
      dataSources: ['Curated public-source correction']
    });
  }

  return curated;
}

function transactionWireItem(item) {
  return {
    date: item.date || '',
    type: String(item.type || 'TRANSACTION').toUpperCase(),
    player: item.name || 'Player',
    team: item.team || item.fromTeam || 'WNBA',
    detail: item.description || [item.fromTeam, item.team].filter(Boolean).join(' → ') || 'Roster update',
    source: item.source || 'SportsDataverse/WeHoop ESPN bridge'
  };
}

function mergeTransactions(curated = [], espn = []) {
  const combined = [
    ...curated.map(item => ({ ...item, source: item.source || 'Curated public-source correction' })),
    ...espn.map(transactionWireItem)
  ];
  const seen = new Set();
  return combined
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .filter(item => {
      const signature = `${String(item.date).slice(0, 10)}|${key(item.player)}|${key(item.detail)}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function injuryWireItem(item) {
  const rawStatus = String(item.status || '').trim().toUpperCase();
  const status = rawStatus === 'OUT' ? 'OUT'
    : rawStatus.includes('SEASON') ? 'OUT FOR SEASON'
      : rawStatus.includes('DAY') || rawStatus.includes('QUESTION') ? 'DAY TO DAY'
        : rawStatus || 'STATUS';
  const reasonParts = [item.injury, item.shortComment].filter(Boolean);
  return {
    player: item.name,
    team: item.team || 'WNBA',
    status,
    reason: reasonParts.join(' · ') || item.longComment || 'Availability update',
    updated: item.date || '',
    returnDate: item.returnDate || '',
    source: item.source || 'SportsDataverse/WeHoop ESPN bridge'
  };
}

function mergeInjuries(curated = [], espn = []) {
  const byPlayer = new Map();
  for (const item of curated) {
    if (!item?.player) continue;
    byPlayer.set(key(item.player), { ...item, source: item.source || 'Curated public-source correction' });
  }
  for (const raw of espn) {
    const item = injuryWireItem(raw);
    if (!item.player) continue;
    const playerKey = key(item.player);
    const existing = byPlayer.get(playerKey);
    if (!existing || String(item.updated || '') >= String(existing.updated || '')) byPlayer.set(playerKey, item);
  }
  return [...byPlayer.values()];
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  const season = 2026;
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  const providerErrors = [];
  let sportsDbTeams = [];
  let sportsDbPlayers = [];
  let sportsDbFailedRosters = 0;

  if (apiKey) {
    try {
      const teamBody = await fetchV2(`/list/teams/${LEAGUE_ID}`, apiKey);
      const teams = firstArray(teamBody, ['teams', 'list', 'data'])
        .filter(team => team && (team.idTeam || team.id) && (team.strTeam || team.name));

      sportsDbTeams = teams.map(team => ({
        id: String(team.idTeam || team.id),
        name: team.strTeam || team.name
      }));

      const rosterResults = await Promise.allSettled(
        teams.map(async team => {
          const teamId = team.idTeam || team.id;
          const body = await fetchV2(`/list/players/${encodeURIComponent(teamId)}`, apiKey);
          const roster = firstArray(body, ['players', 'player', 'list', 'data']);
          return roster.map(player => normalizePlayer(player, team));
        })
      );

      sportsDbPlayers = rosterResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .filter(player => player.id && player.name);
      sportsDbFailedRosters = rosterResults.filter(result => result.status === 'rejected').length;
    } catch (error) {
      providerErrors.push({ source: 'TheSportsDB', message: error.message, status: error.status || null });
    }
  }

  let espnRosterData = { teams: [], players: [], failedRosters: 0 };
  let espnInjuries = [];
  let espnTransactions = [];

  const [rostersResult, injuriesResult, transactionsResult] = await Promise.allSettled([
    getWnbaRosters(season),
    getWnbaInjuries(),
    getWnbaTransactions(season, 250)
  ]);

  if (rostersResult.status === 'fulfilled') espnRosterData = rostersResult.value;
  else providerErrors.push({ source: 'SportsDataverse/WeHoop ESPN rosters', message: rostersResult.reason?.message || 'Roster fetch failed' });

  if (injuriesResult.status === 'fulfilled') espnInjuries = injuriesResult.value;
  else providerErrors.push({ source: 'SportsDataverse/WeHoop ESPN injuries', message: injuriesResult.reason?.message || 'Injury fetch failed' });

  if (transactionsResult.status === 'fulfilled') espnTransactions = transactionsResult.value;
  else providerErrors.push({ source: 'SportsDataverse/WeHoop ESPN transactions', message: transactionsResult.reason?.message || 'Transaction fetch failed' });

  const teamMap = new Map();
  for (const team of sportsDbTeams) teamMap.set(key(team.name), team);
  for (const team of espnRosterData.teams || []) {
    if (!teamMap.has(key(team.name))) teamMap.set(key(team.name), { id: `espn-${team.id}`, name: team.name });
  }
  for (const item of OFFICIAL_ROSTER_SNAPSHOT) {
    if (!teamMap.has(key(item.team))) teamMap.set(key(item.team), { id: `wnba-roster-${key(item.team)}`, name: item.team });
  }
  const normalizedTeams = [...teamMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const teamIdByName = new Map(normalizedTeams.map(team => [key(team.name), team.id]));

  const playersByName = new Map();
  for (const player of sportsDbPlayers) playersByName.set(key(player.name), player);
  for (const raw of espnRosterData.players || []) {
    const player = normalizeEspnPlayer(raw, teamIdByName);
    const playerKey = key(player.name);
    const existing = playersByName.get(playerKey);
    playersByName.set(playerKey, existing ? mergePlayerRecord(existing, player) : player);
  }

  const officialPlayers = OFFICIAL_ROSTER_SNAPSHOT.map(item => officialRosterPlayer(item, teamIdByName, playersByName.get(key(item.name))));
  const layeredPlayers = applyCuratedLayer(officialPlayers, normalizedTeams)
    .map(attachOfficialHeadshot);
  const uniquePlayers = [...new Map(layeredPlayers.map(player => [key(player.name), player])).values()]
    .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

  const transactions = mergeTransactions(
    Array.isArray(liveUpdates.transactions) ? liveUpdates.transactions : [],
    espnTransactions
  );
  const injuries = mergeInjuries(
    Array.isArray(liveUpdates.injuries) ? liveUpdates.injuries : [],
    espnInjuries
  );
  const updatedAt = new Date().toISOString();
  const failedRosters = sportsDbFailedRosters + Number(espnRosterData.failedRosters || 0);

  if (!uniquePlayers.length) {
    return res.status(502).json({
      error: 'No roster provider returned usable WNBA players.',
      source: 'TheSportsDB + SportsDataverse/WeHoop ESPN bridge',
      providerErrors
    });
  }

  return res.status(200).json({
    source: 'Official WNBA 2026 team roster pages + TheSportsDB + SportsDataverse/WeHoop ESPN bridge + curated public-source corrections',
    sources: ['Official WNBA 2026 team roster pages', 'TheSportsDB', 'SportsDataverse/WeHoop ESPN bridge', 'Curated public-source corrections'],
    leagueId: LEAGUE_ID,
    updatedAt,
    liveUpdatesUpdatedAt: updatedAt,
    curatedUpdatesUpdatedAt: liveUpdates.updatedAt || null,
    teams: normalizedTeams,
    players: uniquePlayers,
    playerCount: uniquePlayers.length,
    officialRosterSnapshot: {
      refreshedAt: '2026-08-22',
      players: OFFICIAL_ROSTER_SNAPSHOT.length,
      teams: new Set(OFFICIAL_ROSTER_SNAPSHOT.map(item => item.team)).size
    },
    transactions,
    injuries,
    injuryCount: injuries.length,
    transactionCount: transactions.length,
    wehoopCoverage: {
      rosterPlayers: (espnRosterData.players || []).length,
      rosterTeams: (espnRosterData.teams || []).length,
      injuries: espnInjuries.length,
      transactions: espnTransactions.length
    },
    partial: failedRosters > 0 || providerErrors.length > 0,
    failedRosters,
    providerErrors,
    artworkPolicy: 'Official transparent WNBA headshots are preferred when a verified player ID is available; existing roster photos remain as fallbacks.'
  });
};
