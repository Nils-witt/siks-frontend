/*
function convertTimeToSeconds(time){
    let date = time.split(":");
    return (date[0]*3600) + (date[1] * 60);
}

var timeTable = {};
timeTable.data = {};
timeTable.data.announcements = {};
timeTable.data.exams = {};
timeTable.data.lessons = {};
timeTable.data.preparedData = {};
timeTable.data.replacementLessons = {};
timeTable.offset = 0;
timeTable.weekdays = {1:'Montag', 2:'Dienstag', 3:'Mittwoch', 4:'Donnerstag', 5:'Freitag', 6:'Samstag', 7:'Sonntag'};
timeTable.weekStart;
timeTable.timeLessons = [[28200,30900],[30900,33600],[34800,37500],[37800,40500],[41700,44400],[44400,47100]];
timeTable.userType = window.localStorage.getItem("userType");


timeTable.generateTable = () =>{
    if (Object.keys(timeTable.data.preparedData).length > 0) {
        let daysContainer = document.createElement('div');
        daysContainer.id = 'daysContainer';
        daysContainer.className = 'row';

        for (let day in timeTable.data.preparedData) {
            let htmlDay = timeTable.generateDay(timeTable.data.preparedData[day], day);
            daysContainer.append(htmlDay)
        }

        let container = document.getElementById('container');
        container.innerHTML = "";
        container.append(daysContainer);

        return daysContainer;
    }
}
timeTable.generateDay = (dayObject, dayInt) => {
    let day = document.createElement('div');
    day.className = 'col';

    let headline = document.createElement('h5');
    headline.innerText = timeTable.weekdays[dayInt];
    day.append(headline);

    let preKey = 1;
    for (let key in dayObject) {
        if (dayObject.hasOwnProperty(key)) {
            if(parseInt(key) !== preKey){
                let diff = parseInt(key) - preKey;
                for(let i = 0; i < diff; i++){

                    let main = document.createElement('div');
                    main.className = 'row';
                    main.style = 'padding-left: 24px';

                    let indicator = document.createElement('div');
                    indicator.className = 'col';
                    indicator.style = 'max-width: 5px;background-color: grey;padding: 0;max-height: 100%;';


                    main.append(indicator);

                    let container = document.createElement('div');
                    container.className = 'col';

                    let text = document.createElement('p');
                    text.innerText = "Freistunde";

                    container.append(text);
                    main.append(container);
                    day.append(main);

                }
            }
            const lesson = dayObject[key];
            let htmlLesson = timeTable.generateColumn(lesson);
            day.append(htmlLesson);
            preKey = parseInt(key) + 1;
        }
    }

    return day;
}

timeTable.generateColumn = (lesson) => {
    if(lesson != null){
        let main = document.createElement('div');
        let indicator;
        let container = document.createElement('div');
        let text = document.createElement('p');
        let notificationBell = document.createElement('div');

        let indicatorColor = "green";
        let notification = false;

        if (lesson.hasOwnProperty("announcement")) notification = true;

        if(lesson.hasOwnProperty("exam")){
            text.innerText = lesson["exam"]["subject"];
            indicatorColor = "blue";
        }else if(lesson.hasOwnProperty("replacementLesson")){
            text.innerText = lesson["replacementLesson"]["subject"];
            if(lesson["replacementLesson"]["room"] === "---"){
                indicatorColor = "red";
                text.innerText = "Freistunde";
            }else{
                indicatorColor = "orange";
                text.innerText = lesson["replacementLesson"]["subject"];
            }
        }else if(lesson.hasOwnProperty("lesson")){
            text.innerText = lesson;
            if(timeTable.userType === "teacher"){
                text.innerText = lesson["lesson"]["course"]["grade"] + " / " + lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
            }else{
                text.innerText = lesson["lesson"]["course"]["subject"];
            }
        }


        indicator = timeTable.generateIndicator(0, indicatorColor);

        if(notification){
            notificationBell.innerHTML = '<i class="material-icons">notification_important</i>';
        }

        notificationBell.style = "width:24px";
        main.append(notificationBell);
        indicator.className = 'col';
        main.append(indicator);
        container.className = 'col';
        container.onclick = function() {openDetailView(lesson)};
        container.style.cursor = "pointer";
        container.append(text);
        main.append(container);
        main.className = 'row';
        return main;
    }
}

timeTable.generateIndicator = (personPreset,lessonStatus) => {
    let indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'col';
    indicatorContainer.style = 'max-width: 5px;padding: 0;max-height: 100%;';

    let indicatorLesson = document.createElement('div');
    indicatorLesson.className = "indicator indicator-" + lessonStatus;
    indicatorContainer.append(indicatorLesson);
    return indicatorContainer
}

timeTable.prepareData = () =>{
    let lessons = {};
    let exams = {};
    let replacementLessons = {};
    let announcements = {};

    let data = {};

    timeTable.data.lessons.forEach(lesson => {
        let hour = lesson["lessonNumber"];
        let day = lesson.day;

        if (!lessons.hasOwnProperty(day)) {
            lessons[day] = {};
        }
        lessons[day][hour] = lesson;

    });

    timeTable.data.exams.forEach(exam => {
        let date = new Date(exam["date"]);
        let day = date.getDay();
        let firstLesson = null;
        let lastLesson = null;
        let start = convertTimeToSeconds(exam["from"]);
        let end = convertTimeToSeconds(exam["to"]);

        for(let i = 0; i < timeLessons.length; i++){
            let lesson = timeLessons[i];
            if(lesson[0] <= start && lesson[1] >= start){
                firstLesson = i+1;
            }
            if(lesson[0] <= end && lesson[1] >= end){
                lastLesson = i+1;
            }
        }

        if(lastLesson != null && firstLesson != null){
            for (let i = firstLesson; i <= lastLesson; i++){
                if(!exams.hasOwnProperty(day)){
                    exams[day] = {};
                }
                exams[day][i] = exam;
            }
        }
    });

    timeTable.data.replacementLessons.forEach(replacementLesson => {
        let lessonId = replacementLesson["lessonId"];
        replacementLessons[lessonId] = replacementLesson;

    });

    timeTable.data.announcements.forEach(announcement => {
        let weekday = announcement.weekday;

        if (!announcements.hasOwnProperty(weekday)) {
            announcements[weekday] = {};
        }
        Object.keys(lessons[weekday]).forEach(lessonNumber => {
            let lesson = lessons[weekday][lessonNumber];
            if(announcement["courseId"] === lesson["course"]["id"]){
                if(!announcements[weekday].hasOwnProperty(lesson["lessonNumber"]) ){
                    announcements[weekday][lesson["lessonNumber"]] = [];
                }
                announcements[weekday][lesson["lessonNumber"]].push(announcement);
            }
        });
    });

    Object.keys(lessons).forEach(day => {
        Object.keys(lessons[day]).forEach(lesson => {
            if(!data.hasOwnProperty(day)){
                data[day] = {};
            }
            if(!data[day].hasOwnProperty(lesson)){
                data[day][lesson] = {}
            }
            data[day][lesson]["lesson"] = lessons[day][lesson];
            if(replacementLessons.hasOwnProperty(lessons[day][lesson]["id"])){
                data[day][lesson]["replacementLesson"] = replacementLessons[lessons[day][lesson]["id"]];
            }
        })
    });
    Object.keys(announcements).forEach(day => {
        Object.keys(announcements[day]).forEach(lesson => {
            if(!data.hasOwnProperty(day)){
                data[day] = {};
            }
            if(!data[day].hasOwnProperty(lesson)){
                data[day][lesson] = {}
            }
            data[day][lesson]["announcement"] = announcements[day][lesson];
        })
    });
    timeTable.data.preparedData = data;
    return data;
}

 */