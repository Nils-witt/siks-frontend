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
    sliderPush: string;
    sliderTheme: string;
    buttonTheme: string;
    fieldFirstname: HTMLInputElement;
    fieldLastname: HTMLInputElement;
    fieldEmail: HTMLInputElement;
    tableDevices: HTMLTableElement;
    tableCourses: HTMLTableElement;

    async populateSite() {
        this.fieldFirstname.value = User.firstName;
        this.fieldLastname.value = User.lastName;
        this.fieldEmail.value = User.mails;
        await this.generateCoursesTable();
        await this.generateDevicesTable();
    }

    setSliders() {
        if (window.localStorage.getItem("PUSH_NOTIFICATIONS") === "true") {
            this.setPushSlider(true);
        } else {
            this.setPushSlider(false);
        }

        if (window.localStorage.getItem("theme") === "dark" || window.localStorage.getItem("theme") === "light") {
            setAppearanceSliders(window.localStorage.getItem("theme"));
        } else {
            (<HTMLButtonElement>document.getElementById(this.sliderTheme)).disabled = true;
            document.getElementById(this.buttonTheme).className = "btn btn-success";
        }
    }

    setPushSlider(active: boolean) {
        //TODO add context
    }

    toggleDarkModeAuto() {
        if (window.localStorage.getItem("theme") === "dark" || window.localStorage.getItem("theme") === "light") {
            window.localStorage.setItem("theme", "auto");
        } else {
            window.localStorage.setItem("theme", "dark");
        }
        this.setSliders();
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
                            //TODO remove from server
                        }).catch((e) => {
                            //TODO add error listener
                        });
                    });
                    window.localStorage.setItem("push", 'false');
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (e) {
            element.checked = false;
        }
    }

    darkModeToggleSwitch(element) {
        if (element.checked === true) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    }

    generateDevicesTable() {
        return new Promise(async (resolve, reject) => {
            let devices: Device[] = await ApiConnector.loadDevices();
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

            let courses: Course[] = await ApiConnector.loadCourses();
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