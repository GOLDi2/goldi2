import { html } from "@polymer/polymer/polymer-legacy.js";
import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import { EventMixin, Events } from "./eventlib.js";
import { getBit } from "./boollib.js";
import { SaneVennDiagramSvg } from "./sane-venn-diagram-svg.js";
import { ISaneData } from "./sane-data.js";

/**
 * Class for calculating the venn diagram.
 */
class SaneVennDiagram extends EventMixin(PolymerElement) {
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
				td {
					padding-right: 8px;
				}

				paper-listbox {
					padding: 0;
					background: var(--app-card-background-color);
					color: var(--app-card-font-color);
				}
				paper-checkbox {
					--primary-text-color: var(--app-card-font-color);
				}
			</style>

			<paper-listbox on-change-output-variable=[[onChangeEvent(data.nOutputColumns)]] on-change-input-variable=[[onChangeRow(data.nInputColumns)]] on-toogle-output-bit=[[onChangeRow(data.outputRows)]]>
				<template is="dom-repeat" items="[[makeUpwardSequence(data.nOutputColumns)]]" as="y">
					<tr>
						<td><paper-checkbox id=[[y]] on-change="onChangeEvent"> y<sub>[[y]]</sub> </paper-checkbox></td>
						<td>M<sub>[[y]]</sub> = { [[setOfY(data.*, y)]] }</td>
					</tr>
				</template>
			</paper-listbox>
			<sane-venn-diagram-svg></sane-venn-diagram-svg>
		`;
	}
	public static is = "sane-venn-diagram";
	private selectedY: number[] = new Array();
	private data: any;
	constructor() {
		super();
	}

	public ready() {
		super.ready();
		this.selectedY = [];
	}

	/**
	 * Calculates bitvalues of the indice.
	 * Compares the value of the new bits (calculated and stored in newBits) with the old bits in SaneData (with getBit)
	 * if varied bits will be toggled.
	 * @param {number} indice e.g. 15
	 * @param {number []} newSet ([0], [1], [2], [3], [1,2], [2,3], [1,3], [1,2,3])
	 */
	public updateBit(indice: number, newSet: number []) {
		const newBits: number[] = [0, 0, 0];
		if (newSet[0] !== 0) {
			for (const content of newSet) {
				newBits[content - 1] = 1;
			}
		}
		for (let count = 0; count < this.selectedY.length; count++) {
			const oldBit = getBit(this.selectedY[count], indice);
			if (newBits[count] !== oldBit) {
				this.triggerEvent(Events.toggleOutputBit, {detail: {row: indice, cell: this.selectedY[count]}});
			}
		}
	}

	/**
	 * Calculates bit value at the position of index of Y.
	 * @param {number[] | number} value
	 * @param {number} index
	 * @returns {number | "?"}
	 */
	private getBit(value: number[] | number, index: number): number | "?" {
		return getBit(value, index);
	}
	/**
	 * Returns set of k(index).
	 * @param centralData
	 * @param {number} index
	 * @param {number[]} sets, chosen sets
	 * @returns {number[]} : 0=empty set, 1=set 1, 2=set 2, 3=set 3;
	 * 12=set 1&2, 13=set 1&3, 23=set 2&3, 123=set 1&2&3
	 * SaneVennDiagramSvg uses setOfK to access on the Position of the indices
	 */
	/* tslint:enable:prefer-for-of */	// because the position in the array is also needed
	private setOfK(): void {
		const ret: number [] = [];
		const helpk: number [] = [];
		const maxIndices = 4;
		const limit = 2 ** Math.min(this.data.nInputColumns, maxIndices);
		for (let k = 0; k < limit; k++) {
			helpk.length = 0;
			for (let counter = 0; counter < this.selectedY.length; counter++) {
				if (getBit(this.data.outputRows[k].output, this.selectedY[counter]) === 1) {
					helpk.push(counter);
				}
			}
			// calculate with helpk position of the indice
			if (helpk.length === 0) {
				ret.push(0);
			} else if (helpk.length === 1) {
				ret.push(helpk[0] + 1);
			} else if (helpk.length === 2) {
				if (helpk[0] === 0 && helpk[1] === 1) {
					ret.push(12);
				} else if (helpk[0] === 0 && helpk[1] === 2) {
					ret.push(13);
				} else {
					ret.push(23);
				}
			} else if (helpk.length === 3) {
				ret.push(123);
			}
// mit map!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		}
		if (this.selectedY.length !== 0) {
			const vennSvg = this.shadowRoot!.querySelector("sane-venn-diagram-svg") as SaneVennDiagramSvg;
			vennSvg.drawDiagram(ret, this.selectedY);
		}
	}

	/**
	 * EventListener on change data.nOutputColumns & on-change checkbox
	 * Ensures that not more than 3 checkboxes are selected
	 * if selectedY changed setOfK gets calculated again
	 */
	private onChangeEvent(): void {
		if (this.shadowRoot !== null) {
			this.checkLimit();
			if (this.setSelectedY() === true) {
				this.setOfK();
			}
		}
	}

	/**
	 * EventListener on change data.OutputRows
	 */
	private onChangeRow(): void {
		if (this.shadowRoot !== null) {
			if (this.selectedY.length !== 0) {
				this.setOfK();
			}
		}
	}

	/**
	 * Event starts when a Checkbox checked value is changed.
	 * Ensures that is always 1,2 or 3 ys selected.
	 * 3 checkboxes selected: all others get disabled
	 * else: all get enabled
	 * @return {void}
	 */
	private checkLimit(): void {
		const allSets = this.shadowRoot!.querySelectorAll("paper-checkbox");
		const selectedSets = this.shadowRoot!.querySelectorAll("paper-checkbox[checked]");
		if (allSets.length === 0 || selectedSets.length === 0) {
			return;
		}
		if (selectedSets.length === 3) {
			for (const count of allSets) {
				if (count.getAttribute("checked") !== "") {
					count.setAttribute("disabled", "");
				}
			}
		} else {
			allSets.forEach((yInSets) => {
				yInSets.removeAttribute("disabled");
			});
		}
	}

	/**
	 * Sets this.selectedY as the ids of the checked checkboxes
	 * @returns {boolean}
	 * returns true if this.selectedY changed, false if not
	 */
	private setSelectedY(): boolean {
		const selectedSetsNode = this.shadowRoot!.querySelectorAll("paper-checkbox[checked]");
		const selectedSetsNum: number [] = [];
		if (selectedSetsNode.length === 0) {
			return false;
		}
		for (const count of selectedSetsNode) {
			selectedSetsNum.push(Number(count.getAttribute("id")));
		}
		if (selectedSetsNum.length === this.selectedY.length) {
			for (let count = 0; count < selectedSetsNum.length; count++) {
				if (selectedSetsNum[count] !== this.selectedY[count]) {
					this.selectedY = selectedSetsNum;
					return true;
				}
			}
			return false;
		} else {
			this.selectedY = selectedSetsNum;
			return true;
		}
	}

	/**
	 * Returns set of y(index).
	 * @param centralData
	 * @param {number} index
	 * @returns {number[]}
	 */
	private setOfY(centralData: any, index: number ): number [] {
		const data = centralData.base as ISaneData;
		const ret: number [] = [];
		const maxIndices = 4;
		const limit = 2 ** Math.min(this.data.nInputColumns, maxIndices);

		for (let k = 0; k < limit; k++) {
			if (getBit(data.outputRows[k].output, index) === 1) {
				ret.push(k);
			}
		}
		return ret;
	}

	/**
	 * Creates an array, that runs from 0 to value.
	 * This will be used to create checkboxes for all ys.
	 * @param {number} value
	 * @returns {number[]}
	 */
	private makeUpwardSequence(value: number): number [] {
		const ret: number [] = [];
		for (let output = 0; output < value; output++) {
			ret.push(output);
		}
		return ret;
	}

}

// after the element is defined, we register it in polymer
customElements.define(SaneVennDiagram.is, SaneVennDiagram);

export { SaneVennDiagram };
