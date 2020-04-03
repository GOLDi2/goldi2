import "./sane-function-hasard";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView8 extends AppLocalizeMixin() {
	static get template() {
		return html`
			<style include="shared-styles">
				:host {
					display: block;
					padding: 10px;
				}
			</style>

			<div class="card">
				<div class="card-header">
					<div class="circle">
						<iron-icon icon="image:transform"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('title-FH')]]</h1>
				</div>
				<div class="card-body">
					<sane-function-hasard data="[[data]]" language="[[language]]"></sane-function-hasard>
				</div>
			</div>
		`;
	}
	static get is() {
		return "sane-view8";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView8.is, SaneView8);
