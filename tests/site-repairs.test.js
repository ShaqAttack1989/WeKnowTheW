const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {selectStories,updated,href,feeds}=require('../homepage-fresh-stories.js');
const portraits=require('../coach-photos.js');
const media=require('../api/media.js');
const now=Date.parse('2026-10-21T12:00:00Z');
const story=(slug,extra={})=>({slug,title:slug,type:'feature',published:'2026-10-19',...extra});

test('future update timestamps cannot promote an old story',()=>{
  const old=story('old',{published:'2026-09-01',updated:'2026-12-01'});
  assert.equal(updated(old,now),Date.parse('2026-09-01'));
  assert.deepEqual(selectStories([[old,story('new')]],now).map(x=>x.slug),['new','old']);
});
test('every article feed shares eligibility and destination rules',()=>{
  assert.equal(feeds.length,7);
  const posts=[story('draft',{draft:true}),story('scheduled',{status:'scheduled'}),story('future',{published:'2026-12-01'}),story('hidden',{homepageHidden:true}),story('published')];
  assert.deepEqual(selectStories([posts],now).map(x=>x.slug),['published']);
  assert.equal(href(story('standalone',{dashboardUrl:'/best-womens-basketball-coaches.html'})),'/best-womens-basketball-coaches.html');
  assert.equal(href(story('safe',{dashboardUrl:'javascript:alert(1)'})),'/food-for-thought.html?post=safe#story');
});
test('coach registry covers dashboard identities including accent variants',()=>{
  const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('coach-dashboard-data.js','utf8'),context);
  for(const coach of context.COURTSIDE_COACHES){
    const entry=portraits.get(coach.name);assert.ok(entry,coach.name);
    assert.ok(entry.candidates.length);
    for(const photo of entry.candidates){assert.match(photo.image,/^https:\/\//);assert.match(photo.sourceUrl,/^https:\/\//);assert.ok(photo.credit);}
  }
  assert.equal(portraits.get('Jose Fernandez'),portraits.get('José Fernández'));
  assert.doesNotMatch(portraits.get('Stephanie White').candidates[0].image,/Nakase|Tibbetts/);
  assert.doesNotMatch(portraits.get('Lynne Roberts').candidates[0].image,/Billy_the_Kid/);
  assert.equal(portraits.get('Unverified Person'),null);
});
test('coach media API uses reviewed identities without any network search',async()=>{
  const previous=global.fetch;global.fetch=()=>{throw new Error('Coach name searches are forbidden');};
  const call=async name=>{
    let result;const res={setHeader(){},status(){return this;},json(data){result=data;return this;}};
    await media({method:'GET',query:{type:'coach',name}},res);return result;
  };
  try{
    const jose=await call('Jose Fernandez');assert.equal(jose.found,true);assert.equal(jose.item.subject,'José Fernández');
    const lynne=await call('Lynne Roberts');assert.equal(lynne.item.image,portraits.get('Lynne Roberts').candidates[0].image);
    assert.equal((await call('Unverified Person')).found,false);
  }finally{global.fetch=previous;}
});
