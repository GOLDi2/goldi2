import { ISaneData } from "./sane-data.js";
import { PaperDropdownMenuElement } from "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox.js";
import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import {
	expressionTree,
	expressionType,
	getExpressionAsExpTrees,
	getMinimalTerms,
	minimizationType,
} from "./qmclib.js";
import { getBit } from "./boollib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin } from "./eventlib.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";

/**
 * Class for the qmc table view.
 */
class SaneQmcTable extends EventMixin(AppLocalizeMixin()) {
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
					--paper-input-container-focus-color: var(--sane-light-primary-color);
					--paper-input-container-input-color: var(--app-card-font-color);
				}
				paper-listbox{
					padding: 0;
					background: var(--app-background-color);
					color: var(--app-card-font-color);
				}
				paper-listbox paper-item{
					color: var(--app-card-font-color);
				}
				.usedfalse {
					color: var(--app-alert-color);
				}

				.epitrue {
					color: var(--app-bright-logo-color);
				}

				.usedfalse:hover, .usedtrue:hover {
					background-color: var(--sane-hover-background-color);
					color: var(--primary-text-color);
					transition: all .1s cubic-bezier(.4, 0, .2, 1);
				}
				thead tr td {
					background-color: var(--sane-light-primary-color);
					color: #fff;
					padding: 8px 16px;
					min-height: 48px;
					font-weight: 500;
					text-align: center;
				}

				tbody tr td {
					border-bottom:1px solid  var(--app-divider-color);
					padding: 4px 12px;
				}

				.bubble_td {
					text-align: center;
				}
				.note {
					padding: 0;
					margin: 0;
				}
				.note iron-icon {
					height: 0.95em;
					vertical-align: center;
				}
				.selectiontable {
					margin-bottom: 1em;
					overflow-x: auto;
				}

				h2 {
					margin-bottom:0
				}

				#qmc_latex_output {
					--sane-equation-input-label-width: 0em;
				}
			</style>
			<paper-dropdown-menu id="qmc_dropdown_y" label="[[localize('vocab-output-function')]]">
				<paper-listbox id="qmc_listbox_y" slot="dropdown-content" selected="{{selectedOutput}}" fallback-selection="0">
					<template is="dom-repeat" items="[[calcOutputs(data.*)]]" as="index">
						<paper-item>y[[index]]</paper-item>
					</template>
				</paper-listbox>
			</paper-dropdown-menu>
			<paper-dropdown-menu id="qmc_dropdown_type" label="[[localize('vocab-minimization-type')]]">
				<paper-listbox id="qmc_listbox_type" slot="dropdown-content" selected="{{selectedType}}" fallback-selection="0">
					<paper-item>DNF</paper-item>
					<paper-item>KNF</paper-item>
				</paper-listbox>
			</paper-dropdown-menu>
			<hr/>
			<h2>[[localize('QMC-pi-table')]]</h2>
			<template is="dom-repeat" items="[[buildTable(data.*, selectedOutput, selectedType)]]" as="steps" index-as="idxStep">
				<table>
					<thead>
					<tr>
						<td>[[localize('vocab-index-group')]]</td>
						<td>[[localize('vocab-input-set')]]</td>
					</tr>
					</thead>
					<tbody>
						<template is="dom-repeat" items="[[steps]]" as="grps" index-as="idxGrp">
							<tr>
								<td>
									<span>[[getGroupName(idxStep, idxGrp)]]</span>
								</td>
								<td>
									<template is="dom-repeat" items="[[grps]]" as="elems" index-as="idxElem">
										<span class$="used[[elems.used]]">[[elems.elementString]]&nbsp;<sup>[[elems.distance]]</sup></span>&nbsp;
									</template>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
				<p></p>
			</template>

			<h2>[[localize('vocab-selection-table')]]</h2>
				<paper-dropdown-menu id="qmc_solution_selection" label="[[localize('vocab-solution-selection')]]">
				<paper-listbox id="qmc_listbox_solution" slot="dropdown-content" selected="{{selectedSolution}}" fallback-selection="0">
					<template is="dom-repeat" id="qmc_solutionstemplate" items="[[buildMinSolutions(data.*,selectedOutput,selectedType)]]" as="solution">
						<paper-item id="qmc_finalSolutionTemplate[[index]]">[[getSolutionString(solution)]]</paper-item>
					</template>
				</paper-listbox>
			</paper-dropdown-menu>
			<br><br>
			<div class="selectiontable">
				<table>
					<thead>
					<tr>
						<td></td>
						<td></td>
						<template is="dom-repeat" items="[[buildSelectTableHead(data.*, selectedOutput, selectedType)]]" as="x">
								<td>[[x]]</td>
						</template>
					</tr>
					</thead>
					<tbody>
						<template is="dom-repeat" items="[[buildSelectTableRows(data.*, selectedOutput, selectedType, selectedSolution)]]" as="row">
							<tr class$="epi[[row.isEssential]]">
								<td>P[[index]]</td>
								<td>[[row.blockString]]&nbsp;</td>
								<template is="dom-repeat" items="[[selectSolution(row.list,selectedSolution)]]" as="x">
									<td class="bubble_td">
										<template is="dom-if" if="[[checkHasValue(x,1)]]">
											<iron-icon icon="icons:star-border"></iron-icon>
										</template>
										<template is="dom-if" if="[[checkHasValue(x,2)]]">
											<iron-icon icon="image:panorama-fish-eye"></iron-icon>
										</template>
										<template is="dom-if" if="[[checkHasValue(x,3)]]">
											<iron-icon icon="image:lens"></iron-icon>
										</template>
									</td>
								</template>
							</tr>
						</template>
					</tbody>
				</table>
			</div>

			<p class="note"><iron-icon class="epitrue" icon="image:lens"></iron-icon>&nbsp;[[localize('QMC-note-essential-dot')]]</p>
			<p class="note"><iron-icon icon="image:lens"></iron-icon>&nbsp;[[localize('QMC-note-black-dot')]]</p>
			<p class="note"><iron-icon icon="image:panorama-fish-eye"></iron-icon>&nbsp;[[localize('QMC-note-white-dot')]]</p>
			<p class="note"><iron-icon icon="icons:star-border"></iron-icon>&nbsp;[[localize('QMC-note-star')]]</p>
			<h2>[[localize('vocab-minimal-term')]]</h2>
			<sane-equation-input readonly hover id="qmc_latex_output" char-set="[[data.charSet]]" description="" lhs="y_[[selectedOutput]]"
				tree="[[makeExpTree(data.*, selectedType, selectedOutput, selectedSolution)]]"></sane-equation-input>
		`;
	}	public static is = "sane-qmc-table";

	public static get properties() {
		return {
			language: {
				notify: true,
				reflectToAttribute: true,
				type: String,
			},
		};
	}

	public language: string = "en";
	private cntr = 0;
	private data: any;
	private selectedSolution: number = 0;

	constructor() {
		super();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
		this.data = {};
	}

	public ready() {
		super.ready();
		this.$.qmc_solutionstemplate.addEventListener("dom-change", (e) => {
			// get first element with constructed ID
			// TODO: auskommentiert
			// const firstChild = this.shadowRoot!.getElementById("qmc_finalSolutionTemplate0");
			// (this.$.qmc_solution_selection as PaperDropdownMenuElement)._selectedItemChanged(firstChild);
		});
		// check for start configuration features
		// check if default y was assigned
		if (startConfiguration && checkSCBlockedFeatures("qmcAlgorithm", "defaultY") !== "") {
			const select: string = checkSCBlockedFeatures("qmcAlgorithm", "defaultY").toString();
			(this.shadowRoot!.querySelector("#qmc_listbox_y") as PaperListboxElement).setAttribute("selected", select);
		}
		// check if y dropdown can be used
		if ((startConfiguration && checkSCBlockedFeatures("qmcAlgorithm", "changeY") === false)) {
			(this.shadowRoot!.querySelector("#qmc_dropdown_y") as any).setAttribute("disabled", true);
		}
		// check if default type was assigned
		if (startConfiguration && checkSCBlockedFeatures("qmcAlgorithm", "defaultType") !== "") {
			const defaultSelected: string = checkSCBlockedFeatures("qmcAlgorithm", "defaultType");
			let select = "0";
			switch (defaultSelected) {
				case "dnf": select = "0"; break;
				case "knf": select = "1"; break;
			}
			(this.shadowRoot!.querySelector("#qmc_listbox_type") as PaperListboxElement).setAttribute("selected", select);
		}
		// check if type dropdown can be used
		if ((startConfiguration && checkSCBlockedFeatures("qmcAlgorithm", "changeType") === false)) {
			(this.shadowRoot!.querySelector("#qmc_dropdown_type") as any).setAttribute("disabled", true);
		}
	}

	/**
	 * Compute the array of minimization steps that is used to display the tables.
	 * @param centralData The SaneData object.
	 * @param {number} fnIndex The index of the required y-function.
	 * @param {number} selectedType The required form of the equation as the selected value of the dropdown element.
	 * @returns {any} An array of minimization steps used in the dom-repeat to build the <table>.
	 */
	public buildTable(centralData: any, fnIndex: number, selectedType: number): any {
		this.data = centralData.base as ISaneData;	// get the object
		let retTable: any = []; // return variable
		let type: expressionType = "dnf";
		switch (selectedType) {
			case 0: type = "dnf"; break;
			case 1: type = "knf"; break;
		}
		const index: number = (!fnIndex) ? 0 : fnIndex;

		try {
			// get computed qmcSteps from qmclib
			const qmcSteps = getMinimalTerms(this.data, fnIndex, type);
			const piSteps = qmcSteps.piSteps;
			// remove step 0 (unfiltered groups) because not necessary for display; SPLICE DOES NOT WORK
			if (piSteps.length < 1) {
				retTable = [];
			} else {
				for (let i = 1; i < piSteps.length; i++) {
					retTable.push(piSteps[i]);
				}
			}
		} catch (e) {
			console.error(e, e.eNr, e.eAlert, e.eDescription);
			this.notifySane(
				this.localizeSane("error-1001-1")
				+ e.eData.nr
				+ this.localizeSane("error-1001-2")
				+ e.eData.type
				+ this.localizeSane("error-1001-3"));
		}

		return retTable;
	}

	/**
	 * Compute the head of the implicant selection table.
	 * @param centralData The SaneData object.
	 * @param {number} fnIndex The index of the required y-function.
	 * @param {number} selectedType The required form of the equation as the selected value of the dropdown element.
	 * @returns {any} An array indices for the table head.
	 */
	public buildSelectTableHead(centralData: any, fnIndex: number, selectedType: number): any {
		this.data = centralData.base as ISaneData;	// get the object
		let retArr: any; // return variable
		let type: expressionType = "dnf";
		switch (selectedType) {
			case 0: type = "dnf"; break;
			case 1: type = "knf"; break;
		}
		const index: number = (!fnIndex) ? 0 : fnIndex;
		try {
			// get computed qmcSteps from qmclib
			const qmcSteps = getMinimalTerms(this.data, index, type);
			// output array for dom-repeat
			retArr = qmcSteps.solvedTable.head;
		} catch (e) {
			console.error(e.eNr, e.eAlert, e.eDescription);
		}
		return retArr;
	}

	/**
	 * Compute the body of the implicant selection table.
	 * @param centralData The SaneData object.
	 * @param {number} fnIndex The index of the required y-function.
	 * @param {number} selectedType The required form of the equation as the selected value of the dropdown element.
	 * @param {number} selectedSolution the number of the selected solution from the solutions dropdown.
	 * @returns {any} An array of implicant objects.
	 */
	public buildSelectTableRows(centralData: any, fnIndex: number, selectedType: number, selectedSolution: number): any {
		this.data = centralData.base as ISaneData;	// get the object
		let retArr: any; // return variable
		let type: expressionType = "dnf";
		switch (selectedType) {
			case 0: type = "dnf"; break;
			case 1: type = "knf"; break;
			default:
		}
		const index: number = fnIndex || 0; // (!fnIndex) ? 0 : fnIndex;
		try {
			// get computed qmcSteps from qmclib
			const qmcSteps = getMinimalTerms(this.data, index, type);
			// output array for dom-repeat
			retArr = qmcSteps.solvedTable.body;
		} catch (e) {
			console.error(e.eNr, e.eAlert, e.eDescription);
		}
		return retArr;
	}

	public makeExpTree(dataInfo: any, selectedType: number, output: number, selSolution: number): expressionTree {
		if (selectedType === undefined || output === undefined || selSolution === undefined) {
			return {bool: false};
		}
		let type: expressionType = "dnf";
		switch (selectedType) {
			case 0: type = "dnf"; break;
			case 1: type = "knf"; break;
			default:
		}
		return getExpressionAsExpTrees(dataInfo.base as ISaneData, type, output)[selSolution];
	}

	/**
	 * Output the string representation of the minimized function.
	 * @param centralData The SaneData object.
	 * @param {number} fnIndex The index of the required y-function.
	 * @param {number} selType The required form of the equation as the selected value of the dropdown element.
	 * @returns {any} The string representation of the minimized function.
	 */
	public buildMinimalTermString(centralData: any, fnIndex: number, selType: number, selSolution: number): any {
		this.data = centralData.base as ISaneData;	// get the object
		let retStr: any; // return variable
		let type: expressionType = "dnf";
		switch (selType) {
			case 0: type = "dnf"; break;
			case 1: type = "knf"; break;
		}
		const index: number = (!fnIndex) ? 0 : fnIndex;
		try {
			// get computed qmcSteps from qmclib
			const qmcSteps = getMinimalTerms(this.data, index, type);
			// output string
			retStr = qmcSteps.minTerms;
		} catch (e) {
			console.error(e.eNr, e.eAlert, e.eDescription);
		}
		return retStr[selSolution];
	}

	/**
	 * Build a group name string for the <table>.
	 * @param {number} idxStep Current minimization step. Determines nr. of groups combined.
	 * @param {number} idxGrp Current group, which is the starting group for the string.
	 * @returns {string} The full group name.
	 */
	public getGroupName(idxStep: number, idxGrp: number): string {
		let ret: string = idxGrp.toString();
		for (let i: number = 1; i <= idxStep; i++) {
			ret = ret.concat("/", (idxGrp + i).toString());
		}
		return ret;
	}

	/**
	 * Compare two numbers and output 'true' if they are equal. Necessary for dom-if.
	 * @param {number} x A number.
	 * @param {number} y Another number.
	 * @returns {boolean} 'true' if equal, otherwise 'false'.
	 */
	public checkHasValue(x: number, y: number): boolean {
		return (x === y);
	}

	public buildMinSolutions(dataInfo: any, selectedYIndex: number, minTypeNumber: string | string): number[][] {
		const data = dataInfo.base as ISaneData;
		const tmp = getMinimalTerms(data, selectedYIndex, this.getSelectedTypeString(minTypeNumber)).solvedTable.solutions;
		return tmp;
	}

	public getSolutionString(nums: number[]): string {
		return nums.map((n) => `P${n}`).join(", ");
	}

	public selectSolution(solutions: number[], solutionNumber: number) {
		return solutions[solutionNumber];
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

	/* ugly way to expose boollibs function to the element */
	private getBit(value: number[] | number, index: number): number | "?" {
		return getBit(value, index);
	}

	private getSelectedTypeString(selection: number | string): minimizationType {
		if (typeof selection === "string") {
			selection = parseInt(selection, 10);
		}
		switch (selection) {
			case 0:
				return "dnf";
			case 1:
				return "knf";
			default:
				return "dnf";
		}
	}
}

customElements.define(SaneQmcTable.is, SaneQmcTable);
