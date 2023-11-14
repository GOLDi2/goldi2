import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

export type PeerconnectionFilterOptions = {
    url: string;
    type: {
        webrtc: boolean;
    };
    devices: {
        deviceA: string;
        deviceB: string;
        strictDeviceOrder: boolean;
    };
    status: {
        new: boolean;
        connecting: boolean;
        connected: boolean;
        disconnected: boolean;
        failed: boolean;
        closed: boolean;
    };
};

@customElement('apitool-peerconnection-list-view-filter')
export class PeerconnectionListViewFilter extends LitElement {
    @state()
    isOpen: boolean = false;

    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    @query('#type-filter-webrtc')
    typeFilterWebRTC!: HTMLInputElement;

    @query('#device-filter-a')
    deviceFilterA!: HTMLInputElement;

    @query('#device-filter-b')
    deviceFilterB!: HTMLInputElement;

    @query('#strict-device-order-filter')
    strictDeviceOrderFilter!: HTMLInputElement;

    @query('#status-filter-new')
    statusFilterNew!: HTMLInputElement;

    @query('#status-filter-connecting')
    statusFilterConnecting!: HTMLInputElement;

    @query('#status-filter-connected')
    statusFilterConnected!: HTMLInputElement;

    @query('#status-filter-disconnected')
    statusFilterDisconnected!: HTMLInputElement;

    @query('#status-filter-failed')
    statusFilterFailed!: HTMLInputElement;

    @query('#status-filter-closed')
    statusFilterClosed!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Filters'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300"
        >
            <div class="flex flex-col gap-2 w-full">
                <input
                    id="url-filter"
                    type="text"
                    placeholder="URL"
                    class="p-2 rounded-lg border-2 border-black"
                    @input=${this.updateFilters}
                />
                <div
                    class="w-full p-2 border-2 border-black rounded-lg flex flex-col items-center bg-slate-100"
                >
                    <p class="w-full text-center font-semibold">Type</p>
                    <table>
                        <tr>
                            <td class="pr-4">
                                <label for="type-filter-webrtc">WebRTC</label>
                            </td>
                            <td>
                                <input
                                    id="type-filter-webrtc"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                    </table>
                </div>
                <div
                    class="w-full p-2 border-2 border-black rounded-lg flex flex-col gap-2 items-center bg-slate-100"
                >
                    <p class="w-full text-center font-semibold">Devices</p>
                    <input
                        id="device-filter-a"
                        type="text"
                        placeholder="Device A"
                        class="p-2 rounded-lg w-full border"
                        @input=${this.updateFilters}
                    />
                    <input
                        id="device-filter-b"
                        type="text"
                        placeholder="Device B"
                        class="p-2 rounded-lg w-full border"
                        @input=${this.updateFilters}
                    />
                    <div class="flex">
                        <label class="mr-2" for="strict-device-order-filter"
                            >Strict Device Order</label
                        >
                        <input
                            id="strict-device-order-filter"
                            type="checkbox"
                            @input=${this.updateFilters}
                        />
                    </div>
                </div>
                <div
                    class="w-full p-2 border-2 border-black rounded-lg flex flex-col items-center bg-slate-100"
                >
                    <p class="w-full text-center font-semibold">Status</p>
                    <table>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-new">New</label>
                            </td>
                            <td>
                                <input
                                    id="status-filter-new"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-connecting"
                                    >Connecting</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-connecting"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-connected"
                                    >Connected</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-connected"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-disconnected"
                                    >Disconnected</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-disconnected"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-failed">Failed</label>
                            </td>
                            <td>
                                <input
                                    id="status-filter-failed"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="status-filter-closed"
                                    >Finished</label
                                >
                            </td>
                            <td>
                                <input
                                    id="status-filter-closed"
                                    type="checkbox"
                                    checked
                                    @input=${this.updateFilters}
                                />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </apitool-collapsable-element>`;
    }

    private toggleOpen() {
        this.isOpen = !this.isOpen;
    }

    private updateFilters() {
        const event = new CustomEvent<PeerconnectionFilterOptions>(
            'filters-updated',
            {
                detail: {
                    url: this.urlFilter.value,
                    type: {
                        webrtc: this.typeFilterWebRTC.checked,
                    },
                    devices: {
                        deviceA: this.deviceFilterA.value,
                        deviceB: this.deviceFilterB.value,
                        strictDeviceOrder: this.strictDeviceOrderFilter.checked,
                    },
                    status: {
                        new: this.statusFilterNew.checked,
                        connecting: this.statusFilterConnecting.checked,
                        connected: this.statusFilterConnected.checked,
                        disconnected: this.statusFilterDisconnected.checked,
                        failed: this.statusFilterFailed.checked,
                        closed: this.statusFilterClosed.checked,
                    },
                },
                bubbles: true,
            }
        );

        this.dispatchEvent(event);
    }
}
