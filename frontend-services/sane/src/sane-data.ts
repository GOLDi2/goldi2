import "@polymer/app-storage/app-localstorage/app-localstorage-document.js";

import { AppStorageBehavior } from "@polymer/app-storage/app-storage-behavior.js";
import { AppLocalizeMixin } from "./custom-type-base-lib";
import { bitWidth, getBit, maxValue, setBitToVal } from "./boollib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { calcValueForAssignment, expressionTree } from "./qmclib.js";
import { EventMixin } from "./eventlib.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";

/**
 * SaneData = {
 * 		nInputColumns: 1,
 * 		nOutputColumns: 2,
 * 		output: {
 * 			output: [1, 2],
 * 			mask: false
 * 		},
 * 		{
 * 			output: [3],
 * 			mask: true
 * 		}
 * }
 *
 * equals
 *
 *   i | x0  |  y1  y0  | H*  | Y
 *  -----------------------------------
 *   0 |  0  |   ?   ?  |     | {1, 2}
 *   1 |  1  |   1   1  |  *  |   3
 *  -----------------------------------
 *
 * and equals with g-Parameter
 *
 *   i | x0  |  y1  y0  | H*  | Y
 *  -----------------------------------
 *   0 |  0  |   g  /g  |     | {1, 2}
 *   1 |  1  |   1   1  |  *  |   3
 *  -----------------------------------
 *
 * Constraint:
 * 	ISaneData.output.length <= 2 ** ISaneData.nInputRows
 */

/**
 * Interface for the Charset.
 */
interface ISaneDataCharSet {
	[index: string]: string;
	andChar: string;
	antivalChar: string;
	equivChar: string;
	implyChar: string;
	notChar: string;
	orChar: string;
}

/**
 * Interface for SaneData including input- and outputcolumns.
 */
interface ISaneData {
	nInputColumns: number;
	nOutputColumns: number;
	outputRows: ISaneDataRow[];
	charSet: ISaneDataCharSet;
}

/**
 * DataRow interface.
 */
interface ISaneDataRow {
	mask: boolean;
	output: number[];
}

/**
 * Class for SaneData.
 */
class SaneData extends EventMixin(mixinBehaviors([AppStorageBehavior], AppLocalizeMixin())) {
	static get template() {
		return html`<app-localstorage-document id="storage" key="sane-data" data="{{data}}"></app-localstorage-document>`;
	}

	static get is() { return "sane-data"; }

	/**
	 * Default state of the data object.
	 */
	static get defaultValue(): ISaneData {
		return {
			charSet: {
				andChar: "&",
				antivalChar: "°",
				equivChar: "~",
				implyChar: ">",
				notChar: "/",
				orChar: "+",
			},
			nInputColumns: 1,
			nOutputColumns: 2,
			outputRows: [
				{ mask: false, output: [1] },
				{ mask: true, output: [3] },
			],
		};
	}
	/**
	 * Sets the limits for the input- and outputcolumns.
	 */
	private static readonly limits = {
		maxInputCols: 7,
		maxOutputCols: 9,
	};
	/* tslint:disable */
	/**
	 * Standard values needed for some functions of Polymer.
	 * @return {data}
	 * @return {inputColumns}
	 * @return {limits}
	 * @return {numRows}
	 * @return {outputColumns}
	 */
	/* tslint:enable */
	public static get properties() {
		return {
			data: {
				notify: true,
				type: Object,
			},
			inputColumns: {
				computed: "computeInputColumns()",
				type: Number,
				value: 0,
			},
			limits: {
				type: Object,
				value: SaneData.limits,
			},
			numRows: {
				computed: "computeNumRows()",
				type: Number,
				value: 0,
			},
			outputColumns: {
				computed: "computeNOutputCols()",
				type: Number,
				value: 0,
			},
		};
	}
	/**
	 * Declare global variables.
	 */
	public data!: ISaneData;
	public numRows: number = 0;
	public inputColumns: number = 0;
	public outputColumns: number = 0;
	public language: any;

	constructor() {
		super();
	}

	public ready() {
		super.ready(); // polymer ready check
		if (!(this.data) && this.valueIsEmpty(this.data)) {
			this.reset(); // reset of data
		}
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
/**
 * Resets the data to the default values.
 */
	public reset(): void {
		this.data = SaneData.defaultValue;
	}

	/**
	 *  Set h* in row to value
	 *  @param {number} row
	 *  @param {boolean} value
	 *  @return {void}
	 */
	public setMask(row: number, value: boolean = true): void {
		this.assertArguments({ rowIndex: row });
		this.set(["data.outputRows", row, "mask"], value);
		this.notifyPath("data.outputRows");
	}
	/**
	 * Toggles the Mask.
	 * @param {number} row
	 * @return {void}
	 */
	public toggleMask(row: number): void {
		this.assertArguments({ rowIndex: row });
		this.set(["data.outputRows", row, "mask"], !this.data.outputRows[row].mask);
		this.notifyPath("data.outputRows");
	}

	/**
	 * Increments the input variables.
	 * @return {void}
	 */
	public incInputVariables(): void {
		if (this.data.nInputColumns >= SaneData.limits.maxInputCols) { // check for limit
			return;
		}
		this.data.nInputColumns++;
		this.fillUpOutput();
		this.notifyPath("data.nInputColumns"); // notifies elements with databinding on nInputColumns
	}

	/**
	 * Decrements the input variables.
	 * @return {void}
	 */
	public decInputVariables(): void {
		if (this.data.nInputColumns > 1) {
			this.data.nInputColumns--;
			const rowBuffer = this.data.outputRows;
			rowBuffer.splice(this.data.outputRows.length - (2 ** this.data.nInputColumns),
				2 ** this.data.nInputColumns);
			this.set("data.outputRows", rowBuffer);
			this.notifyPath("data.nInputColumns");

		}
	}

	/**
	 * Increments the output variables.
	 * @return {void}
	 */
	public incOutputVariables(): void {
		if (this.data.nOutputColumns >= SaneData.limits.maxOutputCols) {
			return;
		}
		this.data.nOutputColumns++;
		this.notifyPath("data.nOutputColumns");
	}

	/**
	 * Decrements the output variables.
	 * @return {void}
	 */
	public decOutputVariables(): void {
		if (this.data.nOutputColumns > 1) {
			this.data.nOutputColumns--;
		}
		this.data.outputRows = this.data.outputRows.map((y) => { // set too big Y values to 2 ** OutCols - 1
			if (y.output.length === 1) {
				y.output[0] = y.output[0] & ((2 ** this.data.nOutputColumns) - 1);
				return y;
			} else {
				return y;
			}
		});
		this.notifyPath("data.nOutputColumns");
		this.notifyPath("data.outputRows");
	}
	/**
	 * Toggles an output bit.
	 * @param {number} y: { row: number, cell: number }
	 * @return {void}
	 */
	public toggleOutputBit(y: { row: number, cell: number }): void {
		this.assertArguments({ rowIndex: y.row, outputBitIdx: y.cell });

		if (this.data.outputRows[y.row].output.length > 1) {
			throw new TypeError("Toggling an non-deterministic output is not possible.");
		}

		this.data.outputRows[y.row].output[0] ^= 1 << y.cell;	// toggles the bit

		this.notifyPath("data.outputRows");
		this.notifySplices("data.outputRows", [{
			addedCount: 1,
			index: y.row,
			object: this.data.outputRows,
			removed: [],
			type: "splice",
		}]);
	}

	/**
	 * Sets a new output set from the user input.
	 * @param {number} x: { index: number, set: string}
	 * @return {void}
	 */
	public setOutputSet(x: { index: number, set: string}) {
		this.assertArguments({ rowIndex: x.index });

		const spliter = /\s*,\s*/;	// comma surrounded by spaces
		let processed = x.set.trim()	// remove spaces at beginning and end
			.split(spliter)	// split the string at the commas
			.map(Number);	// convert from string[] to number[]
		processed.sort();
		processed = processed.filter((el, idx, arr) => arr.indexOf(el) === idx);	// remove duplicates

		this.data.outputRows[x.index].output = processed;

		this.computeNOutputCols({ allowShrinking: true });
		this.notifySplices("data.outputRows", [{
			addedCount: 1,
			index: x.index,
			object: this.data.outputRows,
			removed: [],
			type: "splice",
		}]);
		this.notifyPath("data.outputRows");
	}

	/**
	 * Sets a new output function from the user input.
	 * @param {expressionTree} tree
	 * @param {number} index output variable index
	 */
	public setOutputTree(tree: expressionTree, index: number) {
		this.assertArguments({ outputBitIdx: index });

		const numRows = this.computeNumRows();
		for (let row = 0; row < numRows; row++) {
			// assign true or false to the x variables based on bits of current row
			const assignment: boolean [] = [];
			for (let j = 0; j < this.data.nInputColumns; j++) {
				assignment.push((getBit(row, j) === 1));
			}
			// calculate output value for current row
			const newBit = calcValueForAssignment(tree, assignment) ? 1 : 0;
			const oldValue = this.data.outputRows[row].output[0];
			this.data.outputRows[row].output[0] = setBitToVal(oldValue, index, newBit);
		}

		this.computeNOutputCols({ allowShrinking: true });
		this.notifyPath("data.outputRows");
	}

	/**
	 * Checks if rowIndex and outputBitIndex are within the datarange.
	 * @param {number} args
	 */
	private assertArguments(args: { rowIndex?: number, outputBitIdx?: number}): void {
		if (args.rowIndex && args.rowIndex < 0) {
			throw new RangeError(`Row indices must not be < 0, but is ${args.rowIndex}.`);
		}
		if (args.rowIndex && args.rowIndex > 2 ** this.data.nInputColumns) {
			throw new RangeError(`Row indices must be < ${2 ** this.data.nInputColumns}, but is ${args.rowIndex}.`);
		}

		if (args.outputBitIdx && args.outputBitIdx < 0) {
			throw new RangeError(`Output bit indices must not be < 0, but is ${args.outputBitIdx}.`);
		}
		if (args.outputBitIdx &&
			args.rowIndex &&
			args.outputBitIdx > this.data.nOutputColumns) {
			throw new RangeError("Output bit indices must not be >" +
				this.data.nOutputColumns +
				", but is " + args.outputBitIdx + ".");
		}
	}

	/**
	 * Calculates the max index of the current data.
	 * @param {number[]} data
	 * @return {number}
	 */
	private maxIndex(data: number[]): number {
		return data.length > 0 ? data.reduce((a, b) => Math.max(a, b)) : 0;
	}

	/**
	 * Reduces the maxOutputValue based on OutputCols.
	 * @param {number[]} data
	 * @return {number[]}
	 */
	private trimOutputValue(data: number[]): number[] {
		return data.length > 0 ? data.map((x) => {
			if (x > this.computeMaxOutputValue(SaneData.limits.maxOutputCols)) {
				return x = this.computeMaxOutputValue(SaneData.limits.maxOutputCols);
			}
			return x;
		}) : [];
	}

	/**
	 * Computes the maximum output value possible.
	 * @param {number} value
	 * @return {number}
	 */
	private computeMaxOutputValue(value: number): number {
		return (2 ** value) - 1;
	}

	/**
	 * Computes the number of rows.
	 * @return {number}
	 */
	private computeNumRows(): number {
		if (!this.data) {
			return 0;
		}

		return 2 ** this.data.nInputColumns;
	}

	/**
	 * Fills up the output array if more input rows than output rows are defined.
	 * This is called after adding new output arrays.
	 */
	private fillUpOutput(): void {
		const inputRows = this.computeNumRows();
		if (inputRows <= this.data.outputRows.length) {
			return;
		}
		const rowBuffer = this.data.outputRows;
		for (let i = this.data.outputRows.length; i < inputRows; i++) {
			rowBuffer.push({
				mask: true,
				output: [0],
			});
		}
		this.data.outputRows = rowBuffer;
		this.computeNOutputCols({allowShrinking: false });
	}

	/**
	 * Computes as much output columns as there are currently used.
	 * @param {boolean} doNotify
	 * @param {boolean} allowShrinking
	 * @return {number}
	 */
	private computeNOutputCols({ doNotify = true, allowShrinking = true }:
		{ doNotify?: boolean, allowShrinking?: boolean } = {}) {

		if (!this.data) {
			return 0;
		}

		if (allowShrinking) {
			this.data.nOutputColumns = 1;
		}

		/* tslint:disable:prefer-for-of */

		for (let row: number = 0; row < this.data.outputRows.length; row++) {
			const tmp = maxValue([bitWidth(maxValue(this.data.outputRows[row].output)), this.data.nOutputColumns]);
			if (tmp > SaneData.limits.maxOutputCols) {
				this.data.outputRows[row].output = this.trimOutputValue(this.data.outputRows[row].output);
				this.data.nOutputColumns = SaneData.limits.maxOutputCols;
				this.notifySane(this.localizeSane("error-101"));
				break;
			}
			this.data.nOutputColumns = tmp;
		}
		/* tslint:enable:prefer-for-of */

		if (doNotify) {
			this.notifyPath("data.nOutputColumns");
		}
	}

	/**
	 * Imports data and makes them the new dataset.
	 * @param {ISaneData} saneData
	 */
	private importData(saneData: ISaneData) {
		this.data = saneData;
		this.notifyPath("data.*");
	}

	/**
	 * Sets a custom char that the user wants to have.
	 * @param {string} customChar
	 * @param {string} char
	 */
	private setChar(customChar: string, char: string) {
		this.set(["data.charSet", customChar], char);
		this.notifyPath("data.charSet");
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneData.is, SaneData);

export {
	ISaneData,
	ISaneDataCharSet,
	ISaneDataRow,
};
