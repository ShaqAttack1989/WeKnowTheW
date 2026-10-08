const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const text=file=>fs.readFileSync(path.join(root,file),'utf8');
const latest=JSON.parse(text('snack-shak-latest.json'));
const guide=latest.posts.find(post=>post.slug==='the-playoff-watch-party-2026');

test('playoff watch guide is refreshed for both semifinal Game 2 finals',()=>{
  assert.ok(guide);
  assert.equal(guide.updated,'2026-10-08');
  assert.match(guide.title,/Both Semifinals Are 2–0/);
  assert.equal(guide.playoffWatch.matchups.length,2);
  assert.deepEqual(guide.playoffWatch.matchups.map(item=>item.id),['atl-nyl','gsv-lva']);
  assert.ok(guide.playoffWatch.matchups.every(item=>item.roundKey==='Semifinals'));
  assert.equal(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').series,'2-0');
  assert.equal(guide.playoffWatch.matchups.find(item=>item.id==='gsv-lva').series,'2-0');
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').seriesNote,/ATLANTA LEADS/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='gsv-lva').seriesNote,/GOLDEN STATE LEADS/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').availability,/ATL 101, NYL 98 \(OT\)/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').availability,/Oct\. 9, 7:30 ET on ESPN2/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='gsv-lva').availability,/GSV 83, LVA 81/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='gsv-lva').availability,/Oct\. 9, 9:30 ET/);
});

test('latest Game 2 records, analysis, official imagery and award fallout are explicit',()=>{
  const values=guide.playoffGameOne.receipts.map(item=>item.value);
  assert.ok(values.includes('83–81'));
  assert.ok(values.includes('21'));
  assert.ok(values.includes('20 + 5'));
  assert.ok(values.includes('34–14'));
  assert.ok(values.includes('24'));
  assert.ok(values.includes('2–0'));
  assert.equal(guide.gameGallery.items.length,4);
  assert.ok(guide.gameGallery.items.every(item=>item.image.startsWith('https://cdn.wnba.com/')));
  assert.deepEqual(guide.awardFallout.people.map(item=>item.name),['Cheryl Reeve','Olivia Miles']);
  assert.equal(guide.awardFallout.implications.length,4);
  assert.match(guide.awardFallout.note,/regular-season awards/i);
});

test('live renderer supports logos, semifinal rounds and dynamic summaries',()=>{
  const renderer=text('snack-shak-collections.js');
  assert.match(renderer,/PLAYOFF_TEAM_LOGOS/);
  assert.match(renderer,/data-playoff-round/);
  assert.match(renderer,/board\.summary/);
  assert.match(renderer,/data-playoff-summary-key/);
  assert.match(renderer,/playoffGalleryMarkup\(post\.gameGallery\)/);
  assert.match(renderer,/playoffAwardFalloutMarkup\(post\.awardFallout\)/);
  assert.match(renderer,/atl-nyl/);
});

test('fallback feeds carry both semifinal Game 2 finals and the remaining dates',()=>{
  const competition=text('api/competition.js');
  const bracket=text('playoff-bracket.js');
  for(const source of [competition,bracket]){
    assert.match(source,/homeTeam:'Golden State Valkyries',awayTeam:'Dallas Wings',homeScore:77,awayScore:73/);
    assert.match(source,/id:'1042600201'.*homeScore:92,awayScore:82.*status:'Final'.*completed:true/);
    assert.match(source,/id:'1042600202'.*homeScore:101,awayScore:98.*status:'Final\/OT'.*completed:true/);
    assert.match(source,/2026-nyl-atl-sf-g3/);
    assert.match(source,/1042600211/);
    assert.match(source,/id:'1042600212'.*homeScore:83,awayScore:81.*status:'Final'.*completed:true/);
    assert.match(source,/2026-lva-gsv-sf-g3/);
  }
  assert.match(competition,/2026-10-07T21:30:00-04:00/);
  assert.match(competition,/2026-10-09T19:30:00-04:00/);
  assert.match(bracket,/snapshot\?\.winner\|\|\(aWins>=target/);
});

test('scheduled Semifinals status is never mistaken for a final result',()=>{
  const bracket=text('playoff-bracket.js');
  const games=text('games-page.js');
  const scoreboard=text('global-scoreboard.js');
  const stats=text('live-stats-page.js');
  const cards=text('game-cards.js');
  const competition=text('api/competition.js');
  for(const source of [bracket,scoreboard,stats,competition]) assert.match(source,/\/\\bfinal\\b\/i/);
  assert.doesNotMatch(bracket,/\/final\/i\.test/);
  assert.doesNotMatch(scoreboard,/\/final\/i\.test/);
  assert.doesNotMatch(stats,/\/final\/i\.test/);
  assert.doesNotMatch(games,/toLowerCase\(\)\.includes\('final'\)/);
  assert.match(cards,/\/\\bFINAL\\b\|/);
  assert.match(games,/Both home teams lead 2-0 · two closeout games Friday, Oct\. 9/);
  assert.match(games,/Game 2 finals: ATL 101, NYL 98 \(OT\) · GSV 83, LVA 81/);
});


test('playoff feature uses only official WNBA media with a fallback everywhere',()=>{
  const home=text('index.html');
  const renderer=text('snack-shak-collections.js');
  const broken='GettyImages-2244598750.jpg';
  const working='1631007.png';
  assert.doesNotMatch(JSON.stringify(guide),new RegExp(broken));
  assert.match(guide.image,new RegExp(working));
  assert.match(guide.storyImage,new RegExp(working));
  assert.ok(guide.imageFallback);
  assert.ok(guide.storyImageFallback);
  assert.match(guide.playoffGameOne.highlights[0].photo,/^https:\/\/cdn\.wnba\.com\/headshots\/wnba\//);
  assert.match(guide.gameGallery.items[0].image,/^https:\/\/cdn\.wnba\.com\/headshots\/wnba\//);
  assert.doesNotMatch(home,new RegExp(broken));
  assert.match(home,new RegExp(working));
  assert.match(renderer,/imageRecovery/);
  assert.match(renderer,/storyImageFallback/);
});

test('next game label counts completed series wins rather than scheduled games',()=>{
  const source=text('snack-shak-collections.js');
  assert.match(source,/const played=Number\(row.winsA\|\|0\)\+Number\(row.winsB\|\|0\)/);
  assert.doesNotMatch(source,/const played=\(row.games\|\|\[\]\).length/);
});
