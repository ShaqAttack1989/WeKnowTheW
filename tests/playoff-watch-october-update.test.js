const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8');
const guide=JSON.parse(read('snack-shak-latest.json')).posts.find(p=>p.slug==='the-playoff-watch-party-2026');
test('both closeouts feed a zero-win Finals matchup without carrying semifinal wins',()=>{
 assert.equal(guide.updated,'2026-10-10');
 const rows=guide.playoffWatch.matchups;
 assert.equal(rows.find(r=>r.roundKey==='Finals').series,'0-0');
 assert.deepEqual(rows.filter(r=>r.roundKey==='Semifinals').map(r=>r.series),['3-0','3-0']);
 for(const file of ['api/competition.js','playoff-bracket.js','global-scoreboard.js']){
  const s=read(file);
  assert.match(s,/id:'1042600203'.*homeScore:83,awayScore:85.*completed:true/);
  assert.match(s,/id:'1042600213'.*homeScore:77,awayScore:87.*Final\/OT.*completed:true/);
  assert.match(s,/2026-gsv-atl-finals-g1.*2026-10-17.*Golden State Valkyries.*Atlanta Dream/);
  assert.doesNotMatch(s,/2026-(?:nyl-atl|lva-gsv)-sf-g4|2026-(?:atl-nyl|gsv-lva)-sf-g5/);
 }
});
test('main and homepage use verified Game 3 action with credit and official source',()=>{
 assert.equal(guide.image,guide.storyImage);
 assert.match(guide.image,/53109b8f7bdd419a65d3abb786964fac24ab093b/);
 assert.match(guide.storyImageCaption,/Ishika Samant\/Getty Images/);
 assert.match(guide.storyImageSourceUrl,/theguardian\.com.*2026\/oct\/09/);
 assert.match(guide.imageAlt,/October 9, 2026/);
 assert.match(JSON.stringify(guide.sections),/500 career playoff points/);
 assert.match(read('homepage-fresh-stories.js'),/image/);
});
test('finalist audit keeps eliminated roster receipts but counts only surviving teams',()=>{
 const s=read('draft-class-rankings.js');
 assert.match(s,/Las Vegas Aces',\s+status: 'ELIMINATED/);
 assert.match(s,/New York Liberty',\s+status: 'ELIMINATED/);
 assert.match(s,/filter\(team => team.status === 'FINALS'\)/);
 assert.match(read('wnba-draft-class-rankings.html'),/<b>2<\/b> teams alive now/);
});

test('homepage spotlight reflects the Finals and removes semifinal closeout callouts',()=>{
 const s=read('index.html');
 assert.match(s,/Finals are set/);
 assert.match(s,/Dream–Valkyries Finals begin October 17/);
 assert.doesNotMatch(s,/Two 2–0 semifinal leads|Friday brings closeout games/);
});

test('shared bracket renders both sweeps and the Finals without a DOM error',()=>{
 const vm=require('node:vm');
 const mount={isConnected:true,dataset:{variant:'home'},classList:{add(){}},querySelector(){return null;},innerHTML:''};
 const window={addEventListener(){}};
 const document={readyState:'loading',addEventListener(){},querySelectorAll(){return [mount];}};
 vm.runInNewContext(read('playoff-bracket.js'),{window,document,Intl,Date,Set,Map,URL,AbortController,setInterval(){},setTimeout(){},clearTimeout(){},fetch:()=>new Promise(()=>{})});
 assert.doesNotThrow(()=>window.WKTWPlayoffBracket.init());
 assert.match(mount.innerHTML,/TEAMS LEFT<\/span><strong>2<\/strong>/);
 assert.match(mount.innerHTML,/SERIES CLOSED<\/span><strong>6<\/strong>/);
 assert.match(mount.innerHTML,/data-bracket-matchup="finals"/);
 assert.match(mount.innerHTML,/Golden State Valkyries/);
 assert.match(mount.innerHTML,/Atlanta Dream/);
});

test('finalist action photos are distinct within the article',()=>{
 const photos=[guide.storyImage,...guide.gameGallery.items.map(item=>item.image)];
 assert.equal(new Set(photos).size,photos.length);
 assert.match(guide.imageAlt,/Angel Reese/);
 assert.match(guide.gameGallery.items[0].alt,/Jordin Canada/);
 assert.match(guide.gameGallery.items[1].alt,/Tiffany Hayes/);
 for(const item of guide.gameGallery.items){assert.ok(item.credit);assert.ok(item.sourceUrl);assert.match(item.alt,/October 9, 2026/);}
});


test('Finals matchup graphic is credited separately from game photography',()=>{
 const graphic=guide.finalsGraphic.items[0];
 assert.match(graphic.credit,/Just Women’s Sports/);
 assert.match(graphic.alt,/graphic.*2026 WNBA Finals/);
 assert.equal(graphic.imageFit,'contain');
 assert.ok(fs.existsSync(require('node:path').join(__dirname,'..',graphic.image)));
 assert.match(read('snack-shak-collections.js'),/playoffGalleryMarkup\(post.finalsGraphic\)/);
 assert.ok(!guide.gameGallery.items.some(item=>item.image===graphic.image));
});
