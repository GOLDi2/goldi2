
import { immerable } from 'immer';
import { ExpressionSyntaxError, OwnControlSignalsExpressionError, TransitionExpressionVariableError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from '../../Error';
import { Bezier } from '../../Points';
import { ApiExpressionErrorTupel } from '../ApiExpressionErrorTupel';


/**
 * Ausgabedarstellung einer Transition die durch die Selektoren aus dem internen State erzeugt wird
 */
export class ApiTransitions{
    [immerable]=true;

    /**Id der Kante */
    public id: number

    /**Id des Startknotens der Kante */
    public fromNodeId:number;

    /**Id des Endknotens der Kante */
    public toNodeId:number;

    /**logischer Ausdruck fuer die Transition mit einem eventuell aufgetretenen Fehler*/
    public condition:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError>;


   /**
    * Paramter zur Darstellung der Kante als Bezierkurve vom Grad 2. Enthaelt:
    *   - aboslute Koordinaten von Anfangs- und Endpunkt
    *   - Koordinaten des Stutzpunktes relativ zum Anfangspunkt der Kante
   */
    public bezier:Bezier 

    /**
     * Erstelle eine neue Kante in Ausgabedarstellung
     * @param id Id der Kante
     * @param fromNodeId ID des Startknotens
     * @param toNodeId ID des Endknotens
     * @param condition Bedingung der Kante mit einem eventuell aufgetretenen Fehler
     * @param bezier Bezierstuetzpunkte der Kante
     */
    constructor(id:number,fromNodeId:number , toNodeId:number ,condition:ApiExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError> , bezier:Bezier){
        this.fromNodeId = fromNodeId;
        this.toNodeId = toNodeId;
        this.condition = condition;
        this.bezier = bezier;
        this.id = id
    }
}