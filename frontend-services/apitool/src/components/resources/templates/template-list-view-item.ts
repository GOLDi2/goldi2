import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ExperimentServiceTypes } from '@cross-lab-project/api-client';

@customElement('apitool-template-list-view-item')
export class TemplateListViewItem extends LitElement {
    @property({ type: Object })
    templateOverview!: ExperimentServiceTypes.TemplateOverview<'response'>;

    @property({ type: Boolean })
    editable: boolean = true;

    @property({ type: Boolean })
    deletable: boolean = true;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.templateOverview.name}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <div class="flex flex-row gap-2">
                    <button
                        @click=${() => this.editTemplate()}
                        ?hidden=${!this.editable}
                        class="mt-2 w-full justify-center bg-slate-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-slate-700 active:bg-slate-800"
                    >
                        Edit
                    </button>
                    <button
                        ?hidden=${!this.deletable}
                        class="mt-2 w-full justify-center bg-red-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-red-700 active:bg-red-800"
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
                <p class="w-28 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.templateOverview.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Name:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.templateOverview.name}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Description:</p>
                <p class="overflow-hidden text-ellipsis">
                    ${this.templateOverview.description}
                </p>
            </div>
        </div>`;
    }

    private async editTemplate() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/templates/' + this.templateOverview.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
