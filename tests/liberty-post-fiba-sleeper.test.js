const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const feed = JSON.parse(read('snack-shak-latest.json'));
const homepage = read('homepage-specials.js');
const collection = read('snack-shak-collections.js');
const imagePath = 'assets/images/snack-shak/liberty-post-fiba-sleeper.jpg';
const slug = 'liberty-post-fiba-finals-sleeper';

test('the Liberty sleeper Byte is published with the supplied image and seven World Cup players', () => {
  const post = feed.posts.find(item => item.slug === slug);
  assert.ok(post);
  assert.equal(post.type, 'byte');
  assert.equal(post.published, '2026-09-16');
  assert.equal(post.homepageSeason, 'wnba-return');
  assert.equal(post.dashboardUrl, `/snack-shak-bytes.html?post=${slug}#story`);
  assert.equal(post.image, `/${imagePath}`);
  assert.equal(post.storyTable.rows.length, 7);
  assert.match(post.sections.at(-1).paragraphs.at(-1), /sixth place may become the most misleading number/i);
  assert.ok(fs.statSync(path.join(root, imagePath)).size > 300_000);
});

test('the WNBA return spotlight leads with the Liberty Byte and keeps the watch guide', () => {
  assert.match(homepage, new RegExp(`season-story season-story-lead[^]*?post=${slug}#story`));
  assert.match(homepage, /liberty-post-fiba-sleeper\.jpg/);
  assert.match(homepage, /welcome-back-to-the-w-2026\.html/);
  assert.match(homepage, /post\.homepageSeason==='wnba-return'/);
});

test('the Byte table can render all seven player photos and six country flags', () => {
  for (const player of ['Breanna Stewart', 'Marine Johannes', 'Pauline Astier', 'Leonie Fiebich', 'Raquel Carrera', 'Han Xu', 'Elizabeth Balogun']) {
    assert.ok(collection.includes(`'${player}'`), player);
  }
  assert.match(collection, /'Nigeria':'ng'/);
  assert.match(collection, /playerPhoto\(value\)/);
});
