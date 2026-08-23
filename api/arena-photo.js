const VENUES = {
  'Atlanta Dream': { venue:'Gateway Center Arena', titles:['Gateway Center Arena','Gateway Center Arena at College Park'], note:'Primary 2026 home; select games also play at State Farm Arena.' },
  'Chicago Sky': { venue:'Wintrust Arena', titles:['Wintrust Arena'] },
  'Connecticut Sun': { venue:'Mohegan Sun Arena', titles:['Mohegan Sun Arena'] },
  'Dallas Wings': { venue:'College Park Center', titles:['College Park Center'], note:'Primary 2026 home; select games also play at American Airlines Center.' },
  'Golden State Valkyries': { venue:'Chase Center', titles:['Chase Center'] },
  'Indiana Fever': { venue:'Gainbridge Fieldhouse', titles:['Gainbridge Fieldhouse'] },
  'Las Vegas Aces': { venue:'Michelob Ultra Arena', titles:['Michelob Ultra Arena','Mandalay Bay Events Center'] },
  'Los Angeles Sparks': { venue:'Crypto.com Arena', titles:['Crypto.com Arena','Staples Center'] },
  'Minnesota Lynx': { venue:'Target Center', titles:['Target Center'] },
  'New York Liberty': { venue:'Barclays Center', titles:['Barclays Center'] },
  'Phoenix Mercury': { venue:'Mortgage Matchup Center', titles:['Mortgage Matchup Center','Footprint Center'] },
  'Portland Fire': { venue:'Moda Center', titles:['Moda Center'] },
  'Seattle Storm': { venue:'Climate Pledge Arena', titles:['Climate Pledge Arena','Seattle Center Coliseum'] },
  'Toronto Tempo': { venue:'Coca-Cola Coliseum', titles:['Coca-Cola Coliseum','Ricoh Coliseum'], note:'Primary 2026 home; Toronto also hosts select games at other Canadian venues.' },
  'Washington Mystics': { venue:'CareFirst Arena', titles:['CareFirst Arena','Entertainment and Sports Arena'] }
};

async function fetchJson(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const response=await fetch(url,{headers:{'User-Agent':'WeKnowTheW/1.0','Accept':'application/json'},signal:controller.signal});
    if(!response.ok)return null;
    return response.json();
  }catch{return null;}
  finally{clearTimeout(timer);}
}
function pageImageUrl(title){
  const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',redirects:'1',prop:'pageimages',piprop:'thumbnail|original',pithumbsize:'1200',titles:title});
  return `https://en.wikipedia.org/w/api.php?${params.toString()}`;
}
async function pageImage(title){
  const data=await fetchJson(pageImageUrl(title));
  const page=data?.query?.pages?.[0];
  const image=page?.thumbnail?.source||page?.original?.source||'';
  if(!image)return null;
  return {image,sourceUrl:`https://en.wikipedia.org/wiki/${encodeURIComponent(String(page.title||title).replace(/ /g,'_'))}`,sourceTitle:page.title||title};
}
async function commonsSearch(query){
  const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',generator:'search',gsrsearch:`${query} arena`,gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',iiprop:'url',iiurlwidth:'1200'});
  const data=await fetchJson(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
  const pages=data?.query?.pages||[];
  const good=pages.find(page=>{
    const name=String(page.title||'').toLowerCase();
    return !/logo|map|diagram|icon|seal|flag/.test(name)&&page.imageinfo?.[0]?.thumburl;
  })||pages.find(page=>page.imageinfo?.[0]?.thumburl);
  if(!good)return null;
  const info=good.imageinfo[0];
  return {image:info.thumburl||info.url||'',sourceUrl:info.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(good.title)}`,sourceTitle:good.title};
}
async function resolve(team,meta){
  let photo=null;
  for(const title of meta.titles){photo=await pageImage(title);if(photo)break;}
  if(!photo)photo=await commonsSearch(meta.venue);
  return {team,venue:meta.venue,note:meta.note||'',image:photo?.image||'',sourceUrl:photo?.sourceUrl||'',sourceTitle:photo?.sourceTitle||meta.venue,credit:photo?'Wikipedia / Wikimedia Commons':''};
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  const requested=String(req.query.team||'').trim();
  const entries=requested&&VENUES[requested]?[[requested,VENUES[requested]]]:Object.entries(VENUES);
  const settled=await Promise.allSettled(entries.map(([team,meta])=>resolve(team,meta)));
  const items=settled.filter(result=>result.status==='fulfilled').map(result=>result.value);
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({updatedAt:new Date().toISOString(),source:'Wikipedia / Wikimedia Commons',items});
};
