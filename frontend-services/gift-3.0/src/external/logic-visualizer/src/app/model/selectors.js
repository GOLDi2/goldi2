import { createSelector } from "reselect";
import { dictForEach } from "./Dictionary";
import { WaveDromGroup, WaveDromLane, WaveDromSource } from "./WaveDromSource";
import translator from "./translator";
// helper selectors. used for construction of proper selectors
const getInputsSelector = (state) => state.inputs;
const getStatesSelector = (state) => state.states;
const getOutputsSelector = (state) => state.outputs;
const getHStarSelector = (state) => state.hStar;
const getVLinesSelector = (state) => state.vLines;
const getClocksElapsedSelector = (state) => state.clocksElapsed;
const getHscaleSelector = (state) => state.hscale;
// proper selectors. Adding "Selector" to the name is good practice since typing these manually is a nightmare.
export const getCurrentInputsSelector = createSelector(getInputsSelector, (inputs) => dictForEach(inputs, (tld) => {
    return tld.valueNow();
}));
export const getCurrentStatesSelector = createSelector(getStatesSelector, (states) => dictForEach(states, (tld) => {
    return tld.valueNow();
}));
export const getCurrentOutputsSelector = createSelector(getOutputsSelector, (outputs) => dictForEach(outputs, (tld) => {
    return tld.valueNow();
}));
export const getInputVisibilitySelector = createSelector(getInputsSelector, (inputs) => dictForEach(inputs, (tld) => {
    return tld.isVisible;
}));
export const getStateVisibilitySelector = createSelector(getStatesSelector, (states) => dictForEach(states, (tld) => {
    return tld.isVisible;
}));
export const getOutputVisibilitySelector = createSelector(getOutputsSelector, (outputs) => dictForEach(outputs, (tld) => {
    return tld.isVisible;
}));
export const getIsSequentialSelector = createSelector(getStatesSelector, (states) => {
    return Object.keys(states).length > 0;
});
export const getWaveDromSourceSelector = createSelector(getInputsSelector, getStatesSelector, getOutputsSelector, getHStarSelector, getVLinesSelector, getIsSequentialSelector, getClocksElapsedSelector, getHscaleSelector, (inputs, states, outputs, hStar, vLines, isSequential, clocksElapsed, hscale) => {
    let source = new WaveDromSource();
    if (isSequential) {
        source.signal.push(new WaveDromLane(translator.t("Clock"), 'l' + 'Hl'.repeat(clocksElapsed)));
        source.signal.push({}); // add whitespace
    }
    if (Object.keys(inputs).length > 0) {
        source.signal.push(new WaveDromGroup(translator.t("Inputs"), Object.keys(inputs).filter((key) => {
            return inputs[key].isVisible;
        }).map((key) => {
            return new WaveDromLane(key, inputs[key].values.slice(0).join("")); // have to make a copy, otherwise WaveDrom ruins everything
        })));
        source.indexMap.inputs = source.signal.length - 1;
    }
    if (Object.keys(inputs).length > 0 && isSequential) {
        source.signal.push({}); // add whitespace
    }
    if (isSequential) {
        source.signal.push(new WaveDromGroup(translator.t("States"), Object.keys(states).filter((key) => {
            return states[key].isVisible;
        }).map((key) => {
            let meaningOfDot = states[key].values[0];
            let data = [meaningOfDot];
            states[key].values.forEach((value, index) => {
                if (value !== '.') {
                    meaningOfDot = value;
                }
                if (index % 2 === 1) {
                    data.push(meaningOfDot);
                }
            });
            return new WaveDromLane(key, '2' + '2.'.repeat(clocksElapsed), data);
        })));
        source.indexMap.states = source.signal.length - 1;
    }
    if (Object.keys(inputs).length > 0 || (Object.keys(outputs).length > 0 && isSequential)) {
        source.signal.push({}); // add whitespace
    }
    if (Object.keys(outputs).length > 0) {
        source.signal.push(new WaveDromGroup(translator.t("Outputs"), Object.keys(outputs).filter((key) => {
            return outputs[key].isVisible;
        }).map((key) => {
            return new WaveDromLane(key, outputs[key].values.slice(0).join("")); // have to make a copy, otherwise WaveDrom ruins everything
        })));
        source.indexMap.outputs = source.signal.length - 1;
    }
    source.hStar = hStar.tld.removeAllDots();
    source.vLines = vLines.tld.values;
    source.config.hscale = hscale;
    return source;
});
export const getWaveJsonSelector = createSelector(getWaveDromSourceSelector, (WaveDromSource) => {
    return JSON.stringify(WaveDromSource);
});
//# sourceMappingURL=selectors.js.map