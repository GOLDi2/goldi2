(function(window) {
	'use strict';

	/**
	 * Creates a state.
	 * @constructor
	 * @param {number} val - unique  value
	 * @param {string} out - output function
	 * @param {number} x - x position
	 * @param {number} y - y position
	 * @param stor - storage
	 */
	function State(val, out, x, y, color, stor) {
		if (!val) {
			this.value = firstMissing(stor);
		} else {
			this.value = Number(val);
		}
		this.output = [];
		if (out && Array.isArray(out)) {
			this.output = out.slice();
		} else {
			for (let i=0; i < machine.OutputNumber; i++) {
				this.output[i] = '0';
			}
		}
		this.x = x;
		this.y = y;
		this.color = color;
		this.name ='';
	}

	/**
	 * @constructor
	 * @param storage - backing storage
	 */
	function Model(storage, parser) {
		this.storage = storage;
		this.parser = parser;


		let db = this.storage.getFSM();
		if (db && db.meta && db.meta.parser) {
			if (db.meta.parser.and) {
				this.parser.and(db.meta.parser.and);
			}
			if (db.meta.parser.or) {
				this.parser.or(db.meta.parser.or);
			}
			if (db.meta.parser.not) {
				this.parser.not(db.meta.parser.not);
			}
		}
	}

	/**
	 * Creates a state.
	 * Lets the storage do the actual work
	 * @param s - new state
	 * @param callback - callval, out, back
	 */
	Model.prototype.createState = function(s, callback) {
		let addstate;
		if (s.value !== undefined){
			addstate = CheckStateNumber(s.value);
		} else {
			addstate = CheckStateNumber(firstMissing(this.storage));
		}

		if (addstate) {
			let newState = new State(s.value, s.output, s.x, s.y, s.color, this.storage);
			this.storage.saveState(newState, callback);
			Controller.changeStructSetAll(true, machine);
		}
	};

	/**
	 * Creates a transition.
	 * Lets the storage do the actual work
	 * @param {number} source - id/value of source
	 * @param {number} target - id/value of target
	 * @param {string} input - input expression
	 * @param callback - callval, out, back
	 */
	Model.prototype.createTransition = function(source, target, input, color, callback) {
		this.storage.saveTransition(source, target, input, color, callback);
		TransitionChanged();
	};

	/**
	 * Updates the data identified by the changed states value.
	 * If a value is undefined, it will not be changed. Otherwise the value
	 * will be overwritten – even null will be written!
	 * @param s - state
	 * @param callback - callback
	 */
	Model.prototype.updateState = function(s, callback) {
		if (this.storage.valueExists(s.value)) {
			//StateChanging();
			this.storage.updateState(s, callback);
		} else {
			console.log('given state not found');
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			callback = callback || function() {};
			callback.call(this, null);
		}
	};

	Model.prototype.updateStateOutput = function(value, idx, output, cb) {
		if (!output || output.length === 0) {
			output = '0';
		}
		if (this.storage.valueExists(value)) {
			try{
				OutputChanging(output, parseInt(idx));
				this.storage.updateStateOutput(value, idx, output, cb);
			}catch(err){
				$(document).trigger('formfeedback', [
					'error'
				]);
			}
		} else {
			console.log('given state not found');
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			cb = cb || function() {};
			cb.call(this, null);
		}
	};

	Model.prototype.addStateOutput = function(value, output, cb,idx) {
		if (!output || output.length === 0) {
			output = '0';
		}
		if (this.storage.valueExists(value)) {
			try{
				StateChanging();
				this.storage.addStateOutput(value, output, cb);
			}catch(err){
				$(document).trigger('formfeedback', [
					'error'
				]);
			}
		} else {
			console.log('given state not found');
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			cb = cb || function() {};
			cb.call(this, null);
		}
	};

	Model.prototype.removeStateOutput = function(value, idx, cb) {
		OutputRemoving(parseInt(idx));
		if (isNaN(value) || isNaN(idx) ||
		    (this.storage.valueExists(value) === false)) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			cb = cb || function() {};
			cb.call(this, null);
		} else {
			this.storage.removeStateOutput(value, idx, cb);
		}
	};

	/**
	 * Changes a states value.
	 * Since the value is used for identification we need a seperate
	 * function for this.
	 * Refuses to overwrite existing values.
	 * @param {number} oldVal - old value
	 * @param {number} newVal - new value
	 * @param callback - callback
	 */
	Model.prototype.changeValue = function(oldVal, newVal, callback) {
		if (this.storage.valueExists(newVal) && this.storage.valueExists(oldVal)) {
			StateChanging();
			this.storage.changeValue(oldVal, -1, callback);
			this.storage.changeValue(newVal, oldVal, callback);
			this.storage.changeValue(-1, newVal, callback);

			return;
		}
		if (this.storage.valueExists(oldVal)) {
			StateChanging();
			this.storage.changeValue(oldVal, newVal, callback);
		}
	};

	/**
	 * Changes a states name.
	 * @param {number} value - value of the state
	 * @param {number} name - new name
	 * @param callback - callback
	 */
	Model.prototype.changeName = function(value, name, callback) {
		/*if (this.storage.valueExists(name) && this.storage.valueExists(value)) {
			StateChanging();
			this.storage.changeValue(value, -1, callback);
			this.storage.changeValue(name, value, callback);
			this.storage.changeValue(-1, name, callback);

			return;
		}*/
		if (this.storage.valueExists(value)) {
			StateChanging();
			this.storage.changeName(value, name, callback);
		}
	};

	/**
	 * Updates a transition.
	 * @param {number} from - source
	 * @param {number} to - target
	 * @param {string} ud - new data
	 * @param callback - callback
	 */
	Model.prototype.updateTransition = function(from, to, ud, callback) {
		if (ud.hasOwnProperty('source') &&
		    (this.storage.valueExists(ud.source) === false)) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			return;
		} else if (ud.hasOwnProperty('source') &&
		    (ud.source === from)) {
			$(document).trigger('formfeedback', [
			    'warning'
			    ]);
			return;
		}

		if (ud.hasOwnProperty('target') &&
		    (this.storage.valueExists(ud.target) === false)) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			return;
		} else if (ud.hasOwnProperty('target') &&
		    (ud.target === to)) {
			$(document).trigger('formfeedback', [
			    'warning'
			    ]);
			return;
		}

		if (this.storage.valueExists(from) &&
		    this.storage.valueExists(to)) {
			try {
				if (ud.input) {
					TransitionChanging(ud.input);
				}
				this.storage.updateTransition(from, to, ud, callback);
			} catch(err) {
				$(document).trigger('formfeedback', [
					'error'
				]);
			}
		} else {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
		}
	};

	/**
	 * Removes a state.
	 * @param {number} id - unique value
	 * @param callback - callback
	 */
	Model.prototype.removeState = function(id, callback) {
		StateChanging();
		this.storage.removeState(id, callback);
	};

	/**
	 * Removes a transition.
	 * @param source - transition source
	 * @param target - transition target
	 * @param callback - callback
	 */
	Model.prototype.removeTransition = function(source, target, callback) {
		this.storage.removeTransition(source, target, callback);
		TransitionChanged();
	};

	/**
	 * Returns true if a transition with given source and target exists.
	 */
	Model.prototype.transitionExists = function(source, target) {
		return this.storage.transitionExists(source, target);
	};

	Model.prototype.updateParser = function(data) {
		return this.storage.updateParser(data);
	};

	/**
	 * Drops all content of model
	 * @param callback - callback
	 */
	Model.prototype.dropStorage = function(callback) {
		this.storage.drop(callback);
	};

	Model.prototype.getStorage = function() {
		return this.storage.export();
	};

	Model.prototype.import = function (data, cb) {
		var that = this;
		this.storage.import(data, function(db) {
			if (db && db.meta && db.meta.parser) {
				if (db.meta.parser.and) {
					that.parser.and(db.meta.parser.and);
				}
				if (db.meta.parser.or) {
					that.parser.or(db.meta.parser.or);
				}
				if (db.meta.parser.not) {
					that.parser.not(db.meta.parser.not);
				}
			}
		});

		cb.call(this);
	};

	/*
	 * Returns the whole FSM.
	 */
	Model.prototype.getFSM = function() {
		return this.storage.getFSM();
	};

	/**
	 * Removes stored position properties of all states.
	 * @param callback - callback
	 */
	Model.prototype.removePositions = function(handler) {
		return this.storage.removePositions(handler);
		StateChanging();
	};

	/**
	 * Returns the the lowest missing state.
	 * @param stor - the backing storage
	 */
	function firstMissing(stor) {
		let i = 0;
		while (stor.valueExists(i) === true) {
			i++;
		}

		return i;
	}

	window.app = window.app || {};
	window.app.Model = Model;
})(window);
