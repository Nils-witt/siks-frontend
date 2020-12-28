class Main {
    static updateLocalData = async () => {
        let databaseConnector = new DatabaseConnector();
        await databaseConnector.initDB();
        let apiConnector = new ApiConnector(window.localStorage.getItem('token'), databaseConnector);
        let data = await apiConnector.loadUserProfile();

        localStorage.setItem('firstName', data['firstName']);
        localStorage.setItem('lastName', data['lastName']);
        if (data['mails'].hasOwnProperty(0)) {
            localStorage.setItem('mail', data['mails'][0]['address']);
        }

        databaseConnector.clearCourses();
        for (let i = 0; i < data['courses'].length; i++) {
            await databaseConnector.saveCourse(data['courses'][i]);
        }

        databaseConnector.clearDevices();
        for (let i = 0; i < data['devices'].length; i++) {
            await databaseConnector.saveDevice(data['devices'][i]);
        }
        let event = new Event('dataUpdate');
        dispatchEvent(event)
    }
}


addEventListener("DOMContentLoaded", Main.updateLocalData);