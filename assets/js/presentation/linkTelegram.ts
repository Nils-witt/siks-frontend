navigator.serviceWorker.addEventListener("message", (evt) => {

    let data = evt.data;
    if (data.Type === "apiKey") {
        if (data.Key == null) {
            console.log("no Key");
        } else {
            //console.log("Key: " + data.Key);
            document.getElementById("waitingMessage").style.visibility = "hidden";
            (<HTMLButtonElement>document.getElementById("submitButton")).disabled = false;
        }
    } else if (data.hasOwnProperty("set")) {
        //reqestApiKey();
    }
});


document.addEventListener("DOMContentLoaded", async (event) => {
    await serviceworkerConnector.register();


    let messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = replyHandler;
    navigator.serviceWorker.controller.postMessage({"command": "getApiKey"}, [messageChannel.port2]);

    function replyHandler(event) {
        let data = event.data;
        console.log(data)
        if (data !== undefined) {
            document.getElementById("waitingMessage").style.visibility = "hidden";
            (<HTMLButtonElement>document.getElementById("submitButton")).disabled = false;
        } else {
            window.location.href = "/pages/login.html?sw=1";
        }
    }
});


function getRequestToken() {
    let url = new URL(window.location.href);
    return url.searchParams.get("token")
}


async function confirmTGLink() {
    let token = getRequestToken();
    try {
        let databaseConnector = new DatabaseConnector();
        let apiConnector = new ApiConnector(window.localStorage.getItem('token'), databaseConnector);
        await apiConnector.linkTelegramAccount(token, localStorage.getItem("token"));
        window.location.href = "../../../pages/login.html";
    } catch (e) {
        console.log(e);
    }


}