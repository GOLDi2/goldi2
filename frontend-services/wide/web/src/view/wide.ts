import { LitElement, html, property, customElement } from '@polymer/lit-element';
import { Editor } from './editor';
import { MDCSnackbar } from '@material/snackbar/component';
import { MDCDialog } from '@material/dialog';
import { MDCSelect } from '@material/select';

import {ILanguage, IModel, supportedLanguages} from '../model'

import './header';
import './filetree';
import './editor';
import './footer';
import './console';
import './save-load-menu';

//import "./css/app.scss";

/**
 * Complete website
 */
export class App extends LitElement {
    @property()
    model: IModel;

    editor: Editor;
    snackbarMessage: MDCSnackbar;
    snackbarDeleteFile: MDCSnackbar;
    snackbarDeleteDirectory: MDCSnackbar;
    snackbarSaveZip: MDCSnackbar;
    snackbarDeleteProject: MDCSnackbar;
    dialog: MDCDialog;
    select: MDCSelect;
    name: string;
    language: ILanguage; // Variable for programming-language
    BPUType: string;
    PSPUType: string;
    console: any;
    par = this.parseQueryString();
    standalone = this.par["standalone"]=='true';

    private intervalsnackbar;
    private input: HTMLInputElement;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    render() {
        if(this.standalone==true){
            return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <wide-header .model="${this.model}" .standalone="${this.standalone}"></wide-header>
        <div class="main">
            <wide-filetree .model="${this.model}" .language="${this.language?this.language:supportedLanguages[0]}"></wide-filetree>
            <wide-editor .model="${this.model}" .language="${this.language}"></wide-editor>
        </div>
        <wide-console .model="${this.model}"></wide-console>
        <div id="message" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
          </div>
        </div>
        <div id="deletefile" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteFile};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="deletedirectory" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteDirectory};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="deleteproject" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteProject};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="savezip" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-text-field">
                    <input type="text" id="my-input" class="mdc-text-field__input_snackbar">
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedSaveZip};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" @click="${this.declinedSaveZip};" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <wide-create-menu .model="${this.model}" .standalone="${this.standalone}" .selectedBPUType="C" .PSPUType="3AxisPortal"></wide-create-menu>
        `;}
        else if(this.standalone==false){ return html`
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <wide-header .model="${this.model}" .standalone="${this.standalone}"></wide-header>
        <div class="main">
            <wide-filetree .model="${this.model}" .language="${this.language?this.language:supportedLanguages.find(language => language.BPUType==this.par['BPUType'])}"></wide-filetree>
            <wide-editor .model="${this.model}" .language="${this.language}"></wide-editor>
        </div>
        <wide-console .model="${this.model}"></wide-console>
        <wide-footer></wide-footer>
        <div id="message" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
          </div>
        </div>
        <div id="deletefile" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteFile};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="deletedirectory" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteDirectory};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="deleteproject" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-snackbar__actions">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedDeleteProject};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <div id="savezip" class="mdc-snackbar">
          <div class="mdc-snackbar__surface">
            <div class="mdc-snackbar__label" role="status" aria-live="polite">
              Default Text
            </div>
            <div class="mdc-text-field">
                    <input type="text" id="my-input" class="mdc-text-field__input_snackbar">
            </div>
            <div class="mdc-snackbar__actions" @click="${() => clearInterval(this.intervalsnackbar)}">
                <button type="button" class="mdc-button mdc-snackbar__action" @click="${this.acceptedSaveZip};">Yes</button>
                <button class="mdc-icon-button mdc-snackbar__dismiss material-icons" @click="${this.declinedSaveZip};" title="Dismiss">x</button>
            </div>
          </div>
        </div>
        <wide-create-menu .model="${this.model}" .standalone="${this.standalone}" .selectedBPUType="${this.BPUType}" .PSPUType="${this.PSPUType}"></wide-create-menu>
        `;}
    }

    /**
     * Reads and parses the URL parameter
     * https://www.malcontentboffin.com/2016/11/TypeScript-Function-Decodes-URL-Parameters.html
     * @param queryString
     */
    parseQueryString(queryString?: string): any {
        // if the query string is NULL or undefined
        if (!queryString) {
            queryString = window.location.search.substring(1);
        }
        const params = {};
        const queries = queryString.split("&");
        queries.forEach((indexQuery: string) => {
            const indexPair = indexQuery.split("=");
            const queryKey = decodeURIComponent(indexPair[0]);
            const queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");
            params[queryKey] = queryValue;
        });
        return params;
    }

    firstUpdated() {
        this.standalone = this.par["standalone"]=='true';
        this.BPUType = this.par["BPUType"];
        this.PSPUType = this.par["PSPUType"];
        this.editor = this.querySelector("wide-editor") as Editor;
        this.console = this.querySelector("wide-console");
        this.snackbarMessage = new MDCSnackbar(document.getElementById("message"));
        this.snackbarDeleteFile = new MDCSnackbar(document.getElementById("deletefile"));
        this.snackbarDeleteDirectory = new MDCSnackbar(document.getElementById("deletedirectory"));
        this.snackbarSaveZip = new MDCSnackbar(document.getElementById("savezip"));
        this.snackbarDeleteProject = new MDCSnackbar(document.getElementById("deleteproject"));
        this.input = this.querySelector('input');
        document.dispatchEvent(new CustomEvent('wide-ready', { detail: { wide: this } }))
    }

    /**
     * Shows message in snackbar
     * @param message
     */
    showMessage(message: string) {
        this.snackbarMessage.labelText = message;
        this.snackbarMessage.open();

    }

    /**
     * Asks for confirmation if file should be really deleted
     * @param filename
     */
    deleteFile(filename: string){
        this.name= filename;
        this.snackbarDeleteFile.labelText = "Are you sure you want to delete this file?";
        this.snackbarDeleteFile.open();
    }

    /**
     * Triggers Delete-File-Event
     * @param e
     */
    acceptedDeleteFile(e: Event){
        let event = new CustomEvent('wide-file-deleted', {detail: {filename: this.name}, bubbles: true});
        this.name='';
        this.dispatchEvent(event);
    }

    /**
     * Asks for confirmation if directory should be really deleted
     * @param directoryname
     */
    deleteDirectory(directoryname: string){
        this.name= directoryname;
        this.snackbarDeleteDirectory.labelText = "Are you sure you want to delete this directory and his files?";
        this.snackbarDeleteDirectory.open();
    }

    /**
     * Triggers Delete-Directory-Event
     * @param e
     */
    acceptedDeleteDirectory(e: Event){
        let event = new CustomEvent('wide-directory-deleted', {detail: {path: this.name}, bubbles: true});
        this.name='';
        this.dispatchEvent(event);
    }

    /**
     * Asks for confirmation if project should be downloaded as zip-file
     * Also allows setting new name for zip-file
     * @param projektname
     */
    saveZip(projektname: string) {
        this.snackbarSaveZip.labelText = "Do you want to save the project as:";
        this.input.value = projektname;
        this.name = projektname;
        this.snackbarSaveZip.timeoutMs=10000;
        this.snackbarSaveZip.open();
        this.intervalsnackbar = setInterval(() => this.keepOpen(this.snackbarSaveZip), 1000);
    }

    keepOpen(snackbar) {
        snackbar.open();
    }

    /**
     * Triggers Save-Zip-Event
     * @param e
     */
    acceptedSaveZip(e: Event) {
        if (this.input.value != null) {
            if (/^[a-zA-Z0-9]{1,}([ |_|-]{1}[a-zA-Z0-9]{1,}){0,}$/.test(this.input.value) == false) {
                this.showMessage('Name is not allowed!');
            } else {
                let event = this.dispatchEvent(new CustomEvent('wide-save-zip', {detail: {projectname:this.name, name: this.input.value}, bubbles: true}));
            }
            clearInterval(this.intervalsnackbar);
            this.name='';
        }
    }

    /**
     * Save-Zip-Event was deeclined
     * @param e
     */
    declinedSaveZip(e: Event) {
        clearInterval(this.intervalsnackbar);
    }

    deleteProject(projectname: string){
        this.name= projectname;
        this.snackbarDeleteProject.labelText = "Are you sure you want to delete this project?";
        this.snackbarDeleteProject.open();
    }

    acceptedDeleteProject(e: Event){
        let event = new CustomEvent('wide-project-deleted', {detail: {projectname: this.name}, bubbles: true});
        this.name='';
        this.dispatchEvent(event);
    }
}
customElements.define('wide-app', App);