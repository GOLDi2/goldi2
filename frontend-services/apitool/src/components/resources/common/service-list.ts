import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('apitool-service-list')
export class ServiceList extends LitElement {
    @property({ type: Array })
    services: DeviceServiceTypes.ServiceDescription[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @state()
    serviceItems: {
        value: DeviceServiceTypes.ServiceDescription;
        key: string;
        shouldOpen: boolean;
    }[] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.serviceItems = this.services.map((services) => {
            return {
                value: services,
                key: crypto.randomUUID(),
                shouldOpen: false,
            };
        });
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Services'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2 items-center">
                ${repeat(
                    this.serviceItems,
                    (item) => item.key,
                    (item, index) =>
                        html`<apitool-service-list-item
                            .parent=${this.parent}
                            .service=${item.value}
                            .shouldOpen=${item.shouldOpen}
                            class="w-full"
                            @delete-service=${() => this.deleteService(index)}
                            @update-service=${this.updateService(index)}
                        ></apitool-service-list-item>`
                )}
                <button
                    @click=${this.addService}
                    class="text-2xl bg-slate-600 text-gray-50 p-2 rounded-full hover:bg-slate-700 active:bg-slate-800 h-12 w-12"
                >
                    +
                </button>
            </div></apitool-collapsable-element
        >`;
    }

    private addService() {
        this.services.push({
            serviceId: '',
            serviceType: '',
            serviceDirection: 'consumer',
        });
        this.serviceItems.push({
            value: {
                serviceId: '',
                serviceType: '',
                serviceDirection: 'consumer',
            },
            key: crypto.randomUUID(),
            shouldOpen: true,
        });
        const updateServicesEvent = new CustomEvent<
            DeviceServiceTypes.ServiceDescription[]
        >('update-services', {
            detail: this.services,
        });
        this.dispatchEvent(updateServicesEvent);
    }

    private updateService(index: number) {
        return (event: CustomEvent<DeviceServiceTypes.ServiceDescription>) => {
            this.services[index] = event.detail;
            this.serviceItems[index].value = event.detail;
            const updateServicesEvent = new CustomEvent<
                DeviceServiceTypes.ServiceDescription[]
            >('update-services', {
                detail: this.services,
            });
            this.dispatchEvent(updateServicesEvent);
        };
    }

    private deleteService(index: number) {
        this.services.splice(index, 1);
        this.serviceItems.splice(index, 1);
        const updateServiceConfigurationsEvent = new CustomEvent<
            DeviceServiceTypes.ServiceDescription[]
        >('update-services', {
            detail: this.services,
        });
        this.dispatchEvent(updateServiceConfigurationsEvent);
    }
}
