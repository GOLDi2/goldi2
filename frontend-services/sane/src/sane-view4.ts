import "./sane-expression";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView4 extends AppLocalizeMixin() {
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
						<iron-icon icon="icons:sort"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('title-BAA')]]</h1>
				</div>
				<div class="card-body">
					<sane-expression data="[[data]]" language="[[language]]"></sane-expression>
				</div>
			</div>
		`;
	}
	static get is() {
		return "sane-view4";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView4.is, SaneView4);
