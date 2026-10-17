(() => {
  const origins = {
  "cleveland-sirens": {"headline": "Lake Erie has a new call", "season": "2028 (scheduled)", "story": "Unveiled in August 2026, Sirens connects Cleveland’s Lake Erie waterfront with the powerful voice of a mythological siren. The logo’s five waves of hair represent the five players on the court and the five Great Lakes. The Sirens are a new franchise, separate from the former Cleveland Rockers.", "lineage": "Cleveland Rockers (1997–2003, separate franchise) · Cleveland Sirens (2028 debut planned)", "source": "https://www.axios.com/local/cleveland/2026/08/04/cleveland-sirens-wnba-team-name-brand-unveiling"},
  "atlanta-dream": {
    "headline": "A name with a civil rights heartbeat",
    "season": "2008",
    "story": "Dream honors Atlanta native Dr. Martin Luther King Jr. and his 1963 “I Have a Dream” speech. The name connects the franchise to the city’s civil rights legacy.",
    "lineage": "Atlanta Dream",
    "source": "https://www.revolt.tv/article/wnba-teams-and-the-stories-behind-them"
  },
  "chicago-sky": {
    "headline": "Chicago, looking up",
    "season": "2006",
    "story": "Sky draws on Chicago’s skyline. Founding president Margaret Stender described the blue-and-yellow identity as a sunny Chicago day, framing those famous buildings with sky and sunlight.",
    "lineage": "Chicago Sky",
    "source": "https://sports.yahoo.com/valkyrie-golden-state-other-wnba-200110837.html"
  },
  "connecticut-sun": {
    "headline": "A new home, a new Sun",
    "season": "2003",
    "story": "Sun comes from Mohegan Sun, the Connecticut destination where the Mohegan Tribe brought the former Orlando Miracle in 2003. The name records that chapter of tribal ownership and the franchise’s new home.",
    "lineage": "Orlando Miracle → Connecticut Sun",
    "source": "https://www.revolt.tv/article/wnba-teams-and-the-stories-behind-them"
  },
  "dallas-wings": {
    "headline": "Dallas’ Pegasus takes flight",
    "season": "2016",
    "story": "Wings salutes the red Pegasus, the winged horse that became a Dallas landmark atop the Magnolia building. The franchise adopted its Dallas identity after its Detroit and Tulsa chapters.",
    "lineage": "Detroit Shock → Tulsa Shock → Dallas Wings",
    "source": "https://www.swishappeal.com/wnba/2023/8/30/23847131/wnba-team-names-best-worst-liberty-aces-mercury-storm-sparks-dream-fever-lynx-sky-wings-sun-mystics"
  },
  "golden-state-valkyries": {
    "headline": "Warrior women, Bay Area wings",
    "season": "2025",
    "story": "Valkyries comes from the warrior women of Norse mythology. Fans repeatedly suggested the name during the branding process. Unveiled in 2024, the identity combines a Bay Bridge sword with cables shaped like wings.",
    "lineage": "Golden State Valkyries",
    "source": "https://www.wnba.com/webview/news/gs-valkyries-2025-identity"
  },
  "indiana-fever": {
    "headline": "Hoops fever in the Hoosier State",
    "season": "2000",
    "story": "Fever captures Indiana’s consuming enthusiasm for basketball. Sporting News explains it as the emotional meaning of fever: the excitement and passion surrounding the game in the Hoosier State.",
    "lineage": "Indiana Fever",
    "source": "https://www.sportingnews.com/ca/wnba/news/fever-origin-indiana-wnba-nickname-mascot/1feff009c952bbacb077d370"
  },
  "las-vegas-aces": {
    "headline": "An ace means the best",
    "season": "2018",
    "story": "Announced in December 2017, Aces paired a familiar Las Vegas playing-card reference with the idea of someone at the top of their game. The official launch emphasized excellence, confidence and the city’s competitive spirit.",
    "lineage": "Utah Starzz → San Antonio Silver Stars / Stars → Las Vegas Aces",
    "source": "https://www.wnba.com/news/mgm-resorts-selects-las-vegas-aces-new-name-wnba-franchise"
  },
  "los-angeles-sparks": {
    "headline": "An original with an electric name",
    "season": "1997",
    "story": "Sparks has been the Los Angeles name since the WNBA’s first season. The word evokes energy and electricity, but a definitive account of why the original owners chose it has not been publicly established.",
    "lineage": "Los Angeles Sparks",
    "source": "https://sports.yahoo.com/valkyrie-golden-state-other-wnba-200110837.html"
  },
  "minnesota-lynx": {
    "headline": "A wildcat from Minnesota’s wilderness",
    "season": "1999",
    "story": "Lynx refers to the wildcat native to Minnesota. It gives the franchise a local wildlife identity alongside the state’s NBA Timberwolves.",
    "lineage": "Minnesota Lynx",
    "source": "https://www.revolt.tv/article/wnba-teams-and-the-stories-behind-them"
  },
  "new-york-liberty": {
    "headline": "Lady Liberty, on the court",
    "season": "1997",
    "story": "Liberty takes its name from the Statue of Liberty. The landmark’s torch and seafoam color connect the team’s identity to a New York symbol of welcome and freedom.",
    "lineage": "New York Liberty",
    "source": "https://www.revolt.tv/article/wnba-teams-and-the-stories-behind-them"
  },
  "phoenix-mercury": {
    "headline": "A basketball solar system",
    "season": "1997",
    "story": "Mercury references the planet nearest the Sun, linking the WNBA franchise’s name to Phoenix’s NBA Suns. The planetary theme has remained part of the Mercury’s visual identity.",
    "lineage": "Phoenix Mercury",
    "source": "https://www.swishappeal.com/wnba/2023/8/30/23847131/wnba-team-names-best-worst-liberty-aces-mercury-storm-sparks-dream-fever-lynx-sky-wings-sun-mystics"
  },
  "portland-fire": {
    "headline": "The Rose City reignites",
    "season": "2026",
    "story": "Portland revived the Fire name for its 2026 expansion team, honoring the original club that played from 2000 to 2002. The new identity celebrates the city’s resilience and passion, with a flaming rose, bridge-inspired lettering and Mount Hood in its wordmark. This is a new franchise carrying a historic name.",
    "lineage": "Original Portland Fire (2000–2002) · New Portland Fire (2026–present)",
    "source": "https://www.wnba.com/news/introducing-the-portland-fire"
  },
  "seattle-storm": {
    "headline": "Pacific Northwest weather, with attitude",
    "season": "2000",
    "story": "Storm draws on the rainy Pacific Northwest climate. Its weather-inspired identity gives Seattle a force-of-nature name, with the Space Needle and Mount Rainier anchoring its modern logo.",
    "lineage": "Seattle Storm",
    "source": "https://www.swishappeal.com/wnba/2023/8/30/23847131/wnba-team-names-best-worst-liberty-aces-mercury-storm-sparks-dream-fever-lynx-sky-wings-sun-mystics"
  },
  "toronto-tempo": {
    "headline": "The rhythm of a city and a country",
    "season": "2026",
    "story": "Tempo means pace and rhythm: the energy of Toronto, the game and its fans. Announced in December 2024 after input from more than 10,000 people, the name was chosen to work in both English and French.",
    "lineage": "Toronto Tempo",
    "source": "https://www.wnba.com/news/meet-the-toronto-tempo"
  },
  "washington-mystics": {
    "headline": "D.C.’s magical connection",
    "season": "1998",
    "story": "Mystics continued the magical naming theme of Washington’s NBA Wizards under their shared original ownership. The name was unveiled in December 1997, ahead of the team’s first season.",
    "lineage": "Washington Mystics",
    "source": "https://www.revolt.tv/article/wnba-teams-and-the-stories-behind-them"
  }
};
  const slug = new URLSearchParams(location.search).get('team');
  const origin = origins[slug];
  const host = document.getElementById('teamNameOrigin');
  if (!origin || !host) return;
  const codes = {'atlanta-dream':'atl','chicago-sky':'chi','connecticut-sun':'con','dallas-wings':'dal','golden-state-valkyries':'gs','indiana-fever':'ind','las-vegas-aces':'lv','los-angeles-sparks':'la','minnesota-lynx':'min','new-york-liberty':'ny','phoenix-mercury':'phx','portland-fire':'por','seattle-storm':'sea','toronto-tempo':'tor','washington-mystics':'wsh'};
  const logo = slug === 'cleveland-sirens' ? 'https://clevelandsirens.com/wp-content/uploads/2026/07/ClevelandSirens-GlobalLogo-FullColor-RGB-scaled.png' : `https://a.espncdn.com/i/teamlogos/wnba/500/${codes[slug]}.png`;
  const teamName = slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  host.innerHTML = `<div class="team-section-heading"><p class="kicker">BEHIND THE NAME</p><h2>${esc(origin.headline)}</h2></div><div class="team-name-origin-card"><div><img class="team-name-origin-logo" src="${esc(logo)}" alt="${esc(teamName)} logo" width="140" height="140" loading="lazy" decoding="async"><span class="panel-label">FIRST SEASON WITH THIS NAME</span><strong class="team-name-origin-year">${esc(origin.season)}</strong></div><div><p>${esc(origin.story)}</p><p class="team-name-lineage"><strong>Name trail:</strong> ${esc(origin.lineage)}</p><a href="${esc(origin.source)}" target="_blank" rel="noopener noreferrer">Read the naming history ↗</a><p style="margin-top:16px"><a href="/wnba-team-name-stories.html">Food for Thought: What’s in a Name? →</a></p></div></div>`;
  host.hidden = false;
})();
