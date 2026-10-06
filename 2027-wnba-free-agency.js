(() => {
  const teamLogos = {
    "Indiana Fever":"https://a.espncdn.com/i/teamlogos/wnba/500/ind.png",
    "Minnesota Lynx":"https://a.espncdn.com/i/teamlogos/wnba/500/min.png",
    "Phoenix Mercury":"https://a.espncdn.com/i/teamlogos/wnba/500/phx.png",
    "Las Vegas Aces":"https://a.espncdn.com/i/teamlogos/wnba/500/lv.png",
    "Chicago Sky":"https://a.espncdn.com/i/teamlogos/wnba/500/chi.png",
    "Golden State Valkyries":"https://a.espncdn.com/i/teamlogos/wnba/500/gs.png",
    "Atlanta Dream":"https://a.espncdn.com/i/teamlogos/wnba/500/atl.png",
    "Dallas Wings":"https://a.espncdn.com/i/teamlogos/wnba/500/dal.png",
    "Los Angeles Sparks":"https://a.espncdn.com/i/teamlogos/wnba/500/la.png",
    "New York Liberty":"https://a.espncdn.com/i/teamlogos/wnba/500/ny.png",
    "Seattle Storm":"https://a.espncdn.com/i/teamlogos/wnba/500/sea.png",
    "Washington Mystics":"https://a.espncdn.com/i/teamlogos/wnba/500/wsh.png",
    "Portland Fire":"https://a.espncdn.com/i/teamlogos/wnba/500/por.png",
    "Toronto Tempo":"https://a.espncdn.com/i/teamlogos/wnba/500/tor.png",
    "Houston":"https://cdn.wnba.com/logos/wnba/1611661323/primary/L/logo.svg"
  };
  const headliners = [
    {name:"DiJonai Carrington",team:"Chicago Sky",type:"UFA",move:72,star:82,call:"Move watch",bucket:"move",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/4066548.png",why:"A two-way wing in her prime should have real demand, and Chicago's reset gives her less reason to treat staying as the default."},
    {name:"Natasha Cloud",team:"Chicago Sky",type:"UFA",move:70,star:80,call:"Move watch",bucket:"move",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/2529137.png",why:"Veteran point-of-attack defense and playmaking travel well. A contender can make a cleaner win-now pitch than a rebuilding roster."},
    {name:"NaLyssa Smith",team:"Las Vegas Aces",type:"UFA",move:66,star:73,call:"Move watch",bucket:"move",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/4398776.png",why:"A bigger offensive role is the leverage point. Another team can offer touches and minutes that are harder to guarantee in Vegas."},
    {name:"Kelsey Mitchell",team:"Indiana Fever",type:"UFA",move:56,star:96,call:"Slight lean move",bucket:"move",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/3142191.png",why:"Indiana has the basketball case. Mitchell finally has the freedom to decide whether the environment, spotlight and role are still what she wants."},
    {name:"Kelsey Plum",team:"Phoenix Mercury",type:"UFA",move:47,star:93,call:"True toss-up",bucket:"toss",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/3065570.png",why:"Phoenix bought the first recruiting window, not an automatic extension. The next roster pitch has to turn the trade into a destination."},
    {name:"Napheesa Collier",team:"Minnesota Lynx",type:"UFA",move:35,star:100,call:"Lean stay",bucket:"stay",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/3917450.png",why:"She will have leverage and suitors, but Minnesota still offers the strongest combination of continuity, talent and organizational familiarity."},
    {name:"Sophie Cunningham",team:"Indiana Fever",type:"UFA",move:25,star:76,call:"Likely stay",bucket:"stay",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/3907781.png",why:"Shooting, toughness and off-ball fit make her especially useful next to Indiana's stars. The role makes sense on both sides."},
    {name:"Kayla Thornton",team:"Golden State Valkyries",type:"UFA",move:22,star:84,call:"Likely stay",bucket:"stay",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/2529622.png",why:"Golden State's identity fits her game almost perfectly. A strong market is possible, but the incumbent basketball case is unusually clean."},
    {name:"Jackie Young",team:"Las Vegas Aces",type:"UFA",move:15,star:98,call:"Likely stay",bucket:"stay",photo:"https://a.espncdn.com/i/headshots/wnba/players/full/4065870.png",why:"Every contender should call. Vegas can still answer with role clarity, championship equity and the chance to keep chasing banners beside A'ja Wilson."}
  ];

  const fullBoard = [
    ["Rebecca Allen","New York Liberty","UFA","stay","Lean stay"],["Rachel Banham","Chicago Sky","UFA","move","Lean move"],["Ornella Bankole","Toronto Tempo","UFA","move","Lean move"],["Kierstan Bell","Las Vegas Aces","UFA","move","Lean move"],["DeWanna Bonner","Atlanta Dream","UFA","retire","Stay / retirement watch"],["Kalani Brown","Las Vegas Aces","UFA","stay","Lean stay"],["Kennedy Burke","Houston","UFA","stay","Lean stay"],["Emma Cannon","Los Angeles Sparks","UFA","move","Lean move"],["DiJonai Carrington","Chicago Sky","UFA","move","Likely move"],["Alysha Clark","Dallas Wings","UFA","retire","Stay / retirement watch"],["Natasha Cloud","Chicago Sky","UFA","move","Likely move"],["Napheesa Collier","Minnesota Lynx","UFA","stay","Lean stay"],["Aicha Coulibaly","Chicago Sky","UFA","stay","Lean stay"],["Sophie Cunningham","Indiana Fever","UFA","stay","Likely stay"],["Stefanie Dolson","Seattle Storm","UFA","move","Likely move"],["Temi Fágbénlé","Toronto Tempo","UFA","toss","Toss-up"],["Zaay Green","Toronto Tempo","UFA","stay","Lean stay"],["Brittney Griner","Houston","UFA","stay","Lean stay"],["Aminata Gueye","Golden State Valkyries","UFA","stay","Lean stay"],["Tyasha Harris","Indiana Fever","UFA","stay","Lean stay"],["Isabelle Harrison","Toronto Tempo","UFA","move","Lean move"],["Tiffany Hayes","Golden State Valkyries","UFA","retire","Stay if she plays"],["Myisha Hines-Allen","Indiana Fever","UFA","toss","Toss-up / lean stay"],["Kitija Laksa","Dallas Wings","UFA","stay","Lean stay"],["Betnijah Laney-Hamilton","Washington Mystics","UFA","stay","Lean stay"],["Anneli Maley","New York Liberty","UFA","move","Lean move"],["Morgan Maly","Chicago Sky","UFA","stay","Lean stay"],["Aari McDonald","Minnesota Lynx","UFA","stay","Lean stay"],["Kelsey Mitchell","Indiana Fever","UFA","move","Slight lean move"],["Kia Nurse","Toronto Tempo","UFA","stay","Lean stay"],["Nneka Ogwumike","Los Angeles Sparks","UFA","retire","Retiring"],["Amy Okonkwo","Portland Fire","UFA","stay","Lean stay"],["Cheyenne Parker-Tyus","Las Vegas Aces","UFA","move","Lean move"],["Kelsey Plum","Phoenix Mercury","UFA","toss","Toss-up / lean stay"],["Mercedes Russell","Indiana Fever","UFA","move","Lean move"],["Karlie Samuelson","Portland Fire","UFA","stay","Lean stay"],["Odyssey Sims","Dallas Wings","UFA","stay","Lean stay"],["NaLyssa Smith","Las Vegas Aces","UFA","move","Lean move"],["Stephanie Talbot","Las Vegas Aces","UFA","move","Lean move"],["Kayla Thornton","Golden State Valkyries","UFA","stay","Likely stay"],["Brianna Turner","Las Vegas Aces","UFA","move","Lean move"],["Shatori Walker-Kimbrough","Atlanta Dream","UFA","stay","Lean stay"],["Mai Yamamoto","Las Vegas Aces","UFA","toss","Toss-up"],["Jackie Young","Las Vegas Aces","UFA","stay","Likely stay"],
    ["Laeticia Amihere","Golden State Valkyries","RFA","stay","Lean stay"],["Rae Burrell","Los Angeles Sparks","RFA","stay","Lean stay"],["Maya Caldwell","Minnesota Lynx","RFA","stay","Lean stay"],["Zia Cooke","Seattle Storm","RFA","stay","Lean stay"],["Emily Engstler","Portland Fire","RFA","stay","Lean stay"],["Rebekah Gardner","New York Liberty","RFA","toss","Toss-up / lean stay"],["Marine Johannès","New York Liberty","RFA","stay","Stay if available"],["Haley Jones","Dallas Wings","RFA","stay","Lean stay"],["Awak Kuier","Dallas Wings","RFA","toss","Toss-up / lean stay"],["Li Yueru","Dallas Wings","RFA","stay","Likely stay"],["Jade Melbourne","Seattle Storm","RFA","stay","Likely stay"],["Diamond Miller","Houston","RFA","stay","Likely stay"],["Nyara Sabally","Toronto Tempo","RFA","stay","Likely stay"],["Maddy Siegrist","Dallas Wings","RFA","stay","Likely stay"],["Cecilia Zandalasini","Golden State Valkyries","RFA","stay","Likely stay"]
  ].map(([name,team,type,bucket,call])=>({name,team,type,bucket,call}));

  const filterButtons = [...document.querySelectorAll("#movementFilters button")];
  const sortSelect = document.getElementById("movementSort");
  const grid = document.getElementById("movementGrid");
  const summary = document.getElementById("movementSummary");
  let movementFilter = "all";

  function renderMovement(){
    let rows = headliners.filter(p => movementFilter === "all" || p.bucket === movementFilter);
    const sort = sortSelect.value;
    rows.sort((a,b)=> sort==="star" ? b.star-a.star : sort==="team" ? a.team.localeCompare(b.team) : b.move-a.move);
    grid.innerHTML = rows.map(p => `
      <article class="movement-card">
        <div class="movement-card-head">
          <img class="movement-card-photo" src="${p.photo}" alt="${p.name} headshot" loading="lazy">
          <div class="movement-card-copy">
            <div class="movement-teamline"><img src="${teamLogos[p.team] || ""}" alt="${p.team} logo"><span>${p.team}</span></div>
            <h3>${p.name}</h3><span class="fa-type">${p.type}</span>
          </div>
        </div>
        <div class="movement-card-body">
          <div class="probability-line"><div class="probability-track"><div class="probability-fill" style="width:${p.move}%"></div></div><strong>${p.move}%</strong></div>
          <div class="movement-call"><span class="${p.bucket}">${p.call}</span><span>move odds</span></div>
          <p>${p.why}</p>
        </div>
      </article>`).join("") || '<div class="empty-board">No players match this filter yet.</div>';

    const shown = rows.length;
    const avg = shown ? Math.round(rows.reduce((s,p)=>s+p.move,0)/shown) : 0;
    const highest = shown ? rows.reduce((a,b)=>a.move>b.move?a:b) : null;
    const stay = rows.filter(p=>p.bucket==="stay").length;
    summary.innerHTML = `
      <div><span>PLAYERS SHOWN</span><strong>${shown}</strong></div>
      <div><span>AVG MOVE ODDS</span><strong>${avg}%</strong></div>
      <div><span>HIGHEST MOVE WATCH</span><strong>${highest ? highest.move+"%" : "—"}</strong></div>
      <div><span>LEANING STAY</span><strong>${stay}</strong></div>`;
  }

  filterButtons.forEach(btn=>btn.addEventListener("click",()=>{
    movementFilter=btn.dataset.filter;
    filterButtons.forEach(b=>{const active=b===btn;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));});
    renderMovement();
  }));
  sortSelect.addEventListener("change",renderMovement);

  const boardGrid = document.getElementById("fullBoardGrid");
  const playerSearch = document.getElementById("playerSearch");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");

  function renderFullBoard(){
    const q=(playerSearch.value||"").trim().toLowerCase();
    const status=statusFilter.value;
    const type=typeFilter.value;
    const rows=fullBoard.filter(p=>{
      const matchQ=!q || [p.name,p.team,p.type,p.call].join(" ").toLowerCase().includes(q);
      const matchStatus=status==="all" || p.bucket===status;
      const matchType=type==="all" || p.type===type;
      return matchQ && matchStatus && matchType;
    });
    boardGrid.innerHTML=rows.map(p=>`
      <article class="full-player-row">
        <img class="mini-team" src="${teamLogos[p.team] || ""}" alt="${p.team} logo" loading="lazy">
        <div><h3>${p.name}</h3><p>${p.team} · ${p.type}</p></div>
        <div class="row-call"><b>${p.call}</b><small>${p.bucket==="move"?"movement watch":p.bucket==="stay"?"incumbent edge":p.bucket==="toss"?"open market":"career decision"}</small></div>
      </article>`).join("") || '<div class="empty-board">No free agents match those filters.</div>';
  }
  [playerSearch,statusFilter,typeFilter].forEach(el=>el.addEventListener(el.tagName==="INPUT"?"input":"change",renderFullBoard));

  renderMovement();
  renderFullBoard();
})();