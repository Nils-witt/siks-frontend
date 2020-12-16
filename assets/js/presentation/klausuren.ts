"use strict";
let userType = window.localStorage.getItem("userType");
let examsDbc: DatabaseConnector;

async function createExamsTable(): Promise<void> {
    return new Promise(async function (resolve, reject) {
        try {
            let exams = await examsDbc.getExams();
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

document.addEventListener("DOMContentLoaded", async function (event) {
    examsDbc = new DatabaseConnector();
    let apc = new ApiConnector(window.localStorage.getItem("token"), examsDbc);
    await examsDbc.initDB();
    try {
        await createExamsTable();
    } catch (e) {
        console.log(e);
    }
    try {
        await apc.loadExams(window.localStorage.getItem("token"));
    } catch (rejectedValue) {
        console.log(rejectedValue);
    }

});

addEventListener('dataUpdate', async function () {
    try {
        //await createKlausurenTable();
    } catch (e) {
        console.log('rej on DataUpdate');
    }
});