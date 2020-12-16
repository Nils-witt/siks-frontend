"use strict";
/* S-Plan
 * Copyright (c) 2020 Nils Witt
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

const baseURL = "http://localhost:3000";

function triggerUpdateEvent() {
    dispatchEvent(new Event('dataUpdate'));
}

async function authErr() {
    console.log("JWT invalid");
    localStorage.clear();
    await serviceworkerConnector.logout();
    window.location.href = "../../../pages/login.html";
}

class ApiConnector {
    private readonly token: string;
    private databaseConnector: DatabaseConnector;

    constructor(token: string, databaseConnector: DatabaseConnector) {
        this.token = token;
        this.databaseConnector = databaseConnector;
    }

    loadLessons(token) {
        let databaseConnector = this.databaseConnector;
        return new Promise(async function (resolve, reject) {
            try {
                console.log("Load Lessons")
                let response = await fetch(baseURL + "/user/lessons", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + token
                    },
                });

                if (response.status === 200) {
                    let data = await response.json();
                    await databaseConnector.clearLessons();
                    console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        await databaseConnector.saveLesson(data[i]);
                    }
                    resolve('loaded');
                    triggerUpdateEvent();
                }
                if (response.status === 401) {
                    authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log("e");
                console.log(e);
                reject("NC")
            }
        });
    }

    loadReplacementLessons(token) {
        let databaseConnector = this.databaseConnector;
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/user/replacementLessons", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });

            if (response.status === 200) {
                let data = await response.json();

                await databaseConnector.clearReplacementLessons();
                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    await databaseConnector.saveReplacementLesson(data[i]);
                }
                resolve('loaded');
                triggerUpdateEvent();
            }
            if (response.status === 401) {
                authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }
        });
    }

    loadExams(token) {
        let databaseConnector = this.databaseConnector;

        return new Promise(async function (resolve, reject) {
            try {
                let response = await fetch(baseURL + "/user/exams", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + token
                    },
                })

                if (response.status === 200) {
                    let data = await response.json();

                    await databaseConnector.clearExams();
                    for (let i = 0; i < data.length; i++) {
                        data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                        await databaseConnector.saveExam(data[i]);
                    }
                    resolve('loaded');
                    triggerUpdateEvent();
                }

                if (response.status === 401) {
                    authErr();
                    reject('err');
                }

                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log("e");
                reject("NC")
            }


        });
    }

    loadUserApi(token) {
        let databaseConnector = this.databaseConnector;
        return new Promise(async function (resolve, reject) {
            try {
                let response = await fetch(baseURL + "/users/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + token
                    },
                });
                if (response.status === 200) {
                    let data = await response.json();

                    await databaseConnector.clearUsers();
                    console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        await databaseConnector.saveUser(data[i]);
                    }
                    resolve('loaded');
                    triggerUpdateEvent();
                }
                if (response.status === 401) {
                    authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log("e");
                reject("NC")
            }

        });
    }

    loadCourses(token) {
        let databaseConnector = this.databaseConnector;

        return new Promise(async function (resolve, reject) {
            try {
                let response = await fetch(baseURL + "/timeTable/courses/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + token
                    },
                })

                if (response.status === 200) {

                    let data = await response.json();

                    await databaseConnector.clearCourses();

                    for (let i = 0; i < data.length; i++) {
                        await databaseConnector.saveCourse(data[i]);
                    }
                    resolve('loaded');
                    triggerUpdateEvent();
                }
                if (response.status === 401) {
                    authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log("e");
                reject("NC")
            }

        });
    }

    loadAnnouncements(token) {
        let databaseConnector = this.databaseConnector;

        return new Promise(async function (resolve, reject) {
            try {
                let response = await fetch(baseURL + "/user/announcements/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + token
                    },
                });

                if (response.status === 200) {
                    let data = await response.json();

                    await databaseConnector.clearAnnouncement();
                    for (let i = 0; i < data.length; i++) {
                        data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                        data[i]["weekday"] = new Date(data[i]["date"]).getDay();
                        await databaseConnector.saveAnnouncement(data[i]);
                    }
                    resolve('loaded');
                    triggerUpdateEvent();
                }
                if (response.status === 401) {
                    authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log("e");
                reject("NC")
            }
        });
    }

    revokeJWT(token): Promise<void> {
        return new Promise<void>(async function (resolve, reject) {
            let res = await fetch(baseURL + "/user/jwt", {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });
            console.log(res);
            resolve();
        });
    }

    sendPushSubscription(subscription, token): Promise<void> {
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/user/devices", {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + token,
                    'Content-type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    "deviceId": subscription,
                    "plattform": "WP"
                })
            });
            console.log(response);
            if (response.status === 200) {
                resolve();
                localStorage.setItem("push", "true")
            } else if (response.status === 604) {
                resolve();
                localStorage.setItem("push", "true")
            } else if (response.status === 401) {
                authErr();
                reject('err');
            } else {
                reject(response.status);
            }
        });

    }

    linkTelegramAccount(telegramID, token): Promise<void> {
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/telegram/confirm/" + telegramID, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                },
            })
            if (response.status === 200) {
                resolve();
                window.localStorage.setItem("push", "true");
            } else if (response.status === 604) {
                resolve();
                localStorage.setItem("push", "true");
            } else if (response.status === 401) {
                authErr();
                reject('err');
            } else {
                reject();
            }

        });
    }

    async loadUserProfile(): Promise<void> {
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/user/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem("token")
                },
            });
            if (response.status === 200) {
                let data = await response.json();
                resolve(data);
            } else if (response.status === 401) {
                window.location.href = "/pages/login.html"
            } else {
                reject(response);
            }
        });

    }

    /**
     *
     * @param id {int}
     */
    deleteAnnouncement(id): Promise<void> {
        let token = this.token;
        return new Promise(async function (resolve, reject) {

            let response = await fetch(baseURL + "/announcements/id/" + id.toString(), {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });
            resolve();
        });
    }

    loadAnnouncementsAdmin(): Promise<any[]> {
        let token = this.token;
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/announcements/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });

            if (response.status === 200) {

                let data = <any[]><unknown>response.json();

                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    data[i]["weekday"] = new Date(data[i]["date"]).getDay();
                }
                resolve(data);
                let event = new Event('dataUpdate');
                dispatchEvent(event)
            }
            if (response.status === 401) {
                //authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }

        });
    }

    saveAnnouncement(announcement): Promise<void> {
        let token = this.token;
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/announcements/", {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + token,
                    'Content-type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(announcement)
            });

            if (response.status === 200) {
                resolve();
            }
            if (response.status === 401) {
                //authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }
        });
    }

    loadUserById(id): Promise<any[]> {
        let token = this.token;
        return new Promise(async function (resolve, reject) {
            let response = await fetch(baseURL + "/users/id/" + id, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token,
                    'Content-type': 'application/json; charset=utf-8'
                }
            });
            if (response.status === 200) {

                let json = this.responseText;
                let data = JSON.parse(json);

                console.log(data);
                resolve(data);
            }
            if (response.status === 401) {
                authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }
        });
    }
}