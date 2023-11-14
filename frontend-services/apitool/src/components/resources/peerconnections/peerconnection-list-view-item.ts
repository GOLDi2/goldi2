import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('apitool-peerconnection-list-view-item')
export class PeerconnectionListViewItem extends LitElement {
    @property({ type: Object })
    peerconnectionOverview!: DeviceServiceTypes.PeerconnectionOverview<'response'>;

    @property({ type: Boolean })
    deletable: boolean = true;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.peerconnectionOverview.url}
            .titleAlign=${'left'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300"
        >
            ${this.renderStatusBadge()}
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <div class="flex gap-2 mt-2">
                    <button
                        @click=${this.viewPeerconnection}
                        class="p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
                    >
                        View
                    </button>
                    <button
                        @click=${this.deletePeerconnection}
                        ?hidden=${!this.deletable}
                        class="p-2 w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50"
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
                    ${this.peerconnectionOverview.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Type:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnectionOverview.type}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Status:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnectionOverview.status}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">URL Device A:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnectionOverview.devices[0].url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">URL Device B:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnectionOverview.devices[1].url}
                </p>
            </div>
        </div>`;
    }

    private async viewPeerconnection() {
        history.pushState(
            {},
            '',
            '/peerconnections/' +
                this.peerconnectionOverview.url.split('/').at(-1)
        );

        const event = new CustomEvent<string>('update-view', {
            detail:
                '/peerconnections/' +
                this.peerconnectionOverview.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private renderStatusBadge() {
        switch (this.peerconnectionOverview.status) {
            case 'new':
                return this.renderBadge('new', 'bg-green-300');
            case 'connecting':
                return this.renderBadge('connecting', 'bg-teal-300');
            case 'connected':
                return this.renderBadge('connected', 'bg-blue-300');
            case 'disconnected':
                return this.renderBadge('disconnected', 'bg-orange-300');
            case 'failed':
                return this.renderBadge('failed', 'bg-red-300');
            case 'closed':
                return this.renderBadge('closed', 'bg-violet-300');
            default:
                return this.renderBadge('unknown', 'bg-gray-100');
        }
    }

    private renderBadge(status: string, color: string) {
        return html`
            <p
                slot="pre-title"
                class="p-1 rounded-lg ${color} mr-2 w-32 flex-shrink-0 text-center"
            >
                ${status}
            </p>
        `;
    }

    private deletePeerconnection() {
        const event = new CustomEvent<string>('delete-peerconnection', {
            detail: this.peerconnectionOverview.url,
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
