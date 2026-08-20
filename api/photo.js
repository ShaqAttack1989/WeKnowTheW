module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
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

  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'image/png,image/jpeg,image/*',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      if (!response.ok) continue;
      const type = response.headers.get('content-type') || 'image/png';
      if (!type.startsWith('image/')) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 800) continue;
      res.setHeader('Content-Type', type);
      return res.status(200).send(buffer);
    } catch {
      continue;
    }
  }

  return res.status(404).end();
};
