const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('2027-wnba-mock-draft.html');
const script = read('2027-wnba-mock-draft.js');
const site = read('site.js');
const feed = JSON.parse(read('snack-shak-latest.json'));

test('publishes the mock draft as a Food for Thought dashboard', () => {
  const post = feed.posts.find(item => item.slug === '2027-wnba-mock-draft');
  assert.match(html, /FOOD FOR THOUGHT/);
  assert.match(html, /id="mock-board"/);
  assert.match(html, /JuJu to <em>Houston\?/);
  assert.match(html, /current-order projection/i);
  assert.equal(post.dashboardUrl, '/2027-wnba-mock-draft.html');
  assert.equal(post.type, 'feature');
});

test('includes 15 ordered picks with photos, team marks and program marks', () => {
  const picks = [...script.matchAll(/\{pick:(\d+),player:/g)].map(match => Number(match[1]));
  assert.deepEqual(picks, Array.from({ length: 15 }, (_, index) => index + 1));
  assert.match(script, /espnPlayer/);
  assert.match(script, /espnTeam/);
  assert.match(script, /espnSchool/);
  assert.match(script, /houstonLogo/);
  assert.match(script, /Ainhoa Risacher/);
});

test('states the uncertainty instead of presenting lottery order as final', () => {
  assert.match(html, /lottery has not happened/i);
  assert.match(html, /has not yet published the final 2027 seven-team odds/i);
  assert.match(html, /Watkins has to return healthy/i);
});

test('cross-references the board from Who Got Next and global search', () => {
  assert.match(site, /function addMockDraftRoute/);
  assert.match(site, /Early 2027 WNBA Mock Draft/);
  assert.match(site, /\/2027-wnba-mock-draft\.html/);
});
