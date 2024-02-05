import { DeviceHandler } from '@cross-lab-project/soa-client';
import { WebcamService__Consumer } from '@cross-lab-project/soa-service-webcam';
import { LitElement, html, unsafeCSS, adoptStyles } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import produce from "immer"

import style from "./styles.css";
const stylesheet = unsafeCSS(style);
@customElement('soa-electrical-webcam')
export class Webcam extends LitElement {
  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);
  }

  register(deviceHandler: DeviceHandler) {
    const webcamService = new WebcamService__Consumer("webcam");
    webcamService.on("track", (event) => {
        this.dispatchEvent(new CustomEvent("webcam", { detail: event.track, bubbles: true, composed: true }));
        const webcamDiv = this.shadowRoot.getElementById("webcam");
        const video = document.createElement('video');
        const mediaStream=new MediaStream([event.track])
        video.srcObject = mediaStream;
        video.muted = true;
        video.autoplay = true;
        video.style.width = "100%";
        while (webcamDiv.firstChild) webcamDiv.removeChild(webcamDiv.firstChild);
        webcamDiv.append(video);
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
