const CATEGORY_URL = 'https://www.wnba.com/news/category/fashion';
const FALLBACK = [
  {title:'The W in Designer ’24: Championship Style Notes',href:'https://www.wnba.com/news/w-in-designer-24-championship-style-notes',date:'Oct 29, 2024'},
  {title:'The W in Designer ’24: Top Summer Trends Part II',href:'https://www.wnba.com/news/the-w-in-designer-24-top-summer-trends-part-ii',date:'Sep 30, 2024'},
  {title:'The W in Designer ’24: A Break From Tunnel Style',href:'https://www.wnba.com/news/the-w-in-designer-24-tunnel-style-break',date:'Aug 9, 2024'},
  {title:'A’ja Wilson’s Style Evolution',href:'https://www.wnba.com/news/the-w-in-designer-24-aja-wilson-style-evolution',date:'2024'},
  {title:'Flyest Fits of Tip-Off Weekend',href:'https://www.wnba.com/news/the-w-in-designer-flyest-fits-of-tip-off-weekend',date:'May 24, 2023'},
  {title:'WNBA Takes On New York Fashion Week',href:'https://www.wnba.com/news/the-w-in-designer-wnba-takes-on-new-york-fashion-week',date:'Sep 19, 2022'}
];

function walk(value, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (!Array.isArray(value)) {
    const title = value.title || value.headline || value.name;
    const href = value.permalink || value.url || value.link;
    const image = value.featuredImage || value.image || value.thumbnail || value.imageUrl;
    const category = `${value.category || ''} ${value.categories || ''} ${value.type || ''}`;
    const text = `${title || ''} ${value.excerpt || ''} ${category}`;
    if (title && href && /fashion|designer|style|tunnel|fits?|sneaker/i.test(text)) {
      const rawImage = typeof image === 'string' ? image : image?.url || image?.src || image?.sourceUrl;
      output.push({title:String(title),href:String(href),image:rawImage || '',date:value.date || value.publishedAt || value.postDate || '',source:'WNBA Fashion'});
    }
  }
  Object.values(value).forEach(child => walk(child, output));
  return output;
}

async function fetchHtml(url) {
  const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 WeKnowTheW/1.0',Accept:'text/html'}});
  if (!response.ok) throw new Error(String(response.status));
  return response.text();
}

async function ogImage(url) {
  try {
    const html = await fetchHtml(url);
    return (html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i))?.[1]?.replace(/&amp;/g,'&') || '';
  } catch { return ''; }
}

module.exports = async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');
  let items=[];
  try {
    const html=await fetchHtml(CATEGORY_URL);
    const script=html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
    if(script) items=walk(JSON.parse(script));
  } catch { items=[]; }
  const seen=new Set();
  items=[...items,...FALLBACK].filter(item=>{
    try { const parsed=new URL(item.href,'https://www.wnba.com'); if(parsed.protocol!=='https:'||!(parsed.hostname==='wnba.com'||parsed.hostname.endsWith('.wnba.com')))return false; item.href=parsed.toString(); } catch { return false; }
    if(seen.has(item.href))return false; seen.add(item.href); return true;
  }).slice(0,10);
  const hydrated=await Promise.all(items.slice(0,8).map(async item=>({...item,image:item.image || await ogImage(item.href)})));
  return res.status(200).json({items:hydrated,source:CATEGORY_URL,updatedAt:new Date().toISOString()});
};
