/* tslint:disable:max-line-length */
import { html } from "@polymer/polymer/polymer-legacy.js";
import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import * as d3 from "d3";
import { SaneVennDiagram } from "./sane-venn-diagram.js";

/**
 * Class for drawing and adding functions to diagram.
 */
class SaneVennDiagramSvg extends PolymerElement {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					user-select: none;
					-webkit-user-select: none; /* Chrome all / Safari all */
					-moz-user-select: none; /* Firefox all */
					-ms-user-select: none; /* IE 10+ */
				}

				/*set diagram width depending on display resolution*/
				#svg {
					width: 100%;
					height: auto;
				}

				/* Small devices (portrait tablets and large phones, 600px and up) */
				@media only screen and (min-width: 600px) {
					#svg {
						width: 100%;
						height: auto;
					}
				}

				/* Medium devices (landscape tablets, 768px and up) */
				@media only screen and (min-width: 768px) {
					#svg {
						width: 90%;
						height: auto;
					}
				}

				/* Large devices (laptops/desktops, 992px and up) */
				@media only screen and (min-width: 992px) {
					#svg {
						width: 80%;
						height: auto;
					}
				}

				/* Large devices (laptops/desktops, 992px and up) */
				@media only screen and (min-width: 1200px) {
					#svg {
						width: 65%;
						height: auto;
					}
				}

				/*for Dual View*/
				@media only screen and (min-width: 1366px) {
					#svg {
						width: 100%;
						height: auto;
					}
				}

				/* style for sets*/
				.set {
					fill: #ffffff;
					opacity: 0;
				}

				.set:hover {
					fill: rgba(78, 78, 75, 0.5);
					opacity: 0.6;
				}
				.elementText {
					font-size: 17px;
				}
				.setText {
					font-size: 25px;
				}
			</style>
			<svg
					xmlns="http://www.w3.org/2000/svg"
					id="svg"
					version="1.1"
					viewBox="0 0 800 770"
					height="770"
					width="800">
				<g
						style="display:inline"
						transform="translate(0,-93.27082)"
						id="layer1">
					<rect
							y="93.270836"
							x="0"
							height="770"
							width="800"
							id="background"
							style="fill:#e6e6e6;fill-opacity:1;stroke:none;stroke-width:0px;
							stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
				</g>
				<g
						style="display:inline"
						id="layer2">
					<circle
							id="circleTwo"
							cx="518"
							cy="283.605"
							r="233"
							style="fill:none;fill-opacity:1;stroke:#06ff00;stroke-width:4px"
					/>
					<circle
							id="circleThree"
							cx="398.881"
							cy="486.48633"
							r="233"
							style="display:inline;fill:none;fill-opacity:1;stroke:#0029ff;stroke-width:4px"
					/>
					<circle
							id="circleOne"
							cx="283.605"
							cy="283.605"
							r="233"
							style="fill:none;fill-opacity:1;stroke:#fe0000;stroke-width:4px"
					/>
				</g>
				<g
						class="set"
						style="display:inline">
					<path
							id="set0"
                            d="M 0,0 V 770 H 800 V 0 Z M 282.86914,51.40625 A 232.61534,233.98266 44.999957 0 1 299.37305,51.863281 232.61534,233.98266 44.999957 0 1 401.01953,82.912109 232.61534,233.98266 44.999957 0 1 532.67383,51.863281 232.61534,233.98266 44.999957 0 1 749.3457,299.4082 232.61534,233.98266 44.999957 0 1 632.38867,486.35742 232.61534,233.98266 44.999957 0 1 631.86133,502.09375 232.61534,233.98266 44.999957 0 1 383.04102,720.2207 232.61534,233.98266 44.999957 0 1 165.89844,486.66602 232.61534,233.98266 44.999957 0 1 50.554688,269.99023 232.61534,233.98266 44.999957 0 1 282.86914,51.40625 Z"/>
				</g>
				<g class="set">
					<path
							id="set2"
							d="M 516.16992,51.40625 A 232.61534,233.98266 44.999957 0 0 401.01758,82.912109 232.61534,233.98266 44.999957 0 1 516.28125,285.28516 232.61534,233.98266 44.999957 0 1 632.38672,486.42188 232.61534,233.98266 44.999957 0 0 749.3457,299.4082 232.61534,233.98266 44.999957 0 0 532.67383,51.863281 232.61534,233.98266 44.999957 0 0 516.16992,51.40625 Z"/>
				</g>
				<g class="set">
					<path
							id="set3"
							d="M 398.88086,486.48633 A 232.61534,233.98266 44.999957 0 1 267.22656,517.53516 232.61534,233.98266 44.999957 0 1 165.89844,486.66602 232.61534,233.98266 44.999957 0 0 383.04102,720.2207 232.61534,233.98266 44.999957 0 0 631.86133,502.09375 232.61534,233.98266 44.999957 0 0 632.13477,486.51758 232.61534,233.98266 44.999957 0 1 500.52539,517.53516 232.61534,233.98266 44.999957 0 1 398.88086,486.48633 Z"/>
				</g>
				<g class="set">
					<path
							id="set1"
							d="M 282.86914,51.40625 A 232.61534,233.98266 44.999957 0 0 50.554688,269.99023 232.61534,233.98266 44.999957 0 0 165.89258,486.8457 232.61534,233.98266 44.999957 0 1 166.36914,472.67578 232.61534,233.98266 44.999957 0 1 283.60547,285.55273 232.61534,233.98266 44.999957 0 1 283.85352,269.99023 232.61534,233.98266 44.999957 0 1 401.01758,82.912109 232.61534,233.98266 44.999957 0 0 299.37305,51.863281 232.61534,233.98266 44.999957 0 0 282.86914,51.40625 Z"/>
				</g>
				<g class="set">
					<path
							id="set23"
							d="m 516.29297,285.3125 c 0.0593,4.69916 -0.0234,9.39987 -0.24805,14.0957 -5.43925,77.8335 -49.39689,148.02881 -117.14453,187.06641 30.98309,18.06021 65.76321,28.69037 101.625,31.06055 45.99287,2.84605 91.87791,-8.00232 131.86328,-31.17578 0.003,-83.12272 -44.22247,-159.70927 -116.0957,-201.04688 z"/>
				</g>
				<g class="set">
					<path
							id="set123"
							d="M 398.68359,254.0918 A 232.61534,233.98266 44.999957 0 0 283.58008,285.56836 232.61534,233.98266 44.999957 0 0 398.88281,486.48633 232.61534,233.98266 44.999957 0 0 516.04492,299.4082 232.61534,233.98266 44.999957 0 0 516.29297,285.29297 232.61534,233.98266 44.999957 0 0 415.1875,254.54883 232.61534,233.98266 44.999957 0 0 398.68359,254.0918 Z"/>
				</g>
				<g class="set">
					<path
							id="set13"
							d="m 283.32617,285.72656 a 232.61534,233.98266 44.999957 0 0 -116.95703,186.94922 232.61534,233.98266 44.999957 0 0 -0.4707,13.99024 232.61534,233.98266 44.999957 0 0 101.32812,30.86914 232.61534,233.98266 44.999957 0 0 131.69336,-31.02735 232.61534,233.98266 44.999957 0 1 -115.59375,-200.78125 z"/>
				</g>
				<g class="set">
					<path
							id="set12"
							d="M 401.01758,82.912109 A 232.61534,233.98266 44.999957 0 0 283.85352,269.99023 232.61534,233.98266 44.999957 0 0 283.58008,285.56836 232.61534,233.98266 44.999955 0 1 415.1875,254.54883 232.61534,233.98266 44.999955 0 1 516.29297,285.29297 232.61534,233.98266 44.999957 0 0 401.01758,82.912109 Z"/>
				</g>
			</svg>
		`;
	}
	public static is = "sane-venn-diagram-svg";

	// element properties
	private static elementRadius: number = 15;
	private static elementColor: string = "#fff7b7";

	// force definition
	private static forceManyBodyStrength: number = 5;

	// location for Elements in Set0
	private static position0: number[] = [50, 50];

	// select svg Tags
	private svgel: any; // full SVG Tag
	private svg: any; // full SVG Tag
	private element: any[] = new Array(); // Array for Elements
	private svgBox: any; // Bounding Box for of SVG

	// nodes for force
	private nodeArray = new Array();

	private circleOne: any; // circle left, top
	private circleTwo: any; // circle right, top
	private circleThree: any; // circle bottom

	// circle Values
	private centerOne: number[] = new Array();
	private centerTwo: number[] = new Array();
	private centerThree: number[] = new Array();
	private radiusOne: number = 0;
	private radiusTwo: number = 0;
	private radiusThree: number = 0;

	constructor() {
		super();
	}

	/**
	 * Function to select often used elements in the SVG before drawing the diagram.
	 */
	public ready() {
		super.ready();
		// select picture

		this.svgel = (this as PolymerElement).shadowRoot.getElementById("svg");
		this.svg = d3.select(this.svgel);
		this.svgBox = this.svg.node().getBBox();

		// select Circles
		this.circleOne = this.svg.select("#circleOne");
		this.circleTwo = this.svg.select("#circleTwo");
		this.circleThree = this.svg.select("#circleThree");

		// select center and radius of circles
		this.centerOne = this.getCircleCenter(this.circleOne);
		this.centerTwo = this.getCircleCenter(this.circleTwo);
		this.centerThree = this.getCircleCenter(this.circleThree);
		this.radiusOne = this.getCircleRadius(this.circleOne);
		this.radiusTwo = this.getCircleRadius(this.circleThree);
		this.radiusThree = this.getCircleRadius(this.circleTwo);
	}

	/**
	 * Draws Venn Diagram with all elements.
	 * @param {number[]} locations
	 * @param {number[]} selected
	 *
	 * location value: set 0 -> 0; set 1 -> 1; set 2 -> 2; set 3 -> 3
	 *      set 12 -> 12; set 13 -> 13; set 23 -> 23; set 123 -> 123;
	 *      --> example: [12,23,1,0.3]
	 * selected value: y0, y4, y6 --> [0,4,6]
	 */
	public drawDiagram(locations: number[], selected: number[]): void {
		// clear all previously entered Objects
		this.svg.selectAll(".setText").remove();
		this.svg.selectAll(".setElements").remove();
		this.svg.selectAll(".groupElements").remove();
		this.element = new Array();

		// add Text to circle
		if (selected.length === 0) {
			return;
		}
		selected.forEach(this.addText, this);

		// draw elements in circle
		if (locations.length === 0) {
			return;
		}
		locations.forEach(this.drawElement, this);
		// create nodeArray
		this.element.forEach(this.fillNodeArray, this);

		// create force on elements
		const simulation = d3.forceSimulation(this.nodeArray);

		simulation
			.force("collision", d3.forceCollide().radius(SaneVennDiagramSvg.elementRadius));

		// call for each iteration
		// simulation.on("tick", () => (this.ticked()));

		return;
	}

	/**
	 * Adds output variables as text to circles in diagram.
	 * @param {number} element
	 * @param {number} index
	 * @param {number[]} array
	 * normal parameter given by forEach()
	 * @return {void}
	 */
	private addText(element: number, index: number, array: number[]): void {
		switch (index) {
			case 0:
				this.svg.append("text")
					.attr("class", "setText")
					.text("y" + element)
					.attr("x", this.centerOne[0] - this.radiusOne - 7)
					.attr("y", this.centerOne[1])
					.attr("text-anchor", "end");
				break;
			case 1:
				this.svg.append("text")
					.attr("class", "setText")
					.text("y" + element)
					.attr("x", this.centerTwo[0] + this.radiusTwo + 7)
					.attr("y", this.centerOne[1])
					.attr("text-anchor", "start");
				break;
			case 2:
				this.svg.append("text")
					.attr("class", "setText")
					.text("y" + element)
					.attr("x", this.centerThree[0])
					.attr("y", this.centerThree[1] + this.radiusThree + 27)
					.attr("text-anchor", "middle");
				break;
		}
		return;
	}

	/**
	 * Draws elements inside the specified sets and add drag-function to the Elements using drag().
	 * @param {number} location
	 * @param {number} index
	 * @param {number[]} array
	 * location contains a value of {0, 1, 2, 3, 12, 13, 23, 123}
	 * index contains a value from 0 to array.length-1
	 * array contains the whole locations Array from draw Diagram()
	 *
	 * Drag Function call calcNewSet() after drag event.
	 * @return {void}
	 */
	private drawElement(location: number, index: number, array: number[]): void {
		// for location 0
		if (location === 0) {
			this.addElement(SaneVennDiagramSvg.position0, index);
		} else {
			const set = this.svg.select("#set" + location);
			const bBox = set.node().getBBox();
			const center: number[] = [bBox.x + (bBox.width / 2), bBox.y + (bBox.height / 2)];
			this.addElement(center, index);
		}
		return;
	}

	/**
	 * add elements into svg tag
	 * @param {number[]} center
	 * @param {number} index
	 */
	private addElement(center: number[], index: number): void {
		const groups = this.svg.append("g")
			.attr("class", "groupElements")
			.call(d3.drag().on("end", () => {
				this.calcNewSet(
				[this.element[index].attr("cx"), this.element[index].attr("cy")], index);
		}));
		// draw Element as circle inside the Set
		const newElement = groups
			.append("circle")
			.attr("class", "setElements")
			.attr("cx", center[0])
			.attr("cy", center[1])
			.attr("r", SaneVennDiagramSvg.elementRadius)
			.style("fill", SaneVennDiagramSvg.elementColor)
			.attr("stroke", "#000000");

		// add Text to Element
		const newText = groups.append("text")
			.attr("x", center[0])
			.attr("y", center[1])
			.attr("text-anchor", "middle")
			.attr("dy", ".3em")
			.attr("class", "elementText")
			.text(index);
		this.element.push(groups);
		return;
	}

	/**
	 * Called after drag and drop event to calculate new set.
	 *
	 * @param {number[]} coordinates
	 * @param {number} index
	 * coordinates contain Values [x, y]
	 * index contains value from 0 to locations.length - 1
	 * @return {void}
	 */
	private calcNewSet(coordinates: number[], index: number): void {
		// coordinates of Element
		const xValue = coordinates[0];
		const yValue = coordinates[1];
		// Circle Equations
		const isInOne = (((xValue - this.centerOne[0]) ** 2) + ((yValue - this.centerOne[1]) ** 2)
			=== (this.radiusOne ** 2));
		const isInTwo = (((xValue - this.centerTwo[0]) ** 2) + ((yValue - this.centerTwo[1]) ** 2)
			=== (this.radiusTwo ** 2));
		const isInThree = (((xValue - this.centerThree[0]) ** 2) + ((yValue - this.centerThree[1]) ** 2)
			=== (this.radiusThree ** 2));
		// locate index
		const set: number[] = new Array();
		if (isInOne) {
			set.push(1);
		}
		if (isInTwo) {
			set.push(2);
		}
		if (isInThree) {
			set.push(3);
		}
		if (!isInOne && !isInTwo && !isInThree) {
			set.push(0);
		}

		// Call updateBit in Parent Class SaneVennDiagram
		((this as PolymerElement).parentNode as SaneVennDiagram).updateBit(index, set);
	}

	/**
	 * returns property cx and cy of svg Element
	 * @param d3Element
	 * @returns {number[]}
	 */
	private getCircleCenter(d3Element: any): number[] {
		return [Math.abs(d3Element.attr("cx")), Math.abs(d3Element.attr("cy"))];
	}

	/**
	 * returns attribute r fo svg circle
	 * @param d3Element
	 * @returns {number}
	 */
	private getCircleRadius(d3Element: any): number {
		return Math.abs(d3Element.attr("r"));
	}

	/**
	 * function called from force simulation, to change coordinates
	 */
	private ticked(): void {
		const u = this.svg.selectAll(".groupElements").selectAll(".setElements")
			.attr("cx", (d: any) => d.cx)
			.attr("cy", (d: any) => d.cy);
		const t = this.svg.selectAll(".groupElements").selectAll(".elementText")
			.attr("x", (d: any) => d.x)
			.attr("y", (d: any) => d.y);
		return;
	}

	/**
	 * Fills the global nodeArray with nodes.
	 * @param element
	 * @param {number} index
	 * @param {any[]} array
	 */
	private fillNodeArray(element: any, index: number, array: any[]): void {
		this.nodeArray.push({id : index, label : "label " + index, ui : element});
	}
}
customElements.define(SaneVennDiagramSvg.is, SaneVennDiagramSvg);

export { SaneVennDiagramSvg };
