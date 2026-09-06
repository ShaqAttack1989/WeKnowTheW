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

function gameCenterUrl(day) {
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
  ['2026-09-04','09:30','A','JPN','MLI'], ['2026-09-04','09:30','C','AUS','PUR'],
  ['2026-09-04','12:15','D','USA','CHN'], ['2026-09-04','12:30','B','KOR','NGR'],
  ['2026-09-04','15:30','C','BEL','TUR'], ['2026-09-04','15:45','A','ESP','GER'],
  ['2026-09-04','18:15','D','CZE','ITA'], ['2026-09-04','19:00','B','HUN','FRA'],
  ['2026-09-05','09:30','A','MLI','ESP'], ['2026-09-05','12:15','B','NGR','HUN'],
  ['2026-09-05','16:00','A','GER','JPN'], ['2026-09-05','18:45','B','FRA','KOR'],
  ['2026-09-06','09:30','C','TUR','AUS'], ['2026-09-06','12:30','D','CHN','CZE'],
  ['2026-09-06','15:45','C','PUR','BEL'], ['2026-09-06','18:45','D','ITA','USA'],
  ['2026-09-07','09:30','C','BEL','AUS'], ['2026-09-07','09:30','C','PUR','TUR'],
  ['2026-09-07','12:30','B','HUN','KOR'], ['2026-09-07','12:30','B','NGR','FRA'],
  ['2026-09-07','15:50','A','JPN','ESP'], ['2026-09-07','15:50','A','GER','MLI'],
  ['2026-09-07','18:45','D','USA','CZE'], ['2026-09-07','18:45','D','ITA','CHN']
];

const FIBA_GROUP_GAME_IDS = {
  'JPN-MLI': 128116, 'ESP-GER': 128117, 'MLI-ESP': 128118, 'GER-JPN': 128119, 'JPN-ESP': 128120, 'GER-MLI': 128121,
  'HUN-FRA': 128122, 'KOR-NGR': 128123, 'NGR-HUN': 128124, 'FRA-KOR': 128125, 'HUN-KOR': 128126, 'NGR-FRA': 128127,
  'BEL-TUR': 128128, 'AUS-PUR': 128129, 'PUR-BEL': 128130, 'TUR-AUS': 128131, 'BEL-AUS': 128132, 'PUR-TUR': 128133,
  'USA-CHN': 128134, 'CZE-ITA': 128135, 'ITA-USA': 128136, 'CHN-CZE': 128137, 'USA-CZE': 128138, 'ITA-CHN': 128139
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
  }
};

function verifiedPlayerOfGame(game) {
  const key = `${game.home.code}-${game.away.code}`;
  const item = VERIFIED_PLAYER_OF_GAME[key];
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
  const id = FIBA_GROUP_GAME_IDS[key];
  return id ? `${EVENT_BASE}/games/${id}-${key}` : null;
}

const KNOCKOUT_ROUNDS = [
  { date: '2026-09-08', phase: 'Qualification to Quarter-Finals', games: 4 },
  { date: '2026-09-09', phase: 'Quarter-Finals', games: 4 },
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
  return GROUP_GAMES.map(([date, time, group, home, away], index) => ({
    id: `group-${index + 1}-${home}-${away}`,
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
    awayScore: null
  }));
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
  return String(value)
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&middot;|&#183;/gi, ' · ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&rsquo;|&#8217;|&#x2019;/gi, '’')
    .replace(/&lsquo;|&#8216;|&#x2018;/gi, '‘')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
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
  const player = normalizeName(title[1]).replace(/^[^A-Za-zÀ-ÿ]+/, '').trim();
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

async function fetchUsaTeamPlayerStats(statsHtml, timeoutMs = 8000) {
  const config = publicFibaApiConfig(statsHtml);
  if (!config) throw new Error('FIBA public statistics configuration was not available');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.apiUrl.replace(/\/$/, '')}/getgdapcompetitionteamstatisticsbyteamid?gdapTeamId=${FIBA_GDAP_USA_TEAM_ID}`, {
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': config.subscriptionKey
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA team statistics returned ${response.status}`);
    const payload = await response.json();
    return payload?.data || payload;
  } finally {
    clearTimeout(timeout);
  }
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
    group.teams.sort((a, b) =>
      (b.points - a.points) ||
      (b.wins - a.wins) ||
      ((b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst)) ||
      (b.pointsFor - a.pointsFor)
    );
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
  let standingsSource = 'fallback';
  let playerStatsSource = 'fallback';
  const warnings = [];

  try {
    const gameCenterDays = completedGameCenterDays();
    const [standingsResult, gamesResult, eventResult, statsResult, ...gameCenterResults] = await Promise.allSettled([
      fetchText(SOURCE_URLS.standings),
      fetchText(SOURCE_URLS.games),
      fetchText(SOURCE_URLS.event),
      fetchText(SOURCE_URLS.stats),
      ...gameCenterDays.map(day => fetchText(gameCenterUrl(day)))
    ]);

    let officialStandingsChanged = false;
    if (standingsResult.status === 'fulfilled') {
      const standingsText = normalizeName(htmlToText(standingsResult.value));
      const parsed = parseStandings(standingsText, fallbackStandings);
      standings = parsed.groups;
      officialStandingsChanged = parsed.changed;
    }

    const resultsHtml = gamesResult.status === 'fulfilled'
      ? gamesResult.value
      : (eventResult.status === 'fulfilled' ? eventResult.value : null);

    if (resultsHtml) {
      const resultsText = normalizeName(htmlToText(resultsHtml));
      const scoreResult = applyFinalScores(resultsText, fallbackGames);
      games = scoreResult.games;
      liveResults = scoreResult.changed;
      const extras = parseExtraFinalGames(resultsText, games);
      if (extras.length) games = games.concat(extras);

      const completedGroupGames = games.filter(game => game.group && game.status === 'final').length;
      const officialCompletedGames = standingsGameCount(standings);

      if (completedGroupGames > officialCompletedGames) {
        standings = deriveStandingsFromFinalGames(fallbackStandings, games);
        liveStandings = completedGroupGames > 0;
        standingsSource = 'derived-from-results';
        warnings.push('FIBA results updated before the standings table. W/L and group points are being calculated from official completed FIBA game results until the standings page catches up.');
      } else {
        liveStandings = officialStandingsChanged || completedGroupGames > 0;
        standingsSource = liveStandings ? 'official-standings' : 'fallback';
      }
    } else if (standingsResult.status === 'fulfilled') {
      liveStandings = officialStandingsChanged;
      standingsSource = liveStandings ? 'official-standings' : 'fallback';
      warnings.push('Official FIBA game results feed could not be refreshed; standings are using the official standings page.');
    } else {
      warnings.push('Official FIBA standings/results feeds could not be refreshed; showing verified tournament structure and schedule.');
    }

    let gameCenterFinals = false;
    for (const result of gameCenterResults) {
      if (result.status !== 'fulfilled') continue;
      const dailyText = normalizeName(htmlToText(result.value));
      const dailyScores = applyVerifiedDailyScores(dailyText, games);
      if (!dailyScores.changed) continue;
      games = mergeFinalScores(games, dailyScores.games);
      gameCenterFinals = true;
    }

    if (gameCenterFinals) {
      liveResults = true;
      const completedGroupGames = games.filter(game => game.group && game.status === 'final').length;
      const officialCompletedGames = standingsGameCount(standings);
      if (completedGroupGames > officialCompletedGames) {
        standings = deriveStandingsFromFinalGames(fallbackStandings, games);
        liveStandings = true;
        standingsSource = 'derived-from-results';
        if (!warnings.some(item => item.includes('standings table'))) {
          warnings.push('Official FIBA Game Center has newer finals than the standings table. W/L and group points are being calculated from those verified results until the table catches up.');
        }
      }
    }

    games = await attachPlayersOfGame(games);

    if (statsResult.status === 'fulfilled') {
      const statsText = normalizeName(htmlToText(statsResult.value));
      const parsedHtmlStats = parsePlayerStats(statsText);
      let parsedStats = parsedHtmlStats;
      try {
        const officialTeamStats = await fetchUsaTeamPlayerStats(statsResult.value);
        const parsedTeamStats = parseUsaTeamPlayerStats(officialTeamStats);
        if (parsedTeamStats.found >= parsedHtmlStats.found) {
          parsedStats = parsedTeamStats;
          playerStatsSource = 'official-usa-team-statistics';
        }
      } catch (error) {
        if (parsedHtmlStats.found > 0) warnings.push('FIBA’s complete Team USA statistics feed could not refresh. The visible competition table is being used temporarily.');
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

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
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
      gameCenters: completedGameCenterDays().map(day => gameCenterUrl(day))
    },
    dataStatus: {
      liveStandings,
      liveResults,
      livePlayerStats,
      standingsSource,
      playerStatsSource,
      playerOfGameCount: games.filter(game => game.playerOfGame).length,
      warnings
    },
    rosterStatus: 'Updated Aug. 31: USA Basketball added Kiki Iriafen and Sonia Citron after A’ja Wilson and Kelsey Plum withdrew for health reasons. FIBA notes federation-announced rosters may differ from the final event roster.',
    usa: { ...usaSummary(standings), roster: USA_ROSTER, rosterUpdate: USA_ROSTER_UPDATE },
    standings,
    games,
    knockoutRounds: KNOCKOUT_ROUNDS,
    playerStats,
    qualifyingForm: QUALIFYING_FORM
  });
};
