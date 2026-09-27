const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const latest=JSON.parse(fs.readFileSync(path.join(root,'snack-shak-latest.json'),'utf8'));
const curated=JSON.parse(fs.readFileSync(path.join(root,'data','playerpedia-depth-curated.json'),'utf8'));
const collections=fs.readFileSync(path.join(root,'snack-shak-collections.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'snack-shaq.css'),'utf8');
const playerDepth=fs.readFileSync(path.join(root,'playerpedia-depth.js'),'utf8');
const teamFeed=fs.readFileSync(path.join(root,'team-feed-updates.js'),'utf8');

const post=latest.posts.find(item=>item.slug==='four-for-aja-2026-ap-awards');

test('the 2026 AP article carries the complete interactive award record',()=>{
  assert.ok(post,'AP awards feature missing from Food for Thought');
  assert.equal(post.type,'feature');
  assert.equal(post.published,'2026-09-27');
  assert.match(post.image,/^https:\/\/cdn\.wnba\.com\//);
  assert.equal(post.apAwardsDashboard.winners.length,7);
  assert.equal(post.apAwardsDashboard.history.length,7);
  for(const category of post.apAwardsDashboard.history){
    assert.equal(category.seasons.length,11,`${category.label} should cover 2016–2026`);
    assert.equal(category.seasons[0].year,2026);
    assert.equal(category.seasons.at(-1).year,2016);
  }
  const leaders=Object.fromEntries(post.apAwardsDashboard.history.map(category=>{
    const counts=new Map();
    category.seasons.flatMap(season=>season.winners).forEach(name=>counts.set(name,(counts.get(name)||0)+1));
    const high=Math.max(...counts.values());
    return [category.key,{high,names:[...counts].filter(([,count])=>count===high).map(([name])=>name).sort(),recipients:counts.size}];
  }));
  assert.deepEqual(leaders.player,{high:4,names:["A'ja Wilson"],recipients:6});
  assert.deepEqual(leaders.defense,{high:3,names:["A'ja Wilson",'Sylvia Fowles'],recipients:7});
  assert.deepEqual(leaders.sixth,{high:2,names:['Dearica Hamby'],recipients:10});
  assert.deepEqual(leaders.coach,{high:3,names:['Cheryl Reeve'],recipients:8});
  assert.equal(leaders.rookie.recipients,11);
  assert.equal(leaders.comeback.recipients,12);
  assert.equal(leaders.improved.recipients,11);
  assert.deepEqual(post.apAwardsDashboard.ballots.map(group=>group.players.length),[5,5,6]);
  assert.match(post.apAwardsDashboard.methodology,/not the WNBA's separately announced official league awards/i);
});

test('the AP dashboard computes leaders and uses only official WNBA imagery',()=>{
  assert.match(collections,/function apHistoryPanel/);
  assert.match(collections,/const counts=new Map/);
  assert.match(collections,/data-ap-winner-filter/);
  assert.match(collections,/data-ap-history-tab/);
  assert.match(collections,/data-ap-ballot-tab/);
  assert.match(styles,/\.ap-awards-dashboard/);
  assert.match(styles,/\.ap-history-timeline/);
  assert.match(styles,/\.ap-winner-receipt\{display:flex;flex-wrap:wrap/);
  assert.match(styles,/@media\(max-width:620px\)[\s\S]*\.ap-winner-receipt\{align-items:flex-start;flex-direction:column\}/);

  const photos=[post.image,post.storyImage];
  for(const winner of post.apAwardsDashboard.winners){
    photos.push(winner.photo||`https://cdn.wnba.com/headshots/wnba/latest/260x190/${winner.id}.png`);
  }
  for(const ballot of post.apAwardsDashboard.ballots){
    for(const player of ballot.players)photos.push(player.photo||`https://cdn.wnba.com/headshots/wnba/latest/260x190/${player.id}.png`);
  }
  assert.ok(photos.every(url=>/^https:\/\/cdn\.wnba\.com\//.test(url)),'every displayed award photo must come from the official WNBA CDN');
  assert.doesNotMatch(JSON.stringify(post),/(ai generated|midjourney|dall-e|unsplash|gettyimages\.com)/i);
});

test('all 17 AP-honored players have sourced Playerpedia award cards',()=>{
  const players=['ajawilson','angelreese','oliviamiles','caitlinclark','jessicashepard','janellesalaun','kelseymitchell','breannastewart','rhynehoward','paigebueckers','jackieyoung','gabbywilliams','azzifudd','sydneytaylor','flaujaejohnson','paulineastier','kikirice'];
  for(const player of players){
    const award=curated.players[player]?.latestAward;
    assert.ok(award,`${player} missing latestAward`);
    assert.equal(award.date,'2026-09-27');
    assert.ok(award.headline.length>15,`${player} missing award headline`);
    const sources=award.sources||[{url:award.source}];
    assert.ok(sources.some(source=>/^https:\/\//.test(source.url||'')),`${player} missing award source`);
  }
  assert.match(playerDepth,/function latestAwardCard/);
  assert.match(playerDepth,/deep-award-ribbon/);
});

test('all ten represented team pages receive their AP award update',()=>{
  const teams=['las-vegas-aces','atlanta-dream','minnesota-lynx','indiana-fever','dallas-wings','golden-state-valkyries','new-york-liberty','seattle-storm','chicago-sky','toronto-tempo'];
  for(const team of teams){
    assert.match(teamFeed,new RegExp(`'${team}'\\s*:\\s*\\[`),`${team} missing AP award update`);
  }
  for(const name of ["A'ja Wilson",'Angel Reese','Olivia Miles','Caitlin Clark','Jessica Shepard','Janelle Salaün','Cheryl Reeve']){
    assert.ok(teamFeed.includes(name),`${name} missing from team award feed`);
  }
  assert.match(teamFeed,/const manual=\[\.\.\.\(AP_AWARDS\[slug\]\|\|\[\]\),\.\.\.\(CURATED\[slug\]\|\|\[\]\)\]/);
});
