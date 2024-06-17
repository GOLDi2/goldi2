import { lastIndexOf } from "lodash";
import { DEFAULT_AND_OPERATOR, DEFAULT_NOT_OPERATOR, DEFAULT_OR_OPERATOR, DEFAULT_XOR_OPERATOR, OneOperandOperator, OperatorEnum, TwoOperandOperator } from "../../Operators";
import { BaseInternAdressable, SignalTreeRepresentation } from "../../Signal";
import { CustomNames } from "../CustomNames";

import { Leaf, OneOperandOperatorNode, OperatorNode, TreeNode, treeRoot, TwoOperandOperatorNode } from "./GeneralTree";
import { CompleteTreeOneOperandOperatorNode, CompleteTreeTwoOperandOperatorNode } from "./Operators";
import { BaseCompleteTreeNode } from "./TreeNodeInterfaces";
import { ICompleteTreeRoot } from "./TreeRoots";
import { BaseCompleteVariableNode } from "./Variables";

export class PlaceholderTreeRoot implements treeRoot{

    tree:PlaceholderTreeNode
    /**
     * Ersetzen aller Platzhaltervariablen in diesem Baum anhand einer Liste von einzusetzenden Variablen
     * @param variableList Liste der Variablen, die in dieser Reihenfolgen den Platzhaltern zugeordnet werden soll (Eintrag 0 fuer alle Platzhalter 0 usw.)
     * @returns vollstaendigen logischen Baum der nach der Ersetzung der Platzhalter hervorgeht
     * @throwsnot "enough variables to replace all Placeholders" falls mehr verschieden Platzhalter im Baum enthalten sind als einzusetzende Variablen gegeben
     */
    replacePlaceholders(variableList:Array<SignalTreeRepresentation>):ICompleteTreeRoot{
        return {tree:this.tree.replacePlaceholders(variableList)}
    }
    toInternalString(){
        return this.tree.toInternalString()
    }
    getTree():PlaceholderTreeNode{
        return this.tree
    }
}

/**
 * Darstellung eines logischen Baums, der aus Platzhalter fuer Variablen besteht
 */
export interface PlaceholderTreeNode extends TreeNode{
    /**
     * Ersetzen aller Platzhaltervariablen in diesem Baum anhand einer Liste von einzusetzenden Variablen
     * @param variableList Liste der Variablen, die in dieser Reihenfolgen den Platzhaltern zugeordnet werden soll (Eintrag 0 fuer alle Platzhalter 0 usw.)
     * @returns vollstaendigen logischen Baum der nach der Ersetzung der Platzhalter hervorgeht
     * @throwsnot "enough variables to replace all Placeholders" falls mehr verschieden Platzhalter im Baum enthalten sind als einzusetzende Variablen gegeben
     */
    replacePlaceholders(variableList:Array<SignalTreeRepresentation>):BaseCompleteTreeNode
}


/**Interface fuer alle Operatoren, die Platzhalter verknuepfen */
export interface PlaceholderOperator extends PlaceholderTreeNode,OperatorNode{
     
}

/**
 * Darstellung von Operatoren die einen Operadnen vom Typ Platzhalterbaum verknuepfen
 */
export class PlaceholderOneOperandOperatorNode implements PlaceholderOperator,OneOperandOperatorNode{

    /** Welcher Operator (fuer einen Operanden) liegt vor ?*/
    private type: OneOperandOperator;

    /** Standardoperatorsymbol (nie geandert) */
    private operatorSymbol: string;

    /**
     * mit dem Operator verknuepfter Teilausdruck
     */
    public child:PlaceholderTreeNode


    /**
     * Erstelle einen neuen Operatoren der einen Platzhalterausdruck verknuepft
     * @param type Art des Operators 
     * @param child Teilausdruck der damit verknuepft wird 
     */
    constructor(type: OneOperandOperator, child: PlaceholderTreeNode) {
        this.type = type;
        //setze das richtige Operatorsymbol 
        switch (type) {
            case OperatorEnum.NotOperator: this.operatorSymbol = DEFAULT_NOT_OPERATOR; break;
        }
        this.child = child;
    }
    getType():OneOperandOperator{
        return this.type
    }
    getChild():PlaceholderTreeNode{
        return this.child
    }



    toInternalString():string{
        return ("(" + this.operatorSymbol + this.child.toInternalString() + ")")
    }


    replacePlaceholders(variableList:Array<SignalTreeRepresentation>):BaseCompleteTreeNode{
        //wandle sich selbst in entsprechendes vollstaendiges Aequivalent um und transformiere das Kind
        let transformedChild  = this.child.replacePlaceholders(variableList);
       
        return  new CompleteTreeOneOperandOperatorNode(this.type , transformedChild)
                
    }
    
}

/**
 * Darstellung von Operatoren die zwei Platzhalter miteinander verknuepfen
 */
export class PlaceholderTwoOperandOperatorNode implements PlaceholderOperator,TwoOperandOperatorNode{
     /** Welcher Operator (fuer 2 Operanden) liegt vor ?*/
     private type: TwoOperandOperator;

     /** Standardoperatorsymbol (nie geandert) */
     private operatorSymbol: string;
 
     /** linker Teilausdruck */
     leftChild: PlaceholderTreeNode ;
     /** rechter Teilaudruck */
     rightChild: PlaceholderTreeNode;


     /**
     * Erstellt einen Operator der zwei Platzhalterbaeume verknuepft
     * @param type Operatortyp fuer Verknuepfung von zwei Operanden
     * @param leftChild linke Teilausdruck
     * @param rightChild rechte Teilausdruck
     */
    constructor(type: TwoOperandOperator, leftChild: PlaceholderTreeNode, rightChild: PlaceholderTreeNode) {
        this.type = type;
        //setze das richtige Operatorsymbol 
        switch (type) {
            case OperatorEnum.AndOperator: this.operatorSymbol = DEFAULT_AND_OPERATOR; break;
            case OperatorEnum.ExclusicOrOperator: this.operatorSymbol = DEFAULT_XOR_OPERATOR; break;
            case OperatorEnum.OrOperator: this.operatorSymbol = DEFAULT_OR_OPERATOR; break;
        }

        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }
    getType():TwoOperandOperator{
        return this.type
    }
    getLeftChild():PlaceholderTreeNode{
        return this.leftChild
    }
    getRightChild():PlaceholderTreeNode{
        return this.rightChild
    }

    
     toInternalString(): string {
        //Ausgabe des linken Teilbaums, des Operators und des rechten Teilbaums (inorder)
        return ("(" + this.leftChild.toInternalString() + this.operatorSymbol + this.rightChild.toInternalString() + ")")
    }


    replacePlaceholders(variableList:Array<SignalTreeRepresentation>):BaseCompleteTreeNode{
        //wandle sich selbst in entsprechendes vollstaendiges Aequivalent um und transformiere beide Kinder

        let transformedLeftChild:BaseCompleteTreeNode  = this.leftChild.replacePlaceholders(variableList);
        let transformedRightChild:BaseCompleteTreeNode = this.rightChild.replacePlaceholders(variableList)

        //Setze Ergebnis aus eigener Transformation und Kindern zusammen 
            
        return new CompleteTreeTwoOperandOperatorNode(this.type , transformedLeftChild , transformedRightChild)
    }

}

/**
 * Darstellung eines Variablenplatzhalters (dieser ist ebenfalls voll intern adressierbar)
 */
export class VariablePlaceholder extends BaseInternAdressable implements Leaf,PlaceholderTreeNode{

    /**Nummer des Platzhalters (beginnend ab 0) --> anhand dieser wird der Platzhalter dann zu einer Variablen ersetzt */
    public number:number
    
    
    /**
     * Erstelle einen neuen Platzhalter
     * @param id Nummer des Platzhalters
     */
    constructor(id:number){
        super(id)
    }

    toInternalString():string{ return "placeholder."+this.getNumber()}

    getInternalName():string{
        return this.toInternalString()
    }
    getVariable():BaseInternAdressable{
        //der Knoten selbst ist die Variable
        return this
    }
    toCustomString():string{
        //nutzerdefinierte Name ist der interne Name
        return this.toInternalString()
    }


    replacePlaceholders(variableList:Array<SignalTreeRepresentation>):BaseCompleteTreeNode{
        //greife in die gegebene Liste an die Stelle der eingenen ID und ersetze dich zu dieser Variablen

        //sind genug Variablen gegeben um diesen Platzhalter zu ersetzen?
        if(this.getNumber() >= variableList.length){
            //Nein
            throw new Error("not enough variables to replace all Placeholders")
        }
        //Mit dieser Variablen wird der Platzhalter ersetzt
        let replacement = variableList[this.getNumber()];

        //um welchen VaribalenTyp handelt es sich? --> erstelle den zugehoerigen vollstaendigen Baum
            return replacement.createCompleteTreeNode();
        
    }

    matchesToInternalRepresentation(internalSignal:BaseInternAdressable):boolean{
        //fuer Uebereinstimmung muss ein Platzhalter mit gleicher nummer vorliegen
       return (internalSignal instanceof VariablePlaceholder && internalSignal.getNumber() === this.number)
    }
}
