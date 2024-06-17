import { InternalIndependentControlSignal } from '../ControlSignal';
import { OperatorEnum, Operators } from '../Operators';
import { GrammarParser } from './GrammarParser';
import { CustomNames } from './CustomNames';
import { IToken } from 'ebnf';
import { CompleteTreeTwoOperandOperatorNode, CompleteTreeOneOperandOperatorNode } from './LogicTrees/Operators';
import { BaseCompleteTreeNode, ConstantType } from './LogicTrees/TreeNodeInterfaces';
import { CompleteTreeConstantNode } from './LogicTrees/Variables';
import { ExternRepresentation } from '../Signal';
import { ZVariable } from '../ZVariable';
import { ICompleteTreeRoot } from './LogicTrees/TreeRoots';
import { ExpressionErrorTupel } from '../ErrorElements';
import { ExpressionSyntaxError, UnknownVariableInExpressionError , OutputVariableInExpressionError } from '../Error';


/**
 * Einlesen eines logischen Ausdrucks aus einem String 
 * Eventuell beim Parsen aufgetretene Fehler werden ebenfalls im Ausgabetupel gespeichert
 * Ist der eingegebene Ausdruck ungueltig (beim Parsen ensteht ein Fehler) so wird der aufgetretene Fehler im Ausgabetupel abgelegt und es wird der 
 * Backup-Ausdruck verwendet 
 * @param assignedZAutomatonId diesem Automaten werden alle eventuell vorkommenden z-Variablen fuer das Auslesen zugeordnet 
 *                               bei Nichtangabe muessen alle enthaltenen zVariablen mit ihrem Automatennamen als Prefix angeegben werden
 *      (dies vermeidet, dass jede zVariable ueber "automat.zVariable" eingegeben werden muss, obwohl innerhalb eines Ausdrucks nur zVariablen eines Automaten auftreten sollten)
 * @param logicEquation logischer Ausdruck als String
 * @param customNames alle Variablen und deren nutzerdefinierten Namen die im Asudruck erkannt werden sollen(nur diese werden beim Parsen erkannt)
 * @param backupTree Ausdruck, der im Ergebnis verwendet werden soll falls der einzulesende Ausdruck einen Fehler beim parsen erzeugt hat
 * @returns Tupel aus dem eingelesenen Ausdruck und einem eventuell aufgetretenen Fehler (im Fehlerfall wird der backup-Ausdruck als gueltiger Ausdruck verwendet)
 */
export function binaryStringToTreeErrorTupel(logicEquation: string, backupTree: ICompleteTreeRoot, customNames: CustomNames, assignedZAutomatonId?: number): ExpressionErrorTupel<ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError> {

    //Erstelle eine Ablage fuer das Ergebnis --> verwende alle Fehlertypen, die beim Parsen auftreten koennen als generischen Typ
    //initial: kein Fehler und der Backupausdruck als valider Ausdruck 
    let result: ExpressionErrorTupel<ExpressionSyntaxError | UnknownVariableInExpressionError | OutputVariableInExpressionError> = { validExpression: backupTree, error: undefined }
    //Versuche den Ausdruck einzulesen

    try {
        result.validExpression = binaryStringToGeneralTree(logicEquation, customNames, assignedZAutomatonId) //Ergebnis des Einlesens speichern (falls kein Fehler auftritt)
        //In diesem Fall bleibt der Fehler im Ergbnis undefined, da kein Fehler aufgetreten ist

    }
    catch (e) {   
        //Es ist ein Fehler beim Einlesen aufgetreten --> speichere ihn im Ergebnistupel (der Backupausdruck, der initial verwendet wurde bleibt bestehen)
        if (e instanceof ExpressionSyntaxError || e instanceof UnknownVariableInExpressionError || e instanceof OutputVariableInExpressionError) { //alle Fehler die beim Parsen auftreten koennen
            result.error = e //Fehler abspeichern
        }
    }

    //Ausgabe des Tuepls 
    return result
}



/**
 * Schnittstelle zum Erstellen der internen Baumdarstellung eines logischen Ausdrucks aus einem String
 * Es wird erwartet, dass Steuersignale aller Automaten mit "Automatennamen.Variblennamen" bezeichnet werden
 * Der resultierende Baum kann aus Eingaengen, Steuersignalen und z-Variablen besethen
 * --> Eventuell vorkommende Ausgaenge fuehren zu Fehlern (besitzen sie den gleichen Namen wie ein Eingang, so wird das Vorkommen als Eingang erkannt)
 * @param assignedZAutomatonId diesem Automaten werden alle eventuell vorkommenden z-Variablen fuer das Auslesen zugeordnet 
 *                               bei Nichtangabe muessen alle enthaltenen zVariablen mit ihrem Automatennamen als Prefix angeegben werden
 *      (dies vermeidet, dass jede zVariable ueber "automat.zVariable" eingegeben werden muss, obwohl innerhalb eines Ausdrucks nur zVariablen eines Automaten auftreten sollten)
 * @param logicEquation logischer Ausdruck als String
 * @param customNames alle Variablen und deren nutzerdefinierten Namen die im Asudruck erkannt werden sollen(nur diese werden beim Parsen erkannt)
 * @throws {@link ExpressionSyntaxError} falls der eingegebene Ausdrukc nicht geparst werden konnte, da er syntaktisch fehlerhaft war
 * @throws {@link UnknownVariableInExpressionError} falls der Ausdruck eine Variable beinhaltet, die nicht im System existiert
 * @throws {@link OutputVariableInExpressionError} falls der Ausdruck eine Ausgangsvariable beinhaltet (ist in Ausdruecken nicht erlaubt)
 * @returns logischer Ausdruck als allgemeiner Baum
 */
export function binaryStringToGeneralTree(logicEquation: string, customNames: CustomNames, assignedZAutomatonId?: number): ICompleteTreeRoot {

    //erstelle einen Parser fuer den aktuellen Operator- und Variablensatz
    //var grammarParser = new GrammarParser(operators)
    //erzeugen den AST aus dem String
    //var astRoot = grammarParser.parseStringToAst(logicEquation);

    //Erstellle einen neuen Parser mit den aktuelle Operatoren
    var grammarParser = new GrammarParser(customNames.operators)
    // console.log(grammarParser)

    //Parse den String der Gleichung zu einem Baum (Formatierung noch anzupassen)
    let parsedAST: IToken = grammarParser.parseStringToAst(logicEquation)


    //ueberpurefe ob beim Parsen syntaktische Fehler aufgetreten sind --> wenn ja ist die Error-Liste in der Wurzel nicht leer (der Fehler der gepeichert werden soll liegt an Platz 0)
    if (parsedAST.errors[0] !== undefined) {
        //der Ausdruck enthierlt Syntaxfehler und ist damit ungeultig --> wirf einen Syntaxfehler
        let startIndex = parsedAST.errors[0].token.end //Startindex des ersten falschen Zeichens ist der Endindex des gueltigen Ausdrucks
        let errorLength = parsedAST.errors[0].token.rest.length //Lanege des fehlerhaften Teilausdrucks aus dem "Rest" (fehlerhafter Teilausdruck der nicht geparst werden konnte) ablesen
        let message = parsedAST.errors[0].message //Nachricht des Fehlers
        
        throw new ExpressionSyntaxError(logicEquation, startIndex, errorLength,message)
    }


    //Transformiere den Baum auf die interne Baumdarstellung --> initalisiere den Klammerzaehler zu 0
    let transformedAST = transformAST(parsedAST, customNames, 0, assignedZAutomatonId)
    return { tree: transformedAST }
}

/**
 * Umwandlung eines Knotens aus dem EBNF Parser in einen internen Logikbaum (kann aus Eingaengen, Steuersignalen und z-Variablen besethen)
 * Eventuell vorkommende Ausgaenge fuehren zu Fehlern (besitzen sie den gleichen Namen wie ein Eingang, so wird das Vorkommen als Eingang erkannt)
 * @param parsedAST umzuwandelnder Knoten aus dem EBNF Parser
 * @param customNames alle aktuell im System bekannten Variablen und deren nutzerdefinierten Namen (nur diese werden beim Parsen erkannt)
 * @param bracketCounter Anzahl an aktuell noch offenen Klammern in der Rekursion
 * @param assignedZAutomatonId diesem Automaten werden alle eventuell vorkommenden z-Variablen fuer das Auslesen zugeordnet 
 *                               bei Nichtangabe werden keine zVariablen innerhalb des Ausdrucks erkannt
 *      (dies vermeidet, dass jede zVariable ueber "automat.zVariable" eingegeben werden muss, obwohl innerhalb eines Ausdrucks nur zVariablen eines Automaten auftreten sollten)
 * @throws {@link UnknownVariableInExpressionError} falls der Ausdruck eine Variable beinhaltet, die nicht im System existiert
 * @throws {@link OutputVariableInExpressionError} falls der Ausdruck eine Ausgangsvariable beinhaltet (ist in Ausdruecken nicht erlaubt)
 */
function transformAST(parsedAST: IToken, customNames: CustomNames, bracketCounter: number, assignedZAutomatonId?: number): BaseCompleteTreeNode {
    //Variable fuer den Baum, der entsteht wenn der uebergebene Knoten transformiert wird
    let transformedAST: BaseCompleteTreeNode

    //welcher Regeltyp liegt vor ?
    switch (parsedAST.type) {
        case Nonterminal.Or: {
            //Oderblock --> hat immer mindestens ein Kind
            //wie viele Klammern werden diesem Operator potentiell zugeordnet (wenn er mehr als ein Kind hat)
            let ownBrackets = 0
            if (parsedAST.children.length !== 1) {
                //der Knoten hat mehr als ein Kind --> er wird zu einem logischen Operatorbaum 
                //ihm wird der aktuelle Klammerzaehler als Anzahl an Klammern zugeordnet
                ownBrackets = bracketCounter
                //setze den Klammerzaehler fuer alle tieferen Teilausdruecke zu 0
                bracketCounter = 0
            }
            //der knoten hat immer mindestens ein Kind --> erstelle den Baum fuer das erste Kind
            transformedAST = transformAST(parsedAST.children[0], customNames, bracketCounter, assignedZAutomatonId)

            if (parsedAST.children.length !== 1) {
                //es muessen alle weiteren Kinder des Knotens als Operanden mit oder vernkuepft werden --> laufe uber alle Kinder nach dem ersten
                for (let operandCounter = 1; operandCounter < parsedAST.children.length; operandCounter++) {
                    //greife das aktuelle Kind
                    let currentChild = parsedAST.children[operandCounter]
                    //lege das aktuelle Kind als Baum an
                    let currentChildTree = transformAST(currentChild, customNames, bracketCounter, assignedZAutomatonId)
                    //verknuepfe den vorherigen Baum des Operators mit dem neuen Operanden (erstelle hierbei den speziellstmoeglichen Operatortypen)
                    //falls keine Seteuersignale vorliegen soll eine evetnuelle Transformation des Baumes zu einem Baum ohne steuersignale starkt beschleunigt werden
                    transformedAST = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.OrOperator, transformedAST, currentChildTree, bracketCounter)
                }
                //oder kann keinen anderen Operatoren Klammern abnehmen
                //alle Klammern dem letzen Operator zuordnen
                transformedAST.setBracketCounter(ownBrackets)
            }

            break;
        }

        case Nonterminal.And: {
            //Undblock --> hat immer mindestens ein Kind
            //wie viele Klammern werden diesem Operator potentiell zugeordnet (wenn er mehr als ein Kind hat)
            let ownBrackets = 0
            if (parsedAST.children.length !== 1) {
                //der Knoten hat mehr als ein Kind --> er wird zu einem logischen Operatorbaum 
                //ihm wird der aktuelle Klammerzaehler als Anzahl an Klammern zugeordnet
                ownBrackets = bracketCounter
                //setze den Klammerzaehler fuer alle tieferen Teilausdruecke zu 0
                bracketCounter = 0
            }
            //der knoten hat immer mindestens ein Kind --> erstelle den Baum fuer das erste Kind
            transformedAST = transformAST(parsedAST.children[0], customNames, bracketCounter, assignedZAutomatonId)
            if (parsedAST.children.length !== 1) {
                //es muessen alle weiteren Kinder des Knotens als Operanden mit und vernkuepft werden --> laufe uber alle Kinder nach dem ersten (muss mindestens ein mal laufen)
                for (let operandCounter = 1; operandCounter < parsedAST.children.length; operandCounter++) {

                    //greife das aktuelle Kind
                    let currentChild = parsedAST.children[operandCounter]
                    //lege das aktuelle Kind als Baum an
                    let currentChildTree = transformAST(currentChild, customNames, bracketCounter, assignedZAutomatonId)

                    //verknuepfe den vorherigen Baum des Operators mit dem neuen Operanden (nutze hierbei den speziellstmoeglichen Operatortypen)
                    //falls keine Seteuersignale vorliegen soll eine evetnuelle Transformation des Baumes zu einem Baum ohne steuersignale starkt beschleunigt werden
                    transformedAST = new CompleteTreeTwoOperandOperatorNode(OperatorEnum.AndOperator, transformedAST, currentChildTree, bracketCounter)

                }
                //alle Klammern dem letzen Operator zuordnen
                transformedAST.setBracketCounter(ownBrackets)
            }

            break;
        }

        case Nonterminal.Term: {
            //Es liegt eine Konstante, Negation, eine Variable oder ein Klammerausdruck vor
            // der Baum hat genau ein Kind --> transformiere dieses und gib den Klammerzaehler weiter
            transformedAST = transformAST(parsedAST.children[0], customNames, bracketCounter, assignedZAutomatonId)

            break;
        }

        case Nonterminal.Constant: {
            //Es liegt eine Konstante vor --> diese hat keine Kinder sondern nur einen Text als Eintrag
            //Variable fuer die Konstante --> ihr werden alle aktuellen Klammern zugeordnet 
            //welche Konstante liegt vor?
            if (parsedAST.text === customNames.operators.defaultLogicOne) {
                //1 als Konstante
                transformedAST = new CompleteTreeConstantNode(ConstantType.ConstantOne, bracketCounter)
            }
            else {
                //0 als Konstante
                transformedAST = new CompleteTreeConstantNode(ConstantType.ConstantZero, bracketCounter)
            }
            transformedAST.setBracketCounter(bracketCounter)
            break;
        }

        case Nonterminal.Neg: {
            //Es liegt ein Negationsterm vor --> der Knoten hat genau ein Kind
            //loese das Kind auf   
            //die Negation bindet alle vorherigen, noch nicht zugeordneten Klammern an sich --> 0 Klammern fuer die Auswertung des Kindes
            let childTree = transformAST(parsedAST.children[0], customNames, 0, assignedZAutomatonId)
            //Erzeuge eine Negation des Kindes (erzeuge den speziellstmoeglichen Operatortypen)
            let NotOperator = new CompleteTreeOneOperandOperatorNode(OperatorEnum.NotOperator, childTree, bracketCounter)

            transformedAST = NotOperator

            break;
        }

        case Nonterminal.Bracket: {
            //es liegt ein Klammerblock vor --> hat immer genau ein Kind
            //inkrementiere die Anzahl an oeffnenden Klammern
            bracketCounter = bracketCounter + 1
            transformedAST = transformAST(parsedAST.children[0], customNames, bracketCounter, assignedZAutomatonId)

            break;

        }


        case Nonterminal.Variable: {
            //Es liegt eine Variable vor --> pruefe ob diese im System existiert (dafuer muessen die nutzerdefinierten Namen uebereinstimmen)
            //Ist es eine Eingangsvariable --> vergleiche sie mit den existierenden Eingaengen
            //entferne alle moeglichen Leerzeichen fuer den Test
            let customName = parsedAST.text.replace(/\s+/g, '')
            let inputs = customNames.inputs
            let matchIndex = getSignalIndexFromCustomString(inputs, customName, customNames)
            //existiert die Variable, so ist der Index >-1
            if (matchIndex > -1) {
                //Es liegt ein Eingang vor
                transformedAST = inputs[matchIndex].variable.createCompleteTreeNode(bracketCounter)
            }
            else {
                //Es liegt kein Eingang vor --> pruefe die z-Variablen
                let searchedZName = customName
                matchIndex = getZIndexFromCustomString(searchedZName, customNames, assignedZAutomatonId)                
                
                if (matchIndex > -1) {
                    //Es liegt eine z-Variable vor
                    transformedAST = customNames.zVariables[matchIndex].createCompleteTreeNode(bracketCounter)
                }
                else {
                    //Es liegt keine z-Variable vor --> pruefe auf ein Steuersignal
                    let controlSignals = customNames.controlSignals
                    matchIndex = getSignalIndexFromCustomString(controlSignals, customName, customNames)
                    if (matchIndex > -1) {
                        //es liegt ein Steuersignal vor
                        transformedAST = controlSignals[matchIndex].variable.createCompleteTreeNode(bracketCounter)
                    }
                    else {
                        //An dieser Stelle liegt auf jeden Fall eine Variable vor, die nicht in Ausdruecken auftreten darf (Variable existiert nicht oder ist ein Ausgang)
                        //--> wirf einen Fehler 
                        //ggf. liegt noch eine Ausgangsvariable vor, die jedoch innerhalb keines Ausdrucks ims System erlaubt ist 
                        // falls diese den gleichen Namen wie ein Eingang hat, so wurde sie bereits als Eingang erkannt

                        //suche den urspruenglichen WurzelKnoten der Rekursion, da in diesem der Gesamtausdruck gespeichert ist, der dem Fehler uebergeben werden soll
                        let tempRoot: IToken = parsedAST //beginne mit dem aktuellen Knoten und suche jeweils den Vater
                        while(tempRoot.parent !== null){ //Knoten ist noch nicht die Wurzel des Baums da er noch einen Vater hat
                            tempRoot = tempRoot.parent //setze die Suche auf dem Vater fort
                        } //tempRoot ist jetzt der Wurzelknoten des ganzen Ausdrucks
                        let invalidExpression = tempRoot.text //Fehlerhafter Ausdruck (haengt an der Wurzel)
                        //aktueller Knoten ist der Knoten des Fehlers --> bestimme die Indize im String
                        let startIndex = parsedAST.start //Index des ersten Zeichens der fehlerhaften Variablen
                        let length = parsedAST.text.length //Laenge des Fehlers

                        let outputs = customNames.outputs
                        matchIndex = getSignalIndexFromCustomString(outputs, customName, customNames)
                        //Art des Fehlers bestimmen und ihn werfen
                        if (matchIndex > -1) {
                            //Es lag ein Ausgang vor --> dieser ist jedoch innerhalb aller Ausdruecke verboten --> Fehler
                            throw new OutputVariableInExpressionError(invalidExpression,startIndex , length)
                            
                        }
                        else {
                            // es liegt keine Variable aus dem System vor --> Fehler einer unbekannten Variablen
                            throw new UnknownVariableInExpressionError(invalidExpression , startIndex , length)
                        }

                    }
                }
            }
            break;
        }

        default: {
            // es liegt eine unbekannnte Regel vor --> Fehler  (kann nur auftreten , wenn die Grammatik geandert wird ohne diese Methode anzupassen)
            throw new Error("unknown rule")
        }
    }
    return transformedAST

}


/**
 * Enumeration fuer alle Nichtterminale der verwendeten Grammatik
 */
const enum Nonterminal {
    Or = "or",
    And = "and",
    Neg = "neg",
    Term = "term",
    Bracket = "bracket",
    Variable = "var",
    Constant = "const"
}


/**
 Suche eines Signals bei bekanntem vollen innerhalb der Signalliste (hierbei werden Steuersignale mit "Automatenname.Variablenname" bennant )
 * @param signalList Signalliste in der gesucht werden soll
 * @param customString nutzerdefinierter Name des gesuchten Signals (hierbei werden Steuersignale mit "Automatenname.Variablenname" bennant )
 * @returns Index des gesuchten Signals innerhalb der Signalliste (-1 falls nicht gefunden)
 */
function getSignalIndexFromCustomString(signalList: Array<ExternRepresentation>, customString: string, customNames: CustomNames): number {
    return signalList.findIndex(signal => signal.variable.toCustomString(customNames).toLocaleLowerCase() === customString.toLocaleLowerCase())
}



/**
 Suche einer zVariablen bei bekanntem vollen innerhalb der Signalliste 
 * @param customZString EingabeString (wird  eine Id eines Automaten angegeben, so muss die Variable nicht mit automatoXY.zYZ benannt werden, sondern kann ohne die
    Vorsilbe des Automaten verwendet werden , falls keine Id angegeben wird, so wird fuer den String die Automatenvorsilbe erwartet)
 * @param customNames alle Namen des Systems
 * @returns Index des gesuchten Signals innerhalb der Signalliste (-1 falls nicht gefunden)
 */
function getZIndexFromCustomString(customZString: string, customNames: CustomNames, assignedZAutomatonId?: number): number {
    //ist ein Automat spezifiziert, dem die Variable zugeordent werden soll (Wenn ja wird keine Vorsilbe erwartet)
    let resultIndex: number
    if (assignedZAutomatonId !== undefined) {
        //keine Automatenvorsilbe erwartet --> es kommen nur die Variablen dieses Automaten in Frage
        let possibleZVariables = customNames.zVariables.filter(variable => variable.getAuomatonId() === assignedZAutomatonId)
        // console.log(possibleZVariables)
        resultIndex = possibleZVariables.findIndex(zVariable => zVariable.toCustomString().toLocaleLowerCase() === customZString.toLocaleLowerCase())
    }
    else {
        //Variable mit Vorsilbe des Automaten
        resultIndex = customNames.zVariables.findIndex(zVariable => zVariable.toAutomatonPrefixCustomString(customNames).toLocaleLowerCase() === customZString.toLocaleLowerCase())
    }
    return resultIndex
}
