const DUO_HEADSHOTS={
  'Cynthia Cooper':'100073','Sheryl Swoopes':'100072','Tina Thompson':'100076','Lisa Leslie':'100003',
  'Deanna Nolan':'100639','Swin Cash':'100721','Lauren Jackson':'100682','Sue Bird':'100720',
  'Yolanda Griffith':'100419','Ticha Penicheiro':'100234','Katie Smith':'100404','Diana Taurasi':'100940',
  'Cappie Pondexter':'200665','Seimone Augustus':'200671','Maya Moore':'202632','Tamika Catchings':'100646',
  'Brittney Griner':'203398','Sylvia Fowles':'201480','Candace Parker':'201496','Nneka Ogwumike':'203014',
  'Breanna Stewart':'1627668','Jewell Loyd':'204319','Elena Delle Donne':'203399','Emma Meesseman':'1628242',
  'Kahleah Copper':'1627674',"A'ja Wilson":'1628932','Chelsea Gray':'203833','Jackie Young':'1629498',
  'Jonquel Jones':'1627673','Napheesa Collier':'1629483','Nikki Teasley':'100724','Mwadi Mabika':'100012',
  'Katie Douglas':'100666','Olivia Miles':'1643426'
};

const DUO_PHOTOS={
  'Cynthia Cooper':'https://iv1.lisimg.com/image/19211184/740full-cynthia-cooper--dyke.jpg',
  'Sheryl Swoopes':'https://www.basketball-reference.com/req/202106291/images/headshots/swoopsh01w.jpg',
  'Lauren Jackson':'https://www.basketball-reference.com/req/202106291/images/headshots/jacksla01w.jpg',
  'Lisa Leslie':'https://www.basketball-reference.com/req/202106291/images/headshots/leslili01w.jpg',
  'Nikki Teasley':'https://www.basketball-reference.com/req/202106291/images/headshots/teaslni01w.jpg',
  'Mwadi Mabika':'https://www.basketball-reference.com/req/202106291/images/headshots/mabikmw01w.jpg',
  'Yolanda Griffith':'https://www.basketball-reference.com/req/202106291/images/headshots/griffyo01w.jpg',
  'Ticha Penicheiro':'https://www.movenoticias.com/wp-content/uploads/2016/06/ticha-penicheiro-625x500.jpg',
  'Katie Smith':'https://www.basketball-reference.com/req/202106291/images/headshots/smithka01w.jpg',
  'Deanna Nolan':'https://www.basketball-reference.com/req/202106291/images/headshots/nolande01w.jpg',
  'Tina Thompson':'https://www.basketball-reference.com/req/202106291/images/headshots/thompti01w.jpg',
  'Tamika Catchings':'https://www.basketball-reference.com/req/202106291/images/headshots/catchta01w.jpg',
  'Katie Douglas':'https://www.basketball-reference.com/req/202106291/images/headshots/douglka01w.jpg'
};

const RETIRED_LOUNGE=new Set(['Cynthia Cooper','Sheryl Swoopes','Tina Thompson','Lisa Leslie','Lauren Jackson','Sue Bird','Yolanda Griffith','Ticha Penicheiro','Katie Smith','Diana Taurasi','Cappie Pondexter','Seimone Augustus','Maya Moore','Tamika Catchings','Sylvia Fowles','Candace Parker','Elena Delle Donne']);
const CURRENT_PLAYERPEDIA=new Set(['Brittney Griner','Nneka Ogwumike','Breanna Stewart','Jewell Loyd','Kahleah Copper',"A'ja Wilson",'Chelsea Gray','Jackie Young','Jonquel Jones','Napheesa Collier','Olivia Miles']);
const H=name=>DUO_PHOTOS[name]||`https://cdn.wnba.com/headshots/wnba/latest/1040x760/${DUO_HEADSHOTS[name]}.png`;

const DUOS=[
  {rank:1,year:2000,a:'Cynthia Cooper',b:'Sheryl Swoopes',team:'Houston Comets',href:'/franchise-footprints.html#houston',tone:'#b42039',result:'WNBA champions · 27–5',why:'Swoopes won MVP and Defensive Player of the Year; Cooper won a fourth straight Finals MVP. The original dynasty closed its four-peat with the league’s most decorated one-two finish.'},
  {rank:2,year:2010,a:'Lauren Jackson',b:'Sue Bird',team:'Seattle Storm',href:'/team.html?team=seattle-storm',tone:'#1e704d',result:'WNBA champions · 28–6 · 7–0 playoffs',why:'Jackson swept MVP and Finals MVP while Bird controlled the league’s most complete team. Seattle never lost a playoff game.'},
  {rank:3,year:2016,a:'Candace Parker',b:'Nneka Ogwumike',team:'Los Angeles Sparks',href:'/team.html?team=los-angeles-sparks',tone:'#542687',result:'WNBA champions · 26–8',why:'Ogwumike won MVP, Parker won Finals MVP and the pair ended Minnesota’s title defense by one point in Game 5.'},
  {rank:4,year:2009,a:'Diana Taurasi',b:'Cappie Pondexter',team:'Phoenix Mercury',href:'/team.html?team=phoenix-mercury',tone:'#f57a1f',result:'WNBA champions · 23–11',why:'Taurasi won MVP and Finals MVP while Pondexter remained an elite shot creator. Their five-game Finals survived every kind of pressure possession.'},
  {rank:5,year:2017,a:'Sylvia Fowles',b:'Maya Moore',team:'Minnesota Lynx',href:'/team.html?team=minnesota-lynx',tone:'#236192',result:'WNBA champions · 27–7',why:'Fowles claimed MVP and Finals MVP; Moore supplied the perimeter creation and late-game answers that finished Minnesota’s fourth title run.'},
  {rank:6,year:2018,a:'Breanna Stewart',b:'Sue Bird',team:'Seattle Storm',href:'/team.html?team=seattle-storm',tone:'#2c5234',result:'WNBA champions · 26–8',why:'Stewart won MVP and Finals MVP. Bird’s command turned Seattle’s spacing and versatility into a postseason sweep of the Finals.'},
  {rank:7,year:2022,a:"A'ja Wilson",b:'Chelsea Gray',team:'Las Vegas Aces',href:'/team.html?team=las-vegas-aces',tone:'#c8102e',result:'WNBA champions · 26–10',why:'Wilson won MVP and Defensive Player of the Year; Gray became Finals MVP after one of the great playoff shot-making runs.'},
  {rank:8,year:2002,a:'Lisa Leslie',b:'Nikki Teasley',team:'Los Angeles Sparks',href:'/team.html?team=los-angeles-sparks',tone:'#552583',result:'WNBA champions · 25–7',why:'Leslie repeated as MVP and Finals MVP. Teasley delivered the championship-winning three and the guard play that completed the back-to-back.'},
  {rank:9,year:2013,a:'Maya Moore',b:'Seimone Augustus',team:'Minnesota Lynx',href:'/team.html?team=minnesota-lynx',tone:'#005083',result:'WNBA champions · 26–8 · 7–0 playoffs',why:'Moore won Finals MVP, Augustus remained a three-level scoring problem and Minnesota completed a perfect postseason.'},
  {rank:10,year:2025,a:"A'ja Wilson",b:'Jackie Young',team:'Las Vegas Aces',href:'/team.html?team=las-vegas-aces',tone:'#a6192e',result:'WNBA champions · 4–0 Finals',why:'Wilson completed the MVP, co-DPOY and Finals MVP triple. Wilson and Young combined for 60 points in Game 2, the second-highest duo total in Finals history.'},
  {rank:11,year:2001,a:'Lisa Leslie',b:'Mwadi Mabika',team:'Los Angeles Sparks',href:'/team.html?team=los-angeles-sparks',tone:'#552583',result:'WNBA champions · 28–4',why:'Leslie won MVP and Finals MVP; Mabika’s scoring and spacing helped the Sparks follow Houston with a new West Coast power.'},
  {rank:12,year:2014,a:'Diana Taurasi',b:'Brittney Griner',team:'Phoenix Mercury',href:'/team.html?team=phoenix-mercury',tone:'#f57a1f',result:'WNBA champions · 29–5',why:'Taurasi directed one of the best teams ever and won Finals MVP. Griner won Defensive Player of the Year and changed the geometry at both rims.'},
  {rank:13,year:2020,a:'Breanna Stewart',b:'Jewell Loyd',team:'Seattle Storm',href:'/team.html?team=seattle-storm',tone:'#2c5234',result:'WNBA champions · 6–0 postseason finish',why:'Stewart won Finals MVP and combined with Loyd for a Finals-record 65 points in Game 1. Seattle swept both playoff rounds.'},
  {rank:14,year:1998,a:'Cynthia Cooper',b:'Sheryl Swoopes',team:'Houston Comets',href:'/franchise-footprints.html#houston',tone:'#b42039',result:'WNBA champions · 27–3',why:'Cooper repeated as MVP and Finals MVP while Swoopes supplied elite two-way pressure for a team that lost only three regular-season games.'},
  {rank:15,year:2015,a:'Maya Moore',b:'Sylvia Fowles',team:'Minnesota Lynx',href:'/team.html?team=minnesota-lynx',tone:'#236192',result:'WNBA champions · 22–12',why:'Fowles arrived in midseason and won Finals MVP; Moore’s scoring carried Minnesota long enough for the new interior partnership to become championship ready.'},
  {rank:16,year:2007,a:'Diana Taurasi',b:'Cappie Pondexter',team:'Phoenix Mercury',href:'/team.html?team=phoenix-mercury',tone:'#f57a1f',result:'WNBA champions · 23–11',why:'Pondexter won Finals MVP and Taurasi stretched defenses beyond their limits. Phoenix won a five-game Finals with relentless pace and shot creation.'},
  {rank:17,year:2005,a:'Yolanda Griffith',b:'Ticha Penicheiro',team:'Sacramento Monarchs',href:'/franchise-footprints.html#sacramento',tone:'#65459a',result:'WNBA champions · 25–9',why:'Griffith owned the paint and won Finals MVP; Penicheiro organized the league’s toughest defense-first champion.'},
  {rank:18,year:2008,a:'Katie Smith',b:'Deanna Nolan',team:'Detroit Shock',href:'/team.html?team=dallas-wings',tone:'#c8102e',result:'WNBA champions · 22–12',why:'Smith won Finals MVP, Nolan remained Detroit’s two-way engine and the Shock swept San Antonio for a third title in six seasons.'},
  {rank:19,year:2011,a:'Seimone Augustus',b:'Maya Moore',team:'Minnesota Lynx',href:'/team.html?team=minnesota-lynx',tone:'#236192',result:'WNBA champions · 27–7',why:'Augustus won Finals MVP; Moore won Rookie of the Year. Their first season together immediately became Minnesota’s first championship.'},
  {rank:20,year:2004,a:'Lauren Jackson',b:'Sue Bird',team:'Seattle Storm',href:'/team.html?team=seattle-storm',tone:'#1e704d',result:'WNBA champions · 20–14',why:'Jackson’s inside-out scoring and Bird’s command formed the spine of Seattle’s first title team, even as Betty Lennox seized the Finals spotlight.'},
  {rank:21,year:2019,a:'Elena Delle Donne',b:'Emma Meesseman',team:'Washington Mystics',href:'/team.html?team=washington-mystics',tone:'#002b5c',result:'WNBA champions · 26–8',why:'Delle Donne won MVP after a 50–40–90 season; Meesseman became Finals MVP and gave Washington an impossible second frontcourt creator.'},
  {rank:22,year:2024,a:'Breanna Stewart',b:'Jonquel Jones',team:'New York Liberty',href:'/team.html?team=new-york-liberty',tone:'#6eceb2',result:'WNBA champions · 32–8',why:'Stewart’s two-way reach and Jones’s Finals MVP interior dominance finally delivered the first championship in Liberty history.'},
  {rank:23,year:1997,a:'Cynthia Cooper',b:'Tina Thompson',team:'Houston Comets',href:'/franchise-footprints.html#houston',tone:'#b42039',result:'Inaugural WNBA champions · 18–10',why:'Cooper became the first MVP and Finals MVP. Thompson’s scoring gave the league’s first champion a second star from opening night.'},
  {rank:24,year:2006,a:'Deanna Nolan',b:'Katie Smith',team:'Detroit Shock',href:'/team.html?team=dallas-wings',tone:'#c8102e',result:'WNBA champions · 23–11',why:'Nolan won Finals MVP, Smith added shooting and playoff calm, and Detroit survived a five-game series against defending champion Sacramento.'},
  {rank:25,year:2023,a:"A'ja Wilson",b:'Jackie Young',team:'Las Vegas Aces',href:'/team.html?team=las-vegas-aces',tone:'#a6192e',result:'WNBA champions · 34–6',why:'Wilson won Finals MVP and Young made All-WNBA Second Team. Together they kept the repeat alive through injuries and New York’s loaded frontcourt.'},
  {rank:26,year:2012,a:'Tamika Catchings',b:'Katie Douglas',team:'Indiana Fever',href:'/team.html?team=indiana-fever',tone:'#002d62',result:'WNBA champions · 22–12',why:'Catchings won Finals MVP while Douglas’s regular-season scoring helped earn the playoff position that made Indiana’s first title possible.'},
  {rank:27,year:2021,a:'Candace Parker',b:'Kahleah Copper',team:'Chicago Sky',href:'/team.html?team=chicago-sky',tone:'#41b6e6',result:'WNBA champions · 16–16',why:'Parker supplied vision, rebounding and belief; Copper’s downhill force earned Finals MVP during one of the league’s greatest lower-seed runs.'},
  {rank:28,year:1999,a:'Cynthia Cooper',b:'Sheryl Swoopes',team:'Houston Comets',href:'/franchise-footprints.html#houston',tone:'#b42039',result:'WNBA champions · 26–6',why:'Cooper captured a third Finals MVP, Swoopes pressured every possession and Houston completed the three-peat.'},
  {rank:29,year:2003,a:'Deanna Nolan',b:'Swin Cash',team:'Detroit Shock',href:'/team.html?team=dallas-wings',tone:'#c8102e',result:'WNBA champions · 25–9',why:'Nolan’s perimeter defense and Cash’s all-around production powered the worst-to-first transformation that delivered Detroit’s first title.'},
  {rank:30,year:2026,a:'Napheesa Collier',b:'Olivia Miles',team:'Minnesota Lynx',href:'/team.html?team=minnesota-lynx',tone:'#236192',result:'Provisional · league-leading season in progress',why:'Collier’s MVP-level two-way play and Miles’s rookie command have Minnesota setting the pace. The postseason will decide how far this pairing climbs.'}
];

const HONORABLE=[
  {year:2022,pairs:['Alyssa Thomas + Jonquel Jones · Connecticut Sun','Kelsey Plum + Jackie Young · Las Vegas Aces']},
  {year:2023,pairs:['Breanna Stewart + Sabrina Ionescu · New York Liberty','Alyssa Thomas + DeWanna Bonner · Connecticut Sun']},
  {year:2024,pairs:['Napheesa Collier + Courtney Williams · Minnesota Lynx','Caitlin Clark + Aliyah Boston · Indiana Fever']},
  {year:2025,pairs:['Alyssa Thomas + Satou Sabally · Phoenix Mercury','Caitlin Clark + Kelsey Mitchell · Indiana Fever']},
  {year:2026,pairs:['Kelsey Mitchell + Caitlin Clark · Indiana Fever',"A'ja Wilson + Chelsea Gray · Las Vegas Aces",'Allisha Gray + Angel Reese · Atlanta Dream']}
];

const duoSafe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
const duoInitials=name=>name.split(/\s+/).map(part=>part[0]).slice(0,2).join('');
const APPEARANCES=DUOS.reduce((counts,item)=>{
  counts[item.a]=(counts[item.a]||0)+1;
  counts[item.b]=(counts[item.b]||0)+1;
  return counts;
},{});
const HONORABLE_BY_YEAR=new Map(HONORABLE.map(item=>[item.year,item.pairs]));
function playerHref(name){
  if(RETIRED_LOUNGE.has(name))return `/retired-players.html?search=${encodeURIComponent(name)}#legend-directory`;
  if(CURRENT_PLAYERPEDIA.has(name))return `/playerpedia.html?search=${encodeURIComponent(name)}#playerpedia-directory`;
  return '';
}
function playerName(name){
  const href=playerHref(name);
  const label=href?`<a href="${href}">${duoSafe(name)}</a>`:`<span>${duoSafe(name)}</span>`;
  const repeat=APPEARANCES[name]>1?`<mark class="duo-repeat-badge" title="Selected in ${APPEARANCES[name]} seasons">${APPEARANCES[name]}×</mark>`:'';
  return `<span class="duo-player-name">${label}${repeat}</span>`;
}
function portrait(name){
  const src=DUO_HEADSHOTS[name]?`<img src="${H(name)}" alt="${duoSafe(name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`:'';
  return `<span class="duo-portrait"><b>${duoSafe(duoInitials(name))}</b>${src}</span>`;
}
function duoCard(item){
  const featured=item.rank<=10?' featured':'';
  const honorable=HONORABLE_BY_YEAR.get(item.year);
  const honorableColumn=honorable?`<aside class="duo-honorable-column"><span>HONORABLE MENTION${honorable.length>1?'S':''}</span>${honorable.map(pair=>`<p>${duoSafe(pair)}</p>`).join('')}</aside>`:'';
  return `<article class="duo-rank-card${featured}${honorable?' has-honorable':''}" style="--duo-tone:${item.tone}">
    <div class="duo-rank-number"><span>RANK</span><strong>${item.rank}</strong><b>${item.year}${item.year===2026?'*':''}</b></div>
    <div class="duo-rank-portraits">${portrait(item.a)}<i>+</i>${portrait(item.b)}</div>
    <div class="duo-rank-copy"><span class="duo-team-label">${duoSafe(item.team)}</span><h3>${playerName(item.a)} <i>+</i> ${playerName(item.b)}</h3><strong>${duoSafe(item.result)}</strong><p>${duoSafe(item.why)}</p><a href="${item.href}">Open the ${duoSafe(item.team)} history →</a></div>
    ${honorableColumn}
  </article>`;
}

const ranking=document.getElementById('duoRanking');
if(ranking)ranking.innerHTML=DUOS.map(duoCard).join('');
