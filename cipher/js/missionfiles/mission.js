const TYPE = document.body.dataset.type === "bounty" ? "bounty" : "mission";

const $ = (id) => document.getElementById(id);

let me = null;

function setText(id, value) {
  const element = $(id);
  if (element) {
    element.textContent = value;
  }
}

function applyRole() {
  const isAdmin = me.role === "admin";

  document.querySelectorAll("[data-admin]").forEach(function (element) {
    element.hidden = !isAdmin;
  });
}

function showError(message) {
  const box = $("missionError");
  if (!box) {
    return;
  }
  box.textContent = message;
  box.hidden = false;
}

function showAlert(id, ok, message) {
  const box = $(id);
  if (!box) {
    return;
  }

  if (ok) {
    box.className = "alert alert-success";
  } else {
    box.className = "alert alert-error";
  }

  box.textContent = message;
  box.hidden = false;
}

function showNotice(id, message) {
  const box = $(id);
  if (!box) {
    return;
  }
  box.className = "alert alert-info";
  box.textContent = message;
  box.hidden = false;
}

function renderMission(mission) {
  document.title = mission.id + " | CIPHER";

  setText("mTitle", mission.id + ": " + mission.title);
  setText("mMeta",
    (mission.category || "-") + " · " +
    (mission.difficulty || "-") + " · " +
    (mission.xp || 0) + " XP · " +
    (mission.coins || 0) + " Coins");
  setText("mDesc", mission.description || "No further details were provided for this mission.");
  setText("mPayload", mission.payload || "");
  setText("mHint", mission.hint || "No hint for this mission.");

  if ($("missionBody")) {
    $("missionBody").hidden = false;
  }
}

function renderBounty(bounty) {
  document.title = (bounty.title || bounty.id) + " | CIPHER";

  setText("mTitle", bounty.title || "Bounty");
  setText("mMeta",
    "Posted by " + (bounty.postedBy || "-") + " · " +
    (bounty.reward || 0) + " Coins · " +
    (bounty.status === "claimed" ? "Claimed" : "Open"));
  setText("mDesc", bounty.description || "No further details were provided for this bounty.");

  if ($("missionBody")) {
    $("missionBody").hidden = false;
  }

  wireClaim(bounty);
}

function wireClaim(bounty) {
  const button = $("btnClaim");
  if (!button) {
    return;
  }

  if (!CIPHER.isLoggedIn()) {
    button.disabled = false;
    button.textContent = "Log in to claim";
    button.onclick = function () {
      window.location.href = "login.html";
    };
    return;
  }

  const isMine = String(bounty.postedBy || "").toLowerCase() === String(me.name || "").toLowerCase();
  const claimed = bounty.status === "claimed";

  button.disabled = claimed || isMine;

  if (claimed) {
    button.textContent = "Claimed";
  } else if (isMine) {
    button.textContent = "Your bounty";
  } else {
    button.textContent = "Claim bounty";
  }

  button.onclick = function () {
    if (!confirm("Claim this bounty?")) {
      return;
    }

    const updated = {
      id: bounty.id,
      title: bounty.title,
      postedBy: bounty.postedBy,
      reward: bounty.reward,
      status: "claimed",
      description: bounty.description
    };

    CIPHER.saveBounty(updated);
    CIPHER.addLog("Bounty Claimed", bounty.title, 0, 0);
    renderBounty(updated);
    showAlert("claimResult", true, "Bounty claimed. It is now marked as claimed in the bounty list.");
  };
}

function wireMission(mission) {
  if (!CIPHER.isLoggedIn()) {
    $("answer").disabled = true;

    const submitButton = $("answerForm").querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    showNotice("result", "Log in to submit an answer.");
  }

  $("btnHint").addEventListener("click", function () {
    const box = $("mHint");
    box.hidden = !box.hidden;
    $("btnHint").textContent = box.hidden ? "Show hint" : "Hide hint";
  });

  $("answerForm").addEventListener("submit", function (event) {
    event.preventDefault();

    if (!CIPHER.isLoggedIn()) {
      showNotice("result", "Log in to submit an answer.");
      return;
    }

    const answer = $("answer").value.trim();
    if (!answer) {
      return;
    }

    const expected = mission.answer;
    const correct = expected && answer.toUpperCase() === String(expected).toUpperCase();

    if (correct) {
      const alreadySolved = CIPHER.isSolved(mission.id);

      CIPHER.markSolved(mission.id);
      if (!alreadySolved) {
        CIPHER.rewardUser(mission.xp, mission.coins);
      }

      CIPHER.addLog("Mission Solved", mission.title, mission.xp, mission.coins);
      showAlert("result", true, "Correct! +" + mission.xp + " XP, +" + mission.coins + " coins.");
    } else {
      CIPHER.addLog("Mission Failed", mission.title, 0, 0);
      showAlert("result", false, "Incorrect, try again.");
    }
  });

  $("btnEdit").addEventListener("click", function () {
    window.location.href = "create.html?type=mission&id=" + encodeURIComponent(mission.id);
  });

  $("btnDelete").addEventListener("click", function () {
    if (!confirm("Delete this mission?")) {
      return;
    }

    CIPHER.deleteMission(mission.id);
    window.location.href = "missions.html";
  });
}

function initMission(id) {
  const mission = CIPHER.findMission(id);

  if (!mission) {
    showError("Mission not found.");
    return;
  }

  renderMission(mission);
  wireMission(mission);
}

function initBounty(id) {
  const bounty = CIPHER.findBounty(id);

  if (!bounty) {
    showError("Bounty not found.");
    return;
  }

  renderBounty(bounty);
}

function init() {
  const id = new URLSearchParams(window.location.search).get("id");

  me = CIPHER.me();
  setText("navAgent", me.name);
  applyRole();

  if (!id) {
    showError("No " + TYPE + " selected. Go back and pick one.");
    return;
  }

  if (TYPE === "bounty") {
    initBounty(id);
  } else {
    initMission(id);
  }
}

init();
