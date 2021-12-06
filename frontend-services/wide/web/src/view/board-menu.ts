import { LitElement, html, property } from '@polymer/lit-element';
import {IBoard, IBoardConfiguration} from "../model";
import {MDCDialog} from "@material/dialog/component";
import {MDCSelect} from "@material/select";

/**
 * the class for the Board-Menu
 * @class BoardMenu
 * @property boardOptions               - contains all boards with all possible options
 * @property visible                    - indicates whether the menu should be visible or not
 * @property selectedBoard              - the currently selected board
 * @property selectedBoardConfigOptions - the current configuration options with their selected value for the selected board
 * @property dialog                     - the dialog containing the selects
 * @property selectBoards               - the select for the boards
 * @property selectConfigOptions        - the select for the configuration options of the selected board
 * @property selectCOBuffer             - an array containing the names of the options of a newly selected board for the update of selectConfigOptions
 */
class BoardMenu extends LitElement {

    @property()
    boardOptions: Array<IBoard>;

    @property()
    visible: boolean;

    @property()
    selectedBoard: IBoard;

    @property()
    selectedBoardConfigOptions: Array<{option: string, option_label: string, value: string, value_label: string}>;

    dialog: MDCDialog;
    selectBoards: MDCSelect;
    selectConfigOptions: Array<{option: string, select: MDCSelect}>;
    selectCOBuffer: Array<string>;

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
    render() {
        return html`
            ${this.renderDialog()}
        `;
    }

    /**
     * renders the dialog which contains all the selects
     */
    renderDialog() {
        return html`
            <div class="mdc-menu-surface--anchor" style="display: ${this.visible?"inline-block":"none"}">
                <button class="mdc-button header-button" id="button%boardmenu" @click="${() => this.open()}">Board Menu</button>
            </div>
            <div    class="mdc-dialog" 
                    id="board-dialog"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="my-dialog-title"
                    aria-describedby="my-dialog-content"
                    style="visibility: visible">
                <div class="mdc-dialog__container">
                    <div class="mdc-dialog__surface" style="max-width: fit-content; max-width: -moz-fit-content;">
                        <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
                        <h2 class="mdc-dialog__title" id="my-dialog-title"><!--
                        -->Board Menu<!--
                        --></h2>
                        <div class="mdc-dialog__content" id="my-dialog-content">
                            Choose your Board Configuration
                        </div>
                        ${this.renderBoardSelect()}
                        ${this.renderBoardConfigOptionSelect()}
                        <footer class="mdc-dialog__actions">
                            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="no">
                                <span class="mdc-button__label">Leave</span>
                            </button>
                        </footer>
                    </div>
                </div>
                <div class="mdc-dialog__scrim"></div>
            </div>
        `
    }

    /**
     * renders the select for all boards
     */
    renderBoardSelect() {
        let boards = this.boardOptions.map((board) => {
            return html`<li class="mdc-list-item" @click="${() => this.selectBoard(board)}" id="select%board%${board.name}" data-value="${board.name}">${board.name}</li>`
        });
        return html`
            <div class="board-select">
                <div class="mdc-select" id="select%board" style="width: -moz-available; width: -webkit-fill-available">
                    <input type="hidden" name="enhanced-select">
                    <i class="mdc-select__dropdown-icon"></i>
                    <div class="mdc-select__selected-text" id="selected%board"></div>
                    <div class="mdc-select__menu mdc-menu mdc-menu-surface" id="menu%board">
                        <ul class="mdc-list">
                            <li class="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true" style="display: none"></li>
                            ${boards}
                        </ul>
                    </div>
                <span class="mdc-floating-label" id="label%board">Pick a Board</span>
                <div class="mdc-line-ripple"></div>
                </div>
            </div>
        `;
    }

    /**
     * updates the selected board
     * @param board - the selected board
     */
    selectBoard(board: IBoard) {
        if (JSON.stringify(this.selectedBoard) != JSON.stringify(board)) {
            this.selectedBoard = board;
            this.selectedBoardConfigOptions = [];
            if (this.selectedBoard.config_options != undefined) {
                this.selectedBoard.config_options.forEach((option) => {
                    this.selectedBoardConfigOptions = this.selectedBoardConfigOptions.concat({option: option.option, option_label: option.option_label, value: option.values[0].value, value_label: option.values[0].value_label});
                });
            } else {
                this.selectConfigOptions = [];
            }
            this.updateSelectedBoard();
        }
    }

    /**
     * renders the different selects for the possible configuration options of the selected board
     * also updates the selectCOBuffer to signal if new selects are needed
     */
    renderBoardConfigOptionSelect() {
        let result = [];
        this.selectCOBuffer = [];
        if (!!this.selectedBoard.config_options) {
            this.selectedBoard.config_options.forEach((config_option) => {
                this.selectCOBuffer = this.selectCOBuffer.concat(config_option.option);
                let values = config_option.values.map((value) => {
                    let tempconfig_option = {
                        option: config_option.option,
                        option_label: config_option.option_label,
                        value: value.value,
                        value_label: value.value_label
                    };
                    return html`<li class="mdc-list-item" @click="${() => this.selectBoardConfigOption(tempconfig_option)}" id="select%option%${config_option.option}%${value.value}" data-value="${value.value_label}">${value.value_label}</li>`
                });
                result = result.concat(html`
                    <div class="option-select option-select%${config_option.option}">
                        <div class="mdc-select" data-mdc-auto-init="MDCSelect" id="select%option%${config_option.option}" style="width: -moz-available; width: -webkit-fill-available">
                            <input type="hidden" name="enhanced-select">
                            <i class="mdc-select__dropdown-icon"></i>
                            <div class="mdc-select__selected-text" id="selected%${config_option.option}"></div>
                            <div class="mdc-select__menu mdc-menu mdc-menu-surface" id="menu%${config_option.option}">
                                <ul class="mdc-list">
                                    <li class="mdc-list-item mdc-list-item--selected" data-value="" aria-selected="true" style="display: none"></li>
                                    ${values}
                                </ul>
                            </div>
                        <span class="mdc-floating-label" id="label%${config_option.option}">Pick a ${config_option.option_label}</span>
                        <div class="mdc-line-ripple"></div>
                        </div>
                    </div>
                `);
            });
        }
        return result;
    }

    /**
     * updates the value of the given configuration option for the board
     * @param config_option
     */
    selectBoardConfigOption(config_option: {option: string, option_label: string, value: string, value_label: string}) {
        this.selectedBoardConfigOptions = this.selectedBoardConfigOptions.filter((option) => option.option != config_option.option);
        this.selectedBoardConfigOptions = this.selectedBoardConfigOptions.concat(config_option);
        this.updateSelectedBoard();
    }

    /**
     * used to initialize some of the properties
     */
    firstUpdated() {
        this.dialog = new MDCDialog(document.getElementById('board-dialog'));
        this.selectBoards = new MDCSelect(document.getElementById('select%board'));
        this.selectBoards.value = this.selectedBoard.name;
        this.selectConfigOptions = [];
    }

    /**
     * performs changes that need to be executed after render() is finished like updating the selects for the configuration options
     * @param changedProperties
     */
    updated(changedProperties) {
        if (this.selectCOBuffer.length > 0 && changedProperties.has("selectedBoard")) {
            this.selectBoards.value = this.selectedBoard.name;
            this.resetConfigOptionSelects();
        }
        if (changedProperties.has("selectedBoardConfigOptions") && this.selectConfigOptions.length > 0) {
            this.selectedBoardConfigOptions.forEach((config_option) => {
                this.selectConfigOptions.find((option) => option.option == config_option.option)
                                        .select.value = config_option.value_label;
            });
        }
    }

    /**
     * opens the dialog
     */
    open(){
        this.dialog.open();
    }

    /**
     * helper function for resetConfigOptionSelects()
     */
    renameSelectConfigOptions() {
        this.selectCOBuffer.forEach((option) => {
            if (!this.selectConfigOptions.find((config_option) => config_option.option == option)) {
                this.selectConfigOptions.find((config_option) => !this.selectCOBuffer.includes(config_option.option)).option = option;
                this.selectConfigOptions.find((config_option) => config_option.option == option).select.value = this.selectedBoardConfigOptions.find((config_option) => config_option.option == option).value_label;
            }
        });
    }

    /**
     * "resets" the selects for the configuration selects of the given board
     * because of the way MDCSelect and lit-elements work no real reset takes place
     * but the selects are renamed or filtered out to reflect the change of the selected board
     */
    resetConfigOptionSelects() {
        if (this.selectCOBuffer.length == this.selectConfigOptions.length) {
            this.renameSelectConfigOptions();
        } else if ((this.selectCOBuffer.length > this.selectConfigOptions.length)) {
            this.selectCOBuffer.forEach((option) => {
                if (!this.selectConfigOptions.find((config_option) => config_option.option == option)) {
                    if (this.selectCOBuffer.length == this.selectConfigOptions.length) {
                        this.selectConfigOptions.find((config_option) => !this.selectCOBuffer.includes(config_option.option)).option = option;
                        this.selectConfigOptions.find((config_option) => config_option.option == option).select.value = this.selectedBoardConfigOptions.find((config_option) => config_option.option == option).value_label;
                    } else if(!this.selectConfigOptions.find((config_option) => config_option.select.root_ == document.getElementById("select%option%" + option))) {
                        this.selectConfigOptions = this.selectConfigOptions.concat({option: option, select: new MDCSelect(document.getElementById("select%option%" + option))});
                        this.selectConfigOptions.find((config_option) => config_option.option == option).select.value = this.selectedBoardConfigOptions.find((config_option) => config_option.option == option).value_label;
                    } else {
                        this.selectConfigOptions.find((config_option) => config_option.select.root_ == document.getElementById("select%option%" + option)).option = option;
                        this.selectConfigOptions.find((config_option) => config_option.option == option).select.value = this.selectedBoardConfigOptions.find((config_option) => config_option.option == option).value_label;
                    }
                }
            });
        } else {
            this.renameSelectConfigOptions();
            this.selectConfigOptions = this.selectConfigOptions.filter((config_option) => this.selectCOBuffer.includes(config_option.option));
        }
    }

    /**
     * Change the selected board of the current project
     */
    updateSelectedBoard(){
        let currentBoard:IBoardConfiguration = {name: this.selectedBoard.name, FQBN: this.selectedBoard.FQBN, options: this.selectedBoardConfigOptions};
        let event = new CustomEvent('wide-choose-board', { detail: { board: currentBoard }, bubbles: true });
        this.dispatchEvent(event);
    }

}
customElements.define('wide-board-menu', BoardMenu);