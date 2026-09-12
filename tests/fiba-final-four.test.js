const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const article=read('fiba-final-four-2026.html');
const css=read('fiba-final-four.css');
const client=read('fiba-final-four.js');
const home=read('index.html');
const hub=read('fiba-world-cup.html');
const site=read('site.js');
const feed=JSON.parse(read('snack-shak-latest.json'));

test('Final Four Food for Thought feature is discoverable across the site',()=>{
  assert.match(home,/\/fiba-final-four-2026\.html/);
  assert.match(hub,/\/fiba-final-four-2026\.html/);
  assert.match(site,/Four Teams, Two Tickets, No Hiding/);
  assert.ok(feed.posts.some(post=>post.slug==='fiba-final-four-2026'&&post.type==='feature'));
});

test('feature covers both official semifinal matchups and their story',()=>{
  for(const value of ['France vs Germany','Spain vs USA','61.4 percent','9.8 turnovers','17.3 to 8.8','48.8 to 29','34-game World Cup win streak','3 of 18'])assert.ok((article+client).includes(value),value);
  assert.match(article,/The safest final is France–USA/);
  assert.match(article,/Prediction, not a live result/);
});

test('USA quarterfinal record receipts are visible and tied to the live feed',()=>{
  for(const value of ['ffUsaRecordsStatus','OFFICIAL FIBA RECORDS','59','31','108','DOUBLE-FIGURE SCORERS','records-fall-as-usa-put-the-world-on-notice'])assert.ok((article+client+feed.posts[0].sections.map(section=>section.paragraphs||[]).flat().join(' ')+JSON.stringify(feed.posts[0].sources)).includes(value),value);
  assert.match(client,/roundCode==='QF'/);
  assert.match(css,/\.ff-usa-records/);
  assert.match(css,/\.ff-record-grid/);
});

test('country, player and overall dashboards are interactive and FIBA-connected',()=>{
  for(const id of ['ffOverallBoard','ffLeaderBoard','ffCountryLab','ffPlayerGrid'])assert.ok(article.includes(`id="${id}"`),id);
  assert.match(client,/fetch\('\/api\/fiba-world-cup'/);
  assert.match(client,/window\.setInterval\(refresh,120000\)/);
  assert.match(client,/data-ff-player-filter/);
  assert.match(client,/data-ff-matchup/);
  assert.match(client,/wScore/);
});

test('all featured players use real official FIBA portrait assets and profile links',()=>{
  const ids=['216915','191610','218988','266528','295079','300698','176575','235603'];
  for(const id of ids){
    assert.ok(article.includes(`person_${id}`)||client.includes(`id:'${id}'`),id);
    assert.ok(article.includes(`/${id}-`)||client.includes(`id:'${id}'`),`profile ${id}`);
  }
  assert.match(article,/All player photographs on this page are real official FIBA profile assets/);
  assert.doesNotMatch(article+client,/imagegen|generatedImage/i);
});

test('Final Four design collapses into an uncluttered mobile layout',()=>{
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/\.ff-player-grid(?:,\.ff-player-grid\.is-filtered)?\{grid-template-columns:1fr\}/);
  assert.match(css,/\.ff-matchup-tabs\{grid-template-columns:1fr\}/);
  assert.match(css,/\.ff-overall-board\{grid-template-columns:1fr\}/);
});
