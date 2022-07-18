/**
 * Represents the storage. Uses localStorage.
 * @constructor
 * @param {string} name - human-readable name
 * @parma callback - callback
 */
function Store(name, callback) {
	callback = callback || function() {};

	this._dbName = name;

	if (Store.readFromLocalStorage(name) == undefined) {
		var data = {
			states: [],
			transitions: [],
			meta: {}
		};

		Store.writeToLocalStorage(name,data);
		/* TODO: sanity check of data */
	}

	callback.call(this, Store.readFromLocalStorage(name));
}

(function(window) {
	'use strict';

	Store.readFromLocalStorage = function(key) {
		const tmp = localStorage.getItem("gift");
		if (tmp === null)
			return undefined;
		return JSON.parse(tmp)[key];
	};

	Store.writeToLocalStorage = function(key, value) {
		let gift = localStorage.getItem("gift");
		if (gift === null){
			gift = {};
		} else {
			gift = JSON.parse(gift);
		}

		gift[key] = value;
		localStorage.setItem("gift",JSON.stringify(gift));
	};

	/**
	 * Saves a state to storage.
	 * @param updateData - object to be stored
	 * @param callback - callback
	 * @param value - unique value
	 */
	Store.prototype.saveState = function(updateData, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states,
		    state = null;

		callback = callback || function() {};

		state = states.filter(function(s) {
			return s.value === updateData.value;
		});

		if (state.length === 0) {
			states.push(updateData);
			Store.writeToLocalStorage(this._dbName, data);
			callback.call(this, [updateData]);
		} else {
			callback.call(this, null);
		}
	};

	/* Updates the state identified by id.
	 * If a value is undefined, it will not be changed. Otherwise the value
	 * will be overwritten – even null will be written!
	 * @param {number} id - uniqe value
	 * @param ud - update data object
	 */
	Store.prototype.updateState = function(ud, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states,
		    state = null;

		callback = callback || function() {};

		state = states.filter(function(s) {
			return s.value === ud.value;
		})[0];

		if (ud.x !== undefined) {
			state.x = ud.x;
		}
		if (ud.y !== undefined) {
			state.y = ud.y;
		}
		if (ud.name !== undefined) {
			state.name = ud.name;
		}
		if (ud.fixed !== undefined) {
			state.fixed = ud.fixed;
		}
		if (ud.color !== undefined) {
			state.color = ud.color;
		}

		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	Store.prototype.updateStateOutput = function(value, idx, output, cb) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states;
		let state = null;

		cb = cb || function() {};

		state = states.filter(function(s) {
			return s.value === value;
		})[0];

		state.output[idx] = output;

		Store.writeToLocalStorage(this._dbName,data);
		cb.call();
	};

	Store.prototype.addStateOutput = function(value, output, cb) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states;
		let state = null;

		cb = cb || function() {};

		state = states.filter(function(s) {
			return s.value === value;
		})[0];

		state.output.push(output);

		Store.writeToLocalStorage(this._dbName,data);
		cb.call();
	};

	Store.prototype.removeStateOutput = function(value, idx, cb) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states;
		let state = null;

		cb = cb || function() {};

		state = states.filter(function(s) {
			return s.value === value;
		})[0];

		if (idx > 0) {
			state.output.splice(idx, 1);
		} else {
			state.output[idx] = '0';
		}

		Store.writeToLocalStorage(this._dbName,data);
		cb.call();
	};

	/**
	 * Changes a states name.
	 * @param {number} value - value of the state
	 * @param {number} name - new name
	 * @param callback - callback
	 */
	Store.prototype.changeName = function(value, name, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states;
		let transitions = data.transitions;
		let state = null;

		/* check input */
		if (isNaN(value)) {
			return;
		}

		callback = callback || function() {};

		state = states.filter(function(s) {
			return s.value === value;
		});

		if (state.length > 1) {
			$(document).trigger('formfeedback', [
				'error'
			]);
			console.log('deny overwriting existing state');
			return;
		}

		state[0].name = name;

		$(document).trigger('formfeedback', [
			'success'
		]);
		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
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
	Store.prototype.changeValue = function(oldVal, newVal, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states,
		    transitions = data.transitions,
		    state = null;

		/* check input */
		if (isNaN(oldVal) || isNaN(newVal)) {
			return;
		}

		callback = callback || function() {};

		state = states.filter(function(s) {
			return s.value === oldVal;
		});

		if (state.length > 1) {
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
			console.log('deny overwriting existing state');
			return;
		}

		state[0].value = newVal;

		// update relevant transitions
		for (let t = 0; t < transitions.length; t++) {
			if (transitions[t].source === oldVal) {
				transitions[t].source = newVal;
			}
			if (transitions[t].target === oldVal) {
				transitions[t].target = newVal;
			}
		}

		$(document).trigger('formfeedback', [
		    'success'
		    ]);
		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	/**
	 * Saves a transition to storage.
	 * @param {number} source - source value/id
	 * @param {number} target - target value/id
	 * @param {string} input - input expression
	 * @param callback - callback
	 *
	 */
	Store.prototype.saveTransition = function(source, target, input, color, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let transitions = data.transitions,
		    transition = null;

		transition = transitions.filter(function(t) {
			return t.source === source && t.target === target;
		});

		if (transition.length === 0) {
			transitions.push({
				source: source,
				target: target,
				input: input || '0',
				color: color || '#000000',
			});

			Store.writeToLocalStorage(this._dbName,data);
			callback.call(this);
		} else {
			console.log('transition exists, deny overwriting');
			$(document).trigger('formfeedback', [
			    'error'
			    ]);
		}
	};

	/* Updates the transition.
	 * If a value is undefined, it will not be changed. Otherwise the value
	 * will be overwritten – even null will be written!
	 * @param {number} source - source value/id
	 * @param {number} target - target value/id
	 * @param ud - new data
	 * @param callback - callback
	 */
	Store.prototype.updateTransition = function(from, to, ud, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let transitions = data.transitions,
		    transition = null;

		/* check input */
		if (isNaN(from) || isNaN(to)) {
			return;
		}

		callback = callback || function() {};

		transition = transitions.filter(function(t) {
			return t.source === from && t.target === to;
		})[0];

		if (transition) {
			if (ud.input) {
				transition.input = ud.input || '0';
			}

			if (ud.source !== undefined) {
				transition.source = Number(ud.source);
			}

			if (ud.target !== undefined) {
				transition.target = Number(ud.target);
			}

			if (ud.color) {
				transition.color = ud.color || '#000000';
			}

			if (ud.shortened !== undefined) {
				transition.shortened = ud.shortened || false;
			}

			if (ud.x && ud.y) {
				transition.x = ud.x;
				transition.y = ud.y;
			}

		}

		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	/**
	 * Returns true if a state with given value exists.
	 * @param {number} val - value to be searched
	 */
	Store.prototype.valueExists = function(val) {
		let states = Store.readFromLocalStorage(this._dbName).states;
		let ret = false;

		val = Number(val);
		for (let s = 0; s < states.length; s++) {
			if (states[s].value === val) {
				ret = true;
			}
		}

		return ret;
	};

	/**
	 * Returns true if a transition with given source and target exists.
	 */
	Store.prototype.transitionExists = function(source, target) {
		let transitions = Store.readFromLocalStorage(this._dbName).transitions;
		let ret = false;

		source = Number(source);
		target = Number(target);
		for (let i = 0; i < transitions.length; i++) {
			if (transitions[i].source === source &&
			    transitions[i].target === target) {
				ret = true;
			}
		}

		return ret;
	};

	/*
	 * Returns the whole FSM.
	 */
	Store.prototype.getFSM = function() {
		const fsm = Store.readFromLocalStorage(this._dbName);

		for (let s = 0; s < fsm.states.length; s++) {
			fsm.states[s].index = Number(fsm.states[s].index);
			fsm.states[s].value = Number(fsm.states[s].value);
		}

		return fsm;
	};

	/* Removes an item based on the id/value and all of the transitions
	 * going to or from this node.
	 * @param {number} id - unique value
	 * @param callback - callback
	 */
	Store.prototype.removeState = function (id, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states,
		    transitions = data.transitions;

		/* remove related transitions */
		for (let i = 0; i < transitions.length; i++) {
			if (transitions[i].source === id ||
			    transitions[i].target === id) {
				transitions.splice(i, 1);
				i--;	// adapt as the indices are reordered
			}
		}

		/* remove state */
		for (let i = 0; i < states.length; i++) {
			if (states[i].value === id) {
				states.splice(i, 1);
				break;
			}
		}

		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	/**
	 * Removes a transition which is identified by source and target.
	 * @param source - source of transition
	 * @param target - target of the transition
	 * @param callback - callback
	 */
	Store.prototype.removeTransition = function (source, target, callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let transitions = data.transitions;

		callback = callback || function() {};

		for (let i = 0; i < transitions.length; i++) {
			if (transitions[i].source === source &&
			    transitions[i].target === target) {
				transitions.splice(i, 1);
				continue;
			}
		}

		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	/**
	 * Removes stored position properties of all states.
	 * @param callback - callback
	 */
	Store.prototype.removePositions = function(callback) {
		let data = Store.readFromLocalStorage(this._dbName);
		let states = data.states;
		let transitions = data.transitions;

		for (let i = 0; i < states.length; i++) {
			delete states[i].x;
			delete states[i].y;
			delete states[i].fixed;
		}

		for (let i = 0; i < transitions.length; i++) {
			delete transitions[i].position;
			delete transitions[i].x;
			delete transitions[i].y;
		}

		Store.writeToLocalStorage(this._dbName,data);
		callback.call(this, Store.readFromLocalStorage(this._dbName).states);
	};

	Store.prototype.updateParser = function(parserdata) {
		let data = Store.readFromLocalStorage(this._dbName);
		let meta = data.meta;

		meta.parser = {
			and: parserdata.and,
			or:  parserdata.or,
			not: parserdata.not
		};

		Store.writeToLocalStorage(this._dbName,data);
	};

	/**
	 * Drops all content of our localStorage.gift
	 * @param callback - callback
	 */
	Store.prototype.drop = function(callback) {
		Store.writeToLocalStorage(this._dbName,{
			states: [],
			transitions: [],
			meta: {}
		});

		callback.call(this);
	};

	Store.prototype.export = function() {
		return Store.readFromLocalStorage(this._dbName);
	};

	Store.prototype.import = function(data, callback) {
		Store.writeToLocalStorage(this._dbName,JSON.parse(data));
		callback.call(this, JSON.parse(data));
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
