import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

export type ExperimentFilterOptions = {
    url: string;
    status: {
        created: boolean;
        booked: boolean;
        setup: boolean;
        running: boolean;
        finished: boolean;
    };
};

@customElement('apitool-experiment-list-view-filter')
export class ExperimentListViewFilter extends LitElement {
    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    @query('#status-filter-created')
    statusFilterCreated!: HTMLInputElement;

    @query('#status-filter-booked')
    statusFilterBooked!: HTMLInputElement;

    @query('#status-filter-setup')
    statusFilterSetup!: HTMLInputElement;

    @query('#status-filter-running')
    statusFilterRunning!: HTMLInputElement;

    @query('#status-filter-finished')
    statusFilterFinished!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Filters'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
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
                                <label for="status-filter-created"
                                    >Created</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-created"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-booked">Booked</label>
                            </td>
                            <td>
                                <input
                                    id="status-filter-booked"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-setup">Setup</label>
                            </td>
                            <td>
                                <input
                                    id="status-filter-setup"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-running"
                                    >Running</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-running"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-finished"
                                    >Finished</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-finished"
                                    type="checkbox"
                                    checked
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
        const event = new CustomEvent<ExperimentFilterOptions>(
            'filters-updated',
            {
                detail: {
                    url: this.urlFilter.value,
                    status: {
                        created: this.statusFilterCreated.checked,
                        booked: this.statusFilterBooked.checked,
                        setup: this.statusFilterSetup.checked,
                        running: this.statusFilterRunning.checked,
                        finished: this.statusFilterFinished.checked,
                    },
                },
                bubbles: true,
            }
        );

        this.dispatchEvent(event);
    }
}
