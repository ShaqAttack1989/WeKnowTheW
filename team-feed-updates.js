(()=>{
  if(location.pathname!=='/team.html')return;

  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  if(!slug)return;

  const VERSION='20260828-v1';
  const CURATED={
    'seattle-storm':[
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
    'las-vegas-aces':[
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
    ]
  };

  const manual=CURATED[slug]||[];
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