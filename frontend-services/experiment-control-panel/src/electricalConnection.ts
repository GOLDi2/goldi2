import { DeviceHandler } from '@cross-lab-project/soa-client';
import { ElectricalConnectionService, GPIO } from '@cross-lab-project/soa-service-electrical';
import { GPIOInterface, GPIOState } from '@cross-lab-project/soa-service-electrical/dist/gpio';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import produce from "immer"


@customElement('soa-electrical-connection')
export class ElectricalConnection extends LitElement {
  @state()
  protected _signals: { [key: string]: GPIOState } = {};
  @state()
  protected _signals_driver: { [key: string]: GPIOState } = {};

  protected _interfaces: { [key: string]: GPIOInterface }={};

  register(deviceHandler: DeviceHandler) {
    const sensor_service = new ElectricalConnectionService("sensors", []);
    const sensor_interface = new GPIO.ConstructableGPIOInterface([])
    sensor_service.addInterface(sensor_interface);

    sensor_service.on("newInterface", (event) => {
      if (event.connectionInterface.interfaceType == "gpio") {
        const gpioInterface = event.connectionInterface as GPIOInterface;
        this._interfaces[gpioInterface.configuration.signals.gpio]=gpioInterface;
        this._signals = produce(this._signals, (draft) => {
          draft[gpioInterface.configuration.signals.gpio] = GPIOState.Unknown;
        });
        gpioInterface.on("signalChange", (signalEvent) => {
          this._signals = produce(this._signals, (draft) => {
            draft[gpioInterface.configuration.signals.gpio] = signalEvent.state;
          });
        })
      }
    })

    deviceHandler.addService(sensor_service);
  }

  private _rotateDriver(name: string) {
    this._signals_driver = produce(this._signals_driver, (draft) => {
      const old_state=draft[name] || GPIOState.HighZ;
      let new_state = GPIOState.Unknown;
      switch (old_state) {
        case GPIOState.HighZ:
          new_state = GPIOState.StrongLow;
          break;
        case GPIOState.StrongLow:
          new_state = GPIOState.StrongHigh;
          break;
        case GPIOState.StrongHigh:
          new_state = GPIOState.HighZ;
          break;
      }

      this._interfaces[name].changeDriver(new_state);
      draft[name] = new_state;
    });
  }

  private _renderSignal(name: string, state: GPIOState, driver: GPIOState = GPIOState.HighZ) {
    return html`
      <div>
        <span>Signal Name: ${name}</span>
        <span>Current State: ${GPIOState[state]}</span>
        <span @click="${()=>this._rotateDriver(name)}">Driver: ${GPIOState[driver]}</span>
      </div>
    `;
  }

  render() {
    return html`
      <div>
        <h1>Electrical Connection</h1>
        ${Object.keys(this._signals).map((key) =>
          this._renderSignal(key, this._signals[key], this._signals_driver[key])
        )}
      </div>
    `;
  }
}
