/* global $on, qs, MathJax, Handlebars, Parser, i18n */
(function(window) {
	'use strict';

	var StateDiagram = window.StateDiagram;
	var parser = null;

	var selected = null,
	    preserveSelected = false;

	var feedbackTarget = null;

	var cachedFsm = null;




	/**
	 * View constructor
	 * @constructor
	 */
	function View(p) {
		var that = this;
		parser = p;
		this.sd = new StateDiagram({ parser: parser});

		this.sd.bind('selectNode', nodeEditor);
		this.sd.bind('selectLink', linkEditor);

		$('#editor').on('dblclick.base', '#statevalue', function(e) {
			if (e.target.tagName !== 'INPUT') {
				editStateValue(e);
			}
		});

		$('#editor').on('click.base', '#stateName', function(e) {
				editStateName(e);
		});

		$('#editor').on('dblclick.base', 'tr[id^=stateoutput]', function(e) {
			if (e.target.tagName !== 'INPUT') {
				editStateOutput(e);
			}
		});

		$('#editor').on('click.base', '#add-state-output', function(e) {
			addStateOutput(e);
		});

		$('#editor').on('click.base', '#transitioninput', function(e) {
			editInputValue(e);
		});

		$('#editor').on('dblclick.base', '#transitionsource', function(e) {
			if (e.target.tagName !== 'INPUT') {
				editSourceValue(e);
			}
		});

		$('#editor').on('dblclick.base', '#transitiontarget', function(e) {
			if (e.target.tagName !== 'INPUT') {
				editTargetValue(e);
			}
		});

		$('#editor').on('change', '#colorstate', function(e) {
			editStateColor(e);
		});

		$('#editor').on('change', '#colortransition', function(e) {
			editTransitionColor(e);
		});

		$('#editor').on('change', '#cboxlongtransition', function(e) {
			editTransitionNotation(e);
		});

		$('#UserDefinedOperators_ODER').on('keyup.base', function(e) {
			let input = $('#UserDefinedOperators_ODER');
			feedbackTarget = input.parentsUntil('div');

			e.preventDefault();
			if (e.which === 13) {	// enter
				parser.or(input.val().trim());
				that.draw(cachedFsm);
			} else if (e.which === 27) {	// esc
				input.val(parser.or());
			}
		});

		$('#UserDefinedOperators_UND').on('keyup.base', function(e) {
			let input = $('#UserDefinedOperators_UND');
			feedbackTarget = input.parentsUntil('div');

			e.preventDefault();
			if (e.which === 13) {	// enter
				parser.and(input.val().trim());
				that.draw(cachedFsm);
			} else if (e.which === 27) {	// esc
				input.val(parser.and());
			}
		});

		$('#UserDefinedOperators_NICHT').on('keyup.base', function(e) {
			let input = $('#UserDefinedOperators_NICHT');
			feedbackTarget = input.parentsUntil('div');

			e.preventDefault();
			if (e.which === 13) {	// enter
				parser.not(input.val().trim());
				that.draw(cachedFsm);
			} else if (e.which === 27) {	// esc
				input.val(parser.not());
			}
		});


		$('#options').on('show.bs.dropdown', function() {
			$('#OR-symbol').val(parser.or());
			$('#AND-symbol').val(parser.and());
			$('#NOT-symbol').val(parser.not());
			$('#exportlink').remove();
			$('#import').val('');
		});

		$('#usage').on('shown.bs.modal', function() {
			$('usage').i18n();
		});

		$(document).on('formfeedback', function(e, type) {
			colorFeedback(feedbackTarget, type);
			feedbackTarget = null;
		});

		$('#export').click(function() {
			$('#export').trigger('exportRequest');
		});

		$('#export').on('exportLink.push', function(e, data) {
			$('#exportlink').remove();
			$('<a class="btn btn-default" id="exportlink" href="data:' + data + '" download="FSM-SD.json">download</a>').insertAfter('#export');
			$('#exportlink').one('click', function() {
				$('#exportlink').remove();
			});
		});

		$('#import').change(function() {
			if (this.files[0]) {
				$('#import').trigger('importStorage', [ this.files[0] ]);
			}
		});
	}

	Handlebars.registerHelper('toTeX', function(expr) {
		return Parser.toTeX(expr);
	});
	Handlebars.registerHelper('printYName', function(index){
		return getYName("y" + index);
	});

	Handlebars.registerHelper('notMaximum', function(){
		let maxnumber = machine.MaxOutputNumber;
		if(machine.OutputNumber == maxnumber){
			return false;
		}
		return true;
	});
	Handlebars.registerHelper('editable', function(){
		return editable;
	});


	Handlebars.registerHelper('boolExprPlaceholder', function() {
		return parser.not() + '(x2 ' + parser.and() + ' x3)' + parser.or() + ' ' + parser.not() + 'x4';
	});

	Handlebars.registerHelper('StateNamePlaceholder', function() {
		return 'Example';
	});

	Handlebars.registerHelper('t', function(i18nKey) {
		let result = i18n.t(i18nKey);

		return new Handlebars.SafeString(result);
	});

	/**
	 * Rerenders the view
	 * @param fsm - finite state machine
	 * @param ps - selection preservation flag
	 */
	View.prototype.draw = function(fsm, ps) {
		/*
		if (fsm.meta && fsm.meta.parser) {
			if (fsm.meta.parser.and) {
				parser.and(fsm.meta.parser.and);
			}
			if (fsm.meta.parser.or) {
				parser.or(fsm.meta.parser.or);
			}
			if (fsm.meta.parser.not) {
				parser.not(fsm.meta.parser.not);
			}
		}
		*/

		cachedFsm = fsm;
		this.sd(fsm, ps);
		preserveSelected = ps;
		if (selected && selected.hasOwnProperty('target')) {
			linkEditor(selected);
		} else if (selected) {
			nodeEditor(selected);
		}

		$('#OR-symbol').val(parser.or());
		$('#AND-symbol').val(parser.and());
		$('#NOT-symbol').val(parser.not());


	};

	/**
	 * Gives visual feedback, which depends on type, on the target by
	 * changing the background color.
	 */
	function colorFeedback(target, type) {
		if (target === null) {
			return;
		}

		target.addClass('fb' + type);
		setTimeout(function() {
			target.removeClass('fb' + type);
			target.addClass('fbout');
			setTimeout(function() {
				target.removeClass('fbout');
			}, 900);
		}, 900);
	}

	function blankEditor() {
		let source = $('#editor-blank-template').html();
		let template = Handlebars.compile(source);
		let html = template();
		if (html.length > 27) {	// workaround for glitch with empty strings
			qs('#editor').innerHTML = html;
		}
	}

	/**
	 * Adds the information and editor panel to the view for the selected
	 * node.
	 */

	function nodeEditor(data) {
		let editor = document.getElementById('editor');
		selected = data;
		if (data === null) {
			blankEditor();
			return;
		}

		let source = $('#statedescr-template').html();
		let template = Handlebars.compile(source);
		let html = template(data);
		editor.innerHTML = html;
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, editor]);
	}

	/**
	 * Adds the information and editor panel to the view for the selected
	 * transition.
	 */
	function linkEditor(data) {
		let editor = document.getElementById('editor');
		selected = data;
		if (data === null) {
			blankEditor();
			return;
		}

		let source = $('#transitiondescr-template').html();
		let template = Handlebars.compile(source);
		let html = template(data);
		editor.innerHTML = html;
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, editor]);
	}

	/**
	 * Resets the information and editor panel.
	 */
	function resetEditor() {
		if (preserveSelected) {
			preserveSelected = false;
			return;
		}
		selected = null;
		blankEditor();
	}

	/** Hides the <input> and makes the <div> visible again */
	function replaceInput(input, display, shallblur) {
		input.addClass('hidden');
		display.removeClass('hidden');
		if (shallblur !== false) {
			input.blur();
		}

	}

	function editStateName(e) {
		if (!editable) {
			return;
		}

		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		let output = pseudoTarget.find('.output');

		feedbackTarget = pseudoTarget;
		output.addClass('hidden');
		input.val(selected.name).removeClass('hidden').focus();
		//input.val(selected.name).removeAttr('disabled');
		input.on('blur', function() {
			replaceInput(input, output, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('stateNameChange', [
					Number(selected.value), input.val().trim()
				]);
				replaceInput(input, output);
			} else if (e.which === 27) {	// esc
				replaceInput(input, output);
				colorFeedback(pseudoTarget, 'warning');
			}
		});
	}


	function editStateValue(e) {
		if (!editable) {
			return;
		}

		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		let output = pseudoTarget.find('.output');

		feedbackTarget = pseudoTarget;
		output.addClass('hidden');
		input.val(selected.value).removeClass('hidden').focus();
		input.on('blur', function() {
			replaceInput(input, output, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('stateValueChange', [
				    Number(selected.value), Number(input.val())
				    ]);
				replaceInput(input, output);
			} else if (e.which === 27) {	// esc
				replaceInput(input, output);
				colorFeedback(pseudoTarget, 'warning');
			}
		});
	}

	function editStateOutput(e) {
		if (!editable) {
			return;
		}

		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		let output = pseudoTarget.find('.output');
		let idx = pseudoTarget.attr('id').replace(/stateoutput/, '');

		feedbackTarget = pseudoTarget;
		output.addClass('hidden');
		input.val(selected.output[idx]).removeClass('hidden').focus();
		input.on('blur', function() {
			replaceInput(input, output, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('stateOutputChange', [
				    Number(selected.value), idx, input.val().trim()
				    ]);
				replaceInput(input, output);
			} else if (e.which === 27) {	// esc
				replaceInput(input, output);
				colorFeedback(pseudoTarget, 'warning');
			}
		});

	}

	function addStateOutput(e) {
		let aso = $('#add-state-output');
		let input = aso.find('input');
		let button = aso.find('span');
		let idx = $('.output').length -1;
		let pseudoTarget = $(e.target).closest('tr');
		feedbackTarget = pseudoTarget;

		//CHANGE
		//(machine.OutputNumber < machine.MaxOutputNumber && machine.OutputNumber <= idx){
		//	machine = Util.copyDatatype(machine, true, machine.StateBits, machine.InputNumber, machine.OutputNumber + 1, machine.GraphStorage);
		//}

		OutputAdding(idx);


		button.addClass('hidden');
		input.removeClass('hidden').focus();

		input.on('blur', function() {
			replaceInput(input, button, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				try {
					OutputChanging(input.val().trim(), idx);
					$(document).trigger('addOutput', [
						Number(selected.value), input.val().trim(), idx
					]);
					replaceInput(input, button);
				} catch(err) {
					let temptarget = feedbackTarget;
					$(document).trigger('formfeedback', [
						'error'
					]);
					feedbackTarget = temptarget;
				}
			} else if (e.which === 27) {	// esc
				replaceInput(input, button);
				colorFeedback(aso, 'warning');
			}
		});
	}

	function editInputValue(e) {
		if (!editable) {
			return;
		}

		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		feedbackTarget = pseudoTarget;

		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('transitionInputChange', [
						Number(selected.source.value),
						Number(selected.target.value),
						input.val().trim()
				]);
			} else if (e.which === 27) {	// esc
				colorFeedback(pseudoTarget, 'warning');
			}
		});
	}

	function editSourceValue(e) {
		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		let output = pseudoTarget.find('.output');

		feedbackTarget = pseudoTarget;
		output.addClass('hidden');
		input.val(selected.source.value).removeClass('hidden').focus();
		input.on('blur', function() {
			replaceInput(input, output, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('transitionSourceChange', [
				    Number(selected.source.value),
				    Number(selected.target.value),
				    input.val().trim()
				    ]);
				replaceInput(input, output);
			} else if (e.which === 27) {	// esc
				replaceInput(input, output);
				colorFeedback(pseudoTarget, 'warning');
			}
		});
	}

	function editTargetValue(e) {
		let pseudoTarget = $(e.target).closest('tr');
		let input = pseudoTarget.find('input');
		let output = pseudoTarget.find('.output');

		feedbackTarget = pseudoTarget;
		output.addClass('hidden');
		input.val(selected.target.value).removeClass('hidden').focus();
		input.on('blur', function() {
			replaceInput(input, output, false);
		});
		input.on('keyup', function(e) {
			e.stopPropagation();
			if (e.which === 13) {	// enter
				$(document).trigger('transitionTargetChange', [
				    Number(selected.source.value),
				    Number(selected.target.value),
				    input.val().trim()
				    ]);
				replaceInput(input, output);
			} else if (e.which === 27) {	// esc
				replaceInput(input, output);
				colorFeedback(pseudoTarget, 'warning');
			}
		});
	}

	function editStateColor() {
		let color = $('#colorstate').val();

		$(document).trigger('stateColorChange',
		    [ Number(selected.value), color ]
		    );
	}

	function editTransitionColor() {
		let color = $('#colortransition').val();

		$(document).trigger('transitionColorChange', [
		    Number(selected.source.value),
		    Number(selected.target.value),
		    color
		    ]);
	}

	/**
	 * Trigger an event that the checkbox for the shorthand notation was
	 * changed.
	 */
	function editTransitionNotation(e) {
		$(document).trigger('transitionNotationChange', [
		    Number(selected.source.value),
		    Number(selected.target.value),
		    e.target.checked
		]);
	}

	/**
	 * Handles the bindings to the controller and statediagram
	 */
	View.prototype.bind = function(event, handler) {
		var that = this;

		if (event === 'addState') {
			$on(qs('#add-state'), 'click', function() {
				handler();
			});
			that.sd.bind('addState', handler);
		} else if (event === 'addLink') {
			that.sd.bind('addLink', handler);
		} else if (event === 'removePositions') {
			$on(qs('#reposition'), 'click', function() {
				preserveSelected = true;
				handler();
			});
			that.sd.bind('reposition', handler);
		} else if (event === 'dropStorage') {
			$on(qs('#drop-storage'), 'click', function() {
				if (window.confirm(i18n.t('buttons.removeallconfirmation'))) {
					handler();
				}
			});
		} else if (event === 'removeNode') {
			$('#editor').on('click', '#remove-selected-state', function() {
				if (window.confirm(i18n.t('infoedit.removenodeconfirmation'))) {
					handler(selected.value);
					resetEditor();
				}
			});
		} else if (event === 'removeTransition') {
			$('#editor').on('click', '#remove-selected-transition', function() {
				if (window.confirm(i18n.t('infoedit.removetransitionconfirmation'))) {
					handler(selected.source.value, selected.target.value);
					resetEditor();
				}
			});
		} else if (event === 'removeOutput') {
			$('#editor').on('click', '#remove-output', function(e) {
				let pseudoTarget = $(e.target).closest('tr');
				let idx = pseudoTarget.attr('id').replace(/stateoutput/, '');
				handler(selected.value, idx);
			});
		} else if (event === 'repositionNode') {
			$('#editor').on('click', '#reposition-selected', function() {
				preserveSelected = true;
				handler(selected.value);
			});
		} else if (event === 'keyDown') {
			that.sd.bind('keyDown', handler);
		} else if (event === 'keyUp') {
			that.sd.bind('keyUp', handler);
		} else if (event === 'getNodeCoords') {
			that.sd.bind('getNodeCoords', handler);
		} else if (event === 'getLabelCoords') {
			that.sd.bind('getLabelCoords', handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
})(window);
