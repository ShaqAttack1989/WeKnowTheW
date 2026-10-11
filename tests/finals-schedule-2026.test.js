const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Finals schedule has all seven official Eastern tip times and conditional games',()=>{
 for(const file of ['playoff-bracket.js','api/competition.js']){
  const text=fs.readFileSync(file,'utf8');
  const rows=text.match(/\{id:'2026-gsv-atl-finals-g\d'[^\n]+?\}/g);
  assert.equal(rows.length,7);
  rows.forEach((row,i)=>{
   assert.ok(row.includes(i===0||i===3?'T15:30:00-04:00':'T20:00:00-04:00'));
   assert.ok(row.includes(i===0||i===3?"['NBC','Peacock']":"['USA','Peacock']"));
   assert.ok(row.includes(`ifNecessary:${i>=4}`));
  });
 }
 const data=JSON.parse(fs.readFileSync('snack-shak-latest.json','utf8'));
 const guide=data.posts.find(p=>p.slug==='the-playoff-watch-party-2026');
 assert.match(guide.playoffWatch.matchups[0].nextGame,/3:30 PM ET.*NBC \/ Peacock/);
 assert.equal(fs.readFileSync('snack-shak-latest.json','utf8'),fs.readFileSync('site/snack-shak-latest.json','utf8'));
});
