import {APIClient} from './client';
import {Experiment, Role, ServiceConfiguration} from '@cross-lab-project/api-client/dist/generated/experiment/types';
import {LitElement, html, css, adoptStyles, unsafeCSS, PropertyValueMap} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {v4 as uuidv4} from 'uuid';

import style from './styles.css';
import {until} from 'lit-html/directives/until.js';
import interact from 'interactjs';
import produce from 'immer';
import {DeviceOverview} from '@cross-lab-project/api-client/dist/generated/device/types';
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

const stylesheet = unsafeCSS(style);

export class CreateServiceConfigurationEvent extends CustomEvent<ServiceConfiguration> {
  constructor(config: ServiceConfiguration) {
    super('service-configuration-create', {
      detail: config,
      bubbles: true,
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
    let AConfig={}, BConfig={}; // WHY DO I NEED TO DECLARE THESE? The API should not 500 just because the config is undefined instead of an empty object
    if (this.service.serviceType === 'http://api.goldi-labs.de/serviceTypes/electrical') {
      const AGpioInterface = (this.service as any).interfaces.find((i: any) => i.interfaceType === 'gpio');
      const BGpioInterface = (remoteServiceBox.service as any).interfaces.find((i: any) => i.interfaceType === 'gpio');
      let buses = [];
      if (AGpioInterface.availableSignals.gpio === 'ANY' && Array.isArray(BGpioInterface.availableSignals.gpio)) {
        buses = BGpioInterface.availableSignals.gpio.map((b: any) => ({
          a: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
          b: {interfaceId: uuidv4(), interfaceType: 'gpio', signals: {gpio: b}},
          busId: b,
        }));
      }
      if (BGpioInterface.availableSignals.gpio === 'ANY' && Array.isArray(AGpioInterface.availableSignals.gpio)) {
        buses = BGpioInterface.availableSignals.gpio.map((b: any) => ({
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
        interfaces: buses.map((b:any) => ({...b.a, busId: b.busId})),
      };
      BConfig = {
        interfaces: buses.map((b: any) => ({...b.b, busId: b.busId})),
      };
    }
    this.dispatchEvent(
      new CreateServiceConfigurationEvent({
        serviceType: this.service.serviceType,
        configuration: {}, // COMPLETLTLY UNNECESSARY, BUT THE API DOES NOT ACCEPT UNDEFINED
        participants: [
          {serviceId: this.service.serviceId, role: this.rolename, config: AConfig},
          {serviceId: remoteServiceBox.service.serviceId, role: remoteServiceBox.rolename, config: BConfig},
        ],
      }),
    );
  }
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
  role: Role;

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
      this.client.getDevice((this.role as any).template_device).then(device => {
        this.templateDevice = device;
      });
    }
    return true;
  }

  @state()
  templateDevice?: DeviceOverview;

  render() {
    const positionStyle = `left: ${this.position.x}px;top: ${this.position.y}px;`;
    return html` <div
      class="absolute bg-primary-100 w-80  pb-5 rounded-xl shadow-[0rem_0.1rem_0.2rem_0.1em_rgba(0,0,0,0.3)]${this.isFocused
        ? ' outline'
        : ''} outline-2 outline-secondary"
      style="${positionStyle}">
      <div class="font-bold p-5">${this.role.name.toUpperCase()}</div>
      <div class="flex flex-col gap-4">
        ${this.templateDevice
          ? (this.templateDevice.services as any).map(
              (service: any) => html`<service-box .service=${service} .rolename=${this.role.name} />`,
            )
          : html`Loading...`}
      </div>
    </div>`;
  }

  firstUpdated(): void {
    const configPos = (this.role['x-esc-position'] as {x: number; y: number}) || {x: 0, y: 0};
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
    return html`<div class="py-2 absolute cursor-pointer" style=${position_style}>
      <div class="h-[2px] w-full bg-black ${this.isFocused ? ' outline' : ''} outline-2 outline-secondary" />
    </div>`;
  }

  render() {
    const lines = getConnectionLines(this.connection).map(this.renderLine.bind(this));
    return lines;
  }

  firstUpdated(): void {
    makeFocusable(this);
  }
}

@customElement('esp-config-pane')
export class ConfigPane extends LitElement {
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
  experimentConfiguration: Experiment = {
    status: 'running',
    roles: [],
    serviceConfigurations: [],
  };

  createServiceConf(e: CreateServiceConfigurationEvent) {
    this.experimentConfiguration = produce(this.experimentConfiguration, draft => {
      draft.serviceConfigurations.push(e.detail);
    });
    console.log(this.experimentConfiguration);
  }

  renderConnection(connection: ConnectionCoordinates) {
    return html`<esp-service-connection .connection=${connection}></esp-service-connection>`;
  }

  @query('plugable-viewport')
  private viewport!: PlugableViewport;

  render() {
    const updateRole = (idx: number, role: Role) => {
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
        serviceConnections.push({keys: serviceElements});
      }
    }

    return html`
      <div
        class="flex flex-col"
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
            (role, idx) => html`<role-box .role="${role}" @role-updated="${(e: CustomEvent) => updateRole(idx, e.detail)}" />`,
          )}
        </plugable-viewport>
      </div>
    `;
  }

  addDeviceRole(device: DeviceOverview, position: any) {
    this.experimentConfiguration = produce(this.experimentConfiguration, draft => {
      draft.roles.push({
        name: device.name,
        template_device: device.url,
        'x-esc-position': position,
      });
    });
  }
}
