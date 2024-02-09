import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler } from "@cross-lab-project/soa-client";
import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ElectricalConnection } from "./electricalConnection";
import { FileUpload } from "./file";
import { Webcam } from "./webcam";

let device_url = "";
const client = new APIClient("https://api.dev.goldi-labs.de");
const deviceHandler = new DeviceHandler();

import style from "./styles.css";
import { Message } from "./message";
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
@customElement("ecp-app")
export class App extends LitElement {
  @state()
  private electrical: ElectricalConnection;
  @state()
  private file: FileUpload;
  @state()
  private webcam: Webcam;
  @state()
  private message: Message;

  @state()
  private isLoading: boolean = false;

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
    } else {
      window.addEventListener("message", (event) => {
        if (event.data.token) {
          device_url = event.data.device_url;
          this.start(event.data.token);
        }
      });
      // Send a message to the parent window
      if (window.parent) window.parent.postMessage("ecp-loaded", "*");
      if (window.opener) window.opener.postMessage("ecp-loaded", "*");
    }
  }

  async start(accesstoken: string) {
    console.log({ accesstoken, device_url });
    const { base_url ,ws_endpoint, device_url: _device_url, token_endpoint } = derive_endpoints_from_url(device_url);

    client.url = base_url
    client.accessToken = accesstoken;
    const token = await client.createWebsocketToken(token_endpoint);

    this.electrical = new ElectricalConnection("electrical");
    this.electrical.register(deviceHandler);

    this.file = new FileUpload("file");
    this.file.register(deviceHandler);

    this.webcam = new Webcam();
    this.webcam.register(deviceHandler);

    this.message = new Message("message");
    this.message.register(deviceHandler);


    await deviceHandler.connect({
      endpoint: ws_endpoint,
      id: _device_url,
      token,
    });

    // Wait for a second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (window.parent) window.parent.postMessage("ecp-authorized", "*");
    if (window.opener) window.opener.postMessage("ecp-authorized", "*");
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
        <div class="grow flex w-full items-center flex-wrap">
          <div class="flex-1 shrink-0 basis-96">${this.webcam}</div>
          <div class="flex-1 shrink-0 basis-96 flex flex-col">
            <div class="p-4">${this.file}</div>
            <div class="p-4">${this.electrical}</div>
          </div>
        </div>
        <div>${this.message}</div>
        <div class="bg-primary-100 w-full h-12"></div>
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
