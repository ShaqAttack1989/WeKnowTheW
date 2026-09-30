const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const readJson=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const readText=name=>fs.readFileSync(path.join(root,name),'utf8');
const missingRows=data=>{
  const cols=data.tableColumns||[];
  return (data.players||[]).filter(row=>cols.some(key=>row[key]===undefined||row[key]===null||row[key]===''));
};

test('Athletes Unlimited dashboard has all 41 final stat lines and AU grades',()=>{
  const data=readJson('data/au-player-stats-2026.json');
  assert.equal(data.players.length,41);
  assert.equal(missingRows(data).length,0);
  assert.ok(data.tableColumns.includes('auGradeScore'));
  assert.ok(data.players.every(player=>player.auGrade&&Number.isFinite(player.auGradeScore)));
});

test('UPSHOT dashboard only renders complete officially published profile columns',()=>{
  const data=readJson('data/upshot-player-stats-2026.json');
  assert.ok(data.players.length>=32);
  assert.equal(missingRows(data).length,0);
  assert.ok(!data.tableColumns.includes('spg'));
  assert.ok(!data.tableColumns.includes('bpg'));
  assert.deepEqual(data.tableColumns,['gp','min','ppg','rpg','apg','fgPct','threePct','ftPct']);
});

test('Unrivaled player dashboard remains complete',()=>{
  const data=readJson('data/unrivaled-player-stats-2026.json');
  assert.equal(data.players.length,52);
  assert.equal(missingRows(data).length,0);
});

test('WPBA snapshot is structurally complete and source-checked',()=>{
  const data=readJson('data/wpba-2026.json');
  assert.equal(data.standings.length,8);
  assert.equal(data.teams.length,8);
  assert.ok(data.checkedAt);
});

test('Shared dashboard and navigation include collision guards',()=>{
  const dashboardCss=readText('offseason-player-dashboard.css');
  const navCss=readText('site-navigation.css');
  assert.match(dashboardCss,/dashboard spacing audit/);
  assert.match(dashboardCss,/ps-table\{min-width:1040px/);
  assert.match(navCss,/wide desktop collision guard/);
  assert.match(navCss,/min-width:max-content/);
});
