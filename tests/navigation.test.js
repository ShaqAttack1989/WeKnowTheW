const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const site = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'site-navigation.css'), 'utf8');
const legacySnackNav = fs.readFileSync(path.join(root, 'snack-shak-nav.js'), 'utf8');
const navSource = site.slice(site.indexOf('const structuredNav='), site.indexOf('if(navLinks)navLinks.innerHTML'));

test('keeps the global menu to seven clear editorial sections', () => {
  const sections = [...navSource.matchAll(/navGroup\('([^']+)'/g)].map(match => match[1]);
  assert.deepEqual(sections, ['around', 'players', 'vault', 'culture', 'future', 'offseason', 'snack']);
  assert.match(navSource, /nav-mobile-utility/);
  assert.match(navSource, /globalSearchButton/);
});

test('groups child destinations instead of promoting articles into the menu', () => {
  for (const label of ['Live Stats', 'Team Hubs', 'Current Players', 'Herstory', 'The Film Room', 'Coaches', 'Expansion Watch', 'Unrivaled', 'Snack Shak Bytes', 'Food for Thought']) {
    assert.match(navSource, new RegExp(label.replace(/[?]/g, '\\?')));
  }
  for (const article of ['Tina Charles: No. 31 Rises', 'Legendary WNBA Duos', 'DeWanna Bonner: One More Run']) {
    assert.doesNotMatch(navSource, new RegExp(article));
  }
});

test('uses one white desktop bar and a bounded mobile accordion', () => {
  assert.match(css, /\.site-navigation\s*\{/);
  assert.match(css, /background:#fff!important/);
  assert.match(css, /\.nav-menu-grid/);
  assert.match(css, /body\.mobile-nav-open \.site-navigation \.nav-links\.open/);
  assert.match(css, /max-height:calc\(100dvh - 70px\)/);
  assert.match(site, /menuButton\.textContent=open\?'Close':'Menu'/);
});

test('keeps desktop menu labels readable and the homepage hero compact', () => {
  const landing = fs.readFileSync(path.join(root, 'landing.css'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(css, /\.site-navigation \.nav-parent-label\s*\{[^}]*font-size:1em!important/s);
  assert.match(css, /font-size:clamp\(\.88rem,\.82vw,\.96rem\)!important/);
  assert.match(landing, /@media\(min-width:901px\)\{[\s\S]*\.hub-hero \.hero-inner\{[\s\S]*min-height:520px/);
  assert.match(landing, /\.hub-hero h1\{[\s\S]*font-size:clamp\(4rem,4\.5vw,5\.35rem\)/);
  assert.match(home, /landing\.css\?v=20260830-compact-hero-v1/);
});

test('older Snack Shak article helper cannot overwrite the new menu', () => {
  assert.match(legacySnackNav, /group\?\.querySelector\('\.nav-menu-section'\)\)return/);
});
