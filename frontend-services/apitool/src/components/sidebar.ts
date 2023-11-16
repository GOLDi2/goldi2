import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('apitool-sidebar')
export class Sidebar extends LitElement {
    @property({ type: Boolean })
    isOpen: boolean = false;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html` <div
            class="w-full h-full overflow-auto border-r-2 border-black flex flex-col lg:flex ${this
                .isOpen
                ? ''
                : 'hidden'}"
        >
            <a
                href="${window.configuration.BASE_PATH ?? ''}/devices"
                class="text-center w-full p-2 border-black border-b-2 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Devices
            </a>
            <a
                href="${window.configuration.BASE_PATH ?? ''}/experiments"
                class="text-center w-full p-2 border-black border-b-2 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Experiments
            </a>
            <a
                href="${window.configuration.BASE_PATH ?? ''}/peerconnections"
                class="text-center w-full p-2 border-black border-b-2 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Peerconnections
            </a>
            <a
                href="${window.configuration.BASE_PATH ?? ''}/templates"
                class="text-center w-full p-2 border-black border-b-2 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Templates
            </a>
            <a
                href="${window.configuration.BASE_PATH ?? ''}/users"
                class="text-center w-full p-2 border-black border-b-2 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Users
            </a>
            <div
                @click=${() => {
                    this.dispatchEvent(new CustomEvent('toggle-open'));
                }}
                class="flex flex-grow bg-slate-400 lg:opacity-100 opacity-80"
            ></div>
        </div>`;
    }
}
