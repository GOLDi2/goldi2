import {APIClient} from './client';
import {LitElement, html, adoptStyles, unsafeCSS, PropertyValueMap} from 'lit';
import {customElement, query, state} from 'lit/decorators.js';

import './esp-device-panel';
import './esp-config-pane';

import style from './styles.css';

const stylesheet = unsafeCSS(style);

import './plugablejs/viewport';
import { ConfigPane } from './esp-config-pane';
import { mc, nak, three_axes_portal, three_axes_portal_io, three_axes_portal_mc } from './predefined';
import { DeviceServiceTypes, ExperimentServiceTypes } from '@cross-lab-project/api-client';

@customElement('esp-app')
export class App extends LitElement {
  @state()
  devices: DeviceServiceTypes.DeviceOverview[] = [];

  private client = new APIClient();

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
    //this.devices = [{name: "test", id: "test"}];
    this.devices = await this.client.listDevices();
  }

  @query('esp-config-pane')
  configPane!: ConfigPane;

  @query('#experiment-config')
  experimentConfigInput!: HTMLTextAreaElement

  @state()
  isLoading: boolean = false

  start = () => {
    this.isLoading = true
    const experiment={...this.exp}
    experiment.status="running"
    experiment.devices=experiment.roles.map(role=>({device: role.template_device as string, role: role.name}))
    console.log(experiment)
    const ecp = window.open(`/ecp/`, '_blank', 'popup');
    window.addEventListener('message', async (e) => {
      if(e.data==="ecp-loaded"){
        ecp.postMessage({token: localStorage.getItem('token'), device_url: experiment.devices.filter((v)=>v.role=="ECP")[0].device}, "*")
      }
      if(e.data==="ecp-authorized"){
        await this.client.createExperiment(experiment)
        this.isLoading = false
      }
    });
    //this.client.createExperiment(API_URL, experiment)
  }

  @state()
  exp: ExperimentServiceTypes.Experiment = undefined

  render() {
    return html`
        <div class="flex flex-col w-full items-center h-[100vh]">
            <p class="text-2xl">Example Experiment Configurations</p>
            <div class="flex">
                <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.experimentConfigInput.value=JSON.stringify(three_axes_portal, null, 2)}}>3 Achs Portal</button>
                <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.experimentConfigInput.value=JSON.stringify(three_axes_portal_mc, null, 2)}}>3 Achs Portal + Microcontroller</button>
                <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.experimentConfigInput.value=JSON.stringify(three_axes_portal_io, null, 2)}}>3 Achs Portal + IO Board</button>
                <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.experimentConfigInput.value=JSON.stringify(mc, null, 2)}}>Microcontroller</button>
                <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.experimentConfigInput.value=JSON.stringify(nak, null, 2)}}>NAK Robot</button>
            </div>
            <label for="experiment-config" class="text-2xl">Experiment Configuration</label>
            <textarea id="experiment-config" class="border-4 border-black p-2 text-lg font-mono w-[80%] flex-grow resize-none"></textarea>
            <button class="m-2 p-4 flex items-center
                ${this.isLoading ? 'bg-primary-100' : 'bg-primary-900'} 
                ${this.isLoading ? 'text-black' : 'text-white'}" 
                ?disabled="${this.isLoading}" 
                @click=${()=>{this.exp=JSON.parse(this.experimentConfigInput.value); this.start()}}
            >
                ${this.isLoading ? html`
                Starting Experiment...
                <svg viewBox="-58 -58 116 116" class="animate-spin ml-3 h-5 w-5"> 
                    <g stroke-linecap="round" stroke-width="15">
                    <path id="a" d="m0 35 0,14"/>
                    <use transform="rotate(210)" xlink:href="#a" stroke="#f0f0f0"/>
                    <use transform="rotate(240)" xlink:href="#a" stroke="#ebebeb"/>
                    <use transform="rotate(270)" xlink:href="#a" stroke="#d3d3d3"/>
                    <use transform="rotate(300)" xlink:href="#a" stroke="#bcbcbc"/>
                    <use transform="rotate(330)" xlink:href="#a" stroke="#a4a4a4"/>
                    <use transform="rotate(0)" xlink:href="#a" stroke="#8d8d8d"/>
                    <use transform="rotate(30)" xlink:href="#a" stroke="#757575"/>
                    <use transform="rotate(60)" xlink:href="#a" stroke="#5e5e5e"/>
                    <use transform="rotate(90)" xlink:href="#a" stroke="#464646"/>
                    <use transform="rotate(120)" xlink:href="#a" stroke="#2f2f2f"/>
                    <use transform="rotate(150)" xlink:href="#a" stroke="#171717"/>
                    <use transform="rotate(180)" xlink:href="#a" stroke="#000"/>
                    </g>
                </svg>
                ` : 'Start Experiment'}
            </button>
        </div>
    `;
  }
}
