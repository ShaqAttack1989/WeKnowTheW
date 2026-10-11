(()=>{
  if(location.pathname!=='/team.html')return;

  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  if(!slug)return;

  const VERSION='20260927-ap-awards-v1';
  const CURATED={
    'seattle-storm':[
      {
        date:'2026-09-20',
        kind:'ROOKIE RECORD',
        player:"Flau'jae Johnson",
        detail:'Scored 29 points at Las Vegas for her sixth 25-point game, the most such games by a rookie in Storm history. She added 6 rebounds, 6 assists, 4 steals and a block.',
        sourceLabel:'Las Vegas Aces',
        sourceUrl:'https://aces.wnba.com/news/game-recap-aces-complete-season-sweep-against-seattle-with-98-77-win',
        priority:9
      },
      {
        date:'2026-09-20',
        kind:'LEGACY IN BRONZE',
        player:'Sue Bird + Lisa Leslie',
        detail:'Lisa Leslie became the second WNBA player honored with a statue by her franchise, joining first member Sue Bird in a two-player league-history club.',
        sourceLabel:'Los Angeles Sparks',
        sourceUrl:'https://sparks.wnba.com/news/sparks-to-honor-lisa-leslie-with-crypto-com-arena-statue',
        priority:8
      },
      {
        date:'2026-08-26',
        kind:'MILESTONE',
        player:"Flau'jae Johnson",
        detail:'Passed 500 WNBA career points with 20 points against Toronto, becoming just the second rookie in Storm history to reach the mark, joining Breanna Stewart.',
        sourceLabel:'Seattle Storm / StatMuse',
        sourceUrl:'https://www.statmuse.com/wnba/player/flau%27jae-johnson-1755'
      }
    ],
    'minnesota-lynx':[
      {
        date:'2026-09-20',
        kind:'ROOKIE SCORING RECORD',
        player:'Olivia Miles',
        detail:'Broke Caitlin Clark\'s WNBA rookie scoring record and finished the Connecticut win with 21 points, moving the record to 790 with two regular-season games remaining.',
        sourceLabel:'Official final box score',
        sourceUrl:'https://www.wnba.com/game/1022600312',
        priority:10
      },
      {
        date:'2026-08-21',
        kind:'MILESTONE',
        player:'Nia Coffey',
        detail:'Crossed 1,500 WNBA career points in Minnesota’s win at Washington. She is at 1,511 career points through Aug. 24.',
        sourceLabel:'Basketball-Reference',
        sourceUrl:'https://www.basketball-reference.com/wnba/players/c/coffeni01w.html'
      }
    ],
    'golden-state-valkyries':[
      {
        date:'2026-08-27',
        kind:'WNBA FIRST',
        player:'Veronica Burton',
        detail:'Across the Aug. 26 and Aug. 27 back to back, Burton totaled 20 assists with zero turnovers, seven against Connecticut and 13 against New York. Golden State’s milestone graphic recognized the two game span as the first of its kind in WNBA history.',
        sourceLabel:'Golden State Valkyries',
        sourceUrl:'https://valkyries.wnba.com/news/player/1631007/veronica-burton',
        priority:5
      },
      {
        date:'2026-08-26',
        kind:'BENCH LEADER',
        player:'Janelle Salaün',
        detail:'Reached 485 points off the bench this season, the league’s top bench-scoring total. Tiffany Hayes is next at 309, with no other player above 300.',
        sourceLabel:'StatMuse',
        sourceUrl:'https://www.statmuse.com/wnba/ask/most-total-points-off-the-bench-2026'
      }
    ],
    'atlanta-dream':[
      {
        date:'2026-09-25',
        kind:'HONOR',
        player:'Angel Reese',
        detail:'Named Eastern Conference Player of the Week for the third consecutive week after averaging 19.3 points, 9.0 rebounds, 3.0 assists, 1.3 steals and 1.5 blocks while Atlanta went 4-0 to close the regular season.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/angel-reese-named-wnba-eastern-conference-player-of-the-week-for-third-consecutive-week',
        priority:5
      },
      {
        date:'2026-09-21',
        kind:'WNBA FIRST',
        player:'Angel Reese',
        detail:'Became the first player in league history with 500 rebounds in one season, then collected 10 more at New York to move her 2026 total to 515 and her career total to 1,338—already above roughly 93% of WNBA careers.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/dream-dominate-in-final-regular-season-home-game',
        priority:10
      },
      {
        date:'2026-09-21',
        kind:'DEFENSIVE RECORD',
        player:'Rhyne Howard',
        detail:'Set the WNBA single-season mark for the most combined steals and blocks by a guard, pairing league-leading theft with uncommon shot blocking from the perimeter.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/atlanta-dream-end-of-season-player-awards',
        priority:9
      },
      {
        date:'2026-08-27',
        kind:'ROSTER',
        player:'DeWanna Bonner',
        detail:'Atlanta signed the two-time WNBA champion and six-time All-Star to a rest-of-season contract for the playoff push.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/atlanta-dream-signs-two-time-wnba-champion-dewanna-bonner',
        supersedes:['DeWanna Bonner']
      },
      {
        date:'2026-08-24',
        kind:'WNBA RECORD',
        player:'Angel Reese',
        detail:'Set the WNBA single-game rebounding record with 26 boards and the single-season record with 458 rebounds in the win over Los Angeles.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip'
      },
      {
        date:'2026-08-24',
        kind:'MILESTONE',
        player:'Rhyne Howard',
        detail:'Scored her 3,000th WNBA career point on a third-quarter 3-pointer against Los Angeles.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip'
      },
      {
        date:'2026-08-24',
        kind:'FRANCHISE RECORD',
        player:'Allisha Gray',
        detail:'Set a new Dream single-season record with her 247th made field goal, breaking the mark she had shared with Angel McCoughtry.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip'
      },
      {
        date:'2026-08-23',
        kind:'PLAYOFFS',
        player:'Atlanta Dream',
        detail:'Clinched a fourth consecutive WNBA playoff berth and continues to battle for postseason seeding.',
        sourceLabel:'Atlanta Dream',
        sourceUrl:'https://dream.wnba.com/news'
      }
    ],
    'dallas-wings':[
      {
        date:'2026-08-25',
        kind:'PLAYOFFS',
        player:'Dallas Wings',
        detail:'Clinched the final 2026 playoff berth with a 96–78 win over Portland, their first postseason trip since 2023 and a franchise-record 23rd win.',
        sourceLabel:'Dallas Wings',
        sourceUrl:'https://wings.wnba.com/news/dallas-wings-clinch-2026-playoff-berth',
        priority:3
      },
      {
        date:'2026-08-25',
        kind:'ROSTER',
        player:'Kitija Laksa',
        detail:'Signed by Dallas as the Wings strengthen the roster for the final regular-season stretch and postseason.',
        sourceLabel:'Dallas Wings',
        sourceUrl:'https://wings.wnba.com/news/dallas-wings-sign-kitija-laksa',
        supersedes:['Kitija Laksa'],
        priority:2
      }
    ],
    'new-york-liberty':[
      {
        date:'2026-09-21',
        kind:'ALL-TIME SCORING',
        player:'Breanna Stewart',
        detail:'Passed Cappie Pondexter for eighth in WNBA career points, then scored 27 against Atlanta to lift her running total to 6,860, 35 behind Candice Dupree.',
        sourceLabel:'New York Liberty',
        sourceUrl:'https://liberty.wnba.com/news/liberty-powers-past-toronto-for-106-69-win',
        priority:10
      },
      {
        date:'2026-09-15',
        kind:'FRONT OFFICE',
        player:'Tina Charles',
        detail:'Liberty legend Tina Charles returned to the organization as a front-office intern while pursuing her master’s degree in Sports Management at UConn.',
        sourceLabel:'New York Liberty / CT Insider',
        sourceUrl:'https://www.ctpost.com/sports/uconn-womens-basketball/article/tina-charles-new-york-liberty-intern-masters-22433522.php',
        priority:6
      }
    ],
    'las-vegas-aces':[
      {
        date:'2026-09-25',
        kind:'HONOR',
        player:"A'ja Wilson",
        detail:'Named Western Conference Player of the Week after averaging 27.8 points, 8.8 rebounds and 3.8 assists during the final week of the regular season. The honor was her fifth of 2026 and tied the WNBA career record with 33 weekly awards.',
        sourceLabel:'Las Vegas Aces',
        sourceUrl:'https://aces.wnba.com/news/aja-wilson-earns-wnba-record-tying-33rd-wnba-player-of-the-week-honor-and-fifth-of-the-season',
        priority:5
      },
      {
        date:'2026-09-20',
        kind:'1,000-POINT CLUB',
        player:"A'ja Wilson",
        detail:'Finished with 1,021 points after scoring 30 against Seattle, matching her 2024 total and becoming the only WNBA player with multiple 1,000-point seasons.',
        sourceLabel:'Las Vegas Aces',
        sourceUrl:'https://aces.wnba.com/news/game-recap-aces-complete-season-sweep-against-seattle-with-98-77-win',
        priority:10
      },
      {
        date:'2026-08-27',
        kind:'OUT FOR SEASON',
        player:'NaLyssa Smith',
        detail:'The Aces announced Smith will miss the remainder of the 2026 season after the non-contact left-leg injury she sustained against Toronto.',
        sourceLabel:'Las Vegas Aces',
        sourceUrl:'https://aces.wnba.com/news/nalyssa-smith-sidelined-for-remainder-of-season',
        supersedes:['NaLyssa Smith'],
        priority:4
      },
      {
        date:'2026-08-25',
        kind:'HONOR',
        player:"A'ja Wilson",
        detail:'Earned the 32nd Western Conference Player of the Week award of her career.',
        sourceLabel:'Las Vegas Aces',
        sourceUrl:'https://aces.wnba.com/news/aja-wilson-earns-32nd-career-western-conference-player-of-the-week-award',
        priority:2
      }
    ],
    'phoenix-mercury':[
      {
        date:'2026-09-21',
        kind:'TRIPLE-DOUBLE TRACKER',
        player:'Alyssa Thomas',
        detail:'Posted 15 points, 11 rebounds and 12 assists against Dallas for her fifth triple-double of 2026, 15th with Phoenix and 30th across regular-season and playoff games.',
        sourceLabel:'Official final box score',
        sourceUrl:'https://www.wnba.com/game/1022600318',
        priority:10
      }
    ],
    'los-angeles-sparks':[
      {
        date:'2026-09-20',
        kind:'8,000-POINT CLUB',
        player:'Nneka Ogwumike',
        detail:'Became the fourth player in WNBA history to reach 8,000 career points, finishing the 20-point win over Portland at 8,013 career points.',
        sourceLabel:'Official final box score',
        sourceUrl:'https://www.wnba.com/game/1022600313',
        priority:11
      },
      {
        date:'2026-09-20',
        kind:'LEGACY IN BRONZE',
        player:'Lisa Leslie',
        detail:'The Sparks unveiled Leslie\'s statue at Star Plaza outside Crypto.com Arena. She is the second WNBA player honored with a statue by her franchise, following Sue Bird.',
        sourceLabel:'Los Angeles Sparks',
        sourceUrl:'https://sparks.wnba.com/watch/video/lisa-leslie-statue-celebration',
        priority:10
      }
    ],
    'indiana-fever':[
      {
        date:'2026-09-20',
        kind:'WNBA SCORING RECORD',
        player:'Kelsey Mitchell',
        detail:'Added 22 points against Washington to push the WNBA single-season scoring record to 1,056. Indiana still has two regular-season games remaining.',
        sourceLabel:'Season points leaderboard',
        sourceUrl:'https://www.basketball-reference.com/wnba/leaders/pts_season.html',
        priority:10
      }
    ]
  };

  const AP_AWARDS={
    'las-vegas-aces':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:"A'ja Wilson + Jackie Young",
        detail:"Wilson won a record fourth AP Player of the Year award and made the AP first team. Young earned AP second-team honors.",
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'atlanta-dream':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:'Angel Reese + Rhyne Howard',
        detail:'Reese won AP Defensive Player of the Year and made the AP second team. Howard joined her on the second team.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'minnesota-lynx':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:'Olivia Miles + Cheryl Reeve',
        detail:'Miles was the unanimous AP Rookie of the Year and made the first and All-Rookie teams. Reeve won her record third AP Coach of the Year award.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'indiana-fever':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:'Caitlin Clark + Kelsey Mitchell',
        detail:'Clark won AP Comeback Player of the Year. Clark and Mitchell both earned AP first-team honors.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'dallas-wings':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:'Jessica Shepard + Paige Bueckers + Azzi Fudd',
        detail:'Shepard won AP Most Improved Player, Bueckers made the AP second team and Fudd earned an All-Rookie place.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'golden-state-valkyries':[
      {
        date:'2026-09-27',
        kind:'AP AWARDS',
        player:'Janelle Salaün + Gabby Williams',
        detail:'Salaün won AP Sixth Woman of the Year and made the All-Rookie team. Williams earned AP second-team honors.',
        sourceLabel:'Golden State Valkyries',
        sourceUrl:'https://valkyries.wnba.com/news/salaun-williams-earn-ap-awards-20260927',
        priority:30
      }
    ],
    'new-york-liberty':[
      {
        date:'2026-09-27',
        kind:'AP HONORS',
        player:'Breanna Stewart + Pauline Astier',
        detail:'Stewart made the AP first team and Astier earned a place on the six-player AP All-Rookie team.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'seattle-storm':[
      {
        date:'2026-09-27',
        kind:'AP HONOR',
        player:"Flau'jae Johnson",
        detail:'Johnson earned a place on the six-player 2026 AP All-Rookie team.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'chicago-sky':[
      {
        date:'2026-09-27',
        kind:'AP HONOR',
        player:'Sydney Taylor',
        detail:'Taylor earned a place on the six-player 2026 AP All-Rookie team.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ],
    'toronto-tempo':[
      {
        date:'2026-09-27',
        kind:'AP HONOR',
        player:'Kiki Rice',
        detail:'Rice earned a place on the six-player 2026 AP All-Rookie team.',
        sourceLabel:'Associated Press via ESPN',
        sourceUrl:'https://www.espn.com/wnba/story/_/id/50042340/aja-wilson-angel-reese-lead-ap-wnba-award-winners',
        priority:30
      }
    ]
  };

  const manual=[...(AP_AWARDS[slug]||[]),...(CURATED[slug]||[])];
  if(!manual.length)return;

  const teamData=typeof teamBySlug==='function'?teamBySlug(slug):null;
  const teamName=teamData?.name||'';
  const norm=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const safe=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const safeUrl=value=>/^https:\/\//i.test(String(value||''))?String(value):'';
  const shortDate=value=>{
    const date=new Date(`${String(value||'').slice(0,10)}T12:00:00`);
    return Number.isNaN(date.getTime())?String(value||'Current'):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(date);
  };
  const superseded=new Set(manual.flatMap(item=>item.supersedes||[]).map(norm));
  let rendering=false;
  let refreshTimer=0;

  function article(item,index){
    const link=safeUrl(item.sourceUrl);
    const source=link?` <a href="${safe(link)}" target="_blank" rel="noopener" aria-label="Source for ${safe(item.player)} update">Source ↗</a>`:'';
    return `<article${index===0?` data-team-feed-version="${VERSION}"`:''}><div><span>${safe(item.kind||'Update')}</span><time datetime="${safe(item.date||'')}">${safe(shortDate(item.date))}</time></div><strong>${safe(item.player||'Team update')}</strong><p>${safe(item.detail||'')}${source}</p></article>`;
  }

  async function loadLive(){
    try{
      const response=await fetch(`/player-live-updates.json?v=${Date.now()}`,{cache:'no-store'});
      return response.ok?await response.json():{};
    }catch(error){return {};}
  }

  async function render(){
    if(rendering)return;
    const target=document.getElementById('dreamTeamUpdates');
    if(!target)return;
    rendering=true;
    const payload=await loadLive();
    const transactions=(Array.isArray(payload.transactions)?payload.transactions:[])
      .filter(item=>norm(item.team)===norm(teamName)&&!superseded.has(norm(item.player)))
      .map(item=>({kind:item.type||'Movement',player:item.player||'Team update',detail:item.detail||'Roster update',date:item.date||'',priority:0}));
    const injuries=(Array.isArray(payload.injuries)?payload.injuries:[])
      .filter(item=>norm(item.team)===norm(teamName)&&!['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status||'').toUpperCase())&&!superseded.has(norm(item.player)))
      .map(item=>({kind:item.status||'Availability',player:item.player||'Player update',detail:item.reason||'Availability update',date:item.updated||'',priority:0}));

    const updates=[...manual,...transactions,...injuries]
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(Number(b.priority)||0)-(Number(a.priority)||0))
      .filter((item,index,array)=>array.findIndex(other=>`${other.date}|${norm(other.player)}|${norm(other.kind)}`===`${item.date}|${norm(item.player)}|${norm(item.kind)}`)===index)
      .slice(0,6);

    if(updates.length)target.innerHTML=updates.map(article).join('');
    rendering=false;
  }

  function needsRender(){
    const target=document.getElementById('dreamTeamUpdates');
    return Boolean(target&&!target.querySelector(`[data-team-feed-version="${VERSION}"]`));
  }

  function scheduleRender(delay=80){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{if(needsRender())render();},delay);
  }

  const observer=new MutationObserver(()=>{
    if(!rendering&&needsRender())scheduleRender();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  scheduleRender(0);
  setTimeout(()=>scheduleRender(0),700);
  setTimeout(()=>scheduleRender(0),1800);
})();
