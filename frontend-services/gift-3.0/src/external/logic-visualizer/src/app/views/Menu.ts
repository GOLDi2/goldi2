import {store} from "../model/store";
import {LitElement, html, css, property, customElement} from "lit-element";
import {connect} from "pwa-helpers";
import {reduxState} from "../model/reducer";
import translator from "../model/translator";
import {MDCTextField} from "@material/textfield/component";
import {MDCRipple} from "@material/ripple/component";
import {MDCMenu} from "@material/menu/component";
import {
    getCurrentInputsSelector,
    getCurrentOutputsSelector,
    getCurrentStatesSelector,
    getIsSequentialSelector
} from "../model/selectors";
import BoolPropOptions from "../model/BooleanProperty";
import {
    dispatchClockEvent,
    dispatchResetEvent,
    dispatchUserChangeEvent,
    ExportEvent,
    MachineVariable
} from "../model/Events";
import {importAction, toggleMCE, visibilityAction, VisibilityAction} from "../model/actions";
import Dictionary from "../model/Dictionary";
import {MDCCheckbox} from "@material/checkbox/component";
import {MDCFormField} from "@material/form-field/component";

@customElement('lv-menu')
export default class Menu extends connect(store)(LitElement) {

    @property(BoolPropOptions) isSequential: boolean = true;
    @property(BoolPropOptions) multiClockExecutionActive;
    @property(BoolPropOptions) viewMode: boolean = false;
    @property({type: Object})   inputs: Dictionary<string> = {};
    @property({type: Object})   states: Dictionary<string> = {};
    @property({type: Object})   outputs: Dictionary<string> = {};
    totalMCE: number; // the number in mce-step-number-input when MCE was started. If MCE completes, this is written back into mce-step-number-input.
    stepInputMCE; // pointer to mce-step-number-input element. This is necessary because using timeout changes "this" to "window"
    periodInputMCE; // pointer to mce-period-input element. This is necessary because using timeout changes "this" to "window"

    // is called by LitElement on property changes
    render() {
        let stepButtons;
        if(this.isSequential) {
            stepButtons = html`
                <!-- clock once button -->
                <button id="clock-button" class="mdc-button lv-button" @click="${dispatchClockEvent}">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">${translator.t("sequentialStepButton")}</span>
                </button> 
                
                <!-- input for number of clocks to do in multi-clock-execution -->
                <div class="mdc-text-field lv-text-field" style="">
                    <div class="mdc-text-field__ripple"></div>
                    <input class="mdc-text-field__input" id="mce-step-number-input" style="width: min-content;">
                    <label for="mce-step-number-input" class="mdc-floating-label lv-text-field-label" id="for-mce-step-number-input">${translator.t("MCEStepNumber")}</label>
                    <div class="mdc-line-ripple"></div>
                </div>
                
                <!-- input for number of milliseconds  to wait between clocks in multi-clock-execution -->
                <div class="mdc-text-field lv-text-field" style="">
                    <div class="mdc-text-field__ripple"></div>
                    <input class="mdc-text-field__input" id="mce-period-input">
                    <label for="mce-period-input" class="mdc-floating-label lv-text-field-label" id="for-mce-period-input">${translator.t("MCEPeriod")}</label>
                    <div class="mdc-line-ripple"></div>
                </div>
                
                <!-- button  that starts/pauses multi-clock-execution -->
                <button id="mce-button" class="mdc-button lv-button" @click="${this.multiClockExecutionActive ? this.stopMCE : this.startMCE}">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">${this.multiClockExecutionActive ? translator.t("MCEStopButton") : translator.t("MCEGoButton")}</span>
                </button>
            `;
        } else {
            stepButtons = html`
                <!-- calculate output button -->
                <button id="calc-button" class="mdc-button lv-button" @click="${this.combinatorialCalculation}">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">${translator.t("combinatorialStepButton")}</span>
                </button>            
            `;
        }

        return  html`
            <link rel="stylesheet" type="text/css" href="./dist/bundle.css">
            
            ${stepButtons}
            
            <!-- reset button -->
            <button class="mdc-button lv-button" @click="${dispatchResetEvent}">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">${translator.t("ResetButton")}</span>
            </button>
            
            <!-- button that prompts file import -->
            <button class="mdc-button lv-button" @click="${this.importWaveJSON}">
                <div class="mdc-button__ripple"></div>
                <span class="mdc-button__label">${translator.t("ImportButton")}</span>
            </button>
            
            <!-- button that opens menu to choose export format -->
            <div class="mdc-menu-surface--anchor" style="display: inline-block;">
                <button class="mdc-button lv-button" @click="${this.openExportMenu}">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">${translator.t("ExportButton")}</span>
                </button>
                <div class="mdc-menu mdc-menu-surface" id="exportMenu">
                  <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    <li class="mdc-list-item" role="menuitem" @click="${this.exportWaveJSON}">
                      <span class="mdc-list-item__text">${translator.t("exportWaveJSON")}</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem" @click="${this.exportSVG}">
                      <span class="mdc-list-item__text">${translator.t("exportSVG")}</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem" @click="${this.exportPNG}">
                      <span class="mdc-list-item__text">${translator.t("exportPNG")}</span>
                    </li>
                  </ul>
                </div>
            </div>
            
            <!-- button that opens menu to set visibility -->
            <div class="mdc-menu-surface--anchor" style="display: inline-block;">
                <button class="mdc-button lv-button" @click="${this.openVisibilityMenu}">
                    <div class="mdc-button__ripple"></div>
                    <span class="mdc-button__label">${translator.t("VisibilityButton")}</span>
                </button>
                <div class="mdc-menu mdc-menu-surface" id="visibilityMenu">
                  <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    ${Object.keys(this.inputs).map(key => {
                        return html`
                            <li class="mdc-list-item" role="menuitem" @click="${this.stopEventPropagation}">
                                <div id="form-field-${key}" class="mdc-form-field">
                                  <div class="mdc-checkbox">
                                    <input type="checkbox"
                                           class="mdc-checkbox__native-control"
                                           id="checkbox-${key}" laneClass="${VisibilityAction.INPUT}" @change="${this.setVisibility}"/>
                                    <div class="mdc-checkbox__background">
                                      <svg class="mdc-checkbox__checkmark"
                                           viewBox="0 0 24 24">
                                        <path class="mdc-checkbox__checkmark-path"
                                              fill="none"
                                              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                                      </svg>
                                      <div class="mdc-checkbox__mixedmark"></div>
                                    </div>
                                    <div class="mdc-checkbox__ripple"></div>
                                  </div>
                                  <label for="checkbox-${key}">${html`${key.split("_")[0]}<sub>${key.split("_").slice(1).join("_")}</sub>`}</label>
                                </div>
                            </li>`;})}
                    <div class="lv-menu-divider"></div>
                    ${Object.keys(this.states).map(key => {
                        return html`
                            <li class="mdc-list-item" role="menuitem" @click="${this.stopEventPropagation}">
                                <div id="form-field-${key}" class="mdc-form-field">
                                  <div class="mdc-checkbox">
                                    <input type="checkbox"
                                           class="mdc-checkbox__native-control"
                                           id="checkbox-${key}" laneClass="${VisibilityAction.STATE}" @change="${this.setVisibility}"/>
                                    <div class="mdc-checkbox__background">
                                      <svg class="mdc-checkbox__checkmark"
                                           viewBox="0 0 24 24">
                                        <path class="mdc-checkbox__checkmark-path"
                                              fill="none"
                                              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                                      </svg>
                                      <div class="mdc-checkbox__mixedmark"></div>
                                    </div>
                                    <div class="mdc-checkbox__ripple"></div>
                                  </div>
                                  <label for="checkbox-${key}">${html`${key.split("_")[0]}<sub>${key.split("_").slice(1).join("_")}</sub>`}</label>
                                </div>
                            </li>`;})}
                    <div class="lv-menu-divider"></div>
                    ${Object.keys(this.outputs).map(key => {
                        return html`
                            <li class="mdc-list-item" role="menuitem" @click="${this.stopEventPropagation}">
                                <div id="form-field-${key}" class="mdc-form-field">
                                  <div class="mdc-checkbox">
                                    <input type="checkbox"
                                           class="mdc-checkbox__native-control"
                                           id="checkbox-${key}" laneClass="${VisibilityAction.OUTPUT}" @change="${this.setVisibility}"/>
                                    <div class="mdc-checkbox__background">
                                      <svg class="mdc-checkbox__checkmark"
                                           viewBox="0 0 24 24">
                                        <path class="mdc-checkbox__checkmark-path"
                                              fill="none"
                                              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                                      </svg>
                                      <div class="mdc-checkbox__mixedmark"></div>
                                    </div>
                                    <div class="mdc-checkbox__ripple"></div>
                                  </div>
                                  <label for="checkbox-${key}">${html`${key.split("_")[0]}<sub>${key.split("_").slice(1).join("_")}</sub>`}</label>
                                </div>
                            </li>`;})}
                  </ul>
                </div>
            </div>
            
            <!-- language select button -->
            <div class="mdc-menu-surface--anchor" style="display: inline-block;">
                <button class="mdc-button lv-button" @click="${this.openLanguageMenu}">
                  <div class="mdc-button__ripple"></div>
                  <svg class="mdc-button__icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path xmlns="http://www.w3.org/2000/svg" d="M0 0h24v24H0z" fill="none"/>
                      <path xmlns="http://www.w3.org/2000/svg" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                  </svg>
                </button>
                <div class="mdc-menu mdc-menu-surface" id="languageMenu">
                  <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    ${translator.languages.map(lang => {
                        return html`
                            <li id="language-${lang}" class="mdc-list-item" role="menuitem" @click="${this.changeLanguage}">
                                <span class="mdc-list-item__text">${translator.getResource(lang, "defaultNS", "langName")}</span>
                            </li>`;})}
                  </ul>
                </div>
            </div>
        `;
    }

    // is called by LitElement on the first ever update performed, before updated() is called
    firstUpdated(changedProperties) {
        if(this.isSequential) {
            this.stepInputMCE = this.shadowRoot.getElementById("mce-step-number-input");
            this.stepInputMCE.setAttribute("value", "10");
            this.periodInputMCE = this.shadowRoot.getElementById("mce-period-input");
            this.periodInputMCE.setAttribute("value", "200");
        }
    }

    // is called by LitElement after an update
    updated(changedProperties) {
        this.stepInputMCE = this.shadowRoot.getElementById("mce-step-number-input");
        this.periodInputMCE = this.shadowRoot.getElementById("mce-period-input");
        // in order for MDCs to work properly (display animations) they need to be attached to a JS object
        // since there can be new MDCs in each render (in theory), we need to do this here (after the render)
        // in order to avoid unnecessary attaching, we make the MDC remember that it has been initialized
        this.shadowRoot.querySelectorAll(".mdc-text-field").forEach(tf => {
            if((tf as any).controllerObject === undefined) {
                tf["controllerObject"] = MDCTextField.attachTo(tf);
            }
        });
        this.shadowRoot.querySelectorAll(".mdc-button").forEach(btn => {
            if((btn as any).controllerObject === undefined) {
                btn["controllerObject"] = MDCRipple.attachTo(btn);
            }
        });
        this.shadowRoot.querySelectorAll(".mdc-menu").forEach(menu => {
            if((menu as any).controllerObject === undefined) {
                menu["controllerObject"] = MDCMenu.attachTo(menu);
            }
        });
        this.shadowRoot.querySelectorAll(".mdc-checkbox").forEach(checkbox => {
            if((checkbox as any).controllerObject === undefined) {
                checkbox["controllerObject"] = MDCCheckbox.attachTo(checkbox);
                checkbox["controllerObject"].checked = true; //standard value
            }
        });
        this.shadowRoot.querySelectorAll(".mdc-form-field").forEach(formField => {
            if((formField as any).controllerObject === undefined) {
                formField["controllerObject"] = MDCFormField.attachTo(formField as HTMLElement);
                (formField as any).input = (this.shadowRoot.getElementById("checkbox-"+formField.id.split("form-field-")[1]) as any).controllerObject;
            }
        });

        if(this.isSequential) {
            if (this.viewMode) { // can't continue simulation in viewMode but after reset we have to enable the buttons again
                this.shadowRoot.getElementById("clock-button").setAttribute("disabled", "true");
                this.shadowRoot.getElementById("mce-button").setAttribute("disabled", "true");
            } else {
                this.shadowRoot.getElementById("clock-button").removeAttribute("disabled");
                this.shadowRoot.getElementById("mce-button").removeAttribute("disabled");
            }

            this.shadowRoot.getElementById("mce-step-number-input").style.width = String(this.shadowRoot.getElementById("for-mce-step-number-input").clientWidth)+"px";
            setTimeout((caller) => {caller.shadowRoot.getElementById("mce-step-number-input").style.width =
                String(caller.shadowRoot.getElementById("for-mce-step-number-input").clientWidth)+"px";}, 100, this); // for firefox this could be 0 timeout but chrome says no
            setTimeout((caller) => {caller.shadowRoot.getElementById("mce-period-input").style.width =
                String(caller.shadowRoot.getElementById("for-mce-period-input").clientWidth)+"px";}, 100, this);
        } else {
            if(this.viewMode) { // can't continue simulation in viewMode but after reset we have to enable the button again
                this.shadowRoot.getElementById("calc-button").setAttribute("disabled", "true");
            } else {
                this.shadowRoot.getElementById("calc-button").removeAttribute("disabled");
            }
        }
    }

    // is called by redux on state changes
    stateChanged(state: reduxState){
        this.isSequential               = getIsSequentialSelector(state);
        this.multiClockExecutionActive  = state.multiClockExecutionActive;
        this.viewMode                   = state.viewMode;
        this.inputs                     = getCurrentInputsSelector(state);
        this.states                     = getCurrentStatesSelector(state);
        this.outputs                    = getCurrentOutputsSelector(state);
    }

    importWaveJSON() {
        let input = document.createElement('input');
        input.type = 'file';

        input.onclick = () => {
            input.value = null;
        };

        input.oninput = e => {
            // getting a hold of the file reference
            let file = (e.target as any).files[0];

            // setting up the reader
            let reader = new FileReader();
            reader.readAsText(file,'UTF-8');

            // here we tell the reader what to do when it's done reading...
            reader.onload = readerEvent => {
                let content = readerEvent.target.result; // this is the content!
                store.dispatch(importAction(content.toString()));
            }
        };
        input.click();
    }

    openExportMenu() {
        (this.shadowRoot.getElementById('exportMenu') as any).controllerObject.open = true;
    }

    openLanguageMenu() {
        (this.shadowRoot.getElementById('languageMenu') as any).controllerObject.open = true;
    }

    openVisibilityMenu() {
        (this.shadowRoot.getElementById('visibilityMenu') as any).controllerObject.open = true;
    }

    // startMCE saves the mce-step-number-input value to and calls recursiveMCE after mce-period-input milliseconds
    startMCE() {
        this.stepInputMCE.setAttribute("readonly", "true");
        this.periodInputMCE.setAttribute("readonly", "true");
        store.dispatch(toggleMCE());
        this.totalMCE = this.stepInputMCE.value;
        dispatchClockEvent();
        this.stepInputMCE.value = String(this.totalMCE-1);
        setTimeout(this.recursiveMCE, Number(this.periodInputMCE.value), this, Date.now(), Number(this.periodInputMCE.value));
    }

    // As long as there are still clocks to execute and the MCE hasn't been stopped, clock is executed, counter
    // decremented, and the recursive call takes place. If the counter reaches 0, the original value is restored.
    recursiveMCE(caller, callTime, lastTimeout) {
        if(Number(caller.stepInputMCE.value) > 0) {
            if(caller.multiClockExecutionActive) {
                dispatchClockEvent();
                caller.stepInputMCE.value = String(Number(caller.stepInputMCE.value) - 1);
                let timeout = Number(caller.periodInputMCE.value);
                timeout -= Date.now()-callTime;
                timeout += lastTimeout;
                if(timeout <= 0) {
                    timeout = 1;
                }
                setTimeout(caller.recursiveMCE, timeout, caller, Date.now(), timeout);
            }
        } else {
            caller.stepInputMCE.value = caller.totalMCE;
            store.dispatch(toggleMCE());
            caller.stepInputMCE.removeAttribute("readonly");
            caller.periodInputMCE.removeAttribute("readonly");
        }
    }

    // stops the MCE while keeping the current value
    stopMCE() {
        store.dispatch(toggleMCE());
        this.stepInputMCE.removeAttribute("readonly");
        this.periodInputMCE.removeAttribute("readonly");
    }

    exportWaveJSON() {
        this.dispatchEvent(new ExportEvent(ExportEvent.WaveJSON));
    }

    exportSVG() {
        this.dispatchEvent(new ExportEvent(ExportEvent.SVG));
    }

    exportPNG() {
        this.dispatchEvent(new ExportEvent(ExportEvent.PNG));
    }

    combinatorialCalculation() {
        dispatchClockEvent();
        let inputArg: Array<MachineVariable> = [];
        Object.keys(this.inputs).forEach(key => {
            inputArg.push({name: key, value: this.inputs[key]});
        });
        dispatchUserChangeEvent({inputs: inputArg});
    }

    setVisibility(e){
        store.dispatch(visibilityAction(e.target.id.split("checkbox-")[1], e.target.checked, e.target.getAttribute("laneClass")));
    }

    stopEventPropagation(e) {
        e.stopPropagation();
    }

    changeLanguage(e) {
        let listItem;
        if(e.originalTarget !== undefined) {
            if (e.originalTarget.nodeName === "LI") {
                listItem = e.originalTarget;
            } else {
                listItem = e.originalTarget.parentElement;
            }
        } else { //chrome
            e.path.forEach(elem => {
                if(elem.id !== undefined && elem.id.split("language-").length > 1) {
                    listItem = elem;
                }
            });
        }
        translator.changeLanguage(listItem.id.split("language-")[1]).then();
        this.dispatchEvent(new CustomEvent("request-litelement-update")); // otherwise change would only be displayed after next state change
    }
}