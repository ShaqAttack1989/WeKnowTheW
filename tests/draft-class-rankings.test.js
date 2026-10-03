const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('wnba-draft-class-rankings.html');
const js=read('draft-class-rankings.js');
const css=read('draft-class-rankings.css');

test('draft history data lab names a winner and exposes movable ranking controls',()=>{
  assert.match(html,/best draft class in WNBA history is <em>2001/);
  assert.match(html,/data-metric="overall"/);
  assert.match(html,/data-metric="depth"/);
  assert.match(html,/data-era="foundation"/);
  assert.match(html,/W Score = 35% peak/);
  assert.doesNotThrow(()=>new Function(js));
});

test('playoff roster audit includes all four semifinal teams and correct Fever receipt',()=>{
  for(const team of ['Atlanta Dream','Las Vegas Aces','New York Liberty','Golden State Valkyries']) assert.match(js,new RegExp(team));
  assert.doesNotMatch(js,/Dallas Wings/);
  assert.match(html,/Fever did not have three No\. 1 picks/);
  assert.match(html,/Mitchell was <b>No\. 2 in 2018<\/b>/);
  assert.match(html,/Indiana’s playoff roster had six top-10 picks and two No\. 1s/);
  assert.match(html,/Las Vegas also had six top-10 picks—but three No\. 1s/);
});

test('visuals use official WNBA web assets and no generated imagery',()=>{
  const combined=`${html}\n${js}`;
  assert.match(combined,/https:\/\/cdn\.wnba\.com\/sites\/4\/2016\/03\/ljcover\.jpg/);
  assert.match(combined,/https:\/\/cdn\.wnba\.com\/headshots\/wnba\/latest/);
  assert.match(combined,/https:\/\/cdn\.wnba\.com\/logos\/wnba/);
  assert.doesNotMatch(combined,/(midjourney|dall-e|stable diffusion|ai generated)/i);
  assert.match(css,/\.class-grid/);
  assert.match(css,/\.playoff-team-grid/);
});

test('dashboard renders the all-time leader and computes live-roster totals',()=>{
  const element=()=>({innerHTML:'',textContent:'',hidden:true,addEventListener(){},querySelectorAll(){return[];},setAttribute(){}});
  const nodes={
    classLeader:element(),classGrid:element(),playoffTeamGrid:element(),topTenTotal:element(),numberOneTotal:element(),
    metricControls:element(),eraControls:element(),classSearch:element(),methodButton:element(),methodPanel:element()
  };
  const document={getElementById:id=>nodes[id]||null,querySelector:selector=>selector==='.playoff-sort'?element():null};
  vm.runInNewContext(js,{document,console});
  assert.match(nodes.classLeader.innerHTML,/Class of 2001/);
  assert.equal((nodes.classGrid.innerHTML.match(/class="class-card"/g)||[]).length,13);
  assert.equal((nodes.playoffTeamGrid.innerHTML.match(/class="playoff-team-card"/g)||[]).length,4);
  assert.equal(nodes.topTenTotal.textContent,21);
  assert.equal(nodes.numberOneTotal.textContent,6);
});
