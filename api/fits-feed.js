const CURATED = {
  tunnel: [
    {
      title:'WNBA official tunnel and fashion feed',
      href:'https://www.instagram.com/wnba/',
      sourceType:'INSTAGRAM',
      category:'Tunnel Vision',
      summary:'Original league posts for tunnel arrivals, game-night style, sneakers and player expression.'
    },
    {
      title:'LeagueFits women’s basketball style watch',
      href:'https://www.instagram.com/leaguefits/',
      sourceType:'INSTAGRAM',
      category:'Tunnel Vision',
      summary:'Basketball fashion coverage and player-fit spotting from the LeagueFits social feed.'
    },
    {
      title:'The W in Designer: official WNBA fashion archive',
      href:'https://www.wnba.com/news/category/fashion',
      sourceType:'WNBA',
      category:'Tunnel Vision',
      summary:'The league’s own archive of tunnel trends, stylists, signature footwear, red carpets and player style.'
    },
    {
      title:'New York Liberty tunnel and courtside style',
      href:'https://www.instagram.com/nyliberty/',
      sourceType:'TEAM SOCIAL',
      category:'Tunnel Vision',
      team:'New York Liberty',
      summary:'Official Liberty social for seafoam game-night fashion, arrivals and player personality.'
    },
    {
      title:'Golden State Valkyries arrival style',
      href:'https://www.instagram.com/valkyries/',
      sourceType:'TEAM SOCIAL',
      category:'Tunnel Vision',
      team:'Golden State Valkyries',
      summary:'Official Valkyries social for Ballhalla arrivals, player fashion and event looks.'
    },
    {
      title:'Las Vegas Aces game-night style',
      href:'https://www.instagram.com/lvaces/',
      sourceType:'TEAM SOCIAL',
      category:'Tunnel Vision',
      team:'Las Vegas Aces',
      summary:'Official Aces social for tunnel looks, championship-era style and signature sneaker moments.'
    }
  ],
  press: [
    {
      title:'Gabby Williams gets ready for 2026 WNBA All-Star Weekend',
      href:'https://www.vogue.com/slideshow/gabby-williams-2026-wnba-all-star-weekend',
      sourceType:'VOGUE',
      category:'Press Rack',
      team:'Golden State Valkyries',
      date:'2026-07-25',
      summary:'Vogue goes behind the scenes with Williams for her 2026 All-Star weekend look and styling process.'
    },
    {
      title:'An outfit guide to courtside style',
      href:'https://www.vogue.com/article/courtside-style-outfits',
      sourceType:'VOGUE',
      category:'Press Rack',
      date:'2026-04-01',
      summary:'A broader look at the WNBA’s growing courtside-fashion ecosystem and the pieces shaping game-day style.'
    },
    {
      title:'The W in Designer: top summer trends',
      href:'https://www.wnba.com/webview/news/the-w-in-designer-24-top-summer-trends',
      sourceType:'WNBA',
      category:'Press Rack',
      summary:'Official league analysis of the trends players were carrying through the tunnel, from crochet to corsets.'
    },
    {
      title:'How stylists and players team up for the Orange Carpet',
      href:'https://www.wnba.com/news/the-w-in-designer-how-stylists-and-players-team-up-for-the-orange-carpet',
      sourceType:'WNBA',
      category:'Press Rack',
      summary:'A source-linked look at the stylist-player collaboration behind one of the league’s biggest fashion stages.'
    },
    {
      title:'Cameron Brink and the inner power behind her outfits',
      href:'https://www.wnba.com/webview/news/the-w-in-designer-24-mary-gonsalves-kinney',
      sourceType:'WNBA',
      category:'Press Rack',
      team:'Los Angeles Sparks',
      summary:'Stylist Mary Gonsalves Kinney discusses Brink’s brands, tunnel identity and the role of Los Angeles in her fashion language.'
    },
    {
      title:'Flyest footwear and the WNBA sneaker conversation',
      href:'https://www.wnba.com/news/the-w-in-designer-23-week-nine',
      sourceType:'WNBA',
      category:'Press Rack',
      summary:'Signature sneakers, custom footwear and the way on-court shoes extend player style beyond the tunnel.'
    }
  ],
  fitCheck: [
    {
      player:'Gabby Williams',
      team:'Golden State Valkyries',
      date:'2026 All-Star Weekend',
      event:'Orange carpet / All-Star Weekend',
      designer:'Custom look by Mariah Keopple',
      stylist:'Mariah Keopple',
      shoes:'Not identified in source',
      href:'https://www.vogue.com/slideshow/gabby-williams-2026-wnba-all-star-weekend',
      sourceType:'VOGUE'
    },
    {
      player:'Cameron Brink',
      team:'Los Angeles Sparks',
      date:'2024 archive',
      event:'Tunnel style profile',
      designer:'YSL, Balmain, Givenchy, Versace and emerging labels discussed',
      stylist:'Mary Gonsalves Kinney / Sydney Bordonaro',
      shoes:'Source-linked profile',
      href:'https://www.wnba.com/webview/news/the-w-in-designer-24-mary-gonsalves-kinney',
      sourceType:'WNBA'
    },
    {
      player:'A’ja Wilson',
      team:'Las Vegas Aces',
      date:'2024 archive',
      event:'Style evolution profile',
      designer:'Player style evolution',
      stylist:'Source-linked profile',
      shoes:'Source-linked profile',
      href:'https://www.wnba.com/news/the-w-in-designer-24-aja-wilson-style-evolution',
      sourceType:'WNBA'
    }
  ]
};

function decode(value=''){
  return String(value).replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"');
}
function meta(html,name){
  const patterns=[
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,'i')
  ];
  for(const pattern of patterns){const hit=String(html).match(pattern);if(hit)return decode(hit[1]);}
  return '';
}
async function fetchMeta(url){
  let host='';try{host=new URL(url).hostname.toLowerCase();}catch{return {};}
  if(host==='instagram.com'||host.endsWith('.instagram.com'))return {};
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
  try{
    const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; WeKnowTheW/1.0)','Accept':'text/html,application/xhtml+xml'},signal:controller.signal});
    if(!response.ok)return {};
    const html=await response.text();
    return {image:meta(html,'og:image'),description:meta(html,'og:description')||meta(html,'description')};
  }catch{return {};}
  finally{clearTimeout(timer);}
}
async function hydrate(items){
  return Promise.all(items.map(async item=>{
    const extra=await fetchMeta(item.href);
    return {...item,image:extra.image||'',summary:item.summary||extra.description||''};
  }));
}
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const [tunnel,press]=await Promise.all([hydrate(CURATED.tunnel),hydrate(CURATED.press)]);
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({updatedAt:new Date().toISOString(),tunnel,press,fitCheck:CURATED.fitCheck});
};
