(function () {
  var L = window.LEAGUE;
  var total = L.feePerPerson * 2;
  var $ = function (id) { return document.getElementById(id); };

  document.title = L.name + " Sign-Up";
  $("league-name").textContent = L.name;
  $("fee-each").textContent = "$" + L.feePerPerson + " per person";
  $("fee-total").textContent = "$" + total + " total";
  $("venmo-btn").textContent = "Pay $" + total + " on Venmo";
  $("venmo-btn-2").textContent = "Pay $" + total + " on Venmo";
  $("check-text").textContent = "I sent $" + total + " on Venmo.";

  function venmoLink(team) {
    var note = L.name + " - " + (team || "team entry");
    return "https://venmo.com/" + encodeURIComponent(L.venmoUsername) +
      "?txn=pay&amount=" + total + "&note=" + encodeURIComponent(note);
  }

  var form = $("signup");
  var teamInput = form.elements["Team name"];
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

    // check required fields
    var firstBad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input[required]"), function (el) {
      var bad = el.type === "checkbox" ? !el.checked : !el.value.trim();
      el.classList.toggle("bad", bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) {
      showError(firstBad.type === "checkbox"
        ? "Send $" + total + " on Venmo, then check the box."
        : "Fill in every box.");
      firstBad.focus();
      return;
    }

    // phone sanity check (10+ digits)
    var phones = ["Player 1 phone", "Player 2 phone"];
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
      subject: "New league team: " + teamInput.value.trim(),
      from_name: "League Sign-Up",
      botcheck: form.elements["botcheck"].checked
    };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.name !== "botcheck" && el.type !== "checkbox") data[el.name] = el.value.trim();
    });
    data["Venmo payment sent"] = "Yes (team says they paid $" + total + " - verify in Venmo)";

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
        showError("Didn't send. Check your connection and tap again.");
        btn.disabled = false;
        btn.textContent = "Sign up my team";
      });
  });
})();
