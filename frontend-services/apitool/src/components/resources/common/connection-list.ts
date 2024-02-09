import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

@customElement('apitool-connection-list')
export class ConnectionList extends LitElement {
    @property({ type: Array })
    connectionUrls: string[] = [];

    @property({ type: Object })
    parent!: LitElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Connections'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
            ><div class="flex flex-col gap-2">
                ${map(
                    this.connectionUrls,
                    (connectionUrl) =>
                        html`<apitool-connection-list-item
                            .connectionUrl=${connectionUrl}
                            .parent=${this.parent}
                        ></apitool-connection-list-item>`
                )}
            </div></apitool-collapsable-element
        >`;
    }
}
