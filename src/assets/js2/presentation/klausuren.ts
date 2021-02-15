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

"use strict";
let userType = window.localStorage.getItem("userType");

async function createExamsTable(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            let exams = await DatabaseConnector.getExams();
            let mainUL = document.getElementById("mainUL");
            exams.sort(compare);
            if (Object.keys(exams).length > 0) {
                for (const id in exams) {

                    if (exams.hasOwnProperty(id)) {
                        let exam = exams[id];
                        let htmlliElement = document.createElement("li");
                        htmlliElement.className = "list-group-item";

                        let dateObj = new Date(exam.date);
                        let date = dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
                        if (userType === "teacher") {
                            htmlliElement.innerHTML = exam.course.grade + " / " + exam.course.subject + "-" + exam.course.group + ": " + date;
                        } else {
                            htmlliElement.innerHTML = exam.course.subject + ": " + date;
                        }
                        if (Date.parse(exam.date) > Date.now()) {
                            mainUL.appendChild(htmlliElement);
                        }
                    }
                }
                resolve();
            } else {
                reject("no data");
            }
        } catch (e) {
            reject(e);
            console.log(e)
        }
    });
}

function compare(a, b) {
    if (a.date < b.date) {
        return -1;
    }
    if (a.date > b.date) {
        return 1;
    }
    return 0;
}

document.addEventListener("DOMContentLoaded", async (event) => {
    await DatabaseConnector.initDB();
    try {
        await createExamsTable();
    } catch (e) {
        console.log(e);
    }
    try {
        await ApiConnector.loadExams();
    } catch (rejectedValue) {
        console.log(rejectedValue);
    }

});

addEventListener('dataUpdate', async () => {
    try {
        //await createKlausurenTable();
    } catch (e) {
        console.log('rej on DataUpdate');
    }
});