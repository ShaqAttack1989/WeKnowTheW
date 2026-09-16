const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const feed = JSON.parse(fs.readFileSync(path.join(root, 'snack-shak-final.json'), 'utf8'));
const post = feed.posts.find(item => item.slug === 'we-know-the-w-2026-mock-awards');

test('publishes the 2026 mock awards as a Food for Thought feature', () => {
  assert.ok(post);
  assert.equal(post.type, 'feature');
  assert.equal(post.published, '2026-09-16');
  assert.equal(post.image, '/assets/images/snack-shak/we-know-the-w-mock-awards-2026.svg');
  assert.ok(fs.existsSync(path.join(root, post.image.replace(/^\//, ''))));
});

test('keeps Nakase as COY and uses the revised All WNBA First Team', () => {
  const rows = new Map(post.storyTable.rows.map(row => [row[0], row]));
  assert.equal(rows.get('Coach of the Year')[1], 'Natalie Nakase');
  const firstTeam = rows.get('All WNBA First Team')[1];
  assert.match(firstTeam, /Jackie Young/);
  assert.match(firstTeam, /Natasha Howard/);
  assert.doesNotMatch(firstTeam, /Caitlin Clark/);
});

test('makes the mock awards feature searchable', () => {
  const site = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
  assert.match(site, /we-know-the-w-2026-mock-awards/);
});
