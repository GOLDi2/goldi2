/* global MathJax */
window.StateDiagram = function(options) {
	'use strict';

	options = options || {};
	var d3 = window.d3;

	var svg = d3.select('#statediagram');	// real svg element
	var dispatch = d3.dispatch('createLink', 'deleteLink', 'selectNode', 'selectLink');
	var force = d3.layout.force();

	/* zooming and panning */
	let canvasZoom = d3.behavior.zoom()
		.scaleExtent([0.3, 8])
		.size([width, height])
		.on('zoom', canvasZoomed);

	var canvas = svg.call(canvasZoom)	// attach zoom handler
		.on('dblclick.zoom', null)	// remove double click handler as we use this to create states
		.append('g');	// create svg:g, because svg:svg is not zoomable, but this container is

	var parser = options.parser;

	var states = null,
		fNodes = null,
		fLinks = null;
	var mousetarget = null;
	var linksource = null;
	var linktarget = null;

	/* configuration */
	var width = svg.node().parentNode.clientWidth,
		height = svg.node().parentNode.clientHeight,
		radius = options.radius || 40,
		layers = {};

	/* input events */
	var selectedNode = null,
		selectedLink = null,
		mousedownNode = null,
		mouseupNode = null,
		dragArc = canvas.append('svg:path')
			.attr('class', 'dragPath hidden')
			.attr('marker-end', 'url(#marker_arrow)');

	/* dragging */
	var dragTransitionLabel = d3.behavior.drag()
		.on('dragstart', () => {
			if (d3.event.sourceEvent.ctrlKey) {	// require ctrl key held
				d3.event.sourceEvent.stopPropagation()
			}
		})
		.on('drag', moveTransitionLabel);

	/**
	 * resets mouse{up,down} states
	 */
	function resetInputVars() {
		mousedownNode = null;
		mouseupNode = null;
	}

	/**
	 * unselects nodes and transitions
	 */
	function unselectAll() {
		canvas.selectAll('*').classed('selected', false);
		selectedLink = null;
		selectedNode = null;
		dispatch.selectNode(null);
		dispatch.selectLink(null);
	}

	/* returns the object containing the value identifier */
	function getNodeByValue(value) {
		let ret;

		ret = fNodes.filter(function(el) {
			return el.value === value;
		})[0];

		return ret;
	}

	/**
	 * Returns the width of the widest child.
	 */
	function widestChild(parent) {
		let ret = 35;	/* min width: 35 px */

		d3.select(parent)
			.selectAll('* > span')
			.each(function() {
				let tmp = Number(this.offsetWidth);
				if (tmp > ret) {
					ret = tmp;
				}
			});

		return ret;
	}

	/**
	 * Returns the angle and side of the point (x, y) relative to the
	 * center of the SVG.
	 * @param {number} x - horizontal position
	 * @param {number} y - vertical position
	 */
	function getAngleCenter(x, y) {
		let dx = width / 2 - x,
			dy = height / 2 - y,
			side = '';

		if (x < width / 2) {
			side = 'left';
		} else {
			side = 'right';
		}

		return { angle: Math.atan(dy/dx), side: side };
	}

	/**
	 * Returns the path for an poiting arc.
	 * @param from - from position
	 * @param to - to position
	 * @param offset - radius/offset, that will be removed from to
	 */
	function linkArc(from, to, offset) {
		//document.getElementById('resolution').innerHTML = 'from: ' + from.x + ' / ' + from.y + '; TO: ' + to.x + ' / ' + to.y ;
		let dx = to.x - from.x,
			dy = to.y - from.y,
			targetX = 0, targetY = 0,
			largeArc = 0,
			sweep = 1,
			dr,
			angle;
		if (offset === undefined) {
			offset = radius;
		}

		if (dx === 0 && dy === 0) {
			let angleCenter = getAngleCenter(to.x, to.y);
			dx = 0.7 * offset;
			dy = 0.7 * offset;
			largeArc = 1;
			sweep = 0;

			/* fine tuning */
			angleCenter.angle -= Math.PI/6;

			if (angleCenter.side === 'right') {
				targetX = to.x + (offset * Math.cos(angleCenter.angle));
				targetY = to.y + (offset * Math.sin(angleCenter.angle));
			} else if (angleCenter.side === 'left') {
				targetX = to.x - (offset * Math.cos(angleCenter.angle));
				targetY = to.y - (offset * Math.sin(angleCenter.angle));
			}
		} else {
			angle = Math.atan(dy / dx);

			if (from.x >= to.x) {
				targetX = to.x + (offset * Math.cos(angle));
				targetY = to.y + (offset * Math.sin(angle));
			} else {
				targetX = to.x - (offset * Math.cos(angle));
				targetY = to.y - (offset * Math.sin(angle));
			}
		}

		dr = 0.8 * Math.sqrt(dx * dx + dy * dy);

		return 'M' + from.x + ',' + from.y + 'A' + dr + ',' + dr + ' 0 ' + largeArc + ',' + sweep + ' ' + targetX + ',' + targetY;
	}

	function linkArcTrans(from, middle, to ,offset) {
		document.getElementById('resolution').innerHTML = 'from: ' + from.x + ' / ' + from.y + '; TO: ' + to.x + ' / ' + to.y ;
		let dx = to.x - from.x,
			dy = to.y - from.y,
			xmiddle = (to.x + from.x)/2,
			ymiddle = (to.y + from.y)/2,
			diff = Math.sqrt(((middle.x - xmiddle)*(middle.x - xmiddle)) + ((middle.y - ymiddle)*(middle.y - ymiddle))),
			targetX = 0, targetY = 0,
			largeArc = 0,
			sweep = 1,
			dr,
			angle;
		if (offset === undefined) {
			offset = radius;
		}

		if (dx === 0 && dy === 0) {
			let angleCenter = getAngleCenter(to.x, to.y);
			dx = 0.7 * offset;
			dy = 0.7 * offset;
			largeArc = 1;
			sweep = 0;

			/* fine tuning */
			angleCenter.angle -= Math.PI/6;

			if (angleCenter.side === 'right') {
				targetX = to.x + (offset * Math.cos(angleCenter.angle));
				targetY = to.y + (offset * Math.sin(angleCenter.angle));
			} else if (angleCenter.side === 'left') {
				targetX = to.x - (offset * Math.cos(angleCenter.angle));
				targetY = to.y - (offset * Math.sin(angleCenter.angle));
			}
		} else {
			angle = Math.atan(dy / dx);

			if (from.x >= to.x) {
				targetX = to.x + (offset * Math.cos(angle));
				targetY = to.y + (offset * Math.sin(angle));
			} else {
				targetX = to.x - (offset * Math.cos(angle));
				targetY = to.y - (offset * Math.sin(angle));
			}
		}

		dr = 0.8 * (diff/100) * Math.sqrt(dx * dx + dy * dy);

		return 'M' + from.x + ',' + from.y + 'A' + dr + ',' + dr + ' 0 ' + largeArc + ',' + sweep + ' ' + targetX + ',' + targetY;
	}

	/** calculates position for the transition label */
	function labelPosition(d, ax) {
		let dx = d.source.x - d.target.x,
			dy = d.source.y - d.target.y,
			angle = Math.atan(dy / dx),
			s = Math.sqrt(dx * dx + dy * dy),
			dr = 0.8 * s,
			h = 0;
		let ret = 0;

		d.width = d.width || 30;	// dirty hack to ensure d has a width

		if (dx === 0 && dy === 0) {
			let angleCenter = getAngleCenter(d.target.x, d.target.y);
			ret = d.target[ax];

			if (angleCenter.side === 'left') {
				if (ax === 'x') {
					ret -= 2 * radius * Math.cos(angleCenter.angle);
				} else if (ax === 'y') {
					ret -= 2 * radius * Math.sin(angleCenter.angle);
				}
			} else {
				if (ax === 'x') {
					ret += 2 * radius * Math.cos(angleCenter.angle);
				} else if (ax === 'y') {
					ret += 2 * radius * Math.sin(angleCenter.angle);
				}
			}

			// position fine-tuning
			if (ax === 'x') {
				// offset depending on width of text
				if (angleCenter.side === 'left') {
					ret -= d.width * Math.cos(Math.abs(angleCenter.angle));
				}
			} else if (ax === 'y') {
				ret -= 17;
			}
		} else {
			h = dr - 0.5 * Math.sqrt(4 * dr * dr - s * s);

			if (d.source.x >= d.target.x) {
				if (ax === 'x') {
					ret = h * Math.sin(angle);
				} else if (ax === 'y') {
					ret = -h * Math.cos(angle);
				}
			} else {
				if (ax === 'x') {
					ret = -h * Math.sin(angle);
				} else if (ax === 'y') {
					ret = h * Math.cos(angle);
				}
			}

			ret = (d.source[ax] + d.target[ax]) / 2 - ret;

			// position fine-tuning
			if (ax === 'x') {
				// offset depending on width of text
				if (d.source.y >= d.target.y) {
					ret -= d.width * Math.sin(Math.abs(angle));
				}
			} else if (ax === 'y') {
				ret -= 7;
			}
		}

		if (isNaN(ret)) {
			ret = 0;
		}

		return ret.toString();
	}

	/**
	 * resizes the <svg> to fill the available space
	 */
	function resize() {
		const margin = { top: 20, right: 10, bottom: 20, left: 10 };
		width = svg.node().parentNode.clientWidth - margin.left - margin.right;
		height = svg.node().parentNode.clientHeight - margin.top - margin.bottom;

		svg.attr('width', width).attr('height', height);
		canvas.attr('width', width).attr('height', height);
		force.size([width, height]);
		canvasZoom.size([width, height]);
	}

	function canvasZoomed() {
		if (!isNaN(d3.event.translate[0]) && !isNaN(d3.event.translate[1]) && !isNaN(d3.event.scale)) {
			canvas.attr('transform', 'translate(' + d3.event.translate + ') scale(' + d3.event.scale + ')');
			resize();
		}
	}

	/**
	 * define marker to be used for transitions
	 */
	(function () {
		const markerData = [ {
			id: 0,
			name: 'arrow',
			path: 'M0,-5L10,0L0,5',
			viewbox: '0 -5 10 10'
		} ];

		canvas.append('defs').selectAll('marker')
			.data(markerData)
			.enter().append('marker')
			.attr('id', function(d) { return 'marker_' + d.name; })
			.attr('viewBox', function(d) { return d.viewbox; })
			.attr('refX', 10)
			.attr('markerWidth', 7)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', function(d) { return d.path; });
	})();

	/**
	 * Dyes the strokes with the color property. On hover darken the color.
	 */
	function setupColor(that, type) {
		if (type === 'state') {
			that
				.selectAll('.stainable')
				.style('stroke', function(d) {
					if (d.color) {
						return d.color;
					} else {
						return '#000000';
					}
				});

			that.on('mouseover.color', function() {
				hoverInColor(d3.select(this).selectAll('.stainable'));
			});

			that.on('mouseout.color', function() {
				hoverOutColor(d3.select(this).selectAll('.stainable'));
			});
		} else if (type === 'transition') {
			that
				.style('stroke', function(d) {
					if (d.color) {
						return d.color;
					} else {
						return '#000000';
					}
				});

			that.on('mouseover.color', function() {
				hoverInColor(d3.select(this));
			});

			that.on('mouseout.color', function() {
				hoverOutColor(d3.select(this));
			});
		}

		return that;
	}

	/**
	 * Generalize color change for hovering in
	 * @param target - target object
	 */
	function hoverInColor(target) {
		target.style('stroke', function(d) {
			if (d.color !== '#000000') {
				return d3.rgb(d.color).darker();
			} else {
				return '#abc';
			}
		});
	}

	/**
	 * Generalize color change for hovering out
	 * @param target - target object
	 */
	function hoverOutColor(target) {
		target.style('stroke', function(d) {
			if (d.color !== '#000000') {
				return d3.rgb(d.color);
			} else {
				return '#000000';
			}
		});
	}

	/**
	 * Handler for keydown events
	 */
	function onKeydown(handler) {
		d3.select(window).on('keydown', function() {
			if (d3.event.target.tagName === 'INPUT') {
				// we don't want to overwrite <input>s
				return;
			}
			if (d3.select('.selected')) {
				switch (d3.event.keyCode) {
					case 46:	//delete
						if(!editable){
							return;
						}
						if (selectedLink) {
							handler('remove', 'transition',
								selectedLink.source.value,
								selectedLink.target.value);
						} else if (selectedNode) {
							handler('remove', 'node', canvas.select('.selected').attr('index'));
						}
						unselectAll();
						d3.event.preventDefault();
						break;
					case 17: // ctrl
						states.call(force.drag);
						d3.event.stopPropagation();
						break;
					case 82: // r
						handler('reposition');
						d3.event.stopPropagation();
				}
			}
		});
	}

	/**
	 * Handler for keyup events
	 */
	function onKeyup() {
		d3.select(window).on('keyup', function() {
			if (d3.select('.selected')) {
				switch (d3.event.keyCode) {
					case 17: // ctrl
						states.on('mousedown.drag', null);
						break;
				}
			}
		});
	}

	/**
	 * Calls the handler with updated position coordinates for nodes.
	 */
	function pushNodeCoords(handler) {
		let ret = [],
		nodes = force.nodes();

		for (let i = 0; i < nodes.length; i++) {
			ret.push({
				val: nodes[i].value,
				x: nodes[i].x,
				y: nodes[i].y,
				fixed: nodes[i].fixed
			});
		}
		handler.call(this, ret);
	}

	/**
	 * Calls the handler with updated position coordinates for transition
	 * labels.
	 */
	function pushLabelCoords(handler) {
		let ret = [];

		dragTransitionLabel.on('dragend.pushLabelCoords', function(d) {
			ret.push({
				from: d.source.index,
				to: d.target.index,
				x: d.position.x,
				y: d.position.y
			});
			handler.call(this, ret);
		});
	}

	/**
	 * Handler für mousemove events
	 */
	function onMousemove() {
		/* jshint validthis:true */
		if (mousedownNode !== null) {
			if (mousetarget == 'transition') {
				/* register cursor movement */
				mousedownNode.movement++;

				/* draw drag Arc */
				dragArc.attr('d', linkArcTrans(linksource, {
					x: d3.mouse(canvas.node())[0],
					y: d3.mouse(canvas.node())[1]
				},linktarget, 0))
					.classed('hidden', false);
			} else {
				/* register cursor movement */
				mousedownNode.movement++;

				/* draw drag Arc */
				dragArc.attr('d', linkArc(mousedownNode, {
					x: d3.mouse(canvas.node())[0],
					y: d3.mouse(canvas.node())[1]
				}, 0))
					.classed('hidden', false);
			}
		}
	}

	/**
	 * Handler for mouseup events
	 */
	function onMouseup() {
		resetInputVars();
		dragArc.classed('hidden', true);
	}

	/**
	 * Handler for touch events
	 */

	/*function touchStatus() {
		d3.event.preventDefault();
		d3.event.stopPropagation();
		var d = d3.touches(this);
		d3.select("#touchStatus")
			.select("ol")
			.selectAll("li")
			.data(d)
			.enter()
			.append("li");

		d3.select("#touchStatus")
			.select("ol")
			.selectAll("li")
			.data(d)
			.exit()
			.remove();

		d3.select("#touchStatus")
			.select("ol")
			.selectAll("li")
			.html(function(d) {return d});

	}
*/
	/**
	 * Selects resp. de-selects states on click events
	 */
	function onClickStates(s) {
		/* jshint validthis:true */
		if (d3.event.ctrlKey) {
			return;
		}
		if (selectedNode === s) {
			unselectAll();
		} else {
			unselectAll();
			selectedNode = s;
			d3.select(this).classed('selected', true);
			dispatch.selectNode(s);
		}
		d3.event.stopPropagation();
	}

	/**
	 * Starts the dragging between two states to form a transition.
	 */
	function onMousedownStates(s) {
		/* jshint validthis:true */

		mousetarget = 'state';

		if (d3.event.ctrlKey || !editable) {
			return;
		}
		mousedownNode = s;
		mousedownNode.movement = 0;
		d3.event.stopPropagation();
	}

	/**
	 * Starts the dragging a transition.
	 */
	function onMousedownTrans(s) {
		/* jshint validthis:true */

		mousetarget = 'transition';

		if (!d3.event.ctrlKey || !editable) {
			return;
		}
		linksource = s.source;
		linktarget = s.target;
		mousedownNode = {
			x: d3.mouse(canvas.node())[0],
			y: d3.mouse(canvas.node())[1]
		};
		mousedownNode.movement = 0;
		d3.event.stopPropagation();
	}

	/**
	 * Finishes the dragging between two states to form a transition.
	 */
	function onMouseupStates(s) {
		/* jshint validthis:true */
		if (!mousedownNode || d3.event.ctrlKey) {
			return;
		}

		mouseupNode = s;
		if (mousedownNode.movement < 3) {
			/* cursor was not moved */
			resetInputVars();
			return;
		}
		d3.event.stopPropagation();

		dispatch.createLink(mousedownNode.value, mouseupNode.value);
		resetInputVars();
		dragArc.classed('hidden', true);
	}

	function onMouseupTrans() {
		/* jshint validthis:true */
		if (!mousedownNode || !d3.event.ctrlKey) {
			return;
		}

		mouseupNode = {
			x: d3.mouse(canvas.node())[0],
			y: d3.mouse(canvas.node())[1]
		};
		if (mousedownNode.movement < 3) {
			/* cursor was not moved */
			resetInputVars();
			return;
		}
		d3.event.stopPropagation();

		//dispatch.createLink(mousedownNode.value, mouseupNode.value);
		resetInputVars();
		dragArc.classed('hidden', true);
	}

	/**
	 * Selects resp. de-selects links on click events
	 */
	function onClickLinks(l) {
		/* jshint validthis:true */
		if (selectedLink === l) {
			unselectAll();
		} else {
			unselectAll();
			selectedLink = l;
			d3.select(this).classed('selected', true);
			dispatch.selectLink(l);
		}
		d3.event.stopPropagation();
	}

	/**
	 * Selects resp. de-selects links on click events on link labels
	 */
	function onClickLabels(l) {
		/* jshint validthis:true */
		if (selectedLink === l) {
			unselectAll();
		} else {
			unselectAll();
			selectedLink = l;
			d3.select('#t_' + l.source.value + '_' + l.target.value)
				.classed('selected', true);
			dispatch.selectLink(l);
		}
		d3.event.stopPropagation();
	}

	/**
	 * Sets the transition enter selection up.
	 */
	function onEnterTransitions() {
		/* jshint validthis:true */

		if (this.node() === null) {	// require at least one node
			return;
		}

		this.attr('class', 'linkPath stainable')
			.attr('id', function(d) {
				return 't_' + d.source.value + '_' + d.target.value;
			})
			.attr('marker-end', 'url(#marker_arrow)')
			.on('mousedown.base', onMousedownTrans)
			.on('mouseup.base', onMouseupTrans)
			.on('click.base', onClickLinks)
			.on('mouseover', function(d) {
				canvas.select('#t_' + d.source.value + '_' + d.target.value)
					.classed('hovered', true);
				canvas.select('#l_' + d.source.value + '_' + d.target.value)
					.classed('hovered', true);
			})
			.on('mouseout', function() {
				canvas.selectAll('*').classed('hovered', false);
			});

		this.call(setupColor, 'transition');
	}

	function onUpdateTransitions() {
		/* jshint validthis:true */
		this.call(setupColor, 'transition');

		this.attr('id', function(d) {
			return 't_' + d.source.value + '_' + d.target.value;
		});
	}

	/**
	 * Sets the transition label enter selection up.
	 */
	function onEnterTransitionLabels() {
		/* jshint validthis:true */
		if (this.node() === null) {	// require at least one node
			return;
		}

		let id = '';
		let label_id = '';
		let transition_id = '';
		let elt = null;

		this.each(function(d) {
			id = d.source.value.toString() + '_' + d.target.value.toString();
			label_id = 'l_' + id;
			transition_id = 't_' + id;
			elt = d3.select(this);

			elt.attr('class', 'linkLabel')
				.attr('id', label_id)
				.on('mouseover', (d) => {
					hoverInColor(canvas.select('#' + transition_id));
					canvas.select('#' + label_id)
						.classed('hovered', true);
					canvas.select('#' + transition_id)
						.classed('hovered', true);
				})
				.on('mouseout', (d) => {
					hoverOutColor(canvas.select('#' + transition_id));
					canvas.selectAll('*').classed('hovered', false);
				})
				.on('click.base', onClickLabels)
				.call(dragTransitionLabel)
				.append('foreignObject')
				.attr({
					'width': 200,
					'height': '1.5em',
					'x': 0,
					'y': 0,
					'class': 'linkLabelText'
				})
				.append('xhtml:span')
				.text((d) => {
					if (d.shortened) {
						return '$h_{' + id + '}$';
					} else {
						return '$' + parser.toTeX(d.input) + '$';
					}
				});

			MathJax.Hub.Queue(
				['Typeset', MathJax.Hub, this],
				[function() {		// storing width
					d3.select('#' + label_id)
						.each(function(d) {
							d.width = d.width || 35;
							d.width = Math.max(d.width, widestChild(this));
						});
				}],
				[function() {		// setting width
					d3.select('#' + label_id)
						.select('.linkLabelText')
						.attr('width', function(d) {
							return d.width;
						});
				}]
			)

		});
	}

	function onUpdateTransitionLabels() {
		/*jshint validthis:true */
		this.each(function(d) {
			const re = /.*\$(.+)\$.*/;	// reg exp to get inner math out of TeX
			const id = 'l_' + d.source.value + '_' + d.target.value;	// id of transition label
			const jax = MathJax.Hub.getAllJax(id)[0];

			let newtex = '';
			let newmath = '';
			let needsUpdate = false;

			d3.select(this).select('.linkLabel').attr('id', id);

			if (d.shortened) {
				newtex = '$h_{' + d.source.value + d.target.value + '}$';
			} else {
				newtex = '$' + parser.toTeX(d.input) + '$';
			}

			newmath = newtex.replace(re, "$1");

			if (jax === undefined || jax === null) {
				needsUpdate = true;
				d3.select(this).select('.linkLabelText > span').text(newtex);
			} else if (jax.originalText !== newmath) {
				needsUpdate = true;
				d3.select(this).select('.linkLabelText > span').text(newtex);
			}

			if (needsUpdate) {
				MathJax.Hub.Queue(
					['Typeset', MathJax.Hub, document.getElementById(id)],	// typesetting
					[function() {		// storing width
						d3.select('#' + id)
							.each(function(d) {
								d.width = d.width || 35;
								d.width = Math.max(d.width, widestChild(this));
							});
					}],
					[function() {		// setting width
						d3.select('#' + id)
							.select('.linkLabelText')
							.attr('width', function(d) {
								return d.width;
							});
					}]
				);
			}
		});
	}

	/**
	 * Returns an output label that adapts to its length.
	 * @param {array} output - boolean expressions
	 */
	function generateOutputLabel(output) {
		let ret = '[$',
			nouts = 0,
			totallength = 0;

		if (!Array.isArray(output)) {	// output has to be an array
			return '';
		}
		if (!output.length) {	// fallback default
			return '$y = 0$';
		} else {
			nouts = output.length;
		}

		for (let i = 0; i < nouts; i++) {
			totallength += output[i].length;	// expression
			if (i !== 0) {
				totallength += 2;	// commas, spacing
			}
		}

		if (nouts > 3) {	// too many variables
			return '$y$';
		} else {
			// we start with the highest order
			for (let i = (nouts - 1); i >= 0; i--) {
				let yname =  getYName("y" + i);
				if (yname == "y" + i){	//totallength > 5) {
					ret += 'y_' + i;
				} else {
					ret += yname;
				}
				//} else {
				//	ret += output[i];
				//}

				if (i !== 0) {
					ret += ', ';
				}
				if (ret.length > 12) {
					return '$y$';
				}
			}
		}

		return ret + '$]';
	}

	function moveTransitionLabel(d) {
		/* jshint validthis:true */
		if (!(d3.event.sourceEvent.ctrlKey)) {	// require ctrl key held
			return;
		}
		d3.select(this).attr('transform', function(d) {
			return 'translate(' + d3.event.x + ',' +
			    d3.event.y + ')';
			    });
		d.position = {};
		d.position.x = d3.event.x;
		d.position.y = d3.event.y;
	}

	/**
	 * Sets the states/nodes enter selection up.
	 */
	function onEnterStates() {
		/* jshint validthis:true */

		if (this.node() === null) {	// require at least one node
			return;
		}

		this.attr('class', 'node')
			.attr('index', function(d) { return d.value; });
		this.on('click.base', onClickStates);
		this.on('mousedown.base', onMousedownStates);
		this.on('mouseup.base', onMouseupStates);

		this.append('circle')
			.attr('r', radius)
			.attr('class', 'stainable');

		this.append('line')
			.attr('x1', -radius )
			.attr('y1', 0)
			.attr('x2', radius)
			.attr('y2', 0)
			.attr('class', 'stainable');

		this.append('foreignObject')
			.attr({
				'width': 2 * radius,
				'height': radius,
				'x': -radius,
				'y': - 0.8 * radius,
				'class': 'outside-center'
			})
			.append('xhtml:div')
			.attr('class', 'stateLabel inside-center')
			.text(function(d) {
				if ((d.name === '') || (d.name === undefined)) {
					return '$ Z_{' + d.value + '}$';
				} else {
					return d.name;
				}
			} );

		this.append('foreignObject')
			.attr({
				'width': 2 * radius,
				'height': radius,
				'x': -radius,
				'y': 0.1 * radius,
				'class': 'outside-center'
			})
			.append('xhtml:div')
			.attr('class', 'outputLabel inside-center')
			.text(function(d) {
				return  parser.toTeX(generateOutputLabel(d.output));
			});

		this.call(setupColor, 'state');
		this.each(function() {
			MathJax.Hub.Queue(['Typeset', MathJax.Hub, this]);
		});
	}

	/**
	 * Refresh the nodes update selection.
	 */
	function onUpdateStates() {
		/* jshint validthis:true */
		this.each(function(d) {
			const classes = ['.outputLabel', '.stateLabel'];
			const re = /.*\$(.+)\$.*/;

			let needsUpdate = false;
			let jax = null;
			let newtex = '';
			let newmath = '';

			for (let c of classes) {
				jax = MathJax.Hub.getAllJax(qs(c, this))[0];

				if (c === '.outputLabel') {
					newtex = parser.toTeX(generateOutputLabel(d.output));
				} else if (c === '.stateLabel') {
					if ((d.name === '') || (d.name === undefined)) {
						newtex = '$Z_{' + d.value + '}$';
					} else {
						newtex = d.name;
					}
				}

				newmath = newtex.replace(re, "$1");

				if (jax === undefined || jax === null) {
					needsUpdate = true;
					d3.select(this).select(c).text(newtex);
				} else if (jax.originalText !== newmath) {
					needsUpdate = true;
					d3.select(this).select(c).text(newtex);
				}
			}

			if (needsUpdate) {
				MathJax.Hub.Queue(['Typeset', MathJax.Hub, this]);
			}
		});

		this.call(setupColor, 'state');
	}

	/**
	 * Organize the transitions
	 */
	layers.transitions = function() {
		let transitions = canvas.selectAll('.linkPath')
			.data(fLinks);
		let enteringTransitions = transitions.enter()
			.insert('path', '.node');	// prepend lines, so they are below states
		transitions.exit().remove();
		enteringTransitions.call(onEnterTransitions);
		transitions.call(onUpdateTransitions);

		return transitions;
	};

	/**
	 * Organize the transition labels
	 */
	layers.transitionLabels = function() {
		let transitionLabels = canvas.selectAll('.linkLabel')
			.data(fLinks);
		transitionLabels.call(onUpdateTransitionLabels);
		let enteringTransitionLabels = transitionLabels.enter()
			.insert('g', '.node');
		transitionLabels.exit().remove();

		enteringTransitionLabels.call(onEnterTransitionLabels);

		return transitionLabels;
	};

	/**
	 * Organize the states
	 */
	layers.states = function() {
		/* TODO: key function should only be d.value, but without
		 * d.color the color won't be updated in onUpdateStates */
		let states = canvas.selectAll('.node')
			.data(fNodes, function(d) { return d.value + d.color; });
		let enteringStates = states.enter().append('g');
		states.exit().remove();
		states.call(onUpdateStates);
		enteringStates.call(onEnterStates);

		return states;
	};

	function exports(fsm, preserveSelected) {
		fNodes = fsm.states;
		fLinks = mapFsmToFLinks(fsm.transitions);

		force = force
			.charge(-800)
			.linkDistance(5 * radius)
			.chargeDistance(9 * radius)
			.gravity(0.04)
			.alpha(0.6)
			.size([width, height])
			.nodes(fNodes)
			.links(fLinks);

		if (!preserveSelected) {
			unselectAll();
		} else {
			/* update data for view */
			if (selectedNode !== null) {
				dispatch.selectNode(selectedNode);
			} else if (selectedLink !== null) {
				dispatch.selectLink(selectedLink);
			}
		}

		force.drag().on('dragstart', function(d) {
			d3.select(this).classed('fixed', d.fixed = true);
			d3.event.sourceEvent.stopPropagation();
		});

		resize();
		/* starts force calculation and sets suitable defaults for missing data */
		force.start();
		/* get updated data */
		fNodes = force.nodes();
		fLinks = force.links();

		let transitions = layers.transitions();
		let transitionLabels = layers.transitionLabels();
		states = layers.states();

		/** Update drawings on every tick */
		force.on('tick', function() {
			transitions.attr('d', function(d) {
				return linkArc(d.source, d.target);
			});

			transitionLabels
				.attr('transform', function(d) {
					if (d.position) {
						return 'translate(' +
						    d.position.x +
						    ',' +
						    d.position.y + ')';
					} else {
						return 'translate(' +
						    labelPosition(d, 'x') +
						    ',' +
						    labelPosition(d, 'y') + ')';
					}
				});

			states.attr('transform', function(d) {
				return 'translate(' + d.x + ',' + d.y + ')';
			});
		});

		d3.select(window).on('resize', function() {
			resize();
			force.size([width, height]).resume();
		});
	}

	/* Renames keys to fit into D3js Force Links */
	function mapFsmToFLinks(transitions) {
		let links = [];

		for (let i = 0; i < transitions.length; i++) {
			let el = {};

			el.source = getNodeByValue(transitions[i].source);
			el.target = getNodeByValue(transitions[i].target);
			el.input = transitions[i].input;
			el.color = transitions[i].color;
			if (transitions[i].shortened !== undefined) {
				el.shortened = transitions[i].shortened;
			}
			if (transitions[i].x && transitions[i].y) {
				el.position = {
					x: transitions[i].x,
					y: transitions[i].y
				};
			}
			links.push(el);
		}

		return links;
	}

	/* Sets or gets width. */
	exports.width = function(newWidth) {
		if (!arguments.length) {
			return width;
		}
		width = newWidth;
		resize();

		return exports;
	};

	/* Sets or gets height */
	exports.height = function(newHeight) {
		if (!arguments.length) {
			return height;
		}
		height = newHeight;
		resize();

		return exports;
	};

	exports.radius = function(newRadius) {
		if (!arguments.length) {
			return radius;
		}
		radius = newRadius;
		canvas.selectAll('circle').attr('r', radius);

		return exports;
	};


	/**
	 * Handle bindings sent from the view
	 */
	exports.bind = function(event, handler) {
		if (event === 'addState') {
			svg.on('dblclick.addState', function() {
				if (d3.event.defaultPrevented) {
					console.log('Adding a state ignored. I\'m guessing this is a drag.');
					return;	/* ignore drag */
				}
				if (d3.event.ctrlKey) {
					console.log('Adding a state ignored. You hold the Ctrl key.');
					return;
				}
				let point = d3.mouse(canvas.node());
				handler(Math.round(point[0]),
					Math.round(point[1]));
			});
		} else if (event === 'addLink') {
			dispatch.on('createLink', function(source, target) {
				handler(source, target);
			});
		} else if (event === 'selectNode') {
			dispatch.on('selectNode', function(node) {
				handler(node);
			});
		} else if (event === 'selectLink') {
			dispatch.on('selectLink', function(link) {
				handler(link);
			});
		} else if (event === 'keyDown') {
			onKeydown(handler);
		} else if (event === 'keyUp') {
			onKeyup(handler);
		} else if (event === 'getNodeCoords') {
			force.on('start.pushNodeCoords',
					pushNodeCoords.bind(this, handler));
			force.on('end.pushNodeCoords',
					pushNodeCoords.bind(this, handler));
			svg.on('click.pushNodeCoords',
					pushNodeCoords.bind(this, handler));
		} else if (event === 'getLabelCoords') {
			pushLabelCoords(handler);
		}
	};

	svg.on('mousemove.base', onMousemove)
		.on('mouseup.base', onMouseup)
		.on('click.base', function() {
			if (d3.event.target.tagName === 'svg' ||
				d3.event.target.tagName === 'SVG') {
				unselectAll();
			}
		});

	return exports;
};
