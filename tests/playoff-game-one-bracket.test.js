const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const latest=JSON.parse(read('snack-shak-latest.json'));
const post=latest.posts.find(item=>item.slug==='the-playoff-watch-party-2026');

test('playoff watch has Finals receipts and real Game 3 imagery',()=>{assert.equal(post.updated,'2026-10-10');assert.match(post.title,/Finals/);assert.match(post.image,/2026-10-09_Jeff-Bottari_NBAE/);assert.equal(post.playoffWatch.matchups[0].series,'0-0');});

test('one shared live bracket renders on the homepage and in the article',()=>{
  const index=read('index.html'),food=read('food-for-thought.html'),collections=read('snack-shak-collections.js'),bracket=read('playoff-bracket.js'),styles=read('playoff-bracket.css');
  assert.doesNotThrow(()=>new Function(bracket));
  assert.match(index,/data-wktw-playoff-bracket data-variant="home"/);
  assert.match(food,/playoff-bracket\.js\?v=/);
  assert.match(collections,/data-wktw-playoff-bracket data-variant="story"/);
  assert.match(collections,/WKTWPlayoffBracket\?\.init\(story\)/);
  assert.match(bracket,/setInterval\(\(\)=>\{if\(!document\.hidden\)refreshLive\(\);\},10000\)/);
  assert.match(bracket,/id:'1042600202'.*homeScore:101,awayScore:98/);
  assert.match(bracket,/id:'1042600212'.*homeScore:83,awayScore:81/);
  assert.match(bracket,/1042600213/);
  assert.match(bracket,/First Round/);
  assert.match(bracket,/Semifinals/);
  assert.match(bracket,/Finals/);
  assert.match(bracket,/isPlaceholder=name=>\/winner\/i/);
  assert.match(bracket,/winnerWins=state\.winner===a\?state\.aWins:state\.bWins/);
  assert.match(bracket,/loserWins=state\.winner===a\?state\.bWins:state\.aWins/);
  assert.match(styles,/\.wktw-bracket-grid/);
  assert.match(styles,/scroll-margin-top:170px/);
});

test('playoff game cards clearly separate regular-season context from playoff advancement',()=>{
  const cards=read('game-cards.js'),page=read('games-page.js'),html=read('games.html'),css=read('landing.css');
  assert.match(cards,/REGULAR-SEASON HEAD-TO-HEAD/);
  assert.match(cards,/PLAYOFF SERIES/);
  assert.match(cards,/does not carry over/);
  assert.doesNotMatch(cards,/REG: /);
  assert.doesNotMatch(cards,/SERIES: /);
  assert.match(page,/playoffSeriesLabel/);
  assert.match(html,/Those wins do not carry into the postseason/);
  assert.match(css,/\.schedule-series-context/);
});
