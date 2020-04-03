/**
 * Created by maximilian on 13.06.17.
 */
/// <reference path="main.ts" />
var Workspace;
(function (Workspace) {
    class SimulationInterface {
        constructor(workspace) {
            this.workspace = workspace;
            this.isActive = false;
            this.handlers = [];
            this.changeHandler = (event) => {
                let port = event.data;
                for (let handler of this.handlers)
                    handler(port.deviceDef.label, port.getInputs()[0].getValue() != null);
            };
        }
        setExternalManipulation(value) {
            for (let name in this.inports)
                this.inports[name].setExternalManipulation(value);
            for (let name in this.outports)
                this.outports[name].setExternalManipulation(value);
        }
        activate() {
            this.updatePorts();
            for (let name in this.outports)
                this.outports[name].$ui.on("inputValueChange", this.outports[name], this.changeHandler);
            this.setExternalManipulation(true);
            this.isActive = true;
        }
        deactivate() {
            for (let name in this.outports)
                this.outports[name].$ui.off("inputValueChange", this.changeHandler);
            this.setExternalManipulation(false);
            this.isActive = false;
        }
        setInput(name, value) {
            if (this.isActive) { }
            this.inports[name].setManipulationValue(value ? 1 : null);
        }
        setInputs(values) {
            for (let name in values)
                this.setInput(name, values[name]);
        }
        getOutputs() {
            const values = {};
            for (let name in this.outports)
                values[name] = this.outports[name].getInputs()[0].getValue() != null;
            return values;
        }
        onOutputChange(handler) {
            this.handlers.push(handler);
        }
        offOutputChange(handler) {
            this.handlers = this.handlers.filter(h => h !== handler);
        }
        updatePorts() {
            let ports = this.workspace.getPorts();
            this.inports = {};
            for (let port of ports.inports)
                this.inports[port.deviceDef.label] = port;
            this.outports = {};
            for (let port of ports.outports)
                this.outports[port.deviceDef.label] = port;
        }
        getNames(ports) {
            return Object.keys(ports);
        }
        getInputNames() { this.updatePorts(); return this.getNames(this.inports); }
        ;
        getOutputNames() { this.updatePorts(); return this.getNames(this.outports); }
        ;
    }
    Workspace.SimulationInterface = SimulationInterface;
})(Workspace || (Workspace = {}));
//# sourceMappingURL=SimulationInterface.js.map