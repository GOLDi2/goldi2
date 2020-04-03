/**
 * Class for the function index view
 */
import "@polymer/iron-flex-layout/iron-flex-layout-classes";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { bin2hex, getBit, hex2bin } from "./boollib.js";
import { ISaneData } from "./sane-data.js";
import { PaperInputElement } from "@polymer/paper-input/paper-input.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin, Events } from "./eventlib.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";

class SaneFunctionIndex extends EventMixin(AppLocalizeMixin()) {
	static get template() {
		return html`
			<style include="shared-styles iron-flex iron-flex-alignment">
				:host {
					user-select: none;
					-webkit-user-select: none; /* Chrome all / Safari all */
					-moz-user-select: none; /* Firefox all */
					-ms-user-select: none; /* IE 10+ */
					--paper-input-container-focus-color: var(--app-tt-divider-color);
				}

				.buttons {
					@apply --layout-horizontal;
					max-width: 100%;
				}

				paper-icon-button {
					color: var(--app-tt-divider-color);
				}

				.container {
					@apply --layout-vertical;
					align-items: flex-start;
				}

				.flexchild {
					@apply --layout-horizontal;
					align-items: center;
					flex-basis: 20%;
					font-style: italic;
				}

				.input {
					margin-bottom: 1em;
				}

				.outputvariables {
					margin: 0;
				}

				.labels  {
					padding: 0.6rem;
				}
			</style>
			<div class="container">
				<div class="buttons flexchild">
					<span class="label">[[localize('FI-number-output-functions')]]:</span>
					<paper-icon-button icon="icons:add" on-click="handleAddOutputCol"></paper-icon-button>
					<span>[[data.nOutputColumns]]</span>
					<paper-icon-button icon="icons:remove" on-click="handleRemOutputCol"></paper-icon-button>
				</div>
				<template is="dom-repeat" items="[[computeOutput(data.*)]]" as="value">
					<div class="flexchild">
						<span class="labels">y<sub>[[index]]</sub> =</span>
						<paper-input disabled="[[checkStartConfigDisabled()]]" class="input"
									 id="functionIndexInput[[index]]" allowed-pattern="[0-9a-fA-F]" maxlength="32"
									 value="[[value]]" on-input="sendOutput">
							<div slot="suffix"><sub>H</sub></div>
						</paper-input>
					</div>
				</template>
			</div>
			<div class="flexchild">
				<span class="labels">H<sup>*</sup> =</span>
				<paper-input class="input" value="[[computeMask(data.*)]]" maxlength="32" id="maskInput"
							 on-input="sendMask">
					<div slot="suffix"><sub>H</sub></div>
				</paper-input>
			</div>
		`;
	}

	private data: any;
	constructor() {
		super();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
	static get is() {
		return "sane-function-index";
	}

	public ready() {
		super.ready();
		// check for start configuration features
		// check if H* input can be used
		if ((startConfiguration && checkSCBlockedFeatures("functionIndex", "inputNewH") === false)) {
			(this.shadowRoot!.querySelector("#function_index_Hinput") as any).setAttribute("disabled", true);
		}
	}

	/**
	 * Check for start configuration features. Check if inputs can be used.
	 * @returns {boolean} True if it can't be used.
	 */
	public checkStartConfigDisabled(): boolean {
		return (startConfiguration && checkSCBlockedFeatures("functionIndex", "inputNewIndex") === false);
	}

	/**
	 * Computes all function indizes for current outputs.
	 * @param dataInfo
	 * Get data from SaneData.
	 * @returns {string[]}
	 * Returns Outputvalues in an array.
	 */
	public computeOutput(): string[] { // gets function index for selected output
		const nrrows = 2 ** this.data.nInputColumns;
		const bits = Array(nrrows); // declares array with length 2^inputcolumns
		const hex = Array(this.data.nOutputColumns); // array of all function indizes
		for (let i = 0; i < this.data.nOutputColumns; i++) {
			let bit: number = 0;
			for (let row = nrrows; row > 0; row--) {
				bits[bit] = getBit(this.data.outputRows[row - 1].output, i); // get Bit for each row depending on index
				bit++;
			}
			const value = bits.join(""); // turns array into a string without commas
			hex[i] = bin2hex(value).replace(/^0+/, ""); // turns binary number into hex
			if (hex[i] === "") {
				hex[i] = "0";
			}
		}
		return hex;
	}

	/**
	 * Computes mask as an function index.
	 * @param dataInfo
	 * Get data from SaneData.
	 * @returns {string}
	 * Returns the mask function index.
	 */
	public computeMask(dataInfo: any): string { // gets function index for selected output
		this.data = dataInfo.base as ISaneData;
		const rownr = 2 ** this.data.nInputColumns;
		const bits = Array(rownr); // declares array with length 2^inputcolumns
		const hex = Array(this.data.nOutputColumns); // array of all function indizes
		let bit = 0;
		for (let row = rownr - 1; row >= 0; row--) {
			bits[bit] = this.data.outputRows[row].mask ? 0 : 1;
			bit++;
		}
		let value: string = bits.join("");
		value = bin2hex(value).replace(/^0+/, "");
		if (value === "") {
			value = "0";
		}
		return value;
	}

	/**
	 * Calculates new values from user input for all output variables and changes sane-data accordingly.
	 * @param e
	 * Used to get the index of the DOM-Repeat in the HTML.
	 * @returns {number}
	 * Returns 0 if input is empty.
	 */
	public sendOutput(e: any, dataInfo: any) { // reaction to user input
		if (!(startConfiguration && checkSCBlockedFeatures("functionIndex", "inputNewIndex") === false)) {
			const index: number = e.model.index;
			const data = dataInfo.base as ISaneData;
			const rownr = 2 ** this.data.nInputColumns;
			const hex2binnr = 4;
			const input: string // reads in user input
				= (this.shadowRoot!.querySelector(`#functionIndexInput${index}`) as PaperInputElement).value!.toString();
			if (input === "") {
				return 0;
			}
			if (input.length * hex2binnr > rownr) {
				this.triggerEvent(Events.incInputVariable);
			}
			if (input.length <= rownr / 8) {
				this.halveData(this.data);
			}
			const bin = hex2bin(input); // turns hex into bin
			const binarray = ("" + bin).split("").map(Number); // turns bin string into bin array
			if (input.length * hex2binnr > rownr) {
				for (let x = binarray.length; x < 2 * rownr; x++) { // fills bin up with "0"
					binarray.unshift(0);
				}
			} else {
				for (let x = binarray.length; x < rownr; x++) { // fills bin up with "0"
					binarray.unshift(0);
				}
			}
			let i = 0;
			if (input.length * hex2binnr > rownr) {
				for (let n: number = 2 * rownr - 1; n >= 0; n--) {
					if (getBit(this.data.outputRows[n].output, index) !== binarray[i]) { // compares each cell the user input w/ bit
						this.triggerEvent(Events.toggleOutputBit, {detail: {cell: index, row: n}}); // and toggles the bit if they differ
					}
					i++;
				}
			} else {
				for (let n: number = rownr - 1; n >= 0; n--) {
					if (getBit(this.data.outputRows[n].output, index) !== binarray[i]) { // compares each cell the user input w/ bit
						this.triggerEvent(Events.toggleOutputBit, {detail: {cell: index, row: n}}); // and toggles the bit if they differ
					}
					i++;
				}
			}
		}
	}

	/**
	 * Calculates mask from user input and changes values in sane-data accordingly.
	 * @returns {number}
	 * Returns 0 if input is empty.
	 */
	public sendMask() {
		if (!(startConfiguration && checkSCBlockedFeatures("functionIndex", "inputNewH") === false)) {
			const input: string // reads in user input
				= (this.shadowRoot!.querySelector("#maskInput") as PaperInputElement).value!.toString();
			const rownr = 2 ** this.data.nInputColumns;
			const bin = hex2bin(input);
			const hex2binnr = 4;
			if (input === "") {
				return 0;
			}
			if (input.length * hex2binnr > rownr) {
				this.triggerEvent(Events.incInputVariable);
			}
			if (input.length <= rownr / 8) {
				this.halveData(this.data);
			}
			let binarray = Array(rownr);
			binarray = ("" + bin).split("").map(Number);
			if (input.length * hex2binnr > rownr) {
				for (let x = binarray.length; x < 2 * rownr; x++) { // fills bin up with "0"
					binarray.unshift(0);
				}
			} else {
				for (let x = binarray.length; x < rownr; x++) { // fills bin up with "0"
					binarray.unshift(0);
				}
			}
			let bit = 0;
			if (input.length * hex2binnr > rownr) {
				for (let row = 2 * rownr - 1; row >= 0; row--) {
					if (binarray[bit] === 0 && this.data.outputRows[row].mask === false) {
						this.triggerEvent(Events.toggleMask, {detail: row});
					}
					if (binarray[bit] === 1 && this.data.outputRows[row].mask === true) {
						this.triggerEvent(Events.toggleMask, {detail: row});
					}
					bit++;
				}
			} else {
				for (let row = rownr - 1; row >= 0; row--) {
					if (binarray[bit] === 0 && this.data.outputRows[row].mask === false) {
						this.triggerEvent(Events.toggleMask, {detail: row});
					}
					if (binarray[bit] === 1 && this.data.outputRows[row].mask === true) {
						this.triggerEvent(Events.toggleMask, {detail: row});
					}
					bit++;
				}
			}
		}
	}

	public handleAddOutputCol() {
			this.triggerEvent(Events.incOutputVariable);
	}

	public handleRemOutputCol() {
			this.triggerEvent(Events.decOutputVariable);
	}
	public decIndize(currentValue: string, dataInfo: any) {
		const data = dataInfo.base as ISaneData;
		const inputColumns = data.nInputColumns;
		return currentValue.length <= (2 ** inputColumns) / 8;
	}
	public allIndizes(): string[] {
		const allInputs = this.computeOutput();
		return allInputs;
	}
	public sameValue(input: string[]) {
		for (let i = 1; i < input.length; i++) {
			if (input[i] !== input[0]) {
				return false;
			}
		}
		return true;
	}
	public halveData(dataInfo: any) {
		const data = dataInfo.base as ISaneData;
		let index = 0;
		const inputs: string [] = Array(this.data.nOutputColumns + 1);
		const checkTruth = Array(this.data.nOutputColumns + 1);
		for (let i = 0; i < this.data.nOutputColumns; i++) {
			inputs[i] = (this.shadowRoot!.querySelector(`#functionIndexInput${index}`) as PaperInputElement).value!.toString();
			index++;
		}
		inputs[this.data.nOutputColumns]
			= (this.shadowRoot!.querySelector("#maskInput") as PaperInputElement).value!.toString();
		for (let n = 0; n <= this.data.nOutputColumns; n++) {
			if (inputs[n].length <= (2 ** this.data.nInputColumns) / 8) {
				checkTruth[n] = true;
			}
		}
		if (this.sameValue(checkTruth)) {
			this.triggerEvent(Events.decInputVariable);
		}
	}
}

customElements.define(SaneFunctionIndex.is, SaneFunctionIndex);
