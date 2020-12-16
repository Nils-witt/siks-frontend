let login;
let config = new Config();

function initLogin() {
    login.enableLogin = () => {
        (<HTMLButtonElement>document.getElementById('loginButton')).disabled = false;
        (<HTMLButtonElement>document.getElementById('loginButton')).onclick = login.getApiKey;
    }

    login.disableLogin = () => {
        (<HTMLButtonElement>document.getElementById('loginButton')).disabled = true;
        document.getElementById('loginButton').onclick = () => {
        };
    }

    login.openSecondFactorEntry = () => {
        document.getElementById("secondFactorDiv").style.visibility = "visible";
        document.getElementById("loginDiv").style.visibility = "hidden";
    }

    login.getUsernameField = () => {
        return (<HTMLInputElement>document.getElementById("username")).value;
    }
    login.getPasswordField = () => {
        return (<HTMLInputElement>document.getElementById("password")).value;
    }
    login.getTotpField = () => {
        return (<HTMLInputElement>document.getElementById("totpCode")).value;
    }

    login.setErrorStatus = (status) => {
        document.getElementById("ec").innerHTML = status;
    }

    login.setSFError = (status) => {
        if (status) {
            document.getElementById("secondFactorError").style.visibility = "visible";
        } else {
            document.getElementById("secondFactorError").style.visibility = "hidden";
        }
    }
    login.apiUrl = config.apiUrl;
}


addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        await login.getApiKey();
    }
});

addEventListener("DOMContentLoaded", async function (event) {
    login = new Login();
    let regs = await navigator.serviceWorker.getRegistrations();
    console.log("Regs: " + regs.length)
    if (regs.length > 0) {
        serviceworkerConnector.registration = regs[0];
        if (await login.isLoggedIn()) {
            login.navigateToMainPage();
        }
    }

    await serviceworkerConnector.register();
    if (await login.isLoggedIn()) {
        login.navigateToMainPage();
    }
    initLogin();
    login.enableLogin();
    await serviceworkerConnector.updateCache();

});
