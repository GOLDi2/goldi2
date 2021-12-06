import { html, LitElement, property } from '@polymer/lit-element';
import { MDCRipple } from '@material/ripple/index';
import { MarkerSeverity } from 'monaco-editor';
import {ILanguage} from "../model";

class FileTreeFile extends LitElement {
    @property()
    fileName: string='';

    @property()
    severity: MarkerSeverity;

    @property()
    path = '';

    @property()
    selectedFile: string;

    @property()
    language: ILanguage;

    private li: HTMLLIElement;
    private input: HTMLInputElement;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }


    render() {
        let severityClass = '';
        switch (this.severity) {
            case MarkerSeverity.Error:
                severityClass = ' severity-error';
                break;
            case MarkerSeverity.Warning:
                severityClass = ' severity-warning';
                break;
        }
        if (this.fileName.indexOf('.') != 0) {
            if (!this.language.canDeleteFiles){
                return html`
                <li class="mdc-list-item${severityClass}" id=${this.path} draggable="true" @dragstart="${this.drag}" .path="${this.path}" @click="${this.clicked}" @focusout="${this.focusout}">
                <span class="mdc-list-item__graphic">
                <i class="material-icons">insert_drive_file</i>
                </span>
                <span class="mdc-list-item__text" @keyup="${this.keyup}">
                    <div class="mdc-text-field">
                        <input pattern="^[a-zA-Z0-9]{1,}([_]{1}[a-zA-Z0-9]{1,}){0,}[.]{1}[a-zA-Z0-9]{1,}$" type="text" id="filename" class="mdc-text-field__input_name" value="${this.fileName}" readOnly="true" @dragover="${this.dontAllowDrop}">
                    </div>
                </span>
                </li>
                `;}
            else {
                return html`
                <li class="mdc-list-item${severityClass}" id=${this.path} draggable="true" @dragstart="${this.drag}" .path="${this.path}" @click="${this.clicked}" @focusout="${this.focusout}">
                    <span class="mdc-list-item__graphic">
                    <i class="material-icons">insert_drive_file</i>
                    </span>
                    <span class="mdc-list-item__text" @keyup="${this.keyup}">
                        <div class="mdc-text-field">
                            <input pattern="^[a-zA-Z0-9]{1,}([_]{1}[a-zA-Z0-9]{1,}){0,}[.]{1}[a-zA-Z0-9]{1,}$" type="text" id="filename" class="mdc-text-field__input_name" value="${this.fileName}" readOnly="true" @dragover="${this.dontAllowDrop}">
                        </div>
                    </span>
                    <div class="mdc-list-item__meta">
                        <button class="mdc-icon-button" @click="${this.delete}">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </li>
        `;}
        }
    }

    firstUpdated() {
        this.li = this.firstElementChild as HTMLLIElement;
        //auskommentiert, da es zu nicht erwünschten grafischen effekten führen kann
        //new MDCRipple(this.querySelector('.mdc-icon-button')).unbounded = true;
        //new MDCRipple(this.li).unbounded;

        this.input = this.querySelector('input');
        this.input.readOnly=true;
    }

    updated() {
        this.li.id!=this.path?this.li=document.getElementById(this.path) as HTMLLIElement:"";
        if (this.path == this.selectedFile) {
            if (!this.li.classList.contains('mdc-list-item--selected'))
                this.li.classList.add('mdc-list-item--selected');
        } else {
            if (this.li.classList.contains('mdc-list-item--selected'))
                this.li.classList.remove('mdc-list-item--selected');
        }
        if (this.fileName != this.input.value && this.input.readOnly) {
            this.input.value = this.fileName;
        }
    }

    /**
     * Don't allows dropping files/directories here
     * @param e
     */
    dontAllowDrop(e) {
        e.preventDefault();
    }

    /**
     * Checks if enter-button is pressed if so triggers rename()-function
     * @param e
     */
    keyup(e) {
        if (e.keyCode == 13 && this.input.readOnly == false) {
            this.rename();
        }
    }

    /**
     * Checks if input is correct and renames directory
     * Also shows message if file extension isn't the same as the for compiling predefined ones
     * @param e
     */
    rename(){
        this.input.checkValidity();
        if (this.input.value.length > 0 && this.input.validity.patternMismatch==false) {
            let languageEvent = new CustomEvent('wide-language-test',{detail:{name:this.input.value}, bubbles: true});
            let newname = this.path.substring(0,this.path.lastIndexOf('/')+1) + this.input.value;
            let renameEvent = new CustomEvent('wide-file-renamed', {detail: {filename: this.path, newname: newname}, bubbles: true});
            this.dispatchEvent(languageEvent);
            this.dispatchEvent(renameEvent);
            this.input.readOnly=true;
        } else {
            this.input.value = this.fileName;
            this.showMessage('File name is not allowed!');
        }
    }

    delete(e: Event) {
            e.stopPropagation();
            let event = new CustomEvent('wide-file-deleted-help', {detail: {name: this.path}, bubbles: true});
            this.dispatchEvent(event);
    }

    clicked() {
        if (this.selectedFile != this.path) {
            let event = new CustomEvent('wide-file-selected', {detail: {filename: this.path}, bubbles: true});
            this.dispatchEvent(event);
        } else {
            this.input.readOnly=false;
            this.input.style.cursor = 'text';
        }
    }

    focusout(){
        this.input.readOnly = true;
        this.input.style.cursor = 'default';
    }

    /**
     * Gives file ID to dataTransfer for further processing
     * @param e
     */
    drag(e) {

        this.clicked();
        this.focusout();
        let id = e.target.id;
        e.dataTransfer.setData("text", id);

    }

    /**
     * Shows message in snackbar
     * @param message
     */
    showMessage(message){
        let event = new CustomEvent('wide-show-message', {detail: {message: message}, bubbles: true});
        this.dispatchEvent(event);
    }

}
customElements.define('wide-filetree-file', FileTreeFile);