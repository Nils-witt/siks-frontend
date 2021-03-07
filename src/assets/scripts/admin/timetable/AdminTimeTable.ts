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


class AdminTimeTable {
    static courses: Course[] = [];
    static lessons: Lesson[] = [];

    static coursesMap = {};

    static timeTableGroups: GroupData[] = [];

    static async load() {
        this.courses = await ApiConnector.loadAllCourses();
        this.lessons = await ApiConnector.loadAllLessons();
        this.createRuntimeData();
        this.createTables();
    }

    static createRuntimeData() {
        for (const coursesKey in this.courses) {
            let course = this.courses[coursesKey];
            this.coursesMap[course.id] = course;
        }

        this.lessons.sort((a, b) => {
            if (a.course.grade > b.course.grade) {
                return 1;
            } else if (a.course.grade < b.course.grade) {
                return -1;
            } else {
                return 0;
            }
        })
        let currentGroupData = null;
        for (let i = 0; i < this.lessons.length; i++) {
            let lesson = this.lessons[i];

            if (currentGroupData == null || lesson.course.grade !== currentGroupData.name) {
                if (currentGroupData != null) {
                    this.timeTableGroups.push(currentGroupData);
                }
                currentGroupData = new GroupData();
                currentGroupData.name = lesson.course.grade;
            }
            currentGroupData.lessons.push(lesson);
        }
        if (currentGroupData != null) {
            this.timeTableGroups.push(currentGroupData);
        }
    }

    static createTables() {

        for (let i = 0; i < this.timeTableGroups.length; i++) {
            let groupData = this.timeTableGroups[i];
            let tableContainer = document.createElement('div');
            tableContainer.className = "container";
            tableContainer.style.borderStyle = "solid";
            let table = new TimeTable();
            table.container = tableContainer;
            table.withRessourceData = false;
            table.tabbable = false;
            table.displayAllInLesson = true;

            table.data = new TimeTableData();
            table.userType = UserType.TEACHER;
            table.data.lessons = groupData.lessons;
            table.prepareData();
            table.generateTable();

            table.detailViewCourseName = document.getElementById("detailViewCourseName");
            table.detailViewLesson = document.getElementById("detailViewLesson");
            table.detailViewRoom = document.getElementById("detailViewRoom");
            table.detailViewStatus = document.getElementById("detailViewStatus");
            table.detailFrame = <any>document.getElementById("detailFrame");
            table.detailBox = <any>document.getElementById("detailBox");

            let header = document.createElement('h3');
            header.innerText = "Klasse: " + groupData.name;

            document.getElementById('container').append(header);
            document.getElementById('container').append(document.createElement('br'));
            document.getElementById('container').append(tableContainer);
            document.getElementById('container').append(document.createElement('br'));
            document.getElementById('container').append(document.createElement('br'));
        }

    }
}


class GroupData {
    name: string;
    courses: number[] = [];
    lessons: Lesson[] = [];
}