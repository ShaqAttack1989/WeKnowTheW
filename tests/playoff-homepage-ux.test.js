const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Games defaults to playoffs after the 2026 regular season',()=>{
  const html=read('games.html'),js=read('games-page.js');
  assert.match(html,/class="active" data-games-competition="playoffs" aria-pressed="true"/);
  assert.match(js,/gamesMode='upcoming'.*gamesCompetition='playoffs'/s);
});

test('Homepage Games snapshot includes playoff feed and visual fallback',()=>{
  const source=read('homepage-week-live.js');
  assert.match(source,/api\/competition\?season=2026/);
  assert.match(source,/MEDIA\.games/);
  assert.match(source,/playoffUpcoming/);
});

test('Homepage does not preload the heavy legacy player catalog',()=>{
  const html=read('index.html');
  assert.doesNotMatch(html,/src="\/playerpedia-legacy\.js/);
  assert.match(html,/homepage-data-cache\.js/);
});

test('Playoff watch keeps a 16px minimum for compact labels and copy',()=>{
  const css=read('snack-shaq.css');
  assert.match(css,/Playoff Watch readability standard/);
  assert.match(css,/font-size:16px/);
});
