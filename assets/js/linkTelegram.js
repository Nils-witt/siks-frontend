navigator.serviceWorker.addEventListener("message", (evt) => {

    let data = evt.data;
    if (data.Type == "apiKey") {
        if (data.Key == null) {
            console.log("no Key");
        } else {
            //console.log("Key: " + data.Key);
            document.getElementById("waitingMessage").style.visibility = "hidden";
            document.getElementById("submitButton").disabled = false;
        }
    } else if (data.hasOwnProperty("set")) {
        reqestApiKey();
    }
});


document.addEventListener("DOMContentLoaded", async function(event) {
    messageToServiceWorker({"command": "getApiKey"});
});


function getRequestToken() {
    let url = new URL(window.location.href);
    let token = url.searchParams.get("token");
    return token
}


async function confirmTGLink() {
    let token = getRequestToken();
    try {
        await linkTelegramAccount(token,localStorage.getItem("token"));
        window.location.href = "/pages/students/stundenplan.html";
    }catch(e){
        console.log(e);
    }
    
    
}