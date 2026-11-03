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

function easternTimestamp(date, time) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!dateMatch) return NaN;
  const timeMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*ET)?$/i.exec(String(time || "").trim());
  let hour = 23;
  let minute = 59;
  if (timeMatch) {
    hour = Number(timeMatch[1]) % 12;
    if (timeMatch[3].toUpperCase() === "PM") hour += 12;
    minute = Number(timeMatch[2]);
  }
  const nominal = Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]), hour, minute);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" }).formatToParts(new Date(nominal));
  const zoneName = (parts.find(part => part.type === "timeZoneName") || {}).value || "GMT";
  const offsetMatch = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(zoneName);
  const offsetMinutes = offsetMatch ? (offsetMatch[1] === "-" ? -1 : 1) * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3] || 0)) : 0;
  return nominal - offsetMinutes * 60 * 1000;
}

function officialOpeningGames(now = Date.now()) {
  const items = [seasonGuide.opener, ...(seasonGuide.openingDay || []), ...(seasonGuide.upcomingSpotlight || [])].filter(Boolean);
  return items
    .map((game, index) => ({
      id: "official-opening-" + (index + 1),
      date: game.date || "",
      time: game.time || "",
      status: "Scheduled",
      homeTeam: game.homeTeam || "",
      awayTeam: game.awayTeam || "",
      homeScore: null,
      awayScore: null,
      location: game.location || "",
      tv: game.tv || "",
      event: game.event || "",
      officialGuide: true
    }))
    .filter(game => {
      const timestamp = easternTimestamp(game.date, game.time);
      return !Number.isFinite(timestamp) || timestamp >= now;
    });
}

function officialRecentGames(season) {
  if (season !== seasonGuide.season) return [];
  return (seasonGuide.openingResults || []).map((game, index) => ({
    id: "official-result-" + (index + 1),
    date: game.date || "",
    time: "",
    status: "Final",
    homeTeam: game.homeTeam || "",
    awayTeam: game.awayTeam || "",
    homeScore: game.homeScore == null ? null : Number(game.homeScore),
    awayScore: game.awayScore == null ? null : Number(game.awayScore),
    location: game.location || "",
    tv: game.tv || "",
    event: game.event || game.label || "",
    sourceUrl: game.sourceUrl || "",
    officialGuide: true
  })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function mergeRecent(primary = [], fallback = []) {
  const seen = new Set();
  return [...primary, ...fallback].filter(game => {
    const key = [game.date, String(game.awayTeam || "").toLowerCase(), String(game.homeTeam || "").toLowerCase()].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 8);
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
      source: "TheSportsDB",
      league: "NCAA Division I Basketball Women",
      season: upcomingSeason,
      upcomingSeason,
      showingPriorSeason: false,
      upcoming: officialOpeningGames(),
      recent: officialRecentGames(upcomingSeason),
      providerMessage: "Live " + upcomingSeason + " stats are not connected; verified opening results and the 2025-26 season snapshot are shown.",
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

    const providerRecent = schedule
      .filter(event => eventTime(event) < now && event.intHomeScore !== null && event.intAwayScore !== null)
      .sort((a, b) => eventTime(b) - eventTime(a))
      .slice(0, 8)
      .map(normalize);
    let recent = mergeRecent(providerRecent, officialRecentGames(upcomingSeason));

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
        ? "The " + upcomingSeason + " schedule has not populated yet; verified opening results and the " + offseasonSnapshot.season + " archive remain visible."
        : schedule.length
          ? null
          : "The " + upcomingSeason + " schedule feed is empty; verified opening results remain visible while the full feed populates.",
      ...baseSnapshot
    });
  } catch (error) {
    return res.status(200).json({
      configured: true,
      source: "TheSportsDB",
      league: "NCAA Division I Basketball Women",
      season: upcomingSeason,
      upcomingSeason,
      showingPriorSeason: false,
      upcoming: officialOpeningGames(),
      recent: officialRecentGames(upcomingSeason).length ? officialRecentGames(upcomingSeason) : (offseasonSnapshot.tournamentFinish || []),
      providerMessage: "The live college feed is temporarily unavailable; verified opening results and the " + offseasonSnapshot.season + " archive remain visible.",
      providerStatus: error.status || null,
      ...baseSnapshot
    });
  }
};
