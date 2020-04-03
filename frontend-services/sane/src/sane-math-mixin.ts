/**
 * Library to support typesetting math via MathJax.
 *
 */

type Constructor<T> = new(...args: any[]) => T;

/**
 * Mixin to allow typesetting math via MathJax.
 * @mixin
 * @public
 * @param {T} base The base-class which will become the new functions.
 * @returns Mixin The class which contains the new methods.
 * @polymer
 * @mixinFunction
 */
function SaneMath<T extends Constructor<HTMLElement>>(base: T) {
	return class extends base {
		constructor(...args: any[]) {
			super(...args);
		}

		/**
		 * Renders the string formula that has to be LaTeX to the textContent of the element node as math.
		 * @param {HTMLElement} node The Element to render to.
		 * @param {string} formula The string that will be rendered. It has to be LaTeX withouth math delimeters, like \\(\\).
		 */
		protected typeset(node: HTMLElement, formula: string): void {
				node.style.display = "none";
				node.textContent = "\\(" + formula + "\\)";
				// @ts-ignore
				window.MathJax.Hub.Queue(["Typeset", MathJax.Hub, node], () => {
					node.style.display = "";
				});

		}
	};
}

export { SaneMath };
