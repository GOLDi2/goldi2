/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { setRootPath } from "@polymer/polymer/lib/utils/settings.js";
setRootPath("/SANE/");

import "@polymer/iron-media-query/iron-media-query";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-tabs/paper-tabs";
import "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/app-layout/app-drawer-layout/app-drawer-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-scroll-effects/app-scroll-effects";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/app-localize-behavior/app-localize-behavior";
import "@polymer/app-route/app-location";
import "@polymer/app-route/app-route";
import "@polymer/iron-pages/iron-pages";
import "@polymer/app-layout/app-layout";
import "@polymer/app-layout/app-scroll-effects/effects/waterfall";
import "@polymer/iron-icon/iron-icon";
import "@polymer/iron-icons/iron-icons";
import "@polymer/iron-icons/editor-icons";
import "@polymer/iron-icons/image-icons";

import "./shared-styles";

import "./eventlib";
import "./custom-type-base-lib";
import "./sane-math-mixin";
import "./sane-data";
import "./sane-notification";
import "./my-icons";
import "./sane-settings";
import { checkSCBlockedFeatures, checkSCViews, setStartConfig, startConfiguration } from "./startconfiglib";

import "./sane-view1";
import "./sane-view3";
import "./sane-view4";
import "./sane-view5";
import "./sane-view6";
import "./sane-view7";
import "./sane-view8";
import "./sane-view404";

import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class";
import { AppLocalizeBehavior } from "@polymer/app-localize-behavior/app-localize-behavior.js";
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { setPassiveTouchGestures } from "@polymer/polymer/lib/utils/settings";

class SaneApp extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
	static get template() {
		return html`
			<style>
				:host {
					--sane-light-primary-color: #075363;
					--sane-light-secondary-color: #043b47;
					--sane-light-bright-logo-color: #3278a1;
					--sane-light-card-background-color: #fff;
					--sane-light-card-header-backgorund-color: #fefefe;
					--sane-light-card-header-shadow: inset 0px -5px 5px -5px rgba(0, 0, 0, 0.2);;
					--sane-light-dialog-background-color: #fff;
					--sane-light-card-font-color: #111;
					--sane-light-background-color: #eee;
					--sane-light-divider-color: #ddd;
					--sane-light-tt-divider-color: var(--sane-light-primary-color);
					--sane-light-hover-background-color: #ccc;
					--sane-light-highlighted-input-color: rgba(0, 0, 0, 0.05);
					--sane-light-dv-menu-border-color: #000;
					--sane-light-dv-menu-gradient-color: #FFFFFF20;
					--sane-light-dv-menu-font-color: #eee;
					--sane-light-alert-color: rgb(255, 0, 0);

					--sane-dark-primary-color: #043b47;
					--sane-dark-secondary-color: #0988a4;
					--sane-dark-bright-logo-color: #3278a1;
					--sane-dark-card-background-color: #333;
					--sane-dark-card-header-backgorund-color: #383838;
					--sane-dark-card-header-shadow: inset 0px -20px 20px -20px rgba(255, 255, 255, 0.17);;
					--sane-dark-dialog-background-color: var(--sane-dark-background-color);
					--sane-dark-card-font-color: #eee;
					--sane-dark-background-color: #666;
					--sane-dark-divider-color: #ccc;
					--sane-dark-tt-divider-color: #eee;
					--sane-dark-hover-background-color: #cccccc55;
					--sane-dark-highlighted-input-color: rgba(0, 0, 0, 0.15);
					--sane-dark-dv-menu-border-color: var(--sane-dark-background-color);
					--sane-dark-dv-menu-gradient-color: transparent;
					--sane-dark-dv-menu-font-color: var(--sane-dark-card-font-color);
					--sane-dark-alert-color: rgb(255, 90, 90);

					--sane-hover-background-color: #ccc;
					--sane-divider-color: #ddd;

					--app-primary-color: var(--sane-light-primary-color);
					--app-secondary-color: var(--sane-light-secondary-color);
					--app-bright-logo-color: var(--sane-light-bright-logo-color);
					--app-background-color: var(--sane-light-background-color);
					--app-card-background-color: var(--sane-light-card-background-color);
					--app-card-header-background-color: var(--sane-light-card-header-backgorund-color);
					--app-card-header-shadow: var(--sane-light-card-header-shadow);
					--app-dialog-background-color: var(--sane-light-dialog-background-color);
					--app-card-font-color: var(--sane-light-card-font-color);
					--app-divider-color: var(--sane-light-divider-color);
					--app-tt-divider-color: var(--sane-light-tt-divider-color);
					--app-highlighted-input-color: var(--sane-light-highlighted-input-color);
					--app-dv-menu-border-color: var(--sane-light-dv-menu-border-color);
					--app-dv-menu-gradient-color: var(--sane-light-dv-menu-gradient-color);
					--app-dv-menu-font-color: var(--sane-light-dv-menu-font-color);
					--app-alert-color: var(--sane-light-alert-color);
					--app-drawer-content-container: {
						background: var(--app-card-background-color);
					};
					display: block;
				}
				/* hidden property to hide layout parts */
				[hidden] {
					display: none !important;
				}
				/* hides the mobile drawer */
				app-drawer-layout:not([narrow]) [drawer-toggle] {
					display: none;
				}
				/* header-color */
				app-header {
					background-color: var(--app-primary-color);
					color: #fff;
				}
				/*adjust sane-logo*/
				#header-logo {
					height: 100%;
					width: auto;
					margin-right: 5px;
					margin-left: 5px;
					filter: drop-shadow(1px 1px 0 black)
					drop-shadow(-1px -1px 0 black);
				}
				.iron-selected {
					background-color: var(--app-background-color);
				}
				iron-selector a {
					background: var(--app-card-background-color);
					color: var(--app-card-font-color) !important;
				}
				#drawer app-toolbar {
					background: var(--app-card-background-color);
					color: var(--app-card-font-color);
				}
				#drawer div {
					background: var(--app-card-background-color);
					color: var(--app-card-font-color);
					overflow: auto;
				}
				#settingsSv {
					color: var(--app-card-font-color) !important;
				}
				/* style dual view */
				.dv-menu {
					padding: 2px 0 2px 0;
				}
				.dv-menu-text iron-icon-button {
					padding-left: 2%;
					padding-right: 2%;
				}
				/* style dv-view selector */
				.dv-menu paper-listbox {
					overflow: hidden;
					padding: 0;
					background: var(--app-primary-color);
				}
				b {
					font-weight: 500;
				}
				/* style dv-menu items */
				.dv-menu paper-listbox paper-item {
					color: var(--app-dv-menu-font-color);
					float: left;
					border: 0.5px solid var(--app-dv-menu-border-color);
					padding-left: 10px;
					padding-right: 10px;
					margin-left: 2px;
					margin-right: 2px;
					font-size: 16px;
					cursor: pointer;
				}
				/* displays dual views as table */
				#view-wrapper {
					display: table;
					table-layout: fixed;
					width: 100%;
					height: 100%;
				}
				#view-wrapper iron-pages {
					display: table-cell;
				}
				/* style dv-menu-items => 2 divs for left- and right-selection and an overlaying text*/
				.dv-menu-text {
					text-align: center;
					position: relative;
					z-index: 0;
				}
				.left-button {
					display: inline-block;
					position: absolute;
					width: 50%;
					height: 100%;
					left: 0;
					z-index: 1;
				}
				.right-button {
					display: inline-block;
					position: absolute;
					width: 50%;
					height: 100%;
					right: 0;
					z-index: 1;
				}
				/* style selection */
				.left-button:hover, .selected-left {
					background: linear-gradient(to left, transparent , var(--app-dv-menu-gradient-color));
					/*border: 2px solid transparent;
					border-image: linear-gradient(to right, #FFFFFFDD, transparent) 1;
					border-right: none !important;*/
					border-top: 1.5px solid white;
					border-bottom: 1.5px solid white;
					border-left: 1.5px solid white;
				}
				.right-button:hover, .selected-right {
					background: linear-gradient(to right, transparent , var(--app-dv-menu-gradient-color));
					/*border: 2px solid transparent;
					border-image: linear-gradient(to right, transparent, #FFFFFFDD) 1;
					border-left: none !important;*/
					border-top: 1.5px solid white;
					border-bottom: 1.5px solid white;
					border-right: 1.5px solid white;
				}
				/* make settings font unselectable */
				sane-settings {
					pointer-events: none;
					user-select: none;
					cursor: pointer;
				}
				/* style single view drawer */
				.drawer-list {
					margin: 0 20px;
				}

				.drawer-list a {
					display: block;
					padding: 0 16px;
					line-height: 40px;
					text-decoration: none;
					color: black;
				}

				.drawer-list a.iron-selected {
					color: var(--app-primary-color);
					background-color: var(--app-background-color);
					font-weight: bold;
				}

				.drawer-list div {
					cursor: pointer;
				}

				.drawer-list sane-settings {
					display: block;
					padding: 0 16px;
					line-height: 40px;
					text-decoration: none;
					cursor: pointer;
				}
			</style>


			<app-location
					route="{{route}}"
					url-space-regex="^[[rootPath]]">
			</app-location>

			<button id="xyz" value="[[rootPath]]"></button>

			<app-route
					route="{{route}}"
					pattern="[[rootPath]]:page"
					data="{{routeData}}"
					tail="{{subroute}}">
			</app-route>
			<sane-data id="data" data="{{sanedata}}" language="[[language]]"></sane-data>

			<app-drawer-layout fullbleed force-narrow="[[wideLayout]]">

				<app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
					<app-toolbar hidden="[[wideLayout]]">[[localize('title-menu')]]</app-toolbar>
					<div>
						<!-- single view nav: side nav menu -->
						<iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
							<a id="sv_menu_1" name="view1" href="[[rootPath]]view1" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="image:blur-linear"></iron-icon> [[localize('title-TT')]]</a>
							<a id="sv_menu_7" name="view7" href="[[rootPath]]view7" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="editor:format-list-numbered"></iron-icon> [[localize('title-AF')]]</a>
							<!--<a id="sv_menu_2" name="view2" href="[[rootPath]]view2" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="image:adjust"></iron-icon> [[localize('title-BMA')]]</a>-->
							<a id="sv_menu_3" name="view3" href="[[rootPath]]view3" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="image:filter-none"></iron-icon> [[localize('title-KV')]]</a>
							<a id="sv_menu_4" name="view4" href="[[rootPath]]view4" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="icons:sort"></iron-icon> [[localize('title-BAA')]]</a>
							<a id="sv_menu_5" name="view5" href="[[rootPath]]view5" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="editor:format-size"></iron-icon> [[localize('title-FI')]]</a>
							<a id="sv_menu_6" name="view6" href="[[rootPath]]view6" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="icons:line-style"></iron-icon> [[localize('title-QMC')]]</a>
							<!--<a id="sv_menu_8" name="view8" href="[[rootPath]]view8" on-click="markSvSelection">
							<iron-icon class="drawer-icon" icon="icons:line-style"></iron-icon> [[localize('title-FH')]]</a>-->
							<hr/>
							<div on-click="onSettingsClick" id="settingsSv">
								<sane-settings name="settings" bottom-item language="[[language]]" data="[[sanedata]]" has-name></sane-settings>
							</div>
							<!--#contentContainer not editable in css ToDO: fix-->
						</iron-selector>
					</div>
				</app-drawer>

				<app-header-layout has-scrolling-region>
					<!-- single view nav: narrow layout menu button-->
					<app-header slot="header" condenses reveals effects="waterfall">
						<app-toolbar>
							<paper-icon-button class="menu-button" icon="menu" drawer-toggle hidden="[[wideLayout]]"></paper-icon-button>
							<div main-title hidden="[[wideLayout]]">SANE</div>
						</app-toolbar>
					</app-header>
					<!-- dual-view nav: header nav menu-->
					<app-header slot="header" condenses reveals effects="waterfall">
						<app-toolbar class="dv-menu" hidden="[[!wideLayout]]">
							<img id="header-logo" src="images/sane_logo_64.png">
							<paper-listbox selected="[[page]]" attr-for-selected="name">
								<paper-item id="dv_menu_1">
									<a id="view1" name="view1-left" class="left-button" href="[[rootPath]]view1" on-mousedown="onSetLeft"></a>
									<a id="view1" name="view1-right"  class="right-button" href="[[rootPath]]view1" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="image:blur-linear"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-TT')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-TT')]]</b></span>
									</div>
								</paper-item>
								<paper-item id="dv_menu_7">
									<a id="view7" name="view7-left" class="left-button" href="[[rootPath]]view7" on-mousedown="onSetLeft"></a>
									<a id="view7" name="view7-right"  class="right-button" href="[[rootPath]]view7" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="editor:format-list-numbered"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-AF')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-AF')]]</b></span>
									</div>
								</paper-item>
								<!--<paper-item id="dv_menu_2">-->
	<!--<a id="view2" name="view2-left" class="left-button" href="[[rootPath]]view2" on-mousedown="onSetLeft"></a>-->
	<!--<a id="view2" name="view2-right"  class="right-button" href="[[rootPath]]view2" on-mousedown="onSetRight"></a>-->
	<!--<div class="dv-menu-text">-->
		<!--<iron-icon class="drawer-icon" icon="image:adjust"></iron-icon>-->
		<!--<span hidden="[[!shortNames]]"><b>[[localize('title-BMA')]]</b></span>-->
		<!--<span hidden="[[shortNames]]"><b>[[localize('title-short-BMA')]]</b></span>-->
	<!--</div>-->
								<!--</paper-item>-->
								<paper-item id="dv_menu_3">
									<a id="view3" name="view3-left" class="left-button" href="[[rootPath]]view3" on-mousedown="onSetLeft"></a>
									<a id="view3" name="view3-right"  class="right-button" href="[[rootPath]]view3" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="image:filter-none"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-KV')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-KV')]]</b></span>
									</div>
								</paper-item>
								<paper-item id="dv_menu_4">
									<a id="view4" name="view4-left" class="left-button" href="[[rootPath]]view4" on-mousedown="onSetLeft"></a>
									<a id="view4" name="view4-right"  class="right-button" href="[[rootPath]]view4" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="icons:sort"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-BAA')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-BAA')]]</b></span>
									</div>
								</paper-item>
								<paper-item id="dv_menu_5">
									<a id="view5" name="view5-left" class="left-button" href="[[rootPath]]view5" on-mousedown="onSetLeft"></a>
									<a id="view5" name="view5-right"  class="right-button" href="[[rootPath]]view5" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="editor:format-size"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-FI')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-FI')]]</b></span>
									</div>
								</paper-item>
								<paper-item id="dv_menu_6">
									<a id="view6" name="view6-left" class="left-button" href="[[rootPath]]view6" on-mousedown="onSetLeft"></a>
									<a id="view6" name="view6-right"  class="right-button" href="[[rootPath]]view6" on-mousedown="onSetRight"></a>
									<div class="dv-menu-text">
										<iron-icon class="drawer-icon" icon="icons:line-style"></iron-icon>
										<span hidden="[[!shortNames]]"><b>[[localize('title-QMC')]]</b></span>
										<span hidden="[[shortNames]]"><b>[[localize('title-short-QMC')]]</b></span>
									</div>
								</paper-item>
								<!--<paper-item  id="dv_menu_8">-->
		<!--<a id="view8" name="view8-left" class="left-button" href="[[rootPath]]view8" on-mousedown="onSetLeft"></a>-->
		<!--<a id="view8" name="view8-right"  class="right-button" href="[[rootPath]]view8" on-mousedown="onSetRight"></a>-->
		<!--<div class="dv-menu-text">-->
			<!--<iron-icon class="drawer-icon" icon="image:transform"></iron-icon>-->
			<!--<span hidden="[[!shortNames]]"><b>[[localize('title-FH')]]</b></span>-->
			<!--<span hidden="[[shortNames]]"><b>[[localize('title-short-FH')]]</b></span>-->
		<!--</div>-->
								<!--</paper-item>-->
								<paper-item on-click="onSettingsClick" id="settingsDv">
									<sane-settings bottom-item language="[[language]]" data="[[sanedata]]" has-name=[[shortNames]]></sane-settings>
								</paper-item>
							</paper-listbox>
						</app-toolbar>
					</app-header>
					<!--main content-->
					<div id="view-wrapper">
						<iron-pages
								selected="[[pageLeft]]"
								attr-for-selected="name"
								fallback-selection="view404"
								role="main">
							<sane-view1 name="view1" language="[[language]]" data="[[sanedata]]"></sane-view1>
							<!--<sane-view2 name="view2" language="[[language]]" data="[[sanedata]]"></sane-view2>-->
							<sane-view3 name="view3" language="[[language]]" data="[[sanedata]]"></sane-view3>
							<sane-view4 name="view4" language="[[language]]" data="[[sanedata]]"></sane-view4>
							<sane-view5 name="view5" language="[[language]]" data="[[sanedata]]"></sane-view5>
							<sane-view6 name="view6" language="[[language]]" data="[[sanedata]]"></sane-view6>
							<sane-view7 name="view7" language="[[language]]" data="[[sanedata]]"></sane-view7>
							<sane-view8 name="view8" language="[[language]]" data="[[sanedata]]"></sane-view8>
							<sane-view404 name="view404" language="[[language]]"></sane-view404>
						</iron-pages>
						<iron-pages
								selected="[[pageRight]]"
								attr-for-selected="name"
								fallback-selection="view404"
								role="main"
								hidden="[[!wideLayout]]">
							<sane-view1 name="view1" language="[[language]]" data="[[sanedata]]"></sane-view1>
							<!--<sane-view2 name="view2" language="[[language]]" data="[[sanedata]]"></sane-view2>-->
							<sane-view3 name="view3" language="[[language]]" data="[[sanedata]]"></sane-view3>
							<sane-view4 name="view4" language="[[language]]" data="[[sanedata]]"></sane-view4>
							<sane-view5 name="view5" language="[[language]]" data="[[sanedata]]"></sane-view5>
							<sane-view6 name="view6" language="[[language]]" data="[[sanedata]]"></sane-view6>
							<sane-view7 name="view7" language="[[language]]" data="[[sanedata]]"></sane-view7>
							<sane-view8 name="view8" language="[[language]]" data="[[sanedata]]"></sane-view8>
							<sane-view404 name="view404" language="[[language]]"></sane-view404>
						</iron-pages>
					</div>
					<sane-notification id="notificationBar"></sane-notification>
				</app-header-layout>

			</app-drawer-layout>

			<iron-media-query query="min-width: 1280px" query-matches="{{wideLayout}}"></iron-media-query>
			<iron-media-query query="min-width: 1550px" query-matches="{{shortNames}}"></iron-media-query>
		`;
	}

	static get is() {
		return "sane-app";
	}

	static get properties()	{
		return {
			language: {
				type: String,
				value: () => {
					const lang = navigator.language.substr(0, 2);
					if (["en", "de"].includes(lang)) {
						return lang;
					}
					return "en";
				},
			},
			/**
			 * Provides the information on which side the view will be opened.
			 */
			left: {
				reflectToAttribute: true,
				type: Boolean,
				value: true,
			},
			/**
			 * Contains the name of last clicked view.
			 */
			page: {
				observer: "pageChanged",
				reflectToAttribute: true,
				type: String,
			},
			/**
			 * Contains the name of left view.
			 */
			pageLeft: {
				observer: "pageChanged",
				reflectToAttribute: true,
				type: String,
			},
			/**
			 * Contains the name of right view.
			 */
			pageRight: {
				observer: "pageChanged",
				reflectToAttribute: true,
				type: String,
			},
			/**
			 * Reload of side?
			 */
			reload: {
				type: Boolean,
				value: true,
			},
			/**
			 * Contains data of the app-route element.
			 */
			routeData: {
				type: Object,
			},
			/**
			 * Show short names?
			 */
			shortNames: {
				type: Boolean,
				value: true,
			},
			subroute: Object,
			/**
			 * Show wide layout?
			 */
			wideLayout: {
				observer: "toggleWideLayout",
				reflectToAttribute: true,
				type: Boolean,
				value: false,
			},
		};
	}

	static get observers() {
		return [
			"routePageChanged(routeData.page)",
		];
	}

	constructor() {
		super();
		setPassiveTouchGestures(true);
		// check for url parameters for start configuration
		const pageUrl = window.location.href; // get url
		// search if there is a "?" and get anything after "?"
		const foundsSC = (pageUrl.indexOf("?") > 0) ? pageUrl.indexOf("?") + 1 : undefined;
		if (foundsSC) {
			setStartConfig(pageUrl.substr(foundsSC)); // set new start config
		}

		const listeners: {[key: string]: string} = {
			"dec-input-variable": "onDecInputVar",
			"dec-output-variable": "onDecOutputVar",
			"import-sane-data": "onDataImport",
			"inc-input-variable": "onIncInputVar",
			"inc-output-variable": "onIncOutputVar",
			"set-custom-char": "onCustomCharSetSet",
			"set-output-set": "onSetOutput",
			"set-output-tree": "onSetOutputTree",
			"toggle-color": "onToggleColor",
			"toggle-language": "onToggleLang",
			"toggle-layout": "onLayoutToggle",
			"toggle-mask": "onToggleMask",
			"toggle-notification": "onNotificationToggle",
			"toggle-output-bit": "onToggleOutputBit",
		};

		// assign events to listener
		for (const prop in listeners) {
			if (listeners.hasOwnProperty(prop)) {
				this.addEventListener(prop, this[listeners[prop]]);
			}
		}
	}

	/**
	 * Loading behavior when a view is opened.
	 */
	public routePageChanged(p: string) {
		let page = p;
		// needs to be done like this, otherwise only the last clicked page is stored in case of a reload
		// make sure that routeDate.page is undefined
		if (this.reload) {
			this.routeData.page = undefined;
			page = "";
			this.reload = false;
		}
		// if !page => read from storage or init with default values
		// else => according to left update pageLeft/Right values
		if (page) {
			if (this.left) {
				localStorage.setItem("pageLeft", page);
				this.pageLeft = page;
			} else if (!this.left) {
				localStorage.setItem("pageRight", page);
				this.pageRight = page;
			}
		} else {
			// check for views in start configuration
			const startConfigViews = checkSCViews();
			// set start configuration values as default if existing
			const defaultLeft = (startConfigViews) ? startConfigViews.leftDefault : "view1";
			const defaultRight = (startConfigViews) ? startConfigViews.rightDefault : "view3";
			if (localStorage.getItem("pageLeft") === null) {
				localStorage.setItem("pageLeft", defaultLeft);
			}
			this.pageLeft = localStorage.getItem("pageLeft");
			if (localStorage.getItem("pageRight") === null) {
				localStorage.setItem("pageRight", defaultRight);
			}
			this.pageRight = localStorage.getItem("pageRight");
		}
		this.markDvSelection();
		// Close a non-persistent drawer when the page & route are changed.
		if (!this.$.drawer.persistent) {
			this.$.drawer.close();
		}
	}

	public ready() {
		super.ready();
		this.loadResources(this.resolveUrl("src/locales.json"));
		if ((startConfiguration && checkSCBlockedFeatures("navigation", "navigation") === false)) {
			this.shadowRoot.querySelector("#dv_menu_1").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_2").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_3").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_4").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_5").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_6").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_7").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#dv_menu_8").setAttribute("disabled", true);
			this.shadowRoot.querySelector("#sv_menu_1").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_2").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_3").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_4").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_5").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_6").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_7").removeAttribute("href");
			this.shadowRoot.querySelector("#sv_menu_8").removeAttribute("href");
		}
	}

	public pageChanged(page: string) {
		// Load page import on demand. Show 404 page if fails
		// const resolvedPageUrl = this.resolveUrl("sane-" + page + ".html");
		// Polymer.importHref(resolvedPageUrl,null,this.showErrorPage.bind(this),true);
		import(`./sane-${page}.js`).then(null, this.showErrorPage.bind(this));
	}

	public showErrorPage() {
		this.page = "view404";
	}

	public onSetLeft(event: MouseEvent) {
		this.left = true;
		if ((event!.target! as Element).id === this.routeData.page) {
			this.notifyPath("routeData.page");
		}
	}

	public onSetRight(event: MouseEvent) {
		this.left = false;
		if ((event!.target! as Element).id === this.routeData.page) {
			this.notifyPath("routeData.page");
		}
	}

	public toggleWideLayout(wide: boolean) {
		if (!wide) {
			this.shadowRoot.querySelector("a[name=" + localStorage.getItem("pageLeft") + "]").classList.add("iron-selected");
			this.left = true;
		}
	}

	public markSvSelection(event: MouseEvent) {
		this.shadowRoot.querySelector(".iron-selected").classList.remove("iron-selected");
		(event!.target! as Element).classList.add("iron-selected");
	}

	public markDvSelection() {
		this.shadowRoot.querySelectorAll(".selected-left", ".selected-right").forEach((element: HTMLElement) => {
			element.classList.remove("selected-left");
		});
		this.shadowRoot.querySelectorAll(".selected-right").forEach((element: HTMLElement) => {
			element.classList.remove("selected-right");
		});
		this.shadowRoot.querySelector("a[name=" + localStorage.getItem("pageLeft") + "-left]").classList.add("selected-left");
		this.shadowRoot.querySelector("a[name=" + localStorage.getItem("pageRight") + "-right]").classList.add("selected-right");
	}

	public onIncInputVar() {
		this.$.data.incInputVariables();
	}

	public onDecInputVar() {
		this.$.data.decInputVariables();
	}

	public onIncOutputVar() {
		this.$.data.incOutputVariables();
	}

	public onDecOutputVar() {
		this.$.data.decOutputVariables();
	}

	public onToggleMask(event: CustomEvent) {
		this.$.data.toggleMask(event.detail);
	}

	public onToggleOutputBit(event: CustomEvent) {
		this.$.data.toggleOutputBit(event.detail);
	}

	public onSetOutput(event: CustomEvent) {
		this.$.data.setOutputSet(event.detail);
	}

	public onSetOutputTree(event: CustomEvent) {
		this.$.data.setOutputTree(event.detail.tree, event.detail.index);
	}

	public onNotificationToggle(event: CustomEvent) {
		this.$.notificationBar.toggleNotification(event.detail);
	}

	public onToggleLang(event: CustomEvent) {
		this.language = event.detail.selectedLanguage;
	}

	/**
	 * Switch between colors.
	 * @param event
	 * @private
	 */
	public onToggleColor(event: CustomEvent) {
		if (event.detail.selectedColor === "light") {
			// next line to access body color, assigned in index.html
			document.body.style.backgroundColor = "#eee";
			this.updateStyles({
				"--app-primary-color": "var(--sane-light-primary-color)",
				"--app-secondary-color": "var(--sane-light-secondary-color)",
				"--app-background-color": "var(--sane-light-background-color)",
				"--app-card-background-color": "var(--sane-light-card-background-color)",
				"--app-card-header-background-color": "var(--sane-light-card-header-background-color)",
				"--app-card-header-shadow": "var(--sane-light-card-header-shadow)",
				"--app-dialog-background-color": "var(--sane-light-dialog-background-color)",
				"--app-card-font-color": "var(--sane-light-card-font-color)",
				"--app-divider-color": "var(--sane-light-divider-color)",
				"--app-tt-divider-color": "var(--sane-light-tt-divider-color)",
				"--app-hover-background-color": "var(--sane-light-hover-background-color)",
				"--app-highlighted-input-color": "var(--sane-light-highlighted-input-color)",
				"--app-dv-menu-border-color": "var(--sane-light-dv-menu-border-color)",
				"--app-dv-menu-gradient-color": "var(--sane-light-dv-menu-gradient-color)",
				"--app-dv-menu-font-color": "var(--sane-light-dv-menu-font-color)",
				"--app-alert-color": "var(--sane-light-alert-color)",
			});
		} else {
			document.body.style.backgroundColor = "#666";
			this.updateStyles({
				"--app-primary-color": "var(--sane-dark-primary-color)",
				"--app-secondary-color": "var(--sane-dark-secondary-color)",
				"--app-background-color": "var(--sane-dark-background-color)",
				"--app-card-background-color": "var(--sane-dark-card-background-color)",
				"--app-card-header-background-color": "var(--sane-dark-card-header-background-color)",
				"--app-card-header-shadow": "var(--sane-dark-card-header-shadow)",
				"--app-dialog-background-color": "var(--sane-dark-dialog-background-color)",
				"--app-card-font-color": "var(--sane-dark-card-font-color)",
				"--app-divider-color": "var(--sane-dark-divider-color)",
				"--app-tt-divider-color": "var(--sane-dark-tt-divider-color)",
				"--app-hover-background-color": "var(--sane-dark-hover-background-color)",
				"--app-highlighted-input-color": "var(--sane-dark-highlighted-input-color)",
				"--app-dv-menu-border-color": "var(--sane-dark-dv-menu-border-color)",
				"--app-dv-menu-gradient-color": "var(--sane-dark-dv-menu-gradient-color)",
				"--app-dv-menu-font-color": "var(--sane-dark-dv-menu-font-color)",
				"--app-alert-color": "var(--sane-dark-alert-color)",
			});
		}
	}

	public onDataImport(event: CustomEvent) {
		this.$.data.importData(event.detail);
	}

	public onCustomCharSetSet(event: CustomEvent) {
		this.$.data.setChar(event.detail.customChar, event.detail.char);
	}

	public onLayoutToggle(event: CustomEvent) {
		this.wideLayout = event.detail.wide;
	}

	/**
	 * Opens the right one of the two sane-settings-objects.
	 * @param event
	 * @private
	 */
	public onSettingsClick(event: MouseEvent) {
		if ((event!.target!as Element).id === "settingsDv") {
			this.$.settingsDv.querySelector("sane-settings").openSettings(event);
		} else if ((event!.target! as Element).id === "settingsSv") {
			this.$.settingsSv.querySelector("sane-settings").openSettings(event);
		}
	}
}

customElements.define(SaneApp.is, SaneApp);
