//Helpers
let settings;

async function setDevicesTable() {
    let table = await settings.generateDevicesTable();
    document.getElementById("devicesTableBody").innerHTML = table.innerHTML;
}

async function setCoursesTable() {
    let table = await settings.generateCoursesTable();
    console.log(table)
    document.getElementById("tableBodyCoursesUser").innerHTML = table.innerHTML;
}

async function createNewTwoFactor() {

    // @ts-ignore
    let secret = base32.encode(Utilities.prototype.randomString(52));
    secret = secret.substr(0, secret.length - 4);

    let url = "otpauth://totp/" + username + "?secret=" + secret + "&issuer=S-Plan";

    // @ts-ignore
    $("#qrCodeContainer").qrcode({text: url});
    document.getElementById("addDeviceContainer").style.visibility = "visible";
    document.getElementById("confirmScanned").onclick = () => submitSF(secret);
    document.getElementById("addTOTPButton").innerText = "Cancel";
    document.getElementById("addTOTPButton").onclick = null;
    document.getElementById("addTOTPButton").className = "btn btn-danger";
}

async function submitSF(token) {
    (<HTMLButtonElement>document.getElementById("confirmScanned")).disabled = true;

    try {
        let password: string = (<HTMLInputElement>document.getElementById("confirmPassword")).value
        let response = await fetch(baseURL + "/user/auth/totp", {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + localStorage.getItem("token"),
                'Content-type': 'application/json; charset=utf-8'
            },
            body: {
                // @ts-ignore
                "password": password,
                "key": token,
                // @ts-ignore
                "alias": document.getElementById("tokenName").value
            }
        });

        if (response.status === 200) {
            let data = await response.json();
            document.getElementById("confirmScanned").style.visibility = "collapse";
            document.getElementById("submitConfirmCode").style.visibility = "visible";
            document.getElementById("confirmCode").style.visibility = "visible";
            document.getElementById("submitConfirmCode").onclick = () => confirmNewTwoFactor(data)
        } else if (response.status !== 200) {
            document.getElementById("confirmScanned").innerText = "FAILED";
            document.getElementById("confirmScanned").className = "btn btn-danger";
        }
    } catch (e) {
        document.getElementById("confirmScanned").innerText = "FAILED";
        document.getElementById("confirmScanned").className = "btn btn-danger";

        console.log("err: " + JSON.stringify(e));
    }
}

async function confirmNewTwoFactor(keyId) {
    (<HTMLButtonElement>document.getElementById("submitConfirmCode")).disabled = true;

    try {

        let response = await fetch(baseURL + "/user/auth/totp/verify", {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + localStorage.getItem("token"),
                'Content-type': 'application/json; charset=utf-8'
            },
            body: {
                // @ts-ignore
                "keyId": keyId,
                // @ts-ignore
                "code": document.getElementById("confirmCode").value
            }
        });
        if (response.status === 200) {
            document.getElementById("submitConfirmCode").innerText = "Success";
        }

    } catch (e) {
        let submitCodeButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('submitConfirmCode');
        submitCodeButton.innerText = "Re Try...";
        submitCodeButton.className = "btn btn-danger";
        submitCodeButton.disabled = false;

        console.log("err");
    }

}


//Frontend Dialogs
function removeAllDevicesConfirm() {
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("deleteDevicesConfirmView").style.visibility = "visible";
}

function closeAllView() {
    document.getElementById("confirmBox").style.visibility = "hidden";
    document.getElementById("deleteDevicesConfirmView").style.visibility = "hidden";
    document.getElementById("userCoursesFrame").style.visibility = "hidden";
    document.getElementById("twoFactorFrame").style.visibility = "hidden";
    document.getElementById("addDeviceContainer").style.visibility = "hidden";
    document.getElementById("qrCodeContainer").innerHTML = "";
}
/*
function openCourseView() {
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userCoursesFrame").style.visibility = "visible";
}

 */

function openTwoFactorFrame() {
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("twoFactorFrame").style.visibility = "visible";
}

function setFields(firstName, lastName, mail, courseContainer) {
    (<HTMLInputElement>document.getElementById('profileFirstName')).value = firstName;
    (<HTMLInputElement>document.getElementById('profileLastName')).value = lastName;
    (<HTMLInputElement>document.getElementById('profileMailAddress')).value = mail;
}

function setAppearanceSliders(mode) {
    if (mode === "dark") {
        (<HTMLInputElement>document.getElementById("toggleDarkModeButton")).checked = true;
        document.getElementById("themeAutomode").className = "btn btn-danger";
        (<HTMLInputElement>document.getElementById("toggleDarkModeButton")).disabled = false;
    } else if (mode === "light") {
        (<HTMLInputElement>document.getElementById("toggleDarkModeButton")).checked = false;
        document.getElementById("themeAutomode").className = "btn btn-danger";
        (<HTMLInputElement>document.getElementById("toggleDarkModeButton")).disabled = false;
    }
}

async function logout() {
    await serviceworkerConnector.logout();
    localStorage.clear();
}

addEventListener("DOMContentLoaded", async () => {
    let dbc = new DatabaseConnector();
    settings = new Settings(new ApiConnector(window.localStorage.getItem('token'), dbc));

    settings.setPushSlider = (active) => {
        (<HTMLInputElement>document.getElementById("togBtn")).checked = active;
    };

    await settings.setSliders();
    await settings.populateFields();
    await setDevicesTable();
    await setCoursesTable();
});

addEventListener('dataUpdate', async () => {
    await settings.setSliders();
    await settings.populateFields();
    await setDevicesTable();
    await setCoursesTable();
})
