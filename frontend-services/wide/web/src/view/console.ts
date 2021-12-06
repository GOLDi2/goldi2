import { LitElement, html, property } from '@polymer/lit-element';
import { MDCRipple } from '@material/ripple/index';

import {IModel} from '../model'

class Console extends LitElement {
    @property()
    model: IModel;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
        <div class="wide-console-header">
            <span>
                Console
            </span>
            <button class="mdc-icon-button" @click="${() => { this.dispatchEvent(new CustomEvent('wide-console', { bubbles: true })); }}">
                <i class="material-icons">${this.model && this.model.isConsoleVisible?'keyboard_arrow_down':'keyboard_arrow_up'}</i>
            </button>
        </div>
        <div class="wide-console-content">${this.model?this.model.consoleOutput:''}</div>
    `;
    }

    firstUpdated() {
        new MDCRipple(this.querySelector('.mdc-icon-button')).unbounded = true;
    }

    updated(){
        if(this.model && this.model.isConsoleVisible){
            let rect=this.lastElementChild.getBoundingClientRect();
            this.style.height=`${rect.height+30}px`;
        }else{
            this.style.height=`32px`;
        }
    }
}
customElements.define('wide-console', Console);