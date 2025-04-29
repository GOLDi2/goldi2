import {
    adoptStyles,
    html,
    LitElement,
    PropertyDeclaration,
    unsafeCSS,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import style from "./styles.css";
const stylesheet = unsafeCSS(style);

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

function variableCountToBelegung(variable_cnt: number): number[][] {
  if (variable_cnt >= 1) {
    const subBelegung = variableCountToBelegung(variable_cnt - 1);
    return [
      ...subBelegung.map((b) => [0, ...b]),
      ...subBelegung.map((b) => [1, ...b]),
    ];
  } else {
    return [[]];
  }
}

const tuple = (i: number, j: number) => i * 8 + j;

@customElement("truth-table")
export class TruthTable extends LitElement {
  @property({ attribute: false })
  public serviceInterface: ServiceInterface;

  @property({ attribute: false })
  public inputs: string[];

  @property({ attribute: false })
  public outputs: string[];

  @state()
  private scanningRow: number = -1;

  @state()
  private output_matrix: string[][] = [];
  private _outputs: Map<number, boolean> = new Map();
  private scan=true;

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);

    setInterval(this.scanningProcess, 500);
  }

  scanningProcess = ()=>{
    if (this.scan==true){
      this.setRow((this.scanningRow+1)%(2**this.inputs.length))
    }
  }

  updateOutput(row: number, bit: number, value: boolean) {
    this._outputs.set(tuple(row, bit), value);
    const belegung = variableCountToBelegung(this.inputs.length);
    this.output_matrix = belegung.map((_, i) =>
      [...Array(this.outputs.length).keys()]
        .reverse()
        .map((j) => (this._outputs.get(tuple(i, j)) ? "1" : "0"))
    );
  }

  setRow(row: number){
    for (let i=0;i<this.outputs.length; i++){
      this.updateOutput(row, i, this._outputs.get(tuple(this.scanningRow, i)))
    }
    this.scanningRow = row;
    for (let i = 0; i < this.inputs.length; i++) {
      const output = ["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7"][i];
      this.serviceInterface.setOutput(
        output as any,
        (row >> i) & 1 ? true : false
      );
    }
  }

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    if (name === "serviceInterface") {
      ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"].forEach((y: any, i) => {
        this.updateOutput(this.scanningRow,i, this.serviceInterface.getInput(y))
      });
      this.serviceInterface.on("inputChanged", (event) => {
        const i = ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"].findIndex(
          (v) => v === event.signal
        );
        if (i >= 0) {
          this.updateOutput(this.scanningRow, i, event.value);
        }
      });
    } else {
      super.requestUpdate(name, oldValue, options);
    }
  }

  setMode(row: number) {
    if (row >= 0) {
      this.scan=false;
      this.setRow(row)
    }else{
      this.scan=true;
    }
  }

  render() {
    const belegung = variableCountToBelegung(this.inputs.length);
    const output_matrix =
      this.output_matrix.length > 0
        ? this.output_matrix
        : belegung.map((_, i) => this.outputs.map((j) => "0"));
    const scanningRowNumber = this.scanningRow;

    return html` <fieldset>
        <table class="table-fixed w-max">
          <thead>
            <tr>
              <th class="p-2">Aktiv</th>
              ${[...this.inputs]
                .reverse()
                .map(
                  (x, i) =>
                    html`<th class="p-2 ${!i ? "border-l" : ""}">${x}</th>`
                )}
              ${[...this.outputs]
                .reverse()
                .map(
                  (y, i) =>
                    html`<th class="p-2 ${!i ? "border-l" : ""}">${y}</th>`
                )}
            </tr>
          </thead>
          <tbody>
            ${belegung.map(
              (b, i) => html`
                ${i % 4 === 0
                  ? html`<tr>
                      <td
                        colspan="${this.inputs.length +
                        this.outputs.length +
                        1}"
                        class="border-b"
                      ></td>
                    </tr>`
                  : null}
                <tr
                  class="align-top transition-colors duration-700 ${i ==
                  scanningRowNumber
                    ? "bg-secondary transition-none"
                    : ""}"
                >
                  <td class="text-center">
                    <input
                      type="radio"
                      name="active"
                      @change="${() => this.setMode(i)}"
                    />
                  </td>
                  ${b.map(
                    (v, j) =>
                      html`<td class="text-center ${!j ? "border-l" : ""}">
                        ${v}
                      </td>`
                  )}
                  ${output_matrix[i].map(
                    (v, j) =>
                      html`<td class="text-center ${!j ? "border-l" : ""}">
                        ${v}
                      </td>`
                  )}
                </tr>
              `
            )}
            <tr>
              <td class="text-center">
                <input
                  type="radio"
                  name="active"
                  checked
                  @change="${() => this.setMode(-1)}"
                />
              </td>
              <td
                colspan="${this.inputs.length + this.outputs.length}"
                class="text-center"
              >
                Alle Belegungen
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
      <div class="h-8"></div>`;
  }
}
