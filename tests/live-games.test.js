const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

const handler=require('../api/live-games');

function jsonResponse(value){return {ok:true,status:200,json:async()=>value};}
function runHandler(){
  return new Promise((resolve,reject)=>{
    const res={
      headers:{},
      setHeader(name,value){this.headers[name]=value;},
      status(code){this.statusCode=code;return this;},
      json(payload){resolve({statusCode:this.statusCode,headers:this.headers,payload});return payload;}
    };
    Promise.resolve(handler({method:'GET'},res)).catch(reject);
  });
}

test('official WNBA today scoreboard survives ESPN and schedule failures',async()=>{
  const originalFetch=global.fetch,urls=[];
  global.fetch=async url=>{
    urls.push(String(url));
    if(String(url).includes('todaysScoreboard_10.json'))return jsonResponse({scoreboard:{games:[{
      gameId:'1022600297',gameTimeUTC:'2026-08-30T19:00:00Z',gameStatus:2,gameStatusText:'Q2 :51.2',period:2,gameClock:'PT00M51.20S',
      awayTeam:{teamCity:'Minnesota',teamName:'Lynx',score:39},homeTeam:{teamCity:'Atlanta',teamName:'Dream',score:49},arena:{arenaName:'Gateway Center Arena @ College Park'}
    }]}});
    if(String(url).includes('cdn.espn.com'))return {ok:false,status:503,json:async()=>({})};
    if(String(url).includes('site.api.espn.com'))return {ok:false,status:403,json:async()=>({})};
    if(String(url).includes('scheduleLeagueV2_10.json'))return {ok:true,status:200,json:async()=>{throw new SyntaxError('Unexpected token <');}};
    throw new Error(`Unexpected URL ${url}`);
  };
  try{
    const result=await runHandler();
    assert.equal(result.statusCode,200);
    assert.equal(result.payload.liveStatusVerified,true);
    assert.equal(result.payload.games.length,1);
    assert.equal(result.payload.games[0].awayTeam,'Minnesota Lynx');
    assert.equal(result.payload.games[0].homeTeam,'Atlanta Dream');
    assert.equal(result.payload.games[0].state,'in');
    assert.equal(urls.find(url=>url.includes('todaysScoreboard_10.json')).includes('?'),false);
    assert.equal(urls.find(url=>url.includes('scheduleLeagueV2_10.json')).includes('?'),false);
  }finally{global.fetch=originalFetch;}
});

test('ESPN CDN reports the live game when hosting blocks the WNBA and ESPN API hosts',async()=>{
  const originalFetch=global.fetch;
  global.fetch=async url=>{
    if(String(url).includes('cdn.espn.com'))return jsonResponse({content:{sbData:{events:[{
      id:'401857186',date:'2026-08-30T19:00Z',status:{period:4,displayClock:'6:32',type:{state:'in',completed:false,shortDetail:'6:32 - 4th'}},competitions:[{venue:{fullName:'Gateway Center'},competitors:[
        {homeAway:'home',score:'76',team:{displayName:'Atlanta Dream'}},{homeAway:'away',score:'66',team:{displayName:'Minnesota Lynx'}}
      ]}]
    }]}}});
    if(String(url).includes('site.api.espn.com'))return {ok:false,status:403,json:async()=>({})};
    return {ok:true,status:200,json:async()=>{throw new SyntaxError('Unexpected token <');}};
  };
  try{
    const result=await runHandler();
    assert.equal(result.payload.liveStatusVerified,true);
    assert.equal(result.payload.games.length,1);
    assert.deepEqual({away:result.payload.games[0].awayTeam,home:result.payload.games[0].homeTeam,awayScore:result.payload.games[0].awayScore,homeScore:result.payload.games[0].homeScore},{away:'Minnesota Lynx',home:'Atlanta Dream',awayScore:66,homeScore:76});
  }finally{global.fetch=originalFetch;}
});

test('games page preserves a valid fallback when the dedicated feed is unverified',()=>{
  const source=fs.readFileSync(path.join(__dirname,'..','games-page.js'),'utf8');
  assert.match(source,/return fresh\.length\|\|payload\.liveStatusVerified===true\?fresh:/);
  assert.match(source,/mergeVerifiedLive\(stats\.liveGames,liveResult\.value\)/);
  assert.match(source,/mergeVerifiedLive\(gamesPayload\.liveGames,payload\)/);
  assert.match(fs.readFileSync(path.join(__dirname,'..','game-cards.js'),'utf8'),/cdn\.espn\.com\/core\/wnba\/scoreboard/);
});
