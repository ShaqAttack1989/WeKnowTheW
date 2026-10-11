(()=>{
  const PAIRS=[
    {
      id:'taurasi-taylor',seed:1,names:['Diana Taurasi','Penny Taylor'],short:'Taurasi + Taylor',team:'Phoenix Mercury',overlap:'WNBA teammates · Phoenix Mercury',tag:'WNBA teammates',score:99,
      metrics:{success:35,peak:25,fit:19,longevity:10,bigStage:10},
      summary:'Three shared Mercury championships, 2007, 2009 and 2014. Taurasi supplied pressure and shot creation while Taylor connected lineups, defended across roles and punished the space around her.',
      photo:'https://www.si.com/.image/t_share/MTY4MTA0MzMwODk0OTEwODQ4/wnba-diana-taurasi-wedding-teammate-penny-taylorjpg.jpg',
      photoCredit:'Sports Illustrated',photoSource:'https://www.si.com/wnba/2017/05/15/wnba-diana-taurasi-wedding-teammate-penny-taylor'
    },
    {
      id:'sloot-quigley',seed:2,names:['Courtney Vandersloot','Allie Quigley'],short:'Vandersloot + Quigley',team:'Chicago Sky',overlap:'WNBA teammates · Chicago Sky',tag:'WNBA teammates',score:96,
      metrics:{success:32,peak:24,fit:20,longevity:10,bigStage:10},
      summary:'A decade of shared Chicago basketball culminated in the 2021 WNBA championship. Vandersloot bent defenses with passing while Quigley bent them with movement shooting.',
      photo:'https://cdn.wnba.com/sites/4/2022/02/featured-article-2.png',
      photoCredit:'WNBA / Chicago Sky',photoSource:'https://www.wnba.com/news/chicago-sky-re-sign-allie-quigley-and-courtney-vandersloot'
    },
    {
      id:'bonner-thomas',seed:3,names:['DeWanna Bonner','Alyssa Thomas'],short:'Bonner + Thomas',team:'Connecticut Sun / Phoenix Mercury',overlap:'WNBA teammates · Connecticut, later Phoenix',tag:'WNBA teammates',score:93,
      metrics:{success:29,peak:25,fit:20,longevity:10,bigStage:9},
      summary:'Years of contention in Connecticut included the 2022 WNBA Finals. Bonner stretches matchups with length and scoring while Thomas turns the frontcourt into a playmaking engine.',
      photo:'https://static.independent.co.uk/2024/06/07/11/Sun_Liberty_Basketball_86055.jpg',
      photoCredit:'AP via The Independent',photoSource:'https://www.independent.co.uk/news/ap-thomas-wnba-new-york-indiana-b2558561.html'
    },
    {
      id:'bueckers-fudd',seed:4,names:['Paige Bueckers','Azzi Fudd'],short:'Bueckers + Fudd',team:'UConn / Dallas Wings',overlap:'College teammates, now WNBA teammates',tag:'WNBA teammates',score:90,
      metrics:{success:28,peak:24,fit:20,longevity:10,bigStage:8},
      summary:'A 2025 NCAA championship gave the partnership a banner before the Dallas chapter even began. Bueckers creates advantages; Fudd spaces, shoots and defends around them.',
      photo:'https://s.hdnux.com/photos/01/66/13/60/30981171/3/ratio3x2_1920.jpg',
      photoCredit:'CT Insider / Getty Images',photoSource:'https://www.ctinsider.com/sports/uconn-womens-basketball/article/wnba-gm-survey-paige-bueckers-azzi-fudd-wings-22243768.php'
    },
    {
      id:'williams-johannes',seed:5,names:['Gabby Williams','Marine Johannès'],short:'Williams + Johannès',team:'France',overlap:'International teammates · France',tag:'International teammates',score:89,
      metrics:{success:29,peak:23,fit:20,longevity:8,bigStage:9},
      summary:'Their France tape is the style matchup of the field: Williams attacks seams and defends everywhere, Johannès turns impossible angles into passing and shooting windows.',
      photo:'https://assets.fiba.basketball/image/upload/f_auto/q_auto/v1721989501/dmiwq9ntjcbiotiz6nv1.jpg',
      photoCredit:'FIBA',photoSource:'https://www.fiba.basketball/en/events/womens-olympic-basketball-tournament-paris-2024/news/the-french-connection-gabby-on-mj-and-mj-on-gabby'
    },
    {
      id:'stewart-xargay',seed:6,names:['Breanna Stewart','Marta Xargay'],short:'Stewart + Xargay',team:'Dynamo Kursk',overlap:'Club teammates · Dynamo Kursk',tag:'Club teammates',score:82,
      metrics:{success:23,peak:25,fit:18,longevity:7,bigStage:9},
      summary:'The shared club window was shorter than the top seeds, but the collective talent level was enormous. Their teammate origin came with Dynamo Kursk in Russia.',
      photo:'https://s.yimg.com/ny/api/res/1.2/PhqvIgqeyeurqh6yEVABQQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTk2MDtoPTk2MA--/https%3A/media.zenfs.com/en/us_magazine_896/75f26a6e3ab274212bc8e800b47c1605',
      photoCredit:'Us Weekly via Yahoo',photoSource:'https://www.yahoo.com/entertainment/wnba-star-breanna-stewart-wife-135352710.html'
    },
    {
      id:'thomas-hiedeman',seed:7,names:['Jasmine Thomas','Natisha Hiedeman'],short:'Thomas + Hiedeman',team:'Connecticut Sun',overlap:'WNBA teammates · Connecticut Sun',tag:'WNBA teammates',score:77,
      metrics:{success:24,peak:19,fit:18,longevity:8,bigStage:8},
      summary:'Their Connecticut overlap included a 2019 Finals run. Thomas brought point of attack defense and control; Hiedeman added pace, shooting and another hard nosed guard presence.',
      photo:'https://www.out.com/media-library/wnba-stars-and-teammates-natisha-hiedeman-and-jasmine-thomas-are-engaged.jpg?id=32514357&quality=65&width=800',
      photoCredit:'Out',photoSource:'https://www.out.com/sports/2021/9/17/wnba-teammates-natisha-hiedeman-jasmine-thomas-engagement-announcement-pictures'
    },
    {
      id:'cloud-harrison',seed:8,names:['Natasha Cloud','Isabelle Harrison'],short:'Cloud + Harrison',team:'New York Liberty',overlap:'WNBA teammates · New York Liberty',tag:'WNBA teammates',score:67,
      metrics:{success:18,peak:20,fit:18,longevity:5,bigStage:6},
      summary:'The shortest teammate sample in the field keeps the score grounded. Cloud brings physical point guard defense and playmaking; Harrison supplies mobile frontcourt skill and finishing.',
      photo:'https://media.glamour.com/photos/692e14d52ce20fe11fba9197/master/w_1024%2Cc_limit/2225008275',
      photoCredit:'Glamour / Getty Images',photoSource:'https://www.glamour.com/gallery/wnba-couples'
    }
  ];

  const LEGACY=new Set(['Diana Taurasi','Penny Taylor','Allie Quigley','Marta Xargay','Jasmine Thomas']);
  const METRICS=[
    ['success','Shared success',35],['peak','Collective peak',25],['fit','Basketball fit',20],['longevity','Longevity',10],['bigStage','Big stage',10]
  ];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const key=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const pairById=id=>PAIRS.find(pair=>pair.id===id);

  function renderBracket(){
    const host=document.getElementById('lbBracket'),verdict=document.getElementById('lbBracketVerdict');
    if(!host)return;
    const qf=[[1,8],[4,5],[3,6],[2,7]].map(seeds=>seeds.map(seed=>PAIRS.find(pair=>pair.seed===seed)));
    const qfWinners=qf.map(match=>match.reduce((a,b)=>a.score>b.score?a:b));
    const semis=[[qfWinners[0],qfWinners[1]],[qfWinners[2],qfWinners[3]]];
    const semiWinners=semis.map(match=>match.reduce((a,b)=>a.score>b.score?a:b));
    const final=semiWinners;
    const champion=final.reduce((a,b)=>a.score>b.score?a:b);
    const matchMarkup=(match,label)=>{
      const winner=match.reduce((a,b)=>a.score>b.score?a:b);
      return `<div class="lb-match"><div class="lb-match-title">${esc(label)}</div>${match.map(pair=>`<button class="lb-teamline ${pair.id===winner.id?'winner':''}" type="button" data-pair-id="${esc(pair.id)}" aria-label="Open ${esc(pair.short)} scouting card"><span class="lb-seed">${pair.seed}</span><strong>${esc(pair.short)}</strong><b>${pair.score}</b></button>`).join('')}</div>`;
    };
    host.innerHTML=`
      <div class="lb-round"><h3>Quarterfinals</h3>${qf.map((match,index)=>matchMarkup(match,`QF ${index+1}`)).join('')}</div>
      <div class="lb-round semis"><h3>Semifinals</h3>${semis.map((match,index)=>matchMarkup(match,`Semifinal ${index+1}`)).join('')}</div>
      <div class="lb-round final"><h3>Championship</h3>${matchMarkup(final,'Pair W Score Final')}</div>`;
    if(verdict)verdict.innerHTML=`<div class="champ-score">${champion.score}</div><div><span class="kicker">BRACKET CHAMPION</span><strong>${esc(champion.names.join(' + '))}</strong><p>Three shared WNBA championships separate the No. 1 seed from an elite Chicago final pairing.</p></div>`;
    host.addEventListener('click',event=>{
      const button=event.target.closest('[data-pair-id]');
      if(!button)return;
      const card=document.querySelector(`[data-profile-id="${CSS.escape(button.dataset.pairId)}"]`);
      if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.animate([{transform:'scale(1)'},{transform:'scale(1.015)'},{transform:'scale(1)'}],{duration:500});}
    });
  }

  function renderProfiles(){
    const host=document.getElementById('lbProfileGrid');if(!host)return;
    host.innerHTML=PAIRS.map(pair=>`<article class="lb-profile" data-profile-id="${esc(pair.id)}">
      <div class="lb-profile-photo"><img src="${esc(pair.photo)}" alt="Real basketball photo of ${esc(pair.names.join(' and '))}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.closest('.lb-profile-photo').classList.add('image-error');this.style.display='none'">
        <div class="lb-profile-photo-copy"><div><span>#${pair.seed} · ${esc(pair.tag)}</span><strong>${esc(pair.names.join(' + '))}</strong></div><strong class="lb-profile-score">${pair.score}</strong></div>
      </div>
      <div class="lb-profile-body"><div class="lb-profile-tags"><span class="lb-profile-tag wnba">PAIR W SCORE ${pair.score}</span><span class="lb-profile-tag">${esc(pair.overlap)}</span></div><p>${esc(pair.summary)}</p>
        <div class="lb-metrics">${METRICS.map(([id,label,max])=>{const value=pair.metrics[id];return `<div class="lb-metric"><span>${esc(label)}</span><div class="lb-meter" aria-label="${esc(label)} ${value} of ${max}"><i style="width:${Math.round(value/max*100)}%"></i></div><b>${value}/${max}</b></div>`;}).join('')}</div>
        <small class="lb-photo-credit">Photo: <a href="${esc(pair.photoSource)}" target="_blank" rel="noopener noreferrer">${esc(pair.photoCredit)}</a></small>
      </div>
    </article>`).join('');
  }

  function playerRow(name,grades){
    if(LEGACY.has(name))return `<div class="lb-live-pair"><b>${esc(name)}</b><em class="legacy">LEGACY</em></div>`;
    const player=grades.get(key(name));
    if(!player)return `<div class="lb-live-pair"><b>${esc(name)}</b><em class="legacy">NR</em></div>`;
    const suffix=player.provisional?'*':'';
    return `<div class="lb-live-pair"><b>${esc(name)}</b><em>${esc(player.score)} ${esc(player.letter||'')}${suffix}</em><small>${esc(player.team||'')}</small><small>${player.provisional?'provisional':'2026'}</small></div>`;
  }

  function renderLiveScores(grades=new Map()){
    const host=document.getElementById('lbLiveScoreboard');if(!host)return;
    host.innerHTML=PAIRS.map(pair=>`<article class="lb-live-card"><span>#${pair.seed} · Pair W Score ${pair.score}</span><strong>${esc(pair.short)}</strong>${pair.names.map(name=>playerRow(name,grades)).join('')}</article>`).join('');
  }

  async function loadLiveGrades(){
    const status=document.getElementById('lbLiveStatus'),note=document.getElementById('lbMethodNote');
    renderLiveScores();
    try{
      const response=await fetch('/api/player-grades?season=2026',{headers:{Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error(`Grade feed returned ${response.status}`);
      const payload=await response.json();
      const grades=new Map((payload.players||[]).map(player=>[key(player.name),player]));
      renderLiveScores(grades);
      if(status){const updated=payload.updatedAt?new Date(payload.updatedAt).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'live';status.textContent=`Live 2026 W Score connected · Updated ${updated} · ${payload.source||'We Know the W grade feed'}`;status.classList.add('is-live');}
      if(note&&payload.methodology)note.textContent=`${payload.methodology} Pair W Score is a separate teammate résumé model and does not grade the relationship itself.`;
    }catch(error){
      if(status){status.textContent='Live individual W Score is reconnecting. The Pair W Score tournament remains available.';status.classList.add('is-error');}
    }
  }

  function renderLab(){
    const a=document.getElementById('lbPairA'),b=document.getElementById('lbPairB'),host=document.getElementById('lbMatchupDashboard');if(!a||!b||!host)return;
    const options=PAIRS.map(pair=>`<option value="${esc(pair.id)}">#${pair.seed} ${esc(pair.names.join(' + '))} · ${pair.score}</option>`).join('');
    a.innerHTML=options;b.innerHTML=options;a.value='taurasi-taylor';b.value='sloot-quigley';
    const draw=()=>{
      let left=pairById(a.value),right=pairById(b.value);if(!left||!right)return;
      if(left.id===right.id){const alternate=PAIRS.find(pair=>pair.id!==left.id);right=alternate;b.value=alternate.id;}
      const winner=left.score===right.score?null:(left.score>right.score?left:right);
      host.innerHTML=`<div class="lb-lab-head"><div><h3>${esc(left.short)}</h3><strong>${left.score}</strong></div><span class="lb-lab-winner">${winner?`${esc(winner.short)} advances`:'Even score'}</span><div><h3>${esc(right.short)}</h3><strong>${right.score}</strong></div></div><div class="lb-lab-rows">${METRICS.map(([id,label,max])=>`<div class="lb-lab-row"><b>${left.metrics[id]}</b><div class="lb-lab-bar left"><i style="width:${Math.round(left.metrics[id]/max*100)}%"></i></div><span>${esc(label)}</span><div class="lb-lab-bar"><i style="width:${Math.round(right.metrics[id]/max*100)}%"></i></div><b>${right.metrics[id]}</b></div>`).join('')}</div>`;
    };
    a.addEventListener('change',draw);b.addEventListener('change',draw);draw();
  }

  renderBracket();
  renderProfiles();
  renderLab();
  loadLiveGrades();
})();