import { APIClient } from './client';
import { DeviceOverview } from "@cross-lab-project/api-client/dist/generated/device/types";
import { LitElement, html, adoptStyles, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './esp-device-panel'
import './esp-config-pane'

import style from './styles.css'

const stylesheet = unsafeCSS(style)

@customElement('esp-app')
export class App extends LitElement {
    @state()
    devices: DeviceOverview[] = [];

    async connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [stylesheet]);
        const client = new APIClient();
        const devices_response = await client.getDevices();
        if (devices_response.status == 200) {
            this.devices = devices_response.body
        } else {
            alert("Error: " + devices_response.status)
        }
    }

    render() {
        return html`
        <div class="flex h-80">
            <div class="border-black border-2 overflow-y-scroll w-80 h-full">
                <esp-device-panel .device=${this.devices}/>
            </div>
            <div class="border-black border-2 grow">
                <esp-config-pane></esp-config-pane>
            </div>
        </div>`;
    }
}