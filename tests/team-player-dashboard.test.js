const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../team-player-dashboard-model');
const { teamPlayerTotals } = require('../api/team-playoff-player-totals')._test;
const { fetchPlayoffTotals } = require('../lib/team-player-totals');
const root = path.resolve(__dirname, '..');

test('resolves team names and official abbreviations to the same dashboard code', () => {
  assert.equal(model.teamCode('Atlanta Dream'), 'ATL');
  assert.equal(model.teamCode('atl'), 'ATL');
  assert.equal(model.teamCode('Phoenix Mercury'), 'PHO');
  assert.equal(model.teamCode('PHX'), 'PHO');
  for (const [club, code] of Object.entries(require('../team-stat-leaders-model').codes)) assert.equal(model.teamCode(club), code);
});

test('builds team-only player rows and calculates per-game and shooting rates', () => {
  const result = model.build('Atlanta Dream', [
    { name: 'Rhyne Howard', team: 'ATL', g: 4, mp: 100, pts: 80, trb: 20, ast: 12, stl: 4, blk: 2, fg: 28, fga: 60, fg3: 12, fg3a: 30, ft: 12, fta: 15 },
    { name: 'All-team row', team: '2TM', g: 10, mp: 200, pts: 150 },
    { name: 'Same name, other team', team: 'NYL', g: 10, mp: 200, pts: 200 },
    { name: 'No games', team: 'ATL', g: 0, mp: 0, pts: 0 }
  ]);

  assert.equal(result.code, 'ATL');
  assert.equal(result.players.length, 1);
  assert.equal(result.players[0].ptsPerGame, 20);
  assert.equal(result.players[0].mpPerGame, 25);
  assert.equal(result.players[0].fgPct, 28 / 60);
  assert.equal(result.players[0].fg3Pct, 0.4);
  assert.equal(result.players[0].ftPct, 0.8);
});

test('sorts and filters the current team rows without changing the source array', () => {
  const players = model.build('Atlanta Dream', [
    { name: 'Player A', team: 'ATL', g: 5, pts: 50, ast: 10 },
    { name: 'Player B', team: 'ATL', g: 5, pts: 75, ast: 5 }
  ]).players;
  const points = model.sortPlayers(players, 'pts', 'perGame');

  assert.deepEqual(points.map(player => player.name), ['Player B', 'Player A']);
  assert.deepEqual(model.searchPlayers(players, 'player a').map(player => player.name), ['Player A']);
  assert.deepEqual(players.map(player => player.name), ['Player A', 'Player B']);
});

test('normalizes provider player totals to the dashboard format', () => {
  assert.deepEqual(teamPlayerTotals({
    name: 'A’ja Wilson', team: 'LVA', games: 6, minutes: 219.9, pts: 165, trb: 56,
    ast: 8, stl: 8, blk: 9, tov: 11, fgm: 54, fga: 104, fg3m: 5, fg3a: 13,
    ftm: 52, fta: 63, plusMinus: 7
  }), {
    name: 'A’ja Wilson', team: 'LVA', g: 6, mp: 219.9, pts: 165, trb: 56, ast: 8,
    stl: 8, blk: 9, tov: 11, fg: 54, fga: 104, fg3: 5, fg3a: 13,
    ft: 52, fta: 63, plusMinus: 7
  });
  assert.deepEqual(teamPlayerTotals({
    name: 'Rhyne Howard', team: 'ATL', g: 4, mp: 140, pts: 72, trb: 20,
    ast: 12, stl: 4, blk: 2, fg: 26, fga: 60, fg3: 12, fg3a: 30, ft: 8, fta: 10
  }), {
    name: 'Rhyne Howard', team: 'ATL', g: 4, mp: 140, pts: 72, trb: 20,
    ast: 12, stl: 4, blk: 2, tov: undefined, fg: 26, fga: 60, fg3: 12,
    fg3a: 30, ft: 8, fta: 10, plusMinus: undefined
  });
});

test('aggregates completed ESPN playoff boxscores and skips regular-season and scheduled games', async () => {
  const requested=[];
  const event=(id,headline,date='2026-10-17T19:30:00Z',completed=true,teams=['Atlanta Dream','Golden State Valkyries'])=>({
    id,date,status:{type:{state:completed?'post':'pre',completed,shortDetail:completed?'Final':'Scheduled'}},
    competitions:[{notes:[{headline}],competitors:teams.map(displayName=>({team:{displayName}}))}]
  });
  const scoreboard={events:[
    event('401918305','WNBA Finals - Game 1'),
    event('401918306','WNBA Finals - Game 2'),
    event('401918307','WNBA Finals - Game 3','2026-10-22T00:00:00Z',false),
    event('401918199','Regular Season','2026-09-25T00:00:00Z',true)
  ]};
  const keys=['minutes','points','fieldGoalsMade-fieldGoalsAttempted','threePointFieldGoalsMade-threePointFieldGoalsAttempted','freeThrowsMade-freeThrowsAttempted','rebounds','assists','turnovers','steals','blocks','plusMinus'];
  const player=(name,id,points,minutes='20.5')=>({athlete:{id,displayName:name},stats:[minutes,String(points),'4-8','2-4','2-3','4','3','1','2','1','5']});
  const summary=(atlPlayers,gsvPlayers)=>({boxscore:{players:[
    {team:{displayName:'Atlanta Dream'},statistics:[{keys,athletes:atlPlayers}]},
    {team:{displayName:'Golden State Valkyries'},statistics:[{keys,athletes:gsvPlayers}]}
  ]}});
  const boxscores={
    '401918305':summary([player('Rhyne Howard',1631009,12),player('DNP Player',101,0,'0')],[player('Player Valkyrie',202,9)]),
    '401918306':summary([player('Rhyne Howard',1631009,15),player('Allisha Gray',1628277,7)],[player('Player Valkyrie',202,11)])
  };
  const payload=await fetchPlayoffTotals(async url=>{
    requested.push(url);
    if(url.includes('/scoreboard?'))return{ok:true,json:async()=>scoreboard};
    const id=url.match(/summary\?event=(\d+)$/)?.[1];
    return{ok:true,json:async()=>boxscores[id]};
  },50,2026,'ATL');

  assert.equal(payload.seasonType,'Playoffs');
  assert.equal(payload.source,'ESPN boxscores');
  assert.equal(payload.gamesIncluded,2);
  assert.match(requested[0],/dates=2026/);
  assert.deepEqual(requested.slice(1).map(url=>url.match(/summary\?event=(\d+)$/)?.[1]),['401918305','401918306']);
  const rhy=payload.players.find(row=>row.name==='Rhyne Howard');
  assert.equal(rhy.team,'ATL');
  assert.equal(rhy.g,2);
  assert.equal(rhy.mp,41);
  assert.equal(rhy.pts,27);
  assert.equal(rhy.fg,8);
  assert.equal(rhy.fg3,4);
  assert.equal(payload.players.find(row=>row.name==='Allisha Gray').g,1);
  assert.equal(payload.players.some(row=>row.name==='DNP Player'),false);
});

test('does not include postseason games from a different year', async () => {
  const requested=[];
  const payload=await fetchPlayoffTotals(async url=>{
    requested.push(url);
    return{ok:true,json:async()=>({events:[{
      id:'401918305',date:'2026-10-17T19:30:00Z',status:{type:{state:'post',completed:true,shortDetail:'Final'}},
      competitions:[{notes:[{headline:'WNBA Finals - Game 1'}],competitors:[{team:{displayName:'Atlanta Dream'}},{team:{displayName:'Golden State Valkyries'}}]}]
    }]})};
  },50,2025,'ATL');

  assert.equal(payload.gamesIncluded,0);
  assert.deepEqual(requested.length,1);
  assert.match(requested[0],/dates=2025/);
});

test('requests boxscores only for the selected team to keep the dashboard feed small', async () => {
  const requested=[];
  const event=(id,headline,teams)=>({id,date:'2026-10-17T19:30:00Z',status:{type:{state:'post',completed:true,shortDetail:'Final'}},competitions:[{notes:[{headline}],competitors:teams.map(displayName=>({team:{displayName}}))}]});
  const scoreboard={events:[
    event('401918305','WNBA Finals - Game 1',['Atlanta Dream','Golden State Valkyries']),
    event('401918299','WNBA Semifinals - Game 3',['New York Liberty','Atlanta Dream']),
    event('401918300','WNBA Semifinals - Game 3',['Golden State Valkyries','Las Vegas Aces'])
  ]};
  const payload=await fetchPlayoffTotals(async url=>{
    requested.push(url);
    if(url.includes('/scoreboard?'))return{ok:true,json:async()=>scoreboard};
    return{ok:true,json:async()=>({boxscore:{players:[]}})};
  },50,2026,'atl');

  assert.equal(payload.gamesIncluded,2);
  assert.deepEqual(requested.slice(1).map(url=>url.match(/summary\?event=(\d+)$/)?.[1]),['401918305','401918299']);
});

function dashboardClient({ delayRegular = false } = {}) {
  const nodes = {}, fetchCalls = [], timers = [];
  const element = id => nodes[id] || (nodes[id] = {
    textContent: '', innerHTML: '', hidden: false, disabled: false, value: '', handlers: {},
    classList: { add(name) { this[name] = true; }, toggle(name, value) { this[name] = value; } },
    setAttribute(key, value) { this[key] = value; },
    addEventListener(type, fn) { this.handlers[type] = fn; }
  });
  const regular = { players: [
    { name: 'Rhyne Howard', team: 'ATL', g: 10, mp: 300, pts: 190, trb: 50, ast: 30, fg: 70, fga: 150, fg3: 30, fg3a: 70, ft: 20, fta: 25 },
    { name: 'Allisha Gray', team: 'ATL', g: 10, mp: 280, pts: 160, trb: 40, ast: 40, fg: 60, fga: 135, fg3: 20, fg3a: 60, ft: 20, fta: 24 }
  ], checkedAt: '2026-10-22T18:00:00.000Z' };
  const playoffs = { players: [
    { name: 'Rhyne Howard', team: 'ATL', g: 4, mp: 140, pts: 72, trb: 20, ast: 12, fg: 26, fga: 60, fg3: 12, fg3a: 30, ft: 8, fta: 10 },
    { name: 'Allisha Gray', team: 'ATL', g: 4, mp: 136, pts: 80, trb: 24, ast: 16, fg: 28, fga: 58, fg3: 10, fg3a: 25, ft: 14, fta: 16 }
  ], checkedAt: '2026-10-22T18:10:00.000Z' };
  let releaseRegular;
  const context = {
    module: { exports: {} },
    require: request => request === './team-player-dashboard-model' ? model : require(request),
    URLSearchParams,
    AbortController,
    location: { search: '?team=atlanta-dream' },
    document: { getElementById: element, hidden: false, addEventListener() {} },
    setTimeout, clearTimeout,
    setInterval(fn) { timers.push(fn); },
    teamBySlug: () => ({ name: 'Atlanta Dream' }),
    fetch: url => {
      fetchCalls.push(url);
      const payload = url.includes('team-playoff-player-totals') ? playoffs : regular;
      if (delayRegular && url.includes('team-player-totals')) return new Promise(resolve => { releaseRegular = () => resolve({ ok: true, json: async () => payload }); });
      return Promise.resolve({ ok: true, json: async () => payload });
    }
  };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'team-player-dashboard.js'), 'utf8'), context);
  context.module.exports.start();
  return {
    nodes, fetchCalls, timers, releaseRegular,
    settle: () => new Promise(resolve => setImmediate(resolve))
  };
}

test('team page switches between regular-season and playoff totals, sorts and searches players', async () => {
  const client = dashboardClient();
  await client.settle();
  assert.match(client.fetchCalls[0], /team-player-totals\?season=2026/);
  assert.match(client.nodes.tpdRows.innerHTML, /Rhyne Howard/);
  assert.match(client.nodes.tpdRows.innerHTML, /19\.0/);

  client.nodes.tpdPlayoffs.handlers.click();
  assert.match(client.nodes.tpdStatus.textContent, /Loading playoffs player statistics/);
  assert.match(client.nodes.tpdRows.innerHTML, /Loading player stats/);
  await client.settle();
  assert.match(client.fetchCalls[1], /team-playoff-player-totals\?season=2026/);
  assert.match(client.fetchCalls[1], /team=ATL/);
  assert.ok(client.nodes.tpdRows.innerHTML.indexOf('Allisha Gray') < client.nodes.tpdRows.innerHTML.indexOf('Rhyne Howard'));

  client.nodes.tpdMode.value = 'totals';
  client.nodes.tpdMode.handlers.change();
  assert.match(client.nodes.tpdPtsHeading.textContent, /PTS/);
  assert.match(client.nodes.tpdRows.innerHTML, />80</);

  client.nodes.tpdSearch.value = 'Rhyne';
  client.nodes.tpdSearch.handlers.input();
  assert.match(client.nodes.tpdRows.innerHTML, /Rhyne Howard/);
  assert.doesNotMatch(client.nodes.tpdRows.innerHTML, /Allisha Gray/);
});

test('changing the selected season while a feed is loading fetches the newly selected feed', async () => {
  const client = dashboardClient({ delayRegular: true });
  client.nodes.tpdPlayoffs.handlers.click();
  client.releaseRegular();
  await client.settle();
  await client.settle();
  assert.equal(client.fetchCalls.length, 2);
  assert.match(client.fetchCalls[1], /team-playoff-player-totals\?season=2026/);
  assert.match(client.fetchCalls[1], /team=ATL/);
  assert.match(client.nodes.tpdRows.innerHTML, /Allisha Gray/);
});
