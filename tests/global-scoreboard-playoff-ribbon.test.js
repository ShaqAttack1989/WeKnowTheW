const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('global scoreboard bootstraps the current semifinal slate before network fetches finish',()=>{
  const source=read('global-scoreboard.js');
  assert.match(source,/BOOTSTRAP_PLAYOFF_GAMES/);
  assert.match(source,/id:'1042600201'.*homeScore:92,awayScore:82.*status:'Final'.*completed:true/);
  assert.match(source,/2026-gsv-lva-sf-g1/);
  assert.match(source,/2026-nyl-atl-sf-g4/);
  assert.match(source,/2026-gsv-lva-sf-g5/);
  assert.match(source,/render\(\);\s*refreshBase\(\);refreshLive\(\);/);
});

test('playoff ribbon shows multi-date game cards with stage, game number and broadcast',()=>{
  const source=read('global-scoreboard.js');
  assert.match(source,/w-score-game-stage/);
  assert.match(source,/w-score-game-network/);
  assert.match(source,/GAME \$\{gameNo\}/);
  assert.match(source,/return mergeSlate\(active,future\)\.slice\(0,10\)/);
  assert.match(source,/if\(!direct\)return 'TBD'/);
});

test('competition fallback contains optional semifinal Games 4 and 5',()=>{
  const source=read('api/competition.js');
  assert.match(source,/2026-nyl-atl-sf-g4/);
  assert.match(source,/2026-lva-gsv-sf-g4/);
  assert.match(source,/2026-atl-nyl-sf-g5/);
  assert.match(source,/2026-gsv-lva-sf-g5/);
  assert.match(source,/conditional:true/);
});
