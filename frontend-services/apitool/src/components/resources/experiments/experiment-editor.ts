import {
    DeviceServiceTypes,
    ExperimentServiceTypes,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { parseDate } from '../helper';
import { apiClient } from '../../../globals';
import { Editor } from '../common';

@customElement('apitool-experiment-editor')
export class ExperimentEditor extends LitElement {
    @property({ type: Object })
    experiment!: ExperimentServiceTypes.Experiment<'response'>;

    @state()
    deviceItems: (ExperimentServiceTypes.Device & {
        roleIndex: number;
    })[] = [];

    @state()
    serviceConfigurationItems: (ExperimentServiceTypes.ServiceConfiguration & {
        participants: (ExperimentServiceTypes.Participant & {
            roleIndex: number;
        })[];
    })[] = [];

    @query('#select-status')
    selectStatus!: HTMLSelectElement;

    @query('#input-start-time')
    inputStartTime!: HTMLInputElement;

    @query('#input-end-time')
    inputEndTime!: HTMLInputElement;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'editor'}
            @update-resource=${this.updateExperiment}
            @delete-resource=${this.deleteExperiment}
            @cancel=${this.cancel}
        >
            <div class="flex">
                <p class="w-20 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.experiment.url}
                </p>
            </div>
            <div class="flex items-center">
                <p class="w-20 flex-shrink-0">Status:</p>
                <select
                    id="select-status"
                    class="p-2 bg-white border rounded-lg"
                    @change=${() => {
                        this.experiment.status = this.selectStatus
                            .value as typeof this.experiment.status;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                >
                    <option ?selected=${this.experiment.status === 'created'}>
                        created
                    </option>
                    <option ?selected=${this.experiment.status === 'booked'}>
                        booked
                    </option>
                    <option
                        ?selected=${this.experiment.status === 'setup' ||
                        this.experiment.status === 'running'}
                    >
                        running
                    </option>
                    <option ?selected=${this.experiment.status === 'finished'}>
                        finished
                    </option>
                </select>
            </div>
            <div class="flex flex-col">
                <p>Start Time:</p>
                <input
                    id="input-start-time"
                    type="datetime-local"
                    value=${this.experiment.bookingTime?.startTime
                        ? parseDate(this.experiment.bookingTime.startTime)
                        : ''}
                    class="p-2 rounded-lg bg-white border"
                    @input=${() => {
                        this.editor.messageField.removeAllSuccessMessages();
                        try {
                            this.experiment.bookingTime = {
                                startTime: new Date(
                                    this.inputStartTime.value
                                ).toISOString(),
                                endTime: this.experiment.bookingTime?.endTime,
                            };
                            this.inputStartTime.style.borderColor = '';
                            this.editor.messageField.removeMessageWithId(
                                'invalid-start-time'
                            );
                        } catch {
                            this.inputStartTime.style.borderColor = 'red';
                            this.editor.messageField.addMessage(
                                'error',
                                'Invalid Start Time!',
                                'invalid-start-time'
                            );
                        }
                    }}
                />
            </div>
            <div class="flex flex-col">
                <p>End Time:</p>
                <input
                    id="input-end-time"
                    type="datetime-local"
                    value=${this.experiment.bookingTime?.endTime
                        ? parseDate(this.experiment.bookingTime.endTime)
                        : ''}
                    class="p-2 rounded-lg bg-white border"
                    @input=${() => {
                        this.editor.messageField.removeAllSuccessMessages();
                        try {
                            this.experiment.bookingTime = {
                                startTime:
                                    this.experiment.bookingTime?.startTime,
                                endTime: new Date(
                                    this.inputEndTime.value
                                ).toISOString(),
                            };
                            this.inputEndTime.style.borderColor = '';
                            this.editor.messageField.removeMessageWithId(
                                'invalid-end-time'
                            );
                        } catch {
                            this.inputEndTime.style.borderColor = 'red';
                            this.editor.messageField.addMessage(
                                'error',
                                'Invalid End Time!',
                                'invalid-end-time'
                            );
                        }
                    }}
                />
            </div>
            <apitool-device-list
                .devices=${this.experiment.devices.map((device) => {
                    return { url: device.device, role: device.role };
                })}
                .parent=${this}
                .possibleRoles=${[...this.experiment.roles]}
                @update-devices=${(
                    event: CustomEvent<
                        (DeviceServiceTypes.DeviceReference & {
                            role?: string;
                        })[]
                    >
                ) => {
                    this.experiment.devices = event.detail.map((device) => {
                        return {
                            device: device.url,
                            role: device.role ?? '',
                        };
                    });
                    this.requestUpdate();
                }}
            ></apitool-device-list>
            <apitool-role-list
                .parent=${this}
                .roles=${[...this.experiment.roles]}
                @update-roles=${(
                    event: CustomEvent<ExperimentServiceTypes.Role[]>
                ) => {
                    this.experiment.roles = event.detail;
                    this.requestUpdate();
                }}
            ></apitool-role-list>
            <apitool-service-configuration-list
                .parent=${this}
                .serviceConfigurations=${[
                    ...this.experiment.serviceConfigurations,
                ]}
                .possibleRoles=${[...this.experiment.roles]}
                @update-service-configurations=${(
                    event: CustomEvent<
                        ExperimentServiceTypes.ServiceConfiguration[]
                    >
                ) => {
                    this.experiment.serviceConfigurations = event.detail;
                    this.requestUpdate();
                }}
            ></apitool-service-configuration-list>
            <apitool-connection-list
                .connectionUrls=${this.experiment.connections}
                .parent=${this}
            ></apitool-connection-list>
        </apitool-editor>`;
    }

    private async updateExperiment() {
        console.log('trying to update experiment:', this.experiment);
        try {
            const updatedExperiment = await apiClient.updateExperiment(
                this.experiment.url,
                {
                    ...this.experiment,
                    status:
                        this.experiment.status === 'setup'
                            ? 'running'
                            : this.experiment.status,
                }
            );

            this.editor.messageField.addMessage(
                'success',
                'Experiment updated successfully!'
            );

            this.experiment = updatedExperiment;
            console.log('experiment updated successfully:', updatedExperiment);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private async deleteExperiment() {
        console.log('trying to delete experiment:', this.experiment.url);
        try {
            await apiClient.deleteExperiment(this.experiment.url);

            history.pushState({}, '', '/experiments');

            const event = new CustomEvent<string>('update-view', {
                detail: '/experiments',
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Experiment deleted successfully!'
            );
            console.log('experiment deleted successfully');
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private cancel() {
        history.pushState({}, '', '/experiments');

        const event = new CustomEvent<string>('update-view', {
            detail: '/experiments',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
