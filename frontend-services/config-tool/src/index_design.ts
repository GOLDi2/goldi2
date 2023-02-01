import { APIClient } from './client';
import { LitElement, html, adoptStyles, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import './esp-device-panel'
import './esp-config-pane'

import style from './styles.css'

const stylesheet = unsafeCSS(style)

import './plugablejs/viewport'
import { DeviceServiceTypes } from '@cross-lab-project/api-client';

@customElement('esp-app')
export class App extends LitElement {
    @state()
    devices: DeviceServiceTypes.DeviceOverview[] = [];

    async connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [stylesheet]);
        const client = new APIClient();
        this.devices = [{name: "test", id: "test"}];
        /*const devices_response = await client.getDevices();
        if (devices_response.status == 200) {
            this.devices = devices_response.body
        } else {
            alert("Error: " + devices_response.status)
        }*/
    }

    render() {
        return html`
        <div class="flex flex-col h-screen font-body">
            <div class="h-16 flex flex-row">
                <div class="inline-block bg-primary-900 h-full w-80">
                    <div class="p-3 text-white text-center text-4xl">
                        LAB DEVICES
                    </div>
                </div>
                <div class="bg-primary-50 grow flex flex-row items-center px-6">
                    <button class="p-2 px-10 bg-white rounded-full border-primary-100 border-2">Cable</button>
                    <div class="grow"></div>
                    <button class="p-2 px-10 bg-primary rounded-full text-white">Save</button>
                </div>
            </div>
            <div class="flex flex-row grow">
                <div class="bg-primary-50 h-full w-80"></div>
                <div class="grow shadow-[inset_0.1rem_0.1rem_0.5rem_0.1em_rgba(0,0,0,0.3)]">
                    <div class="m-20 bg-primary-100 w-80 h-96 rounded-xl shadow-[0rem_0.1rem_0.2rem_0.1em_rgba(0,0,0,0.3)] border-2 border-primary">
                        <div class="font-bold p-5">3-AXIS-PORTAL</div>
                        <div class="flex flex-col gap-4">
                            <div class="bg-primary-50 mx-5 py-3 rounded-2xl shadow-[0rem_0.05rem_0.1rem_0.05em_rgba(0,0,0,0.3)] flex flex-row items-center">
                                <div class="rounded-full w-3 h-3 bg-primary border-black border-[1px] mx-2"></div>
                                <div class="grow">Webcam</div>
                                <div class="rounded-full w-3 h-3 bg-primary border-black border-[1px] mx-2"></div>
                            </div>

                            <div class="bg-primary-50 mx-5 py-3 rounded-2xl shadow-[inset_0rem_0.05rem_0.1rem_0.05em_rgba(0,0,0,0.3)] flex flex-col items-start">
                                <div class="mx-7">Electrical Connection</div>
                                <div class="mx-7 text-sm">Sensors</div>
                                <div class="rounded-xl border-[1px] mx-3 flex flex-row items-center">
                                    <div class="rounded-full w-3 h-3 bg-primary border-black border-[1px] mx-2"></div>
                                    <div class="grow">Webcam</div>
                                    <div class="rounded-full w-3 h-3 bg-secondary border-black border-[1px] mx-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-primary-100 w-80 shadow-[inset_0rem_0.3rem_0.3rem_-0.3em_rgba(0,0,0,0.3)]"></div>
            </div>
        </div>
        `;
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