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

  start = () => {
    const experiment={...this.exp}
    experiment.status="running"
    experiment.devices=experiment.roles.map(role=>({device: role.template_device as string, role: role.name}))
    console.log(experiment)
    const ecp = window.open(`/ecp/`, '_blank', 'popup');
    ecp.addEventListener('message', (e) => {
      if(e.data==="ecp-loaded"){
        ecp.postMessage({token: localStorage.getItem('token'), device_url: experiment.devices.filter((v)=>v.role=="ECP")[0].device}, "*")
      }
      if(e.data==="ecp-authorized"){
        this.client.createExperiment(experiment)
      }
    });
    //this.client.createExperiment(API_URL, experiment)
  }

  @state()
  exp: ExperimentServiceTypes.Experiment = undefined

  render() {
    return html`
    <button class="m-2 p-4 mt-16 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal; this.start()}}>3 Achs Portal</button>
    <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal_mc; this.start()}}>3 Achs Portal + Microcontroller</button>
    <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=three_axes_portal_io; this.start()}}>3 Achs Portal + IO Board</button>
    <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=mc; this.start()}}>Microcontroller</button>
    <button class="m-2 p-4 bg-primary-900 text-white" @click=${()=>{this.exp=nak; this.start()}}>NAK Robot</button>
    `;
  }
}
