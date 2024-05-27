import {LitElement, html, property, customElement} from "lit-element";
import {MDCRipple} from "@material/ripple/component";
import {dispatchUserChangeEvent, UserChangeEvent} from "../model/Events";
import BoolPropOptions from "../model/BooleanProperty";

@customElement('lv-io-variable')
export default class IOVariable extends LitElement {

    @property({type: String})   name: string;
    @property({type: String})   value: string;
    @property(BoolPropOptions)          canToggle: boolean = false;
    @property(BoolPropOptions)          isSequential: boolean;

    // is called by LitElement on property changes
    render() {
        let [start, ...rest] = this.name.split("_");
        return html `
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            ${start}<sub>${rest.join("_")}</sub>:
            <button class="mdc-button mdc-button--raised lv-display-button" @click="${this.sendEvent}">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">${this.value}</span>
            </button>
            
        `;
    }

    // is called by LitElement after an update
    updated(changedProperties) {
        // in order for MDCs to work properly (display animations) they need to be attached to a JS object
        // since there can be new MDCs in each render (in general), we need to do this here (after the render)
        // in order to avoid unnecessary attaching, we make the MDC remember that it has been initialized
        this.shadowRoot.querySelectorAll(".mdc-button").forEach(btn => {
            if((btn as any).controllerObject === undefined) {
                btn["controllerObject"] = MDCRipple.attachTo(btn);
            }
        });
    }

    sendEvent() {
        if(this.canToggle){
            if(this.isSequential) { // if combinatorial, event is only sent after user presses the button
                dispatchUserChangeEvent({inputs: [{name: this.name, value: String((Number(this.value) + 1) % 2)}]});
            } else {
                this.dispatchEvent(new UserChangeEvent({inputs: [{name: this.name, value: String((Number(this.value) + 1) % 2)}]})); // no access to store here
            }
        }
    }
}