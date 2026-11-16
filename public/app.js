//Basic CRUD pages for the existing API
const type = document.body.dataset.entity;
const idField = document.body.dataset.id;
const labelField = document.body.dataset.label;
const form = document.getElementById("recordForm");
const tokenInput = document.getElementById("token");
let editingId = null;

tokenInput.value = sessionStorage.getItem("directoryToken") || "";

function message(text) {
    document.getElementById("message").textContent = text;
}

// [AI-G6] fetch() sends AJAX requests to the existing API without reloading the page.
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
async function api(method, endpoint, data) {
    const token = tokenInput.value.trim();
    if (!token) {
        throw new Error("Enter your API token first.");
    }

    const options = {
        method: method,
        headers: { Authorization: "Bearer " + token }
    };

    if (data !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const response = await fetch("/api/" + endpoint, options);
    if (response.status === 204) {
        return null;
    }

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || "Request failed");
    }
    return result;
}

async function loadLookups() {
    const dropdowns = form.querySelectorAll("select[data-lookup]");
    for (const input of dropdowns) {
        const records = await api("GET", input.dataset.lookup);
        input.replaceChildren();
        input.add(new Option("Select one", ""));
        for (const step of records) {
            const name = step.name || step.displayName || "Record";
            input.add(new Option(name, String(step[input.name])));
        }
    }
}

async function loadRecords() {
    const records = await api("GET", type);
    const rows = document.getElementById("rows");
    rows.replaceChildren();

    for (const item of records) {
        const tr = document.createElement("tr");
        const idCell = document.createElement("td");
        idCell.textContent = item[idField];
        tr.appendChild(idCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = item[labelField];
        tr.appendChild(nameCell);

        const buttons = document.createElement("td");
        const view = document.createElement("button");
        view.textContent = "View";
        view.onclick = function() { showDetails(item[idField]); };
        buttons.appendChild(view);

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.onclick = function() { editRecord(item); };
        buttons.appendChild(edit);

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.onclick = function() { deleteRecord(item[idField]); };
        buttons.appendChild(remove);

        tr.appendChild(buttons);
        rows.appendChild(tr);
    }
    message("Loaded " + records.length + " records.");
}

async function loadAll() {
    try {
        await loadLookups();
        await loadRecords();
    } catch (error) {
        message(error.message);
    }
}

async function showDetails(id) {
    try {
        const record = await api("GET", type + "/" + id);
        document.getElementById("details").textContent = JSON.stringify(record, null, 2);
    } catch (error) {
        message(error.message);
    }
}

function clearForm() {
    editingId = null;
    form.reset();
    document.getElementById("editing").textContent = "Adding new record";
}

function editRecord(item) {
    editingId = item[idField];
    for (const input of form.querySelectorAll("[name]")) {
        let value = item[input.name];
        if (input.type === "checkbox") {
            input.checked = Boolean(value);
        } else if (input.name === "lastChecked" && value) {
            input.value = String(value).replace(" ", "T") + "Z";
        } else {
            input.value = value === null || value === undefined ? "" : value;
        }
    }
    document.getElementById("editing").textContent = "Editing ID " + editingId;
    window.scrollTo(0, 0);
}

async function deleteRecord(id) {
    if (!confirm("Delete record " + id + "?")) {
        return;
    }
    try {
        await api("DELETE", type + "/" + id);
        clearForm();
        document.getElementById("details").textContent = "Deleted record " + id;
        await loadAll();
        message("Record deleted.");
    } catch (error) {
        message(error.message);
    }
}

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const data = {};
    for (const input of form.querySelectorAll("[name]")) {
        if (input.type === "checkbox") {
            data[input.name] = input.checked;
            continue;
        }
        const value = input.value.trim();
        if (value === "") {
            if (editingId !== null && !input.required) {
                data[input.name] = null;
            }
            continue;
        }
        if (input.type === "number" || input.tagName === "SELECT") {
            data[input.name] = Number(value);
        } else {
            data[input.name] = value;
        }
    }

    try {
        let saved;
        if (editingId === null) {
            saved = await api("POST", type, data);
        } else {
            saved = await api("PATCH", type + "/" + editingId, data);
        }
        clearForm();
        document.getElementById("details").textContent = JSON.stringify(saved, null, 2);
        await loadAll();
        message("Record saved.");
    } catch (error) {
        message(error.message);
    }
});

document.getElementById("connect").onclick = function() {
    sessionStorage.setItem("directoryToken", tokenInput.value.trim());
    loadAll();
};
document.getElementById("clear").onclick = clearForm;
if (tokenInput.value) {
    loadAll();
}
