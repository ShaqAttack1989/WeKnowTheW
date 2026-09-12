(()=>{
  const ENDPOINT='/api/fiba-world-cup';
  const FINAL_TIP=new Date('2026-09-13T18:00:00.000Z');
  const flags={USA:'/assets/images/fiba-group-play/flags/us.png',FRA:'/assets/images/fiba-group-play/flags/fr.png'};
  const fallbackTeams={
    USA:{code:'USA',name:'United States',wins:5,losses:0,ppg:87.6,oppPpg:59.8,diffPerGame:27.8,wScore:91.2},
    FRA:{code:'FRA',name:'France',wins:5,losses:0,ppg:96.2,oppPpg:60.6,diffPerGame:35.6,wScore:94.1}
  };
  const context={
    USA:'Four straight World Cup titles, 35 consecutive World Cup wins and a 71 game winning streak across World Cup and Olympic play entering the final.',
    FRA:'First World Cup final, first guaranteed World Cup medal since 1953 and the largest scoring margin of the two finalists through the semifinals.'
  };
  const players={
    USA:[
      {name:'Breanna Stewart',id:'176575',role:'THE BIG GAME CONSTANT',stats:[['11.0','PPG'],['6.8','RPG'],['16.6','EFF']],read:'Stewart led USA with 16 points in the semifinal and remains the lineup piece that can solve the most problems at once.'},
      {name:'Jackie Young',id:'283322',role:'THE PRESSURE RELEASE',stats:[['11.2','PPG'],['2.8','APG'],['12.0','EFF']],read:'USA’s leading scorer through the semifinals has repeatedly turned broken possessions into calm ones.'},
      {name:'Caitlin Clark',id:'235603',role:'THE ADVANTAGE CREATOR',stats:[['5.8','APG'],['8.0','PPG'],['1.4','3PM']],read:'Clark leads USA in assists. France will test whether her passing can create clean shots before its pressure gets set.'},
      {name:'Rhyne Howard',id:'225895',role:'THE BALL PRESSURE',stats:[['2.0','SPG'],['7.4','PPG'],['1.6','3PM']],read:'Howard gives USA a point of attack disruptor who can make the first pass uncomfortable and turn defense into pace.'}
    ],
    FRA:[
      {name:'Gabby Williams',id:'216915',role:'THE TOURNAMENT ENGINE',stats:[['18.4','PPG'],['5.2','RPG'],['2.8','SPG']],read:'Williams is France’s scorer, connector and defensive spark. Her semifinal line was 22 points, five rebounds, five assists and four steals.'},
      {name:'Marine Johannes',id:'191610',role:'THE GEOMETRY BREAKER',stats:[['15.8','PPG'],['3.4','APG'],['16.8','EFF']],read:'Johannes changes the map of a possession. Her shooting range forces USA to defend farther from the rim than it wants.'},
      {name:'Janelle Salaun',id:'237521',role:'THE TWO WAY CONNECTOR',stats:[['12.0','PPG'],['6.2','RPG'],['16.2','EFF']],read:'Salaun gives France size, rebounding and another player who can punish a defense that spends too much attention elsewhere.'},
      {name:'Dominique Malonga',id:'298012',role:'THE INTERIOR CEILING',stats:[['10.0','PPG'],['6.6','RPG'],['1.0','BPG']],read:'Malonga is France’s leading rebounder and rim protector. Her length can make USA’s second chances much more expensive.'}
    ]
  };
  const history={
    USA:{
      title:'United States',sub:'The standard everyone is trying to catch',numbers:[['11','WORLD TITLES'],['14','MEDALS BEFORE 2026'],['35','STRAIGHT WORLD CUP WINS'],['4','STRAIGHT WORLD TITLES']],
      timeline:[['1953','Won the first Women’s World Cup, beginning an 11 title history.'],['2006','Took bronze. That semifinal loss remains USA’s most recent World Cup defeat.'],['2010 to 2022','Won four consecutive World Cups, in 2010, 2014, 2018 and 2022.'],['2024','Beat France 67 to 66 for Olympic gold in Paris.'],['2026','Reached a fifth straight World Cup final and guaranteed a 15th World Cup medal.']]
    },
    FRA:{
      title:'France',sub:'A 73 year wait has reached the championship game',numbers:[['0','WORLD TITLES'],['1','MEDAL BEFORE 2026'],['1953','PREVIOUS MEDAL'],['1ST','WORLD CUP FINAL']],
      timeline:[['1953','Finished third at the inaugural Women’s World Cup, France’s only medal before this tournament.'],['2012','Reached the Olympic final and established a modern era of global contention.'],['2024','Lost the Olympic gold medal game to USA by one point, 67 to 66.'],['2026','Beat Germany 86 to 64 to reach the first World Cup final in program history.'],['Sunday','A win would make France the fifth nation ever to become Women’s World Cup champion.']]
    }
  };
  let latestPayload=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const one=value=>Number.isFinite(Number(value))?Number(value).toFixed(1):'…';
  const pct=value=>`${Math.max(0,Math.min(100,Number(value)||0))}%`;
  const teamRows=payload=>Array.isArray(payload?.tournamentTable)?payload.tournamentTable:[];
  const teamFor=(payload,code)=>teamRows(payload).find(team=>team.code===code)||fallbackTeams[code];

  function renderCountries(payload){
    const host=document.getElementById('fgCountryBoard');
    if(!host)return;
    host.innerHTML=['USA','FRA'].map(code=>{
      const team=teamFor(payload,code);
      const cls=code.toLowerCase();
      const score=Number(team.wScore)||fallbackTeams[code].wScore;
      return `<article class="fg-country-card ${cls}">
        <div class="fg-country-card-head">
          <div class="fg-country-name"><img src="${flags[code]}" alt="${code==='USA'?'United States':'France'} flag"><span><strong>${esc(code==='USA'?'United States':'France')}</strong><small>${code} · FINALIST</small></span></div>
          <div class="fg-record">${esc(team.wins)} W · ${esc(team.losses)} L</div>
        </div>
        <div class="fg-country-score"><strong>${one(score)}</strong><div><span>WE KNOW THE W SCORE</span><div class="fg-wbar" aria-label="W Score ${one(score)} out of 100"><i style="width:${pct(score)}"></i></div></div></div>
        <div class="fg-country-stats">
          <div><small>POINTS PER GAME</small><b>${one(team.ppg)}</b></div>
          <div><small>ALLOWED PER GAME</small><b>${one(team.oppPpg)}</b></div>
          <div><small>AVG MARGIN</small><b>${Number(team.diffPerGame)>=0?'+':''}${one(team.diffPerGame)}</b></div>
        </div>
        <p class="fg-country-context">${esc(context[code])}</p>
      </article>`;
    }).join('');
    const updated=document.getElementById('fgUpdated');
    if(updated){
      const raw=payload?.updatedAt?new Date(payload.updatedAt):null;
      updated.textContent=raw&&!Number.isNaN(raw.getTime())?`Checked ${new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(raw)}`:'Current semifinal snapshot';
    }
  }

  function headshot(id){return `https://assets.fiba.basketball/image/upload/w_720,h_960,c_pad,g_north/f_png/q_auto/.headshot--person_${encodeURIComponent(id)}--competition_208875`;}
  function renderPlayers(code){
    const host=document.getElementById('fgPlayerBoard');
    if(!host)return;
    host.innerHTML=players[code].map(player=>`<article class="fg-player-card">
      <div class="fg-player-photo"><img src="${headshot(player.id)}" alt="Official FIBA portrait of ${esc(player.name)}" loading="lazy"><span>OFFICIAL FIBA PORTRAIT</span></div>
      <div class="fg-player-copy"><h3>${esc(player.name)}</h3><span>${esc(player.role)}</span><div class="fg-player-stats">${player.stats.map(stat=>`<div><b>${esc(stat[0])}</b><small>${esc(stat[1])}</small></div>`).join('')}</div><p class="fg-player-read">${esc(player.read)}</p></div>
    </article>`).join('');
  }

  function renderHistory(code){
    const host=document.getElementById('fgHistoryPanel');
    if(!host)return;
    const data=history[code];
    host.innerHTML=`<article class="fg-history-scoreboard"><h3>${esc(data.title)}</h3><p>${esc(data.sub)}</p><div class="fg-history-big">${data.numbers.map(item=>`<div><strong>${esc(item[0])}</strong><span>${esc(item[1])}</span></div>`).join('')}</div></article><div class="fg-history-timeline">${data.timeline.map(item=>`<article><b>${esc(item[0])}</b><span>${esc(item[1])}</span></article>`).join('')}</div>`;
  }

  function findFinal(payload){
    const games=Array.isArray(payload?.games)?payload.games:[];
    return games.find(game=>{
      const codes=[game.home?.code,game.away?.code];
      if(!codes.includes('USA')||!codes.includes('FRA'))return false;
      const phase=String(game.phase||'').toLowerCase();
      return phase==='final'||game.roundCode==='F'||String(game.date||'')==='2026-09-13';
    });
  }

  function renderGame(payload){
    const game=findFinal(payload);
    const state=document.getElementById('fgGameState');
    const score=document.getElementById('fgScore');
    const local=document.getElementById('fgLocalTime');
    if(local)local.textContent=new Intl.DateTimeFormat(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(FINAL_TIP);
    if(!game){if(state)state.textContent='FINAL SET';if(score)score.textContent='VS';return;}
    if(game.status==='final'){
      if(state)state.textContent='FINAL';
      if(score){
        const usa=game.home?.code==='USA'?game.homeScore:game.awayScore;
        const fra=game.home?.code==='FRA'?game.homeScore:game.awayScore;
        score.textContent=`USA ${usa} · ${fra} FRA`;
      }
    }else if(game.status==='live'){
      if(state)state.textContent='LIVE';
      if(score){
        const usa=game.home?.code==='USA'?game.homeScore:game.awayScore;
        const fra=game.home?.code==='FRA'?game.homeScore:game.awayScore;
        score.textContent=`USA ${usa??0} · ${fra??0} FRA`;
      }
    }else if(state)state.textContent='FINAL SET';
  }

  function updateCountdown(){
    const host=document.getElementById('fgCountdown');
    if(!host)return;
    const game=findFinal(latestPayload);
    if(game?.status==='final'){host.textContent='The championship game is final. The dashboard above reflects the result.';return;}
    if(game?.status==='live'){host.textContent='The championship game is live in Berlin.';return;}
    const diff=FINAL_TIP.getTime()-Date.now();
    if(diff<=0){host.textContent='The championship window is open. Checking FIBA for live status…';return;}
    const hours=Math.floor(diff/3600000),minutes=Math.floor((diff%3600000)/60000);
    host.textContent=`Tipoff in ${hours}h ${minutes}m · Sunday, September 13`;
  }

  async function refresh(){
    try{
      const response=await fetch(`${ENDPOINT}?cb=${Date.now()}`,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error('FIBA feed unavailable');
      latestPayload=await response.json();
      renderCountries(latestPayload);renderGame(latestPayload);
    }catch{
      latestPayload=null;renderCountries(null);renderGame(null);
      const updated=document.getElementById('fgUpdated');if(updated)updated.textContent='Live feed reconnecting · verified semifinal snapshot shown';
    }
    updateCountdown();
  }

  document.querySelectorAll('[data-team]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-team]').forEach(node=>node.setAttribute('aria-selected',String(node===button)));
    renderPlayers(button.dataset.team);
  }));
  document.querySelectorAll('[data-history]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-history]').forEach(node=>node.setAttribute('aria-selected',String(node===button)));
    renderHistory(button.dataset.history);
  }));

  renderPlayers('USA');renderHistory('USA');renderCountries(null);renderGame(null);updateCountdown();refresh();
  setInterval(updateCountdown,60000);
  setInterval(refresh,180000);
})();
