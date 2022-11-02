// code explanations
// -- dev comments and TO-DOs

import { ISaneData, ISaneDataCharSet } from "./sane-data.js";
import { getBit, getFunctionIndexForYIndex, getHStarIndex } from "./boollib.js";

/**
 * The layout of the qmcSteps object.
 * piSteps contains an array of subSteps (piStep) which each containing groups (piGroup) with implicants.
 */
interface IQmcSteps {
	piSteps: piStep[];
	implicants: IPrimeImplicant[];
	initialTable: IMinTable;
	solvedTable: IMinTable;
	minTrees: expressionTree[];
	minTerms: string[];
	minLaTeXStrings: string[];
}

interface IExpressionTreeBool {
	bool: boolean;
}

interface IExpressionTreeVar {
	variable: number;
}

interface IExpressionTreeNot {
	not: expressionTree;
}

interface IExpressionTreeAnd {
	and: expressionTree[];
}

interface IExpressionTreeOr {
	or: expressionTree[];
}

interface IExpressionTreeEquiv {
	equiv: expressionTree[];
}

interface IExpressionTreeImply {
	imply: expressionTree[];
}

interface IExpressionTreeAntival {
	antival: expressionTree[];
}

type expressionTree =
	IExpressionTreeBool |
	IExpressionTreeVar |
	IExpressionTreeNot |
	IExpressionTreeAnd |
	IExpressionTreeOr |
	IExpressionTreeEquiv |
	IExpressionTreeImply |
	IExpressionTreeAntival;

type piStep = piGroup[];

type piGroup = IPrimeImplicant[];

/**
 * The layout of the prime implicant object.
 */
interface IPrimeImplicant {
	data: ternary[];
	distance?: string;
	elementArray: number[];
	elementString: string;
	hasStar: boolean[];
	used: boolean;
}

/**
 * The layout of the minTable for implicant selection. Also contains IMinTableBlock.
 */
interface IMinTable {
	head: number[];
	body: IMinTableBlock[];
	solutions: number[][];
}

interface IMinTableBlock {
	blockArray: number[];
	blockData: ternary[];
	blockString: string;
	hasStar: boolean[];
	indexName: number;
	isEssential: boolean;
	list: number[][];
	usedInSolutions: boolean[];
}

/**
 * The possible values for the ternary vector elements.
 */
type ternary = "1" | "0" | "-";

/**
 * The possible forms of expressions in boolean algebra.
 * 'Input' as a way to declare the <paper-input> as a user input field that does not have an equation and is
 * instead emptied on data changes.
 */
type expressionType = "kdnf" | "kknf" | "dnf" | "knf" | "knanf" | "knonf" | "nanf" | "nonf" | "input";

/**
 * The possible types of minimization.
 */
type minimizationType = "dnf" | "knf" | "nanf" | "nonf";

/**
 * Interfaces for the cache variable (IQmclibCache), the functions with their types and the result forms.
 */
interface IQmclibCache {
	_functionIndex: string;
	_hStarIndex: string;
	getExpressionAsExpTree?: ICacheGetExpressionAsExpTree;
	getExpressionAsTerm?: ICacheGetExpressionAsTerm;
	getMinimalTerm?: ICacheGetMinimalTerm;
}

interface ICacheGetExpressionAsTerm {
	[key: string]: string[] | undefined;
	kdnf?: 	string[];
	kknf?: 	string[];
	dnf?:  	string[];
	knf?: 	string[];
	knanf?: string[];
	knonf?: string[];
	nanf?: 	string[];
	nonf?: 	string[];
}

interface ICacheGetExpressionAsExpTree {
	[key: string]: expressionTree[] | undefined;
	kdnf?: 	expressionTree[];
	kknf?: 	expressionTree[];
	dnf?: 	expressionTree[];
	knf?: 	expressionTree[];
	knanf?:	expressionTree[];
	knonf?:	expressionTree[];
	nanf?: 	expressionTree[];
	nonf?: 	expressionTree[];
}

interface ICacheGetMinimalTerm {
	[key: string]: IQmcSteps | undefined;
	dnf?: 	IQmcSteps;
	knf?: 	IQmcSteps;
	nanf?: 	IQmcSteps;
	nonf?: 	IQmcSteps;
}

/**
 * The qmclib cache.
 * Is initialized with empty results and fixed size 7 (max output columns).
 */
const qmclibCache: IQmclibCache[] = [];

function getCachedElement(data: ISaneData, index: number): IQmclibCache {
	const functionIndex: any = getFunctionIndexForYIndex(data, index);
	const hStarIndex: any = getHStarIndex(data);

	let cachingElement = qmclibCache.find(
		(el) => el._functionIndex === functionIndex && el._hStarIndex === hStarIndex);

	// check if equal to cached function index - if so, return cached result
	if (cachingElement === undefined ) {
		cachingElement = {
			_functionIndex: functionIndex,
			_hStarIndex: hStarIndex,
		};
		qmclibCache.push(cachingElement);
	}

	return cachingElement;
}

/**
 * Compute the data of a y-function to the required expression - as a string.
 * @param data The SaneData object.
 * @param {expressionType} expType The required form of the equation. Is one of 'expressionType'.
 * @param {number} index The index of the y-function.
 * @returns {string} The computed equation as a string.
 */
function getExpressionAsTerms(data: ISaneData, expType: expressionType, index: number): string[] {
	// abort if the specified y equation doesn't exists in sane-data
	if (index > data.nOutputColumns - 1) {
		return [""]; // return error
	}

	const cachingElement = getCachedElement(data, index);

	if (cachingElement.getExpressionAsTerm !== undefined && cachingElement.getExpressionAsTerm[expType] !== undefined) {
		return cachingElement.getExpressionAsTerm[expType]!;
	}

	let retValue: string[]; // initialize output

	// check type of required term
	switch (expType) {
		case "kdnf":
		case "kknf":
		case "knanf":
		case "knonf":
			// for non-minimization types make a tree and a string from that
			const tree = getExpressionAsExpTrees(data, expType, index);
			retValue = [makeStringFromExpTree(tree[0], data.charSet)];
			break;
		case "dnf":
		case "knf":
		case "nanf":
		case "nonf":
			// for minimized typed use qmcSteps
			const qmcSteps = getMinimalTerms(data, index, expType);
			retValue = qmcSteps.minTerms;
			break;
		default:
			// undefined types and 'input' makes empty input field
			retValue = [""];
	}

	if (cachingElement.getExpressionAsTerm === undefined) {
		cachingElement.getExpressionAsTerm = {};
	}

	cachingElement.getExpressionAsTerm[expType] = retValue;
	return retValue; // return sting to input field
	/*}*/
}

/**
 * Compute the data of a y-function to the required expression - as an expTree.
 * @param data The SaneData object.
 * @param {expressionType} expType The required form of the equation. Is one of 'expressionType'.
 * @param {number} index The index of the y-function.
 * @returns {any} The computed equation as an expTree.
 */
function getExpressionAsExpTrees(data: ISaneData, expType: expressionType, index: number): expressionTree[] {
	const cachingElement = getCachedElement(data, index);

	if (cachingElement.getExpressionAsExpTree !== undefined &&
		cachingElement.getExpressionAsExpTree[expType] !== undefined) {
		return cachingElement.getExpressionAsExpTree[expType]!;
	}

	let retValue: expressionTree[];

	// check type of required term
	switch (expType) {
		case "kdnf":
		case "kknf":
		case "knanf":
		case "knonf":
			// for non-minimization types make a tree
			const checkValue = (expType === "kdnf" || expType === "knanf") ? 1 : 0; // value for positive value checks
			const variableNegations = (expType === "kknf" || expType === "knonf") ? true : false;
			let outerPropertyName: "or"|"and" = "or";
			let innerPropertyName: "or"|"and" = "and";
			switch (expType) {
				case "kdnf":
					outerPropertyName = "or";
					innerPropertyName = "and";
					break;
				case "knanf":
					outerPropertyName = "and";
					innerPropertyName = "and";
					break;
				case "kknf":
					outerPropertyName = "and";
					innerPropertyName = "or";
					break;
				case "knonf":
					outerPropertyName = "or";
					innerPropertyName = "or";
					break;
			}
			const hasNegations = (expType === "knanf" || expType === "knonf"); // when true negate outer and inner array
			const outerArr: expressionTree[] = []; // initialize outer array
			const nrRows: number = 2 ** data.nInputColumns; // nr of rows to go through

			// check each row
			for (let row: number = 0; row < nrRows; row++) {
				// ignore undefined outputs
				if (data.outputRows[row].output === undefined) {
					continue;
				}
				// check if bit of y in row is equal to checkValue, depending on type
				if (getBit(data.outputRows[row].output, index) === checkValue) {
					const innerArr: expressionTree[] = []; // initialize inner array
					// go through all x in descending order
					for (let xnr: number = data.nInputColumns - 1; xnr >= 0; xnr--) {
						// add variable object to array and negate if x is 0
						if ((getBit(row, xnr) === 1 && !variableNegations) || (getBit(row, xnr) === 0 && variableNegations)) {
							innerArr.push({variable: xnr});
						} else {
							innerArr.push({not: {variable: xnr}});
						}
					}

					let innerTmp: expressionTree;
					if (innerPropertyName === "or") {
						innerTmp = {or: innerArr};
					} else {
						innerTmp = {and: innerArr};
					}
					// add inner array to outer array (with innerPropertyName) and negate inner array if necessary
					if (hasNegations) {
						outerArr.push({not: innerTmp});
					} else {
						outerArr.push(innerTmp);
					}
				}
			}
			// y = 0 and y = 1 exception check
			if (outerArr.length === 0) {
				retValue = [{bool: (expType === "kknf" || expType === "knonf")}];
				break;
			}
			if (outerArr.length === nrRows) {
				retValue = [{bool: !(expType === "kknf" || expType === "knonf")}];
				break;
			}

			let outerTmp: expressionTree;
			if (outerPropertyName === "or") {
				outerTmp = {or: outerArr};
			} else {
				outerTmp = {and: outerArr};
			}

			// return outer array (as outerPropertyName) and negate if necessary
			if (hasNegations) {
				retValue = [{not: outerTmp}];
			} else {
				retValue = [outerTmp];
			}
			break;
		case "dnf":
		case "knf":
		case "nanf":
		case "nonf":
			// for minimized typed use qmcSteps
			const qmcSteps = getMinimalTerms(data, index, expType);
			retValue = qmcSteps.minTrees;
			break;
		default:
			retValue = [{bool: false}];
			// throw new TypeError("EmptyTree by parsing expression as tree");
	}

	if (cachingElement.getExpressionAsExpTree === undefined) {
		cachingElement.getExpressionAsExpTree = {};
	}

	cachingElement.getExpressionAsExpTree[expType] = retValue;
	return retValue;
}

/**
 * Parses the expTree into a string.
 * @param expTree The expTree.
 * @param chars The SaneData object.
 * @returns {string} The string.
 */
function makeStringFromExpTree(expTree: expressionTree, chars: ISaneDataCharSet): string {
	let returnValue = "";
	/*
		rules for string generation:
		var						x2
		bool					1
		not		not var			/x2
				not bool		/1
				* not op		/( op )
		and		and and op		[.] & op
				and bool		[.] & 1
				and var			[.]x2
				and not op		[.] & /( op )
				and not var		[.]/x2
				* and op		[.](op)
		or		or not			[.] + [not]
				or var			[.] + x2
				or bool			[.] + 1
				* or op			[.] + (op)
		imply	see or			[.] > [.]
		equiv	see or			[.] ~ [.]
		antival	see or			[.] ° [.]
	*/

	/*
		general code explanation:
		- check if expTree has a type of left column
		- check if expTree has a type of center column, if not use * , ie. contains operation
		- use rule in right column for each element and add to array
		- join array with symbol
	 */
	if ("variable" in expTree) {
		returnValue += "x" + expTree.variable;

	} else if ("bool" in expTree) {
		returnValue += (expTree.bool) ? "1" : "0";

	} else if ("not" in expTree) {
		if ("variable" in expTree.not || "bool" in expTree.not) {
			returnValue += chars.notChar + makeStringFromExpTree(expTree.not, chars);
		} else {
			returnValue += chars.notChar + "( " + makeStringFromExpTree(expTree.not, chars) + " )";
		}

	} else if ("and" in expTree) {
		const tempArr: string[] = [];
		for (const andSubs of expTree.and) {
			if ("and" in andSubs || "bool" in andSubs) {
				tempArr.push(" " + chars.andChar + " " + makeStringFromExpTree(andSubs, chars));
			} else if ("variable" in andSubs) {
				tempArr.push(makeStringFromExpTree(andSubs, chars));
			} else if ("not" in andSubs) {
				let spacer = "";
				if (!andSubs.not.hasOwnProperty("variable") && tempArr.length !== 0) {
					spacer = " " + chars.andChar + " ";
				}
				tempArr.push(spacer + makeStringFromExpTree(andSubs, chars));
			} else {
				tempArr.push("(" + makeStringFromExpTree(andSubs, chars) + ")");
			}
		}
		returnValue += tempArr.join("");

	} else if ("or" in expTree) {
		const tempArr: string[] = [];
		for (const orSubs of expTree.or) {
			if (orSubs.hasOwnProperty("not")) {
				tempArr.push(makeStringFromExpTree(orSubs, chars));
			} else if (orSubs.hasOwnProperty("variable") || orSubs.hasOwnProperty("bool")) {
				tempArr.push(makeStringFromExpTree(orSubs, chars));
			} else {
				tempArr.push("(" + makeStringFromExpTree(orSubs, chars) + ")");
			}
		}
		returnValue += tempArr.join(" " + chars.orChar + " ");

	} else if ("imply" in expTree) {
		const tempArr: string[] = [];
		for (const implySubs of expTree.imply) {
			if ("not" in implySubs) {
				tempArr.push(makeStringFromExpTree(implySubs, chars));
			} else if ("variable" in implySubs || "bool" in implySubs) {
				tempArr.push(makeStringFromExpTree(implySubs, chars));
			} else {
				tempArr.push("(" + makeStringFromExpTree(implySubs, chars) + ")");
			}
		}
		returnValue += tempArr.join(" " + chars.implyChar + " ");

	} else if ("equiv" in expTree) {
		const tempArr: string[] = [];
		for (const equivSubs of expTree.equiv) {
			if ("not" in equivSubs) {
				tempArr.push(makeStringFromExpTree(equivSubs, chars));
			} else if ("variable" in equivSubs || "bool" in equivSubs) {
				tempArr.push(makeStringFromExpTree(equivSubs, chars));
			} else {
				tempArr.push("(" + makeStringFromExpTree(equivSubs, chars) + ")");
			}
		}
		returnValue += tempArr.join(" " + chars.equivChar + " ");

	} else if ("antival" in expTree) {
		const tempArr: string[] = [];
		for (const antivalSubs of expTree.antival) {
			if ("not" in antivalSubs) {
				tempArr.push(makeStringFromExpTree(antivalSubs, chars));
			} else if ("variable" in antivalSubs || "boolb" in antivalSubs) {
				tempArr.push(makeStringFromExpTree(antivalSubs, chars));
			} else {
				tempArr.push("(" + makeStringFromExpTree(antivalSubs, chars) + ")");
			}
		}
		returnValue += tempArr.join(" " + chars.antivalChar + " ");
	}

	return returnValue;
}

/**
 * Parses the expTree into a LaTeX math formula.
 * @param expTree The expTree.
 * @param data The SaneData object.
 * @returns {string} The LaTeX math string.
 */
function makeLaTeXFromExpTree(expTree: expressionTree): string {
	let returnValue = "";
	/*
		rules for string generation:
		var						x_{2}
		bool					1
		not		not var			\overline{x_{2}}
				not bool		\overline{1}
				* not op		\overline{op}
		and		and and op		[.] \wedge op
				and bool		[.] \wedge& 1
				and var			[.]x2
				and not op		[.] \wedge \overline{op}
				and not var		[.]\overline{x_{2}
				* and op		[.](op)
		or		or not			[.] \vee [not]
				or var			[.] \vee x_{2}
				or bool			[.] \vee 1
				* or op			[.] \vee (op)
		imply	see or			[.] \Rightarrow [.]
		equiv	see or			[.] \sim [.]
		antival	see or			[.] \not\sim [.]
	*/

	/*
		general code explanation:
		- check if expTree has a type of left column
		- check if expTree has a type of center column, if not use * , ie. contains operation
		- use rule in right column for each element and add to array
		- join array with symbol
	 */
	if ("variable" in expTree) {
		returnValue += "x_{" + expTree.variable + "}";

	} else if ("bool" in expTree) {
		returnValue += (expTree.bool) ? "1" : "0";

	} else if ("not" in expTree) {
		if ("variable" in expTree.not || "bool" in expTree.not) {
			returnValue += "\\overline{" + makeLaTeXFromExpTree(expTree.not) + "}";
		} else {
			returnValue += "\\overline{" + "(" + makeLaTeXFromExpTree(expTree.not) + ")}";
		}

	} else if ("and" in expTree) {
		const tempArr: string[] = [];
		for (const andSubs of expTree.and) {
			if ("and" in andSubs || "bool" in andSubs) {
				tempArr.push("\\wedge " + makeLaTeXFromExpTree(andSubs));
			} else if ("variable" in andSubs) {
				tempArr.push(makeLaTeXFromExpTree(andSubs));
			} else if ("not" in andSubs) {
				let spacer = "\\,";
				if (!andSubs.not.hasOwnProperty("variable") && tempArr.length !== 0) {
					spacer = "\\wedge ";
				}
				tempArr.push(spacer + makeLaTeXFromExpTree(andSubs));
			} else {
				tempArr.push("(" + makeLaTeXFromExpTree(andSubs) + ")");
			}
		}
		returnValue += tempArr.join("");

	} else if ("or" in expTree) {
		const tempArr: string[] = [];
		for (const orSubs of expTree.or) {
			if ("not" in orSubs) {
				tempArr.push(makeLaTeXFromExpTree(orSubs));
			} else if ("variable" in orSubs || "bool" in orSubs) {
				tempArr.push(makeLaTeXFromExpTree(orSubs));
			} else {
				tempArr.push("(" + makeLaTeXFromExpTree(orSubs) + ")");
			}
		}
		returnValue += tempArr.join("\\vee ");

	} else if ("imply" in expTree) {
		const tempArr: string[] = [];
		for (const implySubs of expTree.imply) {
			if ("not" in implySubs) {
				tempArr.push(makeLaTeXFromExpTree(implySubs));
			} else if ("variable" in implySubs || "bool" in implySubs) {
				tempArr.push(makeLaTeXFromExpTree(implySubs));
			} else {
				tempArr.push("(" + makeLaTeXFromExpTree(implySubs) + ")");
			}
		}
		returnValue += tempArr.join("\\Rightarrow ");

	} else if ("equiv" in expTree) {
		const tempArr: string[] = [];
		for (const equivSubs of expTree.equiv) {
			if ("not" in equivSubs) {
				tempArr.push(makeLaTeXFromExpTree(equivSubs));
			} else if ("variable" in equivSubs || "bool" in equivSubs) {
				tempArr.push(makeLaTeXFromExpTree(equivSubs));
			} else {
				tempArr.push("(" + makeLaTeXFromExpTree(equivSubs) + ")");
			}
		}
		returnValue += tempArr.join("\\sim ");

	} else if ("antival" in expTree) {
		const tempArr: string[] = [];
		for (const antivalSubs of expTree.antival) {
			if ("not" in antivalSubs) {
				tempArr.push(makeLaTeXFromExpTree(antivalSubs));
			} else if ("variable" in antivalSubs || "bool" in antivalSubs) {
				tempArr.push(makeLaTeXFromExpTree(antivalSubs));
			} else {
				tempArr.push("(" + makeLaTeXFromExpTree(antivalSubs) + ")");
			}
		}
		returnValue += tempArr.join("\\not\\sim ");
	}

	return returnValue;
}

/**
 * Compute a function index from a expression tree object.
 * @param {object} expTree The expression tree object.
 * @param data The SaneData object.
 * @returns {number} The function index equivalent to the expression tree as a decimal number.
 */
function getFunctionIndexFromTree(expTree: any, data: any): string {
	const nrrows = 2 ** data.nInputColumns; // nr of rows to go through
	const variables: number[] = Array.from(getVariablesFromTree(expTree))
		.sort((a: number, b: number) => b - a);

	// -- TODO: redo as max-input-cols
	// ^ change data.InputColumns if an x_n is higher than the current highest x_n, instead of sending an error
	if (variables.length > 0 && variables[0] >= data.nInputColumns) {
		throw {
			eData: { variable: variables[0] },
			eDescription: "TBA",
			eNr: 301,
		};
	}

	// get function index as an array of booleans computed for each input row
	let functionIndexArr;
	functionIndexArr = [];
	for (let row = 0; row < nrrows; row++) {
		// assign true or false to the x variables based on bits of current row
		let assignment: any[] = [];
		assignment = [];
		for (let j = 0; j < data.nInputColumns; j++) {
			assignment.push((getBit(row, j) === 1));
		}
		// calculate output value for current row
		const temp = calcValueForAssignment(expTree, assignment); // call helper function
		functionIndexArr.push(temp);
	}

	// return parsed and converted function index
	functionIndexArr.reverse();
	const functionIndex: string = functionIndexArr.reduce( (fi, e) => fi + ((e) ? "1" : "0"), "");
	return functionIndex;
}

/**
 * Helper function for 'getFunctionIndexFromTree'. Fetches all x variables in the expression tree.
 * @param expTree The expression tree of the equation.
 * @returns {number[] | number} An array of all x variables. A single x variable as number for recursion.
 */
function getVariablesFromTree(expTree: expressionTree, retArr: Set<number> = new Set()): Set<number> {
	if ("variable" in expTree) {
		retArr.add(expTree.variable);
	} else if ("not" in expTree) {
		return getVariablesFromTree(expTree.not, retArr);
	} else if (!("bool" in expTree)) {
		// @ts-ignore: Object.values() is supported
		Object.values(expTree)[0].forEach((subtree: expressionTree) => {
			getVariablesFromTree(subtree, retArr);
		});
	}
	return retArr;
}

/**
 * Helper function for 'getFunctionIndexFromTree'.
 * Fetch the true/false row assignment for the expression tree.
 * @param expTree The expression tree of the equation.
 * @param {boolean[]} assignment True/false row assignments for recursion.
 * @returns {boolean} The true/false row assignment. A single boolean value for recursion.
 */
function calcValueForAssignment(expTree: expressionTree, assignment: boolean[]): boolean {
	// -- TODO: expTree object type
	let ret: boolean;
	let lhs: boolean = false;
	let rhs: boolean = false;
	if ("or" in expTree) {
		ret = false;
		for (const elem of expTree.or) {
			ret = ret || calcValueForAssignment(elem, assignment);
		}
	} else if ("and" in expTree) {
		ret = true;
		for (const elem of expTree.and) {
			ret = ret && calcValueForAssignment(elem, assignment);
		}
	} else if ("imply" in expTree) {
		lhs = calcValueForAssignment(expTree.imply[0], assignment);
		rhs = calcValueForAssignment(expTree.imply[1], assignment);
		ret = !lhs || rhs;
	} else if ("equiv" in expTree) {
		lhs = calcValueForAssignment(expTree.equiv[0], assignment);
		rhs = calcValueForAssignment(expTree.equiv[1], assignment);
		ret = (!lhs && !rhs) || (lhs && rhs);
	} else if ("antival" in expTree) {
		lhs = calcValueForAssignment(expTree.antival[0], assignment);
		rhs = calcValueForAssignment(expTree.antival[1], assignment);
		ret = (lhs && !rhs) || (!lhs && rhs);
	} else if ("not" in expTree) {
		ret = !calcValueForAssignment(expTree.not, assignment);
	} else if ("variable" in expTree) {
		ret = assignment[expTree.variable];
	} else if ("bool" in expTree) {
		ret = expTree.bool;
	} else {
		ret = false;
	}
	return ret;
}

/**
 * The main function for the minimization process of a y-function.
 * Uses helper functions to calculate steps and manages the return values.
 * @param data The SaneData object.
 * @param {number} index The index of the y-function.
 * @param {expressionType} minType The required form of the equation. Is one of 'expressionType'.
 * @returns {any} qmcSteps[] as an array of all minimization steps.
 * qmcSteps.piSteps 		The array of minimization sub-steps as prime implicant tables, containing implicant objects.
 * qmcSteps.implicants 		All unused prime implicants.
 * qmcSteps.initialTable	The prime implicant selection table.
 * qmcSteps.solvedTable		The prime implicant selection table containing one solution. Is the first solution by default.
 * qmcSteps.minTrees			The minimized expression as an expression tree.
 * qmcSteps.minTerms			The minimized expression as a string.
 */
function getMinimalTerms(data: any, index: number, minType: minimizationType): IQmcSteps {
	if (!index) { index = 0; }

	const cachingElement = getCachedElement(data, index);

	if (cachingElement.getMinimalTerm !== undefined && cachingElement.getMinimalTerm[minType] !== undefined) {
		return cachingElement.getMinimalTerm[minType]!;
	}

	if (cachingElement.getMinimalTerm === undefined) {
		cachingElement.getMinimalTerm = {};
	}

	// const qmcSteps: IQmcSteps = {
	// 	implicants: [],
	// 	initialTable: {head: [], body: [], solutions: [[]]},
	// 	minLaTeXStrings: [""],
	// 	minTerms: [""],
	// 	minTrees: [{}],
	// 	piSteps: [],
	// 	solvedTable: {head: [], body: [], solutions: [[]]},
	// }; // return variable

	// push the result of getPrimeImplicants into qmcSteps[0]
	const piSteps: piStep[] = getPrimeImplicants(data, index, minType);

	// push qmcSteps[1] and add all implicants where (used === false)
	const helperArr1: any = []; // -- object[]
	for (const subSteps1 of piSteps) {
		for (const groups1 of subSteps1) {
			for (const elems1 of groups1) {
				if (!elems1.used) {
					helperArr1.push(elems1);
				}
			}
		}
	}

	const implicants: IPrimeImplicant[] = [];
	// remove duplicates in qmcSteps[1]
	// is duplicate if elementArrays are equal
	helperArr1.forEach( (e: any) => (
		implicants.findIndex(
			(a: any) =>
				e.elementArray.every( (m: number, i2: number) =>
					m === a.elementArray[i2] ),
			) === -1
		) ? implicants.push(e) : e );

	let qmcSteps: IQmcSteps;
	// y = 0 exception check
	if (implicants.length === 0) {
		qmcSteps = {
			implicants,
			initialTable: {body: [], head: [], solutions: [[]]},
			minLaTeXStrings: (minType === "knf" || minType === "nonf") ? ["1"] : ["0"],
			minTerms: (minType === "knf" || minType === "nonf") ? ["1"] : ["0"],
			minTrees: [{bool: (minType === "knf" || minType === "nonf")}],
			piSteps,
			solvedTable: {body: [], head: [], solutions: [[]]},
		};
		cachingElement.getMinimalTerm[minType] = qmcSteps;
		return qmcSteps;
	}
	// knf exception checks
	if ((minType === "knf" || minType === "nonf") && (implicants.length === 0 ||
		(implicants.length === 1 && implicants[0].data.every( (e) => e === "-")))) {
		const firstItemData = implicants[0].data;
		if (firstItemData.filter((e: string) => e === "-").length === firstItemData.length) {
			qmcSteps = {
				implicants,
				initialTable: {body: [], head: [], solutions: [[]]},
				minLaTeXStrings: ["0"],
				minTerms: ["0"],
				minTrees: [{bool: false}],
				piSteps,
				solvedTable: {body: [], head: [], solutions: [[]]},
			};
			cachingElement.getMinimalTerm[minType] = qmcSteps;
			return qmcSteps;
		}
	}

	// push remaining steps
	const initialTable = getMinTable(implicants);
	const solvedTable = solveMinTable(initialTable);
	const minTrees = makeTreesFromMin(solvedTable, minType);
	const minTerms = minTrees.map((tree) => makeStringFromExpTree(tree, data.charSet));
	const minLaTeXStrings = minTrees.map((tree) => makeLaTeXFromExpTree(tree));

	qmcSteps = {
		implicants,
		initialTable,
		minLaTeXStrings,
		minTerms,
		minTrees,
		piSteps,
		solvedTable,
	};

	cachingElement.getMinimalTerm[minType] = qmcSteps;

	return qmcSteps;

	/* Example:
	x = [x2,x1,x0]
	y0 = k1 v k2 v k4 v k7
	h* = k3 v k6

	KV-table:
	   x0	0  	 1    1    0
	x2 x1	0  	 0    1    1
			     ┌────╥═════╤═════╗
	0		0   │ 1  ║ *  │  1 ║
		   ────┐└────╫─────┘┌────╫─
	1		1 │ 0  ║ 1   │ * ║
		  ────┘    ╚══════╘═══╜─

	qmcSteps = { // >>> AFTER ALL MINIMIZATION STEPS <<<
	piSteps: [
		0: [ // --- piStep 0 ---
			0: [ // - group 0 -
				0: { data: ["0", "0", "0"], elementArray: [0], elementString: "0", used: false } ],
			1: [ // - group 1 -
				0: { data: ["0", "0", "1"], elementArray: [1], elementString: "1", used: true },
				1: { data: ["0", "1", "0"], elementArray: [2], elementString: "2", used: true },
				2: { data: ["1", "0", "0"], elementArray: [4], elementString: "4", used: true } ],
			2: [ // - group 2 -
				0: { data: ["0", "1", "1"], elementArray: [3], elementString: "3", used: true },
				1: { data: ["1", "1", "0"], elementArray: [5], elementString: "5", used: false },
				2: { data: ["1", "0", "1"], elementArray: [6], elementString: "6", used: true } ],
			3: [ // - group 3 -
				0: { data: ["1", "1", "1"], elementArray: [7], elementString: "7", used: true } ]
			],
		1: [ // --- piStep 1 ---
			0: [ ], // - group 0 -
			1: [ // - group 1 -
				0: { data: ["0", "0", "1"], elementArray: [1], elementString: "1", used: true },
				1: { data: ["0", "1", "0"], elementArray: [2], elementString: "2", used: true },
				2: { data: ["1", "0", "0"], elementArray: [4], elementString: "4", used: true } ],
			2: [ // - group 2 -
				0: { data: ["0", "1", "1"], elementArray: [3], elementString: "3", used: true },
				2: { data: ["1", "0", "1"], elementArray: [6], elementString: "6", used: true } ],
			3: [ // - group 3 -
				0: { data: ["1", "1", "1"], elementArray: [7], elementString: "7", used: true } ]
			],
		2: [ // --- piStep 2 ---
			0: [ ], // - group 0/1 -
			1: [ // - group 1/2 -
				0: { data: ["0", "-", "1"], distance: "(2)", elementArray: [1, 3], elementString: "3,1", used: false },
				1: { data: ["0", "1", "-"], distance: "(1)", elementArray: [2, 3], elementString: "3,2", used: true },
				2: { data: ["-", "1", "0"], distance: "(4)", elementArray: [2, 6], elementString: "6,2", used: true },
				3: { data: ["-", "0", "1"], distance: "(2)", elementArray: [4, 6], elementString: "6,4", used: false } ],
			2: [ // - group 2/3 -
				0: { data: ["-", "1", "1"], distance: "(4)", elementArray: [3, 7], elementString: "7,3", used: true },
				2: { data: ["1", "1", "-"], distance: "(1)", elementArray: [6, 7], elementString: "7,6", used: true } ]
			],
		3: [ // --- piStep 3 ---
			0: [ ], // - group 0/1/2 -
			1: [ // - group 1/2/3 -
				0: { data: ["-", "1", "-"], distance: "(4,1)", elementArray: [2, 3, 6, 7], elementString: "7,3,6,2", used: false },
				3: { data: ["-", "1", "-"], distance: "(4,1)", elementArray: [2, 3, 6, 7], elementString: "7,6,3,2", used: false } ]
			]
		],
	implicants: [
		0: { data: ["0", "-", "1"], distance: "(2)", elementArray: [1, 3], elementString: "3,1", used: false },
		1: { data: ["-", "0", "1"], distance: "(2)", elementArray: [4, 6], elementString: "6,4", used: false } ],
		2: { data: ["-", "1", "-"], distance: "(4,1)", elementArray: [2, 3, 6, 7], elementString: "7,3,6,2", used: false },
		],
	initialTable: {
		head: [1, 2, 3, 4, 6, 7],
		body: [
			0: { blockArray: [1, 3], blockData: ["0", "-", "1"], blockString: "3,1", indexName: 0, isEssential: false },
			1: { blockArray: [4, 6], blockData: ["-", "0", "1"], blockString: "6,4", indexName: 1, isEssential: false } ],
			2: { blockArray: [2, 3, 6, 7], blockData: ["-", "1", "-"], blockString: "7,3,6,2", indexName: 2, isEssential: false},
			]
		},
	solvedTable: {
		head: [1, 2, 3, 4, 6, 7],
		body: [
			0: { blockArray: [1, 3], blockData: ["0", "-", "1"], blockString: "3,1", indexName: 0, isEssential: true },
			1: { blockArray: [4, 6], blockData: ["-", "0", "1"], blockString: "6,4", indexName: 1, isEssential: true } ],
			2: { blockArray: [2, 3, 6, 7], blockData: ["-", "1", "-"], blockString: "7,3,6,2", indexName: 2, isEssential: true },
			]
		},
	minTrees: { or: [
			{ and: [
				{ variable: 2 },
				{ not: { variable: 0 } }
			] },
			{ and: [
				{ not: { variable: 2 } }
				{ variable: 0 },
			] },
			{ and: [
				{ variable: 1 }
			] }
		] },
	minTerms: "(x2/x0) + (/x2x0) + (x1)"
	}
	*/
}

/**
 * Helper function for 'getMinimalTerms'.
 * Compute an array of minimization sub-steps with indices in the form presented in the lectures and materials.
 * @param data The SaneData object.
 * @param {number} index The index of the y-function.
 * @param {expressionType} type The required form of the equation. Is one of 'expressionType'.
 * @returns {IPrimeImplicant[]} Step 0 of qmcSteps[]. The array of minimization sub-steps.
 */
function getPrimeImplicants(data: any, index: number, type: expressionType): piStep[] {
	const nrXVars = data.nInputColumns; // nr of x variables
	const kdnfIndices: string[] = getInitialIndices(data, index, type); // all ungrouped indices of the y-function
	const piSteps: any[] = []; // return variable

	const maxBlockNumber: number = 31;

	// exception check for too many calculations
	if (kdnfIndices.length > maxBlockNumber) {
		throw {
			eData: {type: type.toUpperCase(), nr: maxBlockNumber},
			eDescription: "TBA",
			eNr: 1001,
		};
	}

	// --- piStep 0 ---
	piSteps.push(getT0Implicants(nrXVars)); // all (possible) unfiltered indices in their groups

	// --- step 1 ---
	piSteps.push([]); // add step 1
	// go through each group in step 0
	for (let grp: number = 0; grp < piSteps[0].length; grp++) {
		piSteps[1].push([]); // add group in step 1
		// go through each element of each group in step 0
		for (const elems of piSteps[0][grp]) {
			// if index is in h*, set hasStar to true
			if (data.outputRows[elems.elementArray[0]].mask === false) {
				elems.hasStar[0] = true;
			}
			// if element is one of the kdnfIncices (is in y-function), add it to group in step 1
			if (kdnfIndices.indexOf(elems.elementString) !== -1) {
				piSteps[1][grp].push(elems);
			} else {
				elems.used = true;
			}
		}
	}

	// --- step 2+ --- minimization from here ---

	let minReached: boolean = false; // while escape variable
	let currentStep = 2; // step counter >>> from now on commented as 'N' <<<

	// while able to minimize further or max amount of steps not reached
	while (!minReached && (currentStep <= nrXVars + 1)) {
		piSteps.push([]); // add step N

		// go through each group in step N-1, starting with the second group in the table
		for (let grpHigh: number = 1; grpHigh < piSteps[currentStep - 1].length; grpHigh++) {
			piSteps[currentStep].push([]); // add group in step N
			// go through all elements of that group
			// and for each go through all elements of one group below
			for (const elemsHigh of piSteps[currentStep - 1][grpHigh]) {
				for (const elemsLow of piSteps[currentStep - 1][grpHigh - 1]) {

					// compare the data of the current element of the group and the current element of the group below
					const a: string[] = elemsHigh.data;
					const b: string[] = elemsLow.data;
					const differenceBool: boolean[] = a.map((e, i) => e === b[i]);

					// if the difference between these elements is exactly 1, add a new element to the group in step N
					if (differenceBool.filter((e) => e).length === nrXVars - 1) {
						const diffDataArray = a.map((e, i) => (e !== b[i]) ? "-" : a[i]);
						const elemArray = elemsHigh.elementArray.concat(elemsLow.elementArray).sort();
						piSteps[currentStep][grpHigh - 1].push({
							// replace the difference with '-'
							// join the strings for the new element
							// calculate the distance as the binary values of the indices where an '-' is
							// map sorted element array to match h* (hasStar) values
							data: diffDataArray,
							distance: "(".concat(
								diffDataArray
									.map((e, i, arr) => (e === "-") ? (2 ** (arr.length - 1 - i)) : 0)
									.sort((m, n) => n - m)
									.filter((e) => e > 0)
									.join(","),
								")"),
							elementArray: elemArray,
							elementString: elemsHigh.elementString.concat(",", elemsLow.elementString),
							hasStar: elemArray.map( (e: number) => data.outputRows[e].mask === false),
							used: false,
						});
						// declare the compared elements as used
						elemsHigh.used = true;
						elemsLow.used = true;
					}

				}
			}
		}

		// after comparison, check the number of elements in step N
		// if amount is 0, nothing was minimized - then set escape variable to true and delete the empty step N
		let newStepNrOfElements: number = 0;
		for (const grp of piSteps[currentStep]) {
			newStepNrOfElements += grp.length; // -- forEach ?
		}
		if (newStepNrOfElements === 0) {
			minReached = true;
			piSteps.splice(currentStep, 1);
		}

		currentStep++;
	}
	return piSteps;
}

/**
 * Helper function for 'getPrimeImplicants'.
 * Build groups with all (possible) unfiltered indices.
 * @param {number} nrXVars Numer of x variables in SaneData.
 * @returns {IPrimeImplicant[]} Step 0 of piSteps[]. The unfiltered prime implicants.
 */
function getT0Implicants(nrXVars: number): IPrimeImplicant[] {
	const a: any = [[]]; // return variable // -- Array(level + 1); doesn't work
	// add a group and a '0' to binaryZeroes for each x variable
	let binaryZeroes: string = "";
	for (let i = 1; i <= nrXVars; i++) {
		a.push([]);
		binaryZeroes = binaryZeroes.concat("0");
	}
	// go through each index and put in in the correct group based on the nr of '1'
	for (let i: number = 0; i < 2 ** nrXVars; i++) {
		const nrone = (i.toString(2).split("1").length - 1); // nr of '1' in the binary index
		a[nrone].push({
			data: (binaryZeroes.substr(i.toString(2).length) + i.toString(2)).split(""),
			elementArray: [i],
			elementString: i.toString(),
			hasStar: [false],
			used: false,
		});
	}
	return a;
}

/**
 * Helper function for 'getPrimeImplicants'.
 * Fetch all inidces where y_n = value or h* is true. Value depends on type.
 * @param data The SaneData object.
 * @param {number} index The index of the y-function.
 * @param {expressionType} type The required form of the equation. Is one of 'expressionType'.
 * @returns {string[]} An array with all indices for y_n.
 */
function getInitialIndices(data: any, index: number, type: expressionType): string[] {
	let retArr: string[]; // return variable
	const valueToSearch: number = (type === "knf" || type === "nonf") ? 0 : 1;
	retArr = [];
	const nrRows = 2 ** data.nInputColumns; // nr of rows to go through
	// go through each row (index)
	for (let row: number = 0; row < nrRows; row++) {
		// if y_n is 1 or h* is set true, add index to the return array
		if (getBit(data.outputRows[row].output, index) === valueToSearch || data.outputRows[row].mask === false) {
			retArr.push(row.toString());
		}
	}
	return retArr;
}

/**
 * Helper function for 'getMinimalTerms'.
 * Build an object representing the prime implicant selection table.
 * @param {IPrimeImplicant[]} step Step 1 of qmcSteps[]. All unused prime implicants.
 * @returns {IMinTable} Step 2 of qmcSteps[]. The prime implicant selection table.
 */
function getMinTable(step: IPrimeImplicant[]): IMinTable {
	// create return object
	const retItem: any = {
		body: [],
		head: [],
	};

	// go thorugh all indices of implicants and push those into head which aren't already in
	for (const elems of step) {
		for (const idx of elems.elementArray) {
			if (retItem.head.indexOf(idx) === -1) {
				retItem.head.push(idx);
			}
		}
	}
	// sort array numerically
	retItem.head.sort((a: number, b: number) => a - b); // sort head

	// create and push object into body for each implicant
	for (let i = 0; i < step.length; i++) {
		retItem.body.push({
			blockArray: step[i].elementArray,
			blockData: step[i].data,
			blockString: step[i].elementString,
			hasStar: step[i].hasStar,
			indexName: i,
			isEssential: false,
			list: [[]],
		});
		// for each index in head, check if it is used in the implicant and set list value accordingly
		for (const headIndex of retItem.head) {
			// if index is not in implicant, set to 0
			const foundIndex = step[i].elementArray.indexOf(headIndex);
			if (foundIndex === -1) {
				retItem.body[i].list[0].push( 0 );
			} else {
				// if index is in implicant, set to 1 if index is in h* - or to 2 if it isn't
				if (step[i].hasStar[foundIndex]) {
					retItem.body[i].list[0].push( 1 );
				} else {
					retItem.body[i].list[0].push( 2 );
				}
			}
		}
	}

	return retItem;
}

/**
 * Helper function for 'getMinimalTerms'.
 * Calculate a solution for the given selection table.
 * @param {IMinTable} step Step 2 of qmcSteps[]. The prime implicant selection table.
 * @returns {IMinTable} Step 3 of qmcSteps[]. The The minimitazion table containing one solution.
 */
function solveMinTable(step: IMinTable): IMinTable {
	// qmclibCache.minPISolutionCache = [[]];

	// create AND[ OR[ AND[]* ]* ] structure
	const pAnd: any = [];
	//  find OR term for every index and add to outer AND
	for (let col = 0; col < step.head.length; col++) {
		const pOr: any = [];
		// add all implicants to OR that are used (> 0) but not in h* (!== 1) (--> ie. > 1) for that index
		for (const rows of step.body) {
			if (rows.list[0][col] > 1) {
				pOr.push([rows.indexName]); // push as array for inner AND
			}
		}
		// push OR term into AND term if it isn't empty
		if (pOr.length > 0) {
			pAnd.push(pOr);
		}
	}

	// skip solving if there is nothing to solve (ie. everything used or in h*)
	if (pAnd.length === 0) {
		for (const bodyElem of step.body) {
			bodyElem.list[0] = bodyElem.list[0].map( (e: number) => (e > 1) ? 3 : e);
		}
		return step;
	}

	// multiply out the first and second OR terms, delete the second, and shorten the first
	while (pAnd.length > 1) {
		// multiply all terms of first and second OR into new array
		const pAndNew: string [] = [];
		for (const i of pAnd[1]) {
			for (const n of pAnd[0]) {
				pAndNew.push(n.concat(i));
			}
		}
		// delete first and second OR and push new as first OR
		pAnd.splice(0, 2, pAndNew);
		// shorten the first array
		pAnd[0] = applyArrayShortening(pAnd[0]);
	}

	// determine the number of minimal prime implicant for solving the problem
	const minImplNumber = pAnd[0].reduce((min: number, elem: number[]) => Math.min(min, elem.length), Number.MAX_VALUE);

	// filter all solutions to the solution with the least number of prime implicants
	step.solutions = pAnd[0].filter((elem: number[]) => elem.length === minImplNumber);

	// set to each prime-impicant wheter it is used in each solution or not
	step.body = step.body.map((elem, index) => {
		// set to the one prime implicant, wheter it is used in every solution
		// @ts-ignore: includes already supported by evergreen browsers (ES7)
		elem.usedInSolutions = step.solutions.map((list: number[][]) => list.includes(index));

		// if prime implicant exists in all solutions, then it should be an prime implicant
		elem.isEssential = elem.usedInSolutions.every((el: boolean) => el);

		return elem;
	});

	/*
	0: prime impicant doesent contain index
	1: ignored in table through H*
	2: prime impicant contains index and used it in the first found solution
	3: earlier: essential, now stored in usedSolutions
	*/
	step.body = step.body.map((bodyElem, index) => {
		const newBodyList: number [][] = [];
		for (const solution of step.solutions) {
			// @ts-ignore: includes already supported by evergreen browsers (ES7)
			if (solution.includes(index)) {
				newBodyList.push(bodyElem.list[0].map((e: number) => (e > 1) ? 3 : e));
			} else {
				newBodyList.push(bodyElem.list[0]);
			}
		}

		bodyElem.list = newBodyList;
		return bodyElem;
	});

	return step;
}

/**
 * Helper function for 'solveMinTable'.
 * Shorten the array by applying 'XX=X', 'X+X=X' and 'X+XY=X'.
 * @param {number[][]} arr The first or-array of implicants in the current step of 'solveMinTable'.
 * @returns {number[][]} The reduced or-array.
 */
function applyArrayShortening(arr: number[][]): number[][] {
	// X * X = X
	// ie. remove duplicates inside sub (and) arrays

	for (let i: number = 0; i < arr.length; i++) {
		arr[i] = arr[i].filter((item: number, pos: number) => arr[i].indexOf(item) === pos);
		arr[i].sort();
	}

	// X + X = X
	// ie. all elements have to be the exact same to be equal
	// if equal, then delete the secondary element

	const helpSameArr: string[] = [];
	for (const elem of arr) {
		helpSameArr.push(elem.join(""));
	}
	arr = arr.filter( (e: number[], i: number) => helpSameArr.indexOf(e.join("")) === i);

	// X + XY = X
	// ie. element difference of exactly 1
	// if same length of arr1 and arr2, delete the longer one

	let repeat: boolean = false; // repeat = false breaks while by default
	do {
		repeat = false; // don't repeat if no actions done
		// go through all combinations of arr1 and arr2
		breakpoint: for (let i: number = 0; i < arr.length; i++) {
			for (let j: number = 0; j < arr.length; j++) {
				// if the array difference is exactly one element
				if (arr[i].filter( (e: number) => arr[j].indexOf(e) < 0 )
					.concat(arr[j].filter( (e: number) => arr[i].indexOf(e) < 0 ))
					.length === 1) {

					// find longer array and empty it
					const delIdx = (arr[i].length < arr[j].length) ? j : i;
					arr[delIdx] = [];
					// set for repeat and break all for loops
					repeat = true;
					break breakpoint;
				}
			}
		}
		// filter all empty array elements
		arr = arr.filter( (e: number[]) => e.length > 0);
	} while (repeat);

	return arr;
}

/**
 * Helper function for 'getMinimalTerms'.
 * Compute an expression tree for the given solution of the selection table.
 * @param {IMinTable} mintable Step 3 of qmcSteps[]. The The minimitazion table containing one solution.
 * @param {expressionType} type The required form of the equation. Is one of 'expressionType'.
 * @returns {any} Step 4 of qmcSteps[]. The minimized expression as an expression tree.
 */
function makeTreesFromMin(mintable: IMinTable, type: expressionType): expressionTree[] {
	const checkValue = (type === "dnf" || type === "nanf") ? "1" : "0"; // value for positive value checks
	const checkNotValue = (type === "dnf" || type === "nanf") ? "0" : "1"; // value for negative ('not') value checks
	let outerPropertyName: "or"|"and" = "or";
	let innerPropertyName: "or"|"and" = "and";
	switch (type) {
		case "dnf":
			outerPropertyName = "or";
			innerPropertyName = "and";
			break;
		case "nanf":
			outerPropertyName = "and";
			innerPropertyName = "and";
			break;
		case "knf":
			outerPropertyName = "and";
			innerPropertyName = "or";
			break;
		case "nonf":
			outerPropertyName = "or";
			innerPropertyName = "or";
			break;
	}
	const hasNegations = (type === "nanf" || type === "nonf"); // when true negate outer and inner array

	// noting is selected exception check
	if (mintable.body.every( (e) => e.list[0].every( (f) => f < 2 ))) {
		return [{bool: false}];
	}
	// y = 1 exception check
	if (mintable.body.length === 1 && mintable.body[0].isEssential === true) {
		const firstItemData = mintable.body[0].blockData;
		if (firstItemData.filter((e: string) => e === "-").length === firstItemData.length) {
			return [{bool: true}];
		}
	}

	return mintable.body[0].usedInSolutions.map((el, selectedSolution) => {
		const outerArr: expressionTree[] = []; // initialize outer array
		// go though all prime implicants
		for (const pIs of mintable.body) {
			// if implicant is in selected solution
			if (pIs.usedInSolutions[selectedSolution]) {
				const innerArr: expressionTree[] = [];
				const dataLength: number = pIs.blockData.length;
				// go though ternary vector and add 1s or 0s to inner array
				for (let i = 0; i < dataLength; i++) {
					const reversePos = dataLength - i - 1;
					if (pIs.blockData[i] === checkValue) {
						innerArr.push({variable: reversePos});
					} else if (pIs.blockData[i] === checkNotValue) {
						innerArr.push({not: {variable: reversePos}});
					}
				}

				let innerTmp: expressionTree;
				if (innerPropertyName === "or") {
					innerTmp = {or: innerArr};
				} else {
					innerTmp = {and: innerArr};
				}

				// add inner array to outer array and negate if necessary
				if (hasNegations) {
					outerArr.push({not: innerTmp});
				} else {
					outerArr.push(innerTmp);
				}
			}
		}
		// return outer array and negate if necessary
		let outerTmp: expressionTree;
		if (outerPropertyName === "or") {
			outerTmp = {or: outerArr};
		} else {
			outerTmp = {and: outerArr};
		}

		if (hasNegations) {
			return {not: outerTmp};
		} else {
			return outerTmp;
		}
	});
}

export {
	ternary,
	expressionTree,
	calcValueForAssignment,
	expressionType,
	getExpressionAsTerms,
	getExpressionAsExpTrees,
	getMinimalTerms,
	minimizationType,
	IQmcSteps,
	IMinTable,
	IMinTableBlock,
	makeTreesFromMin,
	makeLaTeXFromExpTree,
	makeStringFromExpTree,
	IExpressionTreeBool,
};
