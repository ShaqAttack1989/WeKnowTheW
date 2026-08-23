const basketballTerms = [
  {term:'0.5 decision',category:'Offense',definition:'A quick read to shoot, pass or drive almost immediately after catching the ball so the defense cannot reset.',watch:'Notice whether the next player acts while the closeout is still moving.',aliases:'half second quick decision'},
  {term:'2–3 zone',category:'Defense',definition:'A zone alignment with two defenders across the top and three across the back line, each responsible for an area.',watch:'Look for openings at the nail, short corner and behind the top two defenders.',aliases:'two three zone'},
  {term:'Above the break',category:'Court',definition:'The three-point area around the top and wings, above where the arc bends toward the corners.',watch:'Above-the-break threes are longer than corner threes.',aliases:'top of arc'},
  {term:'Advance the ball',category:'Coaching',definition:'Using an eligible late-game timeout to move the inbound spot into the frontcourt under league rules.',watch:'Check the timeout situation and where the inbounder is allowed to stand.',aliases:'advance timeout frontcourt'},
  {term:'After-timeout play (ATO)',category:'Coaching',definition:'A designed possession a coach calls immediately after a timeout.',watch:'Watch the screening sequence before the intended receiver becomes open.',aliases:'ato out of timeout'},
  {term:'Assist',category:'Core',definition:'A pass credited for directly leading to a made basket.',watch:'The pass creates the score, but the exact credit can involve scorer judgment.',aliases:'dime'},
  {term:'Back screen',category:'Offense',definition:'A screen set behind a defender to free a teammate cutting toward the basket.',watch:'The cutter should change speed and brush closely past the screener.',aliases:'rip screen'},
  {term:'Ball screen',category:'Offense',definition:'A screen set on the defender guarding the ballhandler; it begins many pick-and-roll and pick-and-pop actions.',watch:'Read the angle of the screen and the two defenders involved.',aliases:'on ball screen pick'},
  {term:'Baseline',category:'Court',definition:'The end line running behind each basket.',watch:'A baseline drive can use the boundary like an extra defender if the path gets closed.',aliases:'end line'},
  {term:'Blitz',category:'Defense',definition:'An aggressive pick-and-roll coverage where two defenders attack the ballhandler to force the ball out quickly.',watch:'The short roll and weak-side rotation decide whether the blitz works.',aliases:'double team trap pick roll'},
  {term:'Box-and-one',category:'Defense',definition:'A combination defense with four players in a zone box and one defender denying a specific scorer.',watch:'Track whether the guarded star becomes a screener to distort the box.',aliases:'junk defense'},
  {term:'Box out',category:'Core',definition:'Using legal body position to keep an opponent away from a rebound.',watch:'Great box-outs happen before the ball touches the rim.',aliases:'block out rebound'},
  {term:'Chicago action',category:'Offense',definition:'A pin-down screen flowing directly into a dribble handoff for the same player.',watch:'The receiver can curl, reject the handoff or turn the corner.',aliases:'pin down handoff'},
  {term:'Closeout',category:'Defense',definition:'The controlled sprint from a help position toward a shooter to contest while still protecting against the drive.',watch:'Choppy final steps and a high hand help the defender stay balanced.',aliases:'contest shooter'},
  {term:'Contain',category:'Defense',definition:'Keeping the ballhandler in front without needing immediate help.',watch:'Good containment preserves the rest of the defensive shell.',aliases:'stay in front'},
  {term:'Corner',category:'Court',definition:'The area where the baseline meets the sideline, commonly used for three-point spacing.',watch:'A corner shooter pulls the low help defender farther from the rim.',aliases:'deep corner'},
  {term:'Cut',category:'Core',definition:'Purposeful off-ball movement toward open space or the basket.',watch:'The best cuts react to a defender turning her head or overplaying a passing lane.',aliases:'basket cut slash'},
  {term:'Defensive rating',category:'Numbers',definition:'An estimate of points allowed per 100 possessions. Lower is better for a team defense.',watch:'Use possession-based ratings rather than raw points allowed when pace differs.',aliases:'drtg points allowed 100'},
  {term:'Dig',category:'Defense',definition:'A quick help reach toward the ball—often against a post-up—without fully abandoning the assigned player.',watch:'The helper tries to bother the dribble and recover before the kick-out pass.',aliases:'stunt post help'},
  {term:'DHO',category:'Offense',definition:'A dribble handoff: one player dribbles toward a teammate and transfers the ball at close range, often functioning like a screen.',watch:'The handoff player can keep the ball, flip the angle or screen after the exchange.',aliases:'dribble handoff'},
  {term:'Drag screen',category:'Offense',definition:'An early ball screen set in transition before the half-court defense is organized.',watch:'The screener usually runs directly from rim-to-rim into the action.',aliases:'transition ball screen'},
  {term:'Drop coverage',category:'Defense',definition:'A pick-and-roll defense where the screener’s defender stays lower to protect the paint.',watch:'The on-ball defender usually chases over while the big contains the ball and roller.',aliases:'drop pnr'},
  {term:'Dunker spot',category:'Court',definition:'The short-baseline area just outside the lane where a finisher waits near the rim.',watch:'The player times a cut when the help defender steps toward the ball.',aliases:'baseline spot'},
  {term:'Effective field-goal percentage (eFG%)',category:'Numbers',definition:'A shooting percentage that gives extra value to made three-pointers because they score one more point than twos.',watch:'It measures shooting value but does not include free throws.',aliases:'efg effective field goal'},
  {term:'Elbow',category:'Court',definition:'Either corner of the free-throw line and lane intersection.',watch:'Elbow catches create handoffs, high-low passes and midrange scoring angles.',aliases:'high post'},
  {term:'Empty corner',category:'Offense',definition:'A ball-screen setup with no offensive player occupying the nearby corner.',watch:'Removing that corner player also removes an easy low-help assignment.',aliases:'empty side pick roll'},
  {term:'Fast break',category:'Core',definition:'An attack before the defense is fully set, usually following a rebound, steal or turnover.',watch:'See who fills the middle, both wings and the rim-running lane.',aliases:'break transition offense'},
  {term:'Flare screen',category:'Offense',definition:'An off-ball screen that sends a teammate away from the ball toward the perimeter.',watch:'It often punishes a defender who is helping too far into the lane.',aliases:'fade screen'},
  {term:'Flex cut',category:'Offense',definition:'A baseline cut across the lane using a screen near the low block.',watch:'The cutter moves under the screen toward the opposite side of the rim.',aliases:'baseline screen cut'},
  {term:'Foul to give',category:'Coaching',definition:'A team foul that can be committed before the penalty triggers free throws, often used to disrupt a late possession.',watch:'The defense must foul safely before the shooting motion.',aliases:'team foul available'},
  {term:'Gap help',category:'Defense',definition:'A defender positions partway toward the ball to discourage a drive while remaining able to recover to her assignment.',watch:'The defender shows a crowd without fully committing to a double-team.',aliases:'help gap'},
  {term:'Ghost screen',category:'Offense',definition:'A player approaches as if to set a ball screen, then slips away early without making contact.',watch:'It can force confused communication or a needless switch.',aliases:'fake screen'},
  {term:'Hammer action',category:'Offense',definition:'A baseline drive paired with a weak-side back screen that frees a shooter in the opposite corner.',watch:'Follow the weak side instead of the driver; the corner pass is the point.',aliases:'hammer play corner'},
  {term:'Hedge / show',category:'Defense',definition:'The screener’s defender steps toward the ballhandler to delay the drive, then recovers to the screener.',watch:'The retreat must be quick enough to prevent a roll or pop advantage.',aliases:'show high hard hedge'},
  {term:'Help side',category:'Core',definition:'The side away from the ball where defenders position themselves to support teammates.',watch:'Help defenders should see both the ball and their assignment.',aliases:'weak side help'},
  {term:'Horns',category:'Offense',definition:'An alignment with two players near the elbows, a ballhandler up top and players in both corners.',watch:'Either elbow can screen, receive a pass or become a decoy.',aliases:'horns set two elbows'},
  {term:'ICE / down',category:'Defense',definition:'A sideline pick-and-roll coverage that sends the ballhandler away from the screen and toward the baseline.',watch:'The on-ball defender jumps above the screen while the big protects the baseline path.',aliases:'ice side pick roll down coverage'},
  {term:'Isolation',category:'Offense',definition:'Spacing the floor so one player can attack a defender one-on-one.',watch:'Count how much help is available and whether the offense chose the matchup deliberately.',aliases:'iso clear out'},
  {term:'Lane / paint',category:'Court',definition:'The rectangular area extending from the baseline to the free-throw line around the basket.',watch:'Paint touches often force the defense to collapse and rotate.',aliases:'key painted area'},
  {term:'Lock and trail',category:'Defense',definition:'A defender stays attached behind a shooter running off a screen, steering the route toward help.',watch:'The trailing defender removes the catch-and-shoot while the big protects the curl.',aliases:'top trail shooter'},
  {term:'Low defender',category:'Defense',definition:'The weak-side defender closest to the baseline who often becomes the first helper against a roll or drive.',watch:'This player must protect the rim and still recover toward a corner shooter.',aliases:'low man weak side rim help'},
  {term:'Matchup',category:'Core',definition:'The player or role one defender is primarily responsible for guarding.',watch:'Screens, switches and cross-matches can change the matchup within a possession.',aliases:'assignment'},
  {term:'Matchup hunting',category:'Coaching',definition:'Repeatedly using screens or movement to place a preferred defender into the main offensive action.',watch:'Notice whether the offense calls the same player into consecutive screens.',aliases:'target defender mismatch hunt'},
  {term:'Nail',category:'Court',definition:'The center point of the free-throw line, a critical location for offensive catches and defensive help.',watch:'A nail defender can clog a drive while staying within recovery distance.',aliases:'free throw line center'},
  {term:'Net rating',category:'Numbers',definition:'The difference between offensive and defensive rating, usually expressed per 100 possessions.',watch:'Positive means a team scores more than it allows over the measured sample.',aliases:'nrtg point differential 100'},
  {term:'No middle',category:'Defense',definition:'A defensive principle that influences the ball toward the sideline or baseline and away from the center of the floor.',watch:'The on-ball defender shades the middle hip and trusts help near the boundary.',aliases:'force sideline baseline'},
  {term:'Offensive rating',category:'Numbers',definition:'An estimate of points scored per 100 possessions. Higher is better for a team offense.',watch:'It adjusts scoring for pace, unlike points per game.',aliases:'ortg points scored 100'},
  {term:'Pace',category:'Numbers',definition:'An estimate of how many possessions a team or game uses over a standard game length.',watch:'Fast pace means more possessions, not automatically better offense.',aliases:'tempo possessions'},
  {term:'Paint touch',category:'Offense',definition:'Any controlled offensive touch inside the lane, whether by drive, post entry, roll or cut.',watch:'Track whether the touch creates a shot, foul or kick-out pass.',aliases:'touch the paint'},
  {term:'Peel switch',category:'Defense',definition:'A helper takes the ballhandler after a teammate is beaten, while the beaten defender peels away to cover the helper’s assignment.',watch:'It is a recovery exchange after penetration, not a planned screen switch.',aliases:'emergency switch drive'},
  {term:'Pin-down',category:'Offense',definition:'A screen set below a teammate that allows the teammate to move upward toward the perimeter.',watch:'The receiver can curl, fade, reject or continue into a handoff.',aliases:'down screen'},
  {term:'Pistol action',category:'Offense',definition:'An early side action linking a guard, wing and big through an entry pass, handoff and possible ball screen.',watch:'It flows quickly from transition into half-court offense.',aliases:'21 action early offense'},
  {term:'Plus/minus',category:'Numbers',definition:'The point differential while a player or lineup is on the court.',watch:'It reflects shared minutes and context, not one player’s isolated performance.',aliases:'+/- point differential'},
  {term:'Pocket pass',category:'Offense',definition:'A pass threaded through the gap between two pick-and-roll defenders to the screener.',watch:'It often reaches a short roller around the free-throw line area.',aliases:'pick roll pass'},
  {term:'Points per possession (PPP)',category:'Numbers',definition:'Points scored divided by possessions for a team, player or specific play type.',watch:'Context and sample size matter when comparing actions.',aliases:'ppp efficiency'},
  {term:'Possession',category:'Core',definition:'A team’s continuous control of the ball until a made basket, defensive rebound, turnover or period-ending event changes it.',watch:'An offensive rebound usually extends the same team possession in many statistical models.',aliases:'trip sequence'},
  {term:'Post split',category:'Offense',definition:'Two perimeter players screen, cut or exchange after entering the ball to a post player.',watch:'The post player reads the split while maintaining a scoring threat.',aliases:'split cut post entry'},
  {term:'Recover',category:'Defense',definition:'Returning to an assigned player or area after helping, trapping or showing on the ball.',watch:'Good recovery happens on the flight of the pass, not after the catch.',aliases:'help and recover'},
  {term:'Relocation',category:'Offense',definition:'A shooter changes perimeter position after passing or after a drive begins to improve the next passing angle.',watch:'The shooter moves into the window created by the defender’s help.',aliases:'drift lift replace'},
  {term:'Rim run',category:'Offense',definition:'A big or forward sprints directly toward the basket during transition to pressure the defense vertically.',watch:'Even without a pass, the run can pull defenders inward and open shooters.',aliases:'run to rim transition big'},
  {term:'Scram switch',category:'Defense',definition:'An off-ball exchange used to move a smaller defender out of a dangerous post mismatch before the entry pass arrives.',watch:'A larger teammate takes the post while the smaller player rotates outward.',aliases:'pre switch mismatch rescue'},
  {term:'Screen',category:'Core',definition:'A legal stationary block used to free a teammate from a defender.',watch:'The screener’s angle, timing and stillness determine whether the action works legally.',aliases:'pick'},
  {term:'Seal',category:'Offense',definition:'Using body position to keep a defender behind or beside the offensive player and create a clear passing target.',watch:'A deep seal near the rim can turn a small window into an easy finish.',aliases:'post position'},
  {term:'Second-side action',category:'Offense',definition:'A new attack after the ball is reversed away from the first action.',watch:'The defense is often rotating or cross-matched when the second attack begins.',aliases:'ball reversal next action'},
  {term:'Short corner',category:'Court',definition:'The baseline area just outside the lane and inside the three-point line.',watch:'It is a vulnerable spot behind many zone defenses.',aliases:'baseline midrange'},
  {term:'Short roll',category:'Offense',definition:'The screener rolls into open middle space instead of traveling all the way to the rim.',watch:'The short roller often becomes a passer in a four-on-three advantage.',aliases:'pocket roll'},
  {term:'Shot quality',category:'Coaching',definition:'An evaluation of how favorable a shot is based on location, openness, shooter skill, clock and game context.',watch:'A miss can still come from good process, and a make can come from poor process.',aliases:'good shot expected value'},
  {term:'Shrink the floor',category:'Defense',definition:'Positioning multiple defenders closer to driving and passing lanes so the offense sees less usable space.',watch:'The defense must expand again quickly when the ball moves outside.',aliases:'pack paint crowd gaps'},
  {term:'Skip pass',category:'Offense',definition:'A pass thrown over or across the defense to a teammate on the far side of the floor.',watch:'The pass can punish help but stays in the air long enough for a fast rotation.',aliases:'cross court pass'},
  {term:'Slip',category:'Offense',definition:'Leaving a screen early—before contact—to cut into open space.',watch:'Slips punish defenders who switch or show before the screen is actually set.',aliases:'slip screen early roll'},
  {term:'Slot',category:'Court',definition:'Either channel between the top of the floor and the wing, often used for ballhandlers and spacing.',watch:'Slot drives create different help angles than attacks from the sideline.',aliases:'upper lane line extended'},
  {term:'Small ball',category:'Coaching',definition:'A lineup that trades traditional size for speed, shooting, ballhandling or switching versatility.',watch:'The benefits appear in space; the costs often appear in rim protection and rebounding.',aliases:'small lineup'},
  {term:'Snake dribble',category:'Offense',definition:'After using a ball screen, the ballhandler crosses back in front of the recovering defender and moves across the lane.',watch:'The path keeps the trailing defender behind and can hold the dropping big.',aliases:'snake pick roll'},
  {term:'Spain pick-and-roll',category:'Offense',definition:'A ball screen followed by a third offensive player back-screening the defender responsible for the roller.',watch:'The back-screener often pops to the arc after creating confusion.',aliases:'spain pnr stack pick roll'},
  {term:'Split action',category:'Offense',definition:'Two players screen or cut around a teammate holding the ball, commonly near the post or elbow.',watch:'Defenders must communicate while also respecting the player with the ball.',aliases:'split cut'},
  {term:'Stagger screen',category:'Offense',definition:'Two consecutive off-ball screens set for the same cutter.',watch:'The cutter reads each defender and can curl, fade or continue to the perimeter.',aliases:'double screen staggered'},
  {term:'Staggered substitutions',category:'Coaching',definition:'Rotating starters at different times so one or more primary creators remain with bench groups.',watch:'A star may sit early, return with reserves and bridge multiple lineup units.',aliases:'rotation pattern'},
  {term:'Strong side',category:'Court',definition:'The side of the floor where the ball is located.',watch:'Strong-side help distances are shorter, but leaving a nearby shooter is riskier.',aliases:'ball side'},
  {term:'Stunt',category:'Defense',definition:'A brief fake toward the ball intended to discourage a drive or pass without fully committing to help.',watch:'The defender takes one or two hard steps, then recovers.',aliases:'fake help dig'},
  {term:'Switch',category:'Defense',definition:'Two defenders exchange assignments, usually in response to a screen or crossing action.',watch:'The switch removes separation but may create a size or speed mismatch.',aliases:'trade assignments'},
  {term:'Tag',category:'Defense',definition:'A weak-side defender briefly steps into the roller’s path to delay the roll before recovering outward.',watch:'The next rotation must cover the shooter the tagger temporarily leaves.',aliases:'bump roller'},
  {term:'Top-lock',category:'Defense',definition:'An off-ball defender positions above a shooter to deny movement toward the perimeter.',watch:'The denial invites a backdoor cut, so rim help must be ready.',aliases:'deny pin down'},
  {term:'Transition',category:'Core',definition:'The phase when teams change from offense to defense or defense to offense before both sides are organized.',watch:'The first three steps after a change of possession often determine the advantage.',aliases:'change of possession'},
  {term:'Trap',category:'Defense',definition:'Two defenders surround the ballhandler and attempt to remove safe dribbles and passes.',watch:'A trap creates pressure but leaves four offensive players against three defenders elsewhere.',aliases:'double team'},
  {term:'Triple threat',category:'Core',definition:'A balanced stance from which a player can immediately shoot, pass or dribble.',watch:'The ball and feet stay ready while the player reads the defender.',aliases:'ready position'},
  {term:'True shooting percentage (TS%)',category:'Numbers',definition:'A scoring-efficiency measure that combines two-pointers, three-pointers and free throws.',watch:'It captures overall shooting efficiency better than field-goal percentage alone.',aliases:'ts true shooting efficiency'},
  {term:'Turnover',category:'Core',definition:'A possession-ending mistake that gives the ball to the opponent before a shot creates points.',watch:'Separate forced turnovers from unforced errors when evaluating the defense.',aliases:'giveaway'},
  {term:'Two-for-one',category:'Coaching',definition:'Taking a timely shot late in a quarter to create a chance for another possession after the opponent’s response.',watch:'The first shot must come early enough to preserve the final possession.',aliases:'2 for 1 clock'},
  {term:'Usage rate',category:'Numbers',definition:'An estimate of the share of team possessions a player finishes through a shot, free throws or turnover while on the floor.',watch:'High usage describes responsibility, not automatically efficiency or ball dominance.',aliases:'usg possession share'},
  {term:'Weak side',category:'Court',definition:'The side of the floor opposite the ball.',watch:'Weak-side cutting, spacing and help defense often decide the possession away from the camera’s focus.',aliases:'away from ball help side'},
  {term:'Wing',category:'Court',definition:'The perimeter area between the top of the arc and the corner on either side.',watch:'Wing spacing supports entries, drives and screen angles.',aliases:'side perimeter'},
  {term:'X-out',category:'Defense',definition:'A two-defender rotation in which helpers cross paths to cover two perimeter shooters after protecting the paint.',watch:'The first defender takes the first pass; the second defender sprints to the farther shooter.',aliases:'cross rotation'},
  {term:'Zoom action',category:'Offense',definition:'A pin-down screen flowing into a dribble handoff, closely related to Chicago action and often run at speed.',watch:'The receiver’s momentum makes the handoff difficult to contain.',aliases:'zoom handoff pin down'},
  {term:'Zone defense',category:'Defense',definition:'A scheme in which defenders primarily protect assigned areas rather than follow one matchup everywhere.',watch:'Ball movement and cuts force defenders to pass responsibilities across zones.',aliases:'area defense'}
];

function dictionarySafe(value = '') {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

const grid = document.getElementById('dictionaryGrid');
const search = document.getElementById('dictionarySearch');
const clear = document.getElementById('dictionaryClear');
const filters = document.getElementById('dictionaryFilters');
const status = document.getElementById('dictionaryStatus');
const empty = document.getElementById('dictionaryEmpty');
let activeCategory = 'All terms';

const categories = ['All terms', ...new Set(basketballTerms.map(item => item.category))];
basketballTerms.sort((a,b) => a.term.localeCompare(b.term));

function entryMarkup(item) {
  const searchText = `${item.term} ${item.category} ${item.definition} ${item.watch} ${item.aliases || ''}`.toLowerCase();
  return `<article class="dictionary-entry" data-category="${dictionarySafe(item.category)}" data-search="${dictionarySafe(searchText)}">
    <header><h2>${dictionarySafe(item.term)}</h2><span class="dictionary-category">${dictionarySafe(item.category)}</span></header>
    <p>${dictionarySafe(item.definition)}</p>
    <div class="dictionary-look"><b>What to watch:</b> ${dictionarySafe(item.watch)}</div>
  </article>`;
}

function renderFilters() {
  filters.innerHTML = categories.map(category => `<button class="dictionary-filter${category === activeCategory ? ' active' : ''}" type="button" data-category="${dictionarySafe(category)}">${dictionarySafe(category)}</button>`).join('');
}

function applyFilters() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  grid.querySelectorAll('.dictionary-entry').forEach(card => {
    const categoryMatch = activeCategory === 'All terms' || card.dataset.category === activeCategory;
    const queryMatch = !query || card.dataset.search.includes(query);
    const show = categoryMatch && queryMatch;
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });
  status.textContent = `${visible} ${visible === 1 ? 'term' : 'terms'} showing${activeCategory === 'All terms' ? '' : ` in ${activeCategory}`}`;
  empty.classList.toggle('visible', visible === 0);
}

filters.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  applyFilters();
});
search.addEventListener('input', applyFilters);
clear.addEventListener('click', () => {
  search.value = '';
  activeCategory = 'All terms';
  renderFilters();
  applyFilters();
  search.focus();
});

function miniCourt(content, label) {
  return `<svg viewBox="0 0 320 190" role="img" aria-label="${dictionarySafe(label)}"><g class="board-court"><rect x="9" y="9" width="302" height="172" rx="3"/><path d="M116 9v65h88V9M116 74h88M116 74a50 50 0 0 0 88 0M87 9a73 73 0 0 0 146 0"/><circle cx="160" cy="30" r="5"/><path d="M145 25h30"/></g>${content}</svg>`;
}

document.getElementById('courtSpotsBoard').innerHTML = miniCourt(`
  <g class="board-o"><circle cx="160" cy="75" r="12"/><circle cx="115" cy="76" r="12"/><circle cx="255" cy="118" r="12"/><circle cx="280" cy="38" r="12"/><circle cx="195" cy="45" r="12"/></g>
  <g class="board-note"><text x="160" y="79" text-anchor="middle">NAIL</text><text x="115" y="100" text-anchor="middle">ELBOW</text><text x="255" y="143" text-anchor="middle">WING</text><text x="278" y="64" text-anchor="middle">CORNER</text><text x="204" y="42">DUNKER</text></g>`, 'Court geography diagram');
document.getElementById('tagBoard').innerHTML = miniCourt(`
  <defs><marker id="tag-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7z" fill="#ef624f"/></marker></defs>
  <circle class="board-o" cx="160" cy="128" r="15"/><text class="board-text" x="160" y="128">5</text><circle class="board-o" cx="270" cy="55" r="15"/><text class="board-text" x="270" y="55">2</text>
  <g class="board-x"><path d="M250 45l20 20m0-20l-20 20"/></g><path class="board-line" style="stroke:#ef624f" marker-end="url(#tag-arrow)" d="M250 66Q210 93 176 119"/><path class="board-line" style="stroke:#ef624f;stroke-dasharray:6 5" marker-end="url(#tag-arrow)" d="M176 119Q225 85 255 65"/><text class="board-note" x="196" y="155">tag → recover</text>`, 'Weak-side tag and recovery diagram');
document.getElementById('closeoutBoard').innerHTML = miniCourt(`
  <defs><marker id="close-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7z" fill="#ef624f"/></marker></defs>
  <circle class="board-o" cx="265" cy="110" r="15"/><text class="board-text" x="265" y="110">2</text><g class="board-x"><path d="M160 78l20 20m0-20l-20 20"/></g><path class="board-line" style="stroke:#ef624f" marker-end="url(#close-arrow)" d="M180 92Q220 96 247 106"/><path class="board-pass" d="M60 110Q160 148 250 112"/><text class="board-note" x="197" y="70">high hand, short steps</text>`, 'Defensive closeout diagram');

grid.innerHTML = basketballTerms.map(entryMarkup).join('');
renderFilters();
applyFilters();
