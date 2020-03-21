
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
        let contractAddress="ct_26nkg4ncfetry1nUZwBN2dPViFNLLHGZkMq4t2w3PEKWXsxpAn";
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
            Map.lookup_default(Call.caller,state.recordManager,[])
              
        entrypoint getpatientsMedicalrecordListofPatients()=
            Map.lookup_default(Call.caller,state.patientsMedicalrecord,[])
            
    `;
    let patientImage="null";
    let ipfs="null";
    document.getElementById("input-image").addEventListener("change",function(event){
        patientImage=event.currentTarget.files[0];
        console.log(patientImage);
    })
        
        window.addEventListener('load',async function(){
            ipfs=await new IPFS({host:'ipfs.infura.io',port:5001,protocol:'https'});
            console.log(ipfs);
            client=await Ae.Aepp();
            contractInstance=await client.getContractInstance(contractSource,{contractAddress});
            let allPatients=(await contractInstance.methods.getrecordManagerListofPatients()).decodedResult;
            let allPatientsMedicalInfo=(await contractInstance.methods.getpatientsMedicalrecordListofPatients()).decodedResult;
            document.getElementById("loader").style.display="none";
            console.log(allPatients,"all patients");
            allPatients=map(patients=>{
                axios.get(`https://ipfs.io/ipfs/${book.ipfsHash}`).then(function(result){
                    addPatientToDom(patient.name,patient.age,result.data);
                }).catch(function(error){
                    console.error(error)
                })
                
            });
            
        });
        
        async function handleSubmitPatient(){
            let name=document.getElementById("input-patientsname").value;
            let age=document.getElementById("input-age").value;

            if(name.trim()!=""&age.trim()!=""&&patientImage!=null){
                document.getElementById("loader").style.display="block";
                let reader=newFileReader();
                reader.onloadend=async function (){
                ipfs.add(reader.result, async function(err,res){
                    if(err){
                        console.error(err);
                        return;
                    }
                    console.log(res);
                    axios.get(`https://ipfs.io/ipfs/${res}`).then(async function(result){
                        await contractInstance.methods.registerPatient(name,age,res);
                        document.getElementById("loader").style.display="none";
                        addPatientToDom(name,age,result.data);
                    }).catch(function(error){
                        document.getElementById("loader").style.display="none";
                        console.error(error);
                    })
                    
                })
                console.log(reader.result);
                } 
                
                reader.readAsDataURL(patientImage);
                
            }
            
        }

        document.getElementById("submit-patient").addEventListener("click",handleSubmitPatient);
        function addPatientToDom(name,age,sex,dateofadmission,patientId,healthcondition,address,phonenumber,nextofkin,nextofkinsphonenumber,imageData){
            let allPatients=document.getElementById("patient-list-section");

            let patientsTextDiv=document.createElement("div");
            
            let patientsImage=document.createElement("img");
            patientsImage.src="imageData";
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

            patientsTextDiv.appendChild(patientsNameParagraph);
            patientsTextDiv.appendChild(patientsAgeParagraph);
            patientsTextDiv.appendChild(patientsSexParagraph);
            patientsTextDiv.appendChild(patientsDateOfAdmissionParagraph);
            patientsTextDiv.appendChild(patientsIDParagraph);
            patientsTextDiv.appendChild(patientsHealthConditionParagraph);
            patientsTextDivv.appendChild(patientsAddressParagraph);
            patientsTextDiv.appendChild(patientsPhoneNumberParagraph);
            patientsTextDiv.appendChild(patientsNextOfKinParagraph);
            patientsTextDiv.appendChild(patientsNextOfKinsPhoneNumberParagraph);

            allPatients.appendChild(patientsImage);
            allPatients.appendChild(patientsTextDiv);
        }

        


        