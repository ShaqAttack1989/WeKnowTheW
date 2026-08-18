const API_ROOT = 'https://api.balldontlie.io/wnba/v1';
const ACCOUNT_ROOT = 'https://api.balldontlie.io/account/v1';

async function request(path, apiKey) {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      Authorization: apiKey,
      Accept: 'application/json'
    }
  });

  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!response.ok) {
    const error = new Error(body?.message || body?.error?.message || body?.error || `BALLDONTLIE returned ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function getAccountInfo(apiKey) {
  const response = await fetch(`${ACCOUNT_ROOT}/me`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json'
    }
  });

  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!response.ok) {
    const error = new Error(body?.error?.message || body?.message || `Account API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return body;
}

function getWnbaTier(account) {
  const subscriptions = Array.isArray(account?.subscriptions) ? account.subscriptions : [];
  const wnba = subscriptions.find(item => String(item?.sport || '').toLowerCase() === 'wnba');
  return wnba?.tier || null;
}

function canUseOfficialStandings(tier) {
  return ['paid', 'paid_plus', 'all_access_v3', 'all-star', 'goat'].includes(String(tier || '').toLowerCase());
}

function canUsePlayerSeasonStats(tier) {
  return ['paid_plus', 'all_access_v3', 'goat'].includes(String(tier || '').toLowerCase());
}

async function getAllPlayerSeasonStats(season, apiKey) {
  const all = [];
  let cursor = null;
  let pageCount = 0;

  do {
    const query = new URLSearchParams({
      season: String(season),
      season_type: '2',
      per_page: '100'
    });
    if (cursor) query.set('cursor', cursor);

    const body = await request(`/player_season_stats?${query}`, apiKey);
    all.push(...(body.data || []));
    cursor = body.meta?.next_cursor ? String(body.meta.next_cursor) : null;
    pageCount += 1;
  } while (cursor && pageCount < 10);

  return all;
}

async function getAllRegularSeasonGames(season, apiKey) {
  const all = [];
  let cursor = null;
  let pageCount = 0;

  do {
    const query = new URLSearchParams();
    query.append('seasons[]', String(season));
    query.set('season_type', '2');
    query.set('per_page', '100');
    if (cursor) query.set('cursor', cursor);

    const body = await request(`/games?${query.toString()}`, apiKey);
    all.push(...(body.data || []));
    cursor = body.meta?.next_cursor ? String(body.meta.next_cursor) : null;
    pageCount += 1;
  } while (cursor && pageCount < 5);

  return all;
}

function isFinalGame(game) {
  if (game?.status_state) return game.status_state === 'final';
  const status = String(game?.status || '').toLowerCase();
  return status === 'post' || status === 'final' || status.includes('final');
}

function deriveStandingsFromGames(games) {
  const records = new Map();

  function ensureTeam(team) {
    if (!team?.id) return null;
    if (!records.has(team.id)) {
      records.set(team.id, {
        team,
        conference: team.conference || '',
        wins: 0,
        losses: 0
      });
    }
    return records.get(team.id);
  }

  for (const game of games || []) {
    if (!isFinalGame(game)) continue;

    const home = ensureTeam(game.home_team);
    const away = ensureTeam(game.visitor_team);
    if (!home || !away) continue;

    const homeScore = Number(game.home_score);
    const awayScore = Number(game.away_score);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore) || homeScore === awayScore) continue;

    if (homeScore > awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else {
      away.wins += 1;
      home.losses += 1;
    }
  }

  return [...records.values()]
    .map(record => {
      const played = record.wins + record.losses;
      return {
        ...record,
        win_percentage: played ? record.wins / played : 0
      };
    })
    .sort((a, b) => Number(b.win_percentage) - Number(a.win_percentage) || b.wins - a.wins || String(a.team?.full_name || '').localeCompare(String(b.team?.full_name || '')))
    .map((record, index) => ({ ...record, playoff_seed: index + 1 }));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestedSeason = Number(req.query.season);
  const season = Number.isInteger(requestedSeason) && requestedSeason >= 1997 && requestedSeason <= 2100
    ? requestedSeason
    : new Date().getFullYear();

  const apiKey = String(process.env.BDL_WNBA_API_KEY || '').trim();
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      keyValid: false,
      season,
      updatedAt: new Date().toISOString(),
      standings: [],
      playerSeasonStats: [],
      access: { standings: false, playerSeasonStats: false }
    });
  }

  let account = null;
  let accountError = null;
  try {
    account = await getAccountInfo(apiKey);
  } catch (error) {
    accountError = error;
  }

  let keyValid = Boolean(account);
  let tier = getWnbaTier(account);

  // If the account endpoint does not recognize the key or does not expose a WNBA
  // subscription, test a free WNBA endpoint directly before declaring the key invalid.
  if (!keyValid || !tier) {
    try {
      await request('/teams', apiKey);
      keyValid = true;
      if (!tier) tier = 'free';
    } catch (error) {
      if (error.status === 401) {
        return res.status(200).json({
          configured: true,
          keyValid: false,
          season,
          updatedAt: new Date().toISOString(),
          standings: [],
          playerSeasonStats: [],
          access: { standings: false, playerSeasonStats: false },
          providerErrors: {
            authentication: 'BALLDONTLIE rejected this API key for the free WNBA Teams endpoint (401). Check that the key was copied correctly and belongs to your BALLDONTLIE account.'
          }
        });
      }
      throw error;
    }
  }

  let standings = [];
  let standingsSource = null;
  let standingsError = null;

  if (canUseOfficialStandings(tier)) {
    try {
      const body = await request(`/standings?season=${encodeURIComponent(season)}`, apiKey);
      standings = (body.data || [])
        .filter(item => Number(item.season) === season)
        .sort((a, b) => Number(b.win_percentage) - Number(a.win_percentage));
      standingsSource = 'official';
    } catch (error) {
      standingsError = error;
    }
  }

  // Free-tier fallback: derive W-L records from completed regular-season games.
  if (!standings.length) {
    try {
      const games = await getAllRegularSeasonGames(season, apiKey);
      standings = deriveStandingsFromGames(games);
      standingsSource = 'games-derived';
    } catch (error) {
      standingsError = standingsError || error;
    }
  }

  let playerSeasonStats = [];
  let playerStatsError = null;
  if (canUsePlayerSeasonStats(tier)) {
    try {
      playerSeasonStats = await getAllPlayerSeasonStats(season, apiKey);
    } catch (error) {
      playerStatsError = error;
    }
  }

  return res.status(200).json({
    configured: true,
    keyValid,
    season,
    wnbaTier: tier,
    updatedAt: new Date().toISOString(),
    standings,
    standingsSource,
    playerSeasonStats,
    access: {
      standings: standings.length > 0,
      playerSeasonStats: playerSeasonStats.length > 0
    },
    providerErrors: {
      account: accountError ? accountError.message : null,
      standings: standingsError ? standingsError.message : null,
      playerSeasonStats: playerStatsError ? playerStatsError.message : null
    }
  });
};
