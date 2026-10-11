(function(){
  const currentFixes={
    'skye-lioness':{
      displayName:'Skye the Lioness',introduced:'2024',debut:'2024',
      image:'https://cdn.wnba.com/sites/1611661329/2024/09/MK18515.jpg',
      imageCredit:'Chicago Sky',
      source:'https://sky.wnba.com/book-with-skye',
      sourceLabel:'Chicago Sky · Skye the Lioness'
    },
    'blaze':{
      displayName:'Blaze the Sun',species:'Sun mascot',introduced:'2004',debut:'2004',
      bio:'Blaze the Sun is Connecticut’s bright orange, high-energy mascot. Blaze has represented the Sun since 2004, bringing the heat to Mohegan Sun Arena, community events and youth programs across Connecticut and New England.',
      facts:['Introduced in 2004','Bright orange fur embodies the heat and energy of the Sun','Longtime Mohegan Sun Arena crowd favorite','Community ambassador and frequent youth-event guest','Celebrated a 20th birthday during the 2024 season'],
      source:'https://sun.wnba.com/blaze-2',sourceLabel:'Connecticut Sun · Meet Blaze'
    },
    'lightning-horse':{introduced:'2017',debut:'2017'},
    'violet-raven':{introduced:'2025',debut:'2025'},
    'freddy-fever':{introduced:'2000',debut:'2000'},
    'buckets-rabbit':{introduced:'2018',debut:'2018'},
    'sparky-dog':{introduced:'2007',debut:'2007'},
    'prowl-lynx':{
      introduced:'1999',debut:'1999',
      image:'',
      imageCredit:'Minnesota Lynx',
      source:'https://go.lynxbasketball.com/entertainment/prowl',
      sourceLabel:'Minnesota Lynx · Prowl'
    },
    'ellie-elephant':{introduced:'2021',debut:'2021'},
    'scorch':{introduced:'2002',debut:'2002'},
    'doppler':{introduced:'2000',debut:'2000'},
    'dez-turtle':{introduced:'2026',debut:'2026'},
    'dot-hare':{introduced:'2026',debut:'2026'},
    'pax-panda':{introduced:'2006',debut:'2006'}
  };
  const retiredFixes={
    'star-atlanta':{introduced:'2008'},
    'maddie-liberty':{introduced:'1997'},
    'sky-guy':{introduced:'2006'}
  };
  if(typeof CURRENT_MASCOTS!=='undefined')CURRENT_MASCOTS.forEach(item=>Object.assign(item,currentFixes[item.id]||{}));
  if(typeof RETIRED_MASCOTS!=='undefined')RETIRED_MASCOTS.forEach(item=>Object.assign(item,retiredFixes[item.id]||{}));

  window.TEAM_FANBASE_IDENTITIES={
    'atlanta-dream':{name:'Dream fans',kind:'No distinct official fan nickname published',source:'https://dream.wnba.com/'},
    'chicago-sky':{name:'Skytown',kind:'Official team-used fan community name',source:'https://sky.wnba.com/news/barkleyokrp-celebrates-teams-20th-year-in-series-of-films'},
    'connecticut-sun':{name:'Sun Nation',kind:'Official team-used fan community name',source:'https://sun.wnba.com/jordans-furniture'},
    'dallas-wings':{name:'Wings Nation',kind:'Official team-used fan community name',source:'https://wings.wnba.com/wingspan-episode-002'},
    'golden-state-valkyries':{name:'Valks Fam',kind:'Official team-used community language',source:'https://valkyries.com/entertainment-teams/the-flock/'},
    'indiana-fever':{name:'Fever fans',kind:'No distinct official fan nickname published',source:'https://fever.wnba.com/'},
    'las-vegas-aces':{name:'Aces Nation',kind:'Official fanbase name',source:'https://aces.wnba.com/aceseverywhere'},
    'los-angeles-sparks':{name:'Sparks Nation',kind:'Team-used fan community name',source:'https://cdn.wnba.com/sites/1611661320/2015/09/AWAY-LA-Sparks-Game-Notes-09.11.15-vs-Phoenix-Mercury.pdf'},
    'minnesota-lynx':{name:'Lynx Nation',kind:'Official team-used fan community name',source:'https://www.minneapolis.org/media/news-releases/mntimberwolves-and-minnesotalynx-continue-evolution-teams-social-media-plat/'},
    'new-york-liberty':{name:'Liberty Loyals',kind:'Official team-used fan community name',source:'https://liberty.wnba.com/video/new-york-liberty-fans-are-just-different-liberty-unlocked'},
    'phoenix-mercury':{name:'X-Factor',kind:'Official fanbase name',source:'https://mercury.wnba.com/news/phoenix-mercury-unveil-new-bold-and-modernized-brand'},
    'portland-fire':{name:'Fire fans',kind:'No distinct official fan nickname published',source:'https://fire.wnba.com/'},
    'seattle-storm':{name:'Storm Family',kind:'Official team-used community language',source:'https://storm.wnba.com/birthday-club'},
    'toronto-tempo':{name:'Tempo fans',kind:'No distinct official fan nickname published',source:'https://tempo.wnba.com/'},
    'washington-mystics':{name:'Mystics fans',kind:'No distinct official fan nickname published',source:'https://mystics.wnba.com/'},
    'cleveland-sirens':{name:'Sirens fans',kind:'Fanbase forming ahead of the 2028 debut',source:'/expansion-watch.html'}
  };
})();
