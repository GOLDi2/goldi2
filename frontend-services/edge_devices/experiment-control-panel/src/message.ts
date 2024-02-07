import { DeviceHandler } from "@cross-lab-project/soa-client";
import { MessageService__Consumer } from "@cross-lab-project/soa-service-message";
import { MessageServiceEvent } from "@cross-lab-project/soa-service-message/lib/types/messages";
import { LitElement, html, adoptStyles, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import produce from "immer";

import style from "./styles.css";
const stylesheet = unsafeCSS(style);

@customElement("soa-electrical-message")
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
  protected _messages: MessageServiceEvent[] = [];

  register(deviceHandler: DeviceHandler) {
    const service = new MessageService__Consumer(this.name);

    service.on("message", (message) => {
      this._messages = produce(this._messages, (draft) => {
        draft.push(message);
      });
    });

    deviceHandler.addService(service);
  }

  render() {
    return html`
      <div>
        <h1 class="text-2xl text-center">Messages:</h1>
        <div class="flex flex-col w-full items-center">
          ${this._messages.map((message) =>
            message.message_type === "error"
              ? html`<span class="text-red-500">${message.message}</span>`
              : html`<span class="text-blue-500">${message.message}</span>`
          )}
        </div>
      </div>
    `;
  }
}
