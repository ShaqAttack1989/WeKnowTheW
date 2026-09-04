const liveUpdates = require('../player-live-updates.json');
const { CURRENT_MOVEMENT_PATCH, RECENT_ROSTER_PATCH } = require('../lib/current-movement-patch');
const { CURRENT_AVAILABILITY_PATCH } = require('../lib/current-availability-patch');
const { officialHeadshot } = require('../lib/wnba-headshots');
const { OFFICIAL_ROSTER_SNAPSHOT } = require('../lib/official-roster-snapshot');
const { getWnbaRosters, getWnbaInjuries, getWnbaTransactions } = require('../lib/wehoop-espn');

// Players who must remain searchable even when a provider's historical roster
// endpoint stops returning them. This is intentionally a retention layer, not
// a current-roster claim.
const RETAINED_PLAYERPEDIA = [
  {
    name: 'Deja Kelly',
    wnbaId: '1642795',
    lastTeam: 'Las Vegas Aces',
    position: 'Point Guard',
    number: '2',
    status: 'free-agent',
    lastWnbaSeason: 2025,
    wnbaRegularSeasonGames: 0,
    birthDate: '2001-09-08',
    birthPlace: 'San Antonio, Texas',
    nationality: 'United States',
    height: "5'8\"",
    college: 'Oregon · North Carolina',
    description: 'Kelly went undrafted in 2025, signed a training-camp contract with Las Vegas and was waived before the regular season. In 2026, she played in Athletes Unlimited and helped Charlotte Crown win the inaugural UPSHOT championship, earning Championship MVP.',
    sourceUrl: 'https://www.wnba.com/player/1642795/deja-kelly',
    reason: 'Free agent · last WNBA team: Las Vegas Aces. Kelly played for Athletes Unlimited in 2026, then won the inaugural UPSHOT championship and Championship MVP with Charlotte Crown.'
  },
  {
    name: 'Sydney Colson',
    wnbaId: '202641',
    lastTeam: 'Indiana Fever',
    position: 'Guard',
    number: '51',
    status: 'free-agent',
    lastWnbaSeason: 2025,
    reason: '2026 unrestricted free agent; last played for Indiana in 2025 and remains in Playerpedia while pursuing a return to the WNBA.'
  }
];

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.length > 1 ? parts[parts.length - 1] : parts[0] || '' };
}
function staffLike(position = '') {
  return /(coach|manager|trainer|staff|president|director|executive|owner|operations|general manager)/i.test(String(position));
}
function cleanUrl(value = '') {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}
function freeAgentLike(status = '') {
  return ['waived', 'released', 'inactive', 'free-agent', 'free agent', 'ufa'].includes(String(status).trim().toLowerCase());
}
function teamMapFromRosters(rosterData = {}) {
  return new Map((rosterData.teams || []).map(team => [key(team.name), String(team.id || '')]));
}
function staticByName() {
  return new Map(OFFICIAL_ROSTER_SNAPSHOT.map(item => [key(item.name), item]));
}
function curatedOverrideMap() {
  const all = [
    ...(Array.isArray(liveUpdates.rosterOverrides) ? liveUpdates.rosterOverrides : []),
    ...RECENT_ROSTER_PATCH
  ];
  const map = new Map();
  for (const item of all) {
    for (const name of [item.name, ...(Array.isArray(item.aliases) ? item.aliases : [])]) {
      if (name) map.set(key(name), item);
    }
  }
  return map;
}
function movementLastTeamMap() {
  const map = new Map();
  const movement = [CURRENT_MOVEMENT_PATCH, liveUpdates.transactions || []].flat();
  for (const item of movement) {
    const type = String(item.type || '').toLowerCase();
    if (!/(waiv|release)/.test(type)) continue;
    const playerName = item.player || item.name || '';
    const team = item.team || item.fromTeam || '';
    if (playerName && team) map.set(key(playerName), team);
  }
  return map;
}
function baseFromLive(raw, staticItem, teamIds) {
  const name = raw.name || staticItem?.name || '';
  const split = splitName(name);
  const firstName = raw.firstName || split.firstName;
  const lastName = raw.lastName || split.lastName;
  const espnId = String(raw.id || '').replace(/[^0-9]/g, '');
  const official = officialHeadshot(name);
  const photo = official?.url || cleanUrl(raw.headshot) || (espnId ? `https://a.espncdn.com/i/headshots/wnba/players/full/${espnId}.png` : '');
  return {
    id: official?.id ? `wnba-${official.id}` : `espn-${raw.id || key(name)}`,
    wnbaId: official?.id || staticItem?.wnbaId || '',
    espnId,
    name,
    firstName,
    lastName,
    teamId: teamIds.get(key(raw.team)) || String(raw.teamId || ''),
    team: raw.team || staticItem?.team || '',
    position: raw.position || staticItem?.position || 'Player',
    number: String(raw.number || staticItem?.number || ''),
    nationality: '',
    birthDate: '',
    height: raw.height || '',
    weight: raw.weight || '',
    photo,
    photoThumb: photo,
    photoCutout: official?.url || '',
    officialHeadshot: official?.url || '',
    headshot: photo,
    photoOfficial: Boolean(official?.url),
    photoSource: official?.url ? 'Official WNBA headshot CDN' : 'ESPN roster feed',
    photoSourceUrl: staticItem?.sourceUrl || '',
    rosterSourceUrl: staticItem?.sourceUrl || '',
    currentRoster: true,
    lastWnbaSeason: 2026,
    lastTeam: raw.team || staticItem?.team || '',
    dataSources: ['Live ESPN WNBA roster feed', ...(staticItem ? ['Official WNBA roster snapshot cross-check'] : [])]
  };
}
function baseFromStatic(item, teamIds) {
  const { firstName, lastName } = splitName(item.name);
  const official = officialHeadshot(item.name);
  const photo = official?.url || '';
  return {
    id: `wnba-${item.wnbaId || key(item.name)}`,
    wnbaId: String(item.wnbaId || ''),
    espnId: '',
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
    photo,
    photoThumb: photo,
    photoCutout: photo,
    officialHeadshot: photo,
    headshot: photo,
    photoOfficial: Boolean(photo),
    photoSource: photo ? 'Official WNBA headshot CDN' : 'Official WNBA roster snapshot',
    photoSourceUrl: item.sourceUrl || '',
    rosterSourceUrl: item.sourceUrl || '',
    officialRosterSnapshot: true,
    currentRoster: true,
    lastWnbaSeason: 2026,
    lastTeam: item.team,
    dataSources: ['Official WNBA roster snapshot fallback']
  };
}
function baseFromRecent(raw, teamIds, season = 2025) {
  const base = baseFromLive(raw, null, teamIds);
  const lastTeam = raw.team || base.team || '';
  return {
    ...base,
    teamId: teamIds.get(key(lastTeam)) || String(raw.teamId || ''),
    team: lastTeam ? `Free Agent · last: ${lastTeam}` : 'Recent WNBA player',
    currentRoster: false,
    recentPlayerpedia: true,
    lastWnbaSeason: season,
    lastTeam,
    liveStatus: 'recent',
    liveNote: `Played in the WNBA in ${season}; retained in Playerpedia even when not on the current-season roster.`,
    dataSources: [...new Set([...(base.dataSources || []), `${season} ESPN WNBA roster archive`])]
  };
}
function baseFromRetained(item, teamIds, season = 2025) {
  const lastTeam = item.lastTeam || '';
  const base = baseFromStatic({
    name: item.name,
    team: lastTeam || 'Free Agent',
    position: item.position || 'Player',
    number: item.number || '',
    wnbaId: item.wnbaId || '',
    sourceUrl: item.sourceUrl || ''
  }, teamIds);
  return {
    ...base,
    curated: true,
    teamId: '',
    team: lastTeam ? `Free Agent · last: ${lastTeam}` : 'Free Agent',
    currentRoster: false,
    recentPlayerpedia: true,
    retainedPlayerpedia: true,
    lastWnbaSeason: Number(item.lastWnbaSeason || season),
    wnbaRegularSeasonGames: Number.isFinite(Number(item.wnbaRegularSeasonGames)) ? Number(item.wnbaRegularSeasonGames) : null,
    lastTeam,
    birthDate: item.birthDate || base.birthDate,
    birthPlace: item.birthPlace || '',
    nationality: item.nationality || base.nationality,
    height: item.height || base.height,
    college: item.college || '',
    description: item.description || '',
    liveStatus: item.status || 'free-agent',
    liveEffectiveDate: item.effectiveDate || '',
    liveNote: item.reason || 'Retained in Playerpedia after leaving a current WNBA roster.',
    dataSources: [...new Set([...(base.dataSources || []), 'Playerpedia retained-player safeguard'])]
  };
}
function applyOverride(player, override, teamIds) {
  if (!override) return player;
  const next = { ...player };
  const status = String(override.status || '').toLowerCase();
  if (override.name && key(override.name) !== key(next.name)) {
    const parts = splitName(override.name);
    next.name = override.name; next.firstName = parts.firstName; next.lastName = parts.lastName;
  }
  if (override.wnbaId) {
    next.wnbaId = String(override.wnbaId);
    next.id = `wnba-${override.wnbaId}`;
  }
  if (override.lastTeam) next.lastTeam = override.lastTeam;
  if (override.team !== undefined) {
    if (override.team && !freeAgentLike(status)) {
      next.team = override.team;
      next.lastTeam = override.team;
      next.teamId = teamIds.get(key(override.team)) || next.teamId;
    } else if (freeAgentLike(status)) {
      const lastTeam = override.lastTeam || next.lastTeam || (override.team && !/^Free Agent/i.test(override.team) ? override.team : '') || next.team || '';
      next.lastTeam = lastTeam.replace(/^Free Agent\s*·\s*last:\s*/i, '');
      next.team = next.lastTeam ? `Free Agent · last: ${next.lastTeam}` : 'Free Agent';
      next.teamId = '';
      next.currentRoster = false;
    } else {
      next.team = '';
      next.teamId = '';
    }
  }
  if (override.position) next.position = override.position;
  if (override.number !== undefined && override.number !== null) next.number = String(override.number);
  if (override.lastWnbaSeason) next.lastWnbaSeason = Number(override.lastWnbaSeason);
  if (override.sourceUrl) {
    next.rosterSourceUrl = override.sourceUrl;
    next.photoSourceUrl = next.photoSourceUrl || override.sourceUrl;
  }
  next.liveStatus = override.status || 'active';
  next.liveEffectiveDate = override.effectiveDate || '';
  next.liveNote = override.reason || '';
  if (['active','development'].includes(status)) next.currentRoster = true;
  if (freeAgentLike(status)) next.currentRoster = false;
  next.dataSources = [...new Set([...(next.dataSources || []), 'Curated transaction/roster correction'])];
  return next;
}
function buildRoster(rosterData = {}, recentRosterData = {}, recentSeason = 2025) {
  const teamIds = teamMapFromRosters(rosterData);
  const staticMap = staticByName();
  const overrideMap = curatedOverrideMap();
  const lastTeamByMovement = movementLastTeamMap();
  const live = Array.isArray(rosterData.players) ? rosterData.players.filter(p => p?.name && !staffLike(p.position) && p.active !== false) : [];
  const liveReliable = (rosterData.teams || []).length >= 12 && live.length >= 120;
  const players = liveReliable
    ? live.map(raw => baseFromLive(raw, staticMap.get(key(raw.name)), teamIds))
    : OFFICIAL_ROSTER_SNAPSHOT.map(item => baseFromStatic(item, teamIds));

  const byName = new Map(players.map(player => [key(player.name), player]));

  // The official WNBA roster snapshot is not merely a provider-failure fallback.
  // It also fills individual player gaps when a mostly healthy live provider is
  // missing one or two current players. Curated movement overrides below correct
  // any snapshot entries that have since been waived, traded or newly signed.
  for (const staticItem of OFFICIAL_ROSTER_SNAPSHOT) {
    const playerKey = key(staticItem.name);
    if (!playerKey || byName.has(playerKey)) continue;
    byName.set(playerKey, baseFromStatic(staticItem, teamIds));
  }

  const recent = Array.isArray(recentRosterData.players)
    ? recentRosterData.players.filter(player => player?.name && !staffLike(player.position))
    : [];
  for (const raw of recent) {
    const playerKey = key(raw.name);
    if (!playerKey || byName.has(playerKey)) continue;
    byName.set(playerKey, baseFromRecent(raw, teamIds, recentSeason));
  }

  for (const retained of RETAINED_PLAYERPEDIA) {
    const playerKey = key(retained.name);
    if (!playerKey || byName.has(playerKey)) continue;
    byName.set(playerKey, baseFromRetained(retained, teamIds, recentSeason));
  }

  for (const [playerKey, override] of overrideMap.entries()) {
    const status = String(override.status || '').toLowerCase();
    const existing = byName.get(playerKey);
    if (existing) {
      byName.set(playerKey, applyOverride(existing, override, teamIds));
      continue;
    }
    if (freeAgentLike(status)) {
      const lastTeam = override.lastTeam || lastTeamByMovement.get(playerKey) || '';
      if (!lastTeam && !override.retainInPlayerpedia) continue;
      byName.set(playerKey, baseFromRetained({ ...override, lastTeam, lastWnbaSeason: override.lastWnbaSeason || 2026 }, teamIds, recentSeason));
      continue;
    }
    if (!override.team || !['active','development'].includes(status)) continue;
    const synthetic = baseFromStatic({ name: override.name, team: override.team, position: override.position || 'Player', number: override.number || '', wnbaId: override.wnbaId || '', sourceUrl: override.sourceUrl || '' }, teamIds);
    byName.set(playerKey, applyOverride(synthetic, override, teamIds));
  }

  const photoRules = new Map((liveUpdates.photoRules || []).map(item => [key(item.name), item]));
  const normalized = [...byName.values()].map(player => {
    const rule = photoRules.get(key(player.name));
    if (!rule?.blockRosterApiPhoto) return player;
    return { ...player, photo: '', photoThumb: '', photoCutout: '', headshot: '', photoSource: '', photoSourceUrl: '', photoNeedsDetail: Boolean(rule.preferDetailApiPhoto), photoRuleNote: rule.reason || '' };
  }).filter(player => player.name && player.team);
  const canonicalPlayers = new Map();
  const completeness = player => [player.wnbaId, player.officialHeadshot, player.photo, player.position && player.position !== 'Player', player.number].filter(Boolean).length;
  for (const player of normalized) {
    const playerKey = key(player.name);
    const existing = canonicalPlayers.get(playerKey);
    if (!existing || completeness(player) > completeness(existing)) canonicalPlayers.set(playerKey, player);
  }
  return [...canonicalPlayers.values()].map(player => {
    const filterTeam = player.currentRoster === false ? player.lastTeam : player.team;
    return { ...player, teamId: player.teamId || (filterTeam ? key(filterTeam) : '') };
  })
    .sort((a,b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
}
function normalizeTransaction(item = {}) {
  return {
    date: String(item.date || '').slice(0,10),
    type: String(item.type || 'TRANSACTION').toUpperCase(),
    player: item.name || item.player || 'Player',
    team: item.team || item.fromTeam || 'WNBA',
    detail: item.description || item.detail || [item.fromTeam, item.team].filter(Boolean).join(' → ') || 'Roster update',
    source: item.source || 'Live transaction feed'
  };
}
function mergeTransactions(provider = []) {
  const all = [CURRENT_MOVEMENT_PATCH, liveUpdates.transactions || [], provider].flat().map(normalizeTransaction);
  const seen = new Set();
  return all.filter(item => item.date && item.player).sort((a,b) => b.date.localeCompare(a.date)).filter(item => {
    const sig = `${item.date}|${key(item.player)}|${key(item.team)}|${key(item.type)}`;
    if (seen.has(sig)) return false; seen.add(sig); return true;
  });
}
function normalizeInjury(item = {}) {
  const raw = String(item.status || '').toUpperCase();
  const status = raw === 'OUT' ? 'OUT' : raw.includes('SEASON') ? 'OUT FOR SEASON' : raw.includes('QUESTION') ? 'QUESTIONABLE' : raw.includes('DAY') ? 'DAY TO DAY' : raw || 'STATUS';
  return { player: item.name || item.player || 'Player', team: item.team || 'WNBA', status, reason: [item.injury, item.shortComment].filter(Boolean).join(' · ') || item.reason || item.longComment || 'Availability update', updated: String(item.date || item.updated || '').slice(0,10), returnDate: String(item.returnDate || '').slice(0,10), source: item.source || 'Live injury feed' };
}
function mergeInjuries(provider = []) {
  const byPlayer = new Map();
  for (const raw of provider) {
    const item = normalizeInjury(raw); if (item.player) byPlayer.set(key(item.player), item);
  }
  for (const raw of liveUpdates.injuries || []) {
    const status = String(raw.status || '').toUpperCase();
    if (!status.includes('SEASON') && status !== 'NWT') continue;
    if (!byPlayer.has(key(raw.player))) byPlayer.set(key(raw.player), normalizeInjury(raw));
  }
  for (const raw of CURRENT_AVAILABILITY_PATCH || []) {
    if (!raw?.player) continue;
    byPlayer.set(key(raw.player), normalizeInjury(raw));
  }
  return [...byPlayer.values()].filter(item => !['AVAILABLE','ACTIVE','CLEARED'].includes(item.status)).sort((a,b) => String(b.updated).localeCompare(String(a.updated)));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=300');
  const checkedAt = new Date().toISOString();
  const errors = [];
  const [rostersResult, recentRostersResult, injuriesResult, transactionsResult] = await Promise.allSettled([
    getWnbaRosters(2026), getWnbaRosters(2025), getWnbaInjuries(), getWnbaTransactions(2026,250)
  ]);
  const rosterData = rostersResult.status === 'fulfilled' ? rostersResult.value : { teams: [], players: [], failedRosters: 15 };
  const recentRosterData = recentRostersResult.status === 'fulfilled' ? recentRostersResult.value : { teams: [], players: [], failedRosters: 13 };
  const providerInjuries = injuriesResult.status === 'fulfilled' ? injuriesResult.value : [];
  const providerTransactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];
  if (rostersResult.status === 'rejected') errors.push(`Roster feed: ${rostersResult.reason?.message || 'unavailable'}`);
  if (recentRostersResult.status === 'rejected') errors.push(`2025 Playerpedia archive: ${recentRostersResult.reason?.message || 'unavailable'}`);
  if (injuriesResult.status === 'rejected') errors.push(`Availability feed: ${injuriesResult.reason?.message || 'unavailable'}`);
  if (transactionsResult.status === 'rejected') errors.push(`Transaction feed: ${transactionsResult.reason?.message || 'unavailable'}`);

  const players = buildRoster(rosterData, recentRosterData, 2025);
  const currentPlayers = players.filter(player => player.currentRoster !== false);
  const recentPlayers = players.filter(player => player.currentRoster === false);
  const teams = [...new Map(currentPlayers.filter(player => player.team && !/^Free Agent/i.test(player.team)).map(player => [key(player.team), { id: player.teamId || key(player.team), name: player.team }])).values()].sort((a,b)=>a.name.localeCompare(b.name));
  const transactions = mergeTransactions(providerTransactions);
  const injuries = mergeInjuries(providerInjuries);
  if (!players.length) return res.status(502).json({ error: 'No roster provider returned usable WNBA players.', checkedAt, errors });

  return res.status(200).json({
    source: 'Live 2026 ESPN WNBA rosters + official WNBA roster snapshot gap-fill + 2025 Playerpedia archive + retained free-agent safeguard + curated transaction corrections',
    sources: ['Live ESPN WNBA roster feed','Official WNBA roster snapshot gap-fill','2025 ESPN WNBA roster archive','Playerpedia retained-player safeguard','WNBA Transactions Report cross-check','Curated transaction corrections'],
    leagueId: 4516,
    updatedAt: checkedAt,
    rosterCheckedAt: checkedAt,
    curatedUpdatesUpdatedAt: liveUpdates.updatedAt || null,
    refreshCadence: { roster: '24 hours minimum, live cache can refresh sooner', availability: '30 minutes via /api/availability', movement: '24 hours via /api/player-movement' },
    teams,
    players,
    playerCount: players.length,
    currentPlayerCount: currentPlayers.length,
    recentPlayerCount: recentPlayers.length,
    playerpediaCoverage: { currentSeason: 2026, recentArchiveSeason: 2025, retainedSafeguards: RETAINED_PLAYERPEDIA.length, officialSnapshotGapFill: true, rule: 'Once a player appears in the WNBA player pool, Playerpedia keeps her searchable through roster changes, free agency, individual provider gaps and archive-provider gaps.' },
    transactions,
    transactionCount: transactions.length,
    injuries,
    injuryCount: injuries.length,
    officialRosterSnapshot: { refreshedAt: '2026-08-22', players: OFFICIAL_ROSTER_SNAPSHOT.length, teams: new Set(OFFICIAL_ROSTER_SNAPSHOT.map(item => item.team)).size, fallbackOnly: false, gapFillEnabled: true },
    liveRosterCoverage: { players: (rosterData.players || []).length, teams: (rosterData.teams || []).length, failedRosters: Number(rosterData.failedRosters || 0) },
    recentRosterCoverage: { season: 2025, players: (recentRosterData.players || []).length, teams: (recentRosterData.teams || []).length, failedRosters: Number(recentRosterData.failedRosters || 0) },
    partial: errors.length > 0,
    providerErrors: errors,
    artworkPolicy: 'Official transparent WNBA headshots are preferred when a verified player ID is available; live and recent-roster photos remain as fallbacks.'
  });
};

module.exports._test = { buildRoster, RETAINED_PLAYERPEDIA };
