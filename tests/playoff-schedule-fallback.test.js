const test=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/competition');

function runHandler(){
  let payload;
  const req={method:'GET',query:{season:'2026'}};
  const res={
    setHeader(){},
    status(){return this;},
    json(value){payload=value;return value;}
  };
  return Promise.resolve(handler(req,res)).then(()=>payload);
}

test('published 2026 playoff fallback keeps completed series and the current slate available',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async()=>({ok:true,json:async()=>({events:[]})});
  try{
    const payload=await runHandler();
    const games=payload.playoffs.games;
    const byId=id=>games.find(game=>game.id===id);

    assert.equal(byId('1042600101').awayScore,91);
    assert.equal(byId('1042600101').homeScore,75);
    assert.equal(byId('2026-nyl-min-g2').awayTeam,'Minnesota Lynx');
    assert.equal(byId('2026-nyl-min-g2').homeTeam,'New York Liberty');
    assert.equal(byId('2026-nyl-min-g2').homeScore,87);

    const libertySeries=payload.playoffs.series.find(row=>new Set([row.teamA,row.teamB]).has('New York Liberty')&&new Set([row.teamA,row.teamB]).has('Minnesota Lynx'));
    assert.ok(libertySeries);
    assert.equal(libertySeries.winner,'New York Liberty');
    assert.equal(libertySeries.complete,true);
    assert.equal(libertySeries.targetWins,2);

    assert.equal(byId('2026-was-atl-g2').date,'2026-09-30');
    assert.equal(byId('2026-was-atl-g2').startTimeUtc,'2026-09-30T19:00:00-04:00');
    assert.deepEqual(byId('2026-was-atl-g2').broadcasts,['ESPN']);

    assert.equal(byId('2026-dal-gsv-g2').date,'2026-09-30');
    assert.equal(byId('2026-dal-gsv-g2').startTimeUtc,'2026-09-30T21:00:00-04:00');
    assert.deepEqual(byId('2026-dal-gsv-g2').broadcasts,['ESPN']);

    assert.equal(byId('2026-lva-ind-g3').date,'2026-10-01');
    assert.equal(byId('2026-lva-ind-g3').startTimeUtc,'2026-10-01T21:00:00-04:00');
    assert.ok(payload.playoffs.series.every(row=>row.round==='First Round'&&row.targetWins===2));
  }finally{
    global.fetch=originalFetch;
  }
});
