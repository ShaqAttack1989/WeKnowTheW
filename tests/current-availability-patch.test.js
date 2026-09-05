const test = require('node:test');
const assert = require('node:assert/strict');
const { CURRENT_AVAILABILITY_PATCH } = require('../lib/current-availability-patch');

const byPlayer = new Map(CURRENT_AVAILABILITY_PATCH.map(item => [item.player, item]));

test('keeps verified season-ending injuries current', () => {
  const diggins = byPlayer.get('Skylar Diggins');
  assert.ok(diggins);
  assert.equal(diggins.team, 'Chicago Sky');
  assert.equal(diggins.status, 'OUT FOR SEASON');
  assert.equal(diggins.updated, '2026-09-01');
  assert.match(diggins.reason, /Right knee/);
  assert.equal(diggins.carryover, true);

  const sykes = byPlayer.get('Brittney Sykes');
  assert.ok(sykes);
  assert.equal(sykes.team, 'Toronto Tempo');
  assert.equal(sykes.status, 'OUT FOR SEASON');
  assert.match(sykes.reason, /Foot/);
  assert.equal(sykes.carryover, true);

  const morrow = byPlayer.get('Aneesah Morrow');
  assert.ok(morrow);
  assert.equal(morrow.team, 'Toronto Tempo');
  assert.equal(morrow.status, 'OUT FOR SEASON');
  assert.match(morrow.reason, /Knee/);
  assert.equal(morrow.carryover, true);

  assert.equal(byPlayer.get('Kelsey Plum')?.status, 'OUT FOR SEASON');
  assert.equal(byPlayer.get('NaLyssa Smith')?.status, 'OUT FOR SEASON');
});
