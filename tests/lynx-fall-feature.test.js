const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('top-seed-first-out-lynx-2026.html');
const css=read('top-seed-first-out-lynx-2026.css');
const js=read('top-seed-first-out-lynx-2026.js');
const site=read('site.js');
const feed=JSON.parse(read('snack-shak-latest.json'));
const post=feed.posts.find(item=>item.slug==='top-seed-first-out-lynx-2026');

test('publishes the historic 8-over-1 upset as a Food for Thought feature',()=>{
  assert.ok(post,'historic Lynx-Liberty feature is missing from Snack Shak');
  assert.equal(post.type,'feature');
  assert.equal(post.published,'2026-09-30');
  assert.equal(post.dashboardUrl,'/top-seed-first-out-lynx-2026.html');
  assert.match(post.image,/^https:\/\/cdn\.wnba\.com\//);
  assert.match(html,/first No\. 8 to eliminate a No\. 1/i);
  assert.match(html,/NEW YORK \+32/);
  assert.match(html,/MINNESOTA 0:00/);
});

test('uses official WNBA photography and headshots only',()=>{
  assert.match(html,/https:\/\/cdn\.wnba\.com\/sites\/4\/2026\/09\/Game2NYL\.png/);
  assert.match(html,/Official game image via/);
  assert.match(js,/https:\/\/cdn\.wnba\.com\/headshots\/wnba\/latest\/1040x760/);
  assert.doesNotMatch(html+js+JSON.stringify(post),/(ai.generated|midjourney|dall-e|unsplash)/i);
});

test('includes interactive series, player and Collier decision dashboards',()=>{
  assert.match(html,/data-pulse-view="game2"/);
  assert.match(html,/data-player-filter="showed"/);
  assert.match(html,/data-player-filter="missing"/);
  assert.match(html,/data-phee-view="stay"/);
  assert.match(html,/data-phee-view="leave"/);
  assert.match(js,/const pulseViews=/);
  assert.match(js,/const players=/);
  assert.match(js,/const pheeViews=/);
  assert.match(css,/\.pulse-dashboard/);
  assert.match(css,/\.player-report-grid/);
  assert.match(css,/\.phee-meter/);
});

test('answers who showed up and who did not with verified Game 2 lines',()=>{
  for(const name of ['Jonquel Jones','Breanna Stewart','Sabrina Ionescu','Courtney Williams','Kayla McBride','Napheesa Collier','Olivia Miles','Natasha Howard']){
    assert.match(js,new RegExp(name),name+' is missing from the report card');
  }
  assert.match(js,/21 PTS · 13 REB · 6 OREB/);
  assert.match(js,/18 PTS · 8 REB · 5 AST/);
  assert.match(js,/5 PTS · 1 AST · 1\/8 FG · 17 MIN/);
  assert.match(js,/2 PTS · 5 REB · 2 BLK · 16 MIN/);
});

test('treats Collier departure as analysis rather than a reported decision',()=>{
  assert.match(html,/nobody outside her circle knows/i);
  assert.match(html,/Collier has not requested a trade, announced a departure/i);
  assert.match(html,/UNRESTRICTED FREE AGENT/);
  assert.match(html,/NO CORE TAG/);
  assert.match(html,/LEAN STAY/);
  assert.doesNotMatch(html,/Collier will leave/i);
});

test('adds breadcrumb, active-section and global search coverage',()=>{
  assert.match(site,/hierarchyMap\['\/top-seed-first-out-lynx-2026\.html'\]/);
  assert.match(site,/navSections\.snack\.push\('\/top-seed-first-out-lynx-2026\.html'\)/);
  assert.match(site,/Top Seed\. First Out\./);
  assert.match(site,/historic upset Napheesa Collier free agency/);
});

test('keeps public copy free of em dashes and has responsive layouts',()=>{
  assert.doesNotMatch(html+js,/—/);
  assert.match(css,/@media\(max-width:1000px\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/@media\(max-width:430px\)/);
});

