class ApiConnector {
    token;


    constructor(token, url = baseURL){
        this.token = token;

    }

//ADMIN
    /**
     *
     * @param id {int}
     */
    deleteAnnouncement(id){
        let token = this.token;
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

    loadAnnouncementsAdmin() {
        let token = this.token;
        return new Promise(async function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.addEventListener("readystatechange", async function () {
                if (this.readyState === 4 && this.status === 200) {

                    let json = this.responseText;
                    let data = JSON.parse(json);

                    for (let i = 0; i < data.length; i++) {
                        data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                        data[i]["weekday"] = new Date(data[i]["date"]).getDay();
                    }
                    resolve(data);
                    let event = new Event('dataUpdate');
                    dispatchEvent(event)
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

            xhr.open("GET", baseURL + "/announcements/");
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send();
        });
    }

    saveAnnouncement(announcement) {
        let token = this.token;
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
    loadUserById( id) {
        let token = this.token;
        return new Promise(async function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.addEventListener("readystatechange", async function () {
                if (this.readyState === 4 && this.status === 200) {

                    let json = this.responseText;
                    let data = JSON.parse(json);

                    console.log(data);
                    resolve(data);
                }
                if (this.readyState === 4 && this.status === 401) {
                    authErr();
                    reject('err');
                }
                if (this.readyState === 4 && this.status === 604) {
                    console.log("err");
                    reject('err');
                }
            });

            xhr.open("GET", baseURL + "/users/id/" + id);
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            xhr.send();
        });
    }
}