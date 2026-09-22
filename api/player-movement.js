const liveUpdates = require('../player-live-updates.json');
const wireSnapshot = require('../player-wire-snapshot.json');
const { LATEST_MOVEMENT_PATCH } = require('../lib/latest-movement-patch');
const { CURRENT_MOVEMENT_PATCH } = require('../lib/current-movement-patch');
const { officialHeadshot } = require('../lib/wnba-headshots');
const { getWnbaTransactions, getWnbaRosters } = require('../lib/wehoop-espn');

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
const MOVEMENT_PHOTO_FALLBACKS = new Map([
  ['aminatagueye', 'https://assets.fiba.basketball/image/upload/w_720,h_960,c_pad,g_north/f_png/q_auto/.headshot--person_269523--competition_208875']
]);

function inferTransactionType(detail = '', fallback = 'TRANSACTION') {
  const text = String(detail || '').trim();
  if (/^waived\b/i.test(text)) return 'WAIVED';
  if (/^released\b/i.test(text)) return 'RELEASED';
  if (/^signed\b/i.test(text)) return 'SIGNED';
  if (/^claimed\b/i.test(text)) return 'CLAIMED';
  if (/^acquired\b/i.test(text)) return 'ACQUIRED';
  if (/^traded\b/i.test(text)) return 'TRADE';
  if (/^set\b[\s\S]*\bas active\b/i.test(text)) return 'SET ACTIVE';
  return String(fallback || 'TRANSACTION').toUpperCase();
}

function inferPlayerFromDetail(detail = '') {
  const text = String(detail || '').trim();
  const match = text.match(/^(?:Waived|Released|Signed|Claimed|Acquired|Traded|Set)\s+(?:(?:G|F|C|G\/F|F\/G|F\/C|C\/F)\s+)?(.+?)(?=\s+(?:to|as|off|from|after|for|and)\b|[.;]|$)/i);
  return match?.[1]?.trim() || '';
}

function normalizeProvider(item = {}) {
  const detail = item.description || item.detail || [item.fromTeam, item.team].filter(Boolean).join(' → ') || 'Roster update';
  const fallbackType = item.type?.description || item.type?.text || item.type || 'TRANSACTION';
  const rawPlayer = item.name || (typeof item.player === 'string' ? item.player : '') || item.athlete?.displayName || item.player?.displayName || '';
  const explicitPlayer = rawPlayer && rawPlayer !== 'Player' ? rawPlayer : '';
  return {
    date: String(item.date || '').slice(0, 10),
    type: inferTransactionType(detail, fallbackType),
    player: explicitPlayer || inferPlayerFromDetail(detail) || 'Player',
    team: item.team?.displayName || item.team || item.fromTeam || 'WNBA',
    detail,
    source: item.source || 'ESPN transaction feed',
    sourceUrl: item.sourceUrl || null
  };
}

function combineTransactions(provider = []) {
  const combined = [
    ...(Array.isArray(LATEST_MOVEMENT_PATCH) ? LATEST_MOVEMENT_PATCH : []),
    ...(Array.isArray(CURRENT_MOVEMENT_PATCH) ? CURRENT_MOVEMENT_PATCH : []),
    ...(Array.isArray(wireSnapshot?.movement?.transactions) ? wireSnapshot.movement.transactions : []),
    ...(Array.isArray(liveUpdates.transactions) ? liveUpdates.transactions : []),
    ...provider.map(normalizeProvider)
  ];
  const seen = new Set();
  return combined
    .map(normalizeProvider)
    .filter(item => item && item.player && item.player !== 'Player' && item.date)
    .sort((a, b) => String(b.date).slice(0,10).localeCompare(String(a.date).slice(0,10)) || String(a.player).localeCompare(String(b.player)))
    .filter(item => {
      const signature = `${String(item.date).slice(0,10)}|${key(item.player)}|${key(item.team)}|${key(item.type)}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function addRosterCrossCheck(items, rosterData) {
  const rosterPlayers = Array.isArray(rosterData?.players) ? rosterData.players : [];
  const livePlayers = new Map(rosterPlayers.map(player => [key(player.name), player]));
  const liveTeams = new Map(rosterPlayers.map(player => [key(player.name), player.team || '']));
  return items.map(item => {
    const livePlayer = livePlayers.get(key(item.player)) || null;
    const currentTeam = liveTeams.get(key(item.player)) || '';
    const type = String(item.type || '').toUpperCase();
    const destinationMove = /SIGNED|CLAIMED|TRADE|ACQUIRED|CONVERTED|SET ACTIVE/.test(type);
    const exitMove = /WAIVED|RELEASED|BUYOUT/.test(type);
    let rosterCheck = 'Not independently confirmed in live roster feed';
    if (destinationMove && currentTeam && key(currentTeam) === key(item.team)) rosterCheck = `Current roster confirms ${currentTeam}`;
    else if (exitMove && (!currentTeam || key(currentTeam) !== key(item.team))) rosterCheck = currentTeam ? `Live roster now lists ${currentTeam}` : 'Live roster no longer lists player';
    else if (currentTeam) rosterCheck = `Live roster lists ${currentTeam}`;
    const headshot = officialHeadshot(item.player);
    const livePhoto = String(livePlayer?.headshot || '').trim();
    return {
      ...item,
      currentTeam: currentTeam || null,
      rosterCheck,
      wnbaId: headshot?.id || null,
      espnId: livePlayer?.id || null,
      photo: headshot?.url || livePhoto || MOVEMENT_PHOTO_FALLBACKS.get(key(item.player)) || null
    };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const checkedAt = new Date().toISOString();
  const errors = [];
  const [transactionResult, rosterResult] = await Promise.allSettled([
    getWnbaTransactions(2026, 250),
    getWnbaRosters(2026)
  ]);

  const providerTransactions = transactionResult.status === 'fulfilled' ? transactionResult.value : [];
  const rosterData = rosterResult.status === 'fulfilled' ? rosterResult.value : { teams: [], players: [] };
  if (transactionResult.status === 'rejected') errors.push(`Transaction feed: ${transactionResult.reason?.message || 'unavailable'}`);
  if (rosterResult.status === 'rejected') errors.push(`Roster cross-check: ${rosterResult.reason?.message || 'unavailable'}`);

  const transactions = addRosterCrossCheck(combineTransactions(providerTransactions), rosterData);
  const latestTransactionDate = transactions[0]?.date || wireSnapshot?.movement?.latestTransactionDate || null;

  return res.status(200).json({
    checkedAt,
    snapshotGeneratedAt: wireSnapshot?.generatedAt || null,
    latestTransactionDate,
    refreshCadence: 'live on request · hourly background sync',
    sortOrder: 'date descending',
    officialSource: 'https://www.wnba.com/players/transactions?transaction=&team=all&month=0',
    crossCheckSources: [
      'Live WNBA roster feed via ESPN',
      'Hourly stored player wire snapshot',
      'Official team and league transaction pages'
    ],
    transactionCount: transactions.length,
    rosterCrossCheckPlayers: Array.isArray(rosterData.players) ? rosterData.players.length : 0,
    transactions,
    partial: errors.length > 0,
    errors
  });
};
