let apiKey;
let username;
let locationLogin = "https://splan.nils-witt.de/pages/login.html?by=sw";

let swReg;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js', {}).then(function (reg) {
        console.log('Registrierung erfolgreich. Scope ist ' + reg.scope);
        if (!reg.active) {
            console.log('SW not active');
            location.reload();
        }
        swReg = reg;
    }).catch(function (error) {
        console.log('Registrierung fehlgeschlagen mit ' + error);
    });
}

navigator.serviceWorker.addEventListener("message", (evt) => {

    let data = evt.data;
    if (data.Type == "apiKey") {
        if (data.Key == null) {
            window.location.href = locationLogin;
        } else {
            apiKey = data.Key;
        }
    } else if (data.Type == "username") {
        username = data.Username
    }
});

function messageToServiceWorker(msg) {
    navigator.serviceWorker.controller.postMessage(msg);
}

function load() {
    messageToServiceWorker({"command": "getApiKey"});
    messageToServiceWorker({"command": "getUsername"});
}

async function logout() {
    await disablePush();
    await revokeJWT(localStorage.getItem("token"));
    localStorage.clear();
    messageToServiceWorker({"command": "logout"});
    window.location.href = "/pages/login.html";
}

async function goToMainPage(){
    window.location.href = "/pages/"+ window.localStorage.getItem("userType") + "/index.html";
}

async function requestNotificationsPerms() {
    return new Promise(async function (resolve, reject) {
        const permission = await window.Notification.requestPermission();
        if (permission !== 'granted') {
            reject();
            throw new Error('Permission not granted for Notification');
        }
        resolve();
    });
}

async function enablePush(){
    try{
        await requestNotificationsPerms();

        const applicationServerKey = urlB64ToUint8Array("BBDWHJkJr4mFzQwkNVWKG_Lj6NTXFx38XxBvUCHV9Sm_U4xlvMYapvImY8BBUSd6UI8NkzNygJRZ5J_MMgsSTek");
        const options = {applicationServerKey, userVisibleOnly: true};
        const subscription = await swReg.pushManager.subscribe(options);
        let json = JSON.stringify(subscription);

        await sendPushSubscription(json, window.localStorage.getItem("token"));
    } catch(e) {
        console.log(e);
    }
}

async function disablePush(){
    try{
		swReg.pushManager.getSubscription().then(function(subscription) {
			subscription.unsubscribe().then(function(successful) {
			    console.log("PUSH deactivated")
                //TODO remove from server
			}).catch(function(e) {
				// Unsubscription failed
			})
		});
        window.localStorage.setItem("push",false);
    } catch(e) {
        console.log(e);
    }
}

const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
};
document.addEventListener("DOMContentLoaded", async function(event) {
    if(localStorage.getItem("dark") === "true"){
        document.getElementsByTagName('body')[0].className = "dark";
        document.getElementsByTagName("nav")[0].className = document.getElementsByTagName("nav")[0].className.replace("navbar-light","navbar-dark");
        let tables = document.getElementsByClassName("table");
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];
            table.className = table.className.replace("table","table table-dark")
        }
        let confirmBoxes = document.getElementsByClassName("confirmFrame");
        for(let i in confirmBoxes){
            let confirmBox = confirmBoxes[0];
            confirmBox.className = confirmBox.className.replace("confirmFrame","confirmFrame-dark")
        }
    }
});


