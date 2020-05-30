"use strict";
/* S-Plan
 * Copyright (c) 2019 Nils Witt
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   * Redistributions of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *   * Redistributions in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
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

const baseURL = "https://siksapi.nils-witt.de";

function loadStundenplan(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status == 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearLessons();

                for (let i = 0; i < data.length; i++) {
                    await saveLesson(data[i]);
                }

                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
            }
            if (this.readyState === 4 && this.status == 401) {
                authErr();
                reject('err');
            }
            if (this.readyState === 4 && this.status == 604) {
                console.log("err");
                reject('err');
            }
        });

        xhr.open("GET", baseURL + "/user/lessons");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();


    });

}

function loadVertretungen(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status == 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearVertretungen();
                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    await saveVertretung(data[i]);
                }

                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
            }
            if (this.readyState === 4 && this.status == 401) {
                authErr();
                reject('err');
            }
            if (this.readyState === 4 && this.status == 604) {
                console.log("err");
                reject('err');
            }
        });

        xhr.open("GET", baseURL + "/user/replacementLessons");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();


    });
}

function loadExamsApi(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status === 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearKlausuren();
                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    await saveKlausur(data[i]);
                }

                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
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

        xhr.open("GET", baseURL + "/user/exams");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();


    });
}

function loadUserApi(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status === 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearUsers();
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    await saveUser(data[i]);
                }
                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
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

        xhr.open("GET", baseURL + "/users/");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();
    });
}

function loadCourses(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status === 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearCourses();
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    await saveCourse(data[i]);
                }
                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
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

        xhr.open("GET", baseURL + "/timeTable/courses/");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();

    });
}

function loadAnnouncements(token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", async function () {
            if (this.readyState === 4 && this.status === 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                await initDb();
                await clearAnnouncement();
                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    data[i]["weekday"] = new Date(data[i]["date"]).getDay();
                    await saveAnnouncement(data[i]);
                }
                resolve('loaded');

                let event = new Event('dataUpdate');
                dispatchEvent(event)
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

        xhr.open("GET", baseURL + "/user/announcements/");
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.send();


    });
}

function revokeJWT(token) {
    return new Promise(async function (resolve, reject) {
        let data = null;

        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log(this.responseText);
                resolve();
            }
        });

        xhr.open("DELETE", baseURL + "/jwt");
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Accept", "*/*");

        xhr.send(data);
    });
}

function sendPushSubscription(subscription, token) {
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4 && this.status == 200) {
                console.log(this.responseText);
                resolve();
                localStorage.setItem("push", true)
            } else if (this.readyState === 4 && this.status == 604) {
                resolve();
                localStorage.setItem("push", true)
            } else if (this.readyState === 4 && this.status != 200) {
                reject();
            } else if (this.readyState === 4 && this.status == 401) {
                authErr();
                reject('err');
            }
        });

        xhr.open("POST", baseURL + "/user/devices");
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.setRequestHeader("Accept", "*/*");

        xhr.send(JSON.stringify({"deviceId": subscription, "plattform": "WP"}));
    });

}

function linkTelegramAccount(telegramID, token){
    return new Promise(async function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4 && this.status == 200) {
                resolve();
                window.localStorage.setItem("push",true);
            } else if (this.readyState === 4 && this.status == 604) {
                resolve();
                localStorage.setItem("push", true);
            } else if (this.readyState === 4 && this.status != 200) {
                reject();
            } else if (this.readyState === 4 && this.status == 401) {
                authErr();
                reject('err');
            }
        });

        xhr.open("GET", baseURL + "/telegram/confirm/" + telegramID);
        xhr.setRequestHeader("Authorization", "Bearer " + token);

        xhr.send();
    });
}

function authErr() {
    console.log("JWT invalid");
	localStorage.removeItem("token");
	messageToServiceWorker({"command": "logout"});
    window.location.href = "/pages/login.html";
}





