const RANKING_URL = 'https://www.fiba.basketball/en/ranking/women';

const WORLD_CUP_TEAMS = {
  USA: { name: 'USA', flag: '🇺🇸', aliases: ['USA', 'United States', 'United States of America'], rank: 1, points: 719.1 },
  FRA: { name: 'France', flag: '🇫🇷', aliases: ['France'], rank: 2, points: 596.6 },
  AUS: { name: 'Australia', flag: '🇦🇺', aliases: ['Australia'], rank: 3, points: 596.4 },
  CHN: { name: 'China', flag: '🇨🇳', aliases: ['China'], rank: 4, points: 585.8 },
  BEL: { name: 'Belgium', flag: '🇧🇪', aliases: ['Belgium'], rank: 5, points: 585.5 },
  ESP: { name: 'Spain', flag: '🇪🇸', aliases: ['Spain'], rank: 6, points: 574.2 },
  NGR: { name: 'Nigeria', flag: '🇳🇬', aliases: ['Nigeria'], rank: 8, points: 525.2 },
  JPN: { name: 'Japan', flag: '🇯🇵', aliases: ['Japan'], rank: 10, points: 505.1 },
  GER: { name: 'Germany', flag: '🇩🇪', aliases: ['Germany'], rank: 11, points: 504.8 },
  PUR: { name: 'Puerto Rico', flag: '🇵🇷', aliases: ['Puerto Rico'], rank: 13, points: 445.5 },
  ITA: { name: 'Italy', flag: '🇮🇹', aliases: ['Italy'], rank: 14, points: 412.6 },
  KOR: { name: 'Korea', flag: '🇰🇷', aliases: ['Korea', 'Republic of Korea'], rank: 15, points: 405.5 },
  TUR: { name: 'Türkiye', flag: '🇹🇷', aliases: ['Türkiye', 'Turkiye', 'Turkey'], rank: 16, points: 338.8 },
  CZE: { name: 'Czechia', flag: '🇨🇿', aliases: ['Czechia', 'Czech Republic'], rank: 17, points: 337.3 },
  MLI: { name: 'Mali', flag: '🇲🇱', aliases: ['Mali'], rank: 18, points: 302.4 },
  HUN: { name: 'Hungary', flag: '🇭🇺', aliases: ['Hungary'], rank: 19, points: 293.5 }
};

function decodeEntities(value = '') {
  return String(value)
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&rsquo;|&#8217;|&#x2019;/gi, '’')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function htmlToText(html = '') {
  return decodeEntities(String(html))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; WeKnowTheW/1.0; +https://www.weknowthew.com)'
      },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`FIBA returned ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackRows() {
  return Object.entries(WORLD_CUP_TEAMS)
    .map(([code, item]) => ({ code, name: item.name, flag: item.flag, worldRank: item.rank, rankingPoints: item.points }))
    .sort((a, b) => a.worldRank - b.worldRank);
}

function parseRows(text) {
  let parsedCount = 0;
  const rows = Object.entries(WORLD_CUP_TEAMS).map(([code, item]) => {
    const aliases = item.aliases.map(escapeRegExp).join('|');
    const pattern = new RegExp(`(?:^|\\s)(\\d{1,3})\\.\\s+(?:${aliases})\\s+\\d{1,2}\\.\\s+([\\d.]+)\\s+[+-]?\\d+`, 'i');
    const match = text.match(pattern);
    if (!match) return { code, name: item.name, flag: item.flag, worldRank: item.rank, rankingPoints: item.points };
    parsedCount += 1;
    return {
      code,
      name: item.name,
      flag: item.flag,
      worldRank: Number(match[1]),
      rankingPoints: Number(match[2])
    };
  });
  rows.sort((a, b) => a.worldRank - b.worldRank);
  return { rows, parsedCount };
}

function parseRankingDate(text) {
  const match = text.match(/Ranking dates?\s*(?:Select\s*)?([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/i);
  return match ? match[1] : 'Apr 1, 2026';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let rankings = fallbackRows();
  let rankingDate = 'Apr 1, 2026';
  let live = false;
  let warning = null;

  try {
    const html = await fetchText(RANKING_URL);
    const text = htmlToText(html);
    const parsed = parseRows(text);
    rankings = parsed.rows;
    rankingDate = parseRankingDate(text);
    live = parsed.parsedCount >= 12;
    if (!live) warning = 'Official FIBA ranking page was reached, but the full World Cup field could not be parsed. Verified ranking values are being used for missing teams.';
  } catch (error) {
    warning = 'Official FIBA ranking page could not be refreshed. Showing the verified Apr 1, 2026 FIBA World Ranking snapshot.';
  }

  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({
    competition: 'FIBA World Ranking Women, presented by NIKE',
    rankingDate,
    source: RANKING_URL,
    updatedAt: new Date().toISOString(),
    live,
    warning,
    rankings
  });
};
