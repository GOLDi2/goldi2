
import { immerable } from 'immer'
import { AnyArray } from 'immer/dist/internal';
import { getParseTreeNode } from 'typescript';
import { calculateDistance } from '../actioncreator/helperfunctions';
import { ApiTransitions } from './ApiClasses/GraphRepresentation/Transitions';
import { ApiTransformable, FullApiTransformable } from './ApiTransformable';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ConstantType } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeRoot, ICompleteTreeRoot } from './BooleanEquations/LogicTrees/TreeRoots';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { UnknownVariableInExpressionError, OutputVariableInExpressionError, ExpressionSyntaxError, TransitionExpressionVariableError, OwnControlSignalsExpressionError } from './Error';
import { ExpressionErrorTupel } from './ErrorElements';
import { NodePosition } from './Node';
import { HasID } from './NormalizedState/NormalizedObjects';
import { Bezier, createBezier, createPoint, Point } from './Points';
import { AutomatonViewConfig } from './NormalizedState/ViewConfig';


/**
 * Darstellung des Verlaufs einer Kante (nur die grafischen Informationen)
 */
export interface TransitionPosition extends HasID {
    /**ID der Kante */
    id: number

    /**Id des Startknotens der Kante */
    fromNodeId: number;

    /**Id des Endknotens der Kante */
    toNodeId: number;

    /**Paramtersatz zur Darstellung der Kante als Bezierkurve vom Grad 3: */
    bezier: Bezier

}

/** Darstellung einer Kante nur anhand ihrer logik-relevanten Parameter (keine Informationen zur Darstellung) */
export interface RawTransition extends HasID {

    /**Id der Kante */
    id: number

    /**Id des Startknotens der Kante */
    fromNodeId: number;

    /**Id des Endknotens der Kante */
    toNodeId: number;
    /**logischer Ausdruck fuer die Transition als Baum mit eienem eventuell aufgetretenen Fehler --> darf keine z-Variablen beinhalten*/
    condition: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError>
}


/**
 * Darstellung einer vollstaendigen Transition zwischen zwei Knoten (alle Infotmationen)
 */
export class Transition implements HasID {
    [immerable] = true;


    /**Id der Kante */
    id: number

    /**Id des Startknotens der Kante */
    fromNodeId: number;

    /**Id des Endknotens der Kante */
    toNodeId: number;

    /**Paramtersatz zur Darstellung der Kante als Bezierkurve vom Grad 3: */
    bezier: Bezier

    /**logischer Ausdruck fuer die Transition als Baum mit eienem eventuell aufgetretenen Fehler --> darf keine z-Variablen beinhalten*/
    condition: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError>

    /** Ist die Kante aktuell aktiv? */
    public isActive: boolean


    /**
     * Erstelle eine neue Transition
     * @param id Id der Kante
     * @param fromNodeId Id des Startknotens
     * @param fromXCord  x-Koordinate Startknoten
     * @param fromYCord y-Koordinate Startknoten
     * @param toNodeId Id des Endknotens
     * @param toXCord x-Koordinate Endknoten
     * @param toYCord y-Koordinate Endknoten
     * @param condition Kantenbedingung als Baum mit einem eventuell aufgetretenen Fehler
     * @param isActiv Ist die Kante aktiv?
     */
    constructor(id: number, fromNodeId: number, startPoint: Point, toNodeId: number, endPoint: Point, firstSupport: Point, condition: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | TransitionExpressionVariableError | OwnControlSignalsExpressionError>, isActiv = false) {
        this.fromNodeId = fromNodeId
        this.toNodeId = toNodeId
        this.bezier = createBezier(startPoint, endPoint, firstSupport)
        this.fromNodeId = fromNodeId;
        this.toNodeId = toNodeId;
        this.isActive = isActiv;
        this.condition = condition
        this.id = id

    }

    /**
     * Transformieren der Kante in ihre externe Darstellung gemaess der aktuellen Forderungen an die externe Darstellung
     * @param customNames nutzerdefinierte Namen die verwendet werden sollen
     * @param automatonViewConfig Konfiguration fuer die Transformation
     * @param nodePositions Position der Knoten anhand derer die absolute Lage der Kante berechnet werden soll
     * @param minimizeCondition Soll die Uebergangsbedingung minimiert angezeigt werde?
     * @returns transformierte Kante als Liste (ist leer falls diese Kante gemaess der aktuellen Konfiguration nicht transformiert werden soll)
     */
    toExternalGraphRepresentation(customNames: CustomNames, automatonViewConfig: AutomatonViewConfig, nodePositions: Array<NodePosition>, minimizeCondition = false): Array<ApiTransitions> {
        //Auslesen des Baumes als String
        let apiTransition: Array<ApiTransitions> = []

        //Pruefe ob eine Nullkante vorliegt, die ggf. weggelassen werden soll
        if (!automatonViewConfig.showZeroTransitions && CompleteTreeRoot.isConstant(this.condition.validExpression, ConstantType.ConstantZero)) {
            //es liegt eine Konstante 0 als Bedingung vor die nicht ausgegeben werden soll
            // tue nichts --> leeres Array ausgeben
        }
        else {
            //die Kante soll ausgegeben werden --> fuege sie dem Array hinzu

            //lies die Bedingung als String aus (eventuell minimieren)
            let conditionString: string
            if (minimizeCondition) { //minimiere den Ausdruck
                let minimizedCondition = CompleteTreeRoot.minimize(this.condition.validExpression) //minimiere die Bedingung
                conditionString = CompleteTreeRoot.toCustomString(minimizedCondition, customNames) //lies sie aus
            }
            else { //Ausdruck muss nicht minimiert werden
                conditionString = CompleteTreeRoot.toCustomString(this.condition.validExpression, customNames)
            }

            //finde den zu dieser Kante gehoerenden Anfangs- und Endknoten (sollten immer existieren)
            let fromNode = nodePositions.find(node => node.id === this.fromNodeId)
            let toNode = nodePositions.find(node => node.id === this.toNodeId)
            if (fromNode && toNode) {
                //Sollte immer der Fall sein
                //bestimme die absoluten Punkte der Kante
                let absoluteEndPoint = createPoint(this.bezier.endPoint.xCord + toNode.position.xCord, this.bezier.endPoint.yCord + toNode.position.yCord)
                let absoluteStartPoint = createPoint(this.bezier.startPoint.xCord + fromNode.position.xCord, this.bezier.startPoint.yCord + fromNode.position.yCord)
                //Entnormiere die Lage des Stzutzpunktes mit Hilfe der Distanz zwischen den Anfangs- und Endpunkten (Laenge der Kante)
                let distance = calculateDistance(absoluteStartPoint, absoluteEndPoint)

                let denormX = this.bezier.supportPoint.xCord * distance
                let denormY = this.bezier.supportPoint.yCord * distance
                let denormalizedSupportPosition = createPoint(denormX, denormY) // entnormierte Koordinaten des Stutzpunktes relativ zum Startpunkt der Kante

                //erstelle den Verlauf der Kante : absolute Lage von Anfang und Ende sowie relative Lage des Stuetzpunktes (bezogen auf den Anfangspunkt)
                let absolutBezier = createBezier(absoluteStartPoint, absoluteEndPoint, denormalizedSupportPosition)

                // console.log(absolutBezier.supportPoint)
                //Fehler der Kante auch in Api-Darstellung uebernehmen
                apiTransition = [new ApiTransitions(this.id, this.fromNodeId, this.toNodeId, { validExpression: conditionString, error: this.condition.error }, absolutBezier)]
            }


        }

        return apiTransition

    }

    /**
     * Erstelle eine Darstellung dieser Kante die nur ihre logik-relevanten Daten kennt
     */
    createRawTransition(): RawTransition {
        let rawTransition: RawTransition = { id: this.id, fromNodeId: this.fromNodeId, toNodeId: this.toNodeId, condition: this.condition }
        return rawTransition
    }

    /**
     * Erstelle eine Darstellung dieser Kante die nur ihre positions-relevanten Daten kennt
     */
    createTransitionPosition(): TransitionPosition {
        let rawTransition: TransitionPosition = { id: this.id, fromNodeId: this.fromNodeId, toNodeId: this.toNodeId, bezier: this.bezier }
        return rawTransition
    }

}
