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

const weekdays = {1:'Montag', 2:'Dienstag', 3:'Mittwoch', 4:'Donnerstag', 5:'Freitag', 6:'Samstag', 7:'Sonntag'};

let userType = window.localStorage.getItem("userType");

var weekStart;
let offset = 0;


function createLessonsTable(){
    return new Promise(async function (resolve, reject) {

        let lessons = await loadLessonsData();
        let replacementLessons = await loadReplacementLessonsData();
        let exams = await loadExamsData();
        let announcements = await loadAnnouncementsData();

        let data = await mergeData(lessons, replacementLessons, exams, announcements);

        if (Object.keys(data).length > 0) {
            let daysContainer = document.createElement('div');
            daysContainer.id = 'daysContainer';
            daysContainer.className = 'row';

            for (let day in data) {
                if(day == 6){
                    console.log("SAT");
                }
                let htmlDay = generateDay(data[day], day);
                daysContainer.append(htmlDay)
            }

            let container = document.getElementById('container');
            container.innerHTML = "";
            container.append(daysContainer);

            resolve(daysContainer);
        } else {
            reject("no data");
        }

    });
}

function loadLessonsData(){
    return new Promise(async function (resolve, reject) {
        let data = await getLessons();
        let lessons = {};
        data.forEach(lesson => {

            let hour = lesson.lessonNumber;
            let day = lesson.day;

            if (!lessons.hasOwnProperty(day)) {
                lessons[day] = {};
            }
            lessons[day][hour] = lesson;

        });
        resolve(lessons)
    });
}

let timeLessons = [[28200,30900],[30900,33600],[34800,37500],[37800,40500],[41700,44400],[44400,47100]];
function loadExamsData(){
    return new Promise(async function (resolve, reject) {
        let data = await getExamsByWeek(weekStart);

        let exams = {};
        data.forEach(exam => {
			let date = new Date(exam["date"]);
			let day = date.getDay();
			let firstLesson = null;
			let lastLesson = null;
            let start = convertTimeToSeconds(exam["from"]);
            let end = convertTimeToSeconds(exam["to"]);

            for(let i = 0; i < timeLessons.length; i++){
                let lesson = timeLessons[i];
                if(lesson[0] <= start && lesson[1] >= start){
                    firstLesson = i+1;
                }
                if(lesson[0] <= end && lesson[1] >= end){
                    lastLesson = i+1;
                }
            }

            if(lastLesson != null && firstLesson != null){
                for (let i = firstLesson; i <= lastLesson; i++){
                    if(!exams.hasOwnProperty(day)){
                        exams[day] = {};
                    }
                    exams[day][i] = exam;
                }
            }
        });
        resolve(exams);
    });
}

function convertTimeToSeconds(time){
    let date = time.split(":");
    return (date[0]*3600) + (date[1] * 60);
}

function mergeData(lessons, replacementLessons, exams, announcements){
    return new Promise(function (resolve, reject){
        let data = {};

        Object.keys(lessons).forEach(day => {
            Object.keys(lessons[day]).forEach(lesson => {
                if(!data.hasOwnProperty(day)){
                    data[day] = {};
                }
                if(!data[day].hasOwnProperty(lesson)){
                    data[day][lesson] = {}
                }
                data[day][lesson]["lesson"] = lessons[day][lesson];
                if(replacementLessons.hasOwnProperty(lessons[day][lesson]["id"])){
                    data[day][lesson]["replacementLesson"] = replacementLessons[lessons[day][lesson]["id"]];
                }
            })
        });
/*
        Object.keys(exams).forEach(day => {
            Object.keys(exams[day]).forEach(lesson => {
                if(!data.hasOwnProperty(day)){
                    data[day] = {};
                }
                if(!data[day].hasOwnProperty(lesson)){
                    data[day][lesson] = {}
                }
                data[day][lesson]["exam"] = exams[day][lesson];
            })
        });

        Object.keys(announcements).forEach(day => {
            Object.keys(announcements[day]).forEach(lesson => {
                if(!data.hasOwnProperty(day)){
                    data[day] = {};
                }
                if(!data[day].hasOwnProperty(lesson)){
                    data[day][lesson] = {}
                }
                data[day][lesson]["announcement"] = announcements[day][lesson];
            })
        });
        */
        console.log(data)
        resolve(data);
    });
}

async function loadReplacementLessonsData(){
    return new Promise(async function (resolve, reject) {
        let data = await getReplacementLessonsByWeek(weekStart);
        let replacementLessons = {};
        data.forEach(replacementLesson => {
            let lessonId = replacementLesson["lessonId"];
            replacementLessons[lessonId] = replacementLesson;

        });
        resolve(replacementLessons)
    });
}

async function loadAnnouncementsData(){
    return new Promise(async function (resolve, reject) {
        let lessonsDate = await getLessons();
        let lessons = {};
        lessonsDate.forEach(lesson => {

            let hour = lesson.lesson;
            let weekday = lesson.weekday;

            if (!lessons.hasOwnProperty(weekday)) {
                lessons[weekday] = [];
            }
            lessons[weekday].push(lesson);

        });


        let data = await getAnnoucementsByWeek(weekStart);
        let announcements = {};
        data.forEach(announcement => {
            let hour = announcement.lesson;
            let weekday = announcement.weekday;

            if (!announcements.hasOwnProperty(weekday)) {
                announcements[weekday] = {};
            }
            for (let i = 0; i < lessons[weekday].length; i++) {
                let lesson = lessons[weekday][i];

                if(announcement.course["subject"] == lesson["subject"]){
                    if(!announcements[weekday].hasOwnProperty(lesson["lesson"]) ){
                        announcements[weekday][lesson["lesson"]] = [];
                    }
                    announcements[weekday][lesson["lesson"]].push(announcement);
                }
            }
        });
        resolve(announcements)
    });
}

function generateColumn(lesson){
	if(lesson != null){
        let main = document.createElement('div');
        let indicator;
        let container = document.createElement('div');
        let text = document.createElement('p');
        let notificationBell = document.createElement('div');

        let indicatorColor = "green";
        let notification = false;

        if (lesson.hasOwnProperty("announcement")) notification = true;

	    if(lesson.hasOwnProperty("exam")){
            text.innerText = lesson["exam"]["subject"];
	        indicatorColor = "blue";
	        //notification = true;
        }else if(lesson.hasOwnProperty("replacementLesson")){
            text.innerText = lesson["replacementLesson"]["subject"];
            if(lesson["replacementLesson"]["room"] == "---"){
                indicatorColor = "red";
                text.innerText = "Freistunde";
            }else{
                indicatorColor = "orange";
                text.innerText = lesson["replacementLesson"]["subject"];
            }
        }else if(lesson.hasOwnProperty("lesson")){
            text.innerText = lesson;
            if(userType == "teacher"){
                text.innerText = lesson["lesson"]["course"]["grade"] + " / " + lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
            }else{
                text.innerText = lesson["lesson"]["course"]["subject"];
            }
        }


		indicator = createIndicator(0, indicatorColor);

		if(notification){
			notificationBell.innerHTML = '<i class="material-icons">notification_important</i>';
		}


        notificationBell.style = "width:24px";
        main.append(notificationBell);
        indicator.className = 'col';
        main.append(indicator);
        container.className = 'col';
		container.onclick = function() {openDetailView(lesson)};
		container.style.cursor = "pointer";
		container.append(text);
		main.append(container);
        main.className = 'row';
		return main;
	}
}

function generateDay(dayObject, dayInt){
    let day = document.createElement('div');
    day.className = 'col';

    let headline = document.createElement('h5');
    headline.innerText = weekdays[dayInt];
    day.append(headline);

    let preKey = 1;
    for (let key in dayObject) {
        if (dayObject.hasOwnProperty(key)) {
            if(parseInt(key) != preKey){
                let diff = parseInt(key) - preKey;
                for(let i = 0; i < diff; i++){

                    let main = document.createElement('div');
                    main.className = 'row';
                    main.style = 'padding-left: 24px';

                    let indicator = document.createElement('div');
                    indicator.className = 'col';
                    indicator.style = 'max-width: 5px;background-color: grey;padding: 0;max-height: 100%;';


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
            let htmlLesson = generateColumn(lesson);
            day.append(htmlLesson);
            preKey = parseInt(key) + 1;
        }
    }

    return day;
}

function createIndicator(personPreset,lessonStatus){
    let indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'col';
    indicatorContainer.style = 'max-width: 5px;padding: 0;max-height: 100%;';

    let indicatorLesson = document.createElement('div');
    indicatorLesson.className = "indicator indicator-" + lessonStatus;
    //indicatorLesson.style = 'width: 5px;padding: 0;height: 100%;background-color: ' + lessonStatus;

    //indicatorContainer.append(indicatorPresens);
    indicatorContainer.append(indicatorLesson);
    return indicatorContainer
}

function closeDetailView(){
    document.getElementById("detailFrame").style.visibility = "hidden";
    document.getElementById("detailBox").style.visibility = "hidden";
}

async function openDetailView(lesson){
    let room = "";
    let status = "keine Änderung";
    let courseName = "";
    let lessonNumber = 0;
    let announcements = [];

    if(lesson.hasOwnProperty("lesson")){
        room = lesson["lesson"]["room"];
        courseName = lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
        lessonNumber = lesson["lesson"]["lessonNumber"];
    }

    if(lesson.hasOwnProperty("replacementLesson")){
        if(lesson["replacementLesson"]["room"] == "---"){
            room = "Frei";
        }else {
            room = lesson["replacementLesson"]["room"];
        }
        status = lesson["replacementLesson"]["info"];
    }

    if(lesson.hasOwnProperty("exam")){
        status = "Klausur";
        courseName = lesson["exam"]["subject"] + "-" + lesson["exam"]["group"];
        room = "--";
    }
    if(lesson.hasOwnProperty("announcement")){
        for (let i = 0; i < lesson["announcement"].length; i++) {
            announcements.push(lesson["announcement"][i]["content"]);
        }
    }

    await updateDetailView(courseName, lessonNumber, room, status, "", announcements);
    document.getElementById("detailFrame").style.visibility = "visible";
    document.getElementById("detailBox").style.visibility = "visible";
}

async function updateDetailView(courseName, lesson, room, status, date, announcements){
    document.getElementById("detailViewCourseName").innerText = courseName;
    document.getElementById("detailViewLesson").innerText = lesson;
    document.getElementById("detailViewRoom").innerText = room;
    document.getElementById("detailViewStatus").innerText = status;

    let announcementContainer = document.getElementById("detailViewAnnouncement");
    announcementContainer.innerText = "";
    for (let i = 0; i < announcements.length; i++) {
        let outer  = document.createElement("div");
        outer.className = "row";
        let inner = document.createElement("div");
        inner.className = "col";
        inner.innerText = announcements[i];

        outer.append(inner);
        announcementContainer.append(outer);
    }

}

document.addEventListener("DOMContentLoaded", async function(event) {
    await initDb();
    await initPage();
});

addEventListener('dataUpdate',async function(){
    try {
        await createLessonsTable();
    }catch (rejectedValue) {
        console.log('rej on DataUpdate');
    }
});

async function visibilityChange(){
    console.log("update triggert");
    await loadStundenplan(window.localStorage.getItem("token"));
    await loadVertretungen(window.localStorage.getItem("token"));
    await loadExamsApi(window.localStorage.getItem("token"));
    await loadAnnouncements(window.localStorage.getItem("token"));
}

function updatePagination(newOffset = 0 ){
    offset = offset + newOffset;
    let date = new Date();
    date.setDate(date.getDate() - (date.getDay() - 1));
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + (offset * 7));
    weekStart = new Date(date);

    document.getElementById("currentWeek").innerText = date.getDate().toString().padStart(2,'0') + "." + (date.getMonth() + 1).toString().padStart(2,"0");
    date.setDate(date.getDate() -7);
    document.getElementById("previousWeek").innerText = date.getDate().toString().padStart(2,'0') + "." + (date.getMonth() + 1).toString().padStart(2,"0");
    date.setDate(date.getDate() +14);
    document.getElementById("nextWeek").innerText = date.getDate().toString().padStart(2,'0') + "." + (date.getMonth() + 1).toString().padStart(2,"0");
    date.setDate(date.getDate() - 7);
}

async function initPage(){
    updatePagination(0);

    try {
        await createLessonsTable();
    }catch (rejectedValue) {
        console.log(rejectedValue);
    }

    await loadStundenplan(window.localStorage.getItem("token"));
    await loadVertretungen(window.localStorage.getItem("token"));
    await loadExamsApi(window.localStorage.getItem("token"));
    await loadAnnouncements(window.localStorage.getItem("token"));
}


document.addEventListener("visibilitychange", visibilityChange, false);