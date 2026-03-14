// بيانات التطبيق
let specialties = JSON.parse(localStorage.getItem("specialties")) || {};
let records = JSON.parse(localStorage.getItem("records")) || [];

const specialtySelect = document.getElementById("specialtySelect");
const traineeSelect = document.getElementById("traineeSelect");
const attendanceList = document.getElementById("attendanceList");
const statsCards = document.getElementById("statsCards");
const searchResults = document.getElementById("searchResults");

// إذا لم توجد تخصصات نضع افتراضي
if (!specialties || Object.keys(specialties).length === 0) {
    specialties = {"تلقين الإعلام الآلي": []};
}

// حفظ البيانات
function saveData(){
    localStorage.setItem("specialties", JSON.stringify(specialties));
    localStorage.setItem("records", JSON.stringify(records));
}

// تحميل التخصصات
function loadSpecialties(){
    specialtySelect.innerHTML="";
    for(let spec in specialties){
        let option = document.createElement("option");
        option.value = spec;
        option.textContent = spec;
        specialtySelect.appendChild(option);
    }
    loadTrainees();
    renderStats();
}

// إضافة تخصص
function addSpecialty(){
    let name = document.getElementById("newSpecialty").value.trim();
    if(name===""){ alert("اكتب اسم التخصص"); return; }
    if(!specialties[name]) specialties[name]=[];
    document.getElementById("newSpecialty").value="";
    saveData();
    loadSpecialties();
}
function editSpecialty(){

    let oldName = specialtySelect.value;

    if(!oldName){
        alert("اختر تخصص أولا");
        return;
    }

    let newName = prompt("ادخل الاسم الجديد للتخصص:", oldName);

    if(!newName || newName.trim()===""){
        return;
    }

    // إنشاء تخصص جديد بنفس المتربصين
    specialties[newName] = specialties[oldName];

    // حذف التخصص القديم
    delete specialties[oldName];

    // تحديث السجلات القديمة
    records.forEach(r=>{
        if(r.specialty === oldName){
            r.specialty = newName;
        }
    });

    saveData();
    loadSpecialties();
}
function deleteSpecialty(){

    let spec = specialtySelect.value;

    if(!spec){
        alert("اختر التخصص أولا");
        return;
    }

    if(!confirm("هل تريد حذف هذا التخصص مع جميع المتربصين والسجلات؟")){
        return;
    }

    // حذف التخصص
    delete specialties[spec];

    // حذف السجلات المرتبطة به
    records = records.filter(r => r.specialty !== spec);

    saveData();

    loadSpecialties();
    renderAttendance();
    renderStats();
    renderChart();
}
// إضافة متربص
function addTrainee(){
    let name = document.getElementById("traineeName").value.trim();
    let spec = specialtySelect.value;
    if(name===""){ alert("اكتب اسم المتربص"); return; }
    if(!spec){ alert("اختر تخصص"); return; }
    specialties[spec].push(name);
    document.getElementById("traineeName").value="";
    saveData();
    loadTrainees();
}
// تحميل المتربصين حسب التخصص
function loadTrainees(){
    let spec = specialtySelect.value;
    traineeSelect.innerHTML="";
    if(!spec || !specialties[spec]) return;
    specialties[spec].forEach(name=>{
        let option = document.createElement("option");
        option.textContent=name;
        traineeSelect.appendChild(option);
    });
    document.getElementById("countTrainees").textContent=
        "عدد المتربصين في هذا التخصص: "+specialties[spec].length;
}

// تعديل متربص
function editTrainee(){
    let spec = specialtySelect.value;
    let oldName = traineeSelect.value;
    if(!oldName) return;
    let newName = prompt("الاسم الجديد:", oldName);
    if(!newName) return;
    specialties[spec] = specialties[spec].map(t=>t===oldName?newName:t);
    saveData();
    loadTrainees();
}

// حذف متربص
function deleteTrainee(){
    let spec = specialtySelect.value;
    let name = traineeSelect.value;
    if(!name) return;
    specialties[spec] = specialties[spec].filter(t=>t!==name);
    saveData();
    loadTrainees();
}

// تسجيل الحضور/الغياب
function markAttendance(status){
    let trainee = traineeSelect.value;
    let spec = specialtySelect.value;
    let date = document.getElementById("attendanceDate").value;
    if(!trainee||!date){ alert("اختر المتربص والتاريخ"); return; }
    records.push({name:trainee,specialty:spec,status:status,date:date});
    saveData();
    renderAttendance();
    renderStats();
    renderChart();
}

// عرض آخر السجلات
function renderAttendance(){

    attendanceList.innerHTML="";

    records.slice(-10).reverse().forEach((r,index)=>{

        let realIndex = records.length - 1 - index;

        let li = document.createElement("li");

        let statusColor = r.status === "حاضر" ? "green" : "red";

        li.innerHTML = `
        ${r.date} | ${r.specialty} | ${r.name} | 
        <b style="color:${statusColor}">${r.status}</b>

        <button onclick="toggleStatus(${realIndex})">
        🔁
        </button>
        `;

        attendanceList.appendChild(li);

    });

}
function editStatus(i){

    let newStatus = prompt("اكتب الحالة الجديدة: حاضر أو غائب");

    if(!newStatus) return;

    if(newStatus !== "حاضر" && newStatus !== "غائب"){
        alert("اكتب فقط: حاضر أو غائب");
        return;
    }

    records[i].status = newStatus;

    saveData();

    renderAttendance();
    renderStats();
    renderChart();
}
function toggleStatus(i){

    if(records[i].status === "حاضر"){
        records[i].status = "غائب";
    }else{
        records[i].status = "حاضر";
    }

    saveData();

    renderAttendance();
    renderStats();
    renderChart();
}
// تصدير CSV
function exportCSV(){

    if(records.length === 0){
        alert("لا يوجد سجل للتصدير");
        return;
    }

    let csv = "\uFEFFالاسم واللقب,الحالة,التاريخ\n";

    records.forEach(r => {

        csv += `"${r.name}","${r.status}","${r.date}"\n`;

    });

    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "سجل_الحضور.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}

// عرض إحصائيات لكل تخصص
function renderStats(){
    statsCards.innerHTML="";
    for(let spec in specialties){
        let present = records.filter(r=>r.specialty===spec && r.status==='حاضر').length;
        let absent = records.filter(r=>r.specialty===spec && r.status==='غائب').length;
        let total = present+absent;
        let rate = total===0 ? 0 : Math.round((present/total)*100);
        let card = document.createElement("div");
        card.className="stat-card";
        card.innerHTML=`<h3>${spec}</h3>
                        <p>حاضر: ${present} | غائب: ${absent} | نسبة الحضور: ${rate}%</p>`;
        statsCards.appendChild(card);
    }
}

// رسم بياني للحضور/الغياب
let chart;
function renderChart(){
    const ctx = document.getElementById("attendanceChart").getContext("2d");
    let labels = Object.keys(specialties);
    let presentData = labels.map(spec => records.filter(r=>r.specialty===spec && r.status==='حاضر').length);
    let absentData = labels.map(spec => records.filter(r=>r.specialty===spec && r.status==='غائب').length);
    if(chart) chart.destroy();
    chart = new Chart(ctx,{
        type:'bar',
        data:{
            labels: labels,
            datasets:[
                {label:'حاضر', data:presentData, backgroundColor:'#2ecc71'},
                {label:'غائب', data:absentData, backgroundColor:'#e74c3c'}
            ]
        },
        options:{
            responsive:true,
            plugins:{legend:{position:'top'}}
        }
    });
}

// بحث سريع
function searchRecords(){
    const term = document.getElementById("searchInput").value.trim();
    searchResults.innerHTML="";
    if(term==="") return;
    let filtered = records.filter(r=>r.name.includes(term)||r.specialty.includes(term));
    filtered.forEach(r=>{
        let li=document.createElement("li");
        li.textContent=r.date+" | "+r.specialty+" | "+r.name+" | "+r.status;
        searchResults.appendChild(li);
    });
}

// Dark Mode
function toggleTheme(){
    document.body.classList.toggle("dark-mode");
    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
    }else{
        localStorage.setItem("theme","light");
    }
}

function loadTheme(){
    let theme = localStorage.getItem("theme");
    if(theme==="dark") document.body.classList.add("dark-mode");
}

// عند تحميل الصفحة
window.onload=function(){
    loadTheme();
    loadSpecialties();
    renderAttendance();
    renderStats();
    renderChart();
};
function clearDayRecords(){

    const selectedDate = document.getElementById("attendanceDate").value;

    if(!selectedDate){
        alert("اختر التاريخ أولا");
        return;
    }

    if(!confirm("هل تريد حذف سجلات هذا اليوم؟")){
        return;
    }

    // تحويل التاريخ الى الصيغة الثانية
    const parts = selectedDate.split("-");
    const altDate = parts.reverse().join("-");
    // حذف السجلات المطابقة للتاريخين
    records = records.filter(r => r.date !== selectedDate && r.date !== altDate);
    saveData();
    renderAttendance();
    renderStats();
    renderChart();

    alert("تم حذف سجلات هذا اليوم");
}

