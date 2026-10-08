const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { selectStories } = require('../homepage-fresh-stories.js');
const now = Date.parse('2026-10-08T22:00:00Z');
const story = (slug, published, extra = {}) => ({ slug, published, title: slug, type: 'feature', ...extra });
test('new publication and substantial update displace older high-priority stories', () => {
  const result = selectStories([[story('berlin', '2026-09-17', { priority: 99999 }), story('sun', '2026-09-25'), story('guide', '2026-10-02', { updated: '2026-10-08' })], [story('new-byte', '2026-10-08'), story('new-feature', '2026-10-07')]], now);
  assert.deepEqual(result.slice(0, 3).map(p => p.slug), ['new-byte', 'guide', 'new-feature']);
});
test('duplicate feeds, drafts, future posts and intro entries do not occupy slots', () => {
  const result = selectStories([[story('same', '2026-10-02'), story('draft', '2026-10-08', { draft: true }), story('future', '2026-10-09'), story('intro', '2026-10-08', { type: 'intro' })], [story('same', '2026-10-02', { updated: '2026-10-08', title: 'Updated' })]], now);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Updated');
});
test('a missing feed leaves available stories ordered and selectable', () => {
  assert.deepEqual(selectStories([[], [story('older', '2026-10-01'), story('newer', '2026-10-08')]], now).map(p => p.slug), ['newer', 'older']);
});
test('homepage slots are dynamic in both published copies', () => {
  for (const file of ['index.html', 'site/index.html']) {
    const html = fs.readFileSync(file, 'utf8');
    for (const id of ['freshTopStories', 'freshNextStory', 'freshMoreStories']) assert.ok(html.includes(`id="${id}"`));
    assert.match(html, /homepage-fresh-stories\.js/);
    assert.doesNotMatch(html, /Berlin to Buckets:|One Last Sunrise:|Issa Rae just bought/);
  }
});
