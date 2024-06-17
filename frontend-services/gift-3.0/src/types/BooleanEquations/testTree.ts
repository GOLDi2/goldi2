
/*
//var leftExp:CompleteTreeNode = new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator,new CompleteTreeInputNode("x1"))

var leftExp:CompleteTreeNode = new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator,new CompleteTreeInputNode(0))
//var leftExp:CompleteTreeNode = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator,leftExp , (new CompleteTreeInputNode("x2")))


var rightExp = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator,new CompleteTreeInputNode(0) , (new CompleteTreeInputNode(2)))


export const generalTestTree= new CompleteTreeRoot(new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, leftExp , rightExp))


var noCSLeftExp = new NoCSOneOperandOperatorNode(OperatorEnum.NotOperator,new CompleteTreeInputNode(0))


var noCSRightExp = new NoCSTwoOperandOperatorNode(OperatorEnum.OrOperator,new CompleteTreeInputNode(1) , new CompleteTreeInputNode(2))



export const noCSTestTree:NoCSTree = new NoCSTwoOperandOperatorNode(OperatorEnum.OrOperator, noCSLeftExp , noCSRightExp)




export function printInternalTestTree(){
    console.log(generalTestTree.toInternalString());
}
export function minimizeTestTree(){
    console.log(generalTestTree.toInternalString())
    minimizeLogicTree(generalTestTree)
}
*/
/*
export function printCustomTestTree(operators:Operators,inputVariableList: Array<InternalInputAssignment> , controlSignals:Array<InternalIndependentControlSignal>){
    console.log(generalTestTree.toCustomString(new CustomNames(operators,inputVariableList, controlSignals)))
}
*/

import { minimizeTruthTable } from "./Minimizer/minimizeTree";
import { TruthTable } from "./Minimizer/TruthTable";

export function test123():void{
    // let test = new TruthTable(2 , 1)
    // test.setFunctionIndex(BigInt(8) , 0)
    // test.setDontCareFunctionIndex(BigInt(15))
    // let result = minimizeTruthTable(test)
    // console.log(result[0].toInternalString())

    
    let test = new TruthTable(2 , 0)
    test.setDontCareFunctionIndex(BigInt(15))
    let result = minimizeTruthTable(test)
    // console.log(result)
}

export function testHW():void{
    
}