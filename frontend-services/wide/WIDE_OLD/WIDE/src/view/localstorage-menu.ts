import { LitElement, html, property } from '@polymer/lit-element';
import { MDCMenu } from '@material/menu/index';
import { MDCSelect } from '@material/select';

import {IProject, IModel, supportedLanguages} from '../model';
import {MDCDialog} from "@material/dialog/component";
import {MDCCheckbox} from '@material/checkbox';

function uniqBy(a, key) {
    let seen = {};
    return a.filter(function(item) {
        let k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

function sizeInKb(project) {
    let pjson = JSON.stringify(project);
    let length = pjson.length*2;
    return (length/1024).toFixed(2)+" KB";
}

class LocalstorageMenuEntry extends LitElement {
    @property()
    project;

    @property()
    updateRequested: boolean;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
            <li class="mdc-list-item mdc-list-item--disabled" style="color: black; justify-content: space-between">
                <span class="mdc-list-item__text" style="display: contents">${this.project.name + " (" + sizeInKb(this.project) + ")"}</span>
                <div>
                    <button class="mdc-icon-button" @click="${this.save}" style="margin-left: 8px">
                        <i class="material-icons">cloud_download</i>
                    </button>
                    <button class="mdc-icon-button" @click="${this.delete}">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </li>
    `;
    }

    updated(ChangedProperties){
        this.updateRequested = false;
    }

    /**
     * Deletes a project from local storage
     */
    delete(){
        let event = new CustomEvent('wide-project-deleted-help', { detail: { projectname: this.project.name }, bubbles: true });
        this.dispatchEvent(event);
    }

    save(){
        let event = new CustomEvent('wide-save-zip-help', { detail: { projectname: this.project.name }, bubbles: true });
        this.dispatchEvent(event);
    }

}
customElements.define('wide-localstorage-menu-entry', LocalstorageMenuEntry);

class LocalstorageMenu extends LitElement {

    @property()
    projects: Array<IProject>;

    @property()
    selectedBPUType: string;

    @property()
    selectedPSPUType: string;

    @property()
    selectedlanguage: string;

    @property()
    displayedProjects: Array<IProject>;

    @property()
    updateRequested: boolean;

    private oldprojectcount;
    private dialog: MDCDialog;
    private languageoptions = [];
    private PSPUTypeoptions = [];
    private BPUTypeoptions;
    private possibleConfigs;
    private selectBPUType: MDCSelect;
    private selectlanguage: MDCSelect;
    private selectPSPUType: MDCSelect;
    private BPUTypeFilter: boolean;
    private languageFilter: boolean;
    private PSPUTypeFilter: boolean;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    getPossibleConfigs() {
        this.BPUTypeoptions = [];
        this.possibleConfigs = [];
        if (this.projects.length > 0) {
            this.projects.map((project) => {
                this.BPUTypeoptions = this.BPUTypeoptions.concat(html`<li class="mdc-list-item" @click="${this.getOptions}" id="localstorage%select%BPUType%${project.BPUType}" data-value="${project.BPUType}">${project.BPUType}</li>`);
                this.possibleConfigs = this.possibleConfigs.concat({BPUType: project.BPUType, PSPUType: project.PSPUType, language: project.language});
            });
            this.BPUTypeoptions = uniqBy(this.BPUTypeoptions,JSON.stringify);
            this.possibleConfigs = uniqBy(this.possibleConfigs,JSON.stringify);
            this.languageoptions = this.loadLanguageOptions();
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
        }
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        // noinspection CssInvalidPropertyValue
        return html`
           <div class="mdc-menu-surface--anchor">
            <button class="mdc-button header-button" id="button%localstorage" @click="${() => this.open()}">Local Storage</button>
            </div>
        <div class="mdc-dialog" 
        id="localstorage-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="my-dialog-title"
        aria-describedby="my-dialog-content"
        style="visibility: visible">
        <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface" style="max-width: fit-content; max-width: -moz-fit-content;">
          <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
          <h2 class="mdc-dialog__title" id="my-dialog-title"><!--
         -->Local Storage Overview ${this.projects?"(" + (JSON.stringify(this.projects).length*2/(1024*1024)).toFixed(2) + " MB / 2.00 MB)":""}<!--
       --></h2>
          <div class="mdc-dialog__content" id="my-dialog-content">
            Choose your Configuration
          </div>
          <div class="config-and-project-view">
               <div class="config-view">
                  <div class="BPUType">
                      <div class="mdc-checkbox">
                        <input type="checkbox"
                               class="mdc-checkbox__native-control"
                               id="localstorage%checkbox%BPUType"
                               @click="${this.updateFilters}"/>
                        <div class="mdc-checkbox__background">
                          <svg class="mdc-checkbox__checkmark"
                               viewBox="0 0 24 24">
                            <path class="mdc-checkbox__checkmark-path"
                                  fill="none"
                                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                          </svg>
                          <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                      </div>
                      <div class="mdc-select" id="localstorage%select%BPUType" style="width: -moz-available; width: -webkit-fill-available">
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
                  </div>
                  <div class="language">
                      <div class="mdc-checkbox">
                        <input type="checkbox"
                               class="mdc-checkbox__native-control"
                               id="localstorage%checkbox%language"
                               @click="${this.updateFilters}"/>
                        <div class="mdc-checkbox__background">
                          <svg class="mdc-checkbox__checkmark"
                               viewBox="0 0 24 24">
                            <path class="mdc-checkbox__checkmark-path"
                                  fill="none"
                                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                          </svg>
                          <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                      </div>
                      <div class="mdc-select" id="localstorage%select%language" style="width: -moz-available; width: -webkit-fill-available">
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
                  </div>
                  <div class="PSPUType">
                      <div class="mdc-checkbox">
                        <input type="checkbox"
                               class="mdc-checkbox__native-control"
                               id="localstorage%checkbox%PSPUType"
                               @click="${this.updateFilters}"/>
                        <div class="mdc-checkbox__background">
                          <svg class="mdc-checkbox__checkmark"
                               viewBox="0 0 24 24">
                            <path class="mdc-checkbox__checkmark-path"
                                  fill="none"
                                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                          </svg>
                          <div class="mdc-checkbox__mixedmark"></div>
                        </div>
                      </div>
                      <div class="mdc-select" id="localstorage%select%PSPUType" style="width: -moz-available; width: -webkit-fill-available">
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
              </div>
              <div class="project-view">
                  <div class="mdc-menu mdc-menu">
                        <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                            ${this.displayedProjects ? this.displayedProjects.map((project) => {
                                return html`<wide-localstorage-menu-entry .project="${project}" .updateRequested="${this.updateRequested}"></wide-localstorage-menu-entry>`
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
        </div>`;
    }

    firstUpdated() {
        this.dialog = new MDCDialog(document.getElementById('localstorage-dialog'));
        this.selectBPUType = new MDCSelect(document.getElementById('localstorage%select%BPUType'));
        this.selectlanguage = new MDCSelect(document.getElementById('localstorage%select%language'));
        this.selectPSPUType = new MDCSelect(document.getElementById('localstorage%select%PSPUType'));
        this.BPUTypeFilter = false;
        this.languageFilter = false;
        this.PSPUTypeFilter = false;
        document.getElementById('localstorage%select%BPUType').classList.add('mdc-select--disabled');
        document.getElementById('localstorage%select%language').classList.add('mdc-select--disabled');
        document.getElementById('localstorage%select%PSPUType').classList.add('mdc-select--disabled');
        this.displayedProjects = [];
    }

    updated(changedProperties) {
        if(this.oldprojectcount > this.projects.length) {
            this.displayedProjects = this.displayedProjects.filter((displayed) => {
                return this.projects.find((project) => project.name == displayed.name) != null
            });
        }
        this.updateRequested = false;
        this.getPossibleConfigs();
        if (this.projects.length == 0){
            this.dialog.close();
        }
        if (this.displayedProjects.length == 0 && this.projects.length > 0){
            this.selectedBPUType = undefined;
            this.presetValues();
        }
        this.selectBPUType.value = this.selectedBPUType;
        this.selectlanguage.value = this.selectedlanguage;
        this.selectPSPUType.value = this.selectedPSPUType;
        this.oldprojectcount = this.projects.length;
    }

    open(){
        this.presetValues();
        this.updateRequested = true;
        this.dialog.open();
    }

    getOptions(e){
        let id = e.target.id;
        if(id.startsWith('localstorage%select%BPUType%')){
            let selectedBPUType = document.getElementById(id).innerText;
            let selectedBPUChanged = false;
            if(this.selectedBPUType != selectedBPUType){
                this.selectedBPUType = selectedBPUType;
                this.selectedlanguage = this.possibleConfigs.find((config) => config.BPUType == this.selectedBPUType).language.name;
                selectedBPUChanged = true;
            }
            this.languageoptions = this.loadLanguageOptions();
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            if(selectedBPUChanged == true) {
                this.presetValues();
            }
        } else if(id.startsWith('localstorage%select%language%')){
            let selectedlanguage = supportedLanguages.find((lang) => lang.name == document.getElementById(id).innerText);
            let selectedlanguageChanged = false;
            if(this.selectedlanguage != selectedlanguage.name){
                this.selectedlanguage = selectedlanguage.name;
                selectedlanguageChanged = true;
            }
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            if(selectedlanguageChanged == true) {
                this.presetValues();
            }
        } else {
            this.selectedPSPUType = document.getElementById(id).innerText;
            if (this.BPUTypeFilter == false && this.languageFilter == false) {
                this.selectedBPUType = this.possibleConfigs.find((config) => config.PSPUType == this.selectedPSPUType).BPUType;
                this.selectedlanguage = this.possibleConfigs.find((config) => config.PSPUType == this.selectedPSPUType).language.name;
            }
            this.displayedProjects = this.loadProjects(this.selectedBPUType,this.selectedPSPUType,this.selectedlanguage);
        }
    }

    presetValues(){
        if(this.selectedBPUType == undefined){
            this.selectedBPUType = this.possibleConfigs[0].BPUType;
            this.languageoptions = this.loadLanguageOptions();
            this.selectedlanguage = this.possibleConfigs[0].language.name;
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            this.selectedPSPUType = this.possibleConfigs[0].PSPUType;
            this.displayedProjects = this.loadProjects(this.selectedBPUType,this.selectedPSPUType,this.selectedlanguage);
        } else {
            this.languageoptions = this.loadLanguageOptions();
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
            if ((this.BPUTypeFilter == true && this.languageFilter == true) || (this.BPUTypeFilter == false && this.languageFilter == false)) {
                this.selectedPSPUType = this.possibleConfigs.find((config) => config.BPUType == this.selectedBPUType && config.language.name == this.selectedlanguage).PSPUType;
            } else if (this.BPUTypeFilter == false && this.languageFilter == true) {
                this.selectedBPUType = this.possibleConfigs.find((config) => config.language.name == this.selectedlanguage).BPUType;
                this.selectedPSPUType = this.possibleConfigs.find((config) => config.language.name == this.selectedlanguage).PSPUType;
            } else if (this.BPUTypeFilter == true && this.languageFilter == false) {
                this.selectedPSPUType = this.possibleConfigs.find((config) => config.BPUType == this.selectedBPUType).PSPUType;
            }
            this.displayedProjects = this.loadProjects(this.selectedBPUType, this.selectedPSPUType, this.selectedlanguage);
        }
    }

    loadLanguageOptions(){
        let configs = [];
        if(this.BPUTypeFilter == true) {
            configs = this.possibleConfigs.filter((config) => {
                return config.BPUType == this.selectedBPUType;
            });
        } else {
            configs = this.possibleConfigs
        }
        let languages = configs.map((config) => {return html`<li class="mdc-list-item" @click="${this.getOptions}" id="localstorage%select%language%${config.language.name}" data-value="${config.language.name}">${config.language.name}</li>`});
        return uniqBy(languages,JSON.stringify);
    }

    loadPSPUTypeOptions(){
        let configs = [];
        if(this.BPUTypeFilter == true && this.languageFilter == true){
            configs = this.possibleConfigs.filter((config) => {
                return config.BPUType == this.selectedBPUType && config.language.name == this.selectedlanguage;
            });
        } else if(this.BPUTypeFilter == true && this.languageFilter == false){
            configs = this.possibleConfigs.filter((config) => {
                return config.BPUType == this.selectedBPUType;
            });
        } else if(this.BPUTypeFilter == false && this.languageFilter == true) {
            configs = this.possibleConfigs.filter((config) => {
                return config.language.name == this.selectedlanguage;
            });
        } else {
            configs = this.possibleConfigs;
        }
        let pspus = configs.map((config) => {return html`<li class="mdc-list-item" @click="${this.getOptions}" id="localstorage%select%PSPUType%${config.PSPUType}" data-value="${config.PSPUType}">${config.PSPUType}</li>`});
        return uniqBy(pspus,JSON.stringify);
    }

    loadProjects(bpu,pspu,lang){
        let loadedprojects = this.projects;
        this.BPUTypeFilter?loadedprojects = this.projects.filter((project) => {
            return project.BPUType == bpu;
        }):"";
        this.languageFilter?loadedprojects = loadedprojects.filter((project) => {
            return project.language == supportedLanguages.find((language) => language.name == lang);
        }):"";
        this.PSPUTypeFilter?loadedprojects = loadedprojects.filter((project) => {
            return project.PSPUType == pspu;
        }):"";
        return loadedprojects.sort((a,b) => JSON.stringify(b).length - JSON.stringify(a).length);
    }

    updateFilters(e){
        if(e.target.id == "localstorage%checkbox%BPUType"){
            this.BPUTypeFilter = !this.BPUTypeFilter;
            this.BPUTypeFilter?document.getElementById("localstorage%select%BPUType").classList.remove("mdc-select--disabled"):document.getElementById("localstorage%select%BPUType").classList.add("mdc-select--disabled");
        } else if(e.target.id == "localstorage%checkbox%language"){
            this.languageFilter = !this.languageFilter;
            this.languageFilter?document.getElementById("localstorage%select%language").classList.remove("mdc-select--disabled"):document.getElementById("localstorage%select%language").classList.add("mdc-select--disabled");
        } else if(e.target.id == "localstorage%checkbox%PSPUType"){
            this.PSPUTypeFilter = !this.PSPUTypeFilter;
            this.PSPUTypeFilter?document.getElementById("localstorage%select%PSPUType").classList.remove("mdc-select--disabled"):document.getElementById("localstorage%select%PSPUType").classList.add("mdc-select--disabled");
        }
        this.displayedProjects = this.loadProjects(this.selectedBPUType,this.selectedPSPUType,this.selectedlanguage);
        this.updateRequested = true;
    }

}
customElements.define('wide-localstorage-menu', LocalstorageMenu);