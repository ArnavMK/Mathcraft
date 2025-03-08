import { Point } from "../Point.js";
import { equation } from "./equation.js";

export class EllipseEquation extends equation {
    
    #majorMinorAxisPoint;

    constructor(centreString, majorMinorAxisString, color = equation.DefaultColor) {

        super("Ellipse", color);

        this.centreString = centreString;
        this.majorMinorAxisString = majorMinorAxisString;

        this.SetCentre(this.#ParseCentre(centreString));
        this.#majorMinorAxisPoint = this.#ParseMajorMinorAxis(majorMinorAxisString);

    }

    #ParseCentre(centreString) {

        let centre = centreString.replace(/[()]/g, "").split(",").map(Number);

        if (centre.length !== 2 || centre.some(isNaN)) {
            throw new Error("Invalid centre format. Expected format: (x, y)");
        }
        return new Point(centre[0], centre[1]);

    }

    #ParseMajorMinorAxis(majorMinorAxisString) {

        let axes = majorMinorAxisString.replace(/[()]/g, "").split(",").map(Number);

        if (axes.length !== 2 || axes.some(isNaN) || axes.some(val => val <= 0)) {
            throw new Error("Invalid major/minor axis format. Expected format: (a, b) where a > 0 and b > 0");
        }
        return new Point(axes[0], axes[1]);

    }

    Validate() {

        return this.#majorMinorAxisPoint.x > 0 && this.#majorMinorAxisPoint.y > 0 && this.GetCentre() != undefined;

    }

    GetMajorMinorAxisPoint() {

        return this.#majorMinorAxisPoint;

    }

    CanSelect(mouseMathPoint) {

        return this.IsPointOnCurve(mouseMathPoint);

    }

    IsPointOnCurve(point) {

        let offset = Math.pow(point.x - this.GetCentre().x, 2) / Math.pow(this.#majorMinorAxisPoint.x, 2) +
                    Math.pow(point.y - this.GetCentre().y, 2) / Math.pow(this.#majorMinorAxisPoint.y, 2);

        return Math.abs(1 - offset) <= 0.1;

    }

    toString() {
        return this.centreString;
    }
}