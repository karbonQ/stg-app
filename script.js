let specialties = JSON.parse(localStorage.getItem("specialties")) || {};
let records = JSON.parse(localStorage.getItem("records")) || [];

const specialtySelect = document.getElementById("specialtySelect");
const traineeSelect = document.getElementById("traineeSelect");
const attendanceList = document.getElementById("attendanceList");

function saveData(){
localStorage.setItem("specialties",JSON.stringify(specialties));
localStorage.setItem("records",JSON.stringify(records));
}

function loadSpecialties(){

specialtySelect.innerHTML="";

for(let spec in specialties){

let option=document.createElement("option");
option.value=spec;
option.textContent=spec;

specialtySelect.appendChild(option);

}

loadTrainees();

}

function addSpecialty(){

let name=document.getElementById("newSpecialty").value.trim();

if(name==="")return;

if(!specialties[name]){
specialties[name]=[];
}

document.getElementById("newSpecialty").value="";

saveData();
loadSpecialties();

}

function addTrainee(){

let name=document.getElementById("traineeName").value.trim();
let spec=specialtySelect.value;

if(name===""||!spec)return;

specialties[spec].push(name);

document.getElementById("traineeName").value="";

saveData();
loadTrainees();

}

function loadTrainees(){

let spec=specialtySelect.value;

traineeSelect.innerHTML="";

if(!spec||!specialties[spec])return;

specialties[spec].forEach(name=>{

let option=document.createElement("option");
option.textContent=name;

traineeSelect.appendChild(option);

});

document.getElementById("countTrainees").textContent=
"عدد المتربصين في هذا التخصص: "+specialties[spec].length;

}

function deleteTrainee(){

let spec=specialtySelect.value;
let name=traineeSelect.value;

if(!name)return;

specialties[spec]=specialties[spec].filter(t=>t!==name);

saveData();
loadTrainees();

}

function editTrainee(){

let spec=specialtySelect.value;
let oldName=traineeSelect.value;

if(!oldName)return;

let newName=prompt("الاسم الجديد:",oldName);

if(!newName)return;

specialties[spec]=specialties[spec].map(t=>t===oldName?newName:t);

saveData();
loadTrainees();

}

function markAttendance(status){

let trainee=traineeSelect.value;
let spec=specialtySelect.value;
let date=document.getElementById("attendanceDate").value;

if(!trainee||!date){
alert("اختر المتربص والتاريخ");
return;
}

records.push({
name:trainee,
specialty:spec,
status:status,
date:date
});

saveData();

renderAttendance();

}

function renderAttendance(){

attendanceList.innerHTML="";

records.slice(-10).reverse().forEach(r=>{

let li=document.createElement("li");

li.textContent=
r.date+" | "+
r.specialty+" | "+
r.name+" | "+
r.status;

attendanceList.appendChild(li);

});

}

function exportCSV(){

if(records.length===0)return;

let csv="\uFEFFالتاريخ,التخصص,الاسم,الحالة\n";

records.forEach(r=>{

csv+=`${r.date},${r.specialty},${r.name},${r.status}\n`;

});

let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});

let link=document.createElement("a");

link.href=URL.createObjectURL(blob);
link.download="attendance.csv";

link.click();

}

window.onload=function(){

loadSpecialties();
renderAttendance();

};

