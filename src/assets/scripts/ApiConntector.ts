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

async function authErr() {
    console.log("JWT invalid");
    localStorage.clear();
    await Global.logout();
    window.location.href = "../../../pages/login.html";
}

class ApiConnector {
    static token: string;
    static api_host: string;

    static async updateStores() {
        await this.loadUserProfile();
        await this.loadCourses();
        await this.loadLessons();
        await this.loadReplacementLessons();
        await this.loadAnnouncements();
        await this.loadExams();
        dispatchEvent(new Event("storesUpdated"));
    }


    static loadLessons() {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/lessons", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                });

                if (response.status === 200) {
                    let data = await response.json();
                    await DatabaseConnector.clearLessons();
                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveLesson(data[i]);
                    }
                    resolve('loaded');
                }
                if (response.status === 401) {
                    await authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }

    static loadReplacementLessons() {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/user/replacementLessons", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            });

            if (response.status === 200) {
                let data = await response.json();

                await DatabaseConnector.clearReplacementLessons();
                for (let i = 0; i < data.length; i++) {
                    data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                    await DatabaseConnector.saveReplacementLesson(data[i]);
                }
                resolve('loaded');
            }
            if (response.status === 401) {
                await authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }
        });
    }

    static loadExams() {

        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/exams", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {
                    let data = await response.json();

                    await DatabaseConnector.clearExams();
                    for (let i = 0; i < data.length; i++) {
                        data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                        await DatabaseConnector.saveExam(data[i]);
                    }
                    resolve('loaded');
                }

                if (response.status === 401) {
                    await authErr();
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

    static loadUserApi() {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/users/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                });
                if (response.status === 200) {
                    let data = await response.json();

                    await DatabaseConnector.clearUsers();
                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveUser(data[i]);
                    }
                    resolve('loaded');
                }
                if (response.status === 401) {
                    await authErr();
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

    static loadCourses() {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/courses/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {

                    let data = await response.json();

                    await DatabaseConnector.clearCourses();

                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveCourse(data[i]);
                    }
                    resolve('loaded');
                }
                if (response.status === 401) {
                    //await authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }

    static loadDevices(): Promise<Device[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/devices", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {

                    let data: Device[] = await response.json();

                    await DatabaseConnector.clearCourses();

                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveDevice(data[i]);
                    }
                    resolve(data);
                }
                if (response.status === 401) {
                    //await authErr();
                    reject('err');
                }
                if (response.status === 604) {
                    console.log("err");
                    reject('err');
                }
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }

    static loadAnnouncements() {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/announcements/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                });

                if (response.status === 200) {
                    let data = await response.json();

                    await DatabaseConnector.clearAnnouncement();
                    for (let i = 0; i < data.length; i++) {
                        data[i]["epochSec"] = new Date(data[i]["date"]).getTime();
                        data[i]["weekday"] = new Date(data[i]["date"]).getDay();
                        await DatabaseConnector.saveAnnouncement(data[i]);
                    }
                    resolve('loaded');
                }
                if (response.status === 401) {
                    await authErr();
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

    static revokeJWT(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let res = await fetch(this.api_host + "/user/jwt", {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            });
            console.log(res);
            resolve();
        });
    }

    static sendPushSubscription(subscription): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/user/devices", {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.token,
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
                await authErr();
                reject('err');
            } else {
                reject(response.status);
            }
        });

    }

    static linkTelegramAccount(telegramID): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/telegram/confirm/" + telegramID, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            })
            if (response.status === 200) {
                resolve();
                window.localStorage.setItem("push", "true");
            } else if (response.status === 604) {
                resolve();
                localStorage.setItem("push", "true");
            } else if (response.status === 401) {
                await authErr();
                reject('err');
            } else {
                reject();
            }

        });
    }

    static async loadUserProfile(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/user/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + localStorage.getItem("token")
                },
            });
            if (response.status === 200) {
                let data = await response.json();

                User.firstName = data["firstName"];
                User.lastName = data["lastName"];
                User.displayName = data["displayName"];
                User.type = data["type"];
                User.id = data["id"];

                User.saveUser()

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
    static deleteAnnouncement(id): Promise<void> {
        let token = this.token;
        return new Promise(async (resolve, reject) => {

            let response = await fetch(this.api_host + "/announcements/id/" + id.toString(), {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });
            resolve();
        });
    }

    static loadAnnouncementsAdmin(): Promise<any[]> {
        let token = this.token;
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/announcements/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token
                },
            });

            if (response.status === 200) {

                let data = <Announcement[]><unknown>await response.json();

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

    static saveAnnouncement(announcement): Promise<void> {
        let token = this.token;
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/announcements/", {
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

    static loadUserById(id): Promise<User[]> {
        let token = this.token;
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/users/id/" + id, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token,
                    'Content-type': 'application/json; charset=utf-8'
                }
            });
            if (response.status === 200) {
                let json = await response.json();
                let data = JSON.parse(json);

                resolve(data);
            }
            if (response.status === 401) {
                await authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }
        });
    }
}