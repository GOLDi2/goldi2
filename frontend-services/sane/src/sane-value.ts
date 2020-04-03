import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";

type repType = "binary" | "concise" | "writtenout" | "blank";
type basicValue = "true" | "false";
type extendedValue = basicValue | "g" | "*";

class SaneValue extends PolymerElement {
	static get template() {
		return html`
			<style include="shared-styles">
				/* local style goes here */
				:host {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					position: relative;
					min-height: 1rem;
					min-width: 1.3rem;
					padding: 0.3rem;
					margin: 0.1rem;
					border-radius: 2px;
					color: white;
					font-weight: bold;
					user-select: none;
					-webkit-user-select: none;  /* Chrome all / Safari all */
					-moz-user-select: none;     /* Firefox all */
					-ms-user-select: none;      /* IE 10+ */
				}

				:host([value="true"]) {
					background-color: darkgreen;
					transition: background-color 200ms linear;
				}

				:host([value="false"]) {
					background-color: darkred;
					transition: background-color 200ms linear;
				}

				:host([value="*"]) {
					background-color: white;
					color: black;
					transition: background-color 200ms linear;
				}

				:host([value^="g"]) {
					background-color: grey;
					transition: background-color 200ms linear;
				}

				:host([rounded]) {
					width: 1.6rem;
					height: 1.6rem;
					border-radius: 50%;
				}

				:host([raised]) {
					box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
				}

				paper-ripple {
					color: white;
				}
			</style>
			<paper-ripple></paper-ripple>
			<span>[[computeSymbol(value)]]</span>
		`;
	}	public static is = "sane-value";

	public static get properties() {
		return {
			gindex: {
				notify: true,
				reflectToAttribute: true,
				type: String,
				value: "",
			},
			representation: {
				notify: true,
				reflectToAttribute: true,
				type: String,
				value: "binary",
			},
			value: {
				notify: true,
				reflectToAttribute: true,
				type: String,
				value: "false",
			},
		};
	}

	private static readonly representations: any = {
		binary: {
			false: "0",
			true: "1",
		},
		blank: {
			false: "",
			true: "",
		},
		concise: {
			false: "F",
			true: "T",
		},
		writtenout: {
			false: "false",
			true: "true",
		},
	};

	public value: extendedValue;
	public gindex: string = "";
	public representation: repType = "binary";

	constructor() {
		super();
		this.value = "true";
		// @ts-ignore
		this.addEventListener("click", this.rotate);
	}

	public toggle(): void {
		if (this.value === "false") {
			this.value = "true";
		} else {
			this.value = "false";
		}
	}

	public rotate(): void {
		if (this.value === "false") {
			this.value = "true";
		} else if (this.value === "true") {
			this.value = "g";
		} else if (this.value.startsWith("g")) {
			this.value = "*";
		} else if (this.value === "*") {
			this.value = "false";
		}
	}

	public set(s: extendedValue): void {
		this.value = s;
	}

	public computeSymbol(value: extendedValue): string {
		const rep: repType = this.representation || "binary";

		if (this.representation === "blank") {
			return "";	// blank only uses colors
		}

		switch (value) {
		case "true":
			return SaneValue.representations[rep].true;
		case "*":
			return value;
		case "g":
			return `${this.value}${this.gindex}`;
		default:
			return SaneValue.representations[rep].false;
		}
	}
}

// after the element is defined, we register it in polymer
customElements.define(SaneValue.is, SaneValue);

export { extendedValue };
