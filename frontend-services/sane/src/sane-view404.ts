import { AppLocalizeMixin } from "./custom-type-base-lib.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

class SaneView404 extends AppLocalizeMixin() {
	static get template() {
		return html`
			<style include="shared-styles">
				:host {
					display: block;
					padding: 10px 20px;
				}
			</style>

			<div class="card">
				<div class="card-header">
					<div class="circle">
						<iron-icon icon="icons:highlight-off"></iron-icon>
					</div>
					<h1 class="view-name">[[localize('error-404-1')]]</h1>
				</div>
				<div class="card-body">
					<p>[[localize('error-404-2')]]</p>
					<p><a href="[[rootPath]]">[[localize('error-404-3')]]</a></p>
				</div>
			</div>
		`;
	}

	static get is() {
		return "sane-view404";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}

	static get properties() {
		return {
			rootPath: String,
		};
	}
}

customElements.define(SaneView404.is, SaneView404);
