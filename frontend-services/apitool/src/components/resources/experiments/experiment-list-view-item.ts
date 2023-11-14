import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ExperimentServiceTypes } from '@cross-lab-project/api-client';

@customElement('apitool-experiment-list-view-item')
export class ExperimentListViewItem extends LitElement {
    @property({ type: Object })
    experimentOverview!: ExperimentServiceTypes.ExperimentOverview<'response'>;

    @property({ type: Boolean })
    editable: boolean = true;

    @property({ type: Boolean })
    deletable: boolean = true;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.experimentOverview.url}
            .titleAlign=${'left'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300"
        >
            ${this.renderStatusBadge()}
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <div class="flex flex-row gap-2 mt-2">
                    <button
                        @click=${this.editExperiment}
                        ?hidden=${!this.editable}
                        class="w-full justify-center bg-slate-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:bg-slate-700 active:bg-slate-800"
                    >
                        Edit
                    </button>
                    <button
                        @click=${this.deleteExperiment}
                        ?hidden=${!this.deletable}
                        class="w-full justify-center bg-red-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:bg-red-700 active:bg-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </apitool-collapsable-element>`;
    }

    private renderInformation() {
        return html`<div class="flex flex-col">
            <div class="flex">
                <p class="w-20 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.experimentOverview.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-20 flex-shrink-0">Status:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.experimentOverview.status}
                </p>
            </div>
        </div> `;
    }

    private renderStatusBadge() {
        switch (this.experimentOverview.status) {
            case 'created':
                return this.renderBadge('created', 'bg-lime-300');
            case 'booked':
                return this.renderBadge('booked', 'bg-green-300');
            case 'setup':
                return this.renderBadge('setup', 'bg-teal-300');
            case 'running':
                return this.renderBadge('running', 'bg-blue-300');
            case 'finished':
                return this.renderBadge('finished', 'bg-violet-300');
            default:
                return this.renderBadge('unknown', 'bg-gray-100');
        }
    }

    private renderBadge(status: string, color: string) {
        return html`
            <p
                slot="pre-title"
                class="p-1 rounded-lg ${color} mr-2 w-36 flex justify-center flex-shrink-0"
            >
                ${status}
            </p>
        `;
    }

    private editExperiment() {
        history.pushState(
            {},
            '',
            '/experiments/' + this.experimentOverview.url.split('/').at(-1)
        );

        const event = new CustomEvent<string>('update-view', {
            detail:
                '/experiments/' + this.experimentOverview.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private async deleteExperiment() {
        const event = new CustomEvent<string>('delete-experiment', {
            detail: this.experimentOverview.url,
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
