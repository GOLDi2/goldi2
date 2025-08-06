import { html, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';

export type BookingFilterOptions = {
    url: string;
    status: {
        accepted: boolean;
        'accepted-essential': boolean;
        rejected: boolean;
        impossible: boolean;
    };
};

@customElement('apitool-booking-list-view-filter')
export class BookingListViewFilter extends LitElement {
    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    @query('#status-filter-accepted')
    statusFilterAccepted!: HTMLInputElement;

    @query('#status-filter-accepted-essential')
    statusFilterAcceptedEssential!: HTMLInputElement;

    @query('#status-filter-rejected')
    statusFilterRejected!: HTMLInputElement;

    @query('#status-filter-impossible')
    statusFilterImpossible!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Filter Options'}
            .titleClasses=${'font-semibold text-xl text-slate-100'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-600 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            <div class="flex flex-col gap-2 w-full">
                <input
                    id="url-filter"
                    type="text"
                    placeholder="URL"
                    class="p-2 rounded-lg border-2 border-black"
                    @input=${this.updateFilters}
                />
                <div
                    class="w-full p-2 border-2 border-black rounded-lg flex flex-col items-center bg-slate-100"
                >
                    <p class="w-full text-center font-semibold">Status</p>
                    <table>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-accepted"
                                    >Accepted</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-accepted"
                                    type="checkbox"
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-accepted-essential"
                                    >Accepted Essential</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-accepted-essential"
                                    type="checkbox"
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-rejected"
                                    >Rejected</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-rejected"
                                    type="checkbox"
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-impossible"
                                    >Impossible</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-impossible"
                                    type="checkbox"
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </apitool-collapsable-element>`;
    }

    private updateFilters() {
        const event = new CustomEvent<BookingFilterOptions>('filters-updated', {
            detail: {
                url: this.urlFilter.value,
                status: {
                    accepted: this.statusFilterAccepted.checked,
                    'accepted-essential':
                        this.statusFilterAcceptedEssential.checked,
                    rejected: this.statusFilterRejected.checked,
                    impossible: this.statusFilterImpossible.checked,
                },
            },
        });

        this.dispatchEvent(event);
    }
}
