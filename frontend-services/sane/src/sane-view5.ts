import "./sane-function-index";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView5 extends AppLocalizeMixin() {
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
						<iron-icon icon="editor:format-size"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('title-FI')]]</h1>
				</div>
				<div class="card-body">
					<sane-function-index data=[[data]] language="[[language]]"></sane-function-index>
				</div>
			</div>
		`;
	}
	static get is() {
		return "sane-view5";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView5.is, SaneView5);
