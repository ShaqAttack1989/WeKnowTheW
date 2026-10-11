const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../site.js'),'utf8');
const start=source.indexOf('let globalSearchPlayers=');
const end=source.indexOf('function openGlobalSearch()',start);

function searchFixture(rosterPlayers=[]){
  const input={value:'Deja Kelly'};
  const results={innerHTML:''};
  const context={
    searchStaticIndex:[],
    window:{WPlayerpediaLegacy:{searchRecords:()=>[],find:()=>null}},
    document:{getElementById:id=>id==='globalSearchInput'?input:id==='globalSearchResults'?results:null},
    fetch:async url=>({ok:true,json:async()=>url==='/api/players'?{players:rosterPlayers}:{players:[{name:'Deja Kelly',team:'Charlotte Crown',detail:'Championship MVP'}]}}),
    URLSearchParams,encodeURIComponent,Promise
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start,end)};globalThis.loadSearchPlayers=loadSearchPlayers;`,context);
  return {context,results};
}

test('sitewide search finds UPSHOT players independently of the WNBA roster feed',async()=>{
  const fixture=searchFixture([]);
  await fixture.context.loadSearchPlayers();
  assert.match(fixture.results.innerHTML,/Deja Kelly/);
  assert.match(fixture.results.innerHTML,/UPSHOT · Charlotte Crown/);
  assert.match(fixture.results.innerHTML,/the-call-up\.html#player-dashboard/);
});

test('a Playerpedia record wins while retaining UPSHOT search keywords',async()=>{
  const fixture=searchFixture([{name:'Deja Kelly',team:'Free Agent · last: Las Vegas Aces',position:'Point Guard',currentRoster:false}]);
  await fixture.context.loadSearchPlayers();
  assert.equal((fixture.results.innerHTML.match(/Deja Kelly/g)||[]).length,1);
  assert.match(fixture.results.innerHTML,/playerpedia\.html\?view=recent/);
  fixture.context.document.getElementById('globalSearchInput').value='Charlotte Crown';
  fixture.context.renderGlobalSearch();
  assert.match(fixture.results.innerHTML,/Deja Kelly/);
});
