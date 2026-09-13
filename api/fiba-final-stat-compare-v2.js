const VERIFIED_SPLITS = {
  USA: { games: 5, orbTotal: 69, drbTotal: 158 },
  FRA: { games: 5, orbTotal: 53, drbTotal: 136 }
};

const GROUP_BY_KEY = {
  wins: 'Record', losses: 'Record', winPct: 'Record',
  ppg: 'Scoring', totalPoints: 'Scoring',
  fgmPg: 'Shooting', fgaPg: 'Shooting', fgPct: 'Shooting',
  twoMpg: 'Shooting', twoApg: 'Shooting', twoPct: 'Shooting',
  threeMpg: 'Shooting', threeApg: 'Shooting', threePct: 'Shooting',
  ftmPg: 'Shooting', ftaPg: 'Shooting', ftPct: 'Shooting',
  orbPg: 'Rebounding', drbPg: 'Rebounding', rebPg: 'Rebounding',
  astPg: 'Possessions', toPg: 'Possessions', astTo: 'Possessions',
  stlPg: 'Defense', blkPg: 'Defense', foulPg: 'Defense',
  effPg: 'Team impact', oppPpg: 'Team impact', margin: 'Team impact',
  orbTotal: 'Totals', drbTotal: 'Totals', rebTotal: 'Totals', astTotal: 'Totals',
  toTotal: 'Totals', stlTotal: 'Totals', blkTotal: 'Totals', foulTotal: 'Totals',
  fgaTotal: 'Totals', threeATotal: 'Totals'
};

const SPLIT_KEYS = new Set(['orbPg', 'drbPg', 'orbTotal', 'drbTotal']);

function splitValue(code, key) {
  const team = VERIFIED_SPLITS[code];
  if (!team) return null;
  if (key === 'orbTotal') return String(team.orbTotal);
  if (key === 'drbTotal') return String(team.drbTotal);
  if (key === 'orbPg') return (team.orbTotal / team.games).toFixed(1);
  if (key === 'drbPg') return (team.drbTotal / team.games).toFixed(1);
  return null;
}

function patchRecommendations(items) {
  const source = Array.isArray(items) ? items : [];
  const patched = source.map(item => ({ ...item }));
  const extraIndex = patched.findIndex(item => item?.title === 'Extra possessions');
  const extra = {
    title: 'Extra possessions',
    lean: 'USA',
    note: 'USA has the stronger rebounding profile through the semifinals. The clearest path is ending France possessions with the defensive rebound while creating second chances at the other end.',
    details: [
      { category: 'Offensive rebounds per game', usa: '13.8', france: '10.6', edge: 'USA' },
      { category: 'Defensive rebounds per game', usa: '31.6', france: '27.2', edge: 'USA' },
      { category: 'Total rebounds per game', usa: '45.4', france: '37.8', edge: 'USA' },
      { category: 'Points allowed per game', usa: '59.8', france: '60.6', edge: 'USA' }
    ]
  };
  if (extraIndex >= 0) patched[extraIndex] = extra;
  else patched.push(extra);
  return patched;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.weknowthew.com').split(',')[0].trim();
    const response = await fetch(`${proto}://${host}/api/fiba-final-stat-compare?cb=${Date.now()}`, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`FIBA comparison base returned ${response.status}`);

    const payload = await response.json();
    const categories = Array.isArray(payload.categories) ? payload.categories : [];

    payload.categories = categories.map(row => {
      const next = { ...row, group: row.group || GROUP_BY_KEY[row.key] || 'Other' };
      if (!SPLIT_KEYS.has(row.key)) return next;
      return {
        ...next,
        usa: { ...row.usa, value: splitValue('USA', row.key) },
        france: { ...row.france, value: splitValue('FRA', row.key) },
        valueSource: 'verified-game-box-scores'
      };
    });

    const missing = payload.categories
      .filter(row => !row?.usa?.value || !row?.france?.value || row.usa.value === '—' || row.france.value === '—')
      .map(row => row.label);

    payload.categoryCount = payload.categories.length;
    payload.completeCategoryCount = payload.categories.length - missing.length;
    payload.missingCategories = missing;
    payload.recommendations = patchRecommendations(payload.recommendations);
    payload.verifiedReboundSplits = {
      through: 'semifinals',
      USA: {
        offensiveRebounds: 69,
        defensiveRebounds: 158,
        offensiveReboundsPerGame: 13.8,
        defensiveReboundsPerGame: 31.6,
        totalRebounds: 227,
        totalReboundsPerGame: 45.4
      },
      FRA: {
        offensiveRebounds: 53,
        defensiveRebounds: 136,
        offensiveReboundsPerGame: 10.6,
        defensiveReboundsPerGame: 27.2,
        totalRebounds: 189,
        totalReboundsPerGame: 37.8
      },
      note: 'The FIBA competition team endpoint omits offensive and defensive rebound splits. These values are reconstructed from each finalist’s five completed World Cup game box scores through the semifinals and reconcile to the official total rebounding averages.'
    };
    payload.methodology = `${payload.methodology || ''} Offensive and defensive rebound splits for USA and France use verified game-by-game box score totals because the competition team endpoint omits those fields.`.trim();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(payload);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: error.message || 'FIBA comparison unavailable' });
  }
};