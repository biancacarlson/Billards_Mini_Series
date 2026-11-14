(function () {
  var L = window.LEAGUE;
  var perPlayer = Math.round(L.feePerPerson * (1 + L.processingFeePct / 100) * 100) / 100;
  var total = Math.round(perPlayer * 2 * 100) / 100;
  function money(n) { return "$" + (n % 1 === 0 ? n : n.toFixed(2)); }
  var $ = function (id) { return document.getElementById(id); };

  document.title = L.name;
  $("fee-each").textContent = money(perPlayer);
  $("fee-total").textContent = money(total);
  if (L.zelleContact) {
    $("zelle-to").textContent = L.zelleContact;
    $("alt-pay").hidden = false;
  }

  function venmoLink(team) {
    var note = "Billiards League - " + (team || "Team Entry");
    return "https://venmo.com/" + encodeURIComponent(L.venmoUsername) +
      "?txn=pay&amount=" + total + "&note=" + encodeURIComponent(note);
  }

  var form = $("signup");
  var teamInput = form.elements["Team Name"];
  function refreshLinks() {
    var link = venmoLink(teamInput.value.trim());
    $("venmo-btn").href = link;
    $("venmo-btn-2").href = link;
  }
  teamInput.addEventListener("input", refreshLinks);
  refreshLinks();

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
        : "Fill in every box.");
      firstBad.focus();
      return;
    }

    var phones = ["Player 1 Phone", "Player 2 Phone"];
    for (var i = 0; i < phones.length; i++) {
      var f = form.elements[phones[i]];
      if (f.value.replace(/\D/g, "").length < 10) {
        f.classList.add("bad");
        showError("Enter a full 10-digit phone number.");
        f.focus();
        return;
      }
    }

    var data = {
      access_key: L.web3formsKey,
      subject: "New League Team: " + teamInput.value.trim(),
      from_name: "League Sign-Up",
      botcheck: form.elements["botcheck"].checked
    };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.name !== "botcheck" && el.type !== "checkbox") data[el.name] = el.value.trim();
    });
    data["Payment Sent"] = "Yes (team says they paid " + money(total) + " - verify in Venmo or Zelle)";

    var btn = $("submit");
    btn.disabled = true;
    btn.textContent = "Sending...";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) throw new Error(res.message || "Failed");
        form.hidden = true;
        $("done").hidden = false;
        window.scrollTo(0, 0);
      })
      .catch(function () {
        showError("Didn’t send. Check your connection and tap again.");
        btn.disabled = false;
        btn.textContent = "Sign Up My Team";
      });
  });

  // tabs
  var tabs = document.querySelectorAll(".tab");
  function showTab(name, push) {
    if (["info", "schedule", "bracket", "rules"].indexOf(name) < 0) name = "signup";
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.getAttribute("data-tab") === name;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $("tab-signup").hidden = name !== "signup";
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
})();
