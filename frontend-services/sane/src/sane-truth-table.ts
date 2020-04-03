import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { PaperDialogElement } from "@polymer/paper-dialog/paper-dialog.js";
import { getBit } from "./boollib.js";
import { ISaneData } from "./sane-data.js";
import { PaperInputElement } from "@polymer/paper-input/paper-input.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin, Events } from "./eventlib.js";
import { extendedValue } from "./sane-value.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";

interface ITruthTableRow {
	inputBits: Array<number | string>;
	outputBits: Array<number | string>;
	mask: boolean;
	outputSet: number[];
}

/**
 * Class for the truth-table view.
 */
class SaneTruthTable extends EventMixin(AppLocalizeMixin()) {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					user-select: none;
					-webkit-user-select: none;  /* Chrome all / Safari all */
					-moz-user-select: none;     /* Firefox all */
					-ms-user-select: none;      /* IE 10+ */
				}

				table {
					max-width: 100%;
					min-width: 17rem;
					border-collapse: collapse;
				}
				thead {
					font-weight: 500;
					font-family: serif;
					font-style: italic;
					color: var(--app-tt-divider-color);
					border-bottom: 2px solid var(--app-tt-divider-color);
				}

				th {
					padding: 8px 16px;
					min-height: 48px;
				}

				tr:hover {
					background-color: var(--sane-hover-background-color);
					color: var(--primary-text-color);
					transition: all .1s cubic-bezier(.4, 0, .2, 1);
				}

				td {
					padding: 4px 12px;
					text-align: center;
					border-bottom:1px solid  var(--app-divider-color);
				}

				paper-dialog {
					min-height: 5rem;
					overflow: auto;
					color: var(--app-card-font-color);
					background: var(--app-dialog-background-color);
					--paper-input-container-label: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-input: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-focus-color: var(--sane-light-primary-color);
					--paper-button: {
						color: var(--app-card-font-color);
					};
				}

				.buttons {
					text-align: left;
					white-space: nowrap;
				}

				.rightrule {
					border-right: solid 1px var(--app-tt-divider-color);
				}
				.leftrule {
					border-left: solid 1px var(--app-tt-divider-color);
				}
				.divider {
					border-left: solid 1px var(--app-tt-divider-color);
				}
				.mask {
					cursor: pointer;
				}
			</style>
			<div style="overflow-x:auto;">
				<table>
					<colgroup>
						<col class="rightrule">	<!-- index -->
						<template is="dom-repeat" items="[[makeReverseSequence(data.nInputColumns)]]">
							<col>	<!-- input variables, x -->
						</template>
						<template is="dom-repeat" items="[[makeReverseSequence(data.nOutputColumns)]]">
								<!-- output variables, y -->
								<template is="dom-if" if="[[!isGT1(index, 1)]]"><col class="leftrule"></template> <!-- apply left vertical rule to first output variable column -->
								<template is="dom-if" if="[[isGT1(index, 1)]]"><col></template>
						</template>
						<col class="leftrule">	<!-- H* -->
						<col class="leftrule">	<!-- Y -->
					</colgroup>
					<thead>
						<tr>
							<th></th>
							<th colspan$="[[data.nInputColumns]]">
								<div class="buttons">
									<paper-icon-button icon="icons:add" on-click="handleAddInputCol" alt$="[[localize('add-input')]]"></paper-icon-button>
									<paper-icon-button icon="icons:remove" on-click="handleRemInputCol" alt$="[[localize('remove-input')]]"></paper-icon-button>
								</div>
							</th>
							<th colspan$="[[data.nOutputColumns]]">
								<div class="buttons">
									<paper-icon-button icon="icons:add" on-click="handleAddOutputCol" alt$="[[localize('add-output')]]"></paper-icon-button>
									<paper-icon-button icon="icons:remove" on-click="handleRemOutputCol" alt$="[[localize('remove-output')]]"></paper-icon-button>
								</div>

							</th>
							<th></th>
							<th></th>
						</tr>
						<tr>
							<th>#</th>
							<template is="dom-repeat" items="[[makeReverseSequence(data.nInputColumns)]]" as="x">
								<th>x<sub>[[x]]</sub></th>
							</template>
							<template is="dom-repeat" items="[[makeReverseSequence(data.nOutputColumns)]]" as="y">
								<th>y<sub>[[y]]</sub></th>
							</template>
							<th>H<sup>*</sup></th>
							<th>Y</th>
						</tr>
					</thead>
					<tbody>
						<template is="dom-repeat" items="[[rows]]" as="row">
							<tr id$="tt-row-[[index]]">
								<td>[[index]]</td>	<!-- row index -->
								<template is="dom-repeat" items="[[row.inputBits]]" as="x">
									<td>[[x]]</td> <!-- x_i -->
								</template>
								<template is="dom-repeat" items="[[row.outputBits]]" as="y">
									<td on-click="handleToggleBit">[[y]]</td> <!-- y_i -->
								</template>
								<td on-click="handleToggleMask" class="mask">
									<span hidden$="[[row.mask]]">*</span>
								</td> <!-- H* -->
								<td on-click="openOutputSetEditor">
									<span hidden$="[[!isGT1(row.outputSet.length)]]">{</span>
									[[beautifySet(row.outputSet)]]
									<!-- Y -->
									<span hidden$="[[!isGT1(row.outputSet.length)]]">}</span>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
			<paper-dialog id="outputVariablesDialog"
				horizontal-align="right" vertical-align="top"
				entry-animation="fade-in-animation"
				exit-animation="fade-out-animation"
				>
					<h2>[[localize('vocab-output-set')]]</h2>
					<paper-input
						label="[[localize('vocab-output-set')]]"
						auto-validate
						allowed-pattern="[0-9]"
						placeholder="0"
						on-keypress="outputSetKeyPressed"
						autofocus
						tabindex="1">
					</paper-input>
						<div class="buttons">
							<paper-button dialog-confirm on-click="submitOutputSet" tabindex="2">[[localize('term-submit')]]</paper-button>
						</div>
			</paper-dialog>
		`;
	}	private data: any;
	private outputdiag!: PaperDialogElement;

	static get is() { return "sane-truth-table"; }

	public static get properties() {
		return {
			rows: {
				computed: "buildRows(data.*)",
				type: Array,
			},
		};
	}

	constructor() {
		super();
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
		this.outputdiag = this.$.outputVariablesDialog as PaperDialogElement;
	}

	/**
	 * Handle the event when the user wants to add an input column.
	 */
	public handleAddInputCol() {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "changeInputColumns") === false)) {
			this.triggerEvent(Events.incInputVariable);
		}
	}

	/**
	 * Handle the event when the user wants to remove an input column.
	 */
	public handleRemInputCol() {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "changeInputColumns") === false)) {
			this.triggerEvent(Events.decInputVariable);
		}
	}

	/**
	 * Handle the event when the user wants to add an output column.
	 */
	public handleAddOutputCol() {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "changeOutputColumns") === false)) {
			this.triggerEvent(Events.incOutputVariable);
		}
	}

	/**
	 * Handle the event when the user wants to remove an output column.
	 */
	public handleRemOutputCol() {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "changeOutputColumns") === false)) {
			this.triggerEvent(Events.decOutputVariable);
		}
	}

	/**
	 * Toggles the mask of SaneData in row of e.model.index.
	 * @param e
	 * @return {void}
	 */
	public handleToggleMask(e: any): void {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "toggleH") === false)) {
			const row = e.model.index;
			this.triggerEvent(Events.toggleMask, {detail: row});
		}
	}

	/**
	 * Calculates the details (cell and row) needed to toggle an output bit in SaneData.
	 * @param e
	 * @return {void}
	 */
	public handleToggleBit(e: any): void {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "toggleBits") === false)) {
			const rowId = e.composedPath()[1].id as string;	// get parent node (tr) of event target (td)
			const rowIndex = Number.parseInt(rowId.substr("tt-row-".length), 10);

			if (this.data.outputRows[rowIndex].output.length > 1) {
				return;	// don't toggle bits of non-deterministic outputs and return early
			}

			const cellOffset = this.data.nInputColumns;
			const cellIndex = this.data.nOutputColumns - (e.composedPath()[0].cellIndex - cellOffset);

			this.triggerEvent(Events.toggleOutputBit, {detail: {cell: cellIndex, row: rowIndex}});
		}
	}

	public set(s: extendedValue): void {
		return;
	}

	/* ugly way to expose boollibs function to the element */
	private getBit(value: number[] | number, index: number): number | "?" {
		return getBit(value, index);
	}

	/**
	 * Creates an array, that runs from value to 0.
	 * This will be used to create indices for the table header.
	 * @param {number} value
	 * @returns {number[]}
	 */
	private makeReverseSequence(value: number): number [] {
		const ret: number[] = [];

		ret.push(value - 1);
		for (let output = value - 2; output >= 0; output--) {
			ret.push(output);
		}

		return ret;
	}

	/**
	 * Creates an array on base of ITruthTableRow.
	 * This will be used to compute the table.
	 * Reacts on changes of SaneData.
	 * @param dataInfo The SaneData object
	 * @returns {object[]}
	 */
	private buildRows(dataInfo: any): object[] {
		const ret: ITruthTableRow[] = [];
		const data = dataInfo.base as ISaneData;	// get the object
		const rows = 2 ** data.nInputColumns;

		for (let row: number = 0; row < rows; row++) {
			if (data.outputRows[row] === undefined) {
				continue;
			}

			const elem = {} as ITruthTableRow;

			elem.inputBits = [];
			for (let bit: number = data.nInputColumns - 1;  bit >= 0; bit--) {	// for every possible input
				elem.inputBits.push(getBit(row, bit));	// get specific bits for table
			}

			elem.outputBits = [];
			for (let bit: number = data.nOutputColumns - 1; bit >= 0; bit--) {	// for every possible output bit
				elem.outputBits.push(getBit(data.outputRows[row].output, bit));	// get specific bits for table
			}

			elem.outputSet = data.outputRows[row].output;
			elem.mask = data.outputRows[row].mask;

			ret.push(elem);
		}

		return ret;
	}

	/**
	 * Returns true if val + offset is bigger than 1.
	 * This is used to add styles to the table.
	 * @param {number} val
	 * @param {number} offset
	 * @returns {boolean}
	 */
	private isGT1(val: number, offset: number = 0): boolean {
		return (val + offset) > 1 ? true : false;
	}

	/**
	 * Opens the paper-dialog-window and sets specific attributes.
	 * @param e
	 */
	private openOutputSetEditor(e: any) {
		// check in start configuration features if action is allowed
		if (!(startConfiguration && checkSCBlockedFeatures("truthTable", "changeOutputValue") === false)) {
			const input = this.outputdiag.querySelector("paper-input")! as PaperInputElement;
			this.outputdiag.positionTarget = e.path[0];
			const currSet = this.outputdiag.positionTarget.textContent!.match(/[0-9][0-9, ]*[^ }]/)![0].trim();
			input.value = currSet.replace(/ /g, "");
			this.outputdiag.open();
			input.focus();
		}
	}

	/**
	 * Returns true if the enter key was pressed.
	 * Is used to submit the input of the paper-dialog-window on pressing enter.
	 * @param e
	 */
	private outputSetKeyPressed(e: any) {
		const ENTER_KEY = 13;
		if (e.charCode === ENTER_KEY) {
			this.submitOutputSet(e);
		}
	}

	/**
	 * Closes the paper-dialog-element.
	 * Extracts the index where the set was altered.
	 * Extracts the value (set) put into the paper-input field.
	 * Calls submitNewOutputSet().
	 * @param e
	 */
	private submitOutputSet(e: any) {
		this.outputdiag.close();

		const id = (this.outputdiag.positionTarget.parentNode! as Element).id;	// get parent node (tr) of event target (td)
		const row = Number.parseInt(id.substr("tt-row-".length), 10);	// get number part of the tr-id
		const set = this.outputdiag.querySelector("paper-input")!.value!.trim();

		this.submitNewOutputSet(set, row);
		this.outputdiag.querySelector("paper-input")!.value = "";
	}

	/**
	 * Sets the output property of SaneData in outputRows[row].
	 * @param {string} vals
	 * @param {number} row
	 */
	private submitNewOutputSet(vals: string, row: number): void {
		this.triggerEvent(Events.setOutputSet, {detail: {index: row, set: vals}});
	}

	/**
	 * beautifies a set by turning an array of numbers to a string with commas.
	 * @param {number[]} set
	 * @returns {string}
	 */
	private beautifySet(set: number[]): string {
		return set.join(", ");
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneTruthTable.is, SaneTruthTable);
