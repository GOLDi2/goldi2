import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { AutoResizeTextArea } from './auto-resize-textarea';
import { ParticipantList } from './participant-list';

@customElement('apitool-service-configuration-list-item')
export class ServiceConfigurationListItem extends LitElement {
    @property({ type: Object })
    serviceConfiguration!: ExperimentServiceTypes.ServiceConfiguration;

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @property({ type: Array })
    possibleRoles!: ExperimentServiceTypes.Role[];

    @query('#input-service-type')
    inputServiceType!: HTMLInputElement;

    @query('#input-configuration')
    inputConfiguration!: AutoResizeTextArea;

    @query('apitool-participant-list')
    participantList!: ParticipantList;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.serviceConfiguration.serviceType || 'undefined'}
            .parent=${this.parent}
            .isOpen=${this.shouldOpen}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <p>Service Type:</p>
                    <input
                        id="input-service-type"
                        type="text"
                        value=${this.serviceConfiguration.serviceType ?? ''}
                        class="p-2 border rounded-lg"
                        @input=${this.updateServiceConfiguration}
                    />
                </div>
                <div class="flex flex-col">
                    <p>Configuration:</p>
                    <apitool-auto-resize-json-editor
                        id="input-configuration"
                        .value=${JSON.stringify(
                            this.serviceConfiguration.configuration ?? {},
                            null,
                            '\t'
                        )}
                        @update-value=${this.updateServiceConfiguration}
                        class="rounded-lg border"
                    ></apitool-auto-resize-json-editor>
                </div>
                <apitool-participant-list
                    .parent=${this.parent}
                    .participants=${this.serviceConfiguration.participants ??
                    []}
                    .possibleRoles=${this.possibleRoles}
                    @update-participants=${(
                        event: CustomEvent<ExperimentServiceTypes.Participant[]>
                    ) => {
                        this.serviceConfiguration.participants = [
                            ...event.detail,
                        ];
                        this.requestUpdate();
                    }}
                ></apitool-participant-list>
                <button
                    @click=${this.deleteServiceConfiguration}
                    class="rounded-lg bg-red-600 text-gray-50 hover:bg-red-700 active:bg-red-800 w-full p-2 mt-2"
                >
                    Delete
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private updateServiceConfiguration() {
        let newConfiguration;

        try {
            newConfiguration = JSON.parse(this.inputConfiguration.value);
        } catch {
            newConfiguration = this.serviceConfiguration.configuration;
        }

        const updateServiceConfigurationEvent =
            new CustomEvent<ExperimentServiceTypes.ServiceConfiguration>(
                'update-service-configuration',
                {
                    detail: {
                        serviceType: this.inputServiceType.value,
                        configuration: newConfiguration,
                        participants: this.participantList.participants,
                    },
                }
            );
        this.dispatchEvent(updateServiceConfigurationEvent);
    }

    private deleteServiceConfiguration() {
        const deleteServiceConfigurationEvent = new CustomEvent(
            'delete-service-configuration'
        );
        this.dispatchEvent(deleteServiceConfigurationEvent);
    }
}
