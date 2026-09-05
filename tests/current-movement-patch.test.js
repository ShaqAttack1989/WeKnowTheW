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

test('latest roster moves update current rosters without removing Playerpedia history', async () => {
  const payload = await loadPlayers();
  const byName = new Map(payload.players.map(player => [player.name, player]));

  assert.equal(byName.get('Madison Scott').team, 'New York Liberty');
  assert.equal(byName.get('Madison Scott').number, '24');
  assert.equal(byName.get('Madison Scott').currentRoster, true);
  assert.equal(byName.get('Madison Scott').liveStatus, 'development');
  assert.equal(byName.get('Madison Scott').liveEffectiveDate, '2026-09-02');

  assert.equal(byName.get('Hailey Van Lith').currentRoster, false);
  assert.equal(byName.get('Hailey Van Lith').lastTeam, 'Connecticut Sun');
  assert.equal(byName.get('Hailey Van Lith').liveStatus, 'released');
  assert.equal(byName.get('Hailey Van Lith').liveEffectiveDate, '2026-09-02');

  assert.equal(byName.get('Saylor Poffenbarger').currentRoster, false);
  assert.equal(byName.get('Saylor Poffenbarger').lastTeam, 'Phoenix Mercury');
  assert.equal(byName.get('Saylor Poffenbarger').liveStatus, 'released');
  assert.equal(byName.get('Saylor Poffenbarger').liveEffectiveDate, '2026-09-01');

  assert.equal(byName.get('Kate Martin').team, 'Chicago Sky');
  assert.equal(byName.get('Kate Martin').number, '20');
  assert.equal(byName.get('Kate Martin').currentRoster, true);
  assert.equal(byName.get('Kate Martin').liveStatus, 'development');
  assert.equal(byName.get('Kate Martin').liveEffectiveDate, '2026-09-02');

  assert.equal(byName.get('Alissa Pili').currentRoster, false);

  assert.equal(byName.get('Shyanne Sellers').team, 'Los Angeles Sparks');
  assert.equal(byName.get('Shyanne Sellers').number, '7');
  assert.equal(byName.get('Shyanne Sellers').currentRoster, true);
  assert.equal(byName.get('Shyanne Sellers').liveStatus, 'development');
  assert.equal(byName.get('Shyanne Sellers').liveEffectiveDate, '2026-08-31');

  assert.equal(byName.get('Aaliyah Nye').team, 'Los Angeles Sparks');
  assert.equal(byName.get('Aaliyah Nye').number, '32');
  assert.equal(byName.get('Aaliyah Nye').currentRoster, true);
  assert.equal(byName.get('Aaliyah Nye').liveEffectiveDate, '2026-08-30');

  assert.equal(byName.get('Ndjakalenga Mwenentanda').number, '32');
  assert.equal(byName.get('Ndjakalenga Mwenentanda').liveStatus, 'development');

  assert.equal(byName.get('Tonie Morgan').team, 'Los Angeles Sparks');
  assert.equal(byName.get('Tonie Morgan').number, '4');
  assert.equal(byName.get('Tonie Morgan').liveEffectiveDate, '2026-08-16');

  assert.equal(byName.get('Kennedy Burke').liveStatus, 'temporarily-suspended');
  assert.equal(byName.get('Leila Lacan').liveStatus, 'temporarily-suspended');
  assert.equal(byName.get('Valeriane Ayayi').liveStatus, 'temporarily-suspended');
  assert.equal(byName.get('Kyara Linskens').liveStatus, 'temporarily-suspended');

  for (const player of payload.players) {
    const filterTeam = player.currentRoster === false ? player.lastTeam : player.team;
    if (filterTeam) assert.ok(player.teamId, `${player.name} is missing a team filter ID`);
  }

  assert.ok(payload.transactions.some(item => item.player === 'Madison Scott' && item.type === 'SIGNED' && item.team === 'New York Liberty' && item.date === '2026-09-02'));
  assert.ok(payload.transactions.some(item => item.player === 'Hailey Van Lith' && item.type === 'RELEASED' && item.date === '2026-09-02'));
  assert.ok(payload.transactions.some(item => item.player === 'Saylor Poffenbarger' && item.type === 'RELEASED' && item.date === '2026-09-01'));
  assert.ok(payload.transactions.some(item => item.player === 'Kate Martin' && item.type === 'SIGNED' && item.team === 'Chicago Sky' && item.date === '2026-09-02'));
  assert.ok(payload.transactions.some(item => item.player === 'Kate Martin' && item.type === 'WAIVED' && item.team === 'Los Angeles Sparks' && item.date === '2026-08-29'));
  assert.ok(payload.transactions.some(item => item.player === 'Shyanne Sellers' && item.type === 'SIGNED' && item.date === '2026-08-31'));
  assert.ok(payload.transactions.some(item => item.player === 'Aaliyah Nye' && item.type === 'CLAIMED' && item.date === '2026-08-30'));
  assert.ok(payload.transactions.some(item => item.player === 'Tonie Morgan' && item.type === 'SIGNED' && item.date === '2026-08-16'));
  assert.ok(payload.transactions.some(item => item.player === 'Tonie Morgan' && item.type === 'SIGNED' && item.date === '2026-07-17'));
  assert.ok(payload.transactions.some(item => item.player === 'Nneka Ogwumike' && item.type === 'RETIREMENT ANNOUNCED' && item.date === '2026-08-19'));
});
