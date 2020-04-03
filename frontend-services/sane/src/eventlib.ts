/**
 * @module Eventlib function library
 */

/**
 * An enumeration of used event-names.
 * @enum
 * @public
 * @constant
 */
const enum Events {
	incInputVariable = "inc-input-variable",
	decInputVariable = "dec-input-variable",
	incOutputVariable = "inc-output-variable",
	decOutputVariable = "dec-output-variable",
	toggleMask = "toggle-mask",
	setOutputSet = "set-output-set",
	setOutputTree = "set-output-tree",
	toggleOutputBit = "toggle-output-bit",
	toggleNotification = "toggle-notification",
	toggleLanguage = "toggle-language",
	toggleColor = "toggle-color",
	exportSaneData = "export-sane-data",
	importSaneData = "import-sane-data",
	setCustomChar = "set-custom-char",
	toggleLayout = "toggle-layout",
}

type Constructor<T> = new(...args: any[]) => T;

/**
 * Mixin to be able to use the custom event-system. Provides a class access to new methods.
 * @mixin
 * @public
 * @param {T} base The base-class which will become the new functions.
 * @returns Mixin The class which contains the new methods.
 * @polymer
 * @mixinFunction
 */
function EventMixin<T extends Constructor<HTMLElement>>(base: T) {
	return class extends base {
		constructor(...args: any[]) {
			super(...args);
		}

		/**
		 * Adds a new event.
		 * @param {enum Events} eventName The name of the event.
		 * @param {{}} detail Event-detail object.
		 * @param {boolean} bubbles Bubbles property.
		 * @param {boolean} composed Composed property.
		 * @returns {Event} Added event.
		 */
		public addEvent(eventName: Events, {detail = {}, bubbles = true, composed = true}:
			{detail?: {}, bubbles?: boolean, composed?: boolean} = {}): Event {
			// @ts-ignore
			return new CustomEvent(eventName, {bubbles, composed, detail});
		}

		/**
		 * Dispatches a specific event.
		 * @param {string | Event} eventName Event as string or event-object.
		 * @param {{}} detail Event-detail object.
		 * @param {boolean} bubbles Bubbles property.
		 * @param {boolean} composed Composed property.
		 */
		public triggerEvent(eventName: Events, {detail = {}, bubbles = true, composed = true}:
							{detail?: {}, bubbles?: boolean, composed?: boolean} = {}) {
			if (typeof eventName === "string") {
				// @ts-ignore
				this.dispatchEvent(new CustomEvent(eventName, {bubbles, composed, detail}));
			} else {
				this.dispatchEvent(eventName);
			}
		}

		/**
		 * Triggers a notification with given string as text.
		 * @param {string} message Notification message which will be shown.
		 * @see SaneNotification
		 */
		public notifySane(message: string) {
			this.triggerEvent(Events.toggleNotification, {detail: {notificationMessage: message}});
		}
	};
}

export { EventMixin, Events };
