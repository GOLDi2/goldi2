import { mergeTwoLists } from "../../../actioncreator/helperfunctions";
import { InternalInput } from "../../Input";
import { OperatorEnum } from "../../Operators";
import { SignalTreeRepresentation } from "../../Signal";
import { PlaceholderOneOperandOperatorNode, PlaceholderTreeNode, PlaceholderTwoOperandOperatorNode, VariablePlaceholder } from "../LogicTrees/PlaceHolderTree";
import { BaseCompleteTreeNode, ConstantType } from "../LogicTrees/TreeNodeInterfaces";
import { ICompleteTreeRoot } from "../LogicTrees/TreeRoots";
import { CompleteTreeConstantNode } from "../LogicTrees/Variables";
import { CustomDerivedSystemAssignment, DerivedSystemAssignment } from "../SystemAssignment";
import { MINIMIZER } from "./Espresso/minimiser";
import { TruthTable } from "./TruthTable";


/**
 * Minimierung eines Logikbaums 
 * @param expression Auszuwertender Audruck als Logikbaum
 * @param inputDontCareExpression Logischer Ausdruck der Dont-Care-Belegung der Eingänge (h-Stern) als Logikbaum (bei Nichtangabe zu logisch 0 gesetzt --> Audruck wird ohne h-Stern minimiert)
 * @returns ueber die Dont-Care-Belegung minimierter Ausdruck als Logikbaum
 */
export function minimizeLogicTree(expression: BaseCompleteTreeNode , inputDontCareExpression:BaseCompleteTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantZero)): BaseCompleteTreeNode {
    let result: BaseCompleteTreeNode;
    //extrahiere alle Variablen, die im Ausdruck und im Dont-Care-Asudruck verwendet werden (Liste kann leer sein wenn eine Konstante vorliegt)
    let expressionVariableList = expression.extractAllIncludedVariables();
    let dontCareVariableList = inputDontCareExpression.extractAllIncludedVariables();
    // vereinige beide Listen ohne Dopplungen
    let variableList = mergeTwoLists(expressionVariableList , dontCareVariableList)

    //An Stelle 0 der Liste steht die Variable in der ersten Spalte der Wertetabelle (MSB), welche anschliessend den Platzhalter 0 ersetzt
    //Reihenfolge sollte nach dem Erstellen der Wertetabelle nicht mehr geandert werden, da die Variablen in dieser Reihenfolge fuer die Erstellung der Belegung genutzt werden
    // und anschliessend in dieser Reihenfolge die Platzhalter innerhalb der minimierten Ausdruecke ersetzen

    //anlegen einer neuen Wertetabelle fuer diese Variablen und einen Ausgang, die anschliessend inkrementell gefuellt wird
    let truthTable = new TruthTable(variableList.length, 1)

    //Werte den Ausdruck fuer jede der 2^(Variablenanzahl)-1  moeglichen Belegungen seiner Variablen aus und fuege es der Wertetabelle hinzu
    let maxIndex = Math.pow(2, variableList.length) - 1;
    for (let assignmentIndex = 0; assignmentIndex <= maxIndex; assignmentIndex++) {
        //Berechne die Belegung der Variablen fuer diesen Index (Variable 0 in der Liste koodiert das MSB der Belegung und damit die Spalte ganz links in der Wertetabelle)
        let systemAssignment = createVariableAssignmentFromIndex(variableList, assignmentIndex)

        // console.log("index " + assignmentIndex)
        //console.log(systemAssignment)


        //Werte den Ausdruck fuer diese Belegung aus
        let truthValue = expression.evaluate(systemAssignment)
        //Fuege diese Belegung (bzw. ihren Index) der Wertetabelle hinzu falls es eine logisch 1 war (fuer Ausgang 0)
        if (truthValue) {
            truthTable.setOutputOne(assignmentIndex, 0)
        }
        //wurde der Ausdruck zu logisch 0 ausgewertet --> nichts tun (Wertetabelle durch Lage der 1en voll bestimmt)

         //Werte den Dont-Care-Ausdruck fuer diese Belegung aus
         let dontCareTruthValue = inputDontCareExpression.evaluate(systemAssignment)
         //Fuege diese Belegung (bzw. ihren Index) der Wertetabelle in den Dont-Care-Werteverlauf hinzu falls es eine logisch 1 war (fuer Ausgang 0)
         if (dontCareTruthValue) {
             truthTable.setDontCareOne(assignmentIndex)
         }
         //wurde der Ausdruck zu logisch 0 ausgewertet --> nichts tun (Wertetabelle durch Lage der 1en voll bestimmt)

    }
    //Minimiere anhand der fertig aufgebauten Wertetabelle (das Resultat beinhaltet noch die Platzhalter der Minimierung)
    let placeholderTree = minimizeTruthTable(truthTable)

    //Ersetze alle Platzhalter (Array enthaelt nur ein Element, da es nur eine Ausgangsvariable gab)
    //Platzhalter 0 wird hierbei durch die Variable an Stelle 0 ersetzt (MSB der Wertetabelle)
    result = placeholderTree[0].replacePlaceholders(variableList)

    // console.log(result.toInternalString())
    return result

}

/**
 * Minimieren einer Wertetabelle zu einem Platzhalterbaum
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * Diese Schnittstelle muss intern angepasst werden falls ein anderer Minimierrer zum Einsatz kommen soll 
 * Nummerierung der Platzhaltervariablen MUSS nach folgendem Muster erfolgen:
 *      Die Variable, die die nullte Spalter der Wertetabelle (ganz links mit Koodierung fuer das MSB) bestimmt wird durch Platzhalter 0 repraesentiert
 *      alle weiteren Variablen, die Spalte i der Wertetabelle definieren (von links von 0 an gezaehlt) muessen durch Platzhalter mit Nummer i vertreten werden
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * @param truthTable zu minimierende Wertetabelle (beliebig viele Ein- und Ausgaenge) , 0 Eingaenge (nur eine Zeile mit Index 0) stellt eine Konstante dar
 *                      0 Ausgaenge erfordern keine Minimierung (Ausgabe einer leeren Liste)
 * @returns einen Platzhalterbaum pro Ausgangsvariable , der deren minimierten Ausdruck repraesentiert (Nummerierung der Platzhalter im Ausdruck
 *              entspricht der Nummerierung der Variablen innerhalb der Liste aller auftretenden Vairablen des Ausdrucks anhand derer die Wertetabelle erstellt wurde)
 */
export function minimizeTruthTable(truthTable: TruthTable): Array<PlaceholderTreeNode> {


    //!!! Beachte dass die aktuell verwendete Realisierung des Minimierers durch Espresso lediglich heuristisch vorgeht !!!
    // zwar ist sicher, dass der minimierte Ausdruck Werteverlaufsgleich zum Eingangsausdruck ist, nicht jedoch dass er vollstaendeig minimal ist
    // fuer Wertetabellen mit einem Ausgang ist der von Espresso minimierte Ausdruck immer vollstaendig minimal, bei mehreren Ausganegen kann es aber zu Nichtminimalitaeten kommen
    // --> dies resultiert daraus, dass Espresso versucht alle Audruecke aller Ausgaenge auf Basis eines kleinstmoeglichen Pools an Implikanten zu erstellen

    //Bsp:    gegben sei die Wertetabelle:      x0      y0  y1  y2
    //                                          0       1   0   1           Erwartet wird also: y0 = /x0 , y1 = x0 , y2=1
    //                                          1       0   1   1
    // Die hier verwendete Version von Espresso stellt jedoch fest, dass die Implikanten /x0 und x0 in jedem Fall benoetigt werden, ABER y2=1 bereits durch diese darstellbar ist
    //Aus diesem Grund wuerde kein weiterer Implikant: 1 angelegt werden , sondern 1 als /x0 + x0 dargestellt werden
    // Ausgabe von Espresso waere:  y0 = /x0 , y1 = x0 , y2=/x0 + x0  (waere nicht minimal)

    //um dies zu vermeiden minimier jede Ausgangsvariable der Wertetabelle einzeln
    //Falls die Tabelle also mehrer Ausgaenge hat, so minimiere also nur einen pro Durchlauf und fuege die Ergebnisse anschliessend zusammen

    //Erstelle eine Liste fuer die Platzhalterbaume (einen pro minimierten Ausdruck fuer einen Ausgang)
    // der Eintrag 0 entspricht dem Ausgang, dessen Funktionsindex an Stelle 0 in der Wertetabelle abgelegt war (bei 0 Ausgaengen wird diese leere Liste zurueckgegeben)
    let minimizedExpressions: Array<PlaceholderTreeNode> = [];
    //lege eine neue Tabelle an, die nur zur Minimierung eines Ausgangs pro Durchlauf genutzt wird
    let oneOutputTruthTable = new TruthTable(truthTable.getInputCount(), 1)

    //uebernimm den Dont-Care-Werteverlauf der grossen Tabelle (ist fuer Minimierung aller Ausgaenge zu nutzen)
    oneOutputTruthTable.setDontCareFunctionIndex(truthTable.getDontCareFunctionIndex())
    //Minimiere jeweils einen Ausgang einzeln
    for (let outputCounter = 0; outputCounter < truthTable.getOutputCount(); outputCounter++) {
        //greife den aktuellen Ausgang mit seinem Werteverlauf
        oneOutputTruthTable.setFunctionIndex(truthTable.getFunctionIndexes()[outputCounter], 0)
        //minimieren des aktuellen Ausgangs --> anhaengen des Ergebnisses an Gesamtergebnis (Ausgang 0 wird zu Gleichung 0)
        let result =minimizeTruthTableHelper(oneOutputTruthTable)
        //Ergebnis hat nur eine Gleichung (da ein Ausgang)
        minimizedExpressions.push(result[0])
    }
    return minimizedExpressions

}




/** 
 * Hilfsfunktion zum Minimieren einer Wertetabelle 
 * Wird aktuell nur zum Minimieren von Tabellen mit einem Ausgang genutzt (siehe Erklaerung in {@link minimizeTruthTable})
 * Kann jedoch jederzeit auch wieder als allgemeine Schnittstelle genutzt werden um Tabellen mit beliebig vielen Ausgaengen zu minimieren 
 * (dann ist Ergebnis jedoch nicht zwingend minimal)
 * 
 * Das Ausgabeformat von Espresso wird gut in {@see https://www.npmjs.com/package/espresso-logic-minimizer} beschrieben (das Paket wird hier nicht verwendet, aber die Dokumntation erklaert die Ausgabe von Espresso)
 * @param truthTable zu minimierende Wertetabelle (beliebig viele Ein- und Ausgaenge) , 0 Eingaenge (nur eine Zeile mit Index 0) stellt eine Konstante dar
 * @returns einen Platzhalterbaum pro Ausgangsvariable , der deren minimierten Ausdruck repraesentiert (Nummerierung der Platzhalter im Ausdruck
 *              entspricht der Nummerierung der Variablen innerhalb der Liste aller auftretenden Vairablen des Ausdrucks anhand derer die Wertetabelle erstellt wurde)
 */
function minimizeTruthTableHelper(truthTable: TruthTable): Array<PlaceholderTreeNode> {
    //Erstelle eine Liste fuer die Platzhalterbaume (einen pro minimierten Ausdruck fuer einen Ausgang)
    // der Eintrag 0 entspricht dem Ausgang, dessen Funktionsindex an Stelle 0 in der Wertetabelle abgelegt war
    let minimizedExpressions: Array<PlaceholderTreeNode> = new Array(truthTable.getOutputCount())
    //Fuelle die minimierten Ausdruecke initial mit Nullen (falls keine Primimplikanten fuer diesen Ausgang gefunden wurden )
    minimizedExpressions.fill(new CompleteTreeConstantNode(ConstantType.ConstantZero))


    //hat die Tabelle 0 Eingaenge und somit nur eine Spalte liegt eine Konstante vor
    //Der minimierte Ausgang in Spalte i ist somit einfach  der Eintrag in Zeile 0 und Spalte i
    if (truthTable.getInputCount() === 0) {
        //es liegt eine Konstante vor --> Werte jeden Ausgang fuer Zeile 0 aus
        //der Funktionsindex kann nur eine 1 (Ausdruck ist minimiert =1) oder eine 0 (Ausdruck ist minimiert =0) sein
        let functionIndexes = truthTable.getFunctionIndexes()
        for (let outputCounter = 0; outputCounter < functionIndexes.length; outputCounter++) {
            //liegt eine 1 als Funktionsindex vor, so ersetze die initiale logisch 0 im Platzhalterbaum fuer diesen Ausgang durch eine 1
            //es muss mit Bigints verglichen werden da die Funktionsindizes Bigints sind
            if (functionIndexes[outputCounter] === BigInt(1)) {
                //minimiertes Ergebnis ist logisch 1
                minimizedExpressions[outputCounter] = new CompleteTreeConstantNode(ConstantType.ConstantOne)
            }
            //sonst: initale logisch 0 kann bleiben
        }

    }
    else {
        //Es liegt keine Konstante vor --> Minimierer nutzen
        //Zugriff auf den globalen Minimierer
        let minimizer = MINIMIZER;
        //Minimieren der Wertetabelle
        let result = minimizer.minimizeTruthTable(truthTable)
        console.log(result)


        //Laufe uber alle von Espresso gefunden Primimplikanten (einer pro Zeile des Ergebnisarrays)
        for (let primeImplicantCounter = 0; primeImplicantCounter < result.length; primeImplicantCounter++) {
            //greife den aktuellen Primimplikanten als String
            let currentPrimeImplicantString = result[primeImplicantCounter]

            //alle Buchstaben eines solchen Strings bis zum ersten Leerzeichen (sind so viele wie Anzahl Eingaenge )koodieren die Belegung der Eingaenge in diesem Implikanten 
            //alles nach dem Leerzeichen zeigt fuer welchen Ausgang die Implikanten gebraucht werden
            // Bsp.       Belegung_der_Eingaenge_des_Implikanten Ausgaenge_in_dem_der_Implikant_auftaucht

            //setze den Implikanten initial zu 1 (falls alle Variablen mit - fuer ignore gekennzeichnet sind)
            let currentPrimeImplicant: PlaceholderTreeNode = new CompleteTreeConstantNode(ConstantType.ConstantOne)
            //Laufe uber die Koodierung der Eingangsvariablen des Implikanten (beginne bei dem Eingang der die Spalte ganz links in der Tabelle erzeugt)
            //der inputCounter zaehlt die Spalten der Wertetabelle von links bei 0 beginnend (genauer gesagt deren zugehoerige Eingangsvariablen beginnend beim MSB) hoch 
            let inputCounter = 0;
            let currentInputCode = currentPrimeImplicantString.charAt(0)
            while (currentInputCode != " ") {
                //Aufloesen der Espressokoodierung fuer das aktuelle Zeichen
                // - bedeutet, dass der aktuelle Eingang nicht in den Implikanten eingeht --> springe zum naechsten Eingang
                if (currentInputCode === "-") {
                    //tue nichts 
                }
                else {
                    //Der aktuelle Eingang geht in den Implikanten ein (es kann nur noch eine 0 oder 1 als char im Espressosyntax vorliegen)
                    //erstelle den Aktuellen Eingang als Platzhalter (der Platzhalter 0 koodiert die erste Spalte und damit das MSB der Wertetabelle)
                    let currentPlaceholder: PlaceholderTreeNode

                    //1 bedeutet, dass der aktuelle Eingang innerhalb des Implikanten TRUE seien muss
                    if (currentInputCode === "1") {
                        currentPlaceholder = new VariablePlaceholder(inputCounter)
                    }
                    //liegt weder ein "-" noch eine "1" vor , so muss es eine "0" sein
                    //0 bedeutet, dass der aktuelle Eingang innerhalb des Implikanten FALSE seien muss
                    else {
                        currentPlaceholder = new PlaceholderOneOperandOperatorNode(OperatorEnum.NotOperator, new VariablePlaceholder(inputCounter))
                    }

                    //Da Espresso in DNF arbeitet muessen alle Eingaenge eines Implikanten mit UND verknuepft werde
                    //liegt noch die initiale logisch 1 fuer den implikanten vor, dann ersetze diese (statt der UND-Verknuepfung)
                    if (currentPrimeImplicant instanceof CompleteTreeConstantNode) {
                        currentPrimeImplicant = currentPlaceholder
                    }
                    else {
                        //mit Und Verknuepfen
                        currentPrimeImplicant = new PlaceholderTwoOperandOperatorNode(OperatorEnum.AndOperator, currentPrimeImplicant, currentPlaceholder)
                    }

                }
                //greife im naechsten Durchlauf auf den naechsten Eingang des Implikanten zu (solange das Leerzeichen noch nicht aufgetreten ist kann der String nicht zuende sein)
                inputCounter = inputCounter + 1;
                currentInputCode = currentPrimeImplicantString[inputCounter]
            }
            //das aktuell gelesene Zeichen ist jetzt das Leerzeichen --> der aktuelle Primimplikant ist somit vollsteandig
            //alle weiteren Chars zeigen an in welchen minimierten Ausdruecken (von welchem Ausgang) dieser Implikant enthalten ist
            //es folgen also noch so viele Zeichen wie die Wertetabelle Ausgaenge hat

            //trenne den String an der aktuellen Stelle(nach dem Leerzeichen) --> diese existiert immer da eine Wertetabelle immer mindestens einen Ausgang haben muss
            let currentPrimeImplicantOutputString = currentPrimeImplicantString.slice(inputCounter + 1)
            //laufe uber alle koodierten Ausgaenge und pruefe ob der Implikant fuer sie benoetigt wird 
            //die Anzahl der verbleibenden Zeichen sollte der Laenge der Liste der Ausgaenge entsprechen
            for (let outputCounter = 0; outputCounter < currentPrimeImplicantOutputString.length && outputCounter < minimizedExpressions.length; outputCounter++) {
                //1 bedeutet, dass der Implikant fuer den aktuellen Ausgang benoetigt wird --> da die DNF aufgebaut wird muss er mit oder verknuepft werden
                if (currentPrimeImplicantOutputString.charAt(outputCounter) === "1") {
                    //greife den zu erstellenden minimalen Ausdruck der aktuellen Ausngangsvariable und fuege den Implikanten ein
                    let currentExpression = minimizedExpressions[outputCounter]
                    //liegt noch die initiale logisch 0 des Ausdrucks vor, so ersetze diese
                    if (currentExpression instanceof CompleteTreeConstantNode) {
                        currentExpression = currentPrimeImplicant
                    }
                    else {
                        //ODER verknuepfen fuer DNF
                        currentExpression = new PlaceholderTwoOperandOperatorNode(OperatorEnum.OrOperator, currentExpression, currentPrimeImplicant)
                    }
                    //schreibe den aktuellen erweiterten Ausdruck zurueck 
                    minimizedExpressions[outputCounter] = currentExpression
                }
                //Es kann nur noch eine Null vorliegen --> der aktuelle Implikant wird fuer den aktuellen Ausgang nicht benoetigt 
            }

            //der aktuelle Primimplikant wurde fertig bearbeitet --> gehe zum naechsten
        }
    }


    return minimizedExpressions
}

/**
 * Erstelle eine Systembelegung fuer ein gegebenes set an variablen und einen Belegunsindex 
 * Im Falle einer leeren Variablenliste (z.B bei konstanten Ausdruecken) kann nur fuer Index 0 eine leere Belegung erstellt werden
 * @param variableList Liste der Vairablen fuer die die Belegung erstellt werden soll (Variable an Stelle 0 koodiert das MSB)
 *                  eine leere Liste repraesentiert konstante Ausdruecke und kann nur fuer Index 0 genutzt werden
 * @param assignmentIndex Belegungsindex fuer den die Belegungen der Variablen berechnet werden sollen
 * @returns Belegung der Variablen um diesen Belegungsindex zu erzielen (hierbei ist Variable an Stelle 0 der Liste das MSB)
 *          im Falle von leerer Variablenliste ist diese leer
 */
export function createVariableAssignmentFromIndex(variableList: Array<SignalTreeRepresentation>, assignmentIndex: number): DerivedSystemAssignment {
    //wird die aktuelle Variable zur coodierung benoetigt?
    let assignment: boolean;

    //Speicher fuer die Belegungen aller Variablen fuer diesen Index
    let systemAssignment: CustomDerivedSystemAssignment = new CustomDerivedSystemAssignment();

    //Laufe ueber alle Variablen und belege sie entsprechend dem vorgegebenen Eingangsbelegungsindex (an der Stelle Null der Liste steht das MSB)
    //wenn mehr als 32 Variablen enthalten sind funktioniert der Bitshift nicht mehr
    if (variableList.length >= 32) {
        //zu viele Variablen 
        throw new Error("toManyVariables")
    }
    //Index muss mit so vielen Bits darstellbar sein und darf nicht negativ sein
    //Fuer leere Variablenlisten (im Fall von Konstanten ist nur Index/Zeile 0 adressierbar)
    else if (assignmentIndex >= Math.pow(2, variableList.length) || assignmentIndex < 0) {
        //unpassender Index
        throw new Error("invalid InputAssignmentindex")
    }
    //Alle Tests bestanden

    //Ist die Variablenliste leer (z.B. falls der Ausdruck aus dem sie extrahiert wurde nur Konstanten enthielt) so genuegt eine Leere Belegung zur Auswertung
    // --> leere Belegung zurueckgeben
    //nur in allen anderen Faellen muss eine Belegung berechnet werden
    if (variableList.length > 0) {
        //Bitmaske mit der der umzusetzende Index fortlaufend maskiert wird (beginne beim MSB)
        let bitMask = 1

        //Laufe ueber alle Variablen und belege sie entsprechend dem vorgegebenen Eingangsbelegungsindex (an der Stelle Null der Liste steht das MSB)
        //Beginne mit der Zuordnung beim LSB(letzter Eintrag in der Variablenliste)
        //wenn mehr als 32 Variablen enthalten sind funktioniert der Bitshift nicht mehr
        for (let variableCounter = variableList.length - 1; variableCounter >= 0; variableCounter--) {
            //greifen  der aktuellen Variablen
            let currentVariable = variableList[variableCounter];
            //wird die Variable zum coodieren benoetigt?
            assignment = false;
            //wird die aktuelle Variable zur binaeren Darstellung des Belegungsindexes benoertigt (wenn ja entsteht bei der Maskierung eine 1)
            let maskedBit = assignmentIndex & bitMask

            //bleibt hierbei die Bitmaske uebrig so wird das Bit benoetigt --> Setze es in der Variablenbelegung
            if (maskedBit === bitMask) {
                assignment = true;
            }
            //console.log("index:" + assignmentIndex + "      variable" + currentVariable.internalName +"     Belegung:" + assignment + "         Index :" +assignmentIndex + "       Maske: " +bitMask)

            //Verscheieb die Maske zum naechsten Bit
            bitMask = bitMask << 1;
            //Belege die Variable entsprchend
            if (assignment) {
                //Variable ist zu 1 zu setzen --> erstelle eine Belegung der aktuellen Variablen mit 1 und speichere diese
                systemAssignment.addAssignment(currentVariable.createAssignment(true))
            }
            else {
                //Variable ist zu 0 zu setzen --> erstelle eine Belegung der aktuellen Variablen mit 0 und speichere diese
                systemAssignment.addAssignment(currentVariable.createAssignment(false))
            }
        }
    }

    //Ausgabe der Belegung (ggf. bei Konstante leer)
    return systemAssignment
}




