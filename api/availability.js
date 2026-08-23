const liveUpdates = require('../player-live-updates.json');
const { getWnbaInjuries } = require('../lib/wehoop-espn');

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeProvider(item = {}) {
  const raw = String(item.status || '').trim().toUpperCase();
  const status = raw === 'OUT' ? 'OUT'
    : raw.includes('SEASON') ? 'OUT FOR SEASON'
      : raw.includes('QUESTION') ? 'QUESTIONABLE'
        : raw.includes('DAY') ? 'DAY TO DAY'
          : raw || 'STATUS';
  return {
    player: item.name || 'Player',
    team: item.team || 'WNBA',
    status,
    reason: [item.injury, item.shortComment].filter(Boolean).join(' · ') || item.longComment || 'Availability update',
    updated: String(item.date || '').slice(0, 10),
    returnDate: String(item.returnDate || '').slice(0, 10),
    source: item.source || 'ESPN injury feed'
  };
}

function currentCuratedLongTerm() {
  const items = Array.isArray(liveUpdates.injuries) ? liveUpdates.injuries : [];
  return items.filter(item => {
    const status = String(item.status || '').toUpperCase();
    return status.includes('SEASON') || status === 'NWT';
  });
}

function mergeAvailability(provider = []) {
  const byPlayer = new Map();
  for (const raw of provider) {
    const item = normalizeProvider(raw);
    if (!item.player) continue;
    byPlayer.set(key(item.player), item);
  }
  for (const item of currentCuratedLongTerm()) {
    const k = key(item.player);
    if (!byPlayer.has(k)) byPlayer.set(k, { ...item, source: item.source || 'WNBA Injury Report / team release' });
  }
  return [...byPlayer.values()]
    .filter(item => !['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status || '').toUpperCase()))
    .sort((a, b) => String(b.updated || '').localeCompare(String(a.updated || '')) || String(a.player).localeCompare(String(b.player)));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=180');
  const checkedAt = new Date().toISOString();
  const errors = [];
  let provider = [];
  try {
    provider = await getWnbaInjuries();
  } catch (error) {
    errors.push(error.message || 'Live availability feed unavailable');
  }

  const injuries = mergeAvailability(provider);
  const latestReportDate = injuries.reduce((latest, item) => String(item.updated || '') > latest ? String(item.updated || '') : latest, '');

  return res.status(200).json({
    checkedAt,
    latestReportDate: latestReportDate || null,
    refreshCadence: '30 minutes',
    officialSource: 'https://www.wnba.com/wnba-injury-report',
    machineReadableCrossCheck: 'ESPN WNBA injury feed',
    injuryCount: injuries.length,
    injuries,
    partial: errors.length > 0,
    errors
  });
};
