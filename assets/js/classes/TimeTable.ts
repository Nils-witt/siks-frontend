class TimeTable implements Pagination {
    offset: number;
    weekStart: Date;
    userType: string;
    databaseConnector: DatabaseConnector;
    timeTable: TimeTable;
    private data: TimeTableData;
    private readonly weekdays: { "1": string; "2": string; "3": string; "4": string; "5": string; "6": string; "7": string };
    private readonly timeLessons: number[][] = [[28200, 30900], [30900, 33600], [34800, 37500], [37800, 40500], [41700, 44400], [44400, 47100]];

    constructor(databaseConnector: DatabaseConnector) {
        this.databaseConnector = databaseConnector
        this.data = new TimeTableData();
        this.offset = 0;
        this.weekdays = {
            1: 'Montag',
            2: 'Dienstag',
            3: 'Mittwoch',
            4: 'Donnerstag',
            5: 'Freitag',
            6: 'Samstag',
            7: 'Sonntag'
        };
        this.userType = "student";
        this.timeTable = this;
    }

    static updatePagination(timeTable: TimeTable, newOffset: number) {
        timeTable.updatePagination(newOffset);
    }

    initPagination() {
        document.getElementById('previousWeek').onclick = () => {
            TimeTable.updatePagination(this.timeTable, -1);
        };
        document.getElementById('nextWeek').onclick = () => {
            TimeTable.updatePagination(this.timeTable, 1);
        };
    }

    async updateTable() {
        await this.fetchData();
        this.prepareData();
        this.generateTable();
    }

    generateTable() {
        if (Object.keys(this.data.preparedData).length > 0) {
            let daysContainer = document.createElement('div');
            daysContainer.id = 'daysContainer';
            daysContainer.className = 'row';

            for (let day in this.data.preparedData) {
                let htmlDay = this.generateDay(this.data.preparedData[day], day);
                daysContainer.append(htmlDay)
            }

            let container = document.getElementById('container');
            container.innerHTML = "";
            container.append(daysContainer);

            return daysContainer;
        }
    }

    generateDay(dayObject, dayInt) {
        let day = document.createElement('div');
        day.className = 'col';

        let headline = document.createElement('h5');
        headline.innerText = this.weekdays[dayInt];
        day.append(headline);

        let preKey = 1;
        for (let key in dayObject) {
            if (dayObject.hasOwnProperty(key)) {
                if (parseInt(key) !== preKey) {
                    let diff = parseInt(key) - preKey;
                    for (let i = 0; i < diff; i++) {

                        let main = <HTMLDivElement>document.createElement('div');
                        main.className = 'row';
                        main.style.paddingLeft = '24px';

                        let indicator = document.createElement('div');
                        indicator.className = 'col';
                        indicator.style.maxWidth = '5px';
                        indicator.style.backgroundColor = 'grey;';
                        indicator.style.padding = ' 0;';
                        indicator.style.maxHeight = '100%;';


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
                let htmlLesson = this.generateColumn(lesson);
                day.append(htmlLesson);
                preKey = parseInt(key) + 1;
            }
        }

        return day;
    }

    generateColumn(lesson) {
        if (lesson != null) {
            let main = document.createElement('div');
            let indicator;
            let container = document.createElement('div');
            let text = document.createElement('p');
            let notificationBell = document.createElement('div');

            let indicatorColor = "green";
            let notification = false;

            if (lesson.hasOwnProperty("announcement")) notification = true;

            if (lesson.hasOwnProperty("exam")) {
                text.innerText = lesson["exam"]["subject"];
                indicatorColor = "blue";
            } else if (lesson.hasOwnProperty("replacementLesson")) {
                text.innerText = lesson["replacementLesson"]["subject"];
                if (lesson["replacementLesson"]["room"] === "---") {
                    indicatorColor = "red";
                    text.innerText = "Freistunde";
                } else {
                    indicatorColor = "orange";
                    text.innerText = lesson["replacementLesson"]["subject"];
                }
            } else if (lesson.hasOwnProperty("lesson")) {
                text.innerText = lesson;
                if (this.userType === "teacher") {
                    text.innerText = lesson["lesson"]["course"]["grade"] + " / " + lesson["lesson"]["course"]["subject"] + "-" + lesson["lesson"]["course"]["group"];
                } else {
                    text.innerText = lesson["lesson"]["course"]["subject"];
                }
            }


            indicator = this.generateIndicator(0, indicatorColor);

            if (notification) {
                notificationBell.innerHTML = '<i class="material-icons">notification_important</i>';
            }

            notificationBell.style.width = "24px";
            main.append(notificationBell);
            indicator.className = 'col';
            main.append(indicator);
            container.className = 'col';
            container.onclick = () => {
                openDetailView(lesson)
            };
            container.style.cursor = "pointer";
            container.append(text);
            main.append(container);
            main.className = 'row';
            return main;
        }
    }

    generateIndicator(personPreset, lessonStatus) {
        let indicatorContainer = document.createElement('div');
        indicatorContainer.className = 'col';
        indicatorContainer.style.maxWidth = '5px';
        indicatorContainer.style.padding = '0';
        indicatorContainer.style.maxHeight = '100%;';

        let indicatorLesson = document.createElement('div');
        indicatorLesson.className = "indicator indicator-" + lessonStatus;
        indicatorContainer.append(indicatorLesson);
        return indicatorContainer
    }

    prepareData() {
        let lessons = {};
        let exams = {};
        let replacementLessons = {};
        let announcements = {};

        let data = {};
        let timeLessons = this.timeLessons;

        this.data.lessons.forEach(lesson => {
            let hour = lesson["lessonNumber"];
            let day = lesson.day;

            if (!lessons.hasOwnProperty(day)) {
                lessons[day] = {};
            }
            lessons[day][hour] = lesson;

        });

        this.data.exams.forEach(exam => {
            let date = new Date(exam["date"]);
            let day = date.getDay();
            let firstLesson = null;
            let lastLesson = null;
            let start = Utilities.convertTimeToSeconds(exam["from"]);
            let end = Utilities.convertTimeToSeconds(exam["to"]);

            for (let i = 0; i < timeLessons.length; i++) {
                let lesson = timeLessons[i];
                if (lesson[0] <= start && lesson[1] >= start) {
                    firstLesson = i + 1;
                }
                if (lesson[0] <= end && lesson[1] >= end) {
                    lastLesson = i + 1;
                }
            }


            if (lastLesson != null && firstLesson != null) {
                for (let i = firstLesson; i <= lastLesson; i++) {
                    if (!exams.hasOwnProperty(day)) {
                        exams[day] = {};
                    }
                    exams[day][i] = exam;
                }
            }
        });

        this.data.replacementLessons.forEach(replacementLesson => {
            let lessonId = replacementLesson["lessonId"];
            replacementLessons[lessonId] = replacementLesson;

        });

        this.data.announcements.forEach(announcement => {
            let weekday = announcement.date;

            if (!announcements.hasOwnProperty(weekday)) {
                announcements[weekday] = {};
            }
            Object.keys(lessons[weekday]).forEach(lessonNumber => {
                let lesson = lessons[weekday][lessonNumber];
                if (announcement["courseId"] === lesson["course"]["id"]) {
                    if (!announcements[weekday].hasOwnProperty(lesson["lessonNumber"])) {
                        announcements[weekday][lesson["lessonNumber"]] = [];
                    }
                    announcements[weekday][lesson["lessonNumber"]].push(announcement);
                }
            });
        });

        Object.keys(lessons).forEach(day => {
            Object.keys(lessons[day]).forEach(lesson => {
                if (!data.hasOwnProperty(day)) {
                    data[day] = {};
                }
                if (!data[day].hasOwnProperty(lesson)) {
                    data[day][lesson] = {}
                }
                data[day][lesson]["lesson"] = lessons[day][lesson];
                if (replacementLessons.hasOwnProperty(lessons[day][lesson]["id"])) {
                    data[day][lesson]["replacementLesson"] = replacementLessons[lessons[day][lesson]["id"]];
                }
            })
        });
        Object.keys(announcements).forEach(day => {
            Object.keys(announcements[day]).forEach(lesson => {
                if (!data.hasOwnProperty(day)) {
                    data[day] = {};
                }
                if (!data[day].hasOwnProperty(lesson)) {
                    data[day][lesson] = {}
                }
                data[day][lesson]["announcement"] = announcements[day][lesson];
            })
        });
        console.log(replacementLessons);
        this.data.preparedData = data;
        return data;
    }

    async fetchData() {
        this.weekStart = new Date(Date.now());
        this.data.announcements = await this.databaseConnector.getAnnouncementsByWeek(this.weekStart);
        this.data.exams = await this.databaseConnector.getExamsByWeek(this.weekStart)
        this.data.lessons = await this.databaseConnector.getLessons()
        this.data.replacementLessons = await this.databaseConnector.getReplacementLessonsByWeek(this.weekStart);

    }

    updatePagination(newOffset) {
        this.timeTable.offset = this.timeTable.offset + newOffset;
        let date = new Date();
        date.setDate(date.getDate() - (date.getDay() - 1));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + (this.timeTable.offset * 7));
        this.timeTable.weekStart = new Date(date);

        document.getElementById("currentWeek").innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() - 7);
        document.getElementById("previousWeek").innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() + 14);
        document.getElementById("nextWeek").innerText = date.getDate().toString().padStart(2, '0') + "." + (date.getMonth() + 1).toString().padStart(2, "0");
        date.setDate(date.getDate() - 7);
    }
}

class TimeTableData {
    announcements: any;
    exams: any;
    lessons: any;
    replacementLessons: any;
    preparedData: {};

}

interface Pagination {
    offset: number;
    weekStart: Date;

    updatePagination(newOffset);
}