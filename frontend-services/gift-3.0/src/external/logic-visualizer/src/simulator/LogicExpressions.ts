import {FSMEnvironment} from "./FSM";

export abstract class LogicExpression {

    // returns the Boolean value of the Expression
    evaluate(): boolean {return undefined;}

    toString() {}
    toDebugString() {}
}

//TODO constants
export class AndExpression extends LogicExpression {

    innerExpressions = [];

    constructor(innerExpressions: LogicExpression[]) {
        super();

        this.innerExpressions = innerExpressions;
    }

    evaluate(): boolean {
        for(let expression of this.innerExpressions) {
            if(!expression.evaluate()) { // if one of the part expressions of the and is false, the others don't matter
                return false;
            }
        }
        return true; // none false means true
    }

    toString(): string {
        let rv = "(";
        this.innerExpressions.forEach(function(expression) {
            rv += expression.toString();
            rv += "&";
        });
        rv = rv.substr(0,rv.length-1); // remove last "&"
        rv += ")";
        return rv;
    }

    toDebugString(){
        let rv = "And(";
        this.innerExpressions.forEach(function(iE){
            rv += iE.toString();
            rv += ", "
        });
        rv +=")";
        return rv;
    }
}

export class OrExpression extends LogicExpression {

    innerExpressions = [];

    constructor(innerExpressions: LogicExpression[]) {
        super();

        this.innerExpressions = innerExpressions;
    }

    evaluate() {
        for(let expression of this.innerExpressions){
            if(expression.evaluate()){ // if one of the part expressions of the or is true, the others don't matter
                return true;
            }
        }
        return false; // none true means false
    }

    toString() {
        let rv = "(";
        this.innerExpressions.forEach(function(expression) {
            rv += expression.toString();
            rv += "|";
        });
        rv = rv.substr(0,rv.length-1); // remove last "|"
        rv += ")";
        return rv;
    }

    toDebugString(){
        let rv = "Or(";
        this.innerExpressions.forEach(function(iE){
            rv += iE.toString();
            rv += ", "
        });
        rv +=")";
        return rv;
    }
}

export class NotExpression extends LogicExpression {

    innerExpression;

    constructor(innerExpression: LogicExpression){
        super();

        this.innerExpression = innerExpression;
    }

    evaluate(): boolean {
        return (!this.innerExpression.evaluate());
    }

    toString(): string {
        let rv = "!";
        rv += this.innerExpression.toString();
        return rv;
    }

    toDebugString(){
        return ("Not("+this.innerExpression.toString()+")");
    }
}

export class InputVariableExpression extends LogicExpression {

    index;
    environment;

    // x0 =^= new InputVariableExpression(0, ...)
    constructor(index: number, environment: FSMEnvironment) {
        super();

        this.index = index;
        this.environment = environment;
    }

    evaluate(): boolean {
        return this.environment.getInputVariable(this.index);
    }

    toString(): string {
        return ("x"+this.index);
    }

    toDebugString() {
        return this.toString();
    }
}

export class StateVariableExpression extends LogicExpression {

    fsmIndex;
    stateIndex;
    environment;

    // a0z0 = new StateVariableExpression(0, 0)
    constructor(fsmIndex: number, stateIndex: number, environment: FSMEnvironment) {
        super();

        this.fsmIndex = fsmIndex;
        this.stateIndex = stateIndex;
        this.environment = environment;
    }

    evaluate() {
        return this.environment.getStateVariable(this.fsmIndex, this.stateIndex);
    }

    toString() {
        return ("a"+this.fsmIndex+"z"+this.stateIndex);
    }

    toDebugString() {
        return this.toString();
    }
}

export class OutputVariableExpression extends LogicExpression {

    outputIndex;
    environment;

    // y0 = new OutputVariableExpression( 0, ...)
    constructor(outputIndex: number, environment: FSMEnvironment) {
        super();

        this.outputIndex = outputIndex;
        this.environment = environment;
    }

    evaluate() {
        return this.environment.getOutputVariable(this.outputIndex);
    }

    toString() {
        return ("y"+this.outputIndex);
    }

    toDebugString() {
        return this.toString();
    }
}

export class Variable {

    value: boolean;
    nextValue: boolean;
    equation: LogicExpression;

    constructor(value: boolean, equation: LogicExpression) {
        this.value = value;
        this.equation = equation;
    }

    calculateNextState() {
        this.nextValue = this.equation.evaluate();
    }

    assumeNextState() {
        this.value = this.nextValue;
    }
}
