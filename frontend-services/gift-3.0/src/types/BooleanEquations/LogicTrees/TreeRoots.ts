import { immerable } from "immer";
import { BaseInternAdressable, SignalTreeRepresentation } from "../../Signal";
import { CustomNames } from "../CustomNames";
import { minimizeLogicTree } from "../Minimizer/minimizeTree";
import { BaseSystemAssignment, DerivedSystemAssignment } from "../SystemAssignment";
import { treeRoot } from "./GeneralTree";
import { ConstantType } from "./TreeNodeInterfaces";
import { BaseCompleteVariableNode, CompleteTreeConstantNode, CompleteTreeControlSignalNode, CompleteTreeInputNode, CompleteTreeZVariableNode } from "./Variables";
import { BaseCompleteTreeNode } from "./TreeNodeInterfaces";
import { ControlSignal, InternalIndependentControlSignal } from "../../ControlSignal";
import { cloneDeep } from "lodash";
import { ZVariable } from "../../ZVariable";
import { CompleteTreeOneOperandOperatorNode, CompleteTreeTwoOperandOperatorNode } from "./Operators";
import 'reflect-metadata';
import 'es6-shim';
import { plainToClass, plainToInstance } from 'class-transformer';
import { castJSONtoType } from "../../../reducers/normalizedReducers/helperfunctions";
import { InternalInput } from "../../Input";

/** Interface: 
 * Wurzel eines vollstaendigen Baumes, die diesen nach aussen vertritt
 * Nur die hier definierten Methoden werden nach aussen sichtbar (ggf. nich alle Methoden der Knoten nach aussen zeigen)
 * (Eingefuehrt um das Auslesen mit meht Klammern als noetig einfacher umzusetzen --> nur der Knoten ueber einem selbst kann wissen ob Klammern fuer das korrekte Auslesen
 * noetig sind oder nicht --> vorher existierte kein Vater zu dem obersten Knoten)
 * 
 * --> in dieser Form wird eine Wurzel eines Logikbaums im State gespeichert */
export interface ICompleteTreeRoot {
    /**
     * Zu der Wurzel gehoeriger Baum
     * Jede Änderung auf diesem angehangenen Baum muss Immutable sein, d.h. bei einer Veränderung des angehangenen Baums muss ein neuer Baum erstellt und angehangen werden
     * (dies resultiert aus dem bei {@link curriedMetaStateReducer} beschriebenen Verhalten von Immer und Redo+Undo)
     */
    tree: BaseCompleteTreeNode

}


/**
 * Wrapperklasse als Sammlung von Funktionen auf einer Wurzel
 */
export class CompleteTreeRoot {


    static toInternalString(iRoot: ICompleteTreeRoot): string {
        //Baum als String ausgeben
        //ALLE MÖGLICHKEITEN DER NODES DURCHEGEHEN UND VON JSON AUF DIE TYPES CASTEN
        if((<any>iRoot.tree).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot.tree)
            return d.toInternalString()
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot.tree)
            
            return d.toInternalString()
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === true){
            // console.log("ControlSignal")
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot.tree)
            return d.toInternalString()
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot.tree)
            return d.toInternalString()
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot.tree).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).child), iRoot.tree.bracketCounter)
            
            return d.toInternalString()
        }
        else if(((<any>iRoot.tree).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).leftChild), castJSONtoType((<any>iRoot.tree).rightChild), iRoot.tree.bracketCounter)
           
            return d.toInternalString()
        }
    }

    /**
    * Knoten gibt sich und alle seine Kinder als logischen Ausdruck als String mit den nutzerdefinierten Bezeichnungen und Operatoren zurueck
    * Es kuemmert sich immer der Vaterknoten um die korrekte Klammerung des Kindes
    * @param customNames Alle aktuell im Sytsem definierten Variablen mit deren nutzerdefinierten Namen
    * @returns aktueller Baum als logischer Ausdruck mit nutzerdefinierten Bezeichnungen der Variabalen und Operatoren
    */
    static toCustomString(iRoot: ICompleteTreeRoot, customNames: CustomNames): string {
        //Klammere den obersten Block so oft wie er geklammert werden soll
        //ALLE MÖGLICHKEITEN DER NODES DURCHEGEHEN UND VON JSON AUF DIE TYPES CASTEN
        if((<any>iRoot.tree).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot.tree)
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot.tree)
            
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === true){
            // console.log("ControlSignal")
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot.tree)
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot.tree)
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot.tree).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).child), iRoot.tree.bracketCounter)
            
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
        }
        else if(((<any>iRoot.tree).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).leftChild), castJSONtoType((<any>iRoot.tree).rightChild), iRoot.tree.bracketCounter)
           
            let resultstring = "(".repeat(d.getBracketCounter()) + d.toCustomString(customNames) + ")".repeat(d.getBracketCounter())
            return resultstring
        }
        
    }

    /**
     * Ueberpruft ob der Eingang mit diesem Namen im Baum enthalten ist, wodurch der Baum korrumpiert ist
     * @param internalSignal Eingang in seiner internen Darstellung
     * @returns ist der Baum korrumpiert?
     */
    static corruptionCheckForInput(iRoot: ICompleteTreeRoot, internalSignal: InternalInput): boolean {
        if((<any>iRoot.tree).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot.tree)
            return d.corruptionCheckForInput()
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot.tree)
            
            return d.corruptionCheckForInput(internalSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === true){
            // console.log("ControlSignal")
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot.tree)
            return d.corruptionCheckForInput(internalSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot.tree)
            return d.corruptionCheckForInput(internalSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot.tree).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).child), iRoot.tree.bracketCounter)
            
            return d.corruptionCheckForInput(internalSignal)
        }
        else if(((<any>iRoot.tree).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).leftChild), castJSONtoType((<any>iRoot.tree).rightChild), iRoot.tree.bracketCounter)
           
            return d.corruptionCheckForInput(internalSignal)
        }
    }

    /**
       * Ueberpruft ob ein Signal innerhalb des Baumes diesem Automaten zugeordnet ist , wodurch der Baum korrumpiert ist
       * @param automatonId Id des Automaten
       * @returns ist der Baum korrumpiert? <==> ein Signal (z- oder Steuervariable) dieses Automaten ist im Baum enthalten
       */
    static corruptionCheckForAutomaton(iRoot: ICompleteTreeRoot, automatonId: number): boolean {
        
        if((<any>iRoot.tree).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot.tree)
            return d.corruptionCheckForAutomaton()
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot.tree)
            
            return d.corruptionCheckForAutomaton(automatonId)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === true){
            // console.log("ControlSignal")
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot.tree)
            return d.corruptionCheckForAutomaton(automatonId)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot.tree)
            return d.corruptionCheckForAutomaton(automatonId)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot.tree).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).child), iRoot.tree.bracketCounter)
            
            return d.corruptionCheckForAutomaton(automatonId)
        }
        else if(((<any>iRoot.tree).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).leftChild), castJSONtoType((<any>iRoot.tree).rightChild), iRoot.tree.bracketCounter)
           
            return d.corruptionCheckForAutomaton(automatonId)
        }
    }
    /**
      * Uebertprueft ob dieses Steuersignal im Baum verwendet wurde
      * @param controlSignal zu pruefendes Steuersignal in seiner internen Darstellung
      * @returns ist der Baum korrumpiert?
      */
    static corruptionCheckForControlSignal(iRoot: ICompleteTreeRoot, controlSignal: InternalIndependentControlSignal): boolean {
        
        if((<any>iRoot.tree).stringRepresentation!=undefined){
            let d = plainToInstance(CompleteTreeConstantNode, iRoot.tree)
            return d.corruptionCheckForControlSignal()
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).variable.automatonId===undefined){
            let d = plainToInstance(CompleteTreeInputNode, iRoot.tree)
            
            return d.corruptionCheckForControlSignal(controlSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === true){
            // console.log("ControlSignal")
            let d = plainToInstance(CompleteTreeControlSignalNode, iRoot.tree)
            return d.corruptionCheckForControlSignal(controlSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if((<any>iRoot.tree).variable!=undefined && (<any>iRoot.tree).controlSignalIndicator === false){
            let d = plainToInstance(CompleteTreeZVariableNode, iRoot.tree)
            return d.corruptionCheckForControlSignal(controlSignal)
            //let d = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, (<any>iRoot.tree).leftChild, (<any>iRoot.tree).rightChild, (<any>iRoot.tree).bracketCounter)
        }
        else if(((<any>iRoot.tree).child!=undefined)){
            let d: CompleteTreeOneOperandOperatorNode = new CompleteTreeOneOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).child), iRoot.tree.bracketCounter)
            
            return d.corruptionCheckForControlSignal(controlSignal)
        }
        else if(((<any>iRoot.tree).leftChild!=undefined)){
            let d: CompleteTreeTwoOperandOperatorNode = new CompleteTreeTwoOperandOperatorNode((<any>iRoot.tree).type, castJSONtoType((<any>iRoot.tree).leftChild), castJSONtoType((<any>iRoot.tree).rightChild), iRoot.tree.bracketCounter)
           
            return d.corruptionCheckForControlSignal(controlSignal)
        }
    }

    /**
     * Auswertung des Ausdrucks anhand der vollstaendigen Belegung aller Variablen
     * @param variableAssignment Belegung aller Variablen, anhand derer der Ausdruck ausgewertet werden soll
     * @returns logische Belegung des Ausdrucks nach Auswertung 
     */
    static evaluate(iRoot: ICompleteTreeRoot, variableAssignment: DerivedSystemAssignment): boolean {
        return iRoot.tree.evaluate(variableAssignment)
    }

    /**
     * Extrahieret die Liste aller Variablen, die in diesem logischen Ausdruck verwendet werden
     * @returns unsortiert Liste aller im Ausdruck verwendeten Variablen (liegt nur eine Konstante vor, so ist die Liste leer)
     */
    static extractAllIncludedVariables(iRoot: ICompleteTreeRoot): Array<SignalTreeRepresentation> {
        return iRoot.tree.extractAllIncludedVariables()
    }

    /**Setze alle Klammerzaehler im ganzen Baum zu 0 sodass dieser nur noch mit den noetigsten Klammern ausgelsen wird */
    static resetTreeBrackets(iRoot:ICompleteTreeRoot): void {
        iRoot.tree.resetTreeBrackets() //entferne alle unnoetigen Kanten des Kindes 
        //Da die Knoten eines Logikbaumes nicht immerable sind, müssen die Aenderungen eigentlich immutable auf dem Baum ausgefuehrt werden
        //Trick: entferne die Klammern mutable auf dem aktuellen Baum und erstelle eine anschliessend eine Kopie vom Ergebnis
        //(dieses Workaround ist trotz der Ineffizienz des Kopierens ein kleineres Uebel als die Konsequenzen, die eine Umsetzung der Baumknoten ohne Klassen mit sich bringen wuerde)
        // Die Operation wird nur sehr selten genutzt
        iRoot.tree = cloneDeep(iRoot.tree)
    }

    /**
     * Minimiere den Ausdruck (inplace) unter Zuhilfenahme der Dont-Care-Belegung 
     * @param inputDontCareExpression Dont-Care-Ausdruck fuer die Eingangsbelegung als Logikbaum (bei Nichtangabe zu logisch 0 gesetzt --> Minimierung ohne hStern)
     */
    static minimize(iRoot:ICompleteTreeRoot,inputDontCareExpression?: ICompleteTreeRoot): ICompleteTreeRoot {
        let minimizedExpressions:ICompleteTreeRoot
        if (typeof inputDontCareExpression != 'undefined') {
            //Es wurde ein Dont-Care-Ausdruck angegeben --> minimiere mit ihm
            minimizedExpressions = {tree: minimizeLogicTree(iRoot.tree,inputDontCareExpression.tree)}
        }
        else {
            //Es wurde kein Dont-Care-Ausdruck angegeben --> minimiere ohne ihn
            minimizedExpressions = {tree:minimizeLogicTree(iRoot.tree)}
        }
        return minimizedExpressions

    }

     /**  Asulesen aller Steuervariablen aus dem Ausdruck*/
    static extractAllIncludedControlSignals(iRoot:ICompleteTreeRoot):Array<InternalIndependentControlSignal>{
        return iRoot.tree.extractAllIncludedControlSignals()
    }
    
    /**  Asulesen aller ZVariablen aus dem Ausdruck*/
    static extractAllIncludedZVariables(iRoot:ICompleteTreeRoot):Array<ZVariable>{
        return iRoot.tree.extractAllIncludedZVariables()
    }


    /**
     * Auswertung des Ausdrucks nur Anhand der Eingangsbelegung
     * Alle eventuell enthaltenen Steuersignale werden fuer die Auswertung zu logisch 0 gesetzt
     * @param variableAssignment Belegung fuer die der Ausdruck ausgewertet werden soll
     * @returns logische Belegung des Ausdrucks nach Auswertung  
     */
    static evaluateWithoutCS(iRoot:ICompleteTreeRoot,variableAssignment: BaseSystemAssignment): boolean {
        //werte den angehangenen Baum aus
        return iRoot.tree.evaluateWithoutCS(variableAssignment)
    }
    static containsControlSignals(iRoot:ICompleteTreeRoot): boolean {
        //Pruefe den anhaengenden Baum
        return iRoot.tree.containsControlSignals()
    }

    static containsZVariables(iRoot:ICompleteTreeRoot): boolean {
        //Pruefe den anhaengenden Baum
        return iRoot.tree.containsZVariables()
    }

    /**
     * Pruefe ob der Baum eine Verkettung von Konstanten, deren Auswertung logisch 0 ist darstellt (auch eine einzelne 0 gehoert dazu)
     * !!! Der Ausdruck wird hierbei nicht minimiert --> der Aufruf auf dem Baum /x0&x0 waere also FALSE !!!
     * @returns ist dies die Wurzel eines Baumes, der nur aus Konstanten besteht und dessen Auswertung logisch 0 ist?
     */
    static isConstantZeroConcationation(iRoot:ICompleteTreeRoot): boolean {
        //Eine solche Verkettung darf keine Variablen beinhalten und muss zu logisch 0 ausgewertet werden
        //--> wenn keine Variablen enthalten sind kann der Ausdruck ohne Fehler anhand einer leeren Belegung ausgewertet werden
        return (CompleteTreeRoot.isConstantConcationation(iRoot) && !CompleteTreeRoot.evaluate(iRoot,new DerivedSystemAssignment([], [], [])))
    }

    /**
     * Pruefe ob der Baum eine Verkettung von Konstanten, deren Auswertung logisch 1 ist darstellt (auch eine einzelne 1 gehoert dazu)
     * !!! Der Ausdruck wird hierbei nicht minimiert --> der Aufruf auf dem Baum /x0+x0 waere also FALSE !!!
     * @returns ist dies die Wurzel eines Baumes, der nur aus Konstanten besteht und dessen Auswertung logisch 1 ist?
     */
    static isConstantOneConcationation(iRoot:ICompleteTreeRoot): boolean {
        //Eine solche Verkettung darf keine Variablen beinhalten und muss zu logisch 1 ausgewertet werden
        //--> wenn keine Variablen enthalten sind kann der Ausdruck ohne Fehler anhand einer leeren Belegung ausgewertet werden

        return (CompleteTreeRoot.isConstantConcationation(iRoot) && CompleteTreeRoot.evaluate(iRoot,new DerivedSystemAssignment([], [], [])))
    }

    /**
     * Pruefe ob der Baum eine reine logische Konstante ist (keine Verkettung von Konstanten und keine Operatoren (z.B. /0 ) erlaubt) 
     * @param typeToCheck Konstantentyp auf den geprueft werden soll
     * @returns ist dieser Baum eine reine Konstante vom angegebenen Typ? 
     */
    static isConstant(iRoot:ICompleteTreeRoot,typeToCheck: ConstantType): boolean {
        //Ist der angehangene Baum eine reine logische Konstante ? 
        let match = false
        //preufe ob eine Konstante vorliegt und ob diese vom angegebenen Typ ist
        if (iRoot.tree instanceof CompleteTreeConstantNode && iRoot.tree.getType() === typeToCheck) {
            match = true
        }
        return match
    }


    /**
    * Pruefe ob der Baum eine Verkettung von Konstanten ist
    * @returns ist dies die Wurzel eines Baumes, der nur aus Konstanten besteht?
    */
    static isConstantConcationation(iRoot:ICompleteTreeRoot): boolean {
        let result = false
        //Eine solche Verkettung darf keine Variablen beinhalten
        if (CompleteTreeRoot.extractAllIncludedVariables(iRoot).length === 0) {
            result = true
        }
        return result
    }

}