import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getWnbaTransactions, getWnbaInjuries } = require('../lib/wehoop-espn.js');
const { fetchLatestOfficialReport } = require('../lib/wnba-injury-report.js');
const { LATEST_MOVEMENT_PATCH } = require('../lib/latest-movement-patch.js');
const { CURRENT_MOVEMENT_PATCH } = require('../lib/current-movement-patch.js');
const { CURRENT_AVAILABILITY_PATCH } = require('../lib/current-availability-patch.js');
const liveUpdates = require('../player-live-updates.json');

const SNAPSHOT_PATH = 'player-wire-snapshot.json';
const HEARTBEAT_MS = 6 * 60 * 60 * 1000;

function key(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isoDate(value = '') {
  const raw = String(value || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[1]}-${match[2]}` : '';
}

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

function normalizeTransaction(item = {}) {
  const detail = item.description || item.shortDescription || item.text || item.detail || [item.fromTeam, item.team].filter(Boolean).join(' → ') || 'Roster update';
  const fallbackType = item.type?.description || item.type?.text || item.type || 'TRANSACTION';
  const explicitPlayer = item.name || (typeof item.player === 'string' ? item.player : '') || item.athlete?.displayName || item.player?.displayName || '';
  return {
    date: isoDate(item.date || item.effectiveDate || ''),
    type: inferTransactionType(detail, fallbackType),
    player: explicitPlayer || inferPlayerFromDetail(detail) || 'Player',
    team: item.team?.displayName || item.team || item.toTeam?.displayName || item.to?.displayName || item.fromTeam || 'WNBA',
    detail,
    source: item.source || 'ESPN WNBA transaction feed',
    sourceUrl: item.sourceUrl || null
  };
}

function transactionSignature(item = {}) {
  return `${isoDate(item.date)}|${key(item.player)}|${key(item.team)}|${key(item.type)}`;
}

function mergeTransactions(provider = [], previous = []) {
  const combined = [
    ...(Array.isArray(LATEST_MOVEMENT_PATCH) ? LATEST_MOVEMENT_PATCH : []),
    ...(Array.isArray(CURRENT_MOVEMENT_PATCH) ? CURRENT_MOVEMENT_PATCH : []),
    ...(Array.isArray(liveUpdates.transactions) ? liveUpdates.transactions : []),
    ...(Array.isArray(previous) ? previous : []),
    ...provider.map(normalizeTransaction)
  ];
  const seen = new Set();
  return combined
    .map(normalizeTransaction)
    .filter(item => item.player && item.player !== 'Player' && item.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.player).localeCompare(String(b.player)))
    .filter(item => {
      const signature = transactionSignature(item);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function normalizeProviderInjury(item = {}) {
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
    officialCurrentReport: Boolean(item.officialCurrentReport),
    crossCheckOnly: item.crossCheckOnly !== false
  };
}

function seasonLong(item = {}) {
  return String(item.status || '').toUpperCase().includes('SEASON') || item.seasonLongCarryover === true;
}

function availabilityDate(item = {}) {
  return isoDate(item.updated || item.gameDate || item.date || '');
}

function addAvailability(combined, seen, item, extras = {}) {
  if (!item?.player) return;
  const playerKey = key(item.player);
  if (!playerKey || seen.has(playerKey)) return;
  seen.add(playerKey);
  combined.push({ ...item, ...extras, updated: availabilityDate(item) || isoDate(item.updated || '') });
}

function mergeAvailability(officialReport = {}, provider = [], previous = []) {
  const usingFallback = Boolean(officialReport?.fallback);
  const official = usingFallback ? [] : (Array.isArray(officialReport?.injuries) ? officialReport.injuries : []);
  const coveredTeams = usingFallback ? new Set() : new Set((officialReport?.coveredTeams || []).map(key));
  const combined = [];
  const seen = new Set();

  for (const item of Array.isArray(CURRENT_AVAILABILITY_PATCH) ? CURRENT_AVAILABILITY_PATCH : []) {
    addAvailability(combined, seen, item, {
      source: item.source || 'WNBA team announcement',
      officialCurrentReport: false,
      crossCheckOnly: false,
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
    const item = normalizeProviderInjury(raw);
    if (coveredTeams.has(key(item.team))) continue;
    addAvailability(combined, seen, item);
  }

  if (usingFallback) {
    for (const item of Array.isArray(previous) ? previous : []) {
      if (seasonLong(item)) continue;
      addAvailability(combined, seen, item, { snapshotCarryover: true });
    }
  }

  const carryovers = [
    ...(Array.isArray(CURRENT_AVAILABILITY_PATCH) ? CURRENT_AVAILABILITY_PATCH : []),
    ...(Array.isArray(liveUpdates.injuries) ? liveUpdates.injuries : []),
    ...(Array.isArray(previous) ? previous.filter(seasonLong) : [])
  ];
  for (const item of carryovers) {
    if (!(item.carryover === true || seasonLong(item))) continue;
    addAvailability(combined, seen, item, {
      source: item.source || 'WNBA Injury Report / team release',
      officialCurrentReport: false,
      trackedCarryover: true,
      seasonLongCarryover: seasonLong(item)
    });
  }

  return combined
    .filter(item => !['AVAILABLE', 'ACTIVE', 'CLEARED'].includes(String(item.status || '').toUpperCase()))
    .sort((a, b) => availabilityDate(b).localeCompare(availabilityDate(a)) || String(a.player || '').localeCompare(String(b.player || '')));
}

async function readPrevious() {
  try {
    return JSON.parse(await fs.readFile(SNAPSHOT_PATH, 'utf8'));
  } catch {
    return {
      generatedAt: null,
      movement: { latestTransactionDate: null, transactions: [] },
      availability: { latestReportDate: null, reportLabel: null, officialPdf: null, injuries: [], teamStatuses: [] },
      errors: []
    };
  }
}

function stablePayload(snapshot = {}) {
  return JSON.stringify({ movement: snapshot.movement, availability: snapshot.availability });
}

const previous = await readPrevious();
const errors = [];
const [transactionResult, injuryResult, officialResult] = await Promise.allSettled([
  getWnbaTransactions(2026, 250),
  getWnbaInjuries(),
  fetchLatestOfficialReport()
]);

const providerTransactions = transactionResult.status === 'fulfilled' ? transactionResult.value : [];
if (transactionResult.status === 'rejected') errors.push(`Transactions: ${transactionResult.reason?.message || 'fetch failed'}`);
const providerInjuries = injuryResult.status === 'fulfilled' ? injuryResult.value : [];
if (injuryResult.status === 'rejected') errors.push(`Injuries: ${injuryResult.reason?.message || 'fetch failed'}`);
const officialReport = officialResult.status === 'fulfilled'
  ? officialResult.value
  : { fallback: true, injuries: [], teamStatuses: [], coveredTeams: [], errors: [] };
if (officialResult.status === 'rejected') errors.push(`Official WNBA report: ${officialResult.reason?.message || 'fetch failed'}`);
if (Array.isArray(officialReport.errors)) errors.push(...officialReport.errors.map(value => `Official report: ${value}`));

const transactions = mergeTransactions(providerTransactions, previous?.movement?.transactions || []);
const injuries = mergeAvailability(officialReport, providerInjuries, previous?.availability?.injuries || []);
const teamStatuses = (officialReport.fallback
  ? (previous?.availability?.teamStatuses || [])
  : (Array.isArray(officialReport.teamStatuses) ? officialReport.teamStatuses : []))
  .slice()
  .sort((a, b) => availabilityDate(b).localeCompare(availabilityDate(a)) || String(a.team || '').localeCompare(String(b.team || '')));

const candidate = {
  generatedAt: new Date().toISOString(),
  movement: {
    latestTransactionDate: transactions[0]?.date || null,
    transactions
  },
  availability: {
    latestReportDate: officialReport.fallback
      ? (previous?.availability?.latestReportDate || null)
      : (officialReport.reportTimestamp || officialReport.reportDate || null),
    reportLabel: officialReport.fallback
      ? (previous?.availability?.reportLabel || null)
      : (officialReport.reportLabel || null),
    officialPdf: officialReport.fallback
      ? (previous?.availability?.officialPdf || null)
      : (officialReport.reportUrl || null),
    injuries,
    teamStatuses
  },
  errors
};

const contentChanged = stablePayload(candidate) !== stablePayload(previous);
const previousTime = new Date(previous?.generatedAt || 0).getTime();
const heartbeatDue = !Number.isFinite(previousTime) || Date.now() - previousTime >= HEARTBEAT_MS;

if (!contentChanged && !heartbeatDue) {
  console.log('Player wire checked: no data changes; snapshot is still within heartbeat window.');
  process.exit(0);
}

await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(candidate, null, 2) + '\n');
console.log(`Player wire snapshot refreshed: ${transactions.length} movement entries, ${injuries.length} availability entries, ${teamStatuses.length} pending team reports.`);
if (errors.length) console.warn(errors.join('\n'));
