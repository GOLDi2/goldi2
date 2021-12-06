import {LitElement, html, property} from '@polymer/lit-element';
import {MDCRipple} from '@material/ripple/index';

class Footer extends LitElement {

  constructor() {
    super();
  }

  createRenderRoot() {
    return this;
  }

  // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
  render() {
      return html`
        <button class="mdc-button header-button" id="footer-close" @click="${() => {
        this.dispatchEvent(new CustomEvent('wide-close', {bubbles: true}));
      }}">
            <i class="material-icons">close</i>
            <span>Close</span>
        </button>
    `;
  }

  firstUpdated(){
    new MDCRipple(this.querySelector('#footer-close'));
  }

}
customElements.define('wide-footer', Footer);