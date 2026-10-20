const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('finals-game-dashboard.json','utf8'));
test('Finals player scoring and quarter totals reconcile to both official finals',()=>{
 assert.equal(data.games.length,2);
 for(const g of data.games)for(const code of ['ATL','GSV']){
  const t=g[code];assert.equal(t.quarters.reduce((a,b)=>a+b,0),t.stats.points);
  assert.equal(t.players.reduce((a,p)=>a+p.points,0),t.stats.points);
  assert.equal(t.players.reduce((a,p)=>a+p.reboundsTotal,0),t.stats.reboundsPersonal);
 }
 const g=data.games[1],p=g.ATL.players.find(p=>p.name==='Angel Reese');
 assert.deepEqual([p.points,p.reboundsTotal],[30,16]);
 assert.equal(g.ATL.stats.points-g.GSV.stats.points,g.ATL.stats.freeThrowsMade-g.GSV.stats.freeThrowsMade);
 assert.deepEqual(g.ATL.quarters,[18,21,21,19]);
 assert.deepEqual(g.GSV.quarters,[21,16,9,19]);
});
