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

function standingsText(jpn='0/0 0', mli='0/0 0', aus='0/0 0', pur='0/0 0') {
  return html('Standings Group A JPN ' + jpn + ' ESP 0/0 0 GER 0/0 0 MLI ' + mli +
    ' Group B HUN 0/0 0 KOR 0/0 0 NGR 0/0 0 FRA 0/0 0' +
    ' Group C BEL 0/0 0 AUS ' + aus + ' PUR ' + pur + ' TUR 0/0 0' +
    ' Group D USA 0/0 0 CZE 0/0 0 ITA 0/0 0 CHN 0/0 0');
}

const finalGames = html(
  'Group Phase · Group A Final JPN JPN 102 MLI MLI 97 ' +
  'Group Phase · Group C Final AUS AUS 70 PUR PUR 54'
);

async function runDashboard({standings}) {
  delete require.cache[require.resolve(handlerPath)];
  const originalFetch = global.fetch;
  global.fetch = async url => {
    const value = String(url);
    if (value.endsWith('/standings')) return { ok: true, text: async () => standings };
    if (value.endsWith('/games')) return { ok: true, text: async () => finalGames };
    if (value.endsWith('/stats')) return { ok: true, text: async () => html('No USA player stats yet') };
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
  const data = await runDashboard({ standings: standingsText() });
  const groupA = data.standings.find(group => group.group === 'A').teams;
  const groupC = data.standings.find(group => group.group === 'C').teams;
  const jpn = groupA.find(team => team.code === 'JPN');
  const mli = groupA.find(team => team.code === 'MLI');
  const aus = groupC.find(team => team.code === 'AUS');
  const pur = groupC.find(team => team.code === 'PUR');

  assert.deepEqual([jpn.wins, jpn.losses, jpn.points], [1, 0, 2]);
  assert.deepEqual([mli.wins, mli.losses, mli.points], [0, 1, 1]);
  assert.deepEqual([aus.wins, aus.losses, aus.points], [1, 0, 2]);
  assert.deepEqual([pur.wins, pur.losses, pur.points], [0, 1, 1]);
  assert.equal(data.dataStatus.standingsSource, 'derived-from-results');
  assert.equal(data.dataStatus.liveResults, true);
});

test('official FIBA standings take priority once they catch up', async () => {
  const data = await runDashboard({
    standings: standingsText('1/0 2', '0/1 1', '1/0 2', '0/1 1')
  });
  assert.equal(data.dataStatus.standingsSource, 'official-standings');
  assert.equal(data.standings.find(group => group.group === 'A').teams[0].code, 'JPN');
  assert.equal(data.standings.find(group => group.group === 'C').teams[0].code, 'AUS');
});

test('dashboard fetches dedicated FIBA games and standings pages', () => {
  const source = require('node:fs').readFileSync(handlerPath, 'utf8');
  assert.match(source, /fetchText\(SOURCE_URLS\.standings\)/);
  assert.match(source, /fetchText\(SOURCE_URLS\.games\)/);
  assert.match(source, /deriveStandingsFromFinalGames/);
});
