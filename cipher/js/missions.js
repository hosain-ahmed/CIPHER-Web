// PHP connector

const API ={
    me: "/api/me", //this for my personal info
    missions: "/api/missions", // this for the missions info
};

const PAGE_SIZE =8;

//MOCK DATA FOR FRONTEND PRESENTATION

const MOCK = {
  me: { name: "0xK3Y_N0D3", role: (function(){ try { return localStorage.getItem("cipherRole") || "admin"; } catch (e) { return "admin"; } })(), xp: 450, coins: 65 },
  missions: [
    { id: "C-101", title: "Caesar's First Shift", subtitle: "Affine & modular shift vectors", category: "Cryptography", difficulty: "Easy", xp: 50, coins: 15, solved: true },
    { id: "B-204", title: "Header Traversal Injection", subtitle: "CRLF protocol desynchronization", category: "Web Security", difficulty: "Medium", xp: 120, coins: 40, solved: false },
    { id: "L-302", title: "Boolean Satisfiability Gate", subtitle: "3-CNF formula solver & truth tables", category: "Logic", difficulty: "Medium", xp: 150, coins: 45, solved: true },
    { id: "R-410", title: "ARM Thumb Disassembly Trace", subtitle: "Dynamic binary instrumentation & registers", category: "Reverse Engineering", difficulty: "Hard", xp: 280, coins: 90, solved: false },
    { id: "F-108", title: "Pcap DNS Exfiltration Stream", subtitle: "Base32 tunnel payload reconstruction", category: "Forensics", difficulty: "Easy", xp: 60, coins: 20, solved: false },
    { id: "C-105", title: "Vigenère Polyalphabetic Stream", subtitle: "Kasiski examination & index of coincidence", category: "Cryptography", difficulty: "Medium", xp: 140, coins: 35, solved: false },
    { id: "W-202", title: "Cookie Tampering & Deserialization", subtitle: "Python pickle gadget chains execution", category: "Web Security", difficulty: "Hard", xp: 250, coins: 80, solved: false },
    { id: "L-305", title: "Finite State Machine Reachability", subtitle: "NFA to DFA state minimization", category: "Logic", difficulty: "Easy", xp: 75, coins: 25, solved: true },
  ],
};

//State of the progress

const state = {me: null, missions: [], page:1};
const $ = (id) => document.getElementById(id);

//Helper Functions

function esc(s){
    return String(s).replace(/[&<>"'"]/g, (c)=>
    ({"&": "&amp;", "<": "&alt;", ">":"&gt;", '"': "&quot;" , "'" : "&#39;"}[c]));
}

async function getJSON(url,fallback){
    try{
        const res= await fetch(url, {credentials: "same-origin"});
        if (!res.ok) throw new Error(res.status);
        return await res.json();
    }
    catch (e){
        console.warn("API failed, using mock for", url,e);
        return fallback;
    }
}

function getFiltered(){
    const q = $("fSearch").value.trim().toLowerCase();
    const cat = $("fCategory").value;
    const diff = $("fDifficulty").value;
    const st= $("fStatus").value;

    return state.missions.filter((m) => {
        if (q && !(m.title.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))) return false;
        if (cat && m.category !== cat) return false;
        if (diff && m.difficulty !== diff) return false;
        if (st && (st === "solved") !== m.solved) return false;
        return true;
    });
}

function renderStats(){
    const solved = state.missions.filter((m)=> m.solved).length;
    $("navAgent").textContent = state.me.name;
    $("agentStats").innerHTML= 
    `<span>AGENT : <b>${esc(state.me.name)}</b></span>`+
    `<span>XP: ${esc(state.me.xp)}</span>` +
    `<span>COINS: ${esc(state.me.coins)}</span>` +
    `<span>SOLVED: <b>${solved} / ${state.missions.length}</b></span>`;
}

function renderRows() {
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (state.page > pages) state.page = pages;
  const start = (state.page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  $("missionRows").innerHTML = slice.length
    ? slice.map((m) => `
      <tr>
        <td class="mono"><a href="mission.html?id=${encodeURIComponent(m.id)}">${esc(m.id)}</a></td>
        <td>
          <a class="title-link" href="mission.html?id=${encodeURIComponent(m.id)}">${esc(m.title)}</a>
          <span class="secondary-text mono">${esc(m.subtitle)}</span>
        </td>
        <td>${esc(m.category)}</td>
        <td><span class="badge badge-${esc(m.difficulty.toLowerCase())}">${esc(m.difficulty.toUpperCase())}</span></td>
        <td class="num">${esc(m.xp)}</td>
        <td class="num text-negative">${esc(m.coins)}</td>
        <td>${m.solved
          ? '<span class="status-solved">&#10003; SOLVED</span>'
          : `<a class="btn btn-solve" href="mission.html?id=${encodeURIComponent(m.id)}">Solve &rarr;</a>`}</td>
      </tr>`).join("")
    : `<tr><td colspan="7" class="muted">No missions match these filters.</td></tr>`;

  $("showing").textContent = list.length
    ? `Showing ${start + 1}-${start + slice.length} of ${list.length} missions`
    : "Showing 0 missions";

  renderPagination(pages);
}

function renderPagination(pages) {
  let html = `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>&lt; Prev</button>`;
  for (let p = 1; p <= pages; p++) {
    html += `<button data-page="${p}" class="${p === state.page ? "active" : ""}">${p}</button>`;
  }
  html += `<button data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>Next &gt;</button>`;
  $("pagination").innerHTML = html;
}

function fillCategoryDropdown() {
  const cats = [...new Set(state.missions.map((m) => m.category))].sort();
  $("fCategory").innerHTML = '<option value="">All Categories</option>' +
    cats.map((c) => `<option>${esc(c)}</option>`).join("");
}

function applyRole() {
  const isAdmin = state.me.role === "admin";
  document.querySelectorAll("[data-admin]").forEach((el) => { el.hidden = !isAdmin; });
}

function wireEvents() {
  ["fSearch", "fCategory", "fDifficulty", "fStatus"].forEach((id) =>
    $(id).addEventListener("input", () => { state.page = 1; renderRows(); }));

  $("pagination").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    renderRows();
  });

  $("btnReset").addEventListener("click", () => {
    ["fSearch", "fCategory", "fDifficulty", "fStatus"].forEach((id) => { $(id).value = ""; });
    state.page = 1;
    renderRows();
  });

  $("btnCreate").addEventListener("click", () => {
    window.location.href = "create-mission.html";
  });
}

(async function init() {
  state.me = await getJSON(API.me, MOCK.me);
  state.missions = await getJSON(API.missions, MOCK.missions);

  applyRole();
  fillCategoryDropdown();
  renderStats();
  renderRows();
  wireEvents();
})();
