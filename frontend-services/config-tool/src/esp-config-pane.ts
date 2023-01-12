import {APIClient} from './client';
import {LitElement, html, css, adoptStyles, unsafeCSS, PropertyValueMap} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {v4 as uuidv4} from 'uuid';

import style from './styles.css';
import {until} from 'lit-html/directives/until.js';
import interact from 'interactjs';
import produce from 'immer';
import {
  Connection,
  ConnectionCoordinates,
  getConnectionLines,
  Plugable,
  PlugableConnectionPoint,
  PlugableDragEvent,
  PlugablePlugEvent,
  PlugableReflectEvent,
} from './plugablejs/plugable';
import {Coordinate} from './plugablejs/coordinate';
import {Dragable, makeDragable} from './plugablejs/dragable';

import './plugablejs';
import {PlugableViewport} from './plugablejs/viewport';
import {Focusable, makeFocusable} from './plugablejs/focusable';
import { three_axes_portal_mc } from './predefined';
import { DeviceServiceTypes, ExperimentServiceTypes } from '@cross-lab-project/api-client';

const stylesheet = unsafeCSS(style);

export class CreateServiceConfigurationEvent extends CustomEvent<{
  A: ServiceBox | ESPServiceConnection;
  B: ServiceBox | ESPServiceConnection;
}> {
  constructor(config: {A: ServiceBox | ESPServiceConnection; B: ServiceBox | ESPServiceConnection}) {
    super('service-configuration-create', {
      detail: config,
      bubbles: true,
      composed: true,
    });
  }
}

@customElement('service-box')
export class ServiceBox extends LitElement {
  @property()
  service: {serviceType: string; serviceId: string; serviceDirection: string};

  @property()
  rolename: string;

  protected createRenderRoot() {
    return this;
  }

  render() {
    const key = JSON.stringify({rolename: this.rolename, serviceId: this.service.serviceId});
    const compatible_direction = {in: 'out', inout: 'inout', out: 'in'}[this.service.serviceDirection];
    const plug_types = [JSON.stringify([this.service.serviceType, this.service.serviceDirection])];
    const compatible_plug_types = [JSON.stringify([this.service.serviceType, compatible_direction])];
    return html`
      <plugable-plugable
        .key="${key}"
        .plug_types="${plug_types}"
        .compatible_plug_types=${compatible_plug_types}
        @plugable-plug="${this.plug}">
        <div class="bg-primary-50 mx-5 py-3 rounded-2xl shadow-[0rem_0.05rem_0.1rem_0.05em_rgba(0,0,0,0.3)] flex flex-row items-center">
          <plugable-connection-point>
            <div class="rounded-full w-3 h-3 border-black border-[1px] mx-2 bg-primary"></div>
            <div slot="active" class="rounded-full w-3 h-3 border-black border-[1px] mx-2 bg-secondary"></div>
          </plugable-connection-point>
          <div class="grow">${this.service.serviceId}</div>
          <plugable-connection-point>
            <div class="rounded-full w-3 h-3 border-black border-[1px] mx-2 bg-primary"></div>
            <div slot="active" class="rounded-full w-3 h-3 border-black border-[1px] mx-2 bg-secondary"></div>
          </plugable-connection-point>
        </div>
      </plugable-plugable>
    `;
  }

  plug(e: PlugablePlugEvent) {
    const remoteServiceBox = e.detail.element.parentElement as ServiceBox;
    this.dispatchEvent(
      new CreateServiceConfigurationEvent({
        A: this,
        B: remoteServiceBox,
      }),
    );
  }
}

function isServiceBox(element: HTMLElement): element is ServiceBox {
  return element.tagName.toLowerCase() === 'service-box';
}

@customElement('role-box-dummy')
export class RoleBoxDummy extends LitElement implements Dragable {
  @property()
  position: Coordinate = new Coordinate(0, 0);

  protected createRenderRoot() {
    return this;
  }

  render() {
    const positionStyle = `left: ${this.position.x}px;top: ${this.position.y}px;`;
    return html` <div
      class="absolute bg-primary-100 w-80  pb-5 rounded-xl shadow-[0rem_0.1rem_0.2rem_0.1em_rgba(0,0,0,0.3)] bg-opacity-50"
      style="${positionStyle}">
      <div class="font-bold p-5"></div>
      <div class="flex flex-col gap-4"></div>
    </div>`;
  }
}

@customElement('role-box')
export class RoleBox extends LitElement implements Dragable, Focusable {
  @property()
  ServiceRole: ExperimentServiceTypes.Role;

  client: APIClient;

  constructor() {
    super();
    this.client = new APIClient();
  }

  @property()
  isFocused: boolean = false;

  @state()
  position: Coordinate = new Coordinate(0, 0);

  protected createRenderRoot() {
    return this;
  }

  shouldUpdate(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('role')) {
      this.client.getDevice((this.ServiceRole as any).template_device).then(device => {
        this.templateDevice = device;
      });
    }
    return true;
  }

  @state()
  templateDevice?: DeviceServiceTypes.DeviceOverview;

  render() {
    const positionStyle = `left: ${this.position.x}px;top: ${this.position.y}px;`;
    return html` <div
      class="absolute bg-primary-100 w-80  pb-5 rounded-xl shadow-[0rem_0.1rem_0.2rem_0.1em_rgba(0,0,0,0.3)]${this.isFocused
        ? ' outline'
        : ''} outline-2 outline-secondary"
      style="${positionStyle}">
      <div class="font-bold p-5">${this.ServiceRole.name.toUpperCase()}</div>
      <div class="flex flex-col gap-4">
        ${this.templateDevice
          ? (this.templateDevice.services as any).map(
              (service: any) => html`<service-box .service=${service} .rolename=${this.ServiceRole.name} />`,
            )
          : html`Loading...`}
      </div>
    </div>`;
  }

  firstUpdated(): void {
    const configPos = (this.ServiceRole['x-esc-position'] as {x: number; y: number}) || {x: 0, y: 0};
    this.position = new Coordinate(configPos.x, configPos.y);
    makeDragable(this);
    makeFocusable(this);
  }
}

@customElement('esp-service-connection')
export class ESPServiceConnection extends LitElement implements Focusable {
  connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
  }

  @property()
  isFocused: boolean;
  @property()
  connection: ConnectionCoordinates;

  renderLine({x1, y1, angle, length}: {x1: number; y1: number; angle: number; length: number}) {
    const position_style = css`
      top: ${y1 - 9}px;
      left: ${x1}px;
      width: ${length}px;
      transform: rotate(${angle}rad);
      transform-origin: center left;
    `;
    return html` <div class="py-2 absolute cursor-pointer" style=${position_style}>
      <div class="h-[2px] w-full bg-black ${this.isFocused ? ' outline' : ''} outline-2 outline-secondary" />
    </div>`;
  }

  plug(e: PlugablePlugEvent) {
    const remoteServiceBox = e.detail.element.parentElement as ServiceBox;
    this.dispatchEvent(
      new CreateServiceConfigurationEvent({
        A: this,
        B: remoteServiceBox,
      }),
    );
  }

  render() {
    const lines = getConnectionLines(this.connection).map(this.renderLine.bind(this));

    if (this.connection.details) {
      const details: ExperimentServiceTypes.ServiceConfiguration = this.connection.details;
      const key = JSON.stringify(details);
      const plug_types = [JSON.stringify([details.serviceType, 'inout'])];
      const compatible_plug_types = plug_types;

      const position_style = css`
        top: ${this.connection.center.y}px;
        left: ${this.connection.center.x}px;
      `;

      return html` ${lines}
        <plugable-plugable
          key="55"
          .plug_types="${plug_types}"
          .compatible_plug_types=${compatible_plug_types}
          class="absolute block w-6 h-6 -mt-3 -ml-3"
          style=${position_style}
          @plugable-plug="${this.plug}">
          <plugable-connection-point>
            <div class="rounded-full w-3 h-3 border-black border-[1px] m-[0.375rem] bg-primary l"></div>
            <div slot="active" class="rounded-full w-3 h-3 border-black border-[1px] m-[0.375rem] bg-secondary"></div>
          </plugable-connection-point>
        </plugable-plugable>`;
    } else {
      return lines;
    }
  }

  firstUpdated(): void {
    makeFocusable(this);
  }
}

function isESPServiceConnection(element: HTMLElement): element is ESPServiceConnection {
  return element.tagName.toLowerCase() === 'esp-service-connection';
}

async function autoUpdateConfig(config: ExperimentServiceTypes.ServiceConfiguration, experiment: ExperimentServiceTypes.Experiment, client: APIClient) {
  if (config.serviceType === 'http://api.goldi-labs.de/serviceTypes/electrical') {
    const participantDeviceIds: string[] = config.participants.map(
      p => experiment.roles.find(r => r.name === p.role).template_device,
    ) as any;
    const participantDevices = await Promise.all(participantDeviceIds.map(id => client.getDevice(id)));
    const participantServices = participantDevices.map((s, id) =>
      (s.services as any).find((s: any) => s.serviceId == config.participants[id].serviceId),
    );
    const participantGPIOInterfaces = participantServices.map((s: any) => s.interfaces.find((i: any) => i.interfaceType == 'gpio'));

    const newParticipants = config.participants.filter((p: any) => Object.keys(p.config).length === 0);
    const newParticipantsGPIOInterfaces = newParticipants.map((p: any) => participantGPIOInterfaces[config.participants.indexOf(p)]);

    const buses: {busId: string; participants: {index: number; interfaceId: string; signal: string}[]}[] = [];
    for (let i = 0; i < newParticipants.length; i++) {
      const availableSignals = newParticipantsGPIOInterfaces[i].availableSignals.gpio;
      if (availableSignals === 'ANY') {
        buses.forEach(b => {
          if (
            b.participants.every(p => p.signal === b.participants[0].signal) &&
            buses.filter(b => b.participants.some(p => p.signal === b.participants[0].signal)).length === 1
          ) {
            b.participants.push({index: i, interfaceId: uuidv4(), signal: b.participants[0].signal});
          }
        });
      } else {
        const signals = availableSignals as string[];
        signals.forEach(s => {
          const bus = buses.filter(b => b.participants.some(p => p.signal === s));
          if (bus.length === 1 && bus[0].participants.every(p => p.signal === s)) {
            bus[0].participants.push({index: i, interfaceId: uuidv4(), signal: s});
          } else if (bus.length === 0) {
            const newBus: {busId: string; participants: {index: number; interfaceId: string; signal: string}[]} = {
              busId: uuidv4(),
              participants: [],
            };
            participantGPIOInterfaces.forEach((p, idx) => {
              if (p.availableSignals.gpio === 'ANY' || (p.availableSignals.gpio as string[]).includes(s)) {
                newBus.participants.push({index: idx, interfaceId: uuidv4(), signal: s});
              }
            });
            if (newBus.participants.length > 1) {
              buses.push(newBus);
            }
          }
        });
      }
    }

    /*
    const AGpioInterface = (e.detail.A.service as any).interfaces.find((i: any) => i.interfaceType === 'gpio');
    const BGpioInterface = (e.detail.B.service as any).interfaces.find((i: any) => i.interfaceType === 'gpio');
    let buses = [];
    if (AGpioInterface.availableSignals.gpio === 'ANY' && Array.isArray(BGpioInterface.availableSignals.gpio)) {
      buses = BGpioInterface.availableSignals.gpio.map((b: any) => ({
        a: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
        b: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
        busId: b,
      }));
    }
    if (BGpioInterface.availableSignals.gpio === 'ANY' && Array.isArray(AGpioInterface.availableSignals.gpio)) {
      buses = AGpioInterface.availableSignals.gpio.map((b: any) => ({
        a: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
        b: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
        busId: b,
      }));
    }
    if (Array.isArray(AGpioInterface.availableSignals.gpio) && Array.isArray(BGpioInterface.availableSignals.gpio)) {
      buses = AGpioInterface.availableSignals.gpio
        .filter((b: any) => BGpioInterface.availableSignals.gpio.contains(b))
        .map((b: any) => ({
          a: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
          b: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
          busId: b,
        }));
    }
    AConfig = {
      interfaces: buses.map((b: any) => ({...b.a, busId: b.busId})),
    };
    BConfig = {
      interfaces: buses.map((b: any) => ({...b.b, busId: b.busId})),
    };*/
  }
}
@customElement('esp-config-pane')
export class ConfigPane extends LitElement {
  client = new APIClient();
  
  connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
  }

  @state()
  services: {[key: string]: HTMLElement} = {};
  addServiceBox(e: PlugableReflectEvent) {
    this.services = produce(this.services, (draft: any) => {
      draft[e.detail.key] = e.detail;
    });
  }

  @property()
  experimentConfiguration: ExperimentServiceTypes.Experiment = {
    status: 'running',
    roles: [],
    serviceConfigurations: [],
  };

  async createServiceConf(e: CreateServiceConfigurationEvent) {
    this.experimentConfiguration = await produce(this.experimentConfiguration, async draft => {
      if (isServiceBox(e.detail.A) && isServiceBox(e.detail.B)) {
        const config = {
          serviceType: e.detail.A.service.serviceType,
          configuration: {}, // COMPLETLTLY UNNECESSARY, BUT THE API DOES NOT ACCEPT UNDEFINED
          participants: [
            {serviceId: e.detail.A.service.serviceId, role: e.detail.A.rolename, config: {}},
            {serviceId: e.detail.B.service.serviceId, role: e.detail.B.rolename, config: {}},
          ],
          id: uuidv4(),
        };
        await autoUpdateConfig(config, draft, this.client);
        draft.serviceConfigurations.push(config);
      } else if (isESPServiceConnection(e.detail.A) && isESPServiceConnection(e.detail.B)) {
        console.error('not implemented');
      } else {
        const serviceConnection: ESPServiceConnection = isESPServiceConnection(e.detail.A)
          ? e.detail.A
          : (e.detail.B as ESPServiceConnection);
        const serviceBox: ServiceBox = isServiceBox(e.detail.A) ? e.detail.A : (e.detail.B as ServiceBox);
        const existingConfig: ExperimentServiceTypes.ServiceConfiguration = serviceConnection.connection.details;
        const participantService = serviceBox.service;
        const existingConfigDraft = draft.serviceConfigurations.find(c => c.id === existingConfig.id);
        existingConfigDraft.participants.push({serviceId: participantService.serviceId, role: serviceBox.rolename, config: {}});
        await autoUpdateConfig(existingConfigDraft, draft, this.client);
      }
    });
  }

  renderConnection(connection: ConnectionCoordinates) {
    return html`<esp-service-connection .connection=${connection}></esp-service-connection>`;
  }

  @query('plugable-viewport')
  private viewport!: PlugableViewport;

  render() {
    const updateRole = (idx: number, role: ExperimentServiceTypes.Role) => {
      this.experimentConfiguration = produce(this.experimentConfiguration, draft => {
        draft.roles[idx] = role;
      });
    };

    let serviceConnections = [];
    for (const conf of this.experimentConfiguration.serviceConfigurations) {
      let serviceElements = [];
      for (const participant of conf.participants) {
        const key = JSON.stringify({rolename: participant.role, serviceId: participant.serviceId});
        serviceElements.push(key);
      }
      if (serviceElements.length > 0) {
        serviceConnections.push({keys: serviceElements, details: conf});
      }
    }

    return html`
      <div
        class="flex flex-row h-full"
        @dragover="${(event: DragEvent) => {
          if (event.dataTransfer.types.includes('application/crosslab.device+json')) {
            event.preventDefault();
          }
        }}"
        @drop="${(event: DragEvent) => {
          this.addDeviceRole(
            JSON.parse(event.dataTransfer.getData('application/crosslab.device+json')),
            this.viewport.clientToCanvas({x: event.clientX, y: event.clientY}),
          );
        }}">
        <plugable-viewport
          class="flex-grow"
          .connections=${serviceConnections}
          @service-configuration-create=${this.createServiceConf}
          .renderConnection="${this.renderConnection}">
          ${this.experimentConfiguration.roles.map(
            (role, idx) => html`<role-box .ServiceRole="${role}" @role-updated="${(e: CustomEvent) => updateRole(idx, e.detail)}" />`,
          )}
        </plugable-viewport>
        <div class="bg-primary-100 w-80 h-full shadow-[inset_0rem_0.3rem_0.3rem_-0.3em_rgba(0,0,0,0.3)]">
            
        </div>
      </div>
    `;
  }

  addDeviceRole(device: DeviceServiceTypes.DeviceOverview, position: any) {
    this.experimentConfiguration = produce(this.experimentConfiguration, draft => {
      const uniqueName = (n: string): string => {
        const role = draft.roles.find(r => r.name === n);
        if (role) {
          const existing_name = role.name;
          const existing_number_match = existing_name.match(/\(\d+\)$/);
          if (existing_number_match && existing_number_match.length === 1) {
            const existing_number = parseInt(existing_number_match[0].slice(1, -1));
            return uniqueName(existing_name.replace(/\(\d+\)$/, `(${(existing_number + 1)})`));
          } else {
            return uniqueName(existing_name + '(1)');
          }
        } else {
          return n;
        }
      };
      draft.roles.push({
        name: uniqueName(device.name),
        template_device: device.url,
        'x-esc-position': position,
      });
    });
  }
}
