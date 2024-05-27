export interface MachineVariable {
    name: string;
    value: string;
}

export interface InitArgs {
    inputs: Array<MachineVariable>;
    states?: Array<MachineVariable>;
    outputs: Array<MachineVariable>;
    canSetState: boolean;
    hStar?: String;
}

export interface UserChangeArgs {
    inputs?: Array<MachineVariable>;
    states?: Array<MachineVariable>;
}

export interface SimulatorChangeArgs {
    states?: Array<MachineVariable>;
    outputs: Array<MachineVariable>;
    hStar?: string;
    answeringClock: boolean;
}

export class InitializeVisualizerEvent extends CustomEvent<any> {

    args: InitArgs;

    constructor(args: InitArgs) {
        super('lv-initialize');
        this.args = args;
    }
}

export class UserChangeEvent extends CustomEvent<any> {

    args: UserChangeArgs;

    constructor(args: UserChangeArgs) {
        super('lv-user-change');
        this.args = args;
    }
}

export class SimulatorChangeEvent extends CustomEvent<any> {

    args: SimulatorChangeArgs;

    constructor(args: SimulatorChangeArgs) {
        super('lv-simulator-change');
        this.args = args;
    }
}
// DIY SimulatorChangeEvent:
/* let args = {
    outputs: [{
        name: "y0",
        value: "0"
    }, { ... }, ... ],
    hStar: "1",
    answeringClock: false
};
let event = new CustomEvent('lv-simulator-change');
event["args"] = args;
document.dispatchEvent(event);*/

export class ClockEvent extends CustomEvent<any> {

    constructor() {
        super('lv-clock');
    }
}

export class ResetEvent extends CustomEvent<any> {
    constructor() {
        super('lv-reset');
    }
}

// used to communicate the horizontal scrolling to the scrollbar in LogicVisualizer
export class DiagramEvent extends CustomEvent<any> {

    width: string;
    isScroll: boolean;

    constructor(width: string, isScroll: boolean) {
        super('lv-diagram-svg-change');
        this.width = width;
        this.isScroll = isScroll;
    }
}

export class ExportEvent extends CustomEvent<any> {

    static WaveJSON = "WaveJSON";
    static SVG = 'SVG';
    static PNG = 'PNG';

    format: string;

    constructor(format) {
        super('lv-export');

        if(format != ExportEvent.WaveJSON && format != ExportEvent.SVG && format != ExportEvent.PNG) {
            throw new Error("invalid format");
        }

        this.format = format;
    }
}

// dispatcher functions for convenience

export function dispatchInitializeVisualizerEvent(args: InitArgs){
    document.dispatchEvent(new InitializeVisualizerEvent(args));
}

export function dispatchUserChangeEvent(args: UserChangeArgs) {
    document.dispatchEvent(new UserChangeEvent(args));
}

export function dispatchSimulatorChangeEvent(args: SimulatorChangeArgs) {
    document.dispatchEvent(new SimulatorChangeEvent(args));
}

export function dispatchClockEvent() {
    document.dispatchEvent((new ClockEvent()));
}

export function dispatchResetEvent() {
    document.dispatchEvent(new ResetEvent());
}