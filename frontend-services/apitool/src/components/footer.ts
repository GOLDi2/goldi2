import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('apitool-footer')
export class Footer extends LitElement {
    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full h-16 bg-slate-800 flex items-center p-4">
            <p class="text-white ml-auto">@CrossLab 2023</p>
        </div>`;
    }
}
