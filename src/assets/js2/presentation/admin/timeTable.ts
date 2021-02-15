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

let parser = new DOMParser();
const weekdays = {1: 'Montag', 2: 'Dienstag', 3: 'Mittwoch', 4: 'Donnerstag', 5: 'Freitag', 6: 'Samstag', 7: 'Sonntag'};

function xmlToTable(xmlString) {
    let timeTable = {};
    let xml = parser.parseFromString(xmlString, "text/xml");

    let childrenMain = xml.children;
    for (let i = 0; i < childrenMain.length; i++) {
        if (childrenMain[i]["tagName"] == "sp") {
            let classes = childrenMain[i].children;
            for (let k = 0; k < classes.length; k++) {

                let nodes = classes[k].getElementsByTagName("titel");
                let className;
                if (nodes.length == 1) {
                    className = nodes[0].textContent;
                    timeTable[className] = parseClass(classes[k]);
                }
            }
        }
    }
    console.log(timeTable);
    let timeTableKeys = Object.keys(timeTable);
    let container = document.getElementById("tableContainer");
    for (let i = 0; i < timeTableKeys.length; i++) {
        let data = timeTable[timeTableKeys[i]];
        console.log(data)
        let element = document.createElement("span");
        element.innerText = timeTableKeys[i];
        container.append(element)
        let daysContainer = document.createElement("div");
        daysContainer.className = "col";

        for (let day in data) {
            if (data.hasOwnProperty(day)) {
                console.log(day);
                let htmlDay = generateDay(data[day], day);

                daysContainer.append(htmlDay)
            }

        }
        container.append(daysContainer);
    }
}

function parseClass(classNode) {
    let lessons = {};
    let nodes = classNode.getElementsByTagName("titel");
    let className;
    if (nodes.length === 1) {
        className = nodes[0].textContent
    } else {
        return;
    }

    console.log(classNode);
    console.log(className);
    let bodyNodes = classNode.getElementsByTagName("zeile");
    for (let i = 0; i < bodyNodes.length; i++) {
        let lessonNumber = bodyNodes[i].getElementsByTagName("stunde")[0].textContent;
        let classChilds = bodyNodes[i].children;
        for (let j = 0; j < classChilds.length; j++) {
            if (classChilds[j].tagName != "stunde" && classChilds[j].tagName != "von") {
                let subject;
                let lesson = classChilds[j];
                try {
                    let dayNumber = classChilds[j].tagName.substr(3, 1);
                    subject = lesson.getElementsByTagName("fach")[0].textContent;
                    let teacher = lesson.getElementsByTagName("lehrer")[0].textContent;
                    let room = lesson.getElementsByTagName("raum")[0].textContent;
                    let grade = lesson.getElementsByTagName("klasse")[0].textContent;
                    let group;
                    try {
                        group = lesson.getElementsByTagName("gruppe")[0].textContent;
                    } catch (e) {
                        group = grade;
                    }
                    if (!lessons.hasOwnProperty(dayNumber)) {
                        lessons[dayNumber] = {};
                    }
                    if (!lessons[dayNumber].hasOwnProperty(lessonNumber)) {
                        lessons[dayNumber][lessonNumber] = [];
                    }
                    lessons[dayNumber][lessonNumber].push({
                        "subject": subject,
                        "teacher": teacher,
                        "room": room,
                        "group": group,
                        "grade": grade,
                        "lesson": lessonNumber,
                        "day": dayNumber
                    });
                } catch (e) {

                    console.log(e);
                    console.log(subject);
                }
            }
        }
    }
    return lessons;
}

function generateDay(dayObject, dayInt) {
    let day = document.createElement('div');
    day.className = 'col';

    let headline = document.createElement('h5');
    headline.innerText = weekdays[dayInt];
    day.append(headline);

    let preKey = 1;
    for (let key in dayObject) {
        if (dayObject.hasOwnProperty(key)) {
            if (parseInt(key) !== preKey) {
                let diff = parseInt(key) - preKey;
                for (let i = 0; i < diff; i++) {

                    let main = document.createElement('div');
                    main.className = 'row';
                    main.style.paddingLeft = '24px';

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

function generateColumn(lesson) {
    if (lesson != null) {
        let main = document.createElement('div');
        let container = document.createElement('div');
        let text = document.createElement('p');
        console.log(lesson)
        //text.innerText = lesson["lesson"]["subject"];
        container.className = 'col';
        container.append(text);
        main.append(container);
        main.className = 'row';
        return main;
    }
}