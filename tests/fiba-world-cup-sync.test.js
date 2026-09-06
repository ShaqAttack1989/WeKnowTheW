const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const handlerPath = path.join(__dirname, '..', 'api', 'fiba-world-cup.js');

function responseMock() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return value; }
  };
}

function html(text) {
  return '<html><body>' + text + '</body></html>';
}

function standingsText({
  jpn='0/0 0', mli='0/0 0', aus='0/0 0', pur='0/0 0',
  kor='0/0 0', ngr='0/0 0', usa='0/0 0', chn='0/0 0'
}={}) {
  return html('Standings Group A JPN ' + jpn + ' ESP 0/0 0 GER 0/0 0 MLI ' + mli +
    ' Group B HUN 0/0 0 KOR ' + kor + ' NGR ' + ngr + ' FRA 0/0 0' +
    ' Group C BEL 0/0 0 AUS ' + aus + ' PUR ' + pur + ' TUR 0/0 0' +
    ' Group D USA ' + usa + ' CZE 0/0 0 ITA 0/0 0 CHN ' + chn);
}

const finalGames = html(
  'Group Phase · Group A Final JPN JPN 102 MLI MLI 97 ' +
  'Group Phase · Group C Final AUS AUS 70 PUR PUR 54'
);

const dailyGameCenter = html(
  'JPN 102 - 97 MLI ' +
  'AUS 70 - 54 PUR ' +
  'Group Phase · Group D Final USA USA 94 CHN CHN 61 ' +
  'Group Phase · Group B Final KOR KOR 99 NGR NGR 81'
);

async function runDashboard({standings, stats=html('No USA player stats yet'), teamStats=null}) {
  delete require.cache[require.resolve(handlerPath)];
  const originalFetch = global.fetch;
  global.fetch = async url => {
    const value = String(url);
    if (value.endsWith('/standings')) return { ok: true, text: async () => standings };
    if (value.endsWith('/games')) return { ok: true, text: async () => finalGames };
    if (value.endsWith('/stats')) return { ok: true, text: async () => stats };
    if (value.includes('getgdapcompetitionteamstatisticsbyteamid')) {
      return teamStats
        ? { ok: true, json: async () => teamStats }
        : { ok: false, status: 404, json: async () => ({}) };
    }
    if (value.includes('/news/2026-wwc-game-center-sep-4')) return { ok: true, text: async () => dailyGameCenter };
    if (value.includes('/games/128116-JPN-MLI')) return { ok: true, text: async () => html('🇯🇵 Saki Hayashi (26 PTS) | TCL Player Of The Game | JPN v MLI | FIBA Women\'s World Cup 2026') };
    if (value.includes('/games/128129-AUS-PUR')) return { ok: true, text: async () => html('🇦🇺 Steph Talbot (19 PTS) | TCL Player Of The Game | AUS v PUR | FIBA Women\'s World Cup 2026') };
    if (value.includes('/games/128134-USA-CHN')) return { ok: true, text: async () => html('🇺🇸 Caitlin Clark (14 PTS, 11 AST) | TCL Player Of The Game | USA v CHN | FIBA Women\'s World Cup 2026') };
    if (value.includes('/games/128123-KOR-NGR')) return { ok: true, text: async () => html('🇰🇷 Jihyun Park (27 PTS) | TCL Player Of The Game | KOR v NGR | FIBA Women\'s World Cup 2026') };
    if (value.includes('fiba-womens-basketball-world-cup-2026')) return { ok: true, text: async () => finalGames };
    return { ok: false, status: 404, text: async () => '' };
  };
  try {
    const handler = require(handlerPath);
    const res = responseMock();
    await handler({ method: 'GET' }, res);
    return res.body;
  } finally {
    global.fetch = originalFetch;
  }
}

test('completed FIBA results fill a lagging 0-0 standings page', async () => {
  const data = await runDashboard({ standings: standingsText({}) });
  const groupA = data.standings.find(group => group.group === 'A').teams;
  const groupC = data.standings.find(group => group.group === 'C').teams;
  const jpn = groupA.find(team => team.code === 'JPN');
  const mli = groupA.find(team => team.code === 'MLI');
  const aus = groupC.find(team => team.code === 'AUS');
  const pur = groupC.find(team => team.code === 'PUR');
  const groupB = data.standings.find(group => group.group === 'B').teams;
  const groupD = data.standings.find(group => group.group === 'D').teams;
  const kor = groupB.find(team => team.code === 'KOR');
  const ngr = groupB.find(team => team.code === 'NGR');
  const usa = groupD.find(team => team.code === 'USA');
  const chn = groupD.find(team => team.code === 'CHN');

  assert.deepEqual([jpn.wins, jpn.losses, jpn.points], [1, 0, 2]);
  assert.deepEqual([mli.wins, mli.losses, mli.points], [0, 1, 1]);
  assert.deepEqual([aus.wins, aus.losses, aus.points], [1, 0, 2]);
  assert.deepEqual([pur.wins, pur.losses, pur.points], [0, 1, 1]);
  assert.deepEqual([kor.wins, kor.losses, kor.points], [1, 0, 2]);
  assert.deepEqual([ngr.wins, ngr.losses, ngr.points], [0, 1, 1]);
  assert.deepEqual([usa.wins, usa.losses, usa.points], [1, 0, 2]);
  assert.deepEqual([chn.wins, chn.losses, chn.points], [0, 1, 1]);
  assert.equal(data.dataStatus.standingsSource, 'derived-from-results');
  assert.equal(data.dataStatus.liveResults, true);
});

test('official FIBA standings take priority once they catch up', async () => {
  const data = await runDashboard({
    standings: standingsText({
      jpn:'1/0 2', mli:'0/1 1', aus:'1/0 2', pur:'0/1 1',
      kor:'1/0 2', ngr:'0/1 1', usa:'1/0 2', chn:'0/1 1'
    }).replaceAll('/', ' / ')
  });
  assert.equal(data.dataStatus.standingsSource, 'official-standings');
  assert.equal(data.standings.find(group => group.group === 'A').teams[0].code, 'JPN');
  assert.equal(data.standings.find(group => group.group === 'C').teams[0].code, 'AUS');
});

test('complete Team USA player statistics come from FIBA team data', async () => {
  const roster = [
    'Aliyah Boston', 'Paige Bueckers', 'Caitlin Clark', 'Napheesa Collier', 'Kahleah Copper', 'Chelsea Gray',
    'Rhyne Howard', 'Kiki Iriafen', 'Angel Reese', 'Breanna Stewart', 'Sonia Citron', 'Jackie Young'
  ];
  const stats = '<html><head><script>self.__next_f.push([1,"{\\"NEXT_CLIENT_APIM_URL\\":\\"https://digital-api.example/hapi\\",\\"NEXT_CLIENT_APIM_SUBSCRIPTION_KEY\\":\\"public-test-key\\"}"])</script></head><body></body></html>';
  const teamStats = {
    playerInCompetitionTeamStatistics: roster.map((name, index) => {
      const [firstName, ...last] = name.split(' ');
      return {
        firstName,
        lastName: last.join(' '),
        totalGamesPlayed: 1,
        playTimeInSecondsPerGame: name === 'Caitlin Clark' ? 1519 : 600 + index,
        pointsPerGame: name === 'Caitlin Clark' ? 14 : index,
        totalPoints: name === 'Caitlin Clark' ? 14 : index,
        fieldGoalsMadePerGame: name === 'Caitlin Clark' ? 4 : 1,
        fieldGoalsAttemptedPerGame: name === 'Caitlin Clark' ? 9 : 2,
        fieldGoalsPercentage: name === 'Caitlin Clark' ? 44.444 : 50,
        threePointsMadePerGame: name === 'Caitlin Clark' ? 3 : 0,
        threePointsAttemptedPerGame: name === 'Caitlin Clark' ? 7 : 0,
        threePointsPercentage: name === 'Caitlin Clark' ? 42.857 : 0,
        freeThrowsMadePerGame: name === 'Caitlin Clark' ? 3 : 0,
        freeThrowsAttemptedPerGame: name === 'Caitlin Clark' ? 4 : 0,
        freeThrowsPercentage: name === 'Caitlin Clark' ? 75 : 0
      };
    })
  };
  const data = await runDashboard({ standings: standingsText({}), stats, teamStats });
  const caitlin = data.playerStats.find(player => player.player === 'Caitlin Clark');

  assert.equal(data.dataStatus.livePlayerStats, true);
  assert.equal(data.dataStatus.playerStatsSource, 'official-usa-team-statistics');
  assert.equal(data.playerStats.filter(player => player.gp === 1).length, 12);
  assert.equal(caitlin.ppg, 14);
  assert.equal(caitlin.fg, '4-9');
  assert.equal(caitlin.three, '3-7');
  assert.equal(caitlin.ftPct, 75);
  assert.ok(Math.abs(caitlin.mpg - 25.3167) < 0.001);
});

test('final game cards include official FIBA Player of the Game and country flag', async () => {
  const data = await runDashboard({ standings: standingsText({}) });
  const usa = data.games.find(game => game.home.code === 'USA' && game.away.code === 'CHN');
  const aus = data.games.find(game => game.home.code === 'AUS' && game.away.code === 'PUR');

  assert.equal(usa.playerOfGame.player, 'Caitlin Clark');
  assert.equal(usa.playerOfGame.flag, '🇺🇸');
  assert.equal(usa.playerOfGame.line, '14 PTS, 11 AST');
  assert.match(usa.playerOfGame.sourceUrl, /128134-USA-CHN/);
  assert.equal(aus.playerOfGame.player, 'Steph Talbot');
  assert.equal(aus.playerOfGame.flag, '🇦🇺');
  assert.ok(data.dataStatus.playerOfGameCount >= 4);
});

test('dashboard fetches dedicated FIBA games and standings pages', () => {
  const source = require('node:fs').readFileSync(handlerPath, 'utf8');
  assert.match(source, /fetchText\(SOURCE_URLS\.standings\)/);
  assert.match(source, /fetchText\(SOURCE_URLS\.games\)/);
  assert.match(source, /deriveStandingsFromFinalGames/);
  assert.match(source, /gameCenterUrl/);
  assert.match(source, /applyVerifiedDailyScores/);
  assert.match(source, /fetchUsaTeamPlayerStats/);
  assert.match(source, /getgdapcompetitionteamstatisticsbyteamid/);
  assert.match(source, /attachPlayersOfGame/);
  assert.match(source, /TCL Player Of The Game/);
});


test('verified USA Players of the Game stay attached to the correct finals', () => {
  const source = require('node:fs').readFileSync(handlerPath, 'utf8');
  assert.match(source, /'USA-CHN'[\s\S]*player:\s*'Caitlin Clark'[\s\S]*14 PTS · 11 AST/);
  assert.match(source, /'ITA-USA'[\s\S]*player:\s*'Jackie Young'[\s\S]*10 PTS/);
  assert.match(source, /italy-hand-holders-usa-a-major-scare/);
});

test('Team USA schedule cards render Player of the Game with a country flag', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'no-offseason-fiba.js'), 'utf8');
  assert.match(source, /fiba-usa-potg/);
  assert.match(source, /FIBA PLAYER OF THE GAME/);
  assert.match(source, /pog\?\.flag/);
});
