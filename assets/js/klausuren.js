"use strict";
let userType = window.localStorage.getItem("userType");

async function createKlausurenTable(){
	return new Promise(async function (resolve, reject) {
		try {
			let exams = await getExams();
			let mainUL = document.getElementById("mainUL");

			exams.sort(compare);

			if (Object.keys(exams).length > 0) {
				for (const id in exams) {

					let exam = exams[id];
					let el = document.createElement("li");
					el.className = "list-group-item";

					let dateObj = new Date(exam.date);
					let date = dateObj.getDate() + "." + (dateObj.getMonth() + 1) + "." + dateObj.getFullYear();
					if (userType == "teacher") {
						el.innerHTML = exam.course.grade + " / " + exam.course.subject + "-" + exam.course.group + ": " + date;
					} else {
						el.innerHTML = exam.course.subject + ": " + date;
					}

					mainUL.appendChild(el);
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
function compare( a, b ) {
	if ( a.date < b.date ){
		return -1;
	}
	if ( a.date > b.date ){
		return 1;
	}
	return 0;
}


document.addEventListener("DOMContentLoaded", async function(event) {
    await initDb();
    try {
		await loadExamsApi(window.localStorage.getItem("token"));
        await createKlausurenTable();
    }catch (rejectedValue) {
    }
});

addEventListener('dataUpdate',async function(){
    try {
        //await createKlausurenTable();
    }catch (e) {
        console.log('rej on DataUpdate');
    }
});