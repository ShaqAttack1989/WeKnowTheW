const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const latest=JSON.parse(read('snack-shak-latest.json'));
const post=latest.posts.find(item=>item.slug==='the-playoff-watch-party-2026');

test('the playoff watch guide carries verified Game 1 records and real WNBA photos',()=>{
  assert.ok(post);
  assert.equal(post.published,'2026-09-28');
  assert.equal(post.playoffGameOne.receipts.length,5);
  assert.equal(post.playoffGameOne.highlights.length,4);
  assert.match(post.dek,/New York made 1-vs-8 history/);
  assert.ok(post.playoffGameOne.highlights.every(item=>/^https:\/\/cdn\.wnba\.com\/headshots\/wnba\//.test(item.photo)));
  assert.ok(post.playoffGameOne.highlights.every(item=>/Official WNBA/.test(item.photoCredit)));
  assert.match(JSON.stringify(post.playoffGameOne.receipts),/78\.9%/);
  assert.match(JSON.stringify(post.playoffGameOne.receipts),/Atlanta playoff steals/);
  assert.doesNotMatch(JSON.stringify(post),/(unsplash|midjourney|dall-e|ai generated)/i);
});

test('one shared live bracket renders on the homepage and in the article',()=>{
  const index=read('index.html'),food=read('food-for-thought.html'),collections=read('snack-shak-collections.js'),bracket=read('playoff-bracket.js'),styles=read('playoff-bracket.css');
  assert.doesNotThrow(()=>new Function(bracket));
  assert.match(index,/data-wktw-playoff-bracket data-variant="home"/);
  assert.match(food,/playoff-bracket\.js\?v=/);
  assert.match(collections,/data-wktw-playoff-bracket data-variant="story"/);
  assert.match(collections,/WKTWPlayoffBracket\?\.init\(story\)/);
  assert.match(bracket,/setInterval\(\(\)=>\{if\(!document\.hidden\)refreshLive\(\);\},10000\)/);
  assert.match(bracket,/First Round/);
  assert.match(bracket,/Semifinals/);
  assert.match(bracket,/Finals/);
  assert.match(styles,/\.wktw-bracket-grid/);
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
