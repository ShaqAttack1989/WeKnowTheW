const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const feed = JSON.parse(fs.readFileSync(path.join(root, 'snack-shak-latest.json'), 'utf8'));
const story = feed.posts.find(post => post.slug === 'playoff-trio-test-2026');
const teams = story.trioDashboard.teams;
const byCode = Object.fromEntries(teams.map(team => [team.code, team]));
const round = value => Number(value.toFixed(1));

test('playoff trio story remains inside Food for Thought and carries a final-season stamp', () => {
  assert.ok(story);
  assert.equal(story.type, 'feature');
  assert.equal(story.dashboardUrl, undefined);
  assert.equal(story.trioDashboard.asOf, 'FINAL · SEPT. 24, 2026');
  assert.equal(story.trioDashboard.postGames, 4);
  assert.match(story.week, /official stats through Sept\. 24/);
});

test('final official standings and seeds are exact', () => {
  assert.deepEqual(
    teams.slice().sort((a, b) => a.seed - b.seed).map(team => [team.seed, team.code, team.record]),
    [
      [1, 'MIN', '33-11'], [2, 'GSV', '32-12'], [3, 'LVA', '31-13'], [4, 'ATL', '30-14'],
      [5, 'WAS', '28-16'], [6, 'IND', '28-16'], [7, 'DAL', '27-17'], [8, 'NYL', '26-18']
    ]
  );
});

test('production uses complete player averages and reranks all eight trios', () => {
  const expected = { IND: 1, LVA: 2, MIN: 3, ATL: 4, DAL: 5, NYL: 6, WAS: 7, GSV: 8 };
  assert.deepEqual(Object.fromEntries(teams.map(team => [team.code, team.offenseRank])), expected);
  assert.equal(new Set(teams.map(team => team.offenseRank)).size, 8);
  for (const team of teams) {
    assert.equal(team.ppg, round(team.players.reduce((sum, player) => sum + player.ppg, 0)), `${team.code} PPG`);
    assert.equal(team.apg, round(team.players.reduce((sum, player) => sum + player.apg, 0)), `${team.code} APG`);
    assert.ok(team.players.every(player => Number.isInteger(player.games) && player.games > 0), `${team.code} games played`);
  }
});

test('limiting-scoring mode uses final official team ratings', () => {
  const expected = {
    GSV: [1, 99.1], WAS: [2, 103.3], ATL: [3, 103.5], MIN: [4, 103.5],
    LVA: [5, 105.9], DAL: [6, 106.4], NYL: [7, 106.9], IND: [8, 108.3]
  };
  for (const [code, [rank, rating]] of Object.entries(expected)) {
    assert.equal(byCode[code].defenseRank, rank, `${code} rank`);
    assert.equal(byCode[code].defRtg, rating, `${code} rating`);
  }
});

test('post-FIBA mode covers every game from Sept. 17 through Sept. 24', () => {
  const expected = {
    ATL: [1, '4-0', 24.5, 72.3], LVA: [2, '4-0', 21.5, 78.8],
    WAS: [3, '4-0', 16, 79.8], DAL: [4, '3-1', 9, 84.3],
    GSV: [5, '3-1', 5.5, 72], NYL: [6, '2-2', 5, 82],
    MIN: [7, '2-2', 0.3, 86], IND: [8, '2-2', 0.3, 85.3]
  };
  for (const [code, [rank, record, margin, opponentPpg]] of Object.entries(expected)) {
    assert.deepEqual(
      [byCode[code].fibaRank, byCode[code].postRecord, byCode[code].postMargin, byCode[code].postOppPpg],
      [rank, record, margin, opponentPpg],
      code
    );
  }
  assert.equal(new Set(teams.map(team => team.fibaRank)).size, 8);
  assert.match(story.trioDashboard.methodology, /head-to-head win breaks that pulse tie/);
});

test('dashboard keeps all three interactive modes and compares each rank with the final seed', () => {
  const script = fs.readFileSync(path.join(root, 'snack-shak-collections.js'), 'utf8');
  for (const mode of ['offense', 'defense', 'fiba']) assert.ok(script.includes(`data-trio-mode="${mode}"`));
  assert.match(script, /data-trio-compare/);
  assert.match(script, /games each after FIBA/);
  assert.match(script, /Sept\. 17 through Sept\. 24/);
  assert.doesNotMatch(script, /Two games is a pulse/);
});

test('story photography and refreshed receipts point to official WNBA properties', () => {
  assert.match(story.image, /^https:\/\/cdn\.wnba\.com\//);
  assert.match(story.storyImage, /^https:\/\/cdn\.wnba\.com\//);
  assert.match(story.storyImageSourceUrl, /^https:\/\/[a-z]+\.wnba\.com\//);
  assert.ok(story.sources.every(source => /^https:\/\/([a-z]+\.)?wnba\.com\//.test(source.url)));
  assert.ok(story.sources.some(source => /final 2026 standings/.test(source.label)));
  assert.ok(story.sources.some(source => /team advanced statistics/.test(source.label)));
});
