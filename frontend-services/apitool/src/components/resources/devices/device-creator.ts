import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { AutoResizeTextArea, Editor } from '../common';
import { apiClient } from '../../../globals';

@customElement('apitool-device-creator')
export class DeviceCreator extends LitElement {
    @state()
    device: DeviceServiceTypes.Device<'request'> = {
        type: 'device',
        name: '',
        description: '',
        isPublic: false,
        devices: [],
        services: [],
        codeUrl: '',
        instantiateUrl: '',
    };

    @query('#select-type')
    selectType!: HTMLSelectElement;

    @query('#input-name')
    inputName!: HTMLInputElement;

    @query('#input-description')
    inputDescription!: AutoResizeTextArea;

    @query('#input-is-public')
    inputIsPublic!: HTMLInputElement;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'creator'}
            @create-resource=${this.createDevice}
            @cancel=${this.cancel}
        >
            <div class="w-full flex flex-col gap-2">
                <div class="flex items-center">
                    <p class="w-20 flex-shrink-0">Type:</p>
                    <select
                        id="select-type"
                        class="bg-white p-2 rounded-lg border"
                        @change=${() => this.updateType()}
                    >
                        <option
                            ?selected=${this.device.type === 'device'}
                            value="device"
                        >
                            device
                        </option>
                        <option ?selected=${this.device.type === 'group'}>
                            group
                        </option>
                        <option
                            ?selected=${this.device.type ===
                            'edge instantiable'}
                        >
                            edge instantiable
                        </option>
                        <option
                            ?selected=${this.device.type ===
                            'cloud instantiable'}
                        >
                            cloud instantiable
                        </option>
                    </select>
                </div>
                <div class="flex flex-col">
                    <p>Name:</p>
                    <input
                        id="input-name"
                        class="w-full p-2 border rounded-lg"
                        type="text"
                        value=${this.device.name}
                        @input=${() => {
                            this.device.name = this.inputName.value;
                        }}
                    />
                </div>
                <div class="flex flex-col">
                    <p>Description:</p>
                    <apitool-auto-resize-textarea
                        id="input-description"
                        .value=${this.device.description ?? ''}
                        .parent=${this}
                        .classes=${'p-2 border'}
                        @update-value=${() => {
                            this.device.description =
                                this.inputDescription.value;
                        }}
                    >
                    </apitool-auto-resize-textarea>
                </div>
                <div class="flex">
                    <p class="w-20">Is Public:</p>
                    <input
                        id="input-is-public"
                        type="checkbox"
                        @change=${() => {
                            this.device.isPublic = this.inputIsPublic.checked;
                        }}
                    />
                </div>
            </div>
            ${this.renderDevice()}
            <apitool-message-field .parent=${this}></apitool-message-field>
        </apitool-editor>`;
    }

    private renderDevice() {
        switch (this.device.type) {
            case 'device':
                return html`<apitool-device-creator-concrete-device
                    .device=${this.device}
                    .parent=${this}
                    @update-services=${this.updateServices}
                ></apitool-device-creator-concrete-device>`;
            case 'group':
                return html`<apitool-device-creator-device-group
                    .device=${this.device}
                    .parent=${this}
                    @update-devices=${(
                        event: CustomEvent<DeviceServiceTypes.DeviceReference[]>
                    ) => {
                        this.device.devices = event.detail;
                    }}
                ></apitool-device-creator-device-group>`;
            case 'edge instantiable':
                return html`<apitool-device-creator-edge-instantiable
                    .device=${this.device}
                    .parent=${this}
                    @update-code-url=${(event: CustomEvent<string>) => {
                        this.device.codeUrl = event.detail;
                    }}
                    @update-services=${this.updateServices}
                ></apitool-device-creator-edge-instantiable>`;
            case 'cloud instantiable':
                return html`<apitool-device-creator-cloud-instantiable
                    .device=${this.device}
                    .parent=${this}
                    @update-instantiate-url=${(event: CustomEvent<string>) => {
                        this.device.instantiateUrl = event.detail;
                    }}
                    @update-services=${this.updateServices}
                ></apitool-device-creator-cloud-instantiable>`;
        }
    }

    private updateType() {
        if (
            this.selectType.value !== 'device' &&
            this.selectType.value !== 'group' &&
            this.selectType.value !== 'edge instantiable' &&
            this.selectType.value !== 'cloud instantiable'
        )
            throw new Error(
                `invalid device type selection: ${this.selectType.value}`
            );

        this.device.type = this.selectType.value;
        this.requestUpdate();
    }

    private updateServices(
        event: CustomEvent<DeviceServiceTypes.ServiceDescription[]>
    ) {
        this.device.services = event.detail;
    }

    private async createDevice() {
        const copiedDevice = { ...this.device };

        switch (this.device.type) {
            case 'device':
                delete copiedDevice.codeUrl;
                delete copiedDevice.devices;
                delete copiedDevice.instantiateUrl;
                break;
            case 'group':
                delete copiedDevice.codeUrl;
                delete copiedDevice.instantiateUrl;
                delete copiedDevice.services;
                break;
            case 'edge instantiable':
                delete copiedDevice.devices;
                delete copiedDevice.instantiateUrl;
                break;
            case 'cloud instantiable':
                delete copiedDevice.codeUrl;
                delete copiedDevice.devices;
                break;
        }

        console.log('trying to create device:', copiedDevice);
        try {
            const createdDevice = await apiClient.createDevice(copiedDevice);

            const newUrl = '/devices/' + createdDevice.url.split('/').at(-1);

            const event = new CustomEvent<string>('update-view', {
                detail: newUrl,
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Device created successfully!'
            );
            console.log('device created successfully:', createdDevice);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private cancel() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/devices',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
