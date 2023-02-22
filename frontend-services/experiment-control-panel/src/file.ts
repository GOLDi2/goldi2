import { DeviceHandler } from "@cross-lab-project/soa-client";
import { FileService__Producer } from "@cross-lab-project/soa-service-file";
import { LitElement, html, adoptStyles, unsafeCSS } from "lit";
import { customElement, query } from "lit/decorators.js";


import style from "./styles.css";
const stylesheet = unsafeCSS(style);

@customElement("soa-file")
export class FileUpload extends LitElement {
  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
  }

  @query("input") input: HTMLInputElement;

  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  private file_service: FileService__Producer;

  register(deviceHandler: DeviceHandler) {
    this.file_service = new FileService__Producer(this.name);

    deviceHandler.addService(this.file_service);
  }

  change = async (event: Event) => {
    console.log(this.input.files[0])
    const content = new Uint8Array(await this.input.files[0].arrayBuffer());
    const fileNameArray = this.input.files[0].name.split('.');
    const fileType = fileNameArray[fileNameArray.length-1];
    this.file_service.sendFile(fileType, content);
  }

  render() {
    return html`
      <div>
        <h1 class="text-2xl text-center">File Upload</h1>
        <div class="flex flex-col w-full items-center">
          <input type="file" @change=${this.change}/>
        </div>
      </div>
    `;
  }
}
