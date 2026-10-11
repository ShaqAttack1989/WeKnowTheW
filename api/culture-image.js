const ALLOWED_HOSTS = new Set([
  'www.wnba.com','wnba.com','dream.wnba.com','sky.wnba.com','sun.wnba.com','wings.wnba.com',
  'valkyries.wnba.com','valkyries.com','fever.wnba.com','aces.wnba.com','sparks.wnba.com',
  'lynx.wnba.com','liberty.wnba.com','mercury.wnba.com','fire.wnba.com','storm.wnba.com',
  'tempo.wnba.com','mystics.wnba.com','www.gettyimages.com'
]);

function decodeEntities(value = '') {
  return String(value).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  let target;
  try { target = new URL(String(req.query.url || '')); } catch { return res.status(400).json({ found:false }); }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) return res.status(400).json({ found:false });
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  try {
    const response = await fetch(target, { headers: { 'User-Agent':'Mozilla/5.0 WeKnowTheW/1.0', Accept:'text/html' } });
    if (!response.ok) return res.status(200).json({ found:false });
    const html = await response.text();
    const match = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i);
    if (!match?.[1]) return res.status(200).json({ found:false });
    const image = new URL(decodeEntities(match[1]), target).toString();
    return res.status(200).json({ found:true, image, sourceUrl:target.toString() });
  } catch {
    return res.status(200).json({ found:false });
  }
};
