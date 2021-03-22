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

    settings.sliderPush = <HTMLInputElement>document.getElementById("sliderPush");
    settings.sliderTheme = <HTMLButtonElement>document.getElementById("sliderTheme");
    settings.buttonTheme = <HTMLButtonElement>document.getElementById("buttonThemeAuto");
    settings.fieldFirstname = <HTMLInputElement>document.getElementById("fieldFirstname");
    settings.fieldLastname = <HTMLInputElement>document.getElementById("fieldLastname");
    settings.tableCourses = <HTMLTableElement>document.getElementById("tableBodyCoursesUser");
    settings.tableDevices = <HTMLTableElement>document.getElementById("tableBodyDevicesUser");
    settings.buttonMoodle = <HTMLButtonElement>document.getElementById("moodlebtn");
    settings.buttonTwoFactor = <HTMLButtonElement>document.getElementById("twoFactorButton");
    settings.textTwoFactorStatus = <HTMLButtonElement>document.getElementById("spanTwoFactorStatus");
    settings.totpAddContainer = <HTMLButtonElement>document.getElementById("twoFactorAddRow");
    settings.totpCOdeField = <HTMLInputElement>document.getElementById("totpCode");
    settings.imgQrCode = <HTMLInputElement>document.getElementById("qrCodeImg");
    settings.buttonTwoFactorCodeEntry = <HTMLButtonElement>document.getElementById("buttonTwoFactorCodeEntry");

    Settings.global = settings;
    await settings.populateSite();
});

addEventListener('dataUpdate', async () => {
    await settings.setSliders();
    await settings.populateFields();
})


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