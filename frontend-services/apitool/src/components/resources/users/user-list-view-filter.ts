import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';

export type UserFilterOptions = {
    url: string;
    id: string;
    username: string;
};

@customElement('apitool-user-list-view-filter')
export class UserListViewFilter extends LitElement {
    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    @query('#id-filter')
    idFilter!: HTMLInputElement;

    @query('#username-filter')
    usernameFilter!: HTMLInputElement;

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
                    id="id-filter"
                    type="text"
                    placeholder="Id"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${() => this.updateFilters()}
                />
                <input
                    id="username-filter"
                    type="text"
                    placeholder="Username"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${() => this.updateFilters()}
                />
            </div>
        </apitool-collapsable-element> `;
    }

    private updateFilters() {
        const event = new CustomEvent<UserFilterOptions>('filters-updated', {
            detail: {
                url: this.urlFilter.value,
                id: this.idFilter.value,
                username: this.usernameFilter.value,
            },
        });

        this.dispatchEvent(event);
    }
}
