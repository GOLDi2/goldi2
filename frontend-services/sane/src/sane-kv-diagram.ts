import "@polymer/paper-item/paper-item";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { ISaneData, ISaneDataRow } from "./sane-data.js";
import { getBit } from "./boollib.js";
import { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox.js";
import { PaperButtonElement } from "@polymer/paper-button/paper-button.js";
import { PaperToggleButtonElement } from "@polymer/paper-toggle-button/paper-toggle-button.js";
import {
	expressionTree,
	expressionType,
	getExpressionAsExpTrees,
	getMinimalTerms, IExpressionTreeBool,
	IMinTable,
	IMinTableBlock,
	IQmcSteps,
	makeLaTeXFromExpTree,
	makeTreesFromMin,
	minimizationType,
	ternary,
} from "./qmclib.js";
import { SaneEquationInput } from "./sane-equation-input.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin, Events } from "./eventlib.js";
import { checkSCBlockedFeatures, startConfiguration } from "./startconfiglib.js";
import { SaneMath } from "./sane-math-mixin.js";

interface IKvDiagrams {
// -- TODO: beautify code (make it more readable, insert more and more useful comments)
// -- TODO: beautify blocks for small blocks
// -- TODO: add render synchronization
	kv0: IKvDiagram[];
	kv1: IKvDiagram[];
	kv2: IKvDiagram[];
	kv3: IKvDiagram[];
	[key: string]: IKvDiagram[];
}

interface IKvDiagram {
	x0: number;
	x1: number;
	x2: number;
	x3: number;
	row: IKvDiagramCell[];
	[key: string]: number | IKvDiagramCell[];
}

interface IKvDiagramCell {
	inputIndex: number;
	value: string;
}

interface IKvIndexArray {
	x: number;
	y: number;
}

type minType = "dnf" | "knf";

const MAX_INPUTS: number = 6;

class SaneKvDiagram extends SaneMath(EventMixin(AppLocalizeMixin())) {
	static get template() {
		return html`
			<style include="shared-styles">
				/*locale style goes here */
				:host {
					user-select: none;
					-webkit-user-select: none; /* Chrome all / Safari all */
					-moz-user-select: none; /* Firefox all */
					-ms-user-select: none;
					--paper-input-container-label: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-input: {
						color: var(--app-card-font-color);
					};
					--paper-input-container-focus-color: var(--sane-dark-secondary-color);
					--paper-input-container-input-color: var(--app-card-font-color);
					--paper-toggle-button-unchecked-bar-color: var(--app-card-font-color);
					--paper-toggle-button-checked-bar-color: var(--app-card-font-color);
					--paper-listbox: {
						--paper-item-selected-weight: normal;
					};
					--paper-item-selected: {
						background-color: white;
					}
				}

				.left {
					width: 33%;
				}

				.middle {
					width: 33%
				}

				.right {
					width: 33%;
				}

				paper1-listbox {
					padding: 0;
					background: var(--app-background-color);
					color: var(--app-card-font-color);
				}

				paper-listbox paper-item {
					color: var(--app-card-font-color);
				}

				paper-button {
					padding: 0.3em 0.5em 0.3em 0.5em;
					margin: 0.5em 0.5em 0.5em 0;
				}

				.kvDiagram {
					position: relative;
					width: 100%;
				}

				.text_centered {
					text-align: center;
				}

				svg {
					position: absolute;
					left: 0;
					top: 0;
					height: 100%;
					width: 100%;
					z-index: 1;
					pointer-events: none;
				}

				table {
					margin: 0;
					padding: 0;
				}

				.Table1 {
					max-width: 100%;
					min-width: 35em;
					border-collapse: collapse;
				}

				.Table1 tr td {
					padding: 0.4em 0.4em 0.4em 0.4em;
				}

				.Table2 {
					border-spacing: 0;
				}

				.Table2 tr td {
					width: 2.4em;
					height: 2.4em;
					padding: 0;
				}

				.Table2 tr td.head {
					background-color: var(--sane-light-primary-color);
					color: #fff;
					border-right: solid 1px #fff;
					border-bottom: solid 1px #fff;
					text-align: center;
				}

				td .bridge {
					background-color: var(--app-divider-color);
					border-right: solid 1px var(--app-tt-divider-color);
					border-bottom: solid 1px var(--app-tt-divider-color);
				}

				.Table2 tr td.clear {
					empty-cells: hide;
					background-color: var(--sane-light-primary-color);
					color: #fff;
					border-right: solid 1px #fff;
					border-bottom: solid 1px #fff;
					text-align: center;
				}

				.Table2 tr td.cells {
					position: relative;
					color: var(--app-card-font-color);
					opacity: 1.0;
					border-right: solid 1px var(--app-tt-divider-color);
					border-bottom: solid 1px var(--app-tt-divider-color);
				}

				.Table2 tr td.cells:hover {
					cursor: pointer;
					background-color: var(--sane-hover-background-color);
					color: var(--primary-text-color);
					transition: all 0.15s ease-in-out;
				}

				.Table2 tr td.selected {
					background-color: var(--sane-hover-background-color);
					color: var(--primary-text-color);
					position: relative;
					opacity: 1.0;
					border-right: solid 1px var(--app-tt-divider-color);
					border-bottom: solid 1px var(--app-tt-divider-color);
				}

				.value {
					position: absolute;
					top: 20%;
					left: 25%;
					height: 50%;
					width: 50%;
					text-align: center;
					pointer-events: none;
				}

				.id {
					position: absolute;
					font-size: xx-small;
					bottom: 0.1em;
					right: 0.1em;
					pointer-events: none;
				}

				.button {
					text-transform: none;
				}

				.kv-solution-selection {
					--sane-equation-input-label-width: 0.7em;
				}

				#button_field {
					position: relative;
					width: 100%;
				}

				#auto_min_switch_text {
					color: var(--app-card-font-color);
				}

				#blockMode_button1 {
					background-color: #666;
					color: #fff;
				}

				#blockMode_button2 {
					background-color: var(--sane-light-alert-color);
					color: #fff;
				}

				#blockMode_button2[disabled] {
					background-color: #ccc;
				}

				#kv_solutions {
					--paper-item-selected: {
						background-color: var(--app-primary-color);
						filter: brightness(2.5);
					}
				}

				#minterm {
					min-width: 3em;
					max-width: 20em;
				}
			</style>
			<paper-dropdown-menu id="kv_diagram_dopdown_y" label="[[localize('vocab-output-function')]]" class="left">
				<paper-listbox id="kv_diagram_listbox_y" slot="dropdown-content" selected="{{selectedOutput}}"
							   on-click="handleSaveSelectedOutput">
					<template is="dom-repeat" items="[[calcOutputs(data.*)]]" as="index">
						<paper-item>y[[index]]</paper-item>
					</template>
				</paper-listbox>
			</paper-dropdown-menu>

			<paper-dropdown-menu id="kv_diagram_dopdown_x" label="[[localize('KV-highest-x')]]" class="middle">
				<paper-listbox slot="dropdown-content" selected="{{inputNum}}" on-click="handleSelectedInputNum">
					<template is="dom-repeat" items="[[showMaxInputs(data.*)]]" as="index">
						<paper-item>x[[index]]</paper-item>
					</template>
				</paper-listbox>
			</paper-dropdown-menu>

			<paper-dropdown-menu id="minimization_form" label="[[localize('vocab-minimization-type')]]" class="right">
				<paper-listbox slot="dropdown-content" selected="{{selectedMinType}}" attr-for-selected="selected-min-type"
							   on-click="handleSelectedMinType">
					<paper-item selected-min-type="dnf">DNF</paper-item>
					<paper-item selected-min-type="knf">KNF</paper-item>
				</paper-listbox>
			</paper-dropdown-menu>
			<hr>

			<div id="button_field">
				<paper-toggle-button id="kv_diagram_switch" class="button" raised on-change="handleNewMinimization">
					<span id="auto_min_switch_text">[[localize('KV-auto-minimization')]]</span>
				</paper-toggle-button>
				<paper-button id="blockMode_button1" class="button" raised on-click="handleSetBlockMode">
					[[localize('KV-enable-block-mode')]]
				</paper-button>
				<paper-button id="blockMode_button2" class="button" raised hidden disabled on-click="handleAcceptBlock">
					[[localize('KV-accept-block')]]
				</paper-button>
			</div>

			<div id="kv_solutions" hidden>
				<paper-listbox id="kv_listbox_solution" slot="dropdown-content" selected="{{selectedSolution}}" fallback-selection="0" on-selected-changed="handleNewMinimization">
					<template is="dom-repeat" items="[[makeExpTrees(data.*, selectedMinType, selectedOutput)]]">
						<sane-equation-input readonly class="kv-solution-selection" char-set="[[data.charSet]]" description="[[incNum(index)]]: " lhs="y_[[selectedOutput]]" tree="[[item]]"></sane-equation-input>
					</template>
				</paper-listbox>
			</div>

			<p id="term_header" hidden>[[localize('KV-generated-term')]]</p>
			<p id="term"></p>

			<hr>
			<div style="overflow-x: auto;">
				<table id="table" class="Table1">
					<tr hidden$="[[!hasMinValueInputs(inputNum, 4)]]">
						<td hidden$="[[!hasValueInputs(inputNum, 5)]]"></td>
						<td class="text_centered">/x4</td>
						<td class="text_centered">x4</td>
					</tr>
					<tr>
						<td hidden$="[[!hasValueInputs(inputNum, 5)]]">/x5</td>
						<td>
							<div class="kvDiagram">
								<table class="Table2">
									<tr> <!-- x0 header row -->
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 1)]]"></td>
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 3)]]"></td>
										<td class="head">x0</td>
										<template is="dom-repeat" items="[[output.kv0]]">
											<td class="head">[[item.x0]]</td>
										</template>
									</tr>
									<tr hidden$="[[!hasValueInputs(inputNum, 1)]]"> <!-- x1 header row -->
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 2)]]"></td>
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 3)]]"></td>
										<td class="head">x1</td>
										<td class="bridge"></td>
										<td class="bridge"></td>
										<td class="bridge"></td>
									</tr>
									<tr hidden$="[[!hasMinValueInputs(inputNum, 2)]]"> <!-- x1 -->
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 3)]]"></td>
										<td class="clear" hidden$="[[!hasMinValueInputs(inputNum, 2)]]"></td>
										<td class="head">
											<span hidden$="[[!hasMinValueInputs(inputNum, 2)]]">x1</span>
										</td>
										<template is="dom-repeat" items="[[output.kv0]]">
											<td class="head" hidden$="[[hasValueInputs(inputNum, 1)]]">[[item.x1]]</td>
										</template>
									</tr>
									<tr hidden$="[[!hasMinValueInputs(inputNum, 2)]]"> <!-- x2 -->
										<td class="head" hidden$="[[!hasMinValueInputs(inputNum, 3)]]">x3</td>
										<td class="head">
											<span hidden$="[[!hasMinValueInputs(inputNum, 2)]]">x2</span>
										</td>
										<td class="bridge"></td>
										<template is="dom-repeat" items="[[output.kv0]]">
											<td class="bridge"></td>
										</template>
									</tr>
									<template is="dom-repeat" items="[[output.kv0]]" as="row" index-as="i">
										<tr>
											<td hidden$="[[!hasValueInputs(inputNum, 0)]]"
												class$="[[checkOneInputException(inputNum, i)]]"></td>
											<td hidden$="[[!hasMinValueInputs(inputNum, 3)]]" class="head">[[row.x3]]</td>
											<td hidden$="[[!hasMinValueInputs(inputNum, 2)]]" class="clear">[[row.x2]]</td>
											<td hidden$="[[!hasValueInputs(inputNum, 1)]]" class="head">[[row.x1]]</td>
											<td hidden$="[[!hasMinValueInputs(inputNum, 1)]]" id="bridge[[i]]"
												class$="bridge [[clearBridge(i, inputNum)]]"></td>
											<template is="dom-repeat" items="[[row.row]]" as="cell">
												<td class="cells" id$="cell[[cell.inputIndex]]" on-click="handleCellClick">
													<span class="value">[[cell.value]]</span>
													<span class="id">[[cell.inputIndex]]</span>
												</td>
											</template>
										</tr>
									</template>
								</table>
								<svg id="svg0" class="overlay" position="absolute"></svg>
							</div>
						</td>
						<td hidden$="[[!hasMinValueInputs(inputNum, 4)]]">
							<div class="kvDiagram">
								<table class="Table2">
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head">x0</td>
										<template is="dom-repeat" items="[[output.kv1]]">
											<td class="head">[[item.x0]]</td>
										</template>
									</tr>
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head"><span>x1</span></td>
										<template is="dom-repeat" items="[[output.kv1]]">
											<td class="head">[[item.x1]]</td>
										</template>
									</tr>
									<tr>
										<td class="head">x3</td>
										<td class="head"><span>x2</span></td>
										<td class="bridge"></td>
										<template is="dom-repeat" items="[[output.kv1]]">
											<td class="bridge"></td>
										</template>
									</tr>
									<template is="dom-repeat" items="[[output.kv1]]" as="row">
										<tr>
											<td class="head">[[row.x3]]</td>
											<td class="head">[[row.x2]]</td>
											<td class="bridge"></td>
											<template is="dom-repeat" items="[[row.row]]" as="cell">
												<td class="cells" id$="cell[[cell.inputIndex]]" on-click="handleCellClick">
													<span class="value">[[cell.value]]</span>
													<span class="id">[[cell.inputIndex]]</span>
												</td>
											</template>
										</tr>
									</template>
								</table>
								<svg id="svg1" class="overlay"></svg>
							</div>
						</td>
					</tr>
					<tr hidden$="[[!hasValueInputs(inputNum, 5)]]">
						<td>x5</td>
						<td>
							<div class="kvDiagram">
								<table class="Table2">
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head">x0</td>
										<template is="dom-repeat" items="[[output.kv2]]">
											<td class="head">[[item.x0]]</td>
										</template>
									</tr>
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head"><span>x1</span></td>
										<template is="dom-repeat" items="[[output.kv2]]">
											<td class="head">[[item.x1]]</td>
										</template>
									</tr>
									<tr>
										<td class="head">x3</td>
										<td class="head"><span>x2</span></td>
										<td class="bridge"></td>
										<template is="dom-repeat" items="[[output.kv2]]">
											<td class="bridge"></td>
										</template>
									</tr>
									<template is="dom-repeat" items="[[output.kv2]]" as="row">
										<tr>
											<td class="head">[[row.x3]]</td>
											<td class="head">[[row.x2]]</td>
											<td class="bridge"></td>
											<template is="dom-repeat" items="[[row.row]]" as="cell">
												<td class="cells" id$="cell[[cell.inputIndex]]" on-click="handleCellClick">
													<span class="value">[[cell.value]]</span>
													<span class="id">[[cell.inputIndex]]</span>
												</td>
											</template>
										</tr>
									</template>
								</table>
								<svg id="svg2" class="overlay"></svg>
							</div>
						</td>
						<td>
							<div class="kvDiagram">
								<table class="Table2">
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head">x0</td>
										<template is="dom-repeat" items="[[output.kv3]]">
											<td class="head">[[item.x0]]</td>
										</template>
									</tr>
									<tr>
										<td class="clear"></td>
										<td class="clear"></td>
										<td class="head">x1</td>
										<template is="dom-repeat" items="[[output.kv3]]">
											<td class="head">[[item.x1]]</td>
										</template>
									</tr>
									<tr>
										<td class="head">x3</td>
										<td class="head">x2</td>
										<td class="bridge"></td>
										<template is="dom-repeat" items="[[output.kv3]]">
											<td class="bridge"></td>
										</template>
									</tr>
									<template is="dom-repeat" items="[[output.kv3]]" as="row">
										<tr>
											<td class="head">[[row.x3]]</td>
											<td class="head">[[row.x2]]</td>
											<td class="bridge"></td>
											<template is="dom-repeat" items="[[row.row]]" as="cell">
												<td class="cells" id$="cell[[cell.inputIndex]]" on-click="handleCellClick">
													<span class="value">[[cell.value]]</span>
													<span class="id">[[cell.inputIndex]]</span>
												</td>
											</template>
										</tr>
									</template>
								</table>
								<svg id="svg3" class="overlay"></svg>
							</div>
						</td>
					</tr>
				</table>
			</div>
		`;
	}
	static get is() {
		return "sane-kv-diagram";
	}

	public static get properties() {
		return {
			data: {
				notify: true,
				type: Object,
			},
			inputNum: {
				notify: true,
				reflectToAttribute: true,
				type: Number,
			},
			output: {
				computed: "computeDiagrams(data.*, selectedOutput, selectedMinType)",
				type: Object,
			},
			selectedMinType: {
				notify: true,
				reflectToAttribute: true,
				type: String,
			},
			selectedOutput: {
				notify: true,
				reflectToAttribute: true,
				type: Number,
			},
			selectedSolution: {
				observer: "newSolutionSelected",
				type: Number,
			},
		};
	}
	private data;
	private inputNum: number = 0;
	private selectedOutput: number = 0;
	private output = {} as IKvDiagrams;
	private currentBlockIndex: number = 0;
	// default auto minimization type
	private selectedMinType: minType = "dnf";
	private minimizeOver: string = "*";
	private blockMode: boolean = false;
	private currentBlock: number[] = [];
	private ownBlocks: number[][] = [];
	private ownBlockTernaries: ternary[][] = [];
	private minimize: boolean = false;
	private selectedSolution: number = 0;

	constructor(p) {
		super();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}

	public ready() {
		super.ready();
		// this.$.kv_solutionstemplate.addEventListener("dom-change", (e) => {
		// 	const eqs = this.shadowRoot!.querySelectorAll(".kv-equation");
		// 	for (const node of eqs) {
		// 		this.typeset(node as HTMLElement, (node as HTMLElement).textContent!);
		// 	}
		// });

		// this.indexArray = this.computeIndexCoordinates(this.output);
		// check for start configuration features
		// check if default y was assigned
		if (startConfiguration && checkSCBlockedFeatures("kvDiagram", "defaultY") !== "") {
			const select: string = checkSCBlockedFeatures("kvDiagram", "defaultY").toString();
			(this.shadowRoot!.querySelector("#kv_diagram_listbox_y") as PaperListboxElement).setAttribute("selected", select);
		}
		// check if y dropdown can be used
		if ((startConfiguration && checkSCBlockedFeatures("kvDiagram", "changeY") === false)) {
			(this.shadowRoot!.querySelector("#kv_diagram_dopdown_y") as any).setAttribute("disabled", true);
		}
		// check if x dropdown can be used
		if ((startConfiguration && checkSCBlockedFeatures("kvDiagram", "changeInputColumns") === false)) {
			(this.shadowRoot!.querySelector("#kv_diagram_dopdown_x") as any).setAttribute("disabled", true);
		}
		// check if minimization switch can be used
		if ((startConfiguration && checkSCBlockedFeatures("kvDiagram", "switchAutoMinimize") === false)) {
			(this.shadowRoot!.querySelector("#kv_diagram_switch") as any).setAttribute("disabled", true);
		}
		// check if minimization switch is on by default
		if ((startConfiguration && checkSCBlockedFeatures("kvDiagram", "defaultAutoMinimizeOn") === true)) {
			(this.shadowRoot!.querySelector("#kv_diagram_switch") as any).setAttribute("checked", true);
			// this.minimize = true;
			// this.handleNewMinimization();
			setTimeout(() => this.handleNewMinimization(), 200); // ewwwwwwwwww
		}
	}

	/**
	 *  Increments/Decrements nInputColumns diff times.
	 *  @return {void}
	 */
	public handleSelectedInputNum(): void {
		const diff = this.inputNum + 1 - this.data.nInputColumns;
		if (diff > 0) {
			for (let i = diff ; i > 0 ; i--) {
				this.triggerEvent(Events.incInputVariable);
			}
		} else if (diff < 0) {
			for (let i = diff ; i < 0 ; i++) {
				this.triggerEvent(Events.decInputVariable);
			}
		}
	}

	/**
	 * Inverts value of blockMode and applies styles to multiple DOM-elements
	 */
	public handleSetBlockMode(): void {
		// invert blockMode
		this.blockMode = !this.blockMode;

		// get DOM-elements in order to alter their properties depending on the value of blockMode
		const button1 = this.shadowRoot!.querySelector("#blockMode_button1");
		const button2 = this.shadowRoot!.querySelector("#blockMode_button2");
		const toggleButton = this.shadowRoot!.querySelector("#kv_diagram_switch");
		const term = this.shadowRoot!.querySelector("#term") as HTMLElement;

		if (this.blockMode) {
			if (button1) {
				button1.textContent = this.localizeSane("KV-disable-block-mode");
			}
			if (button2) {
				(button2 as PaperButtonElement).hidden = false;
			}
			// disable auto minimize Button and set checked to false
			(toggleButton as PaperToggleButtonElement).checked = false;
			(toggleButton as PaperToggleButtonElement).disabled = true;
			term.hidden = false;
			this.handleNewMinimization();
		} else {
			// convert all properties and variables used for block mode to their original states
			if (button1) {
				button1.textContent = this.localizeSane("KV-enable-block-mode");
			}
			if (button2) {
				(button2 as PaperButtonElement).hidden = true;
			}
			term.hidden = true;
			this.typeset(term, "");
			// enable auto minimize button
			if (!this.minimize) {
				(toggleButton as PaperToggleButtonElement).disabled = false;
			}
			this.deleteSvgChilds();
			this.currentBlockIndex = 0;
			for (const rowIndex of this.currentBlock) {
				const elem = this.shadowRoot!.getElementById("cell" + rowIndex.toString());
				if (elem) {
					elem.className = "cells";
				}
			}
			this.minimizeOver = "*";
			this.currentBlock = [];
			this.ownBlocks = [];
		}
	}

	/**
	 * Computes variables required for block drawing.
	 * Draws block.
	 * If all cells with value 1 or 0 (depending on minimization type) are part of this.ownBlocks -> show minimal string
	 */
	public handleAcceptBlock(): void {
		const blockLength: number = this.currentBlock.length;
		const ternaryValue = this.getTernary(this.currentBlock) as ternary[];
		// save current ternary
		this.ownBlockTernaries.push(ternaryValue);

		// get drawing variables
		const element: any = this.shadowRoot!.querySelector("#cell0");
		let tdHeight: number = 0;
		let tdWidth: number = 0;
		if (element) {
			tdHeight = element.offsetHeight;
			tdWidth = element.offsetWidth;
		}
		const offsetX: number = (() => {
			if (this.inputNum === 0) {
				return 1;
			} else if (this.inputNum > 2) {
				return 3;
			} else {
				return 2;
			}
		})();
		const offsetY: number = (() => {
			if (this.inputNum === 0) {
				return 1;
			} else if (this.inputNum === 1) {
				return 2;
			} else {
				return 3;
			}
		})();
		const indexCoords = this.computeIndexCoordinates(this.output) as IKvIndexArray[];
		const colorStr: string = this.calcColor(this.currentBlockIndex);
		const radius: number = this.svgRadius(this.currentBlockIndex, 1);

		this.currentBlockIndex++;
		// make a copy in order to remain the original after Array operations (e.g. splice)
		const ternary1 = [... ternaryValue];
		this.drawBlock(ternary1, this.currentBlock, indexCoords, tdHeight, tdWidth,
			offsetX, offsetY, colorStr, this.output, radius);

		for (let i = 0; i <  blockLength; i++) {
			const cell = this.shadowRoot!.querySelector("#cell" + this.currentBlock[i].toString());
			if (cell) {
				cell.className = "cells";
			}
		}
		this.ownBlocks.push(this.currentBlock);
		this.currentBlock = [];
		this.acceptBlock(this.currentBlock);

		// show expression of accepted Term
		const elem = this.shadowRoot!.querySelector("#term") as HTMLElement;
		if (elem) {
			this.typeset(elem, `y_${this.selectedOutput} = ${this.getExpression(this.ownBlocks, this.ownBlockTernaries)}`);
		}
		// if (this.minimizeOver !== "*") {
		// if (this.checkFullMinimization(this.ownBlocks, parseInt(this.minimizeOver, 10)))
	}

	/**
	 * Checks boolean of minimize switch and computes blocks if true, else delete all svg children.
	 */
	public handleNewMinimization(e: CustomEvent = new CustomEvent("", {})): void {
		if (e.srcElement === this.$.kv_listbox_solution) {
			this.selectedSolution = e.detail.value;
		}
		const toggleButton = this.shadowRoot!.querySelector("#kv_diagram_switch");
		this.minimize = (toggleButton as PaperToggleButtonElement).getAttribute("aria-pressed") === "true";
		this.deleteSvgChilds();
		const minTerms = this.shadowRoot!.querySelector("#kv_solutions");

		if (this.minimize) {
			(minTerms as HTMLElement).hidden = false;
			this.computeBlocks(this.selectedOutput, this.output);
			this.newSolutionSelected();
		} else {
			(minTerms as HTMLElement).hidden = true;
		}
	}

	/**
	 * blockMode: takes parameter and puts/removes it into/out of this.currentBlock
	 * Rotates SANE-Data on e.id between 0, 1, *.
	 * @param e
	 */
	public handleCellClick(e: any): void {
		const id: string = e.composedPath()[0].id.substr("cell".length);
		const rowIndex: number = Number.parseInt(id, 10);
		const elem = this.shadowRoot!.getElementById("cell" + rowIndex.toString());
		if (this.blockMode) {
			// handle click on already clicked cell
			if (this.currentBlock.indexOf(rowIndex) !== -1) {
				const index: number = this.currentBlock.indexOf(rowIndex);
				this.currentBlock.splice(index, 1);
				if (elem) {
					elem.className = "cells";
				}
				this.acceptBlock(this.currentBlock);
				if (this.currentBlock.length === 0) {
					this.minimizeOver = "*";
				}
			} else {
				// get value of cell in order to decide which binary should be drawn over
				const value: string = e.path[0].childNodes[1].textContent;
				if (this.ownBlocks.length === 0 && this.minimizeOver === "*") {
					this.minimizeOver = value;
				}
				// check if correct cell was selected
				if (value === this.minimizeOver || value === "*") {
					if (elem) {
						elem.className = "selected";
					}
					this.currentBlock.push(rowIndex);
					this.acceptBlock(this.currentBlock);
				}
			}
		} else {
			this.changeValue(rowIndex);
		}
	}

	/**
	 * Set unnecessary td element for inputNum = 0 to class "clear" in order to hide it.
	 * @param {number} iNum
	 * @param {number} i
	 * @returns {string}
	 */
	public checkOneInputException(iNum: number, i: number): string {
		return (i === 1 && iNum === 0) ? "clear" : "head";
	}

	/**
	 * Make bridge clear so it doesn't stand out.
	 * @param {number} row Current row index
	 * @param {number} inputNum Number of input variables
	 * @returns {string} "clear" or empty string
	 */
	public clearBridge(row: number, inputNum: number): "clear" | "" {
		if (row === 2 && inputNum === 2) {	// asymmetrical edge-case
			return "clear";
		}
		return (row > inputNum) ? "clear" : "";
	}

	public makeExpTrees(dataInfo: any, type: expressionType, output: number): expressionTree[] {
		if (dataInfo.base === undefined) {
			return [];
		}
		return getExpressionAsExpTrees(dataInfo.base as ISaneData, type, output);
	}

	public incNum(n: number) {
		return n + 1;
	}

	// public buildMinSolutions(dataInfo: any, selectedYIndex: number, minTypeNumber: string | string): string[] {
		// const nodeList = this.$.kv_listbox_solution.querySelectorAll(".kv-equation");
		// for (const node of nodeList) {
		// 	this.$.kv_listbox_solution.removeChild(node);
		// }
		// const data = dataInfo.base as ISaneData;
		// return getMinimalTerms(data, selectedYIndex, this.getSelectedTypeString(minTypeNumber)).minLaTeXStrings;
	// }

	private newSolutionSelected() {
		// this.$.kv_listbox_solution._setFocus();
		const selectdItem = (this.$.kv_listbox_solution as PaperListboxElement).selectedItem;
		// TODO: auskommentiert
		// if (selectdItem !== undefined) {
		// 	(selectdItem as SaneEquationInput).setFocus();
		// }
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

	private changeValue(rowIndex: number): void {
		// toggle the value of a cell
		if (!this.data.outputRows[rowIndex].mask) {
			this.triggerEvent(Events.toggleMask, {detail: rowIndex});
			if (getBit(this.data.outputRows[rowIndex].output, this.selectedOutput) === 1) {
				this.triggerEvent(Events.toggleOutputBit, {detail: {cell: this.selectedOutput, row: rowIndex}});
			}
		} else if (getBit(this.data.outputRows[rowIndex].output, this.selectedOutput) === 0) {
			this.triggerEvent(Events.toggleOutputBit, {detail: {cell: this.selectedOutput, row: rowIndex}});
		} else if (getBit(this.data.outputRows[rowIndex].output, this.selectedOutput) === 1) {
			this.triggerEvent(Events.toggleMask, {detail: rowIndex});
		}
	}

	/**
	 * Deletes all current SVG child nodes.
	 */
	private deleteSvgChilds(): void {
		for (let i = 0; i < 4; i++) {
			const svg = this.shadowRoot!.getElementById("svg" + i.toString());
			if (svg) {
				while (svg.lastChild) {
					svg.removeChild(svg.lastChild);
				}
			}
		}
	}

	/**
	 * Checks if a block is valid and sets disabled of the accept button to false (if true).
	 * @param {number[]} block
	 */
	private acceptBlock(block: number[]): void {
		const button2 = this.shadowRoot!.querySelector("#blockMode_button2");
		const blockLength: number = block.length;

		// classification of drawn blocks
		if (this.isPowerOfTwo(blockLength)) {
			// starting point x0 set to right border of kv diagram
			let x0: number = this.output.kv0.length - 1;
			// starting point y0 set to bottom border of kv diagram
			let y0: number = ((this.inputNum === 0 || this.inputNum === 2) ?
				2 ** this.inputNum - this.inputNum : this.output.kv0.length) - 1;
			let xMax: number = 0;
			let yMax: number = 0;
			// special cases for block length === 4
			let rightLeftOpen: boolean = true;
			let topBottomOpen: boolean = true;
			// index coordinated are required in order to accept a block
			const indexCoords = this.computeIndexCoordinates(this.output) as IKvIndexArray[];
			// find start and end points
			for (let i = 0; i < blockLength; i++) {
				const index: IKvIndexArray = indexCoords[block[i]];
				if (index.x === 1 || index.x === 2) {
					rightLeftOpen = false;
				}
				if (index.y === 1 || index.y === 2) {
					topBottomOpen = false;
				}
				if (index.x > xMax) {
					xMax = index.x;
				}
				if (index.x < x0) {
					x0 = index.x;
				}
				if (index.y > yMax) {
					yMax = index.y;
				}
				if (index.y < y0) {
					y0 = index.y;
				}
			}
			// check if block over multiple Diagrams has equal sub blocks
			let blocksEqual: boolean;
			const helper: number[] = block.map((x) => Math.floor(x / 16));
			const paths: number[][] = [[], [], [], []];
			block.forEach((value, index) => {
				paths[helper[index]].push(value % 16);
			});
			const pathsFiltered: number[][] = paths.filter((kvBlock) => kvBlock.length > 0);
			const firstPath: string = pathsFiltered[0].sort((a, b) => a - b).join("");
			blocksEqual = pathsFiltered.every( (element) => element.sort((a, b) => a - b).join("") === firstPath);

			const diffX: number = xMax - x0;
			const diffY: number = yMax - y0;

			// block span must not be 2 and sub blocks have to be equal
			if (!(diffX === 2 || diffY === 2) && blocksEqual) {
				if (blockLength === 4) {
					if (topBottomOpen || rightLeftOpen) {
						(button2 as PaperButtonElement).disabled = false;
					} else {
						(button2 as PaperButtonElement).disabled =
							diffY !== 0 && diffX === 3 || diffX !== 0 && diffY === 3;
					}
				} else {
					(button2 as PaperButtonElement).disabled = false;
				}
			} else {
				(button2 as PaperButtonElement).disabled = true;
			}
		} else {
			(button2 as PaperButtonElement).disabled = true;
		}
	}

	/**
	 * Calculate the border color for the blocks.
	 * @param {number} index The block array index.
	 * @returns {string} The rgb value as 'rgb(r,g,b)'.
	 */
	private calcColor(index: number): string {
		const multiplier: number = 297;
		// good values:
		// 65	red		yellow		green		cyan		blue		pink		...
		// 97	red		yellow		cyan		blue		red			green		cyan		pink		...
		// 137	red		green		blue		red			cyan		pink		yellow		cyan		...
		// 217	red		cyan		yellow		blue		green		...
		// 267	red		blue		green		yellow		pink		blue		green		yellow		...
		// 297	red		blue		cyan		green		yellow		red			pink		...
		// 303	red		pink		blue		cyan		green		yellow		...
		let hue = index * multiplier % 360;
		if (hue > 50 && hue < 70) {
			hue = (hue < 60) ? 50 : 70;
		}
		return "rgb(" + this.hsvToRgb(hue, 70, 80).join(",") + ")";
	}

	/**
	 * Convert colors from hsv to rgb.
	 * @param {number} h Hue between 0 and 360.
	 * @param {number} s Saturation between 0 and 100.
	 * @param {number} v Value between 0 and 100.
	 * @returns {number[]} The rgb value.
	 */
	private hsvToRgb(h: number, s: number, v: number): number[] {
		let r: number;
		let g: number;
		let b: number;
		h = Math.max(0, Math.min(360, h)) / 360;
		s = Math.max(0, Math.min(100, s)) / 100;
		v = Math.max(0, Math.min(100, v)) / 100;

		const i: number = Math.floor(h * 6);
		const f: number = h - i; // factorial part of h
		const p: number = v * (1 - s);
		const q: number = v * (1 - s * f);
		const t: number = v * (1 - s * (1 - f));

		switch (i % 6) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			default: r = v; g = p; b = q;
		}
		return [ r * 255, g * 255, b * 255 ];
	}

	private isPowerOfTwo(x: number): boolean {
		return (x !== 0) && ((x & (x - 1)) === 0);
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

	/**
	 * Calculates this.inputNum on base of Sane Data and notifies the user if MAX_INPUTS is reached.
	 */
	private calcInputNum(): void {
		if (this.data === undefined) {
			return;
		}

		if (this.data.nInputColumns > MAX_INPUTS) {
			this.inputNum = 5;
			this.notifySane("KV-Diagram supports max. 6 Inputs");
		} else {
			this.inputNum = this.data.nInputColumns - 1;
		}
	}

	/**
	 * Returns Array for dom-repeat and sets default number of inputs.
	 * @param dataInfo
	 * @return {any[]}
	 */
	private showMaxInputs(dataInfo: any): any[] {
		const data = dataInfo.base as ISaneData;
		this.calcInputNum();
		return Array(MAX_INPUTS);
	}

	/**
	 * Used to scale a single Kv-Diagram. Same goes for the next two functions.
	 * @param dataInfo
	 * @param {number} value
	 * @return {boolean}
	 */
	private hasMinValueInputs(dataInfo: any, value: number): boolean {
		return (value <= this.inputNum);
	}

	private hasValueInputs(dataInfo: any, value: number): boolean {
		return (value === this.inputNum);
	}

	private hasMaxValueInputs(dataInfo: any, value: number): boolean {
		return (value >= this.inputNum);
	}

	/**
	 * Computes the input array.
	 * @return {object[]}
	 */
	private computeInputArray(): object[] {
		let ret: object[] = [];
		switch (this.inputNum) {

			case 0:
				ret = [{x0: 0}, {x0: 1}];
				break;

			case 1:
				ret = [{x0: 0, x1: 0}, {x0: 1, x1: 1}];
				break;

			case 2:
				ret = [
					{x0: 0, x1: 0, x2: 0},
					{x0: 1, x1: 0, x2: 1},
					{x0: 1, x1: 1},
					{x0: 0, x1: 1},
				];
				break;

			default:
				ret = [
					{x0: 0, x1: 0, x2: 0, x3: 0},
					{x0: 1, x1: 0, x2: 1, x3: 0},
					{x0: 1, x1: 1, x2: 1, x3: 1},
					{x0: 0, x1: 1, x2: 0, x3: 1},
				];
				break;
		}
		return ret;

	}

	/**
	 * Builds the KV-diagram based on the IKvDiagrams interface.
	 * @returns {IKvDiagrams}
	 */
	private computeDiagrams(dataInfo: any, selectedOutput?: number): IKvDiagrams {
		if (this.data === undefined) {
			return {} as IKvDiagrams;
		}
		this.calcInputNum();
		const data = dataInfo.base as ISaneData;
		const ret = {} as IKvDiagrams;
		const diagramNum: number = (this.inputNum > 3 ? 2 ** (this.inputNum - 3) : 1);

		for (let diagram = 0; diagram < diagramNum; diagram++) {

			ret["kv" + diagram.toString()] =  (this.buildDiagram(data, diagram));
		}
		if (this.minimize) {
			this.deleteSvgChilds();
			this.computeBlocks(this.selectedOutput, ret);
		}
		if (this.blockMode) {
			this.deleteSvgChilds();
			this.handleSetBlockMode();
		}
		return ret;
	}

	/**
	 * Builds the elements of kvx of IKvDiagrams.
	 * @param data
	 * @param {number} diagram
	 * @returns {IKvDiagram[]}
	 */
	private buildDiagram(data: ISaneData, diagram: number): IKvDiagram[] {
		const ret = (this.computeInputArray()) as IKvDiagram[];
		const singleDiagramRows =
			((this.inputNum === 0 || this.inputNum === 2) ? 2 ** this.inputNum - this.inputNum : ret.length);

		for (let diagramRow = 0; diagramRow < singleDiagramRows; diagramRow++) {
			ret[diagramRow].row = this.buildRow(data, diagram, diagramRow, ret);
		}
		return ret;
	}

	/**
	 * Returns a row of the KV-diagram
	 * @param data
	 * @param {number} diagram
	 * @param {number} row
	 * @param {IKvDiagram[]} inputArray
	 * @returns {IKvDiagramCell[]}
	 */
	private buildRow(data: ISaneData, diagram: number, row: number, inputArray: IKvDiagram[]): IKvDiagramCell[] {
		const cellArray = [] as IKvDiagramCell[];
		const colNum = inputArray.length;
		for (let col = 0; col < colNum; col++) {
			const cell = {} as IKvDiagramCell;
			let bin: string = "";
			let lowBin: string = "";

			if (this.inputNum === 0) {
				lowBin = inputArray[col].x0.toString();
			} else if (this.inputNum === 1) {
				lowBin = inputArray[row].x1.toString() + inputArray[col].x0.toString();
			} else if (this.inputNum === 2) {
				lowBin =
					inputArray[row].x2.toString() + inputArray[col].x1.toString() +
					inputArray[col].x0.toString();
			} else {
				lowBin =
					inputArray[row].x3.toString() + inputArray[row].x2.toString() +
					inputArray[col].x1.toString() + inputArray[col].x0.toString();
			}

			if (diagram === 0) {
				bin = lowBin;
			} else if (diagram === 1) {
				bin = "1" + lowBin;
			} else if (diagram === 2) {
				bin = "10" + lowBin;
			} else {
				bin = "11" + lowBin;
			}
			cell.inputIndex = parseInt(bin, 2);
			if (!data.outputRows[cell.inputIndex].mask) {
				cell.value = "*";
			} else {
				cell.value = getBit(data.outputRows[cell.inputIndex].output, this.selectedOutput).toString();
			}
			cellArray.push(cell);
		}

		return cellArray;
	}

	/**
	 * Computes drawing parameters in order to minimize calculation overhead.
	 * Gets all minimization blocks.
	 * Calls drawBlock() for each block.
	 * @param {number} functionId
	 * @param kvDiagram
	 */
	private computeBlocks(functionId: number, kvDiagram: IKvDiagrams): void {
		// get variables required for drawing
		const element: any = this.shadowRoot!.querySelector("#cell0");
		let tdHeight: number = 0;
		let tdWidth: number = 0;
		if (element) {
			tdHeight = element.offsetHeight;
			tdWidth = element.offsetWidth;
		}
		const offsetX: number = (() => {
			if (this.inputNum === 0) {
				return 1;
			} else if (this.inputNum > 2) {
				return 3;
			} else {
				return 2;
			}
		})();
		const offsetY: number = (() => {
			if (this.inputNum === 0) {
				return 1;
			} else if (this.inputNum === 1) {
				return 2;
			} else {
				return 3;
			}
		})();
		const indexCoords = this.computeIndexCoordinates(kvDiagram) as IKvIndexArray[];

		// get block object
		try {
			const qmcSteps: IQmcSteps = getMinimalTerms(this.data, functionId, this.selectedMinType);
			let counter = 0;
			qmcSteps.solvedTable.body.forEach((block, index) => {
				if (block.usedInSolutions[this.selectedSolution]) {
					const colorStr: string = this.calcColor(counter);
					const radius: number = this.svgRadius(counter++, 1);

					this.drawBlock([...block.blockData], [...block.blockArray], indexCoords, tdHeight, tdWidth,
						offsetX, offsetY, colorStr, kvDiagram, radius);
				}
			});
		} catch (e) {
			this.notifySane(
				this.localizeSane("error-1001-1")
				+ e.eData.nr
				+ this.localizeSane("error-1001-2")
				+ e.eData.type
				+ this.localizeSane("error-1001-3"));
		}
	}

	/**
	 * Classification per block.
	 * @param {string[]} block
	 * @param blockIndices
	 * @param indexCoords
	 * @param {number} tdHeight
	 * @param {number} tdWidth
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @param colorStr
	 * @param kvDiagram
	 * @param radius
	 */
	// tslint:disable-next-line
	private drawBlock(block: string[], blockIndices: number[], indexCoords: IKvIndexArray[], tdHeight: number, tdWidth: number, offsetX: number, offsetY: number, colorStr: string, kvDiagram: IKvDiagrams, radius: number): void {
		// delete x6 if existing
		if (block.length === 7) {
			block.shift();
		}

		// create array paths which contains numbers identifying the svg elements where the block should be drawn on
		const paths: number[] = [];
		const helper: number[][] = [];
		for (let i = 0; i < block.length - 4; i++) {
			helper[i] = [];
			const index = block.length - 5 - i;
			if (block[index] === "-") {
				helper[i].push(0);
				helper[i].push(2 ** i);
			} else {
				helper[i].push(parseInt(block[index], 10) * 2 ** i);
			}
		}
		if (helper.length === 2) {
			helper[1].forEach((element1) => {
			helper[0].forEach((element0) => {
				paths.push(element1 + element0);
				});
			});
			// delete ternary values of x5 and x4
			block.splice(0, 2);
		} else if (helper.length === 1) {
			helper[0].forEach((element2) => {
				paths.push(element2);
			});
			// delete ternary value of x4
			block.shift();
		}
		if (paths.length === 0) {
			paths.push(0);
		}
		// block classification
		const xMax: number = this.output.kv0.length - 1;
		const yMax: number = ((this.inputNum === 0 || this.inputNum === 2) ?
								2 ** this.inputNum - this.inputNum : this.output.kv0.length) - 1;

		let rightLeftOpen: boolean = false;
		let topBottomOpen: boolean = false;
		if (block.length === 4 || block.length === 3) {
			const block0: string[] = block.splice(0, block.length - 2);
			const block1: string[] = block;
			if (block0.length === 2) {
				block0.forEach((elements, index) => {
					if (block0[index] === "-"
						&& block0[1 - index] === (kvDiagram.kv0[0]["x" + (2 + index).toString()]).toString()
						&& block0[1 - index] === (kvDiagram.kv0[yMax]["x" + (2 + index).toString()]).toString()) {

						topBottomOpen = true;
					}
				});
			}
			block1.forEach((elements, index) => {
				if (block1[index] === "-"
					&& block1[1 - index] === (kvDiagram.kv0[0]["x" + (index).toString()]).toString()
					&& block1[1 - index] === (kvDiagram.kv0[xMax]["x" + (index).toString()]).toString()) {

					rightLeftOpen = true;
				}
			});
		}
		if (rightLeftOpen && topBottomOpen) {
			this.drawRoundRectAllOpen(paths, tdHeight, tdWidth, 3, 3, 3, 3, colorStr, radius);
		} else if (rightLeftOpen) {
			this.drawRoundRectRightLeftOpen(paths, tdHeight, tdWidth, offsetX, offsetY, xMax, yMax,
				blockIndices, indexCoords, colorStr, radius);
		} else if (topBottomOpen) {
			this.drawRoundRectTopBottomOpen(paths, tdHeight, tdWidth, offsetX, offsetY, xMax, yMax,
				blockIndices, indexCoords, colorStr, radius);
		} else {
			this.drawRoundRectClosed(paths, tdHeight, tdWidth, offsetX, offsetY, xMax, yMax,
				blockIndices, indexCoords, colorStr, radius);
		}
	}

	/**
	 * Draws the special case if all edges are part of a block
	 * @param {number[]} paths
	 * @param {number} tdHeight
	 * @param {number} tdWidth
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @param {number} xMax
	 * @param {number} yMax
	 * @param {string} colorStr
	 * @param radius
	 */
	// tslint:disable-next-line
	private drawRoundRectAllOpen(paths: number[], tdHeight: number, tdWidth: number, offsetX: number, offsetY: number, xMax: number, yMax: number, colorStr: string, radius: number): void {
		const svgNum: number = paths.length;
		for (let i = 0; i < svgNum; i++) {

			// draw top left angle
			let x1: number = offsetX * tdWidth;
			let y1: number = offsetY * tdHeight;

			const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path1.setAttribute("stroke-width", "3");
			path1.setAttribute("stroke", colorStr);
			path1.setAttribute("fill", "none");

			let d: string = "";
			d += "M " + (x1 + radius) + " " + y1;
			d += " L " + (x1 + radius) + " " + (y1 + radius / 2);
			d += " Q " + (x1 + radius) + " " + (y1 + radius) + " " + (x1 + radius / 2) + " " + (y1 + radius);
			d += " L " + x1 + " " + (y1 + radius);
			path1.setAttribute("d", d);
			const svg = this.shadowRoot!.getElementById("svg" + paths[i].toString());
			if (svg) {
				svg.appendChild(path1);
			}

			// draw top right angle
			x1 = (offsetX + xMax + 1) * tdWidth;
			const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path2.setAttribute("stroke-width", "3");
			path2.setAttribute("stroke", colorStr);
			path2.setAttribute("fill", "none");

			d = "";
			d += "M " + (x1 - radius) + " " + y1;
			d += " L " + (x1 - radius) + " " + (y1 + radius / 2);
			d += " Q " + (x1 - radius) + " " + (y1 + radius) + " " + (x1 - radius / 2) + " " + (y1 + radius);
			d += " L " + x1 + " " + (y1 + radius);
			path2.setAttribute("d", d);
			if (svg) {
				svg.appendChild(path2);
			}

			// draw bottom right angle
			y1 = (offsetY + yMax + 1) * tdHeight;
			const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path3.setAttribute("stroke-width", "3");
			path3.setAttribute("stroke", colorStr);
			path3.setAttribute("fill", "none");

			d = "";
			d += "M " + x1 + " " + (y1 - radius);
			d += " L " + (x1 - radius / 2) + " " + (y1 - radius);
			d += " Q " + (x1 - radius) + " " + (y1 - radius) + " " + (x1 - radius) + " " + (y1 - radius / 2);
			d += " L " + (x1 - radius) + " " + (y1 + radius);
			path3.setAttribute("d", d);
			if (svg) {
				svg.appendChild(path3);
			}

			// draw bottom left angle
			x1 = offsetX * tdWidth;
			const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path4.setAttribute("stroke-width", "3");
			path4.setAttribute("stroke", colorStr);
			path4.setAttribute("fill", "none");

			d = "";
			d += "M " + x1 + " " + (y1 - radius);
			d += " L " + (x1 + radius / 2) + " " + (y1 - radius);
			d += " Q " + (x1 + radius) + " " + (y1 - radius) + " " + (x1 + radius) + " " + (y1 - radius / 2);
			d += " L " + (x1 + radius) + " " + y1;
			path4.setAttribute("d", d);
			if (svg) {
				svg.appendChild(path4);
			}
		}
	}

	/**
	 * Draws two halfs of a round rectangle in color of "colorStr".
	 * @param {number[]} paths
	 * @param {number} tdHeight
	 * @param {number} tdWidth
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @param {number} xMax
	 * @param {number} yMax
	 * @param {number[]} blockIndices
	 * @param {IKvIndexArray[]} indexCoords
	 * @param {string} colorStr
	 */
	// tslint:disable-next-line
	private drawRoundRectRightLeftOpen(paths: number[], tdHeight: number, tdWidth: number, offsetX: number, offsetY: number, xMax: number, yMax: number, blockIndices: number[], indexCoords: IKvIndexArray[], colorStr: string, radius: number) {
		// get (x0,y0) - starting cell - and (xm,ym) - cell bottom right
		const x0: number = xMax;
		const xm: number = 0;
		let y0: number = yMax;
		let ym: number = 0;
		for (const index of blockIndices) {
			const cell: IKvIndexArray = indexCoords[index];
			if (cell.y < y0) {
				y0 = cell.y;
			}
			if (cell.y > ym) {
				ym = cell.y;
			}
		}

		const y1: number = (offsetY + y0 + 1) * tdHeight - radius;  			// top border
		const y2: number = (offsetY + ym) * tdHeight + radius;					// bot border
		const x1: number = (offsetX + x0 + 1) * tdWidth;						// start for right half
		const x2: number = (offsetX + xm) * tdWidth;							// start for left half
		const svgNum: number = paths.length;
		for (let i = 0; i < svgNum; i++) {

			// draw left side
			const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path1.setAttribute("stroke-width", "3");
			path1.setAttribute("stroke", colorStr);
			path1.setAttribute("fill", "none");

			let d: string = "";
			d += "M " + x2 + " " + y1;
			d += " L " + (x2 + 3 * radius / 4) + " " + y1;
			d += " Q " + (x2 + radius) + " " + y1 + " " + (x2 + radius) + " " + (y1 + radius / 4);
			d += " L " + (x2 + radius) + " " + (y2 - radius / 4);
			d += " Q " + (x2 + radius) + " " + y2 + " " + (x2 + 3 * radius / 4) + " " + y2;
			d += " L " + x2 + " " + y2;
			path1.setAttribute("d", d);
			const svg = this.shadowRoot!.getElementById("svg" + paths[i].toString());
			if (svg) {
				svg.appendChild(path1);
			}
			// draw right side
			const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path2.setAttribute("stroke-width", "3");
			path2.setAttribute("stroke", colorStr);
			path2.setAttribute("fill", "none");

			d = "";
			d += "M " + x1 + " " + y1;
			d += " L " + (x1 - 3 * radius / 4) + " " + y1;
			d += " Q " + (x1 - radius) + " " + y1 + " " + (x1 - radius) + " " + (y1 + radius / 4);
			d += " L " + (x1 - radius) + " " + (y2 - radius / 4);
			d += " Q " + (x1 - radius) + " " + y2 + " " + (x1 - 3 * radius / 4) + " " + y2;
			d += " L " + x1 + " " + y2;
			path2.setAttribute("d", d);
			if (svg) {
				svg.appendChild(path2);
			}
		}
	}

	/**
	 * Draws two halfs of a round rectangle in color of "colorStr".
	 * @param {number[]} paths
	 * @param {number} tdHeight
	 * @param {number} tdWidth
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @param {number} xMax
	 * @param {number} yMax
	 * @param {number[]} blockIndices
	 * @param {IKvIndexArray[]} indexCoords
	 * @param {string} colorStr
	 * @param radius
	 */
	// tslint:disable-next-line
	private drawRoundRectTopBottomOpen(paths: number[], tdHeight: number, tdWidth: number, offsetX: number, offsetY: number, xMax: number, yMax: number, blockIndices: number[], indexCoords: IKvIndexArray[], colorStr: string, radius: number) {
		// get (x0,y0) - starting cell - and (xm,ym) - cell bottom right
		let x0: number = xMax;
		let xm: number = 0;
		const y0: number = yMax;
		const ym: number = 0;
		for (const index of blockIndices) {
			const cell: IKvIndexArray = indexCoords[index];
			if (cell.x < x0) {
				x0 = cell.x;
			}
			if (cell.x > xm) {
				xm = cell.x;
			}
		}

		const y1: number = (offsetY + y0 + 1) * tdHeight;  					// y-start for bottom half
		const y2: number = (offsetY + ym) * tdHeight;							// y-start for top half
		const x1: number = (offsetX + x0 + 1) * tdWidth - radius;				// start for right half
		const x2: number = (offsetX + xm) * tdWidth + radius;					// start for left half
		const svgNum: number = paths.length;
		for (let i = 0; i < svgNum; i++) {

			// draw top side
			const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path1.setAttribute("stroke-width", "3");
			path1.setAttribute("stroke", colorStr);
			path1.setAttribute("fill", "none");

			let d: string = "";
			d += "M " + x1 + " " + y2;
			d += " L " + x1 + " " + (y2 + 3 * radius / 4);
			d += " Q " + x1 + " " + (y2 + radius) + " " + (x1 + radius / 4) + " " + (y2 + radius);
			d += " L " + (x2 - radius / 4) + " " + (y2 + radius);
			d += " Q " + x2 + " " + (y2 + radius) + " " + x2 + " " + (y2 + 3 * radius / 4);
			d += " L " + x2 + " " + y2;
			path1.setAttribute("d", d);
			const svg = this.shadowRoot!.getElementById("svg" + paths[i].toString());
			if (svg) {
				svg.appendChild(path1);
			}

			// draw bottom side
			const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path2.setAttribute("stroke-width", "3");
			path2.setAttribute("stroke", colorStr);
			path2.setAttribute("fill", "none");

			d = "";
			d += "M " + x1 + " " + y1;
			d += " L " + x1 + " " + (y1 - 3 * radius / 4);
			d += " Q " + x1 + " " + (y1 - radius) + " " + (x1 + radius / 4) + " " + (y1 - radius);
			d += " L " + (x2 - radius / 4) + " " + (y1 - radius);
			d += " Q " + x2 + " " + (y1 - radius) + " " + x2 + " " + (y1 - 3 * radius / 4);
			d += " L " + x2  + " " + y1;
			path2.setAttribute("d", d);
			if (svg) {
				svg.appendChild(path2);
			}
		}
	}

	/**
	 * Draws a round rectangle in color of "colorStr".
	 * @param {number[]} paths
	 * @param {number} tdHeight
	 * @param {number} tdWidth
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @param {number} xMax
	 * @param {number} yMax
	 * @param {number[]} blockIndices
	 * @param {IKvIndexArray[]} indexCoords
	 * @param {string} colorStr
	 * @param radius
	 */
	// tslint:disable-next-line
	private drawRoundRectClosed(paths: number[], tdHeight: number, tdWidth: number, offsetX: number, offsetY: number, xMax: number, yMax: number, blockIndices: number[], indexCoords: IKvIndexArray[], colorStr: string, radius: number) {
		// get (x0,y0) - starting cell - and (xm,ym) - cell bottom right
		let x0: number = xMax;
		let xm: number = 0;
		let y0: number = yMax;
		let ym: number = 0;
		for (const index of blockIndices) {
			const cell: IKvIndexArray = indexCoords[index];
			if (cell.x < x0) {
				x0 = cell.x;
			}
			if (cell.y < y0) {
				y0 = cell.y;
			}
			if (cell.x > xm) {
				xm = cell.x;
			}
			if (cell.y > ym) {
				ym = cell.y;
			}
		}
		// define orientation points
		const x1: number = (offsetX + x0 + 1) * tdWidth - radius;
		const x2: number = (offsetX + xm) * tdWidth + radius;
		const y1: number = (offsetY + y0 + 1) * tdHeight - radius;
		const y2: number = (offsetY + ym) * tdHeight + radius;
		const svgNum: number = paths.length;
		for (let i = 0; i < svgNum; i++) {

			const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path1.setAttribute("stroke-width", "3");
			path1.setAttribute("stroke", colorStr);
			path1.setAttribute("fill", "none");

			let d: string = "";
			d += "M " + x1 + " " + (y1 + radius / 4);
			d += " Q " + x1 + " " + y1 + " " + (x1 + radius / 4) + " " + y1;
			d += " L " + (x2 - radius / 4) + " " + y1;
			d += " Q " + x2 + " " + y1 + " " + x2 + " " + (y1 + radius / 4);
			d += " L " + x2 + " " + (y2 - radius / 4);
			d += " Q " + x2 + " " + y2 + " " + (x2 - radius / 4) + " " + y2;
			d += " L " + (x1 + radius / 4) + " " + y2;
			d += " Q " + x1 + " " + y2 + " " + x1 + " " + (y2 - radius / 4);
			d += " L " + x1 + " " + (y1 + radius / 4);
			path1.setAttribute("d", d);
			const svg = this.shadowRoot!.getElementById("svg" + paths[i].toString());
			if (svg) {
				svg.appendChild(path1);
			}
		}
	}
	/**
	 * Computes coordinates of cell indices per KV-Diagram
	 * @param {IKvDiagrams} kvDiagram
	 * @returns {IKvIndexArray[]}
	 */
	private computeIndexCoordinates(kvDiagram: IKvDiagrams): IKvIndexArray[] {
		const ret: IKvIndexArray[] = Array(2 ** (this.inputNum + 1));
		const diagramNum: number = (this.inputNum > 3 ? 2 ** (this.inputNum - 3) : 1);
		const singleDiagramRows =
			((this.inputNum === 0 || this.inputNum === 2) ? 2 ** this.inputNum - this.inputNum : kvDiagram.kv0.length);
		for (let diagramIndex = 0; diagramIndex < diagramNum; diagramIndex++) {
			const diagram: IKvDiagram[] = kvDiagram["kv" + diagramIndex.toString()];

			for (let diagramRowIndex = 0; diagramRowIndex < singleDiagramRows; diagramRowIndex++) {
				const diagramRow: IKvDiagram = diagram[diagramRowIndex];

				for (let col = 0; col < diagram.length; col++) {
					const index: number = diagramRow.row[col].inputIndex;
					ret[index] = {
						x: col,
						y: diagramRowIndex,
					};
				}
			}
		}
		return ret;
	}

	/**
	 * Creates a ternary of an block filled with indices.
	 * @param {number[]} block
	 * @returns {string[]}
	 */
	private getTernary(block: number[]): string[] {
		const ternaryValue: string[] = Array(this.inputNum + 1);
		ternaryValue.fill("0");
		const firstIndex: string = block[0].toString(2);
		for (let i = 0; i < firstIndex.length; i++) {
			ternaryValue[ternaryValue.length - i - 1] = (firstIndex.charAt(firstIndex.length - i - 1));
		}
		if (block.length > 1) {
			for (let i = 1; i < block.length; ++i) {
				let indexBin: string = block[i].toString(2);
				let diff: number = this.inputNum + 1 - indexBin.length;
				// fill up with "0", would be way smoother with string.padStart
				for (diff ; diff > 0; diff--) {
					indexBin = "0" + indexBin;
				}
				for (let j = 0; j < indexBin.length; j++) {
					const ternaryPos: number = ternaryValue.length - 1 - j;
					const indexPos: number = indexBin.length - 1 - j;
					if (ternaryValue[ternaryPos] !== indexBin.charAt(indexPos)) {
						ternaryValue[ternaryPos] = "-";
					}
				}
			}
		}
		return ternaryValue;
	}

	/**
	 * Checks if all cells with value 1 or 0 (depending on minimization type) are part of this.ownBlocks
	 * @param blocks
	 * @param {number} minimizeOver
	 * @returns {boolean}
	 */
	private checkFullMinimization(blocks: number[][], minimizeOver: number): boolean {
		// count all binaries of SaneData that are equal to minimizeOver and not member of
		let counter: number = 0;
		for (let i = 0; i < 2 ** this.data.nInputColumns; i++) {
			const outputRow: ISaneDataRow = this.data.outputRows[i];
			if (outputRow.mask && getBit(outputRow.output, this.selectedOutput) === minimizeOver) {
				counter++;
			}
		}
		const requiredIndices: number[] = [];
		// get an Array of input indices with no duplicates and no member of h*
		for (const block of blocks) {
			for (const rowIndex of block) {
				// member of h*? member of already generated Array?
				if (this.data.outputRows[rowIndex].mask && requiredIndices.indexOf(rowIndex) === -1) {
					requiredIndices.push(rowIndex);
				}
			}
		}
		return requiredIndices.length === counter;
	}

	/**
	 * Creates an IMinTable object out of an array of index blocks in order to create a minimal string out
	 * of blocks.
	 * @param blocks
	 * @param {ternary[][]} ternaryValue
	 * @returns {string}
	 */
	private getExpression(blocks: number[][], ternaryValue: ternary[][]): string {
		const solvedTable = {} as IMinTable;
		solvedTable.head = [];

		const body = [] as IMinTableBlock[];

		for (let i = 0; i < blocks.length; i++) {
			const elem = {} as IMinTableBlock;
			elem.blockArray = blocks[i];
			elem.blockData = ternaryValue[i];
			elem.blockString = blocks[i].toString();
			elem.indexName = i;
			elem.isEssential = true;
			elem.list = [[2]];
			elem.usedInSolutions = [true];
			body.push(elem);
		}
		solvedTable.body = body;
		// get manual minimization type
		let manualMinType: minType = "dnf";
		switch (this.minimizeOver) {
			case "0": manualMinType = "knf"; break;
			case "1": manualMinType = "dnf"; break;
		}
		const minTrees = makeTreesFromMin(solvedTable, manualMinType);
		return makeLaTeXFromExpTree(minTrees[0]);
	}

	/**
	 * Gives back 4 different radii depending on counter.
	 * @param {number} counter
	 * @param {number} stepWidth
	 * @param {number} minRadius
	 * @returns {number}
	 */
	private svgRadius(counter: number, stepWidth: number, minRadius: number = 32): number {
		return (minRadius + stepWidth * (counter % 4));
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneKvDiagram.is, SaneKvDiagram);
