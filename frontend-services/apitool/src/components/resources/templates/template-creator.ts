import {
    DeviceServiceTypes,
    ExperimentServiceTypes,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { AutoResizeTextArea, Editor } from '../common';

@customElement('apitool-template-creator')
export class TemplateCreator extends LitElement {
    @state()
    template: ExperimentServiceTypes.Template<'request'> = {
        name: '',
        description: '',
        configuration: {
            devices: [],
            roles: [],
            serviceConfigurations: [],
        },
    };

    @query('#input-name')
    inputName!: HTMLInputElement;

    @query('#input-description')
    inputDescription!: AutoResizeTextArea;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'creator'}
            @create-resource=${this.createTemplate}
            @cancel=${this.cancel}
        >
            <div class="flex flex-col">
                <p>Name:</p>
                <input
                    id="input-name"
                    class="w-full p-2 resize-none border rounded-lg"
                    type="text"
                    value=${this.template.name}
                    @input=${() => {
                        this.template.name = this.inputName.value;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                />
            </div>
            <div class="flex flex-col">
                <p>Description:</p>
                <apitool-auto-resize-textarea
                    id="input-description"
                    .parent=${this}
                    .classes=${'p-[calc(0.5rem_+_1px)] border'}
                    .value=${this.template.description ?? ''}
                    @update-value=${() => {
                        this.template.description = this.inputDescription.value;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                ></apitool-auto-resize-textarea>
            </div>
            <apitool-device-list
                .devices=${this.template.configuration.devices.map((device) => {
                    return { url: device.device, role: device.role };
                })}
                .parent=${this}
                .possibleRoles=${[...this.template.configuration.roles]}
                @update-devices=${(
                    event: CustomEvent<
                        (DeviceServiceTypes.DeviceReference & {
                            role?: string;
                        })[]
                    >
                ) => {
                    this.template.configuration.devices = event.detail.map(
                        (device) => {
                            return {
                                device: device.url,
                                role: device.role ?? '',
                            };
                        }
                    );
                    this.editor.messageField.removeAllSuccessMessages();
                    this.requestUpdate();
                }}
            ></apitool-device-list>
            <apitool-role-list
                .parent=${this}
                .roles=${[...this.template.configuration.roles]}
                @update-roles=${(
                    event: CustomEvent<ExperimentServiceTypes.Role[]>
                ) => {
                    this.template.configuration.roles = event.detail;
                    this.editor.messageField.removeAllSuccessMessages();
                    this.requestUpdate();
                }}
            ></apitool-role-list>
            <apitool-service-configuration-list
                .parent=${this}
                .serviceConfigurations=${[
                    ...this.template.configuration.serviceConfigurations,
                ]}
                .possibleRoles=${[...this.template.configuration.roles]}
                @update-service-configurations=${(
                    event: CustomEvent<
                        ExperimentServiceTypes.ServiceConfiguration[]
                    >
                ) => {
                    this.template.configuration.serviceConfigurations =
                        event.detail;
                    this.editor.messageField.removeAllSuccessMessages();
                    this.requestUpdate();
                }}
            ></apitool-service-configuration-list>
        </apitool-editor>`;
    }

    private async createTemplate() {
        console.log('trying to create template:', this.template);
        try {
            const createdTemplate = await apiClient.createTemplate(
                this.template
            );

            const newUrl =
                '/templates/' + createdTemplate.url.split('/').at(-1);

            history.pushState({}, '', newUrl);

            const event = new CustomEvent<string>('update-view', {
                detail: newUrl,
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Template created successfully!'
            );
            console.log('template created successfully:', createdTemplate);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private cancel() {
        history.pushState({}, '', '/templates');

        const event = new CustomEvent<string>('update-view', {
            detail: '/templates',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
