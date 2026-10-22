const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const latest=JSON.parse(read('snack-shak-latest.json'));
const post=latest.posts.find(item=>item.slug==='the-playoff-watch-party-2026');

test('Game 3 recap carries the correct final and supplied WNBA graphic',()=>{assert.equal(post.updated,'2026-10-21');assert.match(post.title,/Dreams to Nightmares/);assert.match(post.dek,/97–71/);assert.equal(post.playoffWatch.matchups[0].series,'2–1');assert.match(post.gameGallery.items.at(-1).caption,/After Reese went 2-for-2/);assert.equal(post.gameGallery.items.at(-1).credit,'WNBA official social graphic');});

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
