const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Games defaults to playoffs after the 2026 regular season',()=>{
  const html=read('games.html'),js=read('games-page.js');
  assert.match(html,/class="active" data-games-competition="playoffs" aria-pressed="true"/);
  assert.match(js,/gamesMode='upcoming'.*gamesCompetition='playoffs'/s);
});

test('Homepage Games snapshot includes playoff feed and visual fallback',()=>{
  const source=read('homepage-week-live.js');
  assert.match(source,/api\/competition\?season=2026/);
  assert.match(source,/MEDIA\.games/);
  assert.match(source,/playoffUpcoming/);
});

test('Homepage scoreboard trusts a published tip time over a stale TBD status',()=>{
  const source=read('homepage-desk.js');
  assert.match(source,/const published=String\(game\.startTimeUtc\|\|game\.timestamp\|\|game\.strTimestamp/);
  assert.match(source,/!published&&\/tbd\/i\.test/);
});

test('Global scoreboard is installed by the shared site shell and refreshes the full slate',()=>{
  const site=read('site.js'),scoreboard=read('global-scoreboard.js');
  assert.match(site,/global-scoreboard\.js\?v=20261008-gsv-g2-v1/);
  assert.match(site,/global-scoreboard\.css\?v=20261003-readable-ribbon-v5/);
  assert.match(scoreboard,/livePayload\.todayGames\|\|livePayload\.games/);
  assert.match(scoreboard,/setInterval\(\(\)=>\{if\(!document\.hidden\)refreshLive\(\);\},10000\)/);
  assert.match(scoreboard,/w-home-nav-sticky/);
});

test('Playoff standings are automatic and use the full standings table system',()=>{
  const source=read('live-stats-page.js'),css=read('ui-fixes.css');
  assert.match(source,/lsCompMode='playoffs'/);
  assert.match(source,/playoffs\.started\|\|Date\.now\(\)>=start\?'playoffs':'season'/);
  assert.match(source,/live-standings-row playoff-standings-row head/);
  assert.match(source,/setInterval\(\(\)=>\{if\(!document\.hidden\)refreshPlayoffScores\(\);\},10000\)/);
  assert.doesNotMatch(source,/Race for the Eight/);
  assert.match(css,/\.playoff-standings-row\{/);
});

test('Homepage does not preload the heavy legacy player catalog',()=>{
  const html=read('index.html');
  assert.doesNotMatch(html,/src="\/playerpedia-legacy\.js/);
  assert.match(html,/homepage-data-cache\.js/);
});

test('Playoff watch keeps a 16px minimum for compact labels and copy',()=>{
  const css=read('snack-shaq.css');
  assert.match(css,/Playoff Watch readability standard/);
  assert.match(css,/font-size:16px/);
});


test('Homepage orders the live semifinal update, Draft Watch and bracket with the latest Game 2 result visible',()=>{
  const html=read('index.html');
  const bracket=html.indexOf('id="playoff-bracket"');
  const draft=html.indexOf('href="/wnba-draft-class-rankings.html"');
  const seasonal=html.indexOf('data-season=');
  assert.ok(seasonal>0&&draft>seasonal&&bracket>draft);
  assert.match(html,/Two home stands/);
  assert.match(html,/GSV 83–81 LVA · FINAL/);
  assert.match(html,/Atlanta and Golden State both lead 2–0/);
  assert.match(html,/1631007\.png/);
});

test('Homepage live game board prioritizes and deduplicates playoff games',()=>{
  const source=read('home-live-core.js');
  assert.match(source,/dedupeHomeSchedule/);
  assert.match(source,/competition\.playoffs\?\.games/);
  assert.match(source,/payload\.upcomingGames=dedupeHomeSchedule/);
  assert.match(source,/payload\.pastGames=dedupeHomeSchedule/);
});

test('Playoff dashboards expose advancement and elimination state',()=>{
  const stats=read('live-stats-page.js'),team=read('team-page.js'),bracket=read('playoff-bracket.js');
  assert.match(stats,/ELIMINATED/);
  assert.match(stats,/ADVANCED/);
  assert.match(stats,/seriesComplete/);
  assert.match(team,/teamPlayoffPulse/);
  assert.match(team,/renderTeamPlayoffPulse/);
  assert.match(team,/api\/competition\?season=2026/);
  assert.match(bracket,/is-eliminated/);
  assert.match(bracket,/\/team\.html\?team=/);
});
