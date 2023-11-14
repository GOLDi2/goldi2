import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { AutoResizeTextArea } from './auto-resize-textarea';

@customElement('apitool-participant-list-item')
export class ParticipantListItem extends LitElement {
    @property({ type: Object })
    participant!: ExperimentServiceTypes.Participant;

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @property({ type: Array })
    possibleRoles!: ExperimentServiceTypes.Role[];

    @query('#select-role')
    selectRole!: HTMLSelectElement;

    @query('#input-service-id')
    inputServiceId!: HTMLInputElement;

    @query('#input-configuration')
    inputConfiguration!: AutoResizeTextArea;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${(this.participant.role || 'undefined') +
            ' : ' +
            (this.participant.serviceId || 'undefined')}
            .parent=${this.parent}
            .isOpen=${this.shouldOpen}
            class="flex p-2 bg-white border rounded-lg"
            ><div class="flex flex-col gap-2">
                <div class="flex items-center">
                    <p class="w-20 flex-shrink-0">Role:</p>
                    <select
                        id="select-role"
                        class="p-2 border bg-white rounded-lg"
                        @change=${this.updateParticipant}
                    >
                        ${!this.possibleRoles.find(
                            (role) => role.name === this.participant.role
                        )
                            ? html`<option
                                  value=${this.participant.role ?? ''}
                                  selected
                              >
                                  ${this.participant.role}
                              </option>`
                            : ''}
                        ${map(
                            this.possibleRoles,
                            (role) =>
                                html`<option
                                    value=${role.name}
                                    ?selected=${this.participant.role ===
                                    role.name}
                                >
                                    ${role.name}
                                </option>`
                        )}
                    </select>
                </div>
                <div class="flex flex-col">
                    <p>Service Id:</p>
                    <input
                        id="input-service-id"
                        type="text"
                        value=${this.participant.serviceId ?? ''}
                        class="p-2 border rounded-lg"
                        @input=${this.updateParticipant}
                    />
                </div>
                <div class="flex flex-col">
                    <p>Configuration:</p>
                    <apitool-auto-resize-json-editor
                        id="input-configuration"
                        .value=${JSON.stringify(
                            this.participant.config ?? {},
                            null,
                            '\t'
                        )}
                        @update-value=${this.updateParticipant}
                        class="rounded-lg border"
                    ></apitool-auto-resize-json-editor>
                </div>
                <button
                    @click=${this.deleteParticipant}
                    class="rounded-lg bg-red-600 text-gray-50 hover:bg-red-700 active:bg-red-800 w-full p-2 mt-2"
                >
                    Delete
                </button>
            </div></apitool-collapsable-element
        >`;
    }

    private updateParticipant() {
        let newConfig;

        try {
            newConfig = JSON.parse(this.inputConfiguration.value);
        } catch {
            newConfig = this.participant.config;
        }

        const updateParticipantEvent =
            new CustomEvent<ExperimentServiceTypes.Participant>(
                'update-participant',
                {
                    detail: {
                        serviceId: this.inputServiceId.value,
                        config: newConfig,
                        role: this.selectRole.value,
                    },
                }
            );
        this.dispatchEvent(updateParticipantEvent);
    }

    private deleteParticipant() {
        const deleteParticipantEvent = new CustomEvent('delete-participant');
        this.dispatchEvent(deleteParticipantEvent);
    }
}
