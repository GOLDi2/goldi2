/**
 * @module Validationlib Function Library
 */

/**
 * Interface to access object of type any with ["propertyName"].
 * @interface
 */
interface  IValidationWrapper {
	[index: string]: string | object | number;
}

/**
 * Interface of an object in validationSchematic with type="object".
 * @interface
 */
interface IValidationObj {
	[index: string]: string | object | number;
	name: string;
	nbObjects: number;
	properties: Array<IValidationObj | IValidationProp>;
	maxNbObjects: number;
	type: string;
}

/**
 * Interface of an object in validationSchematic with type="string" | "number" | "boolean".
 * @interface
 */
interface IValidationProp {
	[index: string]: string | object | number;
	name: string;
	type: string;
	maxValue: number;
	minValue: number;
	pattern: string;
}

/**
 * Schematic to recursively iterate over imported object.
 * Defines the structure and content of the imported file.
 * @constant
 */
const importSchematic = {
	maxNbObjects: -1,
	name: "importDataWrapper",
	nbObjects: 4,
	properties: [
		{
			maxValue: -1,
			minValue: -1,
			name: "saneVersion",
			pattern: "^(\\d)+\\.(\\d)+\\.(\\d)+$",
			type: "string",
		},
		{
			maxNbObjects: -1,
			name: "saneData",
			nbObjects: 4,
			properties: [
				{
					maxNbObjects: -1,
					name: "charSet",
					nbObjects: 6,
					properties: [
						{
							maxValue: -1,
							minValue: -1,
							name: "andChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
						{
							maxValue: -1,
							minValue: -1,
							name: "antivalChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
						{
							maxValue: -1,
							minValue: -1,
							name: "equivChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
						{
							maxValue: -1,
							minValue: -1,
							name: "implyChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
						{
							maxValue: -1,
							minValue: -1,
							name: "notChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
						{
							maxValue: -1,
							minValue: -1,
							name: "orChar",
							pattern: "[^\\dXxYyg\\[\\]\\)\\(\\?]",
							type: "string",
						},
					],
					type: "object",
				},
				{
					maxValue: 7, // TODO access data limits
					minValue: 0,
					name: "nInputColumns",
					pattern: "",
					type: "number",
				},
				{
					maxValue: 9, // TODO access data limits
					minValue: 0,
					name: "nOutputColumns",
					pattern: "",
					type: "number",
				},
				{
					maxNbObjects: 2 ** 9,
					name: "outputRows",
					nbObjects: -1,
					properties: [
						{
							maxValue: -1,
							minValue: -1,
							name: "mask",
							pattern: "",
							type: "boolean",
						},
						{
							maxNbObjects: -1,
							name: "output",
							nbObjects: 1,
							properties: [
								{
									maxValue: (2 ** 7) - 1,
									minValue: 0,
									name: "0",
									pattern: "",
									type: "number",
								},
							],
							type: "object",
						},
					],
					type: "object",
				},
			],
			type: "object",
		},
		{
			maxValue: -1,
			minValue: -1,
			name: "language",
			pattern: "^en|de$",
			type: "string",
		},
		{
			maxValue: -1,
			minValue: -1,
			name: "color",
			pattern: "^light|dark$",
			type: "string",
		},
	],
	type: "object",
};

export {
	IValidationWrapper,
	IValidationObj,
	IValidationProp,
	importSchematic,
};
