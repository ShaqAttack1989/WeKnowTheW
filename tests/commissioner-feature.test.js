const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('next-wnba-commissioner.html');
const css = read('next-wnba-commissioner.css');
const site = read('site.js');
const feed = JSON.parse(read('snack-shak-latest.json'));

const candidates = [
  'Swin Cash',
  'Sarah Mensah',
  'Bethany Donaphin',
  'Jess Smith',
  'Nneka Ogwumike',
  'Condoleezza Rice',
  'Renie Anderson'
];

test('publishes the retirement story as the newest Food for Thought feature', () => {
  const post = feed.posts.find(item => item.slug === 'next-wnba-commissioner');
  assert.ok(post);
  assert.equal(post.type, 'feature');
  assert.equal(post.published, '2026-09-05');
  assert.equal(post.dashboardUrl, '/next-wnba-commissioner.html');
  assert.match(html, /Cathy Engelbert is retiring at the end of 2026/);
});

test('includes every candidate and a real image for each person', () => {
  for (const name of candidates) assert.match(html, new RegExp(name));
  const imagePaths = [...html.matchAll(/src="(\/assets\/images\/commissioner-search\/[^"]+\.webp)"/g)].map(match => match[1]);
  assert.equal(new Set(imagePaths).size, 8);
  for (const imagePath of imagePaths) {
    assert.ok(fs.existsSync(path.join(root, imagePath.slice(1))), `${imagePath} should exist`);
  }
  assert.match(css, /\.candidate-card/);
  assert.match(css, /@media\(max-width:720px\)/);
});

test('orders the scouting board by grade and displays teacher style grade marks', () => {
  const expectedOrder = [
    'Swin Cash',
    'Sarah Mensah',
    'Bethany Donaphin',
    'Jess Smith',
    'Nneka Ogwumike',
    'Renie Anderson',
    'Condoleezza Rice'
  ];
  const positions = expectedOrder.map(name => html.indexOf(`>${name}</h3>`));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(html, /aria-label="Grade A plus">A<sup>\+<\/sup>/);
  assert.match(html, /aria-label="Grade A minus">A<sup>−<\/sup>/);
  assert.match(html, /aria-label="Grade B plus">B<sup>\+<\/sup>/);
  assert.match(html, /THE REVENUE SPECIALIST<\/span><b class="grade-badge grade-b" aria-label="Grade B">B<\/b>/);
  assert.match(css, /\.candidate-topline \.grade-badge/);
  assert.match(css, /"Segoe Print","Bradley Hand","Comic Sans MS",cursive/);
  assert.match(css, /\.candidate-topline \.grade-badge:after/);
});

test('credits photo sources and marks candidates as unconfirmed', () => {
  assert.match(html, /These names are potential candidates, not confirmed finalists/);
  assert.match(html, /Jennifer Pottheiser/);
  assert.match(html, /Photo via/);
  assert.match(html, /Official player image via/);
});

test('adds the article to global navigation state and search', () => {
  assert.match(site, /navSections\.snack\.push\('\/next-wnba-commissioner\.html'\)/);
  assert.match(site, /The W Is Changing Hands/);
  assert.match(site, /Cathy Engelbert retirement next WNBA commissioner/);
});
