var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, property, customElement } from "lit-element";
import { MDCRipple } from "@material/ripple/component";
import { dispatchUserChangeEvent, UserChangeEvent } from "../model/Events";
import BoolPropOptions from "../model/BooleanProperty";
let IOVariable = /** @class */ (() => {
    let IOVariable = class IOVariable extends LitElement {
        constructor() {
            super(...arguments);
            this.canToggle = false;
        }
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
                if (btn.controllerObject === undefined) {
                    btn["controllerObject"] = MDCRipple.attachTo(btn);
                }
            });
        }
        sendEvent() {
            if (this.canToggle) {
                if (this.isSequential) { // if combinatorial, event is only sent after user presses the button
                    dispatchUserChangeEvent({ inputs: [{ name: this.name, value: String((Number(this.value) + 1) % 2) }] });
                }
                else {
                    this.dispatchEvent(new UserChangeEvent({ inputs: [{ name: this.name, value: String((Number(this.value) + 1) % 2) }] })); // no access to store here
                }
            }
        }
    };
    __decorate([
        property({ type: String })
    ], IOVariable.prototype, "name", void 0);
    __decorate([
        property({ type: String })
    ], IOVariable.prototype, "value", void 0);
    __decorate([
        property(BoolPropOptions)
    ], IOVariable.prototype, "canToggle", void 0);
    __decorate([
        property(BoolPropOptions)
    ], IOVariable.prototype, "isSequential", void 0);
    IOVariable = __decorate([
        customElement('lv-io-variable')
    ], IOVariable);
    return IOVariable;
})();
export default IOVariable;
//# sourceMappingURL=IOVariable.js.map