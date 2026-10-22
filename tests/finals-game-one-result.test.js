const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Games 1–3 survive an unavailable upstream feed and advance only the Finals tally',async()=>{
 const source=fs.readFileSync('api/competition.js','utf8');const sandbox={module:{exports:{}},require,fetch:async()=>{throw Error('offline')},URL,Date,Set,Map,AbortController,setTimeout,clearTimeout};vm.runInNewContext(source,sandbox);
 let payload;await sandbox.module.exports({method:'GET',query:{season:'2026'}},{setHeader(){},status(){return this},json(x){payload=x}});
 const g=payload.playoffs.games.find(g=>g.id==='2026-gsv-atl-finals-g1');assert.equal(g.homeScore,68);assert.equal(g.awayScore,64);assert.equal(g.completed,true);
 const g2=payload.playoffs.games.find(g=>g.gameNumber===2&&g.round==='Finals');assert.equal(g2.homeScore,65);assert.equal(g2.awayScore,79);assert.equal(g2.completed,true);assert.equal(payload.playoffs.games.find(g=>g.gameNumber===5&&g.round==='Finals').ifNecessary,false);
 const g3=payload.playoffs.games.find(g=>g.gameNumber===3&&g.round==='Finals');assert.equal(g3.homeScore,97);assert.equal(g3.awayScore,71);assert.equal(g3.completed,true);
 const series=payload.playoffs.series.find(s=>s.round==='Finals');assert.equal(series.teamA,'Atlanta Dream');assert.equal(series.winsA,2);assert.equal(series.winsB,1);assert.equal(series.complete,false);
 assert.equal(payload.playoffs.games.filter(g=>g.round==='Finals'&&!g.completed)[0].date,'2026-10-24');
});
