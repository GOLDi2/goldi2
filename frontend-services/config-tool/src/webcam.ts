import { DeviceHandler } from '@cross-lab-project/soa-client';
import { WebcamService__Consumer } from '@cross-lab-project/soa-service-webcam';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import produce from "immer"


@customElement('soa-electrical-webcam')
export class Webcam extends LitElement {
  register(deviceHandler: DeviceHandler) {
    const webcamService = new WebcamService__Consumer("webcam");
    webcamService.on("track", (event) => {
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
      <div>
        <h1>Webcam</h1>
        <div id="webcam"></div>
      </div>
    `;
  }
}
