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

test('published 2026 playoff fallback carries completed games and both current deciders',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async()=>({ok:true,json:async()=>({events:[]})});
  try{
    const payload=await runHandler();
    const games=payload.playoffs.games;
    const game=(date,away,home)=>games.find(item=>item.date===date&&item.awayTeam===away&&item.homeTeam===home);
    const openers=[
      game('2026-09-27','New York Liberty','Minnesota Lynx'),
      game('2026-09-27','Indiana Fever','Las Vegas Aces'),
      game('2026-09-27','Washington Mystics','Atlanta Dream'),
      game('2026-09-27','Dallas Wings','Golden State Valkyries')
    ];
    assert.deepEqual(
      openers.map(item=>item.startTimeUtc),
      [
        '2026-09-27T14:00:00-04:00',
        '2026-09-27T16:00:00-04:00',
        '2026-09-27T19:00:00-04:00',
        '2026-09-27T21:00:00-04:00'
      ]
    );
    assert.deepEqual(openers[1].broadcasts,['ABC']);
    assert.deepEqual(openers[2].broadcasts,['Prime Video']);
    assert.deepEqual(openers[3].broadcasts,['USA']);
    assert.equal(openers[0].awayScore,91);
    assert.equal(openers[0].homeScore,75);
    assert.equal(openers[1].homeScore,102);
    assert.equal(game('2026-09-30','Atlanta Dream','Washington Mystics').awayScore,93);
    assert.equal(game('2026-09-30','Golden State Valkyries','Dallas Wings').homeScore,108);
    assert.deepEqual(game('2026-10-01','Indiana Fever','Las Vegas Aces').broadcasts,['USA','CNBC']);
    assert.deepEqual(game('2026-10-02','Dallas Wings','Golden State Valkyries').broadcasts,['ESPN2']);
    assert.equal(payload.playoffs.series.length,4);
    assert.ok(payload.playoffs.series.every(row=>row.round==='First Round'&&row.targetWins===2));
    assert.equal(payload.playoffs.series.filter(row=>row.complete).length,2);
    assert.equal(payload.playoffs.series.filter(row=>!row.complete).length,2);
  }finally{
    global.fetch=originalFetch;
  }
});
