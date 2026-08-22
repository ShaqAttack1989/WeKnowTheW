// Official 2026 WNBA team roster snapshot, refreshed 2026-08-22.
// Sources are each club's public WNBA roster page; runtime providers still supply live details and movement updates.
const OFFICIAL_ROSTER_SNAPSHOT = [
  {
    "wnbaId": "1631044",
    "name": "Naz Hillmon",
    "team": "Atlanta Dream",
    "number": "00",
    "position": "Forward",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642804",
    "name": "Te-Hina Paopao",
    "team": "Atlanta Dream",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1628886",
    "name": "Jordin Canada",
    "team": "Atlanta Dream",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642320",
    "name": "Jaylyn Sherrod",
    "team": "Atlanta Dream",
    "number": "4",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642291",
    "name": "Angel Reese",
    "team": "Atlanta Dream",
    "number": "5",
    "position": "Forward",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1631009",
    "name": "Rhyne Howard",
    "team": "Atlanta Dream",
    "number": "10",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1643431",
    "name": "Madina Okot",
    "team": "Atlanta Dream",
    "number": "11",
    "position": "Center",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1628277",
    "name": "Allisha Gray",
    "team": "Atlanta Dream",
    "number": "15",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642302",
    "name": "Isobel Borlase",
    "team": "Atlanta Dream",
    "number": "20",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1643469",
    "name": "Indya Nivar",
    "team": "Atlanta Dream",
    "number": "21",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1631021",
    "name": "Sika Kone",
    "team": "Atlanta Dream",
    "number": "23",
    "position": "Forward",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642801",
    "name": "Aaliyah Nye",
    "team": "Atlanta Dream",
    "number": "32",
    "position": "Guard-Forward",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1628278",
    "name": "Shatori Walker-Kimbrough",
    "team": "Atlanta Dream",
    "number": "33",
    "position": "Guard",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1628280",
    "name": "Brionna Jones",
    "team": "Atlanta Dream",
    "number": "42",
    "position": "Forward",
    "sourceUrl": "https://dream.wnba.com/roster"
  },
  {
    "wnbaId": "1642292",
    "name": "Jacy Sheldon",
    "team": "Chicago Sky",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "204322",
    "name": "Elizabeth Williams",
    "team": "Chicago Sky",
    "number": "1",
    "position": "Center-Forward",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "203400",
    "name": "Skylar Diggins",
    "team": "Chicago Sky",
    "number": "4",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1630096",
    "name": "DiJonai Carrington",
    "team": "Chicago Sky",
    "number": "7",
    "position": "Guard-Forward",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "204333",
    "name": "Natasha Cloud",
    "team": "Chicago Sky",
    "number": "9",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1642289",
    "name": "Kamilla Cardoso",
    "team": "Chicago Sky",
    "number": "10",
    "position": "Center",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1643447",
    "name": "Gabriela Jaquez",
    "team": "Chicago Sky",
    "number": "11",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1642321",
    "name": "Sydney Taylor",
    "team": "Chicago Sky",
    "number": "12",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1642835",
    "name": "Morgan Maly",
    "team": "Chicago Sky",
    "number": "15",
    "position": "Forward",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "202664",
    "name": "Courtney Vandersloot",
    "team": "Chicago Sky",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1627671",
    "name": "Rachel Banham",
    "team": "Chicago Sky",
    "number": "24",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1628922",
    "name": "Azura Stevens",
    "team": "Chicago Sky",
    "number": "30",
    "position": "Forward-Center",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1642786",
    "name": "Aicha Coulibaly",
    "team": "Chicago Sky",
    "number": "35",
    "position": "Guard",
    "sourceUrl": "https://sky.wnba.com/roster"
  },
  {
    "wnbaId": "1641649",
    "name": "Diamond Miller",
    "team": "Connecticut Sun",
    "number": "1",
    "position": "Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1642817",
    "name": "Hailey Van Lith",
    "team": "Connecticut Sun",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1643437",
    "name": "Ashlon Jackson",
    "team": "Connecticut Sun",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1643449",
    "name": "Charlisse Leger-Walker",
    "team": "Connecticut Sun",
    "number": "4",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1643429",
    "name": "Gianna Kneepkens",
    "team": "Connecticut Sun",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1642290",
    "name": "Aaliyah Edwards",
    "team": "Connecticut Sun",
    "number": "8",
    "position": "Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1631135",
    "name": "Olivia Nelson-Ododa",
    "team": "Connecticut Sun",
    "number": "10",
    "position": "Center",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1642796",
    "name": "Rayah Marshall",
    "team": "Connecticut Sun",
    "number": "13",
    "position": "Center-Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1643441",
    "name": "Raegan Beers",
    "team": "Connecticut Sun",
    "number": "15",
    "position": "Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1642809",
    "name": "Saniya Rivers",
    "team": "Connecticut Sun",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1629568",
    "name": "Kennedy Burke",
    "team": "Connecticut Sun",
    "number": "25",
    "position": "Guard-Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1643448",
    "name": "Nell Angloma",
    "team": "Connecticut Sun",
    "number": "33",
    "position": "Forward",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "203398",
    "name": "Brittney Griner",
    "team": "Connecticut Sun",
    "number": "42",
    "position": "Center",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1642303",
    "name": "Leila Lacan",
    "team": "Connecticut Sun",
    "number": "47",
    "position": "Guard",
    "sourceUrl": "https://sun.wnba.com/roster"
  },
  {
    "wnbaId": "1628909",
    "name": "Kelsey Mitchell",
    "team": "Indiana Fever",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1642803",
    "name": "Michelle Onyiah",
    "team": "Indiana Fever",
    "number": "1",
    "position": "Forward-Center",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1628899",
    "name": "Myisha Hines-Allen",
    "team": "Indiana Fever",
    "number": "2",
    "position": "Forward",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1643433",
    "name": "Raven Johnson",
    "team": "Indiana Fever",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1628920",
    "name": "Mercedes Russell",
    "team": "Indiana Fever",
    "number": "5",
    "position": "Center",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1641648",
    "name": "Aliyah Boston",
    "team": "Indiana Fever",
    "number": "7",
    "position": "Center-Forward",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1629482",
    "name": "Sophie Cunningham",
    "team": "Indiana Fever",
    "number": "8",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1631086",
    "name": "Lexie Hull",
    "team": "Indiana Fever",
    "number": "10",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1643453",
    "name": "Grace VanSlooten",
    "team": "Indiana Fever",
    "number": "14",
    "position": "Forward",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1642815",
    "name": "Makayla Timpson",
    "team": "Indiana Fever",
    "number": "21",
    "position": "Forward-Center",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1642286",
    "name": "Caitlin Clark",
    "team": "Indiana Fever",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1642788",
    "name": "Bree Hall",
    "team": "Indiana Fever",
    "number": "23",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1628881",
    "name": "Monique Billings",
    "team": "Indiana Fever",
    "number": "25",
    "position": "Forward",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1630112",
    "name": "Tyasha Harris",
    "team": "Indiana Fever",
    "number": "52",
    "position": "Guard",
    "sourceUrl": "https://fever.wnba.com/roster"
  },
  {
    "wnbaId": "1630149",
    "name": "Satou Sabally",
    "team": "New York Liberty",
    "number": "0",
    "position": "Forward",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1630469",
    "name": "Marine Fauthoux",
    "team": "New York Liberty",
    "number": "4",
    "position": "Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1641663",
    "name": "Elizabeth Balogun",
    "team": "New York Liberty",
    "number": "5",
    "position": "Forward",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "203822",
    "name": "Rebekah Gardner",
    "team": "New York Liberty",
    "number": "7",
    "position": "Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "204296",
    "name": "Rebecca Allen",
    "team": "New York Liberty",
    "number": "9",
    "position": "Forward-Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1630142",
    "name": "Leonie Fiebich",
    "team": "New York Liberty",
    "number": "13",
    "position": "Forward",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1630384",
    "name": "Raquel Carrera",
    "team": "New York Liberty",
    "number": "14",
    "position": "Center",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1631136",
    "name": "Pauline Astier",
    "team": "New York Liberty",
    "number": "18",
    "position": "Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1629477",
    "name": "Sabrina Ionescu",
    "team": "New York Liberty",
    "number": "20",
    "position": "Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1629566",
    "name": "Han Xu",
    "team": "New York Liberty",
    "number": "21",
    "position": "Center",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1629546",
    "name": "Marine Johannes",
    "team": "New York Liberty",
    "number": "23",
    "position": "Guard",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1630993",
    "name": "Anneli Maley",
    "team": "New York Liberty",
    "number": "24",
    "position": "Forward",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1627668",
    "name": "Breanna Stewart",
    "team": "New York Liberty",
    "number": "30",
    "position": "Forward",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1627673",
    "name": "Jonquel Jones",
    "team": "New York Liberty",
    "number": "35",
    "position": "Center",
    "sourceUrl": "https://liberty.wnba.com/roster"
  },
  {
    "wnbaId": "1642791",
    "name": "Zaay Green",
    "team": "Toronto Tempo",
    "number": "00",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1643445",
    "name": "Kiki Rice",
    "team": "Toronto Tempo",
    "number": "1",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1643420",
    "name": "Laura Juskaite",
    "team": "Toronto Tempo",
    "number": "2",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1629497",
    "name": "Marina Mabrey",
    "team": "Toronto Tempo",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1643457",
    "name": "Teonni Key",
    "team": "Toronto Tempo",
    "number": "7",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1631055",
    "name": "Nyara Sabally",
    "team": "Toronto Tempo",
    "number": "8",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1629576",
    "name": "Maria Conde",
    "team": "Toronto Tempo",
    "number": "10",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1628915",
    "name": "Kia Nurse",
    "team": "Toronto Tempo",
    "number": "11",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1627701",
    "name": "Temi Fagbenle",
    "team": "Toronto Tempo",
    "number": "14",
    "position": "Center",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1628279",
    "name": "Brittney Sykes",
    "team": "Toronto Tempo",
    "number": "20",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "204330",
    "name": "Isabelle Harrison",
    "team": "Toronto Tempo",
    "number": "21",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1627700",
    "name": "Julie Allemand",
    "team": "Toronto Tempo",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1642800",
    "name": "Aneesah Morrow",
    "team": "Toronto Tempo",
    "number": "24",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1643706",
    "name": "Ornella Bankole",
    "team": "Toronto Tempo",
    "number": "33",
    "position": "Forward",
    "sourceUrl": "https://tempo.wnba.com/roster"
  },
  {
    "wnbaId": "1631022",
    "name": "Shakira Austin",
    "team": "Washington Mystics",
    "number": "0",
    "position": "Center",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643644",
    "name": "Alicia Florez",
    "team": "Washington Mystics",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643450",
    "name": "Rori Harmon",
    "team": "Washington Mystics",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643440",
    "name": "Darianna Littlepage-Buggs",
    "team": "Washington Mystics",
    "number": "5",
    "position": "Guard-Forward",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1642781",
    "name": "Georgia Amoore",
    "team": "Washington Mystics",
    "number": "8",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1630446",
    "name": "Michaela Onyenwere",
    "team": "Washington Mystics",
    "number": "12",
    "position": "Forward",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643467",
    "name": "Cassandre Prosper",
    "team": "Washington Mystics",
    "number": "18",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1642785",
    "name": "Sonia Citron",
    "team": "Washington Mystics",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643430",
    "name": "Cotie McMahon",
    "team": "Washington Mystics",
    "number": "23",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643455",
    "name": "Angela Dugalic",
    "team": "Washington Mystics",
    "number": "32",
    "position": "Forward",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1642802",
    "name": "Lucy Olsen",
    "team": "Washington Mystics",
    "number": "33",
    "position": "Guard",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "204335",
    "name": "Betnijah Laney-Hamilton",
    "team": "Washington Mystics",
    "number": "44",
    "position": "Guard-Forward",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1642792",
    "name": "Kiki Iriafen",
    "team": "Washington Mystics",
    "number": "44",
    "position": "Forward",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1643427",
    "name": "Lauren Betts",
    "team": "Washington Mystics",
    "number": "51",
    "position": "Center",
    "sourceUrl": "https://mystics.wnba.com/roster"
  },
  {
    "wnbaId": "1630134",
    "name": "Sug Sutton",
    "team": "Dallas Wings",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "203824",
    "name": "Odyssey Sims",
    "team": "Dallas Wings",
    "number": "1",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1642784",
    "name": "Paige Bueckers",
    "team": "Dallas Wings",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1643424",
    "name": "Costanza Verona",
    "team": "Dallas Wings",
    "number": "6",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "202252",
    "name": "Alysha Clark",
    "team": "Dallas Wings",
    "number": "7",
    "position": "Forward",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1629501",
    "name": "Alanna Smith",
    "team": "Dallas Wings",
    "number": "8",
    "position": "Forward",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1642793",
    "name": "Aziaha James",
    "team": "Dallas Wings",
    "number": "10",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1641652",
    "name": "Maddy Siegrist",
    "team": "Dallas Wings",
    "number": "20",
    "position": "Forward",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1629481",
    "name": "Arike Ogunbowale",
    "team": "Dallas Wings",
    "number": "24",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1629574",
    "name": "Li Yueru",
    "team": "Dallas Wings",
    "number": "28",
    "position": "Center",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1641650",
    "name": "Haley Jones",
    "team": "Dallas Wings",
    "number": "30",
    "position": "Forward-Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1631090",
    "name": "Christyn Williams",
    "team": "Dallas Wings",
    "number": "31",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1629491",
    "name": "Jessica Shepard",
    "team": "Dallas Wings",
    "number": "32",
    "position": "Forward",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1630386",
    "name": "Awak Kuier",
    "team": "Dallas Wings",
    "number": "34",
    "position": "Forward",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1643425",
    "name": "Azzi Fudd",
    "team": "Dallas Wings",
    "number": "35",
    "position": "Guard",
    "sourceUrl": "https://wings.wnba.com/roster"
  },
  {
    "wnbaId": "1628931",
    "name": "Gabby Williams",
    "team": "Golden State Valkyries",
    "number": "1",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1642822",
    "name": "Kaitlyn Chen",
    "team": "Golden State Valkyries",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1641656",
    "name": "Laeticia Amihere",
    "team": "Golden State Valkyries",
    "number": "3",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1642794",
    "name": "Juste Jocyte",
    "team": "Golden State Valkyries",
    "number": "4",
    "position": "Guard-Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "203866",
    "name": "Kayla Thornton",
    "team": "Golden State Valkyries",
    "number": "5",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1630097",
    "name": "Kaila Charles",
    "team": "Golden State Valkyries",
    "number": "6",
    "position": "Guard-Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1631039",
    "name": "Miela Sowah",
    "team": "Golden State Valkyries",
    "number": "7",
    "position": "Guard",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1641695",
    "name": "Ashten Prechtel",
    "team": "Golden State Valkyries",
    "number": "11",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1630387",
    "name": "Iliana Rupert",
    "team": "Golden State Valkyries",
    "number": "12",
    "position": "Center",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1642767",
    "name": "Janelle Salaun",
    "team": "Golden State Valkyries",
    "number": "13",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "203026",
    "name": "Tiffany Hayes",
    "team": "Golden State Valkyries",
    "number": "15",
    "position": "Guard",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1631007",
    "name": "Veronica Burton",
    "team": "Golden State Valkyries",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1628508",
    "name": "Cecilia Zandalasini",
    "team": "Golden State Valkyries",
    "number": "24",
    "position": "Forward",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "204329",
    "name": "Kiah Stokes",
    "team": "Golden State Valkyries",
    "number": "41",
    "position": "Center",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1643686",
    "name": "Nadia Fingall",
    "team": "Golden State Valkyries",
    "number": "45",
    "position": "Center",
    "sourceUrl": "https://valkyries.wnba.com/roster"
  },
  {
    "wnbaId": "1629498",
    "name": "Jackie Young",
    "team": "Las Vegas Aces",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1631006",
    "name": "Kierstan Bell",
    "team": "Las Vegas Aces",
    "number": "1",
    "position": "Forward",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1631019",
    "name": "NaLyssa Smith",
    "team": "Las Vegas Aces",
    "number": "3",
    "position": "Forward",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1643444",
    "name": "Ta'Niya Latson",
    "team": "Las Vegas Aces",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "203855",
    "name": "Stephanie Talbot",
    "team": "Las Vegas Aces",
    "number": "7",
    "position": "Forward",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1630389",
    "name": "Dana Evans",
    "team": "Las Vegas Aces",
    "number": "11",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "203833",
    "name": "Chelsea Gray",
    "team": "Las Vegas Aces",
    "number": "12",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1643495",
    "name": "Justine Pissott",
    "team": "Las Vegas Aces",
    "number": "13",
    "position": "Guard-Forward",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1642769",
    "name": "Mai Yamamoto",
    "team": "Las Vegas Aces",
    "number": "18",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1629488",
    "name": "Brianna Turner",
    "team": "Las Vegas Aces",
    "number": "21",
    "position": "Forward-Center",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1628932",
    "name": "A'ja Wilson",
    "team": "Las Vegas Aces",
    "number": "22",
    "position": "Center",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "204319",
    "name": "Jewell Loyd",
    "team": "Las Vegas Aces",
    "number": "24",
    "position": "Guard",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "204323",
    "name": "Cheyenne Parker-Tyus",
    "team": "Las Vegas Aces",
    "number": "32",
    "position": "Forward",
    "sourceUrl": "https://aces.wnba.com/roster"
  },
  {
    "wnbaId": "1643439",
    "name": "Tonie Morgan",
    "team": "Los Angeles Sparks",
    "number": "",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1642777",
    "name": "Monique Akoa Makani",
    "team": "Los Angeles Sparks",
    "number": "1",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1643462",
    "name": "Chance Gray",
    "team": "Los Angeles Sparks",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "204324",
    "name": "Dearica Hamby",
    "team": "Los Angeles Sparks",
    "number": "5",
    "position": "Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1630148",
    "name": "Jihyun Park",
    "team": "Los Angeles Sparks",
    "number": "6",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1628878",
    "name": "Ariel Atkins",
    "team": "Los Angeles Sparks",
    "number": "7",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1630996",
    "name": "Rae Burrell",
    "team": "Los Angeles Sparks",
    "number": "12",
    "position": "Guard-Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "204365",
    "name": "Erica Wheeler",
    "team": "Los Angeles Sparks",
    "number": "17",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1642324",
    "name": "Kate Martin",
    "team": "Los Angeles Sparks",
    "number": "21",
    "position": "Guard",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1642287",
    "name": "Cameron Brink",
    "team": "Los Angeles Sparks",
    "number": "22",
    "position": "Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "203014",
    "name": "Nneka Ogwumike",
    "team": "Los Angeles Sparks",
    "number": "30",
    "position": "Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1628242",
    "name": "Emma Cannon",
    "team": "Los Angeles Sparks",
    "number": "32",
    "position": "Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1642293",
    "name": "Alissa Pili",
    "team": "Los Angeles Sparks",
    "number": "35",
    "position": "Forward",
    "sourceUrl": "https://sparks.wnba.com/roster"
  },
  {
    "wnbaId": "1643825",
    "name": "Elena Buenavida",
    "team": "Minnesota Lynx",
    "number": "",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "203827",
    "name": "Natasha Howard",
    "team": "Minnesota Lynx",
    "number": "1",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1642820",
    "name": "Liatu King",
    "team": "Minnesota Lynx",
    "number": "2",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1630471",
    "name": "Maya Caldwell",
    "team": "Minnesota Lynx",
    "number": "3",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1643426",
    "name": "Olivia Miles",
    "team": "Minnesota Lynx",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1642797",
    "name": "Anastasiia Olairi Kosu",
    "team": "Minnesota Lynx",
    "number": "7",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1643489",
    "name": "Antonia Delaere",
    "team": "Minnesota Lynx",
    "number": "8",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1627675",
    "name": "Courtney Williams",
    "team": "Minnesota Lynx",
    "number": "10",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1643490",
    "name": "Eliska Joklova",
    "team": "Minnesota Lynx",
    "number": "11",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1628269",
    "name": "Nia Coffey",
    "team": "Minnesota Lynx",
    "number": "12",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1641657",
    "name": "Dorka Juhasz",
    "team": "Minnesota Lynx",
    "number": "14",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "203825",
    "name": "Kayla McBride",
    "team": "Minnesota Lynx",
    "number": "21",
    "position": "Guard",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1629483",
    "name": "Napheesa Collier",
    "team": "Minnesota Lynx",
    "number": "24",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1631064",
    "name": "Chloe Bibby",
    "team": "Minnesota Lynx",
    "number": "55",
    "position": "Forward",
    "sourceUrl": "https://lynx.wnba.com/roster"
  },
  {
    "wnbaId": "1628276",
    "name": "Kelsey Plum",
    "team": "Phoenix Mercury",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1643493",
    "name": "Noemie Brochant",
    "team": "Phoenix Mercury",
    "number": "1",
    "position": "Forward-Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1627674",
    "name": "Kahleah Copper",
    "team": "Phoenix Mercury",
    "number": "2",
    "position": "Guard-Forward",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1630442",
    "name": "Natasha Mack",
    "team": "Phoenix Mercury",
    "number": "4",
    "position": "Forward-Center",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1643470",
    "name": "Shay Ciezki",
    "team": "Phoenix Mercury",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1631118",
    "name": "Lexi Held",
    "team": "Phoenix Mercury",
    "number": "10",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "204468",
    "name": "Valeriane Ayayi",
    "team": "Phoenix Mercury",
    "number": "11",
    "position": "Forward",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1643454",
    "name": "Kara Dunn",
    "team": "Phoenix Mercury",
    "number": "12",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1642818",
    "name": "Maddy Westbeld",
    "team": "Phoenix Mercury",
    "number": "21",
    "position": "Forward",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "201886",
    "name": "DeWanna Bonner",
    "team": "Phoenix Mercury",
    "number": "24",
    "position": "Forward-Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "203826",
    "name": "Alyssa Thomas",
    "team": "Phoenix Mercury",
    "number": "25",
    "position": "Forward",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1643505",
    "name": "Jovana Nogic",
    "team": "Phoenix Mercury",
    "number": "29",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1642768",
    "name": "Kyara Linskens",
    "team": "Phoenix Mercury",
    "number": "31",
    "position": "Center",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1628244",
    "name": "Sami Whitcomb",
    "team": "Phoenix Mercury",
    "number": "33",
    "position": "Guard",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1643438",
    "name": "Marta Suarez",
    "team": "Phoenix Mercury",
    "number": "77",
    "position": "Forward",
    "sourceUrl": "https://mercury.wnba.com/roster"
  },
  {
    "wnbaId": "1642304",
    "name": "Carla Leite",
    "team": "Portland Fire",
    "number": "0",
    "position": "Guard",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1642790",
    "name": "Sania Feagin",
    "team": "Portland Fire",
    "number": "1",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1643527",
    "name": "Jordan Harrison",
    "team": "Portland Fire",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1629524",
    "name": "Bridget Carleton",
    "team": "Portland Fire",
    "number": "6",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1643506",
    "name": "Teja Oblak",
    "team": "Portland Fire",
    "number": "7",
    "position": "Guard",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1629539",
    "name": "Amy Okonkwo",
    "team": "Portland Fire",
    "number": "8",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1642296",
    "name": "Nyadiew Puoch",
    "team": "Portland Fire",
    "number": "13",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1630143",
    "name": "Luisa Geiselsoder",
    "team": "Portland Fire",
    "number": "15",
    "position": "Center",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1629484",
    "name": "Megan DiLeo",
    "team": "Portland Fire",
    "number": "17",
    "position": "Center",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1643494",
    "name": "Frieda Buhner",
    "team": "Portland Fire",
    "number": "20",
    "position": "Forward-Center",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1631083",
    "name": "Emily Engstler",
    "team": "Portland Fire",
    "number": "21",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1643436",
    "name": "Serah Williams",
    "team": "Portland Fire",
    "number": "25",
    "position": "Forward",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1628317",
    "name": "Karlie Samuelson",
    "team": "Portland Fire",
    "number": "44",
    "position": "Guard",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1641683",
    "name": "Holly Winterburn",
    "team": "Portland Fire",
    "number": "77",
    "position": "Guard",
    "sourceUrl": "https://fire.wnba.com/roster"
  },
  {
    "wnbaId": "1629567",
    "name": "Natisha Hiedeman",
    "team": "Seattle Storm",
    "number": "2",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1642814",
    "name": "Taylor Thierry",
    "team": "Seattle Storm",
    "number": "3",
    "position": "Guard-Forward",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1643428",
    "name": "Flau'jae Johnson",
    "team": "Seattle Storm",
    "number": "4",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1631141",
    "name": "Jade Melbourne",
    "team": "Seattle Storm",
    "number": "5",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1641660",
    "name": "Zia Cooke",
    "team": "Seattle Storm",
    "number": "7",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1643443",
    "name": "Awa Fam",
    "team": "Seattle Storm",
    "number": "11",
    "position": "Center",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1629496",
    "name": "Ezi Magbegor",
    "team": "Seattle Storm",
    "number": "13",
    "position": "Forward-Center",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1642798",
    "name": "Dominique Malonga",
    "team": "Seattle Storm",
    "number": "14",
    "position": "Center",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1643473",
    "name": "Taina Mair",
    "team": "Seattle Storm",
    "number": "22",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1641651",
    "name": "Jordan Horston",
    "team": "Seattle Storm",
    "number": "23",
    "position": "Forward",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "203828",
    "name": "Stefanie Dolson",
    "team": "Seattle Storm",
    "number": "31",
    "position": "Center",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1629478",
    "name": "Katie Lou Samuelson",
    "team": "Seattle Storm",
    "number": "33",
    "position": "Guard",
    "sourceUrl": "https://storm.wnba.com/roster"
  },
  {
    "wnbaId": "1642307",
    "name": "Mackenzie Holmes",
    "team": "Seattle Storm",
    "number": "54",
    "position": "Forward",
    "sourceUrl": "https://storm.wnba.com/roster"
  }
];

module.exports = { OFFICIAL_ROSTER_SNAPSHOT };

