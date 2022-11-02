import "./sane-all-functions";

import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView7 extends AppLocalizeMixin() {
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
						<iron-icon icon="editor:format-line-spacing"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('title-AF')]]</h1>
				</div>
				<div class="card-body">
					<sane-all-functions data="[[data]]" language="[[language]]"></sane-all-functions>
				</div>
			</div>
		`;
	}
	static get is() {
		return "sane-view7";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView7.is, SaneView7);
