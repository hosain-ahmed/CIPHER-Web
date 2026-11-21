const API = {
  me:    "/api/me",    
  items: "/api/shop",   
  buy:   "/api/buy",   
};

const MOCK_ME = CIPHER_DATA.me;
const MOCK_ITEMS = [
  { id: 1, name: "Ghost Protocol", effect: "Hide your activity and solve attempts from public logs for 24 hours.", price: 40 },
  { id: 2, name: "Mission Skip",   effect: "Unlock the next mission without completing the prerequisite challenge.", price: 50 },
  { id: 3, name: "XP Boost",       effect: "Earn 25% bonus XP on your next three verified mission solves.", price: 30 },
  { id: 4, name: "Bounty Rush",    effect: "Reduce cool-down time between consecutive bounty submissions.", price: 25 },
];

const $ = (id) => document.getElementById(id);
const state = { me: null, items: [] };
let usingMock = false;   

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function getJSON(url, fallback) {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn("API failed, using mock for", url, e);
    usingMock = true;
    return fallback;
  }
}

function renderBalance() {
  const text = `${state.me.coins} Coins`;
  $("navAgent").textContent = state.me.name;
  $("navCoins").textContent = text;
  $("balance").textContent = text;
}

function renderRows() {
  $("shopRows").innerHTML = state.items.length
    ? state.items.map((it) => {
        const cantAfford = it.price > state.me.coins;
        const unavailable = !CIPHER.isLoggedIn() ? "Log in to buy" : cantAfford ? "Not enough coins" : "";
        return `
        <tr>
          <td class="item-name">${esc(it.name)}</td>
          <td class="muted">${esc(it.effect)}</td>
          <td class="num mono">${esc(it.price)} Coins</td>
          <td class="num">
            <button class="btn btn-primary btn-buy" data-id="${esc(it.id)}"
              ${unavailable ? `disabled title="${unavailable}"` : ""}>Buy</button>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="4" class="muted">The shop is empty right now.</td></tr>`;
}

function showMsg(ok, text) {
  const box = $("shopMsg");
  box.className = "alert " + (ok ? "alert-success" : "alert-error");
  box.textContent = text;
  box.hidden = false;
}


async function buy(itemId) {
  if (!CIPHER.isLoggedIn()) {
    return showMsg(false, "Log in to buy items.");
  }

  const item = state.items.find((i) => String(i.id) === String(itemId));
  if (!item) return;

  if (usingMock) {

    if (state.me.coins < item.price) return showMsg(false, "Not enough coins.");
    state.me.coins -= item.price;
    showMsg(true, `Purchased ${item.name}.`);
  } else {
    try {
      const res = await fetch(API.buy, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return showMsg(false, data.message || "Purchase failed.");
      state.me.coins = data.coins;                
      showMsg(true, data.message || `Purchased ${item.name}.`);
    } catch (e) {
      return showMsg(false, "Could not reach the server. Try again.");
    }
  }
  renderBalance();
  renderRows();
}


(async function init() {
  state.me = CIPHER.me(await getJSON(API.me, MOCK_ME));
  state.items = await getJSON(API.items, MOCK_ITEMS);
  renderBalance();
  renderRows();

  $("shopRows").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-buy");
    if (btn && !btn.disabled) buy(btn.dataset.id);
  });
})();