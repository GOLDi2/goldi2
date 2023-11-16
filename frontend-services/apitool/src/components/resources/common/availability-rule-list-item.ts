import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { parseDate } from '../helper';

@customElement('apitool-availability-rule-list-item')
export class AvailabilityRuleListItem extends LitElement {
    @property({ type: Object })
    availabilityRule!: DeviceServiceTypes.AvailabilityRule;

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @property({ type: Number })
    index!: number;

    @query('#input-start')
    inputStart!: HTMLInputElement;

    @query('#input-end')
    inputEnd!: HTMLInputElement;

    @query('#input-until')
    inputUntil!: HTMLInputElement;

    @query('#input-count')
    inputCount!: HTMLInputElement;

    @query('#checkbox-available')
    checkboxAvailable!: HTMLInputElement;

    @query('#checkbox-start')
    checkboxStart!: HTMLInputElement;

    @query('#checkbox-end')
    checkboxEnd!: HTMLInputElement;

    @query('#checkbox-frequency')
    checkboxFrequency!: HTMLInputElement;

    @query('#checkbox-until')
    checkboxUntil!: HTMLInputElement;

    @query('#checkbox-count')
    checkboxCount!: HTMLInputElement;

    @query('#select-frequency')
    selectFrequency!: HTMLSelectElement;

    @state()
    disableInput!: {
        start: boolean;
        end: boolean;
        frequency: boolean;
        until: boolean;
        count: boolean;
    };

    @state()
    savedValues!: Required<DeviceServiceTypes.AvailabilityRule> & {
        repeat: Required<DeviceServiceTypes.AvailabilityRule['repeat']>;
    };

    connectedCallback(): void {
        super.connectedCallback();

        this.disableInput = {
            start: !!this.availabilityRule.start,
            end: !!this.availabilityRule.end,
            frequency: !!this.availabilityRule.repeat?.frequency,
            until: !!this.availabilityRule.repeat?.until,
            count: !!this.availabilityRule.repeat?.count,
        };

        const defaultTime = new Date().toISOString();

        this.savedValues = {
            available: this.availabilityRule.available ?? false,
            start: this.availabilityRule.start ?? defaultTime,
            end: this.availabilityRule.end ?? defaultTime,
            repeat: {
                frequency: this.availabilityRule.repeat?.frequency ?? 'HOURLY',
                until: this.availabilityRule.repeat?.until ?? defaultTime,
                count: this.availabilityRule.repeat?.count ?? 0,
            },
        };
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="flex items-start">
            <apitool-collapsable-element
                .title=${'Availability Rule ' + this.index}
                .parent=${this.parent}
                .isOpen=${this.shouldOpen}
                class="flex p-2 bg-white border rounded-lg w-full"
            >
                <div class="flex flex-col gap-2">
                    <div class="flex">
                        <p class="w-28 flex-shrink-0">Available:</p>
                        <input
                            id="checkbox-available"
                            type="checkbox"
                            ?checked=${true}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-28 flex-shrink-0">Start:</p>
                            <input
                                id="checkbox-start"
                                type="checkbox"
                                ?checked=${true}
                                @input=${this.updateAvailabilityRule}
                            />
                        </div>
                        <input
                            id="input-start"
                            type="datetime-local"
                            class="w-full p-2 border rounded-lg disabled:bg-slate-100"
                            value=${parseDate(
                                this.availabilityRule.start ??
                                    this.savedValues.start
                            )}
                            ?disabled=${!this.disableInput.start}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-28 flex-shrink-0">End:</p>
                            <input
                                id="checkbox-end"
                                type="checkbox"
                                ?checked=${true}
                                @input=${this.updateAvailabilityRule}
                            />
                        </div>
                        <input
                            id="input-end"
                            type="datetime-local"
                            class="w-full p-2 border rounded-lg disabled:bg-slate-100"
                            value=${parseDate(
                                this.availabilityRule.end ??
                                    this.savedValues.end
                            )}
                            ?disabled=${!this.disableInput.end}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-28 flex-shrink-0">Frequency:</p>
                            <input
                                id="checkbox-frequency"
                                type="checkbox"
                                ?checked=${false}
                                @input=${this.updateAvailabilityRule}
                            />
                        </div>
                        <select
                            id="select-frequency"
                            class="w-full p-2 border rounded-lg bg-white disabled:bg-slate-100"
                            ?disabled=${!this.disableInput.frequency}
                            @input=${this.updateAvailabilityRule}
                        >
                            <option
                                value="HOURLY"
                                ?selected=${this.availabilityRule.repeat
                                    ?.frequency
                                    ? this.availabilityRule.repeat.frequency ===
                                      'HOURLY'
                                    : this.savedValues.repeat.frequency ===
                                      'HOURLY'}
                            >
                                hourly
                            </option>
                            <option
                                value="DAILY"
                                ?selected=${this.availabilityRule.repeat
                                    ?.frequency
                                    ? this.availabilityRule.repeat.frequency ===
                                      'DAILY'
                                    : this.savedValues.repeat.frequency ===
                                      'DAILY'}
                            >
                                daily
                            </option>
                            <option
                                value="WEEKLY"
                                ?selected=${this.availabilityRule.repeat
                                    ?.frequency
                                    ? this.availabilityRule.repeat.frequency ===
                                      'WEEKLY'
                                    : this.savedValues.repeat.frequency ===
                                      'WEEKLY'}
                            >
                                weekly
                            </option>
                        </select>
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-28 flex-shrink-0">Until:</p>
                            <input
                                id="checkbox-until"
                                type="checkbox"
                                ?checked=${false}
                                ?disabled=${!this.disableInput.frequency}
                                @input=${this.updateAvailabilityRule}
                            />
                        </div>
                        <input
                            id="input-until"
                            type="datetime-local"
                            class="w-full p-2 border rounded-lg disabled:bg-slate-100"
                            value=${parseDate(
                                this.availabilityRule.repeat?.until ??
                                    this.savedValues.repeat.until
                            )}
                            ?disabled=${!this.disableInput.until}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-28 flex-shrink-0">Count:</p>
                            <input
                                id="checkbox-count"
                                type="checkbox"
                                ?checked=${false}
                                ?disabled=${!this.disableInput.frequency}
                                @input=${this.updateAvailabilityRule}
                            />
                        </div>
                        <input
                            id="input-count"
                            type="number"
                            class="w-full p-2 border rounded-lg disabled:bg-slate-100"
                            value=${this.availabilityRule.repeat?.count ??
                            this.savedValues.repeat.count}
                            min="0"
                            ?disabled=${!this.disableInput.count}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                </div>
                <div class="flex gap-2 mt-2 w-full">
                    <button
                        @click=${this.moveAvailabilityRuleUp}
                        class="bg-slate-600 text-gray-50 p-2 rounded-lg hover:bg-slate-700 active:bg-slate-800 w-full"
                    >
                        Move Up
                    </button>
                    <button
                        @click=${this.moveAvailabilityRuleDown}
                        class="bg-slate-600 text-gray-50 p-2 rounded-lg hover:bg-slate-700 active:bg-slate-800 w-full"
                    >
                        Move Down
                    </button>
                </div>
                <button
                    @click=${this.deleteAvailabilityRule}
                    class="rounded-lg bg-red-600 text-gray-50 hover:bg-red-700 active:bg-red-800 w-full p-2 mt-2"
                >
                    Delete
                </button></apitool-collapsable-element
            >
        </div>`;
    }

    private moveAvailabilityRuleUp() {
        const event = new CustomEvent('move-availability-rule-up');
        this.dispatchEvent(event);
    }

    private moveAvailabilityRuleDown() {
        const event = new CustomEvent('move-availability-rule-down');
        this.dispatchEvent(event);
    }

    private updateInputs() {
        this.disableInput = {
            start: this.checkboxStart.checked,
            end: this.checkboxEnd.checked,
            frequency: this.checkboxFrequency.checked,
            until: this.checkboxUntil.checked,
            count: this.checkboxCount.checked,
        };
    }

    private updateSavedValues() {
        this.savedValues = {
            available: this.availabilityRule.available ?? false,
            start: this.availabilityRule.start ?? this.savedValues.start,
            end: this.availabilityRule.end ?? this.savedValues.end,
            repeat: {
                frequency:
                    this.availabilityRule.repeat?.frequency ??
                    this.savedValues.repeat.frequency,
                until:
                    this.availabilityRule.repeat?.until ??
                    this.savedValues.repeat.until,
                count:
                    this.availabilityRule.repeat?.count ??
                    this.savedValues.repeat.count,
            },
        };
    }

    private updateAvailabilityRule() {
        this.updateInputs();

        this.availabilityRule.available = this.checkboxAvailable.checked;
        let start = this.checkboxStart.checked
            ? this.availabilityRule.start
            : undefined;
        let end = this.checkboxEnd.checked
            ? this.availabilityRule.end
            : undefined;
        let until = this.checkboxUntil.checked
            ? this.availabilityRule.repeat?.until
            : undefined;
        let parseStartFailed = false;
        let parseEndFailed = false;

        if (this.checkboxStart.checked) {
            try {
                start = new Date(this.inputStart.value).toISOString();
                const startChanged = start !== this.availabilityRule.start;
                this.availabilityRule.start = start;
                if (
                    startChanged &&
                    new Date(start) > new Date(this.availabilityRule.end ?? '')
                )
                    throw new Error('Start is later than end!');

                this.inputStart.style.borderColor = '';
            } catch (error) {
                console.error(error);
                parseStartFailed = true;
                this.inputStart.style.borderColor = 'red';
            }
        }

        if (this.checkboxEnd.checked) {
            try {
                end = new Date(this.inputEnd.value).toISOString();
                const endChanged = end !== this.availabilityRule.end;
                if (
                    endChanged &&
                    new Date(this.availabilityRule.start ?? '') > new Date(end)
                )
                    throw new Error('End is earlier than start!');

                this.availabilityRule.end = end;
                this.inputEnd.style.borderColor = '';
            } catch (error) {
                console.error(error);
                parseEndFailed = true;
                this.inputEnd.style.borderColor = 'red';
            }
        }

        if (this.checkboxFrequency.checked && this.checkboxUntil.checked) {
            try {
                until = new Date(this.inputUntil.value).toISOString();
                const untilChanged = end !== this.availabilityRule.end;
                if (
                    untilChanged &&
                    new Date(this.availabilityRule.start ?? '') >
                        new Date(until)
                )
                    throw new Error('End is earlier than start!');

                this.inputEnd.style.borderColor = '';
            } catch (error) {
                console.error(error);
                this.inputEnd.style.borderColor = 'red';
            }
        }

        this.availabilityRule.start = start;
        this.availabilityRule.end = end;
        this.availabilityRule.repeat = this.checkboxFrequency.checked
            ? {
                  frequency: this.selectFrequency.value as
                      | 'HOURLY'
                      | 'DAILY'
                      | 'WEEKLY',
                  until,
                  count: this.checkboxCount.checked
                      ? this.inputCount.valueAsNumber
                      : undefined,
              }
            : undefined;

        this.updateSavedValues();

        const updateAvailabilityRuleEvent =
            new CustomEvent<DeviceServiceTypes.AvailabilityRule>(
                'update-availability-rule',
                { detail: this.availabilityRule }
            );
        this.dispatchEvent(updateAvailabilityRuleEvent);
    }

    private deleteAvailabilityRule() {
        const deleteAvailabilityRuleEvent = new CustomEvent(
            'delete-availability-rule'
        );
        this.dispatchEvent(deleteAvailabilityRuleEvent);
    }
}
