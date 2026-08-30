const test = require('node:test');
const assert = require('node:assert/strict');

const providers = require('../lib/wehoop-espn');
providers.getWnbaRosters = async () => ({ teams: [], players: [], failedRosters: 15 });
providers.getWnbaInjuries = async () => [];
providers.getWnbaTransactions = async () => [];

const playersHandler = require('../api/players');

async function loadPlayers() {
  let payload;
  const res = {
    setHeader() {},
    status(code) {
      assert.equal(code, 200);
      return this;
    },
    json(value) {
      payload = value;
      return value;
    }
  };
  await playersHandler({ method: 'GET' }, res);
  return payload;
}

test('latest Sparks moves update current rosters without removing Playerpedia history', async () => {
  const payload = await loadPlayers();
  const byName = new Map(payload.players.map(player => [player.name, player]));

  assert.equal(byName.get('Kate Martin').currentRoster, false);
  assert.equal(byName.get('Kate Martin').team, 'Free Agent · last: Los Angeles Sparks');
  assert.equal(byName.get('Kate Martin').liveStatus, 'waived');

  assert.equal(byName.get('Alissa Pili').currentRoster, false);
  assert.equal(byName.get('Aaliyah Nye').team, 'Los Angeles Sparks');
  assert.equal(byName.get('Aaliyah Nye').currentRoster, true);
  assert.equal(byName.get('Ndjakalenga Mwenentanda').liveStatus, 'development');

  assert.ok(payload.transactions.some(item => item.player === 'Kate Martin' && item.type === 'WAIVED'));
  assert.ok(payload.transactions.some(item => item.player === 'Aaliyah Nye' && item.type === 'CLAIMED'));
});
