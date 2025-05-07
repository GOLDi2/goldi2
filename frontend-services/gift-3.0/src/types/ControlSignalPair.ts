import { Signalpair } from './Signalpair';
import { immerable } from 'immer'
import { InternalIndependentControlSignal, InternalIndependentControlSignalAssignment, S_NAME } from './ControlSignal';
import { SignalAssignment } from './BooleanEquations/SignalAssignment';
import { ApiTransformable, FullApiTransformable } from './ApiTransformable';
import { ApiControlSignalPair } from './ApiClasses/GraphRepresentation/ControlSignalPair';
import { getAllControlSignalNamesFromExpression, getAllzVariableNamesFromExpression, getCustomNameFromInternalRepresentation } from '../actioncreator/helperfunctions';
import { ApiOutputSignalPair } from './ApiClasses/GraphRepresentation/OutputSiganalPair';
import { CustomNames } from './BooleanEquations/CustomNames';
import { ConstantType, VariableTyp } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { CompleteTreeRoot, ICompleteTreeRoot } from './BooleanEquations/LogicTrees/TreeRoots';
import { AutomatonViewConfig } from './NormalizedState/ViewConfig';
import { eq, result } from 'lodash';
import { ExpressionErrorTupel } from './ErrorElements';
import { ControlSignalExpressionVariableError, ExpressionSyntaxError, OutputSignalExpressionVariableError, UnknownVariableInExpressionError, OutputVariableInExpressionError, VariableTypeTupel } from './Error';
import { binaryStringToTreeErrorTupel } from './BooleanEquations/BinaryStringToTree';


/** Interface fuer die Darstellung von Ausgabebelegungen von Steuersignalen*/
export interface IControlSignalPair extends Signalpair {

    /**Belegungsgleichung fuer die Variable mit einem eventuell aufgetretenen Fehler */
    equationErrorTupel: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | ControlSignalExpressionVariableError>
}



/**
 * Sammlung aller Methoden auf einem Signalpair, welches sich auf eine Steuervariable bezieht
 * Ausdruck fuer die Belegung darf weder Sterusignale noch z-Variablen beinhalten 
 * (Rekursion von Steuersignalen waere in Form von kombinatorischer Hardware zur Umsetzung der ungetakteten Ausgabefunktion nicht moeglich)
 */
export class ControlSignalPair {

    /**
     * Erstelle eine neue Belegung einer Steuervariablen und speichere einen eventuell aufgetretenen Fehler
     * @param number Nummer i der Variablen s_i
     * @param equation logische Belegung / logischer Ausdruck der Variablen (bei Nichtangabe zu 0 initialisiert)
     * @param customNames alle nutzerdefinierten Namen im System
     * @param defaultExpression Ausdruck der verwendet werden soll, falls der eingegbene Ausdruck fehlerhaft war 
     */
    static createControlSignalPair(number: number, equation: string, customNames: CustomNames, defaultExpression?: ICompleteTreeRoot): IControlSignalPair {
        if (defaultExpression === undefined) {
            //bei Nichtangabe wird die Gleichung in der Oberkalsse zu logisch 0 gesetzt --> enhaelt keine zVariablen
            defaultExpression = { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) }
        }

        //lies den Ausdruck ein und fange eventuelle Fehler beim parsen ab
        //erweitere die moeglichen Fehlertypen im Ergbnis um den Fehler bzgl. der Steuervariablen damit das Ergbnis direkt im State gespeichert werden kann
        let equationErrorTupel: ExpressionErrorTupel<ControlSignalExpressionVariableError | ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError>
            = binaryStringToTreeErrorTupel(equation, defaultExpression, customNames)

        //preuefe ob der Ausdruck keine zVariablen und keine Steuersignale beinhaltet --> Wenn doch: Fehler
        if (CompleteTreeRoot.containsControlSignals(equationErrorTupel.validExpression) || CompleteTreeRoot.containsZVariables(equationErrorTupel.validExpression)) {

            //suche die ungueltigen Variablen (zVariablen und Steuersignale)
            let invalidZVariables: Array<VariableTypeTupel<VariableTyp.zSignal>> = getAllzVariableNamesFromExpression(equationErrorTupel.validExpression)
            let invalidControlVariables: Array<VariableTypeTupel<VariableTyp.zSignal | VariableTyp.ControlSignal>> = getAllControlSignalNamesFromExpression(equationErrorTupel.validExpression, customNames)

            //fuehre beide Listen zusammen
            let invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal | VariableTyp.ControlSignal>> = [...invalidControlVariables, ...invalidZVariables]

            //Speicher den Fehler im Ergebnis und setze den validen Ausdruck zu logisch 0 (backup von oben)
            equationErrorTupel.error = new ControlSignalExpressionVariableError(equation, invalidVariables)
            equationErrorTupel.validExpression = defaultExpression
        }


        return { varibableNumber: number, equationErrorTupel: equationErrorTupel }

    }

    /**
     * Transformieren des Ausgabepaares in seine externe Darstellung gemeass der aktuellen Konfiguration
     * @param customNames nutzerdefinierte Namen die verwendet werden sollen
     * @param automatonViewConfig aktuelle Konfiguration fuer die Transformation
     * @param minimizeExpression Solle die Ausgaben minimiert angezeigt werden?
     * @returns externe Darstellung des Ausgabepaares  in einer Liste (dies ist leer falls dieses Paar gemaess der aktuellen Konfiguration nicht transformiert werden soll)
     */
    static toExternalGraphRepresentation(signalpair: IControlSignalPair, customNames: CustomNames, automatonViewConfig: AutomatonViewConfig, automatonId: number, minimizeExpression = false): Array<ApiControlSignalPair> {
        let apiRepresentation: Array<ApiControlSignalPair> = []
        //das Paar darf nicht transformiert werden falls es eine logisch 0 als Ausgabe hat und diese gemaess der aktuellen Konfiguration nicht angezeigt werden soll
        if (!automatonViewConfig.showZeroOutputs && CompleteTreeRoot.isConstant(signalpair.equationErrorTupel.validExpression, ConstantType.ConstantZero)) {
            //es liegt eine Ausgabe = 0 vor, die nicht angezeigt werden soll --> tue nichts (Ausgabe einer leeren Liste)
        }
        else {
            //Die Ausgabe soll transfomiert werden 
            //Bestimme den eigenen benutzerdefinierten Namen
            //erstlle unagbhaengige Version von sich der Variablen 
            let independentSignal = new InternalIndependentControlSignal(signalpair.varibableNumber, automatonId)
            let name = getCustomNameFromInternalRepresentation(customNames.controlSignals, independentSignal)

            //Ueberfuehre den eigenen Baum in einen String (eventuell vorher minimieren)
            let equation = signalpair.equationErrorTupel.validExpression //nicht minimierter Ausdruck
            if (minimizeExpression) { //Ausdruck soll minimiert werden
                equation = CompleteTreeRoot.minimize(equation)
            }
            let equationString = CompleteTreeRoot.toCustomString(equation, customNames)
            apiRepresentation = [new ApiControlSignalPair(name, { validExpression: equationString, error: signalpair.equationErrorTupel.error })]
        }

        return apiRepresentation
    }


    static getVariable(signalpair: IControlSignalPair, automatonId: number): InternalIndependentControlSignal {
        return new InternalIndependentControlSignal(signalpair.varibableNumber, automatonId)
    }

}
