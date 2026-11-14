// Renders Standings, Schedule and Bracket from league-data.js
(function () {
  var D = window.LEAGUE_DATA;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var teams = D.teams;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function nm(n) {
    var t = teams[n - 1];
    return t && t.name ? t.name : "Team " + n;
  }

  /* ---------- standings ---------- */
  function standings() {
    var rows = teams.map(function (t, i) {
      return { no: i + 1, name: nm(i + 1), w: 0, l: 0, pf: t.pf || 0, pa: t.pa || 0, beat: {} };
    });
    var played = 0, total = 0;
    D.weeks.forEach(function (wk) {
      wk.matches.forEach(function (m) {
        total++;
        if (m.win) {
          played++;
          var loser = m.win === m.a ? m.b : m.a;
          rows[m.win - 1].w++;
          rows[loser - 1].l++;
          rows[m.win - 1].beat[loser] = (rows[m.win - 1].beat[loser] || 0) + 1;
        }
      });
    });
    var byWins = {};
    rows.forEach(function (r) { (byWins[r.w] = byWins[r.w] || []).push(r); });
    var out = [];
    Object.keys(byWins).map(Number).sort(function (a, b) { return b - a; }).forEach(function (w) {
      var g = byWins[w];
      // Rankings order: head-to-head (two-team ties), point differential, points scored
      g.sort(function (x, y) { return (y.pf - y.pa) - (x.pf - x.pa) || y.pf - x.pf || x.no - y.no; });
      if (g.length === 2) {
        var ab = g[0].beat[g[1].no] || 0, ba = g[1].beat[g[0].no] || 0;
        if (ba > ab) g = [g[1], g[0]];
      }
      out = out.concat(g);
    });
    return { rows: out, played: played, total: total };
  }

  var S = standings();
  var ready = S.played > 0;
  var seeds = S.rows.slice(0, 8).map(function (r) { return r.no; });

  function renderStandings() {
    var h = '<table class="stand"><thead><tr><th>#</th><th class="l">Team</th><th>W</th><th>L</th><th>Diff</th><th>Pts</th></tr></thead><tbody>';
    S.rows.forEach(function (r, i) {
      var d = r.pf - r.pa;
      h += '<tr class="' + (i < 8 ? "in" : "") + '"><td class="rk">' + (i + 1) + '</td><td class="l tn">' + esc(r.name) +
        '</td><td>' + r.w + '</td><td>' + r.l + '</td><td>' + (d > 0 ? "+" + d : d) + '</td><td>' + r.pf + '</td></tr>';
      if (i === 7) h += '<tr class="cut"><td colspan="6"><span>Playoff Cutoff</span></td></tr>';
    });
    h += "</tbody></table>";
    $("standings").innerHTML = h;
  }

  /* ---------- bracket model ---------- */
  function seedTeam(s) {
    return { no: ready ? seeds[s - 1] : null, seed: s, name: ready ? nm(seeds[s - 1]) : null };
  }
  function pick(res, a, b) {
    if (!res || !res.win || !a || !b) return { w: null, l: null };
    if (a.no === res.win) return { w: a, l: b };
    if (b.no === res.win) return { w: b, l: a };
    return { w: null, l: null };
  }
  function bracket() {
    var P = D.playoffs;
    var pairs = [[1, 8], [4, 5], [2, 7], [3, 6]];
    var m = [];
    pairs.forEach(function (p, i) {
      var a = seedTeam(p[0]), b = seedTeam(p[1]);
      m.push({ n: i + 1, round: "Quarterfinal", a: a, b: b, res: P.qf[i], out: pick(P.qf[i], a, b) });
    });
    [[0, 1], [2, 3]].forEach(function (p, i) {
      var a = m[p[0]].out.w, b = m[p[1]].out.w;
      m.push({
        n: 5 + i, round: "Semifinal", a: a, b: b, res: P.sf[i], out: pick(P.sf[i], a, b),
        aPh: "Winner of Match " + (p[0] + 1), bPh: "Winner of Match " + (p[1] + 1)
      });
    });
    var ta = m[4].out.l, tb = m[5].out.l;
    var third = { n: 7, round: "3rd Place", a: ta, b: tb, res: P.third, out: pick(P.third, ta, tb), aPh: "Loser of Match 5", bPh: "Loser of Match 6" };
    var fa = m[4].out.w, fb = m[5].out.w;
    var fin = { n: 8, round: "Championship", a: fa, b: fb, res: P.final, out: pick(P.final, fa, fb), aPh: "Winner of Match 5", bPh: "Winner of Match 6" };
    return { m: m, third: third, fin: fin };
  }
  var B = bracket();

  function side(t, ph, win) {
    if (!t) return '<div class="side ph"><span class="seed">?</span><span class="tn">' + esc(ph || "TBD") + "</span></div>";
    var cls = win ? (win === t.no ? "win" : "lose") : "";
    var name = t.name === null ? "TBD" : esc(t.name);
    return '<div class="side ' + cls + (t.name === null ? " ph" : "") + '"><span class="seed">#' + t.seed + '</span><span class="tn">' + name + "</span>" +
      (win && win === t.no ? '<span class="ck">&#10003;</span>' : "") + "</div>";
  }
  function card(x, label) {
    var win = x.res && x.res.win;
    return '<div class="bm"><div class="bh"><b>' + (label || "Match " + x.n) + "</b>" +
      (x.res && x.res.score ? "<span>" + esc(x.res.score) + "</span>" : "") + "</div>" +
      side(x.a, x.aPh, win) + side(x.b, x.bPh, win) + "</div>";
  }
  function renderBracket() {
    var h = '<h3 class="round">Quarterfinals</h3>';
    B.m.slice(0, 4).forEach(function (x) { h += card(x); });
    h += '<h3 class="round">Semifinals</h3>';
    B.m.slice(4).forEach(function (x) { h += card(x); });
    h += '<h3 class="round">Finals</h3>';
    h += card(B.fin, "Championship");
    h += card(B.third, "3rd Place");
    var champ = B.fin.out.w;
    if (champ) h = '<div class="champ"><span>&#127942;</span><b>' + esc(champ.name) + "</b><small>Champions</small></div>" + h;
    $("bracket").innerHTML = h;
  }

  /* ---------- schedule ---------- */
  function teamLine(no, win) {
    var cls = win ? (win === no ? "win" : "lose") : "";
    return '<div class="tl ' + cls + '"><span class="tn">' + esc(nm(no)) + "</span>" + (win && win === no ? '<span class="ck">&#10003;</span>' : "") + "</div>";
  }
  function regularWeek(wk) {
    var slots = [], map = {};
    wk.matches.forEach(function (m) {
      if (!map[m.slot]) { map[m.slot] = { t: m.slot, items: [] }; slots.push(map[m.slot]); }
      map[m.slot].items.push(m);
    });
    return slots.map(function (s) {
      return '<div class="slot"><h3 class="time">' + s.t + "</h3>" + s.items.map(function (m) {
        return '<div class="mrow"><span class="tb">Table ' + m.table + "</span><div class=\"vs\">" +
          teamLine(m.a, m.win) + '<div class="vsl">vs.</div>' + teamLine(m.b, m.win) + "</div>" +
          (m.score ? '<span class="rs">' + esc(m.score) + "</span>" : "") + "</div>";
      }).join("") + "</div>";
    }).join("");
  }
  function champRow(x, table, label) {
    var win = x.res && x.res.win;
    function line(t, ph) {
      if (!t) return '<div class="tl ph"><span class="tn">' + esc(ph) + "</span></div>";
      var cls = win ? (win === t.no ? "win" : "lose") : "";
      var nameTxt = t.name === null ? "#" + t.seed + " Seed" : esc(t.name);
      return '<div class="tl ' + cls + '"><span class="tn">' + nameTxt + "</span>" + (win && win === t.no ? '<span class="ck">&#10003;</span>' : "") + "</div>";
    }
    return '<div class="mrow"><span class="tb">Table ' + table + '</span><div class="vs"><div class="lbl">' + label + "</div>" +
      line(x.a, x.aPh) + '<div class="vsl">vs.</div>' + line(x.b, x.bPh) + "</div>" +
      (x.res && x.res.score ? '<span class="rs">' + esc(x.res.score) + "</span>" : "") + "</div>";
  }
  function champWeek() {
    var m = B.m;
    var slots = [
      { t: "6:00 PM", rows: [[m[0], 1, "Quarterfinal, Match 1"], [m[1], 2, "Quarterfinal, Match 2"]] },
      { t: "6:45 PM", rows: [[m[2], 1, "Quarterfinal, Match 3"], [m[3], 2, "Quarterfinal, Match 4"]] },
      { t: "7:30 PM", rows: [[m[4], 1, "Semifinal, Match 5"], [m[5], 2, "Semifinal, Match 6"]] },
      { t: "8:15 PM", rows: [[B.fin, 1, "Championship"], [B.third, 2, "3rd Place"]] }
    ];
    return slots.map(function (s) {
      return '<div class="slot"><h3 class="time">' + s.t + "</h3>" + s.rows.map(function (r) { return champRow(r[0], r[1], r[2]); }).join("") + "</div>";
    }).join("");
  }

  var chipWeeks = D.weeks.map(function (w) { return { date: w.date, label: w.label }; });
  chipWeeks.push({ date: D.championship.date, label: D.championship.label });

  function defaultWeek() {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    for (var i = 0; i < chipWeeks.length; i++) {
      var p = chipWeeks[i].date.split("-");
      if (new Date(+p[0], +p[1] - 1, +p[2]) >= now) return i;
    }
    return chipWeeks.length - 1;
  }
  var cur = defaultWeek();

  function renderSchedule() {
    var chips = chipWeeks.map(function (w, i) {
      return '<button type="button" class="chip' + (i === cur ? " on" : "") + '" data-w="' + i + '"><b>Week ' + (i + 1) + "</b><span>" + w.label + "</span></button>";
    }).join("");
    $("week-chips").innerHTML = chips;
    $("week-title").textContent = "Championship Night";
    $("week-title").hidden = cur !== chipWeeks.length - 1;
    $("week-body").innerHTML = cur === chipWeeks.length - 1 ? champWeek() : regularWeek(D.weeks[cur]);
  }
  $("week-chips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    cur = +b.getAttribute("data-w");
    renderSchedule();
  });

  renderStandings();
  renderBracket();
  renderSchedule();
})();
