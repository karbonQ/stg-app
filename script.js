// بيانات تسجيل دخول ثابتة
const userData = {username:"admin", password:"1234"};

// نافذة تسجيل الدخول
function login(){
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();

    if(u===userData.username && p===userData.password){
        alert("تم تسجيل الدخول بنجاح ✅");
        document.body.classList.add("logged-in");
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

// تحميل التخصصات والمتربصين
function loadSpecialties(){
    specialtySelect.innerHTML="";
    for(let spec in specialties){
        let option=document.createElement("option");
        option.textContent=spec;
        specialtySelect.appendChild(option);
    }
    loadTrainees();
}

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

// إدارة التخصصات
function addSpecialty(){ let name=document.getElementById("newSpecialty").value.trim(); if(!name) return; if(specialties[name]){alert("التخصص موجود!");return;} specialties[name]=[]; saveData(); loadSpecialties(); alert("تم إضافة التخصص ✅"); }
function editSpecialty(){ let oldName=specialtySelect.value; if(!oldName) return; let newName=prompt("الاسم الجديد للتخصص:",oldName); if(!newName) return; if(confirm(`تعديل "${oldName}" إلى "${newName}"؟`)){ specialties[newName]=specialties[oldName]; delete specialties[oldName]; records.forEach(r=>{ if(r.specialty===oldName) r.specialty=newName; }); saveData(); loadSpecialties(); alert("تم تعديل التخصص ✅"); } }
function deleteSpecialty(){ let spec=specialtySelect.value; if(!spec) return; if(confirm(`حذف "${spec}" وكل المتربصين والسجلات؟`)){ delete specialties[spec]; records=records.filter(r=>r.specialty!==spec); saveData(); loadSpecialties(); renderAttendance(); alert("تم حذف التخصص 🗑️"); } }

// إدارة المتربصين
function addTrainee(){ let name=document.getElementById("nameInput").value.trim(); let spec=specialtySelect.value; if(!name || !spec) return; if(specialties[spec].includes(name)) return; specialties[spec].push(name); saveData(); loadTrainees(); alert("تم إضافة المتربص ✅"); }
function editTrainee(){ let spec=specialtySelect.value; let oldName=traineeSelect.value; if(!oldName) return; let newName=prompt("الاسم الجديد:",oldName); if(!newName) return; if(confirm(`تعديل "${oldName}" إلى "${newName}"؟`)){ specialties[spec]=specialties[spec].map(t=>t===oldName?newName:t); records.forEach(r=>{if(r.name===oldName && r.specialty===spec) r.name=newName;}); saveData(); loadTrainees(); renderAttendance(); alert("تم تعديل المتربص ✅"); } }
function deleteTrainee(){ let spec=specialtySelect.value; let name=traineeSelect.value; if(!name) return; if(confirm(`حذف المتربص "${name}"؟`)){ specialties[spec]=specialties[spec].filter(t=>t!==name); records=records.filter(r=>!(r.name===name && r.specialty===spec)); saveData(); loadTrainees(); renderAttendance(); alert("تم حذف المتربص 🗑️"); } }

// تسجيل حضور/غياب
function markAttendance(status){ 
    let name=traineeSelect.value; let spec=specialtySelect.value; let date=document.getElementById("attendanceDate").value; 
    if(!name || !date) return; 
    records.push({name:name,specialty:spec,status:status,date:date}); 
    saveData(); renderAttendance(); updateStats(); 
}

// مسح سجلات اليوم
function clearDayRecords(){ 
    let date=document.getElementById("attendanceDate").value; 
    if(!date){alert("اختر التاريخ");return;} 
    if(confirm("مسح جميع سجلات هذا اليوم؟")){ records=records.filter(r=>r.date!==date); saveData(); renderAttendance(); updateStats(); alert("تم مسح سجلات اليوم 🗑️");} 
}

// تعديل الحالة سريع
function toggleStatus(i){ records[i].status=records[i].status==="حاضر"?"غائب":"حاضر"; saveData(); renderAttendance(); updateStats(); }

// الإحصائيات
function updateStats(){ 
    let spec=specialtySelect.value; 
    let filtered=records.filter(r=>r.specialty===spec); 
    let present=filtered.filter(r=>r.status==="حاضر").length; 
    let absent=filtered.filter(r=>r.status==="غائب").length; 
    let total=present+absent; 
    document.getElementById("presentCount").textContent=present; 
    document.getElementById("absentCount").textContent=absent; 
    document.getElementById("attendanceRate").textContent=total===0?"0%":Math.round((present/total)*100)+"%";
}

// عرض السجلات مجمعة حسب التاريخ
function renderAttendance(){
    attendanceList.innerHTML="";
    let spec=specialtySelect.value;
    let filtered=records.filter(r=>r.specialty===spec);
    let grouped={};
    filtered.forEach(r=>{ if(!grouped[r.date]) grouped[r.date]=[]; grouped[r.date].push(r); });
    Object.keys(grouped).sort().reverse().forEach(date=>{
        let title=document.createElement("h3");
        title.innerHTML="📅 "+date;
        attendanceList.appendChild(title);
        grouped[date].forEach(r=>{
            let li=document.createElement("li");
            let color=r.status==="حاضر"?"green":"red";
            let idx=records.indexOf(r);
            li.innerHTML=`${r.name} <span style="color:${color};font-weight:bold">${r.status}</span> <button onclick="toggleStatus(${idx})">🔁</button>`;
            attendanceList.appendChild(li);
        });
    });
}

// تصدير CSV
function exportCSV(){
    if(records.length===0){ alert("لا يوجد سجل للتصدير"); return; }
    let csv="\uFEFFالاسم واللقب,التخصص,الحالة,التاريخ\n";
    records.forEach(r=>{ csv+=`"${r.name}","${r.specialty}","${r.status}","${r.date}"\n`; });
    let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); 
    let link=document.createElement("a"); 
    link.href=URL.createObjectURL(blob); 
    link.download="سجل_الحضور.csv"; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
}

// تحميل البيانات عند فتح الصفحة
window.onload=function(){
    if(!Object.keys(specialties).length){ specialties={"تلقين الإعلام الآلي":[]} ; saveData(); }
    loadSpecialties();
    renderAttendance();
    updateStats();
}

specialtySelect.addEventListener("change",()=>{
    loadTrainees(); renderAttendance(); updateStats();
});
