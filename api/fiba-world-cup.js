const EVENT_BASE = 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026';
const SOURCE_URLS = {
  event: EVENT_BASE,
  games: `${EVENT_BASE}/games`,
  standings: `${EVENT_BASE}/standings`,
  stats: `${EVENT_BASE}/stats`,
  usa: `${EVENT_BASE}/teams/usa`,
  roster: `${EVENT_BASE}/news/roster-tracker-fiba-womens-basketball-world-cup-2026`,
  usaBasketball: 'https://www.usab.com/news/2026/08/2026-usa-basketball-womens-national-team-announced',
  rosterUpdate: 'https://www.foxsports.com/articles/wnba/us-stars-aja-wilson-and-kelsey-plum-to-miss-the-fiba-womens-world-cup'
};

const FIBA_GDAP_USA_TEAM_ID = 284651;
const FIBA_GDAP_COMPETITION_ID = 208875;

function gameCenterUrl(day) {
  if (day === 8 || day === 9) return `${EVENT_BASE}/news/2026-wwc-game-center-sep-8-9`;
  return `${EVENT_BASE}/news/2026-wwc-game-center-sep-${day}`;
}

function berlinTournamentDay() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  if (values.year !== '2026' || values.month !== '09') return null;
  const day = Number(values.day);
  return day >= 4 && day <= 13 ? day : null;
}

function completedGameCenterDays() {
  const day = berlinTournamentDay();
  if (!day) return [];
  return Array.from({ length: day - 3 }, (_, index) => index + 4);
}

function completedGameCenterUrls() {
  return [...new Set(completedGameCenterDays().map(day => gameCenterUrl(day)))];
}

const COUNTRY = {
  JPN: ['Japan', '🇯🇵'], MLI: ['Mali', '🇲🇱'], AUS: ['Australia', '🇦🇺'], PUR: ['Puerto Rico', '🇵🇷'],
  USA: ['United States', '🇺🇸'], CHN: ['China', '🇨🇳'], KOR: ['Korea', '🇰🇷'], NGR: ['Nigeria', '🇳🇬'],
  BEL: ['Belgium', '🇧🇪'], TUR: ['Türkiye', '🇹🇷'], ESP: ['Spain', '🇪🇸'], GER: ['Germany', '🇩🇪'],
  CZE: ['Czechia', '🇨🇿'], ITA: ['Italy', '🇮🇹'], HUN: ['Hungary', '🇭🇺'], FRA: ['France', '🇫🇷']
};

const GROUPS = {
  A: ['JPN', 'ESP', 'GER', 'MLI'],
  B: ['HUN', 'KOR', 'NGR', 'FRA'],
  C: ['BEL', 'AUS', 'PUR', 'TUR'],
  D: ['USA', 'CZE', 'ITA', 'CHN']
};

const MAIN_STAT_CATEGORIES = [
  { key: 'efficiency', marker: 'Efficiency', label: 'Efficiency', unit: 'EFF' },
  { key: 'points', marker: 'Points', label: 'Points', unit: 'PPG' },
  { key: 'rebounds', marker: 'Rebounds', label: 'Rebounds', unit: 'RPG' },
  { key: 'assists', marker: 'Assists', label: 'Assists', unit: 'APG' },
  { key: 'steals', marker: 'Steals', label: 'Steals', unit: 'SPG' },
  { key: 'blocks', marker: 'Blocks', label: 'Blocks', unit: 'BPG' }
];

const USA_ROSTER = [
  'Aliyah Boston', 'Paige Bueckers', 'Caitlin Clark', 'Napheesa Collier', 'Kahleah Copper', 'Chelsea Gray',
  'Rhyne Howard', 'Kiki Iriafen', 'Angel Reese', 'Breanna Stewart', 'Sonia Citron', 'Jackie Young'
];

const USA_ROSTER_UPDATE = {
  announced: '2026-08-31',
  status: 'USA Basketball roster update',
  reason: 'Health reasons',
  out: [
    { player: "A'ja Wilson", detail: 'Rest and recovery after a heavy WNBA workload ahead of the playoffs.' },
    { player: 'Kelsey Plum', detail: 'Calf injury has not fully healed.' }
  ],
  in: [
    { player: 'Kiki Iriafen', team: 'Washington Mystics', detail: 'Played for USA in the 2026 World Cup qualifying tournament in San Juan.' },
    { player: 'Sonia Citron', team: 'Washington Mystics', detail: 'Added for Berlin after participating in USA Basketball camps; senior national-team debut.' }
  ]
};

const GROUP_GAMES = [
  ['2026-09-04','11:30','A','JPN','MLI'], ['2026-09-04','11:30','C','AUS','PUR'],
  ['2026-09-04','14:15','D','USA','CHN'], ['2026-09-04','14:30','B','KOR','NGR'],
  ['2026-09-04','17:30','C','BEL','TUR'], ['2026-09-04','17:45','A','ESP','GER'],
  ['2026-09-04','20:15','D','CZE','ITA'], ['2026-09-04','21:00','B','HUN','FRA'],
  ['2026-09-05','11:30','A','MLI','ESP'], ['2026-09-05','14:15','B','NGR','HUN'],
  ['2026-09-05','18:00','A','GER','JPN'], ['2026-09-05','20:45','B','FRA','KOR'],
  ['2026-09-06','11:30','C','TUR','AUS'], ['2026-09-06','14:30','D','CHN','CZE'],
  ['2026-09-06','17:45','C','PUR','BEL'], ['2026-09-06','20:45','D','ITA','USA'],
  ['2026-09-07','11:30','C','BEL','AUS'], ['2026-09-07','11:30','C','PUR','TUR'],
  ['2026-09-07','14:30','B','HUN','KOR'], ['2026-09-07','14:30','B','NGR','FRA'],
  ['2026-09-07','17:50','A','JPN','ESP'], ['2026-09-07','17:50','A','GER','MLI'],
  ['2026-09-07','20:45','D','USA','CZE'], ['2026-09-07','20:45','D','ITA','CHN']
];

const FIBA_GROUP_GAME_IDS = {
  'JPN-MLI': 128116, 'ESP-GER': 128117, 'MLI-ESP': 128119, 'GER-JPN': 128118, 'JPN-ESP': 128120, 'GER-MLI': 128121,
  'HUN-FRA': 128122, 'KOR-NGR': 128123, 'NGR-HUN': 128124, 'FRA-KOR': 128125, 'HUN-KOR': 128126, 'NGR-FRA': 128127,
  'BEL-TUR': 128128, 'AUS-PUR': 128129, 'PUR-BEL': 128130, 'TUR-AUS': 128131, 'BEL-AUS': 128132, 'PUR-TUR': 128133,
  'USA-CHN': 128134, 'CZE-ITA': 128135, 'ITA-USA': 128136, 'CHN-CZE': 128137, 'USA-CZE': 128138, 'ITA-CHN': 128139
};

const VERIFIED_GROUP_RESULTS = {
  'JPN-MLI': [102,97], 'AUS-PUR': [70,54], 'USA-CHN': [94,61], 'KOR-NGR': [99,81],
  'BEL-TUR': [89,75], 'ESP-GER': [83,53], 'CZE-ITA': [54,63], 'HUN-FRA': [53,99],
  'MLI-ESP': [82,73], 'NGR-HUN': [67,71], 'GER-JPN': [74,58], 'FRA-KOR': [95,69],
  'TUR-AUS': [71,87], 'CHN-CZE': [74,70], 'PUR-BEL': [64,76], 'ITA-USA': [52,55],
  'BEL-AUS': [80,68], 'PUR-TUR': [75,71], 'HUN-KOR': [82,73], 'NGR-FRA': [56,111],
  'JPN-ESP': [59,79], 'GER-MLI': [83,58], 'USA-CZE': [105,64], 'ITA-CHN': [51,71]
};

const VERIFIED_PLAYER_OF_GAME = {
  'JPN-MLI': {
    player: 'Saki Hayashi',
    line: '27 PTS · 9 3PM',
    countryCode: 'JPN',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128116-JPN-MLI'
  },
  'AUS-PUR': {
    player: 'Steph Talbot',
    line: '19 PTS',
    countryCode: 'AUS',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128129-AUS-PUR'
  },
  'USA-CHN': {
    player: 'Caitlin Clark',
    line: '14 PTS · 11 AST',
    countryCode: 'USA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128134-USA-CHN'
  },
  'KOR-NGR': {
    player: 'Jihyun Park',
    line: '27 PTS',
    countryCode: 'KOR',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128123-KOR-NGR'
  },
  'BEL-TUR': {
    player: 'Emma Meesseman',
    line: '27 PTS',
    countryCode: 'BEL',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128128-BEL-TUR'
  },
  'ESP-GER': {
    player: 'Awa Fam',
    line: '17 PTS',
    countryCode: 'ESP',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128117-ESP-GER'
  },
  'CZE-ITA': {
    player: 'Cecilia Zandalasini',
    line: '19 PTS',
    countryCode: 'ITA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128135-CZE-ITA'
  },
  'HUN-FRA': {
    player: 'Dominique Malonga',
    line: '19 PTS',
    countryCode: 'FRA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128122-HUN-FRA'
  },
  'MLI-ESP': {
    player: 'Sika Koné',
    line: '19 PTS · 10 REB',
    countryCode: 'MLI',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128119-MLI-ESP'
  },
  'NGR-HUN': {
    player: 'Dorka Juhász',
    line: '19 PTS · 16 REB',
    countryCode: 'HUN',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128124-NGR-HUN'
  },
  'GER-JPN': {
    player: 'Frieda Bühner',
    line: '19 PTS',
    countryCode: 'GER',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128118-GER-JPN'
  },
  'FRA-KOR': {
    player: 'Marine Johannès',
    line: '17 PTS',
    countryCode: 'FRA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128125-FRA-KOR'
  },
  'TUR-AUS': {
    player: 'Ezi Magbegor',
    line: '21 PTS',
    countryCode: 'AUS',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128131-TUR-AUS'
  },
  'CHN-CZE': {
    player: 'Xu Han',
    line: '22 PTS · 14 REB',
    countryCode: 'CHN',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128137-CHN-CZE'
  },
  'PUR-BEL': {
    player: 'Julie Allemand',
    line: '11 PTS · 10 REB',
    countryCode: 'BEL',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128130-PUR-BEL'
  },
  'ITA-USA': {
    player: 'Jackie Young',
    line: '10 PTS',
    countryCode: 'USA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/italy-hand-holders-usa-a-major-scare'
  },
  'BEL-AUS': {
    player: 'Emma Meesseman',
    line: '22 PTS · 10 REB',
    countryCode: 'BEL',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128132-BEL-AUS'
  },
  'PUR-TUR': {
    player: 'Trinity San Antonio',
    line: '18 PTS',
    countryCode: 'PUR',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128133-PUR-TUR'
  },
  'HUN-KOR': {
    player: 'Dorka Juhász',
    line: '22 PTS · 11 REB',
    countryCode: 'HUN',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128126-HUN-KOR'
  },
  'NGR-FRA': {
    player: 'Gabby Williams',
    line: '25 PTS',
    countryCode: 'FRA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128127-NGR-FRA'
  },
  'JPN-ESP': {
    player: 'Iyana Martin',
    line: '20 PTS',
    countryCode: 'ESP',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128120-JPN-ESP'
  },
  'GER-MLI': {
    player: 'Luisa Geiselsöder',
    line: '17 PTS',
    countryCode: 'GER',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128121-GER-MLI'
  },
  'USA-CZE': {
    player: 'Breanna Stewart',
    line: '19 PTS',
    countryCode: 'USA',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128138-USA-CZE'
  },
  'ITA-CHN': {
    player: 'Shuyu Yang',
    line: '15 PTS',
    countryCode: 'CHN',
    sourceUrl: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/games/128139-ITA-CHN'
  }
};

const VERIFIED_PLAYER_OF_GAME_BY_ID = {
  128144: {
    player: 'Marie Guelich',
    line: '19 PTS',
    countryCode: 'GER',
    sourceUrl: `${EVENT_BASE}/games/128144-GER-KOR`
  },
  128145: {
    player: 'Reka Lelik',
    line: '23 PTS',
    countryCode: 'HUN',
    sourceUrl: `${EVENT_BASE}/games/128145-HUN-JPN`
  }
};

function verifiedPlayerOfGame(game) {
  const key = `${game.home.code}-${game.away.code}`;
  const item = VERIFIED_PLAYER_OF_GAME_BY_ID[Number(game.fibaGameId)] || VERIFIED_PLAYER_OF_GAME[key];
  if (!item) return null;
  const code = item.countryCode;
  return {
    ...item,
    country: COUNTRY[code]?.[0] || code,
    flag: COUNTRY[code]?.[1] || ''
  };
}

function gameDetailUrl(game) {
  const key = `${game.home.code}-${game.away.code}`;
  const id = Number(game.fibaGameId) || FIBA_GROUP_GAME_IDS[key];
  return id ? `${EVENT_BASE}/games/${id}-${key}` : null;
}

const KNOCKOUT_ROUNDS = [
  { date: '2026-09-08', phase: 'Qualification to Quarter-Finals', games: 2 },
  { date: '2026-09-09', phase: 'Qualification to Quarter-Finals', games: 2 },
  { date: '2026-09-10', phase: 'Quarter-Finals', games: 4 },
  { date: '2026-09-12', phase: 'Semi-Finals', games: 2 },
  { date: '2026-09-13', phase: 'Medal Games', games: 2 }
];

const QUALIFYING_FORM = [
  { player: 'Caitlin Clark', label: '14.6 EFF · 11.6 PPG · 6.4 APG' },
  { player: 'Kahleah Copper', label: '12.8 PPG' },
  { player: 'Kiki Iriafen', label: '5.4 PPG · 4.2 RPG · 80.0 FG%' },
  { player: 'Angel Reese', label: '8.0 RPG' },
  { player: 'Chelsea Gray', label: '4.8 APG · 0.6 BPG' },
  { player: 'Paige Bueckers', label: '1.8 SPG' },
  { player: 'Rhyne Howard', label: '1.6 SPG' }
];

function berlinUtc(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - 2, min)).toISOString();
}

function team(code) {
  const [name, flag] = COUNTRY[code] || [code, ''];
  return { code, name, flag };
}

function baseGames() {
  return GROUP_GAMES.map(([date, time, group, home, away], index) => {
    const key = `${home}-${away}`;
    const fibaGameId = FIBA_GROUP_GAME_IDS[key];
    return {
      id: `group-${index + 1}-${home}-${away}`,
      fibaGameId,
      phase: 'Group Phase',
      group,
      date,
      timeBerlin: time,
      startTimeUtc: berlinUtc(date, time),
      venue: 'Berlin, Germany',
      home: team(home),
      away: team(away),
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
      sourceUrl: `${EVENT_BASE}/games/${fibaGameId}-${key}`
    };
  });
}

function baseStandings() {
  return Object.entries(GROUPS).map(([group, codes]) => ({
    group,
    teams: codes.map((code, index) => ({ ...team(code), rank: index + 1, wins: 0, losses: 0, points: 0 }))
  }));
}

function normalizeName(value = '') {
  return String(value)
    .replace(/[’‘]/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value = '') {
  let decoded = String(value);
  for (let pass = 0; pass < 3; pass += 1) {
    const previous = decoded;
    const next = decoded
      .replace(/&amp;/gi, '&')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&middot;/gi, ' · ')
      .replace(/&ndash;/gi, '–')
      .replace(/&mdash;/gi, '—')
      .replace(/&rsquo;/gi, '’')
      .replace(/&lsquo;/gi, '‘')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x([0-9a-f]+);/gi, (entity, value) => {
        const codePoint = Number.parseInt(value, 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
      })
      .replace(/&#(\d+);/g, (entity, value) => {
        const codePoint = Number.parseInt(value, 10);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
      });
    decoded = next;
    if (next === previous) break;
  }
  return decoded;
}

function htmlToText(html = '') {
  return decodeEntities(String(html))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

function parseEventStatLeaders(text = '') {
  const countryCodes = Object.keys(COUNTRY).join('|');
  const categories = MAIN_STAT_CATEGORIES.map(category => {
    const marker = new RegExp(`\\b${escapeRegExp(category.marker)}\\s+Per game\\b`, 'i').exec(text);
    return { ...category, markerIndex: marker ? marker.index : -1, markerLength: marker ? marker[0].length : 0 };
  });

  const available = categories.filter(category => category.markerIndex >= 0).sort((a, b) => a.markerIndex - b.markerIndex);
  const parsed = MAIN_STAT_CATEGORIES.map(category => {
    const current = available.find(item => item.key === category.key);
    if (!current) return { ...category, leaders: [] };

    const later = available.find(item => item.markerIndex > current.markerIndex);
    const segment = text.slice(current.markerIndex + current.markerLength, later ? later.markerIndex : text.length);
    const nameToken = `(?!(?:${countryCodes})\\b)[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'’.\\-]+`;
    const playerName = `${nameToken}(?:\\s+${nameToken}){1,3}`;
    const playerPattern = new RegExp(
      `(?:\\b(${countryCodes})\\b\\s+(${playerName})|(${playerName})\\s+\\b(${countryCodes})\\b)\\s+(\\d+(?:\\.\\d+)?)`,
      'g'
    );

    const leaders = [];
    let match;
    while ((match = playerPattern.exec(segment)) && leaders.length < 3) {
      const code = match[1] || match[4];
      if (!code || !COUNTRY[code]) continue;
      const player = normalizeName(match[2] || match[3]);
      if (!player || /^(View All|Per Game)$/i.test(player)) continue;
      leaders.push({
        rank: leaders.length + 1,
        player,
        countryCode: code,
        country: COUNTRY[code][0],
        flag: COUNTRY[code][1],
        value: Number(match[5])
      });
    }
    return { ...category, leaders };
  });

  return {
    categories: parsed,
    complete: parsed.every(category => category.leaders.length >= 3),
    populated: parsed.filter(category => category.leaders.length > 0).length
  };
}

function resultStreak(results = []) {
  if (!results.length) return '—';
  const last = results[results.length - 1];
  let count = 0;
  for (let index = results.length - 1; index >= 0 && results[index] === last; index -= 1) count += 1;
  return `${last}${count}`;
}

function tournamentEliminations(standings = [], games = []) {
  const eliminated = new Map();
  const completedGroupGames = new Map(Object.keys(GROUPS).map(group => [group, 0]));

  for (const game of games || []) {
    if (game.status === 'final' && game.group && completedGroupGames.has(game.group)) {
      completedGroupGames.set(game.group, completedGroupGames.get(game.group) + 1);
    }
  }

  for (const group of standings || []) {
    if ((completedGroupGames.get(group.group) || 0) < 6) continue;
    for (const item of group.teams || []) {
      if (Number(item.rank) !== 4) continue;
      eliminated.set(item.code, {
        stage: 'Group Phase',
        label: 'Eliminated in group play'
      });
    }
  }

  const eliminationRounds = new Set(['QQF', 'QF']);
  for (const game of games || []) {
    if (game.status !== 'final') continue;
    if (!eliminationRounds.has(String(game.roundCode || '').toUpperCase()) &&
        !['Qualification to Quarter-Finals', 'Quarter-Finals'].includes(game.phase)) continue;

    const homeScore = Number(game.homeScore);
    const awayScore = Number(game.awayScore);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore === awayScore) continue;
    const loser = homeScore < awayScore ? game.home?.code : game.away?.code;
    if (!loser || !COUNTRY[loser]) continue;
    eliminated.set(loser, {
      stage: game.phase || 'Knockout Round',
      label: `Eliminated in ${game.phase || 'the knockout round'}`,
      gameId: Number(game.fibaGameId) || null
    });
  }

  return eliminated;
}

function buildTournamentTable(standings = [], games = []) {
  const official = new Map();
  standings.forEach(group => (group.teams || []).forEach(item => {
    official.set(item.code, {
      group: group.group,
      groupPosition: Number(item.rank) || null,
      groupWins: Number(item.wins) || 0,
      groupLosses: Number(item.losses) || 0,
      groupPoints: Number(item.points) || 0
    });
  }));

  const rows = new Map();
  for (const [group, codes] of Object.entries(GROUPS)) {
    codes.forEach(code => {
      const [name, flag] = COUNTRY[code];
      rows.set(code, {
        code, name, flag, group,
        wins: 0, losses: 0, gamesPlayed: 0,
        pointsFor: 0, pointsAgainst: 0,
        results: [], opponents: [],
        groupPointsFor: 0, groupPointsAgainst: 0,
        groupResults: []
      });
    });
  }

  const apply = (item, scored, allowed, result, opponent, isGroup) => {
    item.gamesPlayed += 1;
    item.pointsFor += scored;
    item.pointsAgainst += allowed;
    item.results.push(result);
    item.opponents.push(opponent);
    if (result === 'W') item.wins += 1;
    else item.losses += 1;
    if (isGroup) {
      item.groupPointsFor += scored;
      item.groupPointsAgainst += allowed;
      item.groupResults.push(result);
    }
  };

  for (const game of games || []) {
    if (game.status !== 'final') continue;
    const homeCode = game.home?.code;
    const awayCode = game.away?.code;
    const home = rows.get(homeCode);
    const away = rows.get(awayCode);
    const homeScore = Number(game.homeScore);
    const awayScore = Number(game.awayScore);
    if (!home || !away || !Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore === awayScore) continue;
    const homeWon = homeScore > awayScore;
    apply(home, homeScore, awayScore, homeWon ? 'W' : 'L', awayCode, Boolean(game.group));
    apply(away, awayScore, homeScore, homeWon ? 'L' : 'W', homeCode, Boolean(game.group));
  }

  const raw = [...rows.values()].map(item => {
    const record = item.gamesPlayed ? item.wins / item.gamesPlayed : null;
    const ppg = item.gamesPlayed ? item.pointsFor / item.gamesPlayed : null;
    const oppPpg = item.gamesPlayed ? item.pointsAgainst / item.gamesPlayed : null;
    const diffPerGame = item.gamesPlayed ? (item.pointsFor - item.pointsAgainst) / item.gamesPlayed : null;
    return { ...item, winPercentage: record, ppg, oppPpg, diffPerGame };
  });
  const byCode = new Map(raw.map(item => [item.code, item]));

  const eliminated = tournamentEliminations(standings, games);
  const completed = raw.map(item => {
    const officialRow = official.get(item.code) || {};
    const opponentRates = item.opponents
      .map(code => byCode.get(code)?.winPercentage)
      .filter(value => Number.isFinite(value));
    const strengthOfSchedule = opponentRates.length
      ? opponentRates.reduce((sum, value) => sum + value, 0) / opponentRates.length
      : null;

    let wScore = null;
    if (item.gamesPlayed > 0) {
      const recordScore = item.winPercentage * 100;
      const marginScore = clamp(50 + item.diffPerGame * 2.5);
      const scoringScore = clamp((item.ppg - 50) * 2);
      const scheduleScore = Number.isFinite(strengthOfSchedule) ? strengthOfSchedule * 100 : 50;
      wScore = round1((recordScore * 0.45) + (marginScore * 0.30) + (scoringScore * 0.15) + (scheduleScore * 0.10));
    }

    const groupGames = Number(officialRow.groupWins || 0) + Number(officialRow.groupLosses || 0);
    const groupPct = groupGames ? Number(officialRow.groupWins || 0) / groupGames : null;
    const groupDiffPerGame = item.groupResults.length
      ? (item.groupPointsFor - item.groupPointsAgainst) / item.groupResults.length
      : null;

    const elimination = eliminated.get(item.code) || null;
    return {
      code: item.code,
      name: item.name,
      flag: item.flag,
      group: officialRow.group || item.group,
      groupPosition: officialRow.groupPosition || null,
      groupPoints: officialRow.groupPoints || 0,
      groupWins: officialRow.groupWins || 0,
      groupLosses: officialRow.groupLosses || 0,
      groupWinPercentage: groupPct,
      groupPointsFor: item.groupPointsFor,
      groupPointsAgainst: item.groupPointsAgainst,
      groupDiffPerGame,
      groupStreak: resultStreak(item.groupResults),
      groupForm: item.groupResults.slice(-5).join(' ') || '—',
      gamesPlayed: item.gamesPlayed,
      wins: item.wins,
      losses: item.losses,
      winPercentage: item.winPercentage,
      pointsFor: item.pointsFor,
      pointsAgainst: item.pointsAgainst,
      ppg: item.ppg,
      oppPpg: item.oppPpg,
      diffPerGame: item.diffPerGame,
      strengthOfSchedule,
      streak: resultStreak(item.results),
      form: item.results.slice(-5).join(' ') || '—',
      wScore,
      eliminated: Boolean(elimination),
      eliminationStage: elimination?.stage || null,
      eliminationLabel: elimination?.label || null
    };
  });

  completed.sort((a, b) =>
    ((b.wScore ?? -1) - (a.wScore ?? -1)) ||
    ((b.winPercentage ?? -1) - (a.winPercentage ?? -1)) ||
    ((b.diffPerGame ?? -999) - (a.diffPerGame ?? -999)) ||
    (b.pointsFor - a.pointsFor)
  );
  completed.forEach((item, index) => { item.overallRank = index + 1; });
  return completed;
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA returned ${response.status} for ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseStandings(text, fallback) {
  const standingSlice = text.slice(Math.max(text.lastIndexOf('Standings'), 0));
  let changed = false;
  const parsed = fallback.map(group => ({
    group: group.group,
    teams: group.teams.map(item => {
      const code = item.code;
      const pattern = new RegExp(`\\b${code}\\b(?:\\s+${code})?\\s+(\\d+)\\s*\\/\\s*(\\d+)\\s+(\\d+)`, 'i');
      const match = standingSlice.match(pattern);
      if (!match) return item;
      const wins = Number(match[1]), losses = Number(match[2]), points = Number(match[3]);
      if (wins || losses || points) changed = true;
      return { ...item, wins, losses, points };
    })
  }));

  parsed.forEach(group => {
    const anyPlayed = group.teams.some(item => item.wins || item.losses || item.points);
    if (!anyPlayed) return;
    group.teams.sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (a.losses - b.losses));
    group.teams.forEach((item, index) => { item.rank = index + 1; });
  });
  return { groups: parsed, changed };
}

function applyFinalScores(text, games) {
  let changed = false;
  const updated = games.map(game => {
    const home = game.home.code, away = game.away.code;
    const pattern = new RegExp(`Group Phase\\s*[·•]?\\s*Group\\s+${game.group}\\s+Final\\s+${home}\\s+${home}\\s+(\\d+)\\s+${away}\\s+${away}\\s+(\\d+)`, 'i');
    const match = text.match(pattern);
    if (!match) return game;
    changed = true;
    return { ...game, status: 'final', homeScore: Number(match[1]), awayScore: Number(match[2]) };
  });
  return { games: updated, changed };
}

function applyVerifiedDailyScores(text, games) {
  let changed = false;
  const updated = games.map(game => {
    if (game.status === 'final') return game;
    const home = game.home.code, away = game.away.code;
    const patterns = [
      new RegExp(`Group Phase\\s*[·•]?\\s*Group\\s+${game.group}\\s+Final\\s+${home}\\s+${home}\\s+(\\d{1,3})\\s+${away}\\s+${away}\\s+(\\d{1,3})`, 'i'),
      new RegExp(`\\b${home}\\s+(\\d{1,3})\\s*[-–]\\s*(\\d{1,3})\\s+${away}\\b`, 'i'),
      new RegExp(`\\b${home}\\s+${home}\\s+(\\d{1,3})\\s+${away}\\s+${away}\\s+(\\d{1,3})\\b`, 'i')
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      changed = true;
      return { ...game, status: 'final', homeScore: Number(match[1]), awayScore: Number(match[2]) };
    }
    return game;
  });
  return { games: updated, changed };
}

function mergeFinalScores(base, next) {
  const byId = new Map((base || []).map(game => [game.id, game]));
  for (const game of next || []) {
    const existing = byId.get(game.id);
    if (!existing || game.status === 'final') byId.set(game.id, game);
  }
  return [...byId.values()];
}

function applyVerifiedResultSnapshot(games) {
  let changed = false;
  const updated = (games || []).map(game => {
    if (!game.group) return game;
    const key = `${game.home.code}-${game.away.code}`;
    const result = VERIFIED_GROUP_RESULTS[key];
    if (!result) return game;
    if (game.status !== 'final' || Number(game.homeScore) !== result[0] || Number(game.awayScore) !== result[1]) changed = true;
    const fibaGameId = Number(game.fibaGameId) || FIBA_GROUP_GAME_IDS[key];
    return {
      ...game,
      fibaGameId,
      status: 'final',
      homeScore: result[0],
      awayScore: result[1],
      sourceUrl: `${EVENT_BASE}/games/${fibaGameId}-${key}`
    };
  });

  const knockoutSnapshot = [
    {
      id: 'fiba-128145', fibaGameId: 128145, phase: 'Qualification to Quarter-Finals', roundCode: 'QQF', group: null,
      date: '2026-09-08', timeBerlin: '17:45', startTimeUtc: berlinUtc('2026-09-08', '17:45'), venue: 'Berlin Arena, Berlin, Germany',
      home: team('HUN'), away: team('JPN'), status: 'final', homeScore: 84, awayScore: 63,
      sourceUrl: `${EVENT_BASE}/games/128145-HUN-JPN`
    },
    {
      id: 'fiba-128144', fibaGameId: 128144, phase: 'Qualification to Quarter-Finals', roundCode: 'QQF', group: null,
      date: '2026-09-08', timeBerlin: '20:45', startTimeUtc: berlinUtc('2026-09-08', '20:45'), venue: 'Berlin Arena, Berlin, Germany',
      home: team('GER'), away: team('KOR'), status: 'final', homeScore: 94, awayScore: 56,
      sourceUrl: `${EVENT_BASE}/games/128144-GER-KOR`
    },
    {
      id: 'fiba-128147', fibaGameId: 128147, phase: 'Qualification to Quarter-Finals', roundCode: 'QQF', group: null,
      date: '2026-09-09', timeBerlin: '17:45', startTimeUtc: berlinUtc('2026-09-09', '17:45'), venue: 'Berlin Arena, Berlin, Germany',
      home: team('PUR'), away: team('CHN'), status: 'final', homeScore: 72, awayScore: 75,
      sourceUrl: `${EVENT_BASE}/games/128147-PUR-CHN`
    }
  ];

  knockoutSnapshot.forEach(snapshot => {
    const index = updated.findIndex(game => Number(game.fibaGameId) === snapshot.fibaGameId || (
      game.phase === snapshot.phase && game.home?.code === snapshot.home.code && game.away?.code === snapshot.away.code
    ));
    if (index >= 0) {
      const game = updated[index];
      if (game.status !== 'final' || Number(game.homeScore) !== snapshot.homeScore || Number(game.awayScore) !== snapshot.awayScore) changed = true;
      updated[index] = { ...game, ...snapshot, id: game.id || snapshot.id };
    } else {
      updated.push(snapshot);
      changed = true;
    }
  });

  updated.sort((a, b) => Date.parse(a.startTimeUtc || 0) - Date.parse(b.startTimeUtc || 0));
  return { games: updated, changed };
}

function parseExtraFinalGames(text, knownGames) {
  const known = new Set(knownGames.map(game => `${game.home.code}-${game.away.code}-${game.date}`));
  const extras = [];
  const phasePattern = /(Qualification to Quarter-Finals|Quarter-Finals|Semi-Finals|Third Place Game|Final)\s+(?:Final\s+)?([A-Z]{3})\s+\2\s+(\d+)\s+([A-Z]{3})\s+\4\s+(\d+)/gi;
  let match;
  while ((match = phasePattern.exec(text))) {
    const phase = match[1], home = match[2], away = match[4];
    if (!COUNTRY[home] || !COUNTRY[away]) continue;
    const keyPrefix = `${home}-${away}-`;
    if ([...known].some(key => key.startsWith(keyPrefix))) continue;
    extras.push({
      id: `knockout-${extras.length + 1}-${home}-${away}`,
      phase,
      group: null,
      date: null,
      timeBerlin: null,
      startTimeUtc: null,
      venue: 'Berlin, Germany',
      home: team(home),
      away: team(away),
      status: 'final',
      homeScore: Number(match[3]),
      awayScore: Number(match[5])
    });
  }
  return extras;
}

function parsePlayerOfGame(html, game, sourceUrl) {
  const text = normalizeName(htmlToText(html));
  const marker = new RegExp(`\\|\\s*TCL Player Of The Game\\s*\\|\\s*${game.home.code}\\s+v\\s+${game.away.code}\\b`, 'i');
  const match = marker.exec(text);
  if (!match) return null;

  let segment = text.slice(Math.max(0, match.index - 180), match.index).trim();
  segment = segment.split(/(?:Image|Share|Videos?|Highlights?)\s*/i).pop().trim();

  let countryCode = null;
  let countryFlag = '';
  for (const [code, [, flag]] of Object.entries(COUNTRY)) {
    if (flag && segment.includes(flag)) {
      countryCode = code;
      countryFlag = flag;
      segment = segment.replace(flag, '').trim();
      break;
    }
  }

  const title = segment.match(/([^|]+?)\s*\(([^()]*)\)\s*$/);
  if (!title) return null;
  const player = normalizeName(title[1])
    .replace(/^[^A-Za-zÀ-ÿ]+/, '')
    .replace(/^.*?FIBA Women's Basketball World Cup 2026\s*/i, '')
    .trim();
  const line = normalizeName(title[2]);
  if (!player || player.length > 80) return null;

  if (!countryCode) {
    const winnerCode = Number(game.homeScore) > Number(game.awayScore) ? game.home.code : game.away.code;
    countryCode = winnerCode;
    countryFlag = COUNTRY[winnerCode]?.[1] || '';
  }
  return {
    player,
    line,
    countryCode,
    country: COUNTRY[countryCode]?.[0] || countryCode,
    flag: countryFlag || COUNTRY[countryCode]?.[1] || '',
    sourceUrl
  };
}

async function attachPlayersOfGame(games) {
  const finals = (games || []).filter(game => game.status === 'final' && gameDetailUrl(game));
  if (!finals.length) return games;

  const byId = new Map();
  finals.forEach(game => {
    const verified = verifiedPlayerOfGame(game);
    if (verified) byId.set(game.id, verified);
  });

  const unresolved = finals.filter(game => !byId.has(game.id));
  const results = await Promise.allSettled(unresolved.map(async game => {
    const sourceUrl = gameDetailUrl(game);
    const html = await fetchText(sourceUrl, 6000);
    return { id: game.id, playerOfGame: parsePlayerOfGame(html, game, sourceUrl) };
  }));

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.playerOfGame) byId.set(result.value.id, result.value.playerOfGame);
  });

  return games.map(game => byId.has(game.id) ? { ...game, playerOfGame: byId.get(game.id) } : game);
}

function blankPlayerStats() {
  return USA_ROSTER.map(player => ({
    player, gp: 0, mpg: null, ppg: null, pts: 0, fg: null, fgPct: null, three: null, threePct: null, ft: null, ftPct: null
  }));
}

function parsePlayerStats(text) {
  const rows = blankPlayerStats();
  let found = 0;
  for (const row of rows) {
    const variants = [normalizeName(row.player), normalizeName(row.player).replace("A'ja", 'Aja')];
    let match = null;
    for (const variant of variants) {
      const name = escapeRegExp(variant).replace(/\\'/g, "['’]?");
      const pattern = new RegExp(`${name}\\s*\\(\\s*USA\\s*\\)\\s+(\\d+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+(\\d+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)`, 'i');
      match = text.match(pattern);
      if (match) break;
    }
    if (!match) continue;
    found += 1;
    row.gp = Number(match[1]);
    row.mpg = Number(match[2]);
    row.ppg = Number(match[3]);
    row.pts = Number(match[4]);
    row.fg = match[5].replace(/\s/g, '');
    row.fgPct = Number(match[6]);
    row.three = match[7].replace(/\s/g, '');
    row.threePct = Number(match[8]);
    row.ft = match[9].replace(/\s/g, '');
    row.ftPct = Number(match[10]);
  }
  return { players: rows, found };
}

function publicFibaApiConfig(html = '') {
  const apiUrl = String(html).match(/NEXT_CLIENT_APIM_URL\\":\\"([^\\"]+)/)?.[1];
  const subscriptionKey = String(html).match(/NEXT_CLIENT_APIM_SUBSCRIPTION_KEY\\":\\"([^\\"]+)/)?.[1];
  return apiUrl && subscriptionKey ? { apiUrl, subscriptionKey } : null;
}

async function fetchFibaJson(statsHtml, endpoint, query = {}, timeoutMs = 8000) {
  const config = publicFibaApiConfig(statsHtml);
  if (!config) throw new Error('FIBA public statistics configuration was not available');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
    });
    const suffix = params.size ? `?${params.toString()}` : '';
    const response = await fetch(`${config.apiUrl.replace(/\/$/, '')}/${endpoint}${suffix}`, {
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': config.subscriptionKey
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA ${endpoint} returned ${response.status}`);
    const payload = await response.json();
    return payload?.data || payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchUsaTeamPlayerStats(statsHtml, timeoutMs = 8000) {
  return fetchFibaJson(statsHtml, 'getgdapcompetitionteamstatisticsbyteamid', {
    gdapTeamId: FIBA_GDAP_USA_TEAM_ID
  }, timeoutMs);
}

async function fetchCompetitionGames(statsHtml, timeoutMs = 8000) {
  return fetchFibaJson(statsHtml, 'getgdapgamesbycompetitionid', {
    gdapCompetitionId: FIBA_GDAP_COMPETITION_ID
  }, timeoutMs);
}

function gdapTeam(value, bracketLabel) {
  const code = String(value?.code || '').toUpperCase();
  if (!code) return { code: 'TBD', name: bracketLabel || 'To be determined', flag: '' };
  const known = team(code);
  return {
    ...known,
    name: COUNTRY[code]?.[0] || value?.shortName || value?.officialName || code
  };
}

function gdapUtc(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const parsed = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(raw) ? raw : `${raw}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeCompetitionGame(item, index = 0) {
  const fibaGameId = Number(item?.gameId);
  if (!Number.isFinite(fibaGameId)) return null;

  const round = item?.round || {};
  const group = round.roundCode === 'GP' || round.roundType === 'G'
    ? String(item?.groupPairingCode || '').replace(/^G/i, '') || null
    : null;
  const final = item?.statusCode === 'VALID' || item?.gameResultStatusCode === 'VALID';
  const live = !final && Boolean(item?.isLive);
  const home = gdapTeam(item?.teamA, item?.teamAFrom);
  const away = gdapTeam(item?.teamB, item?.teamBFrom);
  const localDateTime = String(item?.gameDateTime || item?.gameDateTimeUTC || '');
  const date = /^\d{4}-\d{2}-\d{2}/.test(localDateTime) ? localDateTime.slice(0, 10) : null;
  const timeBerlin = /T\d{2}:\d{2}/.test(localDateTime) ? localDateTime.slice(11, 16) : null;
  const detailKey = home.code !== 'TBD' && away.code !== 'TBD' ? `${home.code}-${away.code}` : null;
  const sourceUrl = detailKey ? `${EVENT_BASE}/games/${fibaGameId}-${detailKey}` : SOURCE_URLS.games;
  const score = value => Number.isFinite(Number(value)) ? Number(value) : null;

  return {
    id: `fiba-${fibaGameId || index + 1}`,
    fibaGameId,
    phase: round.roundName || 'Tournament Game',
    roundCode: round.roundCode || null,
    group,
    date,
    timeBerlin,
    startTimeUtc: gdapUtc(item?.gameDateTimeUTC),
    venue: [item?.venueName, item?.hostCity, item?.hostCountry].filter(Boolean).join(', ') || 'Berlin, Germany',
    home,
    away,
    status: final ? 'final' : (live ? 'live' : 'scheduled'),
    homeScore: final || live ? score(item?.teamAScore) : null,
    awayScore: final || live ? score(item?.teamBScore) : null,
    livePeriod: live ? (item?.currentPeriod || null) : null,
    liveClock: live ? (item?.chrono || null) : null,
    sourceUrl,
    teamAFrom: item?.teamAFrom || null,
    teamBFrom: item?.teamBFrom || null
  };
}

function parseCompetitionGames(payload) {
  const source = Array.isArray(payload) ? payload : [];
  return source
    .map(normalizeCompetitionGame)
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = Date.parse(a.startTimeUtc || `${a.date || '9999-12-31'}T23:59:59Z`);
      const bTime = Date.parse(b.startTimeUtc || `${b.date || '9999-12-31'}T23:59:59Z`);
      return aTime - bTime || a.fibaGameId - b.fibaGameId;
    });
}

const FIBA_LEADER_QUERIES = {
  efficiency: { statisticCode: 'EFF', valueKey: 'EFFPG' },
  points: { statisticCode: 'PPG', valueKey: 'PPG' },
  rebounds: { statisticCode: 'RBD', valueKey: 'RPG' },
  assists: { statisticCode: 'AST', valueKey: 'APG' },
  steals: { statisticCode: 'STL', valueKey: 'STLPG' },
  blocks: { statisticCode: 'BLK', valueKey: 'BLKPG' }
};

async function fetchCompetitionStatLeaders(statsHtml, timeoutMs = 8000) {
  const results = await Promise.allSettled(MAIN_STAT_CATEGORIES.map(async category => {
    const query = FIBA_LEADER_QUERIES[category.key];
    const payload = await fetchFibaJson(statsHtml, 'getgdapcompetitionplayerleadersbyid', {
      gdapCompetitionId: FIBA_GDAP_COMPETITION_ID,
      statisticCode: query.statisticCode,
      oris: 'true'
    }, timeoutMs);
    const leaders = (Array.isArray(payload) ? payload : []).slice(0, 3).map(item => {
      const code = String(item?.nationality || '').toUpperCase();
      return {
        player: normalizeName(`${item?.firstName || ''} ${item?.lastName || ''}`),
        countryCode: code,
        country: COUNTRY[code]?.[0] || code,
        flag: COUNTRY[code]?.[1] || '',
        value: numberOrNull(item?.statistics?.[query.valueKey]),
        rank: numberOrNull(item?.rank)
      };
    }).filter(item => item.player && item.value !== null);
    return { ...category, leaders };
  }));

  const categories = MAIN_STAT_CATEGORIES.map((category, index) => {
    const result = results[index];
    return result?.status === 'fulfilled' ? result.value : { ...category, leaders: [] };
  });
  return {
    categories,
    complete: categories.every(category => category.leaders.length >= 3),
    populated: categories.filter(category => category.leaders.length > 0).length
  };
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function statPair(made, attempted) {
  const left = numberOrNull(made);
  const right = numberOrNull(attempted);
  if (left === null || right === null) return null;
  const display = value => Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${display(left)}-${display(right)}`;
}

function parseUsaTeamPlayerStats(payload) {
  const official = Array.isArray(payload?.playerInCompetitionTeamStatistics)
    ? payload.playerInCompetitionTeamStatistics
    : [];
  const byName = new Map(official.map(item => [normalizeName(`${item.firstName || ''} ${item.lastName || ''}`).toLowerCase(), item]));
  let found = 0;

  const players = blankPlayerStats().map(row => {
    const item = byName.get(normalizeName(row.player).toLowerCase());
    if (!item) return row;
    const gp = numberOrNull(item.totalGamesPlayed) || 0;
    if (gp > 0) found += 1;
    const secondsPerGame = numberOrNull(item.playTimeInSecondsPerGame);
    return {
      player: row.player,
      gp,
      mpg: secondsPerGame === null ? null : secondsPerGame / 60,
      ppg: numberOrNull(item.pointsPerGame),
      pts: numberOrNull(item.totalPoints) || 0,
      fg: statPair(item.fieldGoalsMadePerGame, item.fieldGoalsAttemptedPerGame),
      fgPct: numberOrNull(item.fieldGoalsPercentage),
      three: statPair(item.threePointsMadePerGame, item.threePointsAttemptedPerGame),
      threePct: numberOrNull(item.threePointsPercentage),
      ft: statPair(item.freeThrowsMadePerGame, item.freeThrowsAttemptedPerGame),
      ftPct: numberOrNull(item.freeThrowsPercentage)
    };
  });

  return { players, found };
}

function standingsGameCount(standings) {
  return Math.round((standings || []).reduce((sum, group) => sum + (group.teams || []).reduce((teamSum, item) => teamSum + (Number(item.wins) || 0) + (Number(item.losses) || 0), 0), 0) / 2);
}

function deriveStandingsFromFinalGames(fallback, games) {
  const byGroup = new Map((fallback || []).map(group => [group.group, {
    group: group.group,
    teams: group.teams.map(item => ({ ...item, wins: 0, losses: 0, points: 0, pointsFor: 0, pointsAgainst: 0 }))
  }]));

  for (const game of games || []) {
    if (!game.group || game.status !== 'final' || !Number.isFinite(Number(game.homeScore)) || !Number.isFinite(Number(game.awayScore))) continue;
    const group = byGroup.get(game.group);
    if (!group) continue;
    const home = group.teams.find(item => item.code === game.home.code);
    const away = group.teams.find(item => item.code === game.away.code);
    if (!home || !away) continue;

    const homeScore = Number(game.homeScore);
    const awayScore = Number(game.awayScore);
    home.pointsFor += homeScore;
    home.pointsAgainst += awayScore;
    away.pointsFor += awayScore;
    away.pointsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.wins += 1; home.points += 2;
      away.losses += 1; away.points += 1;
    } else {
      away.wins += 1; away.points += 2;
      home.losses += 1; home.points += 1;
    }
  }

  const groups = [...byGroup.values()];
  groups.forEach(group => {
    const groupFinals = (games || []).filter(game => game.group === group.group && game.status === 'final');
    const tiedRecord = codes => {
      const codeSet = new Set(codes);
      const mini = new Map(codes.map(code => [code, { points: 0, diff: 0, pointsFor: 0 }]));
      groupFinals.forEach(game => {
        const homeCode = game.home?.code;
        const awayCode = game.away?.code;
        if (!codeSet.has(homeCode) || !codeSet.has(awayCode)) return;
        const homeScore = Number(game.homeScore);
        const awayScore = Number(game.awayScore);
        const home = mini.get(homeCode);
        const away = mini.get(awayCode);
        home.points += homeScore > awayScore ? 2 : 1;
        away.points += awayScore > homeScore ? 2 : 1;
        home.diff += homeScore - awayScore;
        away.diff += awayScore - homeScore;
        home.pointsFor += homeScore;
        away.pointsFor += awayScore;
      });
      return mini;
    };

    const byPoints = new Map();
    group.teams.forEach(item => {
      if (!byPoints.has(item.points)) byPoints.set(item.points, []);
      byPoints.get(item.points).push(item);
    });
    const ordered = [...byPoints.keys()].sort((a, b) => b - a).flatMap(points => {
      const tied = byPoints.get(points);
      if (tied.length === 1) return tied;
      const mini = tiedRecord(tied.map(item => item.code));
      return tied.sort((a, b) =>
        ((mini.get(b.code)?.points || 0) - (mini.get(a.code)?.points || 0)) ||
        ((mini.get(b.code)?.diff || 0) - (mini.get(a.code)?.diff || 0)) ||
        ((mini.get(b.code)?.pointsFor || 0) - (mini.get(a.code)?.pointsFor || 0)) ||
        ((b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst)) ||
        (b.pointsFor - a.pointsFor)
      );
    });
    group.teams = ordered;
    group.teams.forEach((item, index) => { item.rank = index + 1; });
  });
  return groups;
}

function usaSummary(standings) {
  const groupD = standings.find(group => group.group === 'D');
  const usa = groupD?.teams.find(item => item.code === 'USA');
  return {
    worldRank: 1,
    worldTitles: 11,
    group: 'D',
    wins: usa?.wins || 0,
    losses: usa?.losses || 0,
    groupRank: usa?.rank || 1
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fallbackStandings = baseStandings();
  const fallbackGames = baseGames();
  let standings = fallbackStandings;
  let games = fallbackGames;
  let playerStats = blankPlayerStats();
  let liveStandings = false;
  let liveResults = false;
  let livePlayerStats = false;
  let statLeaders = MAIN_STAT_CATEGORIES.map(category => ({ ...category, leaders: [] }));
  let liveLeagueLeaders = false;
  let standingsSource = 'fallback';
  let gamesSource = 'fallback';
  let leagueLeadersSource = 'fallback';
  let playerStatsSource = 'fallback';
  const warnings = [];

  try {
    const pageResultsPromise = Promise.allSettled([
      fetchText(SOURCE_URLS.standings),
      fetchText(SOURCE_URLS.games),
      fetchText(SOURCE_URLS.event)
    ]);
    const [statsResult] = await Promise.allSettled([fetchText(SOURCE_URLS.stats)]);

    const officialDataPromise = statsResult.status === 'fulfilled'
      ? Promise.allSettled([
        fetchCompetitionGames(statsResult.value),
        fetchCompetitionStatLeaders(statsResult.value),
        fetchUsaTeamPlayerStats(statsResult.value)
      ])
      : Promise.resolve([
        { status: 'rejected', reason: new Error('FIBA statistics page unavailable') },
        { status: 'rejected', reason: new Error('FIBA statistics page unavailable') },
        { status: 'rejected', reason: new Error('FIBA statistics page unavailable') }
      ]);
    const [[standingsResult, gamesResult, eventResult], [competitionGamesResult, competitionLeadersResult, teamStatsResult]] = await Promise.all([
      pageResultsPromise,
      officialDataPromise
    ]);

    let officialStandingsChanged = false;
    if (standingsResult.status === 'fulfilled') {
      const standingsText = normalizeName(htmlToText(standingsResult.value));
      const parsed = parseStandings(standingsText, fallbackStandings);
      standings = parsed.groups;
      officialStandingsChanged = parsed.changed;
    }

    if (competitionGamesResult.status === 'fulfilled') {
      const officialGames = parseCompetitionGames(competitionGamesResult.value);
      if (officialGames.length >= GROUP_GAMES.length) {
        games = officialGames;
        liveResults = games.some(game => game.status === 'final');
        gamesSource = 'official-competition-games';
      }
    }

    if (gamesSource === 'fallback') {
      const resultsHtml = gamesResult.status === 'fulfilled'
        ? gamesResult.value
        : (eventResult.status === 'fulfilled' ? eventResult.value : null);

      if (resultsHtml) {
        const resultsText = normalizeName(htmlToText(resultsHtml));
        const scoreResult = applyFinalScores(resultsText, fallbackGames);
        games = scoreResult.games;
        liveResults = scoreResult.changed;
        gamesSource = scoreResult.changed ? 'official-games-page' : 'fallback';
        const extras = parseExtraFinalGames(resultsText, games);
        if (extras.length) games = games.concat(extras);
      }

      const gameCenterResults = await Promise.allSettled(completedGameCenterUrls().map(url => fetchText(url)));
      for (const result of gameCenterResults) {
        if (result.status !== 'fulfilled') continue;
        const dailyText = normalizeName(htmlToText(result.value));
        const dailyScores = applyVerifiedDailyScores(dailyText, games);
        if (!dailyScores.changed) continue;
        games = mergeFinalScores(games, dailyScores.games);
        liveResults = true;
        gamesSource = 'official-game-center';
      }
    }

    const structuredFeedConfigured = statsResult.status === 'fulfilled' && publicFibaApiConfig(statsResult.value);
    if (gamesSource !== 'official-competition-games' && (statsResult.status === 'rejected' || structuredFeedConfigured)) {
      const snapshot = applyVerifiedResultSnapshot(games);
      games = snapshot.games;
      liveResults = games.some(game => game.status === 'final');
      if (snapshot.changed) {
        gamesSource = 'verified-official-snapshot';
        warnings.push('FIBA’s structured games feed is temporarily unavailable. Completed results are filled from the last verified official snapshot while live refresh retries.');
      }
    }

    const completedGroupGames = games.filter(game => game.group && game.status === 'final').length;
    const officialCompletedGames = standingsGameCount(standings);
    if (completedGroupGames > 0 && ['official-competition-games','verified-official-snapshot'].includes(gamesSource)) {
      standings = deriveStandingsFromFinalGames(fallbackStandings, games);
      liveStandings = true;
      standingsSource = gamesSource === 'official-competition-games' ? 'derived-from-official-games' : 'derived-from-verified-snapshot';
      if (gamesSource === 'official-competition-games' && completedGroupGames > officialCompletedGames) {
        warnings.push('FIBA’s structured game feed has newer finals than its standings page. Group W/L, points and order are calculated from those official final scores.');
      }
    } else if (completedGroupGames > officialCompletedGames) {
      standings = deriveStandingsFromFinalGames(fallbackStandings, games);
      liveStandings = true;
      standingsSource = 'derived-from-results';
      warnings.push('FIBA results updated before the standings table. W/L and group points are being calculated from official completed FIBA game results until the standings page catches up.');
    } else if (standingsResult.status === 'fulfilled') {
      liveStandings = officialStandingsChanged || completedGroupGames > 0;
      standingsSource = liveStandings ? 'official-standings' : 'fallback';
      if (gamesSource === 'fallback') warnings.push('Official FIBA game results feed could not be refreshed; standings are using the official standings page.');
    } else if (gamesSource === 'fallback') {
      warnings.push('Official FIBA standings/results feeds could not be refreshed; showing verified tournament structure and schedule.');
    }

    games = await attachPlayersOfGame(games);

    if (competitionLeadersResult.status === 'fulfilled' && competitionLeadersResult.value.populated > 0) {
      statLeaders = competitionLeadersResult.value.categories;
      liveLeagueLeaders = competitionLeadersResult.value.complete;
      leagueLeadersSource = 'official-competition-player-leaders';
    }

    if (!liveLeagueLeaders && eventResult.status === 'fulfilled') {
      const eventText = normalizeName(htmlToText(eventResult.value));
      const parsedLeaderboards = parseEventStatLeaders(eventText);
      const currentPopulated = statLeaders.filter(category => category.leaders.length > 0).length;
      if (parsedLeaderboards.populated > currentPopulated) {
        statLeaders = parsedLeaderboards.categories;
        liveLeagueLeaders = parsedLeaderboards.complete;
        leagueLeadersSource = 'official-event-page';
      }
    }
    if (!liveLeagueLeaders) {
      const populated = statLeaders.filter(category => category.leaders.length > 0).length;
      if (populated > 0) warnings.push('Some FIBA tournament leader categories are still refreshing. Available categories are shown while the official leaderboard catches up.');
      else warnings.push('Official FIBA all-player leaderboards could not be refreshed.');
    }

    if (statsResult.status === 'fulfilled') {
      const statsText = normalizeName(htmlToText(statsResult.value));
      const parsedHtmlStats = parsePlayerStats(statsText);
      let parsedStats = parsedHtmlStats;
      if (teamStatsResult.status === 'fulfilled') {
        const parsedTeamStats = parseUsaTeamPlayerStats(teamStatsResult.value);
        if (parsedTeamStats.found >= parsedHtmlStats.found) {
          parsedStats = parsedTeamStats;
          playerStatsSource = 'official-usa-team-statistics';
        }
      } else if (parsedHtmlStats.found > 0) {
        warnings.push('FIBA’s complete Team USA statistics feed could not refresh. The visible competition table is being used temporarily.');
      }
      playerStats = parsedStats.players;
      livePlayerStats = parsedStats.found > 0;
      if (livePlayerStats && playerStatsSource === 'fallback') playerStatsSource = 'official-competition-statistics';
      if (!livePlayerStats) warnings.push('World Cup player box-score stats will populate after USA plays its first game.');
    } else {
      warnings.push('Official FIBA player-stat page could not be refreshed; World Cup player stats remain unfilled.');
    }
  } catch (error) {
    warnings.push(`Live FIBA refresh unavailable: ${error.message}`);
  }

  const tournamentTable = buildTournamentTable(standings, games);
  const eliminatedTeams = tournamentTable.filter(team => team.eliminated);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  return res.status(200).json({
    competition: 'FIBA Women’s Basketball World Cup 2026',
    location: 'Berlin, Germany',
    startDate: '2026-09-04',
    endDate: '2026-09-13',
    teamCount: 16,
    totalGames: 36,
    updatedAt: new Date().toISOString(),
    sources: {
      ...SOURCE_URLS,
      gameCenters: completedGameCenterUrls()
    },
    dataStatus: {
      liveStandings,
      liveResults,
      livePlayerStats,
      liveLeagueLeaders,
      standingsSource,
      gamesSource,
      leagueLeadersSource,
      playerStatsSource,
      completedGames: games.filter(game => game.status === 'final').length,
      completedGroupGames: games.filter(game => game.group && game.status === 'final').length,
      eliminatedTeams: eliminatedTeams.length,
      playerOfGameCount: games.filter(game => game.playerOfGame).length,
      warnings
    },
    rosterStatus: 'Updated Aug. 31: USA Basketball added Kiki Iriafen and Sonia Citron after A’ja Wilson and Kelsey Plum withdrew for health reasons. FIBA notes federation-announced rosters may differ from the final event roster.',
    usa: { ...usaSummary(standings), roster: USA_ROSTER, rosterUpdate: USA_ROSTER_UPDATE },
    standings,
    tournamentTable,
    statLeaders,
    compositeMethodology: {
      name: 'We Know the W Tournament Composite',
      scale: '0-100',
      formula: [
        { component: 'Win rate', weight: 45 },
        { component: 'Point differential per game', weight: 30 },
        { component: 'Scoring rate', weight: 15 },
        { component: 'Strength of schedule', weight: 10 }
      ],
      note: 'The W score is an editorial performance metric, not an official FIBA ranking. It recalculates from completed World Cup games.'
    },
    games,
    knockoutRounds: KNOCKOUT_ROUNDS,
    playerStats,
    qualifyingForm: QUALIFYING_FORM
  });
};

module.exports.__test = { decodeEntities, parsePlayerOfGame, tournamentEliminations };
