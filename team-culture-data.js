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
})();
