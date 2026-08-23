const liveUpdates = require('../player-live-updates.json');
const { CURRENT_MOVEMENT_PATCH } = require('../lib/current-movement-patch');
const { getWnbaTransactions, getWnbaRosters } = require('../lib/wehoop-espn');

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeProvider(item = {}) {
  return {
    date: String(item.date || '').slice(0, 10),
    type: String(item.type || 'TRANSACTION').toUpperCase(),
    player: item.name || 'Player',
    team: item.team || item.fromTeam || 'WNBA',
    detail: item.description || [item.fromTeam, item.team].filter(Boolean).join(' → ') || 'Roster update',
    source: item.source || 'ESPN transaction feed'
  };
}

function combineTransactions(provider = []) {
  const combined = [
    ...CURRENT_MOVEMENT_PATCH,
    ...(Array.isArray(liveUpdates.transactions) ? liveUpdates.transactions : []),
    ...provider.map(normalizeProvider)
  ];
  const seen = new Set();
  return combined
    .filter(item => item && item.player && item.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.player).localeCompare(String(b.player)))
    .filter(item => {
      const signature = `${String(item.date).slice(0,10)}|${key(item.player)}|${key(item.team)}|${key(item.type)}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function addRosterCrossCheck(items, rosterData) {
  const rosterPlayers = Array.isArray(rosterData?.players) ? rosterData.players : [];
  const liveTeams = new Map(rosterPlayers.map(player => [key(player.name), player.team || '']));
  return items.map(item => {
    const currentTeam = liveTeams.get(key(item.player)) || '';
    const type = String(item.type || '').toUpperCase();
    const destinationMove = /SIGNED|CLAIMED|TRADE|ACQUIRED|CONVERTED/.test(type);
    const exitMove = /WAIVED|RELEASED/.test(type);
    let rosterCheck = 'Not independently confirmed in live roster feed';
    if (destinationMove && currentTeam && key(currentTeam) === key(item.team)) rosterCheck = `Current roster confirms ${currentTeam}`;
    else if (exitMove && (!currentTeam || key(currentTeam) !== key(item.team))) rosterCheck = currentTeam ? `Live roster now lists ${currentTeam}` : 'Live roster no longer lists player';
    else if (currentTeam) rosterCheck = `Live roster lists ${currentTeam}`;
    return { ...item, currentTeam: currentTeam || null, rosterCheck };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
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
  const latestTransactionDate = transactions[0]?.date || null;

  return res.status(200).json({
    checkedAt,
    latestTransactionDate,
    refreshCadence: '24 hours',
    officialSource: 'https://www.wnba.com/players/transactions?transaction=&team=all&month=0',
    crossCheckSources: [
      'Live WNBA roster feed via ESPN',
      'Basketball Reference 2026 WNBA transactions',
      'Team announcements for confirmed signings'
    ],
    transactionCount: transactions.length,
    rosterCrossCheckPlayers: Array.isArray(rosterData.players) ? rosterData.players.length : 0,
    transactions,
    partial: errors.length > 0,
    errors
  });
};
