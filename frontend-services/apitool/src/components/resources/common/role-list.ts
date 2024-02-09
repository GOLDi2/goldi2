import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('apitool-role-list')
export class RoleList extends LitElement {
    @property({ type: Array })
    roles: ExperimentServiceTypes.Role[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @state()
    roleItems: {
        value: ExperimentServiceTypes.Role;
        key: string;
        shouldOpen: boolean;
    }[] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.roleItems = this.roles.map((role) => {
            return {
                value: role,
                key: crypto.randomUUID(),
                shouldOpen: false,
            };
        });
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Roles'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
        >
            <div class="flex flex-col gap-2 items-center">
                ${repeat(
                    this.roleItems,
                    (item) => item.key,
                    (item, index) =>
                        html`<apitool-role-list-item
                            class="w-full"
                            .roleItem=${item.value}
                            .parent=${this.parent}
                            .shouldOpen=${item.shouldOpen}
                            @delete-role=${() => this.deleteRole(index)}
                            @update-role=${this.updateRole(index)}
                        ></apitool-role-list-item>`
                )}
                <button
                    @click=${this.addRole}
                    class="text-2xl bg-slate-600 text-gray-50 p-2 rounded-full hover:bg-slate-700 active:bg-slate-800 h-12 w-12"
                >
                    +
                </button>
            </div>
        </apitool-collapsable-element>`;
    }

    private addRole() {
        this.roles.push({ name: '', description: '' });
        this.roleItems.push({
            value: { name: '', description: '' },
            key: crypto.randomUUID(),
            shouldOpen: true,
        });
        const updateRolesEvent = new CustomEvent<ExperimentServiceTypes.Role[]>(
            'update-roles',
            {
                detail: this.roles,
            }
        );
        this.dispatchEvent(updateRolesEvent);
    }

    private updateRole(index: number) {
        return (event: CustomEvent<ExperimentServiceTypes.Role>) => {
            this.roles[index] = event.detail;
            this.roleItems[index].value = event.detail;
            const updateRolesEvent = new CustomEvent<
                ExperimentServiceTypes.Role[]
            >('update-roles', {
                detail: this.roles,
            });
            this.dispatchEvent(updateRolesEvent);
        };
    }

    private deleteRole(index: number) {
        this.roles.splice(index, 1);
        this.roleItems.splice(index, 1);
        const updateRolesEvent = new CustomEvent<ExperimentServiceTypes.Role[]>(
            'update-roles',
            {
                detail: this.roles,
            }
        );
        this.dispatchEvent(updateRolesEvent);
    }
}
