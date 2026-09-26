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
  assert.match(html, /Toronto or <em>Houston\?/);
  assert.match(html, /Final 2026 order · lottery pending/i);
  assert.match(html, /EDITION 02/);
  assert.equal(post.dashboardUrl, '/2027-wnba-mock-draft.html');
  assert.equal(post.type, 'feature');
  assert.equal(post.week, 'Edition 02 · Updated Sept. 26, 2026');
});

test('includes 15 ordered picks with photos, team marks and program marks', () => {
  const picks = [...script.matchAll(/\{pick:(\d+),player:/g)].map(match => Number(match[1]));
  assert.deepEqual(picks, Array.from({ length: 15 }, (_, index) => index + 1));
  assert.match(script, /espnPlayer/);
  assert.match(script, /espnTeam/);
  assert.match(script, /espnSchool/);
  assert.match(script, /houstonLogo/);
  assert.match(script, /Ainhoa Risacher/);
  assert.match(script, /pick:1,player:'JuJu Watkins',team:teams\.toronto/);
  assert.match(script, /pick:2,player:'Hannah Hidalgo',team:teams\.houston/);
  assert.match(script, /pick:8,player:'Talaysia Cooper',team:teams\.newYork/);
  assert.match(script, /pick:9,player:'Tessa Johnson',team:teams\.dallas/);
  assert.match(script, /pick:10,player:'Ashlyn Watkins',team:teams\.indiana/);
  assert.match(script, /pick:11,player:'Oluchi Okananwa',team:teams\.chicago,via:'via Washington'/);
  assert.match(script, /pick:12,player:'Zhang Ziyu'/);
  assert.match(script, /const firstOut=\{player:'Addy Brown'/);
});

test('states the uncertainty instead of presenting lottery order as final', () => {
  assert.match(html, /lottery has not happened/i);
  assert.match(html, /has not published the official 2027 seven-team odds table/i);
  assert.match(html, /29\.5% figures come from Tankathon’s current estimate/i);
  assert.match(html, /Watkins has to return healthy/i);
});

test('explains the tied lottery procedure and Nichols eligibility outlook', () => {
  assert.match(html, /combinations will be pooled and divided evenly/i);
  assert.match(html, /Houston receives the extra combination/i);
  assert.match(script, /Likely 2027 entrant · fifth year available/);
  assert.match(html, /cbssports\.com\/wnba\/news\/2027-wnba-draft-lottery-odds-order/);
  assert.match(html, /kusports\.com\/sports\/college\/basketball-women/);
});

test('adds the World Cup riser evidence and eligibility sources', () => {
  assert.match(html, /13 points, six rebounds and two blocks/);
  assert.match(html, /meeting the WNBA’s published age requirement for international draftees/);
  assert.match(html, /fiba\.basketball\/en\/events\/fiba-womens-basketball-world-cup-2026\/teams\/china\/342510-ziyu-zhang/);
  assert.match(html, /www\.wnba\.com\/faq/);
});

test('cross-references the board from Who Got Next and global search', () => {
  assert.match(site, /function addMockDraftRoute/);
  assert.match(site, /Early 2027 WNBA Mock Draft/);
  assert.match(site, /\/2027-wnba-mock-draft\.html/);
  assert.match(site, /zhang ziyu china world cup/);
  assert.match(site, /Toronto or Houston\?/);
});
