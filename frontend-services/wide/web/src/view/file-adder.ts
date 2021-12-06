import { html, LitElement, property } from '@polymer/lit-element';
import { MDCTextField } from '@material/textfield/index';
import {ILanguage} from "../model";

/**
 * class for creating new files
 */
class FileAdder extends LitElement {
    @property()
    parentDirectory: string;

    @property()
    language: ILanguage;

    isValid: boolean = false;

    private input: HTMLInputElement;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <span class="mdc-list-item__text" @keyup="${this.keyup}">
                <div class="mdc-text-field mdc-text-field--with-leading-icon">
                    <i class="material-icons mdc-text-field__icon">add</i>
                    <input pattern="^[a-zA-Z0-9]{1,}([_]{1}[a-zA-Z0-9]{1,}){0,}[.]{1}[a-zA-Z0-9]{1,}$" type="text" id="my-input" class="mdc-text-field__input" @dragover="${this.dontAllowDrop}">
                    <label for="my-input" class="mdc-floating-label">Add file</label>
                </div>
            </span>
        `;
    }

    firstUpdated() {
        this.input = this.querySelector('input');
        const textField = new MDCTextField(this.querySelector('.mdc-text-field'));
    }

    updated(changedProperties) {
        this.style.display = this.language.canAddFiles ? "inline" : "none";
    }

    /**
     * Don't allows dropping files/directories here
     * @param e
     */
    dontAllowDrop(e) {
        e.preventDefault();
    }

    /**
     * Checks if enter-button is pressed if so triggers submit()-function
     * @param e
     */
    keyup(e) {
        if (e.keyCode == 13) {
            this.submit();
        }
    }

    /**
     * Checks if input is correct and adds new file to filetree
     * Also shows message if file extension isn't the same as the for compiling predefined ones
     */
    submit() {
        this.input.checkValidity();
        if (this.input.value.length > 0 && this.input.validity.patternMismatch==false) {
                let languageEvent = new CustomEvent('wide-language-test',{detail: {name:this.input.value}, bubbles: true});
                this.dispatchEvent(languageEvent);
                let addEvent = new CustomEvent('wide-file-added', {detail: {filename: this.input.value}, bubbles: true});
                this.dispatchEvent(addEvent);
                this.input.value = '';
            } else {
                this.showMessage('Filename is not allowed!');
            }
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
customElements.define('wide-file-adder', FileAdder);