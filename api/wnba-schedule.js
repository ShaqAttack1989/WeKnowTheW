const OFFICIAL_SCHEDULE_URL = 'https://cdn.wnba.com/static/json/staticData/scheduleLeagueV2.json';
const OFFICIAL_PAGE_URL = 'https://www.wnba.com/schedule?season=2026&month=all';
const TIME_ZONE = 'America/New_York';

function teamName(team = {}) {
  return [team.teamCity, team.teamName].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function easternDate(value, fallback = '') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function broadcasterLabels(broadcasters = {}) {
  const values = [];
  const seenObjects = new WeakSet();

  function walk(value) {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value !== 'object') return;
    if (seenObjects.has(value)) return;
    seenObjects.add(value);

    const media = `${value.broadcasterMedia || value.media || ''} ${value.type || ''}`.toLowerCase();
    if (!/radio|audio/.test(media)) {
      const label = value.broadcasterDisplay || value.broadcasterAbbreviation || value.broadcasterDescription || value.displayName || value.name;
      if (label) values.push(String(label).trim());
    }

    Object.values(value).forEach(child => {
      if (child && typeof child === 'object') walk(child);
    });
  }

  walk(broadcasters);
  const seen = new Set();
  return values.filter(label => {
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeGame(game = {}, groupDate = '') {
  const homeTeam = teamName(game.homeTeam);
  const awayTeam = teamName(game.awayTeam);
  const dateTime = game.gameDateTimeUTC || game.gameDateTimeEst || game.gameDateTime || '';
  const date = easternDate(dateTime, String(groupDate || game.gameDate || '').slice(0, 10));
  const arena = game.arena || {};
  return {
    gameId: String(game.gameId || ''),
    date,
    startTimeUtc: game.gameDateTimeUTC || '',
    homeTeam,
    awayTeam,
    venue: arena.arenaName || game.arenaName || '',
    arenaCity: arena.arenaCity || game.arenaCity || '',
    arenaState: arena.arenaState || game.arenaState || '',
    broadcasts: broadcasterLabels(game.broadcasters),
    seasonType: String(game.gameLabel || game.gameSubtype || game.seriesText || ''),
    status: Number(game.gameStatus) || null,
    statusText: String(game.gameStatusText || '')
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(OFFICIAL_SCHEDULE_URL, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0)',
        Referer: 'https://www.wnba.com/'
      }
    });
    if (!response.ok) throw new Error(`WNBA schedule returned ${response.status}`);
    const payload = await response.json();
    const groups = Array.isArray(payload?.leagueSchedule?.gameDates) ? payload.leagueSchedule.gameDates : [];
    const games = groups.flatMap(group => (Array.isArray(group.games) ? group.games : []).map(game => normalizeGame(game, group.gameDate))).filter(game => game.homeTeam && game.awayTeam);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    return res.status(200).json({
      source: 'Official WNBA schedule',
      sourceUrl: OFFICIAL_PAGE_URL,
      scheduleDataUrl: OFFICIAL_SCHEDULE_URL,
      updatedAt: new Date().toISOString(),
      gameCount: games.length,
      games
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      error: 'Official WNBA schedule is temporarily unavailable.',
      message: error.message,
      sourceUrl: OFFICIAL_PAGE_URL
    });
  }
};
