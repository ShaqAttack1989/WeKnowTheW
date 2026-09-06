const SOURCES={
  upshot:{
    'charlotte-crown':'https://crownupshot.com/',
    'jacksonville-waves':'https://wavesupshot.com/',
    'greensboro-groove':'https://grooveupshot.com/',
    'savannah-steel':'https://steelupshot.com/',
    'upshot-baltimore':'https://baltimoreupshot.com/',
    'upshot-nashville':'https://nashvilleupshot.com/'
  },
  unrivaled:{
    'phantom':'https://www.unrivaled.basketball/phantom',
    'mist':'https://www.unrivaled.basketball/mist',
    'laces':'https://www.unrivaled.basketball/laces',
    'rose':'https://www.unrivaled.basketball/rose',
    'breeze':'https://www.unrivaled.basketball/breeze',
    'vinyl':'https://www.unrivaled.basketball/vinyl',
    'lunar-owls':'https://www.unrivaled.basketball/lunar-owls',
    'hive':'https://www.unrivaled.basketball/hive'
  },
  wpba:{
    'oakland-swish':'https://www.womenspba.com/stats#/2693/team/675230',
    'alameda-wolves':'https://www.womenspba.com/stats#/2693/team/675231',
    'berkeley-royals':'https://www.womenspba.com/stats#/2693/team/675232',
    'tech-city-titans':'https://www.womenspba.com/stats#/2693/team/675233',
    'san-francisco-riptide':'https://www.womenspba.com/stats#/2693/team/675234',
    'bay-area-phoenix':'https://www.womenspba.com/stats#/2693/team/675235',
    'bay-city-blaze':'https://www.womenspba.com/stats#/2693/team/675236',
    'hayward-reign':'https://www.womenspba.com/stats#/2693/team/675237'
  },
  au:{
    'gold-rush':'https://auprosports.com/basketball/weekly-teams/',
    'glow':'https://auprosports.com/basketball/weekly-teams/',
    'rhythm':'https://auprosports.com/basketball/weekly-teams/',
    'eclipse':'https://auprosports.com/basketball/weekly-teams/'
  }
};
const PHOTOS={
  wpba:{
    allstar:'https://www.womenspba.com/news/wpba-announces-2026-all-star-game-rosters-league-s',
    pipeline:'https://www.womenspba.com/news/wpba-to-host-2026-tryouts-continuing-to-expand-pat',
    history:'https://www.womenspba.com/news/bay-city-blaze-triumphs-at-tournament-of-champions'
  },
  upshot:{
    championship:'https://crownupshot.com/crown-pull-off-comeback-to-win-upshot-championship/',
    pipeline:'https://crownupshot.com/michelle-onyiah-turns-upshot-opportunity-into-wnba-chance/'
  }
};
function esc(value=''){return String(value).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function decode(value=''){return String(value).replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"');}
function norm(value=''){return String(value).toLowerCase().replace(/[^a-z0-9]/g,'');}
function meta(html,key){
  const patterns=[
    new RegExp('<meta[^>]+(?:property|name)=["\\']'+key+'["\\'][^>]+content=["\\']([^"\\']+)["\\']','i'),
    new RegExp('<meta[^>]+content=["\\']([^"\\']+)["\\'][^>]+(?:property|name)=["\\']'+key+'["\\']','i')
  ];
  for(const pattern of patterns){const m=html.match(pattern);if(m?.[1])return decode(m[1]);}
  return '';
}
function resolve(base,src=''){
  try{return new URL(decode(src),base).toString();}catch{return '';}
}
function imageCandidates(html,base,key){
  const wanted=norm(key),out=[];
  for(const match of html.matchAll(/<img\b[^>]*>/gi)){
    const tag=match[0],src=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1]||tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1]||'';
    if(!src)continue;
    const alt=tag.match(/\balt=["']([^"']*)["']/i)?.[1]||'';
    const hay=norm(alt+' '+src);
    let score=0;
    if(hay.includes(wanted))score+=8;
    if(/logo|wordmark|navigation|lockup/i.test(alt+' '+src))score+=5;
    if(/icon|mark/i.test(alt+' '+src))score+=2;
    if(/hero|frontpage|roster/i.test(alt+' '+src))score-=1;
    out.push({src:resolve(base,src),score});
  }
  return out.filter(x=>/^https?:\/\//i.test(x.src)).sort((a,b)=>b.score-a.score);
}
function fallbackSvg(label,league){
  const initials=String(label||'TEAM').split(/[-\s]+/).filter(Boolean).map(x=>x[0]).join('').slice(0,3).toUpperCase();
  const palette={wpba:['#24113c','#ffcf45'],upshot:['#140a2f','#d8ff4f'],unrivaled:['#111','#f2d8ff'],au:['#111','#ff8a00']}[league]||['#17121e','#fff'];
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" rx="88" fill="'+palette[0]+'"/><circle cx="305" cy="92" r="115" fill="'+palette[1]+'" opacity=".18"/><text x="200" y="235" text-anchor="middle" font-family="Arial,sans-serif" font-size="118" font-weight="900" fill="'+palette[1]+'">'+esc(initials)+'</text></svg>';
}
module.exports=async function handler(req,res){
  const league=String(req.query.league||'').toLowerCase(),key=String(req.query.key||'').toLowerCase(),kind=String(req.query.kind||'logo').toLowerCase();
  const source=kind==='photo'?PHOTOS[league]?.[key]:SOURCES[league]?.[key];
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  if(!source){
    res.setHeader('Content-Type','image/svg+xml; charset=utf-8');
    return res.status(200).send(fallbackSvg(key,league));
  }
  try{
    const response=await fetch(source,{headers:{'User-Agent':'Mozilla/5.0 WeKnowTheW/1.0','Accept':'text/html'}});
    if(!response.ok)throw new Error('source '+response.status);
    const html=await response.text();
    let image='';
    if(kind==='logo'){
      image=imageCandidates(html,source,key)[0]?.src||'';
    }
    if(!image)image=meta(html,'og:image')||meta(html,'twitter:image');
    if(!/^https?:\/\//i.test(image))throw new Error('no image');
    res.setHeader('Location',image);
    return res.status(302).end();
  }catch(error){
    res.setHeader('Content-Type','image/svg+xml; charset=utf-8');
    return res.status(200).send(fallbackSvg(key,league));
  }
};