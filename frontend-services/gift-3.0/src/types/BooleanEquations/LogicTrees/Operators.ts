import { immerable } from "immer";
import { mergeTwoLists } from "../../../actioncreator/helperfunctions";
import { InternalIndependentControlSignal } from "../../ControlSignal";
import { InternalInput } from "../../Input";
import { OperatorEnum, TwoOperandOperator, OneOperandOperator, DEFAULT_AND_OPERATOR, DEFAULT_NOT_OPERATOR, DEFAULT_OR_OPERATOR, DEFAULT_XOR_OPERATOR } from "../../Operators";
import { BaseInternAdressable, SignalTreeRepresentation } from "../../Signal";
import { ZVariable } from "../../ZVariable";
import { CustomNames } from "../CustomNames";
import { ZEquation } from "../Equations";
import { DerivedSystemAssignment, BaseSystemAssignment } from "../SystemAssignment";
import { OperatorNode } from "./GeneralTree";
import { BaseCompleteTreeNode} from "./TreeNodeInterfaces";
import { castJSONtoType } from "../../../reducers/normalizedReducers/helperfunctions";


/**
 * Abstrakte Klasse fuer alle moeglichen Operatoren 
 * !!! bedenke dass Operanden der Operatoren nach der Erstellung nie wieder aenderbar seien sollen !!!
 */
export abstract class BaseCompleteOperatorNode extends BaseCompleteTreeNode implements OperatorNode {
    // [immerable] = true;
    /** Operatortyp */
    public type: OperatorEnum

    
    /** Standardoperatorsymbol (nie geandert) */
    public operatorSymbol: string;

    /**
     * Erstelle einen neuen Operator
     * Ist nicht nach aussen sichtbar um zu vermeiden dass Objekte direkt erstellt werden (dafuer werden jeweilige static Methoden genutzt)
     * @param operatroType Typ des Operatoren
     * @param bracketCounter Anzahl der Klammern um den Operator (bei 0 werden nur die noetigsten gesetzt)
     * @param zIndicator Indikator ob der Ausdruck z-Variablen enthaelt
     * @param controlSignalIndicator Indikator ob der Ausdruck Steuersignale enthaelt
     */
    public constructor(operatroType:OperatorEnum , bracketCounter:number=0 , zIndicator:boolean , controlSignalIndicator:boolean){
        super(bracketCounter , zIndicator , controlSignalIndicator)
        this.type = operatroType
    }

    getType():OperatorEnum{
        return this.type
    }

}

/**
 * Operatoren, die zwei Operanden verknuepfen als moegliche Knoten
 * !!! Stelle sicher dass nach einmaliger Erstellung eines Operatoren seine Kinder nie veraendert werden koennen --> keine Setter!!!
 */
export class CompleteTreeTwoOperandOperatorNode extends BaseCompleteOperatorNode {
    // [immerable] = true;
    /** Welcher Operator (fuer 2 Operanden) liegt vor ?*/
    public type: TwoOperandOperator;

    /** linker Teilausdruck --> keine Setter damit diese niemals veraendert*/
    private leftChild: BaseCompleteTreeNode;
    /** rechter Teilaudruck --> keine Setter damit diese niemals veraendert*/
    private rightChild: BaseCompleteTreeNode;

    /**
     * Erstellt einen Operator fuer zwei Operanden
     * @param type Operatortyp fuer Verknuepfung von zwei Operanden
     * @param leftChild linke Teilausdruck
     * @param rightChild rechte Teilausdruck
     * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern)
     */
    constructor(type: TwoOperandOperator, leftChild: BaseCompleteTreeNode, rightChild: BaseCompleteTreeNode , bracketCounter=0 ) {
        //setze die Indikatoren inital auf false
        super(type,bracketCounter , false , false)
        this.type = type;
        //setze das richtige Operatorsymbol 
        switch (type) {
            case OperatorEnum.AndOperator: this.operatorSymbol = DEFAULT_AND_OPERATOR; break;
            case OperatorEnum.ExclusicOrOperator: this.operatorSymbol = DEFAULT_XOR_OPERATOR; break;
            case OperatorEnum.OrOperator: this.operatorSymbol = DEFAULT_OR_OPERATOR; break;
        }

        this.leftChild = castJSONtoType(leftChild);
        this.rightChild = castJSONtoType(rightChild);
        //folgende Ueberlegungen sind nuer moeglich solange garantiert wird, dass die Kinder des Operatoren nach der Erstellung nicht mehr veraendert werden koennen
        //enhalten die Kinder Sterusignale oder z-Variablen ? --> Wenn ja passe die eigenen Indikatoren an
        let zIndicator = this.leftChild.containsZVariables() || this.rightChild.containsZVariables()
        this.zIndicator = zIndicator

        let controlSignalIndicator = this.leftChild.containsControlSignals() || this.rightChild.containsControlSignals()
        this.controlSignalIndicator = controlSignalIndicator
    }

    resetTreeBrackets():void{
        this.bracketCounter = 0 ;
        //Aufruf auf beiden Kindern fortsetzen
        this.leftChild.resetTreeBrackets()
        this.rightChild.resetTreeBrackets()
    }

    getLeftChild():BaseCompleteTreeNode{
        return this.leftChild
    }
    getRightChild():BaseCompleteTreeNode{
        return this.rightChild
    }
    getType():TwoOperandOperator{
        return this.type
    }

    toInternalString(): string {
        //Ausgabe des linken Teilbaums, des Operators und des rechten Teilbaums (inorder)
        return ("(" + this.leftChild.toInternalString() + this.operatorSymbol + this.rightChild.toInternalString() + ")")
    }

    toCustomString(customNames:CustomNames): string {
        var customOperatorSymbol = "";
        //ordne dem aktuellen Operator das richtige nutzerdefinierte Symbol zu
        //finde heraus ob die Kinder ggf. schwacher bindende Operatoren sind als man selbst --> in diesem Fall muessen Klammern gesetzt werden
        let leftChildWeakerConnecting=false;
        let rightChildWeakerConnecting=false;
        switch (this.type) {
            case OperatorEnum.AndOperator:{
                customOperatorSymbol = customNames.operators.customAndOperator.validName; 
                //nur ein or kann schwacher binden als man selbst
                if(this.leftChild instanceof CompleteTreeTwoOperandOperatorNode && this.leftChild.getType() === OperatorEnum.OrOperator){
                    //linkes Kind bindet starker
                    leftChildWeakerConnecting = true
                }
                if(this.rightChild instanceof CompleteTreeTwoOperandOperatorNode && this.rightChild.getType() === OperatorEnum.OrOperator){
                    //rechtes Kind bindet starker
                    rightChildWeakerConnecting = true
                }
                break;
            }
            case OperatorEnum.OrOperator: {
                customOperatorSymbol = customNames.operators.customOrOperator.validName; 
                //nichts bindet schwaecher als ein or --> nie Klammern setzen
                break;
            }
            //TODO: ggf. in Hirachie einarbeiten
            case OperatorEnum.ExclusicOrOperator: {customOperatorSymbol = customNames.operators.customExclusivOrOperator.validName; break};
        }
        let leftChildString:string;
        let rightChildString:string
        //Klammere das linke Kind wenn es fuer die Semantik noetig ist und ergaenze ggf. weitere Klammern bis es so oft geklammert wie gefordert
        if(leftChildWeakerConnecting){
            //Es muss mindestens ein mal geklammert werden --> eine Klammer des Kindes ist bereits die notwendige Klammer 
            let adaptedChildBracketCounter = Math.max(0,this.leftChild.getBracketCounter()-1)
            leftChildString = "(" + "(".repeat(adaptedChildBracketCounter) + this.leftChild.toCustomString(customNames) + ")".repeat(adaptedChildBracketCounter) + ")"

        }
        else{
            //Klammer das Kind so oft wie es moechte
            leftChildString = "(".repeat(this.leftChild.getBracketCounter()) + this.leftChild.toCustomString(customNames) + ")".repeat(this.leftChild.getBracketCounter())
        }

        //Klammere das rechte Kind wenn es fuer die Semantik noetig ist und ergaenze ggf. weitere Klammern bis es so oft geklammert wie gefordert
        if(rightChildWeakerConnecting){
            //Es muss mindestens ein mal geklammert werden --> eine Klammer des Kindes ist bereits die notwendige Klammer 
            let adaptedChildBracketCounter = Math.max(0,this.rightChild.getBracketCounter()-1)
            rightChildString = "(" + "(".repeat(adaptedChildBracketCounter) + this.rightChild.toCustomString(customNames) + ")".repeat(adaptedChildBracketCounter) + ")"

        }
        else{
            //Klammer das Kind so oft wie es moechte
            rightChildString = "(".repeat(this.rightChild.getBracketCounter()) + this.rightChild.toCustomString(customNames) + ")".repeat(this.rightChild.getBracketCounter())
        }
        
        //Ausgabe des linken kindes , des Operatorsymbols und des rechten Kindes
        return leftChildString + customOperatorSymbol + rightChildString

    }

    corruptionCheckForInput(internalSignal:InternalInput): boolean {
        //Pruefe ob der linke oder rechte Teilausdruck korrumpiert ist
        return (this.leftChild.corruptionCheckForInput(internalSignal) || this.rightChild.corruptionCheckForInput(internalSignal))
    }
    corruptionCheckForAutomaton(automatonId: number): boolean {
        //Pruefe ob der linke oder rechte Teilausdruck korrumpiert ist
        return (this.leftChild.corruptionCheckForAutomaton(automatonId) || this.rightChild.corruptionCheckForAutomaton(automatonId))
    }

    corruptionCheckForControlSignal(controlSignal:InternalIndependentControlSignal): boolean {
        //Pruefe ob der linke oder rechte Teilausdruck korrumpiert ist
        return (this.leftChild.corruptionCheckForControlSignal(controlSignal) || this.rightChild.corruptionCheckForControlSignal(controlSignal))
    }

    evaluate(variableAssignment: DerivedSystemAssignment): boolean {
        //werte beide Kinder aus und berechne daraus das Ergebnis dieses Operators
        return this.evaluateThis(this.leftChild.evaluate(variableAssignment) , this.rightChild.evaluate(variableAssignment))
    }

    evaluateWithoutCS(variableAssignment:BaseSystemAssignment):boolean{
        //werte beide Kinder aus und berechne daraus das Ergebnis dieses Operators
        return this.evaluateThis(this.leftChild.evaluateWithoutCS(variableAssignment) , this.rightChild.evaluateWithoutCS(variableAssignment))
    }

    /**
     * Hilfsmethode um aus den Ergebnissen der Auswertung der Kindknoten das Ergebnis der Auswertung des aktuellen Operatorknotens zu berechnen
     * @param leftChildEvaluation Auswertung des linken Kindes
     * @param rightChildEvaluation Auswertung des rechten Kindes
     * @returns Auswertung dieses Knotens
     */
    private evaluateThis(leftChildEvaluation:boolean , rightChildEvaluation:boolean):boolean {
        let value = false;
        //Welche Art von Operator liegt vor?
        switch (this.type) {
            case OperatorEnum.AndOperator: {
                //UND --> Auswertung der Kinder mit und verknuepft zurueckgeben
                value = rightChildEvaluation && leftChildEvaluation;
                break;
            }
            case OperatorEnum.OrOperator: {
                //Or --> Auswertung der Kinder mit oder verknuepft zurueckgeben
                value = rightChildEvaluation || leftChildEvaluation
                break;
            }
            case OperatorEnum.ExclusicOrOperator: {
                //ExOr --> Auswertung der Kinder mit ExOr verknuepft zurueckgeben
                //Umsetzung exklusives Oder
                value = (leftChildEvaluation && !rightChildEvaluation) || (!leftChildEvaluation && rightChildEvaluation)
                break;
            }
        }
        return value;
    }

    extractAllIncludedVariables():Array<SignalTreeRepresentation>{
        //berechne die Variablen, die in beiden Teilausdruecken enthalten sind (untereinander eventuelle Dopllungen)
        let leftChildVariables = this.leftChild.extractAllIncludedVariables();
        let rightChildVariables = this.rightChild.extractAllIncludedVariables();

        //fuehre beide Listen ohne Dopllungen zusammen
        return mergeTwoLists(leftChildVariables , rightChildVariables)
    }

    extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>{
        //berechne die Variablen, die in beiden Teilausdruecken enthalten sind (untereinander eventuelle Dopllungen)
        let leftChildVariables = this.leftChild.extractAllIncludedControlSignals();
        let rightChildVariables = this.rightChild.extractAllIncludedControlSignals();

        //fuehre beide Listen ohne Dopllungen zusammen
        return mergeTwoLists(leftChildVariables , rightChildVariables)
    }

    extractAllIncludedZVariables():Array<ZVariable>{
        //berechne die Variablen, die in beiden Teilausdruecken enthalten sind (untereinander eventuelle Dopllungen)
        let leftChildVariables = this.leftChild.extractAllIncludedZVariables();
        let rightChildVariables = this.rightChild.extractAllIncludedZVariables();

        //fuehre beide Listen ohne Dopllungen zusammen
        return mergeTwoLists(leftChildVariables , rightChildVariables)
    }
}

/**
 * Operatoren, die nur einen Operanden verknuepfen als moegliche Knoten
 * !!! Stelle sicher dass nach einmaliger Erstellung eines Operatoren seine Kinder nie veraendert werden koennen --> keine Setter!!!
 */
export class CompleteTreeOneOperandOperatorNode extends BaseCompleteOperatorNode{
    // [immerable] = true;
    /** Welcher Operator (fuer einen Operanden) liegt vor ?*/
    public type: OneOperandOperator;


    /**mit dem Operator verknuepfter Teilausdruck */
    private child: BaseCompleteTreeNode;

/**
 * Erstelle einen neuen Operatoren fuer einen Operanden
 * @param type Operatortyp
 * @param child Kind des Operatoren
 * @param bracketCounter Anzahl an Klammer die um den Block gesetzt werden sollen (initial =0 --> setzt nur die semantisch notwendigen Klammern)
 */
     constructor(type: OneOperandOperator, child: BaseCompleteTreeNode , bracketCounter=0) {
        //setze die Indikatoren inital auf false
        super(type,bracketCounter , false , false)
        this.type = type;
        //setze das richtige Operatorsymbol 
        switch (type) {
            case OperatorEnum.NotOperator: this.operatorSymbol = DEFAULT_NOT_OPERATOR; break;
        }
        this.child = castJSONtoType(child);
        //folgende Ueberlegungen sind nuer moeglich solange garantiert wird, dass das Kind des Operatoren nach der Erstellung nicht mehr veraendert werden koennen
        //enhaelt das Kinder Sterusignale oder z-Variablen ? --> Wenn ja passe die eigenen Indikatoren an
        this.zIndicator = this.child.containsZVariables() 

        this.controlSignalIndicator = this.child.containsControlSignals()
     
    }

    getType():OneOperandOperator{
        return this.type
    }
    
    getChild():BaseCompleteTreeNode{
        return this.child
    }
    resetTreeBrackets():void{
        this.bracketCounter = 0 ;
        //Aufruf auf Kind fortsetzen
        this.child.resetTreeBrackets()
    }

    toInternalString(): string {
        //Ausgabe des Operators und des Kindes (inorder)
        return ("(" + this.operatorSymbol + this.child.toInternalString() + ")")
    }
    toCustomString(customNames:CustomNames): string {
        var customOperatorSymbol = "";
        //ordne dem aktuellen Operator das richtige nutzerdefinierte Symbol zu --> preufe ob das Kind schwaecher bindet
        let childWaekerConnecting=false
        switch (this.type) {
            //Negation bindet staerker als alles andere --> jedes Kind, das ein Operator ausser nicht ist bindet schwacher
            case OperatorEnum.NotOperator: {
                customOperatorSymbol = customNames.operators.customNotOperator.validName; 
                if(this.child instanceof CompleteTreeTwoOperandOperatorNode){ 
                    childWaekerConnecting=true 
                }
                break;
            }
        }
        let childString:string=""
        if(childWaekerConnecting){  
          //Es muss mindestens ein mal geklammert werden --> eine Klammer des Kindes ist bereits die notwendige Klammer 
         let adaptedChildBracketCounter = Math.max(0,this.child.getBracketCounter()-1)
         childString = "(" + "(".repeat(adaptedChildBracketCounter) + this.child.toCustomString(customNames) + ")".repeat(adaptedChildBracketCounter) + ")"
        }
        else{
            //Kind so oft klammern wie es moechte
            childString =  "(".repeat(this.child.getBracketCounter()) + this.child.toCustomString(customNames) + ")".repeat(this.child.getBracketCounter()) 
        }


        //Ausgabe des  kindes und des Operatorsymbols 
        return customOperatorSymbol + childString
    }



    corruptionCheckForInput(input:InternalInput): boolean {
        //Pruefe ob das Kind korrumpiert ist
        return (this.child.corruptionCheckForInput(input))
    }
    corruptionCheckForAutomaton(automatonId: number): boolean {
        //Pruefe ob das Kind korrumpiert ist
        return (this.child.corruptionCheckForAutomaton(automatonId))
    }

    corruptionCheckForControlSignal(controlSignal:InternalIndependentControlSignal): boolean {
        //Pruefe ob das Kind korrumpiert ist
        return (this.child.corruptionCheckForControlSignal(controlSignal))
    }

    evaluate(variableAssignment: DerivedSystemAssignment): boolean {
        //Werte das Kind aus und behandle das Ergebnis entsprechend des vorliegenden Operatortyps
        return this.evaluateThis(this.child.evaluate(variableAssignment))
    }

    evaluateWithoutCS(variableAssignment: BaseSystemAssignment): boolean {
        //Werte das Kind aus und behandle das Ergebnis entsprechend des vorliegenden Operatortyps
        return this.evaluateThis(this.child.evaluateWithoutCS(variableAssignment))
    }
    
    /**
     * Hilfsfunktion um das ausgewertete Ergebnis des Kindes entsprechend des hier vorliegenden Operatortyps zu verarbeiten
     * @param childEvaluation Ergebnis der Auswertung des Kindes
     * @returns Ergebnis der Auswertung dieses Operatorknotens 
     */
    private evaluateThis(childEvaluation:boolean):boolean {
        let result = false;
        //Welche Art von Operator liegt vor?
        switch (this.type) {
            case OperatorEnum.NotOperator: {
                //Negation --> Auswertung des Kindes negiert zurueckgeben
                result = !(childEvaluation)
                break;
            }
        }
        return result;
    }
    
    extractAllIncludedVariables():Array<SignalTreeRepresentation>{
        //Ausgabe des Kindes zurueckgeben
        return this.child.extractAllIncludedVariables();
    }

    extractAllIncludedControlSignals():Array<InternalIndependentControlSignal>{
        //Ausgabe des Kindes zurueckgeben
        return this.child.extractAllIncludedControlSignals();
    }

    extractAllIncludedZVariables():Array<ZVariable>{
        //Ausgabe des Kindes zurueckgeben
        return this.child.extractAllIncludedZVariables();
    }

}
