const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const M=require('../team-stat-leaders-model');
const page=require('../team-stat-leaders');
const {parseTotals,complete,fetchTotals}=require('../lib/team-player-totals');
const saved=require('../data/team-player-totals-2026.json');
const root=path.resolve(__dirname,'..');
const row=(name,extra={})=>({name,team:'ATL',g:10,mp:200,pts:100,trb:40,ast:30,stl:10,blk:5,fg:40,fga:80,fg3:10,fg3a:25,ft:10,fta:20,...extra});
const player=(name,extra={})=>({name,team:'Atlanta Dream',wnbaId:name,photo:'https://example.com/player.png',currentRoster:true,...extra});
const card=(rows,players,id='ppg')=>M.build('Atlanta Dream',rows,players).cards.find(c=>c.id===id);
function htmlRow(r,broken=false){return `<tr><th data-stat="player"><strong><a>${r.name}</a>${broken?'</strong':'</strong>'}</th>${Object.entries(r).filter(([key])=>key!=='name').map(([key,value])=>`<td data-stat="${key}">${value??''}</td>`).join('')}</tr>`;}

test('public-table parser handles nested and malformed name tags without losing accents',()=>{
  const parsed=parseTotals(htmlRow(row('Janelle Salaün'),true));assert.equal(parsed[0].name,'Janelle Salaün');assert.equal(parsed[0].pts,100);
});
test('parser removes combined and unknown-team rows, normalizes Phoenix and deduplicates copies',()=>{
  const parsed=parseTotals([row('A'),row('A'),row('B',{team:'2TM'}),row('C',{team:'TOT'}),row('D',{team:'TBA'}),row('E',{team:'PHX'})].map(r=>htmlRow(r)).join(''));
  assert.equal(parsed.length,2);assert.equal(parsed[1].team,'PHO');
});
test('parser distinguishes a missing number from a legitimate zero',()=>{
  const p=parseTotals(htmlRow(row('A',{blk:null,stl:0})))[0];assert.equal(p.blk,null);assert.equal(p.stl,0);
});
test('rates rank by production per game rather than raw totals',()=>{
  const c=card([row('A',{pts:90,g:10}),row('B',{pts:100,g:20})],[player('A'),player('B')]);
  assert.equal(c.leaders[0].name,'A');assert.equal(c.value,9);
});
test('only the current team stint counts, never a combined or former-team row',()=>{
  const rows=[row('New arrival',{team:'PHO',pts:2000}),row('New arrival',{team:'2TM',pts:3000}),row('New arrival',{team:'ATL',pts:20}),row('Incumbent',{pts:100})];
  assert.equal(card(rows,[player('New arrival'),player('Incumbent')]).leaders[0].name,'Incumbent');
  assert.equal(card(rows.slice(0,2),[player('New arrival')]).value,null);
});
test('waived players and players assigned to another club cannot lead a current roster',()=>{
  const rows=[row('Nye',{pts:1000}),row('A',{pts:100})];
  for(const change of [{currentRoster:false},{liveStatus:'waived'},{liveStatus:'released'},{team:'Phoenix Mercury'}])assert.equal(card(rows,[player('Nye',change),player('A')]).leaders[0].name,'A');
});
test('five team games is the per-game minimum, and duplicate identities do not create co-leaders',()=>{
  const c=card([row('A',{pts:100,g:4}),row('B',{pts:60,g:5})],[player('A'),player('B'),player('B')]);
  assert.equal(c.leaders.length,1);assert.equal(c.leaders[0].name,'B');assert.equal(c.value,12);
});
test('shooting uses made/attempted totals and requires the published minimum attempts',()=>{
  const rows=[row('Small',{fg:10,fga:10,fg3:10,fg3a:10,ft:10,fta:10}),row('Qualified',{fg:25,fga:50,fg3:10,fg3a:20,ft:10,fta:20})];
  for(const id of ['fg','threePct','ft']){const c=card(rows,[player('Small'),player('Qualified')],id);assert.equal(c.leaders[0].name,'Qualified');assert.equal(c.value,.5);}
});
test('exact rational ties include every co-leader; rounded display equality does not',()=>{
  const roster=[player('B'),player('A')];
  let c=card([row('A',{pts:100,g:10}),row('B',{pts:50,g:5})],roster);assert.deepEqual(c.leaders.map(p=>p.name),['A','B']);
  c=card([row('A',{pts:101,g:10}),row('B',{pts:1009,g:100})],roster);assert.equal(c.value.toFixed(1),'10.1');assert.deepEqual(c.leaders.map(p=>p.name),['A']);
});
test('zero is a valid rate; unavailable and ineligible stats do not become zero leaders',()=>{
  assert.equal(card([row('A',{blk:0})],[player('A')],'bpg').value,0);
  assert.equal(card([row('A',{blk:null})],[player('A')],'bpg').value,null);
  assert.equal(card([row('A',{g:4})],[player('A')]).value,null);
});
test('known long-form names, accents and apostrophes match roster identities',()=>{
  for(const [source,roster] of [['Anastasiia Kosu','Anastasiia Olairi Kosu'],['Raquel Carrera Quintana','Raquel Carrera'],['Alicia Florez','Alicia Flórez Getino'],["A'ja Wilson",'A’ja Wilson']])assert.equal(card([row(source)],[player(roster)]).leaders[0].name,roster);
});
test('injured roster members retain earned season leads and receive explicit status labels',()=>{
  const board=M.build('Atlanta Dream',[row('A')],[player('A')],[{player:'A',status:'OUT FOR SEASON'}]);assert.equal(board.cards[0].leaders[0].availability,'OUT FOR SEASON');assert.match(page.cards(board),/OUT FOR SEASON/);
});
test('all 15 active teams have sufficient source coverage and nine categories',()=>{
  assert.equal(complete(saved.players),true);
  const {OFFICIAL_ROSTER_SNAPSHOT}=require('../lib/official-roster-snapshot');
  for(const [name,code] of Object.entries(M.codes)){
    const club=OFFICIAL_ROSTER_SNAPSHOT.find(p=>M.key(p.team)===name);assert.ok(club);
    const roster=OFFICIAL_ROSTER_SNAPSHOT.filter(p=>p.team===club.team).map(p=>({...p,currentRoster:true}));
    const board=M.build(club.team,saved.players,roster);assert.equal(board.code,code);assert.equal(board.cards.length,9);assert.ok(board.cards.every(c=>c.leaders.length>0));
  }
});
test('partial or error pages are rejected by the source reader',async()=>{
  for(const response of [{ok:false,status:403},{ok:true,text:async()=>'<html>Temporary failure</html>'}])await assert.rejects(fetchTotals(async()=>response));
});
test('source fetch is bounded and requests only the public statistical table',async()=>{
  let requested,signal;
  await fetchTotals(async(url,options)=>{requested=url;signal=options.signal;return {ok:true,text:async()=>saved.players.map(r=>htmlRow(r)).join('')};});
  assert.equal(requested,'https://www.basketball-reference.com/wnba/years/2026_totals.html');assert.ok(signal);
  await assert.rejects(fetchTotals((_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timed out')))),1));
});
function api(fetcher){
  const file=path.join(root,'api/team-player-totals.js'),localRequire=createRequire(file);
  const context={module:{exports:{}},require:id=>id==='../lib/team-player-totals'?{fetchTotals:fetcher}:localRequire(id),Date};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
  return async(req={method:'GET',query:{}})=>{const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};await context.module.exports(req,res);return res;};
}
test('API rejects unsupported methods and seasons without contacting upstream',async()=>{
  let calls=0;const invoke=api(async()=>{calls++;return saved;});assert.equal((await invoke({method:'POST'})).code,405);assert.equal((await invoke({method:'GET',query:{season:2025}})).code,400);assert.equal(calls,0);
});
test('concurrent requests share one refresh; fresh data is cached with its actual check time',async()=>{
  let calls=0;const now=new Date().toISOString(),invoke=api(async()=>{calls++;return {...saved,checkedAt:now};});const [a,b]=await Promise.all([invoke(),invoke()]);await invoke();assert.equal(calls,1);assert.equal(a.body.stale,false);assert.equal(b.body.checkedAt,now);assert.match(a.headers['Cache-Control'],/s-maxage=1800/);
});
test('upstream failure serves explicitly stale data without inventing a fresh timestamp',async()=>{
  let calls=0;const invoke=api(async()=>{calls++;throw new Error('offline');});const a=await invoke();await invoke();assert.equal(a.code,200);assert.equal(a.body.stale,true);assert.equal(a.body.checkedAt,saved.checkedAt);assert.equal(calls,1);assert.match(a.headers['Cache-Control'],/s-maxage=300/);
});
test('cards escape names, provide photos, show qualifications and link into Playerpedia',()=>{
  const board=M.build('Atlanta Dream',[row('<Name>')],[player('<Name>')]);const markup=page.cards(board);
  assert.ok(!markup.includes('<Name>'));assert.match(markup,/&lt;Name&gt;/);assert.match(markup,/view=current&amp;search=%3CName%3E|view=current&search=%3CName%3E/);assert.match(markup,/img src="https:\/\/example.com\/player.png"/);assert.match(markup,/10 games with this team/);
});

function client({club={name:'Atlanta Dream'},totals={...saved,stale:false},roster,shared=true,offline=false}={}){
  const nodes={},events={},timers=[];let fetchCalls=[];
  const element=id=>nodes[id]||(nodes[id]={textContent:'',innerHTML:'',hidden:false,disabled:false,handlers:{},classList:{add(){},toggle(){}},setAttribute(k,v){this[k]=v;},addEventListener(type,fn){this.handlers[type]=fn;}});
  const payload=roster||{players:[player('Allisha Gray')],injuries:[],updatedAt:saved.checkedAt};
  const context={WTeamStatLeaders:M,teamBySlug:()=>club,URLSearchParams,AbortController,location:{search:'?team=atlanta-dream'},document:{getElementById:element,hidden:false,addEventListener(type,fn){events[type]=fn;}},setInterval(fn){timers.push(fn);},setTimeout,clearTimeout,
    fetch:async url=>{fetchCalls.push(url);if(context.offline)throw new Error('offline');return {ok:true,json:async()=>url.includes('team-player-totals')?totals:payload};},offline};
  context.globalThis=context;if(shared)context.WTeamRosterRequest=Promise.resolve(payload);
  vm.runInNewContext(fs.readFileSync(path.join(root,'team-stat-leaders.js'),'utf8'),context);
  return {nodes,events,timers,context,fetchCalls,settle:()=>new Promise(resolve=>setImmediate(resolve))};
}
test('client reuses the team-page roster request, renders results and refreshes both feeds',async()=>{
  const c=client();await c.settle();assert.equal(c.fetchCalls.length,1);assert.match(c.nodes.teamLeadersGrid.innerHTML,/Allisha Gray/);assert.match(c.nodes.teamLeadersStatus.textContent,/30 minutes/);
  c.nodes.teamLeadersRefresh.handlers.click();await c.settle();assert.equal(c.fetchCalls.length,3);assert.equal(c.nodes['team-stat-leaders']['aria-busy'],'false');
});
test('a failed refresh preserves the last good cards and labels the failure',async()=>{
  const c=client();await c.settle();const before=c.nodes.teamLeadersGrid.innerHTML;c.context.offline=true;c.nodes.teamLeadersRefresh.handlers.click();await c.settle();assert.equal(c.nodes.teamLeadersGrid.innerHTML,before);assert.match(c.nodes.teamLeadersStatus.textContent,/Refresh unavailable/);assert.equal(c.nodes.teamLeadersRefresh.disabled,false);
});
test('stale source status is visible, and an empty roster does not claim zero leaders',async()=>{
  const c=client({totals:{...saved,stale:true}});await c.settle();assert.match(c.nodes.teamLeadersStatus.textContent,/saved statistics/);
  const missing=client({roster:{players:[]}});await missing.settle();assert.match(missing.nodes.teamLeadersStatus.textContent,/temporarily unavailable/);assert.ok(!missing.nodes.teamLeadersGrid.innerHTML.includes('team-leader-value'));
});
test('expansion pages show an honest empty state without requesting season feeds',async()=>{
  const c=client({club:{name:'Cleveland Sirens'}});await c.settle();assert.equal(c.fetchCalls.length,0);assert.match(c.nodes.teamLeadersGrid.innerHTML,/first leaders/);assert.equal(c.nodes.teamLeadersRefresh.hidden,true);assert.equal(c.nodes['team-stat-leaders']['aria-busy'],'false');
});
test('hidden tabs do not poll, and active tabs can refresh on the scheduled interval',async()=>{
  const c=client();await c.settle();c.context.document.hidden=true;c.timers[0]();await c.settle();assert.equal(c.fetchCalls.length,1);c.context.document.hidden=false;c.timers[0]();await c.settle();assert.equal(c.fetchCalls.length,3);
});
