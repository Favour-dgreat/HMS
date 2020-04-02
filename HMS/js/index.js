let client = null, contractInstance = null, patientImage = null, doctorImage = null, ipfs = null;

let contractAddress="ct_PGN7o23mp6hPvCPP3LdgZ1ANaUdYiq1mGiLmqxES95RwQWodm";
let contractSource=`
payable contract HMS =

  record patient =
    { patientAddress    : address,
      name              : string,
      sex               : string,
      image             : string }

  record doctor =
    { doctorAddress : address,
      name          : string,
      image         : string }

  record medicalRecord =
    { doctor          : string,
      date            : string,
      height          : string,
      weight          : string,
      bmi             : string,
      genotype        : string,
      bloodgroup      : string,
      medicationGiven : string }

  record state =
    { patients: map(address,patient),
      doctors: map(address,doctor),
      medicalRecords: map(address,list(medicalRecord)),
      owner: address }

  stateful entrypoint init() =
    { patients = {},
      doctors = {},
      medicalRecords = {},
      owner = ak_2kZrMMEMmSZg6wJbnykv2wXuxifz5rD7gBAshqNXbAa6rDSs5G }

  stateful entrypoint addPatient(name':string, sex':string, image':string)=
    let newPatient={patientAddress = Call.caller, name = name', sex = sex', image = image'}

    put(state{patients[Call.caller]=newPatient})

  payable stateful entrypoint addDoctor(name':string, image':string) =
    let newDoctor={doctorAddress = Call.caller, name = name', image = image'}

    Chain.spend(state.owner, 2000000000000000000)

    put(state{doctors[Call.caller]=newDoctor})

  stateful entrypoint addMedicalRecord(pAddress:address, date':string, height':string, weight':string,bmi':string,genotype':string,bloodgroup':string,medicationGiven':string)=
    let doctor = state.doctors[Call.caller]
    let patient = state.patients[pAddress]
    require(doctor.doctorAddress == Call.caller, "Only Doctors")

    let newRecord={doctor = doctor.name, date = date', height = height', weight = weight', bmi = bmi', genotype = genotype', bloodgroup = bloodgroup',medicationGiven = medicationGiven'}

    let medicalRecord = Map.lookup_default(patient.patientAddress,state.medicalRecords,[])
    let newMedicalRecord=newRecord::medicalRecord

    put(state{medicalRecords[patient.patientAddress]=newMedicalRecord})

  entrypoint getPatient()=
    state.patients[Call.caller]  

  entrypoint patientRecord()=
    state.medicalRecords[Call.caller]

  entrypoint getDoctor()=
    state.doctors[Call.caller] 

  entrypoint allPatients()=
    state.patients
  
  entrypoint owner()=
    require(state.owner == Call.caller, "Owner Only")

  entrypoint allDoctors()=
    owner()
    state.doctors

  entrypoint allRecords()=
    owner()
    state.medicalRecords
`;

function recordDom(doctor, date, height, weight, bmi, genotype, bloodgroup, medication) {
  let recordList = document.getElementById("record-list");

  let cardColums = document.createElement("div");
  cardColums.classList.add("card-columns")
  let card = document.createElement("div");
  card.classList.add("card");
  card.classList.add("border-primary");
  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  let recordInfo = document.createElement("p");
  recordInfo.classList.add("card-text");
  recordInfo.innerHTML =  "<b>Date</b>: " + date + "<br><b>Doctor</b>: " + doctor + "<br><b>Height/Weight</b>: " + height + "/" + weight + "<br><b>Genotype/Bloodgroup</b>: " + genotype + "/" + bloodgroup;

  let recordMedication = document.createElement("p");
  recordMedication.innerHTML = "<b>Medication Given</b><br>" + medication;

  cardBody.appendChild(recordInfo);
  cardBody.appendChild(recordMedication);

  card.appendChild(cardBody);
  cardColums.appendChild(card);
  recordList.appendChild(cardColums)
}

function listDom(address, name) {
  let patientList = document.getElementById("patient-list");

  let list = document.createElement("option");
  list.value = address;
  list.innerText = name;

  patientList.appendChild(list);
}

function patientDom(name, sex) {
  let adminPatient = document.getElementById("admin-patient");

  let patientTr = document.createElement("tr");

  let ptdName = document.createElement("td");
  ptdName.innerText = name;

  let ptdSex = document.createElement("td");
  ptdSex.innerText = sex;

  patientTr.appendChild(ptdName);
  patientTr.appendChild(ptdSex);

  adminPatient.appendChild(patientTr);
}

function doctorDom(name) {
  let adminDoctor = document.getElementById("admin-doctor");

  let doctorTr = document.createElement("tr");

  let dtdName = document.createElement("td");
  dtdName.innerText = name;

  doctorTr.appendChild(dtdName);

  adminDoctor.appendChild(doctorTr);
}

function medicalDom(doctor, date, height, weight, bmi, genotype, bloodgroup, medication) {
  let adminMedical = document.getElementById("admin-medical");
  let medicalTr = document.createElement("tr");

  let mtdDate = document.createElement("td");
  mtdDate.innerText = date;

  let mtdDoctor = document.createElement("td");
  mtdDoctor.innerText = doctor;

  let mtdGroup1 = document.createElement("td");
  mtdGroup1.innerText = height + "/" + weight;

  let mtdBmi = document.createElement("td");
  mtdBmi.innerText = bmi;
  
  let mtdGroup2 = document.createElement("td");
  mtdGroup2.innerText = genotype + "/" + bloodgroup;

  let mtdMedication = document.createElement("td");
  mtdMedication.innerText = medication;

  medicalTr.appendChild(mtdDate);
  medicalTr.appendChild(mtdDoctor);
  medicalTr.appendChild(mtdGroup1);
  medicalTr.appendChild(mtdBmi);
  medicalTr.appendChild(mtdGroup2);
  medicalTr.appendChild(mtdMedication);

  adminMedical.appendChild(medicalTr);
}
  
window.addEventListener('load', async function() {
  ipfs = await new IPFS({host:'ipfs.infura.io',port:5001,protocol:'https'});
  client = await Ae.Aepp();
  contractInstance = await client.getContractInstance(contractSource,{contractAddress});

  contractInstance.methods.getPatient().then(async function(patient) {
    let patientInfo = patient.decodedResult;

    axios.get(`https://ipfs.io/ipfs/${patientInfo.image}`)
    .then(function(result){
      document.getElementById("patient-profile").innerHTML = "<div class='d-flex justify-content-center'><div class='card' style='width:250px'><img class='card-img-top' src='" + result.data + "' alt='" + patientInfo.name + "'><div class='card-body'><h4 class='card-title'>" + patientInfo.name + "</h4><p class='card-text'><b>Sex</b>: " + patientInfo.sex + "</p></div></div></div>";
    }).catch(function(error){
      document.getElementById("patient-profile").innerHTML = error;
    });

    let medicalRecords = (await contractInstance.methods.patientRecord()).decodedResult;
    medicalRecords.map(record => {
      recordDom(record.doctor, record.date, record.height, record.weight, record.bmi, record.genotype, record.bloodgroup, record.medicationGiven)
    })

  }).catch(function() {
    document.getElementById("patient-profile").innerHTML = "<p><button type='button' class='btn btn-primary-outline' data-toggle='modal' data-target='#patient-model'>Patient Registration</button></p>";
  });

  contractInstance.methods.getDoctor().then(async function(doctor) {
    let doctorInfo=doctor.decodedResult;

    axios.get(`https://ipfs.io/ipfs/${doctorInfo.image}`)
    .then(function(result){
      document.getElementById("doctor-profile").innerHTML = "<div class='d-flex justify-content-center'><div class='card' style='width:250px'><img class='card-img-top' src='" + result.data + "' alt='" + doctorInfo.name + "'><div class='card-body'><h4 class='card-title'>" + doctorInfo.name + "</h4></div></div></div>";
    }).catch(function(error){
      document.getElementById("doctor-profile").innerHTML = error;
    });

    await contractInstance.methods.allPatients()
    .then(function(patientResult) {
      let patientList = patientResult.decodedResult;

      patientList.map(list => {
        listDom(list[1].patientAddress, list[1].name)
      })
    })
   .catch(function(err){console.error(err)})
  })
  .catch(function() {
    document.getElementById("doctor-profile").innerHTML = "<p><button type='button' class='btn btn-primary-outline' data-toggle='modal' data-target='#doctor-model'>Doctor Registration</button><span class='text-warning'><b>Note</b>: Registrating cost 2æ</span></p>";
  });

  contractInstance.methods.owner().then(async function() {
    let allPatients = (await contractInstance.methods.allPatients()).decodedResult;
    allPatients.map(patient=>{
      patientDom(patient[1].name, patient[1].sex)
    });

    let allDoctors = (await contractInstance.methods.allDoctors()).decodedResult;
    allDoctors.map(doctor=>{
      doctorDom(doctor[1].name)
    });
    
    let allRecords = (await contractInstance.methods.allRecords()).decodedResult;
    allRecords.map(record=>{
      medicalDom(record[1].doctor, record[1].date, record[1].height, record[1].weight, record[1].bmi, record[1].genotype, record.bloodgroup, record[1].medicationGiven)
    });
  })
  .catch(function() {
    document.getElementById("admin-error").innerText = "Not Authoried";
  });
});
  
document.getElementById("select-patient").addEventListener("change",function(event){
  patientImage = event.currentTarget.files[0];
})
async function addPatient(event){
  event.preventDefault();

  let name = document.getElementById("patient-name").value;
  let sex = document.getElementById("patient-sex").value;

  document.getElementById("loader").style.display = "block";
  let reader = newFileReader();

  reader.onloadend = async function (){
    ipfs.add(reader.result, async function(err,res){
      if(err){
        console.error(err);
        return;
      }
      axios.get(`https://ipfs.io/ipfs/${res}`).then(async function(){
        await contractInstance.methods.addPatient(name, sex, res);
        window.location.reload();
      }).catch(function(error){
        document.getElementById("loader").style.display="none";
        console.error(error);
      })
    })
  } 
  
  reader.readAsDataURL(patientImage);
}
document.getElementById("add-patient").addEventListener("click",addPatient);

document.getElementById("select-doctor").addEventListener("change",function(event){
  doctorImage = event.currentTarget.files[0];
})
async function addDoctor(event){
  event.preventDefault();

  let name = document.getElementById("doctor-name").value;

  document.getElementById("loader").style.display = "block";
  let reader = newFileReader();

  reader.onloadend = async function (){
    ipfs.add(reader.result, async function(err,res){
      if(err){
        console.error(err);
        return;
      }
      axios.get(`https://ipfs.io/ipfs/${res}`).then(async function(){
        await contractInstance.methods.addDoctor(name, res);
        window.location.reload();
      }).catch(function(error){
        document.getElementById("loader").style.display="none";
        console.error(error);
      })
    })
  } 
  
  reader.readAsDataURL(doctorImage);
}
document.getElementById("add-doctor").addEventListener("click",addDoctor);

async function addMedicalRecord(event){
  event.preventDefault();

  let address = document.getElementById("patient-address").value;
  let date = new  Date().toDateString();
  let height = document.getElementById("patient-height").value;
  let weight = document.getElementById("patient-weight").value;
  let bmi = document.getElementById("patient-bmi").value;
  let genotype = document.getElementById("patient-genotype").value;
  let bloodgroup = document.getElementById("patient-bloodgroup").value;
  let medicationGiven = document.getElementById("medication-given").value;

  document.getElementById("loader").style.display = "block";
  await contractInstance.methods.addMedicalRecord(address, date, height, weight, bmi, genotype, bloodgroup, medicationGiven);
  document.getElementById("loader").style.display = "none";
}
document.getElementById("add-medical-record").addEventListener("click",addMedicalRecord);