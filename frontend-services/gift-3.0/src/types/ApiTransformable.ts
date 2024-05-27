import { mainApiRepresentation } from './ApiClasses/ApiElement';
import { CustomNames } from './BooleanEquations/CustomNames';
import { NodePosition } from './Node';
import { ViewConfigs } from './NormalizedState/ViewConfig';

/**
 * Interface fuer alle Elemente die sich ohne weiteres Wissen uber den zugehorigen Automaten transformieren koennen
 */
export interface FullApiTransformable extends ApiTransformable{
  
    /**
    * Ueberfuehrung des Objektes in die entsprechende Hauptdarstellungsform 
    * @param customNames Nutzerdefinierte Namen und Variablen
    * @param viewConfig Koniguration fuer die Berechnung der externen Darstellung
    * @returns Transformiertes Objekt in einer Ausgabegerechten Darstellung 
    *           (ggf. innerhalb einer Liste die leere seien kann falls das Objekt gemeass der aktuellen Konfiguration nicht angezeigt werden soll)
    */
    toExternalGraphRepresentation(customNames:CustomNames , viewConfig:ViewConfigs):mainApiRepresentation | Array<mainApiRepresentation>
}

/**
 * Interface fuer alle Elemente die sich in eine Schnittstellendarstellung umformen koennen (im Allgemeinen werden dafuer die custom Names und der zugehoerige Automat benoetigt)
 */
export interface ApiTransformable{
     /**
    * Ueberfuehrung des Objektes in die entsprechende Hauptdarstellungsform 
    * @param customNames Nutzerdefinierte Namen und Variablen
    * @param automatonId Id des Auotmaten dem das Element zugeordenet ist
    * @param viewConfig Koniguration fuer die Berechnung der externen Darstellung
    * @returns Transformiertes Objekt in einer Ausgabegerechten Darstellung
    */
   toExternalGraphRepresentation(customNames:CustomNames , viewConfig: ViewConfigs , automatonId:number ):mainApiRepresentation | Array<mainApiRepresentation>
}