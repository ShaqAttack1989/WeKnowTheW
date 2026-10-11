const ALLOWED = [
  /^https:\/\/r2\.thesportsdb\.com\//i,
  /^https:\/\/(?:www\.)?thesportsdb\.com\//i,
  /^https:\/\/a\.espncdn\.com\//i,
  /^https:\/\/upload\.wikimedia\.org\//i
];

function allowedUrl(url='') {
  return ALLOWED.some(rule => rule.test(String(url)));
}

async function sendImage(res, url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*',
      'User-Agent': 'Mozilla/5.0'
    }
  });
  if (!response.ok) return false;
  const type = response.headers.get('content-type') || 'image/jpeg';
  if (!type.startsWith('image/')) return false;
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 600) return false;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(buffer);
  return true;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const src = String(req.query.src || '').trim();
  if (src) {
    if (!allowedUrl(src)) return res.status(400).end();
    try {
      if (await sendImage(res, src)) return;
    } catch {}
    return res.status(404).end();
  }

  const id = String(req.query.id || '').replace(/[^0-9]/g, '');
  if (!id) return res.status(400).end();

  const league = String(req.query.league || 'wnba').toLowerCase();
  const urls = league === 'ncaaw'
    ? [
      `https://a.espncdn.com/i/headshots/womens-college-basketball/players/full/${id}.png`,
      `https://a.espncdn.com/i/headshots/wnba/players/full/${id}.png`
    ]
    : [
      `https://a.espncdn.com/i/headshots/wnba/players/full/${id}.png`,
      `https://a.espncdn.com/i/headshots/womens-college-basketball/players/full/${id}.png`
    ];

  for (const url of urls) {
    try {
      if (await sendImage(res, url)) return;
    } catch {
      continue;
    }
  }

  return res.status(404).end();
};
