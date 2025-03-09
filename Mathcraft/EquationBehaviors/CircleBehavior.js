import { Point } from "../Point.js";

export class CircleBehavior {
    
    #centre;
    #radius;
    isValid;

    constructor(centreString, radiusString) {
        
        console.log(centreString, radiusString);

        this.#centre = this.#ParseCentre(centreString);
        this.#radius = this.#ParseRadius(radiusString);
        this.centreString = centreString;
        this.radiusString = radiusString;
    }

    #ParseCentre(centreString) {

        let centre = centreString.replace(/[()]/g, "").split(",").map(Number);
        if (centre.length !== 2 || centre.some(isNaN)) {
            window.errorLogger.ShowNewError("Invalid input, the centre has to be two numbers");
            this.isValid = false;
            return;
        }
        this.isValid = true;

        return new Point(centre[0], centre[1]);
    }

    #ParseRadius(radiusString) {
        let radius = parseFloat(radiusString);

        if (isNaN(radius)) {
            window.errorLogger.ShowNewError("Invalid input, the radius has to bea number");
            this.isValid = false;
            return;
        }

        this.isValid = true;
        return radius;
    }

    IsPointOnCurve(point) {
        let distanceFromPointToCentre = Point.Distance(this.#centre, point);
        return Math.abs(distanceFromPointToCentre - this.#radius) <= 0.1;
    }

    GetCentre() {
        return this.#centre;
    }

    GetRadius() {
        return this.#radius;
    }

    GetValue(x) {
        
        let g = -this.#centre.x; let f = -this.#centre.y; let r = this.#radius;
        let c = x**2 + 2*g*x + g**2 + f**2 - r**2;

        let y1 = (-2*f + Math.sqrt(4*f*f - 4*c))/2
        let y2 = (-2*f - Math.sqrt(4*f*f - 4*c))/2

        if (y1 === y2) return y1;

        return [y1, y2];
    }

    toString() {
        return this.centreString;
    }

    IsValid() {
        return this.isValid;
    }
}