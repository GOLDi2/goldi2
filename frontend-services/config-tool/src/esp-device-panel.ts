
import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html, css, adoptStyles, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './styles.css' 

const stylesheet = unsafeCSS(style)

@customElement('esp-device-panel')
export class DevicePanel extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [stylesheet]);
    }

    @property()
    device: DeviceServiceTypes.DeviceOverview[];

    render() {
        //return html``;
        return html`
        <div>
            <h2>Devices</h2>
            ${this.device.map(device => html`
            <div class="p-5 w-56" draggable="true" @dragstart="${(event: DragEvent)=>{event.dataTransfer.setData("text/uri-list",device.url)}}">
                <div>${device.name}</div>
                <div class="bg-secondary-light flex justify-between items-center">
                    <div class="bg-primary rounded-full w-3 h-3 inline-block"></div>
                    Service 1
                    <div class="bg-primary rounded-full w-3 h-3 inline-block"></div>
                </div>
            </div>
            `)}
        </div>
    `;
    }
}
