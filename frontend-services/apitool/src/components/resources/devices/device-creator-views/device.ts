import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DeviceCreator } from '../device-creator';

@customElement('apitool-device-creator-concrete-device')
export class DeviceCreaotrConcreteDevice extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.ConcreteDevice<'request'>;

    @property({ type: Object })
    parent!: DeviceCreator;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col gap-2 mb-2">
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
}
