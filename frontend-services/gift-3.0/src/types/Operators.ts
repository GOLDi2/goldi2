import { immerable } from 'immer';
import { NameErrorTupel } from './ErrorElements';

export const DEFAULT_OR_OPERATOR = "+";
export const DEFAULT_AND_OPERATOR = "&";
export const DEFAULT_NOT_OPERATOR = "/";
export const DEFAULT_XOR_OPERATOR = "*";
export const DEFAULT_LOGIC_ONE = "1";
export const DEFAULT_LOGIC_ZERO = "0";

export interface Operators {

    //Liste der aller Operatorsymbole

    customOrOperator: NameErrorTupel;

    customAndOperator: NameErrorTupel;

    customNotOperator: NameErrorTupel;

    customExclusivOrOperator: NameErrorTupel

    // Liste der logischen Konstanten
    defaultLogicOne: string;

    defaultLogicZero: string;

}

/**
     * Erstellt einen neuen Operatorensatz mit den folgenden standardmaessigen Operatorsymbolen (die nutzerdefinierten werden bri Nichtangabe gleich initialisiert)
     * @param customAndOperator UND-Operator (bei Nichtangabe der Standardoperator)
     * @param customExclusivOrOperator ExOr-Operator (bei Nichtangabe der Standardoperator)
     * @param customOrOperator ODER-Operator (bei Nichtangabe der Standardoperator)
     * @param customtNotOperator NICHT-Operator (bei Nichtangabe der Standardoperator)
     */
export function createNewOperators(andOperator = DEFAULT_AND_OPERATOR, orOperator = DEFAULT_OR_OPERATOR, notOperator = DEFAULT_NOT_OPERATOR, exOrOperator = DEFAULT_XOR_OPERATOR): Operators {
    //bei Defaultwerten keine Fehler
    let customAndOperator = { validName: andOperator, error: undefined };
    let customOrOperator = { validName: orOperator, error: undefined };
    let customNotOperator = { validName: notOperator, error: undefined };
    let customExclusivOrOperator = { validName: exOrOperator, error: undefined }
    let defaultLogicOne = DEFAULT_LOGIC_ONE
    let defaultLogicZero = DEFAULT_LOGIC_ZERO

    return {customOrOperator:customOrOperator , customAndOperator:customAndOperator , customExclusivOrOperator: customExclusivOrOperator , customNotOperator:customNotOperator ,
    defaultLogicOne:defaultLogicOne , defaultLogicZero:defaultLogicZero }
}

/**
 * Enumeration fuer alle nutzbaren Operatortypen
 */
export const enum OperatorEnum {
    AndOperator = "AND_OPERATOR",
    OrOperator = "OR_OPERATOR",
    NotOperator = "NOT_OPERATOR",
    ExclusicOrOperator = "EXCLUSIVE_OR_OPERATOR"
}
/**
 * Alle Operatoren, die nur einen Operanden benoetigen
 */
export type OneOperandOperator = OperatorEnum.NotOperator;

/**
 * Alle Operatoren, die zwei Operanden benoetigen
 */
export type TwoOperandOperator = OperatorEnum.AndOperator | OperatorEnum.ExclusicOrOperator | OperatorEnum.OrOperator