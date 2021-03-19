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
    if (!window.location.href.endsWith("login.html")) {
        window.location.href = "/pages/login.html";
    }
}

class ApiConnector {
    static token: string;
    static api_host: string;

    /**
     * Updates all data from the api and fires an event when finished.
     */
    static async updateStores() {
        await this.loadUserProfile();
        await this.loadUserCourses();
        await this.loadUserLessons();
        await this.loadUserReplacementLessons();
        await this.loadUserAnnouncements();
        await this.loadUserExams();
        dispatchEvent(new Event("storesUpdated"));
    }

    /**
     * Loads the user lessons from the api saves and returns them.
     */
    static loadUserLessons(): Promise<Lesson[]> {
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
                    resolve(await DatabaseConnector.getLessons());
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

    /**
     * Loads the user replacement lessons from the api saves and returns them.
     */
    static loadUserReplacementLessons(): Promise<ReplacementLesson[]> {
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

                resolve(await DatabaseConnector.getReplacementLessons());
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

    /**
     * Loads the user exams from the api saves and returns them.
     */
    static loadUserExams(): Promise<Exam[]> {
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
                    resolve(await DatabaseConnector.getExams());
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

    /**
     * Loads all users from the api saves and returns them.
     * - Admin functionality
     */
    static loadUsers(): Promise<User[]> {
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
                    resolve(await DatabaseConnector.getUsers());
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

    /**
     * Loads the user courses from the api saves and returns them.
     */
    static loadUserCourses(): Promise<Course[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/courses/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {
                    let data: Course[] = await response.json();

                    await DatabaseConnector.clearCourses();
                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveCourse(data[i]);
                    }

                    resolve(await DatabaseConnector.getCourses());
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

    /**
     * Loads the user devices from the api saves and returns them.
     */
    static loadUserDevices(): Promise<Device[]> {
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

                    await DatabaseConnector.clearDevices();
                    for (let i = 0; i < data.length; i++) {
                        await DatabaseConnector.saveDevice(data[i]);
                    }

                    resolve(await DatabaseConnector.getDevices());
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

    /**
     * Loads the user announcements from the api saves and returns them.
     */
    static loadUserAnnouncements(): Promise<Announcement[]> {
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

                    resolve(await DatabaseConnector.getAnnouncements());
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

    /**
     * Revokes the current used JWT.
     */
    static revokeJWT(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let res = await fetch(this.api_host + "/user/jwt", {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            });
            resolve();
        });
    }

    /**
     * Sends the push sub to the Server.
     */
    static sendPushSubscription(subscription): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/user/devices", {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.token,
                    'Content-type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify({
                    "deviceIdentifier": subscription,
                    "platform": 3
                })
            });
            console.log(response);
            if (response.status === 200) {
                resolve();
                localStorage.setItem("PUSH_NOTIFICATIONS", "true")
            } else if (response.status === 604) {
                resolve();
                localStorage.setItem("PUSH_NOTIFICATIONS", "true")
            } else if (response.status === 401) {
                await authErr();
                reject('err');
            } else {
                reject(response.status);
            }
        });

    }

    /**
     * Sends a link request to the api for an telegram account.
     */
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
            } else if (response.status === 604) {
                resolve();
            } else if (response.status === 401) {
                await authErr();
                reject('err');
            } else {
                reject();
            }

        });
    }

    /**
     * Loads the user profile from the api saves and returns them.
     */
    static loadUserProfile(): Promise<User> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/user/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            });
            if (response.status === 200) {
                let data: User = await response.json();

                Global.user.firstName = data["firstName"];
                Global.user.lastName = data["lastName"];
                Global.user.displayName = data["displayName"];
                Global.user.type = data["type"];
                Global.user.id = data["id"];

                Global.user.saveLocal()

                resolve(data);
            } else if (response.status === 401) {
                window.location.href = "/pages/login.html"
            } else {
                reject(response);
            }
        });
    }

    /**
     * Deletes a announcement by Id from the api.
     * @param id
     */
    static deleteAnnouncement(id): Promise<void> {
        return new Promise(async (resolve, reject) => {

            let response = await fetch(this.api_host + "/announcements/id/" + id.toString(), {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + this.token
                },
            });
            resolve();
        });
    }

    /**
     * Loads all announcements from the api.
     */
    static loadAnnouncementsAdmin(): Promise<Announcement[]> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/announcements/", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.token
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
                authErr();
                reject('err');
            }
            if (response.status === 604) {
                console.log("err");
                reject('err');
            }

        });
    }

    /**
     * Submits a new announcement to the api.
     * @param announcement
     */
    static saveAnnouncement(announcement): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/announcements/", {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.token,
                    'Content-type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(announcement)
            });

            if (response.status === 200) {
                resolve();
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

    /**
     * loads a user by UID.
     * @param id
     */
    static loadUserById(id): Promise<User> {
        return new Promise(async (resolve, reject) => {
            let response = await fetch(this.api_host + "/users/id/" + id, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + this.token,
                    'Content-type': 'application/json; charset=utf-8'
                }
            });
            if (response.status === 200) {
                let data = await response.json();

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

    /**
     * Loads all courses from the api.
     */
    static loadAllCourses(): Promise<Course[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/courses/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {
                    let data: Course[] = await response.json();

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
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }

    /**
     * Loads all lessons from the api.
     */
    static loadAllLessons(): Promise<Lesson[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/lessons/", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {
                    let data: Lesson[] = await response.json();

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
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }

    /**
     * Enables the moodle account for the current user.
     */
    static enableMoodleAccount(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/moodle/enable", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                })

                if (response.status === 200) {
                    resolve();
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

    /**
     * Disables the moodle account for the current user.
     */
    static disableMoodleAccount(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/moodle/disable", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                });

                if (response.status === 200) {
                    resolve();
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

    /**
     * Retrieves a new TOTP registration request.
     */
    static getNewTOTPRegistration(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await fetch(this.api_host + "/user/totp/register", {
                    method: 'GET',
                    headers: {
                        'Authorization': "Bearer " + this.token
                    },
                });

                if (response.status === 200) {
                    let data = response.json();
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
            } catch (e) {
                console.log(e);
                reject("NC")
            }
        });
    }
}