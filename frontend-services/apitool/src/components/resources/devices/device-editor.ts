import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { AutoResizeTextArea, Editor } from '../common';

@customElement('apitool-device-editor')
export class DeviceEditor extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.Device<'response'>;

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
            .type=${'editor'}
            @update-resource=${this.updateDevice}
            @delete-resource=${this.deleteDevice}
            @cancel=${this.cancel}
        >
            <div class="flex flex-col gap-2">
                <div class="flex">
                    <p class="w-28 flex-shrink-0">URL:</p>
                    <p class="overflow-hidden whitespace-nowrap text-ellipsis">
                        ${this.device.url}
                    </p>
                </div>
                <div class="flex">
                    <p class="w-28 flex-shrink-0">Owner:</p>
                    <p class="overflow-hidden whitespace-nowrap text-ellipsis">
                        ${this.device.owner}
                    </p>
                </div>
                <div class="flex">
                    <p class="w-28">Type:</p>
                    <p>${this.device.type}</p>
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
                    <p class="w-28">Is Public:</p>
                    <input
                        id="input-is-public"
                        type="checkbox"
                        ?checked=${this.device.isPublic}
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
                return html`<apitool-device-editor-concrete-device
                    .device=${this.device}
                    .parent=${this}
                    @update-services=${this.updateServices}
                ></apitool-device-editor-concrete-device>`;
            case 'group':
                return html`<apitool-device-editor-device-group
                    .device=${this.device}
                    .parent=${this}
                    @update-devices=${(
                        event: CustomEvent<DeviceServiceTypes.DeviceReference[]>
                    ) => {
                        this.device.devices = event.detail;
                    }}
                ></apitool-device-editor-device-group>`;
            case 'edge instantiable':
                return html`<apitool-device-editor-edge-instantiable
                    .device=${this.device}
                    .parent=${this}
                    @update-code-url=${(event: CustomEvent<string>) => {
                        this.device.codeUrl = event.detail;
                    }}
                    @update-services=${this.updateServices}
                ></apitool-device-editor-edge-instantiable>`;
            case 'cloud instantiable':
                return html`<apitool-device-editor-cloud-instantiable
                    .device=${this.device}
                    .parent=${this}
                    @update-instantiate-url=${(event: CustomEvent<string>) => {
                        this.device.instantiateUrl = event.detail;
                    }}
                    @update-services=${this.updateServices}
                ></apitool-device-editor-cloud-instantiable>`;
        }
    }

    private updateServices(
        event: CustomEvent<DeviceServiceTypes.ServiceDescription[]>
    ) {
        this.device.services = event.detail;
    }

    private async updateDevice() {
        console.log('trying to update device:', this.device);
        try {
            const updatedDevice = await apiClient.updateDevice(
                this.device.url,
                this.device
            );

            this.editor.messageField.addMessage(
                'success',
                'Device updated successfully!'
            );

            this.device = updatedDevice;
            console.log('device updated successfully:', updatedDevice);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private async deleteDevice() {
        console.log('trying to delete device:', this.device.url);
        try {
            await apiClient.deleteDevice(this.device.url);

            const event = new CustomEvent<string>('update-view', {
                detail: '/devices',
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Device deleted successfully!'
            );
            console.log('device deleted successfully');
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
