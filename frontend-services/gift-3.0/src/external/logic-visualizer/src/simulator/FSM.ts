import {stringToLogicExpression} from "./EquationParser";
import {Variable} from "./LogicExpressions";
import {
    ClockEvent,
    dispatchInitializeVisualizerEvent,
    dispatchSimulatorChangeEvent, InitArgs, MachineVariable, ResetEvent,
    SimulatorChangeArgs,
    UserChangeEvent
} from "../app/model/Events";

class FSM {

    //TODO LATER switch to arrow functions

    //TODO LATER typings

    stateVariables: Variable[] = [];    // current value of z4 is stateVariables[4].value

    constructor(stateVariableEquationStringList: string[], environment: FSMEnvironment){
        //TODO empty state variables list => constant z0
        stateVariableEquationStringList.forEach((equationString: string) => {
            this.stateVariables.push(new Variable(false, stringToLogicExpression(equationString, environment)));
        });
    }

    tick() {
        this.stateVariables.forEach(function(sVar) {
            sVar.calculateNextState();
        });
        this.stateVariables.forEach(function(sVar) {
            sVar.assumeNextState();
        });

    }

    // stateVariables is an array where z7 is stateVariables[7]
    setState(stateNumber: number) {
        stateNumber.toString(2).split("").reverse().forEach((bit, index) => {
            this.stateVariables[index].value = Boolean(Number(bit));
        });
    }

    getStateVariable(stateIndex) {
        if((stateIndex >= this.stateVariables.length) || (stateIndex < 0)){
            throw new Error(`state index out of bounds (max: ${this.stateVariables.length-1}): ${stateIndex}`);
        }
        return this.stateVariables[stateIndex].value;
    }

    getStateNumber(): number {
        let rv = 0;
        this.stateVariables.forEach((sVar: Variable, index: number) => {
            if(sVar.value) {
                rv += 2**index;
            }
        });
        return rv;
    }
}

export class FSMEnvironment {

    fsmList: FSM[] = [];
    inputVariables: boolean[] = [];
    outputVariables: Variable[] = [];   // current value of y5 is outputVariables[5].value
    continuousTicking: boolean;
    clockPeriod: number; // in milliseconds

    initInputVariableCount: number;
    initOutputVariableEquationStringList: string[];
    initMachineStateEquationStringList: string[][];

    constructor(inputVariableCount: number, outputVariableEquationStringList: string[], machineStateEquationStringList: string[][]) {

        this.initInputVariableCount = inputVariableCount;
        this.initOutputVariableEquationStringList = outputVariableEquationStringList;
        this.initMachineStateEquationStringList = machineStateEquationStringList;

        for(let i=0; i<inputVariableCount; i++){
            this.inputVariables.push(false);
        }
        outputVariableEquationStringList.forEach((equationString: string) => {
            let equation = stringToLogicExpression(equationString, this);
            this.outputVariables.push(new Variable(false, equation));
        });
        machineStateEquationStringList.forEach((statesEquationStringList: string[]) => {
            this.addFSM(statesEquationStringList);
        });
        this.clockPeriod = 1000;

        document.addEventListener('lv-user-change', (e: UserChangeEvent) => {
            //let args: SimulatorChangeArgs = {outputs: [], answeringClock: false, hStar: String(Math.floor(Math.random() * 4))}; // random h* for testing
            let args: SimulatorChangeArgs = {outputs: [], answeringClock: false, hStar: "0"};
            if(e.args.inputs !== undefined) {
                e.args.inputs.forEach((input: MachineVariable) => {
                    this.inputVariables[Number(input.name.substr(2, input.name.length-1))] = Boolean(Number(input.value));
                });
            }
            if(e.args.states !== undefined) {
                e.args.states.forEach(machineVariable => {
                    this.fsmList[Number(machineVariable.name.substr(2, machineVariable.name.length-1))].setState(Number(machineVariable.value));
                });
            }
            if(e.args.inputs !== undefined || e.args.states !== undefined) {
                this.calculateOutput();
                this.outputVariables.forEach((oVar: Variable, index: number) => {
                    args.outputs.push({name: "y_"+index, value: String(Number(oVar.value))});
                });
                dispatchSimulatorChangeEvent(args);
            }
        });

        document.addEventListener('lv-clock', (e: ClockEvent) => {
            let args: SimulatorChangeArgs = {
                outputs: [],
                states: [],
                //hStar: String(Math.floor(Math.random() * 4)),
                hStar: "0",
                answeringClock: true
            };
            this.tick();

            this.outputVariables.forEach((oVar: Variable, index: number) => {
                args.outputs.push({name: "y_"+index, value: String(Number(oVar.value))});
            });
            this.fsmList.forEach((fsm: FSM, index: number) => {
                args.states.push({name: "a_"+index, value: String(fsm.getStateNumber())});
            });
            dispatchSimulatorChangeEvent(args);
        });

        document.addEventListener('lv-reset', (e: ResetEvent) => {

            this.inputVariables = [];
            for(let i=0; i<this.initInputVariableCount; i++){
                this.inputVariables.push(false);
            }

            this.outputVariables = [];
            this.initOutputVariableEquationStringList.forEach((equationString: string) => {
                let equation = stringToLogicExpression(equationString, this);
                this.outputVariables.push(new Variable(false, equation));
            });

            this.fsmList = [];
            this.initMachineStateEquationStringList.forEach((statesEquationStringList: string[]) => {
                this.addFSM(statesEquationStringList);
            });

            this.calculateOutput();
            //this.dispatchInitEvent(); // you can send a init event again but don't have to. the visualizer uses the same args as in the last initialization to initialize itself again
        });

        this.calculateOutput();
        this.dispatchInitEvent();
    }

    tick() {
        this.fsmList.forEach(function(fsm) {
            fsm.tick();
        });
        this.calculateOutput();

        let gr = [];
        this.fsmList[0].stateVariables.forEach(function(g){
            gr.push(g.value);
        });
    }

    async tickX(count) { // maybe remove async, have to see later
        for (let i = 0; i < count; i++) {
            this.tick();
            await sleep(this.clockPeriod);
        }
    }

    async startTicking(){
        this.continuousTicking = true;
        while(this.continuousTicking) {
            this.tick();
            await sleep(this.clockPeriod);
        }
    }

    async stopTicking(){
        this.continuousTicking = false;
    }

    addFSM(stateVariableEquationStringList) {
        let fsm = new FSM(stateVariableEquationStringList, this);
        this.fsmList.push(fsm);
    }

    calculateOutput() {
        this.outputVariables.forEach(function(oVar) {
            oVar.calculateNextState();
        });
        this.outputVariables.forEach(function(oVar) {
            oVar.assumeNextState();
        });
    }

    setInputVariable(index, value) {
        if((index >= this.inputVariables.length) || (index < 0)){
            throw new Error("input variable index out of bounds");
        }
        this.inputVariables[index] = value;
    }

    getInputVariable(index) {
        if((index >= this.inputVariables.length) || (index < 0)){
            throw new Error("input variable index out of bounds");
        }
        return this.inputVariables[index];
    }

    getStateVariable(fsmIndex, stateIndex) {
        if((fsmIndex >= this.fsmList.length) || (fsmIndex < 0)){
            throw new Error("fsm index out of bounds");
        }
        return this.fsmList[fsmIndex].getStateVariable(stateIndex);
    }

    getOutputVariable(outputIndex) {
        return this.outputVariables[outputIndex].value;
    }

    dispatchInitEvent(){
        let inputs: MachineVariable[] = [];
        let states: MachineVariable[] = [];
        let outputs: MachineVariable[] = [];

        for(let i = 0; i < this.inputVariables.length; i++){
            inputs.push({name: `x_${i}`, value: String(Number(this.inputVariables[i]))});
        }
        for(let i=0; i < this.fsmList.length; i++){
            let decimalState = 0;
            for(let j=0; j < this.fsmList[i].stateVariables.length; j++){
                decimalState += (this.fsmList[i].stateVariables[j].value ? 2^j : 0);
            }
            states.push({name: `a_${i}`, value: String(decimalState)});
        }
        for(let i=0; i < this.outputVariables.length; i++){
            outputs.push({name: `y_${i}`, value: String(Number(this.outputVariables[i].value))});
        }

        let args: InitArgs = {
            inputs: inputs,
            states: states,
            outputs: outputs,
            hStar: "0",
            canSetState: true
        };
        dispatchInitializeVisualizerEvent(args);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}