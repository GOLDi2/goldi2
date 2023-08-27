import { DeviceHandler } from "@cross-lab-project/soa-client";
import { ParameterService__Producer } from "@cross-lab-project/soa-service-parameter";
import { ParameterDescription} from "@cross-lab-project/soa-service-parameter/lib/types/messages";
import { LitElement, html, adoptStyles, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import produce from "immer";

import style from "./styles.css";
const stylesheet = unsafeCSS(style);

@customElement("soa-electrical-parameter")
export class Message extends LitElement {
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
  protected _parameters: ParameterDescription[] = [];

  register(deviceHandler: DeviceHandler) {
    const service = new ParameterService__Producer(this.name);

    service.on("setup", (event) => {
      this._parameters = event.parametes;
    });

    deviceHandler.addService(service);
  }

  render() {
    return html`
      <div>
        <h1 class="text-2xl text-center">Parameters:</h1>
        <div class="flex flex-col w-full items-center">
          ${this._parameters.map((message) =>
            message.message_type === "error"
              ? html`<span class="text-red-500">${message.message}</span>`
              : html`<span class="text-blue-500">${message.message}</span>`
          )}
        </div>
      </div>
    `;
  }
}
