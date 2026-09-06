const auLeaders=[['Odyssey Sims','6,764'],['Aneesah Morrow','5,344'],['Rebekah Gardner','5,269'],['Tina Charles','4,875'],['Natasha Mack','4,777'],['Kaitlyn Chen','4,593'],['Kierstan Bell','4,534'],['Ariel Atkins','4,410'],['Mercedes Russell','4,245'],['Sarah Ashlee Barker','4,203']];
const auTeams=[
{name:'Gold Rush',captain:'Odyssey Sims',coach:'Chaz Franklin',roster:['Odyssey Sims','Kiah Stokes','Aneesah Morrow','Ariel Atkins','Te-Hina Paopao','Teana Muldrow','Lexie Brown','Asia Taylor','Bree Hall','Air Hearn'],note:'The final-week No. 1 captain drafted the team that finished with two closing wins, including the 97–86 finale over Glow.'},
{name:'Glow',captain:'Rebekah Gardner',coach:'Kia Vaughn',roster:['Rebekah Gardner','Isabelle Harrison','Zia Cooke','Jacy Sheldon','Natasha Mack','Grace Berger','Kiara Leslie','Dorie Harrison','Bria Hartley','Rebecca Harris','McKenzie Forbes'],note:'Gardner captained Glow for the second time in three weeks, carrying a 5–1 captain record into the final draft.'},
{name:'Rhythm',captain:'Tina Charles',coach:'Zak Buncik',roster:['Tina Charles','Alysha Clark','Mercedes Russell','Shey Peddy','Kia Nurse','Alissa Pili','Jaylyn Sherrod','Aerial Powers','JoJo Lacey','Sequoia Holmes'],note:'Charles led the blue team in the final week, which closed the season with a 91–87 win over Eclipse.'},
{name:'Eclipse',captain:'Kierstan Bell',coach:'Edniesha Curry',roster:['Kierstan Bell','Kaitlyn Chen','Sarah Ashlee Barker','NaLyssa Smith','Emma Cannon','Kayana Traylor','Brianna Turner','Aaliyah Nye','Deja Kelly','Alaina Coates'],note:'Bell captained the purple team in Week 4, with several 2026 WNBA players and expansion selections on the roster.'}
];
function auSafe(v=''){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function auSlug(v=''){return String(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function auTeamLogo(v=''){return '/api/league-team-image?league=au&key='+encodeURIComponent(auSlug(v));}
function auGradeLetter(score){if(score>=97)return'A+';if(score>=93)return'A';if(score>=90)return'A-';if(score>=87)return'B+';if(score>=83)return'B';if(score>=80)return'B-';if(score>=77)return'C+';if(score>=73)return'C';return'C-'}
const auLeaderObjects=(()=>{const rows=auLeaders.map((x,i)=>({name:x[0],points:Number(String(x[1]).replace(/,/g,'')),rank:i+1}));const max=Math.max(...rows.map(x=>x.points)),min=Math.min(...rows.map(x=>x.points));return rows.map(row=>{const pointNorm=max===min ? 0.5 : (row.points-min)/(max-min);const rankNorm=(rows.length-row.rank)/(rows.length-1);const score=Math.round(80+19*(pointNorm*.85+rankNorm*.15));return{...row,gradeScore:score,grade:auGradeLetter(score)}})})();
const auGradeByName=new Map(auLeaderObjects.map(row=>[row.name,row]));
const board=document.getElementById('auLeaderboard');if(board)board.innerHTML=auLeaderObjects.map(row=>`<div class="au-leader-row"><span>${row.rank}</span><div><strong>${auSafe(row.name)}</strong><small>2026 final leaderboard · AU-only rating</small></div><b>${row.points.toLocaleString()} pts</b><div class="au-grade"><small>AU GRADE</small><strong>${row.gradeScore}</strong><b>${row.grade}</b></div></div>`).join('');
const tabs=document.getElementById('auTeamTabs');if(tabs){tabs.innerHTML=auTeams.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===0}" class="${i===0?'active':''}" data-au-team="${i}"><span class="au-tab-logo"><img src="${auTeamLogo(t.name)}" alt="" loading="lazy"></span>${auSafe(t.name)}</button>`).join('');tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>showAuTeam(Number(btn.dataset.auTeam))))}
function rosterName(name){const grade=auGradeByName.get(name);return`<span class="au-roster-player"><b>${auSafe(name)}</b>${grade?`<small>AU Grade ${grade.gradeScore} · ${grade.grade}</small>`:''}</span>`}
function showAuTeam(index){const team=auTeams[index]||auTeams[0];document.querySelectorAll('#auTeamTabs button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index))});const panel=document.getElementById('auTeamPanel');if(!panel)return;const captainGrade=auGradeByName.get(team.captain);panel.innerHTML=`<div class="au-team-room"><div><div class="au-team-title"><span class="league-team-logo lg"><img src="${auTeamLogo(team.name)}" alt="${auSafe(team.name)} logo" loading="lazy"></span><div><p class="kicker">2026 WEEK 4</p><h3>${auSafe(team.name)}</h3></div></div><p><strong>Captain:</strong> ${auSafe(team.captain)}${captainGrade?` · AU Grade ${captainGrade.gradeScore} (${captainGrade.grade})`:''}<br><strong>Coach:</strong> ${auSafe(team.coach)}</p><p>${auSafe(team.note)}</p></div><div class="au-roster-grid">${team.roster.map(rosterName).join('')}</div></div>`}
showAuTeam(0);
async function renderAuStatKitchen(){
  const target=document.getElementById('auStatKitchen');if(!target)return;
  try{
    const response=await fetch('/data/au-player-stats-2026.json',{cache:'no-store',headers:{Accept:'application/json'}});
    const data=await response.json();const players=Array.isArray(data.players)?data.players:[];
    const metrics=[['ppg','PPG','Scoring'],['rpg','RPG','Rebounding'],['apg','APG','Playmaking'],['spg','SPG','Steals'],['bpg','BPG','Blocks']];
    target.innerHTML=metrics.map(([key,unit,label])=>{
      const rows=players.filter(p=>Number.isFinite(Number(p[key]))).sort((a,b)=>Number(b[key])-Number(a[key]));
      const first=rows[0];
      return first?'<article class="league-standard-card"><span>'+auSafe(label)+'</span><strong>'+auSafe(first.name)+'</strong><p><b>'+Number(first[key]).toFixed(1)+' '+unit+'</b> · 2026 verified AU stat line</p></article>':'';
    }).join('');
  }catch{target.innerHTML='<article class="league-standard-card"><strong>Stat Kitchen is reconnecting.</strong></article>';}
}
renderAuStatKitchen();
