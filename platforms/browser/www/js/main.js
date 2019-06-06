let enviroment = "dev"
const version = "Alpha 0.2.1"



if (enviroment == "dev") {
    var serverUrl = "http://localhost:5000/"
} else {
    var serverUrl = "https://ntiapp.herokuapp.com/"
}

function getCookieValue(a) {
    var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function __init__() {
    // Creates the nav Menu and populates it with the stored data
    let rootcontent = document.querySelector('nav')
    let close = document.createElement('i')
    close.classList.add('material-icons')
    close.innerHTML = 'close'
    close.onclick = sideMenu
    let name_Value = getCookieValue("schoolname")
    if (name_Value == "" || name_Value == "-") {
        name_Value = "Not configured"
    }
    let name = document.createElement('span')
    name.innerHTML = name_Value
    let list = document.createElement('ul')
    let scheduleA = document.createElement('a')
    scheduleA.href = '/'
    let schedule = document.createElement('li')
    schedule.innerHTML = 'Schedule'
    scheduleA.append(schedule)
    let trafficA = document.createElement('a')
    trafficA.href = 'transit.html'
    let traffic = document.createElement('li')
    traffic.innerHTML = 'Transit'
    trafficA.append(traffic)
    let settingsA = document.createElement('a')
    settingsA.href = 'settings.html'
    let settings = document.createElement('li')
    settings.innerHTML = 'Settings'
    settingsA.append(settings)

    list.append(scheduleA)
    list.append(trafficA)
    list.append(settingsA)
    // Version display
    let versionDisplay = document.createElement('p')
    versionDisplay.classList.add('version')
    versionDisplay.innerHTML = version
    rootcontent.append(versionDisplay)
    // Easter eggs
    if (getCookieValue("schoolname") == "NTI Gymnasiet Johanneberg" && getCookieValue("studentname") == "2C Markus Längnäs") {
        let egg = document.createElement('h6')
        egg.innerHTML = "Markus är varm"
        list.append(egg)
    }

    rootcontent.append(name)
    rootcontent.append(close)
    rootcontent.append(list)

}

function sideMenu() {
    let nav = document.querySelector('nav')
    nav.classList.toggle('nav_active')

}

__init__()




async function getTrafficId() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if (document.querySelectorAll('.loading').length > 1) {
                for (const iterator of document.querySelectorAll('.loading')) {
                    iterator.outerHTML = ''
                }
            } else if (document.querySelectorAll('.loading') != null) {
                document.querySelector('.loading').outerHTML = ''
            }

            let data = JSON.parse(xmlHttp.responseText)
            data['data'].replace(' ', '')
            let stops = data['data'].split(",")
            stops.forEach(element => {
                element.replace(/\s /g, '')
                getTrafficInformation(element)
            });
        } else {
            if (document.querySelector('.loading') == null && xmlHttp.status != 200 || xmlHttp.status != "200 OK" && xmlHttp.readyState != 4) {
                let container = document.createElement('div');
                container.classList.add('loading')
                document.querySelector('.transit').append(container)
            }
        }
    }
    xmlHttp.open('GET', serverUrl + "api/v1/traffic/" + getCookieValue("schoolSlug"), true);
    xmlHttp.send();
}


function sortDepartures(data) {
    let array = [
        [data[0]]
    ]
    let i2 = 0
    while (data.length > 0) {

        let i = 0
        while (i < data.length) {
            if (data[i]['transportNumber'] + data[i]['direction'] == array[i2][0]['transportNumber'] + array[i2][0]['direction']) {
                array[i2].push(data[i])
                data.splice(i, 1)
                i--
            }
            i++
        }
        if (data.length != 0) {
            array.push([data[0]])
        }
        i2++
    }
    array.sort((a, b) => (a[0].transportNumber > b[0].transportNumber) ? 1 : ((b[0].transportNumber > a[0].transportNumber) ? -1 : 0));

    return array
}

function getTrafficInformation(id) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if (document.querySelectorAll('.loading').length > 1) {
                for (const iterator of document.querySelectorAll('.loading')) {
                    iterator.outerHTML = ''
                }
            } else if (document.querySelectorAll('.loading').length == 1) {
                document.querySelectorAll('.loading')[0].outerHTML = ''
            }

            let data = JSON.parse(xmlHttp.responseText)
            data = data['data']['Departure']
            let departures = sortDepartures(data)

            // UPDATES TRAFFIC INFORMATION
            if (document.getElementById(id) != null) {
                let container = document.getElementById(id)
                container.innerHTML = `<div> ${departures[0][0]['stop'].split('(')[0]}</div>`

                for (const iterator of departures) {
                    let innerContainer = document.createElement('div')
                    innerContainer.classList.add('inner')

                    let i = 0
                    let items = 2
                    var lastDiff = null
                    for (const value of iterator) {
                        if (i == 0) {
                            let contentLine = document.createElement('h4')
                            contentLine.innerHTML = value['transportNumber']
                            let contentDest = document.createElement('h4')
                            let temp = value['direction'].split('(')
                            contentDest.innerHTML = temp[0]
                            innerContainer.append(contentLine)
                            innerContainer.append(contentDest)
                        }
                        // Time diff calc
                        // Removes duplicates
                        if (value['rtDate'] != null) {
                            var time2 = new Date(value['rtDate'] + " " + value['rtTime'])
                        } else {
                            var time2 = new Date(value['date'] + " " + value['time'])
                        }
                        let currentTime = new Date().toString();

                        let time1 = new Date(currentTime);
                        let diff = time2.getTime() - time1.getTime();
                        diff = diff / 60000

                        if (diff == lastDiff || items >= 4) {
                            i++
                        } else {
                            lastDiff = diff
                            let content = document.createElement('h4')
                            if (Math.floor(diff) <= 0) {
                                content.innerHTML = 'Now'
                            } else {
                                content.innerHTML = Math.floor(diff)
                            }
                            innerContainer.append(content)
                            i++
                            items++
                        }
                    }
                    container.append(innerContainer)
                }


            } else {
                // DISPLAYS TRAFFIC DATA
                let container = document.createElement('section');
                container.id = id
                container.innerHTML = `<div> ${departures[0][0]['stop'].split('(')[0]}</div>`

                for (const iterator of departures) {
                    let innerContainer = document.createElement('div')
                    innerContainer.classList.add('inner')

                    let i = 0
                    let items = 2
                    var lastDiff = null
                    for (const value of iterator) {
                        if (i == 0) {
                            let contentLine = document.createElement('h4')
                            contentLine.innerHTML = value['transportNumber']
                            let contentDest = document.createElement('h4')
                            let temp = value['direction'].split('(')
                            contentDest.innerHTML = temp[0]
                            innerContainer.append(contentLine)
                            innerContainer.append(contentDest)
                        }
                        // Time diff calc
                        // Removes duplicates
                        if (value['rtDate'] != null) {
                            var time2 = new Date(value['rtDate'] + " " + value['rtTime'])
                        } else {
                            var time2 = new Date(value['date'] + " " + value['time'])
                        }
                        let currentTime = new Date().toString();

                        let time1 = new Date(currentTime);
                        let diff = time2.getTime() - time1.getTime();
                        diff = diff / 60000

                        if (diff == lastDiff || items >= 4) {
                            i++
                        } else {
                            lastDiff = diff
                            let content = document.createElement('h4')
                            if (Math.floor(diff) <= 0) {
                                content.innerHTML = 'Now'
                            } else {
                                content.innerHTML = Math.floor(diff)
                            }
                            innerContainer.append(content)
                            i++
                            items++
                        }
                    }
                    container.append(innerContainer)
                }
                document.querySelector('.transit').append(container)
            }
        } else {
            if (document.querySelector('.loading') == null && xmlHttp.status != 200 || xmlHttp.status == "200 OK") {
                let container = document.createElement('div');
                container.classList.add('loading');
                document.querySelector('.transit').append(container);
            }
        }
    }
    xmlHttp.open('GET', serverUrl + "api/v1/traffic/" + getCookieValue("schoolSlug") + "/" + id, true);
    xmlHttp.send();
}

function updateTraffic(id) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

        }
        xmlHttp.open('GET', serverUrl + "api/v1/traffic/" + getCookieValue("schoolSlug") + "/" + id, true);
        xmlHttp.send();
    }
}


function options() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        let data = JSON.parse(xmlHttp.responseText);
        data['data'] = JSON.parse(data['data']);
        let value = data['data']['data'].split("}");
        let i = 0;
        value.pop();
        while (i < value.length) {
            value[i] += "}";
            i++;
        }
        sessionStorage.setItem('data', JSON.stringify(value));

        i = 0;
        let rootvalue = document.getElementById('school_box');
        for (const iterator of value) {
            let tempValue = JSON.parse(iterator);
            if (document.getElementById(tempValue['schoolslug']) == null) {
                i++;
                let temp = document.createElement('option')
                temp.value = tempValue['schoolslug']
                temp.innerHTML = tempValue['name']
                temp.id = tempValue['schoolslug']
                rootvalue.append(temp)
            }
        }
        rootvalue.value = getCookieValue("schoolSlug")
    }
    xmlHttp.open('GET', serverUrl + "api/v1/school/", true);
    xmlHttp.send();
}

function optionsStudent() {
    if (getCookieValue("student") == "1") {
        document.getElementById("student_class").innerHTML = "Student"
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            let data = JSON.parse(xmlHttp.responseText);
            let rootvalue = document.getElementById('student_box');
            for (const iterator of data['data']) {
                if (document.getElementById(iterator['id']) == null) {
                    let temp = document.createElement('option')
                    temp.value = iterator['id']
                    temp.innerHTML = iterator['name']
                    temp.id = iterator['id']
                    rootvalue.append(temp)
                }
            }
            rootvalue.value = getCookieValue("studentId")
        }
        xmlHttp.open('GET', serverUrl + "api/v1/" + getCookieValue("schoolSlug") + "/students/", true);
        xmlHttp.send();
    } else {
        document.getElementById("student_class").innerHTML = "Class"
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            let data = JSON.parse(xmlHttp.responseText);
            let rootvalue = document.getElementById('student_box');
            for (const iterator of data['data']) {
                if (document.getElementById(iterator['id']) == null) {
                    let temp = document.createElement('option')
                    temp.value = iterator['id']
                    temp.innerHTML = iterator['name']
                    temp.id = iterator['id']
                    rootvalue.append(temp)
                }
            }
            rootvalue.value = getCookieValue("studentId")
        }
        xmlHttp.open('GET', serverUrl + "api/v1/" + getCookieValue("schoolSlug") + "/classes/", true);
        xmlHttp.send();
    }
}

function changeSchool(e) {
    let value = e[e.selectedIndex]
    setCookie("schoolSlug", value.id, 365)
    setCookie("schoolname", value.innerHTML, 365)
    let rootvalue = document.getElementById('student_box');
    rootvalue.innerHTML = '<option value="0">-</option>';
    rootvalue = document.querySelector('nav');
    rootvalue.innerHTML = ''
    let data = sessionStorage.getItem('data');
    if (data != null) {
        for (var iterator of JSON.parse(data)) {
            iterator = JSON.parse(iterator)
            if (iterator['schoolslug'] == value.id) {
                setCookie("student", iterator["student"], 365)
                console.log("set student")
            }
        }
    }
    setCookie("studentId", "-", 365)
    __init__()
    optionsStudent()
}

function changeStudent(e) {
    let value = e[e.selectedIndex]
    setCookie("studentId", value.id, 365)
    setCookie("studentname", value.innerHTML, 365)
}

function schedule() {
    let name_Value = getCookieValue("schoolname");
    if (name_Value == "" || name_Value == "-" || getCookieValue("studentId") == "" || getCookieValue("studentId") == null || getCookieValue("studentId") == "-") {
        document.querySelector(".contain").innerHTML = `<h2 class="not_configured">Not configured</h2> <h4 class="not_configured">Please use the settings menu to configure the application</h4>`;
    } else {
        if (getCookieValue("student") == "1") {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    let data = JSON.parse(xmlHttp.responseText)
                    if (data.length != 0) {
                        var mon = document.createElement('div')
                        let z = document.createElement('div')
                        z.innerHTML = '<h2>Mon</h2>'
                        z.classList.add('flex-center')
                        mon.append(z)
                        var tue = document.createElement('div')
                        z = document.createElement('div')
                        z.innerHTML = '<h2>Tue</h2>'
                        z.classList.add('flex-center')
                        tue.append(z)
                        var wed = document.createElement('div')
                        z = document.createElement('div')
                        z.innerHTML = '<h2>Wed</h2>'
                        z.classList.add('flex-center')
                        wed.append(z)
                        var thu = document.createElement('div')
                        z = document.createElement('div')
                        z.innerHTML = '<h2>Thu</h2>'
                        z.classList.add('flex-center')
                        thu.append(z)
                        var fri = document.createElement('div')
                        z = document.createElement('div')
                        z.innerHTML = '<h2>Fri</h2>'
                        z.classList.add('flex-center')
                        fri.append(z)
                        for (const iterator of data['data']) {
                            let rootValue = document.createElement('div');
                            rootValue.classList.add('lesson_group');
                            let times = document.createElement('div');
                            times.classList.add('times');
                            let startTime = new Date(iterator['startTime']);
                            let endTime = new Date(iterator['endTime']);
                            var currentTime = new Date();
                            times.innerHTML = `<span>${startTime.toLocaleTimeString('SE', { hour12: false }).substr(0,5)}</span> <span>${endTime.toLocaleTimeString('SE', { hour12: false }).substr(0,5)} </span>`;
                            let progressBar = document.createElement('div');
                            progressBar.classList.add('progressbar');
                            let progressBarInner = document.createElement('div');
                            progressBarInner.classList.add('progressbar_inner');
                            if (((currentTime - startTime) / (endTime - startTime)) * 100 <= 0) {
                                progressBarInner.style.height = "0%";
                            } else if (((currentTime - startTime) / (endTime - startTime)) * 100 >= 100) {
                                progressBarInner.style.height = "100%";
                            } else {
                                progressBarInner.style.height = (((currentTime - startTime) / (endTime - startTime)) * 100) + "%";
                            }
                            progressBar.append(progressBarInner);
                            let lesson = document.createElement('div');
                            lesson.classList.add('lessons');
                            if (iterator.hasOwnProperty('rooms')) {
                                lesson.innerHTML = `<span>${iterator['title']} </span> <span>${iterator['rooms'][0]['name']}</span>`;
                            } else {
                                lesson.innerHTML = `<span>${iterator['title']} </span> <span></span>`;
                            }
                            rootValue.append(times);
                            rootValue.append(progressBar);
                            rootValue.append(lesson);
                            let day = startTime.getDay();
                            if (day == 1) {
                                mon.append(rootValue);
                            } else if (day == 2) {
                                tue.append(rootValue);
                            } else if (day == 3) {
                                wed.append(rootValue);
                            } else if (day == 4) {
                                thu.append(rootValue);
                            } else if (day == 5) {
                                fri.append(rootValue);
                            }
                        }
                        if (mon != undefined) {
                            mon.style.gridArea = "mon"
                            mon.classList.add('container_content')
                            document.getElementById('container').append(mon)
                        }
                        if (tue != undefined) {
                            tue.style.gridArea = "tue"
                            tue.classList.add('container_content')
                            document.getElementById('container').append(tue)
                        }
                        if (wed != undefined) {
                            wed.style.gridArea = "wed"
                            wed.classList.add('container_content')
                            document.getElementById('container').append(wed)
                        }
                        if (thu != undefined) {
                            thu.style.gridArea = "thu"
                            thu.classList.add('container_content')
                            document.getElementById('container').append(thu)
                        }
                        if (fri != undefined) {
                            fri.style.gridArea = "fri"
                            fri.classList.add('container_content')
                            document.getElementById('container').append(fri)
                        }
                        let temp = document.querySelectorAll('.container_content')
                        temp[currentTime.getDay() - 1].scrollIntoView()
                    }
                }
            }
            xmlHttp.open('GET', serverUrl + "api/v1/nova/" + getCookieValue("schoolSlug") + "/" + getCookieValue("studentId") + "/1", true);
            xmlHttp.send();
        } else {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    let data = JSON.parse(xmlHttp.responseText)
                    var mon = document.createElement('div')
                    let z = document.createElement('div')
                    z.innerHTML = '<h2>Mon</h2>'
                    z.classList.add('flex-center')
                    mon.append(z)
                    var tue = document.createElement('div')
                    z = document.createElement('div')
                    z.innerHTML = '<h2>Tue</h2>'
                    z.classList.add('flex-center')
                    tue.append(z)
                    var wed = document.createElement('div')
                    z = document.createElement('div')
                    z.innerHTML = '<h2>Wed</h2>'
                    z.classList.add('flex-center')
                    wed.append(z)
                    var thu = document.createElement('div')
                    z = document.createElement('div')
                    z.innerHTML = '<h2>Thu</h2>'
                    z.classList.add('flex-center')
                    thu.append(z)
                    var fri = document.createElement('div')
                    z = document.createElement('div')
                    z.innerHTML = '<h2>Fri</h2>'
                    z.classList.add('flex-center')
                    fri.append(z)
                    for (const iterator of data['data']) {
                        let rootValue = document.createElement('div');
                        rootValue.classList.add('lesson_group');
                        let times = document.createElement('div');
                        times.classList.add('times');
                        let startTime = new Date(iterator['startTime']);
                        let endTime = new Date(iterator['endTime']);
                        var currentTime = new Date();
                        times.innerHTML = `<span>${startTime.toLocaleTimeString('SE', { hour12: false }).substr(0,5)}</span> <span>${endTime.toLocaleTimeString('SE', { hour12: false }).substr(0,5)} </span>`;
                        let progressBar = document.createElement('div');
                        progressBar.classList.add('progressbar');
                        let progressBarInner = document.createElement('div');
                        progressBarInner.classList.add('progressbar_inner');
                        if (((currentTime - startTime) / (endTime - startTime)) * 100 <= 0) {
                            progressBarInner.style.height = "0%";
                        } else if (((currentTime - startTime) / (endTime - startTime)) * 100 >= 100) {
                            progressBarInner.style.height = "100%";
                        } else {
                            progressBarInner.style.height = (((currentTime - startTime) / (endTime - startTime)) * 100) + "%";
                        }
                        progressBar.append(progressBarInner);
                        let lesson = document.createElement('div');
                        lesson.classList.add('lessons');
                        if (iterator.hasOwnProperty('rooms')) {
                            lesson.innerHTML = `<span>${iterator['title']} </span> <span>${iterator['rooms'][0]['name']}</span>`;
                        } else {
                            lesson.innerHTML = `<span>${iterator['title']} </span> <span></span>`;
                        }
                        rootValue.append(times);
                        rootValue.append(progressBar);
                        rootValue.append(lesson);
                        let day = startTime.getDay();
                        if (day == 1) {
                            mon.append(rootValue);
                        } else if (day == 2) {
                            tue.append(rootValue);
                        } else if (day == 3) {
                            wed.append(rootValue);
                        } else if (day == 4) {
                            thu.append(rootValue);
                        } else if (day == 5) {
                            fri.append(rootValue);
                        }
                    }
                    if (mon != undefined) {
                        mon.style.gridArea = "mon"
                        mon.classList.add('container_content')
                        document.getElementById('container').append(mon)
                    }
                    if (tue != undefined) {
                        tue.style.gridArea = "tue"
                        tue.classList.add('container_content')
                        document.getElementById('container').append(tue)
                    }
                    if (wed != undefined) {
                        wed.style.gridArea = "wed"
                        wed.classList.add('container_content')
                        document.getElementById('container').append(wed)
                    }
                    if (thu != undefined) {
                        thu.style.gridArea = "thu"
                        thu.classList.add('container_content')
                        document.getElementById('container').append(thu)
                    }
                    if (fri != undefined) {
                        fri.style.gridArea = "fri"
                        fri.classList.add('container_content')
                        document.getElementById('container').append(fri)
                    }
                    let temp = document.querySelectorAll('.container_content')
                    temp[currentTime.getDay() - 1].scrollIntoView()
                }
            }
            xmlHttp.open('GET', serverUrl + "api/v1/nova/" + getCookieValue("schoolSlug") + "/" + getCookieValue("studentId") + "/0", true);
            xmlHttp.send();
        }
    }
}