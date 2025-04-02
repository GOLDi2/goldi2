import { DeviceHandler } from '@cross-lab-project/soa-client';
import { WebcamService__Consumer } from '@cross-lab-project/soa-service-webcam';
import { LitElement, PropertyValues, adoptStyles, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from "./styles.css";
const stylesheet = unsafeCSS(style);
@customElement('soa-electrical-webcam')
export class Webcam extends LitElement {
  mediaStream?: MediaStream;
  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
    this.connectStream();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.connectStream();
  }

  connectStream() {
    if (this.mediaStream && this.shadowRoot) {
        const webcamDiv = this.shadowRoot.getElementById("webcam");
        if (!webcamDiv){
          setTimeout(() => this.connectStream(), 100);
          return;
        }
        const video = document.createElement('video');
        video.srcObject = this.mediaStream;
        video.muted = true;
        video.autoplay = true;
        video.style.width = "100%";
        while (webcamDiv.firstChild) webcamDiv.removeChild(webcamDiv.firstChild);
        webcamDiv.append(video);
    }
  }

  register(deviceHandler: DeviceHandler) {
    const webcamService = new WebcamService__Consumer("webcam");
    webcamService.on("track", (event) => {
        this.dispatchEvent(new CustomEvent("webcam", { detail: event.track, bubbles: true, composed: true }));
        this.mediaStream=new MediaStream([event.track])
        console.log("Webcam track event", this.mediaStream);
        this.connectStream();
    });
    deviceHandler.addService(webcamService);
  }

  render() {
    return html`
      <div class="p-2">
        <h1 class="text-2xl w-full text-center">Webcam</h1>
        <div class="aspect-[4/3] bg-primary-50 w-full" id="webcam"></div>
      </div>
    `;
  }
}
