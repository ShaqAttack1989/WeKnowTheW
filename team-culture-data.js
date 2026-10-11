(function(){
  const identities={
    'atlanta-dream':{team:'Atlanta Dream',fanbase:'The Dream Faithful',arena:'Gateway Center Arena',arenaAlias:'',arenaNote:'No major popular arena nickname',primary:'#C8102E',secondary:'#69B3E7',poster:'/assets/team-posters/atlanta-dream.webp'},
    'chicago-sky':{team:'Chicago Sky',fanbase:'Sky Town',arena:'Wintrust Arena',arenaAlias:'',arenaNote:'No official or major popular arena nickname',primary:'#F9E547',secondary:'#69B3E7',poster:'/assets/team-posters/chicago-sky.webp'},
    'connecticut-sun':{team:'Connecticut Sun',fanbase:'Sun Tribe',arena:'Mohegan Sun Arena',arenaAlias:'The Sun Cage',arenaNote:'Fan and home-court nickname',primary:'#F05023',secondary:'#003DA5',poster:'/assets/team-posters/connecticut-sun.webp'},
    'dallas-wings':{team:'Dallas Wings',fanbase:'Wing Nut Nation',arena:'College Park Center',arenaAlias:'',arenaNote:'',primary:'#0C2340',secondary:'#C4D600',poster:'/assets/team-posters/dallas-wings.webp'},
    'golden-state-valkyries':{team:'Golden State Valkyries',fanbase:'Valkyrie Legion',arena:'Chase Center',arenaAlias:'Ballhalla',arenaNote:'Fan and franchise home-court nickname',primary:'#6D35A8',secondary:'#B79BE6',poster:'/assets/team-posters/golden-state-valkyries.webp'},
    'indiana-fever':{team:'Indiana Fever',fanbase:'Fever Nation',arena:'Gainbridge Fieldhouse',arenaAlias:'the Fieldhouse',arenaNote:'Common shorthand',primary:'#002D62',secondary:'#E03A3E',poster:'/assets/team-posters/indiana-fever.webp'},
    'las-vegas-aces':{team:'Las Vegas Aces',fanbase:'Aces Nation / High Rollers',arena:'Michelob ULTRA Arena',arenaAlias:'The House',arenaNote:'Home-court nickname',primary:'#C8102E',secondary:'#000000',poster:'/assets/team-posters/las-vegas-aces.webp'},
    'los-angeles-sparks':{team:'Los Angeles Sparks',fanbase:'Spark Nation',arena:'Crypto.com Arena',arenaAlias:'The Crypt',arenaNote:'Fan shorthand',primary:'#552583',secondary:'#FDB927',poster:'/assets/team-posters/los-angeles-sparks.webp'},
    'minnesota-lynx':{team:'Minnesota Lynx',fanbase:'Lynx Faithful',arena:'Target Center',arenaAlias:'The Barn / The Roar',arenaNote:'Fan home-court nicknames',primary:'#0C2340',secondary:'#78BE20',poster:'/assets/team-posters/minnesota-lynx.webp'},
    'new-york-liberty':{team:'New York Liberty',fanbase:'Liberty Loud / Seafoam Mob',arena:'Barclays Center',arenaAlias:'the Clam',arenaNote:'Fan shorthand',primary:'#6ECEB2',secondary:'#000000',poster:'/assets/team-posters/new-york-liberty.webp'},
    'phoenix-mercury':{team:'Phoenix Mercury',fanbase:'The X-Factor / Merc',arena:'Footprint Center',arenaAlias:'The Purple Palace',arenaNote:'Legacy nickname used prior to renovations',primary:'#CB6015',secondary:'#201747',poster:'/assets/team-posters/phoenix-mercury.webp'},
    'portland-fire':{team:'Portland Fire',fanbase:'Firepit',arena:'Moda Center',arenaAlias:'The Rose Quarter / Rose Garden',arenaNote:'Local and legacy arena shorthand',primary:'#D52B1E',secondary:'#F4A7B9',poster:'/assets/team-posters/portland-fire.webp'},
    'seattle-storm':{team:'Seattle Storm',fanbase:'Storm Squad / Crazie',arena:'Climate Pledge Arena',arenaAlias:'The Greenhouse',arenaNote:'Fan home-court nickname',primary:'#2C5234',secondary:'#FEE11A',poster:'/assets/team-posters/seattle-storm.webp'},
    'toronto-tempo':{team:'Toronto Tempo',fanbase:'Tempo-Rary / Beat',arena:'Coca-Cola Coliseum',arenaAlias:'The Coliseum',arenaNote:'Common shorthand',primary:'#2477C5',secondary:'#6E1F3A',poster:'/assets/team-posters/toronto-tempo.webp'},
    'washington-mystics':{team:'Washington Mystics',fanbase:'Mystic Faction',arena:'CareFirst Arena',arenaAlias:'the ESA',arenaNote:'Legacy shorthand from the Entertainment & Sports Arena name',primary:'#002B5C',secondary:'#E31837',poster:'/assets/team-posters/washington-mystics.webp'}
  };

  window.TEAM_CULTURE_IDENTITIES=Object.freeze(identities);
  window.TEAM_FANBASE_IDENTITIES=Object.freeze(Object.fromEntries(Object.entries(identities).map(([slug,item])=>[slug,{name:item.fanbase,kind:'Fan community',source:'/courtside-culture.html#home-court-roll-call'}])));

  // Current franchise milestone: Kahleah Copper became the fastest Mercury player to 2,000 points on Aug. 27, 2026.
  if(new URLSearchParams(location.search).get('team')==='phoenix-mercury'){
    const mercuryGuide=window.TEAM_GUIDES?.['phoenix-mercury'];
    if(mercuryGuide){
      mercuryGuide.history.push(['2026','Kah reaches 2,000 in record time','Kahleah Copper scored 35 against Washington and became the fastest player in Mercury history to reach 2,000 franchise points, getting there in 103 games.']);
      mercuryGuide.honors.unshift(['103','Games to 2,000 points','Kahleah Copper reached 2,000 Mercury points faster than any player in franchise history, one game quicker than Diana Taurasi and Cappie Pondexter.']);
    }

    const nowSection=document.getElementById('whats-happening');
    const statGrid=document.getElementById('dreamStatGrid');
    if(nowSection&&statGrid&&!document.getElementById('mercuryCopperMilestone')){
      const card=document.createElement('section');
      card.id='mercuryCopperMilestone';
      card.setAttribute('aria-label','Kahleah Copper franchise milestone');
      card.style.cssText='margin:0 0 24px;padding:22px;border-radius:24px;background:linear-gradient(135deg,#201747 0%,#4b2372 62%,#CB6015 150%);color:#fff;box-shadow:0 18px 45px rgba(32,23,71,.18);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center';
      card.innerHTML='<div><span style="display:block;font-size:.72rem;font-weight:1000;letter-spacing:.13em;color:#ffb35c;margin-bottom:8px">FRANCHISE MILESTONE · AUG. 27, 2026</span><strong style="display:block;font-size:clamp(1.45rem,4vw,2.35rem);line-height:1.02;letter-spacing:-.035em">Kah got to 2,000 first.</strong><p style="margin:10px 0 0;max-width:760px;color:rgba(255,255,255,.84);line-height:1.55">Kahleah Copper dropped 35 points against Washington and became the fastest player in Mercury history to score 2,000 points for the franchise. She did it in 103 games, one fewer than Diana Taurasi and Cappie Pondexter.</p><a href="https://abcnews.com/Sports/wireStory/georgia-amoore-scores-career-high-25-mystics-move-136022246" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:14px;color:#ffcf8f;font-weight:900;text-decoration:none">Milestone receipt ↗</a></div><div style="min-width:112px;text-align:center;padding:15px 16px;border-radius:20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)"><strong style="display:block;font-size:2.8rem;line-height:.9;color:#ff9f3f">2K</strong><span style="display:block;margin-top:8px;font-size:.72rem;font-weight:900;letter-spacing:.08em">103 GAMES</span></div>';
      statGrid.parentNode.insertBefore(card,statGrid);
      const mq=window.matchMedia('(max-width:680px)');
      const sync=()=>{card.style.gridTemplateColumns=mq.matches?'1fr':'minmax(0,1fr) auto';};
      sync();mq.addEventListener?.('change',sync);
    }
  }
})();
