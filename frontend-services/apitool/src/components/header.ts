import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AuthenticationServiceTypes } from '@cross-lab-project/api-client';

@customElement('apitool-header')
export class Header extends LitElement {
    @property({ type: Object })
    user?: AuthenticationServiceTypes.User<'response'>;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="flex w-full h-16 bg-slate-800 items-center p-4">
            <button class="lg:hidden pr-4" @click=${this.toggleSidebar}>
                ${this.renderHamburgerMenu()}
            </button>
            <p class="text-white font-bold text-xl sm:block hidden">
                CrossLab API-Tool
            </p>
            <p class="text-white text-center ml-auto">
                Logged in as ${this.user?.username ?? 'anonymous'}
            </p>
            <button
                @click=${this.logout}
                class="p-2 ml-4 text-white bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg"
            >
                Logout
            </button>
        </div>`;
    }

    private async logout() {
        const event = new CustomEvent('logout');
        this.dispatchEvent(event);
    }

    private renderHamburgerMenu() {
        return html`<svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="white"
            class="w-6 h-6"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
        </svg> `;
    }

    private toggleSidebar() {
        const event = new CustomEvent('toggle-sidebar');

        this.dispatchEvent(event);
    }
}
