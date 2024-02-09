import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('apitool-service-configuration-list')
export class ServiceConfigurationList extends LitElement {
    @property({ type: Array })
    serviceConfigurations: ExperimentServiceTypes.ServiceConfiguration[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @state()
    serviceConfigurationItems: {
        value: ExperimentServiceTypes.ServiceConfiguration;
        key: string;
        shouldOpen: boolean;
    }[] = [];

    @property({ type: Array })
    possibleRoles!: ExperimentServiceTypes.Role[];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.serviceConfigurationItems = this.serviceConfigurations.map(
            (serviceConfiguration) => {
                return {
                    value: serviceConfiguration,
                    key: crypto.randomUUID(),
                    shouldOpen: false,
                };
            }
        );
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Service Configurations'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2 items-center">
                ${repeat(
                    this.serviceConfigurationItems,
                    (item) => item.key,
                    (item, index) =>
                        html`<apitool-service-configuration-list-item
                            .parent=${this.parent}
                            .serviceConfiguration=${item.value}
                            .possibleRoles=${this.possibleRoles}
                            .shouldOpen=${item.shouldOpen}
                            class="w-full"
                            @delete-service-configuration=${() =>
                                this.deleteServiceConfiguration(index)}
                            @update-service-configuration=${this.updateServiceConfiguration(
                                index
                            )}
                        ></apitool-service-configuration-list-item>`
                )}
                <button
                    @click=${this.addServiceConfiguration}
                    class="text-2xl bg-slate-600 text-gray-50 p-2 rounded-full hover:bg-slate-700 active:bg-slate-800 h-12 w-12"
                >
                    +
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private addServiceConfiguration() {
        this.serviceConfigurations.push({
            serviceType: '',
            configuration: {},
            participants: [],
        });
        this.serviceConfigurationItems.push({
            value: { serviceType: '', configuration: {}, participants: [] },
            key: crypto.randomUUID(),
            shouldOpen: true,
        });
        const updateServiceConfigurationsEvent = new CustomEvent<
            ExperimentServiceTypes.ServiceConfiguration[]
        >('update-service-configurations', {
            detail: this.serviceConfigurations,
        });
        this.dispatchEvent(updateServiceConfigurationsEvent);
    }

    private updateServiceConfiguration(index: number) {
        return (
            event: CustomEvent<ExperimentServiceTypes.ServiceConfiguration>
        ) => {
            this.serviceConfigurations[index] = event.detail;
            this.serviceConfigurationItems[index].value = event.detail;
            const updateServiceConfigurationsEvent = new CustomEvent<
                ExperimentServiceTypes.ServiceConfiguration[]
            >('update-service-configurations', {
                detail: this.serviceConfigurations,
            });
            this.dispatchEvent(updateServiceConfigurationsEvent);
        };
    }

    private deleteServiceConfiguration(index: number) {
        this.serviceConfigurations.splice(index, 1);
        this.serviceConfigurationItems.splice(index, 1);
        const updateServiceConfigurationsEvent = new CustomEvent<
            ExperimentServiceTypes.ServiceConfiguration[]
        >('update-service-configurations', {
            detail: this.serviceConfigurations,
        });
        this.dispatchEvent(updateServiceConfigurationsEvent);
    }
}
