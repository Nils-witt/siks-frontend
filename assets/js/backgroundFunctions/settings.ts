class Settings {
    apiConnector: ApiConnector;


    constructor(apiConnector: ApiConnector) {
        this.apiConnector = apiConnector;
    }

    async populateFields() {
        let firstName = localStorage.getItem('firstName');
        let lastName = localStorage.getItem('lastName');
        let mail = localStorage.getItem('mail');

        //setFields(firstName, lastName, mail);
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
            (<HTMLButtonElement>document.getElementById("toggleDarkModeButton")).disabled = true;
            document.getElementById("themeAutomode").className = "btn btn-success";
        }
    }

    setPushSlider(active: boolean) {

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
        console.log(element.checked);
        try {
            if (element.checked) {
                try {
                    await serviceworkerConnector.register();
                    await this.requestNotificationsPerms();
                    const applicationServerKey = Utilities.urlB64ToUint8Array("BBDWHJkJr4mFzQwkNVWKG_Lj6NTXFx38XxBvUCHV9Sm_U4xlvMYapvImY8BBUSd6UI8NkzNygJRZ5J_MMgsSTek");
                    const options = {applicationServerKey, userVisibleOnly: true};
                    const subscription = await serviceworkerConnector.registration.pushManager.subscribe(options);
                    let json = JSON.stringify(subscription);

                    await this.apiConnector.sendPushSubscription(json, window.localStorage.getItem("token"));
                } catch (e) {
                    console.log(e);
                }
            } else {
                //TODO Fix
                try {
                    await serviceworkerConnector.register();
                    serviceworkerConnector.registration.pushManager.getSubscription().then((subscription) => {
                        subscription.unsubscribe().then((successful) => {
                            console.log("PUSH deactivated")
                            //TODO remove from server
                        }).catch((e) => {
                            // Unsubscription failed
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

    requestNotificationsPerms(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const permission = await window.Notification.requestPermission();
            if (permission !== 'granted') {
                reject();
                throw new Error('Permission not granted for Notification');
            }
            resolve();
        });
    }

    generateDevicesTable(devices) {
        let table = document.createElement('tbody');

        for (let deviceId in devices) {
            if (devices.hasOwnProperty(deviceId)) {
                console.log(devices[deviceId])
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
        console.log(courses)
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

    async logout() {
        await this.apiConnector.revokeJWT(localStorage.getItem("token"));
        localStorage.clear();
        await serviceworkerConnector.logout();
        messageToServiceWorker({"command": "logout"});
        window.location.href = "/pages/login.html";
    }

}