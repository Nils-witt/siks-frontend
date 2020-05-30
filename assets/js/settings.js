//Functions
function randomString(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


async function pushSlider(element) {
    console.log(element.checked);
    try{
        if(element.checked){
            await enablePush();
        }else{
            await disablePush();
        }
    } catch(e){
        element.checked = false;
    }
}

function getFieldsData(){
    let data = null;

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            let data = this.responseText;
            try {
                JSON.parse(data)
            } catch (e) {
                console.log("Invalid Data from Server")
            }
            populateFields(JSON.parse(data));
        }
    });

    xhr.open("GET", baseURL + "/user/");
    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
    xhr.setRequestHeader("Accept", "*/*");

    xhr.send(data);
    console.log("Loading....")
}

function populateFields(profile){
    console.log(profile);
    username = profile.username;
    if(profile.hasOwnProperty("devices")){
        populateDevicesTable(profile["devices"]);
    }
    if(profile.hasOwnProperty("courses")){
        populateCoursesTable(profile["courses"]);
    }

    if(profile.hasOwnProperty("mails")){
        if(profile["mails"].hasOwnProperty(0)){
            console.log(profile["mails"][0]);
            document.getElementById("profileMailAddress").value = profile["mails"][0]["address"];
        }
    }
}

function populateDevicesTable(devices) {
    let table = document.getElementById("devicesTableBody");

    for (let deviceId in devices){
        console.log(devices[deviceId])
        let device = devices[deviceId];
        let row = document.createElement("tr");

        let type = document.createElement("td");
        let connectedSince = document.createElement("td");
        let id = document.createElement("td");

        type.innerText = device["platform"];
        connectedSince.innerText = "N/A";
        if(device["platform"] == "WP"){
            let deviceData = JSON.parse(device["device"]);
            id.innerText = deviceData.endpoint.substr(0,100)
        }else {
            id.innerText = device["device"];
        }


        row.append(type);
        row.append(connectedSince);
        row.append(id);

        table.append(row);
    }
}

function populateCoursesTable(courses){
    let tableBodyBox = document.getElementById('tableBodyCoursesUser');

    for (let i = 0; i < courses.length; i++) {
        let course = courses[i];
        let rowElement = document.createElement('tr');
        let gradeTd = document.createElement('td');
        let subjectTd = document.createElement('td');
        let groupTd = document.createElement('td');

        gradeTd.innerText = course["grade"];
        subjectTd.innerText = course["subject"];
        groupTd.innerText = course["group"];

        rowElement.append(gradeTd);
        rowElement.append(subjectTd);
        rowElement.append(groupTd);

        tableBodyBox.append(rowElement);
    }
}

async function createNewTwoFactor(){
    let secret = base32.encode(randomString(52));
    secret = secret.substr(0,secret.length -4);
    let url = "otpauth://totp/" + username + "?secret=" + secret + "&issuer=S-Plan";
    console.log(url);
    $("#qrCodeContainer").qrcode({text:url});
    document.getElementById("addDeviceContainer").style.visibility = "visible";
    document.getElementById("confirmScanned").onclick = () => submitSF(secret);
    document.getElementById("addTOTPButton").innerText = "Cancel";
    document.getElementById("addTOTPButton").onclick = null;
    document.getElementById("addTOTPButton").className = "btn btn-danger";
}
async function submitSF(token){
    document.getElementById("confirmScanned").disabled = true;
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status == 200) {
            console.log(this.responseText);
            console.log("DONE");
            document.getElementById("confirmScanned").style.visibility = "collapse";
            document.getElementById("submitConfirmCode").style.visibility = "visible";
            document.getElementById("confirmCode").style.visibility = "visible";
            document.getElementById("submitConfirmCode").onclick = () => confirmNewTwoFactor(this.responseText)
        } else if (this.readyState === 4 && this.status != 200) {
            console.log(this.responseText);
            document.getElementById("confirmScanned").innerText = "FAILED";
            document.getElementById("confirmScanned").className = "btn btn-danger";
        }
    });
    xhr.onerror = () => {
        document.getElementById("confirmScanned").innerText = "FAILED";
        document.getElementById("confirmScanned").className = "btn btn-danger";
        console.log("err");
    };
    xhr.open("POST", baseURL + "/user/auth/totp");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader("Accept", "*/*");
    xhr.send(JSON.stringify(    {
        "password": document.getElementById("confirmPassword").value,
        "key": token,
        "alias": document.getElementById("tokenName").value
    }));

}

async function confirmNewTwoFactor(keyId){
    document.getElementById("submitConfirmCode").disabled = true;
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status == 200) {
            document.getElementById("submitConfirmCode").innerText = "Success";
        } else if (this.readyState === 4 && this.status != 200) {
            console.log(this.responseText);
        }
    });
    xhr.onerror = () => {
        document.getElementById("submitConfirmCode").innerText = "Re Try...";
        document.getElementById("submitConfirmCode").className = "btn btn-danger";
        document.getElementById("submitConfirmCode").disabled = false;
        console.log("err");
    };

    xhr.open("POST", baseURL + "/user/auth/totp/verify");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader("Accept", "*/*");
    let code = document.getElementById("confirmCode").value;
    xhr.send(JSON.stringify(    {
        "keyId":keyId,
        "code": code
    }));
}

async function removeAllDevices(){
	
}

//Dialogs
function removeAllDevicesConfirm(){
	document.getElementById("confirmBox").style.visibility = "visible";
	document.getElementById("deleteDevicesConfirmView").style.visibility = "visible";
}

function closeAllView(){
	document.getElementById("confirmBox").style.visibility = "hidden";
	document.getElementById("deleteDevicesConfirmView").style.visibility = "hidden";
    document.getElementById("userCoursesFrame").style.visibility = "hidden";
    document.getElementById("twoFactorFrame").style.visibility = "hidden";
    document.getElementById("addDeviceContainer").style.visibility = "hidden";
    document.getElementById("qrCodeContainer").innerHTML = "";
}

function openCourseView() {

    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userCoursesFrame").style.visibility = "visible";
}
function openTwoFactorFrame() {

    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("twoFactorFrame").style.visibility = "visible";
}

function toggleDarkMode(element) {
    if(element.checked){
        localStorage.setItem("dark","true");
    }else {
        localStorage.setItem("dark","false");
    }
    window.location.reload();
}


if(window.localStorage.getItem("push") == "true"){
    document.getElementById("togBtn").checked = true;
}
if(window.localStorage.getItem("dark") == "true"){
    document.getElementById("toggleDarkModeButton").checked = true;
}

document.addEventListener("DOMContentLoaded", async function(event) {
    getFieldsData();
});
