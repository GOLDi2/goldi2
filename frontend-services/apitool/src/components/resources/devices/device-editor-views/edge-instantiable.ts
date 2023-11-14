import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { DeviceEditor } from '../device-editor';

@customElement('apitool-device-editor-edge-instantiable')
export class DeviceEditorEdgeInstantiable extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.InstantiableBrowserDevice<'response'>;

    @property({ type: Object })
    parent!: DeviceEditor;

    @query('#input-code-url')
    inputCodeUrl!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col gap-2 mb-2">
            <div class="flex flex-col">
                <p>Code URL:</p>
                <input
                    id="input-code-url"
                    class="w-full p-2 resize-none border rounded-lg"
                    type="text"
                    value=${this.device.codeUrl ?? ''}
                    @input=${this.updateCodeUrl}
                />
            </div>
            <apitool-service-list
                .parent=${this.parent}
                .services=${this.device.services ?? []}
                @update-services=${(
                    event: CustomEvent<DeviceServiceTypes.ServiceDescription[]>
                ) => {
                    this.device.services = [...event.detail];
                    this.requestUpdate();
                }}
            ></apitool-service-list>
        </div>`;
    }

    private updateCodeUrl() {
        const updateCodeUrlEvent = new CustomEvent<string>('update-code-url', {
            detail: this.inputCodeUrl.value,
            bubbles: true,
        });
        this.dispatchEvent(updateCodeUrlEvent);
    }
}
