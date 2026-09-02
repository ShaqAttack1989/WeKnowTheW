import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const handler = require('../api/rookie-week.js');
const weeklyDataPath = new URL('../stat-kitchen-data.js', import.meta.url);
const snapshotPath = new URL('../data/stat-kitchen-rookie-week.json', import.meta.url);
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

async function latestWeeklyAward() {
  const source = await readFile(weeklyDataPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: 'stat-kitchen-data.js' });
  const awards = Array.isArray(sandbox.window.STAT_KITCHEN_WEEKLY_AWARDS) ? sandbox.window.STAT_KITCHEN_WEEKLY_AWARDS : [];
  if (!awards.length) throw new Error('Stat Kitchen weekly award data is empty.');
  return awards[0];
}

async function requestFreshBoard(latest) {
  const period = weeklyPeriod(latest.dates);
  let statusCode = 200;
  let body = null;
  const req = { method: 'GET', query: { start: period.start, end: period.end, week: String(latest.week), fresh: '1' } };
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

async function existingSnapshot() {
  if (!existsSync(snapshotPath)) return null;
  try { return JSON.parse(await readFile(snapshotPath, 'utf8')); }
  catch { return null; }
}

const latest = await latestWeeklyAward();
const existing = await existingSnapshot();

try {
  const payload = await requestFreshBoard(latest);
  const nextCore = stableSnapshot(payload);
  const existingCore = existing ? stableSnapshot(existing) : null;
  if (existingCore && JSON.stringify(existingCore) === JSON.stringify(nextCore)) {
    console.log(`Rookie of the Week snapshot is current for Week ${latest.week}.`);
    process.exit(0);
  }
  const snapshot = {
    ...nextCore,
    generatedAt: new Date().toISOString(),
    note: 'Verified completed-period Rookie of the Week snapshot. The live dashboard can use this file whenever the ESPN serverless feed is unavailable.'
  };
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Updated Rookie of the Week snapshot for Week ${latest.week}: ${snapshot.leaders[0].name}.`);
} catch (error) {
  if (existing?.leaders?.length) {
    console.warn(`Fresh Rookie of the Week pull failed (${error.message}). Preserving verified Week ${existing.week} snapshot.`);
    process.exit(0);
  }
  throw error;
}
