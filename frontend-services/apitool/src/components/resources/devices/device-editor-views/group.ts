import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DeviceEditor } from '../device-editor';

@customElement('apitool-device-editor-device-group')
export class DeviceEditorDeviceGroup extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.DeviceGroup<'response'>;

    @property({ type: Object })
    parent!: DeviceEditor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col gap-2 mb-2">
            <apitool-device-list
                .devices=${this.device.devices}
                .parent=${this.parent}
            ></apitool-device-list>
        </div>`;
    }
}
