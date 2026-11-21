const PAGE_SIZE = 8;

const state = {
  me: null,
  missions: [],
  page: 1
};

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function isSolved(mission) {
  return CIPHER.isLoggedIn() && CIPHER.isSolved(mission.id);
}

function getFiltered() {
  const search = $("fSearch").value.trim().toLowerCase();
  const category = $("fCategory").value;
  const difficulty = $("fDifficulty").value;
  const status = $("fStatus").value;

  return state.missions.filter(function (mission) {
    const matchesSearch =
      !search ||
      mission.title.toLowerCase().includes(search) ||
      mission.id.toLowerCase().includes(search);

    const matchesCategory = !category || mission.category === category;
    const matchesDifficulty = !difficulty || mission.difficulty === difficulty;
    const matchesStatus = !status || (status === "solved") === isSolved(mission);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });
}

function renderStats() {
  const solvedCount = state.missions.filter(isSolved).length;

  $("navAgent").textContent = state.me.name;
  $("agentStats").innerHTML =
    `<span>AGENT : <b>${esc(state.me.name)}</b></span>` +
    `<span>XP: ${esc(state.me.xp)}</span>` +
    `<span>COINS: ${esc(state.me.coins)}</span>` +
    `<span>SOLVED: <b>${solvedCount} / ${state.missions.length}</b></span>`;
}

function renderRows() {
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  if (state.page > pages) {
    state.page = pages;
  }

  const start = (state.page - 1) * PAGE_SIZE;
  const visibleMissions = list.slice(start, start + PAGE_SIZE);

  if (visibleMissions.length === 0) {
    $("missionRows").innerHTML =
      '<tr><td colspan="7" class="muted">No missions match these filters.</td></tr>';
  } else {
    $("missionRows").innerHTML = visibleMissions.map(function (mission) {
      const solved = isSolved(mission);
      const statusHtml = solved
        ? '<span class="status-solved">&#10003; SOLVED</span>'
        : `<a class="btn btn-solve" href="mission.html?id=${encodeURIComponent(mission.id)}">Solve &rarr;</a>`;

      return `
        <tr>
          <td class="mono"><a href="mission.html?id=${encodeURIComponent(mission.id)}">${esc(mission.id)}</a></td>
          <td>
            <a class="title-link" href="mission.html?id=${encodeURIComponent(mission.id)}">${esc(mission.title)}</a>
            <span class="secondary-text mono">${esc(mission.subtitle)}</span>
          </td>
          <td>${esc(mission.category)}</td>
          <td><span class="badge badge-${esc(mission.difficulty.toLowerCase())}">${esc(mission.difficulty.toUpperCase())}</span></td>
          <td class="num">${esc(mission.xp)}</td>
          <td class="num text-negative">${esc(mission.coins)}</td>
          <td>${statusHtml}</td>
        </tr>`;
    }).join("");
  }

  if (list.length === 0) {
    $("showing").textContent = "Showing 0 missions";
  } else {
    $("showing").textContent =
      `Showing ${start + 1}-${start + visibleMissions.length} of ${list.length} missions`;
  }

  renderPagination(pages);
}

function renderPagination(pages) {
  let html = "";

  if (state.page === 1) {
    html += '<button data-page="' + (state.page - 1) + '" disabled>&lt; Prev</button>';
  } else {
    html += '<button data-page="' + (state.page - 1) + '">&lt; Prev</button>';
  }

  for (let page = 1; page <= pages; page++) {
    if (page === state.page) {
      html += '<button data-page="' + page + '" class="active">' + page + "</button>";
    } else {
      html += '<button data-page="' + page + '">' + page + "</button>";
    }
  }

  if (state.page === pages) {
    html += '<button data-page="' + (state.page + 1) + '" disabled>Next &gt;</button>';
  } else {
    html += '<button data-page="' + (state.page + 1) + '">Next &gt;</button>';
  }

  $("pagination").innerHTML = html;
}

function fillCategoryDropdown() {
  const categories = state.missions.map(function (mission) {
    return mission.category;
  });

  const uniqueCategories = [];
  categories.forEach(function (category) {
    if (!uniqueCategories.includes(category)) {
      uniqueCategories.push(category);
    }
  });
  uniqueCategories.sort();

  let options = '<option value="">All Categories</option>';
  uniqueCategories.forEach(function (category) {
    options += `<option>${esc(category)}</option>`;
  });
  $("fCategory").innerHTML = options;
}

function applyRole() {
  const isAdmin = state.me.role === "admin";

  document.querySelectorAll("[data-admin]").forEach(function (element) {
    element.hidden = !isAdmin;
  });
}

function wireEvents() {
  const filterIds = ["fSearch", "fCategory", "fDifficulty", "fStatus"];

  filterIds.forEach(function (id) {
    $(id).addEventListener("input", function () {
      state.page = 1;
      renderRows();
    });
  });

  $("pagination").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-page]");

    if (!button || button.disabled) {
      return;
    }

    state.page = Number(button.dataset.page);
    renderRows();
  });

  $("btnReset").addEventListener("click", function () {
    filterIds.forEach(function (id) {
      $(id).value = "";
    });
    state.page = 1;
    renderRows();
  });

  $("btnCreate").addEventListener("click", function () {
    window.location.href = "create.html?type=mission";
  });
}

function init() {
  state.me = CIPHER.me();
  state.missions = CIPHER.missions();

  applyRole();
  fillCategoryDropdown();
  renderStats();
  renderRows();
  wireEvents();
}

init();
