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

  const teamContext = {
    "Golden State Valkyries":"32-12 · 1st opponent PPG · 14th PPG · 13th APG",
    "Washington Mystics":"28-16 · 2nd opponent PPG · 12th PPG · 11th APG",
    "Seattle Storm":"8-36 · 13th PPG · 14th APG · rebuild runway",
    "Toronto Tempo":"11-33 · young expansion core · another creator changes the ceiling",
    "Portland Fire":"17-27 · Carla Leite 16.1 PPG / 6.3 APG · room for a veteran co-star",
    "Indiana Fever":"28-16 · playoff core · immediate championship timeline",
    "New York Liberty":"26-18 · playoff infrastructure · veteran title expectations",
    "Phoenix Mercury":"16-28 · Copper-led scoring core · veteran win-now pieces",
    "Chicago Sky":"retooling roster · opportunity for a larger role",
    "Las Vegas Aces":"31-13 · top-tier offense · championship infrastructure",
    "Atlanta Dream":"30-14 · 3rd PPG · 2nd RPG · contender continuity"
  };

  const destinationBoard = {
    "Kelsey Mitchell":{
      blurb:"If Mitchell leaves Indiana, the best pitches combine title-level infrastructure with a clear need for high-volume perimeter scoring.",
      destinations:[
        {team:"Golden State Valkyries",share:33,fit:96,tags:["elite defense","needs scoring","contender"],why:"Golden State already owns the defensive floor. Mitchell supplies the shot creation its 14th-ranked scoring offense is missing without asking her to carry the entire identity."},
        {team:"Washington Mystics",share:30,fit:94,tags:["young core","needs creation","28 wins"],why:"Washington defended at an elite level but finished 12th in scoring. Mitchell next to Sonia Citron and Kiki Iriafen would give the Mystics a veteran closer without blocking the young core's growth."},
        {team:"Seattle Storm",share:16,fit:82,tags:["featured role","rebuild","young core"],why:"Seattle can sell ownership of the offense and a long runway beside Flau'jae Johnson and its young frontcourt. The tradeoff is giving up immediate title equity."},
        {team:"Toronto Tempo",share:11,fit:75,tags:["new market","star power","offense"],why:"Toronto needs another top-end creator to raise its offensive ceiling. Mitchell would arrive as a marquee veteran, though the guard room already includes Marina Mabrey and Kiki Rice."},
        {team:"Portland Fire",share:10,fit:73,tags:["expansion build","co-star role","pace"],why:"Portland has a promising creator in Carla Leite but still needs proven late-clock scoring. Mitchell would instantly become the most accomplished perimeter scorer on the roster."}
      ]
    },
    "Kelsey Plum":{
      blurb:"If Phoenix's recruiting window does not turn into a long-term deal, Plum's market should center on teams that need both downhill scoring and a primary creator.",
      destinations:[
        {team:"Golden State Valkyries",share:34,fit:97,tags:["best offense need","contender","Bay Area"],why:"The Valkyries' defense is already championship caliber; Plum directly attacks the scoring and playmaking gap. It is the cleanest basketball fit on the board."},
        {team:"Washington Mystics",share:27,fit:93,tags:["closer","young core","two-way team"],why:"Washington can surround Plum with size and defense while letting her solve the half-court creation problem. The roster is young enough for her to become the veteran offensive engine."},
        {team:"Seattle Storm",share:17,fit:85,tags:["primary creator","rebuild","featured role"],why:"Seattle ranked 14th in assists and 13th in scoring. Plum would organize the offense immediately and let the younger players settle into cleaner roles."},
        {team:"Toronto Tempo",share:12,fit:79,tags:["new market","creator","marquee signing"],why:"Toronto could make Plum the face of its next phase and pair her scoring with Marina Mabrey's. The concern is ball distribution in a guard-heavy build."},
        {team:"Portland Fire",share:10,fit:78,tags:["expansion growth","veteran star","shot creation"],why:"Plum would give Portland a proven star scorer next to Carla Leite and Sarah Ashlee Barker, accelerating an expansion roster that already has young guard talent."}
      ]
    },
    "Napheesa Collier":{
      blurb:"Collier is the hardest player to imagine leaving. If she does, only teams with a believable title path should survive the first cut.",
      destinations:[
        {team:"Golden State Valkyries",share:38,fit:99,tags:["title fit","two-way identity","superstar need"],why:"A 32-win defense-first team adding one of the league's best two-way scorers is the most obvious superteam path. She would solve offense without weakening the identity."},
        {team:"Indiana Fever",share:26,fit:94,tags:["title window","frontcourt skill","elite spacing"],why:"If Indiana has room after its own free-agency decisions, Collier's shooting, defense and interior scoring would fit almost any lineup and push an already-good team toward a different tier."},
        {team:"New York Liberty",share:14,fit:88,tags:["win now","versatility","roster math"],why:"The basketball fit is easy because Collier can play anywhere. The hard part is roster and salary construction around an already veteran, star-heavy core."},
        {team:"Seattle Storm",share:12,fit:84,tags:["franchise anchor","young bigs","rebuild"],why:"Seattle could offer a full franchise-anchor role alongside a young frontcourt. The question is whether Collier would choose a rebuild over an immediate championship favorite."},
        {team:"Portland Fire",share:10,fit:80,tags:["franchise face","new market","frontcourt star"],why:"Portland could hand Collier the keys to a growing franchise and build around her versatility, but it would need to prove the contender timeline is fast enough."}
      ]
    },
    "Jackie Young":{
      blurb:"Young leaving Las Vegas would be a shock. If it happened, every serious contender would want the same thing: a big two-way guard who does not need the ball to dominate.",
      destinations:[
        {team:"Golden State Valkyries",share:32,fit:97,tags:["two-way fit","contender","scoring boost"],why:"Young fits Golden State's defensive identity and still adds badly needed scoring. She can play on or off the ball next to Gabby Williams without changing the system."},
        {team:"Washington Mystics",share:28,fit:94,tags:["two-way wing","young core","closer"],why:"Washington can slot Young beside Citron and keep its defensive edge while adding a proven championship shot-maker and secondary creator."},
        {team:"Seattle Storm",share:16,fit:88,tags:["veteran anchor","defense","role expansion"],why:"Young would become the stabilizing veteran around Seattle's young guards and bigs while taking on more offensive responsibility than she has needed in Vegas."},
        {team:"New York Liberty",share:14,fit:86,tags:["title chase","switchability","roster math"],why:"New York would love the defense, size and low-maintenance scoring. Making the money and roster pieces fit is the larger obstacle."},
        {team:"Portland Fire",share:10,fit:80,tags:["franchise star","leadership","two-way"],why:"Young would immediately become Portland's most accomplished two-way guard and a culture-setting veteran for a second-year expansion team."}
      ]
    },
    "DiJonai Carrington":{
      blurb:"Carrington's market is about role plus identity. Teams that want point-of-attack defense, transition pressure and edge should be first in line.",
      destinations:[
        {team:"Golden State Valkyries",share:28,fit:93,tags:["defense","pace","contender"],why:"Golden State already wins with defense and versatility. Carrington would deepen that identity and create more transition offense, even if she does not solve every half-court issue."},
        {team:"Washington Mystics",share:25,fit:91,tags:["perimeter defense","athleticism","playoff team"],why:"Washington could stack another disruptive wing around its young scorers and turn an elite defense into a nightmare matchup across positions."},
        {team:"Seattle Storm",share:21,fit:89,tags:["featured wing","rebuild","defense"],why:"Seattle can offer Carrington a bigger two-way role and pair her athleticism with Flau'jae Johnson in a younger perimeter core."},
        {team:"Portland Fire",share:14,fit:84,tags:["culture setter","transition","expansion build"],why:"Portland needs established identity players as much as raw production. Carrington's physicality and pace would give a young roster an edge immediately."},
        {team:"Phoenix Mercury",share:12,fit:80,tags:["veteran core","defense","transition"],why:"Phoenix's veteran scorers could use a defensive wing who creates possessions without needing high usage. The question is how much flexibility remains after its bigger free-agent decisions."}
      ]
    },
    "Natasha Cloud":{
      blurb:"Cloud's destination board looks different from the scorers: teams with creation problems should value her organizing, defense and late-game decision-making.",
      destinations:[
        {team:"Washington Mystics",share:33,fit:96,tags:["homecoming","playmaking need","elite defense"],why:"This is the cleanest basketball reunion. Washington ranked 11th in assists and already has a young scoring core; Cloud can organize it without taking development reps away from the stars."},
        {team:"Golden State Valkyries",share:26,fit:94,tags:["13th APG","contender","defense"],why:"Golden State's biggest statistical weakness is offensive creation. Cloud adds a real table-setter while matching the league's best defensive identity."},
        {team:"Seattle Storm",share:20,fit:93,tags:["14th APG","veteran point guard","young roster"],why:"Seattle needs structure. Cloud can run offense, guard the point of attack and make life easier for its young scorers and bigs immediately."},
        {team:"Toronto Tempo",share:12,fit:84,tags:["leadership","new franchise","playmaking"],why:"Toronto has scoring on the wings but still needs consistent organization. Cloud would bring veteran command to a young expansion backcourt."},
        {team:"Portland Fire",share:9,fit:80,tags:["leadership","defense","secondary creator"],why:"Carla Leite already handles a major creation load, so Cloud would be more stabilizer than savior here. The fit is strongest if Portland wants two ballhandlers on the floor."}
      ]
    },
    "NaLyssa Smith":{
      blurb:"Smith's market is about opportunity. The best destinations are teams that can promise real frontcourt touches instead of asking her to live as a low-usage depth piece.",
      destinations:[
        {team:"Portland Fire",share:28,fit:92,tags:["bigger role","young guards","frontcourt scoring"],why:"Portland can pair Smith's interior scoring and transition game with Carla Leite's playmaking while giving her a larger offensive role than Vegas can guarantee."},
        {team:"Seattle Storm",share:24,fit:90,tags:["rebuild","athletic frontcourt","role growth"],why:"Seattle's young bigs make the fit interesting rather than simple, but Smith can play power forward and add a proven WNBA scorer to a roster that finished near the bottom offensively."},
        {team:"Toronto Tempo",share:20,fit:87,tags:["frontcourt need","new market","featured role"],why:"Toronto could use another athletic scoring forward and can offer Smith a visible role in a franchise still defining its long-term core."},
        {team:"Chicago Sky",share:16,fit:85,tags:["fresh start","touches","retool"],why:"Chicago can sell a reset and a more central offensive role. For Smith, that may matter more than joining another crowded contender rotation."},
        {team:"Phoenix Mercury",share:12,fit:79,tags:["veteran core","rim pressure","rotation role"],why:"Phoenix would give Smith experienced creators around her, but the fit depends on what the Mercury do with Plum and the rest of their veteran frontcourt."}
      ]
    },
    "Kayla Thornton":{
      blurb:"Thornton is the kind of contender free agent who can change a playoff series without changing a usage chart. Her board is almost entirely win-now teams.",
      destinations:[
        {team:"New York Liberty",share:31,fit:95,tags:["reunion","contender","known role"],why:"A New York reunion makes immediate basketball sense: switchable defense, rebounding, toughness and a role Thornton already understands. The obstacle is roster math."},
        {team:"Washington Mystics",share:23,fit:90,tags:["veteran wing","defense","young core"],why:"Washington can use a playoff-tested wing who does not need touches and can protect younger scorers in difficult matchups."},
        {team:"Indiana Fever",share:19,fit:88,tags:["3-and-D","playoff edge","spacing"],why:"Indiana's stars create offense; Thornton can supply the physical defense, rebounding and connective play that becomes more valuable in playoff series."},
        {team:"Las Vegas Aces",share:15,fit:85,tags:["title chase","switchability","veteran"],why:"Vegas values veteran versatility and could use Thornton as another matchup piece, although the rotation and salary structure would have to make sense."},
        {team:"Atlanta Dream",share:12,fit:82,tags:["30-win team","defense","bench impact"],why:"Atlanta already has a deep, balanced core. Thornton would be a luxury playoff piece rather than a featured role, which lowers the destination share despite a strong fit."}
      ]
    }
  };

  const destinationPlayers = ["Kelsey Mitchell","Kelsey Plum","Napheesa Collier","Jackie Young","DiJonai Carrington","Natasha Cloud","NaLyssa Smith","Kayla Thornton"];
  const destinationTabs = document.getElementById("destinationPlayerTabs");
  const destinationPlayerCard = document.getElementById("destinationPlayerCard");
  const destinationGrid = document.getElementById("destinationGrid");
  const destinationHeadline = document.getElementById("destinationHeadline");
  const marketHeatGrid = document.getElementById("marketHeatGrid");
  let selectedDestinationPlayer = destinationPlayers[0];

  function getHeadliner(name){ return headliners.find(p=>p.name===name); }

  function renderDestinationTabs(){
    destinationTabs.innerHTML = destinationPlayers.map((name,i)=>`<button type="button" role="tab" data-player="${name}" class="${name===selectedDestinationPlayer?"is-active":""}" aria-selected="${name===selectedDestinationPlayer}" tabindex="${name===selectedDestinationPlayer?"0":"-1"}">${name}</button>`).join("");
    [...destinationTabs.querySelectorAll("button")].forEach(btn=>btn.addEventListener("click",()=>{
      selectedDestinationPlayer=btn.dataset.player;
      renderDestinationTabs();
      renderDestinationPlayer();
    }));
  }

  function renderDestinationPlayer(){
    const player=getHeadliner(selectedDestinationPlayer);
    const board=destinationBoard[selectedDestinationPlayer];
    if(!player || !board) return;
    const best=board.destinations[0];
    destinationHeadline.textContent=`${player.name}: ${best.team} leads the alternative board`;
    destinationPlayerCard.innerHTML=`
      <div class="destination-player-visual">
        <img src="${player.photo}" alt="${player.name} headshot">
        <img class="destination-current-logo" src="${teamLogos[player.team] || ""}" alt="${player.team} logo">
      </div>
      <div class="destination-player-copy">
        <span class="mini-label">${player.type} · CURRENT TEAM: ${player.team.toUpperCase()}</span>
        <h3>${player.name}</h3>
        <p>${board.blurb}</p>
        <div class="leave-odds"><span>WKTW CURRENT MOVE ODDS</span><strong>${player.move}%</strong></div>
      </div>`;
    destinationGrid.innerHTML=board.destinations.map((d,i)=>`
      <article class="destination-card ${i===0?"rank-1":""}">
        <img class="destination-logo" src="${teamLogos[d.team] || ""}" alt="${d.team} logo" loading="lazy">
        <div class="destination-copy">
          <h4>#${i+1} ${d.team}</h4>
          <p>${d.why}</p>
          <div class="destination-tags">${d.tags.map(tag=>`<span>${tag}</span>`).join("")}</div>
          <small style="display:block;margin-top:7px;color:#7a6f82">${teamContext[d.team] || ""}</small>
        </div>
        <div class="destination-meters">
          <div class="destination-share">${d.share}%<small>if she leaves</small></div>
          <div class="destination-bar" aria-hidden="true"><i style="width:${d.share*2.4}%"></i></div>
          <div class="destination-fit">FIT ${d.fit}/100</div>
        </div>
      </article>`).join("");
  }

  function renderMarketHeat(){
    const byTeam={};
    Object.entries(destinationBoard).forEach(([player,board])=>{
      board.destinations.forEach(d=>{
        if(!byTeam[d.team]) byTeam[d.team]={team:d.team,weighted:0,appearances:0,targets:[]};
        byTeam[d.team].weighted += d.share*(d.fit/100);
        byTeam[d.team].appearances += 1;
        byTeam[d.team].targets.push({player,share:d.share});
      });
    });
    const rows=Object.values(byTeam).sort((a,b)=>b.weighted-a.weighted).slice(0,8);
    const max=rows[0]?.weighted || 1;
    rows.forEach(r=>r.index=Math.round((r.weighted/max)*100));
    marketHeatGrid.innerHTML=rows.map((r,i)=>{
      const names=r.targets.sort((a,b)=>b.share-a.share).slice(0,3).map(t=>t.player.replace("Napheesa","Phee").replace("Kelsey ","K. ")).join(" · ");
      return `<article class="heat-card">
        <div class="heat-card-top"><img src="${teamLogos[r.team] || ""}" alt="${r.team} logo"><div><strong>#${i+1} ${r.team}</strong><small>${r.appearances} headliner fit${r.appearances===1?"":"s"}</small></div></div>
        <div class="heat-index"><b>${r.index}</b><span>MARKET PULL</span></div>
        <div class="heat-track"><i style="width:${r.index}%"></i></div>
        <div class="heat-targets">Top matches: ${names}</div>
      </article>`;
    }).join("");
  }

  const fullBoard = [
    ["Rebecca Allen","New York Liberty","UFA","retire","Retiring"],["Rachel Banham","Chicago Sky","UFA","move","Lean move"],["Ornella Bankole","Toronto Tempo","UFA","move","Lean move"],["Kierstan Bell","Las Vegas Aces","UFA","move","Lean move"],["DeWanna Bonner","Atlanta Dream","UFA","retire","Stay / retirement watch"],["Kalani Brown","Las Vegas Aces","UFA","stay","Lean stay"],["Kennedy Burke","Houston","UFA","stay","Lean stay"],["Emma Cannon","Los Angeles Sparks","UFA","move","Lean move"],["DiJonai Carrington","Chicago Sky","UFA","move","Likely move"],["Alysha Clark","Dallas Wings","UFA","retire","Stay / retirement watch"],["Natasha Cloud","Chicago Sky","UFA","move","Likely move"],["Napheesa Collier","Minnesota Lynx","UFA","stay","Lean stay"],["Aicha Coulibaly","Chicago Sky","UFA","stay","Lean stay"],["Sophie Cunningham","Indiana Fever","UFA","stay","Likely stay"],["Stefanie Dolson","Seattle Storm","UFA","move","Likely move"],["Temi Fágbénlé","Toronto Tempo","UFA","toss","Toss-up"],["Zaay Green","Toronto Tempo","UFA","stay","Lean stay"],["Brittney Griner","Houston","UFA","stay","Lean stay"],["Aminata Gueye","Golden State Valkyries","UFA","stay","Lean stay"],["Tyasha Harris","Indiana Fever","UFA","stay","Lean stay"],["Isabelle Harrison","Toronto Tempo","UFA","move","Lean move"],["Tiffany Hayes","Golden State Valkyries","UFA","retire","Stay if she plays"],["Myisha Hines-Allen","Indiana Fever","UFA","toss","Toss-up / lean stay"],["Kitija Laksa","Dallas Wings","UFA","stay","Lean stay"],["Betnijah Laney-Hamilton","Washington Mystics","UFA","stay","Lean stay"],["Anneli Maley","New York Liberty","UFA","move","Lean move"],["Morgan Maly","Chicago Sky","UFA","stay","Lean stay"],["Aari McDonald","Minnesota Lynx","UFA","stay","Lean stay"],["Kelsey Mitchell","Indiana Fever","UFA","move","Slight lean move"],["Kia Nurse","Toronto Tempo","UFA","stay","Lean stay"],["Nneka Ogwumike","Los Angeles Sparks","UFA","retire","Retiring"],["Amy Okonkwo","Portland Fire","UFA","stay","Lean stay"],["Cheyenne Parker-Tyus","Las Vegas Aces","UFA","move","Lean move"],["Kelsey Plum","Phoenix Mercury","UFA","toss","Toss-up / lean stay"],["Mercedes Russell","Indiana Fever","UFA","move","Lean move"],["Karlie Samuelson","Portland Fire","UFA","stay","Lean stay"],["Odyssey Sims","Dallas Wings","UFA","stay","Lean stay"],["NaLyssa Smith","Las Vegas Aces","UFA","move","Lean move"],["Stephanie Talbot","Las Vegas Aces","UFA","move","Lean move"],["Kayla Thornton","Golden State Valkyries","UFA","stay","Likely stay"],["Brianna Turner","Las Vegas Aces","UFA","move","Lean move"],["Shatori Walker-Kimbrough","Atlanta Dream","UFA","stay","Lean stay"],["Mai Yamamoto","Las Vegas Aces","UFA","toss","Toss-up"],["Jackie Young","Las Vegas Aces","UFA","stay","Likely stay"],
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
  renderDestinationTabs();
  renderDestinationPlayer();
  renderMarketHeat();
  renderFullBoard();
})();