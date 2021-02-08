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

class Settings {
    sliderPush: string;
    sliderTheme: string;
    buttonTheme: string;
    fieldFirstname: HTMLInputElement;
    fieldLastname: HTMLInputElement;
    fieldEmail: HTMLInputElement;

    async populateFields() {
        this.fieldFirstname.value = localStorage.getItem('firstName');
        this.fieldLastname.value = localStorage.getItem('lastName');
        this.fieldEmail.value = localStorage.getItem('mail');
        //console.log(document.getElementById(this.fieldFirstname))
        console.log(localStorage.getItem('firstName'))
        console.log("D")
    }

    setSliders() {
        if (window.localStorage.getItem("push") === "true") {
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

    generateDevicesTable(devices) {
        let table = document.createElement('tbody');

        for (let deviceId in devices) {
            if (devices.hasOwnProperty(deviceId)) {
                let device = devices[deviceId];
                let row = document.createElement("tr");

                let type = document.createElement("td");
                let connectedSince = document.createElement("td");
                let info = document.createElement("td");
                let actions = document.createElement("td");

                type.innerText = device["_platform"];
                connectedSince.innerText = "N/A";
                if (device["_platform"] === "WP") {
                    let deviceData = JSON.parse(device["_id"]);
                    info.innerText = "WebPush Platform"
                } else if (device["_platform"] === "TG") {
                    info.innerText = "ID: " + device['_id'];
                } else {
                    info.innerText = device["_id"];
                }

                row.append(type);
                row.append(connectedSince);
                row.append(info);
                row.append(actions);

                table.append(row);
            }
        }
        return table;
    }

    generateCoursesTable(courses) {
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
        return tableBodyBox;
    }
}