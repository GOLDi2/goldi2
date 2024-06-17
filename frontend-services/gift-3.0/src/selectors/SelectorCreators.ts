// @ts-nocheck

import { isEqual } from "lodash";
import { createSelectorCreator } from "reselect";

/**
 * Standardmaessige Vergleichsfunktion (Vergleich von Referenzen)
 * @param currentVal ALter Wert
 * @param previousVal Neuer Wert
 * @returns sind beide Paramter identisch im Sinne von === (sind die Referenzen gleich?)
 */
function defaultEqualityCheck(currentVal, previousVal) {
    return currentVal === previousVal;
  }

/**
 * alternative Memoize- Funktion fuer Selektoren
 * Berechnet die uebergebene Funktion nicht neu wenn die Eingaben im Sinne von === identisch waren
 * Ist dies nicht der Fall wird die Funktion neu berechnet: Handelt es sich bei dem Ergebnis um das identische Ergebnis zum vorherigen Aufruf (im Sinne von Deep-Equals)
 * so wird das alte Ergebnis ausgegeben (somit bleibt die ausgegebene Referenz die gleiche falls das neu berechnete Ergebnis identisch zum vorherigen ist obwohl sich
 * die Eingaben veraendert haben)
 */
function resultCheckMemoize(
    func,
    resultCheck = isEqual,
    argsCheck = defaultEqualityCheck,
  ) {
    let lastArgs = null;
    let lastResult = null;
    return (...args) => {
      if (
        lastArgs !== null &&
        lastArgs.length === args.length &&
        args.every((value, index) => argsCheck(value, lastArgs[index]))
      ) {
        return lastResult;
      }
      lastArgs = args;
      const result = func(...args);
      return resultCheck(lastResult, result) ? lastResult : (lastResult = result);
    };
  }
  
  /**
   * Funktion zur Erstellung von Selektoren, die sich nur neu berechnen wenn sich die Eingaben veraendern (im Sinne von ===)
   * Und nach der Berechnung pruefen ob ihr Ergebnis identisch (im Sinne von Deep-Equals) zum im Cache befindlichen Ergebnis ist 
   * Wenn ja, so wird das alte Ergebnis ausgegeben (somit bleibt die ausgegebene Referenz die gleiche falls das neu berechnete Ergebnis trotz ggf. veraenderter
   * Eingaben im deep equals Sinne identisch zum vorherigen ist)
   * Sollte fuer alle (vor allem bottom-level-) Selektoren verwendet werden, deren Ausgabe ein komplexes, neu erstelltes Objekt bzw. eine Liste ist, deren Inhalt ggf. trotz veraenderter Eingaben 
   * identisch bleibt 
   * (Dies kann bei einer objektorientierten Modellierung des States fuer die tiefste Ebene der Selektoren nur schwer vermieden werden, da Selektoren selbst viele
   * neue Objekte und Listen erstellen und berechnen muessen)
   * Da solche Selektoren bei jeder Berechnung ein neues Objekt erstellen (welches ggf. im deep Equals-Sinne identisch zum vorherigen ist) muss verhindert werden, dass 
   * identische Ergebnisse als neues Objekt (neue Referenz) als Ergebnis geliefert werden, da sonst alle Folgeselektoren angeregt werden wuerden obwohl das Ergebnis 
   * dieses Selektors identisch ist
   * 
   */
  const createDeepResultSelector = createSelectorCreator(resultCheckMemoize);




 function testMeomize(
  func,
  resultCheck = isEqual,
  argsCheck = defaultEqualityCheck,
) {
  let lastArgs = null;
  let lastResult = null;
  return (...args) => {
    if (
      lastArgs !== null &&
      lastArgs.length === args.length &&
      args.every((value, index) => argsCheck(value, lastArgs[index]))
    ) {
      return lastResult;
    }
    lastArgs = args;
    const result = func(...args);
    // console.log("altes Ergebnis:")
    // console.log(lastResult)
    // console.log("neues Ergebnis:")
    // console.log(result)
    // console.log("vergleich:")
    // console.log(resultCheck(lastResult, result))
    return resultCheck(lastResult, result) ? lastResult : (lastResult = result);
  };
}

export const testSelecor = createSelectorCreator(testMeomize);