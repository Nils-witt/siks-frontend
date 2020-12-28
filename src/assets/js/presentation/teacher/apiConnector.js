

function saveAnnouncementToApi(announcement) {
    let token = localStorage.getItem("token");
    return new Promise(async function (resolve, reject) {
        let response = await fetch(baseURL + "/announcements/", {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(announcement)
        });
        if (response.status === 200) {

            resolve();
        }
        if (response.status === 401) {
            //authErr();
            reject('err');
        }
        if (response.status === 604) {
            console.log("err");
            reject('err');
        }
    });
}

function deleteAnnouncementFromApi(id){
    let token = localStorage.getItem("token");
    return new Promise(async function (resolve, reject) {
        await fetch(baseURL + "/announcements/id/" + id.toString(), {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + token,
                'Content-type': 'application/json; charset=utf-8'
            }
        });
        resolve();
    });
}