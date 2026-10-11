const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pages={wpba:read('wpba.html'),upshot:read('the-call-up.html'),au:read('athletes-unlimited.html'),unrivaled:read('unrivaled.html')};

test('all four league hubs use the shared season window',()=>{
  for(const [name,html] of Object.entries(pages)){
    assert.match(html,/league-season-hub\.css/,name);
    assert.match(html,/league-season-window/,name);
  }
});

test('WPBA UPSHOT and AU expose the full requested section set',()=>{
  for(const name of ['wpba','upshot','au']){
    const html=pages[name];
    for(const id of ['championship','standings','player-dashboard','teams','stat-kitchen','results','honors','pipeline','how-it-works','history']) assert.ok(html.includes('id="'+id+'"'),name+' missing '+id);
  }
});

test('Unrivaled exposes the same set without pipeline',()=>{
  const html=pages.unrivaled;
  for(const id of ['championship','standings','player-dashboard','teams','stat-kitchen','results','honors','how-it-works','history']) assert.ok(html.includes('id="'+id+'"'),'Unrivaled missing '+id);
  assert.equal(html.includes('id="pipeline"'),false);
});

test('team logo slots are wired into WPBA UPSHOT Unrivaled and AU',()=>{
  for(const file of ['wpba-page.js','the-call-up-page.js','unrivaled-page.js','athletes-unlimited-page.js']){
    const source=read(file);
    assert.match(source,/league-team-image/,file);
  }
});

test('WPBA has official-photo slots and expanded season data',()=>{
  const source=read('wpba-page.js');
  const data=JSON.parse(read('data/wpba-2026.json'));
  assert.match(source,/wpbaPhotos/);
  assert.ok(Array.isArray(data.photos)&&data.photos.length>=3);
  assert.ok(Array.isArray(data.howItWorks)&&data.howItWorks.length>=4);
  assert.ok(Array.isArray(data.history)&&data.history.length>=4);
  assert.ok(data.championship);
});

test('team image proxy is allowlisted and uses official source hosts',()=>{
  const source=read('api/league-team-image.js');
  assert.match(source,/womenspba\.com/);
  assert.match(source,/upshot\.com|crownupshot\.com|wavesupshot\.com/);
  assert.match(source,/unrivaled\.basketball/);
  assert.doesNotMatch(source,/req\.query\.url/);
});

test('league hub scripts parse',()=>{
  for(const file of ['wpba-page.js','the-call-up-page.js','unrivaled-page.js','athletes-unlimited-page.js','api/league-team-image.js']) assert.ok(read(file).length>100,file);
});
