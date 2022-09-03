import { APIClient } from './client';
import { Experiment, Role, ServiceConfiguration } from '@cross-lab-project/api-client/dist/generated/experiment/types';
import { LitElement, html, css, adoptStyles, unsafeCSS, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import style from './styles.css'
import { until } from 'lit-html/directives/until.js';
import interact from 'interactjs';
import produce from 'immer';
import { DeviceOverview } from '@cross-lab-project/api-client/dist/generated/device/types';
import { Connection, Coordinate, getConnectionLines, makePlugable, Plugable, PlugableDragEvent } from './plugablejs';


const stylesheet = unsafeCSS(style)

export class CreateServiceConfigurationEvent extends CustomEvent<ServiceConfiguration> {
    constructor(config: ServiceConfiguration) {
        super('service-configuration-create', {
            detail: config,
            bubbles: true
        })
    }
}

@customElement('service-box')
export class ServiceBox extends LitElement implements Plugable {
    @property()
    service: { serviceType: string, serviceId: string }

    @property()
    isPlugableTarget: boolean;

    @property()
    rolename: string;


    compatible: string[];

    protected createRenderRoot() {
        return this
    }

    getConnectPoint(from: Coordinate){
        const rect = this.getBoundingClientRect();
        const x = from.x>rect.x+rect.width/2?rect.right:rect.left;
        const y = rect.top + rect.height/2;
        return new Coordinate(x, y)
    }

    render() {
        if (this.isPlugableTarget) {
            return html`<div class="bg-primary p-2 rounded-xl shadow-inner">${this.service.serviceId}</div>`
        }else{
            return html`<div class="bg-secondary-light p-2 rounded-xl shadow-inner">${this.service.serviceId}</div>`
        }
    }

    firstUpdated() {
        this.compatible=[this.service.serviceType];
        makePlugable(this)
    }

    plug(element: Plugable) {
        const remoteServiceBox = element as ServiceBox;
        this.dispatchEvent(new CreateServiceConfigurationEvent({
            serviceType: this.service.serviceType,
            participants: [
                {serviceId: remoteServiceBox.service.serviceId, role: remoteServiceBox.rolename},
                {serviceId: this.service.serviceId, role: this.rolename}
            ]
        }))
    };
}

@customElement('service-connection')
export class ServiceConnection extends LitElement implements Connection {
    @property()
    elements: (Plugable | Coordinate)[];
    
    
    protected createRenderRoot() {
        return this
    }

    render() {
        const lines = getConnectionLines(this, this.elements);

        return html`
            ${lines.map(({x1, y1, angle, length})=>html`
                <div class="bg-black h-[2px] absolute" style="top:${y1}px; left:${x1}px; width:${length}px; transform: rotate(${angle}rad); transform-origin: center left;)"></div>
            `)}
        `
    }
}

@customElement('role-box')
export class RoleBox extends LitElement {
    @property()
    role: Role

    client: APIClient;

    constructor() {
        super();
        this.client = new APIClient();
    }

    protected createRenderRoot() {
        return this
    }

    template_device_url = ''
    template_device?: DeviceOverview
    async _render(role: Role) {
        if (role.template_device != this.template_device_url) {
            const device_response = await this.client.getDevicesByDeviceId({ device_id: (role.template_device as string).split('/').pop() }, role.template_device as string)
            if (device_response.status === 200) {
                const device = device_response.body
                device.services = [{ serviceType: "http://api.goldi-labs.de/serviceTypes/0", serviceId: "sensors" },{ serviceType: "http://api.goldi-labs.de/serviceTypes/0", serviceId: "test" }]
                this.template_device = device
                this.template_device_url = role.template_device as string
            }
        }
        return html`
            <div class="text-lg">${role.name}</div>
            ${(this.template_device.services as any).map((service: any) => html`<service-box .service=${service} .rolename=${role.name} />`)}
        `
    }

    render() {
        const position = this.role['x-esc-position'] as { x: number, y: number } || { x: 0, y: 0 }
        return html`<div class="w-60 bg-secondary rounded-xl p-4 shadow-lg absolute flex flex-col gap-2" style="left: ${position.x}px;top: ${position.y}px;">
            ${until(this._render(this.role))}
        </div>`
    }

    firstUpdated(): void {
        const container = this.renderRoot.firstElementChild as HTMLDivElement;
        const position = { x: 0, y: 0 }
        interact(container).draggable({
            onmove: (event) => {
                position.x += event.dx
                position.y += event.dy

                this.dispatchEvent(new CustomEvent('role-updated', { detail: { ...this.role, "x-esc-position": { x: position.x, y: position.y } } }))

                event.target.style.top = `${position.y}px`
                event.target.style.left = `${position.x}px`
            }
        })
    }
}

@customElement('esp-config-pane')
export class ConfigPane extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [stylesheet]);
    }

    @state()
    services: {[key: string]: HTMLElement} = {}
    addServiceBox(e: CustomEvent) {
        const detail: {rolename: string,
            serviceId: string,
            element: HTMLElement} = e.detail
        const key = JSON.stringify({rolename: detail.rolename, serviceId: detail.serviceId})
        this.services = produce(this.services, (draft: any)=>{draft[key] = detail.element})
    };
    
    @property()
    experimentConfiguration: Experiment = {"status":"running","devices":[{"device":"https://api.goldi-labs.de/devices/fbcf46cd-64e3-4403-8fd8-ac44644314d2","role":"device1"},{"device":"https://api.goldi-labs.de/devices/60895feb-00cb-4f60-bb96-2ee5a8edab14","role":"device2"}],"roles":[{"name":"device1","description":"description of device1","template_device":"https://api.goldi-labs.de/devices/fbcf46cd-64e3-4403-8fd8-ac44644314d2","x-esc-position":{"x":55,"y":31}},{"name":"device2","description":"description of device2","template_device":"https://api.goldi-labs.de/devices/60895feb-00cb-4f60-bb96-2ee5a8edab14","x-esc-position":{"x":501,"y":27}}],"serviceConfigurations":[{"serviceType":"http://api.goldi-labs.de/serviceTypes/1","configuration":{},"participants":[{"role":"device1","serviceId":"sensors","config":{"interfaces":[{"interfaceId":"1","interfaceType":"gpio","signals":{"gpio":"LimitXLeft"},"busId":"LimitXLeft"},{"interfaceId":"2","interfaceType":"gpio","signals":{"gpio":"LimitYBack"},"busId":"LimitYBack"},{"interfaceId":"3","interfaceType":"gpio","signals":{"gpio":"LimitYFront"},"busId":"LimitYFront"},{"interfaceId":"4","interfaceType":"gpio","signals":{"gpio":"LimitZBottom"},"busId":"LimitZBottom"},{"interfaceId":"5","interfaceType":"gpio","signals":{"gpio":"LimitZTop"},"busId":"LimitZTop"},{"interfaceId":"6","interfaceType":"gpio","signals":{"gpio":"Proximity"},"busId":"Proximity"}]}},{"role":"device2","serviceId":"sensors","config":{"interfaces":[{"interfaceId":"1","interfaceType":"gpio","signals":{"gpio":"LimitXLeft"},"busId":"LimitXLeft"},{"interfaceId":"2","interfaceType":"gpio","signals":{"gpio":"LimitYBack"},"busId":"LimitYBack"},{"interfaceId":"3","interfaceType":"gpio","signals":{"gpio":"LimitYFront"},"busId":"LimitYFront"},{"interfaceId":"4","interfaceType":"gpio","signals":{"gpio":"LimitZBottom"},"busId":"LimitZBottom"},{"interfaceId":"5","interfaceType":"gpio","signals":{"gpio":"LimitZTop"},"busId":"LimitZTop"},{"interfaceId":"6","interfaceType":"gpio","signals":{"gpio":"Proximity"},"busId":"Proximity"}]}}]},{"serviceType":"http://api.goldi-labs.de/serviceTypes/1","configuration":{},"participants":[{"role":"device1","serviceId":"actuators","config":{"interfaces":[{"interfaceId":"1","interfaceType":"gpio","signals":{"gpio":"LimitXLeft"},"busId":"LimitXLeft"},{"interfaceId":"1","interfaceType":"gpio","signals":{"gpio":"LimitXRight"},"busId":"LimitXRight"},{"interfaceId":"2","interfaceType":"gpio","signals":{"gpio":"LimitYBack"},"busId":"LimitYBack"},{"interfaceId":"3","interfaceType":"gpio","signals":{"gpio":"LimitYFront"},"busId":"LimitYFront"},{"interfaceId":"4","interfaceType":"gpio","signals":{"gpio":"LimitZBottom"},"busId":"LimitZBottom"},{"interfaceId":"5","interfaceType":"gpio","signals":{"gpio":"LimitZTop"},"busId":"LimitZTop"},{"interfaceId":"6","interfaceType":"gpio","signals":{"gpio":"Proximity"},"busId":"Proximity"}]}},{"role":"device2","serviceId":"actuators","config":{"interfaces":[{"interfaceId":"1","interfaceType":"gpio","signals":{"gpio":"XMotorLeft"},"busId":"XMotorLeft"},{"interfaceId":"2","interfaceType":"gpio","signals":{"gpio":"XMotorRight"},"busId":"XMotorRight"},{"interfaceId":"3","interfaceType":"gpio","signals":{"gpio":"YMotorBack"},"busId":"YMotorBack"},{"interfaceId":"4","interfaceType":"gpio","signals":{"gpio":"YMotorFront"},"busId":"YMotorFront"},{"interfaceId":"5","interfaceType":"gpio","signals":{"gpio":"ZMotorBottom"},"busId":"ZMotorBottom"},{"interfaceId":"6","interfaceType":"gpio","signals":{"gpio":"ZMotorTop"},"busId":"ZMotorTop"}]}}]},{"serviceType":"http://api.goldi-labs.de/serviceTypes/2","configuration":{},"participants":[{"role":"device1","serviceId":"webcam","config":{}},{"role":"device2","serviceId":"webcam","config":{}}]}]};


    @state()
    dragging?: {element: Plugable, coordinate: Coordinate, second_element?: Plugable}
    drag(e: PlugableDragEvent){
        if((e.detail as any).enabled===false){
            this.dragging = undefined
            return
        }
        this.dragging={...this.dragging, ...e.detail}
    }

    createServiceConf(e: CreateServiceConfigurationEvent){
        console.log(e)
    };

    render() {
        const updateRole = (idx: number, role: Role) => {
            this.experimentConfiguration = produce(this.experimentConfiguration, draft => {
                draft.roles[idx] = role;
            });
        }

        let serviceConnections = []
        for (const conf of this.experimentConfiguration.serviceConfigurations) {
            let serviceElements = []
            for (const participant of conf.participants) {
                const key = JSON.stringify({rolename: participant.role, serviceId: participant.serviceId})
                if (this.services[key]) {
                    serviceElements.push(this.services[key])
                }
            }
            if (serviceElements.length > 0) {
                serviceConnections.push(serviceElements)
            }
        }

        return html`
        <div class="h-full" @dragover="${(event: Event) => { event.preventDefault() }}" @drop="${(event: DragEvent) => { console.log(event.dataTransfer.getData("text/uri-list")) }}">
            <h2>Configuration</h2>
            <div class="relative overflow-auto h-full" @service-box-reflect="${this.addServiceBox}" @plugable-drag="${this.drag}" @service-configuration-create="${this.createServiceConf}">
                ${this.experimentConfiguration.roles.map((role, idx) => html`<role-box .role="${role}" @role-updated="${(e: CustomEvent) => updateRole(idx, e.detail)}"/>`)}
                ${serviceConnections.map((serviceElements) => html`<service-connection .elements=${serviceElements}/>`)}
                ${this.dragging?html`<service-connection .elements=${[this.dragging.element, this.dragging.second_element || this.dragging.coordinate]}/>`:null}
            </div>
            <div>
                ${JSON.stringify(this.experimentConfiguration)}
            </div>
        </div>
    `;
    }
}
