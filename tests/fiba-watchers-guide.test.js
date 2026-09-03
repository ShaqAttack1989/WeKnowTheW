const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const guide=fs.readFileSync(path.join(root,'fiba-watchers-guide.html'),'utf8');
const css=fs.readFileSync(path.join(root,'fiba-watchers-guide.css'),'utf8');
const hub=fs.readFileSync(path.join(root,'fiba-world-cup.html'),'utf8');
const photos=fs.readFileSync(path.join(root,'api','fiba-guide-photo.js'),'utf8');

test('FIBA guide is discoverable from the live World Cup hub',()=>{
  assert.ok(hub.includes('fiba-watchers-guide.html'));
  assert.ok(hub.includes('Jet Lag &amp; Jump Shots'));
});

test('guide covers the requested watcher essentials',()=>{
  for(const value of ['JET LAG','THE GROUPS','WNBA PASSPORT STAMP','SAME PLAYER · DIFFERENT JOB','TEAM USA · DRIVE FOR FIVE','GAMES TO CIRCLE',"WATCH LIKE IT'S FIBA"]) assert.ok(guide.includes(value),value);
  for(const group of ['Spain · Germany · Japan · Mali','France · Hungary · Nigeria · Korea','Belgium · Australia · Türkiye · Puerto Rico','USA · China · Italy · Czechia']) assert.ok(guide.includes(group),group);
});

test('guide uses official FIBA team photo feed and source links',()=>{
  for(const team of ['usa','france','spain','belgium','australia','germany']) assert.ok(guide.includes('fiba-guide-photo?team='+team),team);
  assert.ok(photos.includes('fiba.basketball'));
  assert.ok(photos.includes('og:image'));
});

test('article reading text stays at 16px equivalent or larger',()=>{
  assert.ok(css.includes('font-size:1rem'));
  assert.ok(css.includes('font-size:1.2rem'));
});

test('guide keeps current Team USA replacements and schedule',()=>{
  assert.ok(guide.includes("A'ja Wilson and Kelsey Plum are out"));
  assert.ok(guide.includes('Sonia Citron plus Kiki Iriafen'));
  assert.ok(guide.includes('USA vs. China'));
  assert.ok(guide.includes('8:15 AM ET'));
  assert.ok(guide.includes('USA vs. Italy'));
  assert.ok(guide.includes('USA vs. Czechia'));
});

test('photo endpoint has an allowlist and no arbitrary URL fetch',()=>{
  assert.ok(photos.includes('TEAM_SOURCES'));
  assert.equal(photos.includes('req.query.url'),false);
});
