// Leaderboard Search
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


// Agents Search and Filter
function searchUser() {

    let search = document.getElementById("search").value.toLowerCase();
    let role = document.getElementById("role").value;
    let rows = document.getElementById("agents").rows;

    for (let i = 1; i < rows.length; i++) {

        let name = rows[i].cells[0].innerText.toLowerCase();
        let userRole = rows[i].cells[2].innerText;

        if (name.includes(search) &&
            (role == "All" || role == userRole)) {

            rows[i].style.display = "";

        } else {
            rows[i].style.display = "none";
        }
    }
}


// Filter by Role
function filterRole() {
    searchUser();
}


// Add New Agent
function addUser() {

    let name = prompt("Enter codename:");
    if (!name) return;

    let email = prompt("Enter email:");
    if (!email) return;

    let table = document.getElementById("agents");
    let row = table.insertRow();

    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = email;
    row.insertCell(2).innerText = "Agent";
    row.insertCell(3).innerText = "Active";

    row.insertCell(4).innerHTML =
        '<button onclick="manageUser(this)">Manage</button>';

    searchUser();

    alert("User added successfully!");
}


// Change Agent Status
function manageUser(button) {

    let row = button.parentElement.parentElement;
    let status = row.cells[3];

    if (status.innerText == "Active") {
        status.innerText = "Locked";
    } else {
        status.innerText = "Active";
    }

    alert("Status updated!");
}


// Activity Log Search and Filter
function filterLog() {

    let search = document.getElementById("search").value.toLowerCase();
    let event = document.getElementById("event").value;
    let rows = document.getElementById("logs").rows;

    for (let i = 1; i < rows.length; i++) {

        let name = rows[i].cells[1].innerText.toLowerCase();
        let type = rows[i].cells[2].innerText;

        if (name.includes(search) &&
            (event == "All" || event == type)) {

            rows[i].style.display = "";

        } else {
            rows[i].style.display = "none";
        }
    }
}


// Clear Activity Filters
function clearFilter() {

    document.getElementById("search").value = "";
    document.getElementById("event").value = "All";

    filterLog();
}
