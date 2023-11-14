import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { AutoResizeTextArea } from './auto-resize-textarea';

@customElement('apitool-role-list-item')
export class RoleListItem extends LitElement {
    @property({ type: Object })
    roleItem!: ExperimentServiceTypes.Role;

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @query('#input-name')
    inputName!: HTMLInputElement;

    @query('#input-description')
    inputDescription!: AutoResizeTextArea;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.roleItem.name || 'undefined'}
            .parent=${this.parent}
            .isOpen=${this.shouldOpen}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <p>Name:</p>
                    <input
                        id="input-name"
                        type="text"
                        value=${this.roleItem.name}
                        class="p-2 border rounded-lg"
                        @input=${this.updateRole}
                    />
                </div>
                <div class="flex flex-col">
                    <p>Description:</p>
                    <apitool-auto-resize-textarea
                        id="input-description"
                        .parent=${this.parent}
                        .value=${this.roleItem.description ?? ''}
                        .classes=${'p-2 border'}
                        @input=${this.updateRole}
                    >
                    </apitool-auto-resize-textarea>
                </div>
                <button
                    class="rounded-lg bg-red-600 text-gray-50 hover:bg-red-700 active:bg-red-800 w-full p-2 mt-2"
                    @click=${this.deleteRole}
                >
                    Delete
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private updateRole() {
        const updateRoleEvent = new CustomEvent<ExperimentServiceTypes.Role>(
            'update-role',
            {
                detail: {
                    name: this.inputName.value,
                    description: this.inputDescription.value,
                },
            }
        );
        this.dispatchEvent(updateRoleEvent);
    }

    private deleteRole() {
        const deleteRoleEvent = new CustomEvent('delete-role');
        this.dispatchEvent(deleteRoleEvent);
    }
}
