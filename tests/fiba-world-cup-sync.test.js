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

async function runDashboard({
  standings,
  stats=html('No USA player stats yet'),
  teamStats=null,
  competitionGames=null,
  leaderStats=null,
  results=finalGames,
  daily=dailyGameCenter
}) {
  delete require.cache[require.resolve(handlerPath)];
  const originalFetch = global.fetch;
  global.fetch = async url => {
    const value = String(url);
    if (value.endsWith('/standings')) return { ok: true, text: async () => standings };
    if (value.endsWith('/games')) return { ok: true, text: async () => results };
    if (value.endsWith('/stats')) return { ok: true, text: async () => stats };
    if (value.includes('getgdapgamesbycompetitionid')) {
      return competitionGames
        ? { ok: true, json: async () => competitionGames }
        : { ok: false, status: 404, json: async () => ({}) };
    }
    if (value.includes('getgdapcompetitionplayerleadersbyid')) {
      const code = new URL(value).searchParams.get('statisticCode');
      return leaderStats?.[code]
        ? { ok: true, json: async () => leaderStats[code] }
        : { ok: false, status: 404, json: async () => ({}) };
    }
    if (value.includes('getgdapcompetitionteamstatisticsbyteamid')) {
      return teamStats
        ? { ok: true, json: async () => teamStats }
        : { ok: false, status: 404, json: async () => ({}) };
    }
    if (value.includes('/news/2026-wwc-game-center-sep-')) return { ok: true, text: async () => daily };
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

function gdapGame({id, date, time='12:00', group=null, home=null, away=null, homeScore=0, awayScore=0, final=true, phase='Group Phase', roundCode='GP'}) {
  return {
    gameId:id,
    statusCode:final?'VALID':'INIT',
    gameResultStatusCode:final?'VALID':'EMPTY',
    teamA:home?{code:home,shortName:home}:null,
    teamB:away?{code:away,shortName:away}:null,
    teamAScore:homeScore,
    teamBScore:awayScore,
    isLive:false,
    hostCity:'Berlin',
    hostCountry:'Germany',
    venueName:'Berlin Arena',
    gameDateTime:`${date}T${time}:00`,
    gameDateTimeUTC:`${date}T10:00:00`,
    groupPairingCode:group,
    round:{roundCode,roundName:phase,roundType:group?'G':'NG'},
    teamAFrom:home?null:'Bracket team A',
    teamBFrom:away?null:'Bracket team B'
  };
}

function completeCompetitionGames() {
  const groups = [
    [128116,'A','JPN','MLI',102,97],[128129,'C','AUS','PUR',70,54],[128134,'D','USA','CHN',94,61],[128123,'B','KOR','NGR',99,81],
    [128128,'C','BEL','TUR',89,75],[128117,'A','ESP','GER',83,53],[128135,'D','CZE','ITA',54,63],[128122,'B','HUN','FRA',53,99],
    [128119,'A','MLI','ESP',82,73],[128124,'B','NGR','HUN',67,71],[128118,'A','GER','JPN',74,58],[128125,'B','FRA','KOR',95,69],
    [128131,'C','TUR','AUS',71,87],[128137,'D','CHN','CZE',74,70],[128130,'C','PUR','BEL',64,76],[128136,'D','ITA','USA',52,55],
    [128132,'C','BEL','AUS',80,68],[128133,'C','PUR','TUR',75,71],[128126,'B','HUN','KOR',82,73],[128127,'B','NGR','FRA',56,111],
    [128120,'A','JPN','ESP',59,79],[128121,'A','GER','MLI',83,58],[128138,'D','USA','CZE',105,64],[128139,'D','ITA','CHN',51,71]
  ].map(([id,group,home,away,homeScore,awayScore],index)=>gdapGame({
    id,group,home,away,homeScore,awayScore,date:index<8?'2026-09-04':index<12?'2026-09-05':index<16?'2026-09-06':'2026-09-07'
  }));
  const qualification = [
    gdapGame({id:128145,date:'2026-09-08',home:'HUN',away:'JPN',homeScore:84,awayScore:63,phase:'Qualification to Quarter-Finals',roundCode:'QQF'}),
    gdapGame({id:128144,date:'2026-09-08',home:'GER',away:'KOR',homeScore:94,awayScore:56,phase:'Qualification to Quarter-Finals',roundCode:'QQF'}),
    gdapGame({id:128147,date:'2026-09-09',home:'PUR',away:'CHN',final:false,phase:'Qualification to Quarter-Finals',roundCode:'QQF'}),
    gdapGame({id:128146,date:'2026-09-09',home:'ITA',away:'AUS',final:false,phase:'Qualification to Quarter-Finals',roundCode:'QQF'})
  ];
  const future = [128148,128149,128150,128151].map((id,index)=>gdapGame({id,date:'2026-09-10',home:index===2?'BEL':index===3?'USA':null,away:index===2?'GER':index===3?'HUN':null,final:false,phase:'Quarter-Finals',roundCode:'QF'}))
    .concat([128152,128153].map(id=>gdapGame({id,date:'2026-09-12',final:false,phase:'Semi-Finals',roundCode:'SF'})))
    .concat([
      gdapGame({id:128154,date:'2026-09-13',final:false,phase:'3rd Place Game',roundCode:'3PG'}),
      gdapGame({id:128155,date:'2026-09-13',final:false,phase:'Final',roundCode:'F'})
    ]);
  return groups.concat(qualification,future);
}

function structuredLeaders() {
  const row=(firstName,lastName,nationality,key,value,rank)=>({firstName,lastName,nationality,rank,statistics:{[key]:value}});
  return {
    EFF:[row('Emma','Meesseman','BEL','EFFPG',23.3,1),row('Gabby','Williams','FRA','EFFPG',23.3,1),row('Xu','Han','CHN','EFFPG',21.7,3)],
    PPG:[row('Gabby','Williams','FRA','PPG',18.7,1),row('Emma','Meesseman','BEL','PPG',18.3,2),row('Sevgi','Uzun','TUR','PPG',17.7,3)],
    RBD:[row('Imani','McGee-Stafford','PUR','RPG',13,1),row('Xu','Han','CHN','RPG',11.3,2),row('Dorka','Juhasz','HUN','RPG',11,3)],
    AST:[row('Sevgi','Uzun','TUR','APG',8.3,1),row('Julie','Allemand','BEL','APG',8,2),row('Caitlin','Clark','USA','APG',6.3,3)],
    STL:[row('Trinity','San Antonio','PUR','STLPG',5,1),row('Gabby','Williams','FRA','STLPG',2.7,2),row('Ezinne','Kalu','NGR','STLPG',2.7,2)],
    BLK:[row('Ramu','Tokashiki','JPN','BLKPG',2.3,1),row('Kyara','Linskens','BEL','BLKPG',1.7,2),row('Emma','Meesseman','BEL','BLKPG',1.7,2)]
  };
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

test('derived final standings use head-to-head before overall point differential', async () => {
  const groupAResults = html(
    'Group Phase · Group A Final JPN JPN 102 MLI MLI 97 ' +
    'Group Phase · Group A Final ESP ESP 83 GER GER 53 ' +
    'Group Phase · Group A Final MLI MLI 82 ESP ESP 73 ' +
    'Group Phase · Group A Final GER GER 74 JPN JPN 58 ' +
    'Group Phase · Group A Final JPN JPN 59 ESP ESP 79 ' +
    'Group Phase · Group A Final GER GER 83 MLI MLI 58'
  );
  const data = await runDashboard({ standings: standingsText({}), results: groupAResults, daily: groupAResults });
  const order = data.standings.find(group => group.group === 'A').teams.map(team => team.code);
  assert.deepEqual(order, ['ESP', 'GER', 'JPN', 'MLI']);
  assert.equal(data.standings.find(group => group.group === 'A').teams.find(team => team.code === 'JPN').rank, 3);
});

test('structured FIBA feed drives every table through the completed group phase and knockout games', async () => {
  const stats = '<html><head><script>self.__next_f.push([1,"{\\"NEXT_CLIENT_APIM_URL\\":\\"https://digital-api.example/hapi\\",\\"NEXT_CLIENT_APIM_SUBSCRIPTION_KEY\\":\\"public-test-key\\"}"])</script></head><body></body></html>';
  const data = await runDashboard({
    standings: standingsText({usa:'2/0 4',chn:'2/1 5'}),
    stats,
    competitionGames:completeCompetitionGames(),
    leaderStats:structuredLeaders()
  });

  const groupD = data.standings.find(group => group.group === 'D').teams;
  const usa = data.tournamentTable.find(team => team.code === 'USA');
  const missingGame = data.games.find(game => game.fibaGameId === 128138);
  const usaQuarterFinal = data.games.find(game => game.fibaGameId === 128151);

  assert.equal(data.games.length, 36);
  assert.equal(data.dataStatus.completedGroupGames, 24);
  assert.equal(data.dataStatus.completedGames, 26);
  assert.equal(data.dataStatus.gamesSource, 'official-competition-games');
  assert.equal(data.dataStatus.standingsSource, 'derived-from-official-games');
  assert.equal(data.dataStatus.leagueLeadersSource, 'official-competition-player-leaders');
  assert.equal(data.dataStatus.playerOfGameCount, 26);
  assert.deepEqual(groupD.map(team => team.code), ['USA','CHN','ITA','CZE']);
  assert.deepEqual([data.usa.wins,data.usa.losses,data.usa.groupRank], [3,0,1]);
  assert.deepEqual([usa.gamesPlayed,usa.wins,usa.losses,usa.pointsFor,usa.pointsAgainst], [3,3,0,254,177]);
  assert.equal(usa.ppg.toFixed(1), '84.7');
  assert.equal(usa.oppPpg.toFixed(1), '59.0');
  assert.equal(usa.diffPerGame.toFixed(1), '25.7');
  assert.deepEqual([missingGame.status,missingGame.homeScore,missingGame.awayScore], ['final',105,64]);
  assert.deepEqual([missingGame.playerOfGame.player,missingGame.playerOfGame.line], ['Breanna Stewart','19 PTS']);
  assert.deepEqual([usaQuarterFinal.home.code,usaQuarterFinal.away.code,usaQuarterFinal.status], ['USA','HUN','scheduled']);
  assert.deepEqual(data.statLeaders.map(category => category.leaders.length), [3,3,3,3,3,3]);
  assert.equal(data.statLeaders.find(category => category.key === 'assists').leaders[2].player, 'Caitlin Clark');
});

test('verified official snapshot prevents a transient games API failure from dropping completed games', async () => {
  const stats = '<html><head><script>self.__next_f.push([1,"{\\"NEXT_CLIENT_APIM_URL\\":\\"https://digital-api.example/hapi\\",\\"NEXT_CLIENT_APIM_SUBSCRIPTION_KEY\\":\\"public-test-key\\"}"])</script></head><body></body></html>';
  const data = await runDashboard({standings:standingsText({usa:'2/0 4'}),stats,competitionGames:null});
  const usa = data.tournamentTable.find(team => team.code === 'USA');
  const usaChina = data.games.find(game => game.fibaGameId === 128134);

  assert.equal(data.dataStatus.gamesSource, 'verified-official-snapshot');
  assert.equal(data.dataStatus.completedGroupGames, 24);
  assert.equal(data.dataStatus.completedGames, 26);
  assert.deepEqual([data.usa.wins,data.usa.losses,data.usa.groupRank], [3,0,1]);
  assert.deepEqual([usa.pointsFor,usa.pointsAgainst], [254,177]);
  assert.equal(usaChina.timeBerlin, '14:15');
  assert.match(data.dataStatus.warnings.join(' '), /last verified official snapshot/);
});

test('knockout calendar separates qualification games from September 10 quarterfinals', async () => {
  const data = await runDashboard({ standings: standingsText({}) });
  assert.deepEqual(data.knockoutRounds.slice(0, 3), [
    { date: '2026-09-08', phase: 'Qualification to Quarter-Finals', games: 2 },
    { date: '2026-09-09', phase: 'Qualification to Quarter-Finals', games: 2 },
    { date: '2026-09-10', phase: 'Quarter-Finals', games: 4 }
  ]);
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
  assert.equal(usa.playerOfGame.line, '14 PTS · 11 AST');
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
  assert.match(source, /getgdapgamesbycompetitionid/);
  assert.match(source, /getgdapcompetitionplayerleadersbyid/);
  assert.match(source, /getgdapcompetitionteamstatisticsbyteamid/);
  assert.match(source, /attachPlayersOfGame/);
  assert.match(source, /TCL Player Of The Game/);
});


test('all 24 completed group games have verified Players of the Game', () => {
  const source = require('node:fs').readFileSync(handlerPath, 'utf8');
  const expected = [
    ["JPN-MLI","Saki Hayashi"],["AUS-PUR","Steph Talbot"],["USA-CHN","Caitlin Clark"],["KOR-NGR","Jihyun Park"],
    ["BEL-TUR","Emma Meesseman"],["ESP-GER","Awa Fam"],["CZE-ITA","Cecilia Zandalasini"],["HUN-FRA","Dominique Malonga"],
    ["MLI-ESP","Sika Koné"],["NGR-HUN","Dorka Juhász"],["GER-JPN","Frieda Bühner"],["FRA-KOR","Marine Johannès"],
    ["TUR-AUS","Ezi Magbegor"],["CHN-CZE","Xu Han"],["PUR-BEL","Julie Allemand"],["ITA-USA","Jackie Young"],
    ["BEL-AUS","Emma Meesseman"],["PUR-TUR","Trinity San Antonio"],["HUN-KOR","Dorka Juhász"],["NGR-FRA","Gabby Williams"],
    ["JPN-ESP","Iyana Martin"],["GER-MLI","Luisa Geiselsöder"],["USA-CZE","Breanna Stewart"],["ITA-CHN","Shuyu Yang"]
  ];
  for (const [game, player] of expected) {
    assert.ok(source.includes("'" + game + "': {"), game + ' missing');
    const slice = source.slice(source.indexOf("'" + game + "': {"), source.indexOf("'" + game + "': {") + 320);
    assert.ok(slice.includes("player: '" + player + "'"), game + ' missing ' + player);
  }
  assert.match(source, /italy-hand-holders-usa-a-major-scare/);
});

test('FIBA Player of the Game parser decodes nested entities and removes event-title text', () => {
  delete require.cache[require.resolve(handlerPath)];
  const handler = require(handlerPath);
  const parsed = handler.__test.parsePlayerOfGame(
    html('Image FIBA Women&amp;#x27;s Basketball World Cup 2026 Emma Meesseman (22 PTS, 10 REB) | TCL Player Of The Game | BEL v AUS'),
    { home: { code: 'BEL' }, away: { code: 'AUS' }, homeScore: 80, awayScore: 68 },
    'https://www.fiba.basketball/example'
  );

  assert.equal(handler.__test.decodeEntities('FIBA Women&amp;#x27;s'), "FIBA Women's");
  assert.equal(parsed.player, 'Emma Meesseman');
  assert.equal(parsed.line, '22 PTS, 10 REB');
  assert.equal(parsed.countryCode, 'BEL');
});

test('Team USA schedule cards render Player of the Game with a country flag', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'no-offseason-fiba.js'), 'utf8');
  assert.match(source, /fiba-usa-potg/);
  assert.match(source, /FIBA PLAYER OF THE GAME/);
  assert.match(source, /pog\?\.flag/);
  assert.match(source, /home\?`\$\{game\.homeScore\}-\$\{game\.awayScore\}`:`\$\{game\.awayScore\}-\$\{game\.homeScore\}`/);
  assert.match(source, /const officialCount=/);
  assert.match(source, /const remaining=/);
});

test('World Cup Stat Kitchen shows the tournament record only once', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'team-usa.js'), 'utf8');
  const worldCupBoard = source.slice(source.indexOf('function worldCupBoard'), source.indexOf('async function loadWorldCupPulse'));
  assert.doesNotMatch(worldCupBoard, /sourceRecords/);
});

test('World Cup Stat Kitchen uses the spotlight space for three Players of the Game', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'team-usa.js'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'team-usa.css'), 'utf8');
  assert.match(source, /\.slice\(0,3\)/);
  assert.match(source, /spotlightHeading:'TEAM USA PLAYERS OF THE GAME'/);
  assert.match(source, /team-usa-kitchen-spotlight-list/);
  assert.match(css, /\.team-usa-kitchen-spotlight-item/);
});

test('W Score appears immediately before the win column in tournament standings', () => {
  const source = require('node:fs').readFileSync(path.join(__dirname, '..', 'no-offseason-fiba.js'), 'utf8');
  const css = require('node:fs').readFileSync(path.join(__dirname, '..', 'no-offseason-fiba.css'), 'utf8');
  assert.match(source, /<span>TEAM<\/span><span>W SCORE<\/span><span>W<\/span><span>L<\/span>/);
  assert.match(source, /fiba-w-score[\s\S]*?safe\(wins/);
  assert.match(css, /grid-template-columns:42px minmax\(190px,1\.45fr\) 84px 42px 42px 62px/);
});


test('WNBA Passport Board covers all 16 FIBA countries and the official 70-player WNBA universe', () => {
  const data = JSON.parse(require('node:fs').readFileSync(path.join(__dirname, '..', 'data', 'fiba-wnba-passport-2026.json'), 'utf8'));
  assert.equal(data.players.length, 70);
  assert.equal(data.summary.current, 51);
  assert.equal(data.summary.former, 19);
  assert.equal(data.summary.total, 70);
  assert.equal(data.summary.countriesWithCurrent, 15);
  assert.equal(Object.values(data.groups).flat().length, 16);
  assert.equal(new Set(Object.values(data.groups).flat()).size, 16);
  assert.equal(data.players.filter(player => /^Current/.test(player.status)).length, 51);
  assert.equal(data.players.filter(player => player.status === 'Former').length, 19);
  assert.equal(data.players.filter(player => player.allStar).length, 16);
});

test('WNBA Passport Board preserves country flags, current teams, developmental labels and Puerto Rico alumni context', () => {
  const data = JSON.parse(require('node:fs').readFileSync(path.join(__dirname, '..', 'data', 'fiba-wnba-passport-2026.json'), 'utf8'));
  const usa = data.players.filter(player => player.country === 'United States');
  const france = data.players.filter(player => player.country === 'France');
  const puertoRico = data.players.filter(player => player.country === 'Puerto Rico');
  assert.equal(usa.filter(player => /^Current/.test(player.status)).length, 12);
  assert.equal(france.filter(player => /^Current/.test(player.status)).length, 8);
  assert.equal(puertoRico.filter(player => /^Current/.test(player.status)).length, 0);
  assert.equal(puertoRico.filter(player => player.status === 'Former').length, 2);
  assert.equal(data.flags['United States'], '🇺🇸');
  assert.ok(data.players.some(player => player.name === 'Miela Sowah' && player.status === 'Current Dev. Player'));
  assert.ok(data.players.some(player => player.name === 'Costanza Verona' && player.status === 'Current Dev. Player'));
  assert.ok(data.players.some(player => player.name === 'Elizabeth Balogun' && player.status === 'Current Dev. Player'));
  assert.ok(data.players.some(player => player.name === 'Elena Buenavida' && player.status === 'Current Dev. Player'));
});

test('FIBA page renders the WNBA Passport Board with Playerpedia links and filters', () => {
  const page = require('node:fs').readFileSync(path.join(__dirname, '..', 'fiba-world-cup.html'), 'utf8');
  const client = require('node:fs').readFileSync(path.join(__dirname, '..', 'fiba-wnba-passport.js'), 'utf8');
  assert.match(page, /id="wnba-passport"/);
  assert.match(page, /Which WNBA stars are playing for each country/);
  assert.match(page, /data-passport-mode="current"/);
  assert.match(page, /data-passport-mode="allstar"/);
  assert.match(page, /data-passport-mode="all"/);
  assert.match(client, /playerpedia\.html\?search=/);
  assert.match(client, /fiba-wnba-passport-2026\.json/);
  assert.match(client, /fiba-allstar-star/);
});
