/**
 * The global start configuration
 */
import { ISaneData } from "./sane-data.js";

let startConfiguration: IStartConfig;

/**
 * The layout of the start configuration.
 * Blocked features are optional.
 */
interface IStartConfig {
	viewLeft: string;
	viewRight: string;
	data: any;
	bockedFeatures?: IBlockedFeatures;
}

/**
 * The possible blocked or default features.
 * Must contain navigation, rest is optional.
 */
interface IBlockedFeatures {
	navigation: boolean;
	truthTable?: IBlockedFeaturesTT;
	allFunctions?: IBlockedFeaturesAF;
	vennDiagram?: IBlockedFeaturesVENN;
	kvDiagram?: IBlockedFeaturesKV;
	booleanAlgebra?: IBlockedFeaturesBAA;
	functionIndex?: IBlockedFeaturesFI;
	qmcAlgorithm?: IBlockedFeaturesQMC;
}

/**
 * The features within the views.
 */
interface IBlockedFeaturesTT {
	changeInputColumns: boolean;
	changeOutputColumns: boolean;
	toggleBits: boolean;
	toggleH: boolean;
	changeOutputValue: boolean;
}

interface IBlockedFeaturesAF {
	changeType: boolean;
	defaultType: string;
}

interface IBlockedFeaturesVENN {
	changeY: boolean;
	defaultY: object;
}

interface IBlockedFeaturesKV {
	changeY: boolean;
	defaultY: number;
	changeInputColumns: boolean;
	switchAutoMinimize: boolean;
	defaultAutoMinimizeOn: boolean;
	drawBlocks: boolean;
	toggleBits: boolean;
}

interface IBlockedFeaturesBAA {
	changeY: boolean;
	defaultY: number;
	inputNewFunction: boolean;
}

interface IBlockedFeaturesFI {
	inputNewIndex: boolean;
	inputNewH: boolean;
}

interface IBlockedFeaturesQMC {
	changeY: boolean;
	defaultY: number;
	changeType: boolean;
	defaultType: string;
}

/**
 * Set a new global start configuration.
 * @param {string} uri The raw string from the url parameter.
 */
function setStartConfig(uri: string) {
	localStorage.clear(); // clear local storage
	const scString = decodeURIComponent(uri); // decode URI into regular string
	startConfiguration = JSON.parse(scString); // parse string to JSON object and set as start configuration
	console.log("new start configuaration", startConfiguration);
}

/**
 * Check if a SaneData object exists in the start configuration.
 * @returns {any | undefined} The SaneData object in the start configuration - if one exists.
 */
function checkSCData(): any | undefined {
	if (startConfiguration) {
		return startConfiguration.data;
	} else {
		return undefined;
	}
}

interface ISCVViews {
	leftDefault: string;
	rightDefault: string;
}

/**
 * Check if there is information about the default views in the start configuration.
 * @returns {object | undefined} An object with the view names - if they exist.
 */
function checkSCViews(): ISCVViews | undefined {
	if (startConfiguration) {
		return {leftDefault: startConfiguration.viewLeft, rightDefault: startConfiguration.viewRight};
	} else {
		return undefined;
	}
}

/**
 * Check if any feature of the blocked features exists in the start configuration.
 * @param {string} blockedFeatureView The view that needs information.
 * @param {string} feature The feature that needs to be checked.
 * @returns {any} The result of the check with the value depending on the feature.
 */
function checkSCBlockedFeatures(blockedFeatureView: string, feature: string): any {
	let retValue;
	if (startConfiguration) {
		if (startConfiguration.hasOwnProperty("bockedFeatures")) {
			const scbf = startConfiguration.bockedFeatures!;
			switch (blockedFeatureView) {
				case "navigation":
					retValue = scbf.navigation;
					break;
				case "truthTable":
					if (scbf.hasOwnProperty("truthTable")) {
						switch (feature) {
							case "changeInputColumns":
								retValue = scbf.truthTable!.changeInputColumns;
								break;
							case "changeOutputColumns":
								retValue = scbf.truthTable!.changeOutputColumns;
								break;
							case "toggleBits":
								retValue = scbf.truthTable!.toggleBits;
								break;
							case "toggleH":
								retValue = scbf.truthTable!.toggleH;
								break;
							case "changeOutputValue":
								retValue = scbf.truthTable!.changeOutputValue;
								break;
						}
					}
					break;
				case "allFunctions":
					if (scbf.hasOwnProperty("allFunctions")) {
						switch (feature) {
							case "changeType":
								retValue = scbf.allFunctions!.changeType;
								break;
							case "defaultType":
								retValue = scbf.allFunctions!.defaultType;
								break;
						}
					}
					break;
				case "vennDiagram":
					if (scbf.hasOwnProperty("vennDiagram")) {
						switch (feature) {
							case "changeY":
								retValue = scbf.vennDiagram!.changeY;
								break;
							case "defaultY":
								retValue = scbf.vennDiagram!.defaultY;
								break;
						}
					}
					break;
				case "kvDiagram":
					if (scbf.hasOwnProperty("kvDiagram")) {
						switch (feature) {
							case "changeY":
								retValue = scbf.kvDiagram!.changeY;
								break;
							case "defaultY":
								retValue = scbf.kvDiagram!.defaultY;
								break;
							case "changeInputColumns":
								retValue = scbf.kvDiagram!.changeInputColumns;
								break;
							case "switchAutoMinimize":
								retValue = scbf.kvDiagram!.switchAutoMinimize;
								break;
							case "defaultAutoMinimizeOn":
								retValue = scbf.kvDiagram!.defaultAutoMinimizeOn;
								break;
							case "drawBlocks":
								retValue = scbf.kvDiagram!.drawBlocks;
								break;
							case "toggleBits":
								retValue = scbf.kvDiagram!.toggleBits;
								break;
						}
					}
					break;
				case "booleanAlgebra":
					if (scbf.hasOwnProperty("booleanAlgebra")) {
						switch (feature) {
							case "changeY":
								retValue = scbf.booleanAlgebra!.changeY;
								break;
							case "defaultY":
								retValue = scbf.booleanAlgebra!.defaultY;
								break;
							case "inputNewFunction":
								retValue = scbf.booleanAlgebra!.inputNewFunction;
								break;
						}
					}
					break;
				case "functionIndex":
					if (scbf.hasOwnProperty("functionIndex")) {
						switch (feature) {
							case "inputNewIndex":
								retValue = scbf.functionIndex!.inputNewIndex;
								break;
							case "inputNewH":
								retValue = scbf.functionIndex!.inputNewH;
								break;
						}
					}
					break;
				case "qmcAlgorithm":
					if (scbf.hasOwnProperty("qmcAlgorithm")) {
						switch (feature) {
							case "changeY":
								retValue = scbf.qmcAlgorithm!.changeY;
								break;
							case "defaultY":
								retValue = scbf.qmcAlgorithm!.defaultY;
								break;
							case "changeType":
								retValue = scbf.qmcAlgorithm!.changeType;
								break;
							case "defaultType":
								retValue = scbf.qmcAlgorithm!.defaultType;
								break;
						}
					}
					break;
			}
		}
	}
	return retValue;
}

export {
	startConfiguration,
	checkSCBlockedFeatures,
	setStartConfig,
	checkSCViews,
	checkSCData,
};
