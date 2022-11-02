import "./sane-qmc-table";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView6 extends AppLocalizeMixin() {
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
						<iron-icon icon="icons:line-style"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('title-QMC')]]</h1>
				</div>
				<div class="card-body">
					<sane-qmc-table data="[[data]]" language="[[language]]"></sane-qmc-table>
				</div>
			</div>
		`;
	}
	static get is() {
		return "sane-view6";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView6.is, SaneView6);
