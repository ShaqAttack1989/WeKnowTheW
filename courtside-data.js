const COURTSIDE_TEAMS = [
  ['atlanta-dream','Atlanta Dream','#C8102E','#69B3E7'],['chicago-sky','Chicago Sky','#F9E547','#69B3E7'],['connecticut-sun','Connecticut Sun','#F05023','#003DA5'],['dallas-wings','Dallas Wings','#0C2340','#C4D600'],['golden-state-valkyries','Golden State Valkyries','#6D35A8','#B79BE6'],['indiana-fever','Indiana Fever','#002D62','#E03A3E'],['las-vegas-aces','Las Vegas Aces','#C8102E','#000000'],['los-angeles-sparks','Los Angeles Sparks','#552583','#FDB927'],['minnesota-lynx','Minnesota Lynx','#0C2340','#78BE20'],['new-york-liberty','New York Liberty','#6ECEB2','#000000'],['phoenix-mercury','Phoenix Mercury','#CB6015','#201747'],['portland-fire','Portland Fire','#D52B1E','#F4A7B9'],['seattle-storm','Seattle Storm','#2C5234','#FEE11A'],['toronto-tempo','Toronto Tempo','#2477C5','#6E1F3A'],['washington-mystics','Washington Mystics','#002B5C','#E31837']
].map(([slug,name,primary,secondary])=>({slug,name,primary,secondary,href:`/team.html?team=${slug}`}));

const COURTSIDE_COACHES = [
  ['Atlanta Dream','Karl Smesko','Built a modern Atlanta attack after a record-setting college run.','https://dream.wnba.com/news/atlanta-dream-name-karl-smesko-head-coach'],
  ['Chicago Sky','Tyler Marsh','Leads Chicago’s player-development-centered rebuild.','https://sky.wnba.com/news/chicago-sky-name-tyler-marsh-head-coach'],
  ['Connecticut Sun','Rachid Meziane','Brings championship experience from France and Belgium.','https://sun.wnba.com/news/connecticut-sun-name-rachid-meziane-head-coach'],
  ['Dallas Wings','José Fernández','Guides Dallas after a long, successful college tenure.','https://wings.wnba.com/news/jose-fernandez-named-head-coach'],
  ['Golden State Valkyries','Natalie Nakase','The 2025 Coach of the Year established Ballhalla’s identity.','https://valkyries.wnba.com/news/natalie-nakase-named-2025-wnba-coach-of-the-year'],
  ['Indiana Fever','Stephanie White','A former Fever player and championship assistant now leading the bench.','https://fever.wnba.com/news/indiana-fever-hire-stephanie-white-as-head-coach'],
  ['Las Vegas Aces','Becky Hammon','The Hall of Fame guard became a three-time championship head coach.','https://aces.wnba.com/head-coach-becky-hammon'],
  ['Los Angeles Sparks','Lynne Roberts','Pairs pace, spacing and player development in Los Angeles.','https://sparks.wnba.com/news/los-angeles-sparks-name-lynne-roberts-head-coach'],
  ['Minnesota Lynx','Cheryl Reeve','The architect of Minnesota’s four-title dynasty.','https://lynx.wnba.com/news/minnesota-lynx-head-coach-cheryl-reeve-named-2026-wnba-all-star-coach'],
  ['New York Liberty','Chris DeMarco','A four-time NBA champion leading New York’s next chapter.','https://liberty.wnba.com/news/new-york-liberty-name-chris-demarco-head-coach'],
  ['Phoenix Mercury','Nate Tibbetts','Leads a fast, detail-heavy Mercury system.','https://mercury.wnba.com/news/phoenix-mercury-name-nate-tibbetts-head-coach'],
  ['Portland Fire','Alex Sarama','The inaugural Fire head coach is building Portland’s playing identity.','https://fire.wnba.com/news/portland-fire-name-alex-sarama-head-coach'],
  ['Seattle Storm','Sonia Raman','Leads Seattle with a collaborative, development-forward approach.','https://storm.wnba.com/news/seattle-storm-names-sonia-raman-head-coach'],
  ['Toronto Tempo','Sandy Brondello','The former WNBA guard and champion coach leads Toronto’s first season.','https://tempo.wnba.com/news/toronto-tempo-names-sandy-brondello-head-coach'],
  ['Washington Mystics','Sydney Johnson','Guides Washington’s young core and next competitive cycle.','https://mystics.wnba.com/news/washington-mystics-name-sydney-johnson-head-coach']
].map(([team,name,summary,source])=>({team,name,summary,source}));

const COURT_TO_CLIPBOARD = [
  ['Becky Hammon','Las Vegas Aces · Head coach','16 WNBA seasons → championship head coach','https://aces.wnba.com/head-coach-becky-hammon'],
  ['Stephanie White','Indiana Fever · Head coach','WNBA player → Fever championship assistant → head coach','https://fever.wnba.com/news/indiana-fever-hire-stephanie-white-as-head-coach'],
  ['Sandy Brondello','Toronto Tempo · Head coach','WNBA guard → WNBA champion head coach','https://tempo.wnba.com/news/toronto-tempo-names-sandy-brondello-head-coach'],
  ['Natalie Achonwa','Seattle Storm · Assistant coach','Nine WNBA seasons → player development and coaching','https://storm.wnba.com/news/seattle-storm-finalizes-2026-coaching-staff'],
  ['Courtney Paris','New York Liberty · Assistant coach','WNBA center → college and pro coaching','https://liberty.wnba.com/news/new-york-liberty-announce-2026-coaching-staff-hires'],
  ['Ebony Hoffman','Los Angeles Sparks · Assistant coach','Eleven WNBA seasons → assistant coach','https://sparks.wnba.com/news/la-sparks-finalize-coaching-staff-for-2026-season'],
  ['Sylvia Fowles','Portland Fire · Assistant coach','MVP and champion center → Portland’s inaugural staff','https://fire.wnba.com/'],
  ['Sugar Rodgers','Golden State Valkyries · Assistant coach','WNBA guard → championship bench and development work','https://valkyries.wnba.com/']
].map(([name,role,path,source])=>({name,role,path,source}));

const COURTSIDE_OWNERS = [
  ['Atlanta Dream','Larry Gottesdiener, Renee Montgomery & Suzanne Abair','Player-informed leadership has been central to the franchise since 2021.'],
  ['Chicago Sky','Michael Alter','The founding ownership era continues in Chicago.'],
  ['Connecticut Sun','Mohegan Tribe / Mohegan Sun','The first independently owned WNBA franchise and the first professional sports team owned by a Native American tribe.'],
  ['Dallas Wings','Bill Cameron and the Wings ownership group','North Texas investment now spans the team, front office and future arena plans.'],
  ['Golden State Valkyries','Joe Lacob and Peter Guber','The Warriors ownership group launched the Valkyries in 2025.'],
  ['Indiana Fever','Herb Simon','Pacers Sports & Entertainment connects Indiana’s women’s and men’s basketball operations.'],
  ['Las Vegas Aces','Mark Davis','The Las Vegas era has paired major investment with championships.'],
  ['Los Angeles Sparks','Sparks LA Sports ownership group','A broad investor group supports one of the league’s original franchises.'],
  ['Minnesota Lynx','Marc Lore & Alex Rodriguez','The new controlling owners lead the Lynx, with Rodriguez serving as WNBA governor.'],
  ['New York Liberty','Joe Tsai & Clara Wu Tsai','Brooklyn investment helped create the 2024 championship era.'],
  ['Phoenix Mercury','Mat Ishbia','The Suns and Mercury owner has invested in facilities, players and fan experience.'],
  ['Portland Fire','Lisa Bhathal Merage & Alex Bhathal / RAJ Sports','The sibling-led group launched Portland’s new franchise and women-centered performance center.'],
  ['Seattle Storm','Force 10 Hoops','Ginny Gilder, Dawn Trudeau and Lisa Brummel lead an independent women-owned group.'],
  ['Toronto Tempo','Larry Tanenbaum / Kilmer Sports Ventures','Canada’s first WNBA franchise is part of the Kilmer sports portfolio.'],
  ['Washington Mystics','Ted Leonsis / Monumental Sports & Entertainment','The Mystics sit inside Washington’s multi-team sports organization.']
].map(([team,name,summary])=>({team,name,summary}));

const COURTSIDE_MASCOTS = [
  ['Atlanta Dream','Star','Legacy mascot','The Dream’s original gray bird remains part of franchise memory; Atlanta has not announced a current replacement.','https://dream.wnba.com/news/star-on-tour'],
  ['Chicago Sky','Skye the Lioness','#00','Inspired by the Art Institute of Chicago’s lions and introduced in 2024.','https://sky.wnba.com/news/chicago-sky-introduce-new-mascot-skye-the-lioness'],
  ['Connecticut Sun','Blaze','Sun energy','A longtime Mohegan Sun Arena favorite and community ambassador.','https://sun.wnba.com/news/connecticut-sun-announce-2026-sunset-season-theme-nights'],
  ['Dallas Wings','Lightning','Winged horse','The Wings’ high-energy game-night personality.','https://wings.wnba.com/'],
  ['Golden State Valkyries','Violet','The raven','“Vi” captains The Flock at Ballhalla in custom violet and gold.','https://valkyries.com/entertainment-teams/violet/'],
  ['Indiana Fever','Freddy Fever','#00','A red, furry fixture of Indiana basketball and youth events.','https://fever.wnba.com/'],
  ['Las Vegas Aces','Buckets','The rabbit','A fast-moving Las Vegas showman built for the Strip.','https://aces.wnba.com/'],
  ['Los Angeles Sparks','Sparky','The dog','A purple-and-gold crowd leader with classic L.A. energy.','https://sparks.wnba.com/'],
  ['Minnesota Lynx','Prowl','The lynx','A founding piece of the Target Center game-night experience.','https://lynx.wnba.com/'],
  ['New York Liberty','Ellie the Elephant','#00','Brooklyn’s fashion-forward, viral dancing icon.','https://liberty.wnba.com/ellie-the-elephant'],
  ['Phoenix Mercury','Scorch','The sun creature','Brings heat, comedy and acrobatics to Footprint Center.','https://mercury.wnba.com/'],
  ['Portland Fire','Mascot reveal','2026 watch','Portland is introducing a new game-night character during its debut season.','https://fire.wnba.com/'],
  ['Seattle Storm','Doppler','Weather system','A red-furred storm front and one of the league’s longest-running mascots.','https://storm.wnba.com/'],
  ['Toronto Tempo','Dez & Dot','Debuted 2026','A music-loving snapping turtle and a stylish Arctic fox bring two personalities to Toronto.','https://tempo.wnba.com/news/meet-the-official-tempo-mascots-dez-and-dot'],
  ['Washington Mystics','Pax','The panda','A D.C. favorite named for peace and built around community appearances.','https://mystics.wnba.com/']
].map(([team,name,label,summary,source])=>({team,name,label,summary,source}));

const COURTSIDE_FANS = [
  ['Queen Latifah','New York Liberty','A longtime New York presence whose courtside appearances connect hip-hop, film and Liberty basketball.','https://www.gettyimages.com/photos/queen-latifah-new-york-liberty'],
  ['Wanda Sykes','Los Angeles Sparks','The comedian and actor has been a recognizable Sparks supporter from courtside.','https://www.gettyimages.com/photos/wanda-sykes-los-angeles-sparks'],
  ['Spike Lee','New York Liberty','The filmmaker’s Brooklyn courtside energy has become part of the Liberty’s big-game atmosphere.','https://www.gettyimages.com/photos/spike-lee-new-york-liberty'],
  ['Jason Sudeikis','New York Liberty','A frequent Barclays Center supporter during the Liberty’s championship-era rise.','https://www.gettyimages.com/photos/jason-sudeikis-new-york-liberty'],
  ['Leslie Jones','New York Liberty','The comedian brings loud, unmistakable support to New York games.','https://www.gettyimages.com/photos/leslie-jones-new-york-liberty'],
  ['Chance the Rapper','Chicago Sky','A hometown fan whose appearances connect the Sky to Chicago music culture.','https://www.gettyimages.com/photos/chance-the-rapper-chicago-sky']
].map(([name,team,summary,source])=>({name,team,summary,source}));

const GAMEDAY_VIBES = [
  ['Atlanta Dream','College Park pulse','Gateway Center puts Dream fans close to the floor, with Atlanta music and a bright red-and-blue identity.'],
  ['New York Liberty','Ellie’s Brooklyn runway','Barclays Center turns mascot choreography, seafoam fashion and celebrity rows into a full show.'],
  ['Golden State Valkyries','Ballhalla','Violet light, “The Flock” and a packed Chase Center make the newest West Coast home feel mythic.'],
  ['Indiana Fever','Basketball state volume','Gainbridge Fieldhouse brings Indiana’s basketball culture into every introduction and late-game possession.'],
  ['Las Vegas Aces','Strip-level production','Championship banners meet music, celebrity energy and a compact, loud Michelob ULTRA Arena.'],
  ['Seattle Storm','Storm warning','Doppler, weather graphics and an experienced crowd give Climate Pledge Arena a distinct rhythm.'],
  ['Connecticut Sun','A destination home court','Mohegan Sun Arena blends resort energy, tribal ownership and one of the league’s most intimate settings.'],
  ['Chicago Sky','South Loop energy','Wintrust Arena ties Skye the Lioness, Chicago music and city pride into game night.'],
  ['Dallas Wings','North Texas flight','College Park Center combines a close crowd, Lightning and a new-generation Wings roster.'],
  ['Los Angeles Sparks','Hollywood lights','Downtown L.A. mixes an original-franchise legacy, celebrity rows and purple-and-gold presentation.'],
  ['Minnesota Lynx','Dynasty standard','Target Center banners, Prowl and a knowledgeable crowd make every big possession feel historic.'],
  ['Phoenix Mercury','Desert heat','Scorch, orange light and one of the league’s longest-running fan bases bring Footprint Center to life.'],
  ['Portland Fire','Rose City ignition','The debut season mixes revived Fire history, Moda Center scale and Portland’s deep women’s-sports culture.'],
  ['Toronto Tempo','Canada’s first WNBA party','Dez, Dot, music and a new national fan base give the Tempo an atmosphere all their own.'],
  ['Washington Mystics','District basketball','CareFirst Arena creates a compact, defense-minded home floor rooted in D.C. basketball culture.']
].map(([team,title,summary])=>({team,title,summary}));
