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
      const pattern = new RegExp(`\\b${code}\\b(?:\\s+${code})?\\s+(\\d+)\\/(\\d+)\\s+(\\d+)`, 'i');
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
      const pattern = new RegExp(`${name}\\s*\\(USA\\)\\s+(\\d+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+(\\d+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+\\s*-\\s*[\\d.]+)\\s+([\\d.]+)`, 'i');
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
  const warnings = [];

  try {
    const [eventResult, statsResult] = await Promise.allSettled([
      fetchText(SOURCE_URLS.event),
      fetchText(SOURCE_URLS.stats)
    ]);

    if (eventResult.status === 'fulfilled') {
      const text = normalizeName(htmlToText(eventResult.value));
      const standingResult = parseStandings(text, fallbackStandings);
      standings = standingResult.groups;
      liveStandings = true;
      const scoreResult = applyFinalScores(text, fallbackGames);
      games = scoreResult.games;
      liveResults = scoreResult.changed;
      const extras = parseExtraFinalGames(text, games);
      if (extras.length) games = games.concat(extras);
    } else {
      warnings.push('Official FIBA standings/results feed could not be refreshed; showing verified tournament structure and schedule.');
    }

    if (statsResult.status === 'fulfilled') {
      const statsText = normalizeName(htmlToText(statsResult.value));
      const parsedStats = parsePlayerStats(statsText);
      playerStats = parsedStats.players;
      livePlayerStats = parsedStats.found > 0;
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
    sources: SOURCE_URLS,
    dataStatus: { liveStandings, liveResults, livePlayerStats, warnings },
    rosterStatus: 'Updated Aug. 31: USA Basketball added Kiki Iriafen and Sonia Citron after A’ja Wilson and Kelsey Plum withdrew for health reasons. FIBA notes federation-announced rosters may differ from the final event roster.',
    usa: { ...usaSummary(standings), roster: USA_ROSTER, rosterUpdate: USA_ROSTER_UPDATE },
    standings,
    games,
    knockoutRounds: KNOCKOUT_ROUNDS,
    playerStats,
    qualifyingForm: QUALIFYING_FORM
  });
};
