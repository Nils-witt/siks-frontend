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


class ListView {

    container: HTMLDivElement;

    dataObject = {};

    listContainer: HTMLDivElement;

    constructor() {

    }

    async load() {
        this.container.innerText = "Load ..";
        await this.loadData();

        await this.generateList();

        this.container.innerHTML = this.listContainer.innerHTML;
    }


    async loadData() {
        await DatabaseConnector.initDB();
        let exams = await DatabaseConnector.getExams();

        exams.sort((a, b) => {
            if (a.date < b.date) {
                return -1
            } else if (a.date > b.date) {
                return 1
            } else {
                return 0;
            }
        });

        for (const examsKey in exams) {
            let exam = exams[examsKey];
            let course = exam.course.grade + "/" + exam.course.subject + "-" + exam.course.group;
            if (!this.dataObject.hasOwnProperty(course)) {
                this.dataObject[course] = [];
            }
            this.dataObject[course].push(exam);
        }
    }

    generateList() {
        let locContainer = document.createElement('div');

        let courses = Object.keys(this.dataObject);
        courses.sort((a, b) => {
            if (a < b) {
                return -1
            } else if (a > b) {
                return 1
            } else {
                return 0;
            }
        });

        for (const coursesKey in courses) {
            let course = courses[coursesKey];
            let courseExams = this.dataObject[course];
            console.log(course);
            let header = document.createElement('h5');
            header.innerText = course;
            locContainer.append(header);

            let courseContainer = document.createElement('ul');

            for (const courseExamsKey in courseExams) {
                let exam: Exam = courseExams[courseExamsKey];
                console.log(exam);
                let element = document.createElement('li');
                element.innerText = Utilities.convertJSONDateToLocate(exam.date);

                courseContainer.append(element);
            }

            locContainer.append(courseContainer);
        }

        this.listContainer = locContainer;
    }
}