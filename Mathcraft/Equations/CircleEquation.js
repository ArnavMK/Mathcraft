import { Point } from "../Point.js";
import { equation } from "./equation.js";

export class CircleEquation extends equation {

    #radius;

    constructor(centreString, radiusString, color = equation.DefaultColor) {
        super("Circle", color);
        this.centreString = centreString;
        this.radiusString = radiusString;
        this.#radius = this.#ParseRadius();
        this.SetCentre(this.#ParseCentre());
    }

    #ParseRadius() {

        let radius = parseFloat(radiusString);

        if (isNaN(radius)) {
            throw new Error("Invalid radius. Expected a number.");
        }

        return radius;

    }

    #ParseCentre() {

        let centre = centreString.replace(/[()]/g, "").split(",").map(Number);
        
        if (centre.length !== 2 || centre.some(isNaN)) {
            throw new Error("Invalid centre input");
        }

        return new Point(centre[0], centre[1]);
    }

    Validate() {
        
        if (isNaN(this.#radius)) {
            return false;
        }

        if (this.GetCentre() == undefined) {
            return false;
        }

        return true;
    }

    CanSelect(mouseMathPoint) {

        let distanceFromClickedPointToCentre = Point.Distance(this.GetCentre(), mouseMathPoint);
        return Math.abs(distanceFromClickedPointToCentre - this.#radius) <= 0.1;

    }

    IsPointOnCurve(point) {

        let distanceFromPointToCentre = Point.Distance(this.GetCentre(), point);
        return Math.abs(distanceFromPointToCentre - this.#radius) <= 0.1;

    }

    toString() {
        return this.centreString ;
    }
}