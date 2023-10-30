import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { expressionTree, makeLaTeXFromExpTree, makeStringFromExpTree } from "./qmclib.js";
import { ISaneDataCharSet } from "./sane-data.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { EventMixin } from "./eventlib.js";
import { SaneMath } from "./sane-math-mixin.js";
import expressionParser from "./sane-expression-parser.js";

class SaneEquationInput extends SaneMath(EventMixin(AppLocalizeMixin())) {
	static get template() {
		return html`
			<style include="shared-styles">
				.label {
					margin-right: 0.4em;
					width: var(--sane-equation-input-label-width, 6em)!important;
				}

				.hovswitch {
					padding: 0;
					display: flex;
					align-items: center;
					align-content: stretch;
				}

				:host, * {
					outline: none!important;
				}

				.latexequation,
				.hovertrue:hover .originalequation {
					display: block;
					width: 100%;
				}

				.originalequation,
				.hovertrue:hover .latexequation {
					display: none;
					width: 100%;
				}
			</style>

			<paper-item id="equationpaperitem" class$="hovswitch hover[[hover]]">
				<span class="label">[[description]]</span>&nbsp;<span class="latexequation" tabIndex="-1" disabled id="mathoutput"></span>
				<paper-input class="originalequation" readonly=[[readonly]] label="[[plainPrune(lhs)]] =" value="[[makeValueString(tree, charSet)]]" on-change="handleNewEquation"></paper-input>
			</paper-item>
		`;
	}
	static get is() { return "sane-equation-input"; }
	static get properties() {
		return {
			charSet: Object,	// ISaneDataCharSet, used for plaintext output
			description: String,	// prepended to the output
			hover: Boolean,	// left-hand side of equation, without =
			lhs: String,	// left-hand side of equation, without =
			readonly: Boolean,	// sets the plaintext field as readonly
			teXString: {	// the TeX math string produced from the tree
				computed: "makeValueTeX(tree, lhs)",
				observer: "teXChanged",
				type: String,
			},
			tree: Object,	// the expressionTree to build string from
		};
	}

	// @ts-ignore: charSet is actually set via data-binding
	public charSet: ISaneDataCharSet;
	// @ts-ignore: tree is actually set via data-binding
	public tree: expressionTree;
	public lhs: string = "";
	private lastInputString: string = "";
	private lastInputFunctionIndex: string = "";
	private ourChangeFlag: boolean = false;

	public ready() {
		super.ready();
	}

	public setFocus() {
		const equationpaperitem = (this.$.equationpaperitem as HTMLElement);
		equationpaperitem.focus();
	}

	/**
	 * Builds the plaintext string out of the tree.
	 * @param tree {expressionTree}
	 * @param charSet {ISaneDataCharSet}
	 */
	private makeValueString(tree: expressionTree, charSet: ISaneDataCharSet) {
		if (this.ourChangeFlag) {
			this.ourChangeFlag = false;
			return;
		}
		return makeStringFromExpTree(tree, charSet);
	}

	/**
	 * Builds the LaTeX math string out of the tree.
	 * @param tree {expressionTree}
	 * @param lhs {string} Left-hand side of equation
	 */
	private makeValueTeX(tree: expressionTree, lhs: string) {
		if (this.ourChangeFlag) {
			this.ourChangeFlag = false;
			return;
		}
		return this.lhs + " = " + makeLaTeXFromExpTree(tree);
	}

	/**
	 * Lets MathJax typeset the newly computed TeX string.
	 * @param newString The new TeX string
	 */
	private teXChanged(newString: string) {
		this.typeset(this.$.mathoutput as HTMLElement, newString);
	}

	/**
	 * Removes unwanted symbols in lhs.
	 * @param lhs left-hand side
	 */
	private plainPrune(lhs: string): string {
		return lhs.replace("_", "");
	}

	private handleNewEquation(e: CustomEvent) {
		// get paper-input value property (user input string)
		// @ts-ignore: composedPath exists on CustomEvent
		const inputel = e.composedPath()[0] as PaperInputElement;
		const userRawInput = inputel.value!.toString();
		this.lastInputString = userRawInput;

		// parse input string to expression tree
		let expTree: expressionTree;
		try {
			expTree = expressionParser.parse(userRawInput, {}, this.charSet); // call parser in js file
			// clear error text if parsing was successful
			inputel.errorMessage = "";
			this.dispatchEvent(new CustomEvent("sane-equation-input-changed", {
				bubbles: true,
				// @ts-ignore
				composed: true,
				detail: { tree: expTree },
			}));
			this.tree = expTree;
		} catch (e) {
			console.error(e);
			let msg: string = e.message.toString();
			// localize error manually
			if (this.language === "de") {
				msg = msg.replace("Found", "");
				msg = msg.replace("but expected", "wurde gefunden, aber");
				msg = msg.replace(".", "");
				msg = msg.replace("end of input", "Ende des Ausdrucks");
				msg = msg.replace("or", "oder");
				msg += " erwartet.";
			}
			// set error text to parser error
			inputel.errorMessage = msg;
			return;
		}
	}
}

customElements.define(SaneEquationInput.is, SaneEquationInput);

export {
	SaneEquationInput,
};
