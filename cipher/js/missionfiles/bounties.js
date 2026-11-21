const PAGE_SIZE = 5;

const state = {
  me: null,
  bounties: [],
  tab: "browse",
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

function getFiltered() {
  const search = $("fSearch").value.trim().toLowerCase();
  const status = $("fStatus").value;

  return state.bounties.filter(function (bounty) {
    const matchesTab =
      state.tab === "browse" || bounty.postedBy === state.me.name;
    const matchesSearch =
      !search ||
      bounty.title.toLowerCase().includes(search) ||
      bounty.postedBy.toLowerCase().includes(search);
    const matchesStatus = !status || bounty.status === status;

    return matchesTab && matchesSearch && matchesStatus;
  });
}

function renderHeader() {
  const coinText = state.me.coins + " Coins";

  $("navAgent").textContent = state.me.name;
  $("navCoins").textContent = coinText;
  $("balance").textContent = coinText;

  const postButton = document.querySelector('a.btn-primary[href^="create.html"]');
  if (postButton) {
    postButton.hidden = !CIPHER.isLoggedIn();
  }
}

function renderRows() {
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  if (state.page > pages) {
    state.page = pages;
  }

  const start = (state.page - 1) * PAGE_SIZE;
  const visibleBounties = list.slice(start, start + PAGE_SIZE);

  if (visibleBounties.length === 0) {
    const emptyMessage = state.tab === "mine"
      ? "You haven't posted any bounties yet."
      : "No bounties match these filters.";
    $("bountyRows").innerHTML =
      `<tr><td colspan="5" class="muted">${emptyMessage}</td></tr>`;
  } else {
    $("bountyRows").innerHTML = visibleBounties.map(function (bounty) {
      const claimed = bounty.status === "claimed";
      const rowClass = claimed ? "is-claimed" : "";
      const statusClass = claimed ? "bstatus-claimed" : "bstatus-open";
      const statusText = claimed ? "Claimed" : "Open";

      return `
        <tr class="${rowClass}">
          <td class="item-name">${esc(bounty.title)}</td>
          <td class="mono muted">${esc(bounty.postedBy)}</td>
          <td class="mono reward">${esc(bounty.reward)} Coins</td>
          <td><span class="bstatus ${statusClass}">${statusText}</span></td>
          <td class="num"><a class="view-link" href="bounty.html?id=${encodeURIComponent(bounty.id)}">View bounty</a></td>
        </tr>`;
    }).join("");
  }

  if (list.length === 0) {
    $("showing").textContent = "Showing 0 bounties";
  } else {
    $("showing").innerHTML =
      `Showing <strong>${start + 1}-${start + visibleBounties.length}</strong> of <strong>${list.length}</strong> bounties`;
  }

  renderPagination(pages);
}

function renderPagination(pages) {
  let html = "";

  if (state.page === 1) {
    html += '<button data-page="' + (state.page - 1) + '" disabled>Prev</button>';
  } else {
    html += '<button data-page="' + (state.page - 1) + '">Prev</button>';
  }

  for (let page = 1; page <= pages; page++) {
    if (page === state.page) {
      html += '<button data-page="' + page + '" class="active">' + page + "</button>";
    } else {
      html += '<button data-page="' + page + '">' + page + "</button>";
    }
  }

  if (state.page === pages) {
    html += '<button data-page="' + (state.page + 1) + '" disabled>Next</button>';
  } else {
    html += '<button data-page="' + (state.page + 1) + '">Next</button>';
  }

  $("pagination").innerHTML = html;
}

function wireEvents() {
  $("tabs").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-tab]");

    if (!button) {
      return;
    }

    state.tab = button.dataset.tab;
    state.page = 1;

    document.querySelectorAll("#tabs button").forEach(function (tabButton) {
      tabButton.classList.toggle("active", tabButton === button);
    });

    renderRows();
  });

  const filterIds = ["fSearch", "fStatus"];
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
}

function init() {
  state.me = CIPHER.me();
  state.bounties = CIPHER.bounties();

  renderHeader();
  renderRows();
  wireEvents();
}

init();
