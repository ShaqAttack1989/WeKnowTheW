const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const specials = read('homepage-specials.js');
const weekLive = read('homepage-week-live.js');
const latest = JSON.parse(read('snack-shak-latest.json'));
const finalFeed = JSON.parse(read('snack-shak-final.json'));

const championsPhoto = '/assets/images/fiba-group-play/fiba-world-champions-usa-2026.jpg';
const jackieTrophyPhoto = '/assets/images/fiba-group-play/jackie-young-championship-trophy-2026.jpg';
const libertySleeperPhoto = '/assets/images/snack-shak/liberty-post-fiba-sleeper.jpg';

test('the static spotlight links to its featured stories', () => {
  assert.match(index, /season-story season-story-lead" href="\/aja-wilson-mvp-race-2026\.html"/);
  assert.match(index, /season-story" href="\/fiba-return-playoff-show-2026\.html"/);
});

test('the weekly story renderer owns story links and respects image fit', () => {
  assert.match(specials, /spotlight\.dataset\.season='wnba-return'/);
  assert.doesNotMatch(specials, /\benforceUniqueEditorials\(\);/);
  assert.match(weekLive, /host\.dataset\.href=destination/);
  assert.match(weekLive, /--media-fit:\$\{image\.fit\}/);
  assert.equal(latest.posts.find(post=>post.slug==='liberty-post-fiba-finals-sleeper').imageFit,'contain');
});

test('the championship and Jackie Young feeds use distinct, relevant photos', () => {
  const recap = latest.posts.find(post => post.slug === 'fiba-final-recap-2026');
  const jackie = latest.posts.find(post => post.slug === 'jackie-young-championship-collection');
  const preview = finalFeed.posts.find(post => post.slug === 'usa-france-world-cup-final-2026');

  assert.equal(recap.image, championsPhoto);
  assert.equal(recap.storyImage, championsPhoto);
  assert.equal(preview.image, championsPhoto);
  assert.equal(jackie.image, jackieTrophyPhoto);
  assert.notEqual(recap.image, jackie.image);
  assert.ok(fs.statSync(path.join(root, championsPhoto)).size > 150_000);
  assert.ok(fs.statSync(path.join(root, libertySleeperPhoto)).size > 300_000);
});
