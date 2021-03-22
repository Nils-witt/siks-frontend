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

const PUSHPLATFROMS: string[] = ["Telegram", "APNS", "Firebase", "WebPush"]

class Settings {
    static global: Settings;
    sliderPush: HTMLInputElement;
    fieldFirstname: HTMLInputElement;
    fieldLastname: HTMLInputElement;
    tableDevices: HTMLTableElement;
    tableCourses: HTMLTableElement;
    buttonMoodle: HTMLButtonElement;
    buttonTwoFactor: HTMLButtonElement;
    textTwoFactorStatus: HTMLSpanElement;
    totpAddContainer: HTMLDivElement;
    imgQrCode: HTMLImageElement;
    buttonTwoFactorCodeEntry: HTMLButtonElement;
    totpCOdeField: HTMLInputElement;

    totpRequestId: string;

    async populateSite() {
        let user: User = await ApiConnector.loadUserProfile();
        this.fieldFirstname.value = Global.user.firstName;
        this.fieldLastname.value = Global.user.lastName;
        await this.generateCoursesTable();
        await this.generateDevicesTable();

        if (user.secondFactor == null) {
            this.buttonTwoFactor.innerText = "Fehler"
        } else if (user.secondFactor === 0) {
            this.buttonTwoFactor.innerText = "Aktivieren";
            this.buttonTwoFactor.disabled = false;
            this.buttonTwoFactor.className = "btn btn-success";
            this.buttonTwoFactor.onclick = () => {
                Settings.global.obtainNewTOTP();
                this.totpAddContainer.style.visibility = "visible";
                this.totpAddContainer.style.height = "auto";
                this.textTwoFactorStatus.innerText = "Lade Daten.....";
            }

            this.textTwoFactorStatus.innerText = "Nicht aktiv"
        } else if (user.secondFactor === 1) {
            this.buttonTwoFactor.innerText = "Deaktivieren"
            this.buttonTwoFactor.disabled = false;
            this.buttonTwoFactor.className = "btn btn-danger";
            this.buttonTwoFactor.onclick = () => {
                Settings.global.disableTOTP();
            }
            this.textTwoFactorStatus.innerText = "Aktiv"
        }

        if (user.moodleUID == null) {
            this.setMoodleOptions(false);
        } else {
            this.setMoodleOptions(true);
        }

        if (window.localStorage.getItem("PUSH_NOTIFICATIONS") === "true") {
            this.setPushSlider(true);
        } else {
            this.setPushSlider(false);
        }
    }

    setPushSlider(active: boolean) {
        this.sliderPush.checked = active;
    }

    async obtainNewTOTP() {
        console.log("Started");
        let resourceData = await ApiConnector.getNewTOTPRegistration();
        this.totpRequestId = resourceData.requestId;
        this.imgQrCode.src = resourceData.qr;
        this.textTwoFactorStatus.innerText = "Warte auf Benutzereingabe...";
        this.buttonTwoFactorCodeEntry.disabled = false;
        this.buttonTwoFactorCodeEntry.onclick = () => {
            Settings.global.submitValidationCode();
        }
    }

    async submitValidationCode() {
        let code: number = parseInt(this.totpCOdeField.value);
        let res
        try {
            res = await ApiConnector.validateTOTPRegistration(code);
        }catch (e) {
            console.log(e);
        }

        if(res.hasOwnProperty("err")){
            if(res.err === "Invalid code"){
                this.buttonTwoFactorCodeEntry.disabled = false;
                this.textTwoFactorStatus.innerText = "Ungültiger Code";
            }
        }else{
            window.location.reload();
        }
    }

    async disableTOTP() {
        this.textTwoFactorStatus.innerText = "Warte auf Benutzereingabe...";
        this.totpAddContainer.style.visibility = "visible";
        this.totpAddContainer.style.height = "auto";
        this.buttonTwoFactorCodeEntry.disabled = false;
        this.buttonTwoFactorCodeEntry.onclick = () => {
            Settings.global.submitDeactivationCode();
        }
    }

    async submitDeactivationCode() {
        this.buttonTwoFactorCodeEntry.disabled = true;
        let code: number = parseInt(this.totpCOdeField.value);
        let res
        try {
            res = await ApiConnector.deactivateTOTP(code);
        }catch (e) {
            console.log(e);
        }
        if(res.hasOwnProperty("err")){
            if(res.err === "Invalid code"){
                this.buttonTwoFactorCodeEntry.disabled = false;
                this.textTwoFactorStatus.innerText = "Ungültiger Code";
            }
        }else{
            window.location.reload();
        }
    }

    async sliderPushNotification(element) {
        try {
            if (element.checked) {
                try {
                    await Notifications.requestNotificationsPerms();
                    const applicationServerKey = Utilities.urlB64ToUint8Array("BBDWHJkJr4mFzQwkNVWKG_Lj6NTXFx38XxBvUCHV9Sm_U4xlvMYapvImY8BBUSd6UI8NkzNygJRZ5J_MMgsSTek");
                    const options = {applicationServerKey, userVisibleOnly: true};
                    const subscription = await ServiceworkerConnector.registration.pushManager.subscribe(options);
                    let json = JSON.stringify(subscription);

                    await ApiConnector.sendPushSubscription(json);
                } catch (e) {
                    console.log(e);
                }
            } else {
                try {
                    ServiceworkerConnector.registration.pushManager.getSubscription().then((subscription) => {
                        subscription.unsubscribe().then((successful) => {
                            console.log("PUSH deactivated")
                        });
                    });
                    window.localStorage.setItem("PUSH_NOTIFICATIONS", 'false');
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (e) {
            element.checked = false;
        }
    }

    setMoodleOptions(isActive: boolean) {
        if (isActive) {
            this.buttonMoodle.innerText = "Moodle: deaktivieren";
            this.buttonMoodle.onclick = async () => {
                await ApiConnector.disableMoodleAccount();
                await this.populateSite();
            };
        } else {
            this.buttonMoodle.innerText = "Moodle: aktiviren";
            this.buttonMoodle.onclick = async () => {
                await ApiConnector.enableMoodleAccount();
                await this.populateSite();
            };
        }
    }

    generateDevicesTable() {
        return new Promise(async (resolve, reject) => {
            let devices: Device[] = await ApiConnector.loadUserDevices();
            let container = document.createElement('tbody');

            for (let deviceId in devices) {
                if (devices.hasOwnProperty(deviceId)) {
                    let device = devices[deviceId];
                    console.log(device)
                    let row = document.createElement("tr");

                    let type = document.createElement("td");
                    let connectedSince = document.createElement("td");
                    let info = document.createElement("td");
                    let actions = document.createElement("td");

                    type.innerText = PUSHPLATFROMS[device["platform"]];
                    connectedSince.innerText = device["timeAdded"];
                    if (device["platform"] === 3) {
                        info.innerText = "WebPush Platform"
                    } else if (device["platform"] === 0) {
                        info.innerText = "ID: " + device['id'];
                    } else {
                        info.innerText = device["id"];
                    }

                    row.append(type);
                    row.append(connectedSince);
                    row.append(info);
                    row.append(actions);

                    container.append(row);
                }
            }
            this.tableDevices.innerHTML = container.innerHTML;
            resolve(container)
        });
    }

    generateCoursesTable(): Promise<HTMLTableSectionElement> {
        return new Promise(async (resolve, reject) => {

            let courses: Course[] = await ApiConnector.loadUserCourses();
            let tableBodyBox = document.createElement('tbody');

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
            this.tableCourses.innerHTML = tableBodyBox.innerHTML;
            resolve(tableBodyBox);
        });
    }
}