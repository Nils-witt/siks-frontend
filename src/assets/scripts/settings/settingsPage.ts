/*
 * S-Plan
 * Copyright (c) 2021 Nils Witt
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *   * Neither the name of the author nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*
VARs
 */
let settings;

/*
STARTUP
 */
addEventListener("DOMContentLoaded", async () => {
    settings = new Settings();

    settings.sliderPush = document.getElementById("sliderPush");
    settings.sliderTheme = <HTMLButtonElement>document.getElementById("sliderTheme");
    settings.buttonTheme = <HTMLButtonElement>document.getElementById("buttonThemeAuto");
    settings.fieldFirstname = <HTMLInputElement>document.getElementById("fieldFirstname");
    settings.fieldLastname = <HTMLInputElement>document.getElementById("fieldLastname");
    settings.fieldEmail = <HTMLInputElement>document.getElementById("fieldEmail");
    settings.tableCourses = <HTMLTableElement>document.getElementById("tableBodyCoursesUser")
    settings.tableDevices = <HTMLTableElement>document.getElementById("tableBodyDevicesUser")

    settings.populateSite();
});

addEventListener('dataUpdate', async () => {
    await settings.setSliders();
    await settings.populateFields();
})

async function createNewTwoFactor() {

    // @ts-ignore
    let secret = base32.encode(Utilities.prototype.randomString(52));
    secret = secret.substr(0, secret.length - 4);

    let url = "otpauth://totp/" + User.username + "?secret=" + secret + "&issuer=S-Plan";

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
        let response = await fetch(localStorage.getItem("HOST_URL") + "/user/auth/totp", {
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

        let response = await fetch(localStorage.getItem("HOST_URL") + "/user/auth/totp/verify", {
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

function openCourseView() {
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userCoursesFrame").style.visibility = "visible";
}

function openTwoFactorFrame() {
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("twoFactorFrame").style.visibility = "visible";
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