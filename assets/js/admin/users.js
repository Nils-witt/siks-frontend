"use strict";

let selectedOptions = {"type": 0, "active": null, "firstname": "", "lastname": ""};


async function loadUsersIntoTable() {
    let users = await getUsers();
    document.getElementById("tableBody").innerHTML = "";
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let add = true;
        if(selectedOptions["type"] == "1" && user.type != "1"){
            add = false;
        }else if(selectedOptions["type"] == "2" && user.type != "2"){
            add = false;
        }
        if(selectedOptions["active"] == "0" && user.active != "0"){
            add = false;
        }else if(selectedOptions["active"] == "1" && user.active != "1"){
            add = false;
        }

        if(selectedOptions["firstname"] != "" && !user.firstname.toLowerCase().includes(selectedOptions["firstname"])){
            add = false;
        }
        if(selectedOptions["lastname"] != "" && !user.lastname.toLowerCase().includes(selectedOptions["lastname"])){
            add = false;
        }

        if(add){
            document.getElementById("tableBody").append(createRow(user));
        }
    }
}

function createRow(user) {

    let id = user['idusers'];

    let row = document.createElement('tr');
    let usernameContainer = document.createElement('th');

    let containerActions = document.createElement('div');
    containerActions.className = 'btn-group';
    containerActions.role = 'group'

    let actionsColumn = document.createElement('td');

    let containerBlocked = document.createElement('td');
    let containerFirstname = document.createElement('td');
    let containerLastname = document.createElement('td');
    let containerType = document.createElement('td');
    usernameContainer.innerText = user["username"];
    usernameContainer.scope = "row";
    row.append(usernameContainer);
    containerFirstname.innerText = user["firstname"];
    row.append(containerFirstname);
    containerLastname.innerText = user["lastname"];
    row.append(containerLastname);
    if(user["type"] == "1"){
        containerType.innerText = "Student";
    }else if(user["type"] == "2"){
        containerType.innerText = "Teacher";
    }
    row.append(containerType);
    let userActiveCheckBox = document.createElement("input");
    userActiveCheckBox.type = "checkbox";
    if(user["active"] == "1"){
        userActiveCheckBox.checked = true;
    }
    //userActiveCheckBox.disabled = true;
    userActiveCheckBox.onclick = () => console.log('CheckBoy clicked: '+ id);

    containerBlocked.append(userActiveCheckBox);
    row.append(containerBlocked);

    let deleteButton = document.createElement('button');
    deleteButton.innerText = "Löschen";
    deleteButton.className = "btn btn-danger";
    deleteButton.onclick = () => openConfirmDeleteView(id);
    containerActions.append(deleteButton);

    let resetButton = document.createElement('button');
    resetButton.innerText = "Reset";
    resetButton.className = "btn btn-danger";
    resetButton.onclick = () => openUserResetView(id);
    containerActions.append(resetButton);

    let openButton = document.createElement('button');
    openButton.innerText = "Öffnen";
    openButton.className = "btn btn-info";
    openButton.onclick = () => openUserDetailView(id);

    containerActions.append(openButton);

    actionsColumn.append(containerActions);
    row.append(actionsColumn);

    return row;
}

function getSelectOptions(){
    let select = document.getElementById("userTypeSelect");
    selectedOptions["type"] = select.options[select.selectedIndex].value;
    select = document.getElementById("activeSelect");
    selectedOptions["active"] = select.options[select.selectedIndex].value;
    selectedOptions["firstname"] = document.getElementById("firstnameSelect").value.toLowerCase();
    selectedOptions["lastname"] = document.getElementById("lastnameSelect").value.toLowerCase();
    loadUsersIntoTable();
}

function openConfirmDeleteView(id){
    console.log(id);
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("confirmDeleteFrame").style.visibility = "visible";
}
let api = new ApiConnector(localStorage.getItem("token"));

async function openUserDetailView(id){
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userDetailFrame").style.visibility = "visible";

    let user = await api.loadUserById(id);
    if(user.length == 1){
        let usernameField = document.getElementById('ProfileDetailusername');
        let firstnameField = document.getElementById('ProfileDetailFirstname');
        let lastnameField = document.getElementById('ProfileDetailLastname');
        let mailAddressField = document.getElementById('ProfileDetailMail');
        let buttonCourseView = document.getElementById('buttonOpenCourseFrame');
        console.log(user[0]);
        user = user[0];

        usernameField.value = user["username"];
        firstnameField.value = user["firstName"];
        lastnameField.value = user["lastName"];
        if(user["mails"].length > 0){
            mailAddressField.value = user["mails"][0]["address"];
        }
        buttonCourseView.onclick = () => openCourseView(user.courses);
        buttonCourseView.innerText = "Kursliste";
    }
}

function clearDialogs(){
    let usernameField = document.getElementById('ProfileDetailusername');
    let firstnameField = document.getElementById('ProfileDetailFirstname');
    let lastnameField = document.getElementById('ProfileDetailLastname');
    let mailAddressField = document.getElementById('ProfileDetailMail');
    let buttonCourseView = document.getElementById('buttonOpenCourseFrame');
    let tableBodyCourses = document.getElementById('tableBodyCoursesUser');

    usernameField.value = "Loading ...";
    firstnameField.value = "Loading ...";
    lastnameField.value = "Loading ...";
    mailAddressField.value = "not set";
    buttonCourseView.innerText = "Kursliste (Loading...)";
    tableBodyCourses.innerHTML = "";
}

function openUserResetView(id){
    console.log("UD:"+ id);
    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userResetFrame").style.visibility = "visible";
}

function openCourseView(courses) {
    let tableBodyBox = document.getElementById('tableBodyCoursesUser');

    for (let i = 0; i < courses.length; i++) {
        let course = courses[i];
        let rowElement = document.createElement('tr');
        let gradeTd = document.createElement('td');
        let subjectTd = document.createElement('td');
        let groupTd = document.createElement('td');

        gradeTd.innerText = course["grade"];
        subjectTd.innerText = course["subject"];
        groupTd.innerText = course["group"];

        rowElement.append(gradeTd);
        rowElement.append(subjectTd);
        rowElement.append(groupTd);

        tableBodyBox.append(rowElement);
    }

    document.getElementById("confirmBox").style.visibility = "visible";
    document.getElementById("userCoursesFrame").style.visibility = "visible";
}



function closeConfirmViews(){
    document.getElementById("confirmDeleteFrame").style.visibility = "hidden";
    document.getElementById("userDetailFrame").style.visibility = "hidden";
    document.getElementById("userResetFrame").style.visibility = "hidden";
    document.getElementById("userCoursesFrame").style.visibility = "hidden";
    document.getElementById("confirmBox").style.visibility = "hidden";
    clearDialogs();
}

document.addEventListener("DOMContentLoaded", async function(event) {
    await initDb();
    try {
        await loadUsersIntoTable();
    }catch (rejectedValue) {

    }
    await loadUserApi(localStorage.getItem("token"));
});

addEventListener('dataUpdate',async function(){
    try {
        await loadUsersIntoTable();
    }catch (rejectedValue) {
        console.log('rej on DataUpdate');
        console.log(rejectedValue)
    }
});