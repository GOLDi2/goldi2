import { LitElement, html, property } from '@polymer/lit-element';
import { MDCRipple } from '@material/ripple/index';

import {IModel} from '../model'

import './examples-menu';
import './save-load-menu';
import './localstorage-menu';
import './board-menu';

class Header extends LitElement {
    @property()
    model: IModel;
    standalone: boolean; //standalone-variable

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        if (this.standalone==false) {
            return html`
        <img src="img/icon.png" style="max-height:35px; padding-left: 5px">
        <div class="header-left">
            <span class="header-title">
                <b>W I D E</b>
            </span>
            <wide-project-menu .model="${this.model}" .projects="${this.model?this.model.currentprojects:[]}"></wide-project-menu>
            <wide-examples-menu .model="${this.model}" .standalone="${this.standalone}"></wide-examples-menu>
            <wide-save-menu .model="${this.model}"></wide-save-menu>
            <wide-load-menu .model="${this.model}"></wide-load-menu>
            <wide-localstorage-menu .projects="${this.model?this.model.projects:[]}"></wide-localstorage-menu>
        </div>
        <div class="header-right">
            <button class="mdc-button header-button" @click="${() => {
                this.dispatchEvent(new CustomEvent('wide-compile', {bubbles: true}));
            }}" .disabled="${this.model && this.model.isCompiling}">
                ${this.model && this.model.isCompiling ? html`
                <svg class="mdc-circular-progress" viewBox="25 25 50 50">
                    <circle class="mdc-circular-progress__path" cx="50" cy="50" r="20" fill="none" stroke-width="2"
                        stroke-miterlimit="10" />
                </svg>
                ` : html`
                <i class="material-icons">check</i>
                `
                }
                <span>Compile</span>
            </button>
            <button class="mdc-button header-button" @click="${() => {
                this.dispatchEvent(new CustomEvent('wide-upload', {bubbles: true}));
            }}" .disabled="${this.model && this.model.isUploading}">
                ${this.model && this.model.isUploading ? html`
                <svg class="mdc-circular-progress" viewBox="25 25 50 50">
                    <circle class="mdc-circular-progress__path" cx="50" cy="50" r="20" fill="none" stroke-width="2"
                        stroke-miterlimit="10" />
                </svg>
                ` : html`
                <i class="material-icons">file_upload</i>
                `
                }
                <span>Upload</span>
            </button>
        </div>
    `
        } else {
            return html`
            <img src="img/icon.png" style="max-height:35px; padding-left: 5px">
            <div class="header-left">
                <span class="header-title">
                    <b>W I D E</b>
                </span>
                <wide-project-menu .model="${this.model}" .projects="${this.model?this.model.currentprojects:[]}"></wide-project-menu>
                <wide-examples-menu .model="${this.model}" .standalone="${this.standalone}"></wide-examples-menu>
                <wide-save-menu .model="${this.model}"></wide-save-menu>
                <wide-load-menu .model="${this.model}"></wide-load-menu>
                <wide-localstorage-menu .projects="${this.model?this.model.projects:[]}"></wide-localstorage-menu>
                ${this.renderBoardMenu(true)}
            </div>
            <div class="header-right">
            <button class="mdc-button header-button" @click="${() => {
                this.dispatchEvent(new CustomEvent('wide-compile', {bubbles: true}));
            }}" .disabled="${this.model && this.model.isCompiling}">
                ${this.model && this.model.isCompiling ? html`
                        <svg class="mdc-circular-progress" viewBox="25 25 50 50">
                            <circle class="mdc-circular-progress__path" cx="50" cy="50" r="20" fill="none" stroke-width="2"
                                stroke-miterlimit="10" />
                        </svg>
                        ` : html`
                        <i class="material-icons">check</i>
                        `
                        }
                        <span>Compile</span>
                    </button>
                </div>
            `
        }
    };

    firstUpdated() {
        this.querySelectorAll('button').forEach((button) => {
            new MDCRipple(button);
        })
    }

    renderBoardMenu(enabled: boolean) {
        if (enabled && !!this.model && !!this.model.supportedBoards && !!this.model.selected_board && !!this.model.selectedproject) {
            return html`<wide-board-menu    
                            .boardOptions="${this.model.supportedBoards}" 
                            .selectedBoard="${this.model.supportedBoards.find((board) => board.FQBN == this.model.selected_board.FQBN)}" 
                            .selectedBoardConfigOptions="${this.model.selected_board.options}" 
                            .visible="${this.model.selectedproject.language.name=="Arduino"}">
                        </wide-board-menu>`
        }
    }

}
customElements.define('wide-header', Header);
