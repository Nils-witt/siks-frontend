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

let login;

function initLgPage() {
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
    login.apiUrl = localStorage.getItem("API_HOST");
}
async function loadPWAConfig() {
    let res = await fetch("../../config.json");
    let data = await res.json();
    console.log("API_HOST: " + data["api"]);
    localStorage.setItem("API_HOST",data["api"]);
}


addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        await login.getApiKey();
    }
});
ServiceworkerConnector.register();
addEventListener("DOMContentLoaded", async (event) => {
    login = new Login();
    await ServiceworkerConnector.register();
    if (await login.isLoggedIn()) {
        login.navigateToMainPage();
    }
    await loadPWAConfig();
    initLgPage();
    login.enableLogin();
    await ServiceworkerConnector.updateCache();
});
