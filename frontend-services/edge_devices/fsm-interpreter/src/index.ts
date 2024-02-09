import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler } from "@cross-lab-project/soa-client";
import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";

let device_url = "";
const client = new APIClient("https://api.dev.goldi-labs.de");
const deviceHandler = new DeviceHandler();

import style from "./styles.css";
import { parse_and_compile_eqation } from "./equation_parsing";
import {
  ElectricalConnectionService,
  GPIO,
} from "@cross-lab-project/soa-service-electrical";

type Equation = {
  raw: string;
  error?: string;
  parsed?: { variable: string; fun: (input: Object) => boolean };
};

function isHigh(state: GPIO.GPIOState) {
  return state == GPIO.GPIOState.StrongHigh || state == GPIO.GPIOState.WeakHigh;
}

const stylesheet = unsafeCSS(style);
@customElement("ecp-app")
export class App extends LitElement {
  @state()
  private equations: { z: Equation[]; y: Equation[] } = {
    z: [{ raw: "" }],
    y: [{ raw: "" }],
  };
  @state()
  private input: Record<string, boolean> = {};

  @state()
  private isLoading: boolean = false;
  @state()
  private interval: any;

  private changeCallbacks: Map<string, ((value: boolean) => void)[]> =
    new Map();

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);

    // check if instanceUrl and deviceToken are in query params
    const urlParams = new URLSearchParams(window.location.search);
    const instanceUrl = urlParams.get("instanceUrl");
    const deviceToken = urlParams.get("deviceToken");
    if (instanceUrl && deviceToken) {
      device_url = instanceUrl;
      this.start(deviceToken);
    }
  }

  async start(accesstoken: string) {
    console.log({ accesstoken, device_url });
    client.accessToken = accesstoken;
    const token = await client.createWebsocketToken(device_url);

    const input_service = new ElectricalConnectionService("input", []);
    input_service.addInterface(new GPIO.ConstructableGPIOInterface([]));
    input_service.on("newInterface", (event) => {
      if (event.connectionInterface.interfaceType == "gpio") {
        const gpioInterface = event.connectionInterface as GPIO.GPIOInterface;
        const name = gpioInterface.configuration.signals.gpio;
        this.input[name] = isHigh(gpioInterface.signalState);
        gpioInterface.on("signalChange", (event) => {
          this.input[name] = isHigh(event.state);
          this.input = { ...this.input };
        });
      }
    });
    deviceHandler.addService(input_service);

    const output_service = new ElectricalConnectionService("output", []);
    output_service.addInterface(new GPIO.ConstructableGPIOInterface([]));
    output_service.on("newInterface", (event) => {
      if (event.connectionInterface.interfaceType == "gpio") {
        const gpioInterface = event.connectionInterface as GPIO.GPIOInterface;
        const name = gpioInterface.configuration.signals.gpio;
        let callbacks = this.changeCallbacks.get(name) ?? [];
        callbacks.push((value) => {
          if (value) {
            gpioInterface.changeDriver(GPIO.GPIOState.StrongHigh);
          } else {
            gpioInterface.changeDriver(GPIO.GPIOState.StrongLow);
          }
        });
        this.changeCallbacks.set(name, callbacks);
      }
    });
    deviceHandler.addService(output_service);

    await deviceHandler.connect({
      endpoint: "wss://api.dev.goldi-labs.de/devices/websocket",
      id: device_url,
      token,
    });
  }

  changeEquation(key: "z" | "y", idx: number, value: string) {
    this.equations[key][idx].raw = value;
    if (value !== "") {
      try {
        this.equations[key][idx].parsed = parse_and_compile_eqation(value);
        this.equations[key][idx].error = undefined;
      } catch (err) {
        this.equations[key][idx].parsed = undefined;
        this.equations[key][idx].error = err.message;
      }
    } else {
      this.equations[key][idx].parsed = undefined;
      this.equations[key][idx].error = undefined;
    }
    this.equations = {
      ...this.equations,
      [key]: [
        ...this.equations[key].filter((equation) => equation.raw !== ""),
        { raw: "" },
      ],
    };
  }

  step() {
    let output: Record<string, boolean> = {};
    for (const equation of [...this.equations.z, ...this.equations.y].filter(
      (e) => e.parsed
    )) {
      try {
        output[equation.parsed.variable] = equation.parsed.fun(this.input);
      } catch (err) {
        equation.error = err.message;
        this.requestUpdate();
      }
    }
    let changed = false;
    for (const [variable, value] of Object.entries(output)) {
      const callbacks = this.changeCallbacks.get(variable) ?? [];
      for (const callback of callbacks) {
        callback(value);
      }
      if (this.input[variable] !== value) {
        changed = true;
        this.input[variable] = value;
      }
    }
    if (changed) {
      this.input = { ...this.input };
    }
  }

  toggle_run() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    } else {
      this.interval = setInterval(() => this.step(), 100);
    }
  }

  reset() {}

  renderEquations(key: "z" | "y", name: string) {
    return html`
      <div class="bg-primary p-4 m-2 rounded-md text-white grow w-full">
        ${name} <br /><br />
        ${this.equations[key].map(
          (equation, idx) => html`
            ${equation.error
              ? html`<div class="text-red-500 pb-2">${equation.error}</div>`
              : html``}
            <input
              value="${equation.raw}"
              class="p-2 rounded text-black w-full"
              type="text"
              @input="${(event: any) =>
                this.changeEquation(key, idx, event.target.value)}"
            />
            <br /><br />
          `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div
        class="h-full flex flex-col"
        @webcam="${() => {
          this.isLoading = false;
        }}"
      >
        <div class="bg-primary-900 w-full h-12"></div>
        <div
          class="grow flex w-full items-center flex-col p-2 max-w-4xl m-auto"
        >
          <div class="bg-primary-100 p-4 m-2 rounded-md text-black">
            variables: <br /><br />
            <div class="flex flex-wrap">
              ${Object.entries(this.input).map(
                ([variable, value]) => html`
                  <div class="w-32">
                    ${variable}: ${value ? "true" : "false"}
                  </div>
                `
              )}
            </div>
          </div>
          ${this.renderEquations("z", "z-Equations")}
          ${this.renderEquations("y", "y-Equations")}
        </div>
        <div
          class="bg-primary-100 w-full h-12 flex flex-row align-middle justify-center"
        >
          <button
            class="bg-primary m-2 p-2 rounded hover:bg-primary-100"
            @click="${() => this.reset()}"
          >
            Reset
          </button>
          <button
            class="bg-primary m-2 p-2 rounded hover:bg-primary-100"
            @click="${() => this.step()}"
          >
            Step
          </button>
          <button
            class="${this.interval
              ? "bg-secondary"
              : "bg-primary"} m-2 p-2 rounded hover:bg-primary-100"
            @click="${() => this.toggle_run()}"
          >
            Run
          </button>
        </div>
      </div>
      ${this.isLoading
        ? html`<div
            class="absolute top-0 left-0 w-full h-full bg-primary-900 bg-opacity-50 flex items-center justify-center"
          >
            Loading...
          </div>`
        : html``}
    `;
  }
}
