const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');

const officialRoster=[
  'Olivia Miles',"Flau'jae Johnson",'Jessica Shepard','Kayla McBride','Kayla Thornton','Marine Johannès','Bridget Carleton','Gabby Williams',
  'Chelsea Gray','Marina Mabrey','Courtney Williams','Maddy Siegrist','Veronica Burton','Natasha Cloud','Paige Bueckers','Shakira Austin',
  'Dearica Hamby','Breanna Stewart','Skylar Diggins','Aliyah Boston','Ezi Magbegor','Rhyne Howard','Natisha Hiedeman','Lexie Hull',
  'Rickea Jackson','Tiffany Hayes','Cameron Brink','Kelsey Plum','Naz Hillmon','Kahleah Copper','Aziaha James','Rae Burrell',
  'Jackie Young','Kate Martin','Aaliyah Edwards','Temi Fagbenle','Arike Ogunbowale','Napheesa Collier','Brittney Sykes','Dominique Malonga',
  'Jordin Canada','Sonia Citron','Monique Billings','Allisha Gray','Li Yueru','DiJonai Carrington'
];

test('affiliation data carries the complete official 46-player Season 3 board',()=>{
  const data=JSON.parse(read('pro-offseason-affiliations.json'));
  const roster=data.unrivaled.season3Signed;
  assert.equal(data.unrivaled.nextSeason,2027);
  assert.equal(data.unrivaled.season3RosterStatus,'46 of 48 confirmed');
  assert.equal(roster.length,46);
  assert.equal(new Set(roster.map(row=>normalize(row[0]))).size,46);
  assert.deepEqual(roster.map(row=>normalize(row[0])),officialRoster.map(normalize));
  assert.ok(roster.every(row=>row[1]==='Club TBA'));
  assert.deepEqual(data.unrivaled.season3Statuses,[]);
  assert.ok(roster.some(row=>row[0]==='Rickea Jackson'));
});

test('Unrivaled hub renders the same roster plus two held seats',()=>{
  const source=read('unrivaled-page.js');
  const start=source.indexOf('const season3Roster=');
  const end=source.indexOf('];',start)+2;
  const context={};
  vm.runInNewContext(`${source.slice(start,end)};this.roster=season3Roster`,context);
  assert.equal(context.roster.length,46);
  assert.deepEqual(Array.from(context.roster,row=>normalize(row.name)),officialRoster.map(normalize));
  assert.match(source,/\['12C','12D'\]/);
  assert.match(source,/playerpedia\.html\?search=/);

  const html=read('unrivaled.html');
  assert.match(html,/id="tour"/);
  assert.match(html,/46 aboard\. Two seats held\./);
  assert.match(html,/unrivaled-on-tour-2027\.html/);
  assert.match(html,/roster-reveal\/2027#board/);
});

test('Playerpedia prefers the current 2027 roster over a former 2026 club',()=>{
  const badges=read('playerpedia-offseason-badges.js');
  assert.ok(badges.indexOf('if(future.has(k))')<badges.indexOf('else if(unrivaled.has(k))'));
  assert.match(badges,/2027 Season 3 roster/);

  const depth=read('playerpedia-depth.js');
  assert.match(depth,/const season3=\(aff\.unrivaled\?\.season3Signed/);
  assert.match(depth,/const unrivaled=season3\|\|/);
  const playerpedia=read('playerpedia.html');
  assert.ok((playerpedia.match(/20260911-unrivaled-roster-v1/g)||[]).length>=2);
});

test('Rickea Jackson no longer carries the superseded out-for-2027 label',()=>{
  const article=read('rickea-jackson-unrivaled-status.html');
  assert.match(article,/Officially Aboard|NOW ABOARD/);
  assert.match(article,/seat 07A/i);
  assert.doesNotMatch(article,/<strong>OUT<\/strong>|expected Season 4/i);
  const feed=JSON.parse(read('snack-shak-latest.json'));
  const update=feed.posts.find(post=>post.slug==='rickea-jackson-unrivaled-status');
  assert.equal(update.updated,'2026-09-11');
  assert.match(update.dek,/seat 07A/i);
});

test('tour feature uses official facts and real Unrivaled player photos',()=>{
  const article=read('unrivaled-on-tour-2027.html');
  for(const fact of ['JAN. 8','TD Garden','JAN. 22','Barclays Center','FEB. 15','Xfinity Mobile Arena','46 of 48']) assert.match(article,new RegExp(fact.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
  assert.match(article,/unrivaled\.basketball\/tours\/2027\/bus/);
  assert.match(article,/unrivaled\.basketball\/roster-reveal\/2027#board/);
  assert.ok((article.match(/roster-reveal\/headshots\//g)||[]).length>=3);
  assert.doesNotMatch(article,/imagegen|ai.generated/i);
  assert.ok(fs.existsSync(path.join(root,'unrivaled-tour-2027.css')));
});

test('tour story remains in the Food for Thought feed and is searchable',()=>{
  const feed=JSON.parse(read('snack-shak-latest.json'));
  const tour=feed.posts.find(post=>post.slug==='unrivaled-on-tour-2027');
  assert.ok(tour);
  assert.equal(tour.dashboardUrl,'/unrivaled-on-tour-2027.html');
  assert.match(tour.image,/unrivaled\.basketball\/roster-reveal\/headshots/);
  assert.match(read('homepage-week-live.js'),/snack-shak-latest\.json/);
  assert.match(read('index.html'),/homepage-week-live\.js/);

  const site=read('site.js');
  assert.match(site,/hierarchyMap\['\/unrivaled-on-tour-2027\.html'\]/);
  assert.match(site,/navSections\.offseason\.push\('\/unrivaled-on-tour-2027\.html'\)/);
  assert.match(site,/Three Cities, Two Games, One Bigger Bet/);
});
