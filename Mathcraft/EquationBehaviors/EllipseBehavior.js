import { Point } from "../Point.js";


export class EllipseBehavior {
    
    #centre;
    #majorMinorAxisPoint;
    isValid;

    constructor(majorMinorAxisString, centreString) {

        console.log("In the ellipse constructor");

        this.#centre = this.#ParseCentre(centreString);
        this.#majorMinorAxisPoint = this.#ParseMajorMinorAxis(majorMinorAxisString);
        this.centreString = centreString;
        this.majorMinorAxisString = majorMinorAxisString;
        console.log(this.#majorMinorAxisPoint);
        console.log(this.#centre);
    }

    #ParseCentre(centreString) {


        let centre = centreString.replace(/[()]/g, "").split(",").map(Number);
        if (centre.length !== 2 || centre.some(isNaN)) {
            window.errorLogger.ShowNewError("Invalid inputs, try again");
            this.isValid = false;
            return;
        }
        this.isValid = true;
        return new Point(centre[0], centre[1]);
    }

    #ParseMajorMinorAxis(majorMinorAxisString) {


        let axes = majorMinorAxisString.replace(/[()]/g, "").split(",").map(Number);
        
        if (axes.length !== 2 || axes.some(isNaN) || axes.some(val => val <= 0)) {
            window.errorLogger.ShowNewError("Invalid inputs, try again");
            this.isValid = false;
            return;
        }

        this.isValid = true;
        return new Point(axes[0], axes[1]);
    }

    IsPointOnCurve(point) {
        let offset = Math.pow(point.x - this.#centre.x, 2) / Math.pow(this.#majorMinorAxisPoint.x, 2) +
                    Math.pow(point.y - this.#centre.y, 2) / Math.pow(this.#majorMinorAxisPoint.y, 2);
        return Math.abs(1 - offset) <= 0.1;
    }

    toString() {
        return this.centreString;
    }

    GetCentre() {
        return this.#centre;
    }

    GetMajorMinorAxisPoint() {
        return this.#majorMinorAxisPoint;
    }

    IsValid() {
        return this.isValid;
    }
}