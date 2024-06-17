import { VariableTyp } from "./BooleanEquations/LogicTrees/TreeNodeInterfaces";

// '/**
//  * This a wrapper for JavaScript's default
//  * [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
//  * class, as the interpreter breaks the inheritance chain by replacing the prototype of the object.
//  * The broken chain produces incorrectly interpreted statements with
//  * [instanceof](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/instanceof).
//  * By inheriting from this class, the inheritance chain is restored in the constructor without
//  * any need for further boilerplate code.
//  *
//  * @see [TypeScript Breaking Changes](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work)
//  */
// class BaseError extends Error {
//   // public __proto__: Error;
//   constructor(message?: string) {
//     // const trueProto = new.target.prototype;
//     super(message);
//     // this.__proto__ = trueProto;
//     // if (Object.setPrototypeOf) {
//     //   Object.setPrototypeOf(this, BaseError.prototype);
//     // }
//   }
// }'


/**
 * Basisiklasse fuer alle Fehler
 */
 class BaseError extends Error {
  constructor(message?: string) {
    super(message);
  }
}


/** Abstrakte Klasse zur Darstellung aller Fehler, die bei der Bennennung von Elementen auftreten koennen */
export abstract class NameError extends BaseError {
  /** fehlerbehafteter Name */
  public invalidName: string

  /**
   * Erstelle einen Fehler fuer einen falschen Namen
   * @param invalidName fehlerbehafteter Name
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidName: string, message?: string) {
    super(message ?? `The name '${invalidName}' is invalid.`)
    this.invalidName = invalidName;
  }
}

/** Klasse zur Darstellung aller Fehler, die bei der Nummerierung von Elementen auftreten koennen */
export class NumberError extends BaseError {
  /** fehlerbehaftete Nummer */
  public invalidNumber: number

  /**
   * Erstelle einen Fehler fuer eine falsche Nummer
   * @param invalidNumber fehlerbehaftete Nummer
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidNumber: number, message?: string) {
    super(message ?? `The number '${invalidNumber}' is invalid.`)
    this.invalidNumber = invalidNumber;
  }
}

/** Klasse zur Darstellung des Fehlers, der auftritt, wenn ein Zahlenwert automatisch zurueckgesetzt wird */
export class NumberResetError extends BaseError {
  /** Nummer vor dem zuruecksetzen  */
  public resetNumber: number

  /**
   * Erstelle einen Fehler fuer eine zureuckgesetzte Nummer
   * @param resetNumber fehlerbehaftete Nummer
   * @param message Beschreibung des Fehlers
   */
  constructor(resetNumber: number, message?: string) {
    super(message ?? `The number '${resetNumber}' has been reset.`)
    this.resetNumber = resetNumber;
  }
}

/** Darstellung eines Fehlers fuer den Fall, dass ein gewaehlter Name nicht verfuegbar ist, da er bereits verwendet wird*/
export class DuplicateNameError extends NameError {

  /**
  * Erstelle einen Fehler fuer einen bereits vergebenen Namen
  * @param invalidName bereits vergebener Name
  * @param message Beschreibung des Fehlers
  */
  constructor(invalidName: string, message?: string) {
    super(invalidName, message ?? `The name '${invalidName}' is invalid because it is already taken.`)
  }
}

/** Darstellung eines Fehlers fuer den Fall, dass ein gewaehlter Name nicht die jeweiligen Syntaxanforderungen erfuellt */
export class NameSyntaxError extends NameError {

  /**
  * Erstelle einen Fehler fuer einen syntaktisch falschen Namen
  * @param invalidName fehlerhafter Name
  * @param message Beschreibung des Fehlers
  */
  constructor(invalidName: string, message?: string) {
    super(invalidName, message ?? `The name '${invalidName}' is invalid because it does not meet the syntax requirements.`)
  }
}

/** Abstrakte Klasse zum Zusammenfassen aller Fehler, die beim Umgang mit logischen Ausdruecken entstehen koennen */
export abstract class ExpressionError extends BaseError {
  /** ungueltiger Ausdruck, der zu diesem Fehler gefuehrt hat als String */
  invalidExpression: string
  /**
   * Erstelle einen Fehler, der beim Einlesen eines logischen Asudrucks entstanden ist
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, message?: string) {
    super(message ?? `The expression '${invalidExpression}' is invalid.`)
    this.invalidExpression = invalidExpression
  }
}


/** Abstrakte Klasse zum Zusammenfassen aller Fehler, die enstehen wenn ein logischer Ausdruck nicht den geforderten Semantikanforderungen der Umgebung genuegt */
export abstract class ExpressionSemanticError extends ExpressionError {

/** 
 * Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen und Steuersignale sein)
 * Bis auf Klein-und Grossschreibung entspeicht der Name der exakten Schreibweise im in {@link invalidExpression} gespeicherten Ausdruck
 */
  invalidVariables: Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal | VariableTyp.InputSignal>>

  /**
   * Erstelle einen Fehler, der entsteht wenn ein logischer Ausdruck nicht den geforderten Semantikanforderungen genuegt
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen und Steuersignale sein)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal | VariableTyp.InputSignal>>,message?: string) {
    super(invalidExpression, message ?? `The expression '${invalidExpression}' is invalid because it does not meet the semantic requirements.`)
    this.invalidVariables = invalidVariables
  }
}


/** Abstrakte Klasse zum Zusammenfassen aller Fehler, die beim Parsen eines logischen Ausdrucks entstehen koennen */
export abstract class ExpressionParserError extends ExpressionError {
  /** Position des Zeichens innerhalb des fehlerhaften Ausdrucks(String) ab dem der Fehler beginnt */
  startIndex: number

  /** Laenge des Fehlerbehafteten Ausschitts aus dem fehlerhaften Ausdruck als Stirng (Fehler startet ab Zeichen mit Index {@link startIndex} und ist so viel Zeichen lang) */
  length: number

  /**
   * Erstelle einen Fehler, der beim Parsen eines logischen Ausdrucks entstehen kann 
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param length Laenge des Fehlerbehafteten Ausschitts aus dem fehlerhaften Ausdruck als Stirng
   * @param startIndex Position des Zeichens innerhalb des fehlerhaften Ausdrucks(String) ab dem der Fehler beginnt
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, startIndex: number, length: number, message?: string) {
    super(invalidExpression, message ?? `The expression '${invalidExpression}' could not be parsed.`)
    this.startIndex = startIndex
    this.length = length
  }
}


/** Fehler der ensteht, wenn innerhalb eines zu parsenden Ausdrucks eine unbekannt Variable enthalten ist */
export class UnknownVariableInExpressionError extends ExpressionParserError {
  /**
   * Erstelle einen Fehler fuer eine unbekannte Variable beim Parsen
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param length Laenge des Fehlerbehafteten Ausschitts aus dem fehlerhaften Ausdruck als Stirng
   * @param startIndex Position des Zeichens innerhalb des fehlerhaften Ausdrucks(String) ab dem der Fehler beginnt
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, startIndex: number, length: number, message?: string) {
    super(invalidExpression, startIndex, length, message ?? `The expression '${invalidExpression}' could not be parsed because it contains an unknown variable.`)
  }
}

/** Fehler der ensteht, wenn innerhalb eines zu parsenden Ausdrucks eine Ausgangsvariable enthalten ist */
export class OutputVariableInExpressionError extends ExpressionParserError {
  /**
   * Erstelle einen Fehler fuer eine Ausgangsvariable beim Parsen
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param length Laenge des Fehlerbehafteten Ausschitts aus dem fehlerhaften Ausdruck als Stirng
   * @param startIndex Position des Zeichens innerhalb des fehlerhaften Ausdrucks(String) ab dem der Fehler beginnt
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, startIndex: number, length: number, message?: string) {
    super(invalidExpression, startIndex, length, message ?? `The expression '${invalidExpression}' could not be parsed because it contains an output-variable.`)
  }
}

/** Fehler der ensteht, wenn ein zu parsender Ausdruck syntaktisch fehlerhaft ist */
export class ExpressionSyntaxError extends ExpressionParserError {
  /**
   * Erstelle einen Fehler fuer Syntaxfehler in einem zu parsenden Ausdruck
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param length Laenge des Fehlerbehafteten Ausschitts aus dem fehlerhaften Ausdruck als Stirng
   * @param startIndex Position des Zeichens innerhalb des fehlerhaften Ausdrucks(String) ab dem der Fehler beginnt
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, startIndex: number, length: number, message?: string) {
    super(invalidExpression, startIndex, length, message ?? `The expression '${invalidExpression}' could not be parsed because it does not meet the syntax requirements.`)
  }
}

/** Fehler der ensteht, wenn der Ausdruck fuer h-Stern nicht nur eine Funktion der Eingange ist (er darf keine anderen Variablen enthalten)  */
export class HStarNotAFunctionOfxError extends ExpressionSemanticError {

  invalidVariables:Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal>> //z-Variablen und Steuersignale sind verboten

  /**
   * Erstelle einen Fehler der ensteht, wenn der Ausdruck fuer h-Stern nicht nur eine Funktion der Eingange ist (er darf keine anderen Variablen enthalten)
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen und Steuersignale sein)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal>>,message?: string) {
    super(invalidExpression,invalidVariables, message ?? `The expression '${invalidExpression}' can not be used for h-star because h-star must be a function of x only.`)
    this.invalidVariables = invalidVariables
  }
}




/** Fehler der ensteht, wenn ein Ausdruck fuer die Belegung eines Steuersignals verbotene Variablen enthealet (Steuersignale oder z-Variablen)*/
export class ControlSignalExpressionVariableError extends ExpressionSemanticError {

  invalidVariables: Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal>> //z-Variablen und Steuersignale sind verboten

  /**
   * Erstelle einen Fehler der ensteht, wenn ein Ausdruck fuer die Belegung eines Steuersignals verbotene Variablen enthealet (Steuersignale oder z-Variablen)
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen und Steuersignale sein)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.ControlSignal | VariableTyp.zSignal>>, message?: string) {
    super(invalidExpression, invalidVariables,message ?? `The expression '${invalidExpression}' can not be used as a controlsignal expression because it contains zVariables or controlsignals.`)
    this.invalidVariables = invalidVariables
  }
}

/** Fehler der ensteht, wenn ein Ausdruck fuer die Belegung einer Ausgangsvariablen verbotene Variablen enthealet (z-Variablen)*/
export class OutputSignalExpressionVariableError extends ExpressionSemanticError {

  invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal>> //z-Variablen sind verboten

  /**
   * Erstelle einen Fehler der ensteht,wenn ein Ausdruck fuer die Belegung einer Ausgangsvariablen verbotene Variablen enthealet (z-Variablen)
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen sein)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.zSignal>>, message?: string) {
    super(invalidExpression, invalidVariables,message ?? `The expression '${invalidExpression}' can not be used as an output expression because it contains zVariables.`)
    this.invalidVariables = invalidVariables
  }
}


/** Fehler der ensteht, wenn ein Ausdruck fuer die Bedingung einer Kante eine verbotene Variablen enthealet (z-Variablen)*/
export class TransitionExpressionVariableError extends ExpressionSemanticError {

  invalidVariables: Array<VariableTypeTupel<VariableTyp.zSignal>> //z-Variablen sind verboten

  /**
   * Erstelle einen Fehler der ensteht, wenn ein Ausdruck fuer die Bedingung einer Kante einer verbotene Variablen enthealet (z-Variablen)
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (koennen nur z-Variablen sein)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.zSignal>>, message?: string) {
    super(invalidExpression, invalidVariables,message ?? `The expression '${invalidExpression}' can not be used as a condition for a transition because it contains zVariables.`)
    this.invalidVariables = invalidVariables
  }
}

/** Fehler der ensteht, wenn ein Ausdruck innerhalb eines Automaten xy ein Steuersignal dieses Automaten enthaelt (Steuersignale eines Automaten duerfen nicht in ihm selbst verwendet werden)*/
export class OwnControlSignalsExpressionError extends ExpressionSemanticError {

  invalidVariables: Array<VariableTypeTupel<VariableTyp.ControlSignal>> //Steursignale des eigenen Automaten

  /**
   * Erstelle einen Fehler der ensteht, wenn ein Ausdruck innerhalb eines Automaten xy ein Steuersignal dieses Automaten enthaelt
   * @param invalidExpression fehlerhafter Ausdruck der den Fehler hervorgerufen hat
   * @param invalidVariables Liste aller Variablen, die im Ausdruck enthalten waren, aber hier nicht erlaubt sind (Steuersignale des eigenen Automaten)
   * @param message Beschreibung des Fehlers
   */
  constructor(invalidExpression: string, invalidVariables : Array<VariableTypeTupel<VariableTyp.ControlSignal>>, message?: string) {
    super(invalidExpression, invalidVariables,message ?? `The expression '${invalidExpression}' can not be used in this automaton because it contains the automatons own controlsignals.`)
    this.invalidVariables = invalidVariables
  }
}




/** Tupel aus dem nutzerdefinierten Namen einer Variablen (zum Zeitpunkt des Fehlers) und ihrem Typen */
export interface VariableTypeTupel<T> {
  /** nutzerdefinierter Name der Variablen der zum Zeitpunkt des Fehlers vergeben war (dieser Name ist im fehlerhaften Ausdruck enthalten)*/
  variableName: string

  /**Typ der Variablen */
  variableTyp: T
}