let trainees = JSON.parse(localStorage.getItem("trainees")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];

function save() {
    localStorage.setItem("trainees", JSON.stringify(trainees));
    localStorage.setItem("records", JSON.stringify(records));
}

function addTrainee() {
    const name = document.getElementById("nameInput").value.trim();
    if (name === "" || trainees.includes(name)) return;

    trainees.push(name);
    document.getElementById("nameInput").value = "";
    save();
    renderSelect();
}

function renderSelect() {
    const select = document.getElementById("traineeSelect");
    select.innerHTML = "";

    trainees.forEach(name => {
        const option = document.createElement("option");
        option.textContent = name;
        select.appendChild(option);
    });
}

function markAttendance(status) {
    const name = document.getElementById("traineeSelect").value;
    if (!name) return;

    records.push({
        name: name,
        status: status,
        date: new Date().toLocaleDateString()
    });

    save();
    renderHistory();
    updateStats();
}


function renderHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "";

    records.slice(-10).reverse().forEach(r => {
        list.innerHTML += `
        <li class="${r.status === 'حاضر' ? 'present' : 'absent'}">
            ${r.name} - ${r.status} (${r.date})
        </li>`;
    });
}

renderSelect();
renderHistory();
function updateStats() {
    const present = records.filter(r => r.status === "حاضر").length;
    const absent = records.filter(r => r.status === "غائب").length;
    const total = present + absent;

    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;

    const rate = total === 0 ? 0 : Math.round((present / total) * 100);
    document.getElementById("attendanceRate").textContent = rate + "%";
}



function exportToCSV() {
    if (records.length === 0) {
        alert("لا يوجد سجل حضور للتصدير");
        return;
    }

    let csvContent = "الاسم,الحالة,التاريخ\n";

    records.forEach(r => {
        csvContent += `"${r.name}","${r.status}","${r.date}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "سجل_الحضور.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

renderSelect();
renderHistory();
updateStats();

