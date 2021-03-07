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

class TimeTable implements Pagination {
    offset: number;
    weekStart: Date;
    userType: number;
    timeTable: TimeTable;
    data: TimeTableData;

    /* Page Object references*/

    buttonPreviousWeek: HTMLButtonElement;
    buttonCurrentWeek: HTMLButtonElement;
    buttonNextWeek: HTMLButtonElement;

    detailViewCourseName: HTMLSpanElement;
    detailViewLesson: HTMLSpanElement;
    detailViewRoom: HTMLSpanElement;
    detailViewStatus: HTMLSpanElement;
    detailFrame: HTMLDivElement;
    detailBox: HTMLDivElement;

    readonly weekdays: { "1": string; "2": string; "3": string; "4": string; "5": string; "6": string; "7": string };
    readonly timeLessons: number[][] = [[28200, 30900], [30900, 33600], [34800, 37500], [37800, 40500], [41700, 44400], [44400, 47100]];

    constructor() {
        this.data = new TimeTableData();
        this.offset = 0;
        this.weekdays = {
            1: 'Montag',
            2: 'Dienstag',
            3: 'Mittwoch',
            4: 'Donnerstag',
            5: 'Freitag',
            6: 'Samstag',
            7: 'Sonntag'
        };
        this.userType = Global.user.type;
        this.timeTable = this;
    }

    //SITE Functions
    static updatePagination(timeTable: TimeTable, newOffset: number) {
        timeTable.updatePagination(newOffset);
    }

    static async openDetailView(timeTable: TimeTable, lesson) {
        let room = "";
        let status = "keine Änderung";
        let courseName = "";
        let lessonNumber = 0;
        let announcements = [];

        if (lesson.hasOwnProperty("lesson")) {
            room = lesson["lesson"]["room"];
            courseName = lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
            lessonNumber = lesson["lesson"]["lessonNumber"];
        }

        if (lesson.hasOwnProperty("replacementLesson")) {
            if (lesson["replacementLesson"]["room"] === "---") {
                room = "Frei";
            } else {
                room = lesson["replacementLesson"]["room"];
            }
            status = lesson["replacementLesson"]["info"];
        }

        if (lesson.hasOwnProperty("exam")) {
            status = "Klausur";
            courseName = lesson["exam"]["course"]["subject"] + "-" + lesson["exam"]["course"]["group"];
            room = lesson["exam"]["roomLink"]["room"];
        }

        if (lesson.hasOwnProperty("announcement")) {
            for (let i = 0; i < lesson["announcement"].length; i++) {
                announcements.push(lesson["announcement"][i]["content"]);
            }
        }

        await timeTable.updateDetailView(courseName, lessonNumber, room, status, "", announcements);
        timeTable.detailFrame.style.visibility = "visible";
        timeTable.detailBox.style.visibility = "visible";
    }


    async updateDetailView(courseName, lesson, room, status, date, announcements) {


        this.detailViewCourseName.innerText = courseName;
        this.detailViewLesson.innerText = lesson;
        this.detailViewRoom.innerText = room;
        this.detailViewStatus.innerText = status;

        let announcementContainer = document.getElementById("detailViewAnnouncement");
        announcementContainer.innerText = "";
        for (let i = 0; i < announcements.length; i++) {
            let outer = document.createElement("div");
            outer.className = "row";
            let inner = document.createElement("div");
            inner.className = "col";
            inner.innerText = announcements[i];

            outer.append(inner);
            announcementContainer.append(outer);
        }
    }


    //SETUP
    initPagination() {
        this.buttonPreviousWeek.onclick = () => {
            TimeTable.updatePagination(this.timeTable, -1);
        };
        this.buttonNextWeek.onclick = () => {
            TimeTable.updatePagination(this.timeTable, 1);
        };
    }

    //RUN TIME
    /**
     * Fetches, prepares and sets data for table
     */
    async updateTable() {
        await this.fetchData();
        this.prepareData();
        this.generateTable();
    }

    /**
     * Uses the this.data to create the table
     */
    generateTable() {
        if (Object.keys(this.data.preparedData).length > 0) {
            let daysContainer = document.createElement('div');
            daysContainer.id = 'daysContainer';
            daysContainer.className = 'row';

            for (let day in this.data.preparedData) {
                let htmlDay = this.generateDay(this.data.preparedData[day], day);
                daysContainer.append(htmlDay)
            }

            let container = document.getElementById('container');
            container.innerHTML = "";
            container.append(daysContainer);

            return daysContainer;
        }
    }

    /**
     * Creates a Day Row
     * @param dayObject
     * @param dayInt
     */
    generateDay(dayObject, dayInt) {
        let day = document.createElement('div');
        day.className = 'col';

        let headline = document.createElement('h5');
        headline.innerText = this.weekdays[dayInt];
        day.append(headline);

        let preKey = 1;
        for (let key in dayObject) {
            if (dayObject.hasOwnProperty(key)) {
                if (parseInt(key) !== preKey) {
                    let diff = parseInt(key) - preKey;
                    for (let i = 0; i < diff; i++) {

                        let main = <HTMLDivElement>document.createElement('div');
                        main.className = 'row';
                        main.style.paddingLeft = '24px';

                        let indicator = document.createElement('div');
                        indicator.className = 'col';
                        indicator.style.maxWidth = '5px';
                        indicator.style.backgroundColor = 'grey;';
                        indicator.style.padding = ' 0;';
                        indicator.style.maxHeight = '100%;';

                        main.append(indicator);

                        let container = document.createElement('div');
                        container.className = 'col';

                        let text = document.createElement('p');
                        text.innerText = "Freistunde";

                        container.append(text);
                        main.append(container);
                        day.append(main);

                    }
                }
                const lesson = dayObject[key];
                let htmlLesson = this.generateColumn(lesson);
                day.append(htmlLesson);
                preKey = parseInt(key) + 1;
            }
        }

        return day;
    }

    /**
     * Creates one lesson column
     * @param lesson
     */
    generateColumn(lesson) {
        if (lesson != null) {
            let main = document.createElement('div');
            let indicator;
            let container = document.createElement('div');
            let text = document.createElement('p');
            let notificationBell = document.createElement('div');

            let indicatorColor = "green";
            let notification = false;

            if (lesson.hasOwnProperty("announcement")) notification = true;

            if (lesson.hasOwnProperty("exam")) {
                text.innerText = lesson["exam"]["course"]["subject"];
                indicatorColor = "blue";
            } else if (lesson.hasOwnProperty("replacementLesson")) {
                if (this.userType === UserType.TEACHER) {
                    text.innerText = lesson["lesson"]["course"]["grade"] + " / " + lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
                } else {
                    text.innerText = lesson["lesson"]["course"]["subject"];
                }

                if (lesson["replacementLesson"]["room"] === "---") {
                    indicatorColor = "red";
                    text.innerText = "Freistunde";
                } else {
                    indicatorColor = "orange";
                    text.innerText = lesson["replacementLesson"]["subject"];
                }
            } else if (lesson.hasOwnProperty("lesson")) {
                text.innerText = lesson;
                if (this.userType === UserType.TEACHER) {
                    text.innerText = lesson["lesson"]["course"]["grade"] + " / " + lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
                } else {
                    text.innerText = lesson["lesson"]["course"]["subject"];
                }
            }


            indicator = this.generateIndicator(0, indicatorColor);

            if (notification) {
                notificationBell.innerHTML = '<i class="material-icons">notification_important</i>';
            }

            notificationBell.style.width = "24px";
            main.append(notificationBell);
            indicator.className = 'col';
            main.append(indicator);
            container.className = 'col';
            container.onclick = () => {
                TimeTable.openDetailView(this.timeTable, lesson)
            };
            container.style.cursor = "pointer";
            container.append(text);
            main.append(container);
            main.className = 'row';
            return main;
        }
    }

    /**
     * Creates the indicator on the left to each lesson
     * @param personPreset
     * @param lessonStatus
     */
    generateIndicator(personPreset, lessonStatus) {
        let indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'col';
        indicatorContainer.style.maxWidth = '5px';
        indicatorContainer.style.padding = '0';
        indicatorContainer.style.maxHeight = '100%;';

        let indicatorLesson = document.createElement('div');
        indicatorLesson.className = "indicator indicator-" + lessonStatus;
        indicatorContainer.append(indicatorLesson);
        return indicatorContainer;
    }

    /**
     * Uses the date to prepare the data for table generation
     */
    prepareData() {
        let lessons = {};
        let exams = {};
        let replacementLessons = {};
        let announcements = {};

        let data = {};
        let timeLessons = this.timeLessons;

        this.data.lessons.forEach(lesson => {
            let hour = lesson["lessonNumber"];
            let day = lesson.day;

            if (!lessons.hasOwnProperty(day)) {
                lessons[day] = {};
            }
            lessons[day][hour] = lesson;

        });

        this.data.exams.forEach(exam => {
            let date = new Date(exam["date"]);
            let day = date.getDay();
            let firstLesson = null;
            let lastLesson = null;
            let start = Utilities.convertTimeToSeconds(exam["from"]);
            let end = Utilities.convertTimeToSeconds(exam["to"]);

            for (let i = 0; i < timeLessons.length; i++) {
                let lesson = timeLessons[i];
                if (lesson[0] <= start && lesson[1] >= start) {
                    firstLesson = i + 1;
                }
                if (lesson[0] <= end && lesson[1] >= end) {
                    lastLesson = i + 1;
                }
            }



            if (lastLesson != null && firstLesson != null) {
                for (let i = firstLesson; i <= lastLesson; i++) {
                    if (!exams.hasOwnProperty(day)) {
                        exams[day] = {};
                    }
                    exams[day][i] = exam;
                }
            }
        });

        this.data.replacementLessons.forEach(replacementLesson => {
            let lessonId = replacementLesson["lessonId"];
            replacementLessons[lessonId] = replacementLesson;

        });

        this.data.announcements.forEach(announcement => {
            let weekday = announcement.date;

            if (!announcements.hasOwnProperty(weekday)) {
                announcements[weekday] = {};
            }
            Object.keys(lessons[weekday]).forEach(lessonNumber => {
                let lesson = lessons[weekday][lessonNumber];
                if (announcement["courseId"] === lesson["course"]["id"]) {
                    if (!announcements[weekday].hasOwnProperty(lesson["lessonNumber"])) {
                        announcements[weekday][lesson["lessonNumber"]] = [];
                    }
                    announcements[weekday][lesson["lessonNumber"]].push(announcement);
                }
            });
        });

        Object.keys(lessons).forEach(day => {
            Object.keys(lessons[day]).forEach(lesson => {
                if (!data.hasOwnProperty(day)) {
                    data[day] = {};
                }
                if (!data[day].hasOwnProperty(lesson)) {
                    data[day][lesson] = {};
                }
                data[day][lesson]["lesson"] = lessons[day][lesson];
                if (replacementLessons.hasOwnProperty(lessons[day][lesson]["id"])) {
                    data[day][lesson]["replacementLesson"] = replacementLessons[lessons[day][lesson]["id"]];
                }
            })
        });
        Object.keys(announcements).forEach(day => {
            Object.keys(announcements[day]).forEach(lesson => {
                if (!data.hasOwnProperty(day)) {
                    data[day] = {};
                }
                if (!data[day].hasOwnProperty(lesson)) {
                    data[day][lesson] = {};
                }
                data[day][lesson]["announcement"] = announcements[day][lesson];
            })
        });

        Object.keys(exams).forEach(day => {
            Object.keys(exams[day]).forEach(lesson => {
                if (!data.hasOwnProperty(day)) {
                    data[day] = {};
                }
                if (!data[day].hasOwnProperty(lesson)) {
                    data[day][lesson] = {};
                }
                data[day][lesson]["exam"] = exams[day][lesson];
            })
        });

        this.data.preparedData = data;
        return data;
    }

    /**
     * Loads the data from the database
     */
    async fetchData() {
        this.data.announcements = await DatabaseConnector.getAnnouncementsByWeek(this.weekStart);
        this.data.exams = await DatabaseConnector.getExamsByWeek(this.weekStart);
        this.data.lessons = await DatabaseConnector.getLessons();
        this.data.replacementLessons = await DatabaseConnector.getReplacementLessonsByWeek(this.weekStart);
    }

    /**
     * Updates the page bases on the offset
     * @param newOffset - number in weeks (+/-)
     */
    updatePagination(newOffset) {
        this.offset = this.offset + newOffset;
        let date = new Date();
        date.setDate(date.getDate() - (date.getDay() - 1));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + (this.offset * 7));
        this.weekStart = new Date(date);

        this.buttonCurrentWeek.innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() - 7);
        this.buttonPreviousWeek.innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() + 14);
        this.buttonNextWeek.innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() - 7);

        this.updateTable();
    }
}

class TimeTableData {
    announcements: Announcement[];
    exams: Exam[];
    lessons: Lesson[];
    replacementLessons: ReplacementLesson[];
    /**
     * Contains all of the above merged into one object
     */
    preparedData: {};

}

interface Pagination {
    offset: number;
    weekStart: Date;

    updatePagination(newOffset);
}