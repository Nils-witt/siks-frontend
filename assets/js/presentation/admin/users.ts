"use strict";

class AdminUserView {
    selectedOptions: { firstname: string; active: number; type: number; lastname: string };
    databaseConnector: DatabaseConnector;
    apiConnector: ApiConnector;
    adminUserView: AdminUserView;

    constructor(databaseConnector: DatabaseConnector, apiConnector: ApiConnector) {
        this.databaseConnector = databaseConnector;
        this.apiConnector = apiConnector;
        this.selectedOptions = {"type": 0, "active": null, "firstname": "", "lastname": ""};
        this.adminUserView = this;
    }

    async loadUsersIntoTable() {
        let users = await this.databaseConnector.getUsers();
        document.getElementById("tableBody").innerHTML = "";
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let add = true;
            if (this.selectedOptions["type"] === 1 && user.type !== 1) {
                add = false;
            } else if (this.selectedOptions["type"] === 2 && user.type !== 2) {
                add = false;
            }
            if (this.selectedOptions["active"] === 0 && user.active !== 0) {
                add = false;
            } else if (this.selectedOptions["active"] === 1 && user.active !== 1) {
                add = false;
            }

            if (this.selectedOptions["firstname"] !== "" && !user.firstname.toLowerCase().includes(this.selectedOptions["firstname"])) {
                add = false;
            }
            if (this.selectedOptions["lastname"] !== "" && !user.lastname.toLowerCase().includes(this.selectedOptions["lastname"])) {
                add = false;
            }

            if (add) {
                document.getElementById("tableBody").append(this.createRow(user));
            }
        }
    }

    createRow(user) {

        let id = user['idusers'];

        let row = document.createElement('tr');
        let usernameContainer = document.createElement('th');

        let containerActions = document.createElement('div');
        containerActions.className = 'btn-group';
        //containerActions.role = 'group'

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
        if (user["type"] === "1") {
            containerType.innerText = "Student";
        } else if (user["type"] === "2") {
            containerType.innerText = "Teacher";
        }
        row.append(containerType);
        let userActiveCheckBox = document.createElement("input");
        userActiveCheckBox.type = "checkbox";
        if (user["active"] === "1") {
            userActiveCheckBox.checked = true;
        }
        //userActiveCheckBox.disabled = true;
        userActiveCheckBox.onclick = () => console.log('CheckBoy clicked: ' + id);

        containerBlocked.append(userActiveCheckBox);
        row.append(containerBlocked);

        let deleteButton = document.createElement('button');
        deleteButton.innerText = "Löschen";
        deleteButton.className = "btn btn-danger";
        deleteButton.onclick = () => openConfirmDeleteView(this.adminUserView, id);
        containerActions.append(deleteButton);

        let resetButton = document.createElement('button');
        resetButton.innerText = "Reset";
        resetButton.className = "btn btn-danger";
        resetButton.onclick = () => openUserResetView(this.adminUserView, id);
        containerActions.append(resetButton);

        let openButton = document.createElement('button');
        openButton.innerText = "Öffnen";
        openButton.className = "btn btn-info";
        openButton.onclick = () => openUserDetailView(this.adminUserView, id);

        containerActions.append(openButton);

        actionsColumn.append(containerActions);
        row.append(actionsColumn);

        return row;
    }

    getSelectOptions() {
        let select = <HTMLSelectElement>document.getElementById("userTypeSelect");
        this.selectedOptions["type"] = parseInt(select.options[select.selectedIndex].value);
        select = <HTMLSelectElement>document.getElementById("activeSelect");
        this.selectedOptions["active"] = parseInt(select.options[select.selectedIndex].value);
        this.selectedOptions["firstname"] = (<HTMLInputElement>document.getElementById("firstnameSelect")).value.toLowerCase();
        this.selectedOptions["lastname"] = (<HTMLInputElement>document.getElementById("lastnameSelect")).value.toLowerCase();
        this.loadUsersIntoTable();
    }

    openConfirmDeleteView(id) {
        console.log(id);
        document.getElementById("confirmBox").style.visibility = "visible";
        document.getElementById("confirmDeleteFrame").style.visibility = "visible";
    }

    async openUserDetailView(id) {
        document.getElementById("confirmBox").style.visibility = "visible";
        document.getElementById("userDetailFrame").style.visibility = "visible";

        let user = await this.apiConnector.loadUserById(id);
        if (user.length === 1) {
            let usernameField = <HTMLInputElement>document.getElementById('ProfileDetailusername');
            let firstnameField = <HTMLInputElement>document.getElementById('ProfileDetailFirstname');
            let lastnameField = <HTMLInputElement>document.getElementById('ProfileDetailLastname');
            let mailAddressField = <HTMLInputElement>document.getElementById('ProfileDetailMail');
            let buttonCourseView = <HTMLInputElement>document.getElementById('buttonOpenCourseFrame');
            console.log(user[0]);
            user = user[0];

            usernameField.value = user["username"];
            firstnameField.value = user["firstName"];
            lastnameField.value = user["lastName"];
            if (user["mails"].length > 0) {
                mailAddressField.value = user["mails"][0]["address"];
            }
            // @ts-ignore
            buttonCourseView.onclick = () => openCourseView(adminUserView, user.courses);
            buttonCourseView.innerText = "Kursliste";
        }
    }

    clearDialogs() {
        let usernameField = <HTMLInputElement>document.getElementById('ProfileDetailusername');
        let firstnameField = <HTMLInputElement>document.getElementById('ProfileDetailFirstname');
        let lastnameField = <HTMLInputElement>document.getElementById('ProfileDetailLastname');
        let mailAddressField = <HTMLInputElement>document.getElementById('ProfileDetailMail');
        let buttonCourseView = <HTMLInputElement>document.getElementById('buttonOpenCourseFrame');
        let tableBodyCourses = <HTMLInputElement>document.getElementById('tableBodyCoursesUser');

        usernameField.value = "Loading ...";
        firstnameField.value = "Loading ...";
        lastnameField.value = "Loading ...";
        mailAddressField.value = "not set";
        buttonCourseView.innerText = "Kursliste (Loading...)";
        tableBodyCourses.innerHTML = "";
    }

    openUserResetView(id) {
        console.log("UD:" + id);
        document.getElementById("confirmBox").style.visibility = "visible";
        document.getElementById("userResetFrame").style.visibility = "visible";
    }

    openCourseView(courses) {
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

    closeConfirmViews() {
        document.getElementById("confirmDeleteFrame").style.visibility = "hidden";
        document.getElementById("userDetailFrame").style.visibility = "hidden";
        document.getElementById("userResetFrame").style.visibility = "hidden";
        document.getElementById("userCoursesFrame").style.visibility = "hidden";
        document.getElementById("confirmBox").style.visibility = "hidden";
        this.clearDialogs();
    }
}

let adminUserView: AdminUserView;
document.addEventListener("DOMContentLoaded", async function (event) {
    let databaseConnector = new DatabaseConnector();
    await databaseConnector.initDB();
    let apiConnector = new ApiConnector(window.localStorage.getItem('token'), databaseConnector);
    adminUserView = new AdminUserView(databaseConnector, apiConnector);
    try {
        await adminUserView.loadUsersIntoTable();
    } catch (rejectedValue) {

    }
    await apiConnector.loadUserApi(localStorage.getItem("token"));
});

addEventListener('dataUpdate', async function () {
    try {
        await adminUserView.loadUsersIntoTable();
    } catch (rejectedValue) {
        console.log('rej on DataUpdate');
        console.log(rejectedValue)
    }
});

function openConfirmDeleteView(adminUserView: AdminUserView, id: number) {
    adminUserView.openConfirmDeleteView(id);
}

function openUserResetView(adminUserView: AdminUserView, id: number) {
    adminUserView.openUserResetView(id);
}

function openUserDetailView(adminUserView: AdminUserView, id: number) {
    adminUserView.openUserDetailView(id);
}

// @ts-ignore
function openCourseView(adminUserView: AdminUserView, id: number) {
    adminUserView.openCourseView(id);
}