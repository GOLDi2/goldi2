/*
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const documentContainer = document.createElement("div");
documentContainer.setAttribute("style", "display: none;");

documentContainer.innerHTML = `
	<dom-module id="shared-styles">
    	<template>
			<style>
				.card {
					margin: 24px;
					color: var(--app-card-font-color);
					border-radius: 5px;
					background-color: var(--app-card-background-color);
					box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
				}

				.circle {
					display: inline-block;
					width: 64px;
					height: 64px;
					text-align: center;
					color: var(--app-card-font-color);
					border-radius: 50%;
					background: var(--app-background-color);
					font-size: 30px;
					line-height: 64px;
					box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.2);
				}

				.card-header {
					display: inline-flex;
					padding: 1%;
					width: 98%;
					border-top-left-radius: 5px;
					border-top-right-radius: 5px;
					background-color: var(--app-card-header-background-color);
					box-shadow: var(--app-card-header-shadow);
				}

				.card-body {
					padding: 2%;
				}

				.view-name {
					padding-left: 3%;
					white-space: nowrap;
				}

				.card-header-divider {
					margin-top: 0;
					margin-bottom: 4%;
					border-color: var(--sane-light-primary-color);
				}

				h1 {
					margin: 16px 0;
					color: var(--app-card-font-color);
					font-size: 22px;
				}

				h2 {
					color: var(--app-card-font-color);
					font-size: 18px;
					font-weight: 500;
					letter-spacing: -0.00833em;
				}

				::selection {
					background-color: var(--app-primary-color);
					color: white;
				}
			</style>
		</template>
	</dom-module>
`;

document.head.appendChild(documentContainer);
