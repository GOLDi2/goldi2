import {
    BookingServiceTypes,
    UnsuccessfulRequestError,
} from '@cross-lab-project/api-client';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { renderLoadingScreen } from '../helper';
import { BookingFilterOptions } from './booking-list-view-filter';

@customElement('apitool-booking-list-view')
export class BookingListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    bookings: BookingServiceTypes.Booking<'response'>[] = [];

    @state()
    filteredBookings: BookingServiceTypes.Booking<'response'>[] = [];

    constructor() {
        super();
        apiClient
            .listBookings()
            .then((bookings) => {
                this.bookings = bookings;
                this.filteredBookings = bookings;
            })
            .catch(() => {})
            .finally(() => {
                this.isReady = true;
                this.requestUpdate();
            });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`${renderLoadingScreen(this.isReady)}
            <div
                class="w-full flex flex-col items-center ${!this.isReady
                    ? 'hidden'
                    : ''}"
            >
                <div
                    class="p-4 w-[60rem] max-w-full relative flex flex-col gap-2 flex-grow"
                >
                    <apitool-booking-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<BookingFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-booking-list-view-filter>
                    ${this.filteredBookings.map(
                        (booking) =>
                            html`<apitool-booking-list-view-item
                                .booking=${booking}
                            ></apitool-booking-list-view-item>`
                    )}
                </div>
            </div>`;
    }

    private filter(filterOptions: BookingFilterOptions) {
        this.filteredBookings = this.bookings
            .filter((booking) => booking.url.includes(filterOptions.url))
            .filter((booking) => {
                return filterOptions.status[booking.status];
            });
    }
}
