/**
 * @module Boollib function library
 */

import { ISaneData, ISaneDataRow } from "./sane-data.js";

/**
 * A listing of used truth values.
 * @enum
 */
enum Value {
	false,
	true,
	"*",
	"?",
}

/**
 * Turns values to Integers.
 * @param {Value} v
 * @returns {number}
 */
function valueToInt(v: Value): number {
	switch (v) {
		case Value.false:
			return 0;
		case Value.true:
			return 1;
		case Value["*"]:
			return -2;
		case Value["?"]:
			return -1;
		default:
			return 0;
	}
}

/**
 * Gets bitWidth of a number.
 * @param {number} num
 * @returns {number}
 */
function bitWidth(num: number): number {
	num = num < 0 ? -num : num;

	if (!Number.isInteger(num)) {
		num = Math.ceil(num);	// enforce integer
	}
	return Math.floor((Math.log2(num))) + 1;
}

/**
 * Safes the maximum value of the data object.
 * @param {number[]} data
 * @returns {number}
 */
function maxValue(data: number[]): number {
	if (data.length > 0) {
		return Math.max(...data);
	} else {
		return 0;
	}
}

/**
 * Gets value of an element of the given array at specific index.
 * @param {number[] | number} value
 * @param {number} index
 * @returns {number | "?"}
 */
function getBitGParam(value: number[] | number, index: number): number | "?" {
	if (Array.isArray(value) && value.length === 1) {
		return (value[0] >> index) & 1;
	} else if (typeof value === "number") {
		return (value >> index) & 1;
	} else {
		return "?";
	}
}

/**
 * Gets value of an element of the given array at specific index.
 * @param {number[] | number} value
 * @param {number} index
 * @returns {number | "?"}
 */
function getBit(value: number[] | number, index: number): 0 | 1 {
	if (Array.isArray(value) && value.length === 1) {
		return (value[0] >> index) & 1 ? 1 : 0;
	} else if (typeof value === "number") {
		return (value >> index) & 1 ? 1 : 0;
	} else {
		return 0;
	}
}

function setBitToVal(value: number, position: number, bit: 0 | 1): number {
	return value ^ (-bit ^ value) & (1 << position);
}

/**
 * Converts hexadecimal strings to binary strings.
 * @param {string} hex
 * @param data
 * @returns {string}
 */
function hex2bin(hex: string): string {
	const bytelength = 4;
	if (hex.length > Number.MAX_SAFE_INTEGER.toString(16).length - 1) {
		let output = "";
		for (let i = 0; i < hex.length; i++) { // For each hexadecimal character
			const decimal = parseInt(hex.charAt(i), 16); // Convert to decimal
			// Convert to binary and add 0s onto the left as necessary to make up to 4 bits
			const binary = leftPadding(decimal.toString(2), "0", bytelength);
			output += binary; // Append to string
		}
		return output;
	} else {
		return parseInt(hex, 16).toString(2);
	}
}

/**
 * Converts binary strings to hexadecimal strings.
 * @param {string} bin
 * @param data
 * @returns {string}
 */
function bin2hex(bin: string): string {
	if (bin.length > Number.MAX_SAFE_INTEGER.toString(2).length) {
		let output = "";
		for (let i = 0; i < bin.length; i += 4) { // For every 4 bits in the binary string
			const bytes = bin.substr(i, 4); // Grab a chunk of 4 bits
			const decimal = parseInt(bytes, 2); // Convert to decimal then hexadecimal
			const hex = decimal.toString(16);	// Uppercase all the letters and append to output
			output += hex.toUpperCase();
		}
		return output;
	} else {
		return parseInt(bin, 2).toString(16);
	}
}

function getFunctionIndexForYIndex(data: ISaneData, index: number): string {
	if (!data || !data.outputRows) {
		return "";
	}

	const ret = data.outputRows.reduce((sum: string, el: ISaneDataRow) => getBit(el.output, index).toString() + sum, "");
	return bin2hex(ret);
}

function getHStarIndex(data: ISaneData): string {
	if (!data || !data.outputRows) {
		return "";
	}

	const ret = data.outputRows.reduce((sum: string, el: ISaneDataRow) => (el.mask ? "0" : "1") + sum, "");
	return bin2hex(ret);
}

/**
 * Used for the hex2bin function to fill up binary numbers with 0's.
 * @param {string} inputString
 * @param {string} padChar
 * @param {number} totalChars
 * @returns {string}
 */
function leftPadding(inputString: string, padChar: string, totalChars: number) {
	if (!inputString || !padChar || inputString.length >= totalChars) { // If the string is right length return
		return inputString;
	}
	const charsToAdd = (totalChars - inputString.length) / padChar.length; // how many chars we need to add
	for (let i = 0; i < charsToAdd; i++) { // Add padding onto the string
		inputString = padChar + inputString;
	}
	return inputString;
}

export {
	getFunctionIndexForYIndex,
	maxValue,
	bitWidth,
	getBit,
	setBitToVal,
	getHStarIndex,
	bin2hex,
	hex2bin,
};
