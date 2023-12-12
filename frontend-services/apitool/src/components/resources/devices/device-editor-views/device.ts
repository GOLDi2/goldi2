import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DeviceEditor } from '../device-editor';
import { apiClient } from '../../../../globals';

@customElement('apitool-device-editor-concrete-device')
export class DeviceEditorConcreteDevice extends LitElement {
    @property({ type: Object })
    device!: DeviceServiceTypes.ConcreteDevice<'response'>;

    @property({ type: Object })
    parent!: DeviceEditor;

    @state()
    token?: string;

    // NOTE: TEMPORARY
    @state()
    availabilityRules: DeviceServiceTypes.AvailabilityRule[] = [];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<div class="w-full flex flex-col gap-2 mb-2">
            <div class="flex">
                <p class="w-28">Connected:</p>
                <p>${this.device.connected}</p>
            </div>
            <div class="flex items-center">
                <p class="w-28 flex-shrink-0">Device Token:</p>
                ${this.token
                    ? html`<p
                          class="whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                          ${this.token}
                      </p>`
                    : html`<button
                          @click=${async () => {
                              let token;
                              try {
                                  const identity =
                                      await apiClient.getIdentity();
                                  token = await apiClient.createToken({
                                      username: identity.username,
                                      claims: { device_token: true },
                                  });
                              } catch (error) {
                                  console.error(error);
                              }

                              // NOTE: temporary fallback for old way to get device token
                              if (!token)
                                  try {
                                      const url = new URL(apiClient.url);
                                      url.pathname =
                                          '/device_authentication_token';
                                      url.searchParams.append(
                                          'device_url',
                                          this.device.url
                                      );
                                      const response = await fetch(url, {
                                          headers: [
                                              [
                                                  'Authorization',
                                                  'Bearer ' +
                                                      apiClient.accessToken,
                                              ],
                                          ],
                                          method: 'post',
                                      });
                                      token = await response.text();
                                  } catch (error) {
                                      console.error(error);
                                  }

                              this.token = token;
                          }}
                          class="p-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg"
                      >
                          Generate
                      </button>`}
            </div>
            <apitool-collapsable-element
                .title=${'Availability'}
                class="flex p-2 border bg-white rounded-lg"
            >
                <div class="flex flex-col gap-2">
                    <apitool-calendar
                        .availabilityRules=${this.availabilityRules}
                    ></apitool-calendar>
                    <apitool-availability-rule-list
                        .availabilityRules=${this.availabilityRules}
                        .parent=${this.parent}
                        @update-availability-rules=${(
                            event: CustomEvent<
                                DeviceServiceTypes.AvailabilityRule[]
                            >
                        ) => {
                            this.availabilityRules = [...event.detail];
                            console.log(this.availabilityRules);
                        }}
                    ></apitool-availability-rule-list>
                </div>
            </apitool-collapsable-element>
            <apitool-service-list
                .parent=${this.parent}
                .services=${this.device.services ?? []}
                @update-services=${(
                    event: CustomEvent<DeviceServiceTypes.ServiceDescription[]>
                ) => {
                    this.device.services = [...event.detail];
                    this.requestUpdate();
                }}
            ></apitool-service-list>
        </div>`;
    }
}
