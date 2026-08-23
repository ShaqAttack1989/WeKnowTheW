(()=>{
  const params=new URLSearchParams(location.search);
  const slug=params.get('team')||'';
  const current=typeof teamBySlug==='function'?teamBySlug(slug):null;
  const anchor=document.getElementById('whats-happening');
  if(!current||!anchor)return;

  const safe=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const norm=(value='')=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const num=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
  const one=value=>num(value)===null?'—':num(value).toFixed(1);
  const signed=value=>num(value)===null?'—':`${num(value)>0?'+':''}${num(value).toFixed(1)}`;
  const pct=value=>{const n=num(value);if(n===null)return '—';return `${(Math.abs(n)<=1?n*100:n).toFixed(1)}%`;};
  const rate100=value=>{const n=num(value);if(n===null)return '—';return (Math.abs(n)<=1?n*100:n).toFixed(1);};
  const rankText=(rank,pool=15)=>num(rank)===null?'—':`#${Number(rank)} of ${Number(pool)||15}`;
  const recordText=value=>String(value||'—');
  const poolFor=(row,field)=>Number(row?.[`${field}RankPool`]||15);
  const tone=(rank,pool=15,neutral=false)=>{
    if(neutral||num(rank)===null)return 'dna-neutral';
    const n=Number(rank),total=Math.max(3,Number(pool)||15),third=Math.ceil(total/3);
    return n<=third?'dna-strong':n>total-third?'dna-watch':'dna-middle';
  };
  const valueCard=(label,value,rank,note,options={})=>{
    const cls=tone(rank,options.pool||15,options.neutral);
    return `<article class="dna-score-card ${cls}${options.feature?' dna-feature':''}"><span>${safe(label)}</span><strong>${safe(value)}</strong><small>${safe(rankText(rank,options.pool||15))}${note?` · ${safe(note)}`:''}</small></article>`;
  };
  const metricRow=(label,value,rank,note,options={})=>{
    const cls=tone(rank,options.pool||15,options.neutral);
    return `<div class="dna-metric-row ${cls}"><div><span>${safe(label)}</span>${note?`<small>${safe(note)}</small>`:''}</div><strong>${safe(value)}</strong><b>${safe(rankText(rank,options.pool||15))}</b></div>`;
  };
  const streakScore=value=>{
    const text=String(value||'').toUpperCase();const count=Number(text.replace(/[^0-9]/g,''))||0;
    if(text.startsWith('W'))return count>=5?100:count>=3?85:65;
    if(text.startsWith('L'))return count>=5?5:count>=3?20:35;
    return 50;
  };
  const temperature=(row,standing)=>{
    const rating=num(row.overallRating)??50;
    const parts=String(standing?.last_ten||'').split('-').map(Number);
    const lastTenPct=Number.isFinite(parts[0])&&Number.isFinite(parts[1])&&(parts[0]+parts[1])?parts[0]/(parts[0]+parts[1]):(num(row.winPct)??.5);
    const score=.55*rating+.35*(lastTenPct*100)+.10*streakScore(standing?.streak);
    let label='😌 STEADY',cls='temp-steady';
    if(score>=82){label='🔥 SCORCHING';cls='temp-scorching';}
    else if(score>=68){label='🌡️ HEATING UP';cls='temp-heating';}
    else if(score<32){label='🚨 IN TROUBLE';cls='temp-trouble';}
    else if(score<48){label='🥶 COLD';cls='temp-cold';}
    const last10=standing?.last_ten||'—';const streak=standing?.streak||'—';
    const netRank=num(row.netRtgRank)?`#${row.netRtgRank} net rating`:'net rating still calculating';
    return {label,cls,score:Math.round(score),copy:`${last10} over the last 10, ${netRank}, ${streak} current streak.`};
  };

  function addNavLink(){
    const nav=document.querySelector('#teamLocalNav .team-local-nav-inner');if(!nav||nav.querySelector('a[href="#team-dna"]'))return;
    const link=document.createElement('a');link.href='#team-dna';link.textContent='Team DNA';
    const first=nav.querySelector('a');first?.insertAdjacentElement('afterend',link);
  }

  const section=document.createElement('section');
  section.className='team-content team-dna-section';section.id='team-dna';
  section.innerHTML=`<div class="team-section-heading dream-heading-row"><div><p class="kicker">THE TEAM DNA</p><h2>How they win, where they hurt you, and where they’re vulnerable.</h2><p>Possession-based ratings, efficiency, style and situational context for the 2026 season.</p></div><p class="dna-feed-status" id="teamDnaStatus"><span aria-hidden="true"></span> Building the profile…</p></div><div id="teamDnaBody"><div class="dna-loading">Reading the numbers behind the record…</div></div>`;
  anchor.insertAdjacentElement('afterend',section);addNavLink();

  if(slug==='cleveland-sirens'){
    document.getElementById('teamDnaBody').innerHTML='<div class="dna-empty"><strong>The Sirens’ DNA starts in 2028.</strong><p>Offensive rating, defensive rating, pace, efficiency and Team Temperature will populate after Cleveland begins playing official WNBA games.</p></div>';
    document.getElementById('teamDnaStatus').textContent='Expansion profile · metrics begin in 2028';
    return;
  }

  function render(row,standing,dnaPayload){
    if(num(row.oppPpg)===null&&num(row.ppg)!==null&&num(row.mov)!==null)row.oppPpg=num(row.ppg)-num(row.mov);
    const temp=temperature(row,standing);
    const ratingPool=Number(row.overallRankPool||dnaPayload.teamCount||15);
    const top=`
      <div class="dna-score-grid">
        ${valueCard('OFFENSIVE RATING',one(row.offRtg),row.offRtgRank,'points / 100 poss.',{pool:poolFor(row,'offRtg')})}
        ${valueCard('DEFENSIVE RATING',one(row.defRtg),row.defRtgRank,'allowed / 100 poss.',{pool:poolFor(row,'defRtg')})}
        ${valueCard('NET RATING',signed(row.netRtg),row.netRtgRank,'per 100 poss.',{pool:poolFor(row,'netRtg')})}
        ${valueCard('OVERALL RATING · W RATING',`${Math.round(num(row.overallRating)??0)} / 100`,row.overallRank,'We Know the W composite',{pool:ratingPool,feature:true})}
        ${valueCard('PACE OF PLAY',one(row.pace),row.paceRank,'possessions / 40 min.',{pool:poolFor(row,'pace'),neutral:true})}
        <article class="dna-temperature ${temp.cls}"><span>TEAM TEMPERATURE</span><strong>${safe(temp.label)}</strong><small>${safe(temp.copy)}</small></article>
      </div>`;

    const offense=[
      ['Points / game',one(row.ppg),row.ppgRank,'raw scoring'],
      ['Effective FG%',pct(row.offEfgPct),row.offEfgPctRank,'shot-value efficiency'],
      ['True shooting',pct(row.tsPct),row.tsPctRank,'2s + 3s + free throws'],
      ['3-point %',pct(row.threePct),row.threePctRank,'accuracy from deep'],
      ['Assists / game',one(row.ast),row.astRank,'ball movement'],
      ['Turnover %',pct(row.offTovPct),row.offTovPctRank,'lower is better'],
      ['Offensive rebound %',pct(row.orbPct),row.orbPctRank,'extra possessions'],
      ['Free throw rate',rate100(row.ftr),row.ftrRank,'FTA per 100 FGA']
    ];
    const defense=[
      ['Opponent points / game',one(row.oppPpg),row.oppPpgRank,'lower is better'],
      ['Opponent eFG%',pct(row.defEfgPct),row.defEfgPctRank,'shot quality allowed'],
      ['Forced turnover %',pct(row.defTovPct),row.defTovPctRank,'higher is better'],
      ['Defensive rebound %',pct(row.drbPct),row.drbPctRank,'finish the stop'],
      ['Steals / game',one(row.stl),row.stlRank,'takeaways'],
      ['Blocks / game',one(row.blk),row.blkRank,'rim disruption'],
      ['Defensive rating',one(row.defRtg),row.defRtgRank,'allowed / 100 poss.'],
      ['Opponent FT/FGA',rate100(row.defFtFga),null,'free throws allowed / 100 FGA',{neutral:true})
    ];
    const situational=[
      ['Home record',recordText(standing?.home_record),null,'home floor',{neutral:true}),
      ['Road record',recordText(standing?.road_record),null,'away games',{neutral:true}),
      ['Last 10',recordText(standing?.last_ten),null,'recent form',{neutral:true}),
      ['Current streak',recordText(standing?.streak),null,'right now',{neutral:true}),
      ['Average margin',signed(row.mov),row.movRank,'points / game'],
      ['Strength of schedule',signed(row.sos),row.sosRank,'higher = tougher',{neutral:true}),
      ['Expected W–L',`${num(row.expectedWins)??'—'}–${num(row.expectedLosses)??'—'}`,null,'point-differential model',{neutral:true}),
      ['SRS',signed(row.srs),row.srsRank,'margin + schedule strength']
    ];
    const board=(kicker,title,copy,rows)=>`<article class="dna-board"><div class="dna-board-head"><span>${safe(kicker)}</span><h3>${safe(title)}</h3><p>${safe(copy)}</p></div><div class="dna-metric-list">${rows.map(item=>metricRow(item[0],item[1],item[2],item[3],item[4]||{})).join('')}</div></article>`;
    document.getElementById('teamDnaBody').innerHTML=`${top}<div class="dna-board-grid">${board('OFFENSE','HOW THEY EAT','Where the points and possessions come from.',offense)}${board('DEFENSE','NO FLY ZONE','How well they erase advantages and end possessions.',defense)}${board('SITUATIONAL PULSE','WHEN IT GETS TIGHT','Recent form, splits and season context without pretending every close game is the same.',situational)}</div><div class="dna-source"><div><strong>Reading the board</strong><p>Green = top third of the WNBA, yellow = middle third, red = bottom third. Pace and strength of schedule are style/context metrics, so they stay neutral.</p></div><div><strong>Sources + methodology</strong><p>2026 team metrics from Basketball-Reference. Live record splits from We Know the W’s standings feed. W Rating and Team Temperature are We Know the W composites, not official league statistics.</p><a href="${safe(dnaPayload.sourceUrl||'https://www.basketball-reference.com/wnba/years/2026.html')}" target="_blank" rel="noopener">Basketball-Reference season table ↗</a></div></div>`;
    const updated=dnaPayload.updatedAt?new Date(dnaPayload.updatedAt):null;
    document.getElementById('teamDnaStatus').innerHTML=`<span aria-hidden="true"></span> ${dnaPayload.teamCount||15} teams ranked${updated&&!Number.isNaN(updated.getTime())?` · checked ${safe(updated.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))}`:''}`;
  }

  async function load(){
    try{
      const [dnaResult,statsResult]=await Promise.allSettled([
        fetch(`/api/team-dna?season=2026&v=20260823-v1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Team DNA unavailable');return data;}),
        fetch(`/api/stats?season=2026&teamDna=1&cb=${Date.now()}`,{headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store'}).then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Standings unavailable');return data;})
      ]);
      if(dnaResult.status!=='fulfilled')throw dnaResult.reason;
      const dna=dnaResult.value;const row=(dna.teams||[]).find(item=>norm(item.name)===norm(current.name));
      if(!row)throw new Error(`No 2026 Team DNA row matched ${current.name}.`);
      const standings=statsResult.status==='fulfilled'?(statsResult.value.standings||[]):[];
      const standing=standings.find(item=>norm(item.team?.full_name)===norm(current.name))||null;
      render(row,standing,dna);
    }catch(error){
      document.getElementById('teamDnaBody').innerHTML=`<div class="dna-empty"><strong>Team DNA is refreshing.</strong><p>${safe(error.message||'The analytics source is reconnecting.')} The rest of the franchise page remains live.</p></div>`;
      document.getElementById('teamDnaStatus').textContent='Analytics feed temporarily unavailable';
    }
  }
  load();
})();