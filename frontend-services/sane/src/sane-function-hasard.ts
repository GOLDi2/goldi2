import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { EventMixin } from "./eventlib.js";

/**
 * Class for the function hasard view
 */
class SaneFunctionHasard extends EventMixin(PolymerElement) {
	static get template() {
		return html`
			<style include="shared-styles">
				:host {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					position: center;
					min-height: 1rem;
					min-width: 1.3rem;
					padding: 0.3rem;
					margin: 0.1rem;
					border-radius: 2px;
					color: white;
					font-weight: bold;
					user-select: none;
					-webkit-user-select: none;  /* Chrome all / Safari all */
					-moz-user-select: none;     /* Firefox all */
					-ms-user-select: none;      /* IE 10+ */
				}
			</style>
		`;
	}
	private neighbors = [
		[8, 1, 4, 2],
		[9, 3, 5, 0],
		[10, 0, 6, 3],
		[11, 2, 7, 1],
		[0, 5, 12, 6],
		[1, 7, 13, 4],
		[2, 4, 14, 7],
		[3, 6, 15, 5],
		[12, 9, 0, 10],
		[13, 11, 1, 8],
		[14, 8, 2, 11],
		[15, 10, 3, 9],
		[4, 13, 8, 14],
		[5, 15, 9, 12],
		[6, 12, 10, 15],
		[7, 14, 11, 13],
	];
	private functionHasards = Array;
	private data: any;
	constructor() {
		super();
	}
	static get is() {
		return "sane-function-hasard";
	}

	public ready() {
		super.ready();
	}
}

customElements.define(SaneFunctionHasard.is, SaneFunctionHasard);
