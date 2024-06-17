import {TimelineData} from "./TimelineData";
import {
    CLOCK,              ClockAction,
    IMPORT,             ImportAction,
    INITIALIZE,         InitializeVisualizerAction,
    SIMULATOR_CHANGE,   SimulatorChangeAction,
    TOGGLEMCE,          ToggleMCEAction,
    USER_CHANGE,        UserChangeAction,
    VISIBILITY,         VisibilityAction,
    VLINE,              VLineAction,
    ZOOM,               ZoomAction
} from "./actions";
import Dictionary from "./Dictionary";
import {MachineVariable} from "./Events";
import {WaveDromGroup, WaveDromLane, WaveDromSource} from "./WaveDromSource";


export interface reduxState {
    inputs: Dictionary<TimelineData>,
    states: Dictionary<TimelineData>,
    outputs: Dictionary<TimelineData>,
    hStar: {tld: TimelineData},
    vLines: {tld: TimelineData},
    hscale: number,
    multiClockExecutionActive: boolean,
    canSetState: boolean,
    clocksElapsed: number,
    viewMode: boolean,
    fullRedraw: boolean
}

const INITIAL_STATE: reduxState = {
    inputs: {},
    states: {},
    outputs: {},

    // these are wrapped so that we can overwrite them without having to make a new TimelineData. they are overwritten in initialization but having them initialized here is necessary so importing works
    hStar: {tld: new TimelineData("hStar", "0")},    // 0 = no h*, 1 = h*(x), 2 = h*(z), 3 = h*(x,z)
    // vLines stores values from 0000 to 1111 for the possible combinations of lines in one clock.
    // Each bit indicates whether there is a line at one of the four possible positions: clock start, first quarter, half, third quarter
    // e.g. 1001 = lines at clock start and third quarter
    vLines: {tld: new TimelineData("vLines", '0000')},
    hscale: 2,
    multiClockExecutionActive: false,
    canSetState: false,
    clocksElapsed: 0,
    viewMode: false,
    fullRedraw: true
};

// whenever you dispatch an action to the store, it calls the reducer with the current state and the action which returns the new State
export const reducer = (state: reduxState = {...INITIAL_STATE}, action) => {
    // need to overwrite the objects so that the change is registered by redux
    let newInputs: Dictionary<TimelineData> = {...state.inputs};
    let newStates: Dictionary<TimelineData> = {...state.states};
    let newOutputs: Dictionary<TimelineData> = {...state.outputs};
    let newHStar = {...state.hStar};
    let newVLines = {...state.vLines};
    let newState: reduxState = {...state};

    switch(action.type) {
        case INITIALIZE:
            action = action as InitializeVisualizerAction;

            newInputs = {};
            newStates = {};
            newOutputs = {};
            newHStar = {tld: new TimelineData("hStar", "0")}; // cannot just copy from INITIAL_STATE because that wouldn't clone the TimelineData and retain the reference to the same object which would result in problems after a reset
            newVLines = {tld: new TimelineData("vLines", "0000")};
            newState = {...INITIAL_STATE};

            //TODO maybe add safety against missing args properties

            // create the data structures for recording the values of each I/S/O
            action.args.inputs.forEach((input: MachineVariable) => {
                newInputs[input.name] = new TimelineData(input.name, input.value);
            });
            newState.inputs = newInputs;

            action.args.states.forEach((machineState: MachineVariable) => {
                newStates[machineState.name] = new TimelineData(machineState.name, machineState.value);
            });
            newState.states = newStates;

            action.args.outputs.forEach((output: MachineVariable) => {
                newOutputs[output.name] = new TimelineData(output.name, output.value);
            });
            if(Object.keys(newStates).length === 0) { // if combinatorial, inputs are always one clock ahead of outputs
                action.args.outputs.forEach((output: MachineVariable) => {
                    newOutputs[output.name].values = [];
                    newOutputs[output.name].meaningOfDot = 'x';
                });
            }
            newState.outputs = newOutputs;

            if(action.args.hStar !== undefined) { // not all systems have to send h*-data
                newHStar.tld.updateValue(action.args.hStar);
            }
            newState.hStar = newHStar;
            newState.vLines = newVLines;

            newState.canSetState = ((action.args.canSetState !== undefined) ? action.args.canSetState : false);

            return newState;

        case USER_CHANGE:
            action = action as UserChangeAction;

            if(action.args.inputs !== undefined) {
                action.args.inputs.forEach((input: MachineVariable) => {
                    newInputs[input.name].updateValue(input.value);
                });
                newState.inputs = newInputs;
            }

            if(action.args.states !== undefined) {
                action.args.states.forEach((state: MachineVariable) => {
                    newStates[state.name].updateValue(state.value);
                });
                newState.states = newStates;
            }

            return newState;

        case SIMULATOR_CHANGE:
            action = action as SimulatorChangeAction;

            action.args.outputs.forEach((output: MachineVariable) => {
                newOutputs[output.name].updateValue(output.value);
            });
            newState.outputs = newOutputs;

            if(action.args.states !== undefined) {
                action.args.states.forEach((state: MachineVariable) => {
                    newStates[state.name].updateValue(state.value);
                });
                newState.states = newStates;
            }

            if(action.args.hStar !== undefined) {
                newHStar.tld.updateValue(action.args.hStar);
                newState.hStar = newHStar;
            }

            if(action.args.answeringClock) { // using two WaveDrom-clocks (which are represented in the TimeLineData-s) to display one simulator clock. The first one records what the simulator sends and the second is open for changes from the user.
                addTimeStep(newState);
            }

            newState.fullRedraw = newState.clocksElapsed < 2; // to deal with a bug in combinatorial case where the second clock would draw wrong if changing the input and there was no h*

            return newState;

        case CLOCK:
            action = action as ClockAction;

            addTimeStep(state);
            newState.inputs = newInputs;
            newState.states = newStates;
            newState.outputs = newOutputs;
            newState.clocksElapsed++;
            newState.canSetState = false;

            return newState;

        case TOGGLEMCE:
            action = action as ToggleMCEAction;

            newState.multiClockExecutionActive = !newState.multiClockExecutionActive;

            return newState;

        case IMPORT:
            action = action as ImportAction;

            newInputs = {};
            newStates = {};
            newOutputs = {};
            newHStar = {tld: new TimelineData("hStar", "0")}; // cannot just copy from INITIAL_STATE because that wouldn't clone the TimelineData and retain the reference to the same object which would result in problems after a reset
            newVLines = {tld: new TimelineData("vLines", "0000")};
            newState = {...INITIAL_STATE};

            let importedSource = JSON.parse(action.waveJSON) as WaveDromSource;

            if(importedSource.hStar !== undefined) {
                newHStar.tld.values = importedSource.hStar;
            }
            newState.hStar = newHStar;

            if(importedSource.vLines !== undefined) {
                newVLines.tld.values = importedSource.vLines;
            }
            newState.vLines = newVLines;

            if(importedSource.config) {
                newState.hscale = importedSource.config.hscale;
            }

            if(importedSource.indexMap.inputs) {
                (importedSource.signal[importedSource.indexMap.inputs] as WaveDromGroup).forEach((lane: WaveDromLane, index: number) => {
                    if(index !== 0) { // first entry is the group name
                        newInputs[lane.name] = new TimelineData(lane.name, "0");
                        if(lane.wave instanceof Array) {
                            newInputs[lane.name].values = lane.wave;
                        } else {
                            newInputs[lane.name].values = lane.wave.split("");
                        }
                        newState.clocksElapsed = (newInputs[lane.name].values.length-1)/2;
                    }
                });
            }
            newState.inputs = newInputs;

            if(importedSource.indexMap.states) {
                (importedSource.signal[importedSource.indexMap.states] as WaveDromGroup).forEach((lane: WaveDromLane, index: number) => {
                    if(index !== 0) {
                        newStates[lane.name] = new TimelineData(lane.name, lane.data[0]);

                        lane.data.forEach((entry: string, idx: number) => {
                            if(idx > 0){
                                newStates[lane.name].nextEntry();
                                newStates[lane.name].updateValue(entry);
                                newStates[lane.name].nextEntry();
                            }
                        });
                        newState.clocksElapsed = (newStates[lane.name].values.length-1)/2;
                    }
                });
            }
            newState.states = newStates;


            if(importedSource.indexMap.outputs) {
                (importedSource.signal[importedSource.indexMap.outputs] as WaveDromGroup).forEach((lane: WaveDromLane, index: number) => {
                    if(index !== 0) {
                        newOutputs[lane.name] = new TimelineData(lane.name, "0");
                        if(lane.wave instanceof Array) {
                            newOutputs[lane.name].values = lane.wave;
                        } else {
                            newOutputs[lane.name].values = lane.wave.split("");
                        }
                        newState.clocksElapsed = (newOutputs[lane.name].values.length-1)/2;
                    }
                });
            }
            newState.outputs = newOutputs;

            newState.viewMode = true;

            return newState;

        case ZOOM:
            action = action as ZoomAction;

            if(action.direction === ZoomAction.IN) {
                if(state.hscale < 5) {
                    newState.hscale++;
                }
            } else {
                if(state.hscale > 1) {
                    newState.hscale--;
                }
            }
            newState.fullRedraw = true;

            return newState;

        case VLINE:
            action = action as VLineAction;

            let index: number       = Math.ceil((action.xPosition-15*state.hscale)/(40*state.hscale)); // position in the vLines value array
            let subIndex: number    = Math.ceil((action.xPosition-(index-1)*40*state.hscale-15*state.hscale)/(10*state.hscale))-1; // position in the string at that index
            let workValue: string[] = newVLines.tld.values[index].split('');

            workValue[subIndex] = String(Number(!Boolean(Number(workValue[subIndex])))); // flipping the according bit
            newVLines.tld.values[index] = workValue.join('');
            newState.vLines = newVLines;

            return newState;

        case VISIBILITY:
            action = action as VisibilityAction;

            switch (action.laneClass) {
                case VisibilityAction.INPUT:
                    newInputs[action.name].isVisible = action.value;
                    newState.inputs = newInputs;
                    break;
                case VisibilityAction.STATE:
                    newStates[action.name].isVisible = action.value;
                    newState.states = newStates;
                    break;
                case VisibilityAction.OUTPUT:
                    newOutputs[action.name].isVisible = action.value;
                    newState.outputs = newOutputs;
                    break;
                default:
                    console.log("improper use of VisibilityAction");
            }

            newState.fullRedraw = true;

            return newState;

        default:
            return state;
  }
};

let addTimeStep = (state: reduxState) => {
    Object.keys(state.inputs).forEach((key: string) => {
        state.inputs[key].nextEntry();
    });
    Object.keys(state.states).forEach((key: string) => {
        state.states[key].nextEntry();
    });
    Object.keys(state.outputs).forEach((key: string) => {
        state.outputs[key].nextEntry();
    });
    state.hStar.tld.nextEntry();
    state.vLines.tld.values.push('0000'); // can't use nextEntry here because '.'s are useless for vLines
};