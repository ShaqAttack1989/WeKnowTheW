const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const page=fs.readFileSync(path.join(root,'season-yearbooks.html'),'utf8');
const client=fs.readFileSync(path.join(root,'season-yearbooks.js'),'utf8');
const vault=fs.readFileSync(path.join(root,'w-vault.html'),'utf8');
const freeze=fs.readFileSync(path.join(root,'scripts','freeze-season-yearbook.mjs'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github','workflows','season-yearbook-freeze.yml'),'utf8');
const tx=fs.readFileSync(path.join(root,'api','yearbook-transactions.js'),'utf8');
const trophyPage=fs.readFileSync(path.join(root,'trophy-case.html'),'utf8');
const trophyCorrection=fs.readFileSync(path.join(root,'trophy-data-corrections.js'),'utf8');
const historical=require('../api/yearbook-season')._test;

test('The W Rewind is a permanent W Vault season archive',()=>{
  assert.match(page,/THE W <em>REWIND<\/em>/);
  assert.match(page,/Season Yearbooks/i);
  assert.match(page,/id="yearbookShelf"/);
  assert.match(vault,/href="\/season-yearbooks\.html"/);
  assert.match(vault,/The W Rewind/);
});

test('yearbooks cover the full WNBA era and requested record categories',()=>{
  assert.match(client,/FIRST_SEASON=1997/);
  assert.match(client,/standingsPanel/);
  assert.match(client,/rostersPanel/);
  assert.match(client,/leadersPanel/);
  assert.match(client,/awardsPanel/);
  assert.match(client,/transactionPanel/);
  assert.match(client,/rankingPanel/);
  assert.match(client,/rotationPanel/);
});

test('pre-2026 yearbooks do not waste space on unpublished editorial boards',()=>{
  assert.match(client,/EDITORIAL_START=2026/);
  assert.match(client,/if\(year<EDITORIAL_START\)return ''/);
  assert.match(client,/setEditorialNav/);
  assert.doesNotMatch(client,/No retrospective Shak ranking or rotation is being backfilled/);
});

test('completed books freeze once and are not automatically rewritten',()=>{
  assert.match(freeze,/already frozen\. No rewrite permitted/);
  assert.match(freeze,/frozen:true/);
  assert.match(freeze,/does not yet have a completed Finals series/);
  assert.match(workflow,/11,12/);
  assert.match(workflow,/data\/season-yearbooks/);
});

test('historical transaction helper uses archival public sources rather than WNBA API',()=>{
  assert.match(tx,/basketball-reference\.com/);
  assert.match(tx,/r\.jina\.ai/);
  assert.doesNotMatch(tx,/stats\.wnba\.com/);
});

test('historical validation defines the correct team and schedule shape for every completed season',()=>{
  for(let year=1997;year<=2025;year++){
    assert.ok(Number.isInteger(historical.EXPECTED_TEAM_COUNTS[year]),`missing team count for ${year}`);
    assert.ok(Number.isInteger(historical.EXPECTED_GAMES[year]),`missing game count for ${year}`);
  }
  assert.equal(historical.EXPECTED_TEAM_COUNTS[1997],8);
  assert.equal(historical.EXPECTED_GAMES[1997],28);
  assert.equal(historical.EXPECTED_TEAM_COUNTS[2000],16);
  assert.equal(historical.EXPECTED_TEAM_COUNTS[2025],13);
  assert.equal(historical.EXPECTED_GAMES[2025],44);
});

test('1997 standings parser cannot turn into a modern WNBA table',()=>{
  const fixture=`League Standings Table\nEastern Conference | W | L | W/L% | GB\n--- | --- | --- | --- | ---\nHouston Comets* | 18 | 10 | .643 | —\nNew York Liberty* | 17 | 11 | .607 | 1.0\nCharlotte Sting* | 15 | 13 | .536 | 3.0\nCleveland Rockers | 15 | 13 | .536 | 3.0\nWestern Conference | W | L | W/L% | GB\n--- | --- | --- | --- | ---\nPhoenix Mercury* | 16 | 12 | .571 | —\nLos Angeles Sparks | 14 | 14 | .500 | 2.0\nSacramento Monarchs | 10 | 18 | .357 | 6.0\nUtah Starzz | 7 | 21 | .250 | 9.0\n## Playoff Series`;
  const rows=historical.parseStandingsMarkdown(fixture,1997);
  assert.equal(rows.length,8);
  assert.deepEqual(rows.slice(0,2).map(row=>[row.team.full_name,row.wins,row.losses]),[['Houston Comets',18,10],['New York Liberty',17,11]]);
  assert.equal(rows[4].team.full_name,'Phoenix Mercury');
  assert.equal(historical.validateStandings(rows,1997).valid,true);
  assert.equal(rows.some(row=>/Valkyries|Aces|Dream/.test(row.team.full_name)),false);
});

test('historical player parsing preserves real team affiliations and removes Hall of Fame stars',()=>{
  const fixture=`Player | Team | Pos | G | MP | G | GS | MP | TRB | AST | STL | BLK | PTS\n--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---\nCynthia Cooper* | HOU | G | 28 | 982 | 28 | 28 | 35.1 | 4.0 | 4.7 | 2.1 | 0.2 | 22.2\nLisa Leslie* | LAS | C | 28 | 902 | 28 | 28 | 32.2 | 9.5 | 2.6 | 1.4 | 2.1 | 15.9\nTeresa Weatherspoon* | NYL | G | 28 | 924 | 28 | 28 | 33.0 | 3.9 | 6.2 | 3.0 | 0.2 | 6.4`;
  const rows=historical.parsePerGameMarkdown(fixture,1997);
  assert.equal(rows[0].name,'Cynthia Cooper');
  assert.equal(rows[0].teamName,'Houston Comets');
  assert.equal(rows[1].teamName,'Los Angeles Sparks');
  assert.equal(rows[2].teamName,'New York Liberty');
});

test('leader cards use source team codes and the yearbook links teams as well as players',()=>{
  const leaderFixture=`#### Points Per Game\nPoints Per Game\n1. Cynthia Cooper • HOU 22.2\n#### Rebounds Per Game\nTotal Rebounds Per Game\n1. Lisa Leslie • LAS 9.5\n#### Assists Per Game\nAssists Per Game\n1. Teresa Weatherspoon • NYL 6.2\n#### Steals Per Game\nSteals Per Game\n1. Teresa Weatherspoon • NYL 3.0\n#### Blocks Per Game\nBlocks Per Game\n1. Elena Baranova • UTA 2.3`;
  const leaders=historical.parseLeaderMarkdown(leaderFixture,1997);
  assert.equal(leaders.ppg.teamName,'Houston Comets');
  assert.equal(leaders.rpg.teamName,'Los Angeles Sparks');
  assert.equal(leaders.apg.teamName,'New York Liberty');
  assert.equal(leaders.bpg.teamName,'Utah Starzz');
  assert.match(client,/function teamHref/);
  assert.match(client,/teams\.map\(t=>teamLink/);
  assert.match(client,/roster-team.*teamLink/s);
});

test('2025 Finals result is corrected to the official four-game sweep everywhere the Vault renders champions',()=>{
  assert.match(client,/2025:\{year:'2025',champion:'Las Vegas Aces',runnerUp:'Phoenix Mercury',result:'4 to 0'/);
  assert.match(trophyCorrection,/row\.result='4 to 0'/);
  assert.match(trophyPage,/trophy-data-corrections\.js/);
});
