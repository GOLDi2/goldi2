import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

export type TemplateFilterOptions = {
    url: string;
    name: string;
};

@customElement('apitool-template-list-view-filter')
export class TemplateListViewFilter extends LitElement {
    @query('#name-filter')
    nameFilter!: HTMLInputElement;

    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Filters'}
            class="bg-slate-300 rounded-lg p-2 flex flex-col border-2 border-black ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            <div class="w-full flex flex-col gap-1">
                <input
                    id="url-filter"
                    type="text"
                    placeholder="URL"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${this.updateFilters}
                />
                <input
                    id="name-filter"
                    type="text"
                    placeholder="Name"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${() => this.updateFilters()}
                />
            </div>
        </apitool-collapsable-element> `;
    }

    private updateFilters() {
        const event = new CustomEvent<TemplateFilterOptions>(
            'filters-updated',
            {
                detail: {
                    name: this.nameFilter.value,
                    url: this.urlFilter.value,
                },
            }
        );

        this.dispatchEvent(event);
    }
}
