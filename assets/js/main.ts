let apiKey;
let username;
let locationLogin = "https://splan.nils-witt.de/pages/login.html";

let swReg;

messageToServiceWorker({"command": "updateCache"});

if ('serviceWorker' in window.navigator) {
    navigator.serviceWorker.register('/serviceworker.js', {}).then((reg) => {
        console.log('Registrierung erfolgreich. Scope ist ' + reg.scope);
        if (!reg.active) {
            console.log('SW not active');
            location.reload();
        }
        swReg = reg;
    }).catch((error) => {
        console.log('Registrierung fehlgeschlagen mit ' + error);
    });
}
navigator.serviceWorker.addEventListener("message", (evt) => {
    let data = evt.data;
    if (data.Type === "apiKey") {
        if (data.Key == null) {
            window.location.href = locationLogin;

        } else {
            apiKey = data.Key;
        }
    } else if (data.Type === "username") {
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

async function goToMainPage() {
    window.location.href = "/pages/" + window.localStorage.getItem("userType") + "/index.html";
}

function toggleDarkTheme(isEnabled) {
    document.body.classList.toggle('dark', isEnabled);
    console.log("Dark: " + isEnabled)
}


document.addEventListener("DOMContentLoaded", async (event) => {

    if (localStorage.getItem("theme") === "dark") {
        toggleDarkTheme(true);
    } else if (localStorage.getItem("theme") === "light") {
        toggleDarkTheme(false);
    }

});

if (localStorage.getItem("theme") !== "dark" && localStorage.getItem("theme") !== "light") {
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    toggleDarkTheme(prefersDark.matches);
    //TODO replace with current Listener Issue #1
    prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches));
}

