(function () {
  "use strict";

  var coachGradeLetter = window.WKNBCoachGrades.coachGradeLetter;
  var calculateCoachScores = window.WKNBCoachGrades.calculateCoachScores;
  var peerGrade = window.WKNBCoachGrades.peerGrade;

  var wnbaCoaches = [
    { name: "Becky Hammon", teams: "Las Vegas Aces", wins: 148, losses: 56, playoffWins: 32, playoffLosses: 17, titles: 3, titleYears: "2022, 2023, 2025", href: "https://www.basketball-reference.com/wnba/coaches/hammobe01w.html" },
    { name: "Cheryl Reeve", teams: "Minnesota Lynx", wins: 397, losses: 201, playoffWins: 52, playoffLosses: 37, titles: 4, titleYears: "2011, 2013, 2015, 2017", href: "https://www.basketball-reference.com/wnba/coaches/reevech99w.html" },
    { name: "Van Chancellor", teams: "Houston Comets", wins: 211, losses: 111, playoffWins: 20, playoffLosses: 14, titles: 4, titleYears: "1997, 1998, 1999, 2000", href: "https://www.basketball-reference.com/wnba/coaches/chancva99w.html" },
    { name: "Bill Laimbeer", teams: "Detroit Shock · New York Liberty · Las Vegas Aces", wins: 306, losses: 215, playoffWins: 35, playoffLosses: 29, titles: 3, titleYears: "2003, 2006, 2008", href: "https://www.basketball-reference.com/wnba/coaches/laimbbi99w.html" },
    { name: "Michael Cooper", teams: "Los Angeles Sparks · Atlanta Dream", wins: 230, losses: 158, playoffWins: 38, playoffLosses: 25, titles: 2, titleYears: "2001, 2002", href: "https://www.basketball-reference.com/wnba/coaches/coopemi01w.html" },
    { name: "Sandy Brondello", teams: "Phoenix Mercury · New York Liberty", wins: 282, losses: 214, playoffWins: 40, playoffLosses: 32, titles: 2, titleYears: "2014, 2024", href: "https://www.basketball-reference.com/wnba/coaches/brondsa01w.html" },
    { name: "Brian Agler", teams: "Minnesota Lynx · Seattle Storm · Los Angeles Sparks · Dallas Wings", wins: 287, losses: 258, playoffWins: 24, playoffLosses: 19, titles: 2, titleYears: "2010, 2016", href: "https://www.basketball-reference.com/wnba/coaches/aglerbr99w.html" },
    { name: "Mike Thibault", teams: "Connecticut Sun · Washington Mystics", wins: 379, losses: 289, playoffWins: 34, playoffLosses: 38, titles: 1, titleYears: "2019", href: "https://www.basketball-reference.com/wnba/coaches/thibami99w.html" },
    { name: "Dan Hughes", teams: "Charlotte Sting · Cleveland Rockers · San Antonio Stars · Seattle Storm", wins: 286, losses: 312, playoffWins: 22, playoffLosses: 28, titles: 1, titleYears: "2018", href: "https://www.basketball-reference.com/wnba/coaches/hugheda99w.html" },
    { name: "Anne Donovan", teams: "Indiana Fever · Charlotte Sting · Seattle Storm · New York Liberty · Connecticut Sun", wins: 205, losses: 214, playoffWins: 14, playoffLosses: 17, titles: 1, titleYears: "2004", href: "https://www.basketball-reference.com/wnba/coaches/donovan99w.html" }
  ];

  var collegeCoaches = [
    { name: "Geno Auriemma", school: "Connecticut", wins: 1288, losses: 166, titles: 12, firstRoundPicks: 29, titleYears: "12 NCAA titles" },
    { name: "Pat Summitt", school: "Tennessee", wins: 1098, losses: 208, titles: 8, firstRoundPicks: 16, titleYears: "8 NCAA titles" },
    { name: "Tara VanDerveer", school: "Stanford", wins: 1216, losses: 271, titles: 3, firstRoundPicks: 15, titleYears: "1990, 1992, 2021" },
    { name: "Kim Mulkey", school: "Baylor · LSU", wins: 783, losses: 130, titles: 4, firstRoundPicks: 14, titleYears: "2005, 2012, 2019, 2023" },
    { name: "Dawn Staley", school: "South Carolina", wins: 683, losses: 194, titles: 3, firstRoundPicks: 17, titleYears: "2017, 2022, 2024" },
    { name: "Muffet McGraw", school: "Notre Dame", wins: 936, losses: 293, titles: 2, firstRoundPicks: 10, titleYears: "2001, 2018" },
    { name: "Sylvia Hatchell", school: "North Carolina", wins: 1023, losses: 405, titles: 1, firstRoundPicks: 9, titleYears: "1994" },
    { name: "Jody Conradt", school: "Texas", wins: 900, losses: 306, titles: 1, firstRoundPicks: 3, titleYears: "1986" },
    { name: "C. Vivian Stringer", school: "Cheyney · Iowa · Rutgers", wins: 1055, losses: 426, titles: 0, firstRoundPicks: 7, titleYears: "3 NCAA title-game appearances" },
    { name: "Gary Blair", school: "Texas A&M", wins: 852, losses: 345, titles: 1, firstRoundPicks: 3, titleYears: "2011" },
    { name: "Cori Close", school: "UCLA", wins: 395, losses: 145, titles: 1, firstRoundPicks: 7, titleYears: "2026" }
  ];

  var finalists = [
    {
      name: "Karl Smesko",
      team: "Atlanta Dream",
      image: "https://cdn.wnba.com/headshots/wnba/latest/260x190/1642743.png",
      alt: "Official WNBA headshot of Atlanta Dream head coach Karl Smesko",
      seasonReg: "30–14",
      seasonPlayoff: "5–0",
      careerReg: "60–28",
      careerPlayoff: "6–2",
      context: "2025 Coach of the Year runner-up. Before Atlanta, he won 672 games in 26 seasons as a college head coach."
    },
    {
      name: "Natalie Nakase",
      team: "Golden State Valkyries",
      image: "https://cdn.wnba.com/headshots/wnba/latest/260x190/201089.png",
      alt: "Official WNBA headshot of Golden State Valkyries head coach Natalie Nakase",
      seasonReg: "32–12",
      seasonPlayoff: "5–1",
      careerReg: "55–33",
      careerPlayoff: "5–3",
      context: "2025 Coach of the Year. Her first-year expansion team finished 23–21 and became the first expansion club to reach the playoffs in year one."
    }
  ];

  function pct(wins, losses) {
    var games = wins + losses;
    return games ? wins / games : 0;
  }

  wnbaCoaches.forEach(function (coach) {
    coach.regularPct = pct(coach.wins, coach.losses);
    coach.playoffPct = pct(coach.playoffWins, coach.playoffLosses);
    coach.rawScore = (coach.regularPct * 40) + (coach.playoffPct * 40) + (Math.min(coach.titles, 4) * 5);
    coach.score = Math.round(coach.rawScore);
  });

  assignPeerGrades(wnbaCoaches);

  collegeCoaches.forEach(function (coach) {
    coach.regularPct = pct(coach.wins, coach.losses);
    coach.rawScore = (coach.regularPct * 35) + (Math.min(coach.titles, 4) * 8) + (Math.min(coach.wins / 1300, 1) * 33);
    coach.score = Math.round(coach.rawScore);
  });

  assignPeerGrades(collegeCoaches);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character];
    });
  }

  function record(wins, losses) {
    return wins + "–" + losses;
  }

  function percentLabel(value) {
    return (value * 100).toFixed(1) + "%";
  }

  function assignPeerGrades(data) {
    var values = data.map(function (coach) { return coach.rawScore; }).filter(Number.isFinite);
    data.forEach(function (coach) { coach.score = peerGrade(coach.rawScore, values); });
  }

  function scoreMarkup(score) {
    var safeScore = Math.max(0, Math.min(100, score));
    return '<span class="score-cell"><strong>' + score + '</strong><span class="coach-sub">/99 · ' + coachGradeLetter(score) + '</span><span class="score-track" aria-hidden="true"><span class="score-fill" style="width:' + safeScore + '%"></span></span></span>';
  }

  function tableRender(kind, data, config) {
    var search = document.getElementById(config.searchId);
    var filter = document.getElementById(config.filterId);
    var sortSelect = document.getElementById(config.sortId);
    var rows = document.getElementById(config.rowsId);
    var count = document.getElementById(config.countId);
    var table = document.getElementById(config.tableId);
    if (!search || !filter || !sortSelect || !rows || !table) return;

    var currentSort = "score";
    var direction = -1;

    function getValue(coach, key) {
      if (key === "name") return (coach.name + " " + (coach.teams || coach.school)).toLowerCase();
      if (key === "wins") return coach.wins;
      if (key === "titles") return coach.titles;
      if (key === "picks") return coach.firstRoundPicks || 0;
      if (key === "regular") return coach.regularPct;
      if (key === "playoff") return coach.playoffPct || 0;
      if (key === "rank" || key === "score") return coach.score;
      return coach.rawScore;
    }

    function render() {
      var query = search.value.trim().toLowerCase();
      var filterValue = filter.value;
      var filtered = data.filter(function (coach) {
        var text = (coach.name + " " + (coach.teams || coach.school) + " " + coach.titleYears).toLowerCase();
        var matchesSearch = !query || text.indexOf(query) !== -1;
        var matchesFilter = filterValue === "all" ||
          (filterValue === "champions" && coach.titles > 0) ||
          (filterValue === "twoplus" && coach.titles >= 2) ||
          (filterValue === "threeplus" && coach.titles >= 3);
        return matchesSearch && matchesFilter;
      });

      filtered.sort(function (left, right) {
        var a = getValue(left, currentSort);
        var b = getValue(right, currentSort);
        if (a < b) return -1 * direction;
        if (a > b) return 1 * direction;
        return left.name.localeCompare(right.name);
      });

      var ranks = [];
      var lastScore = null;
      var lastRank = 0;
      filtered.forEach(function (coach, index) {
        if ((currentSort === "score" || currentSort === "rank") && coach.score === lastScore) {
          ranks.push(lastRank);
        } else {
          lastRank = index + 1;
          lastScore = coach.score;
          ranks.push(lastRank);
        }
      });

      if (kind === "wnba") {
        rows.innerHTML = filtered.length ? filtered.map(function (coach, index) {
          return '<tr>' +
            '<td class="rank-cell" data-label="Rank">' + ranks[index] + '</td>' +
            '<td data-label="Coach"><a class="coach-name" href="' + escapeHtml(coach.href) + '" target="_blank" rel="noopener">' + escapeHtml(coach.name) + '</a><span class="coach-sub">' + escapeHtml(coach.teams) + '</span></td>' +
            '<td data-label="Regular season">' + record(coach.wins, coach.losses) + '<span class="coach-sub">' + percentLabel(coach.regularPct) + ' win rate</span></td>' +
            '<td data-label="Playoffs">' + record(coach.playoffWins, coach.playoffLosses) + '<span class="coach-sub">' + percentLabel(coach.playoffPct) + ' win rate</span></td>' +
            '<td data-label="WNBA titles"><span class="title-badge">' + coach.titles + '</span><span class="coach-sub">' + escapeHtml(coach.titleYears) + '</span></td>' +
            '<td data-label="Legacy W Score">' + scoreMarkup(coach.score) + '</td>' +
            '</tr>';
        }).join("") : '<tr><td colspan="' + (kind === "college" ? 7 : 6) + '" class="empty-state">No coaches match that search.</td></tr>';
      } else {
        rows.innerHTML = filtered.length ? filtered.map(function (coach, index) {
          return '<tr>' +
            '<td class="rank-cell" data-label="Rank">' + ranks[index] + '</td>' +
            '<td data-label="Coach · signature school"><span class="coach-name">' + escapeHtml(coach.name) + '</span><span class="coach-sub">' + escapeHtml(coach.school) + '</span></td>' +
            '<td data-label="Career record">' + record(coach.wins, coach.losses) + '</td>' +
            '<td data-label="Career win %">' + percentLabel(coach.regularPct) + '</td>' +
            '<td data-label="NCAA titles"><span class="title-badge">' + coach.titles + '</span><span class="coach-sub">' + escapeHtml(coach.titleYears) + '</span></td>' +
            '<td data-label="WNBA first-round picks"><span class="draft-count">' + coach.firstRoundPicks + '</span><span class="coach-sub">career picks</span></td>' +
            '<td data-label="Legacy W Score">' + scoreMarkup(coach.score) + '</td>' +
            '</tr>';
        }).join("") : '<tr><td colspan="' + (kind === "college" ? 7 : 6) + '" class="empty-state">No coaches match that search.</td></tr>';
      }

      if (count) count.textContent = filtered.length + (filtered.length === 1 ? " coach" : " coaches");
      table.querySelectorAll("thead th").forEach(function (th) {
        th.removeAttribute("aria-sort");
        var button = th.querySelector("button[data-sort]");
        if (button && button.getAttribute("data-sort") === currentSort) {
          th.setAttribute("aria-sort", direction === -1 ? "descending" : "ascending");
        }
      });
    }

    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    sortSelect.addEventListener("change", function () {
      currentSort = sortSelect.value;
      direction = currentSort === "name" ? 1 : -1;
      render();
    });

    table.querySelectorAll("button[data-sort]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextSort = button.getAttribute("data-sort");
        if (nextSort === currentSort) direction *= -1;
        else {
          currentSort = nextSort;
          direction = nextSort === "name" ? 1 : -1;
        }
        sortSelect.value = currentSort === "rank" ? "score" : currentSort;
        render();
      });
    });

    render();
  }

  function gradeCard(label, grade) {
    var score = grade.total;
    var shown = score === null ? "—" : score;
    var status = score === null ? "NR · no prior sample" : grade.letter + (grade.provisional ? " · PROVISIONAL · " + grade.sampleGames + " prior WNBA games" : "");
    return '<div class="finalist-grade-card">' +
      '<div class="finalist-scoreline"><span>' + escapeHtml(label) + '</span><strong>' + shown + '</strong></div>' +
      '<div class="score-meter" role="img" aria-label="' + escapeHtml(label + " " + (score === null ? "not scored" : score + " out of 99")) + '"><span style="width:' + (score === null ? 0 : score) + '%"></span></div>' +
      '<small>' + escapeHtml(status) + ' · peer grade /99</small>' +
      '</div>';
  }

  function finalistMarkup(coach, mode) {
    var seasonMode = mode === "season";
    var regular = seasonMode ? coach.seasonReg : coach.careerReg;
    var playoff = seasonMode ? coach.seasonPlayoff : coach.careerPlayoff;
    var regularLabel = seasonMode ? "2026 regular season" : "Career regular season";
    var playoffLabel = seasonMode ? "2026 playoffs" : "Career playoffs";
    var coachRecord = COURTSIDE_COACH_STATS.find(function (item) { return item.name === coach.name; });
    var grades = calculateCoachScores(coachRecord);
    return '<article class="finalist-card">' +
      '<div class="finalist-card-top">' +
      '<img src="' + escapeHtml(coach.image) + '" alt="' + escapeHtml(coach.alt) + '" loading="lazy" width="108" height="94">' +
      '<div><p>' + escapeHtml(coach.team) + '</p><h3>' + escapeHtml(coach.name) + '</h3><span>Finals head coach</span></div>' +
      '</div>' +
      '<div class="finalist-card-body">' +
      '<div class="finalist-grade-grid">' +
      gradeCard("Career W Grade · through 2025", grades.legacy) +
      gradeCard("2026 Form", grades.form) +
      '</div>' +
      '<dl class="finalist-stats">' +
      '<div><dt>' + regularLabel + '</dt><dd>' + regular + '</dd></div>' +
      '<div><dt>' + playoffLabel + '</dt><dd>' + playoff + '</dd></div>' +
      (seasonMode ? '<div><dt>Career regular season</dt><dd>' + coach.careerReg + '</dd></div><div><dt>Career playoffs</dt><dd>' + coach.careerPlayoff + '</dd></div>' : '<div><dt>WNBA titles</dt><dd>0 before the Finals</dd></div><div><dt>2026 playoff run</dt><dd>' + coach.seasonPlayoff + '</dd></div>') +
      '</dl>' +
      '<p class="finalist-context">' + escapeHtml(coach.context) + '</p>' +
      '</div></article>';
  }

  function renderFinalists(mode) {
    var grid = document.getElementById("finalistGrid");
    if (!grid) return;
    grid.innerHTML = finalists.map(function (coach) {
      return finalistMarkup(coach, mode);
    }).join("");
    document.querySelectorAll("[data-finalist-mode]").forEach(function (button) {
      var active = button.getAttribute("data-finalist-mode") === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  tableRender("wnba", wnbaCoaches, {
    searchId: "wnbaSearch",
    filterId: "wnbaFilter",
    sortId: "wnbaSort",
    rowsId: "wnbaRows",
    countId: "wnbaCount",
    tableId: "wnbaTable"
  });

  tableRender("college", collegeCoaches, {
    searchId: "collegeSearch",
    filterId: "collegeFilter",
    sortId: "collegeSort",
    rowsId: "collegeRows",
    countId: "collegeCount",
    tableId: "collegeTable"
  });

  document.querySelectorAll("[data-finalist-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      renderFinalists(button.getAttribute("data-finalist-mode"));
    });
  });

  renderFinalists("season");
}());
