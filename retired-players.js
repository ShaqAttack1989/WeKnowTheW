const retiredLogo = code => `https://a.espncdn.com/i/teamlogos/wnba/500/${code}.png`;

const RETIRED_TEAMS = {
  'Atlanta Dream':{code:'atl',abbr:'ATL'},
  'Chicago Sky':{code:'chi',abbr:'CHI'},
  'Connecticut Sun':{code:'con',abbr:'CON'},
  'Detroit Shock':{code:'det',abbr:'DET'},
  'Houston Comets':{code:'hou',abbr:'HOU'},
  'Indiana Fever':{code:'ind',abbr:'IND'},
  'Las Vegas Aces':{code:'lv',abbr:'LVA'},
  'Los Angeles Sparks':{code:'la',abbr:'LAS'},
  'Minnesota Lynx':{code:'min',abbr:'MIN'},
  'New York Liberty':{code:'ny',abbr:'NYL'},
  'Phoenix Mercury':{code:'phx',abbr:'PHX'},
  'Sacramento Monarchs':{code:'sac',abbr:'SAC'},
  'San Antonio Stars':{code:'sa',abbr:'SAS'},
  'Seattle Storm':{code:'sea',abbr:'SEA'},
  'Tulsa Shock':{code:'tul',abbr:'TUL'},
  'Washington Mystics':{code:'wsh',abbr:'WAS'}
};

const W25='https://www.wnba.com/news/w25-greatest-players-in-wnba-history';
const PIONEERS='https://www.wnba.com/news/wnba-pioneers';
const retiredPlayers = [
  {name:'Sue Bird',retired:'2022',fact:'Four-time WNBA champion, record-setting floor general and one-franchise Seattle icon.',teams:[['Seattle Storm','2002–2022']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Diana Taurasi',retired:'2025',fact:'Three-time champion and the WNBA’s all-time leading scorer, with her entire WNBA career in Phoenix.',teams:[['Phoenix Mercury','2004–2024']],source:'https://www.wnba.com/news/cathy-engelbert-statement-diana-taurasi-retirement',sourceLabel:'WNBA · retirement statement'},
  {name:'Candace Parker',retired:'2024',fact:'Two-time MVP and three-time champion who won titles with three different franchises.',teams:[['Los Angeles Sparks','2008–2020'],['Chicago Sky','2021–2022'],['Las Vegas Aces','2023']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Tamika Catchings',retired:'2016',fact:'MVP, champion and the defining two-way star of the Indiana Fever’s first era.',teams:[['Indiana Fever','2002–2016']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Maya Moore',retired:'2023',fact:'Four-time champion and 2014 MVP whose Minnesota run helped define a dynasty.',teams:[['Minnesota Lynx','2011–2018']],source:'https://www.wnba.com/news/wnba-statement-regarding-maya-moores-retirement',sourceLabel:'WNBA · retirement statement'},
  {name:'Sylvia Fowles',retired:'2022',fact:'Two-time champion, Finals MVP and one of the most dominant rebounders and rim protectors in league history.',teams:[['Chicago Sky','2008–2014'],['Minnesota Lynx','2015–2022']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Seimone Augustus',retired:'2021',fact:'Four-time champion and smooth-scoring cornerstone of Minnesota’s championship era.',teams:[['Minnesota Lynx','2006–2019'],['Los Angeles Sparks','2020']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Lindsay Whalen',retired:'2018',fact:'Elite point guard who reached the Finals in Connecticut before winning four championships back home in Minnesota.',teams:[['Connecticut Sun','2004–2009'],['Minnesota Lynx','2010–2018']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Becky Hammon',retired:'2014',fact:'Six-time All-Star guard whose No. 25 was retired by San Antonio and later by Las Vegas.',teams:[['New York Liberty','1999–2006'],['San Antonio Stars','2007–2014']],source:'https://aces.wnba.com/becky-hammon-bio',sourceLabel:'Las Vegas Aces · official bio'},
  {name:'Lisa Leslie',retired:'2009',fact:'Three-time MVP, two-time champion and the first player to dunk in a WNBA game.',teams:[['Los Angeles Sparks','1997–2009']],source:PIONEERS,sourceLabel:'WNBA · Pioneers'},
  {name:'Sheryl Swoopes',retired:'2011',fact:'Three-time MVP and four-time champion who helped establish Houston as the league’s first dynasty.',teams:[['Houston Comets','1997–2007'],['Seattle Storm','2008'],['Tulsa Shock','2011']],source:PIONEERS,sourceLabel:'WNBA · Pioneers'},
  {name:'Cynthia Cooper',retired:'2003',fact:'The engine of Houston’s four straight championships and the first great Finals closer of the WNBA era.',teams:[['Houston Comets','1997–2000, 2003']],source:PIONEERS,sourceLabel:'WNBA · Pioneers'},
  {name:'Tina Thompson',retired:'2013',fact:'Original No. 1 draft pick, four-time champion and one of the league’s foundational scoring forwards.',teams:[['Houston Comets','1997–2008'],['Los Angeles Sparks','2009–2011'],['Seattle Storm','2012–2013']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Ticha Penicheiro',retired:'2012',fact:'Championship point guard, gifted passer and longtime Sacramento floor general.',teams:[['Sacramento Monarchs','1998–2009'],['Los Angeles Sparks','2010–2011'],['Chicago Sky','2012']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Yolanda Griffith',retired:'2009',fact:'MVP, Finals MVP and interior anchor of Sacramento’s 2005 championship team.',teams:[['Sacramento Monarchs','1999–2007'],['Seattle Storm','2008'],['Indiana Fever','2009']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Katie Smith',retired:'2013',fact:'A relentless scorer and champion whose long career crossed five WNBA franchises.',teams:[['Minnesota Lynx','1999–2005'],['Detroit Shock','2006–2009'],['Washington Mystics','2010'],['Seattle Storm','2011–2012'],['New York Liberty','2013']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Elena Delle Donne',retired:'2025',fact:'Two-time MVP and 2019 champion whose shooting touch reshaped expectations for frontcourt scorers.',teams:[['Chicago Sky','2013–2016'],['Washington Mystics','2017–2023']],source:'https://mystics.wnba.com/news/wnba-champion-elena-delle-donne-retires',sourceLabel:'Washington Mystics · retirement'},
  {name:'Tina Charles',retired:'2026',fact:'MVP, Rookie of the Year, all-time rebounding leader and one of the most productive interior scorers in league history.',teams:[['Connecticut Sun','2010–2013'],['New York Liberty','2014–2019'],['Washington Mystics','2021'],['Phoenix Mercury','2022'],['Seattle Storm','2022'],['Atlanta Dream','2024'],['Connecticut Sun','2025']],source:'https://www.wnba.com/news/tina-charles-retirement-statement',sourceLabel:'WNBA · retirement statement'},
  {name:'Lauren Jackson',retired:'2012',fact:'Three-time MVP, two-time champion and a defining inside-out superstar of the Seattle Storm.',teams:[['Seattle Storm','2001–2012']],source:W25,sourceLabel:'WNBA · W25'},
  {name:'Cappie Pondexter',retired:'2018',fact:'Two-time champion and Finals MVP who brought elite shot creation to five franchises.',teams:[['Phoenix Mercury','2006–2009'],['New York Liberty','2010–2014'],['Chicago Sky','2015–2017'],['Los Angeles Sparks','2018'],['Indiana Fever','2018']],source:W25,sourceLabel:'WNBA · W25'}
];

const escRetired=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
const normRetired=(value='')=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function initials(name){return name.split(/\s+/).map(p=>p[0]).slice(0,2).join('');}
function teamLogo(team){
  const meta=RETIRED_TEAMS[team]||{abbr:team.slice(0,3).toUpperCase()};
  return `<span class="retired-team-logo"><img src="${meta.code?retiredLogo(meta.code):''}" alt="${escRetired(team)} logo" loading="lazy" onerror="this.parentElement.classList.add('logo-failed')"><b>${escRetired(meta.abbr)}</b></span>`;
}
function teamStop([team,years]){return `<div class="retired-team-stop">${teamLogo(team)}<div><strong>${escRetired(team)}</strong><span>${escRetired(years)}</span></div></div>`;}
function card(player){return `<article class="retired-card"><div class="retired-card-top"><span class="retired-monogram">${escRetired(initials(player.name))}</span><div><small>Retired ${escRetired(player.retired)}</small><h3>${escRetired(player.name)}</h3></div></div><div class="retired-card-body"><p>${escRetired(player.fact)}</p><div class="retired-team-path">${player.teams.map(teamStop).join('')}</div><a class="retired-card-source" href="${escRetired(player.source)}" target="_blank" rel="noopener">${escRetired(player.sourceLabel)} →</a></div></article>`;}

const teamNames=[...new Set(retiredPlayers.flatMap(player=>player.teams.map(([team])=>team)))].sort();
const search=document.getElementById('retiredSearch');
const filter=document.getElementById('retiredTeamFilter');
const reset=document.getElementById('retiredReset');
const grid=document.getElementById('retiredPlayerGrid');
const status=document.getElementById('retiredStatus');
if(filter)filter.innerHTML='<option value="">All teams</option>'+teamNames.map(team=>`<option value="${escRetired(team)}">${escRetired(team)}</option>`).join('');

function renderRetired(){
  if(!grid)return;
  const query=normRetired(search?.value||'').trim();
  const team=filter?.value||'';
  const visible=retiredPlayers.filter(player=>{
    const hay=normRetired(`${player.name} ${player.fact} ${player.teams.map(stop=>stop.join(' ')).join(' ')}`);
    return (!query||hay.includes(query))&&(!team||player.teams.some(([name])=>name===team));
  });
  grid.innerHTML=visible.map(card).join('')||'<div class="page-note">No retired-player match yet. Try another name or team.</div>';
  if(status)status.textContent=`Showing ${visible.length} of ${retiredPlayers.length} featured retired players.`;
}

function renderTeamKey(){
  const host=document.getElementById('retiredTeamKey');if(!host)return;
  host.innerHTML=teamNames.map(team=>`<div class="retired-team-key-item">${teamLogo(team)}<span>${escRetired(team)}</span></div>`).join('');
}
search?.addEventListener('input',renderRetired);
filter?.addEventListener('change',renderRetired);
reset?.addEventListener('click',()=>{if(search)search.value='';if(filter)filter.value='';renderRetired();});
document.getElementById('retiredPlayerCount').textContent=String(retiredPlayers.length);
renderRetired();
renderTeamKey();
