const unrivaledTeams=[
{name:'Phantom',record:'11-3',w:11,l:3,pct:.786,pf:1027,pa:931,diff:96,streak:'W7',ppg:73.4,status:'Runner-up',note:'The best regular-season record and the hottest finish in the league. Phantom earned the No. 1 seed and a bye before falling to Mist in the championship.'},
{name:'Mist',record:'10-4',w:10,l:4,pct:.714,pf:1088,pa:979,diff:109,streak:'W4',ppg:77.7,status:'2026 Champion',note:'The league’s highest-scoring club and best point differential. Mist turned a No. 2 seed into the franchise’s first championship.'},
{name:'Laces',record:'10-4',w:10,l:4,pct:.714,pf:984,pa:907,diff:77,streak:'W1',ppg:70.3,status:'First Round',note:'A 10-win regular season put Laces in the top tier, but the postseason ended in the opening round against Vinyl.'},
{name:'Rose',record:'6-8',w:6,l:8,pct:.429,pf:1003,pa:1047,diff:-44,streak:'L1',ppg:71.6,status:'First Round',note:'The defending champions returned to the playoffs, but Breeze ended the title defense in the first round.'},
{name:'Breeze',record:'6-8',w:6,l:8,pct:.429,pf:989,pa:974,diff:15,streak:'L2',ppg:70.6,status:'Semifinalist',note:'One of the two 2026 expansion clubs, Breeze reached the semifinals in its debut season and finished with a positive point differential.'},
{name:'Vinyl',record:'5-9',w:5,l:9,pct:.357,pf:952,pa:982,diff:-30,streak:'L1',ppg:68.0,status:'Semifinalist',note:'Vinyl grabbed the final playoff seed, upset Laces in the opening round and made the semifinals despite a losing regular-season record.'},
{name:'Lunar Owls',record:'4-10',w:4,l:10,pct:.286,pf:968,pa:1059,diff:-91,streak:'W1',ppg:69.1,status:'Eliminated',note:'A difficult second season ended outside the playoffs after the club had been one of the biggest stories of Unrivaled’s inaugural year.'},
{name:'Hive',record:'4-10',w:4,l:10,pct:.286,pf:935,pa:1067,diff:-132,streak:'L2',ppg:66.8,status:'Eliminated',note:'The second 2026 expansion club absorbed the league’s toughest scoring margin while building its first season identity.'}
];
const season3Roster=[
{seat:'01A',name:'Olivia Miles'},{seat:'01B',name:'Flau’jae Johnson'},{seat:'01C',name:'Jessica Shepard'},{seat:'01D',name:'Kayla McBride'},
{seat:'02A',name:'Kayla Thornton'},{seat:'02B',name:'Marine Johannès'},{seat:'02C',name:'Bridget Carleton'},{seat:'02D',name:'Gabby Williams'},
{seat:'03A',name:'Chelsea Gray'},{seat:'03B',name:'Marina Mabrey'},{seat:'03C',name:'Courtney Williams'},{seat:'03D',name:'Maddy Siegrist'},
{seat:'04A',name:'Veronica Burton'},{seat:'04B',name:'Natasha Cloud'},{seat:'04C',name:'Paige Bueckers'},{seat:'04D',name:'Shakira Austin'},
{seat:'05A',name:'Dearica Hamby'},{seat:'05B',name:'Breanna Stewart'},{seat:'05C',name:'Skylar Diggins'},{seat:'NEW',name:'Isabelle Harrison'},
{seat:'06A',name:'Aneesah Morrow'},{seat:'06B',name:'Rhyne Howard'},{seat:'06C',name:'Natisha Hiedeman'},{seat:'06D',name:'Lexie Hull'},
{seat:'07A',name:'Kiki Rice'},{seat:'07B',name:'Tiffany Hayes'},{seat:'07C',name:'Cameron Brink'},{seat:'07D',name:'Kelsey Plum'},
{seat:'08A',name:'Naz Hillmon'},{seat:'08B',name:'Kahleah Copper'},{seat:'08C',name:'Aziaha James'},{seat:'08D',name:'Rae Burrell'},
{seat:'09A',name:'Jackie Young'},{seat:'NEW',name:'Kaitlyn Chen'},{seat:'09C',name:'Aaliyah Edwards'},{seat:'09D',name:'Temi Fagbenle'},
{seat:'10A',name:'Arike Ogunbowale'},{seat:'10B',name:'Napheesa Collier'},{seat:'10C',name:'Brittney Sykes'},{seat:'10D',name:'Dominique Malonga'},
{seat:'11A',name:'Jordin Canada'},{seat:'11B',name:'Sonia Citron'},{seat:'11C',name:'Monique Billings'},{seat:'11D',name:'Allisha Gray'},
{seat:'12A',name:'Li Yueru'},{seat:'12B',name:'DiJonai Carrington'},{seat:'12C',name:'Sydney Taylor'},{seat:'12D',name:'Satou Sabally'}
];
const season3TeamByPlayer={"Olivia Miles":"Hive","Flau’jae Johnson":"Vinyl","Jessica Shepard":"Laces","Kayla McBride":"Phantom","Kayla Thornton":"Rose","Marine Johannès":"Laces","Bridget Carleton":"Mist","Gabby Williams":"Laces","Chelsea Gray":"Rose","Marina Mabrey":"Lunar Owls","Courtney Williams":"Lunar Owls","Maddy Siegrist":"Laces","Veronica Burton":"Mist","Natasha Cloud":"Phantom","Paige Bueckers":"Breeze","Shakira Austin":"Rose","Dearica Hamby":"Vinyl","Breanna Stewart":"Mist","Skylar Diggins":"Lunar Owls","Isabelle Harrison":"Mist","Aneesah Morrow":"Vinyl","Rhyne Howard":"Vinyl","Natisha Hiedeman":"Hive","Lexie Hull":"Rose","Kiki Rice":"Mist","Tiffany Hayes":"Phantom","Cameron Brink":"Hive","Kelsey Plum":"Phantom","Naz Hillmon":"Hive","Kahleah Copper":"Breeze","Aziaha James":"Rose","Rae Burrell":"Hive","Jackie Young":"Laces","Kaitlyn Chen":"Breeze","Aaliyah Edwards":"Phantom","Temi Fagbenle":"Lunar Owls","Arike Ogunbowale":"Mist","Napheesa Collier":"Lunar Owls","Brittney Sykes":"Rose","Dominique Malonga":"Breeze","Jordin Canada":"Vinyl","Sonia Citron":"Hive","Monique Billings":"Breeze","Allisha Gray":"Vinyl","Li Yueru":"Phantom","DiJonai Carrington":"Breeze","Sydney Taylor":"Lunar Owls","Satou Sabally":"Laces"};
season3Roster.forEach(player=>{player.team=season3TeamByPlayer[player.name]||'Unassigned';});

const playerLeaders=[
{label:'SCORING',name:'Marina Mabrey',team:'Lunar Owls',value:'25.3 PPG'},
{label:'ASSISTS',name:'Chelsea Gray',team:'Rose',value:'6.1 APG'},
{label:'REBOUNDS',name:'Aaliyah Edwards',team:'Lunar Owls',value:'12.4 RPG'},
{label:'STEALS',name:'Brittney Sykes',team:'Laces',value:'1.6 SPG'},
{label:'BLOCKS',name:'Aliyah Boston',team:'Phantom',value:'2.1 BPG'},
{label:'3-POINTERS',name:'Marina Mabrey',team:'Lunar Owls',value:'3.7 3PM'}
];
const teamLeaders=[
{label:'BEST RECORD',name:'Phantom',team:'11-3',value:'.786'},
{label:'SCORING',name:'Mist',team:'Offense',value:'77.7 PPG'},
{label:'POINT DIFFERENTIAL',name:'Mist',team:'Season',value:'+109'},
{label:'ASSISTS',name:'Phantom',team:'Team rate',value:'14.6 APG'},
{label:'REBOUNDS',name:'Breeze',team:'Team rate',value:'34.9 RPG'},
{label:'STEALS',name:'Mist',team:'Team rate',value:'5.9 SPG'}
];
const seasonArchive={
  2025:{
    season:'Season 1 · 2025',champion:'Rose',championNote:'Beat Vinyl 62–54 in the inaugural championship.',leader:'Lunar Owls',leaderRecord:'13-1',mvp:'Napheesa Collier',clubs:6,
    standings:[
      {name:'Lunar Owls',w:13,l:1,pct:.929,status:'Semifinalist'},
      {name:'Rose',w:8,l:6,pct:.571,status:'Champion'},
      {name:'Laces',w:7,l:7,pct:.500,status:'Semifinalist'},
      {name:'Vinyl',w:5,l:9,pct:.357,status:'Runner-up'},
      {name:'Mist',w:5,l:9,pct:.357,status:'Eliminated'},
      {name:'Phantom',w:4,l:10,pct:.286,status:'Eliminated'}
    ],
    players:[
      {name:'Napheesa Collier',team:'Lunar Owls',gp:14,ppg:25.7,rpg:10.7,apg:2.8,spg:2.0,bpg:1.4,tov:1.6},
      {name:'Kayla McBride',team:'Laces',gp:13,ppg:22.4,rpg:5.8,apg:2.9,spg:1.1,bpg:.2,tov:1.6},
      {name:'Chelsea Gray',team:'Rose',gp:14,ppg:21.4,rpg:5.1,apg:5.5,spg:1.3,bpg:.4,tov:2.8},
      {name:'Rhyne Howard',team:'Vinyl',gp:13,ppg:20.5,rpg:5.7,apg:2.2,spg:1.2,bpg:1.1,tov:1.6},
      {name:'Dearica Hamby',team:'Vinyl',gp:12,ppg:19.9,rpg:9.9,apg:2.3,spg:1.3,bpg:.3,tov:2.0},
      {name:'Allisha Gray',team:'Lunar Owls',gp:14,ppg:19.4,rpg:5.7,apg:2.7,spg:1.2,bpg:.1,tov:1.5},
      {name:'Breanna Stewart',team:'Mist',gp:14,ppg:19.1,rpg:11.1,apg:3.1,spg:1.1,bpg:1.1,tov:1.5},
      {name:'Sabrina Ionescu',team:'Phantom',gp:9,ppg:18.2,rpg:7.0,apg:4.1,spg:.4,bpg:.2,tov:1.7},
      {name:'Skylar Diggins',team:'Lunar Owls',gp:14,ppg:17.9,rpg:2.6,apg:4.7,spg:1.5,bpg:.4,tov:1.4},
      {name:'Brittney Griner',team:'Phantom',gp:14,ppg:16.7,rpg:5.8,apg:1.4,spg:.3,bpg:1.3,tov:1.7}
    ],
    directory:{
      'Lunar Owls':['Napheesa Collier','Skylar Diggins','Allisha Gray','Shakira Austin','Courtney Williams'],
      'Rose':['Chelsea Gray','Angel Reese','Kahleah Copper','Brittney Sykes','Lexie Hull','Azurá Stevens'],
      'Laces':['Alyssa Thomas','Jackie Young','Tiffany Hayes','Kayla McBride','Kate Martin','Stefanie Dolson'],
      'Vinyl':['Arike Ogunbowale','Dearica Hamby','Rhyne Howard','Aliyah Boston','Jordin Canada','Rae Burrell'],
      'Mist':['Breanna Stewart','Jewell Loyd','Courtney Vandersloot','Rickea Jackson','DiJonai Carrington','Aaliyah Edwards'],
      'Phantom':['Brittney Griner','Marina Mabrey','Satou Sabally','Natasha Cloud','Katie Lou Samuelson','Sabrina Ionescu','Natisha Hiedeman']
    },
    directoryNote:'Core club players plus official wildcard and in-season participants are preserved here. Unrivaled used wildcard and replacement slots during Season 1, so this is a season player pool rather than a single-date roster snapshot.'
  },
  2026:{
    season:'Season 2 · 2026',champion:'Mist',championNote:'Beat Phantom 80–74 in the championship.',leader:'Phantom',leaderRecord:'11-3',mvp:'Chelsea Gray',clubs:8,
    standings:unrivaledTeams.map(t=>({name:t.name,w:t.w,l:t.l,pct:t.pct,status:t.status,pf:t.pf,pa:t.pa,diff:t.diff})),
    players:[
      {name:'Marina Mabrey',team:'Lunar Owls',gp:13,ppg:25.3,rpg:6.8,apg:4.8,spg:.9,bpg:.2,tov:3.2},
      {name:'Chelsea Gray',team:'Rose',gp:14,ppg:24.2,rpg:5.6,apg:6.1,spg:1.3,bpg:.6,tov:2.8},
      {name:'Kelsey Plum',team:'Phantom',gp:14,ppg:22.6,rpg:4.9,apg:5.0,spg:.6,bpg:.1,tov:1.8},
      {name:'Paige Bueckers',team:'Breeze',gp:14,ppg:22.1,rpg:6.1,apg:5.5,spg:.7,bpg:.6,tov:2.3},
      {name:'Allisha Gray',team:'Mist',gp:13,ppg:21.8,rpg:4.7,apg:2.8,spg:1.0,bpg:.6,tov:1.5},
      {name:'Breanna Stewart',team:'Mist',gp:14,ppg:21.4,rpg:9.1,apg:3.0,spg:.9,bpg:.6,tov:1.6},
      {name:'Aaliyah Edwards',team:'Lunar Owls',gp:12,ppg:20.4,rpg:12.4,apg:1.8,spg:.8,bpg:.5,tov:3.1},
      {name:'Brittney Sykes',team:'Laces',gp:14,ppg:20.3,rpg:4.7,apg:1.9,spg:1.6,bpg:.4,tov:1.9},
      {name:'Kahleah Copper',team:'Rose',gp:11,ppg:19.0,rpg:4.4,apg:.8,spg:.1,bpg:.3,tov:1.1},
      {name:'Aliyah Boston',team:'Phantom',gp:14,ppg:18.9,rpg:9.7,apg:2.5,spg:.9,bpg:2.1,tov:1.3}
    ],
    directory:{},
    directoryNote:'Season 2 directory uses the final official Unrivaled player pool and club assignments recorded for 2026.'
  }
};
function esc(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function clubSlug(v=''){return String(v).toLowerCase().replace(/bc$/,'').trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function clubLogo(v=''){return `/api/league-team-image?league=unrivaled&key=${encodeURIComponent(clubSlug(v))}`;}
function pct(v){return Number(v).toFixed(3).replace('0.','.')}
function gradeLetter(score){if(score>=97)return'A+';if(score>=93)return'A';if(score>=90)return'A-';if(score>=87)return'B+';if(score>=83)return'B';if(score>=80)return'B-';if(score>=77)return'C+';if(score>=73)return'C';if(score>=70)return'C-';if(score>=67)return'D+';if(score>=63)return'D';return'D-'}
function normalized(value,min,max,invert=false){if(max===min)return.5;const n=(Number(value)-min)/(max-min);return invert?1-n:n}
function gradeArchivePlayers(season){
  const data=seasonArchive[season],players=data.players,teamPct=new Map(data.standings.map(t=>[t.name,t.pct]));
  const metrics=players.map(p=>({ppg:p.ppg,rpg:p.rpg,apg:p.apg,def:p.spg+p.bpg,tov:p.tov,team:teamPct.get(p.team)||0}));
  const keys=['ppg','rpg','apg','def','tov','team'],weights={ppg:.35,rpg:.18,apg:.18,def:.12,tov:.07,team:.10};
  const bounds=Object.fromEntries(keys.map(k=>[k,[Math.min(...metrics.map(m=>m[k])),Math.max(...metrics.map(m=>m[k]))]]));
  const computed=players.map((p,i)=>{const m=metrics[i];let composite=0;keys.forEach(k=>{const [min,max]=bounds[k];composite+=weights[k]*normalized(m[k],min,max,k==='tov')});return{...p,composite}}).sort((a,b)=>b.composite-a.composite);
  computed.forEach((p,index)=>{p.gradeScore=98-index*2;p.grade=gradeLetter(p.gradeScore)});
  const byName=new Map(computed.map(p=>[p.name,p]));
  return players.map(p=>byName.get(p.name));
}
function renderSignings(){const el=document.getElementById('unrivaledSignings');if(!el)return;const aboard=season3Roster.map(player=>`<a class="unrivaled-signing-card" href="/playerpedia.html?search=${encodeURIComponent(player.name)}#playerpedia-directory"><span>${esc(player.team)} · 2027</span><strong>${esc(player.name)}</strong><p>Season 3 roster</p><span class="unrivaled-signing-grade neutral">Player profile →</span></a>`).join('');el.innerHTML=aboard;}
function renderStandings(){const el=document.getElementById('unrivaledStandings');if(!el)return;el.innerHTML=`<table class="unrivaled-table"><thead><tr><th>Club</th><th>W</th><th>L</th><th>PCT</th><th>PF</th><th>PA</th><th>DIFF</th><th>STRK</th></tr></thead><tbody>${unrivaledTeams.map((t,i)=>`<tr><td class="team-cell"><div class="league-team-lockup"><span class="seed-mark ${i>5?'out':''}">${i+1}</span><span class="league-team-logo"><img src="${clubLogo(t.name)}" alt="" loading="lazy"></span><div><strong>${esc(t.name)}</strong><small>${esc(t.status)}</small></div></div></td><td>${t.w}</td><td>${t.l}</td><td>${pct(t.pct)}</td><td>${t.pf}</td><td>${t.pa}</td><td>${t.diff>0?'+':''}${t.diff}</td><td>${esc(t.streak)}</td></tr>`).join('')}</tbody></table>`}
function renderClubTabs(){const tabs=document.getElementById('unrivaledClubTabs');if(!tabs)return;tabs.innerHTML=unrivaledTeams.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===0}" class="${i===0?'active':''}" data-team="${i}"><span class="unrivaled-tab-logo"><img src="${clubLogo(t.name)}" alt="" loading="lazy"></span>${esc(t.name)}</button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>selectClub(Number(btn.dataset.team))))}
function selectClub(index){const t=unrivaledTeams[index]||unrivaledTeams[0];document.querySelectorAll('#unrivaledClubTabs button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index))});const panel=document.getElementById('unrivaledClubPanel');if(!panel)return;panel.innerHTML=`<div class="unrivaled-club-room"><div><div class="unrivaled-club-title"><span class="league-team-logo lg"><img src="${clubLogo(t.name)}" alt="${esc(t.name)} logo" loading="lazy"></span><div><p class="kicker">${esc(t.status)}</p><h3>${esc(t.name)} BC</h3></div></div><p>${esc(t.note)}</p><a href="https://www.unrivaled.basketball/${encodeURIComponent(t.name.toLowerCase().replace('lunar owls','lunar-owls').replace(/\s+/g,'-'))}" target="_blank" rel="noopener noreferrer" style="font-weight:900">Official club page ↗</a></div><div class="unrivaled-club-metrics"><article><span>Record</span><strong>${esc(t.record)}</strong></article><article><span>Win %</span><strong>${pct(t.pct)}</strong></article><article><span>PPG</span><strong>${t.ppg.toFixed(1)}</strong></article><article><span>Point Diff</span><strong>${t.diff>0?'+':''}${t.diff}</strong></article><article><span>Points For</span><strong>${t.pf}</strong></article><article><span>Points Against</span><strong>${t.pa}</strong></article></div></div>`}
function renderLeaders(target,items){const el=document.getElementById(target);if(!el)return;el.innerHTML=items.map((x,i)=>`<div class="unrivaled-leader-row"><span>${i+1}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.label)} · ${esc(x.team)}</small></div><b>${esc(x.value)}</b></div>`).join('')}
function renderArchiveTabs(active=2025){const tabs=document.getElementById('unrivaledSeasonTabs');if(!tabs)return;tabs.innerHTML=[2025,2026].map(year=>`<button type="button" role="tab" aria-selected="${year===active}" class="${year===active?'active':''}" data-season="${year}"><span>Season ${year===2025?'1':'2'}</span><strong>${year}</strong></button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>renderArchive(Number(btn.dataset.season))))}
function archiveSummary(data){return`<article><span>CHAMPION</span><strong>${esc(data.champion)} BC</strong><p>${esc(data.championNote)}</p></article><article><span>REGULAR-SEASON NO. 1</span><strong>${esc(data.leader)}</strong><p>${esc(data.leaderRecord)}</p></article><article><span>MVP</span><strong>${esc(data.mvp)}</strong><p>${esc(data.season)}</p></article><article><span>LEAGUE SIZE</span><strong>${data.clubs} clubs</strong><p>${data.clubs===6?'Inaugural structure':'Expanded Season 2 structure'}</p></article>`}
function archiveStandings(data){return`<table class="unrivaled-archive-table"><thead><tr><th>#</th><th>Club</th><th>W</th><th>L</th><th>PCT</th><th>Finish</th></tr></thead><tbody>${data.standings.map((t,i)=>`<tr><td>${i+1}</td><td><strong>${esc(t.name)}</strong></td><td>${t.w}</td><td>${t.l}</td><td>${pct(t.pct)}</td><td>${esc(t.status)}</td></tr>`).join('')}</tbody></table>`}
function archivePlayers(year,data){const graded=gradeArchivePlayers(year);return graded.map((p,i)=>`<article class="unrivaled-archive-player"><span class="archive-player-rank">${i+1}</span><div class="archive-player-name"><strong>${esc(p.name)}</strong><small>${esc(p.team)} · ${p.gp} GP</small></div><div class="archive-player-stats"><span><b>${p.ppg.toFixed(1)}</b> PPG</span><span><b>${p.rpg.toFixed(1)}</b> RPG</span><span><b>${p.apg.toFixed(1)}</b> APG</span><span><b>${(p.spg+p.bpg).toFixed(1)}</b> STL+BLK</span></div><div class="unrivaled-grade"><span>UNRIVALED GRADE</span><strong>${p.gradeScore}</strong><b>${p.grade}</b></div></article>`).join('')}
function archiveDirectory(data){const entries=Object.entries(data.directory||{});if(!entries.length)return'<div class="unrivaled-directory-loading">Loading official Season 2 player directory…</div>';return entries.map(([team,names])=>`<section class="unrivaled-directory-club"><h4>${esc(team)} BC</h4><div>${names.map(name=>`<span>${esc(name)}</span>`).join('')}</div></section>`).join('')}
function renderArchive(year=2025){const data=seasonArchive[year]||seasonArchive[2025];document.querySelectorAll('#unrivaledSeasonTabs button').forEach(btn=>{const on=Number(btn.dataset.season)===year;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on))});const summary=document.getElementById('unrivaledArchiveSummary'),standings=document.getElementById('unrivaledArchiveStandings'),players=document.getElementById('unrivaledArchivePlayers'),directory=document.getElementById('unrivaledArchiveDirectory');if(summary)summary.innerHTML=archiveSummary(data);if(standings)standings.innerHTML=archiveStandings(data);if(players)players.innerHTML=archivePlayers(year,data);if(directory)directory.innerHTML=archiveDirectory(data);const st=document.getElementById('unrivaledArchiveStandingsTitle'),pt=document.getElementById('unrivaledArchivePlayersTitle'),dt=document.getElementById('unrivaledArchiveDirectoryTitle'),dn=document.getElementById('unrivaledArchiveDirectoryNote');if(st)st.textContent=`${year} final standings`;if(pt)pt.textContent=`${year} top 10 players`;if(dt)dt.textContent=`${year} player pool`;if(dn)dn.textContent=data.directoryNote||''}
async function load2026Directory(){try{const response=await fetch('/pro-offseason-affiliations.json',{cache:'no-store'});const payload=await response.json();const rows=payload?.unrivaled?.players;if(!Array.isArray(rows))return;const grouped={};rows.forEach(row=>{const name=row?.[0],team=row?.[1];if(!name||!team)return;(grouped[team]||(grouped[team]=[])).push(name)});Object.keys(grouped).forEach(team=>grouped[team].sort((a,b)=>a.localeCompare(b)));seasonArchive[2026].directory=grouped;if(document.querySelector('#unrivaledSeasonTabs button[data-season="2026"].active'))renderArchive(2026)}catch{}}
renderSignings();renderStandings();renderClubTabs();selectClub(0);renderLeaders('unrivaledPlayerLeaders',playerLeaders);renderLeaders('unrivaledTeamLeaders',teamLeaders);renderArchiveTabs(2025);renderArchive(2025);load2026Directory();

const unrivaledSchedule2027=[{"date":"2027-01-08","city":"Boston, MA","venue":"TD Garden","title":"Boston is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-08","city":"Inglewood, CA","venue":"Intuit Dome","title":"Los Angeles is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"10:00 PM ET","local":"7:00 PM PT"},{"time":"11:30 PM ET","local":"8:30 PM PT"}]},{"date":"2027-01-11","city":"Detroit, MI","venue":"Little Caesars Arena","title":"Detroit is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-11","city":"San Francisco, CA","venue":"Chase Center","title":"San Francisco is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"10:00 PM ET","local":"7:00 PM PT"},{"time":"11:30 PM ET","local":"8:30 PM PT"}]},{"date":"2027-01-19","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-20","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-22","city":"Brooklyn, NY","venue":"Barclays Center","title":"New York is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-23","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-01-24","city":"Minneapolis, MN","venue":"Target Center","title":"Minny is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"2:00 PM ET","local":"1:00 PM CT"},{"time":"3:30 PM ET","local":"2:30 PM CT"}]},{"date":"2027-01-26","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-29","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-01-30","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-01-31","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-01","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-02-05","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-02-06","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-07","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-08","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-02-12","city":"Houston, TX","venue":"Toyota Center","title":"Houston is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"7:30 PM ET","local":"6:30 PM CT"},{"time":"9:30 PM ET","local":"8:30 PM CT"}]},{"date":"2027-02-13","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-15","city":"Philadelphia, PA","venue":"Xfinity Mobile Arena","title":"Philly is Unrivaled","group":"Tour stop","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-02-18","city":"Miami, FL","venue":"Sephora Arena","title":"1-on-1 Tournament","group":"Tournament","type":"tournament","slots":[{"time":"7:00 PM ET","label":"Bracket to be announced"}]},{"date":"2027-02-19","city":"Miami, FL","venue":"Sephora Arena","title":"1-on-1 Tournament","group":"Tournament","type":"tournament","slots":[{"time":"7:30 PM ET","label":"Bracket to be announced"}]},{"date":"2027-02-20","city":"Miami, FL","venue":"Sephora Arena","title":"1-on-1 Tournament","group":"Tournament","type":"tournament","slots":[{"time":"6:00 PM ET","label":"Bracket to be announced"}]},{"date":"2027-02-23","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-26","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-02-27","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-02-28","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"8:00 PM ET"},{"time":"9:30 PM ET"}]},{"date":"2027-03-01","city":"Miami, FL","venue":"Sephora Arena","type":"club","slots":[{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]},{"date":"2027-03-05","city":"Miami, FL","venue":"Sephora Arena","title":"Flex Schedule","group":"Flex schedule","type":"club","slots":[{"time":"1:00 PM ET"},{"time":"2:30 PM ET"},{"time":"7:30 PM ET"},{"time":"9:00 PM ET"}]}];
function renderUnrivaledSchedule2027(){
 const host=document.getElementById('unrivaledScheduleGrid');
 const search=document.getElementById('unrivaledScheduleSearch');
 const month=document.getElementById('unrivaledScheduleMonth');
 const kind=document.getElementById('unrivaledScheduleType');
 const count=document.getElementById('unrivaledScheduleCount');
 if(!host||!search||!month||!kind||!count)return;
 const query=search.value.trim().toLowerCase();
 const rows=unrivaledSchedule2027.filter(day=>{
  const text=[day.date,day.title||'',day.city,day.venue,day.group||''].join(' ').toLowerCase();
  return (!query||text.includes(query))&&(!month.value||day.date.startsWith(month.value))&&(!kind.value||day.type===kind.value);
 });
 const fmt=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
 host.innerHTML=rows.length?rows.map(day=>{
  const dateLabel=fmt.format(new Date(day.date+'T12:00:00Z'));
  const slots=day.slots.map((slot,i)=>{
   const detail=day.type==='tournament'?(slot.label||'Bracket to be announced'):`Club game ${i+1} · matchup to be announced`;
   return `<div class="unrivaled-schedule-slot${day.type==='tournament'?' tournament':''}"><div><time>${esc(slot.time)}</time>${slot.local?`<small>${esc(slot.local)} local</small>`:''}</div><p>${esc(detail)}</p></div>`;
  }).join('');
  return `<article class="unrivaled-schedule-card"><header><div class="unrivaled-schedule-card-top"><strong>${dateLabel} 2027</strong><span>${esc(day.group||'Regular season')}</span></div><h3>${esc(day.city)}</h3><p>${esc(day.venue)}</p>${day.title?`<small>${esc(day.title)}</small>`:''}</header><div class="unrivaled-schedule-slots">${slots}</div><footer><span>HBO Max listed</span><span>TV details TBD</span></footer></article>`;
 }).join(''):'<p class="unrivaled-schedule-empty">No schedule listings match those filters.</p>';
 const starts=rows.reduce((sum,day)=>sum+day.slots.length,0);
 count.textContent=`Showing ${rows.length} of ${unrivaledSchedule2027.length} date and venue listings · ${starts} listed start times`;
}
function initUnrivaledSchedule2027(){
 const search=document.getElementById('unrivaledScheduleSearch');
 const month=document.getElementById('unrivaledScheduleMonth');
 const kind=document.getElementById('unrivaledScheduleType');
 if(!search||!month||!kind)return;
 [search,month,kind].forEach(control=>control.addEventListener(control===search?'input':'change',renderUnrivaledSchedule2027));
 const clubGames=unrivaledSchedule2027.filter(day=>day.type==='club').reduce((sum,day)=>sum+day.slots.length,0);
 const tournamentSessions=unrivaledSchedule2027.filter(day=>day.type==='tournament').length;
 document.getElementById('unrivaledScheduleOverview').textContent=`${clubGames} club-game start times · ${tournamentSessions} 1-on-1 tournament sessions · official dates and venues`;
 renderUnrivaledSchedule2027();
}
initUnrivaledSchedule2027();

const unrivaledRevealRosters2027=[{"club":"Breeze","players":[{"name":"Paige Bueckers","image":"https://www.unrivaled.basketball/roster-reveal/headshots/paige-bueckers-bsnh0c.png"},{"name":"Kahleah Copper","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kahleah-copper-x3jo78.png"},{"name":"Dominique Malonga","image":"https://www.unrivaled.basketball/roster-reveal/headshots/dominique-malonga-7wfesf.png"},{"name":"Kaitlyn Chen","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kaitlyn-chen-elod3r.png"},{"name":"DiJonai Carrington","image":"https://www.unrivaled.basketball/roster-reveal/headshots/dijonai-carrington-pgs6bj.png"},{"name":"Monique Billings","image":"https://www.unrivaled.basketball/roster-reveal/headshots/monique-billings-c9rf58.png"}]},{"club":"Hive","players":[{"name":"Olivia Miles","image":"https://www.unrivaled.basketball/roster-reveal/headshots/olivia-miles-w4y2he.png"},{"name":"Sonia Citron","image":"https://www.unrivaled.basketball/roster-reveal/headshots/sonia-citron-mih0an.png"},{"name":"Cameron Brink","image":"https://www.unrivaled.basketball/roster-reveal/headshots/cameron-brink-lmguq8.png"},{"name":"Natisha Hiedeman","image":"https://www.unrivaled.basketball/roster-reveal/headshots/natisha-hiedeman-6x9rjq.png"},{"name":"Rae Burrell","image":"https://www.unrivaled.basketball/roster-reveal/headshots/rae-burrell-2h6620.png"},{"name":"Naz Hillmon","image":"https://www.unrivaled.basketball/roster-reveal/headshots/naz-hillmon-z95dta.png"}]},{"club":"Laces","players":[{"name":"Jackie Young","image":"https://www.unrivaled.basketball/roster-reveal/headshots/jackie-young-spdczt.png"},{"name":"Gabby Williams","image":"https://www.unrivaled.basketball/roster-reveal/headshots/gabby-williams-jcotwo.png"},{"name":"Jessica Shepard","image":"https://www.unrivaled.basketball/roster-reveal/headshots/jessica-shepard-66x9kv.png"},{"name":"Marine Johannès","image":"https://www.unrivaled.basketball/roster-reveal/headshots/marine-johannes-wrdf14.png"},{"name":"Maddy Siegrist","image":"https://www.unrivaled.basketball/roster-reveal/headshots/maddy-siegrist-d2zbhe.png"},{"name":"Satou Sabally","image":"https://www.unrivaled.basketball/roster-reveal/headshots/satou-sabally-3snb4i.png"}]},{"club":"Lunar Owls","players":[{"name":"Courtney Williams","image":"https://www.unrivaled.basketball/roster-reveal/headshots/courtney-williams-ll7hdv.png"},{"name":"Marina Mabrey","image":"https://www.unrivaled.basketball/roster-reveal/headshots/marina-mabrey-0n7ppv.png"},{"name":"Napheesa Collier","image":"https://www.unrivaled.basketball/roster-reveal/headshots/napheesa-collier-5fl5d3.png"},{"name":"Skylar Diggins","image":"https://www.unrivaled.basketball/roster-reveal/headshots/skylar-diggins-nvi9hr.png"},{"name":"Sydney Taylor","image":"https://www.unrivaled.basketball/roster-reveal/headshots/sydney-taylor-ni6psg.png"},{"name":"Temi Fágbénlé","image":"https://www.unrivaled.basketball/roster-reveal/headshots/temi-fagbenle-9ep5y2.png"}]},{"club":"Mist","players":[{"name":"Veronica Burton","image":"https://www.unrivaled.basketball/roster-reveal/headshots/veronica-burton-nv92vt.png"},{"name":"Bridget Carleton","image":"https://www.unrivaled.basketball/roster-reveal/headshots/bridget-carleton-74hvre.png"},{"name":"Breanna Stewart","image":"https://www.unrivaled.basketball/roster-reveal/headshots/breanna-stewart-3oi9i8.png"},{"name":"Arike Ogunbowale","image":"https://www.unrivaled.basketball/roster-reveal/headshots/arike-ogunbowale-iqu4qf.png"},{"name":"Kiki Rice","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kiki-rice-trm7d8.png"},{"name":"Isabelle Harrison","image":"https://www.unrivaled.basketball/roster-reveal/headshots/isabelle-harrison-vly7a1.png"}]},{"club":"Phantom","players":[{"name":"Natasha Cloud","image":"https://www.unrivaled.basketball/roster-reveal/headshots/natasha-cloud-9o4rj8.png"},{"name":"Tiffany Hayes","image":"https://www.unrivaled.basketball/roster-reveal/headshots/tiffany-hayes-st4g53.png"},{"name":"Kelsey Plum","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kelsey-plum-y5okac.png"},{"name":"Aaliyah Edwards","image":"https://www.unrivaled.basketball/roster-reveal/headshots/aaliyah-edwards-a8j89d.png"},{"name":"Kayla McBride","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kayla-mcbride-uyk18a.png"},{"name":"Li Yueru","image":"https://www.unrivaled.basketball/roster-reveal/headshots/li-yueru-jgvphf.png"}]},{"club":"Rose","players":[{"name":"Chelsea Gray","image":"https://www.unrivaled.basketball/roster-reveal/headshots/chelsea-gray-2v23ik.png"},{"name":"Brittney Sykes","image":"https://www.unrivaled.basketball/roster-reveal/headshots/brittney-sykes-v4rwep.png"},{"name":"Shakira Austin","image":"https://www.unrivaled.basketball/roster-reveal/headshots/shakira-austin-jm74zr.png"},{"name":"Aziaha James","image":"https://www.unrivaled.basketball/roster-reveal/headshots/aziaha-james-dooma2.png"},{"name":"Lexie Hull","image":"https://www.unrivaled.basketball/roster-reveal/headshots/lexie-hull-2gaf1q.png"},{"name":"Kayla Thornton","image":"https://www.unrivaled.basketball/roster-reveal/headshots/kayla-thornton-dsx0by.png"}]},{"club":"Vinyl","players":[{"name":"Allisha Gray","image":"https://www.unrivaled.basketball/roster-reveal/headshots/allisha-gray-eiw7qb.png"},{"name":"Rhyne Howard","image":"https://www.unrivaled.basketball/roster-reveal/headshots/rhyne-howard-5k9dwx.png"},{"name":"Dearica Hamby","image":"https://www.unrivaled.basketball/roster-reveal/headshots/dearica-hamby-ipwacs.png"},{"name":"Jordin Canada","image":"https://www.unrivaled.basketball/roster-reveal/headshots/jordin-canada-m5x5yt.png"},{"name":"Flau’jae Johnson","image":"https://www.unrivaled.basketball/roster-reveal/headshots/flaujae-johnson-nqorr8.png"},{"name":"Aneesah Morrow","image":"https://www.unrivaled.basketball/roster-reveal/headshots/aneesah-morrow-s9dg2d.png"}]}];
function renderUnrivaled2027RosterCards(){
 const grid=document.querySelector('.unrivaled-roster-grid[aria-label="2027 Unrivaled club rosters"]');
 if(!grid)return;
 grid.classList.add('unrivaled-portrait-roster-grid');
 grid.innerHTML=unrivaledRevealRosters2027.map(roster=>{
  const players=roster.players.map(player=>{
   const initials=String(player.name||'').trim().split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
   return '<figure class="unrivaled-roster-player"><div class="unrivaled-roster-player-photo"><img src="'+esc(player.image)+'" alt="Official Unrivaled Season 3 headshot of '+esc(player.name)+'" loading="lazy" decoding="async"><span aria-hidden="true">'+esc(initials)+'</span></div><figcaption>'+esc(player.name)+'</figcaption></figure>';
  }).join('');
  return '<article class="unrivaled-roster-card unrivaled-roster-headshot-card" aria-label="'+esc(roster.club)+' 2027 roster"><div class="unrivaled-roster-headshot-heading"><h3>'+esc(roster.club)+' BC</h3><span>6 players</span></div><div class="unrivaled-roster-headshot-list">'+players+'</div></article>';
 }).join('');
 grid.querySelectorAll('.unrivaled-roster-player-photo img').forEach(img=>img.addEventListener('error',function(){this.remove();this.parentElement.classList.add('is-no-photo');}));
}
renderUnrivaled2027RosterCards();

function renderUnrivaledRevealRoster(index=0){
 const tabs=Array.from(document.querySelectorAll('#unrivaledRevealBoard [data-roster-index]'));
 const panel=document.getElementById('unrivaledRevealPanel');
 if(!panel||!tabs.length)return;
 const roster=unrivaledRevealRosters2027[index]||unrivaledRevealRosters2027[0];
 tabs.forEach((tab,i)=>{const active=i===index;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));});
 panel.setAttribute('aria-labelledby','unrivaledRevealTab'+index);
 const cards=roster.players.map(player=>'<figure class="unrivaled-reveal-player"><img src="'+esc(player.image)+'" alt="Official Unrivaled 2027 portrait of '+esc(player.name)+'" loading="lazy" decoding="async"><figcaption><strong>'+esc(player.name)+'</strong><span>'+esc(roster.club)+' BC</span></figcaption></figure>').join('');
 panel.innerHTML='<div class="unrivaled-reveal-panel-heading"><h3>'+esc(roster.club)+' BC</h3><span>6 confirmed players</span></div><div class="unrivaled-reveal-player-grid">'+cards+'</div>';
}
function initUnrivaledRevealRoster(){
 const tabs=Array.from(document.querySelectorAll('#unrivaledRevealBoard [data-roster-index]'));
 tabs.forEach(tab=>tab.addEventListener('click',()=>renderUnrivaledRevealRoster(Number(tab.dataset.rosterIndex))));
 renderUnrivaledRevealRoster(0);
}
initUnrivaledRevealRoster();


(function initUnrivaledSeasonRoster(){
 const board=document.getElementById('unrivaledRevealBoard');
 const seasonTabs=document.getElementById('unrivaledRevealSeasonTabs');
 const clubTabs=document.getElementById('unrivaledRevealClubTabs');
 const panel=document.getElementById('unrivaledRevealPanel');
 if(!board||!seasonTabs||!clubTabs||!panel)return;
 const state={season:2027,club:0,photos:new Map()};
 const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const initials=value=>String(value||'').trim().split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
 const officialPlayerSlugOverrides={'skylardiggins':'skylar-diggins'};
 const officialPlayerImageRoot='https://pub-ad8cc693759b4b55a181a76af041efa0.r2.dev/players/';
 function officialPlayerSlug(name){
  const normalized=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return officialPlayerSlugOverrides[key(name)]||normalized;
 }
 function archivePortraitSources(name,club,year){
  const slug=officialPlayerSlug(name),team=clubSlug(club).replace(/-bc$/,'');
  const base=officialPlayerImageRoot+slug+'/images/';
  const seasonFiles=year===2025?[team+'-headshot.jpg',team+'-headshot.png']:['2026/'+team+'-headshot.jpg','2026/'+team+'-headshot.png'];
  const candidates=seasonFiles.map(file=>base+file);
  candidates.push(base+'headshot.jpg',base+'headshot.png');
  if(key(name)==='skylardiggins')candidates.push('https://pub-ad8cc693759b4b55a181a76af041efa0.r2.dev/players/skylar-diggins/images/headshot.jpg?v=1767477677611');
  const verified=state.photos.get(key(name));
  if(verified)candidates.push(verified);
  return Array.from(new Set(candidates));
 }
 function seasonTeams(year){
  if(year===2027)return unrivaledRevealRosters2027;
  const directory=seasonArchive[year]&&seasonArchive[year].directory||{};
  return Object.entries(directory).map(entry=>({club:entry[0],players:entry[1].map(name=>({name:name,imageCandidates:archivePortraitSources(name,entry[0],year)}))}));
 }
 function render(){
  const year=state.season,rosters=seasonTeams(year);
  seasonTabs.querySelectorAll('[data-reveal-season]').forEach(button=>{const active=Number(button.dataset.revealSeason)===year;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
  const label=document.getElementById('unrivaledRevealSeasonLabel');
  const title=document.getElementById('unrivaledRevealTitle');
  const description=document.getElementById('unrivaledRevealDescription');
  const official=document.getElementById('unrivaledRevealOfficialLink');
  const source=document.getElementById('unrivaledRevealSource');
  if(label)label.textContent='SEASON '+(year===2025?'1':year===2026?'2':'3')+' · '+year+' · PLAYER PORTRAITS';
  if(title)title.textContent=year===2027?'The 48, in their new clubs.':(year===2026?'The Season 2 clubs.':'The inaugural-season clubs.');
  if(description)description.textContent=year===2027?'Official Unrivaled portraits for every confirmed 2027 club roster.':(year===2025?'Season 1 club directory, including core players and official in-season additions.':'Season 2 club assignments from the league record, paired with verified real player headshots.');
  if(official){official.href=year===2027?'https://www.unrivaled.basketball/roster-reveal/2027':'https://www.unrivaled.basketball/stats/player?season='+year;official.textContent=year===2027?'Official 2027 roster reveal ↗':'Official '+year+' season archive ↗';}
  if(source)source.textContent=year===2027?'Portraits: official Unrivaled Season 3 roster reveal.':'Portraits: official Unrivaled player and club media, with verified real headshots used if an official image is unavailable.';
  if(!rosters.length){clubTabs.innerHTML='';panel.innerHTML='<div class="unrivaled-reveal-panel-heading"><h3>Season directory</h3><span>Loading</span></div><p class="unrivaled-reveal-loading">Season club assignments are loading.</p>';return;}
  state.club=Math.min(state.club,rosters.length-1);
  clubTabs.setAttribute('aria-label','Season '+year+' Unrivaled clubs');
  clubTabs.innerHTML=rosters.map((roster,index)=>'<button type="button" role="tab" id="unrivaledRevealClubTab'+index+'" aria-controls="unrivaledRevealPanel" aria-selected="'+String(index===state.club)+'" class="'+(index===state.club?'active':'')+'" data-reveal-club="'+index+'">'+roster.club+'</button>').join('');
  const roster=rosters[state.club]||rosters[0];
  panel.setAttribute('aria-labelledby','unrivaledRevealClubTab'+state.club);
  const players=roster.players||[];
  const cards=players.map(player=>{
   const candidates=Array.isArray(player.imageCandidates)?player.imageCandidates:(player.image?[player.image]:[]);
   const photo=candidates[0]||'';
   const fallback=initials(player.name);
   const image=photo?'<img src="'+esc(photo)+'" data-fallback-photos="'+esc(JSON.stringify(candidates.slice(1)))+'" alt="Official Unrivaled '+year+' player portrait of '+esc(player.name)+'" loading="lazy" decoding="async">':'';
   return '<figure class="unrivaled-reveal-player"><div class="unrivaled-reveal-photo-frame '+(photo?'':'is-no-photo')+'">'+image+'<span aria-hidden="true">'+esc(fallback)+'</span></div><figcaption><strong>'+esc(player.name)+'</strong><span>'+esc(roster.club)+' BC</span></figcaption></figure>';
  }).join('');
  panel.innerHTML='<div class="unrivaled-reveal-panel-heading"><h3>'+esc(roster.club)+' BC</h3><span>'+players.length+' '+(year===2027?'confirmed players':'players listed')+'</span></div><div class="unrivaled-reveal-player-grid">'+cards+'</div>';
  panel.querySelectorAll('.unrivaled-reveal-player img').forEach(img=>img.addEventListener('error',function(){let remaining=[];try{remaining=JSON.parse(this.dataset.fallbackPhotos||'[]');}catch{}if(remaining.length){this.dataset.fallbackPhotos=JSON.stringify(remaining.slice(1));this.src=remaining[0];return;}this.remove();this.parentElement.classList.add('is-no-photo');}));
 }
 seasonTabs.addEventListener('click',event=>{const button=event.target.closest('[data-reveal-season]');if(!button)return;state.season=Number(button.dataset.revealSeason);state.club=0;render();});
 clubTabs.addEventListener('click',event=>{const button=event.target.closest('[data-reveal-club]');if(!button)return;state.club=Number(button.dataset.revealClub);render();});
 render();
 Promise.all([
  fetch('/data/playerpedia-verified-headshots.json',{cache:'force-cache'}).then(response=>response.ok?response.json():null).catch(()=>null),
  fetch('/pro-offseason-affiliations.json',{cache:'no-store'}).then(response=>response.ok?response.json():null).catch(()=>null)
 ]).then(([headshots,affiliations])=>{
  Object.values(headshots&&headshots.byId||{}).forEach(item=>{if(item&&item.name&&item.url)state.photos.set(key(item.name),item.url);});
  const rows=affiliations&&affiliations.unrivaled&&affiliations.unrivaled.players;
  if(Array.isArray(rows)){const grouped={};rows.forEach(row=>{const name=row&&row[0],club=row&&row[1];if(name&&club)(grouped[club]||(grouped[club]=[])).push(name);});Object.keys(grouped).forEach(club=>grouped[club].sort((a,b)=>a.localeCompare(b)));if(Object.keys(grouped).length)seasonArchive[2026].directory=grouped;}
  render();
 });
})();
