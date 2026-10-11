const { parseOfficialPdf } = require('./wnba-injury-report');

const OFFICIAL_ROOT = 'https://ak-static.cms.nba.com/referee/wnba_injury';

function easternParts(date = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
}

function candidateMeta(date = new Date()) {
  const parts = easternParts(date);
  const hour24 = Number(parts.hour);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const reportDate = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    filename: `Injury-Report_${reportDate}_${String(hour12).padStart(2, '0')}_${parts.minute}${ampm}.pdf`,
    reportDate,
    reportLabel: `${parts.month}/${parts.day}/${parts.year} ${String(hour12).padStart(2, '0')}:${parts.minute} ${ampm} ET`
  };
}

async function fetchCandidate(candidate) {
  const meta = candidateMeta(candidate);
  const url = `${OFFICIAL_ROOT}/${meta.filename}`;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/pdf',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'
      },
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') return null;
    const parsed = parseOfficialPdf(buffer, meta);
    if (!parsed.injuries.length && !parsed.teamStatuses.length) return null;
    return {
      ...parsed,
      reportTimestamp: meta.reportDate,
      reportLabel: meta.reportLabel,
      reportUrl: url,
      source: 'Official WNBA Injury Report PDF',
      fallback: false
    };
  } catch {
    return null;
  }
}

async function fetchLatestFreshOfficialReport(now = new Date()) {
  const floored = new Date(Math.floor(now.getTime() / (15 * 60 * 1000)) * 15 * 60 * 1000);
  const candidates = Array.from({ length: 48 }, (_, index) => new Date(floored.getTime() - index * 15 * 60 * 1000));
  const batchSize = 8;

  for (let start = 0; start < candidates.length; start += batchSize) {
    const batch = candidates.slice(start, start + batchSize);
    const results = await Promise.all(batch.map(fetchCandidate));
    const newest = results.find(Boolean);
    if (newest) return newest;
  }

  return null;
}

module.exports = { fetchLatestFreshOfficialReport };
