import {
    DeviceServiceTypes,
    UnsuccessfulRequestError,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';

type ResolvedConnection =
    | DeviceServiceTypes.Peerconnection<'response'>
    | { error: string };
type ResolvedDevice = DeviceServiceTypes.Device<'response'> | { error: string };

@customElement('apitool-connection-list-item')
export class ConnectionListItem extends LitElement {
    @property({ type: String })
    connectionUrl!: string;

    @property({ type: Object })
    parent!: LitElement;

    @state()
    resolvedConnection?: ResolvedConnection;

    @state()
    resolvedDevices: [ResolvedDevice | undefined, ResolvedDevice | undefined] =
        [undefined, undefined];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.resolveConnection();
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.getTitle()}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
            ><div class="flex flex-col">
                <div class="flex">
                    <p class="w-20 flex-shrink-0">URL:</p>
                    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                        ${this.connectionUrl}
                    </p>
                </div>
                ${DeviceServiceTypes.isPeerconnection(
                    this.resolvedConnection,
                    'response'
                )
                    ? html` <div class="flex">
                              <p class="w-20 flex-shrink-0">Type:</p>
                              <p
                                  class="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                  ${this.resolvedConnection.type}
                              </p>
                          </div>
                          <div class="flex">
                              <p class="w-20 flex-shrink-0">Status:</p>
                              <p
                                  class="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                  ${this.resolvedConnection.status}
                              </p>
                          </div>
                          <apitool-device-list-item
                              .device=${this.resolvedConnection.devices[0]}
                              .config=${this.resolvedConnection.devices[0]
                                  .config}
                              .removeable=${false}
                              .titlePrefix=${'Device A : '}
                              class=${'mt-2'}
                          ></apitool-device-list-item>
                          <apitool-device-list-item
                              .device=${this.resolvedConnection.devices[1]}
                              .config=${this.resolvedConnection.devices[1]
                                  .config}
                              .removeable=${false}
                              .titlePrefix=${'Device B : '}
                              class=${'my-2'}
                          ></apitool-device-list-item>
                          <a
                              href=${(window.configuration.BASE_PATH ?? '') +
                              '/peerconnections/' +
                              this.resolvedConnection.url.split('/').at(-1)}
                              target="_blank"
                              class="text-center p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
                              >View</a
                          >`
                    : ''}
            </div></apitool-collapsable-element
        >`;
    }

    private async resolveConnection() {
        try {
            this.resolvedConnection = await apiClient.getPeerconnection(
                this.connectionUrl
            );
            this.resolveDevices();
        } catch (error) {
            if (error instanceof UnsuccessfulRequestError) {
                switch (error.response.status) {
                    case 404:
                        this.resolvedConnection = { error: 'Not Found' };
                        break;
                    default:
                        this.resolvedConnection = { error: 'Unresolvable' };
                }
            } else {
                this.resolvedConnection = { error: 'Unresolvable' };
            }
        }
    }

    private async resolveDevices() {
        if (
            !DeviceServiceTypes.isPeerconnection(
                this.resolvedConnection,
                'response'
            )
        )
            return;

        for (let i = 0; i < 2; i++) {
            try {
                this.resolvedDevices[i] = await apiClient.getDevice(
                    this.resolvedConnection.devices[i].url
                );
            } catch (error) {
                if (error instanceof UnsuccessfulRequestError) {
                    switch (error.response.status) {
                        case 404:
                            this.resolvedDevices[i] = { error: 'Not Found' };
                            break;
                        default:
                            this.resolvedDevices[i] = { error: 'Unresolvable' };
                    }
                } else {
                    this.resolvedDevices[i] = { error: 'Unresolvable' };
                }
            }
        }

        this.requestUpdate();
    }

    private getTitle() {
        if (!this.resolvedConnection) {
            return 'Loading...';
        } else if (
            DeviceServiceTypes.isPeerconnection(
                this.resolvedConnection,
                'response'
            )
        ) {
            const deviceA = this.resolvedDevices[0];
            const deviceB = this.resolvedDevices[1];
            const titleDeviceA = deviceA
                ? DeviceServiceTypes.isDevice(deviceA, 'response')
                    ? deviceA.name
                    : `Device A (${deviceA.error})`
                : 'Device A (Loading)';
            const titleDeviceB = deviceB
                ? DeviceServiceTypes.isDevice(deviceB, 'response')
                    ? deviceB.name
                    : `Device B (${deviceB.error})`
                : 'Device B (Loading)';
            return `${titleDeviceA} <-> ${titleDeviceB}`;
        } else {
            return `Unresolved Connection (${this.resolvedConnection.error})`;
        }
    }
}
