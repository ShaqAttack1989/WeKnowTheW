import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const handler = require('../api/rookie-week.js');
const weeklyDataPath = new URL('../stat-kitchen-data.js', import.meta.url);
const snapshotPath = new URL('../data/stat-kitchen-rookie-week.json', import.meta.url);
const historyPath = new URL('../data/stat-kitchen-rookie-week-history.json', import.meta.url);
const monthIndex = new Map([
  ['jan',0],['january',0],['feb',1],['february',1],['mar',2],['march',2],['apr',3],['april',3],['may',4],['jun',5],['june',5],['jul',6],['july',6],['aug',7],['august',7],['sep',8],['sept',8],['september',8],['oct',9],['october',9],['nov',10],['november',10],['dec',11],['december',11]
]);

function parseMonth(value='') {
  return monthIndex.get(String(value).toLowerCase().replaceAll('.',''));
}

function isoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function weeklyPeriod(label='') {
  const match = String(label).trim().match(/^([A-Za-z.]+)\s+(\d{1,2})\s+through\s+(?:([A-Za-z.]+)\s+)?(\d{1,2})$/i);
  if (!match) throw new Error(`Could not parse Rookie of the Week period from: ${label}`);
  const startMonth = parseMonth(match[1]);
  const endMonth = parseMonth(match[3] || match[1]);
  if (!Number.isInteger(startMonth) || !Number.isInteger(endMonth)) throw new Error(`Could not parse month names from: ${label}`);
  return {
    start: isoDate(2026, startMonth, Number(match[2])),
    end: isoDate(endMonth < startMonth ? 2027 : 2026, endMonth, Number(match[4]))
  };
}

async function weeklyAwards() {
  const source = await readFile(weeklyDataPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'stat-kitchen-data.js' });
  const awards = Array.isArray(sandbox.window.STAT_KITCHEN_WEEKLY_AWARDS) ? sandbox.window.STAT_KITCHEN_WEEKLY_AWARDS : [];
  if (!awards.length) throw new Error('Stat Kitchen weekly award data is empty.');
  return awards;
}

async function requestFreshBoard(award) {
  const period = weeklyPeriod(award.dates);
  let statusCode = 200;
  let body = null;
  const req = { method: 'GET', query: { start: period.start, end: period.end, week: String(award.week), fresh: '1' } };
  const res = {
    setHeader() {},
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return value; }
  };
  await handler(req, res);
  if (statusCode !== 200 || !body || body.error || !Array.isArray(body.leaders) || !body.leaders.length) {
    throw new Error(body?.detail || body?.error || `Rookie board returned HTTP ${statusCode}`);
  }
  return body;
}

function stableSnapshot(payload) {
  return {
    version: 1,
    season: payload.season,
    week: payload.week,
    start: payload.start,
    end: payload.end,
    officialAward: false,
    source: payload.source,
    sourceUrl: payload.sourceUrl,
    methodology: payload.methodology,
    gamesReviewed: payload.gamesReviewed,
    leaders: payload.leaders
  };
}

async function existingJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch { return null; }
}

function sameCore(a, b) {
  return Boolean(a && b) && JSON.stringify(stableSnapshot(a)) === JSON.stringify(stableSnapshot(b));
}

const awards = await weeklyAwards();
const latest = awards[0];
const existing = await existingJson(snapshotPath);
const existingHistory = await existingJson(historyPath);
const historyWeeks = Array.isArray(existingHistory?.weeks) ? existingHistory.weeks : [];
const historyByWeek = new Map(historyWeeks.map(item => [Number(item.week), item]));
let historyChanged = false;
let latestPayload = null;

for (const award of [...awards].sort((a,b) => Number(a.week) - Number(b.week))) {
  const previous = historyByWeek.get(Number(award.week));
  const shouldRefresh = Number(award.week) === Number(latest.week) || !previous?.leaders?.length;
  if (!shouldRefresh) continue;
  try {
    const payload = await requestFreshBoard(award);
    const generated = {
      ...stableSnapshot(payload),
      dates: award.dates,
      generatedAt: previous && sameCore(previous, payload) ? previous.generatedAt : new Date().toISOString()
    };
    if (!previous || !sameCore(previous, generated) || previous.dates !== generated.dates) {
      historyByWeek.set(Number(award.week), generated);
      historyChanged = true;
    }
    if (Number(award.week) === Number(latest.week)) latestPayload = payload;
    console.log(`Verified Rookie of the Week Week ${award.week}: ${payload.leaders[0].name}.`);
  } catch (error) {
    if (previous?.leaders?.length) {
      console.warn(`Week ${award.week} refresh failed (${error.message}). Preserving its verified archive.`);
      continue;
    }
    console.warn(`Week ${award.week} could not be added yet (${error.message}).`);
  }
}

if (latestPayload) {
  const nextCore = stableSnapshot(latestPayload);
  if (!existing || !sameCore(existing, nextCore)) {
    const snapshot = {
      ...nextCore,
      generatedAt: new Date().toISOString(),
      note: 'Verified completed-period Rookie of the Week snapshot. The live dashboard can use this file whenever the ESPN serverless feed is unavailable.'
    };
    await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(`Updated current Rookie of the Week snapshot for Week ${latest.week}: ${snapshot.leaders[0].name}.`);
  } else {
    console.log(`Current Rookie of the Week snapshot is current for Week ${latest.week}.`);
  }
} else if (!existing?.leaders?.length) {
  throw new Error(`Could not produce the current Rookie of the Week board for Week ${latest.week}.`);
}

const orderedWeeks = [...historyByWeek.values()].sort((a,b) => Number(b.week) - Number(a.week));
if (historyChanged || !existingHistory?.weeks?.length) {
  const history = {
    version: 1,
    season: 2026,
    updatedAt: new Date().toISOString(),
    methodology: 'We Know the W weekly rookie score = PPG + 1.2×RPG + 1.5×APG + 3×SPG + 3×BPG.',
    source: 'ESPN WNBA boxscores and verified 2026 WNBA draft class',
    note: 'Rookie of the Week archive. Completed weeks are preserved when a new weekly board becomes current.',
    weeks: orderedWeeks
  };
  await writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`);
  console.log(`Rookie of the Week archive now contains ${orderedWeeks.length} verified week${orderedWeeks.length === 1 ? '' : 's'}.`);
} else {
  console.log(`Rookie of the Week archive is current through Week ${orderedWeeks[0]?.week || latest.week}.`);
}
