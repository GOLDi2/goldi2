import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals.ts';
import { ExperimentFilterOptions } from './experiment-list-view-filter.ts';
import { renderLoadingScreen } from '../helper.ts';

@customElement('apitool-experiment-list-view')
export class ExperimentListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    experimentOverviews: ExperimentServiceTypes.ExperimentOverview<'response'>[] =
        [];

    @state()
    filteredExperimentOverviews: ExperimentServiceTypes.ExperimentOverview<'response'>[] =
        [];

    constructor() {
        super();
        this.initialize()
            .catch((error) => console.error(error))
            .finally(() => {
                this.isReady = true;
            });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    private async initialize() {
        this.experimentOverviews = await apiClient.listExperiments();
        this.filteredExperimentOverviews = this.experimentOverviews;
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
                    <apitool-experiment-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<ExperimentFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-experiment-list-view-filter>
                    ${this.filteredExperimentOverviews.map(
                        (experimentOverview) =>
                            html`<apitool-experiment-list-view-item
                                .experimentOverview=${experimentOverview}
                                @delete-experiment=${this.deleteExperiment}
                            ></apitool-experiment-list-view-item>`
                    )}
                </div>
                <div
                    class="flex w-full justify-center p-2 sticky bottom-0 left-0 bg-white border-t border-black pb-[calc(0.5rem_+_env(safe-area-inset-bottom))]"
                >
                    <button
                        class="bg-green-300 p-2 rounded-full"
                        @click=${() => this.createExperiment()}
                    >
                        + Add Experiment
                    </button>
                </div>
            </div>`;
    }

    private filter(filterOptions: ExperimentFilterOptions) {
        this.filteredExperimentOverviews = this.experimentOverviews
            .filter((experimentOverview) =>
                experimentOverview.url.includes(filterOptions.url)
            )
            .filter(
                (experimentOverview) =>
                    filterOptions.status[experimentOverview.status]
            );
    }

    private createExperiment() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/experiment_creation',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private async deleteExperiment(event: CustomEvent<string>) {
        await apiClient.deleteExperiment(event.detail);
        this.experimentOverviews = this.experimentOverviews.filter(
            (experimentOverview) => experimentOverview.url !== event.detail
        );
        this.filteredExperimentOverviews =
            this.filteredExperimentOverviews.filter(
                (experimentOverview) => experimentOverview.url !== event.detail
            );
    }
}
