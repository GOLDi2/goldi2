import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ElectricalConnection } from "./electricalConnection";
import { FileUpload } from "./file";
import { Webcam } from "./webcam";

import { DeviceHandler } from "./components/deviceHandler";
import "./components/dialog";
import "./components/progress";

const deviceHandler = new DeviceHandler();

import { Message } from "./message";
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
  private message: Message;

  @state()
  private isLoading: boolean = false;

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);

    this.electrical = new ElectricalConnection("electrical");
    this.electrical.register(deviceHandler);

    this.file = new FileUpload("file");
    this.file.register(deviceHandler);

    this.webcam = new Webcam();
    this.webcam.register(deviceHandler);

    this.message = new Message("message");
    this.message.register(deviceHandler);

    deviceHandler.connect();
    deviceHandler.onStateChange = () => {
      this.requestUpdate();
    };
  }

  render() {
    return deviceHandler.dialogWrap(html`
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
    `);
  }
}
