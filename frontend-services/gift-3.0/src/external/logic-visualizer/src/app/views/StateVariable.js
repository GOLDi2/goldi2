var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement } from "lit-element";
import { property } from "lit-element";
import { MDCTextField } from "@material/textfield/component";
import BoolPropOptions from "../model/BooleanProperty";
import { dispatchUserChangeEvent } from "../model/Events";
let StateVariable = /** @class */ (() => {
    let StateVariable = class StateVariable extends LitElement {
        constructor() {
            super(...arguments);
            this.name = "";
            this.value = "0";
        }
        // is called by LitElement on property changes
        render() {
            let [start, ...rest] = this.name.split("_");
            if (this.canSetState) {
                return html `
                <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
                ${start}<sub>${rest.join("_")}</sub>: 
                <div class="mdc-text-field mdc-text-field--outlined lv-state-input-container">
                  <input class="mdc-text-field__input lv-state-input" value="${this.value}" placeholder="${this.value}" @input="${this.sendEventQueue}" @click="${(e) => { e.target.value = ""; }}">
                  <div class="mdc-notched-outline">
                    <div class="mdc-notched-outline__leading"></div>
                    <div class="mdc-notched-outline__trailing"></div>
                  </div>
                </div>
            `;
            }
            else {
                return html `
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            ${start}<sub>${rest.join("_")}</sub>:
            <button class="mdc-button mdc-button--raised lv-display-button">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">${this.value}</span>
            </button>
            `;
            }
        }
        // is called by LitElement after an update
        updated(changedProperties) {
            // in order for MDCs to work properly (display animations) they need to be attached to a JS object
            // since there can be new MDCs in each render (in general), we need to do this here (after the render)
            // in order to avoid unnecessary attaching, we make the MDC remember that it has been initialized
            this.shadowRoot.querySelectorAll(".mdc-text-field").forEach(tf => {
                if (tf.controllerObject === undefined) {
                    tf["controllerObject"] = MDCTextField.attachTo(tf);
                }
            });
        }
        sendEventQueue(e) {
            if (this.canSetState && e.target.value !== "") { // one could add protection for illegal state names here but this way it also works if the simulator is e.g. using "idleState" etc.
                setTimeout(this.sendEvent, 1000, e.target, e.target.value, this.name);
            }
        }
        sendEvent(target, oldValue, name) {
            if (target.value === oldValue) { // if the value hasn't changed in the past second, send the event. This prohibits unnecessary Events.
                dispatchUserChangeEvent({ states: [{ name: name, value: oldValue }] });
            }
        }
    };
    __decorate([
        property({ type: String })
    ], StateVariable.prototype, "name", void 0);
    __decorate([
        property({ type: String })
    ], StateVariable.prototype, "value", void 0);
    __decorate([
        property(BoolPropOptions)
    ], StateVariable.prototype, "canSetState", void 0);
    StateVariable = __decorate([
        customElement('lv-state-variable')
    ], StateVariable);
    return StateVariable;
})();
export default StateVariable;
//# sourceMappingURL=StateVariable.js.map