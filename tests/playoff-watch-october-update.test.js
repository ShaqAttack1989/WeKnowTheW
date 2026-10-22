const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8');
const guide=JSON.parse(read('snack-shak-latest.json')).posts.find(p=>p.slug==='the-playoff-watch-party-2026');
test('the confirmed Game 3 result advances Atlanta to a 2-1 Finals lead',()=>{
 assert.equal(guide.updated,'2026-10-21');
 const rows=guide.playoffWatch.matchups;
 assert.equal(rows.find(r=>r.roundKey==='Finals').series,'2–1');
 assert.deepEqual(rows.filter(r=>r.roundKey==='Semifinals').map(r=>r.series),['3-0','3-0']);
 for(const file of ['api/competition.js','playoff-bracket.js','global-scoreboard.js']){
  const s=read(file);
  assert.match(s,/id:'1042600203'.*homeScore:83,awayScore:85.*completed:true/);
  assert.match(s,/id:'1042600213'.*homeScore:77,awayScore:87.*Final\/OT.*completed:true/);
  assert.match(s,/2026-gsv-atl-finals-g1.*2026-10-17.*Golden State Valkyries.*Atlanta Dream/);
  assert.match(s,/id:'1042600303'.*homeScore:97,awayScore:71.*completed:true/);
  assert.match(s,/2026-gsv-atl-finals-g2.*homeScore:65,awayScore:79.*completed:true/);
  assert.doesNotMatch(s,/2026-(?:nyl-atl|lva-gsv)-sf-g4|2026-(?:atl-nyl|gsv-lva)-sf-g5/);
 }
});
test('main and homepage use verified Game 3 action with credit and official source',()=>{
 assert.equal(guide.image,guide.storyImage);
 assert.match(guide.image,/Angel_Reese_WNBA_Finals_Game_2/);
 assert.match(guide.storyImageCaption,/Ezra Shaw\/Getty Images via AFP/);
 assert.match(guide.storyImageSourceUrl,/gmanetwork\.com/);
 assert.match(guide.imageAlt,/October 19, 2026/);
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
 assert.match(s,/Finals · Atlanta leads 2–1/);
 assert.match(s,/Atlanta beat Golden State 97–71/);
 assert.doesNotMatch(s,/Two 2–0 semifinal leads|Friday brings closeout games/);
});

test('shared bracket keeps the verified Game 3 result when its series snapshot lags',async()=>{
 const vm=require('node:vm');
 const mount={isConnected:true,dataset:{variant:'story'},classList:{add(){}},querySelector(){return null;},innerHTML:''};
 const window={addEventListener(){}};
 const document={readyState:'loading',addEventListener(){},querySelectorAll(){return[mount];}};
 let releaseCompetition;
 const competition=new Promise(resolve=>{releaseCompetition=()=>resolve({ok:true,json:async()=>({playoffs:{
  games:[{id:'2026-gsv-atl-finals-g3',date:'2026-10-21',startTimeUtc:'2026-10-21T20:00:00-04:00',homeTeam:'Atlanta Dream',awayTeam:'Golden State Valkyries',homeScore:null,awayScore:null,status:'Finals Game 3',state:'pre',completed:false,round:'Finals',gameNumber:3}],
  series:[{round:'Finals',teamA:'Atlanta Dream',teamB:'Golden State Valkyries',winsA:1,winsB:1,complete:false}]
 }})});});
 const fetch=url=>url.startsWith('/api/competition')?competition:Promise.resolve({ok:true,json:async()=>({teams:[]})});
 vm.runInNewContext(read('playoff-bracket.js'),{window,document,Intl,Date,Set,Map,URL,AbortController,setInterval(){},setTimeout(){},clearTimeout(){},fetch});
 assert.doesNotThrow(()=>window.WKTWPlayoffBracket.init());
 assert.match(mount.innerHTML,/ATL leads 2-1/);
 assert.match(mount.innerHTML,/Game 3 final · GSV 71–97 ATL/);
 releaseCompetition();
 await new Promise(resolve=>setImmediate(resolve));
 assert.match(mount.innerHTML,/ATL leads 2-1/);
 assert.match(mount.innerHTML,/Next · Game 4 · Sat, Oct 24/);
});

test('finalist action photos are distinct within the article',()=>{
 const photos=[guide.storyImage,...guide.gameGallery.items.map(item=>item.image)];
 assert.equal(new Set(photos).size,photos.length);
 assert.match(guide.imageAlt,/Angel Reese.*Kaitlyn Chen/);
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
