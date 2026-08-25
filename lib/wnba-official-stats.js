const OFFICIAL_STATS_ROOT = 'https://stats.wnba.com/stats';

function number(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchOfficial(endpoint, params = {}) {
  const url = new URL(`${OFFICIAL_STATS_ROOT}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Origin: 'https://www.wnba.com',
        Referer: 'https://www.wnba.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0)'
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Official WNBA stats returned ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function rowsFromResultSet(resultSet = {}) {
  const headers = Array.isArray(resultSet.headers) ? resultSet.headers : [];
  return (Array.isArray(resultSet.rowSet) ? resultSet.rowSet : []).map(values =>
    Object.fromEntries(headers.map((header, index) => [header, values[index]]))
  );
}

async function getOfficialStandings(season = 2026) {
  const body = await fetchOfficial('leaguestandingsv3', {
    LeagueID: 10,
    Season: season,
    SeasonType: 'Regular Season'
  });
  const rows = rowsFromResultSet(body?.resultSets?.[0]);
  return rows.map(row => {
    const wins = number(row.WINS) || 0;
    const losses = number(row.LOSSES) || 0;
    const conference = row.Conference === 'East' ? 'Eastern' : row.Conference === 'West' ? 'Western' : 'Unknown';
    const clincher = String(row.ClinchIndicator || '').toLowerCase();
    return {
      team: {
        id: String(row.TeamID || ''),
        full_name: [row.TeamCity, row.TeamName].filter(Boolean).join(' ').trim()
      },
      conference,
      wins,
      losses,
      win_percentage: number(row.WinPCT) ?? (wins + losses ? wins / (wins + losses) : 0),
      games_back: number(row.LeagueGamesBack) ?? 0,
      conference_games_back: number(row.ConferenceGamesBack) ?? 0,
      conference_record: String(row.ConferenceRecord || '').trim() || '—',
      home_record: String(row.HOME || '').trim() || '—',
      road_record: String(row.ROAD || '').trim() || '—',
      streak: String(row.strCurrentStreak || '').replace(/\s+/g, '') || '—',
      last_ten: String(row.L10 || '').trim() || '—',
      games_played: wins + losses,
      overall_rank: number(row.PlayoffRank),
      conference_rank: number(row.LeagueRank),
      playoff_seed: number(row.PlayoffRank),
      playoff_status: number(row.ClinchedPlayoffBirth) === 1 || clincher.includes('x')
        ? 'clinched'
        : clincher.includes('e') ? 'eliminated' : null,
      source: 'Official WNBA statistics'
    };
  }).filter(record => record.team.id && record.team.full_name);
}

const LEADER_CATEGORIES = {
  pts: { label: 'Points', unit: 'PPG', stat: 'PTS' },
  trb: { label: 'Rebounds', unit: 'RPG', stat: 'REB' },
  ast: { label: 'Assists', unit: 'APG', stat: 'AST' },
  stl: { label: 'Steals', unit: 'SPG', stat: 'STL' },
  blk: { label: 'Blocks', unit: 'BPG', stat: 'BLK' },
  tov: { label: 'Turnovers', unit: 'TOPG', stat: 'TOV' },
  '3p': { label: 'Three Pointers', unit: '3PG', stat: 'FG3M' }
};

async function getOfficialLeagueLeaders(season = 2026, perMode = 'PerGame', top = 5) {
  const entries = Object.entries(LEADER_CATEGORIES);
  const results = await Promise.allSettled(entries.map(([, category]) => fetchOfficial('leagueleaders', {
    LeagueID: 10,
    PerMode: perMode,
    Scope: 'S',
    Season: season,
    SeasonType: 'Regular Season',
    StatCategory: category.stat
  })));
  const categories = {};
  const errors = [];
  results.forEach((result, index) => {
    const [key, category] = entries[index];
    if (result.status !== 'fulfilled') {
      errors.push(`${category.label}: ${result.reason?.message || 'unavailable'}`);
      return;
    }
    const rows = rowsFromResultSet(result.value?.resultSet);
    categories[key] = {
      label: category.label,
      unit: category.unit,
      stat: category.stat,
      leaders: rows.slice(0, top).map(row => ({
        rank: number(row.RANK),
        name: row.PLAYER,
        team: row.TEAM,
        games: number(row.GP),
        value: number(row[category.stat])
      })).filter(row => row.name && row.value !== null)
    };
  });
  return { categories, errors };
}

async function getOfficialPlayerStats(season = 2026, perMode = 'PerGame', playerExperience = '') {
  const body = await fetchOfficial('leaguedashplayerstats', {
    LeagueID: 10,
    Season: season,
    SeasonType: 'Regular Season',
    PerMode: perMode,
    MeasureType: 'Base',
    PlayerExperience: playerExperience,
    PaceAdjust: 'N',
    PlusMinus: 'N',
    Rank: 'N',
    LastNGames: 0,
    Month: 0,
    Period: 0,
    PORound: 0,
    TeamID: 0,
    OpponentTeamID: 0
  });
  return rowsFromResultSet(body?.resultSets?.[0]).map(row => ({
    id: String(row.PLAYER_ID || ''),
    name: row.PLAYER_NAME,
    team: row.TEAM_ABBREVIATION,
    teamId: String(row.TEAM_ID || ''),
    position: row.PLAYER_POSITION || '',
    games: number(row.GP),
    minutes: number(row.MIN),
    pts: number(row.PTS),
    trb: number(row.REB),
    ast: number(row.AST),
    stl: number(row.STL),
    blk: number(row.BLK),
    tov: number(row.TOV),
    '3p': number(row.FG3M)
  })).filter(row => row.name && row.games !== null);
}

async function getOfficialPlayerPerGame(season = 2026) {
  return getOfficialPlayerStats(season, 'PerGame');
}

async function getOfficialRookieTotals(season = 2026) {
  return getOfficialPlayerStats(season, 'Totals', 'Rookie');
}

async function getOfficialAllTimeLeaders(top = 5) {
  const body = await fetchOfficial('alltimeleadersgrids', {
    LeagueID: 10,
    PerMode: 'Totals',
    SeasonType: 'Regular Season',
    TopX: top
  });
  const output = {};
  for (const resultSet of body?.resultSets || []) output[resultSet.name] = rowsFromResultSet(resultSet);
  return output;
}

module.exports = {
  getOfficialAllTimeLeaders,
  getOfficialLeagueLeaders,
  getOfficialPlayerPerGame,
  getOfficialRookieTotals,
  getOfficialStandings
};
