const { fetchPlayoffTotals } = require('../lib/team-player-totals');
const REFRESH_MS = 30 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
const latestByRequest = new Map();
const inFlightByRequest = new Map();
const retryAfterByRequest = new Map();

function teamPlayerTotals(row = {}) {
  return {
    name: row.name,
    team: row.team,
    g: row.games ?? row.g,
    mp: row.minutes ?? row.mp,
    pts: row.pts,
    trb: row.trb ?? row.reb,
    ast: row.ast,
    stl: row.stl,
    blk: row.blk,
    tov: row.tov,
    fg: row.fgm ?? row.fg,
    fga: row.fga,
    fg3: row.fg3m ?? row.fg3,
    fg3a: row.fg3a,
    ft: row.ftm ?? row.ft,
    fta: row.fta,
    plusMinus: row.plusMinus
  };
}

async function load(season, team) {
  const requestKey = `${season}:${team}`;
  const now = Date.now();
  const cached = latestByRequest.get(requestKey);
  if (cached && now - Date.parse(cached.checkedAt) < REFRESH_MS) return cached;
  if (now < (retryAfterByRequest.get(requestKey) || 0)) {
    if (cached) return { ...cached, stale: true };
    throw new Error('Playoff statistics are temporarily unavailable.');
  }
  if (inFlightByRequest.has(requestKey)) return inFlightByRequest.get(requestKey);

  const pending = fetchPlayoffTotals(fetch, 15000, season, team).then(sourcePayload => {
    const payload = {
      ...sourcePayload,
      seasonType: 'Playoffs',
      stale: false,
      players: sourcePayload.players.map(teamPlayerTotals).filter(player => player.name && player.team && Number(player.g) > 0)
    };
    latestByRequest.set(requestKey, payload);
    retryAfterByRequest.delete(requestKey);
    return payload;
  }).catch(error => {
    retryAfterByRequest.set(requestKey, Date.now() + RETRY_MS);
    if (cached) return { ...cached, stale: true };
    throw error;
  }).finally(() => inFlightByRequest.delete(requestKey));
  inFlightByRequest.set(requestKey, pending);
  return pending;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const requested = Number.parseInt(String(req.query?.season || '2026'), 10);
  if (!Number.isInteger(requested) || requested < 1997 || requested > new Date().getFullYear()) {
    return res.status(400).json({ error: 'Choose a WNBA season from 1997 through the current season.' });
  }
  const requestedTeam = String(req.query?.team || '').trim().toUpperCase();
  if (requestedTeam && !/^(ATL|CHI|CON|DAL|GSV|IND|LVA|LAS|MIN|NYL|PHO|PHX|POR|SEA|TOR|WAS)$/.test(requestedTeam)) {
    return res.status(400).json({ error: 'Choose a current WNBA team code.' });
  }
  const team = requestedTeam === 'PHX' ? 'PHO' : requestedTeam;
  try {
    const payload = await load(requested, team);
    res.setHeader('Cache-Control', payload.stale
      ? 'public, max-age=0, s-maxage=300'
      : 'public, max-age=0, s-maxage=1800, stale-while-revalidate=300');
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(502).json({ error: error.message || 'Playoff statistics are temporarily unavailable.' });
  }
};

module.exports._test = { teamPlayerTotals };
