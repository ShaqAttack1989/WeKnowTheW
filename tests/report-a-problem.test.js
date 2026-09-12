const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'report-a-problem.html'), 'utf8');

test('problem reports use the published direct-email workflow', () => {
  assert.match(html, /Email Shak directly/i);
  assert.match(html, /mailto:books@adventuresinzen\.com\?subject=We%20Know%20the%20W%20problem%20report/);
  assert.match(html, /page address/i);
  assert.match(html, /source link/i);
  assert.match(html, /screenshot/i);
});

test('removed report form and API are not referenced by the page', () => {
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /\/api\/report-a-problem/);
  assert.doesNotMatch(html, /report-a-problem\.js/);
  assert.equal(fs.existsSync(path.join(root, 'api', 'report-a-problem.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'report-a-problem.js')), false);
});

test('direct-email page keeps site navigation and editorial context', () => {
  assert.match(html, /id="menuButton"/);
  assert.match(html, /id="navLinks"/);
  assert.match(html, /\/about\.html#editorial-philosophy/);
  assert.match(html, /\/site\.js/);
});
