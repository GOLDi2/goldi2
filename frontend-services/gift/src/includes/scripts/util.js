(function(window) {
	'use strict';
	/**
	 * querySelector wrapper
	 */
	window.qs = function(selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * querySelectorAll wrapper
	 */
	window.qsa = function(selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * wrapper for addEventListener
	 */
	window.$on = function(target, type, callback) {
		target.addEventListener(type, callback);
	};
})(window);
