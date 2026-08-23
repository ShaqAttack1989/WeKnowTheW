const FINAL_BUZZER_UPDATED='Aug 23, 2026';
const finalHeadshot=id=>`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${id}.png`;

const confirmedRetirements=[
  {
    player:'Nneka Ogwumike',
    team:'Los Angeles Sparks',
    season:'2026',
    status:'Confirmed final season',
    note:'Ogwumike announced that she will retire at the end of the 2026 WNBA season, closing a Hall-of-Fame-caliber career that includes the 2016 MVP award, a WNBA championship and years of leadership as WNBPA president.',
    source:'https://www.silverscreenandroll.com/los-angeles-sparks-wnba/125272/nneka-ogwumike-la-sparks-retire-announcement',
    sourceLabel:'Retirement announcement coverage',
    photo:finalHeadshot('203014'),
    slug:'los-angeles-sparks'
  }
];

const retirementWatch=[];

const retiredLegends=[
  {name:'Sue Bird',year:'2022',team:'Seattle Storm',slug:'seattle-storm',photo:finalHeadshot('100659'),fact:'Retired after a 21-year WNBA career spent entirely with Seattle; four-time WNBA champion and the league’s all-time assists leader.',source:'https://sports.yahoo.com/sue-bird-vs-diana-taurasi-191546050.html'},
  {name:'Tamika Catchings',year:'2016',team:'Indiana Fever',slug:'indiana-fever',photo:finalHeadshot('100646'),fact:'Closed her playing career as the defining player in Fever history; Indiana retired No. 24 in 2017.',source:'https://fever.wnba.com/news/player/100646/tamika-catchings'},
  {name:'Maya Moore',year:'2023',team:'Minnesota Lynx',slug:'minnesota-lynx',photo:finalHeadshot('202632'),fact:'Made her retirement official after stepping away from the WNBA following the 2018 season; four-time champion and 2014 MVP.',source:'https://www.wnba.com/news/wnba-statement-regarding-maya-moores-retirement'},
  {name:'Sylvia Fowles',year:'2022',team:'Minnesota Lynx',slug:'minnesota-lynx',photo:finalHeadshot('201480'),fact:'Retired as one of the most dominant centers in league history and a two-time WNBA champion with Minnesota.',source:'https://www.wnba.com/news/2023-wnba-preseason-power-rankings'},
  {name:'Candace Parker',year:'2024',team:'Los Angeles Sparks · Chicago Sky · Las Vegas Aces',slug:'los-angeles-sparks',photo:finalHeadshot('201496'),fact:'Three-time WNBA champion and two-time MVP; later became the second player in league history to have her jersey retired by two WNBA franchises.',source:'https://aces.wnba.com/candace-parker-bio'},
  {name:'Diana Taurasi',year:'2025',team:'Phoenix Mercury',slug:'phoenix-mercury',photo:finalHeadshot('100940'),fact:'Retired after 20 seasons, all with Phoenix, as the WNBA’s all-time leading scorer.',source:'https://www.wnba.com/news/cathy-engelbert-statement-diana-taurasi-retirement'},
  {name:'Elena Delle Donne',year:'2025',team:'Chicago Sky · Washington Mystics',slug:'washington-mystics',photo:finalHeadshot('203399'),fact:'Two-time MVP and 2019 WNBA champion; retired after 11 seasons and moved into an advisory role with Monumental Basketball.',source:'https://mystics.wnba.com/news/wnba-champion-elena-delle-donne-retires'}
];

const retiredNumbers=[
  {team:'Chicago Sky',number:'3',player:'Candace Parker',year:'2025'},
  {team:'Chicago Sky',number:'14',player:'Allie Quigley',year:'2025'},
  {team:'Indiana Fever',number:'24',player:'Tamika Catchings',year:'2017'},
  {team:'Los Angeles Sparks',number:'3',player:'Candace Parker',year:'2025'},
  {team:'Los Angeles Sparks',number:'9',player:'Lisa Leslie',year:'2010'},
  {team:'Los Angeles Sparks',number:'11',player:'Penny Toler',year:'2017'},
  {team:'Minnesota Lynx',number:'13',player:'Lindsay Whalen',year:'2019'},
  {team:'Minnesota Lynx',number:'23',player:'Maya Moore',year:'2024'},
  {team:'Minnesota Lynx',number:'32',player:'Rebekkah Brunson',year:'2022'},
  {team:'Minnesota Lynx',number:'33',player:'Seimone Augustus',year:'2022'},
  {team:'Minnesota Lynx',number:'34',player:'Sylvia Fowles',year:'2023'},
  {team:'Phoenix Mercury',number:'3',player:'Diana Taurasi',year:'2026'},
  {team:'Phoenix Mercury',number:'7',player:'Michele Timms',year:'2002'},
  {team:'Phoenix Mercury',number:'13',player:'Penny Taylor',year:'2017'},
  {team:'Phoenix Mercury',number:'22',player:'Jennifer Gillom',year:'2006'},
  {team:'Phoenix Mercury',number:'32',player:'Bridget Pettis',year:'2006'},
  {team:'Seattle Storm',number:'10',player:'Sue Bird',year:'2023'},
  {team:'Seattle Storm',number:'15',player:'Lauren Jackson',year:'2016'}
];

function esc(v=''){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
const retiredTeamSlugs={'Chicago Sky':'chicago-sky','Indiana Fever':'indiana-fever','Los Angeles Sparks':'los-angeles-sparks','Minnesota Lynx':'minnesota-lynx','Phoenix Mercury':'phoenix-mercury','Seattle Storm':'seattle-storm'};
function finalTeamLink(team,slug){return slug?`<a class="final-team-link" href="/team.html?team=${esc(slug)}">${esc(team)}</a>`:esc(team);}

function renderRetirementWatch(){
  const host=document.getElementById('lastDanceGrid');
  if(!host)return;
  const confirmed=confirmedRetirements.map(item=>`<article class="retirement-card confirmed">${item.photo?`<div class="final-portrait"><img src="${item.photo}" alt="${esc(item.player)}" onerror="this.closest('.final-portrait').remove()"></div>`:''}<span class="retirement-pill">${esc(item.status||'Confirmed final season')}</span><h3>${esc(item.player)}</h3><div class="meta">${finalTeamLink(item.team,item.slug)} · ${esc(item.season)}</div><p>${esc(item.note)}</p><a class="source-link" href="${esc(item.source)}" target="_blank" rel="noopener">${esc(item.sourceLabel||'Source')} →</a></article>`).join('');
  const watches=retirementWatch.map(item=>`<article class="retirement-card watch"><span class="retirement-pill">${esc(item.status)}</span><h3>${esc(item.player)}</h3><div class="meta">${esc(item.team)} · ${esc(item.season)}</div><p>${esc(item.note)}</p><a class="source-link" href="${esc(item.source)}" target="_blank" rel="noopener">${esc(item.sourceLabel)} →</a></article>`).join('');
  host.innerHTML=(confirmed||'')+(watches||'')||'<article class="retirement-card"><h3>No current announcements</h3><p>When an active player announces a final season, she will appear here.</p></article>';
}

function renderLegends(){
  const host=document.getElementById('retiredLegendGrid');
  if(!host)return;
  host.innerHTML=retiredLegends.map(item=>`<article class="legend-card">${item.photo?`<div class="final-portrait"><img src="${item.photo}" alt="${esc(item.name)}" loading="lazy" onerror="this.closest('.final-portrait').remove()"></div>`:''}<div class="meta">Retired ${esc(item.year)}</div><h3>${esc(item.name)}</h3><p><strong>${finalTeamLink(item.team,item.slug)}</strong></p><p>${esc(item.fact)}</p><a class="source-link" href="${esc(item.source)}" target="_blank" rel="noopener">Read source →</a></article>`).join('');
}

function renderRafters(){
  const body=document.getElementById('raftersBody');
  if(!body)return;
  body.innerHTML=retiredNumbers.map(item=>`<tr><td>${finalTeamLink(item.team,retiredTeamSlugs[item.team])}</td><td>#${esc(item.number)}</td><td>${esc(item.player)}</td><td>${esc(item.year)}</td></tr>`).join('');
}

document.getElementById('finalBuzzerUpdated').textContent=FINAL_BUZZER_UPDATED;
renderRetirementWatch();
renderLegends();
renderRafters();
