export class InitializeVisualizerEvent extends CustomEvent {
    constructor(args) {
        super('lv-initialize');
        this.args = args;
    }
}
export class UserChangeEvent extends CustomEvent {
    constructor(args) {
        super('lv-user-change');
        this.args = args;
    }
}
export class SimulatorChangeEvent extends CustomEvent {
    constructor(args) {
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
export class ClockEvent extends CustomEvent {
    constructor() {
        super('lv-clock');
    }
}
export class ResetEvent extends CustomEvent {
    constructor() {
        super('lv-reset');
    }
}
// used to communicate the horizontal scrolling to the scrollbar in LogicVisualizer
export class DiagramEvent extends CustomEvent {
    constructor(width, isScroll) {
        super('lv-diagram-svg-change');
        this.width = width;
        this.isScroll = isScroll;
    }
}
let ExportEvent = /** @class */ (() => {
    class ExportEvent extends CustomEvent {
        constructor(format) {
            super('lv-export');
            if (format != ExportEvent.WaveJSON && format != ExportEvent.SVG && format != ExportEvent.PNG) {
                throw new Error("invalid format");
            }
            this.format = format;
        }
    }
    ExportEvent.WaveJSON = "WaveJSON";
    ExportEvent.SVG = 'SVG';
    ExportEvent.PNG = 'PNG';
    return ExportEvent;
})();
export { ExportEvent };
// dispatcher functions for convenience
export function dispatchInitializeVisualizerEvent(args) {
    document.dispatchEvent(new InitializeVisualizerEvent(args));
}
export function dispatchUserChangeEvent(args) {
    document.dispatchEvent(new UserChangeEvent(args));
}
export function dispatchSimulatorChangeEvent(args) {
    document.dispatchEvent(new SimulatorChangeEvent(args));
}
export function dispatchClockEvent() {
    document.dispatchEvent((new ClockEvent()));
}
export function dispatchResetEvent() {
    document.dispatchEvent(new ResetEvent());
}
//# sourceMappingURL=Events.js.map