const serverUrl = "http://192.168.1.64:5000/"

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
            console.log(document.getElementById(id))
            if (document.getElementById(id) != null) {
                console.log("updated value")
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
                            if (Math.floor(diff) <= 0){
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
                            if (Math.floor(diff) <= 0){
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
}

function changeSchool(e) {
    let value = e[e.selectedIndex]
    setCookie("schoolSlug", value.id, 365)
    setCookie("schoolname", value.innerHTML, 365)
    let rootvalue = document.getElementById('student_box');
    rootvalue.innerHTML = '<option value="0">-</option>';
    rootvalue = document.querySelector('nav');
    rootvalue.innerHTML = ''
    __init__()
    optionsStudent()
}

function changeStudent(e) {
    let value = e[e.selectedIndex]
    setCookie("studentId", value.id, 365)
    setCookie("studentname", value.innerHTML, 365)
}

function schedule() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            let data = JSON.parse(xmlHttp.responseText)
            console.log(data)
        }
    }
    xmlHttp.open('GET', serverUrl + "api/v1/nova/" + getCookieValue("schoolSlug") + getCookieValue("studentId"), true);
    xmlHttp.send();
}