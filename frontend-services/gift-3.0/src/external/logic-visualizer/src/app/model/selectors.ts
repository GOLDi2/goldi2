import {TimelineData} from "./TimelineData";
import {createSelector, OutputSelector} from "reselect";
import Dictionary, {dictForEach} from "./Dictionary";
import {WaveDromGroup, WaveDromLane, WaveDromSource} from "./WaveDromSource";
import translator from "./translator";
import {reduxState} from "./reducer";

// helper selectors. used for construction of proper selectors
const getInputsSelector         = (state: reduxState): Dictionary<TimelineData> => state.inputs;
const getStatesSelector         = (state: reduxState): Dictionary<TimelineData> => state.states;
const getOutputsSelector        = (state: reduxState): Dictionary<TimelineData> => state.outputs;
const getHStarSelector          = (state: reduxState): { tld: TimelineData }    => state.hStar;
const getVLinesSelector         = (state: reduxState): { tld: TimelineData }    => state.vLines;
const getClocksElapsedSelector  = (state: reduxState): number                   => state.clocksElapsed;
const getHscaleSelector         = (state: reduxState): number                   => state.hscale;

// proper selectors. Adding "Selector" to the name is good practice since typing these manually is a nightmare.
export const getCurrentInputsSelector = createSelector(getInputsSelector,
    (inputs: Dictionary<TimelineData>): Dictionary<string> =>
        dictForEach<TimelineData, string>(inputs, (tld: TimelineData) => {
            return tld.valueNow();
        }));

export const getCurrentStatesSelector = createSelector(getStatesSelector,
    (states: Dictionary<TimelineData>): Dictionary<string> =>
        dictForEach<TimelineData, string>(states, (tld: TimelineData) => {
            return tld.valueNow();
        }));

export const getCurrentOutputsSelector = createSelector(getOutputsSelector,
    (outputs: Dictionary<TimelineData>): Dictionary<string> =>
        dictForEach<TimelineData, string>(outputs, (tld: TimelineData) => {
            return tld.valueNow();
        }));

export const getInputVisibilitySelector = createSelector(getInputsSelector,
    (inputs: Dictionary<TimelineData>): Dictionary<Boolean> =>
        dictForEach<TimelineData, Boolean>(inputs, (tld: TimelineData) => {
            return tld.isVisible;
        }));

export const getStateVisibilitySelector = createSelector(getStatesSelector,
    (states: Dictionary<TimelineData>): Dictionary<Boolean> =>
        dictForEach<TimelineData, Boolean>(states, (tld: TimelineData) => {
            return tld.isVisible;
        }));

export const getOutputVisibilitySelector = createSelector(getOutputsSelector,
    (outputs: Dictionary<TimelineData>): Dictionary<Boolean> =>
        dictForEach<TimelineData, Boolean>(outputs, (tld: TimelineData) => {
            return tld.isVisible;
        }));

export const getIsSequentialSelector = createSelector(getStatesSelector,
    (states: Dictionary<TimelineData>): boolean => {
        return Object.keys(states).length > 0
    });

export const getWaveDromSourceSelector = createSelector(getInputsSelector, getStatesSelector, getOutputsSelector,
    getHStarSelector, getVLinesSelector, getIsSequentialSelector, getClocksElapsedSelector, getHscaleSelector,
    (inputs: Dictionary<TimelineData>, states: Dictionary<TimelineData>, outputs: Dictionary<TimelineData>,
     hStar: { tld: TimelineData }, vLines: { tld: TimelineData }, isSequential: boolean, clocksElapsed: number, hscale: number): WaveDromSource => {

        let source: WaveDromSource = new WaveDromSource();

        if(isSequential) {
            source.signal.push(new WaveDromLane(translator.t("Clock"), 'l' + 'Hl'.repeat(clocksElapsed)));
            source.signal.push({}); // add whitespace
        }

        if(Object.keys(inputs).length > 0) {
            source.signal.push(new WaveDromGroup(translator.t("Inputs"), Object.keys(inputs).filter((key: string) => {
                return inputs[key].isVisible;
            }).map((key: string) => {
                return new WaveDromLane(key, inputs[key].values.slice(0).join("")); // have to make a copy, otherwise WaveDrom ruins everything
            })));
            source.indexMap.inputs = source.signal.length-1;
        }

        if(Object.keys(inputs).length > 0 && isSequential) {
            source.signal.push({}); // add whitespace
        }

        if(isSequential) {
            source.signal.push(new WaveDromGroup(translator.t("States"), Object.keys(states).filter((key: string) => {
                return states[key].isVisible;
            }).map((key: string) => {
                let meaningOfDot: string    = states[key].values[0];
                let data: string[]          = [meaningOfDot];

                states[key].values.forEach((value: string, index: number) => {
                    if(value !== '.'){
                        meaningOfDot = value;
                    }
                    if(index % 2 === 1) {
                        data.push(meaningOfDot);
                    }
                });

                return new WaveDromLane(key, '2' + '2.'.repeat(clocksElapsed), data);
            })));

            source.indexMap.states = source.signal.length-1;
        }

        if (Object.keys(inputs).length > 0 || (Object.keys(outputs).length > 0 && isSequential)) {
            source.signal.push({}); // add whitespace
        }

        if (Object.keys(outputs).length > 0) {
            source.signal.push(new WaveDromGroup(translator.t("Outputs"), Object.keys(outputs).filter((key: string) => {
                return outputs[key].isVisible;
            }).map((key: string) => {
                return new WaveDromLane(key, outputs[key].values.slice(0).join("")); // have to make a copy, otherwise WaveDrom ruins everything
            })));

            source.indexMap.outputs = source.signal.length-1;
        }

        source.hStar = hStar.tld.removeAllDots();
        source.vLines = vLines.tld.values;

        source.config.hscale = hscale;
        return source;
    });

export const getWaveJsonSelector = createSelector(getWaveDromSourceSelector, (WaveDromSource: WaveDromSource): string => {
    return JSON.stringify(WaveDromSource);
});