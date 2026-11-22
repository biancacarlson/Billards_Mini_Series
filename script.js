(function () {
  var L = window.LEAGUE;
  var perPlayer = Math.round(L.feePerPerson * (1 + L.processingFeePct / 100) * 100) / 100;
  var total = Math.round(perPlayer * 2 * 100) / 100;
  function money(n) { return "$" + n.toFixed(2); }
  var $ = function (id) { return document.getElementById(id); };

  document.title = L.name;
  $("fee-each").textContent = money(perPlayer);
  $("fee-total").textContent = money(total);
  var payLabel = "Pay " + money(total) + " on Venmo";
  $("venmo-btn").textContent = payLabel;
  $("venmo-btn-2").textContent = payLabel;
  $("venmo-btn-3").textContent = payLabel;

  function venmoLink(team) {
    var note = "Billiards League - " + (team || "Team Entry");
    return "https://venmo.com/" + encodeURIComponent(L.venmoUsername) +
      "?txn=pay&amount=" + total + "&note=" + encodeURIComponent(note);
  }

  var signedUp = false;
  var form = $("signup");
  var teamInput = form.elements["Team Name"];
  function refreshLinks() {
    var link = venmoLink(teamInput.value.trim());
    $("venmo-btn").href = link;
    $("venmo-btn-2").href = link;
  }
  teamInput.addEventListener("input", refreshLinks);
  refreshLinks();

  // pay-only section (for teams that signed up but have not paid)
  var payTeam = $("pay-team");
  Array.prototype.forEach.call(document.querySelectorAll(".pay-each"), function (e) { e.textContent = money(perPlayer); });
  Array.prototype.forEach.call(document.querySelectorAll(".pay-total"), function (e) { e.textContent = money(total); });
  function refreshPay() {
    $("venmo-btn-3").href = venmoLink(payTeam.value.trim());
    if (payTeam.value.trim()) $("pay-error").hidden = true;
  }
  payTeam.addEventListener("input", refreshPay);
  refreshPay();
  $("venmo-btn-3").addEventListener("click", function (ev) {
    if (!payTeam.value.trim()) {
      ev.preventDefault();
      $("pay-error").hidden = false;
      payTeam.classList.add("bad");
      payTeam.focus();
    } else {
      payTeam.classList.remove("bad");
    }
  });
  function showError(msg) {
    var e = $("error");
    e.textContent = msg;
    e.hidden = !msg;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    showError("");

    var firstBad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input[required]"), function (el) {
      var bad = el.type === "checkbox" ? !el.checked : !el.value.trim();
      el.classList.toggle("bad", bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      showError(firstBad.type === "checkbox"
        ? "Send your payment, then check the box."
        : "Complete all fields.");
      firstBad.focus();
      return;
    }

    var phones = ["Player 1 Phone", "Player 2 Phone"];
    for (var i = 0; i < phones.length; i++) {
      var f = form.elements[phones[i]];
      if (f.value.replace(/\D/g, "").length < 10) {
        f.classList.add("bad");
        showError("Enter a 10-digit phone number.");
        f.focus();
        return;
      }
    }

    var data = {
      access_key: L.web3formsKey,
      subject: "New Team Registration: " + teamInput.value.trim(),
      from_name: "League Registration",
      botcheck: form.elements["botcheck"].checked
    };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.name !== "botcheck" && el.type !== "checkbox") data[el.name] = el.value.trim();
    });
    data["Payment Sent"] = "Yes (team says they paid " + money(total) + " - verify in Venmo)";

    var btn = $("submit");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message || "Failed");
        signedUp = true;
        form.hidden = true;
        $("done").hidden = false;
        window.scrollTo(0, 0);
      })
      .catch(function () {
        showError("Registration failed. Check your connection and try again.");
        btn.disabled = false;
        btn.textContent = "Register Team";
      });
  });

  // tabs
  var tabs = document.querySelectorAll(".tab");
  function showTab(name, push) {
    // Hidden backup: the pay-only card shows only at the private link ending in #pay.
    var payMode = name === "pay";
    if (["info", "schedule", "bracket", "rules"].indexOf(name) < 0) name = "signup";
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $("tab-signup").hidden = name !== "signup";
    $("pay-only").hidden = !payMode;
    form.hidden = payMode || signedUp;
    $("done").hidden = payMode || !signedUp;
    document.querySelector(".deadline").hidden = payMode;
    $("tab-info").hidden = name !== "info";
    $("tab-schedule").hidden = name !== "schedule";
    $("tab-bracket").hidden = name !== "bracket";
    $("tab-rules").hidden = name !== "rules";
    if (push) { history.replaceState(null, "", "#" + name); window.scrollTo(0, 0); }
  }
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener("click", function () { showTab(t.getAttribute("data-tab"), true); });
  });
  window.addEventListener("hashchange", function () { showTab(location.hash.slice(1), false); });
  showTab(location.hash.slice(1), false);

  // Info + Rules: one font size for every bullet = largest (14-17px) that keeps the longest bullet on one line
  function fitBullets() {
    var info = $("tab-info"), rules = $("tab-rules");
    var hi = info.hidden, hr = rules.hidden;
    info.hidden = false; rules.hidden = false;
    var els = document.querySelectorAll("#tab-info .pts li, #tab-rules .pts li, #tab-info .rule-intro, #tab-rules .rule-intro");
    var root = document.documentElement, best = 14, i, s;
    for (i = 0; i < els.length; i++) els[i].style.whiteSpace = "nowrap";
    for (s = 17; s >= 14; s -= 0.25) {
      root.style.setProperty("--bsz", s + "px");
      var ok = true;
      for (i = 0; i < els.length; i++) {
        var cs = getComputedStyle(els[i]), rg = document.createRange();
        rg.selectNodeContents(els[i]);
        var avail = els[i].clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        if (rg.getBoundingClientRect().width > avail - 3) { ok = false; break; }
      }
      if (ok) { best = s; break; }
    }
    root.style.setProperty("--bsz", best + "px");
    for (i = 0; i < els.length; i++) els[i].style.whiteSpace = "";
    info.hidden = hi; rules.hidden = hr;
  }
  var fitTimer;
  function fitSoon() { clearTimeout(fitTimer); fitTimer = setTimeout(fitBullets, 80); }
  window.addEventListener("resize", fitSoon);
  window.addEventListener("load", fitBullets);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitBullets);
  fitBullets();
})();
