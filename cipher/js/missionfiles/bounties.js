const API = {
    me: "/api/me",
    bounties: "/api/bounties",
};

const PAGE_SIZE =5;

const MOCK_ME = CIPHER_DATA.me;
const MOCK_BOUNTIES = CIPHER_DATA.bounties;

const $ = (id) => document.getElementById(id);
const state = { me: null, bounties: [], tab: "browse", page: 1 };

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
    return fallback;
  }
}

function getFiltered() {
  const q = $("fSearch").value.trim().toLowerCase();
  const st = $("fStatus").value;
  return state.bounties.filter((b) =>
    (state.tab === "browse" || b.postedBy === state.me.name) &&
    (!q || b.title.toLowerCase().includes(q) || b.postedBy.toLowerCase().includes(q)) &&
    (!st || b.status === st)
  );
}

function renderHeader() {
  const text = `${state.me.coins} Coins`;
  $("navAgent").textContent = state.me.name;
  $("navCoins").textContent = text;
  $("balance").textContent = text;
}

function renderRows() {
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (state.page > pages) state.page = pages;
  const start = (state.page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  const empty = state.tab === "mine"
    ? "You haven't posted any bounties yet."
    : "No bounties match these filters.";

  $("bountyRows").innerHTML = slice.length
    ? slice.map((b) => {
        const claimed = b.status === "claimed";
        return `
        <tr class="${claimed ? "is-claimed" : ""}">
          <td class="item-name">${esc(b.title)}</td>
          <td class="mono muted">${esc(b.postedBy)}</td>
          <td class="mono reward">${esc(b.reward)} Coins</td>
          <td><span class="bstatus ${claimed ? "bstatus-claimed" : "bstatus-open"}">${claimed ? "Claimed" : "Open"}</span></td>
          <td class="num"><a class="view-link" href="bounty.html?id=${encodeURIComponent(b.id)}">View bounty</a></td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="5" class="muted">${empty}</td></tr>`;

  $("showing").innerHTML = list.length
    ? `Showing <strong>${start + 1}-${start + slice.length}</strong> of <strong>${list.length}</strong> bounties`
    : "Showing 0 bounties";

  renderPagination(pages);
}

function renderPagination(pages) {
  let html = `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>Prev</button>`;
  for (let p = 1; p <= pages; p++) {
    html += `<button data-page="${p}" class="${p === state.page ? "active" : ""}">${p}</button>`;
  }
  html += `<button data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>Next</button>`;
  $("pagination").innerHTML = html;
}

function wireEvents() {
  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    state.tab = b.dataset.tab;
    state.page = 1;
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("active", x === b));
    renderRows();
  });

  ["fSearch", "fStatus"].forEach((id) =>
    $(id).addEventListener("input", () => { state.page = 1; renderRows(); }));

  $("pagination").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    renderRows();
  });
}

(async function init() {
  state.me = await getJSON(API.me, MOCK_ME);
  state.bounties = CIPHER.bounties(await getJSON(API.bounties, MOCK_BOUNTIES));
  renderHeader();
  renderRows();
  wireEvents();
})();