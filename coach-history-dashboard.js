(()=> {
  const data=window.WNBA_COACH_HISTORY||[];
  const currentNames=new Set(data.filter(coach=>coach.current).map(coach=>coach.name));
  const logoCodes={"Atlanta Dream":"atl","Chicago Sky":"chi","Connecticut Sun":"con","Dallas Wings":"dal","Golden State Valkyries":"gs","Indiana Fever":"ind","Las Vegas Aces":"lv","Los Angeles Sparks":"la","Minnesota Lynx":"min","New York Liberty":"ny","Phoenix Mercury":"phx","Portland Fire":"por","Seattle Storm":"sea","Toronto Tempo":"tor","Washington Mystics":"wsh"};
  const legacyLogoFiles={
    "Utah Starzz":"https://de.wikipedia.org/wiki/Special:Redirect/file/UtahStarzz.png",
    "San Antonio Silver Stars":"https://en.wikipedia.org/wiki/Special:Redirect/file/San%20Antonio%20Silver%20Stars.svg",
    "San Antonio Stars":"https://en.wikipedia.org/wiki/Special:Redirect/file/San%20Antonio%20Stars%20logo.svg",
    "Detroit Shock":"https://en.wikipedia.org/wiki/Special:Redirect/file/DetroitShock.png",
    "Tulsa Shock":"https://en.wikipedia.org/wiki/Special:Redirect/file/Tulsa%20Shock%20logo.svg",
    "Orlando Miracle":"https://de.wikipedia.org/wiki/Special:Redirect/file/Orlando%20Miracle.png",
    "Houston Comets":"https://en.wikipedia.org/wiki/Special:Redirect/file/HoustonComets.png",
    "Cleveland Rockers":"https://en.wikipedia.org/wiki/Special:Redirect/file/ClevelandRockers.png",
    "Sacramento Monarchs":"https://en.wikipedia.org/wiki/Special:Redirect/file/SacramentoMonarchs.png",
    "Charlotte Sting":"https://en.wikipedia.org/wiki/Special:Redirect/file/CharlotteSting.png",
    "Miami Sol":"https://en.wikipedia.org/wiki/Special:Redirect/file/MiamiSol.png",
    "Portland Fire (original franchise)":"https://en.wikipedia.org/wiki/Special:Redirect/file/Portland%20Fire%20logo.gif"
  };
  const logoUrl=team=>legacyLogoFiles[team]||(logoCodes[team]?"https://a.espncdn.com/i/teamlogos/wnba/500/"+logoCodes[team]+".png":"");
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/'/g,"&#39;");
  const yearEnd=stint=>stint.end??2026;
  const coachedYears=coach=>{const years=new Set();coach.stints.forEach(s=>{for(let y=s.start;y<=yearEnd(s);y++)years.add(y)});return years.size};
  const rangeText=stint=>stint.end===null?stint.start+"–present":stint.start===stint.end?String(stint.start):stint.start+"–"+stint.end;
  const initials=name=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase();
  const grid=$("coachHistoryGrid"),search=$("coachHistorySearch"),teamFilter=$("coachHistoryTeam"),statusFilter=$("coachHistoryStatus"),eraFilter=$("coachHistoryEra"),sortFilter=$("coachHistorySort"),count=$("coachHistoryCount"),kpis=$("coachHistoryKpis");
  if(!grid)return;
  const yearsInEra={all:[1997,2026],nineties:[1997,1999],twoThousands:[2000,2009],twentyTens:[2010,2019],twentyTwenties:[2020,2026]};
  const teams=[...new Set(data.flatMap(coach=>coach.stints.map(stint=>stint.team)))].sort((a,b)=>a.localeCompare(b));
  teamFilter.innerHTML='<option value="">All teams and franchises</option>'+teams.map(team=>'<option value="'+esc(team)+'">'+esc(team)+'</option>').join("");
  const champions=data.filter(coach=>coach.titles.length).length;
  kpis.innerHTML=
    '<div class="coach-history-kpi"><strong>30</strong><span>WNBA seasons · 1997–2026</span></div>'+
    '<div class="coach-history-kpi"><strong>'+data.length+'</strong><span>Head coaches indexed</span></div>'+
    '<div class="coach-history-kpi"><strong>'+currentNames.size+'</strong><span>Coaches currently in place</span></div>'+
    '<div class="coach-history-kpi"><strong>'+champions+'</strong><span>Title-winning head coaches</span></div>';
  const hasEra=(coach,range)=>coach.stints.some(stint=>stint.start<=range[1]&&yearEnd(stint)>=range[0]);
  const card=coach=>{
    const status=coach.current?"CURRENT HEAD COACH":"FORMER HEAD COACH";
    const stints=coach.stints.map(stint=>{
      const logo=logoUrl(stint.team);
      return '<div class="coach-history-stint">'+(logo?'<img src="'+esc(logo)+'" alt="'+esc(stint.team)+' logo" loading="lazy" decoding="async" onerror="this.hidden=true">':'')+'<span><b>'+esc(stint.team)+'</b><small>'+rangeText(stint)+'</small></span></div>';
    }).join("");
    const titles=coach.titles.length?'<div class="coach-history-titles"><strong>'+coach.titles.length+' WNBA title'+(coach.titles.length===1?'':'s')+'</strong><span>'+coach.titles.map(year=>'<i>'+year+'</i>').join("")+'</span></div>':'<div class="coach-history-no-title">WNBA head-coach title: none</div>';
    return '<article class="coach-history-card" data-name="'+esc(coach.name)+'"><div class="coach-history-photo" data-coach-photo="'+esc(coach.name)+'"><span class="coach-history-initials" aria-hidden="true">'+esc(initials(coach.name))+'</span><small class="coach-history-photo-status">Headshot loading</small></div><div class="coach-history-card-body"><span class="coach-history-status '+(coach.current?'is-current':'')+'">'+status+'</span><h3>'+esc(coach.name)+'</h3><p class="coach-history-meta">'+coachedYears(coach)+' WNBA head-coach season'+(coachedYears(coach)===1?'':'s')+'</p><div class="coach-history-stints">'+stints+'</div>'+titles+'</div></article>';
  };
  function render(){
    const query=search.value.trim().toLowerCase(),team=teamFilter.value,status=statusFilter.value,era=yearsInEra[eraFilter.value]||yearsInEra.all,sort=sortFilter.value;
    let visible=data.filter(coach=>{
      const text=[coach.name,...coach.stints.map(stint=>stint.team+" "+rangeText(stint)),...coach.titles].join(" ").toLowerCase();
      if(query&&!text.includes(query))return false;
      if(team&&!coach.stints.some(stint=>stint.team===team))return false;
      if(status==="current"&&!coach.current)return false;
      if(status==="former"&&coach.current)return false;
      if(status==="2026"&&!coach.stints.some(stint=>stint.start<=2026&&yearEnd(stint)>=2026))return false;
      if(status==="champions"&&!coach.titles.length)return false;
      return hasEra(coach,era);
    });
    visible.sort((a,b)=>{
      if(sort==="titles")return b.titles.length-a.titles.length||a.name.localeCompare(b.name);
      if(sort==="seasons")return coachedYears(b)-coachedYears(a)||a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
    grid.innerHTML=visible.map(card).join("");
    count.textContent="Showing "+visible.length+" of "+data.length+" coaches";
    observePhotos();
  }
  const photoObserver=typeof IntersectionObserver==="function"?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){loadPhoto(entry.target);photoObserver.unobserve(entry.target)}}),{rootMargin:"180px"}):null;
  const photoCache=new Map();
  async function loadPhoto(photo){
    const name=photo.dataset.coachPhoto;if(!name||photo.dataset.requested)return;photo.dataset.requested="true";
    let promise=photoCache.get(name);
    if(!promise){promise=fetch("/api/media?type=coach&name="+encodeURIComponent(name),{headers:{Accept:"application/json"}}).then(response=>response.ok?response.json():null).catch(()=>null);photoCache.set(name,promise)}
    const payload=await promise,item=payload?.item;
    if(!payload?.found||!item?.image){photo.querySelector(".coach-history-photo-status").textContent="No verified portrait available";return}
    const img=document.createElement("img");img.src=item.image;img.alt=name+" headshot";img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";
    img.addEventListener("load",()=>{photo.classList.add("has-photo");photo.querySelector(".coach-history-photo-status")?.remove()},{once:true});
    img.addEventListener("error",()=>{img.remove();photo.querySelector(".coach-history-photo-status").textContent="Portrait unavailable"},{once:true});
    photo.prepend(img);
    if(item.sourceUrl){const credit=document.createElement("a");credit.className="coach-history-photo-credit";credit.href=item.sourceUrl;credit.target="_blank";credit.rel="noopener noreferrer";credit.textContent=item.creator?"Photo: "+item.creator:"Photo source";credit.title=item.license||"Reusable Wikimedia Commons media";photo.append(credit)}
  }
  function observePhotos(){document.querySelectorAll("#coachHistoryGrid [data-coach-photo]").forEach(node=>{if(!node.dataset.requested){if(photoObserver)photoObserver.observe(node);else loadPhoto(node)}})}
  [search,teamFilter,statusFilter,eraFilter,sortFilter].forEach(control=>control.addEventListener(control===search?"input":"change",render));
  const technicals=[
    {name:"Chris DeMarco",team:"New York Liberty",value:5},{name:"Cheryl Reeve",team:"Minnesota Lynx",value:4},{name:"Lynne Roberts",team:"Los Angeles Sparks",value:4},
    {name:"Becky Hammon",team:"Las Vegas Aces",value:3},{name:"Karl Smesko",team:"Atlanta Dream",value:3},
    {name:"Natalie Nakase",team:"Golden State Valkyries",value:2},{name:"Nate Tibbetts",team:"Phoenix Mercury",value:2},{name:"Sydney Johnson",team:"Washington Mystics",value:2},
    {name:"Tyler Marsh",team:"Chicago Sky",value:2},{name:"Rachid Meziane",team:"Connecticut Sun",value:2},{name:"Stephanie White",team:"Indiana Fever",value:2},
    {name:"Sonia Raman",team:"Seattle Storm",value:1},{name:"Alex Sarama",team:"Portland Fire",value:1},{name:"Jose Fernandez",team:"Dallas Wings",value:1},{name:"Sandy Brondello",team:"Toronto Tempo",value:0}
  ];
  const techHost=$("coachTechnicalLeaderboard");
  if(techHost){const max=Math.max(...technicals.map(item=>item.value),1);techHost.innerHTML='<div class="coach-tech-list" role="list">'+technicals.map((item,index)=>{const logo=logoUrl(item.team);return '<div class="coach-tech-row" role="listitem"><span class="coach-tech-rank">'+(index+1)+'</span>'+(logo?'<img src="'+esc(logo)+'" alt="'+esc(item.team)+' logo" loading="lazy" onerror="this.hidden=true">':'')+'<span class="coach-tech-name"><b>'+esc(item.name)+'</b><small>'+esc(item.team)+'</small><i style="--bar:'+(item.value/max*100)+'%"></i></span><strong>'+item.value+'</strong></div>'}).join("")+'</div>'}
  render();
})();