/**
 * Created by maximilian on 13.06.17.
 */
    
    /// <reference path="main.ts" />

namespace Workspace {
    
    

    export class SimulationInterface {
        protected isActive: boolean = false;
        protected  inports: {[name: string]: SimcirPort};
        protected outports: {[name: string]: SimcirPort};
        protected handlers: Array<(name: string, value: boolean) => (void)> = [];
        
        constructor( protected workspace: SimcirWorkspace) {
            this.updatePorts();
        }
        
         changeHandler = (event) => {
             let port = <SimcirPort>event.data;
             for (let handler of this.handlers)
                 handler(port.deviceDef.label, port.getInputs()[0].getValue() != null);
        }
        
        protected setExternalManipulation(value){
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

        public get paused(): boolean { return this.workspace.eventQueue.paused }
        public set paused(val: boolean) {
            this.workspace.eventQueue.paused = val;
            this.workspace.setPauseTimers(val);
        }
        
        setInput(name: string, value: boolean) {
            if (this.isActive)
                this.inports[name].setManipulationValue(value ? 1 : null)
        }
        
        setInputs(values: {[name: string]: boolean}) {
            for (let name in values)
                this.setInput(name, values[name]);
        }
        
        getOutputs(): {[name: string]: boolean} {
            const values = {};
            for (let name in this.outports)
                values[name] = this.outports[name].getInputs()[0].getValue() != null;
            return values;
        }
        
        onOutputChange(handler: (name: string, value: boolean) => (void)) {
            this.handlers.push(handler)
        }
    
        offOutputChange(handler: (name: string, value: boolean) => (void)) {
            this.handlers = this.handlers.filter(h => h !== handler);
        }

        transferCallbacks(newSI: SimulationInterface) {
            newSI.onOutputChange((name: string, value: boolean) => {
                for (let handler of this.handlers)
                    handler(name, value);
            });
        }

        postLateCallback(callback: () => (void)) {
            this.workspace.eventQueue.postLateCallback(callback);
        }
        
        protected updatePorts(){
            let ports = this.workspace.getPorts();
            this.inports = {};
            for (let port of ports.inports)
                this.inports[port.deviceDef.label] = port
            this.outports = {};
            for (let port of ports.outports)
                this.outports[port.deviceDef.label] = port
        }
        
        protected getNames(ports: {[name: string]: SimcirPort}): Array<string> {
            return Object.keys(ports);
        }
        
        getInputNames() {this.updatePorts(); return this.getNames(this.inports)};
        getOutputNames() {this.updatePorts(); return this.getNames(this.outports)};
        
    }
}