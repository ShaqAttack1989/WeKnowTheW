const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const model = require('../playoff-ranking-model');
const page = require('../playoff-player-rankings');
const snapshot = require('../data/playoff-player-rankings-2026.json');
const root = path.resolve(__dirname, '..');
const player = (name, values = {}) => ({name,score:90,per:20,tsPct:.6,games:30,leaders:[],...values});
const leader = {id:'pts_per_g',label:'Scoring',unit:'PPG',value:25};
const names = players => model.rankPlayers(players).map(player => player.name);

test('numeric W score outranks leader status; sharing a letter is not a score tie', () => {
  assert.deepEqual(names([player('Leader',{score:90,letter:'A',leaders:[leader]}),player('Higher score',{score:91,letter:'A'})]),['Higher score','Leader']);
});
test('a leader wins an exact score tie even with lower PER and fewer games', () => {
  assert.deepEqual(names([player('Non-leader',{per:30,games:40}),player('Leader',{per:10,games:12,leaders:[leader]})]),['Leader','Non-leader']);
});
test('number of leading categories precedes PER', () => {
  assert.deepEqual(names([player('One',{per:30,leaders:[leader]}),player('Two',{per:10,leaders:[leader,{...leader,id:'blk_per_g'}]})]),['Two','One']);
});
test('remaining tiebreakers are PER, TS%, games and stable alphabetical display order', () => {
  assert.deepEqual(names([player('A'),player('B',{per:21})]),['B','A']);
  assert.deepEqual(names([player('A'),player('B',{tsPct:.61})]),['B','A']);
  assert.deepEqual(names([player('A'),player('B',{games:31})]),['B','A']);
  const ranked=model.rankPlayers([player('Zoe'),player('Anna')]);
  assert.equal(ranked[0].name,'Anna'); assert.match(ranked[0].tieNote,/Statistically tied/);
});
test('missing scores remain unranked, never converted to zero or ranked by PER', () => {
  const ranked=model.rankPlayers([player('Missing',{score:null,per:40}),player('Valid',{score:55}),player('Undefined',{score:undefined})]);
  assert.equal(ranked[0].name,'Valid');assert.equal(ranked[0].rank,1);
  assert.deepEqual(ranked.slice(1).map(p=>p.rank),[null,null]);
});
test('missing tiebreaker data sorts after known data without producing NaN', () => {
  assert.equal(model.decision(player('A',{per:null}),player('B',{per:0})).order,1);
  assert.equal(model.decision(player('A',{per:null}),player('B',{per:null})).order,-1);
});
test('co-leaders must have published rank one; equal rounded numbers do not qualify', () => {
  const categories={assists:{label:'Assists',unit:'APG',leaders:[{name:'First',rank:1,value:8.3},{name:'Second',rank:2,value:8.3},{name:'Co-leader',rank:1,value:8.3}]}};
  assert.equal(model.leadersFor('First',categories).length,1);
  assert.equal(model.leadersFor('Second',categories).length,0);
  assert.equal(model.leadersFor('Co-leader',categories).length,1);
});
test('league leader on an eliminated club is not reassigned to a playoff player', () => {
  assert.equal(model.leadersFor('Alyssa Thomas',snapshot.leagueLeaders).find(x=>x.id==='ast_per_g').value,8.3);
  assert.equal(model.leadersFor('Caitlin Clark',snapshot.leagueLeaders).some(x=>x.id==='ast_per_g'),false);
});
test('accent, apostrophe and known roster aliases resolve consistently', () => {
  assert.equal(model.key('A’ja Wilson'),model.key("A'ja Wilson"));
  assert.equal(model.key('Janelle Salaün'),model.key('Janelle Salaun'));
  assert.equal(model.key('Alicia Flórez Getino'),model.key('Alicia Florez'));
  assert.equal(model.key('Anastasiia Olairi Kosu'),model.key('Anastasiia Kosu'));
  assert.equal(model.key('Raquel Carrera'),model.key('Raquel Carrera Quintana'));
});
test('every official roster member is present once, with complete image and club routes', () => {
  assert.equal(snapshot.teams.length,8);assert.ok(snapshot.teams.every(t=>t.status==='clinched'));
  assert.equal(snapshot.players.length,112);assert.equal(new Set(snapshot.players.map(p=>p.id)).size,112);
  assert.equal(new Set(snapshot.players.map(p=>model.key(p.name))).size,112);
  assert.equal(snapshot.players.filter(p=>p.rank!==null).length,105);
  for(const p of snapshot.players){assert.ok(snapshot.teams.some(t=>t.slug===p.teamSlug));assert.match(p.photo,/^https:\/\//);assert.ok(p.name);}
  assert.ok(snapshot.teams.every(t=>/^https:\/\//.test(t.logo)));
});
test('Atlanta changes and Dallas Laksa addition are reflected without fake grades', () => {
  assert.equal(snapshot.players.some(p=>['Aaliyah Nye','Jaylyn Sherrod','Azzi Fudd'].includes(p.name)),false);
  const bonner=snapshot.players.find(p=>p.name==='DeWanna Bonner');
  assert.equal(bonner.team,'Atlanta Dream');assert.equal(bonner.number,'24');assert.match(bonner.note,/Phoenix/);
  const laksa=snapshot.players.find(p=>p.name==='Kitija Laksa');assert.equal(laksa.team,'Dallas Wings');assert.equal(laksa.score,null);
  assert.equal(snapshot.players.find(p=>p.name==='Anastasiia Olairi Kosu').score,75);
  assert.equal(snapshot.players.find(p=>p.name==='Raquel Carrera').score,68);
});
test('published ordering demonstrates the actual league-leader tiebreakers', () => {
  for(const [score,first] of [[93,'Jackie Young'],[92,'Rhyne Howard'],[91,'Kelsey Mitchell'],[88,'Angel Reese']]){
    assert.equal(model.rankPlayers(snapshot.players).find(p=>p.score===score).name,first);
  }
});
test('filters preserve overall rank, accept name punctuation and support empty results', () => {
  const ranked=model.rankPlayers(snapshot.players);
  const atlanta=model.filterPlayers(ranked,{team:'atlanta-dream'});
  assert.equal(atlanta.length,13);assert.equal(atlanta[0].rank,11);
  assert.equal(model.filterPlayers(ranked,{search:'Aja Wilson'})[0].rank,1);
  assert.equal(model.filterPlayers(ranked,{search:'Salaün'})[0].name,'Janelle Salaun');
  assert.equal(model.filterPlayers(ranked,{search:'not a player'}).length,0);
  assert.ok(model.filterPlayers(ranked,{leadersOnly:true}).every(p=>p.leaders.length>0));
  assert.equal(model.filterPlayers(ranked,{team:'minnesota-lynx',leadersOnly:true}).length,0);
});
test('static HTML and embedded data reproduce the complete board without a network call', () => {
  const html=fs.readFileSync(path.join(root,'playoff-player-rankings.html'),'utf8');
  assert.equal((html.match(/<tr data-player-id=/g)||[]).length,112);
  assert.equal((html.match(/class="pr-team-card"/g)||[]).length,8);
  const embedded=JSON.parse(html.match(/<script type="application\/json" id="playoffSnapshot">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(embedded,snapshot);
  assert.ok(html.includes(page.rows(model.rankPlayers(snapshot.players),snapshot)));
  assert.match(html,/not final playoff seeds/);assert.match(html,/dated editorial edition/);
  assert.ok(!fs.readFileSync(path.join(root,'playoff-player-rankings.js'),'utf8').includes('fetch('));
});
test('rendering escapes content, preserves zero and distinguishes missing values', () => {
  const p={...snapshot.players[0],name:'<unsafe>',ppg:0,apg:null};
  const html=page.rows([p],snapshot);
  assert.ok(!html.includes('<unsafe>'));assert.ok(html.includes('&lt;unsafe&gt;'));
  assert.match(html,/data-label="PPG">0\.0<\/td>/);assert.match(html,/data-label="APG">—<\/td>/);
});

async function rosterWithProvider(players=[],allTeams=snapshot.teams.map((t,i)=>({name:t.name,id:String(i)}))) {
  const file=path.join(root,'api/players.js');
  const localRequire=createRequire(file);
  const provider={getWnbaRosters:async(season)=>({players:season===2026?players:[],teams:allTeams}),getWnbaInjuries:async()=>[],getWnbaTransactions:async()=>[]};
  const context={module:{exports:{}},require:id=>id==='../lib/wehoop-espn'?provider:localRequire(id),Date,URL,console};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
  const res={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await context.module.exports({method:'GET'},res);assert.equal(res.code,200);return res.body;
}
test('shared roster API keeps waived players searchable but off Atlanta, including provider fallback', async () => {
  const response=await rosterWithProvider();
  for(const name of ['Aaliyah Nye','Jaylyn Sherrod']){
    const p=response.players.find(p=>p.name===name);assert.ok(p);assert.equal(p.currentRoster,false);assert.equal(p.liveStatus,'waived');assert.equal(p.lastTeam,'Atlanta Dream');
  }
  const bonner=response.players.find(p=>p.name==='DeWanna Bonner');assert.equal(bonner.currentRoster,true);assert.equal(bonner.team,'Atlanta Dream');assert.equal(bonner.number,'24');
  const laksa=response.players.find(p=>p.name==='Kitija Laksa');assert.equal(laksa.currentRoster,true);assert.equal(laksa.team,'Dallas Wings');assert.equal(laksa.wnbaId,'1629490');assert.match(laksa.photo,/1629490\.png$/);
});

test('client team, search, leader and reset controls update the real renderer', () => {
  const nodes={};
  const element=id=>nodes[id]||(nodes[id]={value:'',checked:false,hidden:false,disabled:true,dataset:{},handlers:{},addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(name,value){this[name]=value;},focus(){},scrollIntoView(){}});
  for(const id of ['playoffSnapshot','playoffSearch','playoffTeam','playoffLeadersOnly','playoffReset','playoffRows','playoffResults','playoffEmpty','playoffTable','rankings'])element(id);
  nodes.playoffSnapshot.textContent=JSON.stringify(snapshot);
  const buttons=snapshot.teams.map(team=>Object.assign(element(team.slug),{dataset:{teamFilter:team.slug}}));
  const document={getElementById:element,querySelectorAll:selector=>selector.includes('data-playoff-control')?[nodes.playoffSearch,nodes.playoffTeam,nodes.playoffLeadersOnly,nodes.playoffReset,...buttons]:buttons,addEventListener(){}};
  const context={WPlayoffRanking:model,document,URLSearchParams,location:{pathname:'/playoff-player-rankings.html',search:'?team=Atlanta%20Dream',hash:'#rankings'},history:{replaceState(_a,_b,url){this.url=url;}}};
  context.globalThis=context;
  vm.runInNewContext(fs.readFileSync(path.join(root,'playoff-player-rankings.js'),'utf8'),context);
  assert.equal(nodes.playoffTeam.value,'atlanta-dream');assert.match(nodes.playoffResults.textContent,/13 ranked/);
  assert.ok(!nodes.playoffRows.innerHTML.includes('Aaliyah Nye'));
  nodes.playoffSearch.value='No Such Player';nodes.playoffSearch.handlers.input();assert.equal(nodes.playoffEmpty.hidden,false);assert.equal(nodes.playoffTable.hidden,true);
  nodes.playoffReset.handlers.click();assert.equal(nodes.playoffTable.hidden,false);assert.match(nodes.playoffResults.textContent,/112 of 112/);
  nodes.playoffLeadersOnly.checked=true;nodes.playoffLeadersOnly.handlers.change();assert.ok(nodes.playoffRows.innerHTML.includes('Jackie Young'));assert.ok(!nodes.playoffRows.innerHTML.includes(`data-player-id="${snapshot.players.find(p=>p.name==='Jessica Shepard').id}"`));assert.match(context.history.url,/leaders=1/);
  buttons.find(b=>b.dataset.teamFilter==='dallas-wings').handlers.click();assert.equal(nodes.playoffLeadersOnly.checked,false);assert.match(nodes.playoffResults.textContent,/15 of 112/);assert.ok(nodes.playoffRows.innerHTML.includes('Kitija Laksa'));
});

test('shared roster correction also overrides a complete but stale provider roster', async () => {
  const {OFFICIAL_ROSTER_SNAPSHOT}=require('../lib/official-roster-snapshot');
  const stale=OFFICIAL_ROSTER_SNAPSHOT.map(p=>({...p,id:p.wnbaId}));
  const teams=[...new Set(stale.map(p=>p.team))].map((name,i)=>({name,id:String(i)}));
  assert.ok(stale.length>=120 && teams.length>=12);
  const response=await rosterWithProvider(stale,teams);
  assert.equal(response.liveRosterCoverage.players,stale.length);
  assert.equal(response.players.find(p=>p.name==='Aaliyah Nye').currentRoster,false);
  assert.equal(response.players.find(p=>p.name==='Jaylyn Sherrod').currentRoster,false);
  assert.equal(response.players.find(p=>p.name==='DeWanna Bonner').team,'Atlanta Dream');
});
