import { cloneDeep } from "lodash";
import { ApiAutomaton } from "../types/ApiClasses/GraphRepresentation/Automaton";
import { Automaton, AutomatonMetaData, AutomatonPositionStructure, AutomatonStructure, getDerivedAutomatonName, RawAutomatonStructure } from "../types/Automaton";
import { placeStatesAndTransitions } from "../types/BooleanEquations/computeHardwareAutomaton";
import { CustomNames } from "../types/BooleanEquations/CustomNames";
import { DerivedViewNodePositions, DerivedViewTransitionPositions } from "../types/NormalizedState/AutomatonSubState";
import { StorageObject } from "../types/NormalizedState/NormalizedObjects";
import { DerivedAutomatonViews } from "../types/view";
import { AutomatonViewConfig, MergedAutomatonViewConfig } from "../types/NormalizedState/ViewConfig";

/**
    * Berechnet aus einer Liste von Automaten deren Api-Darstellung ohne die Berechnungen weiterer Eigenschaften (z.B. vollstaendigkeit und Widerspreuchsfreiheit)
    * @param automatonList Liste aller umzuwandelnden Automaten in der Darstellung, die nur die Informationen zur Darstellung kennt 
    * @param customNames nutzerdefinierte Namen die innerhalb der externen Darstellung verwendet werden sollen
    * @param automatonViewConfig Konfiguration fuer Umwandlung (beinhaltet alle Kriterien die an die externe Darstellung gestellt werden)
    * @param mergedAutomatonViewConfig Konfiguration fuer die Darstellung der Fusionsautomaten
    *      Sollte nur uebergeben werden, wenn es sich bei diesem Automaten um einen fusionierten Automaten handelt (geht aus Berechnungen hervor)
    * 
    * @returns Liste der in Api-Darstellung transformierten Automaten
    */
export function transformAutomatonListToApi(automatonList: Array<Automaton>, customNames: CustomNames,
    automatonViewConfig: AutomatonViewConfig, mergedAutomatonViewConfig?: MergedAutomatonViewConfig): Array<ApiAutomaton> {
    let apiAutomatons: Array<ApiAutomaton> = [];
    //Transformiere jeden Automaten der Liste der ausgegeben werden soll --> eventuell nicht anzuzeigende Automaten transformieren sich selbst nicht

    automatonList.forEach(automaton => apiAutomatons.push(...automaton.toExternalGraphRepresentation(customNames, automatonViewConfig, mergedAutomatonViewConfig)))

    return apiAutomatons
}


/**
 * Extrahiere die Positionsinformationen aller Elemente von den Automaten einer abgeleiteten Anischt
 * @param automatonIdList Liste aller AutomatenIds
 * @param derivedViewStatePositions Objekt, in welchem Positionen aller fixierten Zustaende der abgeleiteten Ansicht abgelgt sind (Info zu Zustand i unter key i im Objekt)
 * @param derivedViewTransitionPositions Objekt, in welchem Po´sitionen aller fixierten Kanten der abgeleiteten Ansicht abgelgt sind (Info zu Kante i unter key i im Objekt)
 * @returns Positionen aller Elemente der abgeleiteten Ansichten
 */
export function computeDerivedViewPositions(automatonIdList: Array<number>, derivedViewStatePositions: StorageObject<DerivedViewNodePositions>, derivedViewTransitionPositions: StorageObject<DerivedViewTransitionPositions>): Array<AutomatonPositionStructure> {
    //neue Liste fuer die Strukturen der Wunschpositionen
    // console.log(("position"));
    
    let automatonStructures: Array<AutomatonPositionStructure> = []
    //Wuscnhpositionen aller Automaten hinzufuegen ( Vorgaben an die Kanten und Knoten)
    automatonIdList.forEach(currentAutomatonID => {
        let statePositions = derivedViewStatePositions[currentAutomatonID].nodePositions
        let transitonPositions = derivedViewTransitionPositions[currentAutomatonID].transitionPosition
        automatonStructures.push({ id: currentAutomatonID, nodePositions: statePositions, transitionPositions: transitonPositions })
    })

    return automatonStructures
}


/**
     * Platziere die Elemente der abgeleiteten Automatenansicht entsprechend der Vorgaben
     * @param derivedAutomatonStructures zu platzierende Elemente
     * @param derivedElementPostions Voragben des Nutzers fuer die Position einiger Elemente
     * @param templateStructures Positionen der Knoten im Designautomaten, die als Vorlage dienen
     * @returns platzierte Elemente
     */
export function placeDerivedViewElements(derivedAutomatonStructures: Array<RawAutomatonStructure>, derivedElementPostions: Array<AutomatonPositionStructure>, templateStructures: Array<AutomatonStructure>): Array<AutomatonStructure> {
    // console.log("hw neue anordnen")
    //platziere die Elemente entsprechend der Vorgaben --> Beachte, dass nicht auf dem Cache des Eingabeselektors gearrbeitet werden darf
    //Erstelle eine Kopie fuer die zu platzierenden Elemente
    // let placedStructure = cloneDeep(derivedAutomatonStructures) //Liste fuer die platzierten Strukturen
    //laufe ueber alle zu platzierenden Strukturen
    let placedStructures:Array<AutomatonStructure> =[] //Ergebnisliste
    derivedAutomatonStructures.forEach(structureToPlace => {
        //Suche die zugehoerigen Eintraege in den Positionsvorgaben und den Vorlagepositionen (haben alle die gleiche ID )
        let hwPositions = derivedElementPostions.find(hwPosition => hwPosition.id === structureToPlace.id)
        //sollte immer existieren
        if (!hwPositions) {
            //sollt nie passieren (sicherheitshalber leere Liste erstellen)
            hwPositions = { id: structureToPlace.id, nodePositions: [], transitionPositions: [] }
        }
        let templatePositions = templateStructures.find(template => template.id === structureToPlace.id)
        //sollte immer existieren
        if (!templatePositions) {
            //sollt nie passieren (sicherheitshalber leere Liste erstellen)
            templatePositions = { id: structureToPlace.id, nodes: [], transitions: [] }
        }


        //platziere die Elemente
       placedStructures.push(placeStatesAndTransitions(structureToPlace, templatePositions, hwPositions)) 


    })

    return placedStructures
}

/**
 * Baue die vollstaendigen Automaten aus den platzierten Elementen (Kntoten und Kanten) sowie deren Metadaten zusammen
 * @param placedDerivedViewAutomatonStructures Liste mit den platzierten Strukturen der Automaten
 * @param automatonList Metainformationen zu den Automaten
 * @param derivedForm Art der abgeleiteten Ansicht
 * @returns vollstaendige interne Darstellung der abgeleiteten Automaten
 */
export function buildInternDerivedAutomaton(placedDerivedViewAutomatonStructures: Array<AutomatonStructure>, automatonList: Array<AutomatonMetaData>
    , derivedForm:DerivedAutomatonViews): Array<Automaton> {
    // console.log("zeichne neu")
    //fuege allen platzierten Darstellungen die Metainformationen des zugehoerigen Automaten hinzu
    let derivedAutomatons: Array<Automaton> = [] //Liste fuer die Abgeleiteten-Automaten
    placedDerivedViewAutomatonStructures.forEach(currentDerivedStructure => {
        //finde den Automaten aus dem die Darstellung abgleitet wurde
        let matchAutomaton = automatonList.find(automaton => automaton.id === currentDerivedStructure.id)
        if (matchAutomaton) {
            //sollte immer der Fall sein
            //Erstelle den abgeleiteten-Automaten
            //Erstelle den fertigen Automaten anhand der berechneten Struktur und weiterer Informationen aus dem originalen Automaten
            let derivedName = getDerivedAutomatonName(matchAutomaton, derivedForm)
            let derivedAutomaton = new Automaton({validName:derivedName , error:undefined}, matchAutomaton.id, matchAutomaton.info, matchAutomaton.initialStateNumber, matchAutomaton.currentStateNumber,
                currentDerivedStructure.nodes, currentDerivedStructure.transitions, matchAutomaton.controlSignals, matchAutomaton.isActive)

            //speichere den Automaten
            derivedAutomatons.push(derivedAutomaton)
        }

    })
    //Fertige Automaten Ausgeben
    return derivedAutomatons

}