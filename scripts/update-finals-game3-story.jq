def update_post:
  .title = "Dreams to Nightmares: Atlanta Takes Command of the Finals"
  | .dek = "Atlanta’s 97–71 Game 3 surge turned a tied Finals into a 2–1 Dream lead, with Angel Reese setting the tone on both ends."
  | .updated = "2026-10-22"
  | .image = "/assets/photos/angel-reese-finals-game-3-kevin-c-cox-getty-2026.jpg"
  | .imageFallback = "/assets/photos/angel-reese-finals-game-3-kevin-c-cox-getty-2026.jpg"
  | .imageAlt = "Angel Reese reacts during the first quarter of WNBA Finals Game 3 at State Farm Arena on October 21, 2026"
  | .storyImage = "/assets/photos/angel-reese-finals-game-3-kevin-c-cox-getty-2026.jpg"
  | .storyImageFallback = "/assets/photos/angel-reese-finals-game-3-kevin-c-cox-getty-2026.jpg"
  | .storyImageCaption = "Angel Reese reacts during the first quarter · Finals Game 3 · October 21, 2026. Photo: Kevin C. Cox/Getty Images."
  | .storyImageSourceUrl = "https://www.wnba.com/news/live-updates-2026-wnba-finals-game-3"
  | .playoffGameOne = {
      ariaLabel: "Finals Game 3 result",
      eyebrow: "FINALS GAME 3 · FINAL",
      title: "Dreams to nightmares. Atlanta owns the night.",
      dek: "Atlanta beat Golden State 97–71 on October 21, taking a 2–1 Finals lead behind Angel Reese’s 21 points and 12 rebounds.",
      asOf: "UPDATED · OCT. 21, 2026",
      receipts: [
        {value:"97–71",label:"Atlanta wins Game 3",note:"October 21 · State Farm Arena"},
        {value:"2–1",label:"Atlanta leads the Finals",note:"First to four wins"},
        {value:"21 / 12",label:"Angel Reese points / rebounds",note:"Third straight Finals double-double"},
        {value:"OCT 24",label:"Game 4 · 1 p.m. ET",note:"State Farm Arena · NBC / Peacock"}
      ],
      highlights: []
    }
  | .playoffWatch.title = "DREAMS TO NIGHTMARES."
  | .playoffWatch.subtitle = "Dream 97, Valkyries 71 · Finals Game 3 · October 21"
  | .playoffWatch.asOf = "GAME 3 FINAL · OCT. 21"
  | .playoffWatch.summary = [
      {value:"2–1",label:"Atlanta leads the Finals"},
      {value:"97–71",label:"Atlanta wins Game 3"},
      {value:"OCT 24",label:"Game 4 · 1 p.m. ET"},
      {value:"11",label:"Finalists’ top-10 picks"}
    ]
  | .playoffWatch.matchups |= map(
      if .id == "gsv-atl" then
        .series = "2–1"
        | .seriesNote = "ATLANTA LEADS 2–1 · FIRST TO FOUR"
        | .nextGame = "Sat, Oct. 24 · 1 PM ET · State Farm Arena · NBC / Peacock"
        | .hot = "Reese: 21 points, 12 rebounds. Howard: 16 points, five steals. Hillmon: 15 points."
        | .bench = "Golden State’s bench won 38–27, but Atlanta’s starters won the game-opening and closing stretches."
        | .availability = "Both finalists remain alive. Check official reports before Game 4."
        | .beat = "Atlanta shot 49.3 percent, assisted on 26 of 34 makes and scored 22 points off 17 Golden State turnovers."
        | .break = "Golden State made 12 threes but only 12 two-point field goals and was outscored 44–20 in the paint."
        | .must = "Atlanta can take a 3–1 lead at home; Golden State must protect the ball and keep Reese away from early rhythm."
      else . end)
  | .sections = ([
      {
        title: "Game 3: dreams to nightmares in Atlanta",
        paragraphs: [
          "Atlanta beat Golden State 97–71 at State Farm Arena on October 21 and took a 2–1 Finals lead. The Dream led 23–15 after one quarter and 46–40 at halftime, then answered Golden State’s third-quarter push with an 8–0 run over the final 2:11. Atlanta closed with a 26–14 fourth quarter, turning a competitive middle stretch into the largest win of the series.",
          "Angel Reese finished with 21 points, 12 rebounds, three assists and two steals, recording a double-double in each of her first three Finals games. Rhyne Howard added 16 points, five steals and four assists; Naz Hillmon scored 15. The final official box score lists Howard at 16, resolving an early live-blog line that reported 18.",
          "Golden State got 15 points from Gabby Williams, 14 from Tiffany Hayes and 13 apiece from Cecilia Zandalasini and Janelle Salaün. Kiah Stokes blocked four shots. The Valkyries’ bench won 38–27, but Atlanta’s starting group supplied 70 points and controlled the decisive stretches."
        ]
      },
      {
        title: "The possession math behind the 26-point gap",
        paragraphs: [
          "Atlanta shot 34-for-69 from the floor (49.3 percent) and 9-for-22 from three (40.9 percent). Golden State finished 24-for-69 (34.8 percent) and 12-for-30 from three (40.0 percent). The Valkyries matched Atlanta’s perimeter accuracy, but Atlanta made 22 two-point baskets to Golden State’s 12 and won the paint 44–20.",
          "The free-throw margin mattered without carrying the whole result: Atlanta went 20-for-29, Golden State 11-for-17. Ball security created the sharper divide. The Dream committed 10 total turnovers and scored 22 points off Golden State’s 17; the Valkyries scored seven points off Atlanta’s miscues. Atlanta also assisted on 26 of 34 field goals.",
          "Golden State owned the offensive glass 9–6, second-chance scoring 10–4 and bench scoring 38–27. Atlanta still won total rebounds 51–44 because it finished possessions with 31 defensive rebounds and kept converting stops into organized offense. Those counters explain why the visitors’ useful advantages never became scoreboard pressure."
        ]
      },
      {
        title: "What Game 4 asks from both sides",
        paragraphs: [
          "Atlanta’s next adjustment is restraint: keep using Reese as a transition trigger and interior target without letting a 2–1 lead turn into rushed offense. Howard’s five steals and zero turnovers were a two-way hinge; repeating that pressure while keeping the ball moving would force Golden State to defend the full floor again.",
          "Golden State must shorten the distance between its strong three-point shooting and its interior production. Better entry angles, earlier paint touches and safer outlets can reduce the live-ball turnovers that fueled Atlanta. The Valkyries’ 38 bench points are a real resource, but Game 4 also needs more efficient starter creation and stronger defensive finishing.",
          "Reese is averaging 21.7 points and 13.3 rebounds through three Finals games. Atlanta can take a 3–1 lead in Game 4 on October 24 at 1 p.m. ET; Golden State can level the series and reclaim home-court control."
        ]
      }
    ] + (.sections | map(select(
      .title != "Atlanta’s defense turns a close half into a rout"
      and .title != "What Game 4 asks"
      and .title != "Game 3: dreams to nightmares in Atlanta"
      and .title != "The possession math behind the 26-point gap"
      and .title != "What Game 4 asks from both sides"
    ))))
  | .sections |= map(
      if .title == "Who changed the series, and what Game 3 asks" then
        .title = "Who changed Game 2, and what followed"
        | .paragraphs[3] = "The series moved to State Farm Arena, where Atlanta won Game 3 by 26 points and took a 2–1 lead. Game 4 is October 24 at 1 p.m. ET; Game 5 follows at Chase Center on October 26."
      elif .title == "A first title is guaranteed. The winner is not." then
        .paragraphs[0] = "Atlanta leads the best-of-seven Finals 2–1 after Golden State’s 68–64 Game 1 win and Dream victories of 79–65 and 97–71. Golden State is the No. 2 seed; Atlanta is No. 4. Both franchises seek their first WNBA championship."
        | .paragraphs[2] = "Analysis: Atlanta’s combination of Reese’s interior pressure, Canada’s organization and active hands across the lineup now has Golden State solving multiple problems at once. Game 4 rewards the Valkyries if their shooting can travel inside the arc without gifting transition possessions."
      elif .title == "The Finals watch schedule" then
        .paragraphs[1] = "Game 1 final: Golden State 68, Atlanta 64 · Oct. 17. Game 2 final: Atlanta 79, Golden State 65 · Oct. 19. Game 3 final: Atlanta 97, Golden State 71 · Oct. 21."
        | .paragraphs[2] = "Game 4: Sat., Oct. 24, 1 p.m. · NBC / Peacock. Atlanta leads the series 2–1."
      else . end)
  | .sources = ([
      {label:"Official WNBA Finals Game 3 box score · October 21",url:"https://cdn.wnba.com/static/json/liveData/boxscore/boxscore_1042600303.json"},
      {label:"WNBA · Official Finals Game 3 live recap",url:"https://www.wnba.com/news/live-updates-2026-wnba-finals-game-3"},
      {label:"Getty Images · Kevin C. Cox · Finals Game 3 photo",url:"https://www.gettyimages.com/detail/news-photo/angel-reese-of-the-atlanta-dream-reacts-during-the-first-news-photo/2301393462"}
    ] + (.sources | map(select(
      .url != "https://cdn.wnba.com/static/json/liveData/boxscore/boxscore_1042600303.json"
      and .url != "https://www.wnba.com/news/live-updates-2026-wnba-finals-game-3"
      and .url != "https://www.gettyimages.com/detail/news-photo/angel-reese-of-the-atlanta-dream-reacts-during-the-first-news-photo/2301393462"
    )) | map(
      if .label == "Official Golden State Game 3 recap" then .label = "Official Golden State semifinal Game 3 recap"
      elif .label == "Official Atlanta Game 3 recap" then .label = "Official Atlanta semifinal Game 3 recap"
      else . end)))
  ;

.posts |= map(if .slug == "the-playoff-watch-party-2026" then update_post else . end)
