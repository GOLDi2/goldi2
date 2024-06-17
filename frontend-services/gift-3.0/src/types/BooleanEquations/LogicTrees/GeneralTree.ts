import { OneOperandOperator, OperatorEnum, TwoOperandOperator } from "../../Operators";
import { BaseInternAdressable } from "../../Signal";

/**Darstellung eines Wurzelknotens eines Baums 
 * Diese werden als Vertreter des Baumes angesehen
*/
export interface treeRoot{

    /**Ausgabe des Baumes */
    getTree():TreeNode

    /**
     * Baum gibt sich als logischen Ausdruck als String mit den internen Bezeichnungen und Operatoren zurueck
     * @returns aktueller Baum als logischer Ausdruck mit internen Bezeichnungen der Variablen und Operatoren
     */
    toInternalString(): string

}

/**
 * Allgemeinste Darstellungsform eines logischen Baumes 
 * Kann Unvollstaendigkeiten in Form von Platzhalter beinhalten oder nicht
 */
export interface TreeNode{
    /**
     * Knoten gibt sich und alle seine Kinder als logischen Ausdruck als String mit den internen Bezeichnungen und Operatoren zurueck
     * @returns aktueller Baum als logischer Ausdruck mit internen Bezeichnungen der Variablen und Operatoren
     */
    toInternalString(): string
}

/**
 * Interface fuer alle Operatoren
 */
export interface OperatorNode extends TreeNode{

    /**Ausgabe des Operatortyps */
    getType():OperatorEnum
}

/**
 * Interface fuer alle Operatoren die nur einen Operanden Verknuepfen
 */
export interface OneOperandOperatorNode extends OperatorNode{
     /** Welcher Operator (fuer einen Operanden) liegt vor ?*/
     getType(): OneOperandOperator;
 
     /**
      * mit dem Operator verknuepfter Teilausdruck (muss Platzhalter beinhalten, da das Kind sonst als GeneralTree an einen vorherigen Operator angehangen werden muesste)
      */
     getChild():TreeNode
}

export interface TwoOperandOperatorNode extends OperatorNode{
   /** Welcher Operator (fuer 2 Operanden) liegt vor ?*/
   getType(): TwoOperandOperator;


   /** linken Teilausdruck ausgeben */
   getLeftChild(): TreeNode;
   /** rechten Teilaudruck ausgeben */
   getRightChild(): TreeNode;
}

/**
 * Interface fuer alle Blaetter (Variablen) eines logischen Baums (konstanten zaehlen nicht dazu)
 * koennen Platzhalter oder richtige Variablen sein
 */
export interface Leaf extends TreeNode{
    /**Ausgabe der internen Nummer der Variablen */
    getVariable():BaseInternAdressable
}