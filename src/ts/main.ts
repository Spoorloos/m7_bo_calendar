function getDatesOfMonth(month: number) {
    const dates = [];
    const currentDate = new Date();
    currentDate.setMonth(month, 1);

    while (currentDate.getMonth() === month) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

function compareDates(date1: Date, date2: Date) {
    return date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate();
}

function mod(num: number, modulo: number) {
    return ((num % modulo) + modulo) % modulo;
}

function getMonthName(month: number) {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long"
    });
}

class Calendar {
    private calendarDays: HTMLDivElement;
    private calendarMonth: HTMLParagraphElement;

    private currentMonth: number;
    private dayElements = new Map<Date, HTMLLIElement>();
    private selectedDayElement?: HTMLLIElement;

    public selectedDate: Date;
    public onSelect?: ((value: Date) => void);

    constructor(element: HTMLDivElement, selectedDate: Date = new Date()) {
        this.calendarDays = element.querySelector(".calendar__days__numbers")!;
        this.calendarMonth = element.querySelector(".calendar__header__month")!;

        this.selectedDate = new Date(selectedDate);
        this.selectedDate.setHours(0, 0, 0, 0);
        this.currentMonth = selectedDate.getMonth();

        const backButton = element.querySelector(".calendar__header__back")!;
        const nextButton = element.querySelector(".calendar__header__next")!;

        backButton.addEventListener("click", () => {
            this.currentMonth--;
            this.update();
        });

        nextButton.addEventListener("click", () => {
            this.currentMonth++;
            this.update();
        });

        this.update();
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

    private update() {
        for (const element of this.dayElements.values()) {
            element.remove();
        }

        this.dayElements.clear();
        this.calendarMonth.innerText = getMonthName(this.currentMonth);

        const fragment = document.createDocumentFragment();

        for (const date of getDatesOfMonth(this.currentMonth)) {
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
    const calendar = new Calendar(calendarElement, new Date("02-13-2025"));

    calendar.onSelect = (date) => {
        console.log(`New date: ${date}`)
    }
}
