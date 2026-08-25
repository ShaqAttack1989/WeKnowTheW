const unrivaledTeams=[
{name:'Phantom',record:'11-3',w:11,l:3,pct:.786,pf:1027,pa:931,diff:96,streak:'W7',ppg:73.4,status:'Semifinalist',note:'The best regular-season record and the hottest finish in the league. Phantom earned the No. 1 seed and a bye before falling to Mist in the championship.'},
{name:'Mist',record:'10-4',w:10,l:4,pct:.714,pf:1088,pa:979,diff:109,streak:'W4',ppg:77.7,status:'2026 Champion',note:'The league’s highest-scoring club and best point differential. Mist turned a No. 2 seed into the franchise’s first championship.'},
{name:'Laces',record:'10-4',w:10,l:4,pct:.714,pf:984,pa:907,diff:77,streak:'W1',ppg:70.3,status:'First Round',note:'A 10-win regular season put Laces in the top tier, but the postseason ended immediately with an opening-round loss to Vinyl.'},
{name:'Rose',record:'6-8',w:6,l:8,pct:.429,pf:1003,pa:1047,diff:-44,streak:'L1',ppg:71.6,status:'First Round',note:'The defending champions returned to the playoffs, but Breeze ended the title defense in the first round.'},
{name:'Breeze',record:'6-8',w:6,l:8,pct:.429,pf:989,pa:974,diff:15,streak:'L2',ppg:70.6,status:'Semifinalist',note:'One of the two 2026 expansion clubs, Breeze reached the semifinals in its debut season and finished with a positive point differential.'},
{name:'Vinyl',record:'5-9',w:5,l:9,pct:.357,pf:952,pa:982,diff:-30,streak:'L1',ppg:68.0,status:'Semifinalist',note:'Vinyl grabbed the final playoff seed, upset Laces in the opening round and made the semifinals despite a losing regular-season record.'},
{name:'Lunar Owls',record:'4-10',w:4,l:10,pct:.286,pf:968,pa:1059,diff:-91,streak:'W1',ppg:69.1,status:'Eliminated',note:'A difficult second season ended outside the playoffs after the club had been one of the biggest stories of Unrivaled’s inaugural year.'},
{name:'Hive',record:'4-10',w:4,l:10,pct:.286,pf:935,pa:1067,diff:-132,streak:'L2',ppg:66.8,status:'Eliminated',note:'The second 2026 expansion club absorbed the league’s toughest scoring margin while building its first season identity.'}
];
const signings=[
{name:'Olivia Miles',tag:'NEW · APR 12',copy:'First pro contract, debuting in Season 3.'},
{name:'Gabby Williams',tag:'NEW · JUN 18',copy:'WNBA All-Star and two-time Olympic medalist.'},
{name:"Flau’jae Johnson",tag:'NEW · JUN 22',copy:'2026 WNBA No. 8 pick and former Future is Unrivaled NIL athlete.'},
{name:'Bridget Carleton',tag:'NEW · JUN 25',copy:'Two-time Olympian joining for her first Unrivaled season.'},
{name:'Marine Johannès',tag:'NEW · JUN 29',copy:'Two-time Olympic medalist and elite movement shooter.'},
{name:'Kayla Thornton',tag:'NEW · JUL 2',copy:'WNBA champion and All-Star joining on a multi-year deal.'},
{name:'Kayla McBride',tag:'RETURN · JUL 7',copy:'All-Unrivaled First Team guard returns for Season 3.'},
{name:'Jessica Shepard',tag:'NEW · JUL 8',copy:'2026 WNBA All-Star starter joining on a multi-year deal.'}
];
const playerLeaders=[
{label:'SCORING',name:'Marina Mabrey',team:'Lunar Owls',value:'25.3 PPG'},
{label:'ASSISTS',name:'Chelsea Gray',team:'Rose',value:'6.1 APG'},
{label:'REBOUNDS',name:'Aaliyah Edwards',team:'Lunar Owls',value:'12.4 RPG'},
{label:'STEALS',name:'Veronica Burton',team:'Mist',value:'2.1 SPG'},
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
function esc(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function renderSignings(){const el=document.getElementById('unrivaledSignings');if(!el)return;el.innerHTML=signings.map(s=>`<article class="unrivaled-signing-card"><span>${esc(s.tag)}</span><strong>${esc(s.name)}</strong><p>${esc(s.copy)}</p></article>`).join('')}
function renderStandings(){const el=document.getElementById('unrivaledStandings');if(!el)return;el.innerHTML=`<table class="unrivaled-table"><thead><tr><th>Club</th><th>W</th><th>L</th><th>PCT</th><th>PF</th><th>PA</th><th>DIFF</th><th>STRK</th></tr></thead><tbody>${unrivaledTeams.map((t,i)=>`<tr><td class="team-cell"><span class="seed-mark ${i>5?'out':''}">${i+1}</span><strong>${esc(t.name)}</strong><small>${esc(t.status)}</small></td><td>${t.w}</td><td>${t.l}</td><td>${t.pct.toFixed(3).replace('0.','.')}</td><td>${t.pf}</td><td>${t.pa}</td><td>${t.diff>0?'+':''}${t.diff}</td><td>${esc(t.streak)}</td></tr>`).join('')}</tbody></table>`}
function renderClubTabs(){const tabs=document.getElementById('unrivaledClubTabs');if(!tabs)return;tabs.innerHTML=unrivaledTeams.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===0}" class="${i===0?'active':''}" data-team="${i}">${esc(t.name)}</button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>selectClub(Number(btn.dataset.team))))}
function selectClub(index){const t=unrivaledTeams[index]||unrivaledTeams[0];document.querySelectorAll('#unrivaledClubTabs button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index))});const panel=document.getElementById('unrivaledClubPanel');if(!panel)return;panel.innerHTML=`<div class="unrivaled-club-room"><div><p class="kicker">${esc(t.status)}</p><h3>${esc(t.name)} BC</h3><p>${esc(t.note)}</p><a href="https://www.unrivaled.basketball/${encodeURIComponent(t.name.toLowerCase().replace('lunar owls','lunar-owls').replace(/\s+/g,'-'))}" target="_blank" rel="noopener noreferrer" style="font-weight:900">Official club page ↗</a></div><div class="unrivaled-club-metrics"><article><span>Record</span><strong>${esc(t.record)}</strong></article><article><span>Win %</span><strong>${t.pct.toFixed(3).replace('0.','.')}</strong></article><article><span>PPG</span><strong>${t.ppg.toFixed(1)}</strong></article><article><span>Point Diff</span><strong>${t.diff>0?'+':''}${t.diff}</strong></article><article><span>Points For</span><strong>${t.pf}</strong></article><article><span>Points Against</span><strong>${t.pa}</strong></article></div></div>`}
function renderLeaders(target,items){const el=document.getElementById(target);if(!el)return;el.innerHTML=items.map((x,i)=>`<div class="unrivaled-leader-row"><span>${i+1}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.label)} · ${esc(x.team)}</small></div><b>${esc(x.value)}</b></div>`).join('')}
renderSignings();renderStandings();renderClubTabs();selectClub(0);renderLeaders('unrivaledPlayerLeaders',playerLeaders);renderLeaders('unrivaledTeamLeaders',teamLeaders);