import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { AutoResizeTextArea, Editor } from '../common';

@customElement('apitool-template-editor')
export class TemplateEditor extends LitElement {
    @property({ type: Object })
    template!: ExperimentServiceTypes.Template<'response'>;

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
            .type=${'editor'}
            @update-resource=${this.updateTemplate}
            @delete-resource=${this.deleteTemplate}
            @cancel=${this.cancel}
        >
            <div class="flex">
                <p class="w-20 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.template.url}
                </p>
            </div>
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
                    .classes=${'p-2 border'}
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
                    event: CustomEvent<ExperimentServiceTypes.Device[]>
                ) => {
                    this.template.configuration.devices = event.detail;
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

    private async updateTemplate() {
        console.log('trying to update template:', this.template);
        try {
            const updatedTemplate = await apiClient.updateTemplate(
                this.template.url,
                this.template
            );

            this.editor.messageField.addMessage(
                'success',
                'Template updated successfully!'
            );

            this.template = updatedTemplate;
            this.inputName.value = updatedTemplate.name;
            this.inputDescription.value = updatedTemplate.description ?? '';
            console.log('template updated successfully:', updatedTemplate);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private async deleteTemplate() {
        console.log('trying to delete template:', this.template.url);
        try {
            await apiClient.deleteTemplate(this.template.url);

            history.pushState({}, '', '/templates');

            const event = new CustomEvent<string>('update-view', {
                detail: '/templates',
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Template deleted successfully!'
            );
            console.log('template deleted successfully');
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
