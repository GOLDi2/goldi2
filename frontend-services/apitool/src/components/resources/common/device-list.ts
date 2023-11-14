import {
    DeviceServiceTypes,
    ExperimentServiceTypes,
} from '@cross-lab-project/api-client';
import { LitElement, adoptStyles, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { apiClient } from '../../../globals';
import {
    renderSmallLoadingScreen,
    updateWithScrollCompensation,
} from '../helper';
import style from '../../../stylesheet.css';
import { when } from 'lit/directives/when.js';
const stylesheet = unsafeCSS(style);

@customElement('apitool-device-list')
export class DeviceList extends LitElement {
    @property({ type: Array })
    devices: (DeviceServiceTypes.DeviceReference & {
        config?: DeviceServiceTypes.ConfiguredDeviceReference['config'];
        role?: string;
    })[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Array })
    possibleRoles: ExperimentServiceTypes.Role[] = [];

    @property({ type: Boolean })
    editable: boolean = true;

    @query('#input-new-device-url')
    inputNewDeviceUrl!: HTMLInputElement;

    @state()
    addingDevice: boolean = false;

    @state()
    deviceItems: {
        url: string;
        role?: string;
        config?: DeviceServiceTypes.ConfiguredDeviceReference['config'];
        key: string;
        resolved?: DeviceServiceTypes.Device<'response'>;
        shouldOpen: boolean;
    }[] = [];

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Devices'}
            class="w-full flex flex-col bg-white p-2 rounded-lg border"
        >
            <div class="flex flex-col gap-2 rounded-lg">
                ${when(
                    this.editable,
                    () => html`<div
                        class="flex flex-col bg-white border gap-2 rounded-lg p-2"
                    >
                        <input
                            id="input-new-device-url"
                            type="text"
                            class="w-full border p-2 rounded-lg"
                            placeholder="Device URL"
                            @input=${() => this.handleInput()}
                        />

                        <div class="flex gap-2 rounded-lg relative">
                            <button
                                class="w-full bg-green-600 text-gray-50 p-2 rounded-lg hover:bg-green-700 active:bg-green-800"
                                @click=${() => this.addDevice()}
                            >
                                Add Device
                            </button>
                            <div
                                class="w-full h-full absolute opacity-50 ${this
                                    .addingDevice
                                    ? 'z-10'
                                    : '-z-10'}"
                            >
                                ${this.addingDevice
                                    ? renderSmallLoadingScreen(false)
                                    : ''}
                            </div>
                        </div>
                    </div>`
                )}
                ${repeat(
                    this.deviceItems,
                    (item) => item.key,
                    (item, index) => html`<apitool-device-list-item
                        .device=${item.resolved ?? item}
                        .possibleRoles=${this.possibleRoles}
                        .selectedRole=${item.role}
                        .shouldOpen=${item.shouldOpen}
                        .config=${item.config}
                        .removeable=${this.editable}
                        @remove-device=${() => this.deleteDevice(index)}
                        @update-device-role=${(event: CustomEvent<string>) =>
                            this.updateDeviceRole(index, event.detail)}
                    ></apitool-device-list-item>`
                )}
            </div>
        </apitool-collapsable-element>`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (this.shadowRoot) adoptStyles(this.shadowRoot, [stylesheet]);
        this.deviceItems = this.devices.map((device) => {
            return {
                url: device.url,
                key: crypto.randomUUID(),
                role: device.role,
                config: device.config,
                shouldOpen: false,
            };
        });
        this.deviceItems.forEach(async (deviceItem) => {
            const resolvedDevice = await apiClient.getDevice(deviceItem.url);
            deviceItem.resolved = resolvedDevice;
            this.requestUpdate();
        });
    }

    private async handleInput() {
        this.inputNewDeviceUrl.style.borderColor = '';
        this.inputNewDeviceUrl.value = this.inputNewDeviceUrl.value.replace(
            / /g,
            ''
        );
    }

    private async addDevice() {
        this.addingDevice = true;

        const device: (typeof this.deviceItems)[number] = {
            url: this.inputNewDeviceUrl.value,
            key: crypto.randomUUID(),
            shouldOpen: true,
        };
        this.deviceItems = [device, ...this.deviceItems];

        try {
            const resolvedDevice = await apiClient.getDevice(device.url);
            this.devices = [{ url: device.url }, ...this.devices];
            device.resolved = resolvedDevice;
            this.inputNewDeviceUrl.value = '';
            this.updateDevices();
            this.requestUpdate();
        } catch (error) {
            this.inputNewDeviceUrl.style.borderColor = 'red';
            this.deviceItems = this.deviceItems.slice(1);
        } finally {
            this.addingDevice = false;
        }
    }

    private async deleteDevice(index: number) {
        this.devices.splice(index, 1);
        this.deviceItems.splice(index, 1);
        this.updateDevices();
        await updateWithScrollCompensation(this, this.parent);
    }

    private updateDeviceRole(index: number, role: string) {
        this.devices[index].role = role;
        this.deviceItems[index].role = role;
        this.updateDevices();
    }

    private updateDevices() {
        const updateDevicesEvent = new CustomEvent<
            (DeviceServiceTypes.DeviceReference & {
                role?: string;
            })[]
        >('update-devices', {
            detail: this.devices,
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(updateDevicesEvent);
    }
}
