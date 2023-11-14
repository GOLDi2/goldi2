import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import dayjs from 'dayjs';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('apitool-availability-rule-list')
export class AvailabilityRuleList extends LitElement {
    @property({ type: Array })
    availabilityRules: DeviceServiceTypes.AvailabilityRule[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @state()
    availabilityRuleItems: {
        value: DeviceServiceTypes.AvailabilityRule;
        key: string;
        shouldOpen: boolean;
    }[] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.availabilityRuleItems = this.availabilityRules.map(
            (availabilityRule) => {
                return {
                    value: availabilityRule,
                    key: crypto.randomUUID(),
                    shouldOpen: false,
                };
            }
        );
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Availability Rules'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2 items-center">
                ${repeat(
                    this.availabilityRuleItems,
                    (item) => item.key,
                    (item, index) => html`<apitool-availability-rule-list-item
                        .availabilityRule=${item.value}
                        .index=${index}
                        .parent=${this.parent}
                        .shouldOpen=${item.shouldOpen}
                        class="w-full items-start"
                        @update-availability-rule=${this.updateAvailabilityRule(
                            index
                        )}
                        @delete-availability-rule=${() =>
                            this.deleteAvailabilityRule(index)}
                        @move-availability-rule-up=${() =>
                            this.moveAvailabilityRule(index, 'up')}
                        @move-availability-rule-down=${() =>
                            this.moveAvailabilityRule(index, 'down')}
                    >
                    </apitool-availability-rule-list-item>`
                )}
                <button
                    @click=${this.addAvailabilityRule}
                    class="text-2xl bg-slate-600 text-gray-50 p-2 rounded-full hover:bg-slate-700 active:bg-slate-800 h-12 w-12"
                >
                    +
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private addAvailabilityRule() {
        const [start, end] = [
            dayjs().toISOString(),
            dayjs().add(1, 'hour').toISOString(),
        ];
        this.availabilityRules.push({
            available: true,
            start,
            end,
        });
        this.availabilityRuleItems.push({
            value: {
                available: true,
                start,
                end,
            },
            key: crypto.randomUUID(),
            shouldOpen: true,
        });
        const updateAvailabilityRulesEvent = new CustomEvent<
            DeviceServiceTypes.AvailabilityRule[]
        >('update-availability-rules', { detail: this.availabilityRules });
        this.dispatchEvent(updateAvailabilityRulesEvent);
    }

    private updateAvailabilityRule(index: number) {
        return (event: CustomEvent<DeviceServiceTypes.AvailabilityRule>) => {
            this.availabilityRules[index] = event.detail;
            this.availabilityRuleItems[index].value = event.detail;
            const updateAvailabilityRulesEvent = new CustomEvent<
                DeviceServiceTypes.AvailabilityRule[]
            >('update-availability-rules', { detail: this.availabilityRules });
            this.dispatchEvent(updateAvailabilityRulesEvent);
        };
    }

    private deleteAvailabilityRule(index: number) {
        this.availabilityRules.splice(index, 1);
        this.availabilityRuleItems.splice(index, 1);
        const updateAvailabilityRulesEvent = new CustomEvent<
            DeviceServiceTypes.AvailabilityRule[]
        >('update-availability-rules', { detail: this.availabilityRules });
        this.dispatchEvent(updateAvailabilityRulesEvent);
    }

    private moveAvailabilityRule(index: number, direction: 'up' | 'down') {
        if (
            (index === 0 && direction === 'up') ||
            (index === this.availabilityRules.length - 1 &&
                direction === 'down')
        )
            return;

        const offset = direction === 'up' ? -1 : 1;

        const temp = {
            availabilityRule: this.availabilityRules[index],
            availabilityRuleItem: this.availabilityRuleItems[index],
        };
        this.availabilityRules[index] = this.availabilityRules[index + offset];
        this.availabilityRules[index + offset] = temp.availabilityRule;
        this.availabilityRuleItems[index] =
            this.availabilityRuleItems[index + offset];
        this.availabilityRuleItems[index + offset] = temp.availabilityRuleItem;

        const updateAvailabilityRulesEvent = new CustomEvent<
            DeviceServiceTypes.AvailabilityRule[]
        >('update-availability-rules', { detail: this.availabilityRules });
        this.dispatchEvent(updateAvailabilityRulesEvent);
    }
}
