import { html, LitElement, property } from '@polymer/lit-element';
import {ILanguage, IModel} from '../model'

import './file-adder';
import './filetree-directory';
import './filetree-file';
import './directory-adder';

class FileTree extends LitElement {
    @property()
    model: IModel;

    @property()
    language: ILanguage;

    @property()
    visible: boolean;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <ul class="mdc-list" id="filetree%list">
                <wide-filetree-directory id="globalDirectory" .model="${this.model}" .language="${this.language}" .globalParentDirectory="${this.model?this.model.parentDirectory:'WIDE-Projekt'}" .files="${this.model?this.model.files.map((file)=> {return {path: file.name, severity:file.severity, trueName: file.name}}):[]}" .selectedFile="${this.model?this.model.selectedFile:''}"></wide-filetree-directory>
            </ul>
            <wide-file-adder .language="${this.language}"></wide-file-adder>
            <br>
            <wide-directory-adder .language="${this.language}"></wide-directory-adder>
        `;
    }

    updated(changedProperties) {
        if (this.language.canAddFiles == false && this.language.canAddFolders == false) {
            document.getElementById("filetree%list").style.height = "calc(100% - 20px)";
        } else if (this.language.canAddFiles == false || this.language.canAddFolders == false) {
            document.getElementById("filetree%list").style.height = "calc(100% - 76px)";
        } else {
            document.getElementById("filetree%list").style.height = "calc(100% - 132px)";
        }
    }
}
customElements.define('wide-filetree', FileTree);