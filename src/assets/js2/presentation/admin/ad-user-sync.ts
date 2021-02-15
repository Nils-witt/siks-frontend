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
let usersLocalTable;
let usersRemoteTable;


async function loadLocalUsers() {
    let response = await fetch(baseURL + "/users", {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + window.localStorage.getItem("token")
        },
    });

    if (response.status === 200) {

        let data = await response.json();

        clearLocalUsersTable();

        let users = [];
        for (let i = 0; i < data.length; i++) {
            let str = data[i]["lastname"] + ", " + data[i]["firstname"];
            users.push(str);
        }
        users.sort();

        for (let i = 0; i < users.length; i++) {
            let row = document.createElement("tr");
            let colName = document.createElement("td");
            colName.innerText = users[i];
            usersLocalTable.append(row);
        }

    } else if (response.status === 401) {
        await authErr();
    } else if (response.status === 604) {
        console.log("err");
    }

}

async function loadRemoteUsers() {
    let response = await fetch(baseURL + "/users/ldap", {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + window.localStorage.getItem("token")
        },
    });

    if (response.status === 200) {
        let data = <User[]><unknown>await response.json();

        clearRemoteUsersTable();

        let users = [];
        for (let i = 0; i < data.length; i++) {
            let str = data[i]["lastName"] + ", " + data[i]["firstName"];
            users.push(str);
        }
        users.sort();

        for (let i = 0; i < users.length; i++) {
            let row = document.createElement("tr");
            let colName = document.createElement("td");
            colName.innerText = users[i];
            row.append(colName);
            usersRemoteTable.append(row);
        }
    } else if (response.status === 401) {
        await authErr();
    } else if (response.status === 604) {
        console.log("err");
    }

}

function clearLocalUsersTable() {

}

function clearRemoteUsersTable() {

}


document.addEventListener("DOMContentLoaded", async () => {
    usersLocalTable = document.getElementById("tableBodyLocal");
    usersRemoteTable = document.getElementById("tableBodyRemote");

    await loadLocalUsers();
    await loadRemoteUsers();
});