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
        status: "Active"
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
})();
