import { PaperButtonElement } from "@polymer/paper-button/paper-button.js";
import { PaperToastElement } from "@polymer/paper-toast/paper-toast.js";
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { EventMixin } from "./eventlib.js";

/**
 * SaneNotification class
 * @class
 * @classdesc Class for the notification-system in Sane.
 */
class SaneNotification extends EventMixin(PolymerElement) {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					align-items: center;
					justify-content: center;
					position: fixed;
					z-index: 1;
					bottom: 1rem;
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


				#notificationBar {
					/*only works with !important*/
					position: absolute !important;
					margin-left: 40vw;
					margin-bottom: 5vh;
				}
			</style>
			<!-- data.notificationID returns number-->
			<paper-toast id="notificationBar" duration="0">
				<paper-button id="notificationBarButton" class="yellow-button">Ok!</paper-button>
			</paper-toast>
		`;
	}
	public static get is() {return "sane-notification"; }

	constructor() {
		super();
	}

	public ready() {
		super.ready();
		/**
		 * Adds an eventlistener to the PaperButton with the ID notificationBarButton.
		 * @listens click
		 */
		(this.$.notificationBarButton as PaperButtonElement).addEventListener("click", (event) => {
			(this.$.notificationBar as PaperToastElement).close();
		});
	}

	/**
	 * Displays a notification message. Toast will be closed if string is empty.
	 * @param {{notificationMessage: string}} detail The notification as string in an event detail
	 */
	public toggleNotification(detail: { notificationMessage: string } = {notificationMessage: ""}) {
		if (!detail.notificationMessage) {
			(this.$.notificationBar as PaperToastElement).close();
		} else {
			(this.$.notificationBar as PaperToastElement).text = detail.notificationMessage;
			(this.$.notificationBar as PaperToastElement).open();
		}
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneNotification.is, SaneNotification);
