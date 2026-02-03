let trainees = JSON.parse(localStorage.getItem("trainees")) || [];
let records = JSON.parse(localStorage.getItem("records")) || [];

// حفظ البيانات
function save() {
    localStorage.setItem("trainees", JSON.stringify(trainees));
    localStorage.setItem("records", JSON.stringify(records));
}

// إضافة متربص
function addTrainee() {
    const name = document.getElementById("nameInput").value.trim();
    if (name === "" || trainees.includes(name)) return;
    trainees.push(name);
    document.getElementById("nameInput").value = "";
    save();
    renderSelect();
}

// عرض القائمة المنسدلة
function renderSelect() {
    const select = document.getElementById("traineeSelect");
    select.innerHTML = "";

    if (trainees.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "لا يوجد متربصين";
        opt.disabled = true;
        select.appendChild(opt);
        return;
    }

    trainees.forEach(name => {
        const option = document.createElement("option");
        option.textContent = name;
        select.appendChild(option);
    });
}

// تسجيل الحضور/الغياب
function markAttendance(status) {
    const select = document.getElementById("traineeSelect");
    const name = select.value;
    if (!name) {
        alert("اختر المتربص أولًا");
        return;
    }

    // قراءة التاريخ من الحقل
    const dateInput = document.getElementById("attendanceDate").value;
    if (!dateInput) {
        alert("اختر تاريخ تسجيل الغياب/الحضور أولًا");
        return;
    }

    const selectedDate = new Date(dateInput).toLocaleDateString();

    // التحقق إذا تم تسجيل المتربص في نفس التاريخ
    const alreadyMarked = records.some(r => r.name === name && r.date === selectedDate);
    if (alreadyMarked) {
        alert(`تم تسجيل هذا المتربص بالفعل بتاريخ ${selectedDate}`);
        return;
    }

    // تسجيل الحضور أو الغياب
    records.push({ name, status, date: selectedDate });
    save();
    renderHistory();
    updateStats();
}


// عرض السجل
function renderHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "";
    records.slice(-10).reverse().forEach(r => {
        const li = document.createElement("li");
        li.className = r.status === "حاضر" ? "present" : "absent";
        li.textContent = `${r.name} - ${r.status} (${r.date})`;
        list.appendChild(li);
    });
}

// الإحصائيات
function updateStats() {
    const present = records.filter(r => r.status === "حاضر").length;
    const absent = records.filter(r => r.status === "غائب").length;
    const total = present + absent;
    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;
    document.getElementById("attendanceRate").textContent = total === 0 ? "0%" : Math.round((present / total) * 100) + "%";
}

// تعديل الاسم
function editTrainee() {
    const select = document.getElementById("traineeSelect");
    const oldName = select.value;
    const newName = document.getElementById("editNameInput").value.trim();

    if (!oldName) { alert("اختر متربصًا أولًا"); return; }
    if (newName === "") { alert("أدخل الاسم الجديد"); return; }
    if (trainees.includes(newName)) { alert("هذا الاسم موجود مسبقًا"); return; }

    trainees = trainees.map(t => t === oldName ? newName : t);
    records = records.map(r => r.name === oldName ? {...r, name: newName} : r);

    document.getElementById("editNameInput").value = "";
    save();
    renderSelect();
    renderHistory();
    updateStats();
}

// حذف المتربص
function deleteTrainee() {
    const select = document.getElementById("traineeSelect");
    const name = select.value;
    if (!name) { alert("اختر متربصًا للحذف"); return; }
    if (!confirm(`هل تريد حذف ${name} نهائيًا؟`)) return;

    trainees = trainees.filter(t => t !== name);
    records = records.filter(r => r.name !== name);
    save();
    renderSelect();
    renderHistory();
    updateStats();
}

// تصدير CSV بالعربية بشكل صحيح
function exportToCSV() {
    if (records.length === 0) { alert("لا يوجد سجل حضور للتصدير"); return; }

    let csvContent = "الاسم,الحالة,التاريخ\n";
    records.forEach(r => { csvContent += `"${r.name}","${r.status}","${r.date}"\n`; });

    // إضافة BOM لتفادي مشكلة الترميز في Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "سجل_الحضور.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// استدعاء كل شيء بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("attendanceDate").value = today;

    renderSelect();
    renderHistory();
    updateStats();
});




