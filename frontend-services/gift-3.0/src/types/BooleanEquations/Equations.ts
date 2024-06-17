import { immerable } from 'immer';
import { ApiControlSignalEquation, ApiEquation, ApiOutputEquation, ApiZEquation } from '../ApiClasses/Equation';
import { FullApiTransformable } from '../ApiTransformable';
import { ControlSignal, ExternalIndependentControlSignal, InternalIndependentControlSignal } from '../ControlSignal';
import { ExternalInput } from '../Input';
import { ExternalOutput, InternalOutput } from '../Output';
import { ZVariable } from '../ZVariable';
import { CustomNames } from './CustomNames';
import { CompleteTreeRoot, ICompleteTreeRoot } from './LogicTrees/TreeRoots';
import { minimizeLogicTree } from './Minimizer/minimizeTree';



/**
 * Darstellung einer Automatengleichung (Ausgabe- oder z-Gleichung)
 */
export abstract class AutomatonEquation implements FullApiTransformable{
    [immerable] = true;
    /**linke Seite der Gleichung (zu definierende Variable) */
    public variable: ZVariable | InternalIndependentControlSignal | InternalOutput
    /**rechte Seite der Gleichung (logsicher Ausdruck)  */
    public equation: ICompleteTreeRoot

    /**
     * Erstelle eine neue Gleichung fuer eine Variable
     * @param variable Variable die durch die Gleichung bestimmt wird
     * @param equation Gleichung die die Variable bestimmt
     */
    constructor(variable:ZVariable | InternalIndependentControlSignal | InternalOutput , equation:ICompleteTreeRoot){
        this.variable = variable
        this.equation = equation
    }

    /**
     * Erstellt eine Kopie dieser Gleichung, bei der Ausdruck der Gleichung minimiert wurde
     * @param inputDontCareExpression Dont-Care-Ausdruck ueber den der Ausdruck minimiert werden soll (falls die Konfiguration Minimierung ueber hStern vorschreibt)
     * @returns Kopie der Gleichung, wobei der Ausdruck ueber den Dont-Care-Ausdruck minimiert wurde
     */
    abstract minimize(inputDontCareExpression?:ICompleteTreeRoot):AutomatonEquation

    abstract toExternalGraphRepresentation(customNames:CustomNames):ApiEquation

    abstract getVariable():ZVariable | InternalOutput | InternalIndependentControlSignal

    getEquation():ICompleteTreeRoot{
        return this.equation
    }
}

/**Darstellung einer Z-gleichung */
export class ZEquation extends AutomatonEquation {
    [immerable] = true;
    /**z-Variablen */
    public variable: ZVariable;

    /**logische Gleichung (darf Stuersignale enthalten) */
    equation: ICompleteTreeRoot

    /**
     * Erstelle eine neue Z-Gleichung
     * @param zVariable Variable, die durch die Gleichung definiert wird
     * @param equation Gleichung fuer die Definition
     */
    constructor(zVariable:ZVariable , equation:ICompleteTreeRoot){
        super(zVariable , equation)
    }

    toExternalGraphRepresentation(customNames:CustomNames):ApiZEquation{
        //Auslesen des eigenen Namens und Umformen des logischen Baums in einen String
        return new ApiZEquation(this.variable.toCustomString() ,CompleteTreeRoot.toCustomString(this.equation , customNames))
    }

    getVariable():ZVariable{
        return this.variable
    }

    minimize(inputDontCareExpression?:ICompleteTreeRoot):ZEquation{
        //minimiere den Ausdruck dieser Gleichung uber den Dont-Care Ausdruck
        let minimizedExpressions:ICompleteTreeRoot = CompleteTreeRoot.minimize(this.equation,inputDontCareExpression)
        //erstelle eine neue Gleichung mit dem minimierten Ausdruck
        return new ZEquation(this.variable , minimizedExpressions)
    }
}

/**Darstellung einer Ausgabegleichung fuer ein Steuersignal */
export class CSEquation extends AutomatonEquation{
    [immerable] = true;
    /** Steuersignal*/
    public variable: InternalIndependentControlSignal;
    /**logische Gleichung (darf keine Stuersignale enthalten) */
    public equation: ICompleteTreeRoot

    /**
     * Erstelle eine neue Ausgabegleichung fuer ein Steuersignal
     * @param controlSignal Variable, die durch die Gleichung beschrieben wird
     * @param equation Gleichung zur Beschreibung der Variablen (darf keine Steuersignale enthalten)
     * @throws "equation for controlsignals must not contain controlsignals" Falls die Gleichung steuersignale enthaelt
     */
    constructor(controlSignal: InternalIndependentControlSignal , equation:ICompleteTreeRoot){
        super(controlSignal , equation)
         //preuefe ob der Ausdruck keine Steuersignale beinhaltet --> Wenn doch: Fehler
         if(CompleteTreeRoot.containsControlSignals(this.equation) ){
            throw new Error("equation for controlsignals must not contain controlsignals")
        }
    }

    toExternalGraphRepresentation(customNames:CustomNames):ApiControlSignalEquation{
        //Auslesen des eigenen Namens und Umformen des logischen Baums in einen String 
        //(fuer die Variable muss die Vorsilbe des Automaten nicht angezeigt werden, da die Gleichung im Kontext eines Automaten gespeichert wird)
        return new ApiControlSignalEquation(this.variable.getCustomName(customNames),CompleteTreeRoot.toCustomString(this.equation , customNames))
    }

    getVariable():InternalIndependentControlSignal{
        return this.variable
    }

    minimize(inputDontCareExpression?:ICompleteTreeRoot):CSEquation{
        //minimiere den Ausdruck dieser Gleichung uber den Dont-Care Ausdruck
        let minimizedExpressions:ICompleteTreeRoot = CompleteTreeRoot.minimize(this.equation,inputDontCareExpression)
        //erstelle eine neue Gleichung mit dem minimierten Ausdruck
        return new CSEquation(this.variable , minimizedExpressions)
    }
}

/**Darstellung einer Ausgabegleichung */
export class OutputEquation extends AutomatonEquation {
    [immerable] = true;
    /**Ausgangsvariable */
    public variable: InternalOutput;
    /**logische Gleichung (darf Stuersignale enthalten) */
    public equation: ICompleteTreeRoot

    /**
     * Erstelle eine neue Ausgabegleichung
     * @param output Variable, die durch die Gleichung beschrieben wird
     * @param equation Gleichung zur Beschreibung der Variablen
     */
    constructor(output: InternalOutput, equation:ICompleteTreeRoot){
        super(output , equation)
    }

    toExternalGraphRepresentation(customNames:CustomNames):ApiOutputEquation{
        //Auslesen des eigenen Namens und Umformen des logischen Baums in einen String
        return new ApiOutputEquation(this.variable.toCustomString(customNames) ,CompleteTreeRoot.toCustomString(this.equation , customNames))
    }
    getVariable():InternalOutput{
        return this.variable
    }

    minimize(inputDontCareExpression?:ICompleteTreeRoot):OutputEquation{
        //minimiere den Ausdruck dieser Gleichung uber den Dont-Care Ausdruck
        let minimizedExpressions:ICompleteTreeRoot = CompleteTreeRoot.minimize(this.equation,inputDontCareExpression)
        //erstelle eine neue Gleichung mit dem minimierten Ausdruck
        return new OutputEquation(this.variable,minimizedExpressions)
    }
}