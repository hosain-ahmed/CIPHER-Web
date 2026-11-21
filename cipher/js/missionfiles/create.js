const API = {
  me: "/api/me",
  missions: "/api/missions",
  bounties: "/api/bounties",
};

const $ = (id) => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const IS_BOUNTY = PARAMS.get("type") === "bounty";
const EDIT_ID = IS_BOUNTY ? null : PARAMS.get("id");
const IS_EDIT = Boolean(EDIT_ID);
const TYPE = IS_BOUNTY ? "bounty" : "mission";
const LIST_PAGE = IS_BOUNTY ? "bounties.html" : "missions.html";

let me = {
  ...CIPHER_DATA.me,
  role: (function () {
    try { return localStorage.getItem("cipherRole") || "admin"; } catch (e) { return "admin"; }
  })(),
};

async function getJSON(url, fallback) {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn("API failed, using mock for", url, e);
    return fallback;
  }
}

function showError(message) {
  const box = $("createMsg");
  box.className = "alert alert-error";
  box.textContent = message;
  box.hidden = false;
}

function applyType() {
  document.title = IS_BOUNTY ? "Post Bounty | CIPHER" : "Create Mission | CIPHER";
  $("createTitle").textContent = IS_BOUNTY ? "Post a bounty" : "Create a mission";
  $("createIntro").textContent = IS_BOUNTY
    ? "Post a challenge and offer a coin reward to the agent who solves it."
    : "Add a new challenge to the mission directory.";
  $("btnSubmit").textContent = IS_BOUNTY ? "Post bounty" : "Create mission";
  $("backLink").href = LIST_PAGE;
  $("backLink").textContent = IS_BOUNTY ? "← Back to Bounties" : "← Back to Missions";
  $("cancelLink").href = LIST_PAGE;

  if (IS_EDIT) {
    document.title = "Edit Mission | CIPHER";
    $("createTitle").textContent = "Edit mission";
    $("createIntro").textContent = "Update the mission details and save your changes.";
    $("btnSubmit").textContent = "Save changes";
    $("fMissionId").readOnly = true;
  }

  document.querySelectorAll("[data-for]").forEach((group) => {
    const active = group.dataset.for === TYPE;
    group.hidden = !active;
    group.querySelectorAll("input, select, textarea").forEach((field) => {
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

  if (!id) return showError("Mission ID is required.");
  if (!title) return showError("Title is required.");
  if (!description) return showError("Description is required.");
  if (!answer) return showError("Expected answer is required.");
  if (!xpValue) return showError("XP is required.");
  if (!coinsValue) return showError("Coins are required.");
  if (!Number.isFinite(xp) || xp < 0) return showError("XP must be a non-negative number.");
  if (!Number.isFinite(coins) || coins < 0) return showError("Coins must be a non-negative number.");
  const duplicate = CIPHER.missions().some((mission) =>
    String(mission.id).toLowerCase() === id.toLowerCase() &&
    (!IS_EDIT || String(mission.id).toLowerCase() !== String(EDIT_ID).toLowerCase())
  );
  if (duplicate) return showError("That mission ID already exists.");

  return {
    id,
    title,
    subtitle: $("fSubtitle").value.trim(),
    category: $("fCategory").value,
    difficulty: $("fDifficulty").value,
    xp,
    coins,
    description,
    payload: $("fPayload").value.trim(),
    hint: $("fHint").value.trim(),
    answer,
  };
}

function buildBounty() {
  const title = $("fTitle").value.trim();
  const description = $("fDesc").value.trim();
  const reward = Number($("fReward").value);

  if (!title) return showError("Title is required.");
  if (!description) return showError("Description is required.");
  if (!Number.isFinite(reward) || reward < 1) return showError("Reward must be at least 1 coin.");

  return {
    id: Date.now(),
    title,
    postedBy: me.name,
    reward,
    status: "open",
    description,
  };
}

function fillMission(mission) {
  $("fMissionId").value = mission.id || "";
  $("fTitle").value = mission.title || "";
  $("fSubtitle").value = mission.subtitle || "";
  $("fCategory").value = mission.category || "Cryptography";
  $("fDifficulty").value = mission.difficulty || "Easy";
  $("fXp").value = mission.xp ?? 0;
  $("fCoins").value = mission.coins ?? 0;
  $("fDesc").value = mission.description || "";
  $("fPayload").value = mission.payload || "";
  $("fHint").value = mission.hint || "";
  $("fAnswer").value = mission.answer || "";
}

async function save(item) {
  const url = IS_BOUNTY ? API.bounties : API.missions;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(res.status);
  } catch (e) {
    console.warn("API unavailable, saving locally", e);
  }

  if (IS_BOUNTY) CIPHER.saveBounty(item);
  else CIPHER.saveMission(item);

  window.location.href = LIST_PAGE;
}

(async function init() {
  applyType();
  me = CIPHER.me(await getJSON(API.me, me));
  $("navAgent").textContent = me.name;

  if (!CIPHER.isLoggedIn()) {
    showError("Log in to create a mission or post a bounty.");
    $("createForm").querySelectorAll("input, select, textarea, button").forEach((field) => {
      field.disabled = true;
    });
    return;
  }

  if (IS_EDIT) {
    const mission = CIPHER.findMission(EDIT_ID);
    if (!mission) return showError("Mission not found.");
    fillMission(mission);
  }

  $("createForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const item = IS_BOUNTY ? buildBounty() : buildMission();
    if (!item) return;

    $("btnSubmit").disabled = true;
    $("btnSubmit").textContent = "Saving...";
    await save(item);
  });
})();
