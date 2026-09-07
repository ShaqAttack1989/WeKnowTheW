const USA_BASKETBALL = 'https://www.usab.com';
const VERIFIED_AT = '2026-09-07T17:30:00.000Z';

const REQUEST_HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)',
  'X-Requested-With': 'XMLHttpRequest'
};

function game(date, opponent, pointsFor, pointsAgainst, stage, tournament) {
  return { date, opponent, pointsFor, pointsAgainst, stage, tournament, status: 'final' };
}

const CONFIG = {
  '3x3': {
    title: '3x3 Stat Kitchen',
    description: 'The latest senior USA 3x3 championship record, scoring pace and recent results.',
    href: '/team-usa-3x3.html',
    spotlight: {
      season: '2026',
      label: 'WORLD CHAMPIONS',
      value: '7–0 in Warsaw',
      note: 'USA finished the World Cup with a 21–20 win over Australia.'
    },
    sources: [{
      slug: '3x3-womens-world-cup',
      label: 'FIBA 3x3 Women’s World Cup',
      teamId: 44,
      seasonId: 13,
      season: '2026',
      refreshMetaAfter: '2027-01-01T00:00:00.000Z',
      tournament: /3x3.*world cup/i,
      games: [
        game('2026-06-02T16:55:00.000Z', 'Hungary', 18, 15, 'Pool B', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-02T18:45:00.000Z', 'Australia', 21, 18, 'Pool B', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-04T16:30:00.000Z', 'Mongolia', 20, 17, 'Pool B', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-04T18:20:00.000Z', 'Spain', 21, 18, 'Pool B', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-06T17:25:00.000Z', 'France', 18, 16, 'Quarterfinals', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-07T15:30:00.000Z', 'Azerbaijan', 19, 18, 'Semifinals', 'FIBA 3x3 Women’s World Cup'),
        game('2026-06-07T18:45:00.000Z', 'Australia', 21, 20, 'Final', 'FIBA 3x3 Women’s World Cup')
      ]
    }]
  },
  olympics: {
    title: 'Olympic Stat Kitchen',
    description: 'The most recent USA Olympic tournament, isolated from exhibitions and showcase games.',
    href: '/team-usa-olympics.html',
    spotlight: {
      season: '2024',
      label: 'GOLD MEDAL GAME',
      value: 'USA 67, France 66',
      note: 'One point preserved the eighth consecutive Olympic title.'
    },
    sources: [{
      slug: '5x5-womens-olympics',
      label: 'Women’s Olympic Games',
      teamId: 52,
      seasonId: 5,
      season: '2024',
      refreshMetaAfter: '2028-01-01T00:00:00.000Z',
      tournament: /olympic games|olympic-games/i,
      games: [
        game('2024-07-29T19:00:00.000Z', 'Japan', 102, 76, 'Group Phase', 'Women’s 5x5 Olympic Games Paris'),
        game('2024-08-01T19:00:00.000Z', 'Belgium', 87, 74, 'Group Phase', 'Women’s 5x5 Olympic Games Paris'),
        game('2024-08-04T15:15:00.000Z', 'Germany', 87, 68, 'Group Phase', 'Women’s 5x5 Olympic Games Paris'),
        game('2024-08-07T19:30:00.000Z', 'Nigeria', 88, 74, 'Quarterfinals', 'Women’s 5x5 Olympic Games Paris'),
        game('2024-08-09T15:30:00.000Z', 'Australia', 85, 64, 'Semifinals', 'Women’s 5x5 Olympic Games Paris'),
        game('2024-08-11T13:30:00.000Z', 'France', 67, 66, 'Gold Medal Game', 'Women’s 5x5 Olympic Games Paris')
      ]
    }]
  },
  americup: {
    title: 'AmeriCup Stat Kitchen',
    description: 'USA’s latest continental title run, with every official result folded into the rates.',
    href: '/team-usa-americup.html',
    spotlight: {
      season: '2025',
      label: 'TOURNAMENT MVP',
      value: 'Mikayla Blakes',
      note: 'Blakes scored 27 points in the championship game.'
    },
    sources: [{
      slug: '5x5-womens-americup',
      label: 'FIBA Women’s AmeriCup',
      teamId: 23,
      seasonId: 4,
      season: '2025',
      refreshMetaAfter: '2027-01-01T00:00:00.000Z',
      tournament: /women.*americup/i,
      games: [
        game('2025-06-29T00:25:00.000Z', 'Chile', 108, 47, 'Group Phase', 'FIBA Women’s AmeriCup'),
        game('2025-06-30T00:10:00.000Z', 'Colombia', 80, 43, 'Group Phase', 'FIBA Women’s AmeriCup'),
        game('2025-07-01T00:10:00.000Z', 'Puerto Rico', 80, 62, 'Group Phase', 'FIBA Women’s AmeriCup'),
        game('2025-07-02T18:10:00.000Z', 'Mexico', 104, 48, 'Group Phase', 'FIBA Women’s AmeriCup'),
        game('2025-07-04T15:40:00.000Z', 'Dominican Republic', 110, 44, 'Quarterfinals', 'FIBA Women’s AmeriCup'),
        game('2025-07-05T21:40:00.000Z', 'Canada', 65, 53, 'Semifinals', 'FIBA Women’s AmeriCup'),
        game('2025-07-07T00:10:00.000Z', 'Brazil', 92, 84, 'Final', 'FIBA Women’s AmeriCup')
      ]
    }]
  },
  qualifying: {
    title: 'Qualifying Stat Kitchen',
    description: 'The latest 5 on 5 qualifying window, including the record and possession level scoring results.',
    href: '/team-usa-qualifying.html',
    spotlight: {
      season: '2026',
      label: 'BERLIN TICKET',
      value: '5–0 in San Juan',
      note: 'USA closed the qualifying tournament with an 84–70 win over Spain.'
    },
    sources: [{
      slug: '5x5-womens-olympic-world-cup-qualifying',
      label: 'Women’s World Cup Qualifying',
      teamId: 68,
      seasonId: 13,
      season: '2026',
      refreshMetaAfter: '2027-01-01T00:00:00.000Z',
      tournament: /qualifying/i,
      games: [
        game('2026-03-11T21:00:00.000Z', 'Senegal', 110, 46, 'Round Robin', 'Women’s World Cup Qualifying Tournament'),
        game('2026-03-13T00:00:00.000Z', 'Puerto Rico', 91, 48, 'Round Robin', 'Women’s World Cup Qualifying Tournament'),
        game('2026-03-14T21:00:00.000Z', 'Italy', 93, 59, 'Round Robin', 'Women’s World Cup Qualifying Tournament'),
        game('2026-03-15T18:00:00.000Z', 'New Zealand', 101, 46, 'Round Robin', 'Women’s World Cup Qualifying Tournament'),
        game('2026-03-17T21:00:00.000Z', 'Spain', 84, 70, 'Round Robin', 'Women’s World Cup Qualifying Tournament')
      ]
    }]
  },
  development: {
    title: 'Junior Teams Stat Kitchen',
    description: 'The latest U18 and U17 title runs on one board, with each competition kept identifiable.',
    href: '/team-usa-development.html',
    spotlight: {
      season: '2026',
      label: 'DOUBLE GOLD',
      value: 'U18 + U17',
      note: 'Two age groups finished the summer as continental and world champions.'
    },
    sources: [
      {
        slug: '5x5-womens-u18-americup',
        label: 'U18 Women’s AmeriCup',
        teamId: 28,
        seasonId: 13,
        season: '2026',
        refreshMetaAfter: '2027-01-01T00:00:00.000Z',
        tournament: /u18.*americup/i,
        games: [
          game('2026-06-09T23:30:00.000Z', 'Argentina', 113, 47, 'Group Phase', 'FIBA U18 Women’s AmeriCup'),
          game('2026-06-11T02:00:00.000Z', 'Mexico', 125, 53, 'Group Phase', 'FIBA U18 Women’s AmeriCup'),
          game('2026-06-12T18:30:00.000Z', 'Paraguay', 123, 41, 'Group Phase', 'FIBA U18 Women’s AmeriCup'),
          game('2026-06-15T02:00:00.000Z', 'Venezuela', 104, 51, 'Semifinals', 'FIBA U18 Women’s AmeriCup'),
          game('2026-06-16T02:00:00.000Z', 'Canada', 90, 72, 'Final', 'FIBA U18 Women’s AmeriCup')
        ]
      },
      {
        slug: '5x5-womens-u17-world-cup',
        label: 'U17 Women’s World Cup',
        teamId: 29,
        seasonId: 13,
        season: '2026',
        refreshMetaAfter: '2027-01-01T00:00:00.000Z',
        tournament: /u17.*world cup/i,
        games: [
          game('2026-07-11T10:00:00.000Z', 'Ivory Coast', 117, 24, 'Group A', 'FIBA U17 Women’s World Cup'),
          game('2026-07-12T18:15:00.000Z', 'Australia', 74, 72, 'Group A', 'FIBA U17 Women’s World Cup'),
          game('2026-07-14T12:45:00.000Z', 'Latvia', 105, 53, 'Group A', 'FIBA U17 Women’s World Cup'),
          game('2026-07-15T12:45:00.000Z', 'Mexico', 112, 36, 'Round of 16', 'FIBA U17 Women’s World Cup'),
          game('2026-07-17T18:15:00.000Z', 'Slovenia', 77, 57, 'Quarterfinals', 'FIBA U17 Women’s World Cup'),
          game('2026-07-18T18:45:00.000Z', 'Canada', 86, 60, 'Semifinals', 'FIBA U17 Women’s World Cup'),
          game('2026-07-19T18:15:00.000Z', 'Spain', 82, 73, 'Final', 'FIBA U17 Women’s World Cup')
        ]
      }
    ]
  }
};

function decodeEntities(value = '') {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`USA Basketball returned ${response.status}`);
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveTeamMeta(source) {
  const sourceUrl = `${USA_BASKETBALL}/teams/${source.slug}/schedules`;
  const response = await fetchWithTimeout(sourceUrl, {
    headers: { ...REQUEST_HEADERS, Accept: 'text/html,application/xhtml+xml' }
  });
  const html = await response.text();
  const match = html.match(/<div\s+id="app"\s+data-page="([^"]*)"/i);
  if (!match) throw new Error('USA Basketball team metadata was not found');
  const page = JSON.parse(decodeEntities(match[1]));
  const team = page?.props?.team?.data;
  if (!team?.id || !team?.current_season?.id) throw new Error('USA Basketball season metadata was incomplete');
  return {
    teamId: Number(team.id),
    seasonId: Number(team.current_season.id),
    season: String(team.current_season.title || source.season),
    sourceUrl
  };
}

async function fetchSchedule(source, meta) {
  const url = new URL('/api/schedule-events/', USA_BASKETBALL);
  url.searchParams.set('perPage', '100');
  url.searchParams.set('page', '0');
  url.searchParams.append('include[]', 'tournamentGroup');
  url.searchParams.append('include[]', 'tournamentRound');
  url.searchParams.append('include[]', 'links');
  url.searchParams.append('include[]', 'tournament');
  url.searchParams.append('sort[]', 'start_datetime');
  url.searchParams.set('filter[team_id]', String(meta.teamId));
  url.searchParams.set('filter[season_id]', String(meta.seasonId));

  const response = await fetchWithTimeout(url, {
    headers: { ...REQUEST_HEADERS, Referer: `${meta.sourceUrl}?season=${meta.seasonId}` }
  });
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) throw new Error('USA Basketball schedule response was incomplete');
  return payload.data
    .filter(item => item?.display_on_calendar !== false)
    .filter(item => {
      const tournament = `${item?.tournament?.title || ''} ${item?.tournament?.slug || ''}`;
      return !source.tournament || source.tournament.test(tournament);
    });
}

function isUsa(value) {
  const normalized = String(value || '').toLowerCase().replace(/[^a-z]/g, '');
  return normalized === 'usa' || normalized === 'unitedstates' || normalized.startsWith('usawomen');
}

function officialLink(item, fallback) {
  const links = Array.isArray(item?.links) ? item.links : [];
  const preferred = links.find(link => /box score/i.test(link?.title || '')) ||
    links.find(link => /recap/i.test(link?.title || '')) ||
    links.find(link => /^https:\/\//i.test(link?.url || ''));
  return preferred?.url || fallback;
}

function normalizeEvent(item, source, meta) {
  const first = item?.first_team_name;
  const second = item?.second_team_name;
  const firstIsUsa = isUsa(first);
  const secondIsUsa = isUsa(second);
  if (!firstIsUsa && !secondIsUsa) return null;

  const rawFor = firstIsUsa ? item.first_team_score : item.second_team_score;
  const rawAgainst = firstIsUsa ? item.second_team_score : item.first_team_score;
  const pointsFor = rawFor === null || rawFor === undefined ? null : Number(rawFor);
  const pointsAgainst = rawAgainst === null || rawAgainst === undefined ? null : Number(rawAgainst);
  const final = item.status === 'completed' || (Number.isFinite(pointsFor) && Number.isFinite(pointsAgainst));
  const opponent = decodeEntities(firstIsUsa ? second : first) || 'TBD';
  const result = final ? (pointsFor > pointsAgainst ? 'W' : pointsFor < pointsAgainst ? 'L' : 'T') : null;

  return {
    id: String(item.id || `${source.slug}-${item.start_datetime || opponent}`),
    date: item.start_datetime || null,
    opponent,
    pointsFor: Number.isFinite(pointsFor) ? pointsFor : null,
    pointsAgainst: Number.isFinite(pointsAgainst) ? pointsAgainst : null,
    stage: decodeEntities(item.stage || item.status_label || (final ? 'Final' : 'Scheduled')),
    tournament: decodeEntities(item?.tournament?.title || source.label),
    status: final ? 'final' : 'scheduled',
    result,
    sourceLabel: source.label,
    sourceUrl: officialLink(item, meta.sourceUrl)
  };
}

function fallbackGames(source, sourceUrl) {
  return source.games.map((item, index) => ({
    ...item,
    id: `verified-${source.slug}-${index + 1}`,
    result: item.pointsFor > item.pointsAgainst ? 'W' : item.pointsFor < item.pointsAgainst ? 'L' : 'T',
    sourceLabel: source.label,
    sourceUrl
  }));
}

async function loadSource(source) {
  const fallbackMeta = {
    teamId: source.teamId,
    seasonId: source.seasonId,
    season: source.season,
    sourceUrl: `${USA_BASKETBALL}/teams/${source.slug}/schedules`
  };
  let meta = fallbackMeta;
  let metadataLive = false;
  const warnings = [];

  const shouldRefreshMeta = !source.refreshMetaAfter || Date.now() >= new Date(source.refreshMetaAfter).getTime();
  if (shouldRefreshMeta) {
    try {
      meta = await resolveTeamMeta(source);
      metadataLive = true;
    } catch (error) {
      warnings.push(`Team and season check: ${error.message}`);
    }
  }

  try {
    const events = await fetchSchedule(source, meta);
    const normalized = events.map(item => normalizeEvent(item, source, meta)).filter(Boolean);
    if (normalized.length || meta.season !== source.season) {
      return { source, meta, games: normalized, official: true, metadataLive, warnings };
    }
    warnings.push('Official schedule was empty, so the last verified snapshot is being served.');
  } catch (error) {
    warnings.push(`Schedule check: ${error.message}`);
  }

  return {
    source,
    meta: fallbackMeta,
    games: fallbackGames(source, fallbackMeta.sourceUrl),
    official: false,
    metadataLive,
    warnings
  };
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function summarizeGames(games) {
  const completed = games.filter(item => item.status === 'final' && Number.isFinite(item.pointsFor) && Number.isFinite(item.pointsAgainst));
  const wins = completed.filter(item => item.pointsFor > item.pointsAgainst).length;
  const losses = completed.filter(item => item.pointsFor < item.pointsAgainst).length;
  const ties = completed.length - wins - losses;
  const pointsFor = completed.reduce((sum, item) => sum + item.pointsFor, 0);
  const pointsAgainst = completed.reduce((sum, item) => sum + item.pointsAgainst, 0);
  const count = completed.length;
  return {
    completed,
    wins,
    losses,
    ties,
    record: `${wins}–${losses}${ties ? `–${ties}` : ''}`,
    pointsForPerGame: count ? roundOne(pointsFor / count) : null,
    pointsAgainstPerGame: count ? roundOne(pointsAgainst / count) : null,
    marginPerGame: count ? roundOne((pointsFor - pointsAgainst) / count) : null
  };
}

function sourceRecord(result) {
  const summary = summarizeGames(result.games);
  return {
    label: result.source.label,
    season: result.meta.season,
    record: summary.record,
    gamesPlayed: summary.completed.length,
    official: result.official,
    sourceUrl: result.meta.sourceUrl
  };
}

async function buildBoard(key, config) {
  const results = await Promise.all(config.sources.map(loadSource));
  const games = results.flatMap(result => result.games).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  const summary = summarizeGames(games);
  const upcoming = games
    .filter(item => item.status !== 'final')
    .filter(item => !item.date || new Date(item.date).getTime() >= Date.now() - 12 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.date || 8640000000000000) - new Date(b.date || 8640000000000000));
  const recentGames = [...summary.completed].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);
  const officialSources = results.filter(result => result.official).length;
  const seasonLabel = [...new Set(results.map(result => result.meta.season).filter(Boolean))].join(' + ') || 'Current';
  const currentSpotlight = config.spotlight?.season === seasonLabel ? config.spotlight : null;
  const latest = recentGames[0];
  const spotlight = currentSpotlight || (latest ? {
    label: 'LATEST RESULT',
    value: `${latest.result} ${latest.pointsFor}–${latest.pointsAgainst}`,
    note: `USA vs. ${latest.opponent}, ${latest.stage}`
  } : {
    label: 'NEXT SERVING',
    value: upcoming[0] ? `USA vs. ${upcoming[0].opponent}` : 'Schedule pending',
    note: 'The board will populate when USA Basketball posts the next official assignment.'
  });

  return {
    key,
    title: config.title,
    description: config.description,
    href: config.href,
    season: seasonLabel,
    updatedAt: new Date().toISOString(),
    verifiedAt: VERIFIED_AT,
    refreshMinutes: 60,
    sourceStatus: officialSources === results.length
      ? 'Official USA Basketball feed'
      : officialSources
        ? 'Official feed with verified backup'
        : 'Verified snapshot, official feed retrying',
    official: officialSources > 0,
    officialSourceCount: officialSources,
    totalSourceCount: results.length,
    metrics: [
      { label: 'RECORD', value: summary.record, note: `${summary.completed.length} official game${summary.completed.length === 1 ? '' : 's'}` },
      { label: 'PTS / GAME', value: summary.pointsForPerGame, note: 'USA scoring average' },
      { label: 'OPP PTS / GAME', value: summary.pointsAgainstPerGame, note: 'USA defensive average' },
      { label: 'AVG MARGIN', value: summary.marginPerGame, signed: true, note: 'Point differential per game' }
    ],
    record: summary.record,
    gamesPlayed: summary.completed.length,
    pointsForPerGame: summary.pointsForPerGame,
    pointsAgainstPerGame: summary.pointsAgainstPerGame,
    marginPerGame: summary.marginPerGame,
    nextGame: upcoming[0] || null,
    recentGames,
    spotlight,
    sourceRecords: results.map(sourceRecord),
    sources: results.map(result => ({ label: result.source.label, url: result.meta.sourceUrl, official: result.official })),
    warnings: results.flatMap(result => result.warnings)
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requested = String(req.query?.competition || '').trim().toLowerCase();
  if (requested && !CONFIG[requested]) {
    return res.status(400).json({ error: 'Unknown Team USA competition' });
  }

  const entries = requested ? [[requested, CONFIG[requested]]] : Object.entries(CONFIG);
  const boards = {};
  const results = await Promise.all(entries.map(([key, config]) => buildBoard(key, config)));
  results.forEach(board => { boards[board.key] = board; });

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=2700');
  return res.status(200).json({
    updatedAt: new Date().toISOString(),
    refreshMinutes: 60,
    source: 'USA Basketball',
    boards
  });
};
