import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import { calculateAvailability } from './availability';
import { parseDate } from '../helper';

dayjs.extend(weekday);

@customElement('apitool-calendar')
export class Calendar extends LitElement {
    @property({ type: Array })
    availableTimeslots: DeviceServiceTypes.Availability<'response'> = [];

    @property({ type: Array })
    availabilityRules?: DeviceServiceTypes.AvailabilityRule[];

    @state()
    date: Date = new Date();

    @query('#container')
    container!: HTMLDivElement;

    @query('#input-date')
    inputDate!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        const date = new Date(this.date.getTime());
        const day = this.parseDay(this.date);

        if (this.availabilityRules)
            this.availableTimeslots = calculateAvailability(
                this.availabilityRules,
                date.setHours(0, 0, 0, 0),
                date.setHours(23, 59, 59, 999)
            );

        return html`<div class="flex flex-row w-full rounded-lg bg-white">
            <div class="w-full flex flex-col">
                <div class="flex items-center">
                    <button
                        class="rounded-full w-12 h-12 bg-slate-600 text-white mr-auto"
                        @click=${this.previousDay}
                    >
                        <
                    </button>
                    <div class="flex flex-col justify-center items-center">
                        <p class="w-full text-center">${day}</p>
                        <input
                            id="input-date"
                            type="date"
                            class="bg-white border rounded-lg p-2"
                            value=${parseDate(Date.now(), false)}
                            @input=${this.updateDate}
                        />
                    </div>
                    <button
                        class="rounded-full w-12 h-12 bg-slate-600 text-white ml-auto"
                        @click=${this.nextDay}
                    >
                        >
                    </button>
                </div>
                <div
                    id="container"
                    class="max-h-96 overflow-auto rounded-lg bg-slate-200 mt-2 flex w-full"
                >
                    <div
                        class="grid grid-rows-[repeat(24,_60px)] grid-cols-1 rounded-lg pr-2"
                    >
                        ${Array.from(Array(24)).map((_v, i, _s) =>
                            this.renderTimeMarker(i)
                        )}
                    </div>
                    <div
                        class="grid grid-rows-[repeat(1440,_1px)] grid-cols-1 rounded-lg w-full"
                    >
                        ${this.getAvailableTimeslots().map(this.renderTimeslot)}
                    </div>
                </div>
            </div>
        </div>`;
    }

    private renderTimeMarker(time: number) {
        return html`<div
            class="row-start-[${time + 1}] row-end-[${time +
            1}] w-12 rounded-lg text-center"
        >
            <p>
                ${time < 12
                    ? time === 0
                        ? '12am'
                        : time + 'am'
                    : time === 12
                    ? '12pm'
                    : time - 12 + 'pm'}
            </p>
        </div>`;
    }

    private renderTimeslot(timeslot: DeviceServiceTypes.TimeSlot<'response'>) {
        const start =
            dayjs(timeslot.start).get('hours') * 60 +
            dayjs(timeslot.start).get('minutes') +
            1;
        const end =
            dayjs(timeslot.end).get('hours') * 60 +
            dayjs(timeslot.end).get('minutes') +
            1;

        return html`<div
            class="row-start-[${start}] row-end-[${end}] w-full rounded-lg text-center bg-green-300"
        ></div>`;
    }

    private updateDate() {
        this.date = new Date(this.inputDate.value);
    }

    private parseDay(date: Date) {
        switch (date.getDay()) {
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
        }
    }

    private nextDay() {
        this.date = new Date(this.date.setDate(this.date.getDate() + 1));
        this.inputDate.value = parseDate(this.date, false);
    }

    private previousDay() {
        this.date = new Date(this.date.setDate(this.date.getDate() - 1));
        this.inputDate.value = parseDate(this.date, false);
    }

    private splitTimeslots() {
        const splitTimeslots = [];

        for (const timeslot of this.availableTimeslots) {
            if (dayjs(timeslot.start).isSame(timeslot.end, 'date'))
                splitTimeslots.push(timeslot);
            else {
                let current = timeslot.start;
                while (!dayjs(current).isAfter(timeslot.end, 'date')) {
                    const next = dayjs(current)
                        .add(1, 'day')
                        .set('hour', 0)
                        .set('minute', 0)
                        .set('second', 0)
                        .set('millisecond', 0);
                    splitTimeslots.push({
                        start: current,
                        end: next
                            .subtract(1, 'millisecond')
                            .isBefore(timeslot.end)
                            ? next.subtract(1, 'millisecond').toISOString()
                            : timeslot.end,
                    });
                    current = next.toISOString();
                }
            }
        }

        return splitTimeslots;
    }

    private getAvailableTimeslots() {
        const splitTimeslots = this.splitTimeslots();

        return splitTimeslots.filter((timeslot) =>
            dayjs(timeslot.start).isSame(dayjs(this.date), 'date')
        );
    }
}
