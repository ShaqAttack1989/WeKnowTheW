const liveUpdates = require('../player-live-updates.json');
const { CURRENT_MOVEMENT_PATCH, RECENT_ROSTER_PATCH } = require('../lib/current-movement-patch');
const { officialHeadshot } = require('../lib/wnba-headshots');
const { OFFICIAL_ROSTER_SNAPSHOT } = require('../lib/official-roster-snapshot');
const { getWnbaRosters, getWnbaInjuries, getWnbaTransactions } = require('../lib/wehoop-espn');

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
function baseFromLive(raw, staticItem, teamIds) {
  const name = raw.name || staticItem?.name || '';
  const { firstName, lastName } = splitName(name);
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
    dataSources: ['Official WNBA roster snapshot fallback']
  };
}
function applyOverride(player, override, teamIds) {
  if (!override) return player;
  const next = { ...player };
  if (override.name && key(override.name) !== key(next.name)) {
    const parts = splitName(override.name);
    next.name = override.name; next.firstName = parts.firstName; next.lastName = parts.lastName;
  }
  if (override.team !== undefined) {
    next.team = override.team || '';
    next.teamId = override.team ? (teamIds.get(key(override.team)) || next.teamId) : '';
  }
  if (override.position) next.position = override.position;
  if (override.number !== undefined && override.number !== null) next.number = String(override.number);
  next.liveStatus = override.status || 'active';
  next.liveEffectiveDate = override.effectiveDate || '';
  next.liveNote = override.reason || '';
  next.dataSources = [...new Set([...(next.dataSources || []), 'Curated transaction/roster correction'])];
  return next;
}
function buildRoster(rosterData = {}) {
  const teamIds = teamMapFromRosters(rosterData);
  const staticMap = staticByName();
  const overrideMap = curatedOverrideMap();
  const live = Array.isArray(rosterData.players) ? rosterData.players.filter(p => p?.name && !staffLike(p.position) && p.active !== false) : [];
  const liveReliable = (rosterData.teams || []).length >= 12 && live.length >= 120;
  const players = liveReliable
    ? live.map(raw => baseFromLive(raw, staticMap.get(key(raw.name)), teamIds))
    : OFFICIAL_ROSTER_SNAPSHOT.map(item => baseFromStatic(item, teamIds));

  const byName = new Map(players.map(player => [key(player.name), player]));
  for (const [playerKey, override] of overrideMap.entries()) {
    const status = String(override.status || '').toLowerCase();
    const existing = byName.get(playerKey);
    if (['waived','released','inactive'].includes(status) && !override.team) {
      if (existing) byName.delete(playerKey);
      continue;
    }
    if (existing) {
      byName.set(playerKey, applyOverride(existing, override, teamIds));
      continue;
    }
    if (!override.team || !['active','development'].includes(status)) continue;
    const synthetic = baseFromStatic({ name: override.name, team: override.team, position: override.position || 'Player', number: override.number || '', wnbaId: '', sourceUrl: '' }, teamIds);
    byName.set(playerKey, applyOverride(synthetic, override, teamIds));
  }

  const photoRules = new Map((liveUpdates.photoRules || []).map(item => [key(item.name), item]));
  return [...byName.values()].map(player => {
    const rule = photoRules.get(key(player.name));
    if (!rule?.blockRosterApiPhoto) return player;
    return { ...player, photo: '', photoThumb: '', photoCutout: '', headshot: '', photoSource: '', photoSourceUrl: '', photoNeedsDetail: Boolean(rule.preferDetailApiPhoto), photoRuleNote: rule.reason || '' };
  }).filter(player => player.name && player.team)
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
  const [rostersResult, injuriesResult, transactionsResult] = await Promise.allSettled([
    getWnbaRosters(2026), getWnbaInjuries(), getWnbaTransactions(2026,250)
  ]);
  const rosterData = rostersResult.status === 'fulfilled' ? rostersResult.value : { teams: [], players: [], failedRosters: 15 };
  const providerInjuries = injuriesResult.status === 'fulfilled' ? injuriesResult.value : [];
  const providerTransactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];
  if (rostersResult.status === 'rejected') errors.push(`Roster feed: ${rostersResult.reason?.message || 'unavailable'}`);
  if (injuriesResult.status === 'rejected') errors.push(`Availability feed: ${injuriesResult.reason?.message || 'unavailable'}`);
  if (transactionsResult.status === 'rejected') errors.push(`Transaction feed: ${transactionsResult.reason?.message || 'unavailable'}`);

  const players = buildRoster(rosterData);
  const teams = [...new Map(players.map(player => [key(player.team), { id: player.teamId || key(player.team), name: player.team }])).values()].sort((a,b)=>a.name.localeCompare(b.name));
  const transactions = mergeTransactions(providerTransactions);
  const injuries = mergeInjuries(providerInjuries);
  if (!players.length) return res.status(502).json({ error: 'No roster provider returned usable WNBA players.', checkedAt, errors });

  return res.status(200).json({
    source: 'Live ESPN WNBA roster feed + official WNBA roster snapshot fallback + curated transaction corrections',
    sources: ['Live ESPN WNBA roster feed','Official WNBA roster snapshot fallback','WNBA Transactions Report cross-check','Curated transaction corrections'],
    leagueId: 4516,
    updatedAt: checkedAt,
    rosterCheckedAt: checkedAt,
    curatedUpdatesUpdatedAt: liveUpdates.updatedAt || null,
    refreshCadence: { roster: '24 hours minimum, live cache can refresh sooner', availability: '30 minutes via /api/availability', movement: '24 hours via /api/player-movement' },
    teams,
    players,
    playerCount: players.length,
    transactions,
    transactionCount: transactions.length,
    injuries,
    injuryCount: injuries.length,
    officialRosterSnapshot: { refreshedAt: '2026-08-22', players: OFFICIAL_ROSTER_SNAPSHOT.length, teams: new Set(OFFICIAL_ROSTER_SNAPSHOT.map(item => item.team)).size, fallbackOnly: true },
    liveRosterCoverage: { players: (rosterData.players || []).length, teams: (rosterData.teams || []).length, failedRosters: Number(rosterData.failedRosters || 0) },
    partial: errors.length > 0,
    providerErrors: errors,
    artworkPolicy: 'Official transparent WNBA headshots are preferred when a verified player ID is available; live roster photos remain as fallbacks.'
  });
};
