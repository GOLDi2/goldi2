import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler } from "@cross-lab-project/soa-client";
import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ElectricalConnection } from "./electricalConnection";
import { FileUpload } from './file';
import { Webcam } from "./webcam";

const device_id = "60895feb-00cb-4f60-bb96-2ee5a8edab14";
const client = new APIClient("https://api.goldi-labs.de");
const deviceHandler = new DeviceHandler();

import style from "./styles.css";
const stylesheet = unsafeCSS(style);
@customElement("ecp-app")
export class App extends LitElement {
  @state()
  private electrical: ElectricalConnection;
  @state()
  private file: FileUpload;
  @state()
  private webcam: Webcam;

  @state()
  private isLoading: boolean = false;

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);

    window.addEventListener("message", (event) => {
      if(event.data.token){
        this.start(event.data.token)
      }
    });
    // Send a message to the parent window
    window.parent.postMessage("ecp-loaded", "*");
  }

  async start(accesstoken: string) {
    client.accessToken=accesstoken;
    const token = await client.getToken(
      "https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e"
    );

    this.electrical = new ElectricalConnection("electrical");
    this.electrical.register(deviceHandler);

    this.file = new FileUpload("file");
    this.file.register(deviceHandler);

    this.webcam = new Webcam();
    this.webcam.register(deviceHandler);

    await deviceHandler.connect({
      endpoint: "wss://api.goldi-labs.de/devices/ws",
      id: "https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e",
      token,
    });

    // Wait for a second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.parent.postMessage("ecp-authorized", "*");
  }

  render() {
    return html`
      <div class="h-full flex flex-col" @webcam="${() => {this.isLoading = false;}}">
        <div class="bg-primary-900 w-full h-12"></div>
        <div class="grow flex w-full items-center">
          <div class="flex-1">${this.webcam}</div>
          <div class="flex-1 flex flex-col">
            <div class="p-4">${this.file}</div>
            <div class="p-4">${this.electrical}</div>
          </div>
        </div>
        <div class="bg-primary-100 w-full h-12"></div>
      </div>
      ${
        this.isLoading
          ? html`<div
              class="absolute top-0 left-0 w-full h-full bg-primary-900 bg-opacity-50 flex items-center justify-center"
            >
              Loading...
            </div>`
          : html``
      }
    `;
  }
}