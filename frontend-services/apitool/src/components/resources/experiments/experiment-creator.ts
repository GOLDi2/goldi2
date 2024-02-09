import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { parseDate } from '../helper';
import { apiClient } from '../../../globals';
import { Editor } from '../common';

@customElement('apitool-experiment-creator')
export class ExperimentCreator extends LitElement {
    @state()
    experiment: ExperimentServiceTypes.Experiment<'request'> = {
        status: 'created',
        devices: [],
        roles: [],
        serviceConfigurations: [],
    };

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
            .type=${'creator'}
            @create-resource=${this.createExperiment}
            @cancel=${this.cancel}
        >
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
                        Created
                    </option>
                    <option ?selected=${this.experiment.status === 'booked'}>
                        Booked
                    </option>
                    <option ?selected=${this.experiment.status === 'running'}>
                        Running
                    </option>
                    <option ?selected=${this.experiment.status === 'finished'}>
                        Finished
                    </option>
                </select>
            </div>
            <div class="flex flex-col">
                <p>Start Time:</p>
                <input
                    id="input-start-time"
                    type="datetime-local"
                    value=${parseDate(Date.now())}
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
                    value=${parseDate(Date.now() + 1000 * 60 * 60)}
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
                    event: CustomEvent<ExperimentServiceTypes.Device[]>
                ) => {
                    this.experiment.devices = event.detail;
                    this.editor.messageField.removeAllSuccessMessages();
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
                    this.editor.messageField.removeAllSuccessMessages();
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
                    this.editor.messageField.removeAllSuccessMessages();
                    this.requestUpdate();
                }}
            ></apitool-service-configuration-list>
            <apitool-message-field .parent=${this}></apitool-message-field>
        </apitool-editor>`;
    }

    private async createExperiment() {
        console.log('trying to create experiment:', this.experiment);
        try {
            const createdExperiment = await apiClient.createExperiment(
                this.experiment
            );

            const newUrl =
                '/experiments/' + createdExperiment.url.split('/').at(-1);

            const event = new CustomEvent<string>('update-view', {
                detail: newUrl,
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Experiment created successfully!'
            );
            console.log('experiment created successfully:', createdExperiment);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private cancel() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/experiments',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
