const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const specials = read('homepage-specials.js');
const latest = JSON.parse(read('snack-shak-latest.json'));
const finalFeed = JSON.parse(read('snack-shak-final.json'));

const championsPhoto = '/assets/images/fiba-group-play/fiba-world-champions-usa-2026.jpg';
const jackieTrophyPhoto = '/assets/images/fiba-group-play/jackie-young-championship-trophy-2026.jpg';

test('the static Fold spotlight keeps each story attached to its own photo', () => {
  assert.match(index, new RegExp(`<a class="season-story season-story-lead"[\\s\\S]*?<img src="${championsPhoto}"[\\s\\S]*?</a>`));
  assert.match(index, new RegExp(`<a class="season-story" href="/snack-shak-bytes\\.html\\?post=jackie-young-championship-collection#story">[\\s\\S]*?<img src="${jackieTrophyPhoto}"[\\s\\S]*?</a>`));
});

test('the live spotlight promotes the completed championship recap and uses its feed image', () => {
  assert.match(specials, /post\.slug==='fiba-final-recap-2026'/);
  assert.match(specials, /image\.src=imageFor\(post,'food'\)/);
  assert.doesNotMatch(specials, /const FINAL_IMAGE=/);
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
  assert.ok(fs.statSync(path.join(root, championsPhoto)).size > 250_000);
});
