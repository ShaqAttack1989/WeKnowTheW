const TEAM_SOURCES = {
  usa: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/sonia-citron-kiki-iriafen-join-usas-star-studded-cast-for-berlin',
  france: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/frontrunners-france-name-final-roster-for-berlin',
  spain: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/spain-looking-ready-for-a-podium-push',
  belgium: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/go-time-for-history-chasing-belgium',
  australia: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/australia-announce-their-final-roster-for-berlin',
  germany: 'https://www.fiba.basketball/en/events/fiba-womens-basketball-world-cup-2026/news/team-profile-are-germany-standing-on-the-verge-of-history'
};

function decode(value='') {
  return String(value).replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"');
}
function meta(html, key) {
  const patterns = [
    new RegExp('<meta[^>]+(?:property|name)=["\\\']'+key+'["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']','i'),
    new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']'+key+'["\\\']','i')
  ];
  for (const pattern of patterns) {
    const match=html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return '';
}
function fallbackSvg(team) {
  const label=String(team||'FIBA').toUpperCase().replace(/[^A-Z ]/g,'').slice(0,18);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#0b2347"/><circle cx="1010" cy="120" r="230" fill="#d7aa37" opacity=".22"/><circle cx="150" cy="610" r="330" fill="#b02638" opacity=".22"/><text x="70" y="300" font-family="Arial,sans-serif" font-size="86" font-weight="900" fill="white">'+label+'</text><text x="72" y="380" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#f2cf71">BERLIN 2026 · PHOTO FEED RECONNECTING</text></svg>';
}

module.exports = async function handler(req,res){
  const team=String(req.query.team||'').toLowerCase();
  const source=TEAM_SOURCES[team];
  if(!source) return res.status(404).send('Unknown team');
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  try{
    const response=await fetch(source,{headers:{'User-Agent':'Mozilla/5.0 WeKnowTheW/1.0','Accept':'text/html'}});
    if(!response.ok) throw new Error('FIBA source '+response.status);
    const html=await response.text();
    const image=meta(html,'og:image')||meta(html,'twitter:image');
    if(!/^https?:\/\//i.test(image)) throw new Error('No social image');
    res.setHeader('Location',image);
    return res.status(302).end();
  }catch(error){
    res.setHeader('Content-Type','image/svg+xml; charset=utf-8');
    return res.status(200).send(fallbackSvg(team));
  }
};