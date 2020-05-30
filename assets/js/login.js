const url_api = "https://siksapi.nils-witt.de";
let secondFactor = false;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js', {}).then(function (reg) {
        console.log('Registrierung erfolgreich. Scope ist ' + reg.scope);
        if (!reg.active) {
            console.log('SW not active');
            setTimeout(() => {
                location.reload();
            },1000)

        }else {
        }
    }).catch(function (error) {
        console.log('Registrierung fehlgeschlagen mit ' + error);
    });
}else {
    console.log("SW NS")
}

navigator.serviceWorker.addEventListener("message", (evt) => {
    let data = evt.data;

    if (data.Type == "apiKey") {
        if (data.Key == null) {
            console.log("no Key");
            let key = window.localStorage.getItem('token');
            if(!(key == null || key == "")){
                messageToServiceWorker({"command": "setApiKey", 'key': key});
            }else{
                let url = new URL(window.location.href);
                let token = url.searchParams.get("token");

                if(token != null && token != ""){
                    getApiKeyByPreAuth(token);
                }else{
                    document.getElementById("loginButton").disabled = false;
                }
            }
        } else {
            window.localStorage.setItem('token', data.Key);
            let url = new URL(window.location.href);
            let by = url.searchParams.get("by");
            console.log(by);
            if(by !== undefined && by !== null){
                window.history.go(-1);
            }else{
                let userType = window.localStorage.getItem('userType');
                window.location.href = "/pages/" + userType + "/timeTable.html"
            }
        }
    } else if (data.hasOwnProperty("set")) {
        requestApiKey();
    }
});

function getApiKey() {
	document.getElementById("loginButton").disabled = true;
	document.getElementById("loginError").style.visibility = "hidden";
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let data = {
        "username": username,
        "password": password
    };
    if(secondFactor){
        data["secondFactor"] = document.getElementById("totpCode").value
    }
    console.log(data)
    let jsonData = JSON.stringify(data);

    let xhr = new XMLHttpRequest();
    
    xhr.addEventListener("readystatechange", async function () {
        if (this.readyState === 4 && this.status === 200) {
			
			document.getElementById("loginError").style.visibility = "hidden";
            let json = this.responseText;
            let data = JSON.parse(json);
            window.localStorage.setItem('token', data.token);
            window.localStorage.setItem('userType', data.userType);
            await loadStundenplan(data.token);
            console.log('loaded');
            messageToServiceWorker({"command": "setApiKey", 'key': data.token});
			
        }else if (this.readyState === 4 && this.status === 602){
            document.getElementById("secondFactorDiv").style.visibility = "visible";
            document.getElementById("loginDiv").style.visibility = "hidden";
            secondFactor = true;
		}else if (this.readyState === 4){
            if(!secondFactor){
                document.getElementById("loginButton").disabled = false;
                document.getElementById("ec").innerHTML = this.status.toString();
                document.getElementById("loginError").style.visibility = "visible";
            }else {
                document.getElementById("secondFactorError").style.visibility = "visible";
            }
		}
        if (this.readyState === 4 && this.status === 604) {
            console.log("err");
        }
    });

    xhr.open("POST", url_api + "/user/login");
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(jsonData);
}

function getApiKeyByPreAuth(token){
	let data = JSON.stringify({
		"token": token
	});

    let xhr = new XMLHttpRequest();
    
    xhr.addEventListener("readystatechange", async function () {
        if (this.readyState === 4 && this.status == 200) {
			
            let json = this.responseText;
            let data = JSON.parse(json);
            window.localStorage.setItem('token', data.token);
			window.localStorage.setItem('userType', data.userType);
			if(data.admin == "true"){
                window.localStorage.setItem('admin', true);
            }else {
                window.localStorage.setItem('admin', false);
            }
            let res = await loadStundenplan(data.token);
			console.log(data);
            messageToServiceWorker({"command": "setApiKey", 'key': data.token});
			
        }else if (this.readyState === 4){
			
			document.getElementById("loginButton").disabled = false;
			document.getElementById("ec").innerHTML = "invalid Token";
			document.getElementById("loginError").style.visibility = "visible";
			
		}
        if (this.readyState === 4 && this.status == 604) {
            console.log("err");
        }
    });

    xhr.open("POST", url_api + "/user/login");
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(data);
}

addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getApiKey();
    }
});

function messageToServiceWorker(msg) {
    try {
        navigator.serviceWorker.controller.postMessage(msg);
    }catch (e) {
        console.log(e);
    }
}

function requestApiKey() {
    messageToServiceWorker({"command": "getApiKey"});
}

document.addEventListener("DOMContentLoaded", async function(event) {
    requestApiKey();
});

