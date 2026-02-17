// ربط العناصر بالـ DOM
const nameInput = document.getElementById("nameInput");
const traineeSelect = document.getElementById("traineeSelect");
const history = document.getElementById("history");
const attendanceDate = document.getElementById("attendanceDate");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendanceRate = document.getElementById("attendanceRate");
const presentList = document.getElementById("presentList");
const absentList = document.getElementById("absentList");

let trainees = JSON.parse(localStorage.getItem("trainees")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];

/* حفظ البيانات */
function save() {
    localStorage.setItem("trainees", JSON.stringify(trainees));
    localStorage.setItem("records", JSON.stringify(records));
}

/* إضافة متربص */
function addTrainee() {
    const name = nameInput.value.trim();
    if (!name || trainees.includes(name)) return;

    trainees.push(name);
    nameInput.value = "";
    save();
    renderSelect();
}

/* عرض القائمة المنسدلة */
function renderSelect() {
    traineeSelect.innerHTML = "";

    trainees.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        traineeSelect.appendChild(opt);
    });
}

/* تسجيل الحضور أو الغياب */
function markAttendance(status) {
    const name = traineeSelect.value;
    const date = attendanceDate.value;

    if (!name) return alert("اختر المتربص");
    if (!date) return alert("اختر التاريخ");

    // حفظ التاريخ دائمًا بصيغة YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];

    records.push({ name, status, date: formattedDate });
    save();
    renderHistory();
    updateStats();
    renderSummaryLists();
}

/* عرض آخر السجلات */
function renderHistory() {
    history.innerHTML = "";

    records.slice().reverse().forEach((r, index) => {
        const li = document.createElement("li");
        li.className = r.status === "حاضر" ? "present" : "absent";

        li.innerHTML = `
            <span>${r.name} - ${r.status} (${r.date})</span>
            <button onclick="toggleStatus(${records.length - 1 - index})">تعديل</button>
        `;

        history.appendChild(li);
    });
}

/* تبديل الحالة */
function toggleStatus(i) {
    records[i].status = records[i].status === "حاضر" ? "غائب" : "حاضر";
    save();
    renderHistory();
    updateStats();
    renderSummaryLists();
}

/* الإحصائيات */
function updateStats() {
    const present = records.filter(r => r.status === "حاضر").length;
    const absent = records.filter(r => r.status === "غائب").length;
    const total = present + absent;

    presentCount.textContent = present;
    absentCount.textContent = absent;
    attendanceRate.textContent = total ? Math.round((present / total) * 100) + "%" : "0%";
}

/* حذف متربص */
function deleteTrainee() {
    const name = traineeSelect.value;
    if (!name) return;

    trainees = trainees.filter(t => t !== name);
    records = records.filter(r => r.name !== name);

    save();
    renderSelect();
    renderHistory();
    updateStats();
    renderSummaryLists();
}

/* تعديل اسم متربص */
function editTrainee() {
    const oldName = traineeSelect.value;
    if (!oldName) return;

    const newName = prompt("الاسم الجديد:", oldName);
    if (!newName) return;

    trainees = trainees.map(t => t === oldName ? newName : t);
    records.forEach(r => { if (r.name === oldName) r.name = newName; });

    save();
    renderSelect();
    renderHistory();
    renderSummaryLists();
}

/* قوائم الحضور والغياب حسب التاريخ المختار */
function renderSummaryLists() {
    presentList.innerHTML = "";
    absentList.innerHTML = "";

    const selectedDate = attendanceDate.value;
    if (!selectedDate) return;

    const formattedDate = new Date(selectedDate).toISOString().split('T')[0];

    const todayRecords = records.filter(r => r.date === formattedDate);

    todayRecords.forEach(r => {
        const li = document.createElement("li");
        li.textContent = r.name;

        if (r.status === "حاضر") {
            li.className = "present";
            presentList.appendChild(li);
        } else {
            li.className = "absent";
            absentList.appendChild(li);
        }
    });
}

/* تحديث القوائم عند تغيير التاريخ */
attendanceDate.addEventListener("change", renderSummaryLists);

/* تصدير CSV */
function exportToCSV() {
    if (records.length === 0) return alert("لا يوجد بيانات");

    let csv = "\uFEFFالاسم,الحالة,التاريخ\n";

    records.forEach(r => {
        csv += `${r.name},${r.status},${r.date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "سجل_الحضور.csv";
    link.click();
}

/* مسح سجل اليوم */
function clearTodayRecords() {
    const selectedDate = attendanceDate.value;
    if (!selectedDate) { alert("اختر التاريخ أولاً"); return; }
    if (!confirm("هل أنت متأكد من مسح سجلات هذا اليوم فقط؟")) return;

    const formattedDate = new Date(selectedDate).toISOString().split('T')[0];

    records = records.filter(r => r.date !== formattedDate);

    save();
    renderHistory();
    updateStats();
    renderSummaryLists();
    alert("تم مسح سجلات اليوم بنجاح ✅");
}

/* تشغيل عند فتح الصفحة */
renderSelect();
renderHistory();
updateStats();
renderSummaryLists();
