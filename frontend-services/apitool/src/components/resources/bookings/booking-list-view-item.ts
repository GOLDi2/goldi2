import { BookingServiceTypes } from '@cross-lab-project/api-client';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('apitool-booking-list-view-item')
export class BookingListViewItem extends LitElement {
    @property({ type: Object })
    booking!: BookingServiceTypes.Booking<'response'>;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.booking.url}
            .titleAlign=${'left'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            ${this.renderStatusBadge()}
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <button
                    @click=${this.viewBooking}
                    class="p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
                >
                    View
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private renderInformation() {
        return html`<div class="flex flex-col">
            <div class="flex">
                <p class="w-28 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Status:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.status}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Is Locked:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.isLocked}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Start:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.timeslot.start}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">End:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.booking.timeslot.end}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Devices:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${JSON.stringify(this.booking.devices)}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Selected Devices:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${JSON.stringify(this.booking.selectedDevices)}
                </p>
            </div>
        </div>`;
    }

    private renderStatusBadge() {
        switch (this.booking.status) {
            case 'accepted':
                return this.renderBadge('accepted', 'bg-green-300');
            case 'accepted-essential':
                return this.renderBadge('accepted-essential', 'bg-teal-300');
            case 'rejected':
                return this.renderBadge('rejected', 'bg-red-300');
            case 'impossible':
                return this.renderBadge('impossible', 'bg-gray-400');
        }
    }

    private renderBadge(status: string, color: string) {
        return html`
            <p
                slot="pre-title"
                class="p-1 rounded-lg ${color} mr-2 w-40 flex-shrink-0 text-center"
            >
                ${status}
            </p>
        `;
    }

    private async viewBooking() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/bookings/' + this.booking.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
