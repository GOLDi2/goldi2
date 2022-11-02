/**
 * Class to display the minimized expressions.
 */
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-item/paper-item";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox.js";
import { expressionTree, expressionType, getExpressionAsExpTrees, getExpressionAsTerms } from "./qmclib.js";
import { ISaneData } from "./sane-data.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin } from "./eventlib.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";

class SaneAllFunctions extends EventMixin(AppLocalizeMixin()) {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					user-select: none;
					-webkit-user-select: none; /* Chrome all / Safari all */
					-moz-user-select: none; /* Firefox all */
					-ms-user-select: none; /* IE 10+ */
					--paper-input-container-label: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-focus-color: var(--sane-light-primary-color);
					--paper-input-container-input-color: var(--app-card-font-color);
				}

				paper-listbox {
					padding: 0;
					background: var(--app-background-color);
					color: var(--app-card-font-color);
				}

				paper-item {
					background: var(--app-background-color);
					color: var(--app-card-font-color);
				}

				sane-equation-input {
					--sane-equation-input-label-width: 0em;
				}
			</style>
			<paper-dropdown-menu label="[[localize('vocab-minimization-type')]]">
				<paper-listbox slot="dropdown-content" selected="{{selectedType}}" fallback-selection="0">
					<paper-item>KDNF</paper-item>
					<paper-item>KKNF</paper-item>
					<paper-item>DNF</paper-item>
					<paper-item>KNF</paper-item>
					<paper-item>KNANF</paper-item>
					<paper-item>KNONF</paper-item>
					<paper-item>NANF</paper-item>
					<paper-item>NONF</paper-item>
				</paper-listbox>
			</paper-dropdown-menu>
			<hr>
			<h2>[[localize('vocab-boolean-expressions')]]</h2>
			<template is="dom-repeat" items="[[calcOutputs(data.*)]]" as="selectedOutput">
				<template is="dom-repeat" items="[[makeExpTrees(data.*, selectedType, selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
				</template>
				<!--<paper-input readonly id="expressionInputField" label="y[[index]] =" value="[[convertToExpression(selectedType, index, data.*)]]"></paper-input>-->
			</template>
		`;
	}
	static get is() {
		return "sane-all-functions";
	}

	constructor() {
		super();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}

	public ready() {
		super.ready();
		// check for start configuration features
		// check if dropdown can be used
		if (startConfiguration && checkSCBlockedFeatures("allFunctions", "defaultType") !== "") {
			const defaultSelected: string = checkSCBlockedFeatures("allFunctions", "defaultType");
			let select = "0";
			switch (defaultSelected) {
				case "kdnf": select = "0"; break;
				case "kknf": select = "1"; break;
				case "dnf": select = "2"; break;
				case "knf": select = "3"; break;
			}
			(this.shadowRoot!.querySelector("#all_functions_listbox") as PaperListboxElement).setAttribute("selected", select);
		}
		// check if default value was assigned
		if ((startConfiguration && checkSCBlockedFeatures("allFunctions", "changeType") === false)) {
			(this.shadowRoot!.querySelector("#all_functions_dopdown") as any).setAttribute("disabled", true);
		}
	}

	public incNum(n: number) {
		return n + 1;
	}

	public getUpperCaseTypeBySelection(selectedType: string | number): string {
		return this.getTypeBySelection(selectedType).toUpperCase();
	}

	public getTypeBySelection(selectedType: string | number): expressionType {
		if (typeof selectedType === "string") {
			selectedType = parseInt(selectedType, 10);
		}

		let type: expressionType = "input";

		switch (selectedType) {
			case 0: type = "kdnf"; break;
			case 1: type = "kknf"; break;
			case 2: type = "dnf"; break;
			case 3: type = "knf"; break;
			case 4: type = "knanf"; break;
			case 5: type = "knonf"; break;
			case 6: type = "nanf"; break;
			case 7: type = "nonf"; break;
		}

		return type;
	}

	public makeExpTrees(dataInfo: any, type: string | number, output: number): expressionTree[] {
		const test = getExpressionAsExpTrees(dataInfo.base as ISaneData, this.getTypeBySelection(type), output);
		return test;
	}

	/**
	 * Called from data binding. Computes the expression string which is set as the value of the <paper-input>.
	 * Empties any fields set to be a user input field.
	 * @param {number} selectedType The required form of the equation as the selected value of the dropdown element.
	 * @param {number} index The index of the y-function.
	 * @param dataInfo The SaneData object.
	 * @returns {string} The expression string that appears in the <paper-input> field.
	 */
	public convertToExpression(selectedType: number, index: number, dataInfo: any): string {
		const data = dataInfo.base as ISaneData;	// SaneData object

		let type: expressionType = "input";
		switch (selectedType) {
			case 0: type = "kdnf"; break;
			case 1: type = "kknf"; break;
			case 2: type = "dnf"; break;
			case 3: type = "knf"; break;
		}
		// check for start configuration features
		// check if default value was assigned
		if (startConfiguration && checkSCBlockedFeatures("allFunctions", "defaultType") !== "") {
			type = checkSCBlockedFeatures("allFunctions", "defaultType");
		}
		// if set to be user input field, or if type is undefined, delete content whenever changes to SaneData happen
		if (type === "input" || !type) {
			return "";
		}
		return getExpressionAsTerms(data, type, index).toString(); // call and return from qmclib

		// -- TODO: check last function index to detect if changes to SaneData come form this input
		// -- -> then don't clear w/ data binding (convertToExpression)
	}

	/**
	 * Creates an array, that runs from 0 to currently used outputs
	 * @param dataInfo
	 * @return {any[]}
	 */
	private calcOutputs(dataInfo: any): any[] {
		const data = dataInfo.base as ISaneData;
		const test = [...Array(data.nOutputColumns).keys()];
		return test;
	}
}

customElements.define(SaneAllFunctions.is, SaneAllFunctions);
