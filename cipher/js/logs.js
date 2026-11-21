const state = {
    entries: []
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

function formatTime(value) {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function formatAmount(value) {
    const number = Number(value) || 0;

    if (number > 0) {
        return "+" + number;
    }

    return String(number);
}

function getFiltered() {
    const search = $("search").value.trim().toLowerCase();
    const event = $("event").value;

    return state.entries.filter(function (entry) {
        const matchesSearch =
            !search ||
            entry.event.toLowerCase().includes(search) ||
            entry.details.toLowerCase().includes(search);
        const matchesEvent = event === "All" || entry.event === event;

        return matchesSearch && matchesEvent;
    });
}

function renderRows() {
    const entries = getFiltered();

    if (entries.length === 0) {
        $("logRows").innerHTML =
            '<tr><td colspan="6" class="muted">No activity yet.</td></tr>';
        return;
    }

    $("logRows").innerHTML = entries.map(function (entry) {
        return `
            <tr>
                <td>${esc(formatTime(entry.time))}</td>
                <td>${esc(entry.agent)}</td>
                <td>${esc(entry.event)}</td>
                <td>${esc(entry.details)}</td>
                <td>${esc(formatAmount(entry.xp))}</td>
                <td>${esc(formatAmount(entry.coins))}</td>
            </tr>`;
    }).join("");
}

function wireEvents() {
    $("search").addEventListener("input", renderRows);
    $("event").addEventListener("change", renderRows);

    $("clearFilter").addEventListener("click", function () {
        $("search").value = "";
        $("event").value = "All";
        renderRows();
    });
}

function init() {
    if (!CIPHER.isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    state.entries = CIPHER.history();
    renderRows();
    wireEvents();
}

init();
