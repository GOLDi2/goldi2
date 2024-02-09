import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DeviceServiceTypes } from '@cross-lab-project/api-client';

@customElement('apitool-device-list-view-item')
export class DeviceListViewItem extends LitElement {
    @property({ type: Object })
    deviceOverview!: DeviceServiceTypes.DeviceOverview<'response'>;

    @property({ type: Boolean })
    editable: boolean = true;

    @property({ type: Boolean })
    deletable: boolean = true;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.deviceOverview.name + ' : ' + this.deviceOverview.url}
            .titleAlign=${'left'}
            class="flex p-2 border-2 border-black rounded-lg bg-slate-300 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            ${this.renderTypeBadge()}
            <div class="bg-slate-100 rounded-lg w-full p-2">
                ${this.renderInformation()}
                <div class="flex flex-row gap-2">
                    <button
                        @click=${this.editDevice}
                        ?hidden=${!this.editable}
                        class="mt-2 w-full justify-center bg-slate-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-slate-700 active:bg-slate-800"
                    >
                        Edit
                    </button>
                    <button
                        @click=${this.deleteDevice}
                        ?hidden=${!this.deletable}
                        class="mt-2 w-full justify-center bg-red-600 text-gray-50 p-2 rounded-lg ml-auto flex hover:cursor-pointer hover:bg-red-700 active:bg-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </apitool-collapsable-element>`;
    }

    private renderInformation() {
        return html`<div class="flex flex-col">
            <div class="flex">
                <p class="w-28 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.deviceOverview.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Owner:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.deviceOverview.owner}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Type:</p>
                <p>${this.deviceOverview.type}</p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Name:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.deviceOverview.name}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Description:</p>
                <p class="overflow-hidden text-ellipsis">
                    ${this.deviceOverview.description}
                </p>
            </div>
            <div class="flex">
                <p class="w-28 flex-shrink-0">Is Public:</p>
                <p>${this.deviceOverview.isPublic}</p>
            </div>
        </div>`;
    }

    private renderTypeBadge() {
        switch (this.deviceOverview.type) {
            case 'cloud instantiable':
                return this.renderBadge('cloud instantiable', 'bg-orange-300');
            case 'device':
                return this.renderBadge('device', 'bg-blue-300');
            case 'edge instantiable':
                return this.renderBadge('edge instantiable', 'bg-green-300');
            case 'group':
                return this.renderBadge('group', 'bg-red-300');
            default:
                return this.renderBadge('unknown', 'bg-gray-100');
        }
    }

    private renderBadge(status: string, color: string) {
        return html`
            <p
                slot="pre-title"
                class="p-1 rounded-lg ${color} mr-2 w-36 flex justify-center flex-shrink-0"
            >
                ${status}
            </p>
        `;
    }

    private async editDevice() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/devices/' + this.deviceOverview.url.split('/').at(-1),
            bubbles: true,
        });

        this.dispatchEvent(event);
    }

    private async deleteDevice() {
        const event = new CustomEvent<string>('delete-device', {
            detail: this.deviceOverview.url,
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
