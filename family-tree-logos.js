const familyTreeLogo = code => `https://a.espncdn.com/i/teamlogos/wnba/500/${code}.png`;
const FAMILY_TREE_MARKS={
  'Utah Starzz':{code:'uta',abbr:'UTA'},
  'San Antonio Silver Stars':{code:'sa',abbr:'SA'},
  'San Antonio Stars':{code:'sa',abbr:'SA'},
  'Las Vegas Aces':{code:'lv',abbr:'LVA'},
  'Detroit Shock':{code:'det',abbr:'DET'},
  'Tulsa Shock':{code:'tul',abbr:'TUL'},
  'Dallas Wings':{code:'dal',abbr:'DAL'},
  'Orlando Miracle':{code:'orl',abbr:'ORL'},
  'Connecticut Sun':{code:'con',abbr:'CON'},
  'Houston Comets':{code:'hou',abbr:'HOU'},
  'Los Angeles Sparks':{code:'la',abbr:'LAS'},
  'New York Liberty':{code:'ny',abbr:'NYL'},
  'Phoenix Mercury':{code:'phx',abbr:'PHX'},
  'Washington Mystics':{code:'wsh',abbr:'WAS'},
  'Minnesota Lynx':{code:'min',abbr:'MIN'},
  'Indiana Fever':{code:'ind',abbr:'IND'},
  'Seattle Storm':{code:'sea',abbr:'SEA'},
  'Chicago Sky':{code:'chi',abbr:'CHI'},
  'Atlanta Dream':{code:'atl',abbr:'ATL'},
  'Golden State Valkyries':{code:'gs',abbr:'GSV'},
  'Portland Fire':{code:'por',abbr:'POR'},
  'Toronto Tempo':{code:'tor',abbr:'TOR'},
  'Cleveland Rockers':{code:'cle',abbr:'CLE'},
  'Sacramento Monarchs':{code:'sac',abbr:'SAC'},
  'Charlotte Sting':{code:'cha',abbr:'CHA'},
  'Miami Sol':{code:'mia',abbr:'MIA'}
};
function familyTreeMark(name){
  const meta=FAMILY_TREE_MARKS[name]||{abbr:String(name).split(/\s+/).map(v=>v[0]).join('').slice(0,3).toUpperCase()};
  const src=meta.code?familyTreeLogo(meta.code):'';
  return `<span class="family-tree-mark"><img src="${src}" alt="${name} logo" loading="lazy" onerror="this.parentElement.classList.add('logo-failed')"><b>${meta.abbr}</b></span>`;
}
function decorateBranchStops(){
  document.querySelectorAll('#continuingBranches .branch-line li').forEach(li=>{
    if(li.querySelector('.family-tree-mark'))return;
    const years=li.querySelector('span')?.textContent?.trim()||'';
    const strong=li.querySelector('strong');
    const name=strong?.textContent?.trim()||'';
    if(!strong)return;
    li.innerHTML=`<div class="family-tree-logo-row">${familyTreeMark(name)}<span><span>${years}</span><strong>${name}</strong></span></div>`;
  });
}
function updateHoustonLine(){
  const cards=[...document.querySelectorAll('#continuingBranches .tree-card')];
  const sunCard=cards.find(card=>card.textContent.includes('The Sun line'));
  if(!sunCard)return;
  const stops=[...sunCard.querySelectorAll('.branch-line li')];
  const sunStop=stops.find(li=>li.textContent.includes('Connecticut Sun'));
  if(sunStop){
    const year=sunStop.querySelector('.family-tree-logo-row>span>span');
    if(year)year.textContent='2003 to 2026';
  }
  if(!sunCard.textContent.includes('2027 forward')){
    const li=document.createElement('li');
    li.className='future-branch';
    li.innerHTML=`<div class="family-tree-logo-row">${familyTreeMark('Houston Comets')}<span><span>2027 forward</span><strong>Houston Comets</strong></span></div>`;
    sunCard.querySelector('.branch-line')?.appendChild(li);
  }
  const championship=sunCard.querySelector(':scope>p');
  if(championship)championship.textContent='Orlando to Connecticut to Houston, one continuing franchise line';
}
function decorateRooted(){
  document.querySelectorAll('#rootedBranches .mini-routes a').forEach(link=>{
    if(link.querySelector('.family-tree-mark'))return;
    const name=link.textContent.trim();
    link.innerHTML=`${familyTreeMark(name)}<span>${name}</span>`;
  });
}
function decorateClosed(){
  document.querySelectorAll('#closedBranches .closed-card').forEach(card=>{
    const h3=card.querySelector('h3');
    if(!h3||h3.parentElement?.classList.contains('closed-team-title'))return;
    const name=h3.textContent.trim().replace(', original club','');
    const wrap=document.createElement('div');
    wrap.className='closed-team-title';
    wrap.innerHTML=`${familyTreeMark(name)}<h3>${h3.innerHTML}</h3>`;
    h3.replaceWith(wrap);
    if(name==='Houston Comets'){
      const p=card.querySelector('p');
      if(p)p.textContent='The original 1997 to 2008 dynasty remains a foundational Houston chapter. The Comets name returns in 2027 with the relocating Connecticut franchise, whose announced history will carry the Comets legacy forward.';
    }
  });
}
function addHoustonNotice(){
  const host=document.getElementById('continuingBranches');
  if(!host||document.querySelector('.family-tree-current-note'))return;
  const note=document.createElement('div');
  note.className='family-tree-current-note';
  note.innerHTML=`${familyTreeMark('Houston Comets')}<div><strong>2027 franchise update</strong><h3>The Sun line is headed to Houston.</h3><p>The WNBA approved the Connecticut Sun sale and relocation to Houston beginning with the 2027 season. Houston announced the return of the Comets name and said the franchise’s records and history will carry forward into the new chapter.</p><div class="tree-source-links"><a href="https://www.wnba.com/news/connecticut-sun-sale-houston-relocation" target="_blank" rel="noopener">WNBA relocation announcement ↗</a><a href="https://www.houstoncomets.com/" target="_blank" rel="noopener">Houston Comets return ↗</a><a href="https://sun.wnba.com/frequently-asked-questions" target="_blank" rel="noopener">Connecticut Sun FAQ ↗</a></div></div>`;
  host.after(note);
  const sourceNote=document.createElement('p');
  sourceNote.className='tree-logo-note';
  sourceNote.textContent='Franchise marks are used as visual era identifiers. Historical names stay attached to the market and seasons in which they were used.';
  note.after(sourceNote);
}
function refreshTreeHeading(){
  const section=document.getElementById('continuingBranches')?.closest('.locker-stage');
  if(!section)return;
  const h2=section.querySelector('.locker-heading h2');
  const p=section.querySelector('.locker-heading div p:last-child');
  if(h2)h2.textContent='Three active lines changed cities, and one moves again in 2027.';
  if(p)p.textContent='The Aces, Wings and Sun-to-Comets lines preserve continuous franchise records across markets. Logos below show the identity used in each stop.';
}
decorateBranchStops();
updateHoustonLine();
decorateRooted();
decorateClosed();
addHoustonNotice();
refreshTreeHeading();
