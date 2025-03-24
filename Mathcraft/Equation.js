import { Entity } from "./Entity.js";
import { FunctionBehavior } from "./EquationBehaviors/FunctionBehavior.js";
import { CircleBehavior } from "./EquationBehaviors/CircleBehavior.js";
import { EllipseBehavior } from "./EquationBehaviors/EllipseBehavior.js";

export class Equation extends Entity {
    
    #type;
    #behavior;
    isSelected = false;
    isDynamic = false;
    static DefaultColor = "#00ffff";

    constructor(firstInfo, accompaniedInfo, type = "function", color = Equation.DefaultColor) {
        super(color);
        this.#type = type;
        this.firstInfo = firstInfo;
        this.accompaniedInfo = accompaniedInfo;
        this.#behavior = this.#CreateBehavior(type, firstInfo, accompaniedInfo);
    }

    static IsValidEquation(equation) {
        // run normal checks
        if (equation == undefined) {
            return false;
        }

        if (equation.toString() == "") {
            window.errorLogger.ShowNewError("Inputs cant be empty");
            return false;
        }

        let valid = equation.IsValid()
        // run type specific checks;
        return valid;
    }

    #CreateBehavior(type, firstInfo, accompaniedInfo) {
        switch (type) {
            case "function":
                return new FunctionBehavior(firstInfo, accompaniedInfo);
            case "Circle":
                return new CircleBehavior(firstInfo, accompaniedInfo);
            case "Ellipse":
                return new EllipseBehavior(firstInfo, accompaniedInfo);
            default:
                throw new Error(`Unknown equation type: ${type}`);
        }
    }

    GetAccompaniedInfo() {
        return this.accompaniedInfo;
    }

    GetType() {
        return this.#type;
    }

    GetValue(x) {
        return this.#behavior.GetValue(x);
    }

    IsPointOnCurve(point) {
        return this.#behavior.IsPointOnCurve(point);
    }

    GetDomain() {
        if (this.#type === "function") {
            return this.#behavior.GetDomain();
        } else {
            throw new Error("Domain is only available for function equations");
        }
    }

    GetCentre() {
        if (this.#type === "Circle" || this.#type === "Ellipse") {
            return this.#behavior.GetCentre();
        } else {
            throw new Error("Centre is only available for circle and ellipse equations");
        }
    }

    GetRadius() {
        if (this.#type === "Circle") {
            return this.#behavior.GetRadius();
        } else {
            throw new Error("Radius is only available for circle equations");
        }
    }

    GetMajorMinorAxisPoint() {
        if (this.#type === "Ellipse") {
            return this.#behavior.GetMajorMinorAxisPoint();
        } else {
            throw new Error("Major/Minor axis is only available for ellipse equations");
        }
    }

    IsValid() {
        return this.#behavior.IsValid();
    }

    toString() {
        return this.#behavior.toString();
    }

    toIdentifierString() {
        return this.#behavior.toIdentifierString();
    }

    CanSelect(mouseMathPoint) {
        return this.#behavior.IsPointOnCurve(mouseMathPoint);
    }


}