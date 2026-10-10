const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8');
const guide=JSON.parse(read('snack-shak-latest.json')).posts.find(p=>p.slug==='the-playoff-watch-party-2026');
test('both closeouts feed a zero-win Finals matchup without carrying semifinal wins',()=>{
 assert.equal(guide.updated,'2026-10-10');
 const rows=guide.playoffWatch.matchups;
 assert.equal(rows.find(r=>r.roundKey==='Finals').series,'0-0');
 assert.deepEqual(rows.filter(r=>r.roundKey==='Semifinals').map(r=>r.series),['3-0','3-0']);
 for(const file of ['api/competition.js','playoff-bracket.js','global-scoreboard.js']){
  const s=read(file);
  assert.match(s,/id:'1042600203'.*homeScore:83,awayScore:85.*completed:true/);
  assert.match(s,/id:'1042600213'.*homeScore:77,awayScore:87.*Final\/OT.*completed:true/);
  assert.match(s,/2026-gsv-atl-finals-g1.*2026-10-17.*Golden State Valkyries.*Atlanta Dream/);
  assert.doesNotMatch(s,/2026-(?:nyl-atl|lva-gsv)-sf-g4|2026-(?:atl-nyl|gsv-lva)-sf-g5/);
 }
});
test('main and homepage use verified Game 3 action with credit and official source',()=>{
 assert.equal(guide.image,guide.storyImage);
 assert.match(guide.image,/2026-10-09_Jeff-Bottari_NBAE/);
 assert.match(guide.storyImageCaption,/Jeff Bottari\/NBAE/);
 assert.match(guide.storyImageSourceUrl,/aces\.wnba\.com.*10-9-2026/);
 assert.match(guide.imageAlt,/October 9, 2026/);
 assert.match(JSON.stringify(guide.sections),/500 career playoff points/);
 assert.match(read('homepage-fresh-stories.js'),/image/);
});
test('finalist audit keeps eliminated roster receipts but counts only surviving teams',()=>{
 const s=read('draft-class-rankings.js');
 assert.match(s,/Las Vegas Aces',\s+status: 'ELIMINATED/);
 assert.match(s,/New York Liberty',\s+status: 'ELIMINATED/);
 assert.match(s,/filter\(team => team.status === 'FINALS'\)/);
 assert.match(read('wnba-draft-class-rankings.html'),/<b>2<\/b> teams alive now/);
});
