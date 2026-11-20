const API = {
  me:      "/api/me",
  mission: "/api/mission?id=",
  bounty:  "/api/bounty?id=",
  submit:  "/api/submit",
};

const TYPE = document.body.dataset.type === "bounty" ? "bounty" : "mission";
const $ = (id) => document.getElementById(id);
let me;

function getRole() { try { return localStorage.getItem("cipherRole"); } catch (e) { return null; } }
function setRole(r) { try { localStorage.setItem("cipherRole", r); } catch (e) {} }

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

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function applyRole() {
  document.querySelectorAll("[data-admin]").forEach((el) => {
    el.hidden = me.role !== "admin";
  });
  const switcher = $("roleSwitch");
  if (switcher) {
    switcher.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("active", b.dataset.role === me.role));
  }
}

function showError(msg) {
  const box = $("missionError");
  if (!box) return;
  box.textContent = msg;
  box.hidden = false;
}

function showAlert(id, ok, msg) {
  const box = $(id);
  if (!box) return;
  box.className = "alert " + (ok ? "alert-success" : "alert-error");
  box.textContent = msg;
  box.hidden = false;
}

function renderMission(mission) {
  document.title = `${mission.id} | CIPHER`;
  setText("mTitle", `${mission.id}: ${mission.title}`);
  setText("mMeta", `${mission.category || "-"} · ${mission.difficulty || "-"} · ${mission.xp || 0} XP · ${mission.coins || 0} Coins`);
  setText("mDesc", mission.description || "No further details were provided for this mission.");
  setText("mPayload", mission.payload || "");
  setText("mHint", mission.hint || "No hint for this mission.");
  if ($("missionBody")) $("missionBody").hidden = false;
}

function renderBounty(bounty) {
  document.title = `${bounty.title || bounty.id} | CIPHER`;
  setText("mTitle", bounty.title || "Bounty");
  setText("mMeta", `Posted by ${bounty.postedBy || "-"} · ${bounty.reward || 0} Coins · ${bounty.status === "claimed" ? "Claimed" : "Open"}`);
  setText("mDesc", bounty.description || "No further details were provided for this bounty.");
  if ($("missionBody")) $("missionBody").hidden = false;
  wireClaim(bounty);
}

function wireClaim(bounty) {
  const btn = $("btnClaim");
  if (!btn) return;

  const isMine = String(bounty.postedBy || "").toLowerCase() === String(me.name || "").toLowerCase();
  const claimed = bounty.status === "claimed";

  btn.disabled = claimed || isMine;
  btn.textContent = claimed ? "Claimed" : isMine ? "Your bounty" : "Claim bounty";

  btn.onclick = () => {
    if (!confirm("Claim this bounty?")) return;
    const updated = { ...bounty, status: "claimed" };
    CIPHER.saveBounty(updated);
    renderBounty(updated);
    showAlert("claimResult", true, "Bounty claimed. It is now marked as claimed in the bounty list.");
  };
}

function wireMission(mission) {
  $("btnHint").addEventListener("click", () => {
    const box = $("mHint");
    box.hidden = !box.hidden;
    $("btnHint").textContent = box.hidden ? "Show hint" : "Hide hint";
  });

  $("answerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const answer = $("answer").value.trim();
    if (!answer) return;

    try {
      const res = await fetch(API.submit, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: mission.id, answer }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      showAlert("result", data.correct, data.message || (data.correct ? "Correct!" : "Incorrect, try again."));
    } catch (err) {
      const local = CIPHER.findMission(mission.id);
      const expected = mission.answer || (local && local.answer);
      const ok = expected && answer.toUpperCase() === String(expected).toUpperCase();
      showAlert("result", !!ok, ok ? `Correct! +${mission.xp} XP, +${mission.coins} coins.` : "Incorrect, try again.");
    }
  });

  $("btnEdit").addEventListener("click", () => { location.href = "missions.html"; });
  $("btnDelete").addEventListener("click", () => {
    if (confirm("Delete this mission?")) { location.href = "missions.html"; }
  });
}

async function initMission(id) {
  const fallback = CIPHER.findMission(id) || {
    id,
    title: "Mission details not added yet",
    category: "-",
    difficulty: "-",
    xp: 0,
    coins: 0,
    description: "This mission has no demo data yet. It will load from the server later.",
    payload: "",
    hint: "",
  };
  const mission = await getJSON(API.mission + encodeURIComponent(id), fallback);
  if (!mission) return showError("Mission not found.");
  renderMission(mission);
  wireMission(mission);
}

async function initBounty(id) {
  const fallback = CIPHER.findBounty(id) || {
    id,
    title: "Bounty details not added yet",
    postedBy: "-",
    reward: 0,
    status: "open",
    description: "No further details were provided for this bounty.",
  };
  const bounty = await getJSON(API.bounty + encodeURIComponent(id), fallback);
  if (!bounty) return showError("Bounty not found.");
  const local = CIPHER.findBounty(id);
  if (local && local.status) bounty.status = local.status;
  renderBounty(bounty);
}

(async function init() {
  const id = new URLSearchParams(location.search).get("id");
  me = await getJSON(API.me, {
    ...CIPHER_DATA.me,
    role: getRole() || "admin",
  });
  setText("navAgent", me.name);
  applyRole();

  if (!id) return showError(`No ${TYPE} selected. Go back and pick one.`);

  if (TYPE === "bounty") await initBounty(id);
  else await initMission(id);

  const switcher = $("roleSwitch");
  if (switcher) {
    switcher.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-role]");
      if (!b) return;
      me.role = b.dataset.role;
      setRole(me.role);
      applyRole();
    });
  }
})();
