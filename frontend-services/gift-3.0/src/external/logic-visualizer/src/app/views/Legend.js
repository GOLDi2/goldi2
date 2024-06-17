var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { store } from "../model/store";
import { LitElement, html, property, customElement } from "lit-element";
import { connect } from "pwa-helpers";
import { getCurrentInputsSelector, getInputVisibilitySelector, getCurrentOutputsSelector, getOutputVisibilitySelector, getCurrentStatesSelector, getStateVisibilitySelector, getIsSequentialSelector } from "../model/selectors";
import BoolPropOptions from "../model/BooleanProperty";
import translator from "../model/translator";
import { userChange } from "../model/actions";
let Legend = /** @class */ (() => {
    let Legend = class Legend extends connect(store)(LitElement) {
        constructor() {
            super(...arguments);
            this.inputs = {};
            this.states = {};
            this.outputs = {};
            this.inputVisibility = {};
            this.stateVisibility = {};
            this.outputVisibility = {};
            this.multiClockExecutionActive = false;
            this.viewMode = false;
        }
        // is called by LitElement on property changes
        render() {
            return html `
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
        
            ${this.isSequential ? html `<div class="lv-legend-spacer" style="padding-right: 3px;">${translator.t("Clock")}</div>` : ``}
            ${this.isSequential ? html `<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.inputs).map(inputName => {
                return html `
                <lv-io-variable name="${inputName}" value="${this.inputs[inputName]}" cantoggle="${!(this.multiClockExecutionActive || this.viewMode)}" issequential="${this.isSequential}"
                style="display: ${this.inputVisibility[inputName] ? `block` : `none`}; margin-top: 1px;"></lv-io-variable>
            `;
            })}
            ${Object.keys(this.inputs).length > 0 ? html `<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.states).map(stateName => {
                return html `
                <lv-state-variable name="${stateName}" value="${this.states[stateName]}" cansetstate="${this.canSetState}"
                style="display: ${this.stateVisibility[stateName] ? `block` : `none`}; margin-top: 1px;"></lv-state-variable>
            `;
            })}
            ${Object.keys(this.states).length > 0 ? html `<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.outputs).map((outputName, index) => {
                return html `
                <lv-io-variable name="${outputName}" value="${this.outputs[outputName]}" cantoggle=${false} 
                style="display: ${this.outputVisibility[outputName] ? `block` : `none`}; margin-top: 1px;"></lv-io-variable>
            `;
            })}
        `;
        }
        // is called by redux on state changes
        stateChanged(state) {
            this.inputs = getCurrentInputsSelector(state);
            this.states = getCurrentStatesSelector(state);
            this.outputs = getCurrentOutputsSelector(state);
            this.multiClockExecutionActive = state.multiClockExecutionActive;
            this.isSequential = getIsSequentialSelector(state);
            this.canSetState = state.canSetState;
            this.viewMode = state.viewMode;
            this.inputVisibility = getInputVisibilitySelector(state);
            this.stateVisibility = getStateVisibilitySelector(state);
            this.outputVisibility = getOutputVisibilitySelector(state);
        }
        // is called by LitElement on the first ever update performed, before updated() is called
        firstUpdated(changedProperties) {
            this.shadowRoot.querySelectorAll("lv-io-variable").forEach(variable => {
                variable.addEventListener("lv-user-change", (e) => {
                    store.dispatch(userChange(e.args));
                });
            });
        }
    };
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "inputs", void 0);
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "states", void 0);
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "outputs", void 0);
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "inputVisibility", void 0);
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "stateVisibility", void 0);
    __decorate([
        property({ type: Object })
    ], Legend.prototype, "outputVisibility", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Legend.prototype, "multiClockExecutionActive", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Legend.prototype, "isSequential", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Legend.prototype, "canSetState", void 0);
    __decorate([
        property(BoolPropOptions)
    ], Legend.prototype, "viewMode", void 0);
    Legend = __decorate([
        customElement('lv-legend')
    ], Legend);
    return Legend;
})();
export default Legend;
//# sourceMappingURL=Legend.js.map