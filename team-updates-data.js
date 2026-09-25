(()=>{
  const FEEDS=[
    '/snack-shak-latest.json',
    '/snack-shak-breaking.json',
    '/snack-shak-specials.json',
    '/snack-shaq-posts.json',
    '/snack-shak-love-and-basketball.json'
  ];
  const CURATED={
    'atlanta-dream':[
      {date:'2026-09-01',category:'story',kind:'WNBA RECORD',title:'Angel Reese',detail:'Reese set a new WNBA single-season record with her 29th double-double, adding to her single-game and single-season rebounding records.',href:'https://dream.wnba.com/news/angel-reese-named-wnba-eastern-conference-player-of-the-week-for-second-consecutive-week',priority:10},
      {date:'2026-08-27',category:'movement',kind:'SIGNED',title:'DeWanna Bonner',detail:'Atlanta signed the two-time WNBA champion and six-time All-Star to a rest-of-season contract for the playoff push.',href:'https://dream.wnba.com/news/atlanta-dream-signs-two-time-wnba-champion-dewanna-bonner',priority:8},
      {date:'2026-08-24',category:'story',kind:'WNBA RECORD',title:'Angel Reese',detail:'Set the WNBA single-game rebounding record with 26 boards and broke the single-season rebounds record in the win over Los Angeles.',href:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip',priority:9},
      {date:'2026-08-24',category:'story',kind:'MILESTONE',title:'Rhyne Howard',detail:'Scored her 3,000th WNBA career point on a third-quarter three against Los Angeles.',href:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip',priority:7},
      {date:'2026-08-24',category:'story',kind:'FRANCHISE RECORD',title:'Allisha Gray',detail:'Set a Dream single-season record with her 247th made field goal.',href:'https://dream.wnba.com/news/historic-night-for-reese-as-dream-goes-4-0-on-west-coast-road-trip',priority:7},
      {date:'2026-08-23',category:'story',kind:'PLAYOFFS',title:'Atlanta Dream',detail:'Clinched a fourth consecutive WNBA playoff berth.',href:'https://dream.wnba.com/news',priority:5}
    ],
    'chicago-sky':[
      {date:'2026-06-26',category:'story',kind:'WNBA ROOKIE RECORD',title:'Sydney Taylor',detail:'Taylor produced the most efficient 25-point game by a rookie in WNBA history against Portland: 72.7% from the field, 85.7% from three and perfect at the line.',href:'https://sky.wnba.com/news/recap-sky-shatter-records-upon-courtney-vandersloots-return-in-124-94-triumph-over-fire',priority:9}
    ],
    'connecticut-sun':[
      {date:'2026-09-21',category:'story',kind:'FRONT OFFICE · RELOCATION',title:'Jennifer Rizzotti',detail:'Rizzotti told NBC Connecticut she is moving with the franchise to Houston and will serve as President of Basketball Operations there in 2027.',href:'https://www.nbcconnecticut.com/news/local/connecticut-sun-president-jennifer-rizzotti-headed-to-houston-with-team/3777073/',priority:10}
    ],
    'golden-state-valkyries':[
      {date:'2026-09-21',category:'movement',kind:'SIGNED',title:'Aminata Gueye',detail:'Golden State signed 6-foot-3 French center Aminata Gueye to a rest-of-season contract after her 2026 FIBA World Cup run and waived Nadia Fingall.',href:'https://valkyries.wnba.com/news/aminata-gueye-signs-20260921',priority:10},
      {date:'2026-08-27',category:'story',kind:'WNBA FIRST',title:'Veronica Burton',detail:'Burton totaled 20 assists with zero turnovers across a back-to-back, recognized by Golden State as a WNBA first.',href:'https://valkyries.wnba.com/news/player/1631007/veronica-burton',priority:7},
      {date:'2026-08-26',category:'story',kind:'BENCH LEADER',title:'Janelle Salaün',detail:'Reached 485 points off the bench, the league-leading bench scoring total at the time.',href:'https://www.statmuse.com/wnba/ask/most-total-points-off-the-bench-2026',priority:5}
    ],
    'las-vegas-aces':[
      {date:'2026-08-27',category:'availability',kind:'OUT FOR SEASON',title:'NaLyssa Smith',detail:'Las Vegas announced Smith would miss the remainder of the 2026 season after a non-contact left-leg injury.',href:'https://aces.wnba.com/news/nalyssa-smith-sidelined-for-remainder-of-season',priority:8},
      {date:'2026-08-25',category:'story',kind:'HONOR',title:"A'ja Wilson",detail:'Earned the 32nd Western Conference Player of the Week award of her career.',href:'https://aces.wnba.com/news/aja-wilson-earns-32nd-career-western-conference-player-of-the-week-award',priority:5}
    ],
    'dallas-wings':[
      {date:'2026-09-23',category:'story',kind:'FINAL · NO. 7 SEED',title:'Dallas Wings 103, Seattle Storm 91',detail:'Dallas closed the regular season with a win in Seattle, secured the No. 7 playoff seed and finished 27-17. Paige Bueckers scored 25, Arike Ogunbowale 23, and Jessica Shepard posted 20 points, 11 rebounds and 12 assists.',href:'https://wings.wnba.com/',priority:12},
      {date:'2026-09-22',category:'movement',kind:'DEVELOPMENTAL CONTRACT',title:'Deja Kelly',detail:'Dallas signed 2026 UPSHOT champion and Ann Meyers Drysdale Championship MVP Deja Kelly to a Developmental Player contract. Kelly led the inaugural UPSHOT season at 18.1 points and 4.0 assists per game and will wear No. 2.',href:'https://www.oursportscentral.com/services/releases/dallas-wings-sign-deja-kelly-to-developmental-player-contract/n-6415741',priority:10},
      {date:'2026-08-25',category:'story',kind:'PLAYOFFS',title:'Dallas Wings',detail:'Clinched the final 2026 playoff berth and a franchise-record 23rd win.',href:'https://wings.wnba.com/news/dallas-wings-clinch-2026-playoff-berth',priority:6},
      {date:'2026-08-25',category:'movement',kind:'SIGNED',title:'Kitija Laksa',detail:'Dallas signed Laksa for the final regular-season stretch and postseason.',href:'https://wings.wnba.com/news/dallas-wings-sign-kitija-laksa',priority:5}
    ],
    'new-york-liberty':[
      {date:'2026-09-15',category:'story',kind:'FRONT OFFICE',title:'Tina Charles',detail:'Liberty legend Tina Charles returned to the organization as a front-office intern while pursuing her master’s degree.',href:'https://www.ctpost.com/sports/uconn-womens-basketball/article/tina-charles-new-york-liberty-intern-masters-22433522.php',priority:7}
    ],
    'seattle-storm':[
      {date:'2026-08-26',category:'story',kind:'MILESTONE',title:"Flau'jae Johnson",detail:'Passed 500 WNBA career points with 20 points against Toronto.',href:'https://www.statmuse.com/wnba/player/flau%27jae-johnson-1755',priority:5}
    ],
    'los-angeles-sparks':[
      {date:'2026-09-25',category:'story',kind:'COACHING CHANGE · REPORTED',title:'Lynne Roberts',detail:'ESPN reported that Los Angeles dismissed head coach Lynne Roberts on Sept. 25 after the Sparks missed the playoffs for a second consecutive season under her. The official Sparks basketball-operations page had not yet reflected the change when this update was published.',href:'https://www.espn.com/wnba/',priority:12},
      {date:'2026-09-24',category:'story',kind:'FINAL GAME · LEGACY',title:'Nneka Ogwumike',detail:'Ogwumike closed her WNBA career with 17 points and 15 rebounds against Golden State. Her 19th double-double of 2026 set a Sparks single-season record, and Los Angeles announced its new El Segundo practice facility will be named for her.',href:'https://www.latimes.com/sports/sparks/story/2026-09-24/los-angeles-sparks-golden-state-valkyries-wnba-game-recap',priority:11},
      {date:'2026-09-05',category:'story',kind:'FRONT OFFICE',title:'Ariana Andonian',detail:'Los Angeles hired longtime 76ers executive Ariana Andonian as general manager, putting the franchise under new basketball leadership heading into the 2027 offseason.',href:'https://www.espn.com/wnba/story/_/id/49829744/sparks-hiring-sixers-executive-andonian-new-general-manager',priority:8}
    ],
    'minnesota-lynx':[
      {date:'2026-08-21',category:'story',kind:'MILESTONE',title:'Nia Coffey',detail:'Crossed 1,500 WNBA career points in Minnesota’s win at Washington.',href:'https://www.basketball-reference.com/wnba/players/c/coffeni01w.html',priority:5}
    ]
  };

  const text=value=>String(value??'').replace(/\s+/g,' ').trim();
  const norm=value=>text(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const isoDate=value=>{
    const raw=String(value||'').trim();
    const match=raw.match(/(\d{4}-\d{2}-\d{2})/);
    if(match)return match[1];
    const parsed=new Date(raw);
    if(Number.isNaN(parsed.getTime()))return '';
    return parsed.toISOString().slice(0,10);
  };
  const short=value=>{
    const clean=text(value);
    return clean.length<=220?clean:`${clean.slice(0,220).replace(/\s+\S*$/,'').trim()}…`;
  };
  const safeLocalHref=story=>{
    const direct=text(story.dashboardUrl||story.href||story.path||story.internalUrl);
    if(direct.startsWith('/'))return direct;
    if(story.slug){
      const type=norm(story.type||story.kind||story.seriesLabel||'');
      return /byte/.test(type)?`/snack-shak-bytes.html?post=${encodeURIComponent(story.slug)}#story`:`/food-for-thought.html?post=${encodeURIComponent(story.slug)}#story`;
    }
    return '/snack-shak.html';
  };
  const fetchJson=async url=>{
    const joiner=url.includes('?')?'&':'?';
    const response=await fetch(`${url}${joiner}cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'});
    if(!response.ok)throw new Error(`${url} returned ${response.status}`);
    return response.json();
  };
  function collectStories(value,source,output=[],seen=new Set()){
    if(Array.isArray(value)){value.forEach(item=>collectStories(item,source,output,seen));return output;}
    if(!value||typeof value!=='object')return output;
    if(value.title&&typeof value.title==='string'){
      const sig=`${text(value.slug||value.title)}|${text(value.published||value.date||'')}`;
      if(!seen.has(sig)){seen.add(sig);output.push({...value,_source:source});}
    }
    Object.values(value).forEach(item=>{if(item&&typeof item==='object')collectStories(item,source,output,seen);});
    return output;
  }
  function storyKind(story={}){
    const hay=norm([story.seriesLabel,story.category,story.type,story.title,story.dek].filter(Boolean).join(' '));
    if(/record|historic|history/.test(hay))return 'RECORD / MILESTONE';
    if(/award|honor|playeroftheweek|mvp/.test(hay))return 'HONOR';
    if(/playoff/.test(hay))return 'PLAYOFF STORY';
    return 'STORY';
  }
  function storyRelevant(story,teamName,rosterNames){
    const teamKey=norm(teamName);
    const storyTeams=Array.isArray(story.teams)?story.teams:[];
    if(storyTeams.some(team=>norm(team)===teamKey))return true;
    const players=Array.isArray(story.players)?story.players:[];
    return players.some(player=>rosterNames.has(norm(player)));
  }
  function storyToItem(story){
    const detail=story.dek||story.summary||story.excerpt||story.copy||
      (story.sections||[]).flatMap(section=>section?.paragraphs||[]).find(Boolean)||'Open the story for the full update.';
    return {
      date:isoDate(story.published||story.date||story.updatedAt),
      category:'story',
      kind:storyKind(story),
      title:text(story.title||'Team story'),
      detail:short(detail),
      href:safeLocalHref(story),
      priority:Number(story.priority||0)
    };
  }
  function movementToItem(item){
    return {
      date:isoDate(item.date),
      category:'movement',
      kind:text(item.type||'ROSTER MOVE').toUpperCase(),
      title:text(item.player||'Team update'),
      detail:short(item.detail||'Roster update'),
      href:'/player-movement.html',
      priority:0
    };
  }
  function availabilityToItem(item){
    return {
      date:isoDate(item.updated||item.gameDate||item.date),
      category:'availability',
      kind:text(item.status||'AVAILABILITY').toUpperCase(),
      title:text(item.player||'Player update'),
      detail:short(item.reason||item.injury||'Availability update'),
      href:'/availability-report.html',
      priority:/OUT FOR SEASON|SEASON/i.test(String(item.status||''))?7:1
    };
  }
  function dedupe(items=[]){
    const kept=[];
    for(const item of items){
      const itemTime=Date.parse((item.date||'')+'T12:00:00');
      const duplicate=kept.some(other=>{
        if(norm(other.category)!==norm(item.category)||norm(other.title)!==norm(item.title)||norm(other.kind)!==norm(item.kind))return false;
        const otherTime=Date.parse((other.date||'')+'T12:00:00');
        if(!Number.isFinite(itemTime)||!Number.isFinite(otherTime))return other.date===item.date;
        return Math.abs(itemTime-otherTime)<=3*86400000;
      });
      if(!duplicate)kept.push(item);
    }
    return kept;
  }
  function sortUpdates(items=[]){
    return [...items].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(Number(b.priority)||0)-(Number(a.priority)||0)||String(a.title||'').localeCompare(String(b.title||'')));
  }
  function selectDashboardItems(items=[],limit=6){
    const sorted=sortUpdates(items);
    const selected=[];
    const used=new Set();
    const add=item=>{if(item&&!used.has(item)){selected.push(item);used.add(item);}};
    ['availability','movement','story'].forEach(category=>add(sorted.find(item=>item.category===category)));
    sorted.forEach(item=>{if(selected.length<limit)add(item);});
    return sortUpdates(selected).slice(0,limit);
  }
  async function loadTeamUpdates(teamName,slug){
    const [availabilityR,movementR,playersR,...feedResults]=await Promise.allSettled([
      fetchJson('/api/availability'),
      fetchJson('/api/player-movement'),
      fetchJson('/api/players'),
      ...FEEDS.map(fetchJson)
    ]);
    const availability=availabilityR.status==='fulfilled'?availabilityR.value:{};
    const movement=movementR.status==='fulfilled'?movementR.value:{};
    const playersPayload=playersR.status==='fulfilled'?playersR.value:{};
    const teamKey=norm(teamName);
    const rosterNames=new Set((Array.isArray(playersPayload.players)?playersPayload.players:[])
      .filter(player=>norm(player.team)===teamKey||norm(player.lastTeam)===teamKey)
      .map(player=>norm(player.name)).filter(Boolean));

    const stories=[];
    feedResults.forEach((result,index)=>{if(result.status==='fulfilled')collectStories(result.value,FEEDS[index],stories);});
    const storyItems=stories
      .filter(story=>isoDate(story.published||story.date||'').startsWith('2026-'))
      .filter(story=>storyRelevant(story,teamName,rosterNames))
      .map(storyToItem);

    const availabilityItems=(Array.isArray(availability.injuries)?availability.injuries:[])
      .filter(item=>norm(item.team)===teamKey&&!['AVAILABLE','ACTIVE','CLEARED'].includes(String(item.status||'').toUpperCase()))
      .map(availabilityToItem);
    const movementItems=(Array.isArray(movement.transactions)?movement.transactions:[])
      .filter(item=>norm(item.team)===teamKey)
      .map(movementToItem);
    const curated=(CURATED[slug]||[]).map(item=>({...item,date:isoDate(item.date)}));

    const items=sortUpdates(dedupe([...curated,...storyItems,...availabilityItems,...movementItems]));
    return {
      items,
      dashboard:selectDashboardItems(items,6),
      checkedAt:availability.checkedAt||movement.checkedAt||new Date().toISOString(),
      partial:Boolean(availability.partial||movement.partial)
    };
  }

  window.WTeamUpdates={loadTeamUpdates,selectDashboardItems,sortUpdates,CURATED};
})();