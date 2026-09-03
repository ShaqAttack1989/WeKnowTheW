const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const page=fs.readFileSync(path.join(root,'season-yearbooks.html'),'utf8');
const client=fs.readFileSync(path.join(root,'season-yearbooks.js'),'utf8');
const vault=fs.readFileSync(path.join(root,'w-vault.html'),'utf8');
const freeze=fs.readFileSync(path.join(root,'scripts','freeze-season-yearbook.mjs'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github','workflows','season-yearbook-freeze.yml'),'utf8');
const tx=fs.readFileSync(path.join(root,'api','yearbook-transactions.js'),'utf8');

test('The W Rewind is a permanent W Vault season archive',()=>{
  assert.match(page,/THE W <em>REWIND<\/em>/);
  assert.match(page,/Season Yearbooks/i);
  assert.match(page,/id="yearbookShelf"/);
  assert.match(vault,/href="\/season-yearbooks\.html"/);
  assert.match(vault,/The W Rewind/);
});

test('yearbooks cover the full WNBA era and requested record categories',()=>{
  assert.match(client,/FIRST_SEASON=1997/);
  assert.match(client,/standingsPanel/);
  assert.match(client,/rostersPanel/);
  assert.match(client,/leadersPanel/);
  assert.match(client,/awardsPanel/);
  assert.match(client,/transactionPanel/);
  assert.match(client,/rankingPanel/);
  assert.match(client,/rotationPanel/);
  assert.match(client,/Snack Shak/i);
  assert.match(client,/Starting Five \+ Bench Mob/);
});

test('editorial history is not fabricated before We Know the W coverage',()=>{
  assert.match(client,/EDITORIAL_START=2026/);
  assert.match(client,/No retrospective Shak ranking or rotation is being backfilled/);
});

test('completed books freeze once and are not automatically rewritten',()=>{
  assert.match(freeze,/already frozen\. No rewrite permitted/);
  assert.match(freeze,/frozen:true/);
  assert.match(freeze,/does not yet have a completed Finals series/);
  assert.match(workflow,/11,12/);
  assert.match(workflow,/data\/season-yearbooks/);
});

test('historical transaction helper uses archival public sources rather than WNBA API',()=>{
  assert.match(tx,/basketball-reference\.com/);
  assert.match(tx,/r\.jina\.ai/);
  assert.doesNotMatch(tx,/stats\.wnba\.com/);
});
