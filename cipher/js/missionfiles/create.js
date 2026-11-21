const params = new URLSearchParams(window.location.search);
const isBounty = params.get("type") === "bounty";
const editId = isBounty ? null : params.get("id");
const isEdit = editId !== null;
const listPage = isBounty ? "bounties.html" : "missions.html";

const $ = (id) => document.getElementById(id);

let me = null;

function showError(message) {
  const box = $("createMsg");
  box.className = "alert alert-error";
  box.textContent = message;
  box.hidden = false;
}

function applyType() {
  if (isBounty) {
    document.title = "Post Bounty | CIPHER";
    $("createTitle").textContent = "Post a bounty";
    $("createIntro").textContent = "Post a challenge and offer a coin reward to the agent who solves it.";
    $("btnSubmit").textContent = "Post bounty";
    $("backLink").textContent = "← Back to Bounties";
  } else {
    document.title = "Create Mission | CIPHER";
    $("createTitle").textContent = "Create a mission";
    $("createIntro").textContent = "Add a new challenge to the mission directory.";
    $("btnSubmit").textContent = "Create mission";
    $("backLink").textContent = "← Back to Missions";
  }

  $("backLink").href = listPage;
  $("cancelLink").href = listPage;

  if (isEdit) {
    document.title = "Edit Mission | CIPHER";
    $("createTitle").textContent = "Edit mission";
    $("createIntro").textContent = "Update the mission details and save your changes.";
    $("btnSubmit").textContent = "Save changes";
    $("fMissionId").readOnly = true;
  }

  document.querySelectorAll("[data-for]").forEach(function (group) {
    const active = group.dataset.for === (isBounty ? "bounty" : "mission");
    group.hidden = !active;

    group.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.disabled = !active;
    });
  });
}

function buildMission() {
  const id = $("fMissionId").value.trim().toUpperCase();
  const title = $("fTitle").value.trim();
  const description = $("fDesc").value.trim();
  const xpValue = $("fXp").value.trim();
  const coinsValue = $("fCoins").value.trim();
  const xp = Number(xpValue);
  const coins = Number(coinsValue);
  const answer = $("fAnswer").value.trim();

  if (!id) {
    showError("Mission ID is required.");
    return null;
  }

  if (!title) {
    showError("Title is required.");
    return null;
  }

  if (!description) {
    showError("Description is required.");
    return null;
  }

  if (!answer) {
    showError("Expected answer is required.");
    return null;
  }

  if (!xpValue) {
    showError("XP is required.");
    return null;
  }

  if (!coinsValue) {
    showError("Coins are required.");
    return null;
  }

  if (!Number.isFinite(xp) || xp < 0) {
    showError("XP must be a non-negative number.");
    return null;
  }

  if (!Number.isFinite(coins) || coins < 0) {
    showError("Coins must be a non-negative number.");
    return null;
  }

  const duplicate = CIPHER.missions().some(function (mission) {
    const sameId = String(mission.id).toLowerCase() === id.toLowerCase();
    const isCurrentMission = isEdit && String(mission.id).toLowerCase() === String(editId).toLowerCase();
    return sameId && !isCurrentMission;
  });

  if (duplicate) {
    showError("That mission ID already exists.");
    return null;
  }

  return {
    id: id,
    title: title,
    subtitle: $("fSubtitle").value.trim(),
    category: $("fCategory").value,
    difficulty: $("fDifficulty").value,
    xp: xp,
    coins: coins,
    description: description,
    payload: $("fPayload").value.trim(),
    hint: $("fHint").value.trim(),
    answer: answer
  };
}

function buildBounty() {
  const title = $("fTitle").value.trim();
  const description = $("fDesc").value.trim();
  const reward = Number($("fReward").value);

  if (!title) {
    showError("Title is required.");
    return null;
  }

  if (!description) {
    showError("Description is required.");
    return null;
  }

  if (!Number.isFinite(reward) || reward < 1) {
    showError("Reward must be at least 1 coin.");
    return null;
  }

  return {
    id: Date.now(),
    title: title,
    postedBy: me.name,
    reward: reward,
    status: "open",
    description: description
  };
}

function fillMission(mission) {
  $("fMissionId").value = mission.id || "";
  $("fTitle").value = mission.title || "";
  $("fSubtitle").value = mission.subtitle || "";
  $("fCategory").value = mission.category || "Cryptography";
  $("fDifficulty").value = mission.difficulty || "Easy";
  $("fXp").value = mission.xp || 0;
  $("fCoins").value = mission.coins || 0;
  $("fDesc").value = mission.description || "";
  $("fPayload").value = mission.payload || "";
  $("fHint").value = mission.hint || "";
  $("fAnswer").value = mission.answer || "";
}

function saveItem(item) {
  if (isBounty) {
    CIPHER.saveBounty(item);
    CIPHER.addLog("Bounty Posted", item.title, 0, 0);
  } else {
    CIPHER.saveMission(item);
  }

  window.location.href = listPage;
}

function handleSubmit(event) {
  event.preventDefault();

  const item = isBounty ? buildBounty() : buildMission();
  if (!item) {
    return;
  }

  $("btnSubmit").disabled = true;
  $("btnSubmit").textContent = "Saving...";
  saveItem(item);
}

function init() {
  applyType();

  me = CIPHER.me();
  $("navAgent").textContent = me.name;

  if (!CIPHER.isLoggedIn()) {
    showError("Log in to create a mission or post a bounty.");
    $("createForm").querySelectorAll("input, select, textarea, button").forEach(function (field) {
      field.disabled = true;
    });
    return;
  }

  if (isEdit) {
    const mission = CIPHER.findMission(editId);
    if (!mission) {
      showError("Mission not found.");
      return;
    }
    fillMission(mission);
  }

  $("createForm").addEventListener("submit", handleSubmit);
}

init();
