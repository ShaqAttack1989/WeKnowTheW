import { readFile, writeFile } from 'node:fs/promises';

const SEASON = 2026;
const seasonUrl = `https://en.wikipedia.org/wiki/${SEASON}_WNBA_season`;
const dataPath = new URL('../stat-kitchen-data.js', import.meta.url);
const pagePath = new URL('../stat-kitchen.html', import.meta.url);

const decode = value => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const cleanPlayer = value => decode(value).replace(/\s+\(\d+\)$/, '');
const monthNames = ['Jan.','Feb.','March','April','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.'];

function periodFromAwardDate(label) {
  const awarded = new Date(`${label}, ${SEASON} 12:00:00 UTC`);
  if (Number.isNaN(awarded.valueOf())) throw new Error(`Unrecognized award date: ${label}`);
  const start = new Date(awarded); start.setUTCDate(start.getUTCDate() - 8);
  const end = new Date(awarded); end.setUTCDate(end.getUTCDate() - 2);
  const startLabel = `${monthNames[start.getUTCMonth()]} ${start.getUTCDate()}`;
  const endLabel = start.getUTCMonth() === end.getUTCMonth()
    ? String(end.getUTCDate())
    : `${monthNames[end.getUTCMonth()]} ${end.getUTCDate()}`;
  return `${startLabel} through ${endLabel}`;
}

function latestAward(html) {
  const section = html.match(/id="Players_of_the_Week"[\s\S]*?<table[^>]*class="wikitable"[\s\S]*?<tbody[^>]*>([\s\S]*?)<\/tbody>/i)?.[1];
  if (!section) throw new Error('Players of the Week table was not found');
  const rows = [...section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map(match => [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => cell[1]))
    .filter(cells => cells.length >= 5);
  if (!rows.length) throw new Error('No weekly award rows were found');
  const cells = rows.at(-1);
  return {
    week: Number(decode(cells[0])),
    east: { name: cleanPlayer(cells[1]), team: decode(cells[2]) },
    west: { name: cleanPlayer(cells[3]), team: decode(cells[4]) }
  };
}

function parseCurrent(source) {
  const match = source.match(/window\.STAT_KITCHEN_WEEKLY_AWARDS=(\[[\s\S]*\]);\s*$/);
  if (!match) throw new Error('Weekly awards data could not be parsed');
  return Function(`"use strict"; return (${match[1]});`)();
}

function quote(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function serialize(items) {
  const rows = items.map(item => `  {week:${item.week},dates:${quote(item.dates)},east:{name:${quote(item.east.name)},team:${quote(item.east.team)},line:${quote(item.east.line)},source:${quote(item.east.source)}},west:{name:${quote(item.west.name)},team:${quote(item.west.team)},line:${quote(item.west.line)},source:${quote(item.west.source)}}}`);
  return `window.STAT_KITCHEN_WEEKLY_AWARDS=[\n${rows.join(',\n')}\n];\n`;
}

const response = await fetch(seasonUrl, { headers: { 'User-Agent': 'WeKnowTheW awards updater/1.0 (public statistics sync)' } });
if (!response.ok) throw new Error(`Awards source returned HTTP ${response.status}`);
const newest = latestAward(await response.text());
const source = await readFile(dataPath, 'utf8');
const current = parseCurrent(source);
const latest = current[0];
const sameWinners = latest.east.name === newest.east.name && latest.west.name.replace('’', "'") === newest.west.name;
if (newest.week <= latest.week || sameWinners) {
  console.log(`Weekly Heat Check is current through Week ${latest.week}.`);
  process.exit(0);
}

if (!Number.isInteger(newest.week) || newest.week !== latest.week + 1) {
  throw new Error(`Expected Week ${latest.week + 1}, but the awards source returned ${newest.week || 'an invalid week'}`);
}

const officialAwards = 'https://www.wnba.com/awards';
const next = {
  week: newest.week,
  dates: newest.week === 14 ? 'Aug. 24 through 30' : 'Official award period',
  east: { ...newest.east, line: 'Official WNBA weekly honor', source: officialAwards },
  west: { ...newest.west, line: 'Official WNBA weekly honor', source: officialAwards }
};
current.unshift(next);
await writeFile(dataPath, serialize(current));

const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const page = await readFile(pagePath, 'utf8');
const updatedPage = page.replace(/stat-kitchen-data\.js\?v=[^"']+/, `stat-kitchen-data.js?v=${stamp}-awards`);
await writeFile(pagePath, updatedPage);
console.log(`Added Week ${next.week}: ${next.east.name} and ${next.west.name}.`);
