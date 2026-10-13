/* Coach dashboard records compiled through Oct. 12, 2026. Standings, playoff stage, head-coach Finals history and point notes are checked against linked WNBA and Basketball-Reference sources. */
var COURTSIDE_TEAMS = [{"name":"Atlanta Dream","slug":"atlanta-dream","primary":"#E31837","secondary":"#418FDE","href":"/team.html?team=atlanta-dream"},{"name":"Chicago Sky","slug":"chicago-sky","primary":"#5098CD","secondary":"#FDBB30","href":"/team.html?team=chicago-sky"},{"name":"Connecticut Sun","slug":"connecticut-sun","primary":"#F05A28","secondary":"#0F1736","href":"/team.html?team=connecticut-sun"},{"name":"Dallas Wings","slug":"dallas-wings","primary":"#C8102E","secondary":"#0065A8","href":"/team.html?team=dallas-wings"},{"name":"Golden State Valkyries","slug":"golden-state-valkyries","primary":"#6F39B7","secondary":"#E3FE3A","href":"/team.html?team=golden-state-valkyries"},{"name":"Indiana Fever","slug":"indiana-fever","primary":"#E03A3E","secondary":"#FEED00","href":"/team.html?team=indiana-fever"},{"name":"Las Vegas Aces","slug":"las-vegas-aces","primary":"#111111","secondary":"#D0B45C","href":"/team.html?team=las-vegas-aces"},{"name":"Los Angeles Sparks","slug":"los-angeles-sparks","primary":"#552583","secondary":"#FDB927","href":"/team.html?team=los-angeles-sparks"},{"name":"Minnesota Lynx","slug":"minnesota-lynx","primary":"#236192","secondary":"#78BE20","href":"/team.html?team=minnesota-lynx"},{"name":"New York Liberty","slug":"new-york-liberty","primary":"#00685E","secondary":"#6ECEB2","href":"/team.html?team=new-york-liberty"},{"name":"Phoenix Mercury","slug":"phoenix-mercury","primary":"#CB6015","secondary":"#201747","href":"/team.html?team=phoenix-mercury"},{"name":"Portland Fire","slug":"portland-fire","primary":"#C8102E","secondary":"#111111","href":"/team.html?team=portland-fire"},{"name":"Seattle Storm","slug":"seattle-storm","primary":"#2C5234","secondary":"#FFC72C","href":"/team.html?team=seattle-storm"},{"name":"Toronto Tempo","slug":"toronto-tempo","primary":"#B7192D","secondary":"#103C5B","href":"/team.html?team=toronto-tempo"},{"name":"Washington Mystics","slug":"washington-mystics","primary":"#0C2340","secondary":"#C8102E","href":"/team.html?team=washington-mystics"}];
var COURT_TO_CLIPBOARD = [{"name":"Becky Hammon","role":"Las Vegas Aces · WNBA player to head coach","path":"Before coaching, Hammon built a 16-season WNBA playing career."},{"name":"Stephanie White","role":"Indiana Fever · WNBA player to head coach","path":"White moved from a WNBA playing career into head coaching."},{"name":"Sandy Brondello","role":"Toronto Tempo · WNBA player to head coach","path":"Brondello played in the WNBA before a coaching career that includes two championships."}];
var COURTSIDE_COACHES = [{"name":"Karl Smesko","team":"Atlanta Dream","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Atlanta Dream","isCurrent":true},{"name":"Tyler Marsh","team":"Chicago Sky","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Chicago Sky","isCurrent":true},{"name":"Rachid Meziane","team":"Connecticut Sun","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Connecticut Sun","isCurrent":true},{"name":"Jose Fernandez","team":"Dallas Wings","summary":"First WNBA head-coaching season in 2026.","role":"Head Coach · Dallas Wings","isCurrent":true},{"name":"Natalie Nakase","team":"Golden State Valkyries","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Golden State Valkyries","isCurrent":true},{"name":"Stephanie White","team":"Indiana Fever","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Indiana Fever","isCurrent":true},{"name":"Lynne Roberts","team":"Los Angeles Sparks","summary":"Her completed 2026 season remains in the record table; Los Angeles later reported a vacancy.","role":"Former Head Coach · Los Angeles Sparks","isCurrent":false},{"name":"Becky Hammon","team":"Las Vegas Aces","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Las Vegas Aces","isCurrent":true},{"name":"Cheryl Reeve","team":"Minnesota Lynx","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Minnesota Lynx","isCurrent":true},{"name":"Chris DeMarco","team":"New York Liberty","summary":"First WNBA head-coaching season in 2026.","role":"Head Coach · New York Liberty","isCurrent":true},{"name":"Nate Tibbetts","team":"Phoenix Mercury","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Phoenix Mercury","isCurrent":true},{"name":"Alex Sarama","team":"Portland Fire","summary":"First WNBA head-coaching season in 2026.","role":"Head Coach · Portland Fire","isCurrent":true},{"name":"Sonia Raman","team":"Seattle Storm","summary":"First WNBA head-coaching season in 2026.","role":"Head Coach · Seattle Storm","isCurrent":true},{"name":"Sandy Brondello","team":"Toronto Tempo","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Toronto Tempo","isCurrent":true},{"name":"Sydney Johnson","team":"Washington Mystics","summary":"2026 head coach. Career regular-season and playoff records appear in the dashboard.","role":"Head Coach · Washington Mystics","isCurrent":true}];
var COURTSIDE_COACH_STATS = [
  {
    "name": "Karl Smesko",
    "team": "Atlanta Dream",
    "isCurrent": true,
    "season2026": {
      "wins": 30,
      "losses": 14
    },
    "seasonPlayoffs2026": {
      "wins": 5,
      "losses": 0
    },
    "careerRegular": {
      "wins": 60,
      "losses": 28
    },
    "careerPlayoffs": {
      "wins": 6,
      "losses": 2
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 30,
      "losses": 14
    },
    "team2026": {
      "wins": 30,
      "losses": 14
    },
    "playoffStage2026": "finalist",
    "finalsYears": [
      2026
    ],
    "seasonsToFirstFinal": 2,
    "impactPoints": 2.5,
    "impactNote": "Atlanta won its first playoff series since 2016 and reached the Finals for the first time since 2013.",
    "impactSource": "https://dream.wnba.com/news/dream-heads-to-wnba-finals-after-sweeping-liberty"
  },
  {
    "name": "Tyler Marsh",
    "team": "Chicago Sky",
    "isCurrent": true,
    "season2026": {
      "wins": 16,
      "losses": 28
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 26,
      "losses": 62
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 0
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 10,
      "losses": 34
    },
    "team2026": {
      "wins": 16,
      "losses": 28
    },
    "playoffStage2026": "missed",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 1,
    "impactNote": "Chicago improved from 10–34 to 16–28 in Marsh’s second WNBA season.",
    "impactSource": "https://www.basketball-reference.com/wnba/years/2025_standings.html"
  },
  {
    "name": "Rachid Meziane",
    "team": "Connecticut Sun",
    "isCurrent": true,
    "season2026": {
      "wins": 10,
      "losses": 30
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 21,
      "losses": 63
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 0
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [
      "2026 regular-season line reflects the coach's 40 games; the team finished 11–33."
    ],
    "team2025": {
      "wins": 11,
      "losses": 33
    },
    "team2026": {
      "wins": 11,
      "losses": 33
    },
    "playoffStage2026": "missed",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Jose Fernandez",
    "team": "Dallas Wings",
    "isCurrent": true,
    "season2026": {
      "wins": 27,
      "losses": 17
    },
    "seasonPlayoffs2026": {
      "wins": 1,
      "losses": 2
    },
    "careerRegular": {
      "wins": 27,
      "losses": 17
    },
    "careerPlayoffs": {
      "wins": 1,
      "losses": 2
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 10,
      "losses": 34
    },
    "team2026": {
      "wins": 27,
      "losses": 17
    },
    "playoffStage2026": "quarterfinal",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 2.5,
    "impactNote": "Dallas improved from 10–34 to 27–17 and returned to the playoffs after missing in 2024 and 2025.",
    "impactSource": "https://wings.wnba.com/news/dallas-wings-clinch-2026-playoff-berth"
  },
  {
    "name": "Natalie Nakase",
    "team": "Golden State Valkyries",
    "isCurrent": true,
    "season2026": {
      "wins": 32,
      "losses": 12
    },
    "seasonPlayoffs2026": {
      "wins": 5,
      "losses": 1
    },
    "careerRegular": {
      "wins": 55,
      "losses": 33
    },
    "careerPlayoffs": {
      "wins": 5,
      "losses": 3
    },
    "titles": [],
    "coyYears": [
      2025
    ],
    "distinctions": [],
    "team2025": {
      "wins": 23,
      "losses": 21
    },
    "team2026": {
      "wins": 32,
      "losses": 12
    },
    "playoffStage2026": "finalist",
    "finalsYears": [
      2026
    ],
    "seasonsToFirstFinal": 2,
    "impactPoints": 2.5,
    "impactNote": "Golden State added nine wins after its expansion playoff debut, earned the No. 2 seed and reached its first Finals. Nakase was the 2025 Coach of the Year.",
    "impactSource": "https://valkyries.wnba.com/news/gameday-recap-20260924"
  },
  {
    "name": "Stephanie White",
    "team": "Indiana Fever",
    "isCurrent": true,
    "season2026": {
      "wins": 28,
      "losses": 16
    },
    "seasonPlayoffs2026": {
      "wins": 1,
      "losses": 2
    },
    "careerRegular": {
      "wins": 144,
      "losses": 92
    },
    "careerPlayoffs": {
      "wins": 18,
      "losses": 19
    },
    "titles": [],
    "coyYears": [
      2023
    ],
    "distinctions": [],
    "team2025": {
      "wins": 24,
      "losses": 20
    },
    "team2026": {
      "wins": 28,
      "losses": 16
    },
    "playoffStage2026": "quarterfinal",
    "finalsYears": [
      2015,
      2022
    ],
    "seasonsToFirstFinal": 1,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Lynne Roberts",
    "team": "Los Angeles Sparks",
    "isCurrent": false,
    "season2026": {
      "wins": 16,
      "losses": 28
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 37,
      "losses": 51
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 0
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 21,
      "losses": 23
    },
    "team2026": {
      "wins": 16,
      "losses": 28
    },
    "playoffStage2026": "missed",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Becky Hammon",
    "team": "Las Vegas Aces",
    "isCurrent": true,
    "season2026": {
      "wins": 31,
      "losses": 13
    },
    "seasonPlayoffs2026": {
      "wins": 2,
      "losses": 4
    },
    "careerRegular": {
      "wins": 148,
      "losses": 56
    },
    "careerPlayoffs": {
      "wins": 30,
      "losses": 13
    },
    "titles": [
      2022,
      2023,
      2025
    ],
    "coyYears": [
      2022
    ],
    "distinctions": [],
    "team2025": {
      "wins": 30,
      "losses": 14
    },
    "team2026": {
      "wins": 31,
      "losses": 13
    },
    "playoffStage2026": "semifinal",
    "finalsYears": [
      2022,
      2023,
      2025
    ],
    "seasonsToFirstFinal": 1,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Cheryl Reeve",
    "team": "Minnesota Lynx",
    "isCurrent": true,
    "season2026": {
      "wins": 33,
      "losses": 11
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 2
    },
    "careerRegular": {
      "wins": 397,
      "losses": 201
    },
    "careerPlayoffs": {
      "wins": 52,
      "losses": 35
    },
    "titles": [
      2011,
      2013,
      2015,
      2017
    ],
    "coyYears": [
      2011,
      2016,
      2020,
      2024,
      2026
    ],
    "distinctions": [],
    "team2025": {
      "wins": 34,
      "losses": 10
    },
    "team2026": {
      "wins": 33,
      "losses": 11
    },
    "playoffStage2026": "quarterfinal",
    "finalsYears": [
      2011,
      2012,
      2013,
      2015,
      2016,
      2017,
      2024
    ],
    "seasonsToFirstFinal": 2,
    "impactPoints": 1.5,
    "impactNote": "Reeve set the WNBA career regular-season wins record and won her fifth Coach of the Year award in 2026.",
    "impactSource": "https://www.wnba.com/news/reeve-named-2026-coach-of-the-year"
  },
  {
    "name": "Chris DeMarco",
    "team": "New York Liberty",
    "isCurrent": true,
    "season2026": {
      "wins": 26,
      "losses": 18
    },
    "seasonPlayoffs2026": {
      "wins": 2,
      "losses": 3
    },
    "careerRegular": {
      "wins": 26,
      "losses": 18
    },
    "careerPlayoffs": {
      "wins": 2,
      "losses": 3
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 27,
      "losses": 17
    },
    "team2026": {
      "wins": 26,
      "losses": 18
    },
    "playoffStage2026": "semifinal",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 0.5,
    "impactNote": "In his first WNBA head-coaching season, DeMarco took the defending champion Liberty to the semifinals.",
    "impactSource": "https://www.wnba.com/playoffs/2026"
  },
  {
    "name": "Nate Tibbetts",
    "team": "Phoenix Mercury",
    "isCurrent": true,
    "season2026": {
      "wins": 16,
      "losses": 28
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 62,
      "losses": 66
    },
    "careerPlayoffs": {
      "wins": 5,
      "losses": 8
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 27,
      "losses": 17
    },
    "team2026": {
      "wins": 16,
      "losses": 28
    },
    "playoffStage2026": "missed",
    "finalsYears": [
      2025
    ],
    "seasonsToFirstFinal": 2,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Alex Sarama",
    "team": "Portland Fire",
    "isCurrent": true,
    "season2026": {
      "wins": 17,
      "losses": 27
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 17,
      "losses": 27
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 0
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": null,
    "team2026": {
      "wins": 17,
      "losses": 27
    },
    "playoffStage2026": "missed",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Sonia Raman",
    "team": "Seattle Storm",
    "isCurrent": true,
    "season2026": {
      "wins": 8,
      "losses": 36
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 8,
      "losses": 36
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 0
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 23,
      "losses": 21
    },
    "team2026": {
      "wins": 8,
      "losses": 36
    },
    "playoffStage2026": "missed",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Sandy Brondello",
    "team": "Toronto Tempo",
    "isCurrent": true,
    "season2026": {
      "wins": 11,
      "losses": 33
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 0
    },
    "careerRegular": {
      "wins": 282,
      "losses": 214
    },
    "careerPlayoffs": {
      "wins": 40,
      "losses": 32
    },
    "titles": [
      2014,
      2024
    ],
    "coyYears": [
      2014
    ],
    "distinctions": [],
    "team2025": null,
    "team2026": {
      "wins": 11,
      "losses": 33
    },
    "playoffStage2026": "missed",
    "finalsYears": [
      2014,
      2021,
      2023,
      2024
    ],
    "seasonsToFirstFinal": 5,
    "impactPoints": 0,
    "impactNote": "",
    "impactSource": ""
  },
  {
    "name": "Sydney Johnson",
    "team": "Washington Mystics",
    "isCurrent": true,
    "season2026": {
      "wins": 28,
      "losses": 16
    },
    "seasonPlayoffs2026": {
      "wins": 0,
      "losses": 2
    },
    "careerRegular": {
      "wins": 44,
      "losses": 44
    },
    "careerPlayoffs": {
      "wins": 0,
      "losses": 2
    },
    "titles": [],
    "coyYears": [],
    "distinctions": [],
    "team2025": {
      "wins": 16,
      "losses": 28
    },
    "team2026": {
      "wins": 28,
      "losses": 16
    },
    "playoffStage2026": "quarterfinal",
    "finalsYears": [],
    "seasonsToFirstFinal": null,
    "impactPoints": 2.5,
    "impactNote": "Washington improved from 16–28 to 28–16 and returned to the playoffs after missing in both 2024 and 2025.",
    "impactSource": "https://www.basketball-reference.com/wnba/years/2025_standings.html"
  }
];
