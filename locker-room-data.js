const LOCKER_UPDATED = 'Aug 23, 2026';
const lockerHeadshot = id => `https://cdn.wnba.com/headshots/wnba/latest/1040x760/${id}.png`;

const LOCKER_SECTIONS = [
  {key:'uniforms',href:'/old-uniforms.html',label:'OLD UNIFORMS',title:'The jersey tells the year',copy:'Travel through original colors, relocation eras and the looks that made a franchise instantly recognizable.',image:'/assets/team-posters/los-angeles-sparks.webp',accent:'#f4c430'},
  {key:'buzzer',href:'/final-buzzer.html',label:'THE FINAL BUZZER',title:'Legends in the rafters',copy:'Retirement announcements, legacy portraits and the numbers that will never be worn again.',image:lockerHeadshot('100940'),accent:'#d8ff4f'},
  {key:'identity',href:'/colors-symbols.html',label:'COLORS & SYMBOLS',title:'A city in every detail',copy:'Team palettes, icons and local references decoded in one visual identity guide.',image:'/assets/team-posters/new-york-liberty.webp',accent:'#6eceb2'},
  {key:'changes',href:'/franchise-changes.html',label:'FRANCHISE CHANGES',title:'Moves, names and new chapters',copy:'A clean timeline of relocations, rebrands and expansion without mixing separate franchises together.',image:'/assets/team-posters/dallas-wings.webp',accent:'#69b3e7'},
  {key:'tree',href:'/franchise-family-tree.html',label:'FRANCHISE FAMILY TREE',title:'See every branch',copy:'Follow continuous franchise lines, closed chapters and returning markets all the way to today.',image:'/assets/team-posters/las-vegas-aces.webp',accent:'#c8102e'}
];

const OLD_UNIFORM_ERAS = [
  {slug:'los-angeles-sparks',team:'Los Angeles Sparks',years:'1997 to today',era:'Purple and gold, always Los Angeles',colors:['#552583','#fdb927','#00a2e8'],photo:lockerHeadshot('100003'),legend:'Lisa Leslie',story:'The Sparks began with bold purple, gold and teal details. Modern editions sharpen the same unmistakable Los Angeles foundation.'},
  {slug:'new-york-liberty',team:'New York Liberty',years:'1997 to today',era:'Torch colors to seafoam',colors:['#f26a21','#1d428a','#6eceb2','#000000'],photo:lockerHeadshot('100075'),legend:'Teresa Weatherspoon',story:'New York moved from royal blue and orange into seafoam and black, using the oxidized copper of the Statue of Liberty as its modern signature.'},
  {slug:'phoenix-mercury',team:'Phoenix Mercury',years:'1997 to today',era:'Desert heat in purple and orange',colors:['#201747','#cb6015','#f9a01b'],photo:lockerHeadshot('100940'),legend:'Diana Taurasi',story:'Purple and orange have carried through every Mercury chapter. The balance changes, but the desert sunset identity remains.'},
  {slug:'las-vegas-aces',team:'Utah Starzz → San Antonio → Las Vegas Aces',years:'1997 to today',era:'Three cities, three visual worlds',colors:['#6b2c91','#b87333','#a7a8aa','#c8102e','#000000'],photo:lockerHeadshot('1628932'),legend:"A'ja Wilson",story:'Mountain purple and copper became San Antonio silver and black, then Las Vegas red, black and gold. The franchise line stayed continuous while the visual identity changed completely.'},
  {slug:'dallas-wings',team:'Detroit Shock → Tulsa Shock → Dallas Wings',years:'1998 to today',era:'Shock energy to Wings flight',colors:['#008c95','#e03a3e','#000000','#c4d600','#0c2340'],photo:lockerHeadshot('100639'),legend:'Deanna Nolan',story:'Detroit teal and red gave way to Tulsa black, red and gold, then Dallas navy, blue and volt. The championships and records travel with the franchise.'},
  {slug:'connecticut-sun',team:'Orlando Miracle → Connecticut Sun',years:'1999 to today',era:'Magic blue to solar orange',colors:['#00a2e8','#0057b8','#f05023','#f9e547'],story:'The Orlando era leaned into bright blue and celestial imagery. Connecticut built a new identity around the sun, Mohegan symbolism and orange light.'},
  {slug:'minnesota-lynx',team:'Minnesota Lynx',years:'1999 to today',era:'North Star blue and action green',colors:['#236192','#0c2340','#78be20'],photo:lockerHeadshot('202632'),legend:'Maya Moore',story:'Minnesota shifted from brighter founding blues to a deeper navy and green system that matches the modern Lynx mark and dynasty era.'},
  {slug:'seattle-storm',team:'Seattle Storm',years:'2000 to today',era:'Green, gold and electric weather',colors:['#2c5234','#fee11a','#ffffff'],photo:lockerHeadshot('100682'),legend:'Lauren Jackson',story:'The Storm kept green and gold at the center, then modernized the mark with a Space Needle lightning bolt and high voltage yellow.'},
  {slug:'indiana-fever',team:'Indiana Fever',years:'2000 to today',era:'Navy, red and Indiana gold',colors:['#002d62','#e03a3e','#fdbb30'],photo:lockerHeadshot('100646'),legend:'Tamika Catchings',story:'Indiana has consistently used navy and red while gold details connect the Fever to the state’s deep basketball tradition.'},
  {slug:'chicago-sky',team:'Chicago Sky',years:'2006 to today',era:'Skyline blue to city flag energy',colors:['#69b3e7','#f9e547','#111111'],photo:lockerHeadshot('201496'),legend:'Candace Parker',story:'Chicago’s original sky blue remains, now paired with vivid yellow, black and visual cues drawn from the Chicago flag and skyline.'},
  {slug:'atlanta-dream',team:'Atlanta Dream',years:'2008 to today',era:'From sky blue to power red',colors:['#69b3e7','#c8102e','#ffffff'],story:'The Dream began with sky blue and red, then made red the dominant modern note while keeping Atlanta’s star and motion language.'},
  {slug:'washington-mystics',team:'Washington Mystics',years:'1998 to today',era:'Mystical bronze to capital colors',colors:['#5b2c83','#b87333','#002b5c','#e31837'],photo:lockerHeadshot('203826'),legend:'Brittney Sykes',story:'The founding moonlit purple, blue and bronze palette evolved into red, navy and silver linked to Washington’s broader basketball family.'}
];

const IDENTITY_GUIDE = [
  {slug:'atlanta-dream',symbol:'Rising star and motion',meaning:'A fast, upward mark for a city built around ambition.',colors:['#c8102e','#69b3e7','#ffffff']},
  {slug:'chicago-sky',symbol:'Skyline and city flag',meaning:'Blue, yellow and flag geometry make the city part of the uniform.',colors:['#f9e547','#69b3e7','#111111']},
  {slug:'connecticut-sun',symbol:'Sun and Mohegan identity',meaning:'A solar mark rooted in the Mohegan Tribe and the team’s home at Mohegan Sun.',colors:['#f05023','#003da5','#f9e547']},
  {slug:'dallas-wings',symbol:'Winged basketball',meaning:'Flight and forward movement for the franchise’s North Texas chapter.',colors:['#0c2340','#c4d600','#69b3e7']},
  {slug:'golden-state-valkyries',symbol:'Valkyrie wings and Bay geometry',meaning:'Violet, black and wing forms build a new Bay Area basketball identity.',colors:['#6d35a8','#b79be6','#000000']},
  {slug:'indiana-fever',symbol:'Basketball flame',meaning:'Heat, speed and Indiana basketball tradition in one compact mark.',colors:['#002d62','#e03a3e','#fdbb30']},
  {slug:'las-vegas-aces',symbol:'Ace, diamond and star',meaning:'Playing card geometry turns the city’s entertainment language into a championship crest.',colors:['#c8102e','#000000','#a7a8aa']},
  {slug:'los-angeles-sparks',symbol:'Spark and palm energy',meaning:'Purple and gold carry Los Angeles basketball history while the spark suggests star power.',colors:['#552583','#fdb927','#00a2e8']},
  {slug:'minnesota-lynx',symbol:'Lynx eyes and North Star',meaning:'A watchful cat and a northern compass connect team attitude to place.',colors:['#0c2340','#78be20','#236192']},
  {slug:'new-york-liberty',symbol:'Torch and seafoam',meaning:'The Statue of Liberty’s flame and oxidized copper become a distinctly New York badge.',colors:['#6eceb2','#000000','#ffffff']},
  {slug:'phoenix-mercury',symbol:'Planet and basketball orbit',meaning:'A fast orbital mark turns the planet name into motion and desert heat.',colors:['#cb6015','#201747','#f9a01b']},
  {slug:'portland-fire',symbol:'Flame and rose city edge',meaning:'The new Fire identity revives a familiar Portland name while establishing a separate 2026 franchise.',colors:['#d52b1e','#6b3f2a','#f4a7b9']},
  {slug:'seattle-storm',symbol:'Space Needle lightning bolt',meaning:'Seattle’s skyline landmark becomes the center of an electric weather system.',colors:['#2c5234','#fee11a','#ffffff']},
  {slug:'toronto-tempo',symbol:'Rhythm, motion and Canadian color',meaning:'A movement-first identity created for the league’s first Canadian franchise.',colors:['#2477c5','#6e1f3a','#ffffff']},
  {slug:'washington-mystics',symbol:'Monument and basketball',meaning:'Capital city geometry, stars and monuments shape the modern mark.',colors:['#002b5c','#e31837','#c4ced4']},
  {slug:'cleveland-sirens',symbol:'Lake Erie wave and call',meaning:'Two blues, water movement and the Siren’s voice frame Cleveland’s 2028 identity.',colors:['#0d4fa3','#06152c','#66bceb']}
];

const FRANCHISE_CHANGES = [
  {year:'1997',kind:'League launch',title:'Eight original teams open the WNBA',copy:'Charlotte, Cleveland, Houston, Los Angeles, New York, Phoenix, Sacramento and Utah form the opening map.',tone:'#d8ff4f'},
  {year:'1999 → 2003',kind:'Relocation + rebrand',title:'Orlando Miracle become Connecticut Sun',copy:'The Mohegan Tribe purchased the Orlando franchise and moved it to Uncasville for the 2003 season.',slug:'connecticut-sun',tone:'#f05023'},
  {year:'1997 → 2018',kind:'Two relocations',title:'Utah Starzz to San Antonio to Las Vegas Aces',copy:'One continuous franchise moved from Utah to San Antonio in 2003, then to Las Vegas for 2018.',slug:'las-vegas-aces',tone:'#c8102e'},
  {year:'1998 → 2016',kind:'Two relocations',title:'Detroit Shock to Tulsa Shock to Dallas Wings',copy:'Detroit’s three championship banners remain part of the franchise record through Tulsa and into Dallas.',slug:'dallas-wings',tone:'#69b3e7'},
  {year:'2003 to 2009',kind:'Closed chapters',title:'Six franchises leave the active map',copy:'Miami, Portland, Cleveland, Charlotte, Houston and Sacramento each closed. Their history remains, but none became a current team line.',tone:'#8f829b'},
  {year:'2025',kind:'Expansion',title:'Golden State Valkyries join',copy:'The Bay Area opens a new franchise chapter and becomes the league’s 13th team.',slug:'golden-state-valkyries',tone:'#6d35a8'},
  {year:'2026',kind:'Expansion',title:'Toronto Tempo and Portland Fire debut',copy:'Toronto becomes the first WNBA franchise outside the United States. Portland uses a historic market name for a new organization, not a continuation of the 2000 to 2002 club.',slugs:['toronto-tempo','portland-fire'],tone:'#2477c5'},
  {year:'2028 to 2030',kind:'Next expansion wave',title:'Cleveland, Detroit and Philadelphia build new teams',copy:'These are new expansion franchises in returning or new markets. Cleveland begins in 2028, Detroit in 2029 and Philadelphia in 2030.',slug:'cleveland-sirens',tone:'#0d4fa3'}
];

const CONTINUING_BRANCHES = [
  {title:'The Aces line',slug:'las-vegas-aces',championships:'Titles travel with the franchise',stops:[['1997 to 2002','Utah Starzz'],['2003 to 2013','San Antonio Silver Stars'],['2014 to 2017','San Antonio Stars'],['2018 to today','Las Vegas Aces']]},
  {title:'The Wings line',slug:'dallas-wings',championships:'Detroit’s three titles remain in this record book',stops:[['1998 to 2009','Detroit Shock'],['2010 to 2015','Tulsa Shock'],['2016 to today','Dallas Wings']]},
  {title:'The Sun line',slug:'connecticut-sun',championships:'One franchise, two markets',stops:[['1999 to 2002','Orlando Miracle'],['2003 to today','Connecticut Sun']]}
];

const ROOTED_BRANCHES = [
  ['1997 originals still home','Los Angeles Sparks · New York Liberty · Phoenix Mercury',['los-angeles-sparks','new-york-liberty','phoenix-mercury']],
  ['1998 expansion still home','Washington Mystics',['washington-mystics']],
  ['1999 expansion still home','Minnesota Lynx',['minnesota-lynx']],
  ['2000 expansion still home','Indiana Fever · Seattle Storm',['indiana-fever','seattle-storm']],
  ['2006 expansion still home','Chicago Sky',['chicago-sky']],
  ['2008 expansion still home','Atlanta Dream',['atlanta-dream']],
  ['2025 expansion','Golden State Valkyries',['golden-state-valkyries']],
  ['2026 expansion','Portland Fire · Toronto Tempo',['portland-fire','toronto-tempo']]
];

const CLOSED_BRANCHES = [
  {years:'1997 to 2003',team:'Cleveland Rockers',note:'Cleveland returns with a separate expansion franchise in 2028.',route:'/team.html?team=cleveland-sirens',routeLabel:'Meet the Cleveland Sirens'},
  {years:'1997 to 2008',team:'Houston Comets',note:'The league’s first dynasty won four straight championships.',photo:lockerHeadshot('100073')},
  {years:'1997 to 2009',team:'Sacramento Monarchs',note:'The 2005 champions remain one of the most beloved closed chapters.',photo:lockerHeadshot('100419')},
  {years:'1997 to 2006',team:'Charlotte Sting',note:'An original franchise and 2001 Finals participant.'},
  {years:'2000 to 2002',team:'Miami Sol',note:'A three-season South Florida chapter.'},
  {years:'2000 to 2002',team:'Portland Fire, original club',note:'The 2026 Portland Fire is a new franchise using the historic name.',route:'/team.html?team=portland-fire',routeLabel:'Meet today’s Portland Fire'}
];

const LOCKER_SOURCES = [
  ['WNBA expansion to 18 teams','https://www.wnba.com/news/wnba-expansion-cleveland-detroit-philadelphia'],
  ['Las Vegas Aces franchise history','https://aces.wnba.com/franchisehistory'],
  ['Dallas Wings franchise draft history','https://www.wnba.com/wnba-draft-history-dallas-wings'],
  ['Connecticut Sun early years','https://sun.wnba.com/the-early-years'],
  ['WNBA history hub','https://www.wnba.com/history']
];
