let isOpen=false;
        function toggleNavBar(){
            console.log("clicked"); 
            if(isOpen){
                isOpen=false;
                document.getElementById("header-options").classList.remove("open-nav");
                document.getElementById("header-options").classList.add("close-nav");
            }else{
                isOpen=true;
                document.getElementById("header-options").classList.remove("close-nav");
                document.getElementById("header-options").classList.add("open-nav");

            }
        }
        document.getElementById("nav-toggle").addEventListener("click",toggleNavBar);
        document.getElementById("addPatient").addEventListener("click",toggleNavBar);
        document.getElementById("viewPatients").addEventListener("click",toggleNavBar);
        let contractInstance=null;
        let client=null;
        let contractAddress="ct_29T5fodtK95iDLiJsNTmwVb1F8eVp2P6PE59Z4EYHhY8zjLLUh";
        let contractSource=`
        contract HospitalManagementSystemContract=
            record patientsPersonalInfo={
                nameOfPatient:string,
                age:string,
                sex:string,
                dateOfAdmission:string,
                patientID:string,
                patientHealthCondition:string,
                patientHomeAddress:string,
                patientsPhoneNumber:string,
                nextofkin:string,
                nextofkinPhoneNumber:string,
                ipfsHash:string 
                }
            record patientsMedicalInfo={
                height:string,
                weight:string,
                bmi:string,
                genotype:string,
                bloodgroup:string,
                patientsMedicalHistory:string,
                medicationGiven:string
                }
            record state={
                recordManager: map(address,list(patientsPersonalInfo)),
                patientsMedicalrecord: map(address,list(patientsMedicalInfo))
                }
            stateful entrypoint init()={recordManager={},patientsMedicalrecord={}}

            stateful entrypoint registerpatientsPersonalInfo(nameOfPatient':string,age':string,sex':string,dateOfAdmission':string,patientID':string,patientHealthCondition':string,patientHomeAddress':string,patientsPhoneNumber':string,nextofkin':string,nextofkinPhoneNumber':string,ipfsHash':string)=
                let recordManagerListofPatients=Map.lookup_default(Call.caller,state.recordManager,[])
                let newPatientInfo={nameOfPatient=nameOfPatient',age=age',sex=sex',dateOfAdmission=dateOfAdmission',patientID=patientID',patientHealthCondition=patientHealthCondition',patientHomeAddress=patientHomeAddress',patientsPhoneNumber=patientsPhoneNumber',nextofkin=nextofkin', nextofkinPhoneNumber=nextofkinPhoneNumber',ipfsHash=ipfsHash'}
                let newlistofPatients=newPatientInfo::recordManagerListofPatients
                put(state{recordManager[Call.caller]=newlistofPatients})


            stateful entrypoint registerpatientsMedicalInfo(height':string,weight':string,bmi':string,genotype':string,bloodgroup':string,patientsMedicalHistory':string,medicationGiven':string)=
                let patientsMedicalrecordListofPatients=Map.lookup_default(Call.caller,state.patientsMedicalrecord,[])
                let newPatientMedicalInfo={height=height',weight=weight',bmi=bmi',genotype=genotype',bloodgroup=bloodgroup',patientsMedicalHistory=patientsMedicalHistory',medicationGiven=medicationGiven'}
                let newlistofPatientsMedicalInfo=newPatientMedicalInfo::patientsMedicalrecordListofPatients
                put(state{patientsMedicalrecord[Call.caller]=newlistofPatientsMedicalInfo})

            entrypoint getrecordManagerListofPatients()=
                state.recordManager[Call.caller]   

            entrypoint getpatientsMedicalrecordListofPatients()=
                state.patientsMedicalrecord[Call.caller]

    `;
        
        window.addEventListener('load',async function(){
            client=await Ae.Aepp();
            contractInstance=await client.getContractInstamce(contractSource,{contractAddress});
            let allPatients=(await contractInstance.methods.getrecordManagerListofPatients()).decodedResult;
            let allPatientsMedicalInfo=(await contractInstance.methods.getpatientsMedicalrecordListofPatients()).decodedResult;
            console.log(allPatients,"all patients");
            allPatients=map(patients=>{
                addPatientToDom(patient.name,patient.age);
            });
            document.getElementById("loader").style.display="none";
        });
        
        async function handleSubmitPatient(){
            let name=document.getElementById("input-patientsname").value;
            let age=document.getElementById("input-age").value;

            if(name.trim()!=""&age.trim()!=""){
                document.getElementById("loader").style.display="block";
                await contractInstance.methods.registerPatient(name,age);
                addPatientToDom(name,age);
                document.getElementById("loader").style.display="none";
            }
        }

        document.getElementById("submit-patient").addEventListener("click",handleSubmitPatient);
        function addPatientToDom(name,age,sex,dateofadmission,patientId,healthcondition,address,phonenumber,nextofkin,nextofkinsphonenumber){
            let allPatients=document.getElementById("patient-list-section");

            let patientList = document.createElement('p');
            patientList.innerText="List Of Patients";

            let newPatientDiv=document.getElementById("div");
            newPatientDiv.classList.add("patient");

            let patientsNameParagraph=document.createElement("p");
            patientsNameParagraph.innerText=name;

            let patientsAgeParagraph=document.createElement("p");
            patientsAgeParagraph.innerText=age;
            
            let patientsSexParagraph=document.createElement("p");
            patientsSexParagraph.innerText=sex;

            let patientsDateOfAdmissionParagraph=document.createElement("p");
            patientsDateOfAdmissionParagraph.innerText=dateofadmission;

            let patientsIDParagraph=document.createElement("p");
            patientsIDParagraph.innerText=patientId;

            let patientsHealthConditionParagraph=document.createElement("p");
            patientsHealthConditionParagraph.innerText=healthcondition;

            let patientsAddressParagraph=document.createElement("p");
            patientsAddressParagraph.innerText=address;

            let patientsPhoneNumberParagraph=document.createElement("p");
            patientsPhoneNumberParagraph.innerText=phonenumber;

            let patientsNextOfKinParagraph=document.createElement("p");
            patientsNextOfKinParagraph.innerText=nextofkin;

            let patientsNextOfKinsPhoneNumberParagraph=document.createElement("p");
            patientsNextOfKinsPhoneNumberParagraph.innerText=nextofkinsphonenumber;

            newPatientDiv.appendChild(patientsNameParagraph);
            newPatientDiv.appendChild(patientsAgeParagraph);
            newPatientDiv.appendChild(patientsSexParagraph);
            newPatientDiv.appendChild(patientsDateOfAdmissionParagraph);
            newPatientDiv.appendChild(patientsIDParagraph);
            newPatientDiv.appendChild(patientsHealthConditionParagraph);
            newPatientDiv.appendChild(patientsAddressParagraph);
            newPatientDiv.appendChild(patientsPhoneNumberParagraph);
            newPatientDiv.appendChild(patientsNextOfKinParagraph);
            newPatientDiv.appendChild(patientsNextOfKinsPhoneNumberParagraph);

            allPatients.appendChild(patientList);
            allPatients.appendChild(newPatientDiv);
        }

        


        