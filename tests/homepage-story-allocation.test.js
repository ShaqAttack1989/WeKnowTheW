const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { selectStories, allocateStories, calendarWeek } = require('../homepage-fresh-stories.js');
const now = Date.parse('2026-11-08T19:00:00Z');
const story = (i, extra = {}) => ({ slug: `story-${i}`, title: `Story ${i}`, published: new Date(now - i * 86400000).toISOString(), type: i % 2 ? 'byte' : 'feature', ...extra });
const selected = plan => [...plan.newest, ...plan.weekly];

test('all homepage positions are distinct even when article feeds overlap', () => {
  const posts = Array.from({length: 30}, (_, i) => story(i));
  const plan = allocateStories(selectStories([posts, posts.slice(0, 20)], now), now);
  assert.equal(plan.newest.length, 3);
  assert.equal(plan.weekly.length, 4);
  assert.equal(plan.week.start, '2026-11-02');
  assert.equal(plan.week.end, '2026-11-09');
  const all = selected(plan);
  assert.equal(all.length, 7);
  assert.equal(new Set(all.map(p => p.slug)).size, all.length);
  assert.deepEqual(plan.newest.map(p => p.slug), posts.slice(0, 3).map(p => p.slug));
});

test('title punctuation, alternate slugs and dashboard URL variants identify the same story', () => {
  const posts = [
    story(0, {title:'The W’s Next Chapter!', updated:'2026-11-08T18:00:00Z'}),
    story(1, {title:'The W’s Next Chapter'}),
    story(2, {dashboardUrl:'/article.html?team=gs&season=2026#story'}),
    story(3, {dashboardUrl:'https://www.weknowthew.com/article.html?season=2026&team=gs&utm_source=home#top'}),
  ];
  assert.deepEqual(selectStories([posts], now).map(p=>p.slug), ['story-0','story-2']);
});

test('feed failures and small inventories leave empty positions instead of repeating articles', () => {
  const posts = [story(0), story(1), story(2, {draft:true}), story(3, {homepageHidden:true}), story(4, {published:'2026-11-10'}), story(5, {status:'scheduled'})];
  const plan = allocateStories(selectStories([[], posts], now));
  assert.equal(plan.newest.length, 2);
  assert.equal(plan.weekly.length, 0);
  assert.equal(selected(plan).length, 2);
});

test('concurrent sections and refreshes receive the same shared article plan', async () => {
  const events = [];
  let current = Array.from({length: 24}, (_,i) => story(i));
  let requests = 0;
  const document = {querySelector:()=>null,addEventListener:()=>{},hidden:false};
  const window = {document,addEventListener:()=>{},dispatchEvent:event=>events.push(event),WHomeData:{get:async()=>{requests++;await Promise.resolve();return {posts:current};}}};
  const context = {window,document,URL,Date,Map,Set,Promise,setInterval:()=>{},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
  vm.runInNewContext(fs.readFileSync('homepage-fresh-stories.js','utf8'), context);
  const plans = await Promise.all([window.WHomeStories.load(),window.WHomeStories.load(),window.WHomeStories.load()]);
  assert.equal(requests, 7);
  assert.strictEqual(plans[0], plans[1]);
  assert.strictEqual(plans[1], plans[2]);
  assert.equal(events.length, 1);
  current = [story(-1, {slug:'breaking-story',title:'New story',published:new Date().toISOString()}),...current];
  await window.WHomeStories.load();
  assert.equal(events.length, 2);
  const all = selected(events[1].detail);
  assert.equal(new Set(all.map(p=>p.slug)).size, all.length);
});

test('the shared selector loads once before both story consumers', () => {
  for(const file of ['index.html','site/index.html']){
    const html=fs.readFileSync(file,'utf8');
    assert.equal((html.match(/<script src="\/homepage-fresh-stories\.js/g)||[]).length,1);
    assert.ok(html.indexOf('src="/homepage-fresh-stories.js')<html.indexOf('src="/homepage-week-live.js'));
    assert.ok(html.indexOf('src="/homepage-fresh-stories.js')<html.indexOf('src="/homepage-desk.js'));
  }
});


test('current-week coverage excludes October articles even when they were updated this week', () => {
  const posts = [story(0),story(1),story(2),story(3),story(4),story(5),story(6),story(20,{updated:'2026-11-08',published:'2026-10-20'})];
  const plan=allocateStories(selectStories([posts],now),now);
  assert.deepEqual(plan.newest.map(p=>p.slug),['story-0','story-1','story-2']);
  assert.deepEqual(plan.weekly.map(p=>p.slug),['story-3','story-4','story-5','story-6']);
  assert.ok(!selected(plan).some(p=>p.slug==='story-20'));
});

test('calendar weeks roll over on Monday in New York, including daylight saving time', () => {
  assert.equal(calendarWeek(Date.parse('2026-11-09T04:59:59Z')).start,'2026-11-02');
  assert.equal(calendarWeek(Date.parse('2026-11-09T05:00:00Z')).start,'2026-11-09');
  assert.equal(calendarWeek(Date.parse('2026-07-06T03:59:59Z')).start,'2026-06-29');
  assert.equal(calendarWeek(Date.parse('2026-07-06T04:00:00Z')).start,'2026-07-06');
});

test('timestamped publications use their New York date and bare dates keep their stated day', () => {
  const plan=allocateStories(selectStories([[story(0),story(1),story(2),story(6,{slug:'sunday',title:'Sunday story',published:'2026-11-02T02:00:00Z'}),story(6,{slug:'monday',title:'Monday story',published:'2026-11-02'})]],now),now);
  assert.deepEqual(plan.weekly.map(p=>p.slug),['monday']);
});

test('homepage announcements and story sections contain the requested public copy', () => {
  const html=fs.readFileSync('index.html','utf8');
  assert.doesNotMatch(html,/Fresh Food for Thought and Snack Shak coverage, updated as new stories are published|Google Play|BROWSER TESTING IS OPEN|Both coming soon/);
  assert.match(html,/Play Run the W/);
  assert.match(html,/class="home-draft-countdown"/);
  assert.doesNotMatch(html,/id="freshNextStory"|id="freshMoreStories"/);
});
