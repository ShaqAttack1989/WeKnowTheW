const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const text=file=>fs.readFileSync(path.join(root,file),'utf8');
const latest=JSON.parse(text('snack-shak-latest.json'));
const guide=latest.posts.find(post=>post.slug==='the-playoff-watch-party-2026');

test('playoff watch guide is refreshed for the two remaining Game 3s',()=>{
  assert.ok(guide);
  assert.equal(guide.updated,'2026-10-01');
  assert.match(guide.title,/Two Game 3s/);
  assert.equal(guide.playoffWatch.matchups.length,3);
  assert.deepEqual(guide.playoffWatch.matchups.map(item=>item.id),['lva-ind','gsv-dal','atl-nyl']);
  assert.equal(guide.playoffWatch.matchups.filter(item=>item.series==='1-1').length,2);
  assert.equal(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').roundKey,'Semifinals');
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='atl-nyl').roundLabel,/BEST OF 5/);
});

test('record, game imagery and award fallout are explicit',()=>{
  const values=guide.playoffGameOne.receipts.map(item=>item.value);
  assert.ok(values.includes('45'));
  assert.ok(values.includes('4.1'));
  assert.ok(values.includes('15 AST'));
  assert.equal(guide.gameGallery.items.length,3);
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
  assert.match(renderer,/summaryValue\('game3s'/);
  assert.match(renderer,/playoffGalleryMarkup\(post\.gameGallery\)/);
  assert.match(renderer,/playoffAwardFalloutMarkup\(post\.awardFallout\)/);
  assert.match(renderer,/atl-nyl/);
});

test('fallback feeds carry every completed Game 2 and both deciding games',()=>{
  const competition=text('api/competition.js');
  const bracket=text('playoff-bracket.js');
  for(const source of [competition,bracket]){
    assert.match(source,/homeTeam:'Washington Mystics',awayTeam:'Atlanta Dream',homeScore:75,awayScore:93/);
    assert.match(source,/homeTeam:'Dallas Wings',awayTeam:'Golden State Valkyries',homeScore:108,awayScore:100/);
    assert.match(source,/2026-lva-ind-g3/);
    assert.match(source,/2026-gsv-dal-g3/);
    assert.match(source,/2026-atl-nyl-sf-g1/);
  }
  assert.match(bracket,/snapshot\?\.winner\|\|\(aWins>=target/);
  assert.match(competition,/2026-10-02T21:00:00-04:00/);
  assert.match(guide.playoffWatch.matchups.find(item=>item.id==='gsv-dal').nextGame,/9:00 PM ET/);
});
