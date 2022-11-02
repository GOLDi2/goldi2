(function(window) {
	'use strict';

	var OR = '+',
	    AND = '*',
	    NOT = '/';

	/**
	 * Escapes characters for regular expressions.
	 */
	function escapeRegExp(regexp) {
		return regexp.replace(/[-\/\\^$\&*+?.()|[\]{}]/g, '\\$&');
	}

	var andre = new RegExp(escapeRegExp(AND), 'g'),	// AND
	    orre = new RegExp(escapeRegExp(OR), 'g'),	// OR
	    notre = new RegExp(escapeRegExp(NOT) + '([xyz]_\{\\d+\})', 'g'),	// NOT <variable>
	    notrer = new RegExp(escapeRegExp(NOT) + '\\(([^\)]*)\\)', 'gi');	// repeating NOT (<expression>)

	/**
	 * Parser constructor
	 * @constructor
	 * @param or - symbol for OR operator
	 * @param and - symbol for AND operator
	 * @param not - symbol for NOT operator
	 */
	function Parser(or, and, not) {
		OR = or || '+';
		AND = and || '*';
		NOT = not || '/';

		return exports;
	}

	/**
	 * Converts boolean expression to TeX string
	 * @param string - boolean expression
	 */
	Parser.toTeX = function(string) {
		let ret = '',
		    newret = '';

		ret = String(string)
		    .trim()
		    .replace(/([axyz])(\d+)/gi, '$1_{$2}')	// variables
		    .replace(andre, '\\wedge ')		// AND
		    .replace(orre, '\\vee ')		// OR
		    .replace(notre, '\\overline{$1}');	// NOT <one variable>

		// handle nested NOT (<expression>)
		while (ret !== (newret = ret.replace(notrer, '\\overline{$1}'))) {
			ret = newret;
		}

		// finally replace TeX special chars
		ret = ret.replace(/\&/g, '\\$&').replace(/\~/g, '$~$').replace(/\#/g, '\\#').replace(/\%/g, '\\%');

		return  ret;
	};

	function exports(expression) {
		return expression;
	}

	exports.propagateSymbols = function() {
		$(document).trigger('parserChange', [
		    AND,
		    OR,
		    NOT
		    ]);
	};

	exports.toTeX = function(expression) {
		return Parser.toTeX(expression);
	};

	/**
	 * Set and get AND operator
	 */
	exports.and = function(newAnd) {
		if (!arguments.length) {
			return AND;
		}

		if (newAnd === OR || newAnd === NOT) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			return;
		}

		AND = newAnd;
		andre = new RegExp(escapeRegExp(AND), 'g');

		this.propagateSymbols();

		$(document).trigger('formfeedback', [
		    'success'
		    ]);

		return exports;
	};

	/**
	 * Set and get OR operator
	 */
	exports.or = function(newOr) {
		if (!arguments.length) {
			return OR;
		}

		if (newOr === AND || newOr === NOT) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			return;
		}

		OR = newOr;
		orre = new RegExp(escapeRegExp(OR), 'g');

		this.propagateSymbols();

		$(document).trigger('formfeedback', [
		    'success'
		    ]);

		return exports;
	};

	/**
	 * Set and get NOT operator
	 */
	exports.not = function(newNot) {
		if (!arguments.length) {
			return NOT;
		}

		if (newNot === AND || newNot === OR) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			return;
		}

		NOT = newNot;
		notre = new RegExp(escapeRegExp(NOT) + '([xyz]_\{\\d+\})', 'g');	// NOT <variable>
		notrer = new RegExp(escapeRegExp(NOT) + '\\(([^\)]*)\\)', 'gi');	// repeating NOT (<expression>)

		this.propagateSymbols();

		$(document).trigger('formfeedback', [
		    'success'
		    ]);

		return exports;
	};

	window.app = window.app || {};
	window.app.Parser = Parser;
	window.Parser = Parser;
})(window);
