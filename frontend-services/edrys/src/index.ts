import './style.css';

import { APIClient, ExperimentServiceTypes } from "@cross-lab-project/api-client";
import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { experiment } from './experiment';

@customElement("edrys-app")
export class App extends LitElement {
    client: APIClient
    experiment: ExperimentServiceTypes.Experiment

    @state()
    loggedIn = false;

    @state()
    instances: { codeUrl: string, instanceUrl: string, deviceToken: string }[] = [];

    @query("#username")
    usernameInput: HTMLInputElement;
    @query("#password")
    passwordInput: HTMLInputElement;

    constructor() {
        super();
        this.client = new APIClient("https://api.goldi-labs.de");
        this.experiment = experiment
    }

    async login() {
        for (const method of ['tui', 'local'] as const) {
            try {
                await this.client.login(this.usernameInput.value, this.passwordInput.value, { method });
                this.loggedIn = true
                break;
            } catch (error) {
                // ignore
            }
        }
    }

    async startExperiment() {
        const experiment = await this.client.createExperiment({...this.experiment, status: 'running'})
        if (experiment.status ==='setup') {
            await this.experimentSetup(experiment)
        }
    }

    async experimentSetup(experiment: ExperimentServiceTypes.Experiment) {
        if (experiment.status !== 'setup') {
            throw new Error('Experiment is not in setup phase')
        }
        const instances: { codeUrl: string, instanceUrl: string, deviceToken: string }[] = []
        for (const device of experiment.devices ?? []) {
            if (device.device) {
                const setupProps = device.additionalProperties as { instanceUrl?: string, deviceToken?: string }
                const deviceDetails = await this.client.getDevice(device.device)
                if (deviceDetails.type === 'edge instantiable' && setupProps.instanceUrl && setupProps.deviceToken && deviceDetails.codeUrl) {
                    device.device = setupProps.instanceUrl
                    instances.push({ codeUrl: deviceDetails.codeUrl, instanceUrl: setupProps.instanceUrl, deviceToken: setupProps.deviceToken })
                }
            }
        }
        this.instances = instances
        await this.client.updateExperiment(experiment.url!, { devices: experiment.devices })
        while (true) {
            const instanceDetails = await Promise.all(instances.map(instance => this.client.getDevice(instance.instanceUrl)))
            if (instanceDetails.every(i => i.connected)){
                await this.client.updateExperiment(experiment.url!, { status: 'running' })
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }

    render_login() {
        return html`
        <div>
            <input id="username" type="text" placeholder="Username" />
            <input id="password" type="password" placeholder="Password" />
            <button @click="${this.login}">Login</button>
        </div>
        `
    }

    render() {
        if (!this.client.accessToken) {
            return this.render_login();
        } else if(this.instances.length === 0) {
            return html`<button @click="${this.startExperiment}">Start Experiment</button>`
        } else { 
            return html`
            <div>
                ${this.instances.map(instance => html`
                <iframe width="100%" height="800px" src="${instance.codeUrl}/?instanceUrl=${instance.instanceUrl}&deviceToken=${instance.deviceToken}"></iframe>
                `)}
            </div>
            `
        }
    }
}