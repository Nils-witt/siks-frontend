"use strict";
let usersLocalTable;
let usersRemoteTable;


function loadLocalUsers(){
    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", async function () {
        if (this.readyState === 4 && this.status === 200) {

            let json = this.responseText;
            let data = JSON.parse(json);

            await initDb();
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

        }
        if (this.readyState === 4 && this.status === 401) {
            authErr();
        }
        if (this.readyState === 4 && this.status === 604) {
            console.log("err");
        }
    });

    xhr.open("GET", baseURL + "/users");
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.localStorage.getItem("token"));
    xhr.send();
}

function loadRemoteUsers(){
    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", async function () {
        if (this.readyState === 4 && this.status === 200) {

            let json = this.responseText;
            let data = JSON.parse(json);

            await initDb();
            clearRemoteUsersTable();

            let users = [];
            for (let i = 0; i < data.length; i++) {
                let str = data[i]["sn"] + ", " + data[i]["givenName"];
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

        }
        if (this.readyState === 4 && this.status === 401) {
            authErr();
        }
        if (this.readyState === 4 && this.status === 604) {
            console.log("err");
        }
    });

    xhr.open("GET", baseURL + "/users");
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.localStorage.getItem("token"));
    xhr.send();

}

function clearLocalUsersTable() {

}

function clearRemoteUsersTable(){

}




document.addEventListener("DOMContentLoaded", async function(event) {
    usersLocalTable = document.getElementById("tableBodyLocal");
    usersRemoteTable = document.getElementById("tableBodyRemote");

    loadLocalUsers();
    loadRemoteUsers();
});