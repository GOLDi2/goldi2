import "@polymer/paper-dialog/paper-dialog";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";
import "@polymer/neon-animation/animations/fade-out-animation";
import "@polymer/neon-animation/animations/fade-in-animation";
import "@polymer/paper-toggle-button/paper-toggle-button";
import "@polymer/paper-button/paper-button";
import "@polymer/iron-icons/iron-icons";

import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/iron-icons/hardware-icons";
import "@polymer/iron-icon/iron-icon";

import "./shared-styles";

import { AppLocalizeMixin } from "./custom-type-base-lib";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import { IronOverlayBehaviorImpl } from "@polymer/iron-overlay-behavior/iron-overlay-behavior.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin, Events } from "./eventlib.js";
import { checkSCData, startConfiguration } from "./startconfiglib.js";
import { importSchematic, IValidationObj, IValidationProp, IValidationWrapper } from "./validationlib.js";
import { PaperToggleButtonElement } from "@polymer/paper-toggle-button/paper-toggle-button.js";
/**
 * SaneSettings class
 * @class
 * @classdesc Implements the settings element of sane.
 */

class SaneSettings extends EventMixin(AppLocalizeMixin()) {
	static get template() {
		return html`
			<style include="shared-styles">
				:host {
					display: flex;
					--paper-input-container-label: {
						color: var(--app-card-font-color);
					}
					;
					--paper-input-container-input: {
						color: var(--app-card-font-color);
					}
					;
					--paper-input-container-focus-color: var(--sane-dark-secondary-color);
					--paper-input-container-input-color: var(--app-card-font-color);
					--paper-toggle-button-unchecked-bar-color: var(--app-card-font-color);
					--paper-toggle-button-checked-bar-color: var(--app-card-font-color);
					--paper-toggle-button-unchecked-button-color: var(--sane-dark-secondary-color);
					--paper-toggle-button-checked-button-color: var(--sane-dark-secondary-color);
				}

				paper-dialog {
					pointer-events: all !important;
					cursor: default;
					background: var(--app-card-background-color);
					max-height: 95vh;
				}

				paper-toggle-button,
				#export-anchor,
				#import-anchor {
					cursor: pointer;
				}

				paper-input {
					--paper-input-container-input: {
						cursor: text;
					}
				}

				paper-dialog paper-dialog-scrollable {
					--paper-dialog-scrollable: {
						max-height: 80vh;
					}
				}

				.listcontainer {
					display: flex;
					flex-direction: column;
					padding: 0;
					margin: 0;
					background: var(--app-card-background-color);
					color: var(--app-card-font-color);
					--paper-input-container-input-color: var(--app-card-font-color);
				}

				.listrow {
					display: flex;
					align-items: center;
					text-align: center;
					padding-bottom: 16px;
					font-size: 16px;
				}

				.flex-wrap-container {
					max-width: 300px;
					margin: auto;
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
					justify-content: space-evenly;
				}

				.listcontainer span,
				.listcontainer paper-icon-button,
				.listcontainer iron-icon {
					padding: 5px;
				}

				.drawer-icon {
					height: 1.2em;
				}

				#inputField {
					display: none;
				}

				paper-input {
					max-width: 10em;
					margin: 0.5em 0 1em 0;
					--paper-input-error: {
						position: relative;
						white-space: normal;
					}
				}

				app-toolbar {
					margin: 0;
					background: var(--app-background-color);
				}

				app-toolbar div {
					position: absolute;
					right: 0;
					color: var(--app-card-font-color);
				}

				app-toolbar span {
					color: var(--app-card-font-color);
				}

				#export-anchor {
					text-align: left;
					width: 100%;
				}

				#export-anchor span {
					padding-left: 0;
				}

				a:link,
				a:visited,
				a:hover,
				a:active {
					text-decoration: none;
					color: var(--app-card-font-color);
				}

				a paper-icon-button {
					padding: 5px;
				}

				/* more than 1 and doesnt connect, 2 media queries necessary*/
				@media screen and (max-width: 1279px) {
					#wideButton {
						pointer-events: none;
					}
					#wideButton span {
						color: #ddd;
					}
				}
				@media screen and (max-device-width: 1279px) {
					#wideButton {
						pointer-events: none;
					}
					#wideButton span {
						color: #ddd;
					}
				}

				#permalink {
					text-align: left;
					max-width: 100%;
					width: 100%;
				}

			</style>
			<div id="title">
				<iron-icon class="drawer-icon" icon="icons:settings"></iron-icon>
				<span hidden="[[!hasName]]">[[localize('title-settings')]]</span>
			</div>
			<paper-dialog id="settings">
				<app-toolbar>
					<h2>[[localize('title-settings')]]</h2>
					<div>
						<paper-icon-button on-click="closeSettings" icon="icons:clear"></paper-icon-button>
					</div>
				</app-toolbar>
				<paper-dialog-scrollable>
					<div class="listcontainer">
						<div class="listrow">
							<iron-icon icon="icons:language"></iron-icon>
							<span class="lang" title="english">EN</span>
							<paper-toggle-button on-change="toggleLanguage" id="langSwitch"></paper-toggle-button>
							<span class="lang" title="german">DE</span>
						</div>
						<div class="listrow">
							<iron-icon icon="image:palette"></iron-icon>
							<span class="lang" title="light">[[localize('settings-theme-light')]]</span>
							<paper-toggle-button on-change="toggleColor" id="colorSwitch"></paper-toggle-button>
							<span class="lang" title="dark">[[localize('settings-theme-dark')]]</span>
						</div>
						<div class="listrow">
							<iron-icon icon="hardware:phone-iphone"></iron-icon>
							<span class="lang" title="narrow">[[localize('settings-layout-narrow')]]</span>
							<paper-toggle-button on-change="switchLayout" id="layoutSwitch"></paper-toggle-button>
							<span class="lang" title="wide">[[localize('settings-layout-wide')]]</span>
							<iron-icon icon="hardware:desktop-mac"></iron-icon>
						</div>
						<div class="listrow">
							<a id="export-anchor" href="[[exportString]]" download="sane-data.json" on-mousedown="exportSaneData">
								<paper-icon-button icon="icons:file-download"></paper-icon-button>
								<span>[[localize('settings-export')]]</span>
							</a>
						</div>
						<div class="listrow" id="import-anchor" on-click="openInputDialog">
							<input id="inputField" on-change="importSaneData" type="file" accept=".json">
							<paper-icon-button icon="icons:file-upload"></paper-icon-button>
							<span>[[localize('settings-import')]]</span>
						</div>
						<div class="listrow">
							<paper-input id="permalink" label="Permalink" maxlength="1" always-float-label readonly>
								<paper-icon-button slot="suffix" icon="content-copy" on-click="copyPermalink"></paper-icon-button>
							</paper-input>
						</div>
						<h3>[[localize('settings-charset-info')]]</h3>
						<div class="flex-wrap-container">
							<paper-input id="andChar" label="[[localize('settings-charset-and')]]" maxlength="1" always-float-label placeholder="[[data.charSet.andChar]]"
							auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
							<paper-input id="orChar" label="[[localize('settings-charset-or')]]" maxlength="1" always-float-label placeholder="[[data.charSet.orChar]]"
							auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
							<paper-input id="notChar" label="[[localize('settings-charset-not')]]" maxlength="1" always-float-label placeholder="[[data.charSet.notChar]]"
							auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
							<paper-input id="implyChar" label="[[localize('settings-charset-imply')]]" maxlength="1" always-float-label
							placeholder="[[data.charSet.implyChar]]" auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
							<paper-input id="equivChar" label="[[localize('settings-charset-equiv')]]" maxlength="1" always-float-label
							placeholder="[[data.charSet.equivChar]]" auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
							<paper-input id="antivalChar" label="[[localize('settings-charset-antival')]]" maxlength="1" always-float-label
							placeholder="[[data.charSet.antivalChar]]" auto-validate pattern="[[validationPattern]]" error-message="0-9,x,X,y,Y,g,(,),[,],? and used chars are forbidden!"
							on-input="onCustomCharInput" on-click="computeValidationPattern">
							</paper-input>
						</div>
					</div>
				</paper-dialog-scrollable>
			</paper-dialog>

		`;
	}
	private data: any;
	private exportString: string = "";
	private validationPattern = "";

	public static get is() {return "sane-settings"; }

	public static get properties() {
		return {
			hasName: {
				notify: true,
				reflectToAttribute: true,
				type: Boolean,
			},
		};
	}

	constructor() {
		super();
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
		// check for existing SaneData in start configuration
		// if it exists, import it
		const startConfigData = checkSCData();
		if (startConfigData) {
			this.importSaneData();
		}

		// set toggles to current values
		(this.$.langSwitch as PaperToggleButtonElement).checked = this.language === "de";
		(this.$.layoutSwitch as PaperToggleButtonElement).checked = this.isWideLayout();
	}

	/**
	 * Imports another state of sane.
	 */
	private importSaneData() {
		if (startConfiguration) {
			if (this.isValid(importSchematic as IValidationObj,
				{importDataWrapper: startConfiguration.data} as IValidationWrapper)) {
				this.triggerEvent(Events.importSaneData, {detail: startConfiguration.data.saneData});
			} else {
				this.notifySane(this.localizeSane("error-1402"));
			}
		} else {
			// read import string
			const reader = new FileReader();
			let buffer: string = "";
			reader.readAsText(((this.$.inputField as HTMLInputElement).files as FileList)[0]);
			reader.onload = (e) => {
				buffer = reader.result as string;	// was read by readAsText → it's a string
				// reset FileList, needed to ensure that the list contains only the actual file
				(this.$.inputField as HTMLInputElement).value = "";
				(this.$.inputField as HTMLInputElement).type = "";
				(this.$.inputField as HTMLInputElement).type = "file";
				// parse to object
				let importData: any;
				try {
					importData = JSON.parse(buffer);
				} catch (e) {
					this.notifySane(this.localizeSane("error-1101"));
					return;
				}
				// validation
				if (this.isValid(importSchematic as IValidationObj, {importDataWrapper: importData} as IValidationWrapper)
				) {
					this.triggerEvent(Events.importSaneData, {detail: importData.saneData});
				} else {
					this.notifySane(this.localizeSane("error-1102"));
				}
			};
		}
	}

	/**
	 * Opens settings-dialog.
	 */
	private openSettings(event: Event) {
		event.stopPropagation();
		(this.$.layoutSwitch as PaperToggleButtonElement).checked = this.isWideLayout();
		(this.$.settings as IronOverlayBehaviorImpl).open();

		const pageUrl = window.location.href; // get url
		const foundsSC = (pageUrl.indexOf("?") > 0) ? pageUrl.indexOf("?") : pageUrl.length;
		const scString = decodeURIComponent(pageUrl.substr(0, foundsSC)); // decode URI into regular string
		console.log({pageUrl, foundsSC, scString});
		this.exportSaneData(false);
		const input = this.shadowRoot?.querySelector("#permalink") as HTMLInputElement;
		input.value = scString + "?" + this.exportString;
	}

	/**
	 * Closes settings-dialog.
	 * To prevent unexpected behavior with the click event and possible under laying elements,
	 * set the iron-selected class in sv-drawer manually.
	 */
	private closeSettings(event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		const selectedElement =
			document.getElementsByTagName("sane-app")[0].shadowRoot!
				.querySelector("a[name=" + localStorage
				.getItem("pageLeft") + "]");
		selectedElement!.classList.add("iron-selected");
		(this.$.settings as IronOverlayBehaviorImpl).close();
	}

	/**
	 * Toggles language between English and German.
	 */
	private toggleLanguage() {
		const language = (this.$.langSwitch as PaperToggleButtonElement).checked ? "de" : "en";
		this.triggerEvent(Events.toggleLanguage, {detail: {selectedLanguage: language}});
	}

	/**
	 * Toggles color between light-theme and dark-theme.
	 */
	private toggleColor() {
		const color = (this.$.colorSwitch as PaperToggleButtonElement).checked ? "dark" : "light";
		this.triggerEvent(Events.toggleColor, {detail: {selectedColor: color}});
	}

	/**
	 * Returns true, iff in dual-view mode
	 */
	private isWideLayout(): boolean {
		return (document.querySelector("sane-app") as any).wideLayout;
	}

	/**
	 * Switches layout between single-view and dual-view.
	 */
	private switchLayout() {
		if ((this.$.layoutSwitch as PaperToggleButtonElement).checked) {
			this.triggerEvent(Events.toggleLayout, { detail: { wide: true } });
		} else {
			this.triggerEvent(Events.toggleLayout, { detail: { wide: false } });
		}

		// explicitly close, otherwise it will remain visible after switching back
		this.closeSettings();
	}

	/**
	 * Sets the exportAttribut to the actual state of Sane.
	 */
	private exportSaneData(forFile: boolean = true) {
		const exportObject = {
			color: (this.$.colorSwitch as PaperToggleButtonElement).checked ? "light" : "dark",
			language: this.language,
			saneData: this.data,
			saneVersion: "0.0.0", // TODO: access importSchematic -> prop -> saneVersion
		};

		if (forFile) {
			this.exportString = "data:text/json;charSet=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, "\t"));
		} else {
			this.exportString = JSON.stringify(exportObject, null, "");
		}

		// // this.exportString = (prefix ? "data:text/json;charSet=utf-8," : "") + encodeURIComponent(JSON.stringify({
		// // 	color: (this.$.colorSwitch as PaperToggleButtonElement).checked ? "light" : "dark",
		// // 	language: this.language,
		// // 	saneData: this.data,
		// // 	saneVersion: "0.0.0", // TODO: access importSchematic -> prop -> saneVersion
		// // }, null, "\t"));
	}

	private copyPermalink() {
		const input = this.shadowRoot!.querySelector("#permalink") as HTMLInputElement;

		if (input !== null) {
			navigator.clipboard.writeText(input.value);
		}
	}

	/**
	 * Opens file-selection-dialog.
	 */
	private openInputDialog() {
		(this.$.inputField as HTMLElement).click();
	}

	/**
	 * Gets new input char value and triggers event with it.
	 * @param {Event} e
	 */
	private onCustomCharInput(e: Event) {
		const inputElement = e.target as PaperInputElement;
		this.computeValidationPattern(e);	// update validation pattern
		if (inputElement.invalid === false && inputElement.value) { // inputElement.value to catch del operation on inputField
			this.triggerEvent(Events.setCustomChar, {detail: {customChar: inputElement.id, char: inputElement.value}});
		}
	}

	/**
	 * Computes the allowed patter in input-field.
	 * @param {Event} e
	 */
	private computeValidationPattern(e: Event) {
		const inputElement = e.target as PaperInputElement;
		const charSet = Object.assign({}, this.data.charSet);
		delete charSet[inputElement.id];
		let dynamicPattern = "";
		Object.keys(charSet).forEach((key) => {
			if (charSet[key] === "^" || charSet[key] === "-") {
				dynamicPattern += "\\" + charSet[key];
			} else {
				dynamicPattern += charSet[key];
			}
		});
		this.validationPattern = "[^\\dXxYyg" + dynamicPattern + "\\[\\]\\)\\(\\?]";
	}

	/**
	 * Recursive validation of given IValidationObj/Prop.
	 *
	 * Base cases:
	 * 1 - property is an IValidationProp object => do do type-based validation
	 * 2 - not one condition matches => return false
	 * Recursive step if property is an IValidationObj object
	 *
	 * Cases which lead to a recursion step:
	 * 1 - property.nbObjects >= 0, fixed size => normal recursive step
	 * 2 -  property.nbObjects >= 0, dynamic size => recursive step for every key of object array
	 *
	 * @param {IValidationObj | IValidationProp} property
	 * @param {IValidationWrapper} importedObject
	 * @returns {boolean}
	 */
	private isValid(property: IValidationObj | IValidationProp, importedObject: IValidationWrapper): boolean {
		// first condition for recursion, special case: outputRows => object with dynamic length
		// nbObject of outputRows is -1, important is the maximum value
		if (property.type === "object"
			&& importedObject.hasOwnProperty(property.name)
			&& property.nbObjects === -1
			&& Object.keys(importedObject[property.name]).length <= property.maxNbObjects) {
			// outputRows is an array of {mask: boolean, output: number[]}
			// Object.keys(outputRows).every iterates over this array
			// recursion step for each object of the array
			Object.keys(importedObject[property.name]).every((obj: string) => {
				return  (property as IValidationObj).properties.every( (prop) =>
					this.isValid(
						prop as IValidationObj,
						((importedObject[property.name] as IValidationObj)[obj] as IValidationObj)));
			});
			return true;
		// second condition of recursion, case: object with fix nbObjects
		} else if (property.type === "object"
			&& importedObject.hasOwnProperty(property.name)
			&& Object.keys(importedObject[property.name]).length === property.nbObjects) {
			// recursion step
			return  (property as IValidationObj).properties.every( (prop) =>
				this.isValid(
					prop as IValidationObj,
					(importedObject[property.name] as IValidationObj)));
		// base case of recursion, property is not an object
		} else if (importedObject.hasOwnProperty(property.name)
					&& typeof(importedObject[property.name]) === property.type) {
			// checks a number for being between min and max value
			if (property.type === "number"
				&& property.minValue <= importedObject[property.name]
				&& importedObject[property.name] <= property.maxValue) {
				return true;
			// checks a string to match a given pattern as regExp
			} else if (property.type === "string"
				&& typeof importedObject[property.name] === "string"
				&& (new RegExp((property as IValidationProp).pattern)).test((importedObject[property.name] as string))) {
				return true;
			// checks if property of type boolean is a boolean
			} else if (property.type === "boolean" && typeof importedObject[property.name] === "boolean") {
				return true;
			}
		}
		// negative base case of recursion, method returns false
		return false;
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneSettings.is, SaneSettings);
