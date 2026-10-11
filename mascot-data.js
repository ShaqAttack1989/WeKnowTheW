const MASCOT_UPDATED='Aug 23, 2026';

const MASCOT_TEAMS={
  'atlanta-dream':{team:'Atlanta Dream',primary:'#C8102E',secondary:'#69B3E7'},
  'chicago-sky':{team:'Chicago Sky',primary:'#F9E547',secondary:'#69B3E7'},
  'connecticut-sun':{team:'Connecticut Sun',primary:'#F05023',secondary:'#003DA5'},
  'dallas-wings':{team:'Dallas Wings',primary:'#0C2340',secondary:'#C4D600'},
  'golden-state-valkyries':{team:'Golden State Valkyries',primary:'#6D35A8',secondary:'#B79BE6'},
  'indiana-fever':{team:'Indiana Fever',primary:'#002D62',secondary:'#E03A3E'},
  'las-vegas-aces':{team:'Las Vegas Aces',primary:'#C8102E',secondary:'#000000'},
  'los-angeles-sparks':{team:'Los Angeles Sparks',primary:'#552583',secondary:'#FDB927'},
  'minnesota-lynx':{team:'Minnesota Lynx',primary:'#0C2340',secondary:'#78BE20'},
  'new-york-liberty':{team:'New York Liberty',primary:'#6ECEB2',secondary:'#000000'},
  'phoenix-mercury':{team:'Phoenix Mercury',primary:'#CB6015',secondary:'#201747'},
  'portland-fire':{team:'Portland Fire',primary:'#D52B1E',secondary:'#F4A7B9'},
  'seattle-storm':{team:'Seattle Storm',primary:'#2C5234',secondary:'#FEE11A'},
  'toronto-tempo':{team:'Toronto Tempo',primary:'#2477C5',secondary:'#6E1F3A'},
  'washington-mystics':{team:'Washington Mystics',primary:'#002B5C',secondary:'#E31837'}
};

const CURRENT_MASCOTS=[
  {
    id:'skye-lioness',slug:'chicago-sky',name:'Skye',displayName:'Skye the Lioness',species:'Lioness',debut:'2024',number:'#00',pronouns:'she/her',
    bio:'Chicago introduced Skye in August 2024 as a lioness inspired by the bronze lions outside the Art Institute of Chicago. Her character is built around resilience, feminine strength, protection of the pride, Chicago footwork and the city’s unmistakable hustle.',
    facts:['Alter ego: Queen of the Jungle','Favorite dance: Chicago Footwork','Tagline: Born to Roar, Built to Rise','Sky Guy stayed through the end of 2024 to help welcome her'],
    source:'https://sky.wnba.com/book-with-skye',sourceLabel:'Chicago Sky · About Skye',
    image:'https://media.licdn.com/dms/image/sync/v2/D5627AQGt7K3xDR6dtw/articleshare-shrink_1280_800/B56Zk_fjNaJoAY-/0/1757706860702?e=2147483647&t=BMfyYz3vD3bVaqc4OzLcMuJjsYFjMCAjPQNjxEIhNHs&v=beta',imageCredit:'Skye the Lioness · Chicago Sky imagery'
  },
  {
    id:'blaze',slug:'connecticut-sun',name:'Blaze',displayName:'Blaze',species:'Sun-inspired fuzzy mascot',debut:'2004',number:'#1 legacy look',pronouns:'',
    bio:'Blaze is the Connecticut Sun’s bright orange, high-energy mascot. The color and character are designed to evoke the heat and glow of the Sun while connecting the team to its Mohegan Sun home. Blaze celebrated a 20th birthday in 2024.',
    facts:['Bright orange fur evokes a scorching sun','Longtime Mohegan Sun Arena crowd favorite','Community ambassador and frequent youth-event guest','2026 is part of Connecticut’s Sunset Season'],
    source:'https://sun.wnba.com/blaze-2',sourceLabel:'Connecticut Sun · Meet Blaze',
    image:'https://cdn.wnba.com/sites/1611661323/2025/11/blaze-signing-fan-shirt.jpg',imageCredit:'Connecticut Sun'
  },
  {
    id:'lightning-horse',slug:'dallas-wings',name:'Lightning',displayName:'Lightning the Horse',species:'Pegasus / winged horse',debut:'2017',number:'',pronouns:'she/her',
    bio:'Lightning is Dallas’ winged horse mascot, a direct nod to the Pegasus imagery that has been part of the Dallas skyline since the 1930s. She was introduced in 2017 and brings the Wings identity to life as a flying-horse diva on game night.',
    facts:['A Pegasus, the mythological winged horse','Introduced in 2017','Dallas’ neon Pegasus history inspired the team identity','The Wings celebrate Lightning’s birthday as a theme night'],
    source:'https://wings.wnba.com/fan-zone',sourceLabel:'Dallas Wings · Fan Zone',
    image:'https://dmn-dallas-news-prod.cdn.arcpublishing.com/resizer/v2/NA3IP5SUCZBXTBRVZWYXYEBKJU.jpg?auth=2b83aa35c92b5d00542d0e63f227980f4a52357786d1da87319143b5c17efe30&height=1878&quality=80',imageCredit:'Dallas Morning News'
  },
  {
    id:'violet-raven',slug:'golden-state-valkyries',name:'Violet',displayName:'Violet the Raven',species:'Raven',debut:'Aug. 11, 2025',number:'',pronouns:'she/her',
    bio:'Violet, or Vi, is the Golden State Valkyries’ raven and captain of The Flock. The raven connects to Valkyrie lore, while Violet’s personality leans clever, playful and a little shiny-object obsessed. Her sports glasses are part fashion, part function.',
    facts:['Nickname: Vi','Captain of The Flock','Collects shiny things','Sports glasses help her near-sighted vision','Signature pose: the V'],
    source:'https://valkyries.com/entertainment-teams/violet/',sourceLabel:'Golden State Valkyries · Violet',
    image:'https://cdn.wnba.com/sites/1611661331/2025/09/204_08112025_Sun_Valkyries_Graham_1769.jpg',imageCredit:'Golden State Valkyries'
  },
  {
    id:'freddy-fever',slug:'indiana-fever',name:'Freddy Fever',displayName:'Freddy Fever',species:'Red furry creature of mysterious origin',debut:'2000',number:'',pronouns:'',
    bio:'Freddy Fever has been part of Indiana’s game-night identity since the franchise’s first season. The red, fuzzy character with blue eyes and yellow spikes has never settled on an official species, which has become part of the joke and the charm.',
    facts:['Around since the Fever’s inaugural 2000 season','Species intentionally remains a mystery','Known for high-energy dancing and stunts','A fixture at community events across Indiana'],
    source:'https://sports.yahoo.com/caitlin-clark-puts-freddy-fever-084058549.html',sourceLabel:'Yahoo Sports · Freddy Fever profile'
  },
  {
    id:'buckets-rabbit',slug:'las-vegas-aces',name:'BUCKET$',displayName:'BUCKET$ the Rabbit',species:'Black-tailed jackrabbit',debut:'2018',number:'#18',pronouns:'he/him',
    bio:'BUCKET$ is a black-tailed jackrabbit native to the Mojave Desert with lore that traces through Utah and Texas before landing in Las Vegas in 2018. The Aces adopted the rabbit as a good-luck symbol, and the name fit a basketball team in Las Vegas perfectly.',
    facts:['Nicknames include Hare Jordan and Hare Raiser','WNBA Mascot of the Year in 2022','Arrived with the Aces’ Las Vegas era in 2018','Known for bikes, T-shirt cannons and arena chaos'],
    source:'https://aces.wnba.com/buckets',sourceLabel:'Las Vegas Aces · BUCKET$',
    image:'',imageCredit:'Las Vegas Aces'
  },
  {
    id:'sparky-dog',slug:'los-angeles-sparks',name:'Sparky',displayName:'Sparky the Dog',species:'Dog',debut:'Legacy mascot',number:'#0',pronouns:'',
    bio:'Sparky is the Los Angeles Sparks’ purple-and-gold dog and one of the league’s old-school game-night fixtures. The character has appeared at Sparks games, literacy events and community programs for years.',
    facts:['Purple-and-gold Sparks look','Longtime community and literacy-event presence','Classic WNBA-era mascot design','Still active with the Sparks in 2026'],
    source:'https://sparks.wnba.com/game-entertainment',sourceLabel:'Los Angeles Sparks · Game Entertainment',
    image:'https://thespun.com/.image/c_fill%2Cw_1200%2Ch_1200%2Cg_faces%3Acenter/MjE2NjgwMjU0NTExNTIzMzQ3/los-angeles-sparks-mascot-sparky.jpg',imageCredit:'The Spun / game photo'
  },
  {
    id:'prowl-lynx',slug:'minnesota-lynx',name:'Prowl',displayName:'Prowl the Lynx',species:'Lynx / big cat',debut:'1999',number:'#99',pronouns:'',
    bio:'Prowl has been partying with Minnesota Lynx fans since 1999. The official bio leans fully into cat logic: yarn balls, tuna noodle hotdish and plenty of postgame dancing, with championship memories layered into the character’s history.',
    facts:['Debut: 1999','From: Up North','Jersey: #99','Favorite activity: chasing yarn balls and firing up fans','Championship memories: 2011, 2013, 2015 and 2017'],
    source:'https://go.lynxbasketball.com/entertainment/prowl',sourceLabel:'Minnesota Lynx · Prowl',
    image:'https://cdn-ilecccn.nitrocdn.com/RanGABiTadbcbUtojmhXDdudFjKCdOMD/assets/images/optimized/rev-53c2c1b/www.worldsbestcatlitter.com/wp-content/uploads/2019/12/03_professional_minnesota-lynx.jpg',imageCredit:'Prowl game photo'
  },
  {
    id:'ellie-elephant',slug:'new-york-liberty',name:'Ellie',displayName:'Ellie the Elephant',species:'Elephant',debut:'2021',number:'#00',pronouns:'she/her',
    bio:'Ellie became the Liberty’s official mascot when the franchise made Brooklyn home in 2021. Her elephant identity nods to the famous Brooklyn Bridge elephant crossing, while her name references Ellis Island. The crown, braid, fashion and dance vocabulary turned her into a culture star far beyond game night.',
    facts:['Named for Ellis Island','Brooklyn Bridge elephant history inspired the character','Signature move: the Ellie Stomp','Known for custom fashion, braids and viral dance performances','Replaced Maddie when the Liberty moved into their Brooklyn era'],
    source:'https://liberty.wnba.com/ellie-the-elephant',sourceLabel:'New York Liberty · Ellie the Elephant',
    image:'https://media.them.us/photos/6633c4d6ef66672c7325c0f0/master/pass/ellie.jpg',imageCredit:'Ellie game photo'
  },
  {
    id:'scorch',slug:'phoenix-mercury',name:'Scorch',displayName:'Scorch',species:'Extraterrestrial from planet Mercury',debut:'June 9, 2002',number:'#97',pronouns:'',
    bio:'Scorch is officially an extraterrestrial visitor from the planet Mercury. The origin story says Scorch followed an unusual energy signal to Phoenix in 2002 and discovered the source was the Mighty Mercury chant from the X-Factor fanbase.',
    facts:['Birthplace: Planet Mercury','Earth landing: June 9, 2002','Favorite song: Intergalactic','Favorite food: hot dogs','The purple, flame-accented look is intentionally otherworldly'],
    source:'https://mercury.wnba.com/scorch',sourceLabel:'Phoenix Mercury · Scorch',
    image:'https://images2.minutemediacdn.com/image/upload/c_crop%2Cw_5108%2Ch_2873%2Cx_0%2Cy_95/c_fill%2Cw_1200%2Car_4%3A3%2Cf_auto%2Cq_auto%2Cg_auto/images/ImagnImages/mmsport/phoenix_mercury_on_si/01kcwp9cvq9wn5t450sc.jpg',imageCredit:'Scorch game photo'
  },
  {
    id:'doppler',slug:'seattle-storm',name:'Doppler',displayName:'Doppler',species:'Storm creature',debut:'Legacy mascot',number:'',pronouns:'',
    bio:'Doppler is Seattle’s red-furred weather-system personality, named for Doppler radar and built to match the Storm identity. The character remains one of the league’s longest-running and most instantly recognizable arena oddballs.',
    facts:['Named for Doppler radar','Red fur and weather-themed identity','Long-running Seattle game-night fixture','Known for stunts, dance breaks and mascot gatherings'],
    source:'https://storm.wnba.com/',sourceLabel:'Seattle Storm',image:'',imageCredit:'Existing site photo retained'
  },
  {
    id:'dez-turtle',slug:'toronto-tempo',name:'Dez',displayName:'Dez the Snapping Turtle',species:'Borealis Blue Snapping Turtle',debut:'Aug. 18, 2026',number:'',pronouns:'she/they',
    bio:'Dez is a Borealis Blue Snapping Turtle from Muskoka, Ontario. Her name nods to decibels and a love of music. Dez is the steadier half of Toronto’s mascot duo: calm, clever, strategic and always listening for the right beat.',
    facts:['Pronouns: she/they','From Muskoka, Ontario','Taurus','Spins the 1s and 2s','Secret talent: snapping','Favorite food: soft shell tacos'],
    source:'https://tempo.wnba.com/news/meet-the-official-tempo-mascots-dez-and-dot',sourceLabel:'Toronto Tempo · Dez and Dot',image:'',imageCredit:'Existing site photo retained'
  },
  {
    id:'dot-hare',slug:'toronto-tempo',name:'Dot',displayName:'Dot the Arctic Hare',species:'Arctic Hare',debut:'Aug. 18, 2026',number:'',pronouns:'she/her',
    bio:'Dot is an Arctic Hare whose name plays on Toronto’s T-Dot nickname. She is the high-speed half of the Tempo duo, built around acrobatics, enthusiasm and crowd energy. Toronto pairs her with Dez as a modern tortoise-and-hare story about knowing when to change pace.',
    facts:['Pronouns: she/her','Originally from the Arctic Circle','Gemini','Hobbies: hops and hype','Favorite snack: cotton candy','The fast half of Toronto’s steady-and-swift duo'],
    source:'https://tempo.wnba.com/news/meet-the-official-tempo-mascots-dez-and-dot',sourceLabel:'Toronto Tempo · Dez and Dot',image:'',imageCredit:'Existing site photo retained'
  },
  {
    id:'pax-panda',slug:'washington-mystics',name:'Pax',displayName:'Pax the Panda',species:'Giant panda',debut:'2006',number:'#00',pronouns:'',
    bio:'Pax the Panda joined the Mystics in 2006 through a collaboration with the Smithsonian’s National Zoo. The black-and-white character has become a long-running D.C. game-night and community presence.',
    facts:['Introduced in 2006','Created with the Smithsonian National Zoo','Jersey: #00','A D.C. community and game-night regular','Name evokes peace'],
    source:'https://mystics.wnba.com/news/dont-miss-these-5-must-see-mystics-august-home-games',sourceLabel:'Washington Mystics · Pax celebration',
    image:'https://cdn.wnba.com/sites/1611661322/2025/03/MYS25-Paxs-Birthday-1.jpg',imageCredit:'Washington Mystics'
  }
];

const RETIRED_MASCOTS=[
  {
    id:'star-atlanta',slug:'atlanta-dream',name:'Star',displayName:'Star the Bird',species:'Gray bird mascot',years:'2008–2020',
    bio:'Star was the Atlanta Dream’s original bird mascot and was retired in 2020. Atlanta has played without an official replacement since then, making Star an important piece of the Dream’s early game-night identity.',
    source:'https://www.axios.com/local/atlanta/2025/09/16/atlanta-dream-seeks-mascot-ideas-from-fans',sourceLabel:'Axios Atlanta · Star retirement'
  },
  {
    id:'maddie-liberty',slug:'new-york-liberty',name:'Maddie',displayName:'Maddie the Golden Retriever',species:'Golden retriever',years:'1997–2020',
    bio:'Maddie served as the Liberty mascot through the Madison Square Garden era and was named after the arena itself. When the Liberty moved into their Brooklyn chapter, Maddie passed the torch to Ellie the Elephant in 2021.',
    source:'https://www.espn.com/wnba/story/_/id/45480415/wnba-new-york-liberty-ellie-liberty-new-york-city-barclays',sourceLabel:'ESPN · Maddie to Ellie'
  },
  {
    id:'sky-guy',slug:'chicago-sky',name:'Sky Guy',displayName:'Sky Guy the Rocketeer',species:'Rocketeer character',years:'2006–2024',
    bio:'Sky Guy was Chicago’s original mascot from the franchise’s 2006 debut. When Skye the Lioness arrived in August 2024, Sky Guy stayed through the end of that season to help welcome the new mascot before moving into the legacy column.',
    source:'https://sports.yahoo.com/skye-lioness-named-mascot-chicago-173035846.html',sourceLabel:'Yahoo Sports · Skye replaces Sky Guy'
  }
];

const MASCOT_VACANCIES=[
  {slug:'atlanta-dream',team:'Atlanta Dream',status:'No current mascot',note:'Star retired in 2020. Atlanta has not announced a replacement as of Aug. 23, 2026.'},
  {slug:'portland-fire',team:'Portland Fire',status:'No official mascot announced',note:'Portland’s 2026 debut-season entertainment program is active, but the team has not published an official mascot announcement as of Aug. 23, 2026.'}
];

const MASCOT_BY_SLUG=Object.fromEntries(Object.keys(MASCOT_TEAMS).map(slug=>[slug,CURRENT_MASCOTS.filter(item=>item.slug===slug)]));
