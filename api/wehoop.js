const {
  getWnbaScoreboard,
  getWnbaStandings,
  getWnbaRosters,
  getWnbaInjuries,
  getWnbaTransactions
} = require('../lib/wehoop-espn');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestedSeason = Number(req.query.season);
  const season = Number.isInteger(requestedSeason) && requestedSeason >= 1997 && requestedSeason <= 2100
    ? requestedSeason
    : new Date().getFullYear();

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');

  const checks = await Promise.allSettled([
    getWnbaScoreboard(season),
    getWnbaStandings(season),
    getWnbaRosters(season),
    getWnbaInjuries(),
    getWnbaTransactions(season, 250)
  ]);

  const [scoreboard, standings, rosters, injuries, transactions] = checks;
  const errors = [];
  const errorFor = (result, source) => {
    if (result.status === 'rejected') errors.push({ source, message: result.reason?.message || 'Request failed' });
  };

  errorFor(scoreboard, 'scoreboard');
  errorFor(standings, 'standings');
  errorFor(rosters, 'rosters');
  errorFor(injuries, 'injuries');
  errorFor(transactions, 'transactions');

  const rosterValue = rosters.status === 'fulfilled' ? rosters.value : { teams: [], players: [], failedRosters: 0 };
  const payload = {
    provider: 'SportsDataverse/WeHoop ESPN bridge',
    upstreamFamily: 'espn_wnba_*',
    directWnbaStatsApiUsed: false,
    season,
    checkedAt: new Date().toISOString(),
    healthy: errors.length < checks.length,
    coverage: {
      games: scoreboard.status === 'fulfilled' ? scoreboard.value.length : 0,
      standingsTeams: standings.status === 'fulfilled' ? standings.value.length : 0,
      rosterTeams: rosterValue.teams.length,
      rosterPlayers: rosterValue.players.length,
      failedRosters: rosterValue.failedRosters || 0,
      injuries: injuries.status === 'fulfilled' ? injuries.value.length : 0,
      transactions: transactions.status === 'fulfilled' ? transactions.value.length : 0
    },
    errors
  };

  return res.status(errors.length === checks.length ? 502 : 200).json(payload);
};
