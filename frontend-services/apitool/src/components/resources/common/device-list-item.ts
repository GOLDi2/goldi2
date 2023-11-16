import {
    DeviceServiceTypes,
    ExperimentServiceTypes,
    UnsuccessfulRequestError,
} from '@cross-lab-project/api-client';
import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { renderLoadingScreen } from '../helper';
import { apiClient } from '../../../globals';

@customElement('apitool-device-list-item')
export class DeviceListItem extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.Device<'response'> | { url: string };

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Array })
    possibleRoles?: ExperimentServiceTypes.Role[];

    @property({ type: String })
    selectedRole?: string;

    @property({ type: Object })
    config?: DeviceServiceTypes.ConfiguredDeviceReference['config'];

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @property({ type: Boolean })
    removeable: boolean = true;

    @property({ type: String })
    titlePrefix: string = '';

    @query('#select-role')
    selectRole!: HTMLSelectElement;

    @state()
    resolvedDevice?: DeviceServiceTypes.Device<'response'> | { error: string };

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        if (!this.resolvedDevice)
            return html`<apitool-collapsable-element
                .title=${this.titlePrefix + this.device.url}
                .parent=${this.parent}
                .isOpen=${this.shouldOpen}
                class="rounded-lg flex flex-col bg-white border p-2"
            >
                <div class="rounded-lg overflow-hidden">
                    ${renderLoadingScreen(false)}
                </div>
                ${this.renderButtons()}
            </apitool-collapsable-element>`;
        else
            return html`<apitool-collapsable-element
                .title=${this.titlePrefix +
                (DeviceServiceTypes.isDevice(this.resolvedDevice, 'response')
                    ? this.resolvedDevice.name
                    : this.resolvedDevice.error)}
                .parent=${this.parent}
                .isOpen=${this.shouldOpen}
                class="flex flex-col bg-white rounded-lg p-2 border"
            >
                <div class="w-full flex">
                    <p class="w-28 flex-shrink-0">URL:</p>
                    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                        ${this.device.url}
                    </p>
                </div>
                ${DeviceServiceTypes.isDevice(this.resolvedDevice, 'response')
                    ? html`<div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Type:</p>
                              <p>${this.resolvedDevice.type}</p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Name:</p>
                              <p
                                  class="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                  ${this.resolvedDevice.name}
                              </p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Description:</p>
                              <p class="overflow-hidden text-ellipsis">
                                  ${this.resolvedDevice.description}
                              </p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Is Public:</p>
                              <p>${this.resolvedDevice.isPublic}</p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Owner:</p>
                              <p
                                  class="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                  ${this.resolvedDevice.owner}
                              </p>
                          </div>`
                    : ''}
                ${this.possibleRoles
                    ? html`<div class="w-full flex items-center">
                          <p class="w-28 flex-shrink-0">Role:</p>
                          <select
                              id="select-role"
                              class="bg-white p-2 border rounded-lg"
                              @change=${this.updateDeviceRole}
                          >
                              ${!this.possibleRoles.find(
                                  (role) => role.name === this.selectedRole
                              )
                                  ? html`<option
                                        value=${this.selectedRole ?? ''}
                                        selected
                                    >
                                        ${this.selectedRole}
                                    </option>`
                                  : ''}
                              ${map(
                                  this.possibleRoles,
                                  (role) =>
                                      html`<option
                                          value="${role.name}"
                                          ?selected=${this.selectedRole ===
                                          role.name}
                                      >
                                          ${role.name}
                                      </option>`
                              )}
                          </select>
                      </div>`
                    : ''}
                ${this.config
                    ? html` <apitool-collapsable-element
                          .title=${'Services'}
                          class="flex flex-col mt-2 border p-2 rounded-lg"
                      >
                          <div class="flex flex-col gap-2">
                              ${map(
                                  this.config.services,
                                  this.renderService.bind(this)
                              )}
                          </div>
                      </apitool-collapsable-element>`
                    : ''}
                ${this.renderButtons()}
            </apitool-collapsable-element>`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (DeviceServiceTypes.isDevice(this.device, 'response')) {
            this.resolvedDevice = this.device;
        } else {
            this.resolveDevice();
        }
    }

    private async resolveDevice() {
        try {
            this.resolvedDevice = await apiClient.getDevice(this.device.url);
        } catch (error) {
            if (error instanceof UnsuccessfulRequestError) {
                switch (error.response.status) {
                    case 404:
                        this.resolvedDevice = { error: 'Not Found' };
                        break;
                    default:
                        this.resolvedDevice = { error: 'Unresolvable' };
                }
            } else {
                this.resolvedDevice = { error: 'Unresolvable' };
            }
        }
        this.requestUpdate();
    }

    private renderService(
        service: DeviceServiceTypes.ServiceConfig<'response'>
    ) {
        const copiedService: Partial<
            DeviceServiceTypes.ServiceConfig<'response'>
        > = { ...service };

        delete copiedService.remoteServiceId;
        delete copiedService.serviceId;
        delete copiedService.serviceType;
        delete copiedService.isOpen;

        return html` <apitool-collapsable-element
            .title=${service.serviceId + ' / ' + service.remoteServiceId}
            class="w-full rounded-lg border p-2"
        >
            <div class="flex">
                <p class="w-36 flex-shrink-0">Service Type:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${service.serviceType}
                </p>
            </div>
            <div class="flex">
                <p class="w-36 flex-shrink-0">Service Id:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${service.serviceId}
                </p>
            </div>
            <div class="flex">
                <p class="w-36 flex-shrink-0">Remote Service Id:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${service.remoteServiceId}
                </p>
            </div>
            <apitool-collapsable-element
                .title=${'Additional Properties'}
                class="flex w-full rounded-lg border p-2"
            >
                <apitool-auto-resize-textarea
                    .editable=${false}
                    .parent=${this}
                    .value=${JSON.stringify(copiedService, null, 4)}
                ></apitool-auto-resize-textarea></apitool-collapsable-element
        ></apitool-collapsable-element>`;
    }

    private renderButtons() {
        return html` <div class="flex gap-2 mt-2">
            <a
                href=${(window.configuration.BASE_PATH ?? '') +
                '/devices/' +
                this.device.url.split('/').at(-1)}
                target="_blank"
                class="text-center p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
            >
                View
            </a>
            ${this.removeable
                ? html`<button
                      class="p-2 w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50"
                      @click=${() => this.removeDevice()}
                  >
                      Remove
                  </button>`
                : ''}
        </div>`;
    }

    private removeDevice() {
        const removeDeviceEvent = new CustomEvent('remove-device');
        this.dispatchEvent(removeDeviceEvent);
    }

    private async updateDeviceRole() {
        const updateDeviceRoleEvent = new CustomEvent<string>(
            'update-device-role',
            { detail: this.selectRole.value }
        );
        this.dispatchEvent(updateDeviceRoleEvent);
    }
}
