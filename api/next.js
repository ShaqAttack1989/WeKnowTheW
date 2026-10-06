const LEAGUE_ID = 5789;
const V2_ROOT = 'https://www.thesportsdb.com/api/v2/json';
const offseasonSnapshot = require('../college-snapshot-2025-26.json');
const seasonGuide = require('../college-season-2026-27.json');

function seasonLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return now.getUTCMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

function previousSeasonLabel(season) {
  const match = String(season).match(/^(\d{4})-(\d{4})$/);
  if (!match) return season;
  const start = Number(match[1]) - 1;
  const end = Number(match[2]) - 1;
  return `${start}-${end}`;
}

async function fetchJson(url, apiKey) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-API-KEY': apiKey
    }
  });

  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!response.ok) {
    const message = body?.message || body?.Message || body?.error || `TheSportsDB returned ${response.status}`;
    const error = new Error(String(message));
    error.status = response.status;
    throw error;
  }

  return body;
}

async function fetchSchedule(season, apiKey) {
  const body = await fetchJson(`${V2_ROOT}/schedule/league/${LEAGUE_ID}/${encodeURIComponent(season)}`, apiKey);
  return Array.isArray(body.schedule) ? body.schedule : [];
}

function eventTime(event) {
  const date = event.dateEvent || '';
  const time = event.strTime || '12:00:00';
  const value = Date.parse(`${date}T${time.replace('Z', '')}Z`);
  return Number.isFinite(value) ? value : Date.parse(`${date}T12:00:00Z`);
}

function seasonHasStarted(schedule, now = Date.now()) {
  if (!schedule.length) return false;
  const validTimes = schedule.map(eventTime).filter(Number.isFinite);
  if (!validTimes.length) return false;
  return Math.min(...validTimes) <= now;
}

function normalize(event) {
  return {
    id: event.idEvent,
    date: event.dateEvent,
    time: event.strTime || '',
    status: event.strStatus || '',
    homeTeam: event.strHomeTeam || '',
    awayTeam: event.strAwayTeam || '',
    homeScore: event.intHomeScore === null || event.intHomeScore === '' ? null : Number(event.intHomeScore),
    awayScore: event.intAwayScore === null || event.intAwayScore === '' ? null : Number(event.intAwayScore)
  };
}

function officialOpeningGames(now = Date.now()) {
  const items = [seasonGuide.opener, ...(seasonGuide.openingDay || [])].filter(Boolean);
  return items
    .map((game,index)=>({
      id:`official-opening-${index+1}`,
      date:game.date||'',
      time:game.time||'',
      status:'Scheduled',
      homeTeam:game.homeTeam||'',
      awayTeam:game.awayTeam||'',
      homeScore:null,
      awayScore:null,
      location:game.location||'',
      tv:game.tv||'',
      event:game.event||'',
      officialGuide:true
    }))
    .filter(game=>{
      const raw=game.time&&game.time!=='TBD'
        ? `${game.date} ${game.time.replace(/\s*ET$/i,'')} GMT-0400`
        : `${game.date}T23:59:59-04:00`;
      const ts=Date.parse(raw);
      return !Number.isFinite(ts)||ts>=now;
    });
}

function mergeUpcoming(primary=[],fallback=[]){
  const seen=new Set();
  return [...primary,...fallback].filter(game=>{
    const key=[game.date,String(game.awayTeam||'').toLowerCase(),String(game.homeTeam||'').toLowerCase()].join('|');
    if(seen.has(key))return false;
    seen.add(key);return true;
  }).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||''))).slice(0,10);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = String(process.env.THESPORTSDB_API_KEY || '').trim();
  const requestedSeason = req.query.season ? String(req.query.season).trim() : '';
  const upcomingSeason = requestedSeason || seasonLabel();
  const priorSeason = previousSeasonLabel(upcomingSeason);
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const baseSnapshot = {
    snapshot: offseasonSnapshot,
    snapshotSource: 'NCAA.com',
    seasonGuide
  };

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season: offseasonSnapshot.season,
      upcomingSeason,
      showingPriorSeason: true,
      upcoming: officialOpeningGames(),
      recent: offseasonSnapshot.tournamentFinish || [],
      providerMessage: `The 2025-26 record book remains visible while the official 2026-27 opening calendar is now on deck for Nov. 1.`,
      ...baseSnapshot
    });
  }

  try {
    const now = Date.now();
    let season = upcomingSeason;
    let schedule = await fetchSchedule(upcomingSeason, apiKey);
    let showingPriorSeason = false;

    if (!requestedSeason && !seasonHasStarted(schedule, now)) {
      const priorSchedule = await fetchSchedule(priorSeason, apiKey);
      if (priorSchedule.length) {
        season = priorSeason;
        schedule = priorSchedule;
        showingPriorSeason = true;
      } else {
        season = offseasonSnapshot.season;
        showingPriorSeason = true;
      }
    }

    const providerUpcoming = schedule
      .filter(event => eventTime(event) >= now)
      .sort((a, b) => eventTime(a) - eventTime(b))
      .slice(0, 10)
      .map(normalize);
    const upcoming = mergeUpcoming(providerUpcoming, officialOpeningGames(now));

    let recent = schedule
      .filter(event => eventTime(event) < now && event.intHomeScore !== null && event.intAwayScore !== null)
      .sort((a, b) => eventTime(b) - eventTime(a))
      .slice(0, 8)
      .map(normalize);

    if (!recent.length && showingPriorSeason) {
      recent = offseasonSnapshot.tournamentFinish || [];
    }

    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season,
      upcomingSeason,
      showingPriorSeason,
      updatedAt: new Date().toISOString(),
      eventCount: schedule.length,
      upcoming,
      recent,
      providerMessage: showingPriorSeason
        ? `Showing the ${offseasonSnapshot.season} results beside the official ${upcomingSeason} opening calendar. The season tips Nov. 1 in Rome.`
        : schedule.length
          ? null
          : `The official ${upcomingSeason} opening calendar is loaded while the independent full-season feed continues to populate.`,
      ...baseSnapshot
    });
  } catch (error) {
    return res.status(200).json({
      configured: true,
      source: 'TheSportsDB',
      league: 'NCAA Division I Basketball Women',
      season: offseasonSnapshot.season,
      upcomingSeason,
      showingPriorSeason: true,
      upcoming: officialOpeningGames(),
      recent: offseasonSnapshot.tournamentFinish || [],
      providerMessage: `The independent schedule feed is temporarily unavailable, so the official ${seasonGuide.season} opening calendar is being used.`,
      providerStatus: error.status || null,
      ...baseSnapshot
    });
  }
};
