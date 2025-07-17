import { BookingServiceTypes } from '@cross-lab-project/api-client';
import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Editor } from '../common';
import { map } from 'lit/directives/map.js';

@customElement('apitool-booking-viewer')
export class BookingViewer extends LitElement {
    @property({ type: Object })
    booking!: BookingServiceTypes.Booking<'response'>;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor .type=${'viewer'} @cancel=${this.cancel}>
            <div class="flex">
                <p class="w-20 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-20 flex-shrink-0">Status:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.status}
                </p>
            </div>
            <div class="flex">
                <p class="w-20 flex-shrink-0">Is Locked:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.isLocked}
                </p>
            </div>
            <div class="flex">
                <p class="w-20 flex-shrink-0">Start:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.timeslot.start}
                </p>
            </div>
            <div class="flex">
                <p class="w-20 flex-shrink-0">End:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.timeslot.end}
                </p>
            </div>
            <apitool-collapsable-element
                .title=${'Devices'}
                class="w-full flex flex-col bg-white p-2 rounded-lg border gap-2"
            >
                <div class="flex flex-col gap-2">
                    ${map(
                        Object.entries(this.booking.devices),
                        this.renderDevice.bind(this)
                    )}
                </div>
            </apitool-collapsable-element>
            <apitool-collapsable-element
                .title=${'Selected Devices'}
                class="w-full flex flex-col bg-white p-2 rounded-lg border gap-2"
            >
                <div class="flex flex-col gap-2">
                    ${map(
                        Object.entries(this.booking.selectedDevices),
                        this.renderSelectedDevice.bind(this)
                    )}
                </div>
            </apitool-collapsable-element>
        </apitool-editor>`;
    }

    private renderDevice([id, device]: [
        string,
        BookingServiceTypes.Booking<'response'>['devices'][string]
    ]) {
        return html`<apitool-device-list-item
            .device=${device}
            .removeable=${false}
            .titlePrefix=${`${id} : `}
        >
        </apitool-device-list-item>`;
    }

    private renderSelectedDevice([id, url]: [string, string | null]) {
        if (!url) {
            return;
        }

        return html`<apitool-device-list-item
            .device=${{ url }}
            .removeable=${false}
            .titlePrefix=${`${id} : `}
        >
        </apitool-device-list-item>`;
    }

    private cancel() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/bookings',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
