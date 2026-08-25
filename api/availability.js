const liveUpdates = require('../player-live-updates.json');
const { getWnbaInjuries } = require('../lib/wehoop-espn');
const { fetchLatestOfficialReport } = require('../lib/wnba-injury-report');

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
    source: item.source || 'ESPN WNBA injury feed',
    officialCurrentReport: false,
    crossCheckOnly: true
  };
}

function currentCuratedCarryovers() {
  const items = Array.isArray(liveUpdates.injuries) ? liveUpdates.injuries : [];
  return items.filter(item => item.carryover === true || String(item.status || '').toUpperCase().includes('SEASON'));
}

function mergeAvailability(officialReport = {}, provider = []) {
  const official = Array.isArray(officialReport.injuries) ? officialReport.injuries : [];
  const coveredTeams = new Set((officialReport.coveredTeams || []).map(key));
  const seen = new Set();
  const combined = [];

  for (const item of official) {
    if (!item?.player) continue;
    const playerKey = key(item.player);
    seen.add(playerKey);
    combined.push({
      ...item,
      source: item.source || 'Official WNBA Injury Report PDF',
      officialCurrentReport: true,
      crossCheckOnly: false
    });
  }

  for (const raw of provider) {
    const item = normalizeProvider(raw);
    if (!item.player || seen.has(key(item.player))) continue;
    if (coveredTeams.has(key(item.team))) continue;
    seen.add(key(item.player));
    combined.push(item);
  }

  for (const item of currentCuratedCarryovers()) {
    if (!item?.player || seen.has(key(item.player))) continue;
    seen.add(key(item.player));
    combined.push({
      ...item,
      source: item.source || 'WNBA Injury Report / team release',
      officialCurrentReport: false,
      trackedCarryover: true,
      seasonLongCarryover: String(item.status || '').toUpperCase().includes('SEASON')
    });
  }

  return combined.filter(item => !['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status || '').toUpperCase()));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=120');
  const checkedAt = new Date().toISOString();
  const errors = [];

  const [officialResult, providerResult] = await Promise.allSettled([
    fetchLatestOfficialReport(),
    getWnbaInjuries()
  ]);

  const officialReport = officialResult.status === 'fulfilled' ? officialResult.value : null;
  if (officialResult.status === 'rejected') errors.push(`Official WNBA report: ${officialResult.reason?.message || 'fetch failed'}`);
  const provider = providerResult.status === 'fulfilled' ? providerResult.value : [];
  if (providerResult.status === 'rejected') errors.push(`ESPN cross-check: ${providerResult.reason?.message || 'fetch failed'}`);

  if (!officialReport) {
    return res.status(502).json({
      error:'Official WNBA availability report unavailable',
      checkedAt,
      refreshCadence:'30 minutes',
      officialSource:'https://www.wnba.com/wnba-injury-report',
      errors
    });
  }

  const injuries = mergeAvailability(officialReport, provider);
  const teamStatuses = Array.isArray(officialReport.teamStatuses) ? officialReport.teamStatuses : [];

  return res.status(200).json({
    checkedAt,
    reportTimestamp: officialReport.reportTimestamp || null,
    reportLabel: officialReport.reportLabel || null,
    latestReportDate: officialReport.reportTimestamp || officialReport.reportDate || null,
    refreshCadence: '30 minutes',
    officialSource: 'https://www.wnba.com/wnba-injury-report',
    officialPdf: officialReport.reportUrl || null,
    officialPdfLive: !officialReport.fallback,
    officialCurrentReportCount: (officialReport.injuries || []).length,
    machineReadableCrossCheck: 'ESPN WNBA injury feed',
    injuryCount: injuries.length,
    injuries,
    teamStatuses,
    coveredTeams: officialReport.coveredTeams || [],
    partial: Boolean(officialReport.fallback) || errors.length > 0,
    fallbackSnapshot: Boolean(officialReport.fallback),
    errors: [...errors, ...(officialReport.errors || [])]
  });
};
