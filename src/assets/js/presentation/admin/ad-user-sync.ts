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