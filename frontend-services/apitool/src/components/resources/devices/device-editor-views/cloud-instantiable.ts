import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { DeviceEditor } from '../device-editor';

@customElement('apitool-device-editor-cloud-instantiable')
export class DeviceEditorCloudInstantiable extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.InstantiableCloudDevice<'response'>;

    @property({ type: Object })
    parent!: DeviceEditor;

    @query('#input-instantiate-url')
    inputInstantiateUrl!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col gap-2 mb-2">
            <div class="flex flex-col">
                <p>Instantiate URL:</p>
                <input
                    id="input-instantiate-url"
                    class="w-full p-2 resize-none border rounded-lg"
                    type="text"
                    value=${this.device.instantiateUrl ?? ''}
                    @input=${this.updateInstantiateUrl}
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

    private updateInstantiateUrl() {
        const updateInstantiateUrlEvent = new CustomEvent<string>(
            'update-instantiate-url',
            {
                detail: this.inputInstantiateUrl.value,
                bubbles: true,
            }
        );
        this.dispatchEvent(updateInstantiateUrlEvent);
    }
}
