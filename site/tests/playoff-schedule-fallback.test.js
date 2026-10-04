const test=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/competition');

function runHandler(){
  let payload;
  const req={method:'GET',query:{season:'2026'}};
  const res={setHeader(){},status(){return this;},json(value){payload=value;return value;}};
  return Promise.resolve(handler(req,res)).then(()=>payload);
}

test('published 2026 fallback closes Round 1 and carries Atlanta-New York Game 1 final',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async()=>({ok:true,json:async()=>({events:[]})});
  try{
    const payload=await runHandler();
    const games=payload.playoffs.games;
    const game=(date,away,home)=>games.find(item=>item.date===date&&item.awayTeam===away&&item.homeTeam===home);

    const gsvCloseout=game('2026-10-02','Dallas Wings','Golden State Valkyries');
    assert.equal(gsvCloseout.homeScore,77);
    assert.equal(gsvCloseout.awayScore,73);
    assert.equal(gsvCloseout.completed,true);
    assert.deepEqual(gsvCloseout.broadcasts,['ESPN2']);

    const atlantaGameOne=game('2026-10-04','New York Liberty','Atlanta Dream');
    assert.equal(atlantaGameOne.id,'1042600201');
    assert.equal(atlantaGameOne.startTimeUtc,'2026-10-04T14:00:00-04:00');
    assert.equal(atlantaGameOne.homeScore,92);
    assert.equal(atlantaGameOne.awayScore,82);
    assert.equal(atlantaGameOne.completed,true);
    assert.equal(atlantaGameOne.status,'Final');
    assert.deepEqual(atlantaGameOne.broadcasts,['ABC']);
    assert.equal(game('2026-10-04','Las Vegas Aces','Golden State Valkyries').startTimeUtc,'2026-10-04T16:00:00-04:00');
    assert.deepEqual(game('2026-10-04','Las Vegas Aces','Golden State Valkyries').broadcasts,['Peacock','NBC']);

    assert.equal(game('2026-10-07','New York Liberty','Atlanta Dream').startTimeUtc,'2026-10-07T19:30:00-04:00');
    assert.deepEqual(game('2026-10-07','New York Liberty','Atlanta Dream').broadcasts,['ESPN']);
    assert.equal(game('2026-10-07','Las Vegas Aces','Golden State Valkyries').startTimeUtc,'2026-10-07T21:30:00-04:00');
    assert.deepEqual(game('2026-10-07','Las Vegas Aces','Golden State Valkyries').broadcasts,['Peacock','NBC Sports Network']);

    assert.equal(game('2026-10-09','Atlanta Dream','New York Liberty').startTimeUtc,'2026-10-09T19:30:00-04:00');
    assert.deepEqual(game('2026-10-09','Atlanta Dream','New York Liberty').broadcasts,['ESPN2']);
    assert.equal(game('2026-10-09','Golden State Valkyries','Las Vegas Aces').startTimeUtc,'2026-10-09T21:30:00-04:00');
    assert.deepEqual(game('2026-10-09','Golden State Valkyries','Las Vegas Aces').broadcasts,['Peacock','NBC Sports Network']);

    const firstRound=payload.playoffs.series.filter(row=>row.round==='First Round');
    const semifinals=payload.playoffs.series.filter(row=>row.round==='Semifinals');
    assert.equal(firstRound.length,4);
    assert.ok(firstRound.every(row=>row.complete&&row.targetWins===2));
    assert.equal(semifinals.length,2);
    assert.ok(semifinals.every(row=>!row.complete&&row.targetWins===3));
    const atlantaSeries=semifinals.find(row=>row.teamA==='Atlanta Dream'&&row.teamB==='New York Liberty');
    assert.equal(atlantaSeries.winsA,1);
    assert.equal(atlantaSeries.winsB,0);
    assert.equal(payload.sourceVersion,'20261004-atlanta-game-one-final-v1');
  }finally{
    global.fetch=originalFetch;
  }
});

test('published final overrides a stale provider pregame shell without losing schedule metadata',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async url=>({
    ok:true,
    json:async()=>String(url).includes('seasontype=3')?{events:[{
      id:'espn-atl-nyl-stale',date:'2026-10-04T18:00:00Z',status:{type:{state:'pre',completed:false,shortDetail:'2:00 PM'}},
      competitions:[{date:'2026-10-04T18:00:00Z',competitors:[
        {homeAway:'home',score:'0',team:{displayName:'Atlanta Dream'}},
        {homeAway:'away',score:'0',team:{displayName:'New York Liberty'}}
      ],venue:{fullName:'State Farm Arena'}}]
    }]}:{events:[]}
  });
  try{
    const payload=await runHandler();
    const game=payload.playoffs.games.find(item=>item.date==='2026-10-04'&&item.homeTeam==='Atlanta Dream'&&item.awayTeam==='New York Liberty');
    assert.equal(game.homeScore,92);
    assert.equal(game.awayScore,82);
    assert.equal(game.completed,true);
    assert.equal(game.status,'Final');
    assert.equal(game.startTimeUtc,'2026-10-04T18:00:00Z');
    assert.equal(game.venue,'State Farm Arena');
  }finally{
    global.fetch=originalFetch;
  }
});
