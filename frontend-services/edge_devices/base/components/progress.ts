import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('component-progress')
export class Dialog extends LitElement {
  @property()
  private progress: number | 'indeterminate' = 'indeterminate';

  static styles = css`
    .progress-bar {
      background-color: #d0d0d0;
      border-radius: 9999px;
      height: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    .progress {
      background-color: #003359;
      border-radius: 9999px;
      position: absolute;
      bottom: 0;
      top: 0;
      left: 0;
    }

    .indeterminate {
      background-color: #003359;
      border-radius: 9999px;
      position: absolute;
      bottom: 0;
      top: 0;
      width: 50%;
      animation-duration: 1s;
      animation-iteration-count: infinite;
      animation-name: indeterminate-progress-bar;
    }

    @keyframes indeterminate-progress-bar {
      from {
        left: -50%;
      }
      to {
        left: 100%;
      }
    }
  `;

  render() {
    if (this.progress !== 'indeterminate') {
      return html`
        <div class="progress-bar">
          <div class="progress" style="width: ${this.progress}%"></div>
        </div>
      `;
    }
    return html`
      <div class="progress-bar">
        <div class="progress indeterminate"></div>
      </div>
    `;
  }
}
