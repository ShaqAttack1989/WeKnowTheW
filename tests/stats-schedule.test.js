const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const stats = require('../api/stats').__test;

test('late WNBA finales use the Eastern league date instead of the next UTC date', () => {
  const game = {
    idEvent: 'official-final-night',
    strTimestamp: '2026-09-25T02:00:00',
    dateEvent: '2026-09-25',
    strTime: '02:00:00',
    strAwayTeam: 'Golden State Valkyries',
    strHomeTeam: 'Los Angeles Sparks',
    strStatus: 'NS'
  };

  assert.equal(stats.eventLeagueDate(game), '2026-09-24');
  assert.equal(stats.inRegularSeason(game, 2026), true);
  assert.equal(stats.gameShape(game, 'Scheduled').date, '2026-09-24');
});

test('provider local dates take precedence and postseason games stay out of the regular season', () => {
  assert.equal(stats.inRegularSeason({
    dateEvent: '2026-09-25',
    dateEventLocal: '2026-09-24',
    strTimestamp: '2026-09-25T02:00:00Z',
    strAwayTeam: 'Las Vegas Aces',
    strHomeTeam: 'Phoenix Mercury'
  }, 2026), true);
  assert.equal(stats.inRegularSeason({
    dateEvent: '2026-09-27',
    strTimestamp: '2026-09-27T17:00:00Z',
    strAwayTeam: 'Playoff Team 1',
    strHomeTeam: 'Playoff Team 2'
  }, 2026), false);
});

test('the Commissioner\'s Cup final remains excluded using the league date', () => {
  assert.equal(stats.inRegularSeason({
    dateEvent: '2026-07-01',
    strTimestamp: '2026-07-01T00:00:00Z',
    strAwayTeam: 'Las Vegas Aces',
    strHomeTeam: 'New York Liberty'
  }, 2026), false);
});

test('the complete 330-game feed keeps all five Sept. 24 finales', async () => {
  const file = path.join(__dirname, '..', 'api', 'stats.js');
  const localRequire = createRequire(file);
  const ordinary = Array.from({ length: 327 }, (_, index) => ({
    idEvent: `regular-${index}`,
    strTimestamp: `2026-05-09T${String(Math.floor(index / 60) % 24).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00Z`,
    dateEvent: '2026-05-09',
    strTime: '12:00:00',
    strHomeTeam: `Home ${index}`,
    strAwayTeam: `Away ${index}`,
    strStatus: 'NS'
  }));
  const finales = [
    ['Indiana Fever', 'Minnesota Lynx', '2026-09-25T00:00:00Z'],
    ['Las Vegas Aces', 'Phoenix Mercury', '2026-09-25T02:00:00Z'],
    ['Golden State Valkyries', 'Los Angeles Sparks', '2026-09-25T02:00:00Z']
  ].map(([away, home, timestamp], index) => ({
    idEvent: `finale-${index}`,
    strTimestamp: timestamp,
    dateEvent: '2026-09-25',
    strTime: timestamp.slice(11, 19),
    strHomeTeam: home,
    strAwayTeam: away,
    strStatus: 'NS'
  }));
  const provider = {
    getWnbaScoreboard: async () => [],
    getWnbaLiveScoreboard: async () => [],
    getWnbaStandings: async () => [],
    scoreboardToSportsDbShape: value => value
  };
  const context = {
    module: { exports: {} },
    require: id => id === '../lib/wehoop-espn' ? provider : id === '../lib/wnba-official-stats' ? { getOfficialStandings: async () => [] } : localRequire(id),
    fetch: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ schedule: [...ordinary, ...finales] }) }),
    process: { env: { THESPORTSDB_API_KEY: 'test-key' } },
    AbortController,
    URLSearchParams,
    Date,
    Intl,
    setTimeout,
    clearTimeout,
    console
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
  const response = await new Promise((resolve, reject) => {
    const res = {
      setHeader() {},
      status(code) { this.code = code; return this; },
      json(body) { resolve({ code: this.code, body }); return body; }
    };
    Promise.resolve(context.module.exports({ method: 'GET', query: { season: '2026' } }, res)).catch(reject);
  });

  assert.equal(response.code, 200);
  assert.equal(response.body.regularSeasonEventCount, 330);
  assert.equal(response.body.expectedRegularSeasonEventCount, 330);
  assert.equal(response.body.scheduleComplete, true);
  assert.equal(response.body.upcomingGames.filter(game => game.date === '2026-09-24').length, 3);
});
