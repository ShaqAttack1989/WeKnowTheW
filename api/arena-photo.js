const VENUES = {
  'Atlanta Dream': { venue:'Gateway Center Arena', titles:['Gateway Center Arena'], note:'Primary 2026 home; select games also play at State Farm Arena.' },
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

function wikiUrl(title=''){
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(String(title).replace(/ /g,'_'))}`;
}
function largerThumb(url=''){
  return String(url).replace(/\/\d+px-([^/]+)$/,'/720px-$1');
}
async function summary(title){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const response=await fetch(wikiUrl(title),{
      headers:{'User-Agent':'WeKnowTheW/1.0 (https://www.weknowthew.com)','Accept':'application/json'},
      signal:controller.signal
    });
    if(!response.ok)return null;
    const data=await response.json();
    const image=largerThumb(data.thumbnail?.source||data.originalimage?.source||'');
    if(!image)return null;
    return {
      image,
      sourceUrl:data.content_urls?.desktop?.page||`https://en.wikipedia.org/wiki/${encodeURIComponent(String(title).replace(/ /g,'_'))}`,
      sourceTitle:data.title||title
    };
  }catch{return null;}
  finally{clearTimeout(timer);}
}
async function resolve(team,meta){
  let photo=null;
  for(const title of meta.titles){
    photo=await summary(title);
    if(photo)break;
  }
  return {
    team,
    venue:meta.venue,
    note:meta.note||'',
    image:photo?.image||'',
    sourceUrl:photo?.sourceUrl||'',
    sourceTitle:photo?.sourceTitle||meta.venue,
    credit:photo?'Wikipedia / Wikimedia Commons':''
  };
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'Method not allowed'});
  }
  const requested=String(req.query.team||'').trim();
  const entries=requested&&VENUES[requested]?[[requested,VENUES[requested]]]:Object.entries(VENUES);
  const settled=await Promise.allSettled(entries.map(([team,meta])=>resolve(team,meta)));
  const items=settled.filter(result=>result.status==='fulfilled').map(result=>result.value);
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
  return res.status(200).json({updatedAt:new Date().toISOString(),source:'Wikipedia / Wikimedia Commons',items});
};
