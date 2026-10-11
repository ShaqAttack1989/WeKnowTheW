const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const playersApi=require('../api/players');
const { officialHeadshot }=require('../lib/wnba-headshots');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Deja Kelly remains searchable as a benched free agent',()=>{
  const players=playersApi._test.buildRoster({teams:[],players:[]},{teams:[],players:[]},2025);
  const deja=players.find(player=>player.name==='Deja Kelly');
  assert.ok(deja);
  assert.equal(deja.currentRoster,false);
  assert.equal(deja.lastTeam,'Las Vegas Aces');
  assert.equal(deja.team,'Free Agent · last: Las Vegas Aces');
  assert.equal(deja.wnbaId,'1642795');
  assert.equal(deja.wnbaRegularSeasonGames,0);
  assert.match(deja.description,/UPSHOT championship/);
  assert.equal(officialHeadshot('Deja Kelly').id,'1642795');
});

test('Deja Kelly carries both 2026 offseason affiliations',()=>{
  const affiliations=JSON.parse(read('pro-offseason-affiliations.json'));
  assert.ok(affiliations.athletesUnlimited.players.some(([name,team])=>name==='Deja Kelly'&&team==='Eclipse'));
  assert.ok(affiliations.upshot.players.some(([name,team,label])=>name==='Deja Kelly'&&team==='Charlotte Crown'&&/Championship MVP/.test(label)));
  assert.match(read('playerpedia-offseason-badges.js'),/payload\?\.upshot\?\.players/);
  assert.match(read('playerpedia-history-upgrade.js'),/wnbaRegularSeasonGames!==0/);
});
