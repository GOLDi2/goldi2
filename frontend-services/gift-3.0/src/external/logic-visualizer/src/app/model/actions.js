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
    constructor(args) {
        this.type = INITIALIZE;
        this.args = args;
    }
}
export class UserChangeAction {
    constructor(args) {
        this.type = USER_CHANGE;
        this.args = args;
    }
}
export class SimulatorChangeAction {
    constructor(args) {
        this.type = SIMULATOR_CHANGE;
        this.args = args;
    }
}
export class ClockAction {
    constructor() {
        this.type = CLOCK;
    }
}
export class ToggleMCEAction {
    constructor() {
        this.type = TOGGLEMCE;
    }
}
export class ImportAction {
    constructor(waveJSON) {
        this.type = IMPORT;
        this.waveJSON = waveJSON;
    }
}
let ZoomAction = /** @class */ (() => {
    class ZoomAction {
        constructor(e) {
            this.type = ZOOM;
            if (e.deltaY > 0) {
                this.direction = ZoomAction.OUT;
            }
            else {
                this.direction = ZoomAction.IN;
            }
        }
    }
    ZoomAction.IN = 'IN';
    ZoomAction.OUT = 'OUT';
    return ZoomAction;
})();
export { ZoomAction };
export class VLineAction {
    constructor(xPosition) {
        this.type = VLINE;
        this.xPosition = xPosition;
    }
}
let VisibilityAction = /** @class */ (() => {
    class VisibilityAction {
        constructor(name, value, laneClass) {
            this.type = VISIBILITY;
            this.name = name;
            this.value = value;
            this.laneClass = laneClass;
        }
    }
    VisibilityAction.INPUT = 'INPUT';
    VisibilityAction.STATE = 'STATE';
    VisibilityAction.OUTPUT = 'OUTPUT';
    return VisibilityAction;
})();
export { VisibilityAction };
// redux cannot deal with classes so we have to downgrade them into objects.
// For convenience, here are some functions that create and downgrade in one go:
export const initializeVisualizer = (args) => {
    return { ...(new InitializeVisualizerAction(args)) };
};
export const userChange = (args) => {
    return { ...(new UserChangeAction(args)) };
};
export const simulatorChange = (args) => {
    return { ...(new SimulatorChangeAction(args)) };
};
export const clock = () => {
    return { ...(new ClockAction()) };
};
export const toggleMCE = () => {
    return { ...(new ToggleMCEAction()) };
};
export const importAction = (waveJSON) => {
    return { ...(new ImportAction(waveJSON)) };
};
export const zoomAction = (e) => {
    return { ...(new ZoomAction(e)) };
};
export const vLineAction = (xPosition) => {
    return { ...(new VLineAction(xPosition)) };
};
export const visibilityAction = (name, value, laneClass) => {
    return { ...(new VisibilityAction(name, value, laneClass)) };
};
//# sourceMappingURL=actions.js.map