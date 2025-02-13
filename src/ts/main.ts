const weekDayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const weekDayNames = Array.from({ length: 7 }, (_, i) => weekDayFormat.format(new Date(2021, 5, i)));

function getDatesOfMonth(month: Date) {
    const dates = [];
    const currentDate = new Date(month);

    while (currentDate.getMonth() === month.getMonth()) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

function compareMonths(date1: Date, date2: Date) {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth();
}

function compareDates(date1: Date, date2: Date) {
    return compareMonths(date1, date2) && date1.getDate() == date2.getDate();
}

function mod(num: number, modulo: number) {
    return ((num % modulo) + modulo) % modulo;
}

class Calendar {
    private calendarDays: HTMLDivElement;
    private calendarMonth: HTMLParagraphElement;

    private currentMonth: Date;
    private dayElements = new Map<Date, HTMLLIElement>();
    private selectedDayElement?: HTMLLIElement;

    public selectedDate: Date;
    public onSelect?: ((value: Date) => void);

    constructor(element: HTMLDivElement, selectedDate: Date = new Date()) {
        this.calendarDays = element.querySelector(".calendar__days-numbers")!;
        this.calendarMonth = element.querySelector(".calendar__header-month")!;

        this.selectedDate = new Date(selectedDate);
        this.selectedDate.setHours(0, 0, 0, 0);
        this.currentMonth = new Date(this.selectedDate);
        this.currentMonth.setDate(1);

        const dayNames = element.querySelector<HTMLUListElement>(".calendar__days-names")!;
        const fragment = document.createDocumentFragment();

        for (const dayName of weekDayNames) {
            const nameElement = document.createElement("li");
            nameElement.innerText = dayName;
            nameElement.classList.add("calendar-day-name");
            fragment.appendChild(nameElement);
        }

        dayNames.appendChild(fragment);

        const backButton = element.querySelector<HTMLButtonElement>(".calendar__header-back")!;
        const nextButton = element.querySelector<HTMLButtonElement>(".calendar__header-next")!;

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
        this.selectedDayElement?.classList.remove("calendar-day--selected");
        this.onSelect?.(this.selectedDate);

        for (const [date, dayElement] of this.dayElements.entries()) {
            if (compareDates(date, this.selectedDate)) {
                dayElement.classList.add("calendar-day--selected");
                this.selectedDayElement = dayElement;
            }
        }
    }

    private updateDays() {
        for (const element of this.dayElements.values()) {
            element.remove();
        }

        this.dayElements.clear();

        const isCurrentMonth = compareMonths(this.currentMonth, new Date());
        this.calendarMonth.classList.toggle("calendar__header-month--current", isCurrentMonth);
        this.calendarMonth.innerText = monthFormat.format(this.currentMonth);

        const dates = getDatesOfMonth(this.currentMonth);
        const fragment = document.createDocumentFragment();

        for (const date of dates) {
            const dayElement = document.createElement("li");
            dayElement.innerText = date.getDate().toString();
            dayElement.classList.add("calendar-day");
            dayElement.style.gridColumn = (mod(date.getDay() - 1, 7) + 1).toString();
            dayElement.addEventListener("click", () => this.setSelected(date));

            if (compareDates(date, new Date())) {
                dayElement.classList.add("calendar-day--today");
            }

            if (compareDates(date, this.selectedDate)) {
                this.selectedDayElement = dayElement;
                dayElement.classList.add("calendar-day--selected");
            }

            this.dayElements.set(date, dayElement);
            fragment.appendChild(dayElement);
        }

        this.calendarDays.appendChild(fragment);
    }
}

for (const calendarElement of document.querySelectorAll<HTMLDivElement>(".calendar")) {
    const calendar = new Calendar(calendarElement);

    calendar.onSelect = (date) => {
        console.log(`New date: ${date}`)
    }
}
