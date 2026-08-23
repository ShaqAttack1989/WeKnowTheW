const CELEBRITY_SOURCES = [
  {
    title:'Aubrey Plaza has become one of the W’s most visible celebrity fans',
    href:'https://www.si.com/wnba/pregnant-aubrey-plaza-roasting-caitlin-clark-practice-proves-best-wnba-fan',
    sourceType:'SPORTS ILLUSTRATED',
    category:'Celebrity fan',
    team:'New York Liberty',
    date:'2026-07-13',
    summary:'A current look at Aubrey Plaza’s growing Liberty and WNBA fandom, from courtside appearances to practice-day fun.'
  },
  {
    title:'Jason Sudeikis keeps showing up for women’s basketball',
    href:'https://www.si.com/wnba/jason-sudeikis-real-life-ted-lasso-classy-tribute-caitlin-clark',
    sourceType:'SPORTS ILLUSTRATED',
    category:'Celebrity fan',
    team:'New York Liberty',
    date:'2026-08-05',
    summary:'A 2026 profile of one of the league’s most consistent celebrity supporters and his connection to WNBA culture.'
  },
  {
    title:'Inside “CeLiberty Row” and New York’s celebrity-courtside culture',
    href:'https://www.si.com/wnba/new-york-liberty-celebrity-fans-spike-lee-jason-sudeikis-alicia-keys',
    sourceType:'SPORTS ILLUSTRATED',
    category:'Courtside culture',
    team:'New York Liberty',
    date:'2024-10-12',
    summary:'Spike Lee, Alicia Keys, Jason Sudeikis and other culture-shifters helped make Liberty games a destination.'
  },
  {
    title:'When hip-hop and the W connect',
    href:'https://www.wnba.com/webview/news/when-cultures-connect-hip-hop-the-w',
    sourceType:'WNBA',
    category:'Music + culture',
    team:'Atlanta Dream',
    summary:'League coverage of rappers, halftime performers and the relationship between hip-hop audiences and WNBA fandom.'
  },
  {
    title:'Barack Obama surprises WNBA All-Stars in Chicago',
    href:'https://apnews.com/article/fe5ff9d58d8cf87816b3dfe48bfacc07',
    sourceType:'ASSOCIATED PRESS',
    category:'Culture moment',
    team:'Chicago Sky',
    date:'2026-07-24',
    summary:'A 2026 All-Star-weekend crossover moment connecting the league, Chicago and a very famous basketball fan.'
  },
  {
    title:'WNBA social: celebrity rows, tunnel arrivals and game-night cameos',
    href:'https://www.instagram.com/wnba/',
    sourceType:'INSTAGRAM',
    category:'Social watch',
    team:'New York Liberty',
    summary:'Open the league’s official Instagram for original social posts and courtside moments. We link to the source instead of copying captions.'
  },
  {
    title:'CeLiberty Row on the Liberty’s official social feed',
    href:'https://www.instagram.com/nyliberty/',
    sourceType:'INSTAGRAM',
    category:'Social watch',
    team:'New York Liberty',
    summary:'The Liberty’s official Instagram is one of the best places to catch celebrity arrivals, Ellie moments and Brooklyn courtside culture.'
  },
  {
    title:'Chicago courtside on official Sky social',
    href:'https://www.instagram.com/chicagosky/',
    sourceType:'INSTAGRAM',
    category:'Social watch',
    team:'Chicago Sky',
    summary:'Official Sky social coverage adds hometown artists, athletes, creators and other familiar faces to the courtside roll call.'
  }
];

const FAN_SOURCES = [
  {
    title:'Meet The Flock',
    href:'https://valkyries.com/entertainment-teams/the-flock/',
    sourceType:'TEAM SITE',
    category:'Fan identity',
    team:'Golden State Valkyries',
    summary:'Golden State’s official hype squad page captures the performance, ritual and fan energy that make Ballhalla feel different.'
  },
  {
    title:'The Crown of Ballhalla',
    href:'https://valkyries.wnba.com/tickets/crown-of-ballhalla',
    sourceType:'TEAM SITE',
    category:'Supporter section',
    team:'Golden State Valkyries',
    summary:'A dedicated supporters section built around noise, identity and diehard home-court energy at Chase Center.'
  },
  {
    title:'“This Is Ballhalla” turns the fanbase into the campaign',
    href:'https://valkyries.wnba.com/news/valkyries-unveil-2026-season-campaign-this-is-ballhalla-20260425',
    sourceType:'TEAM SITE',
    category:'Fan campaign',
    team:'Golden State Valkyries',
    date:'2026-04-25',
    summary:'Golden State’s 2026 campaign centers the Bay Area community and treats Ballhalla as a mentality that extends beyond the arena.'
  },
  {
    title:'Violet’s birthday bash turns game night into a fan party',
    href:'https://valkyries.wnba.com/news/youre-invited-to-violets-disco-themed-birthday-bash-at-chase-center-on-aug-12-20260806',
    sourceType:'TEAM SITE',
    category:'Theme night',
    team:'Golden State Valkyries',
    date:'2026-08-06',
    summary:'A mascot celebration, giveaway and themed experience show how teams build traditions fans can participate in.'
  },
  {
    title:'WNBA Live expands the All-Star fan festival',
    href:'https://www.wnba.com/news/wnba-live-presented-by-aws-att-wnba-all-star',
    sourceType:'WNBA',
    category:'Fan festival',
    team:'Chicago Sky',
    date:'2026-07-09',
    summary:'The three-day Chicago event brings players, fans, brands, music, culture and league history together off the court.'
  },
  {
    title:'WNBA ID and the league app build a more personalized fan experience',
    href:'https://www.wnba.com/webview/news/wnba-app-wnba-id',
    sourceType:'WNBA',
    category:'Digital fandom',
    team:'New York Liberty',
    date:'2026-04-17',
    summary:'The league’s 2026 digital platform lets fans choose favorite teams and players and receive tailored content.'
  },
  {
    title:'Fan culture from the WNBA’s official Instagram',
    href:'https://www.instagram.com/wnba/',
    sourceType:'INSTAGRAM',
    category:'From the timeline',
    team:'New York Liberty',
    summary:'Original crowd reactions, fan signs, celebrations and game-night social moments live on the league’s official feed.'
  },
  {
    title:'Ballhalla from the Valkyries’ official Instagram',
    href:'https://www.instagram.com/valkyries/',
    sourceType:'INSTAGRAM',
    category:'From the timeline',
    team:'Golden State Valkyries',
    summary:'Follow the original posts for The Flock, Violet, theme nights, supporter sections and packed-Chase-Center moments.'
  },
  {
    title:'Brooklyn fan culture from the Liberty’s official Instagram',
    href:'https://www.instagram.com/nyliberty/',
    sourceType:'INSTAGRAM',
    category:'From the timeline',
    team:'New York Liberty',
    summary:'Ellie, seafoam fits, celebrity row and fan celebrations all meet in the Liberty’s official social timeline.'
  }
];

function decode(value=''){
  return String(value).replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"');
}
function meta(html,name){
  const patterns=[
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,'i')
  ];
  for(const rx of patterns){const hit=String(html).match(rx);if(hit)return decode(hit[1]);}
  return '';
}
async function fetchMeta(url){
  const host=new URL(url).hostname.toLowerCase();
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
  const type=String(req.query.type||'celebrity').toLowerCase();
  const source=type==='fan'?FAN_SOURCES:CELEBRITY_SOURCES;
  const items=await hydrate(source);
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({type:type==='fan'?'fan':'celebrity',updatedAt:new Date().toISOString(),items});
};
