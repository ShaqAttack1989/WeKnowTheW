window.TROPHY_DATA = (() => {
  const headshot = id => `https://cdn.wnba.com/headshots/wnba/latest/1040x760/${id}.png`;

  const champions = [
    ['2025','Las Vegas Aces','Phoenix Mercury','3 to 1',"A'ja Wilson"],
    ['2024','New York Liberty','Minnesota Lynx','3 to 2','Jonquel Jones'],
    ['2023','Las Vegas Aces','New York Liberty','3 to 1',"A'ja Wilson"],
    ['2022','Las Vegas Aces','Connecticut Sun','3 to 1','Chelsea Gray'],
    ['2021','Chicago Sky','Phoenix Mercury','3 to 1','Kahleah Copper'],
    ['2020','Seattle Storm','Las Vegas Aces','3 to 0','Breanna Stewart'],
    ['2019','Washington Mystics','Connecticut Sun','3 to 2','Emma Meesseman'],
    ['2018','Seattle Storm','Washington Mystics','3 to 0','Breanna Stewart'],
    ['2017','Minnesota Lynx','Los Angeles Sparks','3 to 2','Sylvia Fowles'],
    ['2016','Los Angeles Sparks','Minnesota Lynx','3 to 2','Candace Parker'],
    ['2015','Minnesota Lynx','Indiana Fever','3 to 2','Sylvia Fowles'],
    ['2014','Phoenix Mercury','Chicago Sky','3 to 0','Diana Taurasi'],
    ['2013','Minnesota Lynx','Atlanta Dream','3 to 0','Maya Moore'],
    ['2012','Indiana Fever','Minnesota Lynx','3 to 1','Tamika Catchings'],
    ['2011','Minnesota Lynx','Atlanta Dream','3 to 0','Seimone Augustus'],
    ['2010','Seattle Storm','Atlanta Dream','3 to 0','Lauren Jackson'],
    ['2009','Phoenix Mercury','Indiana Fever','3 to 2','Diana Taurasi'],
    ['2008','Detroit Shock','San Antonio Silver Stars','3 to 0','Katie Smith'],
    ['2007','Phoenix Mercury','Detroit Shock','3 to 2','Cappie Pondexter'],
    ['2006','Detroit Shock','Sacramento Monarchs','3 to 2','Deanna Nolan'],
    ['2005','Sacramento Monarchs','Connecticut Sun','3 to 1','Yolanda Griffith'],
    ['2004','Seattle Storm','Connecticut Sun','2 to 1','Betty Lennox'],
    ['2003','Detroit Shock','Los Angeles Sparks','2 to 1','Ruth Riley'],
    ['2002','Los Angeles Sparks','New York Liberty','2 to 0','Lisa Leslie'],
    ['2001','Los Angeles Sparks','Charlotte Sting','2 to 0','Lisa Leslie'],
    ['2000','Houston Comets','New York Liberty','2 to 0','Cynthia Cooper'],
    ['1999','Houston Comets','New York Liberty','2 to 1','Cynthia Cooper'],
    ['1998','Houston Comets','Phoenix Mercury','2 to 1','Cynthia Cooper'],
    ['1997','Houston Comets','New York Liberty','1 game','Cynthia Cooper']
  ].map(([year,champion,runnerUp,result,finalsMvp]) => ({year,champion,runnerUp,result,finalsMvp}));

  const finalsMvpPhotos = {
    "A'ja Wilson": headshot('1628932'),
    'Jonquel Jones': headshot('1627673'),
    'Chelsea Gray': headshot('203833'),
    'Kahleah Copper': headshot('1627674'),
    'Breanna Stewart': headshot('1627668'),
    'Emma Meesseman': headshot('1628242'),
    'Sylvia Fowles': headshot('201480'),
    'Candace Parker': headshot('201496'),
    'Diana Taurasi': headshot('100940'),
    'Maya Moore': headshot('202632'),
    'Tamika Catchings': headshot('100646'),
    'Seimone Augustus': headshot('200671'),
    'Lauren Jackson': headshot('100682'),
    'Katie Smith': headshot('100404'),
    'Cappie Pondexter': headshot('200665'),
    'Deanna Nolan': headshot('100639'),
    'Yolanda Griffith': headshot('100419'),
    'Betty Lennox': headshot('100484'),
    'Ruth Riley': headshot('100656'),
    'Lisa Leslie': headshot('100003'),
    'Cynthia Cooper': headshot('100073')
  };

  const dynasties = [
    {team:'Houston Comets',years:'1997 to 2000',titles:'4 straight',note:'The league began with a dynasty. Cynthia Cooper won every Finals MVP while Sheryl Swoopes and Tina Thompson completed the original superteam.',tone:'#c52233'},
    {team:'Los Angeles Sparks',years:'2001 to 2002',titles:'Back to back',note:'Lisa Leslie, Mwadi Mabika and DeLisha Milton Jones immediately followed Houston with the league’s next repeat champion.',tone:'#5b2a86'},
    {team:'Detroit Shock',years:'2003 to 2008',titles:'3 in 6 seasons',note:'Detroit’s physical, deep teams won in 2003, 2006 and 2008. Those titles remain part of the franchise line that now plays as the Dallas Wings.',tone:'#d22d3f'},
    {team:'Minnesota Lynx',years:'2011 to 2017',titles:'4 in 7 seasons',note:'Seimone Augustus, Maya Moore, Lindsay Whalen, Rebekkah Brunson and Sylvia Fowles built one of basketball’s defining title cores.',tone:'#1c5b8e'},
    {team:'Seattle Storm',years:'2004 to 2020',titles:'4 titles, 4 wins',note:'Seattle won four Finals across multiple roster chapters and never lost a championship series.',tone:'#1e704d'},
    {team:'Las Vegas Aces',years:'2022 to 2025',titles:'3 in 4 seasons',note:'Las Vegas won in 2022, repeated in 2023 and returned to the top in 2025 behind the era defining brilliance of A’ja Wilson.',tone:'#b12135'}
  ];

  const franchiseCounts = [
    {name:'Houston Comets',count:4,years:'1997, 1998, 1999, 2000',status:'Historic franchise'},
    {name:'Minnesota Lynx',count:4,years:'2011, 2013, 2015, 2017',status:'Current franchise'},
    {name:'Seattle Storm',count:4,years:'2004, 2010, 2018, 2020',status:'Current franchise'},
    {name:'Dallas Wings lineage',count:3,years:'2003, 2006, 2008 as Detroit',status:'Detroit to Tulsa to Dallas'},
    {name:'Las Vegas Aces lineage',count:3,years:'2022, 2023, 2025',status:'Utah to San Antonio to Las Vegas'},
    {name:'Los Angeles Sparks',count:3,years:'2001, 2002, 2016',status:'Current franchise'},
    {name:'Phoenix Mercury',count:3,years:'2007, 2009, 2014',status:'Current franchise'},
    {name:'Chicago Sky',count:1,years:'2021',status:'Current franchise'},
    {name:'Indiana Fever',count:1,years:'2012',status:'Current franchise'},
    {name:'New York Liberty',count:1,years:'2024',status:'Current franchise'},
    {name:'Sacramento Monarchs',count:1,years:'2005',status:'Historic franchise'},
    {name:'Washington Mystics',count:1,years:'2019',status:'Current franchise'}
  ];

  const recent = {
    mvp:[['2026',"A'ja Wilson",'Las Vegas Aces'],['2025',"A'ja Wilson",'Las Vegas Aces'],['2024',"A'ja Wilson",'Las Vegas Aces'],['2023','Breanna Stewart','New York Liberty'],['2022',"A'ja Wilson",'Las Vegas Aces'],['2021','Jonquel Jones','Connecticut Sun'],['2020',"A'ja Wilson",'Las Vegas Aces'],['2019','Elena Delle Donne','Washington Mystics'],['2018','Breanna Stewart','Seattle Storm'],['2017','Sylvia Fowles','Minnesota Lynx'],['2016','Nneka Ogwumike','Los Angeles Sparks']],
    dpoy:[['2026','Angel Reese','Atlanta Dream'],['2025',"A'ja Wilson and Alanna Smith",'Las Vegas Aces and Minnesota Lynx'],['2024','Napheesa Collier','Minnesota Lynx'],['2023',"A'ja Wilson",'Las Vegas Aces'],['2022',"A'ja Wilson",'Las Vegas Aces'],['2021','Sylvia Fowles','Minnesota Lynx'],['2020','Candace Parker','Los Angeles Sparks'],['2019','Natasha Howard','Seattle Storm'],['2018','Alana Beard','Los Angeles Sparks'],['2017','Alana Beard','Los Angeles Sparks']],
    mip:[['2026','Jessica Shepard','Dallas Wings'],['2025','Veronica Burton','Golden State Valkyries'],['2024','DiJonai Carrington','Connecticut Sun'],['2023','Satou Sabally','Dallas Wings'],['2022','Jackie Young','Las Vegas Aces'],['2021','Brionna Jones','Connecticut Sun'],['2020','Betnijah Laney','Atlanta Dream'],['2019','Leilani Mitchell','Phoenix Mercury'],['2018','Natasha Howard','Seattle Storm'],['2017','Jonquel Jones','Connecticut Sun']],
    sixth:[['2026','Janelle Salaün','Golden State Valkyries'],['2025','Naz Hillmon','Atlanta Dream'],['2024','Tiffany Hayes','Las Vegas Aces'],['2023','Alysha Clark','Las Vegas Aces'],['2022','Brionna Jones','Connecticut Sun'],['2021','Kelsey Plum','Las Vegas Aces'],['2020','Dearica Hamby','Las Vegas Aces'],['2019','Dearica Hamby','Las Vegas Aces'],['2018','Jonquel Jones','Connecticut Sun'],['2017','Sugar Rodgers','New York Liberty']],
    roy:[['2026','Olivia Miles','Minnesota Lynx'],['2025','Paige Bueckers','Dallas Wings'],['2024','Caitlin Clark','Indiana Fever'],['2023','Aliyah Boston','Indiana Fever'],['2022','Rhyne Howard','Atlanta Dream'],['2021','Michaela Onyenwere','New York Liberty'],['2020','Crystal Dangerfield','Minnesota Lynx'],['2019','Napheesa Collier','Minnesota Lynx'],['2018',"A'ja Wilson",'Las Vegas Aces'],['2017','Allisha Gray','Dallas Wings']],
    coy:[['2026','Cheryl Reeve','Minnesota Lynx'],['2025','Natalie Nakase','Golden State Valkyries'],['2024','Cheryl Reeve','Minnesota Lynx'],['2023','Stephanie White','Connecticut Sun'],['2022','Becky Hammon','Las Vegas Aces'],['2021','Curt Miller','Connecticut Sun'],['2020','Cheryl Reeve','Minnesota Lynx'],['2019','James Wade','Chicago Sky'],['2018','Nicki Collen','Atlanta Dream'],['2017','Curt Miller','Connecticut Sun']]
  };

  const awardPages = {
    mvp:{
      slug:'award-mvp.html',eyebrow:'MOST VALUABLE PLAYER',title:'The center of the season',short:'MVP',
      description:'The regular season award for the player whose performance, impact and value defined the league year.',
      current:{year:'2026',name:"A'ja Wilson",team:'Las Vegas Aces',photo:headshot('1628932'),stat:'Record fifth MVP',note:'Wilson is the first five-time MVP and the first player to win three consecutive awards (2024–26).'},
      history:recent.mvp,records:[['5',"A'ja Wilson",'Most MVP awards in WNBA history'],['3','Sheryl Swoopes, Lisa Leslie and Lauren Jackson','Next-highest career totals'],['3 straight',"A'ja Wilson (2024–26)",'Longest consecutive MVP run']],
      source:'https://www.wnba.com/history-mvp',currentSource:'https://www.wnba.com/news/wilson-named-2026-most-valuable-player'
    },
    dpoy:{
      slug:'award-dpoy.html',eyebrow:'DEFENSIVE PLAYER OF THE YEAR',title:'The players who erase plans',short:'DPOY',
      description:'The award for elite defensive impact, from point of attack pressure to switchability, rebounding and rim protection.',
      current:{year:'2026',name:'Angel Reese',team:'Atlanta Dream',photo:headshot('1642291'),stat:'First Dream winner',note:'Reese led the league with a record 521 rebounds, finished third in steals and became the first Atlanta player to win the award.'},
      history:recent.dpoy,records:[['5','Tamika Catchings','League record'],['4','Sylvia Fowles','Four time winner'],['3',"A'ja Wilson and Sheryl Swoopes",'Three time winners']],
      source:'https://www.wnba.com/history-defensive-player-of-the-year',currentSource:'https://www.wnba.com/webview/news/reese-named-2026-defensive-player-of-the-year'
    },
    mip:{
      slug:'award-mip.html',eyebrow:'MOST IMPROVED PLAYER',title:'The leap becomes the story',short:'MIP',
      description:'The award recognizes the player whose growth creates the biggest season to season change in role, production and impact.',
      current:{year:'2026',name:'Jessica Shepard',team:'Dallas Wings',photo:headshot('1629491'),stat:'6 triple-doubles',note:'Shepard posted career highs of 14.5 points, 11.1 rebounds and 5.3 assists while helping Dallas back to the playoffs.'},
      history:recent.mip,records:[['2000','Award introduced','Tari Phillips won the first'],['2004','Only shared award','Kelly Miller and Wendy Palmer'],['27','Completed award seasons','Through 2026']],
      source:'https://www.wnba.com/history-most-improved-player',currentSource:'https://www.wnba.com/news/shepard-named-2026-most-improved-player'
    },
    sixth:{
      slug:'award-sixth-player.html',eyebrow:'SIXTH PLAYER OF THE YEAR',title:'Starter level impact from the bench',short:'Sixth Player',
      description:'The award celebrates the reserve who changes games through scoring, defense, versatility and lineup stability.',
      current:{year:'2026',name:'Janelle Salaün',team:'Golden State Valkyries',photo:headshot('1642767'),stat:'Unanimous selection',note:'Salaün set reserve records with 509 points and 93 made threes while coming off the bench in all 40 appearances.'},
      history:recent.sixth,records:[['3','DeWanna Bonner','Most wins'],['2','Allie Quigley and Dearica Hamby','Two time winners'],['2007','Award introduced','Plenette Pierson won the first']],
      source:'https://www.wnba.com/history-sixth-woman-of-the-year',currentSource:'https://www.wnba.com/news/janelle-salaun-named-sixth-player-of-the-year'
    },
    roy:{
      slug:'award-roy.html',eyebrow:'ROOKIE OF THE YEAR',title:'The opening chapter lands loudly',short:'ROY',
      description:'The award honors the strongest first season and often introduces the next face of a franchise.',
      current:{year:'2026',name:'Olivia Miles',team:'Minnesota Lynx',photo:headshot('1643426'),stat:'Unanimous selection',note:'Miles set WNBA rookie records with 790 points and 22 games of at least 20 points while directing the No. 1 seed.'},
      history:recent.roy,records:[['790','Olivia Miles','Rookie points record, set in 2026'],['2008','Candace Parker','Only player to win Rookie and MVP in the same season'],['1998','First Rookie award','Tracy Reid']],
      source:'https://www.wnba.com/history-rookie-of-the-year',currentSource:'https://www.wnba.com/news/miles-named-2026-rookie-of-the-year'
    },
    coy:{
      slug:'award-coy.html',eyebrow:'COACH OF THE YEAR',title:'The season behind the clipboard',short:'COY',
      description:'The award recognizes coaching leadership, player development, strategy and team performance across the regular season.',
      current:{year:'2026',name:'Cheryl Reeve',team:'Minnesota Lynx',image:'/assets/team-posters/minnesota-lynx.webp',stat:'Record fifth award',note:'Reeve led Minnesota to a league-best 33–11 record and became the WNBA’s all-time regular-season coaching wins leader.'},
      history:recent.coy,records:[['5','Cheryl Reeve','League record'],['3','Van Chancellor and Mike Thibault','Next-highest career totals'],['397','Cheryl Reeve','Career regular-season wins through 2026']],
      source:'https://www.wnba.com/history-coach-of-the-year',currentSource:'https://www.wnba.com/news/reeve-named-2026-coach-of-the-year'
    },
    cup:{
      slug:'commissioners-cup.html',eyebrow:'COMMISSIONER’S CUP',title:'A trophy inside the season',short:'Commissioner’s Cup',
      description:'The annual in season competition turns designated regular season games into a race for a championship game and community impact prize pool.',
      current:{year:'2026',name:'New York Liberty',team:'93 to 85 over Las Vegas',image:'/assets/team-posters/new-york-liberty.webp',photo:headshot('1627668'),stat:'First two time Cup champion',note:'Breanna Stewart earned her second Cup MVP after 25 points and 11 rebounds.'},
      cupHistory:[['2026','New York Liberty','Las Vegas Aces','93 to 85','Breanna Stewart'],['2025','Indiana Fever','Minnesota Lynx','74 to 59','Natasha Howard'],['2024','Minnesota Lynx','New York Liberty','94 to 89','Napheesa Collier'],['2023','New York Liberty','Las Vegas Aces','82 to 63','Jonquel Jones'],['2022','Las Vegas Aces','Chicago Sky','93 to 83','Chelsea Gray'],['2021','Seattle Storm','Connecticut Sun','79 to 57','Breanna Stewart']],
      records:[['2','New York Liberty','Most Cup titles'],['2','Breanna Stewart','Most Cup MVP awards'],['2021','Competition launched','Seattle won the first']],
      source:'https://www.wnba.com/news/commissioners-cup-history-2026',currentSource:'https://liberty.wnba.com/news/new-york-liberty-win-second-wnba-commissioners-cup-title'
    },
    allWnba:{
      slug:'all-wnba.html',eyebrow:'ALL WNBA TEAMS',title:'The season’s top ten',short:'All WNBA',
      description:'First and Second Team selections recognize the strongest complete regular season performances. Since 2022, voting has been positionless.',
      current:{year:'2025',name:'First and Second Teams',team:'Ten players recognized',photos:[headshot('1628932'),headshot('1629483'),headshot('203826'),headshot('1628277'),headshot('1628909')],stat:'Positionless voting',note:'A’ja Wilson and Napheesa Collier were unanimous First Team selections.'},
      teams:{first:["A'ja Wilson",'Napheesa Collier','Alyssa Thomas','Allisha Gray','Kelsey Mitchell'],second:['Nneka Ogwumike','Jackie Young','Sabrina Ionescu','Aliyah Boston','Paige Bueckers']},
      records:[['13','Diana Taurasi','All WNBA selections'],['12','Tamika Catchings','All WNBA selections'],['2022','Positionless era begins','Five best players per team']],
      source:'https://www.wnba.com/history-all-wnba',currentSource:'https://www.wnba.com/news/2025-all-wnba-teams'
    },
    allDefense:{
      slug:'all-defensive.html',eyebrow:'ALL DEFENSIVE TEAMS',title:'Ten defenders, every kind of disruption',short:'All Defensive',
      description:'First and Second Team honors recognize the guards, wings, forwards and centers who shape the league’s best defensive possessions.',
      current:{year:'2025',name:'First and Second Teams',team:'Ten players recognized',photos:[headshot('1629483'),headshot('1629501'),headshot('203826'),headshot('1628931'),headshot('1628932')],stat:'First Team pictured',note:'The 2025 First Team paired the co DPOY winners with three versatile defensive stars.'},
      teams:{first:['Napheesa Collier','Alanna Smith','Alyssa Thomas','Gabby Williams',"A'ja Wilson"],second:['Aliyah Boston','Veronica Burton','Rhyne Howard','Ezi Magbegor','Breanna Stewart']},
      records:[['12','Tamika Catchings','All Defensive selections'],['11','Sylvia Fowles','All Defensive selections'],['2005','Teams introduced','First and Second Team recognition']],
      source:'https://www.wnba.com/all-defensive-teams',currentSource:'https://valkyries.wnba.com/news/veronica-burton-selected-to-all-defensive-team-202510108'
    },
    allRookie:{
      slug:'all-rookie.html',eyebrow:'ALL ROOKIE TEAM',title:'Five names enter the record book',short:'All Rookie',
      description:'The annual team recognizes five first year players whose opening seasons established immediate league impact.',
      current:{year:'2025',name:'The 2025 class',team:'Five rookies recognized',photos:[headshot('1642784'),headshot('1642785'),headshot('1642792'),headshot('1642767'),headshot('1642798')],stat:'Two international firsts',note:'Janelle Salaün and Dominique Malonga became the first French born players selected.'},
      teams:{first:['Paige Bueckers','Sonia Citron','Kiki Iriafen','Janelle Salaün','Dominique Malonga']},
      records:[['2005','Team introduced','Five player annual team'],['2025','France makes history','Salaün and Malonga selected'],['5','Players each season','No First or Second Team split']],
      source:'https://www.wnba.com/history-all-rookie-teams',currentSource:'https://valkyries.wnba.com/news/janelle-salaun-named-to-wnba-all-rookie-team-20250929'
    }
  };

  const awardIndex = [
    {
      group:'Individual season awards',
      note:'The six core regular-season awards now reflect the completed 2026 voting.',
      items:[
        ['Most Valuable Player','2026 · A’ja Wilson','/award-mvp.html'],
        ['Defensive Player of the Year','2026 · Angel Reese','/award-dpoy.html'],
        ['Rookie of the Year','2026 · Olivia Miles','/award-roy.html'],
        ['Most Improved Player','2026 · Jessica Shepard','/award-mip.html'],
        ['Sixth Player of the Year','2026 · Janelle Salaün','/award-sixth-player.html'],
        ['Coach of the Year','2026 · Cheryl Reeve','/award-coy.html']
      ]
    },
    {
      group:'Selection teams',
      note:'The 2025 teams remain displayed until the WNBA announces the 2026 selections.',
      items:[
        ['All-WNBA Teams','2026 selections pending','/all-wnba.html'],
        ['All-Defensive Teams','2026 selections pending','/all-defensive.html'],
        ['All-Rookie Team','2026 selections pending','/all-rookie.html']
      ]
    },
    {
      group:'Postseason + showcase honors',
      note:'These awards follow separate event calendars rather than the regular-season ballot.',
      items:[
        ['Finals MVP','Awarded after the WNBA Finals','#finals-mvp'],
        ['Commissioner’s Cup MVP','2026 · Breanna Stewart','/commissioners-cup.html'],
        ['All-Star Game MVP','Browse the historical index','https://www.basketball-reference.com/wnba/awards/']
      ]
    },
    {
      group:'League + community honors',
      note:'Latest completed winner stays visible when a 2026 award has not yet been announced.',
      items:[
        ['Executive of the Year','2026 announcement pending','https://www.basketball-reference.com/wnba/awards/'],
        ['Sportsmanship Award','2026 announcement pending','https://www.basketball-reference.com/wnba/awards/'],
        ['Community Assist','Monthly and season honors','https://www.basketball-reference.com/wnba/awards/'],
        ['Dawn Staley Leadership Award','Historical winners','https://www.basketball-reference.com/wnba/awards/'],
        ['Player of the Week + Month','In-season recognition','https://www.basketball-reference.com/wnba/awards/']
      ]
    }
  ];

  return {
    champions,
    finalsMvpPhotos,
    dynasties,
    franchiseCounts,
    awardPages,
    awardIndex,
    awardOrder:['mvp','dpoy','mip','sixth','roy','coy','cup','allWnba','allDefense','allRookie'],
    sources:{champions:'https://www.wnba.com/all-time-wnba-champions',finalsMvp:'https://www.wnba.com/history-wnba-finals-mvp',history:'https://www.wnba.com/history'}
  };
})();
