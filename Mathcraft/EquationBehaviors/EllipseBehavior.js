import { Point } from "../Point.js";


export class EllipseBehavior {
    
    #centre;
    #majorMinorAxisPoint;
    isValid = true;

    constructor(majorMinorAxisString, centreString) {

        this.#centre = this.#ParseCentre(centreString);
        this.#majorMinorAxisPoint = this.#ParseMajorMinorAxis(majorMinorAxisString);
        this.centreString = centreString;
        this.majorMinorAxisString = majorMinorAxisString;

    }

    #ParseCentre(centreString) {

        if(!this.isValid) return;

        let centre = centreString.replace(/[\[\]()]/g, "").split(",").map(Number);

        if (centre.length !== 2) {
            window.errorLogger.ShowNewError("Invalid centre: you can only have two numbers x, y");
            this.isValid = false; return;
        } 

        if (centre.some(isNaN)) {
            window.errorLogger.ShowNewError("Invalid centre: x, y have to be constant numbers");
            this.isValid = false; return;
        }
        this.isValid = true;
        return new Point(centre[0], centre[1]);
    }

    #ParseMajorMinorAxis(majorMinorAxisString) {

        if(!this.isValid) return;

        let axes = majorMinorAxisString.replace(/[()]/g, "").split(",").map(Number);
        
        if (axes.length !== 2 || axes.some(isNaN) || axes.some(val => val < 0)) {
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

    GetValue(x) {

        let k = this.#centre.y; let h = this.#centre.x; let b = this.#majorMinorAxisPoint.y; let a = this.#majorMinorAxisPoint.x;


        let y1 = k + Math.sqrt( (b**2/a**2) * (a**2 - (x - h)**2));
        let y2 = k - Math.sqrt( (b**2/a**2) * (a**2 - (x - h)**2));

        if (y1 == y2) return y1;

        return [y1, y2];
    }

    toString() {
        return `${this.majorMinorAxisString} C: ${this.centreString}`;
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