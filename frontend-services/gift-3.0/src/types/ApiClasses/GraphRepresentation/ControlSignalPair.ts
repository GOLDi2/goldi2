import { immerable } from 'immer';
import { ControlSignalExpressionVariableError, ExpressionSyntaxError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from '../../Error';
import { ApiExpressionErrorTupel } from '../ApiExpressionErrorTupel';
import { ApiOutputSignalPair } from './OutputSiganalPair';

/**
 * Ausgabedarstellung einer Steurvariablenbelegung
 */
export class ApiControlSignalPair{
    [immerable] = true;
    /** Name der Steuervariablen */
    name:string;
    /**Gleichung fuer deren Belegung mit einem eventuellen Fehler */
    equation:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | ControlSignalExpressionVariableError>;
    ;
/**
 * Erstellt eine neue Belegung einer Steuervariablen in Ausgabedarstellung
 * @param name Name der Steuervariablen
 * @param equation logische Belegung / logsicher Ausdruck der Steuervariablen
 */
    constructor(name:string ,equation:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | ControlSignalExpressionVariableError>){
        this.name = name
        this.equation = equation

    }

}