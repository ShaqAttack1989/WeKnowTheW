const liveUpdates = require('../player-live-updates.json');
const wireSnapshot = require('../player-wire-snapshot.json');
const { CURRENT_AVAILABILITY_PATCH } = require('../lib/current-availability-patch');
const { getWnbaInjuries } = require('../lib/wehoop-espn');
const { fetchLatestOfficialReport } = require('../lib/wnba-injury-report');
const { officialHeadshot } = require('../lib/wnba-headshots');

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isoDate(value = '') {
  const raw = String(value || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[1]}-${match[2]}` : '';
}

function availabilityDate(item = {}) {
  return isoDate(item.updated || item.gameDate || item.date || '');
}

function normalizeProvider(item = {}) {
  const raw = String(item.status || '').trim().toUpperCase();
  const status = raw === 'OUT' ? 'OUT'
    : raw.includes('SEASON') ? 'OUT FOR SEASON'
      : raw.includes('QUESTION') ? 'QUESTIONABLE'
        : raw.includes('PROB') ? 'PROBABLE'
          : raw.includes('DAY') ? 'DAY TO DAY'
            : raw || 'STATUS';
  return {
    player: item.name || item.player || 'Player',
    team: item.team || 'WNBA',
    status,
    reason: [item.injury, item.shortComment].filter(Boolean).join(' · ') || item.longComment || item.reason || 'Availability update',
    updated: isoDate(item.date || item.updated || item.gameDate || ''),
    returnDate: isoDate(item.returnDate || ''),
    matchup: item.matchup || '',
    gameTime: item.gameTime || '',
    source: item.source || 'ESPN WNBA injury feed',
    sourceUrl: item.sourceUrl || null,
    officialCurrentReport: false,
    crossCheckOnly: item.crossCheckOnly !== false
  };
}

function seasonLong(item = {}) {
  return String(item.status || '').toUpperCase().includes('SEASON') || item.seasonLongCarryover === true;
}

function snapshotInjuries() {
  return Array.isArray(wireSnapshot?.availability?.injuries) ? wireSnapshot.availability.injuries : [];
}

function currentCuratedCarryovers() {
  const items = [
    ...(Array.isArray(CURRENT_AVAILABILITY_PATCH) ? CURRENT_AVAILABILITY_PATCH : []),
    ...(Array.isArray(liveUpdates.injuries) ? liveUpdates.injuries : []),
    ...snapshotInjuries().filter(seasonLong)
  ];
  const seen = new Set();
  return items.filter(item => {
    if (!item?.player) return false;
    const playerKey = key(item.player);
    if (seen.has(playerKey)) return false;
    seen.add(playerKey);
    return item.carryover === true || seasonLong(item);
  });
}

function addAvailability(combined, seen, item, extras = {}) {
  if (!item?.player) return;
  const playerKey = key(item.player);
  if (!playerKey || seen.has(playerKey)) return;
  seen.add(playerKey);
  combined.push({ ...item, ...extras, updated: availabilityDate(item) || isoDate(item.updated || '') });
}

function mergeAvailability(officialReport = {}, provider = [], useSnapshot = false) {
  const usingFallback = Boolean(officialReport.fallback);
  const official = usingFallback ? [] : (Array.isArray(officialReport.injuries) ? officialReport.injuries : []);
  const coveredTeams = usingFallback ? new Set() : new Set((officialReport.coveredTeams || []).map(key));
  const seen = new Set();
  const combined = [];

  for (const item of Array.isArray(CURRENT_AVAILABILITY_PATCH) ? CURRENT_AVAILABILITY_PATCH : []) {
    addAvailability(combined, seen, item, {
      source: item.source || 'WNBA team announcement',
      officialCurrentReport: false,
      crossCheckOnly: false,
      teamAnnouncementCurrent: true,
      trackedCarryover: true,
      seasonLongCarryover: seasonLong(item)
    });
  }

  for (const item of official) {
    addAvailability(combined, seen, item, {
      source: item.source || 'Official WNBA Injury Report PDF',
      officialCurrentReport: true,
      crossCheckOnly: false
    });
  }

  for (const raw of provider) {
    const item = normalizeProvider(raw);
    if (coveredTeams.has(key(item.team))) continue;
    addAvailability(combined, seen, item);
  }

  if (useSnapshot) {
    for (const item of snapshotInjuries()) {
      if (seasonLong(item)) continue;
      addAvailability(combined, seen, item, { snapshotCarryover: true });
    }
  }

  for (const item of currentCuratedCarryovers()) {
    addAvailability(combined, seen, item, {
      source: item.source || 'WNBA Injury Report / team release',
      officialCurrentReport: false,
      trackedCarryover: true,
      seasonLongCarryover: seasonLong(item)
    });
  }

  return combined
    .filter(item => !['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status || '').toUpperCase()))
    .sort((a, b) => availabilityDate(b).localeCompare(availabilityDate(a)) || String(a.player || '').localeCompare(String(b.player || '')));
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

  const provider = providerResult.status === 'fulfilled' ? providerResult.value : [];
  if (providerResult.status === 'rejected') errors.push(`ESPN cross-check: ${providerResult.reason?.message || 'fetch failed'}`);

  let officialReport = officialResult.status === 'fulfilled' ? officialResult.value : null;
  if (officialResult.status === 'rejected') errors.push(`Official WNBA report: ${officialResult.reason?.message || 'fetch failed'}`);

  const hasSnapshot = snapshotInjuries().length > 0 || Array.isArray(wireSnapshot?.availability?.teamStatuses) && wireSnapshot.availability.teamStatuses.length > 0;
  if (!officialReport && !hasSnapshot && provider.length === 0) {
    return res.status(502).json({
      error:'Availability sources unavailable',
      checkedAt,
      refreshCadence:'live on request · hourly background sync',
      officialSource:'https://www.wnba.com/wnba-injury-report',
      errors
    });
  }

  if (!officialReport) {
    officialReport = {
      fallback: true,
      injuries: [],
      teamStatuses: [],
      coveredTeams: [],
      reportTimestamp: wireSnapshot?.availability?.latestReportDate || null,
      reportLabel: wireSnapshot?.availability?.reportLabel || null,
      reportUrl: wireSnapshot?.availability?.officialPdf || null,
      errors: []
    };
  }

  const useSnapshot = Boolean(officialReport.fallback) || providerResult.status === 'rejected';
  const injuries = mergeAvailability(officialReport, provider, useSnapshot).map(item => {
    const headshot = officialHeadshot(item.player);
    return { ...item, wnbaId: headshot?.id || null, photo: headshot?.url || null };
  });

  const liveTeamStatuses = !officialReport.fallback && Array.isArray(officialReport.teamStatuses) ? officialReport.teamStatuses : [];
  const snapshotTeamStatuses = Array.isArray(wireSnapshot?.availability?.teamStatuses) ? wireSnapshot.availability.teamStatuses : [];
  const teamStatuses = (liveTeamStatuses.length ? liveTeamStatuses : snapshotTeamStatuses)
    .slice()
    .sort((a,b)=>availabilityDate(b).localeCompare(availabilityDate(a))||String(a.team||'').localeCompare(String(b.team||'')));

  const latestReportDate = officialReport.fallback
    ? (wireSnapshot?.availability?.latestReportDate || officialReport.reportTimestamp || officialReport.reportDate || null)
    : (officialReport.reportTimestamp || officialReport.reportDate || null);
  const reportLabel = officialReport.fallback
    ? (wireSnapshot?.availability?.reportLabel || officialReport.reportLabel || null)
    : (officialReport.reportLabel || null);
  const officialPdf = officialReport.fallback
    ? (wireSnapshot?.availability?.officialPdf || officialReport.reportUrl || null)
    : (officialReport.reportUrl || null);

  return res.status(200).json({
    checkedAt,
    snapshotGeneratedAt: wireSnapshot?.generatedAt || null,
    reportTimestamp: latestReportDate,
    reportLabel,
    latestReportDate,
    refreshCadence: 'live on request · hourly background sync',
    officialSource: 'https://www.wnba.com/wnba-injury-report',
    officialPdf,
    officialPdfLive: !officialReport.fallback,
    officialCurrentReportCount: officialReport.fallback ? 0 : (officialReport.injuries || []).length,
    machineReadableCrossCheck: 'ESPN WNBA injury feed',
    injuryCount: injuries.length,
    injuries,
    teamStatuses,
    coveredTeams: officialReport.fallback ? [] : (officialReport.coveredTeams || []),
    partial: Boolean(officialReport.fallback) || errors.length > 0,
    fallbackSnapshot: Boolean(officialReport.fallback),
    errors: [...errors, ...(officialReport.errors || [])]
  });
};
