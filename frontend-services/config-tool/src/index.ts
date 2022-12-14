import {APIClient} from './client';
import {DeviceOverview} from '@cross-lab-project/api-client/dist/generated/device/types';
import {LitElement, html, adoptStyles, unsafeCSS, PropertyValueMap} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

import './esp-device-panel';
import './esp-config-pane';

import style from './styles.css';

const stylesheet = unsafeCSS(style);

import './plugablejs/viewport';
import { ConfigPane } from './esp-config-pane';
import { mc, three_axes_portal, three_axes_portal_io, three_axes_portal_mc } from './predefined';
import { Experiment } from '@cross-lab-project/api-client/dist/generated/experiment/types';

const API_URL = 'https://api.goldi-labs.de';

@customElement('esp-app')
export class App extends LitElement {
  @state()
  devices: DeviceOverview[] = [];

  private client = new APIClient();

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
    //this.devices = [{name: "test", id: "test"}];
    this.devices = await (this.client as any).getDevices();
  }

  @query('esp-config-pane')
  configPane!: ConfigPane;

  start = () => {
    const experiment={...this.configPane.experimentConfiguration}
    experiment.status="running"
    experiment.devices=experiment.roles.map(role=>({device: role.template_device as string, role: role.name}))
    const ecp = window.open(`/ecp/`, '_blank', 'popup');
    ecp.addEventListener('message', (e) => {
      if(e.data==="ecp-loaded"){
        ecp.postMessage({token: localStorage.getItem('token')}, "*")
      }
      if(e.data==="ecp-authorized"){
        this.client.createExperiment(API_URL, experiment)
      }
    });
    //this.client.createExperiment(API_URL, experiment)
  }

  @state()
  exp: Experiment = undefined

  render() {
    return html`
      <div class="flex flex-col h-full font-body">
        <div class="flex flex-row">
          <div class="inline-block bg-primary-900 h-full w-80">
            <div class="p-3 text-white text-center text-1xl">LAB DEVICES</div>
          </div>
          <div class="bg-primary-50 grow flex flex-row items-center px-6">
            <!--<button class="p-2 px-10 bg-white rounded-full border-primary-100 border-2">Cable</button>-->
            <div class="grow"></div>
            <button class="p-2 px-10 bg-primary rounded-full text-white" @click=${this.start}>Start</button>
          </div>
        </div>
        <div class="flex flex-row grow">
          <div class="bg-primary-50 h-full w-80">
            ${this.devices.map(
              device => html`<div
                draggable="true"
                @dragstart="${(event: DragEvent) => {
                  event.dataTransfer.setData('application/crosslab.device+json', JSON.stringify(device));
                }}"
                class="bg-white p-4 m-2 rounded-2xl shadow-[0rem_0.05rem_0.1rem_0.05em_rgba(0,0,0,0.3)] ">
                ${device.name}
              </div>`,
            )}
            <button class="m-2 p-4 mt-16 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal}}>3 Achs Portal</button>
            <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal_mc}}>3 Achs Portal + Microcontroller</button>
            <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal_io}}>3 Achs Portal + IO Board</button>
            <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=mc}}>Microcontroller</button>
          </div>
          <div class="grow relative flex-auto">
            <div class="w-full h-full overflow-hidden">
              ${this.exp?html`<esp-config-pane .experimentConfiguration=${this.exp}></esp-config-pane>`:html`<esp-config-pane></esp-config-pane>`}
            </div>
            <div
              class="absolute top-0 left-0 bottom-0 right-0 shadow-[inset_0.1rem_0.1rem_0.5rem_0.1em_rgba(0,0,0,0.3)] pointer-events-none"></div>
          </div>
        </div>
      </div>
    `;
  }
}
