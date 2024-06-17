import { immerable } from "immer";
import { flatMap } from "lodash";
import { getCustomNameFromInternalRepresentation } from "../../../actioncreator/helperfunctions";
import { S_NAME, InternalIndependentControlSignal, InternalIndependentControlSignalAssignment } from "../../ControlSignal";
import { X_NAME, InternalInput } from "../../Input";
import { DEFAULT_LOGIC_ONE, DEFAULT_LOGIC_ZERO } from "../../Operators";
import { BaseInternAdressable, SignalTreeRepresentation } from "../../Signal";
import { Z_NAME, ZVariable } from "../../ZVariable";
import { CustomNames } from "../CustomNames";
import { BaseSystemAssignment, DerivedSystemAssignment } from "../SystemAssignment";
import { Leaf } from "./GeneralTree";
import { PlaceholderTreeNode } from "./PlaceHolderTree";
import { BaseCompleteTreeNode, ConstantType } from "./TreeNodeInterfaces";
import { Type, plainToClass } from 'class-transformer';
import 'reflect-metadata';
import 'es6-shim';

/**
 * abstrakte Klasse fuer alle moeglichen Variablentypen (Inputs oder Steuersignale)
 * Werden jeweils durch ihre internen Namen (als Zahl) im Baum dargestellt
 */
export abstract class BaseCompleteVariableNode extends BaseCompleteTreeNode implements Leaf {
    // [immerable] = true;
    /**Variable die durch diesen Knoten dargestellt wird in ihrer internen Darstellungsform */
    public variable: SignalTreeRepresentation

    /**
     * Erstelle eine neue Variable
     * @param variable Variable die durch diesen Knoten dargestellt wird in ihrer internen Darstellungsform 
     * @param bracketCounter Anzahl der Klammern um den Operator (bei 0 werden nur die noetigsten gesetzt)
     * @param zIndicator Indikator ob der Ausdruck z-Variablen enthaelt
     * @param controlSignalIndicator Indikator ob der Ausdruck Steuersignale enthaelt
     */
    constructor(variable: SignalTreeRepresentation, bracketCounter = 0, zIndicator: boolean, controlSignalIndicator: boolean) {
        super(bracketCounter, zIndicator, controlSignalIndicator)
        this.variable = variable
    }

    /**
     * Ausgabe der Variablen die durch diesen Knoten dargestellt wird
     */
    getVariable(): BaseInternAdressable {
        return this.variable
    }

    toInternalString(): string {
        //Ausgabe ohne Vorsilbe des Automaten bei Steuersignalen und z-Varibalen
        //Ausgabe lokal eindeutiger Name
        return this.variable.getInternalName()
    }

    toCustomString(customNames: CustomNames): string {
        //lies die angehangene Variable aus
        return this.variable.toCustomString(customNames)
    }

    extractAllIncludedVariables(): Array<SignalTreeRepresentation> {
        //Sich selbst als Variable in die Liste einfuegen
        let variableList: Array<SignalTreeRepresentation> = [this.variable]
        return variableList
    }

    extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>{
       // nur das Steuersignal ueberschreibt diese Methode
       return []
    }
    extractAllIncludedZVariables():Array<ZVariable>{
        // nur die zVariable ueberschreibt diese Methode
        return []
     }

    corruptionCheckForInput(input: InternalInput): boolean {
        //Pruefe auf Uebereinstimmung mit der eigenen Variablen
        return this.variable.matchesToInternalRepresentation(input)
    }

    corruptionCheckForControlSignal(controlSignal: InternalIndependentControlSignal): boolean {
        //Pruefe auf Uebereinstimmung mit der eigenen Variablen
        return this.variable.matchesToInternalRepresentation(controlSignal)
    }

}


/**
* Darstellung einer Z-Variablen als Knoten
* Auch innerhalb von Ausdrücken ohne Steuervariablen verwendbar
*/
export class CompleteTreeZVariableNode extends BaseCompleteVariableNode {
    // [immerable] = true;
    @Type(() => ZVariable)
    public variable: ZVariable
    /**
     * Erstellt ein neue Z-Variable
     * @param zVariable zu erstellenden z-Variablen z_i 
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern) 
     */
    constructor(zVariable: ZVariable, bracketCounter = 0) {
        //Ist eine Z-Variable --> enthaelt also zVariablen aber keine Steuersignale
        super(zVariable, bracketCounter, true, false)
    }

    corruptionCheckForAutomaton(automatonId: number): boolean {
        // Ist korrumpiert falls die ID identisch ist ist
        return (this.variable.getAuomatonId() === automatonId)
    }


    evaluate(variableAssignment: DerivedSystemAssignment): boolean {
        //Auswertung einer Z-Variablen ist mit und ohne Steuersignalen gleich
        return this.evaluateWithoutCS(variableAssignment);
    }

    evaluateWithoutCS(variableAssignment: BaseSystemAssignment): boolean {
        //Initialbelegung, falls Variable nicht in der Liste der aktuell gesetzten Eingaenge gefunden wurde
        let value = false;
        //Ist diese Variable in der aktuellen Belegung gestezt?
        for (let i = 0; i < variableAssignment.zVariableAssignment.length; i++) {
            let currentSignal = variableAssignment.zVariableAssignment[i];
            //Pruefe ob dies die Belegung dieser Variablen ist  (dafuer muessen der Name des Automaten und die Nummer uebereinstimmen)
            // Wenn ja muss diese Variablen zu ihrer Belegung (0 der 1 ausgewertet werden)
            if (this.variable.matchesToInternalRepresentation(currentSignal.getVariable())) {
                value = variableAssignment.zVariableAssignment[i].getAssignment()
                //Da die Variable in jeder Eingangsbelegung nur ein mal definiert seien kann, kann die Auswertung danach beendet werden
                break;
            }
        }
        return value;

    }

    extractAllIncludedZVariables():Array<ZVariable>{
        // nur die zVariable ueberschreibt diese Methode
        return [this.variable]
     }

}

/**
* Darstellung einer logischen Konstanten als Knoten
* kann auch in Ausdrucken ohne Steuersignalen verwendet werden
*/
export class CompleteTreeConstantNode extends BaseCompleteTreeNode implements PlaceholderTreeNode {
    // [immerable] = true;
    /** Typ einer Konstanten*/
    private type: ConstantType;

    /** Darstellung der Konstanten als String --> kann fest bei Objekterstellung gesetzt werden, da der Typ danach nicht mehr veraendert werden kann*/
    private stringRepresentation: string;

    /**
     * Erstellt eine Konstante als Knoten
     * @param constantType Art der Konstanten (0 oder 1)
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern)
     */
    constructor(constantType: ConstantType, bracketCounter = 0) {
        //Ist eine Konstante --> weder z-Variablen noch Steuersignale
        super(bracketCounter, false, false)
        this.type = constantType;

        //Welche Art von Konstanten liegt vor?
        switch (constantType) {
            case ConstantType.ConstantOne: this.stringRepresentation = DEFAULT_LOGIC_ONE; break;
            case ConstantType.ConstantZero: this.stringRepresentation = DEFAULT_LOGIC_ZERO; break;
        }
    }

    toCustomString(customNames: CustomNames): string {
        return this.stringRepresentation;
    }

    toInternalString(): string {
        return this.stringRepresentation;
    }

    //Konstanten sind nie korrumpiert
    corruptionCheckForAutomaton(): boolean { return false }
    corruptionCheckForControlSignal(): boolean { return false }
    corruptionCheckForInput(): boolean { return false }

    evaluate(): boolean {
        //Asuwertung einer Konstanten ist mit und ohne Steuersignalen gleich
        return this.evaluateWithoutCS()
    }

    evaluateWithoutCS(): boolean {

        let value = false;
        //Welche Konstante liegt vor? --> immer eindeutige Auswertung
        switch (this.type) {
            case ConstantType.ConstantOne: {
                value = true;
                break;
            }
            case ConstantType.ConstantZero: {
                value = false;
                break;
            }
        }
        return value;
    }

    setNewAutomatonNameForSignals(oldAutomatonName: string, newAutomatonName: string): void {
        //keine Aenderung ,da nie betroffen
    }

    extractAllIncludedVariables(): Array<SignalTreeRepresentation> {
        //hat keinen Einfluss auf die benoetigten Variablen
        return []
    }

    replacePlaceholders(): BaseCompleteTreeNode {
        //Konstanten koennen auch im Platzhalterbaum vorkommmen und muessen keine Platzhalter ersetzen
        return this
    }
    getType():ConstantType{
        return this.type
    }

    extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>{
        return []
    }

    extractAllIncludedZVariables():Array<ZVariable>{
        return []
    }

}

/**
* Eingaenge als Variablen
* kann auch in Ausdrucken ohne Steuersignalen verwendet werden und somit nur anhand er Eingangsbelegung berechnet werden
*/
export class CompleteTreeInputNode extends BaseCompleteVariableNode {
    // [immerable] = true;
    /** Ihr Typ ist immer Eingang*/
    //public type = VariableTyp.InputSignal;
    @Type(() => InternalInput)
    public variable: InternalInput

    /**
     * Erstellt einen Eingang mit diesem Namen (x_i)
     * @param input  Eingang der durch diesen Knoten dargestellt wird in der internen Darstellung
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern) 
     */
    constructor(input: InternalInput, bracketCounter = 0) {
        //Ein Eingang hat weder z- noch Steuervariablen
        super(input, bracketCounter, false, false)
    }


    corruptionCheckForAutomaton(automatonId: number): boolean {
        //von Aenderungen am Automaten nicht betroffen --> nie korrumpiert
        return false;
    }
 
    evaluate(variableAssignment: DerivedSystemAssignment): boolean {
        //Auswertung einer Eingangsvariablen ist mit und ohne Steuersignalen gleich
        return this.evaluateWithoutCS(variableAssignment);
    }

    evaluateWithoutCS(variableAssignment: BaseSystemAssignment): boolean {
        //Initialbelegung, falls Variable nicht in der Liste der aktuell gesetzten Eingaenge gefunden wurde
        let value = false;
        //Ist diese Variable in der aktuellen Belegung gestezt?
        for (let i = 0; i < variableAssignment.inputAssignment.length; i++) {
            let currentVariable = variableAssignment.inputAssignment[i].getVariable()
            //Pruefe ob dies die Belegung dieser Variablen ist --> Wenn ja muss diese Variablen zu ihrer Belegung (0 der 1 ausgewertet werden)
            if (this.variable.matchesToInternalRepresentation(currentVariable)) {
                value = variableAssignment.inputAssignment[i].getAssignment()
                //Da die Variable in jeder Eingangsbelegung nur ein mal definiert seien kann, kann die Auswertung danach beendet werden
                break;
            }
        }
        return value;
    }
    setNewAutomatonNameForSignals(oldAutomatonName: string, newAutomatonName: string): void {
        //keine Aenderung, da nie betroffen
    }

}
/**
* Darstellung der Steuersignale
*/
export class CompleteTreeControlSignalNode extends BaseCompleteVariableNode {
    // [immerable] = true;
    /**Sind vom Typ Steuersignal */
    //type:VariableTyp.ControlSignal;
    @Type(() => InternalIndependentControlSignal)
    public variable:InternalIndependentControlSignal

    /**
     * Erstellt ein neues Steuersignal im Baum
     * @param variable dem Konten zugeordnetes Steuersignal
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern)
     */
    constructor(variable:InternalIndependentControlSignal, bracketCounter = 0) {
        //Beinhaltet / ist ein Steuersignal (keine z-Variablen)
        super(variable, bracketCounter, false, true)
    }

  
    corruptionCheckForAutomaton(automatonId: number): boolean {
        // Ist korrumpiert falls der Automatenname enthalten ist
        return (this.variable.getAutomatonId() === automatonId)
    }

    evaluate(variableAssignment: DerivedSystemAssignment): boolean {
        //Initialbelegung, falls Variable nicht in der Liste der aktuell gesetzten Eingaenge gefunden wurde
        let value = false;
        //Ist diese Variable in der aktuellen Belegung gestezt?
        for (let i = 0; i < variableAssignment.controlSignalAssignment.length; i++) {
            let currentSignal = variableAssignment.controlSignalAssignment[i];
            //Pruefe ob dies die Belegung dieser Variablen ist (Automatenname und interne Bezeichnung muessen gleich sein)
            // --> Wenn ja muss diese Variablen zu ihrer Belegung (0 der 1 ausgewertet werden)
            if (this.variable.matchesToInternalRepresentation(currentSignal.getVariable())) {
                value = currentSignal.getAssignment();
                //Da die Variable in jeder Eingangsbelegung nur ein mal definiert seien kann, kann die Auswertung danach beendet werden
                break;
            }
        }
        return value;
    }

   
    evaluateWithoutCS(variableAssignment: BaseSystemAssignment): boolean {
        //werte das Steuersignal zu logisch 0 aus
        // console.log("Das Steuersignal " + this.toInternalString() + " wurde fuer die Auswertung zu 0 gesetzt.")
        return false
    }

    extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>{
        // nur das Steuersignal ueberschreibt diese Methode
        return [this.variable]
     }

}
