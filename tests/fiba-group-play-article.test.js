const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const article = fs.readFileSync(path.join(root, 'what-group-play-told-us.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'fiba-group-play-analysis.css'), 'utf8');
const hub = fs.readFileSync(path.join(root, 'fiba-world-cup.html'), 'utf8');
const feed = JSON.parse(fs.readFileSync(path.join(root, 'snack-shak-latest.json'), 'utf8'));

test('group-play Food for Thought feature is discoverable from both hubs', () => {
  assert.ok(hub.includes('/what-group-play-told-us.html'));
  assert.ok(feed.posts.some(post => post.slug === 'what-group-play-told-us' && post.type === 'feature'));
});

test('article includes the completed composite, USA leaderboard context and all knockout paths', () => {
  for (const value of ['93.3', '88.7', '82.3', '68.2', '61.9']) assert.ok(article.includes(value), value);
  assert.ok(article.includes('1 of 18'));
  assert.ok(article.includes('Jackie Young leads USA at 11.3 PPG'));
  assert.ok(article.includes('Caitlin Clark, third at 6.3 APG'));
  for (const opponent of ['WINNER FACES USA', 'WINNER FACES BELGIUM', 'WINNER FACES FRANCE', 'WINNER FACES SPAIN']) assert.ok(article.includes(opponent), opponent);
});

test('article and share graphic use real official FIBA photography assets', () => {
  for (const image of ['france-action.jpg', 'belgium.jpg', 'usa-action.jpg', 'spain-action.jpg', 'australia.jpg']) {
    assert.ok(article.includes(image), image);
    assert.ok(fs.statSync(path.join(root, 'assets', 'images', 'fiba-group-play', image)).size > 100000, image);
  }
  assert.ok(article.includes('Photo and report: FIBA'));
  assert.ok(article.includes('/social/fiba/what-group-play-told-us.png'));
  const graphic = fs.readFileSync(path.join(root, 'social', 'fiba', 'what-group-play-told-us.png'));
  assert.ok(graphic.length > 300000);
  assert.equal(graphic.readUInt32BE(16), 1536);
  assert.equal(graphic.readUInt32BE(20), 1024);
});

test('article remains readable and responsive', () => {
  assert.match(css, /font-size:1\.08rem/);
  assert.match(css, /@media\(max-width:640px\)/);
  assert.match(css, /grid-template-columns:1fr/);
});
