const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('2026 Finals schedule matches the latest WNBA schedule in every shared source',()=>{
 const expected=[
  {date:'2026-10-17',time:'2026-10-17T15:30:00-04:00',broadcasts:['NBC','Peacock'],ifNecessary:false},
  {date:'2026-10-19',time:'2026-10-19T20:00:00-04:00',broadcasts:['USA','Peacock','CNBC'],ifNecessary:false},
  {date:'2026-10-21',time:'2026-10-21T20:00:00-04:00',broadcasts:['USA','Peacock','CNBC'],ifNecessary:false},
  {date:'2026-10-24',time:'2026-10-24T13:00:00-04:00',broadcasts:['NBC','Peacock'],ifNecessary:false},
  {date:'2026-10-26',time:'2026-10-26T20:00:00-04:00',broadcasts:['USA','Peacock','CNBC'],ifNecessary:false},
  {date:'2026-10-29',time:'2026-10-29T20:00:00-04:00',broadcasts:['USA','Peacock','CNBC'],ifNecessary:true},
  {date:'2026-10-31',time:'2026-10-31T20:00:00-04:00',broadcasts:['USA','Peacock','CNBC'],ifNecessary:true}
 ];
 for(const file of ['playoff-bracket.js','site/playoff-bracket.js','api/competition.js','global-scoreboard.js']){
  const source=fs.readFileSync(file,'utf8');
  const rows=source.match(/\{id:'2026-gsv-atl-finals-g\d'[^\n]+?\}/g);
  assert.equal(rows.length,7,file);
  rows.forEach((row,i)=>{
   assert.ok(row.includes(`date:'${expected[i].date}'`),`${file} game ${i+1} date`);
   assert.ok(row.includes(`startTimeUtc:'${expected[i].time}'`),`${file} game ${i+1} time`);
   assert.ok(row.includes(`broadcasts:[${expected[i].broadcasts.map(x=>`'${x}'`).join(',')}]`),`${file} game ${i+1} broadcast`);
   assert.ok(row.includes(`ifNecessary:${expected[i].ifNecessary}`),`${file} game ${i+1} conditional status`);
  });
 }
 const data=JSON.parse(fs.readFileSync('snack-shak-latest.json','utf8'));
 const guide=data.posts.find(p=>p.slug==='the-playoff-watch-party-2026');
 assert.equal(guide.updated,'2026-10-19');
 assert.match(guide.sections.find(s=>s.title==='The Finals watch schedule').paragraphs.join(' '),/Game 3: Wed\., Oct\. 21, 8 p\.m\./);
 assert.match(guide.sections.find(s=>s.title==='The Finals watch schedule').paragraphs.join(' '),/Game 4: Sat\., Oct\. 24, 1 p\.m\./);
 assert.match(guide.sections.find(s=>s.title==='The Finals watch schedule').paragraphs.join(' '),/Game 6.*venue.*TBD/i);
 const scheduleGraphic=guide.finalsGraphic.items.find(item=>item.image==='assets/photos/wnba-finals-schedule-2026.jpg');
 assert.ok(scheduleGraphic,'uploaded schedule graphic is included in the Finals article');
 assert.ok(fs.existsSync(scheduleGraphic.image),'uploaded schedule image exists at article path');
 assert.ok(guide.sources.some(s=>s.url==='https://www.wnba.com/news/wnba-finals-games3-and-4-to-be-played-at-state-farm-arena'));
 assert.deepEqual(guide,JSON.parse(fs.readFileSync('site/snack-shak-latest.json','utf8')).posts.find(p=>p.slug===guide.slug));
 const dashboardVersion='20261019-finals-game2-v1';
 const siteSource=fs.readFileSync('site.js','utf8');
 assert.ok(siteSource.includes(`global-scoreboard.js?v=${dashboardVersion}`),'global scoreboard asset is cache-busted');
 for(const page of ['index.html','games.html','live-stats.html']){
  assert.ok(fs.readFileSync(page,'utf8').includes(`/site.js?v=${dashboardVersion}`),`${page} refreshes the shared game dashboard loader`);
 }
 assert.ok(fs.readFileSync('index.html','utf8').includes(`/playoff-bracket.js?v=${dashboardVersion}`),'homepage bracket asset is cache-busted');
});
