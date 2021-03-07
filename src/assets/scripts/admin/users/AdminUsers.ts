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

class AdminUsers {
    static usersTable: HTMLTableSectionElement;
    static selectFilterType: HTMLSelectElement;
    static selectFilterStatus: HTMLSelectElement;
    static inputFilterFirstname: HTMLInputElement;
    static inputFilterLastname: HTMLInputElement;

    static confirmBox: HTMLDivElement;
    static confirmFrameDelete: HTMLDivElement;
    static userDetailFrame: HTMLDivElement;
    static userCoursesTable: HTMLDivElement;
    static userCoursesFrame: HTMLDivElement;

    static usernameField: HTMLInputElement = <any>document.getElementById('ProfileDetailusername');
    static firstnameField: HTMLInputElement = <any>document.getElementById('ProfileDetailFirstname');
    static lastnameField: HTMLInputElement = <any>document.getElementById('ProfileDetailLastname');
    static mailAddressField: HTMLInputElement = <any>document.getElementById('ProfileDetailMail');
    static buttonCourseView: HTMLButtonElement = <any>document.getElementById('buttonOpenCourseFrame');

    static users: User[];
    static filter: { firstname: string | null, lastname: string | null, active: number | null, type: UserType | null } = {firstname: null, lastname: null, active: null, type: null};

    static load(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this.users = await ApiConnector.loadUsers();
            this.updateTable();
            resolve();
        });
    }

    static updateFilter() {
        console.log("NF " + this.selectFilterType.options[this.selectFilterType.options.selectedIndex.valueOf()].value)
        this.filter.type = Number(this.selectFilterType.options[this.selectFilterType.options.selectedIndex.valueOf()].value);
        if (this.filter.type === -1) {
            this.filter.type = null;
        }
        this.filter.active = this.selectFilterStatus.options.selectedIndex.valueOf();

        // this.filter.firstname = this.inputFilterFirstname.value.toLowerCase();
        // this.filter.lastname = this.inputFilterLastname.value.toLowerCase();

        this.updateTable();
    }

    static updateTable() {
        this.usersTable.innerHTML = "";
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            let add = true;
            if (this.filter.type != null) {
                if (user.type != this.filter.type) {
                    add = false;
                }
            }

            if (add) {
                this.usersTable.append(this.createRow(user));
            }
        }
    }

    static createRow(user: User) {

        let id = user['id_users'];

        let row = document.createElement('tr');
        let usernameContainer = document.createElement('th');

        let containerActions = document.createElement('div');
        containerActions.className = 'btn-group';
        //containerActions.role = 'group'

        let actionsColumn = document.createElement('td');

        let containerFirstname = document.createElement('td');
        let containerLastname = document.createElement('td');
        let containerType = document.createElement('td');
        usernameContainer.innerText = user.username;
        usernameContainer.scope = "row";
        row.append(usernameContainer);
        containerFirstname.innerText = user.firstName;
        row.append(containerFirstname);
        containerLastname.innerText = user.lastName;
        row.append(containerLastname);
        if (user.type === UserType.STUDENT) {
            containerType.innerText = "Student";
        } else if (user.type === UserType.TEACHER) {
            containerType.innerText = "Teacher";
        }
        row.append(containerType);

        let deleteButton = document.createElement('button');
        deleteButton.innerText = "Löschen";
        deleteButton.className = "btn btn-danger";
        deleteButton.onclick = () => AdminUsers.openDelete(user.id);
        containerActions.append(deleteButton);

        let resetButton = document.createElement('button');
        resetButton.innerText = "Reset";
        resetButton.className = "btn btn-danger";
        resetButton.onclick = () => AdminUsers.openUserReset(user.id);
        containerActions.append(resetButton);

        let openButton = document.createElement('button');
        openButton.innerText = "Öffnen";
        openButton.className = "btn btn-info";
        openButton.onclick = () => AdminUsers.openDetailView(user.id);

        containerActions.append(openButton);

        actionsColumn.append(containerActions);
        row.append(actionsColumn);

        return row;

    }

    static openDelete(id: number) {
        document.getElementById("confirmBox").style.visibility = "visible";
        document.getElementById("confirmDeleteFrame").style.visibility = "visible";
        console.log("DELETE: " + id);
    }

    static openUserReset(id: number) {
        console.log("UD:" + id);
        document.getElementById("confirmBox").style.visibility = "visible";
        document.getElementById("userResetFrame").style.visibility = "visible";
    }

    static async openDetailView(id: number) {
        this.confirmBox.style.visibility = "visible";
        this.userDetailFrame.style.visibility = "visible";

        let user = await ApiConnector.loadUserById(id);
        let usernameField = <any>document.getElementById('ProfileDetailusername');
        let firstnameField = <any>document.getElementById('ProfileDetailFirstname');
        let lastnameField = <any>document.getElementById('ProfileDetailLastname');
        let mailAddressField = <any>document.getElementById('ProfileDetailMail');
        let buttonCourseView = <any>document.getElementById('buttonOpenCourseFrame');
        console.log(user[0]);
        user = user[0];
        usernameField.value = user["username"];
        firstnameField.value = user["firstName"];
        lastnameField.value = user["lastName"];
        if (user.mails != null && user["mails"].length > 0) {
            mailAddressField.value = user["mails"][0]["address"];
        }
        buttonCourseView.onclick = () => this.openCourseView(user.courses);
        buttonCourseView.innerText = "Kursliste";

    }

    static openCourseView(courses: Course[]) {
        courses.sort((a, b) => {
            if (a.grade > b.grade) {
                return 1;
            } else if (a.grade < b.grade) {
                return -1;
            } else {
                if (a.subject > b.subject) {
                    return 1
                } else if (a.subject < b.subject) {
                    return -1;
                } else {
                    return 0;
                }
            }
        })

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
            this.userCoursesTable.append(rowElement);
            console.log(this.userCoursesTable)
        }

        this.confirmBox.style.visibility = "visible";
        this.userCoursesFrame.style.visibility = "visible";

    }

    static clearDialogs() {

        this.usernameField.value = "Loading ...";
        this.firstnameField.value = "Loading ...";
        this.lastnameField.value = "Loading ...";
        this.mailAddressField.value = "not set";
        this.buttonCourseView.innerText = "Kursliste (Loading...)";
        this.userCoursesTable.innerHTML = "";
    }

    static closeAllPopups() {
        this.confirmBox.style.visibility = "hidden";
        this.confirmFrameDelete.style.visibility = "hidden";
        this.userDetailFrame.style.visibility = "hidden";
        document.getElementById("userResetFrame").style.visibility = "hidden";
        document.getElementById("userCoursesFrame").style.visibility = "hidden";
        document.getElementById("confirmBox").style.visibility = "hidden";
        this.clearDialogs();
    }
}