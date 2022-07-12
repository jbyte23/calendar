// Trenutni datum
const date = new Date();
var currYear = date.getFullYear();
var currMonth = date.getMonth();
var currDay = date.getDate();

// HTML elementi
const calendarDaysEl = document.getElementById("calendarDays");
const monthEl = document.getElementById("selectMonth");
const yearEl = document.getElementById("selectYear");
const dateEl = document.getElementById("selectDate");
var prevBtn = document.getElementById("previous");
var nextBtn = document.getElementById("next");

const holidaysData = readHolidays("holidays.txt");

/**
 * Funkcija prebere datoteko, katere pot je podana kot parameter in jo razibje na posamezne vrstice datoteke
 */
function readHolidays(file) {

    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }

    return result.split("\r\n");
}


/**
 * Funkcija preveri, če se v trenutnem prikazu koledarja nahaja kateri izmed praznikov in ga ustrezno vpikaže (obkroži datum)
 */
function handleHolidays(holidaysData, paddingDays) {

    // Preveri, če se kateri izmed praznikov nahaja na trenutnem prikazu koledarja
    for (var i = 0; i < holidaysData.length; i++) {
        
        // info o prazniku
        var line =  holidaysData[i].split(",");
        var type = line[0];
        var dateString = line[1].split("-");
        
        // pridobi dan in mesec praznika
        var day = parseInt(dateString[0]);
        // -1 zaradi indeksiranja mesecev od 0 naprej
        var month = parseInt(dateString[1]) - 1;
        // če gre za dinamično ponavljajoč praznik, pridobi še leto
        if (type == "dynamic") {
            var year = parseInt(dateString[2]);
            // če se leto ne ujema s trenutno prikazanim, nam praznika ni potrebno prikazovati
            if (year != currYear) continue;
        }

        // če se mesec ujema s trenutnim mesecem, moramo prikazati praznik na koledarju
        if (month == currMonth) {
            const holidayEl = document.getElementById("calendarDays").getElementsByTagName("li")[day+paddingDays]
            holidayEl.classList.add("holiday");
        }
    }
}

/**
 * Funkcija preveri, če je datum vnešen v formatu dan-mesec-leto
 */
function validateDate(dateString) {

    var valid = /^([0-9]{2}-[0-9]{2}-[0-9]{4})$/.test(dateString);

    return valid;
}

/**
 * Funkcija za ponovno nalaganje koledarja ob uporabnikovi spremembi meseca ali leta
 */
function updateCalendarByMonthOrYear() {
    
    currMonth = parseInt(monthEl.options[monthEl.selectedIndex].value);
    currYear = parseInt(yearEl.value);

    loadCalendar(currMonth, currYear);
}


/**
 * Funkcija za ponovno nalaganje koledarja ob uporabnikovi izbiri datuma
 */
function updateCalendarByDate() {
    
    if (validateDate(dateEl.value)) {
        // uporabnik zapiše datum v formatu dan-mesec-leto
        const dateArr = dateEl.value.split("-");
        const day = parseInt(dateArr[0]);
        const month = parseInt(dateArr[1])-1;
        const year = parseInt(dateArr[2]);

        const selectedDate = new Date(year, month, day);
        currMonth = parseInt(selectedDate.getMonth());
        currYear = parseInt(selectedDate.getFullYear());
        
        loadCalendar(currMonth, currYear);
    }

    dateEl.value = "";
}

/* 
Funkcija za nalaganje koledarja, ki poskrbi za ustrezen prikaz koledarja
glede na podan mesec in leto.
*/
function loadCalendar(month, year) {

    // Počisti trenutni koledar
    calendarDaysEl.innerHTML = "";

    // Nastavi vsebino polja z mesecem in letom na trenutno izbrane vrednosti
    document.getElementById("selectMonth").getElementsByTagName("option")[month].selected = "selected";
    document.getElementById("selectYear").value = year;

    // Število dni v trenutnem mesecu in v prejšnje,
    const monthDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    // Sunday - Saturday : 0-6
    // Podatki o začetku trenutnega meseca in dnevih prejšnjega in naslednjega meseca, ki so še vidni na trenutni strani koledarja
    const startDayOfMonth = new Date(year, month, 1);
    const padDaysPrev = (startDayOfMonth.getDay() + 6) % 7;
    const padDaysNext = (7 - (padDaysPrev + monthDays) % 7) % 7;

    const totalDays = monthDays + padDaysPrev + padDaysNext;
    
    // Usvarjanje novih HTML elementov za posamezen dan na koledarju
    for (var i = 1; i <= totalDays; i++) {

        var dayEl = document.createElement("li");
        dayEl.classList.add("day");

        // dan trenutnega meseca
        var day = i - padDaysPrev;

        // dnevi prejšnjega meseca
        if (i <= padDaysPrev) {
            day = prevMonthDays - padDaysPrev + i;
            dayEl.classList.add("padDay");
        }

        // dnevi naslednjega meseca
        else if (i > padDaysPrev + monthDays) {
            day = i - monthDays - padDaysPrev;
            dayEl.classList.add("padDay");
        }

        // označi nedelje
        if (i % 7 === 0) {
            dayEl.classList.add("sunday")
        }
      
        dayEl.innerText = day;
        document.getElementById("calendarDays").insertAdjacentElement("beforeend", dayEl);
    }

    // ozanči praznike
    handleHolidays(holidaysData, padDaysPrev-1);
}


// naloži koledar
loadCalendar(currMonth, currYear);


// event listenerji za navigacijo med sosednjimi meseci
prevBtn.addEventListener("click", function () {
    currMonth = currMonth - 1;
    if (currMonth < 0) {
        currMonth = 11;
        currYear -= 1;
    }
    loadCalendar(currMonth, currYear);
})

nextBtn.addEventListener("click", function () {
    currMonth = currMonth + 1;
    if (currMonth > 11) {
        currMonth = 0;
        currYear += 1;
    }
    loadCalendar(currMonth, currYear);
})