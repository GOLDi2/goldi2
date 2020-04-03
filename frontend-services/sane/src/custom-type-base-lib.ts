import { mixinBehaviors } from "../node_modules/@polymer/polymer/lib/legacy/class.js";
import { AppLocalizeBehavior } from "../node_modules/@polymer/app-localize-behavior/app-localize-behavior.js";
import { PolymerElement } from "../node_modules/@polymer/polymer/polymer-element.js";

/**
 * Library to support custom types.
 *
 * In case there are not yet officially implemented interfaces of polymer elements
 * you have to add the unofficial .d.ts to the custom_types directory.
 * In some cases e.g. the usage of:
 *
 * class ExampleClass extends Polymer.mixinBehaviors([Polymer.AppLocalizeBehavior],Polymer.Element)
 *
 * the methods provided by Polymer.AppLocalizeBehavior are not available.
 *
 * For workaround, define a base class like shown below with AppLocalizeBehavior.
 *
 * How to use the EventMixin and other Mixins combined with such a base class is shown in the sane-settings.ts:
 *
 * class SaneSettings extends EventMixin(saneAppLocalizeBehaviorBase) {...}
 */

/**
 * Interface to iterate through resources object.
 * @interface
 */
interface ISaneLocalizeResource {
	[index: string]: {[index: string]: string};
}

/**
 * Base class of AppLocalizeBehavior.
 * @type {{new(): (Polymer.Element & Polymer.AppLocalizeBehavior)}}
 */
const saneAppLocalizeBehaviorBase = mixinBehaviors([AppLocalizeBehavior],
	PolymerElement) as new () => PolymerElement & AppLocalizeBehavior;

/**
 * Like a Mixin which returns Polymer.Element extended with AppLocalizeBehavior and localizeSane.
 * @returns {class} Polymer.mixinBehaviors([Polymer.AppLocalizeBehavior],Polymer.Element extended with localizeSane
 * @polymer
 * @mixinFunction
 */
function AppLocalizeMixin() {
	return class extends saneAppLocalizeBehaviorBase {
		public localizeSane(key: string): string {
			return (this.resources as ISaneLocalizeResource)[this.language as string][key];
		}
	};
}

export { AppLocalizeMixin };
