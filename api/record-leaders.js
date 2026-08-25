const { getOfficialAllTimeLeaders, getOfficialLeagueLeaders, getOfficialRookieTotals } = require('../lib/wnba-official-stats');

const BOARD_MAP = {
  points: { category: 'pts', result: 'PTSLeaders', stat: 'PTS' },
  threes: { category: '3p', result: 'FG3MLeaders', stat: 'FG3M' },
  rebounds: { category: 'trb', result: 'REBLeaders', stat: 'REB' },
  assists: { category: 'ast', result: 'ASTLeaders', stat: 'AST' },
  steals: { category: 'stl', result: 'STLLeaders', stat: 'STL' },
  blocks: { category: 'blk', result: 'BLKLeaders', stat: 'BLK' },
  turnovers: { category: 'tov', result: 'TOVLeaders', stat: 'TOV' }
};

const TEAM_NAMES = {
  ATL: 'Atlanta', CHI: 'Chicago', CON: 'Connecticut', DAL: 'Dallas', GSV: 'Golden State',
  IND: 'Indiana', LVA: 'Las Vegas', LAS: 'Los Angeles', MIN: 'Minnesota', NYL: 'New York',
  PHO: 'Phoenix', PDX: 'Portland', SEA: 'Seattle', TOR: 'Toronto', WAS: 'Washington'
};

function format(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString('en-US') : String(value || '');
}

function careerEntries(rows = [], stat = '') {
  return rows.slice(0, 5).map(row => ({
    rank: String(row[`${stat}_RANK`] || ''),
    name: row.PLAYER_NAME,
    value: format(row[stat]),
    detail: 'Career total',
    activeAtSnapshot: row.IS_ACTIVE_FLAG === 'Y'
  }));
}

function rookieEntries(rows = [], key = '', season = 2026) {
  return [...rows]
    .filter(row => Number.isFinite(Number(row[key])))
    .sort((a, b) => Number(b[key]) - Number(a[key]) || String(a.name).localeCompare(String(b.name)))
    .slice(0, 5)
    .map((row, index) => ({
      rank: String(index + 1),
      name: row.name,
      value: format(row[key]),
      detail: `${season} · ${TEAM_NAMES[row.team] || row.team || 'WNBA'} · ongoing`,
      activeAtSnapshot: true
    }));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const requested = Number.parseInt(String(req.query.season || '2026'), 10);
  const season = Number.isFinite(requested) && requested >= 1997 && requested <= 2100 ? requested : 2026;
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=21600');
  try {
    const [allTime, seasonTotals, rookieTotals] = await Promise.all([
      getOfficialAllTimeLeaders(5),
      getOfficialLeagueLeaders(season, 'Totals', 5),
      getOfficialRookieTotals(season)
    ]);
    const career = {};
    const currentSeason = {};
    const rookie = {};
    for (const [board, config] of Object.entries(BOARD_MAP)) {
      career[board] = careerEntries(allTime[config.result], config.stat);
      currentSeason[board] = (seasonTotals.categories?.[config.category]?.leaders || []).map(row => ({
        rank: String(row.rank || ''),
        name: row.name,
        value: format(row.value),
        detail: `${season} · ongoing${row.team ? ` · ${row.team}` : ''}`,
        activeAtSnapshot: true
      }));
      rookie[board] = rookieEntries(rookieTotals, config.category, season);
    }
    const games = careerEntries(allTime.GPLeaders, 'GP').map(entry => ({ ...entry, detail: 'Career games' }));
    const personalFouls = careerEntries(allTime.PFLeaders, 'PF').map(entry => ({ ...entry, detail: 'Career personal fouls' }));
    return res.status(200).json({
      season,
      updatedAt: new Date().toISOString(),
      source: 'Official WNBA statistics',
      sourceUrl: 'https://stats.wnba.com/alltime-leaders/',
      career,
      currentSeason,
      rookie,
      careerOnly: { games, 'personal-fouls': personalFouls },
      diagnostics: { errors: seasonTotals.errors || [] }
    });
  } catch (error) {
    return res.status(502).json({ error: 'Official WNBA record leaders are temporarily unavailable.', detail: error.message, season });
  }
};
