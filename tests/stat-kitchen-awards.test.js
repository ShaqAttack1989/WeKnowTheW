const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'stat-kitchen.html'), 'utf8');
const client = fs.readFileSync(path.join(root, 'stat-kitchen-awards.js'), 'utf8');
const api = fs.readFileSync(path.join(root, 'api', 'rookie-week.js'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'weekly-heat-check.yml'), 'utf8');
const weeklyUpdater = fs.readFileSync(path.join(root, 'scripts', 'update-weekly-awards.mjs'), 'utf8');
const rookieUpdater = fs.readFileSync(path.join(root, 'scripts', 'update-rookie-week.mjs'), 'utf8');
const monthlySource = fs.readFileSync(path.join(root, 'stat-kitchen-monthly-data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(monthlySource, sandbox);

const monthly = sandbox.window.STAT_KITCHEN_MONTHLY_AWARDS;
const rookieMonths = sandbox.window.STAT_KITCHEN_ROOKIE_MONTH_AWARDS;
const playerKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

test('Stat Kitchen exposes all requested award dashboards', () => {
  assert.match(page, /id="player-of-month"/);
  assert.match(page, /id="rookie-of-week"/);
  assert.match(page, /id="rookie-of-month"/);
  assert.match(page, /stat-kitchen-monthly-data\.js/);
  assert.match(page, /stat-kitchen-awards\.js/);
  assert.match(page, /stat-kitchen-awards\.css/);
});

test('monthly dashboards are current through August 2026', () => {
  assert.equal(monthly[0].month, 'August');
  assert.equal(monthly[0].east.name, 'Kelsey Mitchell');
  assert.equal(monthly[0].east.team, 'Indiana Fever');
  assert.equal(playerKey(monthly[0].west.name), playerKey("A'ja Wilson"));
  assert.equal(monthly[0].west.team, 'Las Vegas Aces');
  assert.deepEqual(Array.from(monthly, item => item.month), ['August', 'July', 'June', 'May']);

  assert.equal(rookieMonths[0].month, 'August');
  assert.equal(rookieMonths[0].name, 'Olivia Miles');
  assert.equal(rookieMonths[0].team, 'Minnesota Lynx');
  assert.equal(rookieMonths.length, 4);
  assert.ok(rookieMonths.every(item => item.name === 'Olivia Miles'));
});

test('conference and rookie labels are explicit', () => {
  assert.match(client, /EASTERN/);
  assert.match(client, /WESTERN/);
  assert.match(client, /KIA PLAYER OF THE MONTH/);
  assert.match(client, /KIA ROOKIE OF THE MONTH/);
  assert.match(client, /WE KNOW THE W ROOKIE/);
  assert.match(client, /not an official WNBA award/);
});

test('Rookie of the Week uses ESPN boxscores and not a WNBA API endpoint', () => {
  assert.match(api, /site\.api\.espn\.com/);
  assert.match(api, /boxscore/);
  assert.doesNotMatch(api, /stats\.wnba\.com/);
  assert.doesNotMatch(api, /cdn\.wnba\.com/);
  assert.match(api, /PPG \+ 1\.2×RPG \+ 1\.5×APG \+ 3×SPG \+ 3×BPG/);
});

test('Rookie of the Week has a verified snapshot fallback', () => {
  assert.match(api, /stat-kitchen-rookie-week\.json/);
  assert.match(api, /fallbackPayload/);
  assert.match(api, /verified snapshot fallback/);
  assert.match(client, /fetchRookieSnapshot/);
  assert.match(client, /stat-kitchen-rookie-week\.json/);
  assert.match(client, /15\*60\*1000/);
  assert.match(client, /visibilitychange/);
});

test('Rookie snapshot updater preserves the last verified board on provider failure', () => {
  assert.match(rookieUpdater, /fresh: '1'/);
  assert.match(rookieUpdater, /Preserving verified Week/);
  assert.match(rookieUpdater, /stat-kitchen-rookie-week\.json/);
  assert.doesNotMatch(rookieUpdater, /stats\.wnba\.com/);
});

test('award sync covers weekly, monthly and rookie releases automatically', () => {
  assert.match(workflow, /update-weekly-awards\.mjs/);
  assert.match(workflow, /update-monthly-awards\.mjs/);
  assert.match(workflow, /update-rookie-week\.mjs/);
  assert.match(workflow, /stat-kitchen-rookie-week\.json/);
  assert.match(workflow, /37 18 \* \* \*/);
  assert.doesNotMatch(weeklyUpdater, /Official award period/);
  assert.match(weeklyUpdater, /nextPeriod\(latest\.dates\)/);
});
