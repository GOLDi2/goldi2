import { Signalpair } from './Signalpair';
import { immerable } from 'immer'
import { ApiOutputSignalPair } from './ApiClasses/GraphRepresentation/OutputSiganalPair';
import { CustomNames } from './BooleanEquations/CustomNames';
import { checkForOwnControlSignals, getAllzVariableNamesFromExpression, getCustomNameFromInternalRepresentation } from '../actioncreator/helperfunctions';
import { ApiTransformable, FullApiTransformable } from './ApiTransformable';
import { InternalOutput, Y_NAME } from './Output';
import { ConstantType, VariableTyp } from './BooleanEquations/LogicTrees/TreeNodeInterfaces';
import { CompleteTreeRoot, ICompleteTreeRoot } from './BooleanEquations/LogicTrees/TreeRoots';
import { CompleteTreeConstantNode } from './BooleanEquations/LogicTrees/Variables';
import { AutomatonViewConfig } from './NormalizedState/ViewConfig';
import { UnknownVariableInExpressionError, OutputVariableInExpressionError, ExpressionSyntaxError, OutputSignalExpressionVariableError, ControlSignalExpressionVariableError, VariableTypeTupel, OwnControlSignalsExpressionError } from './Error';
import { ExpressionErrorTupel } from './ErrorElements';
import { ZVariable } from './ZVariable';
import { binaryStringToTreeErrorTupel } from './BooleanEquations/BinaryStringToTree';

/** Interface fuer die Darstellung von Ausgabebelegungen */
export interface IOutputSignalPair extends Signalpair {

    /**Belegungsgleichung fuer die Variable mit einem eventuell aufgetretenen Fehler */
    equationErrorTupel: ExpressionErrorTupel<UnknownVariableInExpressionError | OutputVariableInExpressionError | ExpressionSyntaxError | OutputSignalExpressionVariableError | OwnControlSignalsExpressionError>
}

/**
 * Sammlung aller Methoden auf einem Signalpair, welches sich auf einen Ausgang bezieht
 */
export class OutputSignalPair {

    /**
     * Erstelle eine neue Belegung einer Ausgangsvariablen und speichere einen eventuell aufgetretenen Fehler
     * @param number Nummer i der Ausgangsvariablen y_i
     * @param equation logische Belegung / logischer Ausdruck der Ausgangsvariablen (bei Nichtangabe zu 0 initialisiert)
     * @param customNames alle nutzerdefinierten Namen im System
     * @param automatonId Id des Automaten in dem die Ausgabe steht (es duerfen keine Steuersignale dieses Automaten im Ausdruck enthalten sein)
     * @param defaultExpression Ausdruck der verwendet werden soll, falls der eingegbene Ausdruck fehlerhaft war 
     */
    static createOutputSignalpair(number: number, equation: string, customNames: CustomNames, automatonId: number, defaultExpression?: ICompleteTreeRoot): IOutputSignalPair {
        if (defaultExpression === undefined) {
            //bei Nichtangabe wird die Gleichung in der Oberkalsse zu logisch 0 gesetzt --> enhaelt keine zVariablen
             defaultExpression = { tree: new CompleteTreeConstantNode(ConstantType.ConstantZero) }
        }

        //lies den Ausdruck ein und fange eventuelle Fehler beim parsen ab
        //erweitere die moeglichen Fehlertypen im Ergbnis um den Fehler bzgl. des Ausgangs damit das Ergbnis direkt im State gespeichert werden kann
        let equationErrorTupel: ExpressionErrorTupel<OutputSignalExpressionVariableError | ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError | OwnControlSignalsExpressionError>
            = binaryStringToTreeErrorTupel(equation, defaultExpression, customNames)


        //preuefe ob der Ausdruck keine zVariablen beinhaltet --> Wenn doch: Fehler
        if (CompleteTreeRoot.containsZVariables(equationErrorTupel.validExpression)) {
            //suche die ungueltigen Variablen (zVariablen)
            let invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal>> = getAllzVariableNamesFromExpression(equationErrorTupel.validExpression)


            //Speicher den Fehler im Ergebnis und setze den validen Ausdruck zu logisch 0 (backup von oben)
            equationErrorTupel.error = new OutputSignalExpressionVariableError(equation, invalidVariables)
            equationErrorTupel.validExpression = defaultExpression
        }
        else {
            //wenn keine zVariablen enthalten waren preuefe ob der Ausdruck Steuersignale des eigenen Automaten enthaelt --> wenn ja: Fehler
            let controlSignalNames = checkForOwnControlSignals(equationErrorTupel.validExpression, automatonId, customNames) //extrahiere alle Steuersignale des Automaten in fehlergerechter Darstellung
            if (controlSignalNames.length > 0) {
                //es waren eigene Steuersignale enthalten --> speichere sie und setze den validen Ausdruck zu logisch 0 (backup von oben)
                equationErrorTupel.error = new OwnControlSignalsExpressionError(equation, controlSignalNames)
                equationErrorTupel.validExpression = defaultExpression
            }

            //sonst:keine Fehler --> der eingegebene Ausdruck wird uebernommen
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
    static toExternalGraphRepresentation(signalpair: IOutputSignalPair, customNames: CustomNames, automatonViewConfig: AutomatonViewConfig , minimizeExpression = false): Array<ApiOutputSignalPair> {
        let apiRepresentation: Array<ApiOutputSignalPair> = []
        //das Paar darf nicht transformiert werden falls es eine logisch 0 als Ausgabe hat und diese gemaess der aktuellen Konfiguration nicht angezeigt werden soll
        if (!automatonViewConfig.showZeroOutputs && CompleteTreeRoot.isConstant(signalpair.equationErrorTupel.validExpression, ConstantType.ConstantZero)) {
            //es liegt eine Ausgabe = 0 vor, die nicht angezeigt werden soll --> tue nichts (Ausgabe einer leeren Liste)
        }
        else {
            //Die Ausgabe soll transfomiert werden 
            //Bestimme den eigenen benutzerdefinierten Namen
            //erstlle unagbhaengige Version von sich der Variablen 
            let independentSignal = new InternalOutput(signalpair.varibableNumber)
            let name = getCustomNameFromInternalRepresentation(customNames.outputs, independentSignal)
            //Ueberfuehre den eigenen Baum in einen String (eventuell vorher minimieren)
            let equation = signalpair.equationErrorTupel.validExpression //nicht minimierter Ausdruck
            if(minimizeExpression){ //Ausdruck soll minimiert werden
                equation = CompleteTreeRoot.minimize(equation)
            }
            let equationString = CompleteTreeRoot.toCustomString(equation, customNames)
            apiRepresentation = [new ApiOutputSignalPair(name, { validExpression: equationString, error: signalpair.equationErrorTupel.error })] //uebernimm den Fehler
        }

        return apiRepresentation
    }

    static getVariable(signalpair: IOutputSignalPair): InternalOutput {
        return new InternalOutput(signalpair.varibableNumber)
    }

}