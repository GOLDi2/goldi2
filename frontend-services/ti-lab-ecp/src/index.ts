import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler } from "@cross-lab-project/soa-client";
import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";

let device_url = "";
const client = new APIClient("https://api.dev.goldi-labs.de");
const deviceHandler = new DeviceHandler();

import style from "./styles.css";
import { generateSubmissionCode } from "./submissionCodeGenerator";
import {
  ElectricalConnectionService,
  GPIO,
} from "@cross-lab-project/soa-service-electrical";
import { TruthTableService } from "./truthTableService";
const stylesheet = unsafeCSS(style);

function derive_endpoints_from_url(url: string, fallback_base_url?: string) {
  const url_match = new RegExp(
    "^(https?://[^/]+)?/?(devices/([^/]*))(/token|/ws)?$"
  ).exec(url);

  if (!url_match) throw Error("Invalid URL");
  const base_url = url_match[1] ?? fallback_base_url;
  if (!base_url) throw Error("Base URL for device not found");
  const device_url = base_url + "/" + url_match[2];
  const token_endpoint = device_url;
  const ws_endpoint = (base_url + "/devices/websocket").replace("http", "ws");
  return { base_url, device_url, token_endpoint, ws_endpoint };
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

@customElement("ecp-app")
export class App extends LitElement {
  @state()
  private isLoading: boolean = false;
  @state()
  private solved: boolean = false;
  @state()
  private checking: boolean = false;
  @state()
  private error: boolean = false;

  @state()
  private input_variables: number = 0;
  @state()
  private output_variables: number = 0;
  private function_indices: number[];
  private experiment_url: string = "";

  @state()
  private scanningRowNumber: number = -1;
  private _truthTableService = new TruthTableService();

  constructor() {
    super();
    this._truthTableService.on("scanStateChanged", (event) => {
      this.scanningRowNumber = event.scanningInputIndex;
    });
    this._truthTableService.on("truthTableChanged", () => {
      this.requestUpdate();
    });
  }

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

  setMode(input: number) {
    if (input === -1) {
      this._truthTableService.mode = "scanTable";
    } else {
      this._truthTableService.scanningInputIndex = input;
      this._truthTableService.mode = "scanIndex";
    }
  }

  async submit() {
    const _oldMode = this._truthTableService.mode;
    const finishedPromise = new Promise<void>((resolve) => {
      this._truthTableService.once("fullScanComplete", () => resolve());
    });
    this._truthTableService.mode = "scanTable";
    this.checking = true;
    await finishedPromise;

    const real_function_indices = this._truthTableService.getFunctionIndices();
    const solved = real_function_indices.every(
      (x, i) => x === this.function_indices[i]
    );
    if (solved) {
      try {
        await client.updateExperiment(this.experiment_url, {
          lti_grade: 1,
        });
      } catch (e) {
        console.error(e);
        this.error = true;
        this.checking = false;
        setTimeout(() => (this.error = false), 3000);
      }
      this.solved = true;
    }
    this.checking = false;

    this._truthTableService.mode = _oldMode;
  }

  async configure(configuration: Record<string, unknown>) {
    const { input_variables, function_index, experimentUrl } =
      configuration as {
        input_variables: number;
        function_index: number[];
        experimentUrl: string;
      };
    const output_variables = function_index.length;
    this.input_variables = input_variables;
    this.output_variables = output_variables;
    this.function_indices = function_index;
    this._truthTableService.input_variables = input_variables;
    this._truthTableService.output_variables = output_variables;
    this.experiment_url = experimentUrl;
  }

  async start(accesstoken: string) {
    console.log({ accesstoken, device_url });
    const {
      base_url,
      ws_endpoint,
      device_url: _device_url,
      token_endpoint,
    } = derive_endpoints_from_url(device_url);

    client.url = base_url;
    client.accessToken = accesstoken;
    const token = await client.createWebsocketToken(token_endpoint);

    deviceHandler.addService(this._truthTableService);
    deviceHandler.on("configuration", (configuration) => {
      this.configure(configuration);
    });

    await deviceHandler.connect({
      endpoint: ws_endpoint,
      id: _device_url,
      token,
    });
  }

  render() {
    const belegung = variableCountToBelegung(this.input_variables);
    const output_matrix = belegung.map((_, i) =>
      [...Array(this.output_variables).keys()]
        .reverse()
        .map((j) => (this._truthTableService.getOutput(i, j) ? "1" : "0"))
    );
    const scanningRowNumber = this.scanningRowNumber;
    return html`
      <div class="h-full flex flex-col items-center justify-center gap-3">
        <fieldset>
          <table class="table-fixed w-max">
            <thead>
              <tr>
                <th class="p-2">Aktiv</th>
                ${[...Array(this.input_variables).keys()]
                  .reverse()
                  .map(
                    (x, i) =>
                      html`<th class="p-2 ${!i ? "border-l" : ""}">
                        x<sub>${x}</sub>
                      </th>`
                  )}
                ${[...Array(this.output_variables).keys()]
                  .reverse()
                  .map(
                    (y, i) =>
                      html`<th class="p-2 ${!i ? "border-l" : ""}">
                        y<sub>${y}</sub>
                      </th>`
                  )}
              </tr>
            </thead>
            <tbody>
              ${belegung.map(
                (b, i) => html`
                  ${i % 4 === 0
                    ? html`<tr>
                        <td
                          colspan="${this.input_variables +
                          this.output_variables +
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
                  colspan="${this.input_variables + this.output_variables}"
                  class="text-center"
                >
                  Alle Belegungen
                </td>
              </tr>
            </tbody>
          </table>
        </fieldset>
        <button
          @click=${this.submit}
          class="bg-primary text-white rounded-lg p-3"
        >
          Schaltung überprüfen
        </button>
      </div>
      ${this.isLoading
        ? html`<div
            class="absolute top-0 left-0 w-full h-full bg-primary bg-opacity-50 flex items-center justify-center"
          >
            Loading...
          </div>`
        : html``}
      ${this.checking
        ? html`<div
            class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          >
            <span class="p-4 rounded bg-white">Überprüfe Schaltung...</span>
          </div>`
        : html``}
      ${this.solved
        ? html`<div
            class="absolute top-0 left-0 w-full h-full bg-[#189618] bg-opacity-50 flex items-center justify-center"
          >
            <span class="p-4 rounded bg-white"
              >Aufgabe erfolgreich gelöst. Sie können dieses Fenster nun
              schließen.</span
            >
          </div>`
        : html``}
      ${this.error
        ? html`<div
            class="absolute top-0 left-0 w-full h-full bg-[#961818] bg-opacity-50 flex items-center justify-center"
          >
            <span class="p-4 rounded bg-white"
              >Es ist ein Fehler aufgetreten. Bitte versuchen Sie es
              erneut.</span
            >
          </div>`
        : html``}
    `;
  }
}
