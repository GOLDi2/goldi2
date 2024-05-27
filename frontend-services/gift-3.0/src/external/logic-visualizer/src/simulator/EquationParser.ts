import {
    LogicExpression, AndExpression, OrExpression, NotExpression,
    InputVariableExpression, StateVariableExpression, OutputVariableExpression
} from "./LogicExpressions";
import {FSMEnvironment} from "./FSM";

const orChar  = '|';
const andChar = '&';
const notChar = '!';

const openingBracketChar = '(';
const closingBracketChar = ')';

const fsmChar            = 'a';
const inputVariableChar  = 'x';
const outputVariableChar = 'y';
const stateVariableChar  = 'z';

export function stringToLogicExpression(equationString: string, environment: FSMEnvironment): LogicExpression {
    equationString = equationString.replace(/\s/g,''); // removes all whitespaces

    let orSplit = splitStringIgnoreBrackets(equationString, orChar);
    let orInnerExpressions = [];
    let orExpression;
    let needOr = true;

    orSplit.forEach(function(orSubExpression) {
        let andSplit = splitStringIgnoreBrackets(orSubExpression, andChar);
        let andInnerExpressions = [];
        let andExpression;
        let needAnd = true;

        andSplit.forEach(function(andSubExpression) {
            let smallExpression = stringToSmallExpression(andSubExpression, environment);
            if(!(smallExpression === undefined)) {
                andInnerExpressions.push(stringToSmallExpression(andSubExpression, environment));
            }
        });

        if(andInnerExpressions.length > 1) {
            andExpression = new AndExpression(andInnerExpressions);
        } else if(andInnerExpressions.length === 1) {
            andExpression = andInnerExpressions[0];
        } else {
            needAnd = false;
        }

        if(needAnd) {
            orInnerExpressions.push(andExpression);
        }
    });

    if(orInnerExpressions.length > 1) {
        orExpression = new OrExpression(orInnerExpressions);
    } else if(orInnerExpressions.length === 1) {
        orExpression = orInnerExpressions[0];
    } else {
        needOr = false;
    }
    if(needOr) {
        return orExpression;
    } else {
        return undefined;
    }
}

//Small expression means everything that is not AND or OR
function stringToSmallExpression(str: string, environment: FSMEnvironment): LogicExpression {
    let rv;

    switch(str.charAt(0)){
        case notChar:
            let notInnerExpression = stringToSmallExpression(str.substr(1, str.length-1), environment);
            if(notInnerExpression === undefined) {
                rv = undefined;
            } else {
                rv = new NotExpression(notInnerExpression);
            }
            break;

        case openingBracketChar:
            rv = stringToLogicExpression(str.substr(1, str.length-2), environment);
            break;

        case fsmChar:
            let cont = true;
            let i=1;

            while(cont){
                //Todo check for false input (i>length)
                if (str.charAt(i) === stateVariableChar) {
                    let fsmIndex = Number(str.substr(1, i-1));
                    let stateIndex = Number(str.substr(i+1, str.length-1));
                    rv = new StateVariableExpression(fsmIndex, stateIndex, environment);
                    cont = false;
                } else {
                    i++;
                }
            }
            break;

        case outputVariableChar:
            let outputIndex = Number(str.substr(1, str.length-1));
            rv = new OutputVariableExpression(outputIndex, environment);
            break;

        case inputVariableChar:
            let index = Number(str.substr(1, str.length-1));
            rv = new InputVariableExpression(index, environment);
            break;

        default:
            rv = undefined;
    }
    return rv;
}

// takes equationString, splits it at splitChar, and returns the section strings in an array
// sections starting with '(' and ending with ')' are treated as black boxes (no splitting inside)
function splitStringIgnoreBrackets(equationString: string, splitChar: string): string[] {
    let bracketLevel: number = 0;
    let split: string[] = [];
    let stringBuilder: string = "";

    equationString.split("").forEach(function(char) {
        let addChar = true;

        switch(char) {
            case openingBracketChar:
                bracketLevel--;
                break;
            case closingBracketChar:
                bracketLevel++;
                break;

            case splitChar:
                if(bracketLevel === 0) {
                    if(!(stringBuilder === "")) {
                        split.push(stringBuilder);
                    }
                    stringBuilder = "";
                    addChar = false;
                }
                break;
            case andChar: case orChar: case notChar: case fsmChar:
            case stateVariableChar: case outputVariableChar: case inputVariableChar:
            case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
                break;
            default:
            //TODO error handling
                throw new Error("unexpected character: "+char);
        }

        if(addChar) {
            stringBuilder += char;
        }
    });

    if(bracketLevel !== 0){
        throw new Error("unbalanced brackets: "+bracketLevel);
    }

    if(!(stringBuilder === "")) {
        split.push(stringBuilder);
    }
    return split;
}