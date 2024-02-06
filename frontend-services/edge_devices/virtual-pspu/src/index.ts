import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { AxisPortalAnimation } from './axis_portal/animation';
import { AxisPortal } from './axis_portal/service';
import { DeviceHandler } from './components/deviceHandler';

const deviceHandler = new DeviceHandler();

@customElement('frontend-app')
export class App extends LitElement {
  animation = new AxisPortalAnimation();
  axisPortal: AxisPortal;

  constructor() {
    super();
    this.axisPortal = new AxisPortal(this.animation);
    deviceHandler.onStateChange = () => {
      this.requestUpdate();
    };

    this.axisPortal.register(deviceHandler);
    deviceHandler.connect();
  }

  render() {
    return deviceHandler.dialogWrap(html`${unsafeHTML(this.animation.SVG)}`);
  }

  firstUpdated(): void {
    this.animation.init(this.shadowRoot);
  }
}
