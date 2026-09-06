const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('wpba.html');
const page=read('wpba-page.js');
const site=read('site.js');
const workflow=read('.github/workflows/wpba-dashboard-sync.yml');
const sync=read('scripts/update-wpba-dashboard.mjs');
const data=JSON.parse(read('data/wpba-2026.json'));

test('builds a complete WPBA child hub',()=>{
  for(const id of ['league-pulse','standings','leaders','results','teams','pathway'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/Women's Premier Basketball Association/);
  assert.match(html,/wpba-page\.js/);
  assert.match(html,/official WPBA BasketballShift feed/i);
});

test('ships a complete verified eight-team snapshot',()=>{
  assert.equal(data.league.teams,8);
  assert.equal(data.league.rosterSize,12);
  assert.equal(data.standings.length,8);
  assert.equal(data.teams.length,8);
  assert.ok(data.leaders.length>=8);
  assert.ok(data.games.length>=8);
  assert.equal(data.standings[0].team,'Bay City Blaze');
});

test('renders all live dashboard modules from no-store data',()=>{
  assert.match(page,/fetch\(DATA_URL,\{cache:'no-store'/);
  for(const renderer of ['renderPulse','renderStandings','renderLeaders','renderGames','renderTeams'])assert.match(page,new RegExp(`function ${renderer}`));
  assert.match(page,/last verified snapshot|official WPBA link/i);
});

test('adds WPBA to navigation, discovery and the pipeline parent',()=>{
  assert.match(site,/href='\/wpba\.html'|href="\/wpba\.html"/);
  assert.match(site,/hierarchyMap\['\/wpba\.html'\]/);
  assert.match(site,/navSections\.future\.push\('\/wpba\.html'\)/);
  assert.match(site,/WPBA League Hub/);
  assert.match(site,/West Coast Workshop/);
});

test('daily sync reads the official feed and only commits its data file',()=>{
  assert.match(workflow,/cron: '47 12 \* \* \*'/);
  assert.match(workflow,/node scripts\/update-wpba-dashboard\.mjs/);
  assert.match(workflow,/git add data\/wpba-2026\.json/);
  assert.match(sync,/womenspba\.com\/stats/);
  assert.match(sync,/scrapeStandings/);
  assert.match(sync,/scrapeLeaders/);
  assert.match(sync,/scrapeGames/);
});
