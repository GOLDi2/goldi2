export class LogicExpression {
    // returns the Boolean value of the Expression
    evaluate() { return undefined; }
    toString() { }
    toDebugString() { }
}
//TODO constants
export class AndExpression extends LogicExpression {
    constructor(innerExpressions) {
        super();
        this.innerExpressions = [];
        this.innerExpressions = innerExpressions;
    }
    evaluate() {
        for (let expression of this.innerExpressions) {
            if (!expression.evaluate()) { // if one of the part expressions of the and is false, the others don't matter
                return false;
            }
        }
        return true; // none false means true
    }
    toString() {
        let rv = "(";
        this.innerExpressions.forEach(function (expression) {
            rv += expression.toString();
            rv += "&";
        });
        rv = rv.substr(0, rv.length - 1); // remove last "&"
        rv += ")";
        return rv;
    }
    toDebugString() {
        let rv = "And(";
        this.innerExpressions.forEach(function (iE) {
            rv += iE.toString();
            rv += ", ";
        });
        rv += ")";
        return rv;
    }
}
export class OrExpression extends LogicExpression {
    constructor(innerExpressions) {
        super();
        this.innerExpressions = [];
        this.innerExpressions = innerExpressions;
    }
    evaluate() {
        for (let expression of this.innerExpressions) {
            if (expression.evaluate()) { // if one of the part expressions of the or is true, the others don't matter
                return true;
            }
        }
        return false; // none true means false
    }
    toString() {
        let rv = "(";
        this.innerExpressions.forEach(function (expression) {
            rv += expression.toString();
            rv += "|";
        });
        rv = rv.substr(0, rv.length - 1); // remove last "|"
        rv += ")";
        return rv;
    }
    toDebugString() {
        let rv = "Or(";
        this.innerExpressions.forEach(function (iE) {
            rv += iE.toString();
            rv += ", ";
        });
        rv += ")";
        return rv;
    }
}
export class NotExpression extends LogicExpression {
    constructor(innerExpression) {
        super();
        this.innerExpression = innerExpression;
    }
    evaluate() {
        return (!this.innerExpression.evaluate());
    }
    toString() {
        let rv = "!";
        rv += this.innerExpression.toString();
        return rv;
    }
    toDebugString() {
        return ("Not(" + this.innerExpression.toString() + ")");
    }
}
export class InputVariableExpression extends LogicExpression {
    // x0 =^= new InputVariableExpression(0, ...)
    constructor(index, environment) {
        super();
        this.index = index;
        this.environment = environment;
    }
    evaluate() {
        return this.environment.getInputVariable(this.index);
    }
    toString() {
        return ("x" + this.index);
    }
    toDebugString() {
        return this.toString();
    }
}
export class StateVariableExpression extends LogicExpression {
    // a0z0 = new StateVariableExpression(0, 0)
    constructor(fsmIndex, stateIndex, environment) {
        super();
        this.fsmIndex = fsmIndex;
        this.stateIndex = stateIndex;
        this.environment = environment;
    }
    evaluate() {
        return this.environment.getStateVariable(this.fsmIndex, this.stateIndex);
    }
    toString() {
        return ("a" + this.fsmIndex + "z" + this.stateIndex);
    }
    toDebugString() {
        return this.toString();
    }
}
export class OutputVariableExpression extends LogicExpression {
    // y0 = new OutputVariableExpression( 0, ...)
    constructor(outputIndex, environment) {
        super();
        this.outputIndex = outputIndex;
        this.environment = environment;
    }
    evaluate() {
        return this.environment.getOutputVariable(this.outputIndex);
    }
    toString() {
        return ("y" + this.outputIndex);
    }
    toDebugString() {
        return this.toString();
    }
}
export class Variable {
    constructor(value, equation) {
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
//# sourceMappingURL=LogicExpressions.js.map