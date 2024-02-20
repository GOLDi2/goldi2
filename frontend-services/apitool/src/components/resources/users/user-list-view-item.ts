import {
    AuthenticationServiceTypes,
    Require,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('apitool-user-list-view-item')
export class UserListViewItem extends LitElement {
    @property({ type: Object })
    user!: Require<AuthenticationServiceTypes.User<'response'>, 'url'>;

    @state()
    isOpen: boolean = false;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.user.username}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <div class="mt-2 flex flex-row gap-2">
                    <button
                        @click=${() => this.editUser()}
                        class="w-full justify-center bg-slate-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-slate-700 active:bg-slate-800"
                    >
                        Edit
                    </button>
                    <button
                        @click=${() => this.deleteUser()}
                        class="w-full justify-center bg-red-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-red-700 active:bg-red-800"
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
                    ${this.user.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Id:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.user.id}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Username:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.user.username}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Is Admin:</p>
                <p>${this.user.admin}</p>
            </div>
        </div>`;
    }

    private async editUser() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/users/' + this.user.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private async deleteUser() {
        const event = new CustomEvent<string>('delete-user', {
            detail: this.user.url,
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
