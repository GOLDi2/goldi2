/** Interface fuer alle Elemente, die intern durch eine Id adressierbar sind */
export interface HasID{
    /** ID des Elements */
    id:number
} 

interface NormalizedObjects<T> {
    byId: { [id: number]: T };
    allIds: number[];
  
  }
  

/** Interface fuer alle Speicherobjekte, innerhalb welcher anhand einer Id als Key Daten zu dem Element mit dieser Id abgelegt werden*/
export interface StorageObject<T>{
    /** Alle Keys (Eigenschaften) des Speicherobjekts sind die IDs der darin abgelegten Eintrage */
    [id:number]:T
}