// بيانات تسجيل الدخول
const userData = {username:"admin", password:"1234"};
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
// الرسم البياني
let attendanceChart;

// تسجيل الدخول
function login(){
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if(username === userData.username && password === userData.password){
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "block";
        loadSpecialties();
        renderAttendance();
        renderChart();
        alert("تم تسجيل الدخول بنجاح ✅");
    }else{
        alert("اسم المستخدم أو كلمة المرور خاطئ ❌");
    }
}

// البيانات
let specialties = JSON.parse(localStorage.getItem("specialties")) || {};
let records = JSON.parse(localStorage.getItem("records")) || [];

let specialtySelect = document.getElementById("specialtySelect");
let traineeSelect = document.getElementById("traineeSelect");
let attendanceList = document.getElementById("attendanceList");

// حفظ البيانات
function saveData(){
    localStorage.setItem("specialties",JSON.stringify(specialties));
    localStorage.setItem("records",JSON.stringify(records));
}

// تحميل التخصصات
function loadSpecialties(){
    specialtySelect.innerHTML="";
    for(let spec in specialties){
        let option=document.createElement("option");
        option.textContent=spec;
        specialtySelect.appendChild(option);
    }
    loadTrainees();
}

// تحميل المتربصين
function loadTrainees(){
    traineeSelect.innerHTML="";
    let spec = specialtySelect.value;
    if(spec && specialties[spec]){
        specialties[spec].forEach(name=>{
            let option=document.createElement("option");
            option.textContent=name;
            traineeSelect.appendChild(option);
        });
    }
}

// إضافة تخصص
function addSpecialty(){
    let name=document.getElementById("newSpecialty").value.trim();
    if(!name) return;
    if(specialties[name]){ alert("التخصص موجود مسبقًا"); return; }
    specialties[name]=[];
    saveData();
    loadSpecialties();
    alert("تم إضافة التخصص ✅");
}

// تعديل تخصص
function editSpecialty(){
    let oldName=specialtySelect.value;
    if(!oldName) return;
    let newName=prompt("الاسم الجديد للتخصص:",oldName);
    if(!newName) return;
    if(confirm(`تعديل "${oldName}" إلى "${newName}" ؟`)){
        specialties[newName]=specialties[oldName];
        delete specialties[oldName];
        records.forEach(r=>{ if(r.specialty===oldName) r.specialty=newName; });
        saveData();
        loadSpecialties();
        renderAttendance();
        renderChart();
        alert("تم تعديل التخصص");
    }
}

// حذف تخصص
function deleteSpecialty(){
    let spec=specialtySelect.value;
    if(!spec) return;
    if(confirm(`حذف التخصص "${spec}" مع جميع السجلات؟`)){
        delete specialties[spec];
        records=records.filter(r=>r.specialty!==spec);
        saveData();
        loadSpecialties();
        renderAttendance();
        renderChart();
    }
}

// إضافة متربص
function addTrainee(){
    let name=document.getElementById("nameInput").value.trim();
    let spec=specialtySelect.value;
    if(!name || !spec) return;
    if(specialties[spec].includes(name)){ alert("المتربص موجود"); return; }
    specialties[spec].push(name);
    saveData();
    loadTrainees();
    alert("تم إضافة المتربص");
}

// تعديل متربص
function editTrainee(){
    let spec=specialtySelect.value;
    let oldName=traineeSelect.value;
    if(!oldName) return;
    let newName=prompt("الاسم الجديد:",oldName);
    if(!newName) return;
    if(confirm(`تعديل "${oldName}" إلى "${newName}" ؟`)){
        specialties[spec]=specialties[spec].map(t=>t===oldName?newName:t);
        records.forEach(r=>{ if(r.name===oldName && r.specialty===spec) r.name=newName; });
        saveData();
        loadTrainees();
        renderAttendance();
        alert("تم تعديل المتربص");
    }
}

// حذف متربص
function deleteTrainee(){
    let spec=specialtySelect.value;
    let name=traineeSelect.value;
    if(!name) return;
    if(confirm(`حذف المتربص "${name}" ؟`)){
        specialties[spec]=specialties[spec].filter(t=>t!==name);
        records=records.filter(r=>!(r.name===name && r.specialty===spec));
        saveData();
        loadTrainees();
        renderAttendance();
        renderChart();
    }
}

// تسجيل حضور او غياب
function markAttendance(status){
    let name = traineeSelect.value;
    let spec = specialtySelect.value;
    let date = document.getElementById("attendanceDate").value;

    if(!name || !spec || !date){
        alert("يرجى ملء جميع الحقول");
        return;
    }

    // إضافة السجل
    records.push({
        name: name,
        specialty: spec,
        status: status,
        date: date
    });

    localStorage.setItem("attendance", JSON.stringify(records));

    renderChart();   // 🔥 تحديث مباشر للرسم
}


// مسح سجلات يوم
function clearDayRecords(){
    let date=document.getElementById("attendanceDate").value;
    if(!date){ alert("اختر التاريخ"); return; }
    if(confirm("هل تريد مسح سجلات هذا اليوم؟")){
        records=records.filter(r=>r.date!==date);
        saveData();
        renderAttendance();
        renderChart();
    }
}

// تعديل الحالة
function toggleStatus(i){
    records[i].status = records[i].status==="حاضر" ? "غائب" : "حاضر";
    saveData();
    renderAttendance();
    renderChart();
}

// عرض السجلات
function renderAttendance(){
    attendanceList.innerHTML="";
    let spec=specialtySelect.value;
    let filtered=records.filter(r=>r.specialty===spec);
    let grouped={};
    filtered.forEach(r=>{
        if(!grouped[r.date]) grouped[r.date]=[];
        grouped[r.date].push(r);
    });
    Object.keys(grouped).sort().reverse().forEach(date=>{
        let title=document.createElement("h3");
        title.innerHTML="📅 "+date;
        attendanceList.appendChild(title);
        grouped[date].forEach(r=>{
            let li=document.createElement("li");
            let color=r.status==="حاضر"?"green":"red";
            let idx=records.indexOf(r);
li.innerHTML = `
    <span class="name">${record.name}</span>
    <span class="status ${record.status === "حاضر" ? "present" : "absent"}">
        ${record.status}
    </span>
    <button class="actionBtn">🔁</button>
`;            attendanceList.appendChild(li);
        });
    });
}

// الرسم البياني Histogram

function renderChart(){
    let spec = specialtySelect.value;
    let type = document.getElementById("statsType").value;
    let selectedDate = document.getElementById("attendanceDate").value;

    let present = 0;
    let absent = 0;

    if(type === "day"){
        let filtered = records.filter(r =>
            r.specialty === spec && r.date === selectedDate
        );

        present = filtered.filter(r => r.status === "حاضر").length;
        absent = filtered.filter(r => r.status === "غائب").length;
    }

    else if(type === "week"){
        let stats = getWeeklyStats(spec);
        present = stats.present;
        absent = stats.absent;
    }

    else if(type === "month"){
        let stats = getMonthlyStats(spec);
        present = stats.present;
        absent = stats.absent;
    }

    let ctx = document.getElementById("attendanceChart");

    if(attendanceChart) attendanceChart.destroy();

    attendanceChart = new Chart(ctx,{
        type:"bar",
        data:{
            labels:["حضور","غياب"],
            datasets:[{
                data:[present, absent],
                backgroundColor:["#2ecc71","#e74c3c"]
            }]
        }
    });
}




document.getElementById("attendanceDate")
    .addEventListener("change", renderChart);

// تصدير CSV
function exportCSV(){
    if(records.length===0){ alert("لا يوجد سجل"); return; }
    let csv="\uFEFFالاسم واللقب,التخصص,الحالة,التاريخ\n";
    records.forEach(r=>{
        csv+=`"${r.name}","${r.specialty}","${r.status}","${r.date}"\n`;
    });
    let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    let link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="سجل_الحضور.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// تغيير التخصص
specialtySelect.addEventListener("change",()=>{
    loadTrainees();
    renderAttendance();
    renderChart();
});

function getWeeklyStats(spec){
    let today = new Date();
    let weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    let filtered = records.filter(r => {
        let d = new Date(r.date);
        return r.specialty === spec && d >= weekAgo && d <= today;
    });

    return {
        present: filtered.filter(r => r.status === "حاضر").length,
        absent: filtered.filter(r => r.status === "غائب").length
    };
}

function getMonthlyStats(spec){
    let today = new Date();

    let filtered = records.filter(r => {
        let d = new Date(r.date);
        return r.specialty === spec &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    });

    return {
        present: filtered.filter(r => r.status === "حاضر").length,
        absent: filtered.filter(r => r.status === "غائب").length
    };
}


// وظيفة لعرض سجلات اليوم في الجدول
function updateDailyRecordsTable() {
    const tableBody = document.getElementById('dailyRecordsTable');
    const selectedDate = document.getElementById('attendanceDate').value; // التاريخ المختار حالياً
    
    tableBody.innerHTML = ''; // مسح الجدول قبل إعادة التعبئة

    // تصفية السجلات لتظهر سجلات التاريخ المختار فقط
    const todayRecords = attendanceRecords.filter(record => record.date === selectedDate);

    todayRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        
        // لون الحالة
        const statusColor = record.status === 'حاضر' ? 'green' : 'red';

        row.innerHTML = `
            <td>${record.name}</td>
            <td style="color: ${statusColor}; font-weight: bold;">${record.status}</td>
            <td>
                <button onclick="toggleStatus('${record.id}')">تبديل الحالة</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// وظيفة لتبديل الحالة من غائب إلى حاضر والعكس
function toggleStatus(recordId) {
    attendanceRecords = attendanceRecords.map(record => {
        if (record.id === recordId) {
            record.status = (record.status === 'حاضر') ? 'غائب' : 'حاضر';
        }
        return record;
    });

    // حفظ التعديلات في LocalStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    
    // تحديث الجدول والرسم البياني فوراً
    updateDailyRecordsTable();
    if (typeof updateChart === "function") updateChart(); 
}

// استدعاء الوظيفة عند تغيير التاريخ
document.getElementById('attendanceDate').addEventListener('change', updateDailyRecordsTable);

// تأكد من استدعاء updateDailyRecordsTable() داخل وظيفة markAttendance() الأصلية لديك
document.getElementById("attendanceDate")
    .addEventListener("change", renderChart);

document.getElementById("statsType")
    .addEventListener("change", renderChart);
