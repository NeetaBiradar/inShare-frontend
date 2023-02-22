const drop= document.querySelector(".drop-zone");
const fileinput= document.querySelector("#fileInput");
const browsebtn= document.querySelector(".browse");

const progressContainer= document.querySelector(".progress-container");
const bgProgress= document.querySelector(".bg-progress");
const progressBar= document.querySelector(".progress-bar");
const per=document.querySelector("#percent");

const fileURL=document.querySelector("#fileURL");
const sharingContainer=document.querySelector(".sharing-container");

const copyBtn =document.querySelector("#copybtn");

const emailForm=document.querySelector("#emailForm");

const toast=document.querySelector(".toast");
const maxAllowed= 100*1024*1024;

const host= "https://share-q33g.onrender.com";
const uploadURL= `${host}/api/files`;
const emailURL= `${host}/api/files/send`;

drop.addEventListener("dragover", (e)=>{
    e.preventDefault();
    if(!drop.classList.contains("dragged"))
    {
        drop.classList.add("dragged");
    }
    
})

drop.addEventListener("dragleave",()=>{
    drop.classList.remove("dragged");
})

drop.addEventListener("drop",(e)=>{
    e.preventDefault();
    drop.classList.add("dragged");
    const files=e.dataTransfer.files;
    console.log(files);
    if(files.length)
    {
        
        fileinput.files = files;
        uploadFile();
    }
    
});

fileinput.addEventListener("change", ()=>{
    uploadFile();
})

browsebtn.addEventListener("click", ()=>
{
    fileinput.click();
})

const uploadFile=()=>{

    if(fileinput.files.length>1)
    {
        fileinput="";
        showToast("Upload only 1 file!");
        return
    }
    
    const file= fileinput.files[0];

    if(file.size>maxAllowed)
    {
        showToast("You can upload upto only 100MB");
    }
    const formData= new FormData();
    formData.append("myFile",file);

    progressContainer.style.display="block";

    const xhr= new XMLHttpRequest();
    xhr.onreadystatechange=function (){
        if(xhr.readyState == XMLHttpRequest.DONE)
        {
            console.log(xhr.response);
            showLink(JSON.parse(xhr.response));
        }
    }

    xhr.upload.onprogress=updateProgress;
    xhr.upload.onerror =()=>{
        showToast(`Error in upload: ${xhr.status}`);
    }
    xhr.open("POST", uploadURL);
    xhr.send(formData);
    
};

const updateProgress= (e) =>{
    const percent=Math.round((e.loaded / e.total) * 100);
    //console.log(percent);
    bgProgress.style.width=`${percent}%`;
    per.innerHTML=percent;
    progressBar.style.transform= `scaleX(${percent / 100})`;
};

const showLink= ({file: URL})=>{

    emailForm[2].removeAttribute("disabled");
    fileinput.value = "";
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    console.log(URL);
    fileURL.value = URL;

}

copyBtn.addEventListener("click", ()=>{
    fileURL.select();
    document.execCommand("copy");
    showToast("Link Copied");
});

emailForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    console.log("submit form");
    const url= fileURL.value;

    const formData={
        uuid: url.split("/").splice(-1,)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value

    }

    emailForm[2].setAttribute("disabled", "true");
    console.log(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then(({success})=>{
            if(success){
                sharingContainer.style.display="none";
                showToast("Email Sent");
            }
        })
});

const showToast=(msg)=>{
    let toastTimer;
    toast.innerText=msg;
    toast.style.transform="translate(-50% , 0px)"
    clearTimeout(toastTimer)
    toastTimer=setTimeout(()=>{
        toast.style.transform="translate(-50% , 60px)";
    },2000);
}