const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const catalog=require('../playerpedia-legacy');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const additions=['Rebecca Lobo','Chamique Holdsclaw','Teresa Weatherspoon','Swin Cash','Angel McCoughtry'];

// Article coverage, not an endorsement or import of its ranking methodology.
const jwsArchive=['Katie Smith','Chamique Holdsclaw','Teresa Weatherspoon','Swin Cash','Becky Hammon','Angel McCoughtry','Lindsay Whalen','Cappie Pondexter','Seimone Augustus','Yolanda Griffith','Tina Thompson','Tina Charles','Elena Delle Donne','Sylvia Fowles','Lauren Jackson','Sue Bird','Tamika Catchings','Candace Parker','Sheryl Swoopes','Maya Moore','Cynthia Cooper','Lisa Leslie','Diana Taurasi'];
const jwsCurrent=['Alyssa Thomas','Chelsea Gray','Jonquel Jones','Brittney Griner','Nneka Ogwumike','Breanna Stewart','A’ja Wilson'];

test('JWS archive coverage plus Lobo is complete and does not retire current players',()=>{
  assert.equal(jwsArchive.length+jwsCurrent.length,30);
  for(const name of [...jwsArchive,'Rebecca Lobo'])assert.ok(catalog.find(name),name);
  for(const name of jwsCurrent)assert.equal(catalog.find(name),null,name);
  assert.equal(new Set(catalog.players.map(p=>catalog.key(p.name))).size,catalog.players.length);
});
test('aliases, accents, punctuation and career teams reach the same archive records',()=>{
  assert.equal(catalog.find('rebecca lobo-rushin').name,'Rebecca Lobo');
  assert.equal(catalog.find('T Spoon').name,'Teresa Weatherspoon');
  assert.equal(catalog.find('Cynthia Cooper–Dyke').name,'Cynthia Cooper');
  assert.ok(catalog.matches(catalog.find('Ticha Penicheiro'),'Penichéiro'));
  assert.ok(catalog.matches(catalog.find('Rebecca Lobo'),'Houston'));
  assert.ok(catalog.matches(catalog.find('Chamique Holdsclaw'),'San Antonio'));
});
test('new records preserve sourced career averages separately from last-season grades',()=>{
  const expected={
    'Rebecca Lobo':[121,6.7,2003,25,2.4], 'Chamique Holdsclaw':[279,16.9,2010,29,13.6],
    'Teresa Weatherspoon':[254,5,2004,34,.5], 'Swin Cash':[479,10.7,2016,31,5.3],
    'Angel McCoughtry':[311,18.6,2022,2,6]
  };
  for(const name of additions){
    const p=catalog.find(name),s=p.lastSeasonSnapshot;
    assert.deepEqual([p.careerStats.games,p.careerStats.ppg,p.lastWnbaSeason,s.games,s.ppg],expected[name]);
    assert.match(p.statsSource,/basketball-reference\.com\/wnba\/players\//);
    assert.ok(s.sourceUrls.every(url=>url.includes(`/wnba/years/${s.season}_`)));
    assert.ok(s.score>=55&&s.score<=99);assert.notEqual(s.letter,'NR');
    assert.ok(s.qualifiedPeerCount>50);
    assert.ok(p.photoSource&&p.photoLicense&&p.photoLicenseUrl&&p.photoCredit);
  }
  assert.equal(catalog.find('Teresa Weatherspoon').lastSeasonSnapshot.ftPct,null,'no attempts is not a zero-percent shooting result');
});
test('McCoughtry has a career archive and provisional two-game season, not a retirement claim',()=>{
  const p=catalog.find('Angel McCoughtry');
  assert.equal(p.retired,null);assert.equal(p.careerState,'legacy');
  assert.equal(p.lastSeasonSnapshot.provisional,true);
  assert.doesNotMatch(catalog.statusLabel(p),/retired/i);
  assert.ok(p.statusSource.includes('boardroom.tv'));
});
test('all search records deep-link to a resolvable profile and career-team destinations exist',()=>{
  for(const row of catalog.searchRecords()){
    const url=new URL(row.href,'https://www.weknowthew.com');
    assert.equal(url.searchParams.get('view'),'retired');
    assert.ok(catalog.find(url.searchParams.get('search')));
  }
  for(const team of new Set(catalog.players.flatMap(p=>p.teams.map(([team])=>team)))){
    const href=catalog.teamHref(team);if(!href.startsWith('/'))continue;
    const url=new URL(href,'https://www.weknowthew.com');
    assert.ok(fs.existsSync(path.join(root,url.pathname)),href);
    if(url.hash)assert.ok(read(url.pathname).includes(`id="${url.hash.slice(1)}"`),href);
  }
});

// Small DOM fixture for the research controller; no browser or network dependencies.
function desk(query=''){
  const events=new Map(),nodes=new Map(),timers=new Map();let timerId=0,fetches=0;
  function node(id){
    const n={id,innerHTML:'',value:'',textContent:'',dataset:{},listeners:{},open:false,
      addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},
      fire(type,event={}){for(const fn of this.listeners[type]||[])fn(event);},
      insertAdjacentHTML(_,html){this.innerHTML+=html;},showModal(){this.open=true;},
      querySelectorAll(selector){
        if(selector==='.player-card[data-player-id]')return [...this.innerHTML.matchAll(/<button data-player-id="([^"]+)"[^>]*>.*?<\/button>/g)].map(m=>({dataset:{playerId:m[1]},remove:()=>{this.innerHTML=this.innerHTML.replace(m[0],'');}}));
        return [];
      },
      querySelector(selector){
        if(selector==='[data-retired-profile]'){
          const m=this.innerHTML.match(/data-retired-profile="([^"]+)"/);if(!m)return null;
          return {dataset:{retiredProfile:m[1]},querySelector:()=>null};
        }
        return null;
      }};
    nodes.set(id,n);return n;
  }
  ['playerGrid','playerSearch','playerTeamFilter','playerCount','playerStatus','playerResearchTabs','playerModal','playerModalBody'].forEach(node);
  const buttons=['all','current','recent','retired'].map(view=>({dataset:{researchView:view},badge:{textContent:''},classList:{toggle(){}},setAttribute(){},querySelector(){return this.badge;}}));
  nodes.get('playerResearchTabs').querySelectorAll=()=>buttons;
  const document={getElementById:id=>nodes.get(id)||null,addEventListener:(type,fn)=>events.set(type,fn)};
  const context={document,window:{WPlayerpediaLegacy:catalog},URL,URLSearchParams,AbortController,
    location:{href:'https://www.weknowthew.com/playerpedia.html'+query,search:query},
    history:{replaceState(_,__,url){context.lastURL=url;}},
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    fetch:async()=>{fetches++;throw Error('offline');},allPlayers:[],teams:[],letter:'',fillTeams(){},
    render(){
      const q=catalog.key(nodes.get('playerSearch').value),team=nodes.get('playerTeamFilter').value;
      nodes.get('playerGrid').innerHTML=context.allPlayers.filter(p=>(!q||catalog.key(p.name).includes(q))&&(!team||String(p.teamId)===team)&&(!context.letter||p.name.split(' ').pop().startsWith(context.letter))).map(p=>`<button data-player-id="${p.id}">${p.name}</button>`).join('');
    }
  };
  vm.createContext(context);vm.runInContext(read('playerpedia-research-desk.js'),context);
  return {context,nodes,buttons,events,get fetches(){return fetches;},search(value){nodes.get('playerSearch').value=value;nodes.get('playerSearch').fire('input');},view(value){nodes.get('playerResearchTabs').fire('click',{target:{closest:()=>({dataset:{researchView:value}})}});},ready(players){context.allPlayers=players;events.get('w:playerpedia-roster-ready')();}};
}
test('Lobo direct link opens career stats and grade without waiting for any roster request',()=>{
  const f=desk('?view=current&search=Rebecca%20Lobo');
  assert.ok(f.nodes.get('playerModal').open);
  assert.match(f.nodes.get('playerGrid').innerHTML,/Rebecca Lobo/);
  const html=f.nodes.get('playerModalBody').innerHTML;
  assert.match(html,/Career regular-season averages/);assert.match(html,/>6\.7<\/strong>/);
  assert.match(html,/2003 · LAST WNBA SEASON/);assert.match(html,/>2\.4<\/strong>/);
  assert.match(html,/60\/100/);assert.match(html,/not the player’s entire career/);
  assert.equal(f.fetches,0);
});
test('all five profiles render their archive data and attribution with no live API dependency',()=>{
  for(const name of additions){
    const f=desk('?view=retired&search='+encodeURIComponent(name));
    const html=f.nodes.get('playerModalBody').innerHTML;
    assert.match(html,/Career regular-season averages/);assert.match(html,/Regular-season W composite/);
    assert.match(html,/Photo:/);assert.match(html,/WNBA CAREER PATH/);
    assert.equal(f.fetches,0,name);
    assert.doesNotMatch(html,/\b(?:undefined|NaN|Codex|ChatGPT|TODO|you asked)\b/);
  }
  const angel=desk('?search=Angel%20McCoughtry').nodes.get('playerModalBody').innerHTML;
  assert.match(angel,/>Provisional</);assert.doesNotMatch(angel,/Retired 2022|FINAL ACTIVE SEASON/);
});
test('searching from Current switches to All and finds an archived name',()=>{
  const f=desk('?view=current');
  f.search('Weatherspoon');
  assert.match(f.context.lastURL,/view=all/);
  assert.match(f.nodes.get('playerGrid').innerHTML,/Teresa Weatherspoon/);
  assert.equal(f.nodes.get('playerCount').textContent,'1 player shown');
});
test('late roster completion preserves archive queries and avoids duplicate retired entries',()=>{
  const f=desk();
  f.search('Lobo');
  f.ready([{id:'lobo',name:'Rebecca Lobo',currentRoster:false,lastWnbaSeason:2003},{id:'aja',name:'A’ja Wilson',currentRoster:true}]);
  assert.equal((f.nodes.get('playerGrid').innerHTML.match(/data-retired-name="Rebecca Lobo"/g)||[]).length,1);
  assert.doesNotMatch(f.nodes.get('playerGrid').innerHTML,/data-player-id="lobo"/);
  f.search('');
  assert.match(f.nodes.get('playerGrid').innerHTML,/A’ja Wilson/);
  f.view('retired');assert.doesNotMatch(f.nodes.get('playerGrid').innerHTML,/A’ja Wilson/);
  f.view('current');assert.match(f.nodes.get('playerGrid').innerHTML,/A’ja Wilson/);
  assert.doesNotMatch(f.nodes.get('playerGrid').innerHTML,/Rebecca Lobo/);
});
test('archive remains searchable when the roster load fails; surname and career-team filters work',()=>{
  const f=desk();f.ready([]);f.search('Cash');
  assert.match(f.nodes.get('playerGrid').innerHTML,/Swin Cash/);
  assert.match(f.nodes.get('playerStatus').textContent,/archive remains searchable/);
  f.search('');f.context.letter='L';f.context.render();
  assert.match(f.nodes.get('playerGrid').innerHTML,/Rebecca Lobo/);
  assert.doesNotMatch(f.nodes.get('playerGrid').innerHTML,/Swin Cash/);
  f.context.letter='';f.context.teams=[{id:'9',name:'New York Liberty'}];
  f.nodes.get('playerTeamFilter').value='9';f.context.render();
  assert.match(f.nodes.get('playerGrid').innerHTML,/Rebecca Lobo/);
  assert.doesNotMatch(f.nodes.get('playerGrid').innerHTML,/Angel McCoughtry/);
});
test('global search includes legacy results before the live player feed loads',()=>{
  const input={value:'Lobo'},results={innerHTML:''};
  const context={window:{WPlayerpediaLegacy:catalog},document:{getElementById:id=>id==='globalSearchInput'?input:id==='globalSearchResults'?results:null}};
  vm.createContext(context);
  const source=read('site.js');vm.runInContext(source.slice(source.indexOf('const coreSearch='),source.indexOf('function openGlobalSearch()')),context);
  for(const name of additions){input.value=name;context.renderGlobalSearch();assert.match(results.innerHTML,/view=retired/);assert.ok(results.innerHTML.includes(name));}
});
test('homepage search includes legacy players independently of live extras',()=>{
  const context={window:{WPlayerpediaLegacy:catalog},document:{getElementById:()=>null,querySelectorAll:()=>[],addEventListener(){}},setTimeout(){},clearTimeout(){}};
  const source=read('homepage-hub.js');vm.createContext(context);
  vm.runInContext(source.slice(0,source.indexOf('  function gameInstant'))+'globalThis.resultsFor=resultsFor;})();',context);
  for(const name of additions)assert.ok(context.resultsFor(name).some(row=>row.title===name&&row.href.includes('view=retired')),name);
});
test('legacy profile cannot be overwritten by current-season grade or Stat Kitchen decorators',async()=>{
  for(const [file,functionName,modalName] of [['playerpedia-card-upgrade.js','upgradeModal','modal'],['playerpedia-stat-kitchen.js','decorateModal','modalBody']]){
    const source=read(file),start=source.indexOf(`  ${functionName==='upgradeModal'?'async ':''}function ${functionName}()`),end=source.indexOf('\n  function schedule',start);
    let calls=0;
    const context={[modalName]:{querySelector:selector=>selector.includes('[data-retired-profile]')?{}:null},fetch(){calls++;}};
    vm.createContext(context);vm.runInContext(source.slice(start,end),context);await context[functionName]();assert.equal(calls,0);
  }
});
test('the real roster loader notifies the research desk after an upstream failure',async()=>{
  const f=desk('?search=Lobo');
  Object.assign(f.context,{playerGrid:f.nodes.get('playerGrid'),status:f.nodes.get('playerStatus'),transactionFeed:null,injuryFeed:null,pSafe:String,CustomEvent:class{constructor(type){this.type=type;}}});
  f.context.document.dispatchEvent=event=>f.events.get(event.type)?.();
  const source=read('playerpedia-page.js');
  vm.runInContext(source.slice(source.indexOf('async function load(){'),source.indexOf("azGrid.addEventListener('click'")),f.context);
  await f.context.load();
  assert.match(f.nodes.get('playerGrid').innerHTML,/Rebecca Lobo/);
  assert.match(f.nodes.get('playerStatus').textContent,/archive remains searchable/);
});
test('deep archive cards use the same records, honest career status and return links',()=>{
  const grid={};const context={window:{WPlayerpediaLegacy:catalog},retiredPlayers:catalog.players,
    document:{querySelectorAll:()=>[],getElementById:()=>grid,querySelector:()=>({})},
    MutationObserver:class{observe(){}},renderRetired(){},escRetired:v=>String(v),initials:()=>'',teamStop:()=>''};
  vm.createContext(context);vm.runInContext(read('retired-player-upgrade.js'),context);
  for(const name of additions){
    const html=context.card(catalog.find(name));assert.ok(html.includes(catalog.profileHref(catalog.find(name))));
    assert.match(html,/Career regular season/);assert.match(html,/Photo:/);
    if(name==='Angel McCoughtry')assert.doesNotMatch(html,/Retired 2022/);
  }
});
