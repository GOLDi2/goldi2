import { LitElement, PropertyDeclaration, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { AxisPortalAnimation } from "./axis_portal/animation";
import { AxisPortalSimulation } from "./axis_portal/simulation";
import "./binary_input";

interface ServiceInterface {
  setOutput(
    signal: "x7" | "x6" | "x5" | "x4" | "x3" | "x2" | "x1" | "x0",
    value: boolean
  ): void;
  getInput(
    signal: "y7" | "y6" | "y5" | "y4" | "y3" | "y2" | "y1" | "y0"
  ): boolean;
  on(
    event: "inputChanged",
    listener: (event: { signal: string; value: boolean }) => void
  ): void;
}

const ActuatorMap: [
  string,
  "y7" | "y6" | "y5" | "y4" | "y3" | "y2" | "y1" | "y0"
][] = [
  ["XMotorLeft", "y0"],
  ["XMotorRight", "y1"],
  ["YMotorBack", "y2"],
  ["YMotorFront", "y3"],
  ["ZMotorBottom", "y4"],
  ["ZMotorTop", "y5"],
  ["Magnet", "y6"],
];

const SensorMap: [
  string,
  "x7" | "x6" | "x5" | "x4" | "x3" | "x2" | "x1" | "x0"
][] = [
  ["LimitXLeft", "x0"],
  ["LimitXRight", "x1"],
  ["LimitYBack", "x2"],
  ["LimitYFront", "x3"],
  ["LimitZBottom", "x4"],
  ["LimitZTop", "x5"],
  ["Proximity", "x6"],
];

@customElement("axis-portal-animation")
export class AxisPortal extends LitElement {
  animation = new AxisPortalAnimation();
  simulation: AxisPortalSimulation;

  @property({ attribute: false })
  public serviceInterface: ServiceInterface;

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    if (name === "serviceInterface") {
      for (const [a, y] of ActuatorMap) {
        this.simulation.setActuator(a, this.serviceInterface.getInput(y));
      }
      for (const [s, x] of SensorMap) {
        this.serviceInterface.setOutput(x, this.simulation.sensors[s]);
        this.simulation.sensors_emitter.on(s, (value) => console.log(value));
      }

      this.serviceInterface.on("inputChanged", (event) => {
        const actuator = ActuatorMap.find((a) => a[1] === event.signal);
        if (actuator) {
          this.simulation.setActuator(actuator[0], event.value);
        }
      });
    } else {
      super.requestUpdate(name, oldValue, options);
    }
  }

  constructor() {
    super();
    this.simulation = new AxisPortalSimulation(this.animation);
  }

  render() {
    console.log("rendering");
    return html`<div
      style="display: flex; flex-direction: column; height: 100%"
    >
      <div style="width: 100%;height: 10em;flex-grow: 1;">
        ${unsafeHTML(this.animation.SVG)}
      </div>
      <div style="margin: auto;">
        <binary-input
          @binary-input=${(event: { detail: { value: boolean } }) =>
            this.serviceInterface.setOutput("x2", event.detail.value)}
          name="x_s"
        ></binary-input>
      </div>
    </div>`;
  }

  firstUpdated(): void {
    this.animation.init(this.shadowRoot);
  }
}
