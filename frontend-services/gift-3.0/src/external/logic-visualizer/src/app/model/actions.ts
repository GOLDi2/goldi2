import {InitArgs, InitializeVisualizerEvent, SimulatorChangeArgs, SimulatorChangeEvent, UserChangeArgs} from "./Events";

// action types. basically act as enums.
export const INITIALIZE = 'INITIALIZE';
export const SIMULATOR_CHANGE = 'SIMULATOR_CHANGE';
export const USER_CHANGE = 'USER_CHANGE';
export const CLOCK = 'CLOCK';
export const TOGGLEMCE = 'TOGGLEMCE'; // multi clock execution
export const IMPORT = 'IMPORT';
export const ZOOM = 'ZOOM';
export const VLINE = 'VLINE';
export const VISIBILITY = 'VISIBILITY';

export class InitializeVisualizerAction {
    type = INITIALIZE;
    args: InitArgs;

    constructor(args: InitArgs) {
        this.args = args;
    }
}

export class UserChangeAction {
    type = USER_CHANGE;
    args: UserChangeArgs;

    constructor(args: UserChangeArgs) {
        this.args = args;
    }
}

export class SimulatorChangeAction {
    type = SIMULATOR_CHANGE;
    args: SimulatorChangeArgs;

    constructor(args: SimulatorChangeArgs) {
        this.args = args;
    }
}

export class ClockAction {
    type = CLOCK;
}

export class ToggleMCEAction {
    type = TOGGLEMCE;
}

export class ImportAction {
    type = IMPORT;
    waveJSON: string;

    constructor(waveJSON: string) {
        this.waveJSON = waveJSON;
    }
}

export class ZoomAction {
    static IN = 'IN';
    static OUT = 'OUT';

    type = ZOOM;
    direction: string;

    constructor(e: WheelEvent) {
        if(e.deltaY > 0) {
            this.direction = ZoomAction.OUT;
        } else {
            this.direction = ZoomAction.IN;
        }
    }
}

export class VLineAction {
    type = VLINE;

    xPosition: number;

    constructor(xPosition: number) {
        this.xPosition = xPosition;
    }
}

export class VisibilityAction {
    static INPUT = 'INPUT';
    static STATE = 'STATE';
    static OUTPUT = 'OUTPUT';

    type = VISIBILITY;

    name: string;
    value: boolean;
    laneClass: string;

    constructor(name: string, value: boolean, laneClass: string) {
        this.name = name;
        this.value = value;
        this.laneClass = laneClass;
    }
}

// redux cannot deal with classes so we have to downgrade them into objects.
// For convenience, here are some functions that create and downgrade in one go:

export const initializeVisualizer = (args: InitArgs) => {
    return {...(new InitializeVisualizerAction(args))};
};

export const userChange = (args: UserChangeArgs) => {
    return {...(new UserChangeAction(args))};
};

export const simulatorChange = (args: SimulatorChangeArgs) => {
    return {...(new SimulatorChangeAction(args))};
};

export const clock = () => {
    return {...(new ClockAction())};
};

export const toggleMCE = () => {
    return {...(new ToggleMCEAction())};
};

export const importAction = (waveJSON: string) => {
    return {...(new ImportAction(waveJSON))};
};

export const zoomAction = (e: WheelEvent) => {
    return {...(new ZoomAction(e))};
};

export const vLineAction = (xPosition: number) => {
    return {...(new VLineAction(xPosition))};
};

export const visibilityAction = (name: string, value: boolean, laneClass: string) => {
    return {...(new VisibilityAction(name, value, laneClass))};
};