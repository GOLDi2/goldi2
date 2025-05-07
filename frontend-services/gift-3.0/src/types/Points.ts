import { immerable } from "immer";
import { calculateDistance, calculateRelativTransitionSupportPosition } from "../actioncreator/helperfunctions";

/**Darstellung eines 2D Punktes */
export interface Point {

    /**x-Koordinate */
    xCord: number

    /**y-Koordinate */
    yCord: number

}
/**
   * Erstellt einen neuen Punkt
   * @param xCord x-Koordinate
   * @param yCord y-Koordinate
   */
export function createPoint(xCord: number, yCord: number) {
    return { xCord: xCord, yCord: yCord }
}




/**
 * Berechnet den Winkel zwischen der x-Achse und der Geraden zwischen zwei Punkten
 * @param startPoint erster Punkt
 * @param endPoint zweiter Punkt
 * @returns Winkel zwischen der x-Achse und der Geraden zwischen beiden Punkten in Radiant zwischen 0 und 2*Pi
 */
export function calculateAngle(startPoint: Point, endPoint: Point): number {
    var angle = Math.atan2(startPoint.yCord - endPoint.yCord, endPoint.xCord - startPoint.xCord)
    //Winkel in Grad umrechnen und normalisieren
    //angle = angle * 180/Math.PI % 360;
    return angle
}

/**
 * Darstellung aller Parameter einer Bezeirkurve
 */
export interface Bezier {


    //Paramter zur Darstellung der Kante als Bezierkurve vom Grad 2:
    /** Startpunkt der Kante (je nach Ablageort relativ zum Startknoten oder absolut)*/
     startPoint: Point;

    /**Endpunkt der Kante (je nach Ablageort relativ zum Endknoten oder absolut)*/
     endPoint: Point;

    /** Lage des Stuetzpunktes der Kurve relativ zum Startpunkt (je nach Ablageort auf die Laenge der Knate normiert oder nicht)*/
     supportPoint: Point

}

/**
    * Erstellt neuen Speicher fuer Parameter einer Bezierkurve
    * @param startPoint Startpunkt der Kante in absoluten oder relativen Koordinaten (je nach Art der Speicherung)
    * @param endPoint Endpunkt der Kante in absoluten oder relativen Koordinaten (je nach Art der Speicherung)
    * @param firstSupport Erster Stuetzpunkt fuer die Bezierkurve relativ zum Startpunkt (kann je nach Art der Soeicherung auf die Distanz normiert sein oder nicht)
    */
export function createBezier(startPoint: Point, endPoint: Point, firstSupport: Point):Bezier {

    return{startPoint:startPoint , endPoint:endPoint , supportPoint:firstSupport}
    
}