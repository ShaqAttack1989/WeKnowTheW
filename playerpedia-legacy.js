// Shared career archive used by Playerpedia, Legends Lounge and both site searches.
(function(root,factory){
  const catalog=factory();
  if(typeof module==='object'&&module.exports)module.exports=catalog;
  if(root)root.WPlayerpediaLegacy=catalog;
})(typeof window==='undefined'?null:window,function(){
  'use strict';
  const players=[
  {
    "name": "Sue Bird",
    "retired": "2022",
    "fact": "Four-time WNBA champion, record-setting floor general and one-franchise Seattle icon.",
    "teams": [
      [
        "Seattle Storm",
        "2002–2022"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100720",
    "years": "2002–2022",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100720.png",
    "lastWnbaSeason": 2022
  },
  {
    "name": "Diana Taurasi",
    "retired": "2025",
    "fact": "Three-time champion and the WNBA’s all-time leading scorer, with her entire WNBA career in Phoenix.",
    "teams": [
      [
        "Phoenix Mercury",
        "2004–2024"
      ]
    ],
    "source": "https://www.wnba.com/news/cathy-engelbert-statement-diana-taurasi-retirement",
    "sourceLabel": "WNBA · retirement statement",
    "mediaId": "100940",
    "years": "2004–2024",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100940.png",
    "lastWnbaSeason": 2024
  },
  {
    "name": "Candace Parker",
    "retired": "2024",
    "fact": "Two-time MVP and three-time champion who won titles with three different franchises.",
    "teams": [
      [
        "Los Angeles Sparks",
        "2008–2020"
      ],
      [
        "Chicago Sky",
        "2021–2022"
      ],
      [
        "Las Vegas Aces",
        "2023"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "201496",
    "years": "2008–2023",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/201496.png",
    "lastWnbaSeason": 2023
  },
  {
    "name": "Tamika Catchings",
    "retired": "2016",
    "fact": "MVP, champion and the defining two-way star of the Indiana Fever’s first era.",
    "teams": [
      [
        "Indiana Fever",
        "2002–2016"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100646",
    "years": "2002–2016",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100646.png",
    "lastWnbaSeason": 2016
  },
  {
    "name": "Maya Moore",
    "retired": "2023",
    "fact": "Four-time champion and 2014 MVP whose Minnesota run helped define a dynasty.",
    "teams": [
      [
        "Minnesota Lynx",
        "2011–2018"
      ]
    ],
    "source": "https://www.wnba.com/news/wnba-statement-regarding-maya-moores-retirement",
    "sourceLabel": "WNBA · retirement statement",
    "mediaId": "202632",
    "years": "2011–2018",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/202632.png",
    "lastWnbaSeason": 2018
  },
  {
    "name": "Sylvia Fowles",
    "retired": "2022",
    "fact": "Two-time champion, Finals MVP and one of the most dominant rebounders and rim protectors in league history. Now connected to Court to Clipboard as a Portland Fire assistant coach.",
    "teams": [
      [
        "Chicago Sky",
        "2008–2014"
      ],
      [
        "Minnesota Lynx",
        "2015–2022"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "201480",
    "years": "2008–2022",
    "clipboard": "Portland Fire · Assistant coach",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/201480.png",
    "lastWnbaSeason": 2022
  },
  {
    "name": "Seimone Augustus",
    "retired": "2021",
    "fact": "Four-time champion and smooth-scoring cornerstone of Minnesota’s championship era.",
    "teams": [
      [
        "Minnesota Lynx",
        "2006–2019"
      ],
      [
        "Los Angeles Sparks",
        "2020"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "200671",
    "years": "2006–2020",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/200671.png",
    "lastWnbaSeason": 2020
  },
  {
    "name": "Lindsay Whalen",
    "retired": "2018",
    "fact": "Elite point guard who reached the Finals in Connecticut before winning four championships back home in Minnesota.",
    "teams": [
      [
        "Connecticut Sun",
        "2004–2009"
      ],
      [
        "Minnesota Lynx",
        "2010–2018"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100915",
    "years": "2004–2018",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100915.png",
    "lastWnbaSeason": 2018
  },
  {
    "name": "Becky Hammon",
    "retired": "2014",
    "fact": "Six-time All-Star guard whose No. 25 was retired by San Antonio and later by Las Vegas. Her playing career now cross-references her championship coaching career in Court to Clipboard.",
    "teams": [
      [
        "New York Liberty",
        "1999–2006"
      ],
      [
        "San Antonio Stars",
        "2007–2014"
      ]
    ],
    "source": "https://aces.wnba.com/head-coach-becky-hammon",
    "sourceLabel": "Las Vegas Aces · official bio",
    "mediaId": "100342",
    "years": "1999–2014",
    "clipboard": "Las Vegas Aces · Head coach",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100342.png",
    "lastWnbaSeason": 2014
  },
  {
    "name": "Stephanie White",
    "retired": "2004",
    "fact": "Five-season WNBA guard who became an Indiana Fever leader on the sideline after beginning her playing career with Charlotte.",
    "teams": [
      [
        "Charlotte Sting",
        "1999"
      ],
      [
        "Indiana Fever",
        "2000–2004"
      ]
    ],
    "source": "https://www.wnba.com/news/indiana-fever-hire-stephanie-white-as-head-coach",
    "sourceLabel": "WNBA · coaching bio",
    "mediaId": "",
    "years": "1999–2004",
    "clipboard": "Indiana Fever · Head coach",
    "careerState": "retired",
    "photo": "",
    "lastWnbaSeason": 2004
  },
  {
    "name": "Sandy Brondello",
    "retired": "2003",
    "fact": "WNBA All-Star guard whose playing career with Detroit, Miami and Seattle became the foundation for a championship coaching career.",
    "teams": [
      [
        "Detroit Shock",
        "1998–1999"
      ],
      [
        "Miami Sol",
        "2001–2002"
      ],
      [
        "Seattle Storm",
        "2003"
      ]
    ],
    "source": "https://tempo.wnba.com/news/toronto-tempo-names-sandy-brondello-head-coach",
    "sourceLabel": "Toronto Tempo · coaching bio",
    "mediaId": "",
    "years": "1998–2003",
    "clipboard": "Toronto Tempo · Head coach",
    "careerState": "retired",
    "photo": "",
    "lastWnbaSeason": 2003
  },
  {
    "name": "Natalie Achonwa",
    "retired": "2023",
    "fact": "Nine-season WNBA forward, community leader and Canadian Olympian who moved into coaching and player development.",
    "teams": [
      [
        "Indiana Fever",
        "2015–2020"
      ],
      [
        "Minnesota Lynx",
        "2021–2023"
      ]
    ],
    "source": "https://www.wnba.com/player/203831",
    "sourceLabel": "WNBA · player profile",
    "mediaId": "203831",
    "years": "2015–2023",
    "clipboard": "Seattle Storm · Assistant coach",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/203831.png",
    "lastWnbaSeason": 2023
  },
  {
    "name": "Courtney Paris",
    "retired": "2019",
    "fact": "WNBA champion and two-time league rebounding leader whose professional career stretched across Sacramento, Atlanta, Tulsa/Dallas and Seattle.",
    "teams": [
      [
        "Sacramento Monarchs",
        "2009"
      ],
      [
        "Atlanta Dream",
        "2011"
      ],
      [
        "Tulsa Shock",
        "2012–2015"
      ],
      [
        "Dallas Wings",
        "2016–2017"
      ],
      [
        "Seattle Storm",
        "2018–2019"
      ]
    ],
    "source": "https://www.wnba.com/player/201907/courtney-paris/bio",
    "sourceLabel": "WNBA · player bio",
    "mediaId": "201907",
    "years": "2009–2019",
    "clipboard": "New York Liberty · Assistant coach",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/201907.png",
    "lastWnbaSeason": 2019
  },
  {
    "name": "Ebony Hoffman",
    "retired": "2014",
    "fact": "Eleven-season WNBA forward and 2008 Most Improved Player who later moved into professional coaching.",
    "teams": [
      [
        "Indiana Fever",
        "2004–2010"
      ],
      [
        "Los Angeles Sparks",
        "2011–2013"
      ],
      [
        "Connecticut Sun",
        "2014"
      ]
    ],
    "source": "https://sparks.wnba.com/news/la-sparks-finalize-coaching-staff-for-2026-season",
    "sourceLabel": "Los Angeles Sparks · coaching staff",
    "mediaId": "",
    "years": "2004–2014",
    "clipboard": "Los Angeles Sparks · Assistant coach",
    "careerState": "retired",
    "photo": "",
    "lastWnbaSeason": 2014
  },
  {
    "name": "Sugar Rodgers",
    "retired": "2020",
    "fact": "WNBA champion, All-Star and Sixth Player award winner who moved from the backcourt to the coaching bench.",
    "teams": [
      [
        "Minnesota Lynx",
        "2013"
      ],
      [
        "New York Liberty",
        "2014–2018"
      ],
      [
        "Las Vegas Aces",
        "2019–2020"
      ]
    ],
    "source": "https://www.wnba.com/player/203411/sugar-rodgers/bio",
    "sourceLabel": "WNBA · player bio",
    "mediaId": "203411",
    "years": "2013–2020",
    "clipboard": "Golden State Valkyries · Assistant coach",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/203411.png",
    "lastWnbaSeason": 2020
  },
  {
    "name": "Lisa Leslie",
    "retired": "2009",
    "fact": "Three-time MVP, two-time champion and the first player to dunk in a WNBA game.",
    "teams": [
      [
        "Los Angeles Sparks",
        "1997–2009"
      ]
    ],
    "source": "https://www.wnba.com/news/wnba-pioneers",
    "sourceLabel": "WNBA · Pioneers",
    "mediaId": "100003",
    "years": "1997–2009",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100003.png",
    "lastWnbaSeason": 2009
  },
  {
    "name": "Sheryl Swoopes",
    "retired": "2011",
    "fact": "Three-time MVP and four-time champion who helped establish Houston as the league’s first dynasty.",
    "teams": [
      [
        "Houston Comets",
        "1997–2007"
      ],
      [
        "Seattle Storm",
        "2008"
      ],
      [
        "Tulsa Shock",
        "2011"
      ]
    ],
    "source": "https://www.wnba.com/news/wnba-pioneers",
    "sourceLabel": "WNBA · Pioneers",
    "mediaId": "100072",
    "years": "1997–2011",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100072.png",
    "lastWnbaSeason": 2011
  },
  {
    "name": "Cynthia Cooper",
    "retired": "2003",
    "fact": "The engine of Houston’s four straight championships and the first great Finals closer of the WNBA era.",
    "teams": [
      [
        "Houston Comets",
        "1997–2000, 2003"
      ]
    ],
    "source": "https://www.wnba.com/news/wnba-pioneers",
    "sourceLabel": "WNBA · Pioneers",
    "mediaId": "100073",
    "years": "1997–2003",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100073.png",
    "lastWnbaSeason": 2003,
    "aliases": [
      "Cynthia Cooper-Dyke",
      "Cynthia Cooper Dyke"
    ]
  },
  {
    "name": "Tina Thompson",
    "retired": "2013",
    "fact": "Original No. 1 draft pick, four-time champion and one of the league’s foundational scoring forwards.",
    "teams": [
      [
        "Houston Comets",
        "1997–2008"
      ],
      [
        "Los Angeles Sparks",
        "2009–2011"
      ],
      [
        "Seattle Storm",
        "2012–2013"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100076",
    "years": "1997–2013",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100076.png",
    "lastWnbaSeason": 2013
  },
  {
    "name": "Ticha Penicheiro",
    "retired": "2012",
    "fact": "Championship point guard, gifted passer and longtime Sacramento floor general.",
    "teams": [
      [
        "Sacramento Monarchs",
        "1998–2009"
      ],
      [
        "Los Angeles Sparks",
        "2010–2011"
      ],
      [
        "Chicago Sky",
        "2012"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100234",
    "years": "1998–2012",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100234.png",
    "lastWnbaSeason": 2012
  },
  {
    "name": "Yolanda Griffith",
    "retired": "2009",
    "fact": "MVP, Finals MVP and interior anchor of Sacramento’s 2005 championship team.",
    "teams": [
      [
        "Sacramento Monarchs",
        "1999–2007"
      ],
      [
        "Seattle Storm",
        "2008"
      ],
      [
        "Indiana Fever",
        "2009"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100419",
    "years": "1999–2009",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100419.png",
    "lastWnbaSeason": 2009
  },
  {
    "name": "Katie Smith",
    "retired": "2013",
    "fact": "A relentless scorer and champion whose long career crossed five WNBA franchises.",
    "teams": [
      [
        "Minnesota Lynx",
        "1999–2005"
      ],
      [
        "Detroit Shock",
        "2006–2009"
      ],
      [
        "Washington Mystics",
        "2010"
      ],
      [
        "Seattle Storm",
        "2011–2012"
      ],
      [
        "New York Liberty",
        "2013"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100404",
    "years": "1999–2013",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100404.png",
    "lastWnbaSeason": 2013
  },
  {
    "name": "Elena Delle Donne",
    "retired": "2025",
    "fact": "Two-time MVP and 2019 champion whose shooting touch reshaped expectations for frontcourt scorers.",
    "teams": [
      [
        "Chicago Sky",
        "2013–2016"
      ],
      [
        "Washington Mystics",
        "2017–2023"
      ]
    ],
    "source": "https://mystics.wnba.com/news/wnba-champion-elena-delle-donne-retires",
    "sourceLabel": "Washington Mystics · retirement",
    "mediaId": "203399",
    "years": "2013–2023",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/203399.png",
    "lastWnbaSeason": 2023
  },
  {
    "name": "Tina Charles",
    "retired": "2026",
    "fact": "MVP, Rookie of the Year, all-time rebounding leader and one of the most productive interior scorers in league history.",
    "teams": [
      [
        "Connecticut Sun",
        "2010–2013"
      ],
      [
        "New York Liberty",
        "2014–2019"
      ],
      [
        "Washington Mystics",
        "2021"
      ],
      [
        "Phoenix Mercury",
        "2022"
      ],
      [
        "Seattle Storm",
        "2022"
      ],
      [
        "Atlanta Dream",
        "2024"
      ],
      [
        "Connecticut Sun",
        "2025"
      ]
    ],
    "source": "https://www.wnba.com/news/tina-charles-retirement-statement",
    "sourceLabel": "WNBA · retirement statement",
    "mediaId": "202250",
    "years": "2010–2025",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/202250.png",
    "lastWnbaSeason": 2025
  },
  {
    "name": "Lauren Jackson",
    "retired": "2012",
    "fact": "Three-time MVP, two-time champion and a defining inside-out superstar of the Seattle Storm.",
    "teams": [
      [
        "Seattle Storm",
        "2001–2012"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "100682",
    "years": "2001–2012",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/100682.png",
    "lastWnbaSeason": 2012
  },
  {
    "name": "Cappie Pondexter",
    "retired": "2018",
    "fact": "Two-time champion and Finals MVP who brought elite shot creation to five franchises.",
    "teams": [
      [
        "Phoenix Mercury",
        "2006–2009"
      ],
      [
        "New York Liberty",
        "2010–2014"
      ],
      [
        "Chicago Sky",
        "2015–2017"
      ],
      [
        "Los Angeles Sparks",
        "2018"
      ],
      [
        "Indiana Fever",
        "2018"
      ]
    ],
    "source": "https://www.wnba.com/history",
    "sourceLabel": "WNBA · history",
    "mediaId": "200665",
    "years": "2006–2018",
    "careerState": "retired",
    "photo": "https://cdn.wnba.com/headshots/wnba/latest/1040x760/200665.png",
    "lastWnbaSeason": 2018
  },
  {
    "name": "Rebecca Lobo",
    "retired": "2003",
    "years": "1997–2003",
    "fact": "An original New York Liberty player, 1996 Olympic gold medalist and 2017 Basketball Hall of Fame inductee. Lobo earned All-WNBA Second Team honors in 1997 and was selected to the inaugural WNBA All-Star Game in 1999.",
    "teams": [
      [
        "New York Liberty",
        "1997–2001"
      ],
      [
        "Houston Comets",
        "2002"
      ],
      [
        "Connecticut Sun",
        "2003"
      ]
    ],
    "source": "https://www.hoophall.com/hall-of-famers/rebecca-lobo",
    "sourceLabel": "Basketball Hall of Fame · biography",
    "aliases": [
      "Rebecca Lobo-Rushin",
      "Rebecca Lobo Rushin"
    ],
    "college": "UConn",
    "position": "Center",
    "draft": "Allocated to New York in the inaugural 1997 player assignments.",
    "careerStats": {
      "games": 121,
      "minutes": 19.2,
      "ppg": 6.7,
      "rpg": 4.1,
      "apg": 1,
      "spg": 0.4,
      "bpg": 0.9,
      "topg": 1.6,
      "fgPct": 0.407,
      "fg3Pct": 0.295,
      "ftPct": 0.628,
      "per": 14,
      "tsPct": 0.464,
      "ws40": null
    },
    "statsSource": "https://www.basketball-reference.com/wnba/players/l/lobore01w.html",
    "lastSeasonSnapshot": {
      "games": 25,
      "minutes": 11.9,
      "ppg": 2.4,
      "rpg": 2.1,
      "apg": 0.2,
      "spg": 0.2,
      "bpg": 0.6,
      "topg": 0.6,
      "fgPct": 0.284,
      "fg3Pct": 0.25,
      "ftPct": 0.222,
      "per": 4.4,
      "tsPct": 0.321,
      "ws40": -0.081,
      "name": "Rebecca Lobo",
      "team": "CON",
      "season": 2003,
      "score": 60,
      "letter": "D",
      "minGames": 9,
      "minimumMinutes": 8,
      "provisional": false,
      "source": "Basketball-Reference",
      "sourceUrls": [
        "https://www.basketball-reference.com/wnba/years/2003_per_game.html",
        "https://www.basketball-reference.com/wnba/years/2003_advanced.html"
      ],
      "qualifiedPeerCount": 136,
      "retrievedAt": "2026-08-28"
    },
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Rebecca_Lobo_taken_by_Danny_Karwoski.jpg/960px-Rebecca_Lobo_taken_by_Danny_Karwoski.jpg",
    "photoCredit": "Danny Karwoski",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Rebecca_Lobo_taken_by_Danny_Karwoski.jpg",
    "photoLicense": "CC BY-SA 3.0",
    "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "careerState": "retired",
    "lastWnbaSeason": 2003
  },
  {
    "name": "Chamique Holdsclaw",
    "retired": "",
    "years": "1999–2010",
    "fact": "The 1999 No. 1 draft pick and Rookie of the Year became a six-time WNBA All-Star. Holdsclaw combined forward scoring with elite rebounding across Washington, Los Angeles, Atlanta and San Antonio.",
    "teams": [
      [
        "Washington Mystics",
        "1999–2004"
      ],
      [
        "Los Angeles Sparks",
        "2005–2007"
      ],
      [
        "Atlanta Dream",
        "2009"
      ],
      [
        "San Antonio Silver Stars",
        "2010"
      ]
    ],
    "source": "https://www.basketball-reference.com/wnba/players/h/holdsch01w.html",
    "sourceLabel": "Basketball-Reference · career record",
    "college": "Tennessee",
    "position": "Forward",
    "draft": "1999 · Round 1 · Pick 1 · Washington Mystics",
    "careerStats": {
      "games": 279,
      "minutes": 32.9,
      "ppg": 16.9,
      "rpg": 7.6,
      "apg": 2.5,
      "spg": 1.3,
      "bpg": 0.5,
      "topg": 2.8,
      "fgPct": 0.443,
      "fg3Pct": 0.262,
      "ftPct": 0.794,
      "per": 22,
      "tsPct": 0.505,
      "ws40": null
    },
    "statsSource": "https://www.basketball-reference.com/wnba/players/h/holdsch01w.html",
    "lastSeasonSnapshot": {
      "games": 29,
      "minutes": 29,
      "ppg": 13.6,
      "rpg": 5.3,
      "apg": 2,
      "spg": 1.5,
      "bpg": 0.3,
      "topg": 2.2,
      "fgPct": 0.494,
      "fg3Pct": 0.355,
      "ftPct": 0.806,
      "per": 18.6,
      "tsPct": 0.546,
      "ws40": 0.096,
      "name": "Chamique Holdsclaw",
      "team": "SAS",
      "season": 2010,
      "score": 88,
      "letter": "A-",
      "minGames": 9,
      "minimumMinutes": 8,
      "provisional": false,
      "source": "Basketball-Reference",
      "sourceUrls": [
        "https://www.basketball-reference.com/wnba/years/2010_per_game.html",
        "https://www.basketball-reference.com/wnba/years/2010_advanced.html"
      ],
      "qualifiedPeerCount": 118,
      "retrievedAt": "2026-08-28"
    },
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Chamique_Holdsclaw.jpg/960px-Chamique_Holdsclaw.jpg",
    "photoCredit": "US Department of Labor",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Chamique_Holdsclaw.jpg",
    "photoLicense": "Public domain",
    "photoLicenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "careerState": "retired",
    "lastWnbaSeason": 2010
  },
  {
    "name": "Teresa Weatherspoon",
    "retired": "",
    "years": "1997–2004",
    "fact": "A five-time WNBA All-Star and the league’s first two-time Defensive Player of the Year. The Liberty point guard helped New York reach four Finals and was inducted into the Basketball Hall of Fame in 2019.",
    "teams": [
      [
        "New York Liberty",
        "1997–2003"
      ],
      [
        "Los Angeles Sparks",
        "2004"
      ]
    ],
    "source": "https://www.hoophall.com/hall-of-famers/teresa-weatherspoon",
    "sourceLabel": "Basketball Hall of Fame · biography",
    "aliases": [
      "T-Spoon",
      "T Spoon"
    ],
    "college": "Louisiana Tech",
    "position": "Guard",
    "draft": "Allocated to New York in the inaugural 1997 player assignments.",
    "clipboard": "Former WNBA player and head coach",
    "careerStats": {
      "games": 254,
      "minutes": 28.1,
      "ppg": 5,
      "rpg": 3.1,
      "apg": 5.3,
      "spg": 1.8,
      "bpg": 0.1,
      "topg": 2.4,
      "fgPct": 0.411,
      "fg3Pct": 0.281,
      "ftPct": 0.658,
      "per": 13.8,
      "tsPct": 0.495,
      "ws40": null
    },
    "statsSource": "https://www.basketball-reference.com/wnba/players/w/weathte01w.html",
    "lastSeasonSnapshot": {
      "games": 34,
      "minutes": 8.6,
      "ppg": 0.5,
      "rpg": 0.9,
      "apg": 0.9,
      "spg": 0.4,
      "bpg": 0,
      "topg": 0.8,
      "fgPct": 0.32,
      "fg3Pct": 0.333,
      "ftPct": null,
      "per": 2.9,
      "tsPct": 0.34,
      "ws40": -0.033,
      "name": "Teresa Weatherspoon",
      "team": "LAS",
      "season": 2004,
      "score": 60,
      "letter": "D",
      "minGames": 9,
      "minimumMinutes": 8,
      "provisional": false,
      "source": "Basketball-Reference",
      "sourceUrls": [
        "https://www.basketball-reference.com/wnba/years/2004_per_game.html",
        "https://www.basketball-reference.com/wnba/years/2004_advanced.html"
      ],
      "qualifiedPeerCount": 135,
      "retrievedAt": "2026-08-28"
    },
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Teresa_Weatherspoon_Chicago_Sky_Head_Coach_%28cropped%29.jpg/960px-Teresa_Weatherspoon_Chicago_Sky_Head_Coach_%28cropped%29.jpg",
    "photoCredit": "Jason Grohoske",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Teresa_Weatherspoon_Chicago_Sky_Head_Coach_(cropped).jpg",
    "photoLicense": "CC BY-SA 4.0",
    "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "careerState": "retired",
    "lastWnbaSeason": 2004
  },
  {
    "name": "Swin Cash",
    "retired": "2016",
    "years": "2002–2016",
    "fact": "A three-time WNBA champion and four-time All-Star whose title teams included Detroit and Seattle. Cash brought scoring, rebounding and versatility to five franchises before her 2022 Basketball Hall of Fame induction.",
    "teams": [
      [
        "Detroit Shock",
        "2002–2007"
      ],
      [
        "Seattle Storm",
        "2008–2011"
      ],
      [
        "Chicago Sky",
        "2012–2013"
      ],
      [
        "Atlanta Dream",
        "2014"
      ],
      [
        "New York Liberty",
        "2014–2016"
      ]
    ],
    "source": "https://www.hoophall.com/hall-of-famers/swin-cash",
    "sourceLabel": "Basketball Hall of Fame · biography",
    "college": "UConn",
    "position": "Forward",
    "draft": "2002 · Round 1 · Pick 2 · Detroit Shock",
    "careerStats": {
      "games": 479,
      "minutes": 28.1,
      "ppg": 10.7,
      "rpg": 5.3,
      "apg": 2.4,
      "spg": 0.8,
      "bpg": 0.5,
      "topg": 2.4,
      "fgPct": 0.407,
      "fg3Pct": 0.276,
      "ftPct": 0.757,
      "per": 14.6,
      "tsPct": 0.495,
      "ws40": null
    },
    "statsSource": "https://www.basketball-reference.com/wnba/players/c/cashsw01w.html",
    "lastSeasonSnapshot": {
      "games": 31,
      "minutes": 19.5,
      "ppg": 5.3,
      "rpg": 3.4,
      "apg": 1.4,
      "spg": 0.7,
      "bpg": 0.5,
      "topg": 1.3,
      "fgPct": 0.379,
      "fg3Pct": 0.125,
      "ftPct": 0.683,
      "per": 9.3,
      "tsPct": 0.438,
      "ws40": 0.033,
      "name": "Swin Cash",
      "team": "NYL",
      "season": 2016,
      "score": 68,
      "letter": "C-",
      "minGames": 9,
      "minimumMinutes": 8,
      "provisional": false,
      "source": "Basketball-Reference",
      "sourceUrls": [
        "https://www.basketball-reference.com/wnba/years/2016_per_game.html",
        "https://www.basketball-reference.com/wnba/years/2016_advanced.html"
      ],
      "qualifiedPeerCount": 124,
      "retrievedAt": "2026-08-28"
    },
    "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Swin_Cash_%28cropped%29.jpg/960px-Swin_Cash_%28cropped%29.jpg",
    "photoCredit": "US Embassy London",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Swin_Cash_(cropped).jpg",
    "photoLicense": "Public domain",
    "photoLicenseUrl": "https://commons.wikimedia.org/wiki/Commons:Public_domain",
    "careerState": "retired",
    "lastWnbaSeason": 2016
  },
  {
    "name": "Angel McCoughtry",
    "retired": null,
    "careerState": "legacy",
    "years": "2009–2022",
    "fact": "The 2009 No. 1 pick and Rookie of the Year became a five-time WNBA All-Star and two-time scoring champion. McCoughtry led Atlanta to three Finals, later played for Las Vegas and Minnesota, and last appeared in the WNBA in 2022.",
    "teams": [
      [
        "Atlanta Dream",
        "2009–2016, 2018"
      ],
      [
        "Las Vegas Aces",
        "2020–2021"
      ],
      [
        "Minnesota Lynx",
        "2022"
      ]
    ],
    "source": "https://www.wnba.com/player/201881/angel-mccoughtry/bio",
    "sourceLabel": "WNBA · career biography",
    "statusSource": "https://boardroom.tv/angel-mccoughtry-wnba-film-interview/",
    "college": "Louisville",
    "position": "Forward",
    "draft": "2009 · Round 1 · Pick 1 · Atlanta Dream",
    "careerStats": {
      "games": 311,
      "minutes": 28,
      "ppg": 18.6,
      "rpg": 5,
      "apg": 2.9,
      "spg": 2,
      "bpg": 0.6,
      "topg": 3.1,
      "fgPct": 0.429,
      "fg3Pct": 0.293,
      "ftPct": 0.802,
      "per": 23,
      "tsPct": 0.524,
      "ws40": null
    },
    "statsSource": "https://www.basketball-reference.com/wnba/players/m/mccouan01w.html",
    "lastSeasonSnapshot": {
      "games": 2,
      "minutes": 10,
      "ppg": 6,
      "rpg": 3,
      "apg": 1,
      "spg": 0.5,
      "bpg": 1,
      "topg": 1.5,
      "fgPct": 0.375,
      "fg3Pct": 0,
      "ftPct": 1,
      "per": 20.9,
      "tsPct": 0.564,
      "ws40": 0.135,
      "name": "Angel McCoughtry",
      "team": "MIN",
      "season": 2022,
      "score": 81,
      "letter": "B",
      "minGames": 9,
      "minimumMinutes": 8,
      "provisional": true,
      "source": "Basketball-Reference",
      "sourceUrls": [
        "https://www.basketball-reference.com/wnba/years/2022_per_game.html",
        "https://www.basketball-reference.com/wnba/years/2022_advanced.html"
      ],
      "qualifiedPeerCount": 132,
      "retrievedAt": "2026-08-28"
    },
    "photo": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Angel_McCoughtry_WHTA_interview_2023.png",
    "photoCredit": "HOTSPOTATL",
    "photoSource": "https://commons.wikimedia.org/wiki/File:Angel_McCoughtry_WHTA_interview_2023.png",
    "photoLicense": "CC BY 3.0",
    "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "lastWnbaSeason": 2022
  }
];
  const key=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const find=name=>players.find(player=>[player.name,...(player.aliases||[])].some(alias=>key(alias)===key(name)))||null;
  const matches=(player,query)=>!key(query)||key([player.name,...(player.aliases||[]),player.fact,player.clipboard||'',...player.teams.flat()].join(' ')).includes(key(query));
  const statusLabel=player=>player.careerState==='legacy'?'WNBA career archive':player.retired?'Retired '+player.retired:'Retired · last WNBA season '+player.lastWnbaSeason;
  const profileHref=player=>'/playerpedia.html?view=retired&search='+encodeURIComponent(player.name)+'#playerpedia-directory';
  const searchRecords=()=>players.map(player=>({
    title:player.name,type:'Player · Legends Lounge',href:profileHref(player),
    keywords:[player.name,...(player.aliases||[]),...player.teams.flat(),statusLabel(player),player.clipboard||'','career stats rating'].join(' ')
  }));
  const teamHref=team=>{
    const historical={
      'Charlotte Sting':'/franchise-footprints.html#charlotte','Detroit Shock':'/team.html?team=dallas-wings#franchise-history',
      'Houston Comets':'/franchise-footprints.html#houston','Miami Sol':'https://www.basketball-reference.com/wnba/teams/MIA/',
      'Sacramento Monarchs':'/franchise-footprints.html#sacramento','San Antonio Stars':'/team.html?team=las-vegas-aces#franchise-history',
      'San Antonio Silver Stars':'/team.html?team=las-vegas-aces#franchise-history','Tulsa Shock':'/team.html?team=dallas-wings#franchise-history'
    };
    return historical[team]||'/team.html?team='+team.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  };
  return {players,key,find,matches,statusLabel,profileHref,searchRecords,teamHref};
});
