import { LitElement, html, property } from '@polymer/lit-element';
import { MDCMenu } from '@material/menu/index';
import { MDCSelect } from '@material/select';

import {IExample, IModel} from '../model';
import {MDCDialog} from "@material/dialog/component";

function uniqBy(a, key) {
    let seen = {};
    return a.filter(function(item) {
        let k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

class ExamplesMenuEntry extends LitElement {
    @property()
    exampleName;

    @property()
    exampleLanguage;

    @property()
    updateRequested;

    @property()
    showLanguage;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
            <li class="mdc-list-item" role="menuitem">
                <span class="mdc-list-item__text">${this.exampleName + (this.showLanguage?" " + "(" + this.exampleLanguage.name + ")":"")}</span>
            </li>
        `;
    }

    onclick=()=>{
        let event = new CustomEvent('wide-example-selected', { detail: { examplename: this.exampleName, examplelanguage: this.exampleLanguage}, bubbles: true });
        this.dispatchEvent(event);
    }

    updated(changedProperties) {
        this.updateRequested = false;
    }

}
customElements.define('wide-examples-menu-entry', ExamplesMenuEntry);

class ExamplesMenu extends LitElement {
    menu

    @property()
    model: IModel;
    
    @property()
    standalone: boolean;

    @property()
    selectedBPUType: string;

    @property()
    selectedPSPUType: string;

    @property()
    selectedlanguage: string;

    @property()
    displayedExamples: Array<IExample>;

    @property()
    updateRequested: boolean;

    private dialog: MDCDialog;
    private languageoptions = [];
    private PSPUTypeoptions = [];
    private BPUTypeoptions;
    private possibleConfigs;
    private selectBPUType: MDCSelect;
    private selectlanguage: MDCSelect;
    private selectPSPUType: MDCSelect;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    getParameters() {
        this.BPUTypeoptions = [];
        this.possibleConfigs = [];
        if (this.model != undefined) {
            this.model.examples.map((example) => {
                this.BPUTypeoptions = this.BPUTypeoptions.concat(html`<li class="mdc-list-item" @click="${this.getOptions}" id="example%select%BPUType%${example.BPUType}" data-value="${example.BPUType}">${example.BPUType}</li>`);
                this.possibleConfigs = this.possibleConfigs.concat({BPUType: example.BPUType, PSPUType: example.PSPUType, language: example.language.name});
            });
            this.BPUTypeoptions = uniqBy(this.BPUTypeoptions,JSON.stringify);
            this.possibleConfigs = uniqBy(this.possibleConfigs,JSON.stringify);
        }
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        if(this.standalone == false) {
            return html`
            <div class="mdc-menu-surface--anchor">
                <button class="mdc-button header-button" @click="${() => this.open()}">Load Example</button>
                <div class="mdc-menu mdc-menu-surface" tabindex="-1">
                    <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                        ${this.model ? this.model.examples.map((example) => {
                    return html`<wide-examples-menu-entry .exampleName="${example.name}" .exampleLanguage="${example.language}" .showLanguage="${true}"></wide-examples-menu-entry>`
                }) : ''}
                    </ul>
                </div>
            </div>
            `
        } else if(this.standalone == true) {
            return html`
               <div class="mdc-menu-surface--anchor">
                <button class="mdc-button header-button" @click="${() => this.open()}">Load Example</button>
                </div>
            <div class="mdc-dialog" 
            id="example-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="my-dialog-title"
            aria-describedby="my-dialog-content"
            style="visibility: visible">
            <div class="mdc-dialog__container">
            <div class="mdc-dialog__surface">
              <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
              <h2 class="mdc-dialog__title" id="my-dialog-title"><!--
             -->Example Menu<!--
           --></h2>
              <div class="mdc-dialog__content" id="my-dialog-content">
                Choose your Configuration
              </div>
              <div class="config-and-example-view">
                   <div class="config-view">
                      <div class="mdc-select" id="example%select%BPUType" style="margin-bottom: 18px">
                      <input type="hidden" name="enhanced-select">
                      <i class="mdc-select__dropdown-icon"></i>
                      <div class="mdc-select__selected-text"></div>
                      <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                        <ul class="mdc-list">
                          <li class="mdc-list-item mdc-list-item--selected" @click="${this.getOptions}" data-value="" aria-selected="true" style="display: none"></li>
                          ${this.BPUTypeoptions}
                        </ul>
                      </div>
                      <span class="mdc-floating-label">Pick a System</span>
                      <div class="mdc-line-ripple"></div>
                      </div>
                      <div class="mdc-select" id="example%select%language" style="margin-bottom: 18px">
                      <input type="hidden" name="enhanced-select">
                      <i class="mdc-select__dropdown-icon"></i>
                      <div class="mdc-select__selected-text" id="selected%language"></div>
                      <div class="mdc-select__menu mdc-menu mdc-menu-surface" id="menu%language">
                        <ul class="mdc-list">
                          <li class="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true" style="display: none"></li>
                          ${this.languageoptions}
                        </ul>
                      </div>
                      <span class="mdc-floating-label" id="label%language">Pick a Language</span>
                      <div class="mdc-line-ripple"></div>
                      </div>
                      <div class="mdc-select" id="example%select%PSPUType">
                      <input type="hidden" name="enhanced-select">
                      <i class="mdc-select__dropdown-icon"></i>
                      <div class="mdc-select__selected-text"></div>
                      <div class="mdc-select__menu mdc-menu mdc-menu-surface" id="menu%PSPUType">
                        <ul class="mdc-list">
                          <li class="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true" style="display: none"></li>
                          ${this.PSPUTypeoptions}
                        </ul>
                      </div>
                      <span class="mdc-floating-label">Pick a PSPUType</span>
                      <div class="mdc-line-ripple"></div>
                      </div>
                  </div>
                  <div class="example-view">
                      <div class="mdc-menu mdc-menu">
                            <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                                ${this.displayedExamples ? this.displayedExamples.map((example) => {
                        return html`<wide-examples-menu-entry data-mdc-dialog-action="yes" .updateRequested="${this.updateRequested}" .exampleName="${example.name}" .exampleLanguage="${example.language}" .showLanguage="${false}"></wide-examples-menu-entry>`
                        }) : ''}
                            </ul>
                      </div>
                  </div>
              </div>
              <footer class="mdc-dialog__actions">
                <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">
                  <span class="mdc-button__label">Cancel</span>
                </button>
              </footer>
            </div>
          </div>
          <div class="mdc-dialog__scrim"></div>
        </div>`
        };
    }

    firstUpdated() {
        if(this.standalone == true) {
            this.menu = new MDCMenu(this.querySelector('.mdc-menu'));
            this.dialog = new MDCDialog(document.getElementById('example-dialog'));
            this.selectBPUType = new MDCSelect(document.getElementById('example%select%BPUType'));
            this.selectlanguage = new MDCSelect(document.getElementById('example%select%language'));
            this.selectPSPUType = new MDCSelect(document.getElementById('example%select%PSPUType'));
        } else if(this.standalone == false) {
            this.menu = new MDCMenu(this.querySelector('.mdc-menu'));
        }
    }

    updated(changedProperties){
        this.updateRequested = false;
        if(this.standalone == true) {
            this.getParameters();
            this.selectBPUType.value = this.selectedBPUType;
            this.selectlanguage.value = this.selectedlanguage;
            this.selectPSPUType.value = this.selectedPSPUType;
        }
    }

    open() {
        if (this.standalone == true) {
            this.presetValues();
            this.updateRequested = true;
            this.dialog.open();
        } else {
            this.updateRequested = true;
            this.menu.open = true;
        }
    }
    
    getOptions(e){
        let id = e.target.id;
        if(id.startsWith('example%select%BPUType%')){
            let selectedBPUType = document.getElementById(id).innerText;
            let selectedBPUChanged = false;
            if(this.selectedBPUType != selectedBPUType){
                this.selectedBPUType = selectedBPUType;
                this.selectedlanguage = this.possibleConfigs.find((config) => config.BPUType == this.selectedBPUType).language;
                selectedBPUChanged = true;
            }
            this.languageoptions = this.loadLanguageOptions();
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            if(selectedBPUChanged == true) {
                this.presetValues();
            }
        } else if(id.startsWith('example%select%language%')){
            let selectedlanguage = document.getElementById(id).innerText;
            let selectedlanguageChanged = false;
            if(this.selectedlanguage != selectedlanguage){
                this.selectedlanguage = selectedlanguage;
                selectedlanguageChanged = true;
            }
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            if(selectedlanguageChanged == true) {
                this.presetValues();
            }
        } else {
            this.selectedPSPUType = document.getElementById(id).innerText;
            this.displayedExamples = this.loadExamples(this.selectedBPUType,this.selectedPSPUType,this.selectedlanguage);
        }
    }

    presetValues(){
        this.getParameters();
        if(this.selectedBPUType == undefined){
            this.selectedBPUType = this.possibleConfigs[0].BPUType;
            this.languageoptions = this.loadLanguageOptions();
            this.selectedlanguage = this.possibleConfigs[0].language;
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            this.selectedPSPUType = this.possibleConfigs[0].PSPUType;
            this.displayedExamples = this.loadExamples(this.selectedBPUType,this.selectedPSPUType,this.selectedlanguage);
        } else {
            this.selectedPSPUType = this.possibleConfigs.find((config) => config.BPUType == this.selectedBPUType && config.language == this.selectedlanguage).PSPUType;
            this.displayedExamples = this.loadExamples(this.selectedBPUType, this.selectedPSPUType, this.selectedlanguage);
        }
    }

    loadLanguageOptions(){
        let configs = this.possibleConfigs.filter((config) => {
            return config.BPUType == this.selectedBPUType;
        });
        let languages = configs.map((config) => {return html`<li class="mdc-list-item" @click="${this.getOptions}" id="example%select%language%${config.language}" data-value="${config.language}">${config.language}</li>`});
        return uniqBy(languages,JSON.stringify);
    }

    loadPSPUTypeOptions(){
        let configs = this.possibleConfigs.filter((config) => {
            return config.BPUType == this.selectedBPUType && config.language == this.selectedlanguage;
        });
        let pspus = configs.map((config) => {return html`<li class="mdc-list-item" @click="${this.getOptions}" id="example%select%PSPUType%${config.PSPUType}" data-value="${config.PSPUType}">${config.PSPUType}</li>`});
        return uniqBy(pspus,JSON.stringify);
    }

    loadExamples(bpu,pspu,lang){
        return this.model.examples.filter((example) => {
            return example.BPUType == bpu && example.language.name == lang && example.PSPUType == pspu
        });
    }

}
customElements.define('wide-examples-menu', ExamplesMenu);