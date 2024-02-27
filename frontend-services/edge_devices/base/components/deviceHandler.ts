import { APIClient } from "@cross-lab-project/api-client";
import { DeviceHandler as SoaDeviceHandler } from "@cross-lab-project/soa-client";
import { TemplateResult, html } from "lit";

import "./dialog";
import "./progress";

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

export class DeviceHandler extends SoaDeviceHandler {
  public client?: APIClient;
  public state:
    | "created"
    | "connecting"
    | "connected"
    | "running"
    | "failed"
    | "closed" = "created";
  public error?: string;
  public onStateChange?: () => void;

  constructor() {
    super();
    super.on("connectionsChanged", () => {
      if (
        Array.from(this.connections).every((c) => c[1].state === "connected")
      ) {
        this.state = "running";
        this.onStateChange && this.onStateChange();
      }
    });
    super.on("experimentStatusChanged", (statusUpdate) => {
      if (this.state !== statusUpdate.status) {
        if (statusUpdate.status === "failed") {
          this.error = statusUpdate.message;
          this.state = "failed";
        }
        if (statusUpdate.status === "running") {
          this.state = "running";
        }
        if (statusUpdate.status === "closed") {
          this.state = "closed";
        }
      }
    });
  }

  async connect(): Promise<void> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const device_url = urlParams.get("instanceUrl");
      const accesstoken = urlParams.get("deviceToken");
      if (!device_url || !accesstoken) {
        throw Error("No device URL or access token provided");
      }
      const {
        base_url,
        ws_endpoint,
        device_url: _device_url,
        token_endpoint,
      } = derive_endpoints_from_url(device_url);

      this.state = "connecting";
      this.onStateChange && this.onStateChange();
      this.client = new APIClient(base_url);
      this.client.accessToken = accesstoken;
      const token = await this.client.createWebsocketToken(token_endpoint);

      this.state = "connected";
      this.onStateChange && this.onStateChange();
      await super.connect({
        endpoint: ws_endpoint,
        id: _device_url,
        token,
      });
    } catch (e) {
      this.state = "failed";
      this.error = e.message;
      this.onStateChange && this.onStateChange();
    }
  }

  dialogWrap(children: TemplateResult) {
    switch (this.state) {
      case "created":
        return html`
          <component-dialog open>
            Waiting for Device Parameters
            <component-progress progress="indeterminate"></component-progress>
          </component-dialog>
        `;
      case "connecting":
        return html`
          <component-dialog open>
            Connecting
            <component-progress progress="indeterminate"></component-progress>
          </component-dialog>
        `;
      case "connected":
        return html` <component-dialog open>
          Waiting for experiment to start
          <component-progress progress="indeterminate"></component-progress>
        </component-dialog>`;
      case "failed":
        return html`
          <component-dialog open error>
            <h1>Failed to connect</h1>
            <p>${this.error}</p>
          </component-dialog>
        `;
      case "connected":
        return html` <component-dialog open>
          Experiment has been closed
          <component-progress progress="indeterminate"></component-progress>
        </component-dialog>`;
      default:
        return children;
    }
  }
}
