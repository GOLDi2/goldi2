import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals.ts';
import { TemplateFilterOptions } from './template-list-view-filter.ts';
import { renderLoadingScreen } from '../helper.ts';

@customElement('apitool-template-list-view')
export class TemplateListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    templateOverviews: ExperimentServiceTypes.TemplateOverview<'response'>[] =
        [];

    @state()
    filteredTemplateOverviews: ExperimentServiceTypes.TemplateOverview<'response'>[] =
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
        this.templateOverviews = await apiClient.listTemplate();
        this.filteredTemplateOverviews = this.templateOverviews;
    }

    protected render(): unknown {
        return html`${renderLoadingScreen(this.isReady)}
            <div
                class="w-full flex flex-col items-center ${
                    !this.isReady ? 'hidden' : ''
                }"
            >
                <div
                    class="p-4 w-[60rem] max-w-full relative flex flex-col gap-2 flex-grow"
                >
                    <apitool-template-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<TemplateFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-template-list-view-filter>
                    ${this.filteredTemplateOverviews.map(
                        (templateOverview) =>
                            html`<apitool-template-list-view-item
                                .templateOverview=${templateOverview}
                            ></apitool-template-list-view-item>`
                    )} </div>
                    <div
                        class="flex w-full justify-center p-2 sticky bottom-0 left-0 bg-white border-t border-black pb-[calc(0.5rem_+_env(safe-area-inset-bottom))]"
                    >
                        <button class="bg-green-300 p-2 rounded-full" @click=${() =>
                            this.createTemplate()}>
                            + Add Template
                        </button>
                    </div>
                </div>
            </div>`;
    }

    private filter(filterOptions: TemplateFilterOptions) {
        this.filteredTemplateOverviews = this.templateOverviews.filter(
            (templateOverview) => {
                if (
                    templateOverview.name
                        .toLowerCase()
                        .includes(filterOptions.name.toLowerCase()) &&
                    templateOverview.url
                        .toLowerCase()
                        .includes(filterOptions.url.toLowerCase())
                )
                    return true;
                else return false;
            }
        );
    }

    private createTemplate() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/template_creation',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
