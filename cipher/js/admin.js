function searchAgent() {
    let search = document.getElementById("search").value.toLowerCase();
    let rows = document.getElementById("leaderboard").rows;

    for (let i = 1; i < rows.length; i++) {
        let name = rows[i].cells[1].innerText.toLowerCase();

        if (name.includes(search)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

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

function renderAgents() {
    const users = CIPHER.users();

    if (users.length === 0) {
        document.getElementById("agentRows").innerHTML =
            '<tr><td colspan="5" class="muted">No agents found.</td></tr>';
        return;
    }

    document.getElementById("agentRows").innerHTML = users.map(function (user) {
        const role = user.role === "admin" ? "Admin" : "Agent";
        const status = user.status || "Active";
        const protectedUser =
            user.codename.toLowerCase() === CIPHER_DATA.admin.codename.toLowerCase();

        let actionButtons = "";

        if (protectedUser) {
            actionButtons = '<button disabled>Protected</button>';
        } else {
            const statusLabel = status === "Active" ? "Lock" : "Activate";
            const roleLabel = role === "Admin" ? "Remove Admin" : "Make Admin";

            actionButtons =
                '<button onclick="manageUser(this)">' + statusLabel + "</button> " +
                '<button onclick="promoteUser(this)">' + roleLabel + "</button>";
        }

        return `
            <tr data-codename="${esc(user.codename)}">
                <td>${esc(user.codename)}</td>
                <td>${esc(user.email)}</td>
                <td>${role}</td>
                <td>${status}</td>
                <td>${actionButtons}</td>
            </tr>`;
    }).join("");
}

function searchUser() {
    let search = document.getElementById("search").value.toLowerCase();
    let role = document.getElementById("role").value;
    let rows = document.getElementById("agents").rows;

    for (let i = 1; i < rows.length; i++) {
        let name = rows[i].cells[0].innerText.toLowerCase();
        let userRole = rows[i].cells[2].innerText;

        if (name.includes(search) && (role === "All" || role === userRole)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

function filterRole() {
    searchUser();
}

function addUser() {
    let name = prompt("Enter codename:");
    if (!name) return;

    if (CIPHER.findUser(name)) {
        alert("That codename already exists.");
        return;
    }

    let email = prompt("Enter email:");
    if (!email) return;

    CIPHER.saveUser({
        codename: name,
        fullName: name,
        email: email,
        role: "user",
        status: "Active",
        xp: 0,
        coins: 100
    });

    renderAgents();
    searchUser();
    alert("User added successfully!");
}

function manageUser(button) {
    let row = button.closest("tr");
    let user = CIPHER.findUser(row.dataset.codename);

    if (!user) return;

    if (user.codename.toLowerCase() === CIPHER_DATA.admin.codename.toLowerCase()) {
        alert("The built-in admin account cannot be locked.");
        return;
    }

    user.status = user.status === "Active" ? "Locked" : "Active";
    CIPHER.saveUser(user);
    renderAgents();
    searchUser();
    alert("Status updated!");
}

function promoteUser(button) {
    let row = button.closest("tr");
    let user = CIPHER.findUser(row.dataset.codename);

    if (!user) return;

    if (user.codename.toLowerCase() === CIPHER_DATA.admin.codename.toLowerCase()) {
        alert("The built-in admin account cannot be changed.");
        return;
    }

    user.role = user.role === "admin" ? "user" : "admin";
    CIPHER.saveUser(user);
    renderAgents();
    searchUser();
    alert("Role updated!");
}

function getTier(xp) {
    if (xp >= 2400) return "Master";
    if (xp >= 1800) return "Specialist";
    if (xp >= 400) return "Candidate";
    if (xp >= 300) return "Pupil";
    return "Newbie";
}

function isToday(value) {
    const date = new Date(value);
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
}

function formatTime(value) {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function renderDashboard() {
    const users = CIPHER.users();
    const missions = CIPHER.missions();
    const logs = CIPHER.activityLog();

    document.getElementById("totalAgents").textContent = users.length;
    document.getElementById("totalMissions").textContent = missions.length;

    const solvedToday = logs.filter(function (entry) {
        return entry.event === "Mission Solved" && isToday(entry.time);
    });
    document.getElementById("solvedToday").textContent = solvedToday.length;

    const recent = logs.slice(0, 5);

    if (recent.length === 0) {
        document.getElementById("recentActivity").innerHTML =
            '<tr><td colspan="3" class="muted">No activity yet.</td></tr>';
    } else {
        document.getElementById("recentActivity").innerHTML = recent.map(function (entry) {
            return `
                <tr>
                    <td>${esc(formatTime(entry.time))}</td>
                    <td>${esc(entry.agent)}</td>
                    <td>${esc(entry.event + ": " + entry.details)}</td>
                </tr>`;
        }).join("");
    }

    const topUsers = users.slice().sort(function (a, b) {
        return (b.xp || 0) - (a.xp || 0);
    }).slice(0, 3);

    if (topUsers.length === 0) {
        document.getElementById("topAgents").innerHTML =
            '<tr><td colspan="3" class="muted">No agents yet.</td></tr>';
    } else {
        document.getElementById("topAgents").innerHTML = topUsers.map(function (user, index) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${esc(user.codename)}</td>
                    <td>${esc(user.xp || 0)}</td>
                </tr>`;
        }).join("");
    }
}

function renderLeaderboard() {
    const users = CIPHER.users();
    const sorted = users.slice().sort(function (a, b) {
        return (b.xp || 0) - (a.xp || 0);
    });

    document.getElementById("leaderboardAgentCount").textContent = users.length;

    let minimumXp = 0;
    if (users.length > 0) {
        minimumXp = Math.min.apply(null, users.map(function (user) {
            return user.xp || 0;
        }));
    }
    document.getElementById("leaderboardMinXp").textContent = minimumXp + " XP";

    if (sorted.length === 0) {
        document.getElementById("leaderboardRows").innerHTML =
            '<tr><td colspan="5" class="muted">No agents yet.</td></tr>';
        return;
    }

    document.getElementById("leaderboardRows").innerHTML = sorted.map(function (user, index) {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${esc(user.codename)}</td>
                <td>${esc(getTier(user.xp || 0))}</td>
                <td>${esc(user.xp || 0)}</td>
                <td>${esc(CIPHER.solvedCount(user.codename))}</td>
            </tr>`;
    }).join("");
}

function initAdminHeader() {
    if (document.body.hasAttribute("data-admin-page") &&
        CIPHER.me().role !== "admin") {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

(function init() {
    if (!initAdminHeader()) return;

    if (document.getElementById("agents")) {
        renderAgents();
    }

    if (document.getElementById("totalAgents")) {
        renderDashboard();
    }

    if (document.getElementById("leaderboard")) {
        renderLeaderboard();
    }
})();
