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
    // Tie-breakers: 1) game wins, 2) head-to-head record among the tied teams (still tied: team number).
    function h2hNet(t, grp) {
      var n = 0;
      grp.forEach(function (o) {
        if (o !== t) n += (t.beat[o.no] || 0) - (o.beat[t.no] || 0);
      });
      return n;
    }
    function rankTied(g) {
      if (g.length < 2) return g;
      g.forEach(function (t) { t.net = h2hNet(t, g); });
      g.sort(function (x, y) { return y.net - x.net; });
      var res = [], i = 0;
      while (i < g.length) {
        var j = i;
        while (j < g.length && g[j].net === g[i].net) j++;
        var sub = g.slice(i, j);
        if (sub.length === g.length) sub.sort(function (x, y) { return x.no - y.no; });
        else sub = rankTied(sub);
        res = res.concat(sub);
        i = j;
      }
      return res;
    }
    var byWins = {};
    rows.forEach(function (r) { (byWins[r.w] = byWins[r.w] || []).push(r); });
    var out = [];
    Object.keys(byWins).map(Number).sort(function (a, b) { return b - a; }).forEach(function (w) {
      out = out.concat(rankTied(byWins[w]));
    });
    return { rows: out, played: played, total: total };
  }

  var S = standings();
  var ready = S.played > 0;
  var seeds = S.rows.slice(0, 8).map(function (r) { return r.no; });

  function renderStandings() {
    // Before any games are played, ranks are meaningless: hide them, the cutoff and the top-8 shading.
    var cols = ready ? 4 : 3;
    var h = '<table class="stand"><thead><tr>' + (ready ? "<th>Rank</th>" : "") + '<th class="l">Team</th><th>W</th><th>L</th></tr></thead><tbody>';
    S.rows.forEach(function (r, i) {
      h += '<tr class="' + (ready && i < 8 ? "in" : "") + '">' + (ready ? '<td class="rk">' + (i + 1) + "</td>" : "") + '<td class="l tn">' + esc(r.name) +
        '</td><td class="sw">' + r.w + '</td><td class="sl">' + r.l + '</td></tr>';
      if (ready && i === 7) h += '<tr class="cut"><td colspan="' + cols + '"><span>Top 8 Advance</span></td></tr>';
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
        aPh: "Winner M" + (p[0] + 1), bPh: "Winner M" + (p[1] + 1)
      });
    });
    var ta = m[4].out.l, tb = m[5].out.l;
    var third = { n: 7, round: "3rd-Place Match", a: ta, b: tb, res: P.third, out: pick(P.third, ta, tb), aPh: "Loser M5", bPh: "Loser M6" };
    var fa = m[4].out.w, fb = m[5].out.w;
    var fin = { n: 8, round: "Championship", a: fa, b: fb, res: P.final, out: pick(P.final, fa, fb), aPh: "Winner M5", bPh: "Winner M6" };
    return { m: m, third: third, fin: fin };
  }
  var B = bracket();

  function side(t, ph, win) {
    if (!t) return '<div class="side ph"><span class="seed">?</span><span class="tn">' + esc(ph || "TBD") + "</span></div>";
    var cls = win ? (win === t.no ? "win" : "lose") : "";
    var name = t.name === null ? "TBD" : esc(t.name);
    return '<div class="side ' + cls + (t.name === null ? " ph" : "") + '"><span class="seed">' + t.seed + '</span><span class="tn" title="' + name + '">' + name + "</span>" +
      (win && win === t.no ? '<span class="ck">&#10003;</span>' : "") + "</div>";
  }
  function card(x, label, cls) {
    var win = x.res && x.res.win;
    return '<div class="bm ' + (cls || "") + '"><div class="bh"><b>' + (label || "Match " + x.n) + "</b>" +
      (x.res && x.res.score ? "<span>" + esc(x.res.score) + "</span>" : "") + "</div>" +
      side(x.a, x.aPh, win) + side(x.b, x.bPh, win) + "</div>";
  }
  function slot(inner) { return '<div class="bslot">' + inner + "</div>"; }
  function col(title, cls, inner) {
    return '<div class="rcol ' + cls + '"><div class="rh">' + title + '</div><div class="rbody">' + inner + "</div></div>";
  }
  function renderBracket() {
    var m = B.m;
    var third = '<div class="third"><div class="rh">3rd Place<small>1 game</small></div>' + card(B.third) + "</div>";
    var h = '<div class="brk-frame"><div class="brk-wrap"><div class="brk">' +
      col("Quarterfinals<small>1 game</small>", "c1", slot(card(m[0])) + slot(card(m[1])) + slot(card(m[2])) + slot(card(m[3]))) +
      col("Semifinals<small>Best of 3</small>", "c2", slot(card(m[4])) + slot(card(m[5]))) +
      col("Championship<small>Best of 3</small>", "c3", slot(card(B.fin, "&#127942; Championship", "fin")) + third) +
      '</div></div></div><div class="brk-dots" role="tablist" aria-label="Rounds">' +
      '<button type="button" class="brk-dot" data-i="0" aria-label="Quarterfinals"></button>' +
      '<button type="button" class="brk-dot" data-i="1" aria-label="Semifinals"></button>' +
      '<button type="button" class="brk-dot" data-i="2" aria-label="Championship"></button></div>';
    var champ = B.fin.out.w;
    if (champ) h = '<div class="champ"><span>&#127942;</span><b>' + esc(champ.name) + "</b><small>Champions</small></div>" + h;
    $("bracket").innerHTML = h;
    bindBracket();
  }
  // Bracket swiping: edge fades show where there is more, dots show/jump to the round
  function bindBracket() {
    var frame = document.querySelector("#bracket .brk-frame");
    if (!frame) return;
    var wrap = frame.querySelector(".brk-wrap");
    var cols = wrap.querySelectorAll(".rcol");
    var dots = document.querySelectorAll("#bracket .brk-dot");
    var ticking = false;
    function update() {
      ticking = false;
      var max = wrap.scrollWidth - wrap.clientWidth, x = wrap.scrollLeft;
      frame.classList.toggle("can-l", x > 4);
      frame.classList.toggle("can-r", x < max - 4);
      var best = 0, bd = 1e9, i;
      for (i = 0; i < cols.length; i++) {
        var d = Math.abs(cols[i].offsetLeft - 14 - x);
        if (d < bd) { bd = d; best = i; }
      }
      if (max > 0 && x >= max - 4) best = cols.length - 1;
      for (i = 0; i < dots.length; i++) dots[i].classList.toggle("on", i === best);
    }
    wrap.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    Array.prototype.forEach.call(dots, function (d, i) {
      d.addEventListener("click", function () {
        wrap.scrollTo({ left: Math.max(0, cols[i].offsetLeft - 14), behavior: "smooth" });
      });
    });
    update();
  }

  /* ---------- schedule ---------- */
  function resPanel(an, bn, aNo, bNo, win, score) {
    var body;
    if (win) {
      var wn = win === aNo ? an : bn, ln = win === aNo ? bn : an;
      body = '<div class="rline w"><b>Winner</b><span>' + wn + "</span>" +
        (score ? '<em class="sc">' + esc(score) + "</em>" : "") + "</div>";
    } else {
      body = '<div class="rline n">Not played</div>';
    }
    return '<div class="mres">' + body + "</div>";
  }
  function teamLine(no, win) {
    var cls = win ? (win === no ? "win" : "lose") : "";
    return '<div class="tl ' + cls + '"><span class="tn">' + esc(nm(no)) + (win && win === no ? '&nbsp;<span class="ck">&#10003;</span>' : "") + "</span></div>";
  }
  function regularWeek(wk) {
    var slots = [], map = {};
    wk.matches.forEach(function (m) {
      if (!map[m.slot]) { map[m.slot] = { t: m.slot, items: [] }; slots.push(map[m.slot]); }
      map[m.slot].items.push(m);
    });
    return slots.map(function (s) {
      return '<div class="slot"><h3 class="time">' + s.t + "</h3>" + s.items.map(function (m) {
        return '<div class="mrow tap t' + m.table + '" role="button" tabindex="0" aria-expanded="false"><span class="sr">Table ' + m.table + "</span><div class=\"vs\">" +
          teamLine(m.a, m.win) + '<div class="vsl">vs.</div>' + teamLine(m.b, m.win) + "</div>" +
          (m.score ? '<span class="rs">' + esc(m.score) + "</span>" : "") +
          resPanel(esc(nm(m.a)), esc(nm(m.b)), m.a, m.b, m.win, m.score) + "</div>";
      }).join("") + "</div>";
    }).join("");
  }
  function champRow(x, table, label) {
    var win = x.res && x.res.win;
    function line(t, ph) {
      if (!t) return '<div class="tl ph"><span class="tn">' + esc(ph) + "</span></div>";
      var cls = win ? (win === t.no ? "win" : "lose") : "";
      var nameTxt = t.name === null ? "#" + t.seed + " Seed" : esc(t.name);
      return '<div class="tl ' + cls + '"><span class="tn">' + nameTxt + (win && win === t.no ? '&nbsp;<span class="ck">&#10003;</span>' : "") + "</span></div>";
    }
    function tname(t, ph) { return !t ? esc(ph) : (t.name === null ? "#" + t.seed + " Seed" : esc(t.name)); }
    return '<div class="mrow tap t' + table + '" role="button" tabindex="0" aria-expanded="false"><span class="sr">Table ' + table + '</span><div class="vs"><div class="lbl">' + label + "</div>" +
      line(x.a, x.aPh) + '<div class="vsl">vs.</div>' + line(x.b, x.bPh) + "</div>" +
      (x.res && x.res.score ? '<span class="rs">' + esc(x.res.score) + "</span>" : "") +
      resPanel(tname(x.a, x.aPh), tname(x.b, x.bPh), x.a && x.a.no, x.b && x.b.no, win, x.res && x.res.score) + "</div>";
  }
  function champWeek() {
    var m = B.m;
    var slots = [
      { t: "6:00 PM", rows: [[m[0], 1, "Quarterfinal &middot; Match 1 &middot; 1 game"], [m[1], 2, "Quarterfinal &middot; Match 2 &middot; 1 game"]] },
      { t: "6:20 PM", rows: [[m[2], 1, "Quarterfinal &middot; Match 3 &middot; 1 game"], [m[3], 2, "Quarterfinal &middot; Match 4 &middot; 1 game"]] },
      { t: "6:40 PM", rows: [[m[4], 1, "Semifinal &middot; Match 5 &middot; Best of 3"], [m[5], 2, "Semifinal &middot; Match 6 &middot; Best of 3"]] },
      { t: "7:40 PM", rows: [[B.fin, 1, "Championship &middot; Best of 3"], [B.third, 2, "3rd-Place Match &middot; 1 game"]] }
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
      return '<button type="button" class="chip' + (i === cur ? " on" : "") + '" data-w="' + i + '"><b>' + (i === chipWeeks.length - 1 ? "Finals" : "Week " + (i + 1)) + "</b><span>" + w.label + "</span></button>";
    }).join("");
    $("week-chips").innerHTML = chips;
    $("week-title").textContent = "Championship Night";
    $("week-title").hidden = cur !== chipWeeks.length - 1;
    $("week-body").innerHTML = cur === chipWeeks.length - 1 ? champWeek() : regularWeek(D.weeks[cur]);
    bindRows();
  }
  function toggleRow(row) {
    var open = row.classList.toggle("open");
    row.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function bindRows() {
    var rows = $("week-body").querySelectorAll(".mrow.tap");
    Array.prototype.forEach.call(rows, function (row) {
      row.addEventListener("click", function () { toggleRow(row); });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleRow(row); }
      });
    });
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
