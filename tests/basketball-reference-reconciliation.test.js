const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('2026 award pages use completed official winners without erasing pending categories',()=>{
  const data=read('trophy-data.js');
  for(const [name,team] of [
    ["A'ja Wilson",'Las Vegas Aces'],['Angel Reese','Atlanta Dream'],['Jessica Shepard','Dallas Wings'],
    ['Janelle Salaün','Golden State Valkyries'],['Olivia Miles','Minnesota Lynx'],['Cheryl Reeve','Minnesota Lynx']
  ]){
    assert.match(data,new RegExp(`year:'2026',name:${name.includes("'")?'"'+name+'"':"'"+name+"'"},team:'${team}'`),`${name} missing as a 2026 winner`);
  }
  assert.match(data,/current:\{year:'2025',name:'First and Second Teams'/);
  assert.match(data,/2026 selections pending/);
  assert.match(data,/2026 announcement pending/);
  assert.match(read('trophy-case.html'),/Basketball-Reference WNBA awards index/);
});

test('record rack is reconciled to final 2026 regular-season totals',()=>{
  const records=read('trophy-records-data.js');
  assert.match(records,/updatedAt: '2026-10-09'/);
  assert.match(records,/name:'Kelsey Mitchell',value:'1,086',detail:'2026'/);
  assert.match(records,/name:'Angel Reese',value:'521',detail:'2026'/);
  assert.match(records,/name:'Alyssa Thomas',value:'358',detail:'2026'/);
  assert.match(records,/name:'Rhyne Howard',value:'99',detail:'2026'/);
  assert.match(records,/name:'Olivia Miles',value:'790',detail:'2026 · Minnesota'/);
  assert.match(records,/name:'DeWanna Bonner',value:'577',detail:'Career games'/);
  assert.doesNotMatch(records,/2026 · ongoing/);

  const endpoint=read('api/record-leaders.js');
  assert.match(endpoint,/REGULAR_SEASON_ENDS/);
  assert.match(endpoint,/seasonIsComplete\(season\)/);
  assert.match(endpoint,/seasonDetail\(season/);

  const browser=read('trophy-records.js');
  assert.match(browser,/snapshotActiveNames/);
  assert.match(browser,/preserveVerifiedActiveState\(payload\.career\[board\.key\]\)/);
});

test('current basketball operations and team leadership replace stale officeholders',()=>{
  const culture=read('courtside-data.js');
  const guides=read('team-guides.js');
  const site=read('site.js');
  const executives=(culture.match(/^  \['[^\n]+',\s*'[^\n]+',\s*'[^\n]+',\s*'[^\n]+',\s*'https:\/\//gm)||[])
    .filter(row=>culture.indexOf(row)>culture.indexOf('const COURTSIDE_EXECUTIVES'));
  assert.ok(executives.length>=15,'the basketball-operations directory should cover all 15 teams');
  assert.match(culture,/\['Las Vegas Aces','Nikki Fargas','President & General Manager'/);
  assert.match(culture,/\['Los Angeles Sparks','Ariana Andonian','General Manager'/);
  assert.match(culture,/\['Washington Mystics','Jamila Wideman','General Manager'/);
  assert.match(guides,/gm:'Nikki Fargas'/);
  assert.match(guides,/gm:'Ariana Andonian', coach:'Vacant'/);
  assert.match(guides,/\['5×','League MVP','A’ja Wilson became the first five-time WNBA MVP in 2026\.'/);
  assert.doesNotMatch(site,/\['Lynne Roberts','Los Angeles Sparks'\]/);
  assert.match(site,/Ariana Andonian/);
});

test('team index preserves verified franchise lineage instead of merging Portland eras',()=>{
  const locker=read('locker-room-data.js');
  const tree=read('franchise-family-tree.html');
  const changes=read('franchise-changes.html');
  assert.match(locker,/Basketball-Reference WNBA team index/);
  assert.match(locker,/Portland Fire, original club/);
  assert.match(locker,/The 2026 Portland Fire is a new franchise using the historic name/);
  assert.match(tree,/Basketball-Reference groups the 2000–02 and 2026 Portland Fire seasons/);
  assert.match(changes,/does not treat that display choice as a continuous franchise/);
});
