let parser = new DOMParser();
const weekdays = {1:'Montag', 2:'Dienstag', 3:'Mittwoch', 4:'Donnerstag', 5:'Freitag', 6:'Samstag', 7:'Sonntag'};
function xmlToTable(xmlString){
    let timeTable = {};
    let xml = parser.parseFromString(xmlString,"text/xml");

    let childrenMain = xml.children;
    for (let i = 0; i < childrenMain.length; i++) {
        if(childrenMain[i]["tagName"] == "sp"){
            let classes = childrenMain[i].children;
            for (let k = 0; k < classes.length; k++) {

                let nodes = classes[k].getElementsByTagName("titel");
                let className;
                if(nodes.length == 1){
                    className = nodes[0].textContent;
                    let lessons = parseClass(classes[k]);
                    timeTable[className] = lessons;
                }
            }
        }
    }
    console.log(timeTable);
    let timeTableKeys = Object.keys(timeTable);
    let container = document.getElementById("tableContainer");
    for (let i = 0; i < timeTableKeys.length; i++) {
        let data = timeTable[timeTableKeys[i]];
        console.log(data)
        let element = document.createElement("span");
        element.innerText = timeTableKeys[i];
        container.append(element)
        let daysContainer = document.createElement("div");
        daysContainer.className = "col";

        for (let day in data) {
            console.log(day);
            let htmlDay = generateDay(data[day], day);

            daysContainer.append(htmlDay)
        }
        container.append(daysContainer);
    }
}

function parseClass(classNode){
    let lessons = {};
    let nodes = classNode.getElementsByTagName("titel");
    let className;
    if(nodes.length == 1){
        className = nodes[0].textContent
    }else {
        return;
    }

    if(true){
        console.log(classNode);
        console.log(className);
        let bodyNodes = classNode.getElementsByTagName("zeile");

        for (let i = 0; i < bodyNodes.length; i++) {
            let lessonNumber = bodyNodes[i].getElementsByTagName("stunde")[0].textContent;
            let classChilds = bodyNodes[i].children;
            for (let j = 0; j < classChilds.length; j++) {
                if(classChilds[j].tagName != "stunde" && classChilds[j].tagName != "von"){
                    let subject;
                    let lesson = classChilds[j];
                    try {
                        let dayNumber = classChilds[j].tagName.substr(3,1);
                        subject = lesson.getElementsByTagName("fach")[0].textContent;
                        let teacher = lesson.getElementsByTagName("lehrer")[0].textContent;
                        let room = lesson.getElementsByTagName("raum")[0].textContent;
                        let grade = lesson.getElementsByTagName("klasse")[0].textContent;
                        let group;
                        try {
                            group = lesson.getElementsByTagName("gruppe")[0].textContent;
                        }catch (e) {
                            group = grade;
                        }
                        if(!lessons.hasOwnProperty(dayNumber)){
                            lessons[dayNumber] = {};
                        }
                        if(!lessons[dayNumber].hasOwnProperty(lessonNumber)){
                            lessons[dayNumber][lessonNumber] = [];
                        }
                        lessons[dayNumber][lessonNumber].push({"subject": subject, "teacher": teacher,"room":room, "group": group,"grade": grade,"lesson":lessonNumber,"day":dayNumber});
                    }catch (e) {

                        console.log(e);
                        console.log(subject);
                    }
                }
            }
        }
    }
    return lessons;
}

function generateDay(dayObject, dayInt){
    let day = document.createElement('div');
    day.className = 'col';

    let headline = document.createElement('h5');
    headline.innerText = weekdays[dayInt];
    day.append(headline);

    let preKey = 1;
    for (let key in dayObject) {
        if (dayObject.hasOwnProperty(key)) {
            if(parseInt(key) != preKey){
                let diff = parseInt(key) - preKey;
                for(let i = 0; i < diff; i++){

                    let main = document.createElement('div');
                    main.className = 'row';
                    main.style = 'padding-left: 24px';

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
            let htmlLesson = generateColumn(lesson);
            day.append(htmlLesson);
            preKey = parseInt(key) + 1;
        }
    }

    return day;
}

function generateColumn(lesson){
    if(lesson != null){
        let main = document.createElement('div');
        let container = document.createElement('div');
        let text = document.createElement('p');
        console.log(lesson)
        //text.innerText = lesson["lesson"]["subject"];
        container.className = 'col';
        container.append(text);
        main.append(container);
        main.className = 'row';
        return main;
    }
}