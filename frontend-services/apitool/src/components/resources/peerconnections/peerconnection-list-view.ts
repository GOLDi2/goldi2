import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals.js';
import { PeerconnectionFilterOptions } from './peerconnection-list-view-filter.js';
import { renderLoadingScreen } from '../helper.js';

@customElement('apitool-peerconnection-list-view')
export class PeerconnectionListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    peerconnectionOverviews: DeviceServiceTypes.PeerconnectionOverview<'response'>[] =
        [];

    @state()
    filteredPeerconnectionOverviews: DeviceServiceTypes.PeerconnectionOverview<'response'>[] =
        [];

    constructor() {
        super();
        apiClient
            .listPeerconnections()
            .then((peerconnectionOverviews) => {
                this.peerconnectionOverviews = peerconnectionOverviews;
                this.filteredPeerconnectionOverviews = peerconnectionOverviews;
            })
            .catch(() => {})
            .finally(() => {
                this.isReady = true;
                this.requestUpdate();
            });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`${renderLoadingScreen(this.isReady)}
            <div
                class="w-full flex flex-col items-center ${!this.isReady
                    ? 'hidden'
                    : ''}"
            >
                <div
                    class="p-4 w-[60rem] max-w-full relative flex flex-col gap-2 flex-grow"
                >
                    <apitool-peerconnection-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<PeerconnectionFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-peerconnection-list-view-filter>
                    ${this.filteredPeerconnectionOverviews.map(
                        (peerconnectionOverviews) =>
                            html`<apitool-peerconnection-list-view-item
                                .peerconnectionOverview=${peerconnectionOverviews}
                                @delete-peerconnection=${this
                                    .deletePeerconnection}
                            ></apitool-peerconnection-list-view-item>`
                    )}
                </div>
            </div>`;
    }

    private filter(filterOptions: PeerconnectionFilterOptions) {
        this.filteredPeerconnectionOverviews = this.peerconnectionOverviews
            .filter((peerconnectionOverview) =>
                peerconnectionOverview.url.includes(filterOptions.url)
            )
            .filter((peerconnectionOverview) => {
                if (
                    filterOptions.type.webrtc &&
                    peerconnectionOverview.type === 'webrtc'
                )
                    return true;

                return false;
            })
            .filter((peerconnectionOverview) => {
                if (filterOptions.devices.strictDeviceOrder) {
                    return (
                        peerconnectionOverview.devices[0].url.includes(
                            filterOptions.devices.deviceA
                        ) &&
                        peerconnectionOverview.devices[1].url.includes(
                            filterOptions.devices.deviceB
                        )
                    );
                }

                return (
                    (peerconnectionOverview.devices[0].url.includes(
                        filterOptions.devices.deviceA
                    ) ||
                        peerconnectionOverview.devices[1].url.includes(
                            filterOptions.devices.deviceA
                        )) &&
                    (peerconnectionOverview.devices[0].url.includes(
                        filterOptions.devices.deviceB
                    ) ||
                        peerconnectionOverview.devices[1].url.includes(
                            filterOptions.devices.deviceB
                        ))
                );
            })
            .filter((peerconnectionOverview) => {
                if (
                    peerconnectionOverview.status &&
                    filterOptions.status[peerconnectionOverview.status]
                )
                    return true;

                return false;
            });
    }

    private async deletePeerconnection(event: CustomEvent<string>) {
        await apiClient.deletePeerconnection(event.detail);
        this.peerconnectionOverviews = this.peerconnectionOverviews.filter(
            (peerconnectionOverview) =>
                peerconnectionOverview.url !== event.detail
        );
        this.filteredPeerconnectionOverviews =
            this.filteredPeerconnectionOverviews.filter(
                (peerconnectionOverview) =>
                    peerconnectionOverview.url !== event.detail
            );
    }
}
