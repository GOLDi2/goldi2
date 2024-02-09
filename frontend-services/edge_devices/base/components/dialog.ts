import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('component-dialog')
export class Dialog extends LitElement {
  @property({ type: Boolean })
  private open: boolean = false;
  @property({ type: Boolean })
  private dismissable: boolean = false;
  @property({ type: Boolean })
  private error: boolean = false;

  static styles = css`
    .wrapper {
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      display: flex;
      top: 0px;
      left: 0px;
      position: absolute;
      background-color: rgba(0, 0, 0, 0.5);
    }
    .error {
      background-color: rgba(255, 0, 0, 0.5);
    }
    .dialog {
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: white;
      opacity: 1;
    }
  `;

  render() {
    if (!this.open) {
      return html``;
    }
    return html`
      <div class="wrapper${this.error ? ' error' : ''}">
        <div class="dialog">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
