import { APIClient } from "@cross-lab-project/api-client";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ecs-connect-panel")
export class EcsConnectPanel extends LitElement {
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  protected render(): unknown {
    return html`<div
      class="bg-slate-700 drop-shadow-lg p-4 flex flex-col justify-center items-center rounded-xl"
    >
      <div class="flex flex-col mb-2">
        <label for="input-api-url" class="text-white">API-URL</label>
        <input
          id="input-api-url"
          type="text"
          class="p-2 rounded-lg bg-slate-100"
          value="${ifDefined(localStorage.getItem("apiUrl") ?? undefined)}"
        />
      </div>
      <div class="flex flex-col mb-2">
        <label for="input-device-url" class="text-white">Device-URL</label>
        <input
          id="input-device-url"
          type="text"
          class="p-2 rounded-lg bg-slate-100"
          value="${ifDefined(localStorage.getItem("deviceUrl") ?? undefined)}"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="input-device-token" class="text-white">Device-Token</label>
        <input
          id="input-device-token"
          type="text"
          class="p-2 rounded-lg bg-slate-100"
          value="${ifDefined(localStorage.getItem("deviceToken") ?? undefined)}"
        />
      </div>
      <button
        @click=${this.onClick}
        class="bg-slate-500 hover:bg-slate-400 active:bg-slate-300 p-2 w-full rounded-lg"
      >
        Connect
      </button>
    </div>`;
  }

  private async onClick() {
    const inputApiUrl = document.getElementById(
      "input-api-url"
    ) as HTMLInputElement;
    const inputDeviceUrl = document.getElementById(
      "input-device-url"
    ) as HTMLInputElement;
    const inputDeviceToken = document.getElementById(
      "input-device-token"
    ) as HTMLInputElement;

    const apiClient = new APIClient(inputApiUrl.value, inputDeviceToken.value);
    const websocketToken = await apiClient.createWebsocketToken(
      inputDeviceUrl.value
    );

    localStorage.setItem("apiUrl", inputApiUrl.value);
    localStorage.setItem("deviceUrl", inputDeviceUrl.value);
    localStorage.setItem("deviceToken", inputDeviceToken.value);

    const connectionDataEvent = new CustomEvent("connection-data", {
      detail: {
        deviceUrl: inputDeviceUrl.value,
        websocketUrl:
          inputApiUrl.value.replace("http", "ws") +
          (inputApiUrl.value.endsWith("/")
            ? "devices/websocket"
            : "/devices/websocket"),
        websocketToken,
      },
    });

    this.dispatchEvent(connectionDataEvent);
  }
}
