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

function closeDetailView() {
    document.getElementById("detailFrame").style.visibility = "hidden";
    document.getElementById("detailBox").style.visibility = "hidden";
}

async function openDetailView(lesson) {
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
        courseName = lesson["exam"]["subject"] + "-" + lesson["exam"]["group"];
        room = "--";
    }

    if (lesson.hasOwnProperty("announcement")) {
        for (let i = 0; i < lesson["announcement"].length; i++) {
            announcements.push(lesson["announcement"][i]["content"]);
        }
    }

    await updateDetailView(courseName, lessonNumber, room, status, "", announcements);
    document.getElementById("detailFrame").style.visibility = "visible";
    document.getElementById("detailBox").style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", async function (event) {
    await initPage();
});

document.addEventListener("dataUpdate", async function (event) {
    console.log("DATAUPDATE")
});

addEventListener("visibilitychange", visibilityChange, false);

async function visibilityChange() {
    await fetchData();
}

async function initPage() {
    try {
        let timetable: TimeTable;
        let databaseConnector = new DatabaseConnector();
        await databaseConnector.initDB();
        timetable = new TimeTable(databaseConnector);
        timetable.userType = "student";
        timetable.initPagination();
        TimeTable.updatePagination(timetable, 0);
        await timetable.fetchData();
        await timetable.prepareData();
        await timetable.generateTable();
        addEventListener('dataUpdate', () => {
            timetable.updateTable();
        }, false);
        //await serviceworkerConnector.updateCache();
        await fetchData();
    } catch (e) {
        console.error(e);
    }
}

async function fetchData() {
    let token = window.localStorage.getItem("token");
    let databaseConnector: DatabaseConnector = new DatabaseConnector();
    await databaseConnector.initDB();
    let apiConnector = new ApiConnector(token, databaseConnector);
    apiConnector.loadLessons(token);
    apiConnector.loadReplacementLessons(token);
    apiConnector.loadExams(token);
    apiConnector.loadAnnouncements(token);
    //Promise.all()
}


async function updateDetailView(courseName, lesson, room, status, date, announcements) {
    document.getElementById("detailViewCourseName").innerText = courseName;
    document.getElementById("detailViewLesson").innerText = lesson;
    document.getElementById("detailViewRoom").innerText = room;
    document.getElementById("detailViewStatus").innerText = status;

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