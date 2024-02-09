import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('apitool-service-list-item')
export class ServiceListItem extends LitElement {
    @property({ type: Object })
    service!: DeviceServiceTypes.ServiceDescription;

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @query('#input-service-id')
    inputServiceId!: HTMLInputElement;

    @query('#input-service-type')
    inputServiceType!: HTMLInputElement;

    @query('#select-service-direction')
    selectServiceDirection!: HTMLSelectElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${(this.service.serviceId || 'undefined') +
            ' : ' +
            (this.service.serviceType || 'undefined') +
            ' : ' +
            (this.service.serviceDirection || 'undefined')}
            .parent=${this.parent}
            .isOpen=${this.shouldOpen}
            class="flex p-2 bg-white border rounded-lg"
            ><div class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <p>Service Id:</p>
                    <input
                        id="input-service-id"
                        type="text"
                        value=${this.service.serviceId ?? ''}
                        class="p-2 rounded-lg border"
                        @input=${this.updateService}
                    />
                </div>
                <div class="flex flex-col">
                    <p>Service Type:</p>
                    <input
                        id="input-service-type"
                        type="text"
                        value=${this.service.serviceType ?? ''}
                        class="p-2 rounded-lg border"
                        @input=${this.updateService}
                    />
                </div>
                <div class="flex items-center">
                    <p class="w-36 flex-shrink-0">Service Direction:</p>
                    <select
                        id="select-service-direction"
                        class="p-2 rounded-lg border bg-white"
                        @change=${this.updateService}
                    >
                        <option
                            value="consumer"
                            ?selected=${this.service.serviceDirection ===
                            'consumer'}
                        >
                            consumer
                        </option>
                        <option
                            value="producer"
                            ?selected=${this.service.serviceDirection ===
                            'producer'}
                        >
                            producer
                        </option>
                        <option
                            value="prosumer"
                            ?selected=${this.service.serviceDirection ===
                            'prosumer'}
                        >
                            prosumer
                        </option>
                    </select>
                </div>
                <button
                    @click=${this.deleteService}
                    class="rounded-lg bg-red-600 text-gray-50 hover:bg-red-700 active:bg-red-800 w-full p-2 mt-2"
                >
                    Delete
                </button>
            </div></apitool-collapsable-element
        >`;
    }

    private updateService() {
        if (
            this.selectServiceDirection.value !== 'consumer' &&
            this.selectServiceDirection.value !== 'producer' &&
            this.selectServiceDirection.value !== 'prosumer'
        )
            return;

        const updateParticipantEvent =
            new CustomEvent<DeviceServiceTypes.ServiceDescription>(
                'update-service',
                {
                    detail: {
                        serviceId: this.inputServiceId.value,
                        serviceType: this.inputServiceType.value,
                        serviceDirection: this.selectServiceDirection.value,
                    },
                }
            );
        this.dispatchEvent(updateParticipantEvent);
    }

    private deleteService() {
        const deleteServiceEvent = new CustomEvent('delete-service');
        this.dispatchEvent(deleteServiceEvent);
    }
}
