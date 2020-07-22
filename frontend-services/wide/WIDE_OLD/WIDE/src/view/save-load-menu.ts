import { LitElement, html, property } from '@polymer/lit-element';
import { MDCMenu } from '@material/menu/index';
import { MDCSelect } from '@material/select';

import {IModel, IProject, supportedLanguages} from '../model';
import {MDCDialog} from "@material/dialog/component";

//let requestURL = 'https://cors.io/?http://x105.theoinf.tu-ilmenau.de/WIDEDEV/index.php?Function=GetPermittedDeviceCombinations&Location=IUTDev';
let requestURL = 'http://x105.theoinf.tu-ilmenau.de/WIDEDEV/index.php?Function=GetPermittedDeviceCombinations&Location=IUTDev';
//let scriptPath = window.location.href;
//let requestURL = new URL("../../Website/index.php?Function=GetPermittedDeviceCombinations&Location=IUTDev", scriptPath).toString();
let answer = makeRequest('GET', requestURL);

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = "json";
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

/**
 * class for save-menu
 */
class SaveMenu extends LitElement {

    @property()
    menu: MDCMenu;

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
        <div class="mdc-menu-surface--anchor">
            <button class="mdc-button header-button" @click="${() => this.menu.open = true}">Save Project</button>
            <div class="mdc-menu mdc-menu-surface" tabindex="-1">
                <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    <li class="mdc-list-item" role="menuitem" @click="${() => { this.dispatchEvent(new CustomEvent('wide-save-zip-help', { detail:{projectname: this.model.parentDirectory}, bubbles: true })); }}">
                         <span class="mdc-list-item__text"> Save as Zip</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem" @click="${() => { this.dispatchEvent(new CustomEvent('wide-save', { bubbles: true })); }}">
                         <span class="mdc-list-item__text"> Save as .wide</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
    }

    firstUpdated() {
        this.menu = new MDCMenu(this.querySelector('.mdc-menu'));
    }
}
customElements.define('wide-save-menu', SaveMenu);

/**
 * class for load-menu
 */
class LoadMenu extends LitElement {

    @property()
    menu: MDCMenu;

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
        <div class="mdc-menu-surface--anchor">
            <button class="mdc-button header-button" @click="${() => this.menu.open = true}">Load Project</button>
            <div class="mdc-menu mdc-menu-surface" tabindex="-1">
                <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    <li class="mdc-list-item" role="menuitem" @click="${() => {
                this.dispatchEvent(new CustomEvent('wide-load-zip', { bubbles: true }));
            }}">
                         <span class="mdc-list-item__text"> Load from Zip</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem" @click="${() => {
                this.dispatchEvent(new CustomEvent('wide-open', { bubbles: true }));
            }}">
                         <span class="mdc-list-item__text"> Load from .wide</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
    }

    firstUpdated() {
        this.menu = new MDCMenu(this.querySelector('.mdc-menu'));
    }

}
customElements.define('wide-load-menu', LoadMenu);

/**
 * class for a projektmenuentry
 */
class ProjectMenuEntry extends LitElement {
    @property()
    projectname;

    @property()
    projectlanguage;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
            <li class="mdc-list-item" role="menuitem" @click="${this.clicked}">
                <span class="mdc-list-item__text">${this.projectname + " " + "(" + this.projectlanguage.name + ")"}</span>
                <div class="mdc-list-item__meta">
                    <button class="mdc-icon-button" @click="${this.delete}">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </li>
    `;
    }

    /**
     * Deletes a project from local storage
     */
    delete() {
        let event = new CustomEvent('wide-project-deleted-help', { detail: { projectname: this.projectname, projectlanguage: this.projectlanguage }, bubbles: true });
        this.dispatchEvent(event);
    }

    /**
     * Loads a project from local storage into filetree
     */
    clicked() {
        let event = new CustomEvent('wide-project-selected', { detail: { projectname: this.projectname, projectlanguage: this.projectlanguage }, bubbles: true });
        this.dispatchEvent(event);
    }

}
customElements.define('wide-project-menu-entry', ProjectMenuEntry);

/**
 * class for project-menu
 */
class ProjectMenu extends LitElement {

    @property()
    menu: MDCMenu;

    @property()
    model: IModel;

    @property()
    projects: Array<IProject>;

    @property()
    PSPUType: string;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
        <div class="mdc-menu-surface--anchor">
            <button class="mdc-button header-button" @click="${() => this.menu.open = true}">My Projects</button>
            <div class="mdc-menu mdc-menu-surface" tabindex="-1">
                <ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical">
                    ${this.projects ? this.projects.sort(function (a, b) {
            let nameA = a.name.toUpperCase(); // Groß-/Kleinschreibung ignorieren
            let nameB = b.name.toUpperCase(); // Groß-/Kleinschreibung ignorieren
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
        }).map((project) => {
            return html`<wide-project-menu-entry .projectname="${project.name}" .projectlanguage="${project.language}"></wide-project-menu-entry>`
        }) : ''}
                    <li class="mdc-list-item" role="menuitem" @click="${this.openDialog}"  style="justify-content: space-between">
                        <span class="mdc-list-item__text">Create New Project</span>
                        <i class="material-icons" style="padding: 12px">add</i>
                    </li>
                </ul>
            </div>
        </div>
    `;
    }

    /**
     * Opens dialog-window for creating of a new project
     */
    openDialog() {
        let event = new CustomEvent('wide-open-create-menu', { detail: { first: false }, bubbles: true });
        this.dispatchEvent(event);
    }

    firstUpdated() {
        this.menu = new MDCMenu(this.querySelector('.mdc-menu'));
    }

}
customElements.define('wide-project-menu', ProjectMenu);

/**
 * dialog-window for creating a new project
 */
class CreateMenu extends LitElement {

    @property()
    model: IModel;

    @property()
    selectedBPUType: string;

    @property()
    standalone: boolean;

    @property()
    updateRequested: boolean;

    @property()
    openNewWide: boolean;

    @property()
    openOldWide: boolean;

    private dialog: MDCDialog;
    private PSPUType: string;
    private selectedlanguage: string;
    private selectedPSPUType: string;
    private input;
    private BPUTypeoptions;
    private PSPUTypeoptions;
    private languageoptions;
    private selectBPUType: MDCSelect;
    private selectlanguage: MDCSelect;
    private selectPSPUType: MDCSelect;
    private oldLoadfileCount = 0;
    private answer;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    render() {
        this.getParameters();
        if (this.standalone == true) {
            return html`<div class="mdc-dialog" 
             id="create-dialog"
             role="alertdialog"
             aria-modal="true"
             aria-labelledby="my-dialog-title"
             aria-describedby="my-dialog-content"
             style="visibility: visible">
            <div class="mdc-dialog__container">
            <div class="mdc-dialog__surface">
              <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
              <h2 class="mdc-dialog__title" id="my-dialog-title"><!--
             -->Create New Project<!--
           --></h2>
              <div class="mdc-dialog__content" id="my-dialog-content">
                Choose your Configuration
              </div>
              <div class="mdc-text-field" id="text%projectname" style="margin-bottom: 18px" @keyup="${this.keyup}">
                 <input pattern="^[a-zA-Z0-9]{1,}([ |_|-]{1}[a-zA-Z0-9]{1,}){0,}$" type="text" class="mdc-text-field__input" id="input%projectname">
                 <label for="my-input" class="mdc-floating-label mdc-floating-label--float-above">Projectname</label>
              </div>
              <div class="mdc-select" id="select%BPUType" style="margin-bottom: 18px">
              <input type="hidden" name="enhanced-select">
              <i class="mdc-select__dropdown-icon"></i>
              <div class="mdc-select__selected-text"></div>
              <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                <ul class="mdc-list">
                  ${this.BPUTypeoptions}
                  <li class="mdc-list-item mdc-list-item--selected" @click="${this.updateBPUType}" data-value="" aria-selected="true" style="display: none"></li>
                </ul>
              </div>
              <span class="mdc-floating-label">Pick a System</span>
              <div class="mdc-line-ripple"></div>
              </div>
              <div class="mdc-select" id="select%language" style="margin-bottom: 18px">
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
              <div class="mdc-select" id="select%PSPUType">
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
              <footer class="mdc-dialog__actions">
                <button type="button" class="mdc-button mdc-dialog__button" @click="${this.createProject}">
                  <span class="mdc-button__label">Create</span>
                </button>
              </footer>
            </div>
          </div>
          <div class="mdc-dialog__scrim"></div>
        </div>`
        } else if (this.standalone == false && this.openNewWide == false) {
            if (this.model != undefined) {
                this.languageoptions = this.loadLanguageOptions();
            }
            return html`<div class="mdc-dialog" 
             id="create-dialog"
             role="alertdialog"
             aria-modal="true"
             aria-labelledby="my-dialog-title"
             aria-describedby="my-dialog-content"
             style="visibility: visible">
            <div class="mdc-dialog__container">
            <div class="mdc-dialog__surface">
              <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
              <h2 class="mdc-dialog__title" id="my-dialog-title"><!--
             -->Create New Project<!--
           --></h2>
              <div class="mdc-dialog__content" id="my-dialog-content">
                Choose your Configuration
              </div>
              <div class="mdc-text-field" id="text%projectname" @keyup="${this.keyup}" style="margin-bottom: 18px">
                 <input pattern="^[a-zA-Z0-9]{1,}([ |_|-]{1}[a-zA-Z0-9]{1,}){0,}$" type="text" class="mdc-text-field__input" id="input%projectname">
                 <label for="my-input" class="mdc-floating-label mdc-floating-label--float-above">Projectname</label>
              </div>
              <div class="mdc-select" id="select%language">
              <input type="hidden" name="enhanced-select">
              <i class="mdc-select__dropdown-icon"></i>
              <div class="mdc-select__selected-text" id="selected%language"></div>
              <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                <ul class="mdc-list">
                  <li class="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true" style="display: none"></li>
                  ${this.languageoptions}
                </ul>
              </div>
              <span class="mdc-floating-label" id="label%language">Pick a Language</span>
              <div class="mdc-line-ripple"></div>
              </div>
              <footer class="mdc-dialog__actions">
                <button type="button" class="mdc-button mdc-dialog__button" @click="${this.createProject}">
                  <span class="mdc-button__label">Create</span>
                </button>
              </footer>
            </div>
          </div>
          <div class="mdc-dialog__scrim"></div>
        </div>`
        }
    }

    /**
     * Loads choices for both versions of the website
     */
    firstUpdated() {
        if (this.standalone == true) {
            this.dialog = new MDCDialog(document.getElementById('create-dialog'));
            this.selectBPUType = new MDCSelect(document.getElementById('select%BPUType'));
            this.selectlanguage = new MDCSelect(document.getElementById('select%language'));
            this.selectPSPUType = new MDCSelect(document.getElementById('select%PSPUType'));
        } else {
            this.dialog = new MDCDialog(document.getElementById('create-dialog'));
            this.selectlanguage = new MDCSelect(document.getElementById('select%language'));
        }
        this.input = this.querySelector('input');
        this.start();
    }

    updated(changedProperties) {
        if (this.openNewWide == true) {
            if (this.standalone == true) {
                document.getElementById('select%BPUType').style.display = "none";
                document.getElementById('select%language').style.display = "none";
                document.getElementById('select%PSPUType').style.display = "none";
                document.getElementById('text%projectname').style.marginBottom = "0px";
            } else {
                document.getElementById('select%language').style.display = "none";
                document.getElementById('text%projectname').style.marginBottom = "0px";
            }
        } else {
            if (this.standalone == true) {
                document.getElementById('select%BPUType').style.display = "inline-flex";
                document.getElementById('select%language').style.display = "inline-flex";
                document.getElementById('select%PSPUType').style.display = "inline-flex";
                document.getElementById('text%projectname').style.marginBottom = "18px";
            } else {
                document.getElementById('select%language').style.display = "inline-flex";
                document.getElementById('text%projectname').style.marginBottom = "18px";
            }
        }
        if (this.updateRequested == true || this.selectlanguage.value.length == 0) {
            this.updateRequested = false;
            if (this.standalone == true) {
                if (this.selectedBPUType == "MicroController") {
                    this.selectBPUType.value = "MicroController";
                    this.selectlanguage.value = "C";
                    this.selectPSPUType.value = "3AxisPortal";
                } else if (this.selectedBPUType == "ProgrammableLogicDevice" && (this.model.loadfiles.length == 2 || this.model.loadfiles.length == 0)) {
                    this.selectBPUType.value = "ProgrammableLogicDevice";
                    this.selectlanguage.value = "LogIC";
                    this.selectPSPUType.value = "3AxisPortal";
                } else {
                    this.selectBPUType.value = "MicroController";
                    this.selectlanguage.value = "C";
                    this.selectPSPUType.value = "3AxisPortal";
                }
            } else {
                if (this.selectedBPUType == "MicroController") {
                    this.selectlanguage.value = "C";
                } else if (this.selectedBPUType == "ProgrammableLogicDevice" && (this.model.loadfiles.length == 2 || this.model.loadfiles.length == 0)) {
                    this.selectlanguage.value = "LogIC";
                }
            }
        }
        if(this.oldLoadfileCount < (this.model?this.model.loadfiles.length:0)){
            this.oldLoadfileCount = this.model.loadfiles.length;
            this.updateRequested = true;
        }
    }

    async start() {
        document.body.hidden = true;
        this.answer = await answer;
        if (this.standalone == true) {
            let event = new CustomEvent('wide-open-create-menu', { detail: { first: true }, bubbles: true });
            this.dispatchEvent(event);
            this.selectedBPUType = 'MicroController';
        }
        this.presetValues();
    }

    open() {
        this.presetValues();
        this.dialog.open();
        this.updateRequested = true;
    }

    keyup(e) {
        if (e.keyCode == 13) {
            this.createProject();
        }
    }

    /**
     * Gets parameters for dialog-window
     */
    getParameters() {
        if (this.openNewWide == undefined) {
            this.openNewWide = false;
            this.openOldWide = false;
        }
        let event = new CustomEvent('wide-create-menu-getparams', { detail: { menu: this }, bubbles: true });
        this.dispatchEvent(event);
    }

    /**
     * Creates new project with chosen parameters
     */
    createProject() {
        let BPUType = this.selectedBPUType;
        let language = this.selectlanguage.value;
        let PSPUType;
        if (this.openNewWide == false) {
            if (this.standalone == true) {
                BPUType = this.selectBPUType.value;
                PSPUType = this.selectPSPUType.value;
            } else {
                PSPUType = this.PSPUType;
            }
        } else {
            BPUType = this.selectedBPUType;
            language = this.selectedlanguage;
            PSPUType = this.selectedPSPUType;
        }
        this.input.checkValidity();
        if (this.input.value.length > 0 && this.input.validity.patternMismatch == false && this.model.projects.find((project) => project.name == this.input.value) == null) {
            document.getElementById("text%projectname").style.outlineStyle = "none";
            this.presetValues();
            let event = new CustomEvent('wide-project-added', { detail: { BPUType: BPUType, language: supportedLanguages.find((lang) => lang.name == language), PSPUType: PSPUType, name: this.input.value, files: this.model.loadfiles }, bubbles: true });
            this.dispatchEvent(event);
            this.input.value = '';
            this.openNewWide = false;
            this.openOldWide = false;
        } else {
            document.getElementById("text%projectname").style.outlineStyle = "auto";
            document.getElementById("text%projectname").style.outlineColor = "red";
            this.showMessage("Projectname not allowed");
        }
    }

    /**
     * Updates choices if control unit is changed
     * @param e
     */
    updateBPUType(e) {
        let selectedBPUType = document.getElementById(e.target.id).innerText;
        let selectedBPUChanged = false;
        if (this.selectedBPUType != selectedBPUType) {
            this.selectedBPUType = selectedBPUType;
            selectedBPUChanged = true;
        }
        this.languageoptions = this.loadLanguageOptions();
        this.PSPUTypeoptions = this.loadPSPUTypeOptions();
        if (selectedBPUChanged == true && this.openNewWide == false) {
            this.presetValues();
        }
    }

    /**
     * Sets preferences
     */
    presetValues() {
        if (this.openOldWide == true) {
            this.selectedBPUType = 'MicroController';
            this.BPUTypeoptions = html`<li class="mdc-list-item" id="%MicroController%" data-value="MicroController" @click="${this.updateBPUType}">
                MicroController
            </li>`;
        } else {
            if ((this.model.loadfiles.length == 2 || this.model.loadfiles.length == 0)) {
                this.BPUTypeoptions = html`<li class="mdc-list-item" id="%MicroController%" data-value="MicroController" @click="${this.updateBPUType}">
                    MicroController
                </li>
                <li class="mdc-list-item" id="%ProgrammableLogicDevice%" data-value="ProgrammableLogicDevice" @click="${this.updateBPUType}">
                    ProgrammableLogicDevice
                </li>`;
            } else {
                this.selectedBPUType = 'MicroController';
                this.BPUTypeoptions = html`<li class="mdc-list-item" id="%MicroController%" data-value="MicroController" @click="${this.updateBPUType}">
                    MicroController
                </li>`;
            }
        }
        if (this.selectedBPUType != undefined && this.standalone != false) {
            this.languageoptions = this.loadLanguageOptions();
            this.PSPUTypeoptions = this.loadPSPUTypeOptions();
        }
        this.updateRequested = true;
    }

    /**
     * Loads Language-options for choice when generating new projects
     */
    loadLanguageOptions() {
        let listitems = document.createElement("li");
        if (this.selectedBPUType == 'MicroController' || ((this.selectedBPUType == 'ProgrammableLogicDevice' && (this.model.loadfiles.length == 2 || this.model.loadfiles.length == 0)))) {
            supportedLanguages.filter((languages) => languages.BPUType == this.selectedBPUType).forEach((language) => {
                let listitem = document.createElement("li");
                listitem.setAttribute("class", "mdc-list-item");
                listitem.setAttribute("data-value", language.name);
                listitem.innerText = language.name;
                listitems.innerHTML = listitems.innerHTML.concat(listitem.outerHTML);
            });
            return listitems;
            //return html`<li class="mdc-list-item" data-value="C">C</li><li class="mdc-list-item" data-value="Arduino">Arduino</li>`;
        }
        return html``;
    }

    /**
     * Loads physical System -Options for choice when generating new projects in standalone-version
     */
    loadPSPUTypeOptions() {
        let devList = this.answer[`${this.selectedBPUType}`];
        let devListReal = devList.Real;
        let devListVirtual = devList.Virtual;
        let devices = [];
        if (devListReal != null) {
            buildOptions(devListReal);
        }

        if (devListVirtual != null) {
            buildOptions(devListVirtual);
        }

        return devices;

        /**
         * Creates a duplicate-free list of allowed physical systems
         * Based on the passed list
         * @param list
         */
        function buildOptions(list) {
            for (let key in list) {
                let li = document.createElement('li');
                li.className = "mdc-list-item";
                li.setAttribute('data-value', key);
                li.innerText = key;
                devices = devices.concat(li);
            }
        }
    }

    /**
     * Shows message in snackbar
     * @param message
     */
    showMessage(message) {
        let event = new CustomEvent('wide-show-message', { detail: { message: message }, bubbles: true });
        this.dispatchEvent(event);
    }
}
customElements.define('wide-create-menu', CreateMenu);