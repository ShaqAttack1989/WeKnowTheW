(()=> {
  const panel=document.getElementById('americupDashboardPanel');
  const toggle=document.querySelector('.americup-format-toggle');
  if(!panel||!toggle)return;
  const records={
    '5x5':{
      title:'Women’s 5x5 title race',
      description:'Brazil leads the 5x5 record, with the United States within one championship.',
      latest:'United States',latestYear:2025,window:'1989–2025',editions:18,
      archive:'/americup-5x5.html',
      titles:[
        {country:'Brazil',count:6,years:[2023,2011,2009,2003,2001,1997]},
        {country:'United States',count:5,years:[2025,2021,2019,2007,1993]},
        {country:'Cuba',count:4,years:[2013,2005,1999,1989]},
        {country:'Canada',count:3,years:[2017,2015,1995]}
      ],
      recent:[[2025,'United States'],[2023,'Brazil'],[2021,'United States'],[2019,'United States'],[2017,'Canada'],[2015,'Canada']]
    },
    '3x3':{
      title:'Women’s 3x3 title race',
      description:'The United States and Canada are tied at three titles each; Canada reclaimed the latest crown.',
      latest:'Canada',latestYear:2026,window:'2021–2026',editions:6,
      archive:'/americup-3x3.html',
      titles:[
        {country:'United States',count:3,years:[2025,2023,2021]},
        {country:'Canada',count:3,years:[2026,2024,2022]}
      ],
      recent:[[2026,'Canada'],[2025,'United States'],[2024,'Canada'],[2023,'United States'],[2022,'Canada'],[2021,'United States']]
    }
  };
  const nodes={
    title:document.getElementById('dashboardTitle'),
    description:document.getElementById('dashboardDescription'),
    latest:document.getElementById('dashboardLatest'),
    latestLabel:document.getElementById('dashboardLatestLabel'),
    latestYear:document.getElementById('dashboardLatestYear'),
    window:document.getElementById('dashboardWindow'),
    editionCount:document.getElementById('dashboardEditionCount'),
    panel:document.getElementById('americupDashboardPanel'),
    titles:document.getElementById('countryTitleRows'),
    recent:document.getElementById('recentWinners'),
    titleHeading:document.getElementById('titleCountTitle'),
    archiveLink:document.querySelector('[data-format-link]')
  };
  function safe(value){
    return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }
  function render(format,moveFocus){
    const record=records[format]||records['5x5'];
    panel.dataset.format=format;
    panel.setAttribute('aria-busy','true');
    nodes.title.textContent=record.title;
    nodes.description.textContent=record.description;
    nodes.latest.textContent=record.latest;
    nodes.latestLabel.textContent='LATEST WOMEN’S '+format+' CHAMPION';
    nodes.latestYear.textContent=String(record.latestYear);
    nodes.window.textContent=record.window;
    nodes.editionCount.textContent=record.editions+' editions';
    nodes.titleHeading.textContent='Women’s '+format+' gold medals';
    nodes.archiveLink.href=record.archive;
    nodes.archiveLink.textContent='Open full '+format+' archive →';
    const max=Math.max(...record.titles.map(item=>item.count));
    nodes.titles.innerHTML=record.titles.map(item=>{
      const years=item.years.map(year=>safe(year)).join(' · ');
      const width=(item.count/max*100).toFixed(1)+'%';
      return '<article class="americup-country-row"><div class="americup-country-label"><strong>'+safe(item.country)+'</strong><b>'+item.count+' '+(item.count===1?'title':'titles')+'</b></div><div class="americup-bar"><span style="--bar-width:'+width+'"></span></div><p>'+years+'</p></article>';
    }).join('');
    nodes.recent.innerHTML=record.recent.map(item=>'<article><time>'+safe(item[0])+'</time><strong>'+safe(item[1])+'</strong><span>'+safe(format)+' women’s title</span></article>').join('');
    panel.setAttribute('aria-labelledby',format==='5x5'?'americupTab5x5':'americupTab3x3');
    toggle.hidden=false;
    toggle.querySelectorAll('[role="tab"]').forEach(button=>{
      const selected=button.dataset.format===format;
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex=selected?0:-1;
      if(selected&&moveFocus)button.focus();
    });
    panel.setAttribute('aria-busy','false');
  }
  const tabs=[...toggle.querySelectorAll('[role="tab"]')];
  tabs.forEach((button,index)=>{
    button.addEventListener('click',()=>render(button.dataset.format,false));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      let next=index;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      render(tabs[next].dataset.format,true);
    });
  });
  toggle.hidden=false;
  render('5x5',false);
})();