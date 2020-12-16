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


if (!window.indexedDB) {
    console.log("DB not supported")
}

class DatabaseConnector {
    database;

    public async initDB() {
        this.database = await this.updateObjectStore();
    }

//Save
    saveLesson(lesson): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("lessons", "readwrite");
            transaction.oncomplete = function (event) {
            };

            transaction.onerror = function (event) {
                console.log(event)
            };

            let objectStore = transaction.objectStore("lessons");

            let request = objectStore.add(lesson);
            request.onsuccess = function (event) {
                resolve();
            };
        });

    }

    saveReplacementLesson(replacementLesson): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("replacementLessons", "readwrite");
            transaction.oncomplete = function (event) {
            };
            transaction.onerror = function (event) {
            };

            let objectStore = transaction.objectStore("replacementLessons");

            let request = objectStore.add(replacementLesson);
            request.onsuccess = function (event) {
                resolve();
            };
        });

    }

    saveExam(exam): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("exams", "readwrite");
            transaction.oncomplete = function (event) {
            };

            transaction.onerror = function (event) {
            };

            let objectStore = transaction.objectStore("exams");

            let request = objectStore.add(exam);
            request.onsuccess = function (event) {
                resolve();
            };
        });
    }

    saveAnnouncement(announcement): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("announcements", "readwrite");

            let objectStore = transaction.objectStore("announcements");

            let request = objectStore.add(announcement);
            request.onsuccess = function (event) {
                resolve();
            };
        });
    }

    saveUser(user): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("users", "readwrite");

            transaction.onerror = function (event) {
                console.log(event)
            };

            let objectStore = transaction.objectStore("users");

            let request = objectStore.add(user);
            request.onsuccess = function (event) {
                resolve();
            };
        });

    }

    saveCourse(course): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("courses", "readwrite");
            transaction.oncomplete = function (event) {
            };

            transaction.onerror = function (event) {
                console.log(event)
            };

            let objectStore = transaction.objectStore("courses");

            let request = objectStore.add(course);
            request.onsuccess = function (event) {
                resolve();
            };
        });
    }

    saveDevice(device): Promise<void> {
        let db = this.database;
        return new Promise(function (resolve, reject) {

            let transaction = db.transaction("devices", "readwrite");
            transaction.oncomplete = function (event) {
            };

            transaction.onerror = function (event) {
                console.log(event)
            };

            let objectStore = transaction.objectStore("devices");

            let request = objectStore.add(device);
            request.onsuccess = function (event) {
                resolve();
            };
        });
    }

//GET
    getUsers(): Promise<any[]> {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("users").objectStore("users");
            let users = [];

            objectStore.index("username").openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    users.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(users)
                }
            };
        });
    }

    getLessons() {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("lessons").objectStore("lessons");
            let lessons = [];

            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    lessons.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(lessons)
                }
            };
        });
    }

    getReplacementLessons() {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("replacementLessons").objectStore("replacementLessons");
            let lessons = [];

            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    lessons.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(lessons)
                }
            };
        });
    }

    getReplacementLessonsByWeek(dateStart) {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let date = new Date(dateStart);
            let objectStore = db.transaction("replacementLessons").objectStore("replacementLessons");
            let lessons = [];
            let firstDay = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastDay = date.getTime();

            let range = IDBKeyRange.bound(firstDay, lastDay, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    lessons.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(lessons)
                }
            };
        });
    }

    getAnnoucementsByWeek(dateStart) {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let date = new Date(dateStart);
            let objectStore = db.transaction("announcements").objectStore("announcements");
            let lessons = [];
            let firstday = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastday = date.getTime();

            let range = IDBKeyRange.bound(firstday, lastday, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    lessons.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(lessons)
                }
            };
        });
    }

    getLesson(weekday, lesson) {
        let db = this.database;
        return new Promise(async function (resolve, reject) {
            let transaction = db.transaction('lessons', 'readonly');
            let store = transaction.objectStore('lessons');
            let index = store.index('lessonDay');
            let request = await index.get(IDBKeyRange.only([weekday, lesson]));
            request.onsuccess = function () {
                resolve(request.result);
            }
        });
    }

    getReplacementLesson(weekday, lesson) {
        let db = this.database;
        return new Promise(async function (resolve, reject) {
            let transaction = db.transaction('replacementLessons', 'readonly');
            let store = transaction.objectStore('replacementLessons');
            let index = store.index('lessonDay');
            let request = await index.get(IDBKeyRange.only([weekday, lesson]));
            request.onsuccess = function () {
                resolve(request.result);
            }
        });
    }

    getExams(): Promise<any[]> {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("exams").objectStore("exams");
            let exams = [];

            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    exams.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(exams);
                }
            };
        });
    }

    getExamsByWeek(dateStart) {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let date = new Date(dateStart);
            let firstday = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastday = date.getTime();

            let objectStore = db.transaction("exams").objectStore("exams");
            let exams = [];

            let range = IDBKeyRange.bound(firstday, lastday, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    exams.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(exams)
                }
            };
        });
    }

    getCourses() {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("courses").objectStore("courses");
            let courses = [];
            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    courses.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(courses);
                }
            };
        });
    }

    getAnnouncements() {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("announcements").objectStore("announcements");
            let announcements = [];
            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    announcements.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(announcements);
                }
            };
        });
    }

    getDevices() {
        let db = this.database;
        return new Promise(function (resolve, reject) {
            let objectStore = db.transaction("devices").objectStore("devices");
            let devices = [];
            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    devices.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(devices);
                }
            };
        });
    }

    clearLessons() {
        this.database.transaction("lessons", "readwrite").objectStore("lessons").clear();
    }

    clearDevices() {
        this.database.transaction("devices", "readwrite").objectStore("devices").clear();
    }

    clearReplacementLessons = () => {
        this.database.transaction("replacementLessons", "readwrite").objectStore("replacementLessons").clear();
    }

    clearExams() {
        this.database.transaction("exams", "readwrite").objectStore("exams").clear();
    }

    clearUsers() {
        this.database.transaction("users", "readwrite").objectStore("users").clear();
    }

    clearCourses() {
        this.database.transaction("courses", "readwrite").objectStore("courses").clear();
    }

    clearAnnouncement() {
        this.database.transaction("announcements", "readwrite").objectStore("announcements").clear();
    }

    private updateObjectStore() {
        let db = this.database;
        return new Promise(async function (resolve, reject) {
            if (db !== undefined) {
                resolve(false);
                return;
            }
            let request = indexedDB.open('sPlan', 13);

            request.onupgradeneeded = function () {
                db = this.result;
                if (db.objectStoreNames.contains('lessons')) {
                    db.deleteObjectStore('lessons')
                }

                let store = db.createObjectStore('lessons', {
                    keyPath: 'key',
                    autoIncrement: true
                });
                store.createIndex("weekday", "weekday", {unique: false});
                store.createIndex("lesson", "lesson", {unique: false});
                store.createIndex("lessonDay", ["weekday", "lesson"], {unique: false});

                if (db.objectStoreNames.contains('exams')) {
                    db.deleteObjectStore('exams')
                }
                store = db.createObjectStore('exams', {
                    keyPath: 'key',
                    autoIncrement: true
                });
                store.createIndex("date", "date", {unique: false});
                store.createIndex("epochSec", "epochSec", {unique: false});


                if (db.objectStoreNames.contains('replacementLessons')) {
                    db.deleteObjectStore('replacementLessons')
                }

                store = db.createObjectStore('replacementLessons', {
                    keyPath: 'key',
                    autoIncrement: true
                });
                store.createIndex("weekday", "weekday", {unique: false});
                store.createIndex("lesson", "lesson", {unique: false});
                store.createIndex("kurs", "kurs", {unique: false});
                store.createIndex("lessonDay", ["weekday", "lesson"], {unique: false});
                store.createIndex("epochSec", "epochSec", {unique: false});


                if (db.objectStoreNames.contains('users')) {
                    db.deleteObjectStore('users')
                }

                store = db.createObjectStore('users', {
                    keyPath: 'key',
                    autoIncrement: true
                });
                store.createIndex("username", "username", {unique: true});
                if (db.objectStoreNames.contains('courses')) {
                    db.deleteObjectStore('courses')
                }

                store = db.createObjectStore('courses', {
                    keyPath: 'key',
                    autoIncrement: true
                });

                store.createIndex("grade", "grade", {unique: false});
                store.createIndex("group", "group", {unique: false});
                store.createIndex("subject", "subject", {unique: false});

                if (db.objectStoreNames.contains('announcements')) {
                    db.deleteObjectStore('announcements')
                }

                store = db.createObjectStore('announcements', {
                    keyPath: 'key',
                    autoIncrement: true
                });
                store.createIndex("epochSec", "epochSec", {unique: false});
                store.createIndex("grade", "grade", {unique: false});
                store.createIndex("group", "group", {unique: false});
                store.createIndex("subject", "subject", {unique: false});
                store.createIndex("date", "date", {unique: false});


                db.createObjectStore('devices', {
                    keyPath: 'key',
                    autoIncrement: true
                });
            };

            request.onerror = function (err) {
                console.log(err);
                reject('err');
            };

            request.onsuccess = function () {
                resolve(this.result);
            }
        });
    }
}