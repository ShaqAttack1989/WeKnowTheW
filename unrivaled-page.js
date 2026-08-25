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
const signings=[
{name:'Olivia Miles',tag:'NEW · APR 12',copy:'First pro contract, debuting in Season 3.',grade:'NR'},
{name:'Gabby Williams',tag:'NEW · JUN 18',copy:'WNBA All-Star and two-time Olympic medalist.',grade:'NR'},
{name:"Flau’jae Johnson",tag:'NEW · JUN 22',copy:'2026 WNBA No. 8 pick and former Future is Unrivaled NIL athlete.',grade:'NR'},
{name:'Bridget Carleton',tag:'NEW · JUN 25',copy:'Two-time Olympian joining for her first Unrivaled season.',grade:'NR'},
{name:'Marine Johannès',tag:'NEW · JUN 29',copy:'Two-time Olympic medalist and elite movement shooter.',grade:'NR'},
{name:'Kayla Thornton',tag:'NEW · JUL 2',copy:'WNBA champion and All-Star joining on a multi-year deal.',grade:'NR'},
{name:'Kayla McBride',tag:'RETURN · JUL 7',copy:'All-Unrivaled First Team guard returns for Season 3.',grade:'2025'},
{name:'Jessica Shepard',tag:'NEW · JUL 8',copy:'2026 WNBA All-Star starter joining on a multi-year deal.',grade:'NR'}
];
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
function renderSignings(){const el=document.getElementById('unrivaledSignings');if(!el)return;const grade2025=new Map(gradeArchivePlayers(2025).map(p=>[p.name,p]));el.innerHTML=signings.map(s=>{const prior=grade2025.get(s.name);const grade=s.grade==='2025'&&prior?`<span class="unrivaled-signing-grade">2025 grade ${prior.gradeScore} · ${prior.grade}</span>`:`<span class="unrivaled-signing-grade neutral">Season 3 grade · NR</span>`;return`<article class="unrivaled-signing-card"><span>${esc(s.tag)}</span><strong>${esc(s.name)}</strong><p>${esc(s.copy)}</p>${grade}</article>`}).join('')}
function renderStandings(){const el=document.getElementById('unrivaledStandings');if(!el)return;el.innerHTML=`<table class="unrivaled-table"><thead><tr><th>Club</th><th>W</th><th>L</th><th>PCT</th><th>PF</th><th>PA</th><th>DIFF</th><th>STRK</th></tr></thead><tbody>${unrivaledTeams.map((t,i)=>`<tr><td class="team-cell"><span class="seed-mark ${i>5?'out':''}">${i+1}</span><strong>${esc(t.name)}</strong><small>${esc(t.status)}</small></td><td>${t.w}</td><td>${t.l}</td><td>${pct(t.pct)}</td><td>${t.pf}</td><td>${t.pa}</td><td>${t.diff>0?'+':''}${t.diff}</td><td>${esc(t.streak)}</td></tr>`).join('')}</tbody></table>`}
function renderClubTabs(){const tabs=document.getElementById('unrivaledClubTabs');if(!tabs)return;tabs.innerHTML=unrivaledTeams.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===0}" class="${i===0?'active':''}" data-team="${i}">${esc(t.name)}</button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>selectClub(Number(btn.dataset.team))))}
function selectClub(index){const t=unrivaledTeams[index]||unrivaledTeams[0];document.querySelectorAll('#unrivaledClubTabs button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index))});const panel=document.getElementById('unrivaledClubPanel');if(!panel)return;panel.innerHTML=`<div class="unrivaled-club-room"><div><p class="kicker">${esc(t.status)}</p><h3>${esc(t.name)} BC</h3><p>${esc(t.note)}</p><a href="https://www.unrivaled.basketball/${encodeURIComponent(t.name.toLowerCase().replace('lunar owls','lunar-owls').replace(/\s+/g,'-'))}" target="_blank" rel="noopener noreferrer" style="font-weight:900">Official club page ↗</a></div><div class="unrivaled-club-metrics"><article><span>Record</span><strong>${esc(t.record)}</strong></article><article><span>Win %</span><strong>${pct(t.pct)}</strong></article><article><span>PPG</span><strong>${t.ppg.toFixed(1)}</strong></article><article><span>Point Diff</span><strong>${t.diff>0?'+':''}${t.diff}</strong></article><article><span>Points For</span><strong>${t.pf}</strong></article><article><span>Points Against</span><strong>${t.pa}</strong></article></div></div>`}
function renderLeaders(target,items){const el=document.getElementById(target);if(!el)return;el.innerHTML=items.map((x,i)=>`<div class="unrivaled-leader-row"><span>${i+1}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.label)} · ${esc(x.team)}</small></div><b>${esc(x.value)}</b></div>`).join('')}
function renderArchiveTabs(active=2025){const tabs=document.getElementById('unrivaledSeasonTabs');if(!tabs)return;tabs.innerHTML=[2025,2026].map(year=>`<button type="button" role="tab" aria-selected="${year===active}" class="${year===active?'active':''}" data-season="${year}"><span>Season ${year===2025?'1':'2'}</span><strong>${year}</strong></button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>renderArchive(Number(btn.dataset.season))))}
function archiveSummary(data){return`<article><span>CHAMPION</span><strong>${esc(data.champion)} BC</strong><p>${esc(data.championNote)}</p></article><article><span>REGULAR-SEASON NO. 1</span><strong>${esc(data.leader)}</strong><p>${esc(data.leaderRecord)}</p></article><article><span>MVP</span><strong>${esc(data.mvp)}</strong><p>${esc(data.season)}</p></article><article><span>LEAGUE SIZE</span><strong>${data.clubs} clubs</strong><p>${data.clubs===6?'Inaugural structure':'Expanded Season 2 structure'}</p></article>`}
function archiveStandings(data){return`<table class="unrivaled-archive-table"><thead><tr><th>#</th><th>Club</th><th>W</th><th>L</th><th>PCT</th><th>Finish</th></tr></thead><tbody>${data.standings.map((t,i)=>`<tr><td>${i+1}</td><td><strong>${esc(t.name)}</strong></td><td>${t.w}</td><td>${t.l}</td><td>${pct(t.pct)}</td><td>${esc(t.status)}</td></tr>`).join('')}</tbody></table>`}
function archivePlayers(year,data){const graded=gradeArchivePlayers(year);return graded.map((p,i)=>`<article class="unrivaled-archive-player"><span class="archive-player-rank">${i+1}</span><div class="archive-player-name"><strong>${esc(p.name)}</strong><small>${esc(p.team)} · ${p.gp} GP</small></div><div class="archive-player-stats"><span><b>${p.ppg.toFixed(1)}</b> PPG</span><span><b>${p.rpg.toFixed(1)}</b> RPG</span><span><b>${p.apg.toFixed(1)}</b> APG</span><span><b>${(p.spg+p.bpg).toFixed(1)}</b> STL+BLK</span></div><div class="unrivaled-grade"><span>UNRIVALED GRADE</span><strong>${p.gradeScore}</strong><b>${p.grade}</b></div></article>`).join('')}
function archiveDirectory(data){const entries=Object.entries(data.directory||{});if(!entries.length)return'<div class="unrivaled-directory-loading">Loading official Season 2 player directory…</div>';return entries.map(([team,names])=>`<section class="unrivaled-directory-club"><h4>${esc(team)} BC</h4><div>${names.map(name=>`<span>${esc(name)}</span>`).join('')}</div></section>`).join('')}
function renderArchive(year=2025){const data=seasonArchive[year]||seasonArchive[2025];document.querySelectorAll('#unrivaledSeasonTabs button').forEach(btn=>{const on=Number(btn.dataset.season)===year;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on))});const summary=document.getElementById('unrivaledArchiveSummary'),standings=document.getElementById('unrivaledArchiveStandings'),players=document.getElementById('unrivaledArchivePlayers'),directory=document.getElementById('unrivaledArchiveDirectory');if(summary)summary.innerHTML=archiveSummary(data);if(standings)standings.innerHTML=archiveStandings(data);if(players)players.innerHTML=archivePlayers(year,data);if(directory)directory.innerHTML=archiveDirectory(data);const st=document.getElementById('unrivaledArchiveStandingsTitle'),pt=document.getElementById('unrivaledArchivePlayersTitle'),dt=document.getElementById('unrivaledArchiveDirectoryTitle'),dn=document.getElementById('unrivaledArchiveDirectoryNote');if(st)st.textContent=`${year} final standings`;if(pt)pt.textContent=`${year} top 10 players`;if(dt)dt.textContent=`${year} player pool`;if(dn)dn.textContent=data.directoryNote||''}
async function load2026Directory(){try{const response=await fetch('/pro-offseason-affiliations.json',{cache:'no-store'});const payload=await response.json();const rows=payload?.unrivaled?.players;if(!Array.isArray(rows))return;const grouped={};rows.forEach(row=>{const name=row?.[0],team=row?.[1];if(!name||!team)return;(grouped[team]||(grouped[team]=[])).push(name)});Object.keys(grouped).forEach(team=>grouped[team].sort((a,b)=>a.localeCompare(b)));seasonArchive[2026].directory=grouped;if(document.querySelector('#unrivaledSeasonTabs button[data-season="2026"].active'))renderArchive(2026)}catch{}}
renderSignings();renderStandings();renderClubTabs();selectClub(0);renderLeaders('unrivaledPlayerLeaders',playerLeaders);renderLeaders('unrivaledTeamLeaders',teamLeaders);renderArchiveTabs(2025);renderArchive(2025);load2026Directory();