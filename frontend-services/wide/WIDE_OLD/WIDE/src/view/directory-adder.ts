import { html, LitElement, property } from '@polymer/lit-element';
import { MDCTextField } from '@material/textfield/index';
import {ILanguage} from "../model";

/**
 * class for creating new directories
 */
class DirectoryAdder extends LitElement {
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
                    <input pattern="^[a-zA-Z0-9]{1,}([ |_]{1}[a-zA-Z0-9]{1,}){0,}$" type="text" id="my-input" class="mdc-text-field__input" @dragover="${this.dontAllowDrop}">
                    <label for="my-input" class="mdc-floating-label">Add directory</label>
                </div>
            </span>
        `;
    }

    firstUpdated() {
        this.input = this.querySelector('input');
        const textField = new MDCTextField(this.querySelector('.mdc-text-field'));
    }

    updated(changedProperties) {
        this.style.display = this.language.canAddFolders ? "inline" : "none";
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
     * Checks if input is correct and adds new directory to filetree
     */
    submit() {
        this.input.checkValidity();
        if (this.input.value.length > 0 && this.input.validity.patternMismatch==false) {
            let event = new CustomEvent('wide-directory-added', { detail: { filename: this.input.value }, bubbles: true });
            this.input.value = '';
            this.dispatchEvent(event);
        } else {
            this.showMessage('Directory name is not allowed!');
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
customElements.define('wide-directory-adder', DirectoryAdder);