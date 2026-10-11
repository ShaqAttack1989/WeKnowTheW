const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'upshot-live.json'), 'utf8'));
const page = fs.readFileSync(path.join(root, 'the-call-up.html'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'the-call-up-page.js'), 'utf8');

test('records the inaugural championship separately from regular-season standings', () => {
  assert.equal(data.championship.status, 'Final');
  assert.equal(data.championship.champion, 'Charlotte Crown');
  assert.equal(data.championship.runnerUp, 'Jacksonville Waves');
  assert.equal(data.championship.score, '81-76');
  assert.equal(data.championship.mvp, 'Deja Kelly');
  assert.deepEqual(data.teams.map(team => team.record), ['25-9', '23-11', '11-23', '9-25']);
});

test('shows all six announced UPSHOT franchises without mixing expansion into 2026 standings', () => {
  assert.equal(data.teams.length, 4);
  assert.equal(data.expansionTeams.length, 2);
  assert.deepEqual(data.expansionTeams.map(team => team.team), ['UPSHOT Baltimore', 'UPSHOT Nashville']);
  assert.equal(new Set([...data.teams, ...data.expansionTeams].map(team => team.team)).size, 6);
  assert.match(page, /id="upshotExpansionTeams"/);
  assert.match(renderer, /renderExpansionTeams\(expansionTeams\)/);
});

test('includes the inaugural awards and complete six-player All-UPSHOT Team', () => {
  assert.equal(data.awards.length, 4);
  assert.deepEqual(data.awards.map(item => item.player), ['Ariel Hearn', 'Schaquilla Nunn', 'Taylor Soule', 'Deja Kelly']);
  assert.equal(data.allUpshot.length, 6);
  assert.deepEqual(new Set(data.allUpshot.map(item => item.team)), new Set(data.teams.map(team => team.team)));
  assert.match(page, /id="upshotAwards"/);
  assert.match(page, /id="upshotAllTeam"/);
  assert.match(renderer, /renderAwards\(awards,teams\)/);
  assert.match(renderer, /renderAllUpshot\(allUpshot,teams\)/);
});

test('tracks all three verified inaugural-season WNBA call-ups', () => {
  assert.equal(data.callUps.length, 3);
  assert.deepEqual(data.callUps.map(item => item.player), ['Michelle Onyiah', 'Christyn Williams', 'Shyanne Sellers']);
  assert.deepEqual(data.callUps.map(item => item.to), ['Indiana Fever', 'Dallas Wings', 'Los Angeles Sparks']);
  assert.equal(data.callUps[2].date, '2026-08-31');
  assert.match(data.callUps[2].contract, /Player Development Pool/i);
  assert.ok(data.timeline.some(item => item.date === 'Aug. 31, 2026' && /Sellers/i.test(item.detail)));
  assert.match(data.next, /three inaugural-season UPSHOT players/i);
});

test('leads final results with the title game', () => {
  const titleGame = data.recentGames[0];
  assert.equal(titleGame.stage, 'Championship');
  assert.equal(titleGame.away, 'Charlotte Crown');
  assert.equal(titleGame.awayScore, 81);
  assert.equal(titleGame.home, 'Jacksonville Waves');
  assert.equal(titleGame.homeScore, 76);
});
