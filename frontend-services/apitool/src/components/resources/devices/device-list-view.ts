import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals.ts';
import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { DeviceFilterOptions } from './device-list-view-filter.ts';
import { renderLoadingScreen } from '../helper.ts';

@customElement('apitool-device-list-view')
export class DeviceListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    deviceOverviews: DeviceServiceTypes.DeviceOverview<'response'>[] = [];

    @state()
    filteredDeviceOverviews: DeviceServiceTypes.DeviceOverview<'response'>[] =
        [];

    constructor() {
        super();
        this.initialize()
            .catch((error) => console.error(error))
            .finally(() => {
                this.isReady = true;
            });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    private async initialize() {
        this.deviceOverviews = await apiClient.listDevices();
        this.filteredDeviceOverviews = this.deviceOverviews;
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
                    <apitool-device-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<DeviceFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-device-list-view-filter>
                    ${this.filteredDeviceOverviews.map(
                        (deviceOverview) =>
                            html`<apitool-device-list-view-item
                                @delete-device=${this.deleteDevice}
                                .deviceOverview=${deviceOverview}
                            ></apitool-device-list-view-item>`
                    )}
                </div>
                <div
                    class="flex w-full justify-center p-2 sticky bottom-0 left-0 bg-white border-t border-black"
                >
                    <button
                        class="bg-green-300 p-2 rounded-full"
                        @click=${() => this.createDevice()}
                    >
                        + Add Device
                    </button>
                </div>
            </div>`;
    }

    private filter(filterOptions: DeviceFilterOptions) {
        this.filteredDeviceOverviews = this.deviceOverviews
            .filter((deviceOverview) => {
                if (
                    deviceOverview.name
                        .toLowerCase()
                        .includes(filterOptions.name.toLowerCase()) &&
                    deviceOverview.url
                        .toLowerCase()
                        .includes(filterOptions.url.toLowerCase())
                )
                    return true;
                else return false;
            })
            .filter((deviceOverview) => {
                switch (deviceOverview.type) {
                    case 'device':
                        return filterOptions.type.device;
                    case 'group':
                        return filterOptions.type.group;
                    case 'edge instantiable':
                        return filterOptions.type['edge instantiable'];
                    case 'cloud instantiable':
                        return filterOptions.type['cloud instantiable'];
                }
            });
    }

    private createDevice() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/device_creation',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private async deleteDevice(event: CustomEvent<string>) {
        await apiClient.deleteDevice(event.detail);
        this.deviceOverviews = this.deviceOverviews.filter(
            (deviceOverview) => deviceOverview.url !== event.detail
        );
        this.filteredDeviceOverviews = this.filteredDeviceOverviews.filter(
            (deviceOverview) => deviceOverview.url !== event.detail
        );
    }
}
