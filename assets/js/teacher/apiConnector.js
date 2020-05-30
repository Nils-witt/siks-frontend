

function saveAnnouncementToApi(announcement) {
    let token = localStorage.getItem("token");
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status === 200) {

                resolve();
            }
            if (this.readyState === 4 && this.status === 401) {
                //authErr();
                reject('err');
            }
            if (this.readyState === 4 && this.status === 604) {
                console.log("err");
                reject('err');
            }
        });

        xhr.open("POST", baseURL + "/announcements/");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send(JSON.stringify(announcement));
    });
}

function deleteAnnouncementFromApi(id){
    let token = localStorage.getItem("token");
    return new Promise(async function (resolve, reject) {
        let data = null;

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                resolve();
            }
        });

        xhr.open("DELETE", baseURL + "/announcements/id/" + id.toString());
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Accept", "*/*");

        xhr.send(data);
    });
}