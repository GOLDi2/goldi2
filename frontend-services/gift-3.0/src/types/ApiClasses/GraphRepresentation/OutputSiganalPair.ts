import { immerable } from 'immer';
import { ExpressionSyntaxError, OutputSignalExpressionVariableError, OwnControlSignalsExpressionError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from '../../Error';
import { ApiExpressionErrorTupel } from '../ApiExpressionErrorTupel';

/**
 * Ausgabedarstellung einer Ausgangsvariablenbelegung
 */
export class ApiOutputSignalPair{
    [immerable]=true;
    /**Name der belegten Variablen */
    name:string;
    /**Ausdruck fuer die Belegung mit einem eventuellen Fehler*/
    equation:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | OutputSignalExpressionVariableError | OwnControlSignalsExpressionError>;

    /**
     * Erstelle eine neue Belegung einer Ausgangsvariablen in AUsgabedarstellung
     * @param name Name der gesetzten Variablen
     * @param equation logischer Ausdruck fuer die Belegung der Variablen
     */
    constructor(name:string ,equation:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | OutputSignalExpressionVariableError | OwnControlSignalsExpressionError>){
        this.name=name;
        this.equation = equation;
    }
}