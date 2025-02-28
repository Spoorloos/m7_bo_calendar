const weekDayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const weekDayNames = Array.from({ length: 7 }, (_, i) => weekDayFormat.format(new Date(2021, 5, i)));

function getFirstDay(month: Date) {
    const date = new Date(month);
    date.setDate(1);
    return (date.getDay() + 6) % 7 + 1;
}

function getMonthDayCount(month: Date) {
    const date = new Date(month);
    date.setMonth(date.getMonth() + 1, 0);
    return date.getDate();
}

function compareMonths(date1: Date, date2: Date) {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth();
}

function compareDates(date1: Date, date2: Date) {
    return compareMonths(date1, date2) && date1.getDate() == date2.getDate();
}

function formatYearMonth(date: Date) {
    return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

function formatYearMonthDate(date: Date) {
    return `${formatYearMonth(date)}-${date.getDate().toString().padStart(2, "0")}`;
}

class Calendar {
    private calendarDays;
    private calendarMonth;

    private currentMonth;
    private dayElements = new Map<Date, HTMLLIElement>();
    private selectedDayElement?: HTMLLIElement;

    public selectedDate;
    public onSelect?: ((value: Date) => void);

    constructor(element: HTMLDivElement, selectedDate: Date = new Date()) {
        this.calendarDays = element.querySelector<HTMLDivElement>(".calendar__days")!;
        this.calendarMonth = element.querySelector<HTMLTimeElement>(".calendar__month")!;

        this.selectedDate = new Date(selectedDate);
        this.selectedDate.setHours(0, 0, 0, 0);
        this.currentMonth = new Date(this.selectedDate);
        this.currentMonth.setDate(1);

        const dayNames = element.querySelector<HTMLUListElement>(".calendar__day-names")!;
        const fragment = document.createDocumentFragment();

        for (const dayName of weekDayNames) {
            const nameElement = document.createElement("li");
            nameElement.innerText = dayName;
            nameElement.classList.add("calendar__day-name");
            fragment.appendChild(nameElement);
        }

        dayNames.appendChild(fragment);

        const backButton = element.querySelector<HTMLButtonElement>(".calendar__control--back")!;
        const nextButton = element.querySelector<HTMLButtonElement>(".calendar__control--next")!;

        backButton.addEventListener("click", () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
            this.updateDays();
        });

        nextButton.addEventListener("click", () => {
            this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
            this.updateDays();
        });

        this.updateDays();
    }

    public setSelected(value: Date) {
        if (compareDates(value, this.selectedDate)) {
            return;
        }

        this.selectedDate = new Date(value);
        this.selectedDate.setHours(0, 0, 0, 0);
        this.selectedDayElement?.classList.remove("calendar__day--selected");
        this.onSelect?.(this.selectedDate);

        for (const [date, dayElement] of this.dayElements.entries()) {
            if (compareDates(date, this.selectedDate)) {
                dayElement.classList.add("calendar__day--selected");
                this.selectedDayElement = dayElement;
            }
        }
    }

    private updateDays() {
        for (const element of this.dayElements.values()) {
            element.remove();
        }
        this.dayElements.clear();

        this.calendarMonth.innerText = monthFormat.format(this.currentMonth);
        this.calendarMonth.dateTime = formatYearMonth(this.currentMonth);
        this.calendarMonth.classList.toggle("calendar__month--current", compareMonths(this.currentMonth, new Date()));

        const firstDay = getFirstDay(this.currentMonth);
        const currentMonthDays = getMonthDayCount(this.currentMonth);
        const totalDayCount = Math.ceil((currentMonthDays + firstDay) / 7) * 7;

        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= totalDayCount; i++) {
            const date = new Date(this.currentMonth);
            date.setDate(i - firstDay + 1);

            const dayElement = document.createElement("li");
            dayElement.classList.add("calendar__day");
            dayElement.addEventListener("click", () => this.setSelected(date));

            if (compareDates(date, new Date())) {
                dayElement.classList.add("calendar__day--today");
            }

            if (compareDates(date, this.selectedDate)) {
                this.selectedDayElement = dayElement;
                dayElement.classList.add("calendar__day--selected");
            }

            if (!compareMonths(date, this.currentMonth)) {
                dayElement.classList.add("calendar__day--other-month");
            }

            const timeElement = document.createElement("time");
            timeElement.innerText = date.getDate().toString();
            timeElement.dateTime = formatYearMonthDate(date);
            dayElement.appendChild(timeElement);

            this.dayElements.set(date, dayElement);
            fragment.appendChild(dayElement);
        }

        this.calendarDays.appendChild(fragment);
    }
}

for (const calendarElement of document.querySelectorAll<HTMLDivElement>(".calendar")) {
    const calendar = new Calendar(calendarElement);

    calendar.onSelect = (date) => {
        console.log(`New date: ${date.toISOString()}`)
    }
}