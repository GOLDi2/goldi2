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
            class="w-full h-full overflow-auto lg:border-r-2 border-black flex flex-col lg:flex items-center ${this
                .isOpen
                ? ''
                : 'hidden'}"
        >
            <a
                @click=${this.openLink('/devices')}
                href="${window.configuration.BASE_PATH ?? ''}/devices"
                class="z-20 text-center w-[calc(100%-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] p-2 border-black border-b-2 border-x-2 lg:border-x-0 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Devices
            </a>
            <a
                @click=${this.openLink('/experiments')}
                href="${window.configuration.BASE_PATH ?? ''}/experiments"
                class="z-20 text-center w-[calc(100%-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] p-2 border-black border-b-2 border-x-2 lg:border-x-0 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Experiments
            </a>
            <a
                @click=${this.openLink('/peerconnections')}
                href="${window.configuration.BASE_PATH ?? ''}/peerconnections"
                class="z-20 text-center w-[calc(100%-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] p-2 border-black border-b-2 border-x-2 lg:border-x-0 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Peerconnections
            </a>
            <a
                @click=${this.openLink('/templates')}
                href="${window.configuration.BASE_PATH ?? ''}/templates"
                class="z-20 text-center w-[calc(100%-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] p-2 border-black border-b-2 border-x-2 lg:border-x-0 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Templates
            </a>
            <a
                @click=${this.openLink('/users')}
                href="${window.configuration.BASE_PATH ?? ''}/users"
                class="z-20 text-center w-[calc(100%-_env(safe-area-inset-left)_-_env(safe-area-inset-right))] p-2 border-black border-b-2 border-x-2 lg:border-x-0 bg-slate-400 hover:bg-slate-300 active:bg-slate-200 lg:block"
            >
                Users
            </a>
            <div
                @click=${() => {
                    this.dispatchEvent(new CustomEvent('toggle-open'));
                }}
                class="w-full h-full absolute z-10 bg-slate-400 lg:opacity-100 opacity-80"
            ></div>
        </div>`;
    }

    private openLink(link: string) {
        return (event: MouseEvent) => {
            event.preventDefault();
            this.dispatchEvent(
                new CustomEvent<string>('update-view', { detail: link })
            );
        };
    }
}
