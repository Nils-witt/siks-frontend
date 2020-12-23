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

/**
 * Checks if IndexedBD is supported in the browser / window
 */
if (!window.indexedDB) {
    console.log("DB not supported")
}

/**
 * Provides easier interaction with the IndexDB
 */
class DatabaseConnector {
    private database;

    /**
     * Initials a DatabaseConnector object
     */
    constructor() {
    }

    /**
     * Runs all functions to make the database ready for connections
     */
    public async initDB() {
        this.database = await this.updateObjectStore();
    }

    /**
     * Saves a Lesson object to the database
     * @param lesson
     */
    saveLesson(lesson: Lesson): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("lessons", "readwrite");
            transaction.oncomplete = (event) => {
            };

            transaction.onerror = (event) => {
                console.log(event)
            };

            let objectStore = transaction.objectStore("lessons");

            let request = objectStore.add(lesson);
            request.onsuccess = (event) => {
                resolve();
            };
        });

    }

    /**
     * Saves a ReplacementLesson object to the database
     * @param replacementLesson
     */
    saveReplacementLesson(replacementLesson: ReplacementLesson): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("replacementLessons", "readwrite");
            transaction.oncomplete = (event) => {
            };
            transaction.onerror = (event) => {
            };

            let objectStore = transaction.objectStore("replacementLessons");

            let request = objectStore.add(replacementLesson);
            request.onsuccess = (event) => {
                resolve();
            };
        });

    }

    /**
     * Saves a Exam object to the database
     * @param exam
     */
    saveExam(exam: Exam): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("exams", "readwrite");
            transaction.oncomplete = (event) => {
            };

            transaction.onerror = (event) => {
            };

            let objectStore = transaction.objectStore("exams");

            let request = objectStore.add(exam);
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    /**
     * Saves a Announcement object to the database
     * @param announcement
     */
    saveAnnouncement(announcement: Announcement): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("announcements", "readwrite");

            let objectStore = transaction.objectStore("announcements");

            let request = objectStore.add(announcement);
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    /**
     * Saves a User object to the database
     * @param user
     */
    saveUser(user: User): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("users", "readwrite");

            transaction.onerror = (event) => {
                console.log(event)
            };

            let objectStore = transaction.objectStore("users");

            let request = objectStore.add(user);
            request.onsuccess = (event) => {
                resolve();
            };
        });

    }

    /**
     * Saves a Course object to the database
     * @param course
     */
    saveCourse(course: Course): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("courses", "readwrite");
            transaction.oncomplete = (event) => {
            };

            transaction.onerror = (event) => {
                console.log(event)
            };

            let objectStore = transaction.objectStore("courses");

            let request = objectStore.add(course);
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

    /**
     * Saves a Device object to the database
     * @param device
     */
    saveDevice(device: Device): Promise<void> {
        let db = this.database;
        return new Promise((resolve, reject) => {

            let transaction = db.transaction("devices", "readwrite");
            transaction.oncomplete = (event) => {
            };

            transaction.onerror = (event) => {
                console.log(event)
            };

            let objectStore = transaction.objectStore("devices");

            let request = objectStore.add(device);
            request.onsuccess = (event) => {
                resolve();
            };
        });
    }

//GET
    getUsers(): Promise<User[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("users").objectStore("users");
            let users = [];

            objectStore.index("username").openCursor().onsuccess = (event) => {
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

    getLessons(): Promise<Lesson[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("lessons").objectStore("lessons");
            let lessons = [];

            objectStore.openCursor().onsuccess = (event) => {
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

    getReplacementLessons(): Promise<ReplacementLesson[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("replacementLessons").objectStore("replacementLessons");
            let lessons = [];

            objectStore.openCursor().onsuccess = (event) => {
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

    getReplacementLessonsByWeek(dateStart): Promise<ReplacementLesson[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let date = new Date(dateStart);
            let objectStore = db.transaction("replacementLessons").objectStore("replacementLessons");
            let lessons = [];
            let firstDay = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastDay = date.getTime();

            let range = IDBKeyRange.bound(firstDay, lastDay, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = (event) => {
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

    getAnnouncementsByWeek(dateStart): Promise<Announcement[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let date = new Date(dateStart);
            let objectStore = db.transaction("announcements").objectStore("announcements");
            let lessons = [];
            let firstday = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastday = date.getTime();

            let range = IDBKeyRange.bound(firstday, lastday, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = (event) => {
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

    getLesson(weekday, lesson): Promise<Lesson> {
        let db = this.database;
        return new Promise(async (resolve, reject) => {
            let transaction = db.transaction('lessons', 'readonly');
            let store = transaction.objectStore('lessons');
            let index = store.index('lessonDay');
            let request = await index.get(IDBKeyRange.only([weekday, lesson]));
            request.onsuccess = () => {
                resolve(request.result);
            }
        });
    }

    getReplacementLesson(weekday, lesson): Promise<ReplacementLesson[]> {
        let db = this.database;
        return new Promise(async (resolve, reject) => {
            let transaction = db.transaction('replacementLessons', 'readonly');
            let store = transaction.objectStore('replacementLessons');
            let index = store.index('lessonDay');
            let request = await index.get(IDBKeyRange.only([weekday, lesson]));
            request.onsuccess = () => {
                resolve(request.result);
            }
        });
    }

    getExams(): Promise<Exam[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("exams").objectStore("exams");
            let exams = [];

            objectStore.openCursor().onsuccess = (event) => {
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
        return new Promise((resolve, reject) => {
            let date = new Date(dateStart);
            let firstday = date.getTime();
            date.setDate(date.getDate() + 7);
            let lastday = date.getTime();

            let objectStore = db.transaction("exams").objectStore("exams");
            let exams = [];

            let range = IDBKeyRange.bound(firstday, lastday, false, false);

            let index = objectStore.index("epochSec");

            index.openCursor(range).onsuccess = (event) => {
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

    getCourses(): Promise<Course[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("courses").objectStore("courses");
            let courses = [];
            objectStore.openCursor().onsuccess = (event) => {
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

    getAnnouncements(): Promise<Announcement[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("announcements").objectStore("announcements");
            let announcements = [];
            objectStore.openCursor().onsuccess = (event) => {
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

    getDevices(): Promise<Device[]> {
        let db = this.database;
        return new Promise((resolve, reject) => {
            let objectStore = db.transaction("devices").objectStore("devices");
            let devices = [];
            objectStore.openCursor().onsuccess = (event) => {
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

    /**
     * Clears the Announcement table
     */
    clearLessons() {
        this.database.transaction("lessons", "readwrite").objectStore("lessons").clear();
    }

    /**
     * Clears the Device table
     */
    clearDevices() {
        this.database.transaction("devices", "readwrite").objectStore("devices").clear();
    }

    /**
     * Clears the ReplacementLesson table
     */
    clearReplacementLessons = () => {
        this.database.transaction("replacementLessons", "readwrite").objectStore("replacementLessons").clear();
    }

    /**
     * Clears the Exam table
     */
    clearExams() {
        this.database.transaction("exams", "readwrite").objectStore("exams").clear();
    }

    /**
     * Clears the User table
     */
    clearUsers() {
        this.database.transaction("users", "readwrite").objectStore("users").clear();
    }

    /**
     * Clears the Course table
     */
    clearCourses() {
        this.database.transaction("courses", "readwrite").objectStore("courses").clear();
    }

    /**
     * Clears the Announcement table
     */
    clearAnnouncement() {
        this.database.transaction("announcements", "readwrite").objectStore("announcements").clear();
    }

    /**
     * Gets a database instance and upgrades to the current schema
     * @private
     */
    private updateObjectStore() {
        let db = this.database;
        return new Promise(async (resolve, reject) => {
            if (db !== undefined) {
                resolve(false);
                return;
            }
            let request = indexedDB.open('sPlan', 13);

            request.onupgradeneeded = () => {
                db = request.result;
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

            request.onerror = (err) => {
                console.log(err);
                reject('err');
            };

            request.onsuccess = () => {
                resolve(request.result);
            }
        });
    }
}