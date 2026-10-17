const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Game 1 final survives an unavailable upstream feed and advances only the Finals tally',async()=>{
 const source=fs.readFileSync('api/competition.js','utf8');const sandbox={module:{exports:{}},require,fetch:async()=>{throw Error('offline')},URL,Date,Set,Map,AbortController,setTimeout,clearTimeout};vm.runInNewContext(source,sandbox);
 let payload;await sandbox.module.exports({method:'GET',query:{season:'2026'}},{setHeader(){},status(){return this},json(x){payload=x}});
 const g=payload.playoffs.games.find(g=>g.id==='2026-gsv-atl-finals-g1');assert.equal(g.homeScore,68);assert.equal(g.awayScore,64);assert.equal(g.completed,true);
 const series=payload.playoffs.series.find(s=>s.round==='Finals');assert.equal(series.winsA,0);assert.equal(series.winsB,1);assert.equal(series.complete,false);
 assert.equal(payload.playoffs.games.filter(g=>g.round==='Finals'&&!g.completed)[0].date,'2026-10-19');
});
