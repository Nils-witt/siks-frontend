let courses = [];
let grades = {};

let api = new ApiConnector(localStorage.getItem("token"), new DatabaseConnector());

let selected = {"grade": "", "subject": ""};

function populateGradeSelect() {
    let gradeSelect = document.getElementById("gradeSelect");
    let groupSelect = document.getElementById("groupSelect");
    let subjectSelect = document.getElementById("subjectSelect");

    gradeSelect.innerHTML = "";
    groupSelect.innerHTML = "";
    subjectSelect.innerHTML = "";

    let opt = document.createElement('option');
    opt.appendChild(document.createTextNode("Grade"));
    gradeSelect.append(opt);

    opt = document.createElement('option');
    opt.appendChild(document.createTextNode("Subject"));
    subjectSelect.append(opt);

    opt = document.createElement('option');
    opt.appendChild(document.createTextNode("Group"));
    groupSelect.append(opt);

    let gradeNames = Object.keys(grades);
    for (let i = 0; i < gradeNames.length; i++) {
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode(gradeNames[i]));
        opt.value = gradeNames[i];
        gradeSelect.append(opt)
    }
}

function selectUpdate() {
    let gradeSelect = <HTMLSelectElement>document.getElementById("gradeSelect");
    let groupSelect = <HTMLSelectElement>document.getElementById("groupSelect");
    let subjectSelect = <HTMLSelectElement>document.getElementById("subjectSelect");

    let selectedGrade = gradeSelect.options[gradeSelect.selectedIndex].value;
    let selectedGroup = groupSelect.options[groupSelect.selectedIndex].value;
    let selectedSubject = subjectSelect.options[subjectSelect.selectedIndex].value;

    groupSelect.innerHTML = "";
    let opt = document.createElement('option');
    opt.appendChild(document.createTextNode("Group"));
    groupSelect.append(opt);

    if (selectedGrade === "Grade") {
        selected["grade"] = "Grade";
        subjectSelect.innerHTML = "";
        opt = document.createElement('option');
        opt.appendChild(document.createTextNode("Subject"));
        subjectSelect.append(opt);
        groupSelect.innerHTML = "";
        opt = document.createElement('option');
        opt.appendChild(document.createTextNode("Group"));
        groupSelect.append(opt);
    }

    if (selectedSubject === "Subject") {
        groupSelect.innerHTML = "";
        let opt = document.createElement('option');
        opt.appendChild(document.createTextNode("Group"));
        groupSelect.append(opt);
    }

    if (selectedGrade !== selected["grade"]) {
        console.log("update subjects");
        subjectSelect.innerHTML = "";
        opt = document.createElement('option');
        opt.appendChild(document.createTextNode("Subject"));
        subjectSelect.append(opt);
        let subjectNames = Object.keys(grades[selectedGrade]);
        for (let i = 0; i < subjectNames.length; i++) {
            let opt = document.createElement('option');
            opt.appendChild(document.createTextNode(subjectNames[i]));
            opt.value = subjectNames[i];
            subjectSelect.append(opt)
        }
        selectedSubject = "Subject";
        selected["subject"] = selectedSubject;
    }


    if (selectedSubject !== selected["subject"]) {
        console.log("update groups");
        if (selectedSubject !== "Subject") {
            let groupNames = Object.keys(grades[selectedGrade][selectedSubject]);
            for (let i = 0; i < groupNames.length; i++) {
                let opt = document.createElement('option');
                opt.appendChild(document.createTextNode(groupNames[i]));
                opt.value = groupNames[i];
                groupSelect.append(opt)
            }
        }
    }

    selected["grade"] = selectedGrade;
    selected["subject"] = selectedSubject;
}

function preloadCourses(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        //courses = await DatabaseConnector.getCourses();

        for (let i = 0; i < courses.length; i++) {
            let course = courses[i];
            if (!grades.hasOwnProperty(course["grade"])) {
                grades[course["grade"]] = {};
            }
            if (!grades[course["grade"]].hasOwnProperty(course["subject"])) {
                grades[course["grade"]][course["subject"]] = {};
            }
            if (!grades[course["grade"]][course["subject"]].hasOwnProperty(course["group"])) {
                grades[course["grade"]][course["subject"]][course["group"]] = course;
            }
        }
        resolve();
    });
}

async function populateAnnouncementTable() {
    let frame = document.getElementById("tableBody");

    frame.innerHTML = "";
    let data = await api.loadAnnouncementsAdmin();

    for (let i = 0; i < data.length; i++) {

        let element = data[i];

        let row = document.createElement("tr");


        let courseTd = document.createElement("td");
        courseTd.innerText = element["course"]["grade"] + "/ " + element["course"]["subject"] + "-" + element["course"]["group"];

        let dateTd = document.createElement("td");
        dateTd.innerText = element["date"];

        let onlineTd = document.createElement("td");
        onlineTd.innerText = "nope";

        let contentTd = document.createElement("td");
        contentTd.innerText = element["content"];

        let actionTd = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.className = "btn btn-danger";

        let id = element["id"];
        deleteButton.onclick = () => {
            deleteAnnouncement(id)
        };

        actionTd.append(deleteButton);

        row.append(courseTd);
        row.append(dateTd);
        row.append(onlineTd);
        row.append(contentTd);
        row.append(actionTd);

        frame.append(row);

    }
}

async function deleteAnnouncement(id) {
    await api.deleteAnnouncement(id);
    await populateAnnouncementTable();

}

async function createAnnouncement() {
    (<HTMLButtonElement>document.getElementById("saveAnnouncement")).disabled = true;
    (<HTMLButtonElement>document.getElementById("clearInput")).disabled = true;
    let gradeSelect = <HTMLSelectElement>document.getElementById("gradeSelect");
    let groupSelect = <HTMLSelectElement>document.getElementById("groupSelect");
    let subjectSelect = <HTMLSelectElement>document.getElementById("subjectSelect");

    let date = (<HTMLInputElement>document.getElementById("dateInput")).value;
    let content = (<HTMLInputElement>document.getElementById("announcementContent")).value;

    let grade = gradeSelect.options[gradeSelect.selectedIndex].value;
    let group = groupSelect.options[groupSelect.selectedIndex].value;
    let subject = subjectSelect.options[subjectSelect.selectedIndex].value;


    let announcement = {
        "course": {"grade": grade, "subject": subject, "group": group},
        "date": date,
        "content": content
    };

    await api.saveAnnouncement(announcement);
    await populateAnnouncementTable();
    (<HTMLButtonElement>document.getElementById("saveAnnouncement")).disabled = false;
    (<HTMLButtonElement>document.getElementById("clearInput")).disabled = false;
}


function openCreateView() {
    document.getElementById("createAnnouncement").style.visibility = "visible";
    document.getElementById("openCreate").style.visibility = "collapse";
}

function setDateToday() {
    let date = new Date();
    (<HTMLInputElement>document.getElementById("dateInput")).value = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, "0");
}

//Table actions

document.addEventListener("DOMContentLoaded", async function (event) {
    setDateToday();
    await populateAnnouncementTable();
    await preloadCourses();
    populateGradeSelect();
    //await loadCourses(window.localStorage.getItem("token"));
});

addEventListener('dataUpdate', async () => {
    console.log("DU");
    try {
        await preloadCourses();
        populateGradeSelect();
    } catch (rejectedValue) {
        console.log('rej on DataUpdate');
    }
});