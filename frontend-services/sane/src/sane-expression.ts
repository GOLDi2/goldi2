import "./sane-equation-input";

import { AppLocalizeMixin } from "./custom-type-base-lib";
import { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import { ISaneData } from "./sane-data";
import { expressionTree, expressionType, getExpressionAsExpTrees, getExpressionAsTerms } from "./qmclib.js";
import { getBit } from "./boollib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin, Events } from "./eventlib.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";

/**
 * Class to display the minimized expressions.
 */
class SaneExpression extends EventMixin(AppLocalizeMixin()) {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					user-select: none;
					-webkit-user-select: none;  /* Chrome all / Safari all */
					-moz-user-select: none;     /* Firefox all */
					-ms-user-select: none;      /* IE 10+ */
					--paper-input-container-label: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-input: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-focus-color: var(--sane-dark-secondary-color);
					--paper-input-container-input-color: var(--app-card-font-color);
				}
				paper-listbox{
					padding: 0;
					background: var(--app-background-color);
					color: var(--app-card-font-color);
				}
				paper-listbox paper-item {
					color: var(--app-card-font-color);
				}
				.error-item {
					color: var(--app-alert-color);
				}
				#boolean_algebra_input {
					--sane-equation-input-label-width: 0em;
				}
			</style>
			<paper-dropdown-menu id="boolean_algebra_dopdown" label="[[localize('vocab-output-function')]]" required>
				<paper-listbox id="boolean_algebra_listbox" slot="dropdown-content" selected="{{selectedOutput}}" fallback-selection="0">
					<template is="dom-repeat" items="[[calcOutputs(data.*)]]" as="index">
						<paper-item>y[[index]]</paper-item>
					</template>
				</paper-listbox>
			</paper-dropdown-menu>
			<h2>[[localize('BAA-input-new-expression')]]</h2>
			<sane-equation-input id="boolean_algebra_input" hover char-set="[[data.charSet]]" description="" lhs="y_[[selectedOutput]]" tree="[[makeExpTrees(data.*, 'input', selectedOutput)]]"
			on-sane-equation-input-changed="onInputChange"></sane-equation-input>
			<hr>
			<h2>[[localize('vocab-boolean-expressions')]]</h2>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'kdnf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. KDNF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'kknf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. KKNF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'dnf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. DNF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'knf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. KNF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'knanf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. KNANF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'knonf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. KNONF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'nanf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. NANF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
			<template is="dom-repeat" items="[[makeExpTrees(data.*, 'nonf', selectedOutput)]]">
					<sane-equation-input hover readonly char-set="[[data.charSet]]" description="[[incNum(index)]]. NONF: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
			</template>
		`;
	}

	public static is = "sane-expression";

	public static get properties() {
		return {
			equation: {
				notify: true,
				reflectToAttribute: true,
				type: Number,
				value: "0",
			},
			exptype: {
				notify: true,
				reflectToAttribute: true,
				type: String,
			},
			isUserInputBox: {
				notify: true,
				reflectToAttribute: true,
				type: Boolean,
			},
			language: {
				notify: true,
				reflectToAttribute: true,
				type: String,
			},
		};
	}

	public isUserInputBox: boolean = false;
	public value: string = "";
	public exptype: expressionType = "input";
	public language: string = "en";
	private data: any;
	private selectedOutput: number = 0;
	private equationIndex: number = 0;
	private lastInputFunctionIndex: string = "";
	private lastInputString: string = "";

	constructor() {
		super();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
		this.data = {};
	}

	public ready() {
		super.ready();
		// check for start configuration features
		// check if dropdown can be used
		if (startConfiguration && checkSCBlockedFeatures("booleanAlgebra", "defaultY") !== "") {
			const select: string = checkSCBlockedFeatures("booleanAlgebra", "defaultY").toString();
			(this.shadowRoot!.querySelector("#boolean_algebra_listbox") as PaperListboxElement).setAttribute("selected", select);
		}
		// check if default value was assigned
		if ((startConfiguration && checkSCBlockedFeatures("booleanAlgebra", "changeY") === false)) {
			(this.shadowRoot!.querySelector("#boolean_algebra_dopdown") as any).setAttribute("disabled", true);
		}
		// check if input can be used
		if ((startConfiguration && checkSCBlockedFeatures("booleanAlgebra", "inputNewFunction") === false)) {
			(this.shadowRoot!.querySelector("#boolean_algebra_input") as PaperInputElement).setAttribute("disabled", "true");
		}
	}

	/**
	 * Called from data binding. Computes the expression string which is set as the value of the <paper-input>.
	 * Empties any fields set to be a user input field.
	 * @param {expressionType} type The required form of the equation. Is one of 'expressionType'.
	 * @param {number} index The index of the y-function.
	 * @param centralData The SaneData object.
	 * @returns {string} The expression string that appears in the <paper-input> field.
	 */
	public convertToExpression(type: expressionType, index: number, centralData: any): string {
		this.data = centralData.base as ISaneData;	// SaneData object
		this.equationIndex = index;
		// if set to be user input field, or if type is undefined, delete content whenever changes to SaneData happen
		if (type === "input" || !type) {
			let dataFI: string = "";
			const nrrows = 2 ** this.data.nInputColumns;
			for (let i = nrrows - 1; i >= 0; i--) {
				dataFI += getBit(this.data.outputRows[i].output, index).toString();
			}
			if (dataFI === this.lastInputFunctionIndex) {
				return this.lastInputString;
			} else {
				return "";
			}
		}
		if (!index) { index = 0; }
		// check for start configuration features
		// check if default value was assigned
		if (startConfiguration && checkSCBlockedFeatures("booleanAlgebra", "defaultY") !== "") {
			index = checkSCBlockedFeatures("booleanAlgebra", "defaultY");
		}

		return getExpressionAsTerms(this.data, type, index).toString(); // call and return from qmclib
	}

	public makeExpTrees(dataInfo: any, type: expressionType, output: number): expressionTree[] {
		return getExpressionAsExpTrees(dataInfo.base as ISaneData, type, output);
	}

	public incNum(n: number) {
		return n + 1;
	}

	public onInputChange(e: CustomEvent) {
		e.detail.index = this.selectedOutput;
		this.triggerEvent(Events.setOutputTree, e);
	}

	/**
	 * Creates an array, that runs from 0 to currently used outputs
	 * @param dataInfo
	 * @return {any[]}
	 */
	private calcOutputs(dataInfo: any): any[] {
		const data = dataInfo.base as ISaneData;
		return Array(data.nOutputColumns);
	}
}

customElements.define(SaneExpression.is, SaneExpression);
