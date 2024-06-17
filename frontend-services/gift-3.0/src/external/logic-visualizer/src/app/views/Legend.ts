import {store} from "../model/store";
import {LitElement, html, property, customElement} from "lit-element";
import {connect} from "pwa-helpers";
import Dictionary from "../model/Dictionary";
import {reduxState} from "../model/reducer";
import {
    getCurrentInputsSelector, getInputVisibilitySelector,
    getCurrentOutputsSelector, getOutputVisibilitySelector,
    getCurrentStatesSelector,  getStateVisibilitySelector,
    getIsSequentialSelector
} from "../model/selectors";
import BoolPropOptions from "../model/BooleanProperty";
import translator from "../model/translator";
import {userChange} from "../model/actions";
import {UserChangeEvent} from "../model/Events";

@customElement('lv-legend')
export default class Legend extends connect(store)(LitElement) {

    @property({type: Object})   inputs: Dictionary<string> = {};
    @property({type: Object})   states: Dictionary<string> = {};
    @property({type: Object})   outputs: Dictionary<string> = {};

    @property({type: Object})   inputVisibility: Dictionary<Boolean> = {};
    @property({type: Object})   stateVisibility: Dictionary<Boolean> = {};
    @property({type: Object})   outputVisibility: Dictionary<Boolean> = {};

    @property(BoolPropOptions)          multiClockExecutionActive: boolean = false;
    @property(BoolPropOptions)          isSequential: boolean;
    @property(BoolPropOptions)          canSetState: boolean;
    @property(BoolPropOptions)          viewMode: boolean = false;

    // is called by LitElement on property changes
    render() {
        return html`
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
        
            ${this.isSequential ? html`<div class="lv-legend-spacer" style="padding-right: 3px;">${translator.t("Clock")}</div>` : ``}
            ${this.isSequential ? html`<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.inputs).map( inputName => {return html`
                <lv-io-variable name="${inputName}" value="${this.inputs[inputName]}" cantoggle="${!(this.multiClockExecutionActive || this.viewMode)}" issequential="${this.isSequential}"
                style="display: ${this.inputVisibility[inputName] ? `block` : `none`}; margin-top: 1px;"></lv-io-variable>
            `})}
            ${Object.keys(this.inputs).length > 0 ? html`<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.states).map(stateName => {return html`
                <lv-state-variable name="${stateName}" value="${this.states[stateName]}" cansetstate="${this.canSetState}"
                style="display: ${this.stateVisibility[stateName] ? `block` : `none`}; margin-top: 1px;"></lv-state-variable>
            `})}
            ${Object.keys(this.states).length > 0 ? html`<div class="lv-legend-spacer"></div>` : ``}
            
            ${Object.keys(this.outputs).map((outputName: string, index: number) => {return html`
                <lv-io-variable name="${outputName}" value="${this.outputs[outputName]}" cantoggle=${false} 
                style="display: ${this.outputVisibility[outputName] ? `block` : `none`}; margin-top: 1px;"></lv-io-variable>
            `})}
        `;
    }

    // is called by redux on state changes
    stateChanged(state: reduxState) {
        this.inputs                     = getCurrentInputsSelector(state);
        this.states                     = getCurrentStatesSelector(state);
        this.outputs                    = getCurrentOutputsSelector(state);
        this.multiClockExecutionActive  = state.multiClockExecutionActive;
        this.isSequential               = getIsSequentialSelector(state);
        this.canSetState                = state.canSetState;
        this.viewMode                   = state.viewMode;
        this.inputVisibility            = getInputVisibilitySelector(state);
        this.stateVisibility            = getStateVisibilitySelector(state);
        this.outputVisibility           = getOutputVisibilitySelector(state);
    }

    // is called by LitElement on the first ever update performed, before updated() is called
    firstUpdated(changedProperties) {
        this.shadowRoot.querySelectorAll("lv-io-variable").forEach(variable => {
            variable.addEventListener("lv-user-change", (e: UserChangeEvent) => { // relay to store
                store.dispatch(userChange(e.args));
            });
        });
    }
}