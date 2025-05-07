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
    | "microphone"
    | "connecting"
    | "connected"
    | "running"
    | "failed"
    | "closed" = "microphone";
  public error?: string;
  public onStateChange?: () => void;
  resolveMicrophone?: () => void = undefined;
  waitForMicrophone: Promise<void> = new Promise((resolve) => {
    this.resolveMicrophone = resolve;
  });

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
          this.onStateChange && this.onStateChange();
        }
        if (statusUpdate.status === "running") {
          this.state = "running";
          this.onStateChange && this.onStateChange();
        }
        if (statusUpdate.status === "closed") {
          this.state = "closed";
          this.onStateChange && this.onStateChange();
        }
      }
    });

    navigator.permissions.query(
      { name: 'microphone' as PermissionName }
    ).then((permissionStatus)=>{
      if (permissionStatus.state === "granted") {
        this.state = "created";
        this.resolveMicrophone && this.resolveMicrophone();
        this.onStateChange && this.onStateChange();
      }
    }).catch((e) => {
      // ignore
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

      await this.waitForMicrophone;

      this.state = "connecting";
      this.onStateChange && this.onStateChange();
      this.client = new APIClient(base_url);
      this.client.accessToken = accesstoken;
      const token = await this.client.createWebsocketToken(token_endpoint);

      this.state = "connected";
      this.onStateChange && this.onStateChange();
      super.on("experimentStatusChanged", async (statusUpdate) => {
        if (
          statusUpdate.message &&
          statusUpdate.message.startsWith(
            "The following devices did not connect in time: "
          )
        ) {
          const devicesStrings = statusUpdate.message
            .split("The following devices did not connect in time: ")[1]
            .split(", ");
          const deviceUrls = devicesStrings.map((deviceString) =>
            deviceString.replace(/"/g, "").trim()
          );
          const devices = await Promise.all(
            deviceUrls.map((url) => this.client.getDevice(url))
          );

          this.state = "failed";
          this.error = `The following devices did not connect in time: ${devices
            .map((device) => device.name)
            .join(", ")}`;
          this.onStateChange && this.onStateChange();
        } else if (statusUpdate.status === "failed") {
          this.state = "failed";
          this.onStateChange && this.onStateChange();
        } else if (statusUpdate.status === "closed") {
          this.state = "closed";
          this.onStateChange && this.onStateChange();
        }
      });
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
      case "microphone":
        return html`
          <component-dialog open>
            <h1 style="font-size: 1.5rem;">Microphone Permission</h1>
            <p style="margin: 0.5rem 0;">
              For this site to work, you need to allow access to your microphone. This will also the site to gather your ip address, so that we can connect to other devices directly. We do not actually record any audio. If you deny access, you may experience issues with the site.
            </p>
            <div style="text-align: center;">
            <button style="border-radius: 5px; background: #04AA6D; font-size: 1rem; color: #ffffff; padding: 0.7rem 0.9rem; margin: 0.5rem 0;" @click="${() => {
              navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                stream.getTracks().forEach((track) => track.stop());
                this.state = "created";
                this.resolveMicrophone && this.resolveMicrophone();
                this.onStateChange && this.onStateChange();
              });
            }}">Allow</button>
            <button style="border-radius: 5px; background: #f44336; font-size: 1rem; color: #ffffff; padding: 0.7rem 0.9rem; margin: 0.5rem 0;" @click="${() => {
              this.state = "created";
              this.resolveMicrophone && this.resolveMicrophone();
              this.onStateChange && this.onStateChange();
            }
            }">Deny</button></div>
          </component-dialog>
        `;
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
      case "closed":
        return html`
          <component-dialog open>
            <h1>Experiemnt finished</h1>
          </component-dialog>
        `;
      default:
        return children;
    }
  }
}
