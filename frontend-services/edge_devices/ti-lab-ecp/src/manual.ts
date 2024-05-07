import { LitElement, PropertyDeclaration, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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

@customElement("manual-interaction")
export class Manual extends LitElement {
  @property({ attribute: false })
  public serviceInterface: ServiceInterface;

  @property({ attribute: false })
  public inputs: string[];

  @property({ attribute: false })
  public outputs: string[];

  @state()
  private _outputs: boolean[] = Array(8).fill(false);

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    if (name === "serviceInterface") {
      ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"].forEach((y: any, i) => {
        this._outputs[i] = this.serviceInterface.getInput(y);
      });
      this._outputs = [...this._outputs];
      this.serviceInterface.on("inputChanged", (event) => {
        const i = ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"].findIndex(
          (v) => v === event.signal
        );
        if (i >= 0) {
          this._outputs[i] = event.value;
          this._outputs = [...this._outputs];
        }
      });
    } else {
      super.requestUpdate(name, oldValue, options);
    }
  }

  render() {
    console.log("rendering", this._outputs);
    return html`<div style="display: flex; flex-direction: column">
      <div style="margin: auto; display: flex; flex-direction: row-reverse;">
        ${(this.inputs ?? []).map(
          (x, i) => html` <binary-input
            @binary-input=${(event: { detail: { value: boolean } }) =>
              this.serviceInterface.setOutput(
                ["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7"][i] as any,
                event.detail.value
              )}
            name=${x}
          ></binary-input>`
        )}
      </div>
      <div style="margin: auto; display: flex; flex-direction: row-reverse;">
        ${(this.outputs ?? []).map(
          (x, i) => html` <binary-input
            disabled
            ?checked="${this._outputs[i]}"
            name=${x}
          ></binary-input>`
        )}
      </div>
    </div>`;
  }
}
