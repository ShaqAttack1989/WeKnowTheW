const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const page=fs.readFileSync(path.join(root,'playerpedia.html'),'utf8');
const client=fs.readFileSync(path.join(root,'playerpedia-depth.js'),'utf8');
const css=fs.readFileSync(path.join(root,'playerpedia-depth.css'),'utf8');
const curated=JSON.parse(fs.readFileSync(path.join(root,'data','playerpedia-depth-curated.json'),'utf8'));
const draft=JSON.parse(fs.readFileSync(path.join(root,'data','wnba-draft-history.json'),'utf8'));

test('Playerpedia opens a seven-part Deep File without adding a second directory',()=>{
  assert.match(page,/Open a player for the Deep File/i);
  assert.match(page,/playerpedia-depth\.css/);
  assert.match(page,/playerpedia-depth\.js/);
  for(const label of ['SAY THE NAME','DRAFT FILE','FRANCHISE TRAIL','COLLEGE + INTERNATIONAL','HARDWARE + HIGHLIGHTS','REMEMBER THIS','BEYOND THE LINES']){
    assert.match(client,new RegExp(label.replace(/[+]/g,'\\+')));
  }
  assert.doesNotMatch(page,/deep-file-directory/i);
});

test('instructional placeholder language is removed from the public Deep File',()=>{
  assert.doesNotMatch(client,/More than a directory entry\./i);
  assert.doesNotMatch(client,/A separate accomplishment list is still being researched/i);
  assert.doesNotMatch(client,/No verified WNBA draft selection is attached/i);
  assert.doesNotMatch(client,/No verified pronunciation guide has been added/i);
});

test('deep profiles work across current, recent and retired Playerpedia sources',()=>{
  assert.match(client,/\/api\/players/);
  assert.match(client,/window\.WPlayerpediaLegacy/);
  assert.match(client,/currentRoster===false/);
  assert.match(client,/lastWnbaSeason/);
});

test('draft history recognizes both drafted and undrafted players',()=>{
  assert.match(client,/wnba-draft-history\.json/);
  assert.ok(Array.isArray(draft.picks));
  assert.ok(draft.picks.length>100,'draft history should remain substantial');
  assert.ok(Array.isArray(draft.undrafted));
  assert.ok(draft.undrafted.length>20,'undrafted ledger should remain substantial');
  assert.match(client,/draft\?\.undrafted/);
  assert.match(client,/status:'undrafted'/);
});

test('pronunciation uses verified written guides or linked audio instead of guessed phonetics',()=>{
  assert.equal(curated.rules.pronunciation.includes('Never infer pronunciation'),true);
  assert.match(client,/teamPronunciationUrl/);
  assert.match(client,/Team pronunciation guide/);
  assert.match(client,/does not invent one/);
  for(const name of ['ajawilson','nnekaogwumike','dearicahamby','ndjakalengamwenentanda']){
    assert.ok(curated.players[name]?.pronunciation,`${name} missing pronunciation`);
    assert.ok(/^https:\/\//.test(curated.players[name]?.pronunciationSource||''),`${name} missing pronunciation source`);
  }
});

test('Rebecca Allen Deep File is fully researched from current public sources',()=>{
  const rebecca=curated.players.rebeccaallen;
  assert.ok(rebecca);
  assert.ok(/^https:\/\//.test(rebecca.pronunciationSource));
  assert.equal(rebecca.entry.status,'Undrafted free agent');
  assert.equal(rebecca.entry.team,'New York Liberty');
  assert.equal(rebecca.franchiseTrail.length,5);
  assert.ok(rebecca.collegeInternational.clubs.length>=8);
  assert.ok(rebecca.collegeInternational.nationalTeam.length>=5);
  assert.ok(rebecca.achievements.length>=6);
  assert.ok(rebecca.memorable.length>80);
  assert.ok(rebecca.offCourt.includes('Master'));
});

test('documented nicknames carry sources',()=>{
  const expected={allishagray:'Gold Medal Lish',chelseagray:'Point Gawd',napheesacollier:'Phee',jewellloyd:'Gold Mamba',candaceparker:'Ace',natishahiedeman:'StudBudz (duo)',rebeccaallen:'Bec'};
  for(const [name,nickname] of Object.entries(expected)){
    assert.equal(curated.players[name]?.nickname,nickname);
    assert.ok(/^https:\/\//.test(curated.players[name]?.nicknameSource||''),`${name} missing nickname source`);
  }
  assert.match(client,/Nickname source/);
});

test('accomplishments use curated research, source honours, biography milestones or verified career fallbacks',()=>{
  assert.match(client,/function achievements\(detail,curated=\{\},fact='',draft=null\)/);
  assert.match(client,/achievementSentences/);
  assert.match(client,/factLooksLikeAchievement/);
  assert.match(client,/Reached the WNBA as an undrafted player/);
});

test('college and international depth includes current pro affiliations and former non-WNBA teams',()=>{
  assert.match(client,/function internationalTrail/);
  assert.match(client,/TEAM USA/);
  assert.match(client,/UNRIVALED/);
  assert.match(client,/ATHLETES UNLIMITED/);
  assert.match(client,/Club \/ international trail/);
  assert.match(client,/National team/);
});

test('Deep File reading text respects the site article-size accessibility floor',()=>{
  assert.match(css,/\.deep-bio-card p,\.deep-bio-card li,\.deep-bio-card small,\.deep-bio-card a\{font-size:1rem/);
});

test('deep bio layer does not depend on the prohibited WNBA stats API',()=>{
  assert.doesNotMatch(client,/stats\.wnba\.com/i);
  assert.doesNotMatch(client,/wnba-official-stats/i);
});
