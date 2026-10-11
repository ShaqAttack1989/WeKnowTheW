const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const curated=JSON.parse(fs.readFileSync(path.join(root,'data','playerpedia-depth-curated.json'),'utf8'));
const depth=fs.readFileSync(path.join(root,'playerpedia-depth.js'),'utf8');
const teamFeed=fs.readFileSync(path.join(root,'team-feed-updates.js'),'utf8');
const teamGuides=fs.readFileSync(path.join(root,'team-guides.js'),'utf8');

test('eleven milestone subjects have sourced Playerpedia Latest Record cards',()=>{
  const expected={
    ajawilson:'1,021',
    alyssathomas:'30',
    angelreese:'515',
    breannastewart:'6,860',
    flaujaejohnson:'6',
    kelseymitchell:'1,056',
    lisaleslie:'2ND',
    nnekaogwumike:'8,013',
    oliviamiles:'790',
    rhynehoward:'NO. 1',
    suebird:'1ST'
  };
  for(const [player,value] of Object.entries(expected)){
    const milestone=curated.players[player]?.latestMilestone;
    assert.ok(milestone,`${player} missing latest milestone`);
    assert.equal(milestone.value,value);
    assert.ok(milestone.headline.length>20,`${player} missing milestone context`);
    const sources=milestone.sources||[{url:milestone.source}];
    assert.ok(sources.some(source=>/^https:\/\//.test(source.url||'')),`${player} missing milestone source`);
  }
  assert.match(depth,/function latestMilestoneCard/);
  assert.match(depth,/LATEST RECORD/);
  assert.match(depth,/deep-milestone-stat/);
});

test('all eight affected franchise pages receive the reconciled milestone feed',()=>{
  for(const slug of ['atlanta-dream','indiana-fever','las-vegas-aces','los-angeles-sparks','minnesota-lynx','new-york-liberty','phoenix-mercury','seattle-storm']){
    assert.match(teamFeed,new RegExp(`'${slug}'\\s*:\\s*\\[`),`${slug} missing curated feed`);
  }
  for(const value of ['1,021','1,056','515','6,860','8,013','790','combined steals and blocks','30th','sixth 25-point game']){
    assert.match(teamFeed,new RegExp(value.replace(',','[,]')));
  }
});

test('the two statue milestones are retained in permanent franchise history',()=>{
  assert.match(teamGuides,/Lisa Leslie in bronze/);
  assert.match(teamGuides,/Sue Bird in bronze/);
  assert.match(teamGuides,/second WNBA player honored with a statue/);
  assert.match(teamGuides,/first WNBA player honored with a statue/);
});
