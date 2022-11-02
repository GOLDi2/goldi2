import { DeviceHandler } from "@cross-lab-project/soa-client";
import {
  ElectricalConnectionService,
  GPIO,
} from "@cross-lab-project/soa-service-electrical";
import {
  GPIOInterface,
  GPIOState,
} from "@cross-lab-project/soa-service-electrical/dist/gpio";
import { LitElement, html, adoptStyles, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import produce from "immer";

import style from "./styles.css";
const stylesheet = unsafeCSS(style);

@customElement("soa-electrical-connection")
export class ElectricalConnection extends LitElement {
  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
  }

  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  @state()
  protected _signals: { [key: string]: GPIOState } = {};
  @state()
  protected _signals_driver: { [key: string]: GPIOState } = {};

  protected _interfaces: { [key: string]: GPIOInterface } = {};

  register(deviceHandler: DeviceHandler) {
    const sensor_service = new ElectricalConnectionService(this.name, []);
    const sensor_interface = new GPIO.ConstructableGPIOInterface([]);
    sensor_service.addInterface(sensor_interface);

    sensor_service.on("newInterface", (event) => {
      console.log(event);
      if (event.connectionInterface.interfaceType == "gpio") {
        const gpioInterface = event.connectionInterface as GPIOInterface;
        this._interfaces[gpioInterface.configuration.signals.gpio] =
          gpioInterface;
        this._signals = produce(this._signals, (draft) => {
          draft[gpioInterface.configuration.signals.gpio] = GPIOState.Unknown;
        });
        gpioInterface.on("signalChange", (signalEvent) => {
          this._signals = produce(this._signals, (draft) => {
            draft[gpioInterface.configuration.signals.gpio] = signalEvent.state;
          });
        });
      }
    });

    deviceHandler.addService(sensor_service);
  }

  private _rotateDriver(name: string) {
    this._signals_driver = produce(this._signals_driver, (draft) => {
      const old_state = draft[name] || GPIOState.HighZ;
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

  private _driveHigh(name: string) {
    this._signals_driver = produce(this._signals_driver, (draft) => {
      let new_state = GPIOState.StrongHigh;
      this._interfaces[name].changeDriver(new_state);
      draft[name] = new_state;
    });
  }

  private _driveLow(name: string) {
    this._signals_driver = produce(this._signals_driver, (draft) => {
      let new_state = GPIOState.StrongLow;
      this._interfaces[name].changeDriver(new_state);
      draft[name] = new_state;
    });
  }

  private _driveHighZ(name: string) {
    this._signals_driver = produce(this._signals_driver, (draft) => {
      let new_state = GPIOState.HighZ;
      this._interfaces[name].changeDriver(new_state);
      draft[name] = new_state;
    });
  }

  private _renderSignal(
    name: string,
    state: GPIOState,
    driver: GPIOState = GPIOState.HighZ
  ) {
    let color = "bg-primary-50";
    if (state == GPIOState.StrongHigh || state == GPIOState.WeakHigh) {
      color = "bg-secondary";
    } else if (state == GPIOState.StrongLow || state == GPIOState.WeakLow) {
      color = "bg-primary-100";
    }
    return html`
      <div class="flex w-[32rem] p-1">
        <div class="grow"></div>
        <div class="p-1">${name}</div>
        <div class="${color} h-7 text-lg w-28 text-center rounded-l-lg m-0">
          ${GPIOState[state]}
        </div>
        <button
          class="bg-primary h-7 text-sm w-28 text-center m-0 border-l-2 border-r-2 active:bg-secondary"
          @mousedown="${() => this._driveHigh(name)}"
          @mouseup="${() => this._driveHighZ(name)}"
          @mouseleave="${() => this._driveHighZ(name)}"
        >
          Drive High
        </button>
        <button
          class="bg-primary h-7 text-sm w-28 text-center rounded-r-lg active:bg-secondary"
          @mousedown="${() => this._driveLow(name)}"
          @mouseup="${() => this._driveHighZ(name)}"
          @mouseleave="${() => this._driveHighZ(name)}"
        >
          Drive Low
        </button>
      </div>
    `;
  }

  render() {
    return html`
      <div>
        <h1 class="text-2xl text-center">
          Electrical Connection (${this.name})
        </h1>
        <div class="flex flex-col w-full items-center">
          ${Object.keys(this._signals).map((key) =>
            this._renderSignal(
              key,
              this._signals[key],
              this._signals_driver[key]
            )
          )}
        </div>
      </div>
    `;
  }
}
