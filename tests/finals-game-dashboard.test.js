const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('finals-game-dashboard.json','utf8'));
test('Finals player scoring and quarter totals reconcile to all official finals',()=>{
 assert.equal(data.games.length,3);
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
 const game3=data.games[2];
 assert.equal(game3.date,'October 21, 2026');
 assert.equal(game3.source,'https://cdn.wnba.com/static/json/liveData/boxscore/boxscore_1042600303.json');
 assert.deepEqual(game3.ATL.quarters,[23,23,25,26]);
 assert.deepEqual(game3.GSV.quarters,[15,25,17,14]);
 assert.deepEqual([game3.ATL.stats.points,game3.GSV.stats.points],[97,71]);
 assert.deepEqual([game3.ATL.stats.pointsInThePaint,game3.GSV.stats.pointsInThePaint],[44,20]);
 assert.deepEqual([game3.ATL.stats.turnoversTotal,game3.GSV.stats.turnoversTotal],[10,17]);
 const reese=game3.ATL.players.find(p=>p.name==='Angel Reese');
 assert.deepEqual([reese.points,reese.reboundsTotal,reese.three],[21,12,'2-2']);
});
