/*
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import "./sane-truth-table.js";

import { html } from "@polymer/polymer/polymer-element.js";
import { AppLocalizeMixin } from "./custom-type-base-lib.js";

class SaneView1 extends AppLocalizeMixin() {
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
					<div class="circle"><iron-icon icon="editor:format-list-numbered"></iron-icon></div>
					<h1 class="view-name">[[localize('title-TT')]]</h1>
				</div>
				<div class="card-body">
					<sane-truth-table data=[[data]] language=[[language]]></sane-truth-table>
				</div>
			</div>
		`;
	}

	static get is() {
		return "sane-view1";
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"), null, null);
	}
}

customElements.define(SaneView1.is, SaneView1);
