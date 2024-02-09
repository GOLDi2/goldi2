import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

export type DeviceFilterOptions = {
    name: string;
    url: string;
    type: {
        device: boolean;
        group: boolean;
        'edge instantiable': boolean;
        'cloud instantiable': boolean;
    };
};

@customElement('apitool-device-list-view-filter')
export class DeviceListViewFilter extends LitElement {
    @state()
    isOpen: boolean = false;

    @query('#name-filter')
    nameFilter!: HTMLInputElement;

    @query('#url-filter')
    urlFilter!: HTMLInputElement;

    @query('#type-filter-device')
    typeFilterDevice!: HTMLInputElement;

    @query('#type-filter-group')
    typeFilterGroup!: HTMLInputElement;

    @query('#type-filter-edge-instantiable')
    typeFilterEdgeInstantiable!: HTMLInputElement;

    @query('#type-filter-cloud-instantiable')
    typeFilterCloudInstantiable!: HTMLInputElement;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Filters'}
            class="bg-slate-300 rounded-lg p-2 flex flex-col border-2 border-black ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)]"
        >
            <div class="w-full flex flex-col gap-1">
                <input
                    id="url-filter"
                    type="text"
                    placeholder="URL"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${this.updateFilters}
                />
                <input
                    id="name-filter"
                    type="text"
                    placeholder="Name"
                    class="p-2 rounded-lg mb-1 border-2 border-black"
                    @input=${() => this.updateFilters()}
                />
                <div
                    class="w-full p-2 border-2 border-black rounded-lg flex flex-col items-center bg-slate-100"
                >
                    <p class="w-full text-center font-semibold">Type</p>
                    <table>
                        <tr>
                            <td class="pr-4">
                                <label for="type-filter-device"
                                    >Concrete Device</label
                                >
                            </td>
                            <td>
                                <input
                                    id="type-filter-device"
                                    type="checkbox"
                                    class="ml-auto"
                                    checked
                                    @input=${() => this.updateFilters()}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="type-filter-group"
                                    >Device Group</label
                                >
                            </td>
                            <td>
                                <input
                                    id="type-filter-group"
                                    type="checkbox"
                                    class="ml-auto"
                                    class="ml-auto"
                                    checked
                                    @input=${() => this.updateFilters()}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="type-filter-edge-instantiable"
                                    >Edge Instantiable</label
                                >
                            </td>
                            <td>
                                <input
                                    id="type-filter-edge-instantiable"
                                    type="checkbox"
                                    class="ml-auto"
                                    checked
                                    @input=${() => this.updateFilters()}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="pr-4">
                                <label for="type-filter-cloud-instantiable"
                                    >Cloud Instantiable</label
                                >
                            </td>
                            <td>
                                <input
                                    id="type-filter-cloud-instantiable"
                                    type="checkbox"
                                    class="ml-auto"
                                    checked
                                    @input=${() => this.updateFilters()}
                                />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </apitool-collapsable-element>`;
    }

    private toggleOpen() {
        this.isOpen = !this.isOpen;
    }

    private updateFilters() {
        const event = new CustomEvent<DeviceFilterOptions>('filters-updated', {
            detail: {
                name: this.nameFilter.value,
                url: this.urlFilter.value,
                type: {
                    device: this.typeFilterDevice.checked,
                    group: this.typeFilterGroup.checked,
                    'edge instantiable':
                        this.typeFilterEdgeInstantiable.checked,
                    'cloud instantiable':
                        this.typeFilterCloudInstantiable.checked,
                },
            },
        });

        this.dispatchEvent(event);
    }
}
