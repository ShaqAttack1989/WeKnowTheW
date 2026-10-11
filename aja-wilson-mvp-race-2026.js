(()=>{
  const CANDIDATES=[
    {rank:1,name:"A’ja Wilson",team:"Las Vegas Aces",code:"LVA",id:"1628932",ppg:26.1,rpg:9.4,apg:3.2,fg:52.6,onoff:26.3,odds:"-1400",tag:"THE COMPLETE CASE",note:"League-leading scoring average and blocks, elite efficiency, huge two-way burden and the largest published on/off swing in the current WNBA MVP top three."},
    {rank:2,name:"Olivia Miles",team:"Minnesota Lynx",code:"MIN",id:"1643426",ppg:19.7,rpg:4.6,apg:6.0,fg:48.8,onoff:5.8,odds:"+900",tag:"THE BEST-TEAM CASE",note:"A rookie running the No. 1 team while leading Minnesota in scoring and assists. Her case gets louder every time the Lynx turn control into wins."},
    {rank:3,name:"Kelsey Mitchell",team:"Indiana Fever",code:"IND",id:"1628909",ppg:25.2,rpg:1.7,apg:2.8,fg:51.8,onoff:13.3,odds:"+5000",tag:"THE HISTORY CASE",note:"The new single-season points record holder has made scoring volume, efficiency and availability impossible to treat as a side note."},
    {rank:4,name:"Caitlin Clark",team:"Indiana Fever",code:"IND",id:"1642286",ppg:22.5,rpg:3.9,apg:8.4,fg:45.6,onoff:null,odds:"+8000",tag:"THE CREATION CASE",note:"The best playmaking argument in this five. Her passing forces rotations before the box score can capture what she created."},
    {rank:5,name:"Paige Bueckers",team:"Dallas Wings",code:"DAL",id:"1642784",ppg:20.4,rpg:4.1,apg:5.8,fg:50.8,onoff:null,odds:"+25000",tag:"THE BALANCE CASE",note:"Efficient 20-point scoring plus nearly six assists for a Dallas team that turned a strong year into a playoff berth."}
  ];
  const LENSES={
    scoring:{label:"SCORING VOLUME",title:"Who owns the scoreboard?",text:"Wilson still leads the scoring title by average even after Mitchell broke the single-season total-points record. That distinction matters: total points rewards production plus games played; points per game measures night-to-night scoring rate.",metric:"ppg",suffix:" PPG"},
    playmaking:{label:"PLAYMAKING",title:"Who creates the most for everybody else?",text:"Clark’s case spikes when the ballot is viewed through creation. Miles and Bueckers also carry major organizing responsibility. Wilson’s lower assist total comes from a different offensive role, not a lack of creation gravity.",metric:"apg",suffix:" APG"},
    efficiency:{label:"SHOT-MAKING",title:"Who converts volume into clean offense?",text:"Field-goal percentage is not a complete efficiency metric, but it gives the board a simple common lens. Mitchell’s scoring surge has come with remarkable shot-making, while Wilson combines interior dominance with expanded range.",metric:"fg",suffix:"% FG"},
    impact:{label:"PUBLISHED ON/OFF",title:"What happens when they leave the floor?",text:"The current WNBA MVP analysis published comparable net-rating swings for Wilson, Mitchell and Miles. It did not publish the same figure for Clark or Bueckers in that article, so this lens leaves those entries blank rather than inventing a comparison.",metric:"onoff",suffix:" NET",partial:true},
    team:{label:"TEAM CONTEXT",title:"Whose team owns the strongest position?",text:"This lens refreshes from the live 2026 standings. Miles gets the strongest team-record argument. Wilson’s case does not require Las Vegas to be first, but a top-three finish keeps team success from becoming a weakness.",metric:"winpct",suffix:" WIN%"}
  };
  const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const norm=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");
  const state={records:new Map(),lens:"scoring"};
  function headshot(c){return "https://cdn.wnba.com/headshots/wnba/latest/1040x760/"+c.id+".png";}
  function recordFor(c){return state.records.get(norm(c.team));}
  function renderCandidates(){
    const host=document.getElementById("mvpCandidateGrid");if(!host)return;
    host.innerHTML=CANDIDATES.map(c=>{
      const r=recordFor(c);const record=r?safe(r.wins)+"–"+safe(r.losses):"refreshing";
      return '<article class="mvp-candidate-card '+(c.rank===1?'leader':'')+'">'+
        '<span class="mvp-candidate-rank">'+c.rank+'</span>'+
        '<div class="mvp-candidate-photo"><img src="'+headshot(c)+'" alt="Official WNBA headshot of '+safe(c.name)+'" loading="'+(c.rank===1?'eager':'lazy')+'" onerror="this.style.display=\'none\'"></div>'+
        '<div class="mvp-candidate-body"><span class="mvp-candidate-team">'+safe(c.code)+' · MVP MARKET #'+c.rank+' · '+safe(c.odds)+'</span><h3>'+safe(c.name)+'</h3>'+
        '<div class="mvp-candidate-stats"><div><span>PPG</span><strong>'+c.ppg.toFixed(1)+'</strong></div><div><span>APG</span><strong>'+c.apg.toFixed(1)+'</strong></div><div><span>RPG</span><strong>'+c.rpg.toFixed(1)+'</strong></div><div><span>FG%</span><strong>'+c.fg.toFixed(1)+'</strong></div></div>'+
        '<span class="mvp-case-tag">'+safe(c.tag)+'</span><p>'+safe(c.note)+'</p><div class="mvp-team-record">TEAM: <b>'+record+'</b></div></div></article>';
    }).join("");
  }
  function renderControls(){
    const host=document.getElementById("mvpLensControls");if(!host)return;
    host.innerHTML=Object.entries(LENSES).map(([key,l])=>'<button type="button" data-lens="'+key+'" class="'+(state.lens===key?'active':'')+'" aria-pressed="'+(state.lens===key?'true':'false')+'">'+safe(l.label)+'</button>').join("");
    host.addEventListener("click",e=>{const b=e.target.closest("[data-lens]");if(!b)return;state.lens=b.dataset.lens;renderControls();renderLens();},{once:true});
  }
  function lensValue(c,key){
    if(key==="team"){const r=recordFor(c);if(!r)return null;const w=Number(r.wins)||0,l=Number(r.losses)||0;return w+l?w/(w+l)*100:null;}
    return c[LENSES[key].metric];
  }
  function displayValue(v,key){
    if(v===null||v===undefined)return "—";
    if(key==="team")return v.toFixed(1)+"%";
    if(key==="impact")return (v>=0?"+":"")+v.toFixed(1);
    return v.toFixed(1)+LENSES[key].suffix;
  }
  function renderLens(){
    const key=state.lens,l=LENSES[key];
    const eyebrow=document.getElementById("mvpLensEyebrow"),title=document.getElementById("mvpLensTitle"),copy=document.getElementById("mvpLensText"),host=document.getElementById("mvpLensBars");
    if(eyebrow)eyebrow.textContent=l.label;if(title)title.textContent=l.title;if(copy)copy.textContent=l.text;if(!host)return;
    const values=CANDIDATES.map(c=>lensValue(c,key)).filter(v=>Number.isFinite(v));
    const max=Math.max(...values,1);
    host.innerHTML=CANDIDATES.map(c=>{const v=lensValue(c,key),pct=Number.isFinite(v)?Math.max(4,v/max*100):0;return '<div class="mvp-lens-row"><strong>'+safe(c.name)+'</strong><div class="mvp-lens-track"><div class="mvp-lens-fill" style="width:'+pct.toFixed(1)+'%"></div></div><span class="mvp-lens-value">'+safe(displayValue(v,key))+'</span></div>';}).join("");
  }
  async function getJson(url){const j=url.includes("?")?"&":"?";const r=await fetch(url+j+"cb="+Date.now(),{headers:{Accept:"application/json","Cache-Control":"no-cache"},cache:"no-store"});if(!r.ok)throw new Error(String(r.status));return r.json();}
  function extractStandings(payload){
    if(Array.isArray(payload?.standings))return payload.standings;
    if(Array.isArray(payload?.overall))return payload.overall;
    if(Array.isArray(payload?.standings?.overall))return payload.standings.overall;
    return [];
  }
  function rowName(row){return row?.team?.full_name||row?.team?.name||row?.team||"";}
  async function refresh(){
    const status=document.getElementById("mvpLiveStatus");
    try{
      const payload=await getJson("/api/stats?season=2026");
      const rows=extractStandings(payload);
      state.records=new Map(rows.map(r=>[norm(rowName(r)),r]));
      renderCandidates();renderLens();
      const stamp=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
      if(status){status.classList.remove("is-error");status.innerHTML='<span aria-hidden="true"></span> Final-week standings connected · refreshed '+safe(stamp);}
    }catch{
      renderCandidates();renderLens();
      if(status){status.classList.add("is-error");status.innerHTML='<span aria-hidden="true"></span> Live standings are retrying · editorial snapshot remains on screen';}
    }
  }
  renderCandidates();renderControls();renderLens();refresh();
  setInterval(()=>{if(!document.hidden)refresh();},120000);
  window.addEventListener("focus",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
})();