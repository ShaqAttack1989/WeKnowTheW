(()=>{
  const pulseViews={
    game2:[
      {label:'FINAL',value:'NYL 87',headline:'MIN 71',note:'New York led wire to wire and closed the series in Brooklyn.'},
      {label:'PAINT POINTS',value:'44-28',headline:'LIBERTY',note:'Jones and Stewart made Minnesota finish over size all night.'},
      {label:'REBOUNDS',value:'36-29',headline:'LIBERTY',note:'Twelve offensive rebounds kept failed possessions alive.'},
      {label:'LYNX SHOOTING',value:'38.2%',headline:'FROM THE FIELD',note:'Minnesota never reached 20 points in any of the last three quarters.'}
    ],
    series:[
      {label:'SERIES',value:'2-0',headline:'NEW YORK',note:'The first No. 8 seed to eliminate a No. 1 in WNBA history.'},
      {label:'AGGREGATE',value:'+32',headline:'LIBERTY',note:'New York won both games by 16 points.'},
      {label:'STEWART · GAME 1',value:'34·12·6',headline:'POINTS · REBOUNDS · ASSISTS',note:'The opening punch changed the pressure of the entire series.'},
      {label:'MILES · SERIES',value:'20%',headline:'FIELD-GOAL SHOOTING',note:'Sixteen points and two assists across two games.'}
    ],
    meaning:[
      {label:'MINNESOTA',value:'33-11',headline:'REGULAR SEASON',note:'The best record produced the first team eliminated.'},
      {label:'NEW YORK',value:'SEMIS',headline:'NO. 8 ADVANCES',note:'The Liberty will face Atlanta or Washington in a best-of-five series.'},
      {label:'FORMAT',value:'BEST OF 3',headline:'FIRST ROUND',note:'A home loss leaves almost no space for a top seed to recover.'},
      {label:'PHEE',value:'UFA',headline:'2027 FREE AGENCY',note:'Minnesota cannot use the core tag to keep her off the market.'}
    ]
  };

  const players=[
    {name:'Jonquel Jones',team:'liberty',teamLabel:'NEW YORK · CENTER',id:'1627673',grade:'A+',verdict:'showed',badge:'SHOWED UP',stat:'21 PTS · 13 REB · 6 OREB',note:'She set the physical terms from the opening possession and turned the glass into New York\'s private property.'},
    {name:'Breanna Stewart',team:'liberty',teamLabel:'NEW YORK · FORWARD',id:'1627668',grade:'A+',verdict:'showed',badge:'SHOWED UP',stat:'21 PTS · 5 REB · 4 AST · 2 STL · 2 BLK',note:'Forty minutes, two-way control and no panic after the flagrant foul. This was closer basketball from a champion.'},
    {name:'Sabrina Ionescu',team:'liberty',teamLabel:'NEW YORK · GUARD',id:'1629477',grade:'A',verdict:'showed',badge:'SHOWED UP',stat:'18 PTS · 7 AST · 4 3PM',note:'Her shot-making stretched the floor and her passing punished every extra defender Minnesota sent.'},
    {name:'Courtney Williams',team:'lynx',teamLabel:'MINNESOTA · GUARD',id:'1627675',grade:'A-',verdict:'showed',badge:'SHOWED UP',stat:'18 PTS · 8 REB · 5 AST',note:'She was Minnesota\'s most reliable source of pace, creation and resistance in the closeout game.'},
    {name:'Kayla McBride',team:'lynx',teamLabel:'MINNESOTA · GUARD',id:'203825',grade:'B',verdict:'solid',badge:'DID HER PART',stat:'14 PTS · 4 AST · 3 STL · 3/5 3PT',note:'McBride supplied spacing and activity. Minnesota needed her production to multiply, not stand alone.'},
    {name:'Napheesa Collier',team:'lynx',teamLabel:'MINNESOTA · FORWARD',id:'1629483',grade:'C+',verdict:'solid',badge:'FOUGHT, NO TAKEOVER',stat:'14 PTS · 7 REB · 6/14 FG · 5 FOULS',note:'She competed, but the franchise player never bent the elimination game toward Minnesota.'},
    {name:'Olivia Miles',team:'lynx',teamLabel:'MINNESOTA · GUARD',id:'1643426',grade:'D',verdict:'missing',badge:'DID NOT SHOW',stat:'5 PTS · 1 AST · 1/8 FG · 17 MIN',note:'New York walled off the paint, crowded her reads and turned a brilliant rookie into a hesitant one.'},
    {name:'Natasha Howard',team:'lynx',teamLabel:'MINNESOTA · FORWARD',id:'203827',grade:'D',verdict:'missing',badge:'DID NOT SHOW',stat:'2 PTS · 5 REB · 2 BLK · 16 MIN',note:'The defensive plays were not enough to answer Jones on the glass or give Minnesota a second interior scorer.'}
  ];

  const pheeViews={
    stay:{
      title:'Why Minnesota still has the strongest case',
      bullets:[
        '<strong>Infrastructure:</strong> Collier told NPR the Lynx want for nothing at their shared practice facility, from chefs to massage therapists.',
        '<strong>Basketball base:</strong> Olivia Miles gives Minnesota a 21-year-old creator who can reduce Collier\'s burden as she develops.',
        '<strong>Trust:</strong> Collier has spent her entire WNBA career with the Lynx and has reached the playoffs six times with the franchise.',
        '<strong>Proof of concept:</strong> Reeve built a 33-win team even though Collier missed the first half of the season.'
      ]
    },
    leave:{
      title:'Why she should listen to every call',
      bullets:[
        '<strong>Freedom:</strong> Collier is an unrestricted free agent in 2027, and Minnesota cannot block the market with a core designation.',
        '<strong>Optionality:</strong> A one-year supermax was a deliberate choice in an offseason when other stars accepted longer deals.',
        '<strong>Postseason direction:</strong> Finals loss in 2024, semifinal exit in 2025, first-round sweep in 2026.',
        '<strong>Basketball fit:</strong> A team with more size, downhill pressure or shooting could make every Collier touch less exhausting.'
      ]
    },
    verdict:{
      title:'Our read: lean stay, but do not assume',
      bullets:[
        '<strong>There is no public exit signal.</strong> No trade request, no announced destination and no statement that Minnesota is out.',
        '<strong>The one-year deal matters.</strong> It gives Collier the ability to demand a championship plan, not merely another maximum offer.',
        '<strong>The Lynx have a real pitch.</strong> Miles, Reeve, elite facilities and a 33-win foundation are not small things.',
        '<strong>The pressure is on Minnesota.</strong> The front office must explain why the same playoff ending will not arrive again.'
      ]
    }
  };

  const pulseDashboard=document.getElementById('pulseDashboard');
  const pulseButtons=[...document.querySelectorAll('[data-pulse-view]')];
  function renderPulse(key){
    const items=pulseViews[key]||pulseViews.game2;
    if(pulseDashboard)pulseDashboard.innerHTML=items.map(item=>`<article class="pulse-stat"><span>${item.label}</span><strong>${item.value}</strong><b>${item.headline}</b><p>${item.note}</p></article>`).join('');
    pulseButtons.forEach(button=>{const active=button.dataset.pulseView===key;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  }
  pulseButtons.forEach(button=>button.addEventListener('click',()=>renderPulse(button.dataset.pulseView)));
  renderPulse('game2');

  const reportGrid=document.getElementById('playerReportGrid');
  const reportButtons=[...document.querySelectorAll('[data-player-filter]')];
  function card(player){
    return `<article class="player-card" data-team="${player.team}" data-verdict="${player.verdict}">
      <div class="player-card-grade" aria-label="Grade ${player.grade}">${player.grade}</div>
      <div class="player-card-top">
        <img src="https://cdn.wnba.com/headshots/wnba/latest/1040x760/${player.id}.png" alt="Official WNBA headshot of ${player.name}" width="118" height="145" loading="lazy">
        <div class="player-card-title"><span>${player.teamLabel}</span><h3>${player.name}</h3><b>${player.badge}</b></div>
      </div>
      <div class="player-card-body"><strong class="player-card-stat">${player.stat}</strong><p>${player.note}</p></div>
    </article>`;
  }
  if(reportGrid)reportGrid.innerHTML=players.map(card).join('');
  function filterPlayers(key){
    reportGrid?.querySelectorAll('.player-card').forEach(cardElement=>{
      const visible=key==='all'||cardElement.dataset.team===key||cardElement.dataset.verdict===key||(key==='showed'&&cardElement.dataset.verdict==='solid');
      cardElement.hidden=!visible;
    });
    reportButtons.forEach(button=>{const active=button.dataset.playerFilter===key;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  }
  reportButtons.forEach(button=>button.addEventListener('click',()=>filterPlayers(button.dataset.playerFilter)));

  const pheePanel=document.getElementById('pheePanel');
  const pheeButtons=[...document.querySelectorAll('[data-phee-view]')];
  function renderPhee(key){
    const view=pheeViews[key]||pheeViews.verdict;
    if(pheePanel)pheePanel.innerHTML=`<h3>${view.title}</h3><ul>${view.bullets.map(item=>`<li>${item}</li>`).join('')}</ul>`;
    pheeButtons.forEach(button=>{const active=button.dataset.pheeView===key;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  }
  pheeButtons.forEach(button=>button.addEventListener('click',()=>renderPhee(button.dataset.pheeView)));
  renderPhee('verdict');

  const progress=document.getElementById('readProgress');
  function updateProgress(){
    if(!progress)return;
    const total=document.documentElement.scrollHeight-window.innerHeight;
    const value=total>0?Math.min(100,Math.max(0,(window.scrollY/total)*100)):0;
    progress.style.width=`${value}%`;
  }
  updateProgress();
  addEventListener('scroll',updateProgress,{passive:true});
  addEventListener('resize',updateProgress);
})();
