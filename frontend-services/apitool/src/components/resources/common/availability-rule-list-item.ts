import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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

    @query('#checkbox-available')
    checkboxAvailable!: HTMLInputElement;

    @query('#checkbox-start')
    checkboxStart!: HTMLInputElement;

    @query('#checkbox-end')
    checkboxEnd!: HTMLInputElement;

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
                        <p class="w-20 flex-shrink-0">Available:</p>
                        <input
                            id="checkbox-available"
                            type="checkbox"
                            ?checked=${true}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-20 flex-shrink-0">Start:</p>
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
                            class="w-full p-2 border rounded-lg"
                            value=${parseDate(
                                this.availabilityRule.start ?? ''
                            )}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                    <div class="flex flex-col">
                        <div class="flex">
                            <p class="w-20 flex-shrink-0">End:</p>
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
                            class="w-full p-2 border rounded-lg"
                            value=${parseDate(this.availabilityRule.end ?? '')}
                            @input=${this.updateAvailabilityRule}
                        />
                    </div>
                </div>
                <div class="flex flex-col gap-2 mt-2 w-full">
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

    private updateAvailabilityRule() {
        this.availabilityRule.available = this.checkboxAvailable.checked;
        let start = this.checkboxStart.checked
            ? this.availabilityRule.start
            : undefined;
        let end = this.checkboxEnd.checked
            ? this.availabilityRule.end
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

        this.availabilityRule.start = start;
        this.availabilityRule.end = end;

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
