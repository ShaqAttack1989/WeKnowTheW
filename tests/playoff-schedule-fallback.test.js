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

test('published 2026 playoff openers supply the correct Eastern tip times and networks',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async()=>({ok:true,json:async()=>({events:[]})});
  try{
    const payload=await runHandler();
    const games=Object.fromEntries(payload.playoffs.games.map(game=>[`${game.awayTeam} at ${game.homeTeam}`,game]));
    assert.deepEqual(
      [
        games['New York Liberty at Minnesota Lynx'].startTimeUtc,
        games['Indiana Fever at Las Vegas Aces'].startTimeUtc,
        games['Washington Mystics at Atlanta Dream'].startTimeUtc,
        games['Dallas Wings at Golden State Valkyries'].startTimeUtc
      ],
      [
        '2026-09-27T14:00:00-04:00',
        '2026-09-27T16:00:00-04:00',
        '2026-09-27T19:00:00-04:00',
        '2026-09-27T21:00:00-04:00'
      ]
    );
    assert.deepEqual(games['Indiana Fever at Las Vegas Aces'].broadcasts,['ABC']);
    assert.deepEqual(games['Washington Mystics at Atlanta Dream'].broadcasts,['Prime Video']);
    assert.deepEqual(games['Dallas Wings at Golden State Valkyries'].broadcasts,['USA']);
    assert.equal(games['New York Liberty at Minnesota Lynx'].awayScore,91);
    assert.equal(games['New York Liberty at Minnesota Lynx'].homeScore,75);
    assert.equal(games['Indiana Fever at Las Vegas Aces'].homeScore,102);
    assert.ok(Object.values(games).every(game=>game.completed&&game.status==='Final'));
    assert.equal(payload.playoffs.series.length,4);
    assert.ok(payload.playoffs.series.every(row=>row.round==='First Round'&&row.targetWins===2));
  }finally{
    global.fetch=originalFetch;
  }
});
