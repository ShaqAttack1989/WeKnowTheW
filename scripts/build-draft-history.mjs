import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'data', 'wnba-draft-history.json');

const roundSizeByYear = {
  1997: 8,
  1998: 10,
  1999: 12,
  2000: 16,
  2001: 16,
  2002: 16,
  2003: 14,
  2004: 13,
  2005: 13,
  2006: 14,
  2007: 13,
  2008: 14,
  2009: 13,
  2010: 12,
  2011: 12,
  2012: 12,
  2013: 12,
  2014: 12,
  2015: 12,
  2016: 12
};

const officialTeamNames = new Map([
  ['1611661313', 'New York Liberty'],
  ['1611661317', 'Phoenix Mercury'],
  ['1611661319', 'Las Vegas Aces'],
  ['1611661320', 'Los Angeles Sparks'],
  ['1611661321', 'Dallas Wings'],
  ['1611661322', 'Washington Mystics'],
  ['1611661323', 'Connecticut Sun'],
  ['1611661324', 'Minnesota Lynx'],
  ['1611661325', 'Indiana Fever'],
  ['1611661327', 'Portland Fire'],
  ['1611661328', 'Seattle Storm'],
  ['1611661329', 'Chicago Sky'],
  ['1611661330', 'Atlanta Dream'],
  ['1611661331', 'Golden State Valkyries'],
  ['1611661332', 'Toronto Tempo']
]);

const clean = (value = '') => String(value)
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&#x27;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function markdownCells(line = '') {
  const result = String(line).split('|').map(value => value.trim());
  if (!result[0]) result.shift();
  if (!result[result.length - 1]) result.pop();
  return result;
}

function historicalRound(year, pick) {
  const size = roundSizeByYear[year];
  if (!size || !pick) return null;
  return Math.min(year <= 2002 ? 4 : 3, Math.floor((pick - 1) / size) + 1);
}

function parseBasketballReference(raw, year) {
  const rows = [];
  let columns = null;
  for (const line of String(raw).split(/\r?\n/)) {
    if (!line.includes('|')) continue;
    const cells = markdownCells(line);
    if (cells.length < 3) continue;
    const headers = cells.map(value => clean(value).toLowerCase().replace(/[^a-z0-9]/g, ''));
    if (headers.includes('player') && (headers.includes('pk') || headers.includes('pick'))) {
      columns = {
        pick: headers.includes('pk') ? headers.indexOf('pk') : headers.indexOf('pick'),
        team: headers.includes('team') ? headers.indexOf('team') : headers.indexOf('tm'),
        player: headers.indexOf('player')
      };
      continue;
    }
    if (!columns || cells.every(value => /^[-: ]+$/.test(value))) continue;
    const pick = Number(clean(cells[columns.pick]));
    const player = clean(cells[columns.player]);
    const team = clean(cells[columns.team]);
    if (!Number.isInteger(pick) || pick < 1 || !player || /^(player|per game|advanced)$/i.test(player)) continue;
    rows.push({
      player,
      year,
      round: historicalRound(year, pick),
      pick,
      team,
      source: `https://www.basketball-reference.com/wnba/draft/${year}.html`,
      sourceLabel: 'Basketball Reference draft record'
    });
  }
  return rows;
}

function parseOfficialBoard(raw, year) {
  const match = String(raw).match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Official ${year} draft board is missing its data payload.`);
  const data = JSON.parse(match[1]);
  const rounds = data?.props?.pageProps?.draftRounds;
  if (!Array.isArray(rounds) || !rounds.length) throw new Error(`Official ${year} draft board has no rounds.`);
  let previousSelections = 0;
  return rounds.flatMap((round, roundIndex) => {
    const selections = (round.picks || []).flatMap(item => {
    const player = `${item.firstName || ''} ${item.lastName || ''}`.replace(/\s+/g, ' ').trim();
    const roundPick = Number(item.pick);
    if (!player || !Number.isInteger(roundPick) || roundPick < 1 || Number(item.prospectId) === 0) return [];
    const roundNumber = Number(round.round) || roundIndex + 1;
    const teamId = String(item.teamExternalId || '');
    const currentTeamName = officialTeamNames.get(teamId) || '';
    const historicalTeamName = teamId === '1611661319' && year === 2017 ? 'San Antonio Stars' : currentTeamName;
    return [{
      player,
      year,
      round: roundNumber,
      roundPick,
      pick: previousSelections + roundPick,
      team: String(item.teamName || '').replace(new RegExp(`\\s+${year}$`), '').trim() || historicalTeamName,
      source: `https://www.wnba.com/draft/${year}/board`,
      sourceLabel: 'Official WNBA draft board'
    }];
    });
    previousSelections += (round.picks || []).length;
    return selections;
  });
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { Accept: 'text/html,text/plain' } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function main() {
  const classes = [];
  for (let year = 1997; year <= 2016; year += 1) {
    const url = `https://r.jina.ai/http://www.basketball-reference.com/wnba/draft/${year}.html`;
    const picks = parseBasketballReference(await fetchText(url), year);
    if (picks.length < 8) throw new Error(`Only ${picks.length} picks found for ${year}.`);
    classes.push(...picks);
  }
  for (let year = 2017; year <= 2026; year += 1) {
    const url = `https://www.wnba.com/draft/${year}/board`;
    const picks = parseOfficialBoard(await fetchText(url), year);
    if (picks.length < 8) throw new Error(`Only ${picks.length} picks found for ${year}.`);
    classes.push(...picks);
  }

  const unique = new Map();
  for (const item of classes) unique.set(`${item.year}|${item.pick}|${item.player}`, item);
  const picks = [...unique.values()].sort((a, b) => a.year - b.year || a.pick - b.pick);

  const sydney = picks.find(item => item.year === 2011 && item.pick === 16 && item.player === 'Sydney Colson');
  if (!sydney) throw new Error('Sydney Colson was not found in the generated history.');
  Object.assign(sydney, {
    round: 2,
    roundPick: 4,
    team: 'Connecticut Sun',
    note: 'Traded to the New York Liberty on draft night.',
    source: 'https://www.wnba.com/webview/draft/2011',
    sourceLabel: 'Official 2011 WNBA Draft results'
  });

  const aliases = {
    'Awa Fam': 'Awa Fam Thiam',
    'Grace VanSlooten': 'Grace VanSlootoen',
    'Megan DiLeo': 'Megan Gustafson'
  };
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const rosterResponse = await fetch(`https://www.weknowthew.com/api/players?draftAudit=${Date.now()}`, { headers: { Accept: 'application/json' } });
  if (!rosterResponse.ok) throw new Error(`Playerpedia roster returned ${rosterResponse.status}.`);
  const rosterPayload = await rosterResponse.json();
  const roster = [...new Map((rosterPayload.players || []).map(player => [normalize(player.name), player])).values()];
  const draftByName = new Map(picks.map(item => [normalize(item.player), item]));
  const aliasByName = new Map(Object.entries(aliases).map(([name, draftName]) => [normalize(name), draftName]));
  const auditedPicks = [];
  const undrafted = [];
  for (const player of roster) {
    const draftName = aliasByName.get(normalize(player.name)) || player.name;
    const draft = draftByName.get(normalize(draftName));
    if (draft) auditedPicks.push(draft);
    else undrafted.push(player.name);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    coverage: { from: 1997, through: 2026 },
    audit: { players: roster.length, drafted: auditedPicks.length, undrafted: undrafted.length },
    sourceNote: 'Every current and retained Playerpedia entry was cross-checked against WNBA draft classes from 1997 through 2026. Official WNBA draft boards are used from 2017 through 2026. Basketball Reference draft records cover 1997 through 2016.',
    aliases,
    picks: auditedPicks.sort((a, b) => a.year - b.year || a.pick - b.pick),
    undrafted: undrafted.sort((a, b) => a.localeCompare(b))
  };
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${picks.length} draft selections to ${OUTPUT}.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
