(function(window) {
	'use strict';

	/**
	 * Controller constructor, which sets up bindings
	 * @constructor
	 * @param model - model
	 * @param view - view
	 */
	function Controller(model, view) {
		var that = this;
		that.model = model;
		that.view = view;

		that.view.bind('addState', function(x, y) {
			if(editable) {
				that.addState(x, y);
			}
		});

		that.view.bind('removeNode', function(value) {
			that.model.removeState(value, function() {
				that.view.draw(that.model.getFSM());
			});
		});

		that.view.bind('removeTransition', function(source, target) {
			that.model.removeTransition(source, target, function() {
				that.view.draw(that.model.getFSM());
			});
		});

		that.view.bind('removeOutput', function(stateval, idx) {
			that.model.removeStateOutput(stateval, idx, function() {
				that.view.draw(that.model.getFSM());
			});
		});

		that.view.bind('repositionNode', function(value) {
			that.model.updateState(
			    { value: value, fixed: false },
			    function() {
				    that.view.draw(that.model.getFSM(), true);
			    });
		});

		that.view.bind('addLink', function(source, target) {
			that.addLink(source, target);
		});

		that.view.bind('dropStorage', function() {
			that.dropStorage();
		});

		that.view.bind('getNodeCoords', function(updateData) {
			that.saveNodeCoords(updateData);
		});

		that.view.bind('getLabelCoords', function(updateData) {
			that.saveLabelCoords(updateData);
		});

		that.view.bind('removePositions', function() {
			that.removePositions();
		});

		that.view.bind('keyDown', function(action, target, el1, el2) {
			switch (action) {
			case 'remove':
				if (target === 'node') {
					that.model.removeState(Number(el1),
					    function() {});
				} else if (target === 'transition') {
					that.model.removeTransition(el1, el2,
					    function() {});
				}
				that.view.draw(that.model.getFSM());
				break;
			case 'reposition':
				that.model.removePositions(function() {
					that.view.draw(that.model.getFSM(), true);
				});
			}
		});

		that.view.bind('keyUp', function() { } );

		$(document).on('stateValueChange', function(e, oldVal, newVal) {
			if (isNaN(oldVal) ||
			    isNaN(newVal)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}

			if (oldVal === newVal) {
				$(document).trigger('formfeedback', [
				    'warning'
				    ]);
				return;
			}

			that.model.changeValue(oldVal, newVal, function() {
				that.view.draw(that.model.getFSM());
			});
		});

		$(document).on('stateNameChange', function(e, value, name) {
			var regex=/[^a-zA-Z0-9]/;
			if (isNaN(value) || name.match(regex) || name.length>8) {
				$(document).trigger('formfeedback', [
					'error'
				]);
				return;
			}

			if (value === name) {
				$(document).trigger('formfeedback', [
					'warning'
				]);
				return;
			}

			that.model.changeName(value, name, function() {
				that.view.draw(that.model.getFSM());
			});
		});

		$(document).on('stateOutputChange', function(e, stateval, index, output) {
			if (isNaN(stateval) || isNaN(index)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}

			that.model.updateStateOutput(stateval, index, output,
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('addOutput', function(e, stateval, out, index) {
			if (isNaN(stateval)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}
			try {
				OutputChanging(out, parseInt(index));
			}catch(err){
				$(document).trigger('formfeedback', [
					'error'
				]);
				return;
			}
			that.model.addStateOutput(stateval, out, function() {
				that.view.draw(that.model.getFSM(), true);
			}, index);
		});

		$(document).on('stateOutputRemove', function(e, stateval, index) {
			if (isNaN(stateval) || isNaN(index)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}

			that.model.removeStateOutput(stateval, index,
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('transitionInputChange', function(e, from, to, input) {
			if (isNaN(from) || isNaN(to)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}
			that.model.updateTransition(
			    Number(from),
			    Number(to),
			    { input: input },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('transitionSourceChange', function(e, from, to, source) {
			if (isNaN(from) || isNaN(to) || isNaN(source) ||
			    that.model.transitionExists(source, to)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}
			that.model.updateTransition(
			    Number(from),
			    Number(to),
			    { source: Number(source) },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('transitionTargetChange', function(e, from, to, target) {
			if (isNaN(from) || isNaN(to) || isNaN(target) ||
			    that.model.transitionExists(from, target)) {
				$(document).trigger('formfeedback', [
				    'error'
				    ]);
				return;
			}
			that.model.updateTransition(
			    Number(from),
			    Number(to),
			    { target: Number(target) },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('stateColorChange', function(e, value, color) {
			that.model.updateState(
			    { value: value, color: color },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('transitionColorChange', function(e, from, to, color) {
			that.model.updateTransition(
			    from,
			    to,
			    { color: color },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('transitionNotationChange', function(e, from, to, shortened) {
			that.model.updateTransition(
			    from,
			    to,
			    { shortened: shortened },
			    function() {
				    that.view.draw(that.model.getFSM());
			    });
		});

		$(document).on('parserChange', function(e, and, or, not) {
			that.model.updateParser({
				'and': and,
				'or': or,
				'not': not
			});
		});

		$('#import').on('importStorage', function(e, file) {
			var reader = new FileReader();

			reader.onload = function() {
				var data = reader.result;

				$('.open .dropdown-toggle').dropdown('toggle');
				that.model.import(data, function() {
					that.view.draw(that.model.getFSM());
				});
			};

			reader.readAsText(file);
		});

		$('#export').on('exportRequest', function() {
			var db = that.model.getStorage();
			var data = 'text/json,' + encodeURI(db);
			$('#export').trigger('exportLink.push', [ data ]);
		});
	}

	/**
	 * Lets the model add a new state with given data from the view.
	 * @param {number} x - horizontal position
	 * @param {number} y - vertical position
	 */
	Controller.prototype.addState = function(x, y) {
		var that = this;
		x = x || 0;
		y = y || 0;
		if(editable) {
			that.model.createState(
				{output: '0', x: x, y: y, color: '#0000FF'},
				function () {
					that.view.draw(that.model.getFSM());
				});
		}else{
			that.model.createState(
				{output: '0', x: x, y: y, color: '#000000'},
				function () {
					that.view.draw(that.model.getFSM());
				});
		}
	};

	/**
	 * Adds transition
	 * Lets the model add a new transition with given data from the view.
	 * @param {number} source - id/value of source
	 * @param {number} target - id/value of target
	 */
	Controller.prototype.addLink = function(source, target) {
		var that = this;

		if (typeof source === undefined ||
		    typeof target === undefined) {
			console.log('addLink: missing source or target');
			return;
		}

		that.model.createTransition(source, target, '1', '#000000',
		    function() {
			    that.view.draw(that.model.getFSM());
		    });
	};

	/**
	 * storage removal
	 */
	Controller.prototype.dropStorage = function() {
		var that = this;
		that.model.dropStorage(function() {
			that.view.draw(that.model.getFSM());
		});
	};

	/**
	 * Saves given position coordinates and the 'fixed' state
	 */
	Controller.prototype.saveNodeCoords = function(updateData) {
		var that = this;

		for (let i = 0; i < updateData.length; i++) {
			that.model.updateState(
			    {
				    value: updateData[i].val,
				    x: updateData[i].x,
				    y: updateData[i].y,
				    fixed: updateData[i].fixed
			    },
			    function() {});
		}
	};

	/**
	 * Saves given position coordinates
	 */
	Controller.prototype.saveLabelCoords = function(updateData) {
		var that = this;

		for (let i = 0; i < updateData.length; i++) {
			that.model.updateTransition(
			    Number(updateData[i].from),
			    Number(updateData[i].to),
			    { x: Number(updateData[i].x),
			      y: Number(updateData[i].y) },
			    function() {});
		}
		TransitionChanged();
	};

	/**
	 * Removes all positions and 'fixed' states, which equals a re-position
	 * and re-render.
	 */
	Controller.prototype.removePositions = function() {
		var that = this;

		that.model.removePositions(function() {
			that.view.draw(that.model.getFSM(), true);
		});
	};

	/**
	 * Rerenders the view.
	 */
	Controller.prototype.setView = function() {
		var that = this;
		that.view.draw(that.model.getFSM());
	};

	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);
